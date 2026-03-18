"use server";

import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";
import { authOptions } from "@/lib/auth/auth.config";
import prisma from "@/lib/db/prisma";
import { z } from "zod";

// Zod Schema for validation
const productSchema = z.object({
  name: z.string().min(2, "Product name is required"),
  slug: z.string().min(2, "Slug is required"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  price: z.coerce.number().min(1, "Price must be greater than 0"),
  comparePrice: z.coerce.number().nullable().optional(),
  categoryId: z.string().min(1, "Category is required"),
  brand: z.string().optional(),
  material: z.string().optional(),
  careInstructions: z.string().optional(),
  isFeatured: z.boolean().default(false),
  isActive: z.boolean().default(true),
  images: z.array(z.string().url("Must be a valid URL")).min(1, "At least one image is required"),
  variants: z.array(z.object({
    size: z.string().min(1, "Size is required"),
    stock: z.coerce.number().min(0, "Stock cannot be negative"),
    sku: z.string().min(1, "SKU is required"),
  })).min(1, "At least one variant (size/stock) is required"),
});

export type CreateProductInput = z.infer<typeof productSchema>;

export async function createProduct(data: CreateProductInput) {
  try {
    // 1. Authenticate Request
    const session = await getServerSession(authOptions);
    const user = session?.user as any;

    if (!session || user?.role !== "ADMIN") {
      return { success: false, error: "Unauthorized access" };
    }

    // 2. Validate Data
    const validatedData = productSchema.parse(data);

    // 3. Ensure Slug Uniqueness
    const existingProduct = await prisma.product.findUnique({
      where: { slug: validatedData.slug },
    });

    if (existingProduct) {
      return { success: false, error: "A product with this slug already exists. Please choose a unique name/slug." };
    }

    // 4. Create Product with nested relations via Transaction
    const product = await prisma.product.create({
      data: {
        name: validatedData.name,
        slug: validatedData.slug,
        description: validatedData.description,
        price: validatedData.price,
        comparePrice: validatedData.comparePrice || null,
        categoryId: validatedData.categoryId,
        brand: validatedData.brand,
        material: validatedData.material,
        careInstructions: validatedData.careInstructions,
        isFeatured: validatedData.isFeatured,
        isActive: validatedData.isActive,
        // Create nested images
        images: {
          create: validatedData.images.map((url, index) => ({
            url,
            alt: `${validatedData.name} image ${index + 1}`,
            position: index,
          })),
        },
        // Create nested variants
        variants: {
          create: validatedData.variants.map(variant => ({
            size: variant.size,
            stock: variant.stock,
            sku: variant.sku,
          })),
        },
      },
    });

    // 5. Revalidate Paths
    revalidatePath("/shop");
    revalidatePath("/admin/products");

    return { success: true, product };

  } catch (error) {
    console.error("Failed to create product:", error);
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message };
    }
    return { success: false, error: "An unexpected error occurred while saving the product." };
  }
}
