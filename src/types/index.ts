// src/types/index.ts
// Shared TypeScript types for the entire application

import { Prisma } from "@prisma/client";

// ─── PRODUCT TYPES ────────────────────────────────────────────────────────────

export type ProductWithDetails = Prisma.ProductGetPayload<{
  include: {
    category: true;
    images: true;
    variants: true;
    reviews: {
      include: { user: { select: { name: true; image: true } } };
    };
  };
}>;

export type ProductCard = Prisma.ProductGetPayload<{
  include: {
    images: { take: 1 };
    variants: true;
    reviews: { select: { rating: true } };
    category: { select: { name: true; slug: true } };
  };
}>;

// ─── CART TYPES ───────────────────────────────────────────────────────────────

export interface CartItemWithProduct {
  id: string;
  quantity: number;
  product: {
    id: string;
    name: string;
    slug: string;
    price: number;
    images: { url: string; alt: string | null }[];
  };
  variant: {
    id: string;
    size: string;
    color: string | null;
    stock: number;
  };
}

// Client-side cart (Zustand store)
export interface LocalCartItem {
  id: string; // variantId
  productId: string;
  variantId: string;
  name: string;
  slug: string;
  price: number;
  image: string;
  size: string;
  color?: string;
  quantity: number;
  stock: number;
}

// ─── ORDER TYPES ──────────────────────────────────────────────────────────────

export interface CheckoutFormData {
  fullName: string;
  email: string;
  phone: string;
  county: string;
  town: string;
  street?: string;
  deliveryType: "NAIROBI" | "OUTSIDE_NAIROBI" | "PICKUP";
  paymentMethod: "MPESA" | "CARD" | "CASH_ON_DELIVERY";
  mpesaPhone?: string;
  saveAddress?: boolean;
  notes?: string;
}

export interface DeliveryOption {
  type: "NAIROBI" | "OUTSIDE_NAIROBI" | "PICKUP";
  label: string;
  description: string;
  fee: number;
  estimatedDays: string;
}

// ─── MPESA TYPES ──────────────────────────────────────────────────────────────

export interface MpesaSTKPushRequest {
  phone: string;
  amount: number;
  orderId: string;
  orderNumber: string;
}

export interface MpesaSTKPushResponse {
  success: boolean;
  checkoutRequestId?: string;
  merchantRequestId?: string;
  error?: string;
}

export interface MpesaCallbackData {
  MerchantRequestID: string;
  CheckoutRequestID: string;
  ResultCode: number;
  ResultDesc: string;
  CallbackMetadata?: {
    Item: Array<{
      Name: string;
      Value?: string | number;
    }>;
  };
}

// ─── API RESPONSE TYPES ───────────────────────────────────────────────────────

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// ─── FILTER TYPES ─────────────────────────────────────────────────────────────

export interface ProductFilters {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  sizes?: string[];
  sort?: "newest" | "price_asc" | "price_desc" | "popular";
  search?: string;
  page?: number;
  pageSize?: number;
}

// ─── ADMIN TYPES ──────────────────────────────────────────────────────────────

export interface AdminStats {
  totalRevenue: number;
  totalOrders: number;
  totalProducts: number;
  totalCustomers: number;
  revenueThisMonth: number;
  ordersThisMonth: number;
  recentOrders: Array<{
    id: string;
    orderNumber: string;
    total: number;
    status: string;
    createdAt: Date;
    user: { name: string | null; email: string | null };
  }>;
}
