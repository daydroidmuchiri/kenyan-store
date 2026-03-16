// src/hooks/use-cart.ts
// Zustand cart store with localStorage persistence

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { LocalCartItem } from "@/types";

interface CartStore {
  items: LocalCartItem[];
  isOpen: boolean;

  // Actions
  addItem: (item: Omit<LocalCartItem, "quantity"> & { quantity?: number }) => void;
  removeItem: (variantId: string) => void;
  updateQuantity: (variantId: string, quantity: number) => void;
  clearCart: () => void;
  toggleCart: () => void;
  openCart: () => void;
  closeCart: () => void;

  // Computed
  getTotalItems: () => number;
  getTotalPrice: () => number;
}

export const useCart = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      addItem: (item) => {
        const items = get().items;
        const existing = items.find((i) => i.variantId === item.variantId);

        if (existing) {
          // Update quantity, respect stock limit
          const newQty = Math.min(
            existing.quantity + (item.quantity ?? 1),
            item.stock
          );
          set({
            items: items.map((i) =>
              i.variantId === item.variantId ? { ...i, quantity: newQty } : i
            ),
          });
        } else {
          set({
            items: [...items, { ...item, quantity: item.quantity ?? 1 }],
          });
        }
      },

      removeItem: (variantId) => {
        set({ items: get().items.filter((i) => i.variantId !== variantId) });
      },

      updateQuantity: (variantId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(variantId);
          return;
        }
        set({
          items: get().items.map((i) =>
            i.variantId === variantId
              ? { ...i, quantity: Math.min(quantity, i.stock) }
              : i
          ),
        });
      },

      clearCart: () => set({ items: [] }),

      toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),

      getTotalItems: () =>
        get().items.reduce((sum, item) => sum + item.quantity, 0),

      getTotalPrice: () =>
        get().items.reduce(
          (sum, item) => sum + item.price * item.quantity,
          0
        ),
    }),
    {
      name: "kfs-cart",
      // Only persist items, not UI state
      partialize: (state) => ({ items: state.items }),
    }
  )
);

// ─── WISHLIST STORE ───────────────────────────────────────────────────────────

interface WishlistStore {
  items: string[]; // productIds
  addItem: (productId: string) => void;
  removeItem: (productId: string) => void;
  hasItem: (productId: string) => boolean;
  toggle: (productId: string) => void;
  setItems: (productIds: string[]) => void;
}

export const useWishlist = create<WishlistStore>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (productId) => {
        if (!get().items.includes(productId)) {
          // Optimistic update
          set({ items: [...get().items, productId] });
          // Background sync
          fetch("/api/wishlist", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ productId }),
          }).catch(console.error);
        }
      },

      removeItem: (productId) => {
        // Optimistic update
        set({ items: get().items.filter((id) => id !== productId) });
        // Background sync
        fetch("/api/wishlist", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ productId }),
        }).catch(console.error);
      },

      hasItem: (productId) => get().items.includes(productId),

      toggle: (productId) => {
        if (get().hasItem(productId)) {
          get().removeItem(productId);
        } else {
          get().addItem(productId);
        }
      },

      setItems: (productIds) => set({ items: productIds }),
    }),
    { name: "kfs-wishlist" }
  )
);
