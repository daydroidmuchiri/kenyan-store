export const dynamic = "force-dynamic";
export const revalidate = 0;
// Create order API — security-hardened version

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth.config";
import prisma from "@/lib/db/prisma";
import { generateOrderNumber } from "@/lib/utils";
import { z } from "zod";

const createOrderSchema = z.object({
  fullName: z.string().min(1),
  email: z.string().email(),
  phone: z.string().min(1),
  county: z.string().optional(),
  town: z.string().optional(),
  street: z.string().optional(),
  deliveryType: z.enum(["NAIROBI", "OUTSIDE_NAIROBI", "PICKUP"]),
  paymentMethod: z.enum(["MPESA", "CARD", "CASH_ON_DELIVERY"]),
  notes: z.string().optional(),
  // Items: only IDs and quantities from client — prices are fetched server-side
  items: z.array(
    z.object({
      productId: z.string().min(1),
      variantId: z.string().min(1),
      quantity: z.number().int().positive().max(50),
      color: z.string().optional(),
    })
  ).min(1),
});

// Delivery fee constants (mirrors client-side lib/utils.ts)
const DELIVERY_FEES: Record<string, number> = {
  NAIROBI: 200,
  OUTSIDE_NAIROBI: 500,
  PICKUP: 0,
};

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const body = await req.json();

    const data = createOrderSchema.parse(body);

    // ──────────────────────────────────────────────────────────────────────────
    // SECURITY: Resolve prices server-side — never trust client-submitted prices
    // ──────────────────────────────────────────────────────────────────────────
    const variantIds = data.items.map((i) => i.variantId);
    const variants = await prisma.productVariant.findMany({
      where: { id: { in: variantIds } },
      include: {
        product: {
          select: { id: true, price: true, name: true, images: { take: 1 } },
        },
      },
    });

    // Map for fast lookup
    const variantMap = new Map(variants.map((v) => [v.id, v]));

    // Verify all requested variants exist and belong to the right products
    for (const item of data.items) {
      const variant = variantMap.get(item.variantId);
      if (!variant) {
        return NextResponse.json(
          { error: `Product variant not found: ${item.variantId}. Please refresh and try again.` },
          { status: 400 }
        );
      }
      if (variant.product.id !== item.productId) {
        return NextResponse.json(
          { error: `Product/variant mismatch detected. Please refresh and try again.` },
          { status: 400 }
        );
      }
    }

    // Compute totals server-side using DB prices
    const deliveryFee = DELIVERY_FEES[data.deliveryType] ?? 0;
    let subtotal = 0;
    const resolvedItems = data.items.map((item) => {
      const variant = variantMap.get(item.variantId)!;
      const unitPrice = Number(variant.product.price);
      subtotal += unitPrice * item.quantity;
      return {
        productId: item.productId,
        variantId: item.variantId,
        quantity: item.quantity,
        color: item.color,
        price: unitPrice,
        productName: variant.product.name,
        productImage: variant.product.images[0]?.url ?? null,
        size: variant.size,
        variantRef: variant,
      };
    });
    const total = subtotal + deliveryFee;

    // Resolve userId
    let userId = (session?.user as any)?.id;
    if (!userId) {
      let user = await prisma.user.findUnique({ where: { email: data.email } });
      if (!user) {
        user = await prisma.user.create({
          data: { email: data.email, name: data.fullName, phone: data.phone },
        });
      }
      userId = user.id;
    }

    const orderNumber = generateOrderNumber();

    // ──────────────────────────────────────────────────────────────────────────
    // SECURITY: Stock check AND decrement happen atomically INSIDE transaction
    // This eliminates the TOCTOU race condition.
    // ──────────────────────────────────────────────────────────────────────────
    const order = await prisma.$transaction(async (tx) => {
      // Atomic stock reservation: only succeeds if stock >= requested quantity
      for (const item of resolvedItems) {
        const updated = await tx.productVariant.updateMany({
          where: {
            id: item.variantId,
            stock: { gte: item.quantity }, // Guard: sufficient stock must exist
          },
          data: { stock: { decrement: item.quantity } },
        });

        if (updated.count === 0) {
          // Either variant not found or insufficient stock — roll back entire tx
          throw new Error(
            `Insufficient stock for size "${item.variantRef.size}". Please update your cart.`
          );
        }
      }

      // Create the order with server-computed pricing
      const newOrder = await tx.order.create({
        data: {
          orderNumber,
          userId,
          status: "PENDING",
          paymentStatus: "PENDING",
          paymentMethod: data.paymentMethod,
          subtotal,
          deliveryFee,
          total,
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
            create: resolvedItems.map((item) => ({
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

      return newOrder;
    });

    return NextResponse.json({
      orderId: order.id,
      orderNumber: order.orderNumber,
      total: order.total,
    });
  } catch (error: any) {
    console.error("Create order error:", error);
    if (error.name === "ZodError") {
      return NextResponse.json(
        { error: "Invalid order data", details: error.errors },
        { status: 400 }
      );
    }
    // Surface stock errors clearly to the client
    if (error.message?.includes("Insufficient stock")) {
      return NextResponse.json({ error: error.message }, { status: 409 });
    }
    return NextResponse.json(
      { error: "Failed to create order" },
      { status: 500 }
    );
  }
}
