export const dynamic = "force-dynamic";
export const revalidate = 0;
// Create order API

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth.config";
import prisma from "@/lib/db/prisma";
import { generateOrderNumber, getDeliveryFee } from "@/lib/utils";
import { z } from "zod";

const createOrderSchema = z.object({
  fullName: z.string(),
  email: z.string().email(),
  phone: z.string(),
  county: z.string().optional(),
  town: z.string().optional(),
  street: z.string().optional(),
  deliveryType: z.enum(["NAIROBI", "OUTSIDE_NAIROBI", "PICKUP"]),
  paymentMethod: z.enum(["MPESA", "CARD", "CASH_ON_DELIVERY"]),
  notes: z.string().optional(),
  subtotal: z.number(),
  deliveryFee: z.number(),
  total: z.number(),
  items: z.array(
    z.object({
      productId: z.string(),
      variantId: z.string(),
      quantity: z.number().int().positive(),
      price: z.number(),
      productName: z.string(),
      productImage: z.string().optional(),
      size: z.string(),
      color: z.string().optional(),
    })
  ),
});

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const body = await req.json();

    const data = createOrderSchema.parse(body);

    // For guests, require email; for logged-in users, use their ID
    let userId = (session?.user as any)?.id;

    if (!userId) {
      // Find or create guest user by email
      let user = await prisma.user.findUnique({
        where: { email: data.email },
      });
      if (!user) {
        user = await prisma.user.create({
          data: {
            email: data.email,
            name: data.fullName,
            phone: data.phone,
          },
        });
      }
      userId = user.id;
    }

    // Validate all variants and stock
    for (const item of data.items) {
      const variant = await prisma.productVariant.findUnique({
        where: { id: item.variantId },
      });
      if (!variant) {
        return NextResponse.json(
          { error: `Variant ${item.variantId} not found` },
          { status: 400 }
        );
      }
      if (variant.stock < item.quantity) {
        return NextResponse.json(
          {
            error: `Insufficient stock for size ${variant.size}. Only ${variant.stock} available.`,
          },
          { status: 400 }
        );
      }
    }

    const orderNumber = generateOrderNumber();

    // Create order with items in a transaction
    const order = await prisma.$transaction(async (tx) => {
      const newOrder = await tx.order.create({
        data: {
          orderNumber,
          userId,
          status: "PENDING",
          paymentStatus: "PENDING",
          paymentMethod: data.paymentMethod,
          subtotal: data.subtotal,
          deliveryFee: data.deliveryFee,
          total: data.total,
          deliveryType: data.deliveryType,
          deliveryAddress: {
            fullName: data.fullName,
            phone: data.phone,
            county: data.county,
            town: data.town,
            street: data.street,
          },
          notes: data.notes,
          items: {
            create: data.items.map((item) => ({
              productId: item.productId,
              variantId: item.variantId,
              quantity: item.quantity,
              price: item.price,
              productName: item.productName,
              productImage: item.productImage,
              size: item.size,
              color: item.color,
            })),
          },
        },
      });

      // Reserve stock
      for (const item of data.items) {
        await tx.productVariant.update({
          where: { id: item.variantId },
          data: { stock: { decrement: item.quantity } },
        });
      }

      return newOrder;
    });

    return NextResponse.json({
      orderId: order.id,
      orderNumber: order.orderNumber,
    });
  } catch (error: any) {
    console.error("Create order error:", error);
    if (error.name === "ZodError") {
      return NextResponse.json(
        { error: "Invalid order data", details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Failed to create order" },
      { status: 500 }
    );
  }
}
