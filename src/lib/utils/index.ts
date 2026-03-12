// src/lib/utils/index.ts
// Shared utility functions

import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/** Tailwind class merger */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Format price in KES */
export function formatPrice(
  amount: number | string,
  options: { showCurrency?: boolean } = {}
): string {
  const { showCurrency = true } = options;
  const num = typeof amount === "string" ? parseFloat(amount) : amount;

  const formatted = new Intl.NumberFormat("en-KE", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num);

  return showCurrency ? `KES ${formatted}` : formatted;
}

/** Generate a unique order number */
export function generateOrderNumber(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `KFS-${timestamp}-${random}`;
}

/** Slugify a string */
export function slugify(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Calculate average rating */
export function calculateAverageRating(
  reviews: { rating: number }[]
): number {
  if (reviews.length === 0) return 0;
  const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
  return Math.round((sum / reviews.length) * 10) / 10;
}

/** Calculate discount percentage */
export function getDiscountPercent(price: number, comparePrice: number): number {
  if (!comparePrice || comparePrice <= price) return 0;
  return Math.round(((comparePrice - price) / comparePrice) * 100);
}

/** Delivery fee configuration */
export const DELIVERY_OPTIONS = [
  {
    type: "NAIROBI" as const,
    label: "Nairobi Delivery",
    description: "Delivered within Nairobi CBD and estates",
    fee: 200,
    estimatedDays: "1-2 business days",
  },
  {
    type: "OUTSIDE_NAIROBI" as const,
    label: "Outside Nairobi",
    description: "Nationwide delivery via courier",
    fee: 400,
    estimatedDays: "3-5 business days",
  },
  {
    type: "PICKUP" as const,
    label: "Pickup",
    description: "Pick up from our store in Westlands, Nairobi",
    fee: 0,
    estimatedDays: "Same day (Mon–Sat)",
  },
];

export function getDeliveryFee(type: string): number {
  const option = DELIVERY_OPTIONS.find((o) => o.type === type);
  return option?.fee ?? 200;
}

/** Truncate text */
export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return `${str.slice(0, length)}...`;
}

/** Available sizes */
export const CLOTHING_SIZES = ["XS", "S", "M", "L", "XL", "XXL", "XXXL"];
export const JEANS_SIZES = ["26", "28", "30", "32", "34", "36", "38", "40"];

/** Kenyan counties */
export const KENYAN_COUNTIES = [
  "Nairobi", "Mombasa", "Kisumu", "Nakuru", "Eldoret",
  "Nyeri", "Meru", "Machakos", "Kiambu", "Kajiado",
  "Murang'a", "Kirinyaga", "Embu", "Tharaka-Nithi", "Isiolo",
  "Marsabit", "Moyale", "Mandera", "Wajir", "Garissa",
  "Tana River", "Kwale", "Kilifi", "Taita-Taveta", "Lamu",
  "Makueni", "Kitui", "Laikipia", "Nyandarua", "Samburu",
  "Turkana", "West Pokot", "Baringo", "Trans Nzoia", "Uasin Gishu",
  "Elgeyo-Marakwet", "Nandi", "Kericho", "Bomet", "Narok",
  "Migori", "Homabay", "Kisii", "Nyamira", "Siaya",
  "Kakamega", "Vihiga", "Bungoma", "Busia", "Tana River"
];
