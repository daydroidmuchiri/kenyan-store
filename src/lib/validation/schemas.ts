// src/lib/validation/schemas.ts
// Zod schemas for all form validation and API input

import { z } from "zod";

// ─── AUTH ─────────────────────────────────────────────────────────────────────

export const registerSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    phone: z
      .string()
      .regex(/^(\+?254|0)[17]\d{8}$/, "Enter a valid Kenyan phone number")
      .optional()
      .or(z.literal("")),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[0-9]/, "Password must contain at least one number"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

// ─── CHECKOUT ─────────────────────────────────────────────────────────────────

export const checkoutSchema = z.object({
  fullName: z.string().min(2, "Full name is required"),
  email: z.string().email("Valid email required"),
  phone: z
    .string()
    .regex(/^(\+?254|0)[17]\d{8}$/, "Enter a valid Kenyan phone number"),
  county: z.string().min(1, "County is required"),
  town: z.string().min(1, "Town is required"),
  street: z.string().optional(),
  deliveryType: z.enum(["NAIROBI", "OUTSIDE_NAIROBI", "PICKUP"]),
  paymentMethod: z.enum(["MPESA", "CARD", "CASH_ON_DELIVERY"]),
  mpesaPhone: z
    .string()
    .regex(/^(\+?254|0)[17]\d{8}$/, "Enter a valid M-Pesa number")
    .optional()
    .or(z.literal("")),
  saveAddress: z.boolean().optional(),
  notes: z.string().max(500).optional(),
});

// ─── PRODUCT (ADMIN) ──────────────────────────────────────────────────────────

export const productSchema = z.object({
  name: z.string().min(2, "Product name is required"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  price: z.number().positive("Price must be positive"),
  comparePrice: z.number().positive().optional(),
  categoryId: z.string().min(1, "Category is required"),
  brand: z.string().optional(),
  material: z.string().optional(),
  careInstructions: z.string().optional(),
  isFeatured: z.boolean().optional(),
  isActive: z.boolean().optional(),
});

export const variantSchema = z.object({
  size: z.string().min(1, "Size is required"),
  color: z.string().optional(),
  stock: z.number().int().min(0, "Stock cannot be negative"),
  sku: z.string().optional(),
});

// ─── REVIEW ───────────────────────────────────────────────────────────────────

export const reviewSchema = z.object({
  productId: z.string().min(1),
  rating: z.number().int().min(1).max(5, "Rating must be between 1 and 5"),
  title: z.string().max(100).optional(),
  body: z.string().max(1000).optional(),
});

// ─── ADDRESS ──────────────────────────────────────────────────────────────────

export const addressSchema = z.object({
  fullName: z.string().min(2, "Full name is required"),
  phone: z
    .string()
    .regex(/^(\+?254|0)[17]\d{8}$/, "Valid Kenyan number required"),
  county: z.string().min(1, "County is required"),
  town: z.string().min(1, "Town is required"),
  street: z.string().optional(),
  postalCode: z.string().optional(),
  isDefault: z.boolean().optional(),
});

// ─── MPESA ────────────────────────────────────────────────────────────────────

export const mpesaSchema = z.object({
  phone: z
    .string()
    .regex(/^(\+?254|0)[17]\d{8}$/, "Enter a valid M-Pesa phone number"),
  orderId: z.string().min(1),
});

// ─── TYPES ────────────────────────────────────────────────────────────────────

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type CheckoutInput = z.infer<typeof checkoutSchema>;
export type ProductInput = z.infer<typeof productSchema>;
export type ReviewInput = z.infer<typeof reviewSchema>;
export type AddressInput = z.infer<typeof addressSchema>;
