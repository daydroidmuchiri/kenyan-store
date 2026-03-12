// src/app/page.tsx
// Home page - Hero, categories, featured products, trust signals

import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Star, Shield, Truck, RefreshCw, MessageCircle } from "lucide-react";
import prisma from "@/lib/db/prisma";
import { ProductCard } from "@/components/product/ProductCard";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "KWELI | Premium African Fashion — Nairobi, Kenya",
  description:
    "Discover handpicked premium fashion for the modern Kenyan. Fast delivery, M-Pesa payment, and hassle-free returns.",
};

// Fetch featured products from DB
async function getFeaturedProducts() {
  return prisma.product.findMany({
    where: { isFeatured: true, isActive: true },
    include: {
      images: { orderBy: { position: "asc" } },
      variants: true,
      reviews: { select: { rating: true } },
      category: { select: { name: true, slug: true } },
    },
    take: 8,
    orderBy: { createdAt: "desc" },
  });
}

async function getCategories() {
  return prisma.category.findMany({
    where: { parentId: null },
    take: 4,
    orderBy: { name: "asc" },
  });
}

export default async function HomePage() {
  const [featuredProducts, categories] = await Promise.all([
    getFeaturedProducts(),
    getCategories(),
  ]);

  return (
    <>
      {/* ── HERO ──────────────────────────────────────────────────────────── */}
      <section className="relative h-[85vh] min-h-[560px] flex items-center overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-r from-charcoal via-charcoal/80 to-charcoal/40">
          {/* Placeholder gradient — replace with real hero image */}
          <div
            className="absolute inset-0 opacity-60"
            style={{
              background:
                "linear-gradient(135deg, #1C1C1C 0%, #4a3728 40%, #c97c3a 100%)",
            }}
          />
        </div>

        {/* Content */}
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 z-10">
          <div className="max-w-lg">
            <p className="section-subtitle text-brand-300 mb-4">
              New Season · 2025 Collection
            </p>
            <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl font-light text-white leading-[1.05] mb-6">
              Wear Your
              <em className="block font-semibold italic text-brand-300">
                Story.
              </em>
            </h1>
            <p className="font-body text-white/70 text-base sm:text-lg max-w-sm mb-8 leading-relaxed">
              Premium African-inspired fashion crafted for the modern Kenyan.
              Quality you can feel. Style that speaks.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href="/shop" className="btn-brand text-base px-8 py-4">
                Shop Now
                <ArrowRight size={18} />
              </Link>
              <Link
                href="/shop?category=women"
                className="btn-secondary border-white text-white hover:bg-white hover:text-charcoal text-base px-8 py-4"
              >
                New Arrivals
              </Link>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-bounce">
          <div className="w-px h-8 bg-white/40" />
        </div>
      </section>

      {/* ── TRUST STRIP ───────────────────────────────────────────────────── */}
      <section className="bg-white border-y border-sand">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5">
          <div className="flex flex-wrap justify-center gap-6 sm:gap-12 text-center">
            {[
              { icon: "📱", text: "Pay with M-Pesa" },
              { icon: "🚚", text: "Delivery Across Kenya" },
              { icon: "↩️", text: "30-Day Returns" },
              { icon: "🔒", text: "Secure Checkout" },
              { icon: "💬", text: "WhatsApp Support" },
            ].map((item) => (
              <div
                key={item.text}
                className="flex items-center gap-2 text-sm font-body text-muted"
              >
                <span>{item.icon}</span>
                <span>{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CATEGORIES ────────────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-20">
        <div className="text-center mb-10">
          <p className="section-subtitle mb-2">Explore</p>
          <h2 className="section-title">Shop by Category</h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            {
              label: "Women",
              href: "/shop?category=women",
              bg: "from-rose-100 to-rose-50",
              emoji: "👗",
            },
            {
              label: "Men",
              href: "/shop?category=men",
              bg: "from-slate-100 to-slate-50",
              emoji: "👔",
            },
            {
              label: "Accessories",
              href: "/shop?category=accessories",
              bg: "from-amber-100 to-amber-50",
              emoji: "👜",
            },
            {
              label: "Sale",
              href: "/shop?sale=true",
              bg: "from-red-100 to-red-50",
              emoji: "🏷️",
            },
          ].map((cat) => (
            <Link
              key={cat.label}
              href={cat.href}
              className={`group relative flex flex-col items-center justify-center bg-gradient-to-b ${cat.bg} p-8 sm:p-12 text-center aspect-square hover:shadow-md transition-all duration-300`}
            >
              <span className="text-4xl sm:text-5xl mb-3 group-hover:scale-110 transition-transform duration-300">
                {cat.emoji}
              </span>
              <span className="font-display text-xl sm:text-2xl font-medium text-charcoal">
                {cat.label}
              </span>
              <span className="text-xs text-muted mt-1 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                Shop now <ArrowRight size={12} />
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* ── FEATURED PRODUCTS ─────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-16 sm:pb-20">
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="section-subtitle mb-2">Handpicked</p>
            <h2 className="section-title">Featured Pieces</h2>
          </div>
          <Link
            href="/shop"
            className="hidden sm:flex items-center gap-1 text-sm font-medium text-brand-600 hover:gap-2 transition-all"
          >
            View all <ArrowRight size={16} />
          </Link>
        </div>

        {featuredProducts.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {featuredProducts.map((product, i) => (
              <ProductCard
                key={product.id}
                product={{
                  ...product,
                  price: Number(product.price),
                  comparePrice: product.comparePrice
                    ? Number(product.comparePrice)
                    : null,
                }}
                priority={i < 4}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 text-muted">
            <ShoppingBagEmpty />
          </div>
        )}

        <div className="text-center mt-10 sm:hidden">
          <Link href="/shop" className="btn-secondary">
            View All Products
          </Link>
        </div>
      </section>

      {/* ── PROMO BANNER ──────────────────────────────────────────────────── */}
      <section className="bg-charcoal text-cream">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-20 grid md:grid-cols-2 gap-10 items-center">
          <div>
            <p className="section-subtitle text-brand-400 mb-3">
              Exclusively Online
            </p>
            <h2 className="font-display text-4xl sm:text-5xl font-light leading-tight mb-4">
              Pay Smarter
              <br />
              <em className="font-semibold text-brand-400">with M-Pesa.</em>
            </h2>
            <p className="text-white/60 text-base leading-relaxed mb-8 max-w-sm">
              Kenya&apos;s most trusted mobile money is our preferred payment
              method. Shop confidently — pay with the phone you already have.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href="/shop" className="btn-brand">
                Start Shopping
              </Link>
              <Link
                href="/delivery"
                className="btn-ghost text-cream hover:text-brand-400"
              >
                Learn more →
              </Link>
            </div>
          </div>

          <div className="space-y-4">
            {[
              {
                step: "1",
                title: "Choose your items",
                desc: "Browse our curated collections",
              },
              {
                step: "2",
                title: "Enter your M-Pesa number",
                desc: "At checkout, enter your Safaricom number",
              },
              {
                step: "3",
                title: "Confirm on your phone",
                desc: "Enter your M-Pesa PIN when prompted",
              },
              {
                step: "4",
                title: "Order confirmed!",
                desc: "We process and deliver to you",
              },
            ].map((item) => (
              <div key={item.step} className="flex items-start gap-4">
                <div className="w-8 h-8 bg-brand-600 text-white text-sm font-bold flex items-center justify-center shrink-0">
                  {item.step}
                </div>
                <div>
                  <p className="font-medium text-sm">{item.title}</p>
                  <p className="text-white/50 text-sm">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ──────────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-20">
        <div className="text-center mb-10">
          <p className="section-subtitle mb-2">Reviews</p>
          <h2 className="section-title">What Our Customers Say</h2>
        </div>

        <div className="grid sm:grid-cols-3 gap-6">
          {[
            {
              name: "Amina W.",
              location: "Nairobi",
              review:
                "The quality is absolutely amazing! I paid via M-Pesa and my order arrived the next day. Will definitely shop again.",
              rating: 5,
              product: "Ankara Wrap Dress",
            },
            {
              name: "James K.",
              location: "Mombasa",
              review:
                "Finally a Kenyan fashion brand that gets it right. Fast delivery, beautiful packaging, and the clothes fit perfectly.",
              rating: 5,
              product: "Linen Blazer",
            },
            {
              name: "Faith M.",
              location: "Kisumu",
              review:
                "I ordered from outside Nairobi and was worried, but the delivery was on time and the shirt looked even better in person!",
              rating: 5,
              product: "Print Shirt",
            },
          ].map((testimonial) => (
            <div
              key={testimonial.name}
              className="bg-white p-6 border border-sand"
            >
              <div className="flex mb-3">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star
                    key={i}
                    size={14}
                    className="fill-amber-400 text-amber-400"
                  />
                ))}
              </div>
              <p className="text-sm text-charcoal leading-relaxed mb-4">
                &ldquo;{testimonial.review}&rdquo;
              </p>
              <div className="flex items-center justify-between text-xs text-muted border-t border-sand pt-3">
                <span className="font-medium text-charcoal">
                  {testimonial.name} · {testimonial.location}
                </span>
                <span>Bought: {testimonial.product}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── NEWSLETTER ────────────────────────────────────────────────────── */}
      <section className="bg-brand-50 border-y border-brand-100">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-14 text-center">
          <p className="section-subtitle text-brand-600 mb-2">Stay Updated</p>
          <h2 className="font-display text-3xl sm:text-4xl font-medium text-charcoal mb-3">
            Join the KWELI Community
          </h2>
          <p className="text-muted text-sm mb-6">
            Get early access to new collections, exclusive offers, and style
            inspiration.
          </p>
          <form className="flex gap-2 max-w-sm mx-auto">
            <input
              type="email"
              placeholder="your@email.com"
              className="input-field flex-1"
              required
            />
            <button type="submit" className="btn-primary whitespace-nowrap">
              Subscribe
            </button>
          </form>
          <p className="text-xs text-muted mt-3">
            No spam. Unsubscribe anytime.
          </p>
        </div>
      </section>
    </>
  );
}

function ShoppingBagEmpty() {
  return (
    <div className="py-10">
      <p className="text-lg font-display">No featured products yet.</p>
      <p className="text-sm mt-2">
        <Link href="/admin/products/new" className="text-brand-600 underline">
          Add products in the admin
        </Link>
      </p>
    </div>
  );
}
