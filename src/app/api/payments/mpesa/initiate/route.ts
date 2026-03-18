export const dynamic = "force-dynamic";
export const revalidate = 0;
// src/app/api/payments/mpesa/initiate/route.ts
// Initiate M-Pesa STK Push
// SECURITY: Amount is fetched from the database — client value is ignored

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth.config";
import { mpesaService } from "@/lib/payments/mpesa";
import prisma from "@/lib/db/prisma";
import { z } from "zod";

const initiateSchema = z.object({
  phone: z.string().min(10, "Valid phone number required"),
  orderId: z.string().min(1, "Order ID required"),
});

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const sessionUser = session?.user as any;

    const body = await req.json();
    const data = initiateSchema.parse(body);

    // ──────────────────────────────────────────────────────────────────────────
    // SECURITY FIX #4: Fetch the order from DB and verify ownership.
    // Use DB total — never trust client-submitted amount.
    // ──────────────────────────────────────────────────────────────────────────
    const order = await prisma.order.findUnique({
      where: { id: data.orderId },
      select: {
        id: true,
        orderNumber: true,
        total: true,
        userId: true,
        paymentStatus: true,
      },
    });

    if (!order) {
      return NextResponse.json(
        { success: false, error: "Order not found" },
        { status: 404 }
      );
    }

    // Verify the requesting user owns this order (or is admin)
    if (
      sessionUser?.role !== "ADMIN" &&
      sessionUser?.id !== order.userId
    ) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 403 }
      );
    }

    // Prevent double-payment
    if (order.paymentStatus === "PAID") {
      return NextResponse.json(
        { success: false, error: "Order is already paid" },
        { status: 400 }
      );
    }

    // Callback URL — optionally include secret for validation
    const secret = process.env.MPESA_CALLBACK_SECRET
      ? `?secret=${process.env.MPESA_CALLBACK_SECRET}`
      : "";
    const callbackUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/api/payments/mpesa/callback${secret}`;

    const result = await mpesaService.initiateSTKPush({
      phone: data.phone,
      amount: Number(order.total), // ← Use server-side total, not client value
      orderId: order.id,
      orderNumber: order.orderNumber,
      callbackUrl,
    });

    if (result.success && result.checkoutRequestId) {
      await prisma.order.update({
        where: { id: data.orderId },
        data: { mpesaCheckoutId: result.checkoutRequestId },
      });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("M-Pesa initiate error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to initiate payment" },
      { status: 500 }
    );
  }
}
