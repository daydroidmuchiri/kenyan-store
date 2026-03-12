// src/app/cart/page.tsx
"use client";

import Link from "next/link";
import Image from "next/image";
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight } from "lucide-react";
import { useCart } from "@/hooks/use-cart";
import { formatPrice } from "@/lib/utils";

export default function CartPage() {
  const { items, removeItem, updateQuantity, getTotalPrice, getTotalItems } = useCart();
  const subtotal = getTotalPrice();
  const freeDeliveryThreshold = 5000;
  const remainingForFreeDelivery = Math.max(0, freeDeliveryThreshold - subtotal);

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <ShoppingBag size={60} className="text-sand mx-auto mb-6" />
        <h1 className="font-display text-4xl font-light mb-3">Your cart is empty</h1>
        <p className="text-muted mb-8">
          Looks like you haven&apos;t added anything yet.
        </p>
        <Link href="/shop" className="btn-primary">
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
      <h1 className="font-display text-4xl font-light mb-2">
        Shopping Cart
      </h1>
      <p className="text-muted text-sm mb-8">
        {getTotalItems()} {getTotalItems() === 1 ? "item" : "items"}
      </p>

      {/* Free delivery progress */}
      {remainingForFreeDelivery > 0 && (
        <div className="bg-brand-50 border border-brand-100 px-4 py-3 mb-6">
          <p className="text-sm text-charcoal">
            Add{" "}
            <span className="font-semibold text-brand-600">
              {formatPrice(remainingForFreeDelivery)}
            </span>{" "}
            more to get <strong>free Nairobi delivery!</strong>
          </p>
          <div className="mt-2 h-1.5 bg-sand rounded-full overflow-hidden">
            <div
              className="h-full bg-brand-500 rounded-full transition-all duration-500"
              style={{ width: `${Math.min((subtotal / freeDeliveryThreshold) * 100, 100)}%` }}
            />
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-10">
        {/* Cart Items */}
        <div className="lg:col-span-2">
          <div className="bg-white border border-sand">
            {/* Header */}
            <div className="hidden sm:grid grid-cols-5 gap-4 px-5 py-3 border-b border-sand">
              <p className="col-span-2 text-xs uppercase tracking-wider text-muted">Product</p>
              <p className="text-xs uppercase tracking-wider text-muted text-center">Price</p>
              <p className="text-xs uppercase tracking-wider text-muted text-center">Quantity</p>
              <p className="text-xs uppercase tracking-wider text-muted text-right">Total</p>
            </div>

            {/* Items */}
            <ul className="divide-y divide-sand">
              {items.map((item) => (
                <li key={item.variantId} className="px-5 py-5">
                  <div className="flex gap-4">
                    {/* Image */}
                    <Link href={`/product/${item.slug}`} className="shrink-0">
                      <div className="w-20 h-24 sm:w-24 sm:h-28 bg-sand relative overflow-hidden">
                        {item.image ? (
                          <Image
                            src={item.image}
                            alt={item.name}
                            fill
                            className="object-cover"
                            sizes="96px"
                          />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <ShoppingBag size={24} className="text-muted/40" />
                          </div>
                        )}
                      </div>
                    </Link>

                    {/* Details */}
                    <div className="flex-1 grid sm:grid-cols-4 gap-2 sm:gap-4 items-start">
                      {/* Name + size */}
                      <div className="sm:col-span-2">
                        <Link
                          href={`/product/${item.slug}`}
                          className="font-medium text-sm hover:text-brand-600 transition-colors leading-snug"
                        >
                          {item.name}
                        </Link>
                        <p className="text-xs text-muted mt-1">
                          Size: {item.size}
                          {item.color && ` · ${item.color}`}
                        </p>
                        {/* Mobile price */}
                        <p className="sm:hidden text-sm font-semibold mt-2">
                          {formatPrice(item.price)}
                        </p>
                      </div>

                      {/* Price */}
                      <p className="hidden sm:block text-sm font-medium text-center">
                        {formatPrice(item.price)}
                      </p>

                      {/* Quantity */}
                      <div className="flex items-center gap-2 sm:justify-center">
                        <div className="flex items-center border border-sand">
                          <button
                            onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                            className="w-8 h-8 flex items-center justify-center hover:bg-sand transition-colors"
                            aria-label="Decrease"
                          >
                            <Minus size={12} />
                          </button>
                          <span className="w-8 text-center text-sm">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                            disabled={item.quantity >= item.stock}
                            className="w-8 h-8 flex items-center justify-center hover:bg-sand transition-colors disabled:opacity-40"
                            aria-label="Increase"
                          >
                            <Plus size={12} />
                          </button>
                        </div>
                        <button
                          onClick={() => removeItem(item.variantId)}
                          className="text-muted hover:text-red-500 transition-colors p-1"
                          aria-label="Remove"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>

                      {/* Line total */}
                      <p className="hidden sm:block text-sm font-semibold text-right">
                        {formatPrice(item.price * item.quantity)}
                      </p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex items-center justify-between mt-5">
            <Link href="/shop" className="btn-ghost gap-1 text-sm">
              ← Continue Shopping
            </Link>
          </div>
        </div>

        {/* Order Summary */}
        <aside>
          <div className="bg-white border border-sand p-5 sticky top-24">
            <h2 className="font-display text-xl font-medium mb-5">
              Order Summary
            </h2>

            <div className="space-y-3 text-sm border-b border-sand pb-4 mb-4">
              <div className="flex justify-between">
                <span className="text-muted">
                  Subtotal ({getTotalItems()} items)
                </span>
                <span className="font-medium">{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Delivery</span>
                <span className="text-muted text-xs">Calculated at checkout</span>
              </div>
            </div>

            <div className="flex justify-between font-semibold text-base mb-6">
              <span>Subtotal</span>
              <span>{formatPrice(subtotal)}</span>
            </div>

            <Link href="/checkout" className="btn-primary w-full text-center mb-3 py-4">
              Proceed to Checkout
              <ArrowRight size={18} />
            </Link>

            {/* Payment options */}
            <div className="flex flex-wrap gap-2 justify-center mt-4">
              <span className="text-xs font-bold text-green-700 bg-green-50 px-2 py-1 border border-green-200">
                M-PESA
              </span>
              <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2 py-1 border border-blue-200">
                VISA
              </span>
              <span className="text-xs font-bold text-purple-700 bg-purple-50 px-2 py-1 border border-purple-200">
                MASTERCARD
              </span>
              <span className="text-xs text-muted px-2 py-1 border border-sand">
                Cash on Delivery
              </span>
            </div>

            <p className="text-xs text-center text-muted mt-3">
              🔒 Secure checkout · Encrypted payments
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
