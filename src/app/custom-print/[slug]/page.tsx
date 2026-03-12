export const dynamic = "force-dynamic";
// src/app/custom-print/[slug]/page.tsx
// The main design studio page for a specific printable product

import { notFound } from "next/navigation";
import type { Metadata } from "next";
import prisma from "@/lib/db/prisma";
import { DesignStudioWrapper } from "@/components/print/DesignStudioWrapper";

interface StudioPageProps {
  params: { slug: string };
}

async function getProduct(slug: string) {
  return prisma.printableProduct.findUnique({
    where: { slug, isActive: true },
  });
}

export async function generateMetadata({
  params,
}: StudioPageProps): Promise<Metadata> {
  const product = await getProduct(params.slug);
  if (!product) return { title: "Product Not Found" };

  return {
    title: `Design Your Own ${product.name} — KWELI Custom Print`,
    description: `Upload your artwork and create a custom ${product.name}. Pay with M-Pesa. Shipped across Kenya.`,
  };
}

export default async function StudioPage({ params }: StudioPageProps) {
  const product = await getProduct(params.slug);
  if (!product) notFound();

  // Serialize Decimal fields
  const serialized = {
    ...product,
    basePrice: Number(product.basePrice),
    printSurcharge: Number(product.printSurcharge),
    availableColors: product.availableColors as any,
    availableSizes: product.availableSizes,
  };

  return <DesignStudioWrapper product={serialized} />;
}
