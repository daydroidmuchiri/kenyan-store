export const dynamic = "force-dynamic";
export const revalidate = 0;
// Create order API — security-hardened version
// Supports both Standard Products and Custom Prints

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
    // SPLIT ITEMS: Standard Products vs Custom Prints
    // Custom Prints have a variantId prefixed with "custom-"
    // ──────────────────────────────────────────────────────────────────────────
    const standardItems = data.items.filter((i) => !i.variantId.startsWith("custom-"));
    const customItems = data.items.filter((i) => i.variantId.startsWith("custom-"));

    // 1. Fetch Standard Variants
    const standardVariantIds = standardItems.map((i) => i.variantId);
    const variants = await prisma.productVariant.findMany({
      where: { id: { in: standardVariantIds } },
      include: {
        product: {
          select: { id: true, price: true, name: true, images: { take: 1 } },
        },
      },
    });

    const variantMap = new Map(variants.map((v) => [v.id, v]));

    // 2. Fetch Custom Designs
    // Extract the raw CUID design ID by stripping "custom-"
    const customDesignIds = customItems.map((i) => i.variantId.replace("custom-", ""));
    const customDesigns = await prisma.customDesign.findMany({
      where: { id: { in: customDesignIds } },
      include: { printableProduct: true },
    });

    const customDesignMap = new Map(customDesigns.map((d) => [d.id, d]));

    // ──────────────────────────────────────────────────────────────────────────
    // VALIDATION AND PRICE COMPUTATION
    // ──────────────────────────────────────────────────────────────────────────
    let subtotal = 0;
    const deliveryFee = DELIVERY_FEES[data.deliveryType] ?? 0;

    // Validate Standard Items
    const resolvedStandardItems = standardItems.map((item) => {
      const variant = variantMap.get(item.variantId);
      if (!variant || variant.product.id !== item.productId) {
        throw new Error(`Product variant mismatch: ${item.variantId}. Please refresh your cart.`);
      }
      const unitPrice = Number(variant.product.price);
      subtotal += unitPrice * item.quantity;
      return {
        ...item,
        price: unitPrice,
        productName: variant.product.name,
        productImage: variant.product.images[0]?.url ?? null,
        size: variant.size,
        variantRef: variant, // Kept to decrease stock later
      };
    });

    // Validate Custom Items
    const resolvedCustomItems = customItems.map((item) => {
      const designId = item.variantId.replace("custom-", "");
      const design = customDesignMap.get(designId);
      if (!design || design.printableProductId !== item.productId) {
        throw new Error(`Custom design not found: ${designId}. Please refresh your cart.`);
      }
      
      // Compute Custom Print Price: Base Garment Price + Print Surcharge
      const unitPrice =
        Number(design.printableProduct.basePrice) +
        Number(design.printableProduct.printSurcharge);
        
      subtotal += unitPrice * item.quantity;
      return {
        ...item,
        designId: design.id,
        price: unitPrice,
      };
    });

    const total = subtotal + deliveryFee;

    // Resolve userId (Guest or Logged in)
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
    // TRANSACTION: Atomic Stock Reservation + Order Creation
    // ──────────────────────────────────────────────────────────────────────────
    const order = await prisma.$transaction(async (tx) => {
      
      // 1. Check and decrement stock for STANDARD items ONLY
      for (const item of resolvedStandardItems) {
        const updated = await tx.productVariant.updateMany({
          where: {
            id: item.variantId,
            stock: { gte: item.quantity }, // Guard: sufficient stock must exist
          },
          data: { stock: { decrement: item.quantity } },
        });

        if (updated.count === 0) {
          throw new Error(
            `Insufficient stock for catalog item size "${item.size}". Please update your cart.`
          );
        }
      }

      // 2. Create the Order Parent
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
          
          // 3. Attach Standard Order Items
          items: {
            create: resolvedStandardItems.map((item) => ({
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
          
          // 4. Attach Custom Design Order Items
          customOrderItems: {
            create: resolvedCustomItems.map((item) => ({
              designId: item.designId,
              printStatus: "AWAITING_APPROVAL",
            }))
          }
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
    // Surface known errors (like Stock/Mismatch) clearly to the client
    if (error.message?.includes("Please refresh") || error.message?.includes("stock")) {
      return NextResponse.json({ error: error.message }, { status: 409 });
    }
    return NextResponse.json(
      { error: "Failed to create order" },
      { status: 500 }
    );
  }
}
