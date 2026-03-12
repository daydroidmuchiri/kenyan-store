// src/app/api/admin/designs/[id]/route.ts
// Admin design moderation — approve, reject, flag

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth.config";
import prisma from "@/lib/db/prisma";
import { z } from "zod";

const moderateSchema = z.object({
  action: z.enum(["approve", "reject", "flag"]),
  moderationNotes: z.string().max(1000).optional(),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any)?.role !== "ADMIN") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    const body = await req.json();
    const { action, moderationNotes } = moderateSchema.parse(body);

    const design = await prisma.customDesign.findUnique({
      where: { id: params.id },
      include: { customOrderItem: true },
    });

    if (!design) {
      return NextResponse.json({ error: "Design not found" }, { status: 404 });
    }

    const statusMap = {
      approve: "APPROVED",
      reject: "REJECTED",
      flag: "FLAGGED",
    } as const;

    // Update design status
    const updated = await prisma.customDesign.update({
      where: { id: params.id },
      data: {
        status: statusMap[action],
        moderationNotes: moderationNotes || null,
      },
    });

    // If approved and has an order, update print status
    if (action === "approve" && design.customOrderItem) {
      await prisma.customOrderItem.update({
        where: { id: design.customOrderItem.id },
        data: { printStatus: "APPROVED_FOR_PRINT" },
      });
    }

    // If rejected and has an order, cancel print
    if (action === "reject" && design.customOrderItem) {
      await prisma.customOrderItem.update({
        where: { id: design.customOrderItem.id },
        data: { printStatus: "CANCELLED" },
      });
    }

    return NextResponse.json({ success: true, status: updated.status });
  } catch (error: any) {
    if (error.name === "ZodError") {
      return NextResponse.json({ error: "Invalid data" }, { status: 400 });
    }
    console.error("Design moderation error:", error);
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any)?.role !== "ADMIN") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    const design = await prisma.customDesign.findUnique({
      where: { id: params.id },
      include: {
        user: { select: { name: true, email: true } },
        printableProduct: { select: { name: true } },
        customOrderItem: {
          include: {
            order: {
              select: { orderNumber: true, total: true, createdAt: true },
            },
          },
        },
      },
    });

    if (!design) {
      return NextResponse.json({ error: "Design not found" }, { status: 404 });
    }

    return NextResponse.json({ design });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch design" }, { status: 500 });
  }
}
