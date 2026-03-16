// src/app/about/page.tsx
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About BNs Fashion Wear — Premium African Fashion",
  description: "Learn about BNs Fashion Wear's mission to bring premium African-inspired fashion to the modern Kenyan.",
};

export default function AboutPage() {
  return (
    <div>
      {/* Hero */}
      <section className="bg-charcoal text-cream py-20 px-4 sm:px-6 text-center">
        <p className="section-subtitle text-brand-400 mb-3">Our Story</p>
        <h1 className="font-display text-5xl sm:text-6xl font-light max-w-2xl mx-auto leading-tight">
          Fashion that tells{" "}
          <em className="font-semibold italic text-brand-300">Africa&apos;s story.</em>
        </h1>
        <p className="text-white/60 max-w-xl mx-auto mt-6 text-base leading-relaxed">
          BNs Fashion Wear — meaning &quot;truth&quot; in Swahili — was born from a simple belief: that African fashion
          deserves a premium platform that celebrates its richness and connects it to the modern world.
        </p>
      </section>

      {/* Mission */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 py-16">
        <div className="grid sm:grid-cols-2 gap-12 items-center">
          <div>
            <p className="section-subtitle mb-3">Our Mission</p>
            <h2 className="font-display text-4xl font-light mb-5">
              Redefining African fashion for the modern era
            </h2>
            <p className="text-muted leading-relaxed mb-4">
              We curate and create premium clothing that blends Africa&apos;s rich textile heritage
              with contemporary design. Every piece at BNs Fashion Wear is selected for quality, craftsmanship,
              and cultural resonance.
            </p>
            <p className="text-muted leading-relaxed">
              From Ankara prints to hand-woven kitenge, from tailored blazers to flowing dresses —
              we celebrate the diversity and beauty of African style while making it accessible to
              every Kenyan.
            </p>
          </div>
          <div className="space-y-4">
            {[
              { number: "2019", label: "Founded in Nairobi" },
              { number: "10K+", label: "Happy customers across Kenya" },
              { number: "500+", label: "Unique styles curated" },
              { number: "47", label: "Counties we deliver to" },
            ].map((stat) => (
              <div key={stat.label} className="flex items-center gap-4 p-4 bg-white border border-sand">
                <span className="font-display text-3xl font-semibold text-brand-600">
                  {stat.number}
                </span>
                <span className="text-muted">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="bg-sand py-16 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <p className="section-subtitle mb-2">What We Stand For</p>
            <h2 className="section-title">Our Values</h2>
          </div>
          <div className="grid sm:grid-cols-3 gap-6">
            {[
              {
                icon: "🌍",
                title: "African Heritage",
                desc: "We celebrate and preserve Africa's rich textile traditions, working with artisans and designers who understand the culture.",
              },
              {
                icon: "✨",
                title: "Quality First",
                desc: "Every garment is selected for its craftsmanship, durability, and fit. We won't list it if we wouldn't wear it ourselves.",
              },
              {
                icon: "🤝",
                title: "Customer Trust",
                desc: "From easy M-Pesa payments to hassle-free returns, we build trust at every touchpoint of your shopping journey.",
              },
            ].map((value) => (
              <div key={value.title} className="bg-white p-6 border border-sand/60">
                <span className="text-4xl block mb-4">{value.icon}</span>
                <h3 className="font-display text-xl font-medium mb-2">{value.title}</h3>
                <p className="text-sm text-muted leading-relaxed">{value.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-2xl mx-auto px-4 py-16 text-center">
        <h2 className="font-display text-4xl font-light mb-4">
          Ready to explore?
        </h2>
        <p className="text-muted mb-8">
          Discover our curated collections and find your next favourite piece.
        </p>
        <Link href="/shop" className="btn-primary text-base px-10 py-4">
          Shop the Collection
        </Link>
      </section>
    </div>
  );
}
