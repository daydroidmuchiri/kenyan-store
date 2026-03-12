// src/app/api/payments/mpesa/callback/route.ts
export const dynamic = "force-dynamic";
// M-Pesa Daraja callback — called by Safaricom servers after payment

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { Body } = body;

    if (!Body?.stkCallback) {
      return NextResponse.json({ error: "Invalid callback" }, { status: 400 });
    }

    const callback = Body.stkCallback;
    const {
      MerchantRequestID,
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
      // Payment successful
      // Extract receipt number from metadata
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
      // Payment failed
      await prisma.order.update({
        where: { id: order.id },
        data: { paymentStatus: "FAILED" },
      });

      console.log(
        `❌ M-Pesa payment failed for order ${order.orderNumber}. Code: ${ResultCode}, Desc: ${ResultDesc}`
      );

      // Restore stock on payment failure
      const orderItems = await prisma.orderItem.findMany({
        where: { orderId: order.id },
      });

      for (const item of orderItems) {
        await prisma.productVariant.update({
          where: { id: item.variantId },
          data: { stock: { increment: item.quantity } },
        });
      }
    }

    // Always return success to Safaricom
    return NextResponse.json({ ResultCode: 0, ResultDesc: "Accepted" });
  } catch (error) {
    console.error("M-Pesa callback error:", error);
    return NextResponse.json({ ResultCode: 0, ResultDesc: "Accepted" });
  }
}
