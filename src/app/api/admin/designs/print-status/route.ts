// Update print status of a custom order item
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth.config";
import prisma from "@/lib/db/prisma";
import { z } from "zod";

const schema = z.object({
  customOrderItemId: z.string().min(1),
  printStatus: z.enum([
    "AWAITING_APPROVAL",
    "APPROVED_FOR_PRINT",
    "PRINTING",
    "QUALITY_CHECK",
    "SHIPPED",
    "CANCELLED",
  ]),
  adminNotes: z.string().max(500).optional(),
});

export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const user = session?.user as any;

    if (!user || user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    const body = await req.json();
    const { customOrderItemId, printStatus, adminNotes } = schema.parse(body);

    const item = await prisma.customOrderItem.update({
      where: { id: customOrderItemId },
      data: {
        printStatus,
        adminNotes: adminNotes || null,
        updatedAt: new Date(),
      },
    });

    // Sync design status
    if (printStatus === "PRINTING" || printStatus === "QUALITY_CHECK") {
      await prisma.customDesign.update({
        where: { id: item.designId },
        data: { status: "IN_PRODUCTION" },
      });
    }
    if (printStatus === "SHIPPED") {
      await prisma.customDesign.update({
        where: { id: item.designId },
        data: { status: "COMPLETED" },
      });
    }

    return NextResponse.json({ success: true, printStatus: item.printStatus });
  } catch (error: any) {
    if (error.name === "ZodError") {
      return NextResponse.json({ error: "Invalid data" }, { status: 400 });
    }
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}
