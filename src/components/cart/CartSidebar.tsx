// src/components/cart/CartSidebar.tsx
"use client";

import { useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { X, Plus, Minus, ShoppingBag, Trash2 } from "lucide-react";
import { useCart } from "@/hooks/use-cart";
import { formatPrice } from "@/lib/utils";
import { cn } from "@/lib/utils";

export function CartSidebar() {
  const { items, isOpen, closeCart, removeItem, updateQuantity, getTotalPrice } =
    useCart();

  const total = getTotalPrice();

  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-50 transition-opacity"
          onClick={closeCart}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 right-0 h-full w-full max-w-sm bg-cream z-50 flex flex-col shadow-2xl transition-transform duration-300",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
        aria-label="Shopping cart"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-sand">
          <h2 className="font-display text-xl font-medium">
            Your Cart
            {items.length > 0 && (
              <span className="ml-2 text-muted text-base font-normal">
                ({items.length})
              </span>
            )}
          </h2>
          <button
            onClick={closeCart}
            className="p-2 hover:text-brand-600 transition-colors"
            aria-label="Close cart"
          >
            <X size={20} />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center gap-4">
              <ShoppingBag size={48} className="text-sand" />
              <div>
                <p className="font-display text-xl text-charcoal">
                  Your cart is empty
                </p>
                <p className="text-sm text-muted mt-1">
                  Add some beautiful pieces to get started
                </p>
              </div>
              <button onClick={closeCart} className="btn-primary mt-4">
                Continue Shopping
              </button>
            </div>
          ) : (
            <ul className="space-y-4">
              {items.map((item) => (
                <li
                  key={item.variantId}
                  className="flex gap-3 pb-4 border-b border-sand last:border-0"
                >
                  {/* Image */}
                  <Link
                    href={`/product/${item.slug}`}
                    onClick={closeCart}
                    className="shrink-0"
                  >
                    <div className="w-20 h-24 bg-sand relative overflow-hidden">
                      {item.image ? (
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          className="object-cover"
                          sizes="80px"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <ShoppingBag size={24} className="text-muted/40" />
                        </div>
                      )}
                    </div>
                  </Link>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/product/${item.slug}`}
                      onClick={closeCart}
                      className="font-medium text-sm text-charcoal hover:text-brand-600 transition-colors line-clamp-2 leading-snug"
                    >
                      {item.name}
                    </Link>
                    <p className="text-xs text-muted mt-0.5">
                      Size: {item.size}
                      {item.color && ` · ${item.color}`}
                    </p>
                    <p className="font-semibold text-sm mt-1">
                      {formatPrice(item.price)}
                    </p>

                    {/* Quantity + Remove */}
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center border border-sand">
                        <button
                          onClick={() =>
                            updateQuantity(item.variantId, item.quantity - 1)
                          }
                          className="w-7 h-7 flex items-center justify-center hover:bg-sand transition-colors"
                          aria-label="Decrease quantity"
                        >
                          <Minus size={12} />
                        </button>
                        <span className="w-8 text-center text-sm font-medium">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            updateQuantity(item.variantId, item.quantity + 1)
                          }
                          disabled={item.quantity >= item.stock}
                          className="w-7 h-7 flex items-center justify-center hover:bg-sand transition-colors disabled:opacity-40"
                          aria-label="Increase quantity"
                        >
                          <Plus size={12} />
                        </button>
                      </div>

                      <button
                        onClick={() => removeItem(item.variantId)}
                        className="text-muted hover:text-red-500 transition-colors"
                        aria-label="Remove item"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="px-5 py-5 border-t border-sand bg-white">
            {/* Free delivery note */}
            {total < 5000 && (
              <p className="text-xs text-center text-muted mb-3 bg-brand-50 py-2 px-3">
                Add{" "}
                <span className="font-semibold text-brand-600">
                  {formatPrice(5000 - total)}
                </span>{" "}
                more for free delivery
              </p>
            )}

            <div className="flex items-center justify-between mb-4">
              <span className="font-body text-sm text-muted">Subtotal</span>
              <span className="font-body font-semibold text-charcoal">
                {formatPrice(total)}
              </span>
            </div>
            <p className="text-xs text-muted mb-4 text-center">
              Delivery calculated at checkout
            </p>

            <Link
              href="/checkout"
              onClick={closeCart}
              className="btn-primary w-full text-center mb-2"
            >
              Proceed to Checkout
            </Link>
            <Link
              href="/cart"
              onClick={closeCart}
              className="btn-secondary w-full text-center text-sm"
            >
              View Full Cart
            </Link>

            {/* Payment icons */}
            <div className="flex items-center justify-center gap-3 mt-4">
              <span className="text-xs text-muted">Pay with:</span>
              <span className="text-xs font-bold text-green-700 bg-green-50 px-2 py-0.5 border border-green-200">
                M-PESA
              </span>
              <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 border border-blue-200">
                VISA
              </span>
              <span className="text-xs font-bold text-orange-700 bg-orange-50 px-2 py-0.5 border border-orange-200">
                COD
              </span>
            </div>
          </div>
        )}
      </aside>
    </>
  );
}
