// src/app/delivery/page.tsx
import type { Metadata } from "next";
import { Truck, RefreshCw, MapPin, Clock, Package, Phone } from "lucide-react";

export const metadata: Metadata = {
  title: "Delivery & Returns — BNs Fashion Wear",
  description: "Learn about our delivery options across Kenya, estimated times, fees, and our 30-day return policy.",
};

export default function DeliveryPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
      <div className="mb-10">
        <p className="section-subtitle mb-2">Information</p>
        <h1 className="section-title">Delivery & Returns</h1>
      </div>

      {/* Delivery Options */}
      <section className="mb-12">
        <h2 className="font-display text-2xl font-medium mb-6 flex items-center gap-3">
          <Truck className="text-brand-600" size={24} />
          Delivery Options
        </h2>

        <div className="grid sm:grid-cols-3 gap-4">
          {[
            {
              title: "Nairobi Delivery",
              fee: "KES 200",
              time: "1–2 business days",
              desc: "We deliver to all Nairobi estates including Westlands, Karen, Kilimani, Lavington, Kasarani, Embakasi, and more.",
              icon: MapPin,
            },
            {
              title: "Outside Nairobi",
              fee: "KES 400",
              time: "3–5 business days",
              desc: "Nationwide delivery via trusted courier partners. We ship to all 47 counties in Kenya.",
              icon: Truck,
            },
            {
              title: "Store Pickup",
              fee: "FREE",
              time: "Same day (Mon–Sat)",
              desc: "Pick up from our Westlands Square showroom. Mon–Sat: 9am–7pm, Sun: 10am–4pm.",
              icon: Package,
            },
          ].map((option) => (
            <div key={option.title} className="bg-white border border-sand p-5">
              <div className="w-10 h-10 bg-brand-50 flex items-center justify-center mb-4">
                <option.icon size={20} className="text-brand-600" />
              </div>
              <h3 className="font-medium mb-1">{option.title}</h3>
              <p className="text-brand-600 font-semibold text-lg mb-1">{option.fee}</p>
              <p className="text-xs text-green-600 flex items-center gap-1 mb-3">
                <Clock size={12} /> {option.time}
              </p>
              <p className="text-sm text-muted">{option.desc}</p>
            </div>
          ))}
        </div>

        <div className="mt-6 p-4 bg-green-50 border border-green-200">
          <p className="text-sm text-green-800">
            🎉 <strong>Free Nairobi delivery</strong> on all orders over KES 5,000!
          </p>
        </div>
      </section>

      {/* How Delivery Works */}
      <section className="mb-12" id="how-it-works">
        <h2 className="font-display text-2xl font-medium mb-6">How It Works</h2>
        <div className="space-y-4">
          {[
            { step: "1", title: "Place Your Order", desc: "Complete checkout and pay via M-Pesa, card, or cash on delivery." },
            { step: "2", title: "Order Confirmed", desc: "You'll receive an SMS and email confirmation with your order number." },
            { step: "3", title: "We Prepare Your Order", desc: "Our team carefully picks and packages your items within 24 hours." },
            { step: "4", title: "Out for Delivery", desc: "You'll receive a notification when your order is on its way." },
            { step: "5", title: "Delivered!", desc: "Receive your order and enjoy your new BNs Fashion Wear pieces." },
          ].map((item) => (
            <div key={item.step} className="flex gap-4 items-start">
              <div className="w-8 h-8 bg-charcoal text-cream flex items-center justify-center text-sm font-bold shrink-0">
                {item.step}
              </div>
              <div>
                <p className="font-medium">{item.title}</p>
                <p className="text-sm text-muted">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Returns Policy */}
      <section className="mb-12" id="returns">
        <h2 className="font-display text-2xl font-medium mb-6 flex items-center gap-3">
          <RefreshCw className="text-brand-600" size={24} />
          Returns Policy
        </h2>

        <div className="bg-white border border-sand p-6 mb-6">
          <p className="font-display text-xl font-medium mb-4">
            30-Day Free Returns
          </p>
          <p className="text-muted text-sm leading-relaxed mb-4">
            We want you to love every BNs Fashion Wear piece. If you&apos;re not completely satisfied,
            we accept returns within 30 days of delivery — no questions asked.
          </p>

          <h3 className="font-medium mb-2">Return Conditions</h3>
          <ul className="space-y-1.5 text-sm text-muted mb-4">
            {[
              "Items must be unworn and unwashed",
              "Original tags must still be attached",
              "Items must be in original packaging",
              "Return request must be made within 30 days of delivery",
              "Sale items and final-sale products are non-returnable",
            ].map((condition) => (
              <li key={condition} className="flex items-start gap-2">
                <span className="text-brand-600 mt-0.5">✓</span>
                {condition}
              </li>
            ))}
          </ul>

          <h3 className="font-medium mb-2">How to Return</h3>
          <ol className="space-y-1.5 text-sm text-muted">
            {[
              "Contact us via WhatsApp or email with your order number",
              "We'll arrange a pickup or provide a drop-off location",
              "Once received and inspected, refunds are processed within 3–5 business days",
              "Refunds go back to your M-Pesa, bank account, or original payment method",
            ].map((step, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="font-bold text-brand-600 shrink-0">{i + 1}.</span>
                {step}
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Size Guide */}
      <section className="mb-12" id="sizes">
        <h2 className="font-display text-2xl font-medium mb-6">Size Guide</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border border-sand">
            <thead>
              <tr className="bg-charcoal text-cream">
                <th className="px-4 py-3 text-left">Size</th>
                <th className="px-4 py-3 text-left">UK Size</th>
                <th className="px-4 py-3 text-left">Chest (cm)</th>
                <th className="px-4 py-3 text-left">Waist (cm)</th>
                <th className="px-4 py-3 text-left">Hips (cm)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sand">
              {[
                ["XS", "6–8", "80–84", "62–66", "87–91"],
                ["S", "8–10", "84–88", "66–70", "91–95"],
                ["M", "12–14", "88–92", "70–74", "95–99"],
                ["L", "14–16", "92–96", "74–78", "99–103"],
                ["XL", "16–18", "96–100", "78–82", "103–107"],
                ["XXL", "18–20", "100–104", "82–86", "107–111"],
              ].map(([size, uk, chest, waist, hips]) => (
                <tr key={size} className="hover:bg-cream transition-colors">
                  <td className="px-4 py-3 font-medium">{size}</td>
                  <td className="px-4 py-3 text-muted">{uk}</td>
                  <td className="px-4 py-3 text-muted">{chest}</td>
                  <td className="px-4 py-3 text-muted">{waist}</td>
                  <td className="px-4 py-3 text-muted">{hips}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Contact */}
      <section className="bg-charcoal text-cream p-8 text-center">
        <Phone size={32} className="mx-auto mb-4 text-brand-400" />
        <h2 className="font-display text-2xl font-medium mb-2">Still Have Questions?</h2>
        <p className="text-white/60 mb-6">Our team is available Mon–Sat, 8am–8pm EAT</p>
        <div className="flex flex-wrap gap-3 justify-center">
          <a
            href="https://wa.me/254700000000"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-brand"
          >
            WhatsApp Us
          </a>
          <a href="mailto:hello@BNs Fashion Wear.co.ke" className="btn-secondary border-white text-white hover:bg-white hover:text-charcoal">
            Email Us
          </a>
        </div>
      </section>
    </div>
  );
}
