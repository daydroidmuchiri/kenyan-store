// src/components/product/ProductFilters.tsx
"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { ChevronDown, ChevronUp, X } from "lucide-react";
import { CLOTHING_SIZES, formatPrice } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface ProductFiltersProps {
  categories: Category[];
  searchParams: Record<string, string | undefined>;
}

export function ProductFilters({ categories, searchParams }: ProductFiltersProps) {
  const router = useRouter();
  const [openSections, setOpenSections] = useState({
    category: true,
    price: true,
    size: true,
  });

  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const updateFilter = (key: string, value: string | undefined) => {
    const params = new URLSearchParams(
      Object.fromEntries(
        Object.entries(searchParams).filter(
          ([, v]) => v !== undefined
        ) as [string, string][]
      )
    );

    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.delete("page"); // Reset to page 1

    router.push(`/shop?${params.toString()}`);
  };

  const toggleSize = (size: string) => {
    const currentSizes = searchParams.sizes
      ? searchParams.sizes.split(",")
      : [];
    const newSizes = currentSizes.includes(size)
      ? currentSizes.filter((s) => s !== size)
      : [...currentSizes, size];

    updateFilter("sizes", newSizes.length > 0 ? newSizes.join(",") : undefined);
  };

  const selectedSizes = searchParams.sizes ? searchParams.sizes.split(",") : [];

  const hasFilters =
    searchParams.category ||
    searchParams.sizes ||
    searchParams.minPrice ||
    searchParams.maxPrice;

  return (
    <div className="space-y-6">
      {/* Clear filters */}
      {hasFilters && (
        <button
          onClick={() => router.push("/shop")}
          className="flex items-center gap-1.5 text-sm text-brand-600 font-medium"
        >
          <X size={14} />
          Clear all filters
        </button>
      )}

      {/* Category Filter */}
      <FilterSection
        title="Category"
        isOpen={openSections.category}
        onToggle={() => toggleSection("category")}
      >
        <ul className="space-y-1">
          <li>
            <button
              onClick={() => updateFilter("category", undefined)}
              className={cn(
                "text-sm w-full text-left py-1.5 px-2 transition-colors",
                !searchParams.category
                  ? "font-medium text-brand-600 bg-brand-50"
                  : "text-charcoal hover:text-brand-600"
              )}
            >
              All Categories
            </button>
          </li>
          {categories.map((cat) => (
            <li key={cat.id}>
              <button
                onClick={() => updateFilter("category", cat.slug)}
                className={cn(
                  "text-sm w-full text-left py-1.5 px-2 transition-colors",
                  searchParams.category === cat.slug
                    ? "font-medium text-brand-600 bg-brand-50"
                    : "text-charcoal hover:text-brand-600"
                )}
              >
                {cat.name}
              </button>
            </li>
          ))}
        </ul>
      </FilterSection>

      {/* Price Range Filter */}
      <FilterSection
        title="Price Range"
        isOpen={openSections.price}
        onToggle={() => toggleSection("price")}
      >
        <div className="space-y-2">
          {[
            { label: "Under KES 1,500", min: undefined, max: "1500" },
            { label: "KES 1,500 – 3,000", min: "1500", max: "3000" },
            { label: "KES 3,000 – 6,000", min: "3000", max: "6000" },
            { label: "KES 6,000+", min: "6000", max: undefined },
          ].map((range) => {
            const isActive =
              searchParams.minPrice === range.min &&
              searchParams.maxPrice === range.max;
            return (
              <button
                key={range.label}
                onClick={() => {
                  if (isActive) {
                    updateFilter("minPrice", undefined);
                    updateFilter("maxPrice", undefined);
                  } else {
                    const params = new URLSearchParams(
                      Object.fromEntries(
                        Object.entries(searchParams).filter(
                          ([, v]) => v !== undefined
                        ) as [string, string][]
                      )
                    );
                    if (range.min) params.set("minPrice", range.min);
                    else params.delete("minPrice");
                    if (range.max) params.set("maxPrice", range.max);
                    else params.delete("maxPrice");
                    params.delete("page");
                    router.push(`/shop?${params.toString()}`);
                  }
                }}
                className={cn(
                  "text-sm w-full text-left py-1.5 px-2 transition-colors",
                  isActive
                    ? "font-medium text-brand-600 bg-brand-50"
                    : "text-charcoal hover:text-brand-600"
                )}
              >
                {range.label}
              </button>
            );
          })}
        </div>
      </FilterSection>

      {/* Size Filter */}
      <FilterSection
        title="Size"
        isOpen={openSections.size}
        onToggle={() => toggleSection("size")}
      >
        <div className="flex flex-wrap gap-2">
          {CLOTHING_SIZES.map((size) => (
            <button
              key={size}
              onClick={() => toggleSize(size)}
              className={cn(
                "size-option",
                selectedSizes.includes(size) && "selected"
              )}
            >
              {size}
            </button>
          ))}
        </div>
      </FilterSection>
    </div>
  );
}

function FilterSection({
  title,
  isOpen,
  onToggle,
  children,
}: {
  title: string;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="border-b border-sand pb-5">
      <button
        onClick={onToggle}
        className="flex items-center justify-between w-full mb-3"
      >
        <span className="text-xs font-medium uppercase tracking-widest text-charcoal">
          {title}
        </span>
        {isOpen ? (
          <ChevronUp size={14} className="text-muted" />
        ) : (
          <ChevronDown size={14} className="text-muted" />
        )}
      </button>
      {isOpen && children}
    </div>
  );
}
