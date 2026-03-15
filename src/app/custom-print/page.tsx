export const dynamic = "force-dynamic";
// src/app/custom-print/page.tsx
// Landing page for the print-on-demand feature

import Link from "next/link";
import type { Metadata } from "next";
import { Palette, Upload, Eye, ShoppingBag, ArrowRight } from "lucide-react";
import prisma from "@/lib/db/prisma";
import { formatPrice } from "@/lib/utils";
import { GARMENT_SVG_MAP, TShirtSVG } from "@/components/print/GarmentSVG";

export const metadata: Metadata = {
  title: "Custom Print — Design Your Own | KWELI Fashion",
  description:
    "Upload your design and we'll print it on a premium T-shirt, hoodie, or tote. Pay with M-Pesa. Delivered across Kenya.",
};

async function getPrintableProducts() {
  return prisma.printableProduct.findMany({
    where: { isActive: true },
    orderBy: { createdAt: "asc" },
  });
}

export default async function CustomPrintPage() {
  const products = await getPrintableProducts();

  return (
    <div>
      {/* Hero */}
      <section className="bg-charcoal text-cream py-20 px-4 sm:px-6 text-center relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              "repeating-linear-gradient(45deg, #c97c3a 0, #c97c3a 1px, transparent 0, transparent 50%)",
            backgroundSize: "20px 20px",
          }}
        />
        <div className="relative z-10">
          <p className="section-subtitle text-brand-400 mb-3">
            Print on Demand
          </p>
          <h1 className="font-display text-5xl sm:text-6xl font-light max-w-2xl mx-auto leading-tight mb-4">
            Wear Your{" "}
            <em className="font-semibold italic text-brand-300">
              Own Design.
            </em>
          </h1>
          <p className="text-white/60 max-w-xl mx-auto text-base leading-relaxed mb-8">
            Upload your artwork, logo, or photo. We print it on premium
            garments and ship straight to you anywhere in Kenya.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <a href="#products" className="btn-brand px-8 py-4 text-base">
              Choose a Product
              <ArrowRight size={18} />
            </a>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 py-16">
        <div className="text-center mb-10">
          <p className="section-subtitle mb-2">The Process</p>
          <h2 className="section-title">How It Works</h2>
        </div>
        <div className="grid sm:grid-cols-4 gap-6">
          {[
            {
              icon: ShoppingBag,
              step: "1",
              title: "Pick a Product",
              desc: "Choose from T-shirts, hoodies, tote bags and more",
            },
            {
              icon: Upload,
              step: "2",
              title: "Upload Your Design",
              desc: "PNG with transparent background works best",
            },
            {
              icon: Eye,
              step: "3",
              title: "Preview & Adjust",
              desc: "Position, resize and rotate on a live mockup",
            },
            {
              icon: Palette,
              step: "4",
              title: "Order & We Print",
              desc: "Pay with M-Pesa, we review and ship to you",
            },
          ].map(({ icon: Icon, step, title, desc }) => (
            <div key={step} className="text-center">
              <div className="w-14 h-14 bg-brand-50 border border-brand-100 flex items-center justify-center mx-auto mb-4 relative">
                <Icon size={24} className="text-brand-600" />
                <span className="absolute -top-2 -right-2 w-5 h-5 bg-brand-600 text-white text-xs font-bold flex items-center justify-center">
                  {step}
                </span>
              </div>
              <h3 className="font-medium mb-1 text-sm">{title}</h3>
              <p className="text-xs text-muted">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Product grid */}
      <section id="products" className="max-w-6xl mx-auto px-4 sm:px-6 pb-20">
        <div className="text-center mb-10">
          <p className="section-subtitle mb-2">Choose Your Canvas</p>
          <h2 className="section-title">Printable Products</h2>
        </div>

        {products.length === 0 ? (
          <div className="text-center py-20 text-muted">
            <Palette size={48} className="mx-auto mb-4 text-sand" />
            <p className="font-display text-2xl font-light">
              Coming soon!
            </p>
            <p className="text-sm mt-2">
              Our printable product range is being set up. Check back shortly.
            </p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => {
              const colors =
                (product.availableColors as any[]) || [];
              const totalPrice =
                Number(product.basePrice) + Number(product.printSurcharge);

              return (
                <div
                  key={product.id}
                  className="bg-white border border-sand group hover:shadow-lg transition-all duration-300"
                >
                  {/* Mockup image */}
                  <div className="relative aspect-square overflow-hidden bg-sand">
                    {(() => {
                      const GarmentComponent = Object.keys(GARMENT_SVG_MAP).includes(product.slug) 
                        ? GARMENT_SVG_MAP[product.slug] 
                        : TShirtSVG;
                      const defaultColor = (colors.length > 0 ? colors[0].hex : "#ffffff");
                      return (
                        <GarmentComponent
                          color={defaultColor}
                          className="w-full h-full object-contain p-6 product-image-zoom transition-transform"
                        />
                      );
                    })()}
                    <div className="absolute top-3 left-3">
                      <span className="badge bg-brand-600 text-white text-xs">
                        Custom Print
                      </span>
                    </div>
                  </div>

                  <div className="p-5">
                    <h3 className="font-display text-xl font-medium mb-1">
                      {product.name}
                    </h3>
                    {product.description && (
                      <p className="text-sm text-muted mb-3 line-clamp-2">
                        {product.description}
                      </p>
                    )}

                    {/* Color swatches */}
                    {colors.length > 0 && (
                      <div className="flex items-center gap-1.5 mb-4">
                        <span className="text-xs text-muted">
                          {colors.length} colors:
                        </span>
                        {colors.slice(0, 6).map((c: any) => (
                          <div
                            key={c.name}
                            className="w-4 h-4 border border-sand/70"
                            style={{ backgroundColor: c.hex }}
                            title={c.name}
                          />
                        ))}
                        {colors.length > 6 && (
                          <span className="text-xs text-muted">
                            +{colors.length - 6}
                          </span>
                        )}
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-muted">From</p>
                        <p className="font-display text-xl font-medium text-charcoal">
                          {formatPrice(totalPrice)}
                        </p>
                        <p className="text-xs text-muted">
                          incl. {formatPrice(Number(product.printSurcharge))} print fee
                        </p>
                      </div>
                      <Link
                        href={`/custom-print/${product.slug}`}
                        className="btn-primary text-sm px-5 py-3"
                      >
                        <Palette size={16} />
                        Design Now
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Design tips */}
      <section className="bg-sand/50 border-y border-sand">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
          <h2 className="font-display text-2xl font-medium mb-6 text-center">
            Design Tips for Best Results
          </h2>
          <div className="grid sm:grid-cols-3 gap-5">
            {[
              {
                icon: "🖼️",
                title: "Use PNG with Transparency",
                desc: "A transparent background ensures only your design prints — not a white box around it.",
              },
              {
                icon: "📐",
                title: "High Resolution",
                desc: "Use images at least 1000×1000px. The bigger the better for crisp, sharp prints.",
              },
              {
                icon: "©️",
                title: "Use Original Art",
                desc: "Only upload designs you created or own the rights to. Copyrighted logos will be rejected.",
              },
            ].map((tip) => (
              <div key={tip.title} className="flex gap-3">
                <span className="text-2xl shrink-0">{tip.icon}</span>
                <div>
                  <p className="font-medium text-sm mb-1">{tip.title}</p>
                  <p className="text-xs text-muted">{tip.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
