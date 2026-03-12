export const dynamic = "force-dynamic";
export const revalidate = 0;
// src/app/api/payments/mpesa/status/route.ts
// Poll M-Pesa payment status

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const orderId = searchParams.get("orderId");
  const checkoutRequestId = searchParams.get("checkoutRequestId");

  if (!orderId) {
    return NextResponse.json({ error: "Missing orderId" }, { status: 400 });
  }

  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      select: {
        paymentStatus: true,
        orderNumber: true,
        mpesaReceiptNumber: true,
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    return NextResponse.json({
      status: order.paymentStatus,
      orderNumber: order.orderNumber,
      receiptNumber: order.mpesaReceiptNumber,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to check status" },
      { status: 500 }
    );
  }
}
