// src/app/api/designs/route.ts
// Save and retrieve custom designs

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth.config";
import prisma from "@/lib/db/prisma";
import { validateUploadedFileMeta } from "@/lib/utils/design-validation";
import { z } from "zod";

const saveDesignSchema = z.object({
  printableProductId: z.string().min(1),
  originalFileUrl: z.string().url(),
  originalPublicId: z.string().min(1),
  fileType: z.enum(["png", "jpg", "jpeg", "svg"]),
  fileSizeBytes: z.number().int().positive(),
  imageWidth: z.number().int().min(0),
  imageHeight: z.number().int().min(0),
  placementX: z.number().min(0).max(100),
  placementY: z.number().min(0).max(100),
  designScale: z.number().min(10).max(200),
  designRotation: z.number().min(-180).max(180),
  selectedColor: z.string(),
  selectedSize: z.string(),
  garmentColorHex: z.string(),
  previewImageUrl: z.string().url().optional(),
  previewPublicId: z.string().optional(),
  qualityWarnings: z.array(z.string()),
});

// POST /api/designs — save a new design
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const data = saveDesignSchema.parse(body);

    // Server-side file validation
    const fileValidation = validateUploadedFileMeta({
      fileType: data.fileType,
      fileSizeBytes: data.fileSizeBytes,
      imageWidth: data.imageWidth,
      imageHeight: data.imageHeight,
    });

    if (!fileValidation.valid) {
      return NextResponse.json(
        { error: fileValidation.error },
        { status: 400 }
      );
    }

    // Verify the printable product exists
    const product = await prisma.printableProduct.findUnique({
      where: { id: data.printableProductId, isActive: true },
    });
    if (!product) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    // Save design to DB
    const design = await prisma.customDesign.create({
      data: {
        userId: session.user.id,
        printableProductId: data.printableProductId,
        originalFileUrl: data.originalFileUrl,
        originalPublicId: data.originalPublicId,
        fileType: data.fileType,
        fileSizeBytes: data.fileSizeBytes,
        imageWidth: data.imageWidth,
        imageHeight: data.imageHeight,
        placementX: data.placementX,
        placementY: data.placementY,
        designScale: data.designScale,
        designRotation: data.designRotation,
        selectedColor: data.selectedColor,
        selectedSize: data.selectedSize,
        garmentColorHex: data.garmentColorHex,
        previewImageUrl: data.previewImageUrl,
        previewPublicId: data.previewPublicId,
        qualityWarnings: data.qualityWarnings,
        status: "PENDING_REVIEW",
      },
    });

    return NextResponse.json({ designId: design.id }, { status: 201 });
  } catch (error: any) {
    if (error.name === "ZodError") {
      return NextResponse.json(
        { error: "Invalid design data", details: error.errors },
        { status: 400 }
      );
    }
    console.error("Save design error:", error);
    return NextResponse.json({ error: "Failed to save design" }, { status: 500 });
  }
}

// GET /api/designs — get current user's designs
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const designs = await prisma.customDesign.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      include: {
        printableProduct: { select: { name: true, slug: true } },
        customOrderItem: {
          select: {
            printStatus: true,
            order: { select: { orderNumber: true } },
          },
        },
      },
    });

    return NextResponse.json({ designs });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch designs" }, { status: 500 });
  }
}
