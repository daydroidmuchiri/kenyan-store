"use client";

import { useEffect, useState } from "react";
import { ProductCard } from "@/components/product/ProductCard";
import { useWishlist } from "@/hooks/use-cart";
import { Heart } from "lucide-react";
import Link from "next/link";
import { Product } from "@prisma/client";

// Extended product type with relation inclusion
type WishlistProduct = Product & {
  category: { id: string; name: string; slug: string };
  images: { id: string; url: string; alt: string | null; position: number }[];
  variants: any[];
  reviews: any[];
};

export function WishlistClient({ initialProducts }: { initialProducts: WishlistProduct[] }) {
  const { items: wishlistIds, setItems } = useWishlist();
  const [mounted, setMounted] = useState(false);

  // Sync initial server data into Zustand store on mount
  useEffect(() => {
    setMounted(true);
    // When the component mounts, ensure Zustand reflects the true server state
    setItems(initialProducts.map(p => p.id));
  }, [initialProducts, setItems]);

  if (!mounted) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="w-8 h-8 border-2 border-brand-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Filter products to only show what is CURRENTLY in the Zustand store
  // (so if they click the heart to remove it, it instantly disappears from the UI without a refresh)
  const currentWishlistProducts = initialProducts.filter(p => wishlistIds.includes(p.id));

  if (currentWishlistProducts.length === 0) {
    return (
      <>
        <div className="mb-8">
          <h1 className="font-display text-3xl font-light mb-2">My Wishlist</h1>
          <p className="text-muted">0 items saved</p>
        </div>
        <div className="bg-white border border-sand p-10 text-center">
          <Heart size={48} className="mx-auto text-sand mb-4" />
          <h1 className="font-display text-2xl font-light mb-2">
            Your Wishlist is empty
          </h1>
          <p className="text-muted mb-6">
            Save items you love so you don&apos;t lose sight of them.
          </p>
          <Link href="/shop" className="btn-primary">
            Continue Shopping
          </Link>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="mb-8">
        <h1 className="font-display text-3xl font-light mb-2">My Wishlist</h1>
        <p className="text-muted">
          {currentWishlistProducts.length} {currentWishlistProducts.length === 1 ? "item" : "items"} saved
        </p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {currentWishlistProducts.map((product) => (
          <ProductCard 
            key={product.id} 
            product={{
              ...product,
              price: Number(product.price),
              comparePrice: product.comparePrice ? Number(product.comparePrice) : null,
            }} 
          />
        ))}
      </div>
    </>
  );
}
