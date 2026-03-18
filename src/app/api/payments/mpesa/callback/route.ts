export const dynamic = "force-dynamic";
export const revalidate = 0;
// src/app/api/payments/mpesa/callback/route.ts
// M-Pesa Daraja callback — called by Safaricom servers after payment
// SECURITY: Protected by a shared secret token in the URL path

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";

export async function POST(req: NextRequest) {
  try {
    // ──────────────────────────────────────────────────────────────────────────
    // SECURITY FIX #3: Validate shared secret so random internet traffic cannot
    // forge a "payment successful" payload.
    // Set MPESA_CALLBACK_SECRET in your environment variables to a random UUID.
    // ──────────────────────────────────────────────────────────────────────────
    const callbackSecret = process.env.MPESA_CALLBACK_SECRET;
    if (callbackSecret) {
      const authHeader = req.headers.get("x-callback-secret");
      // Also support secret in query param (for Safaricom which uses URL params)
      const url = new URL(req.url);
      const querySecret = url.searchParams.get("secret");
      
      if (authHeader !== callbackSecret && querySecret !== callbackSecret) {
        console.warn("⚠️ M-Pesa callback received with invalid/missing secret");
        // Return 200 to Safaricom so they don't retry, but don't process
        return NextResponse.json({ ResultCode: 0, ResultDesc: "Accepted" });
      }
    }

    const body = await req.json();
    const { Body } = body;

    if (!Body?.stkCallback) {
      return NextResponse.json({ error: "Invalid callback" }, { status: 400 });
    }

    const callback = Body.stkCallback;
    const {
      CheckoutRequestID,
      ResultCode,
      ResultDesc,
      CallbackMetadata,
    } = callback;

    // Find order by checkout request ID
    const order = await prisma.order.findFirst({
      where: { mpesaCheckoutId: CheckoutRequestID },
    });

    if (!order) {
      console.error("Order not found for checkout request:", CheckoutRequestID);
      return NextResponse.json({ ResultCode: 0, ResultDesc: "Accepted" });
    }

    if (ResultCode === 0) {
      // Payment successful — extract receipt number from metadata
      const receiptItem = CallbackMetadata?.Item?.find(
        (item: any) => item.Name === "MpesaReceiptNumber"
      );
      const receiptNumber = receiptItem?.Value;

      await prisma.order.update({
        where: { id: order.id },
        data: {
          paymentStatus: "PAID",
          status: "CONFIRMED",
          mpesaReceiptNumber: receiptNumber,
        },
      });

      console.log(
        `✅ M-Pesa payment confirmed for order ${order.orderNumber}. Receipt: ${receiptNumber}`
      );
    } else {
      // Payment failed — restore stock
      await prisma.$transaction(async (tx) => {
        await tx.order.update({
          where: { id: order.id },
          data: { paymentStatus: "FAILED" },
        });

        const orderItems = await tx.orderItem.findMany({
          where: { orderId: order.id },
        });

        for (const item of orderItems) {
          await tx.productVariant.update({
            where: { id: item.variantId },
            data: { stock: { increment: item.quantity } },
          });
        }
      });

      console.log(
        `❌ M-Pesa payment failed for order ${order.orderNumber}. Code: ${ResultCode}, Desc: ${ResultDesc}`
      );
    }

    // Always return success to Safaricom so they stop retrying
    return NextResponse.json({ ResultCode: 0, ResultDesc: "Accepted" });
  } catch (error) {
    console.error("M-Pesa callback error:", error);
    return NextResponse.json({ ResultCode: 0, ResultDesc: "Accepted" });
  }
}
