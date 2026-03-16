// src/components/layout/Footer.tsx
import Link from "next/link";
import { MapPin, Phone, Mail, Instagram, Facebook, Twitter } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-charcoal text-cream">
      {/* Trust Badges */}
      <div className="border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              {
                icon: "🔒",
                title: "Secure Payments",
                desc: "M-Pesa & Card secured",
              },
              {
                icon: "🚚",
                title: "Kenya-Wide Delivery",
                desc: "1–5 business days",
              },
              {
                icon: "↩️",
                title: "Easy Returns",
                desc: "30-day return policy",
              },
              {
                icon: "💬",
                title: "WhatsApp Support",
                desc: "Mon–Sat, 8am–8pm",
              },
            ].map((item) => (
              <div key={item.title} className="flex items-start gap-3">
                <span className="text-2xl">{item.icon}</span>
                <div>
                  <p className="font-medium text-sm">{item.title}</p>
                  <p className="text-white/60 text-xs mt-0.5">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link
              href="/"
              className="font-display text-3xl font-semibold tracking-[0.2em]"
            >
              BNs Fashion Wear
            </Link>
            <p className="mt-4 text-sm text-white/60 leading-relaxed">
              Premium African-inspired fashion, made for the modern Kenyan.
              Quality you can feel. Style that speaks.
            </p>
            <div className="flex gap-4 mt-6">
              {[
                { icon: Instagram, href: "#", label: "Instagram" },
                { icon: Facebook, href: "#", label: "Facebook" },
                { icon: Twitter, href: "#", label: "Twitter" },
              ].map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="w-8 h-8 flex items-center justify-center border border-white/20 hover:border-brand-400 hover:text-brand-400 transition-colors"
                >
                  <Icon size={15} />
                </a>
              ))}
            </div>
          </div>

          {/* Shop */}
          <div>
            <h4 className="text-xs uppercase tracking-widest text-white/50 mb-4">
              Shop
            </h4>
            <ul className="space-y-3">
              {[
                { label: "Women", href: "/shop?category=women" },
                { label: "Men", href: "/shop?category=men" },
                { label: "Accessories", href: "/shop?category=accessories" },
                { label: "New Arrivals", href: "/shop?sort=newest" },
                { label: "Sale", href: "/shop?sale=true" },
              ].map((item) => (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    className="text-sm text-white/70 hover:text-white transition-colors"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Help */}
          <div>
            <h4 className="text-xs uppercase tracking-widest text-white/50 mb-4">
              Help
            </h4>
            <ul className="space-y-3">
              {[
                { label: "Delivery Info", href: "/delivery" },
                { label: "Returns Policy", href: "/delivery#returns" },
                { label: "Size Guide", href: "/delivery#sizes" },
                { label: "Contact Us", href: "/contact" },
                { label: "About BNs Fashion Wear", href: "/about" },
              ].map((item) => (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    className="text-sm text-white/70 hover:text-white transition-colors"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-xs uppercase tracking-widest text-white/50 mb-4">
              Contact
            </h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-2.5">
                <MapPin size={15} className="mt-0.5 text-brand-400 shrink-0" />
                <span className="text-sm text-white/70">
                  Westlands Square, Ground Floor
                  <br />
                  Nairobi, Kenya
                </span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone size={15} className="text-brand-400 shrink-0" />
                <a
                  href="tel:+254700000000"
                  className="text-sm text-white/70 hover:text-white"
                >
                  +254 700 000 000
                </a>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail size={15} className="text-brand-400 shrink-0" />
                <a
                  href="mailto:hello@BNs Fashion Wear.co.ke"
                  className="text-sm text-white/70 hover:text-white"
                >
                  hello@BNs Fashion Wear.co.ke
                </a>
              </li>
            </ul>

            {/* M-Pesa badge */}
            <div className="mt-6 flex items-center gap-2 p-3 bg-white/5 border border-white/10">
              <span className="text-green-400 font-bold text-sm">M</span>
              <span className="text-xs text-white/60">
                M-Pesa payments accepted
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-xs text-white/40">
            © {new Date().getFullYear()} BNs Fashion Wear. All rights reserved.
          </p>
          <div className="flex gap-4">
            <Link
              href="/privacy"
              className="text-xs text-white/40 hover:text-white/70"
            >
              Privacy Policy
            </Link>
            <Link
              href="/terms"
              className="text-xs text-white/40 hover:text-white/70"
            >
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
