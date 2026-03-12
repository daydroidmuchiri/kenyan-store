// src/app/shop/page.tsx
// Product listing page with filters, search, and pagination

import { Suspense } from "react";
import type { Metadata } from "next";
import prisma from "@/lib/db/prisma";
import { ProductCard, ProductCardSkeleton } from "@/components/product/ProductCard";
import { ProductFilters } from "@/components/product/ProductFilters";
import { Prisma } from "@prisma/client";

export const metadata: Metadata = {
  title: "Shop All — KWELI Fashion",
  description: "Browse our full collection of premium African-inspired fashion. Filter by category, size and price.",
};

interface ShopPageProps {
  searchParams: {
    category?: string;
    minPrice?: string;
    maxPrice?: string;
    sizes?: string;
    sort?: string;
    search?: string;
    page?: string;
    sale?: string;
  };
}

const PAGE_SIZE = 12;

async function getProducts(searchParams: ShopPageProps["searchParams"]) {
  const page = parseInt(searchParams.page || "1");
  const skip = (page - 1) * PAGE_SIZE;

  // Build where clause
  const where: Prisma.ProductWhereInput = {
    isActive: true,
    ...(searchParams.category && {
      category: { slug: searchParams.category },
    }),
    ...(searchParams.search && {
      OR: [
        { name: { contains: searchParams.search, mode: "insensitive" } },
        { description: { contains: searchParams.search, mode: "insensitive" } },
        { brand: { contains: searchParams.search, mode: "insensitive" } },
      ],
    }),
    ...(searchParams.sale === "true" && {
      comparePrice: { not: null },
    }),
    ...(searchParams.minPrice || searchParams.maxPrice
      ? {
          price: {
            ...(searchParams.minPrice && { gte: parseFloat(searchParams.minPrice) }),
            ...(searchParams.maxPrice && { lte: parseFloat(searchParams.maxPrice) }),
          },
        }
      : {}),
    ...(searchParams.sizes && {
      variants: {
        some: {
          size: { in: searchParams.sizes.split(",") },
          stock: { gt: 0 },
        },
      },
    }),
  };

  // Build orderBy
  let orderBy: Prisma.ProductOrderByWithRelationInput = { createdAt: "desc" };
  if (searchParams.sort === "price_asc") orderBy = { price: "asc" };
  if (searchParams.sort === "price_desc") orderBy = { price: "desc" };
  if (searchParams.sort === "popular") {
    orderBy = { reviews: { _count: "desc" } };
  }

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      include: {
        images: { orderBy: { position: "asc" }, take: 2 },
        variants: true,
        reviews: { select: { rating: true } },
        category: { select: { name: true, slug: true } },
      },
      orderBy,
      take: PAGE_SIZE,
      skip,
    }),
    prisma.product.count({ where }),
  ]);

  return {
    products,
    total,
    totalPages: Math.ceil(total / PAGE_SIZE),
    page,
  };
}

async function getCategories() {
  return prisma.category.findMany({
    where: { parentId: null },
    orderBy: { name: "asc" },
  });
}

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const [{ products, total, totalPages, page }, categories] = await Promise.all([
    getProducts(searchParams),
    getCategories(),
  ]);

  const hasActiveFilters =
    searchParams.category ||
    searchParams.search ||
    searchParams.sizes ||
    searchParams.minPrice ||
    searchParams.maxPrice ||
    searchParams.sale;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="section-title">
          {searchParams.search
            ? `Search: "${searchParams.search}"`
            : searchParams.category
            ? categories.find((c) => c.slug === searchParams.category)?.name || "Shop"
            : searchParams.sale === "true"
            ? "Sale"
            : "All Products"}
        </h1>
        <p className="text-muted text-sm mt-1">
          {total} {total === 1 ? "product" : "products"} found
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar Filters */}
        <aside className="lg:w-56 shrink-0">
          <Suspense>
            <ProductFilters
              categories={categories}
              searchParams={searchParams}
            />
          </Suspense>
        </aside>

        {/* Products Grid */}
        <div className="flex-1">
          {/* Sort */}
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-sand">
            <p className="text-sm text-muted hidden sm:block">
              Showing {Math.min((page - 1) * PAGE_SIZE + 1, total)}–
              {Math.min(page * PAGE_SIZE, total)} of {total}
            </p>
            <SortSelect currentSort={searchParams.sort} />
          </div>

          {/* Grid */}
          {products.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-5">
              {products.map((product) => (
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
          ) : (
            <div className="text-center py-20">
              <p className="font-display text-2xl text-charcoal mb-2">
                No products found
              </p>
              <p className="text-muted text-sm mb-6">
                {hasActiveFilters
                  ? "Try adjusting your filters"
                  : "Check back soon for new arrivals"}
              </p>
              {hasActiveFilters && (
                <a href="/shop" className="btn-secondary">
                  Clear Filters
                </a>
              )}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-10">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <PaginationLink
                  key={p}
                  page={p}
                  currentPage={page}
                  searchParams={searchParams}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function SortSelect({ currentSort }: { currentSort?: string }) {
  return (
    <form method="get" className="flex items-center gap-2">
      <label className="text-xs text-muted uppercase tracking-wider">Sort:</label>
      <select
        name="sort"
        defaultValue={currentSort || "newest"}
        onChange={(e) => {
          // Client navigation would be handled by a client component in real app
        }}
        className="text-sm border border-sand bg-white px-3 py-2 focus:outline-none focus:border-charcoal"
      >
        <option value="newest">Newest</option>
        <option value="price_asc">Price: Low to High</option>
        <option value="price_desc">Price: High to Low</option>
        <option value="popular">Most Popular</option>
      </select>
      <button type="submit" className="btn-ghost text-xs">Apply</button>
    </form>
  );
}

function PaginationLink({
  page,
  currentPage,
  searchParams,
}: {
  page: number;
  currentPage: number;
  searchParams: Record<string, string | undefined>;
}) {
  const params = new URLSearchParams(
    Object.fromEntries(
      Object.entries({ ...searchParams, page: String(page) }).filter(
        ([, v]) => v !== undefined
      ) as [string, string][]
    )
  );

  return (
    <a
      href={`/shop?${params.toString()}`}
      className={`w-9 h-9 flex items-center justify-center text-sm border transition-colors ${
        page === currentPage
          ? "bg-charcoal text-cream border-charcoal"
          : "border-sand hover:border-charcoal"
      }`}
    >
      {page}
    </a>
  );
}
