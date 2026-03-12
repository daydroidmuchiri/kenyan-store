// src/components/product/ProductCard.tsx
"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart, ShoppingBag, Star } from "lucide-react";
import { useWishlist } from "@/hooks/use-cart";
import { formatPrice, calculateAverageRating, getDiscountPercent } from "@/lib/utils";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    slug: string;
    price: number | string;
    comparePrice?: number | string | null;
    images: { url: string; alt?: string | null }[];
    variants: { size: string; stock: number }[];
    reviews: { rating: number }[];
    category: { name: string; slug: string };
    isFeatured?: boolean;
  };
  priority?: boolean;
}

export function ProductCard({ product, priority = false }: ProductCardProps) {
  const { toggle, hasItem } = useWishlist();
  const isWishlisted = hasItem(product.id);

  const price = typeof product.price === "string" ? parseFloat(product.price) : product.price;
  const comparePrice = product.comparePrice
    ? typeof product.comparePrice === "string"
      ? parseFloat(product.comparePrice)
      : product.comparePrice
    : null;

  const discount = comparePrice ? getDiscountPercent(price, comparePrice) : 0;
  const avgRating = calculateAverageRating(product.reviews);
  const isAvailable = product.variants.some((v) => v.stock > 0);

  const primaryImage = product.images[0];
  const secondaryImage = product.images[1];

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggle(product.id);
    toast(isWishlisted ? "Removed from wishlist" : "Added to wishlist", {
      icon: isWishlisted ? "💔" : "❤️",
    });
  };

  return (
    <article className="product-card group">
      <Link href={`/product/${product.slug}`} className="block">
        {/* Image container */}
        <div className="relative aspect-[3/4] overflow-hidden bg-sand">
          {primaryImage ? (
            <Image
              src={primaryImage.url}
              alt={primaryImage.alt || product.name}
              fill
              className="object-cover product-image-zoom"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              priority={priority}
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-sand">
              <ShoppingBag size={40} className="text-muted opacity-30" />
            </div>
          )}

          {/* Hover second image */}
          {secondaryImage && (
            <Image
              src={secondaryImage.url}
              alt={`${product.name} alternate`}
              fill
              className="object-cover absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            />
          )}

          {/* Badges */}
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {discount > 0 && (
              <span className="badge bg-red-500 text-white">
                -{discount}%
              </span>
            )}
            {!isAvailable && (
              <span className="badge bg-charcoal/80 text-cream">
                Sold Out
              </span>
            )}
            {product.isFeatured && (
              <span className="badge bg-brand-600 text-white">
                Featured
              </span>
            )}
          </div>

          {/* Wishlist button */}
          <button
            onClick={handleWishlist}
            aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
            className="absolute top-2 right-2 w-8 h-8 flex items-center justify-center bg-white/90 hover:bg-white transition-colors opacity-0 group-hover:opacity-100"
          >
            <Heart
              size={16}
              className={cn(
                "transition-colors",
                isWishlisted ? "fill-red-500 text-red-500" : "text-charcoal"
              )}
            />
          </button>
        </div>

        {/* Product info */}
        <div className="p-3">
          <p className="text-xs text-muted uppercase tracking-wider mb-1">
            {product.category.name}
          </p>
          <h3 className="font-body font-medium text-sm text-charcoal leading-snug line-clamp-2 group-hover:text-brand-600 transition-colors">
            {product.name}
          </h3>

          {/* Rating */}
          {product.reviews.length > 0 && (
            <div className="flex items-center gap-1 mt-1.5">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    size={11}
                    className={
                      star <= Math.round(avgRating)
                        ? "fill-amber-400 text-amber-400"
                        : "fill-gray-200 text-gray-200"
                    }
                  />
                ))}
              </div>
              <span className="text-xs text-muted">
                ({product.reviews.length})
              </span>
            </div>
          )}

          {/* Price */}
          <div className="flex items-center gap-2 mt-2">
            <span className="font-body font-semibold text-sm text-charcoal">
              {formatPrice(price)}
            </span>
            {comparePrice && comparePrice > price && (
              <span className="text-xs text-muted line-through">
                {formatPrice(comparePrice)}
              </span>
            )}
          </div>

          {/* Size availability dots */}
          <div className="flex gap-1 mt-2">
            {product.variants.slice(0, 5).map((v) => (
              <div
                key={v.size}
                className={cn(
                  "w-5 h-5 flex items-center justify-center text-[9px] border",
                  v.stock > 0
                    ? "border-sand text-charcoal"
                    : "border-sand/50 text-muted/50 line-through"
                )}
                title={`${v.size}${v.stock === 0 ? " (Out of stock)" : ""}`}
              >
                {v.size}
              </div>
            ))}
            {product.variants.length > 5 && (
              <span className="text-xs text-muted self-center">
                +{product.variants.length - 5}
              </span>
            )}
          </div>
        </div>
      </Link>
    </article>
  );
}

// Skeleton loader
export function ProductCardSkeleton() {
  return (
    <div className="bg-white">
      <div className="aspect-[3/4] bg-sand animate-pulse" />
      <div className="p-3 space-y-2">
        <div className="h-3 bg-sand animate-pulse w-1/3" />
        <div className="h-4 bg-sand animate-pulse w-4/5" />
        <div className="h-4 bg-sand animate-pulse w-2/3" />
        <div className="h-4 bg-sand animate-pulse w-1/4 mt-2" />
      </div>
    </div>
  );
}
