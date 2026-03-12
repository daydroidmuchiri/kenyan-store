"use client";
// src/components/product/SortSelectClient.tsx

import { useRouter } from "next/navigation";

interface SortSelectClientProps {
  currentSort?: string;
  searchParams: Record<string, string | undefined>;
}

export function SortSelectClient({ currentSort, searchParams }: SortSelectClientProps) {
  const router = useRouter();

  const handleSortChange = (newSort: string) => {
    const params = new URLSearchParams();
    
    // Add all existing params except sort and page
    Object.entries(searchParams).forEach(([key, value]) => {
      if (value !== undefined && key !== "sort" && key !== "page") {
        params.set(key, value);
      }
    });

    if (newSort !== "newest") {
      params.set("sort", newSort);
    }
    
    router.push(`/shop?${params.toString()}`);
  };

  return (
    <div className="flex items-center gap-2">
      <label className="text-xs text-muted uppercase tracking-wider">Sort:</label>
      <select
        defaultValue={currentSort || "newest"}
        onChange={(e) => handleSortChange(e.target.value)}
        className="text-sm border border-sand bg-white px-3 py-2 focus:outline-none focus:border-brand-600 transition-colors cursor-pointer"
      >
        <option value="newest">Newest Arrived</option>
        <option value="price_asc">Price: Low to High</option>
        <option value="price_desc">Price: High to Low</option>
        <option value="popular">Most Popular</option>
      </select>
    </div>
  );
}
