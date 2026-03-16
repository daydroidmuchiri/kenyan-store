export const dynamic = "force-dynamic";
// src/app/product/[slug]/page.tsx
// Product detail page with images, variants, add to cart, reviews

import { notFound } from "next/navigation";
import type { Metadata } from "next";
import prisma from "@/lib/db/prisma";
import { ProductDetail } from "@/components/product/ProductDetail";
import { ProductCard } from "@/components/product/ProductCard";

interface ProductPageProps {
  params: { slug: string };
}

async function getProduct(slug: string) {
  const product = await prisma.product.findUnique({
    where: { slug, isActive: true },
    include: {
      category: true,
      images: { orderBy: { position: "asc" } },
      variants: true,
      reviews: {
        include: {
          user: { select: { name: true, image: true } },
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  return product;
}

async function getRelatedProducts(categoryId: string, excludeId: string) {
  return prisma.product.findMany({
    where: { categoryId, isActive: true, id: { not: excludeId } },
    include: {
      images: { take: 2, orderBy: { position: "asc" } },
      variants: true,
      reviews: { select: { rating: true } },
      category: { select: { name: true, slug: true } },
    },
    take: 4,
    orderBy: { createdAt: "desc" },
  });
}

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const product = await getProduct(params.slug);
  if (!product) return { title: "Product Not Found" };

  const image = product.images[0]?.url;

  return {
    title: `${product.name} — BNs Fashion Wear`,
    description: product.description.slice(0, 160),
    openGraph: {
      title: product.name,
      description: product.description.slice(0, 160),
      images: image ? [{ url: image }] : [],
    },
    // Structured data for rich results
    other: {
      "product:price:amount": String(product.price),
      "product:price:currency": "KES",
    },
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const product = await getProduct(params.slug);

  if (!product) notFound();

  const relatedProducts = await getRelatedProducts(
    product.categoryId,
    product.id
  );

  // Serialize decimals for client components
  const serializedProduct = {
    ...product,
    price: Number(product.price),
    comparePrice: product.comparePrice ? Number(product.comparePrice) : null,
  };

  // Structured data JSON-LD
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    image: product.images.map((img) => img.url),
    brand: { "@type": "Brand", name: product.brand || "BNs Fashion Wear" },
    offers: {
      "@type": "Offer",
      priceCurrency: "KES",
      price: Number(product.price),
      availability:
        product.variants.some((v) => v.stock > 0)
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
      seller: { "@type": "Organization", name: "BNs Fashion Wear" },
    },
    aggregateRating:
      product.reviews.length > 0
        ? {
            "@type": "AggregateRating",
            ratingValue:
              product.reviews.reduce((a, r) => a + r.rating, 0) /
              product.reviews.length,
            reviewCount: product.reviews.length,
          }
        : undefined,
  };

  return (
    <>
      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-muted mb-6">
          <a href="/" className="hover:text-charcoal">Home</a>
          <span>›</span>
          <a href="/shop" className="hover:text-charcoal">Shop</a>
          <span>›</span>
          <a
            href={`/shop?category=${product.category.slug}`}
            className="hover:text-charcoal"
          >
            {product.category.name}
          </a>
          <span>›</span>
          <span className="text-charcoal line-clamp-1">{product.name}</span>
        </nav>

        {/* Product Detail */}
        <ProductDetail product={serializedProduct} />

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <section className="mt-20">
            <div className="mb-8">
              <p className="section-subtitle mb-2">You May Also Like</p>
              <h2 className="font-display text-3xl font-light">
                Related Pieces
              </h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
              {relatedProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={{
                    ...product,
                    price: Number(product.price),
                    comparePrice: product.comparePrice
                      ? Number(product.comparePrice)
                      : null,
                  }}
                />
              ))}
            </div>
          </section>
        )}
      </div>
    </>
  );
}
