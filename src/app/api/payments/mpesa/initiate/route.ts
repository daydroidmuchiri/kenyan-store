// src/app/api/payments/mpesa/initiate/route.ts
// Initiate M-Pesa STK Push

import { NextRequest, NextResponse } from "next/server";
import { mpesaService } from "@/lib/payments/mpesa";
import prisma from "@/lib/db/prisma";
import { z } from "zod";

const initiateSchema = z.object({
  phone: z.string(),
  orderId: z.string(),
  orderNumber: z.string(),
  amount: z.number().positive(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = initiateSchema.parse(body);

    const callbackUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/api/payments/mpesa/callback`;

    const result = await mpesaService.initiateSTKPush({
      phone: data.phone,
      amount: data.amount,
      orderId: data.orderId,
      orderNumber: data.orderNumber,
      callbackUrl,
    });

    if (result.success && result.checkoutRequestId) {
      // Save checkout request ID to order
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
