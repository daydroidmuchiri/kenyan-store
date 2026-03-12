// src/components/product/ProductDetail.tsx
"use client";

import { useState } from "react";
import Image from "next/image";
import { Heart, ShoppingBag, Star, ChevronDown, Check, Truck, RefreshCw, Shield } from "lucide-react";
import toast from "react-hot-toast";
import { useCart, useWishlist } from "@/hooks/use-cart";
import { formatPrice, calculateAverageRating, getDiscountPercent } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface ProductDetailProps {
  product: {
    id: string;
    name: string;
    slug: string;
    description: string;
    price: number;
    comparePrice: number | null;
    brand: string | null;
    material: string | null;
    careInstructions: string | null;
    category: { name: string; slug: string };
    images: { id: string; url: string; alt: string | null }[];
    variants: { id: string; size: string; color: string | null; stock: number }[];
    reviews: {
      id: string;
      rating: number;
      title: string | null;
      body: string | null;
      isVerified: boolean;
      createdAt: Date;
      user: { name: string | null; image: string | null };
    }[];
  };
}

export function ProductDetail({ product }: ProductDetailProps) {
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  const { addItem, openCart } = useCart();
  const { toggle, hasItem } = useWishlist();
  const isWishlisted = hasItem(product.id);

  const avgRating = calculateAverageRating(product.reviews);
  const discount = product.comparePrice
    ? getDiscountPercent(product.price, product.comparePrice)
    : 0;

  // Get unique sizes
  const sizes = Array.from(new Set(product.variants.map((v) => v.size)));

  // Get selected variant object
  const activeVariant = product.variants.find((v) => v.id === selectedVariant);
  const isInStock = activeVariant ? activeVariant.stock > 0 : false;

  // Get variant for a given size
  const getVariantBySize = (size: string) =>
    product.variants.find((v) => v.size === size);

  const handleAddToCart = () => {
    if (!selectedVariant) {
      toast.error("Please select a size");
      return;
    }
    if (!activeVariant || activeVariant.stock === 0) {
      toast.error("This size is out of stock");
      return;
    }

    const image = product.images[0];
    addItem({
      id: selectedVariant,
      productId: product.id,
      variantId: selectedVariant,
      name: product.name,
      slug: product.slug,
      price: product.price,
      image: image?.url || "",
      size: activeVariant.size,
      color: activeVariant.color || undefined,
      stock: activeVariant.stock,
      quantity,
    });

    toast.success(`${product.name} added to cart!`);
    openCart();
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
      {/* ── IMAGES ─────────────────────────────────────────────────────────── */}
      <div className="space-y-3">
        {/* Main Image */}
        <div className="relative aspect-[4/5] bg-sand overflow-hidden">
          {product.images[selectedImage] ? (
            <Image
              src={product.images[selectedImage].url}
              alt={product.images[selectedImage].alt || product.name}
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
              priority
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <ShoppingBag size={60} className="text-muted/30" />
            </div>
          )}

          {discount > 0 && (
            <div className="absolute top-4 left-4">
              <span className="badge bg-red-500 text-white text-sm px-3 py-1">
                -{discount}% OFF
              </span>
            </div>
          )}
        </div>

        {/* Thumbnail strip */}
        {product.images.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-1">
            {product.images.map((img, i) => (
              <button
                key={img.id}
                onClick={() => setSelectedImage(i)}
                className={cn(
                  "relative w-16 h-20 shrink-0 bg-sand overflow-hidden border-2 transition-all",
                  i === selectedImage
                    ? "border-charcoal"
                    : "border-transparent hover:border-sand-300"
                )}
                aria-label={`View image ${i + 1}`}
              >
                <Image
                  src={img.url}
                  alt={img.alt || `${product.name} ${i + 1}`}
                  fill
                  className="object-cover"
                  sizes="64px"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── PRODUCT INFO ───────────────────────────────────────────────────── */}
      <div className="space-y-5">
        {/* Category + Name */}
        <div>
          <p className="text-xs uppercase tracking-widest text-brand-600 mb-2">
            {product.category.name}
          </p>
          <h1 className="font-display text-3xl sm:text-4xl font-light text-charcoal leading-tight">
            {product.name}
          </h1>
          {product.brand && (
            <p className="text-muted text-sm mt-1">by {product.brand}</p>
          )}
        </div>

        {/* Rating */}
        {product.reviews.length > 0 && (
          <div className="flex items-center gap-2">
            <div className="flex">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  size={14}
                  className={
                    star <= Math.round(avgRating)
                      ? "fill-amber-400 text-amber-400"
                      : "fill-gray-200 text-gray-200"
                  }
                />
              ))}
            </div>
            <span className="text-sm text-muted">
              {avgRating} ({product.reviews.length} reviews)
            </span>
          </div>
        )}

        {/* Price */}
        <div className="flex items-baseline gap-3">
          <span className="font-display text-3xl font-medium text-charcoal">
            {formatPrice(product.price)}
          </span>
          {product.comparePrice && product.comparePrice > product.price && (
            <span className="text-muted text-lg line-through">
              {formatPrice(product.comparePrice)}
            </span>
          )}
          {discount > 0 && (
            <span className="text-sm font-medium text-red-500">
              Save {discount}%
            </span>
          )}
        </div>

        {/* Size selector */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <span className="label">Select Size</span>
            <button className="text-xs text-brand-600 underline">
              Size Guide
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {sizes.map((size) => {
              const variant = getVariantBySize(size);
              const isOutOfStock = !variant || variant.stock === 0;
              return (
                <button
                  key={size}
                  onClick={() => !isOutOfStock && setSelectedVariant(variant?.id || null)}
                  disabled={isOutOfStock}
                  className={cn(
                    "size-option w-12 h-12 text-sm",
                    selectedVariant === variant?.id && "selected",
                    isOutOfStock && "out-of-stock"
                  )}
                  title={isOutOfStock ? "Out of stock" : size}
                >
                  {size}
                </button>
              );
            })}
          </div>
          {selectedVariant && activeVariant && (
            <p className="text-xs text-muted mt-2">
              {activeVariant.stock} left in stock
              {activeVariant.stock <= 3 && (
                <span className="text-red-500 ml-1 font-medium">· Low stock!</span>
              )}
            </p>
          )}
        </div>

        {/* Quantity */}
        <div>
          <label className="label">Quantity</label>
          <div className="flex items-center border border-sand w-fit">
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="w-10 h-10 flex items-center justify-center hover:bg-sand transition-colors"
              aria-label="Decrease"
            >
              −
            </button>
            <span className="w-12 text-center text-sm font-medium">{quantity}</span>
            <button
              onClick={() =>
                setQuantity(
                  Math.min(quantity + 1, activeVariant?.stock || 10)
                )
              }
              className="w-10 h-10 flex items-center justify-center hover:bg-sand transition-colors"
              aria-label="Increase"
            >
              +
            </button>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={handleAddToCart}
            disabled={!!selectedVariant && !isInStock}
            className="btn-primary flex-1 py-4 text-base"
          >
            <ShoppingBag size={20} />
            {!selectedVariant
              ? "Select a Size"
              : !isInStock
              ? "Out of Stock"
              : "Add to Cart"}
          </button>
          <button
            onClick={() => toggle(product.id)}
            aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
            className="w-14 h-14 flex items-center justify-center border border-sand hover:border-charcoal transition-colors"
          >
            <Heart
              size={20}
              className={cn(
                isWishlisted ? "fill-red-500 text-red-500" : "text-charcoal"
              )}
            />
          </button>
        </div>

        {/* Delivery info */}
        <div className="space-y-2 p-4 bg-white border border-sand">
          {[
            {
              icon: Truck,
              text: "Free delivery on orders over KES 5,000",
            },
            {
              icon: RefreshCw,
              text: "Free returns within 30 days",
            },
            {
              icon: Shield,
              text: "Secure payment · M-Pesa, Card, COD",
            },
          ].map(({ icon: Icon, text }) => (
            <div key={text} className="flex items-center gap-2.5">
              <Icon size={15} className="text-brand-600 shrink-0" />
              <span className="text-xs text-muted">{text}</span>
            </div>
          ))}
        </div>

        {/* Accordion sections */}
        {[
          {
            id: "description",
            title: "Description",
            content: product.description,
          },
          ...(product.material
            ? [
                {
                  id: "material",
                  title: "Material & Care",
                  content: `Material: ${product.material}${
                    product.careInstructions
                      ? `\n\nCare: ${product.careInstructions}`
                      : ""
                  }`,
                },
              ]
            : []),
          {
            id: "delivery",
            title: "Delivery & Returns",
            content:
              "Nairobi delivery: 1-2 business days (KES 200)\nOutside Nairobi: 3-5 business days (KES 400)\nPickup: Same day from Westlands (Free)\n\n30-day free returns on unworn items with tags attached.",
          },
        ].map((section) => (
          <div key={section.id} className="border-t border-sand">
            <button
              onClick={() =>
                setExpandedSection(
                  expandedSection === section.id ? null : section.id
                )
              }
              className="flex items-center justify-between w-full py-4"
            >
              <span className="font-medium text-sm">{section.title}</span>
              <ChevronDown
                size={16}
                className={cn(
                  "text-muted transition-transform",
                  expandedSection === section.id && "rotate-180"
                )}
              />
            </button>
            {expandedSection === section.id && (
              <div className="pb-4 text-sm text-muted leading-relaxed whitespace-pre-line animate-in">
                {section.content}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* ── REVIEWS ────────────────────────────────────────────────────────── */}
      {product.reviews.length > 0 && (
        <div className="lg:col-span-2 mt-8">
          <div className="divider" />
          <h2 className="font-display text-2xl font-light mb-6">
            Customer Reviews ({product.reviews.length})
          </h2>

          {/* Rating summary */}
          <div className="flex items-center gap-6 mb-8 p-6 bg-white border border-sand">
            <div className="text-center">
              <p className="font-display text-5xl font-light">{avgRating}</p>
              <div className="flex justify-center mt-1">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={s}
                    size={16}
                    className={
                      s <= Math.round(avgRating)
                        ? "fill-amber-400 text-amber-400"
                        : "fill-gray-200 text-gray-200"
                    }
                  />
                ))}
              </div>
              <p className="text-xs text-muted mt-1">
                {product.reviews.length} reviews
              </p>
            </div>

            <div className="flex-1 space-y-1.5">
              {[5, 4, 3, 2, 1].map((star) => {
                const count = product.reviews.filter(
                  (r) => r.rating === star
                ).length;
                const pct = (count / product.reviews.length) * 100;
                return (
                  <div key={star} className="flex items-center gap-2">
                    <span className="text-xs text-muted w-4">{star}</span>
                    <Star size={11} className="fill-amber-400 text-amber-400" />
                    <div className="flex-1 h-1.5 bg-sand rounded-full overflow-hidden">
                      <div
                        className="h-full bg-amber-400 rounded-full"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="text-xs text-muted w-6">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="space-y-6">
            {product.reviews.map((review) => (
              <div
                key={review.id}
                className="pb-6 border-b border-sand last:border-0"
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-sm">
                        {review.user.name || "Anonymous"}
                      </p>
                      {review.isVerified && (
                        <span className="flex items-center gap-1 text-xs text-green-600 bg-green-50 px-1.5 py-0.5">
                          <Check size={10} />
                          Verified
                        </span>
                      )}
                    </div>
                    <div className="flex mt-1">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          size={12}
                          className={
                            s <= review.rating
                              ? "fill-amber-400 text-amber-400"
                              : "fill-gray-200 text-gray-200"
                          }
                        />
                      ))}
                    </div>
                  </div>
                  <span className="text-xs text-muted">
                    {new Date(review.createdAt).toLocaleDateString("en-KE", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                </div>
                {review.title && (
                  <p className="font-medium text-sm mb-1">{review.title}</p>
                )}
                {review.body && (
                  <p className="text-sm text-muted leading-relaxed">
                    {review.body}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
