// src/app/contact/page.tsx
import type { Metadata } from "next";
import { MapPin, Phone, Mail, Clock } from "lucide-react";
import { ContactForm } from "@/components/contact/ContactForm";

export const metadata: Metadata = {
  title: "Contact Us — BNs Fashion Wear",
  description: "Get in touch with the BNs Fashion Wear team. WhatsApp, email or visit our Westlands showroom.",
};

export default function ContactPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
      <div className="mb-10">
        <p className="section-subtitle mb-2">Get in Touch</p>
        <h1 className="section-title">Contact Us</h1>
        <p className="text-muted mt-2 max-w-md">
          We&apos;re here to help. Reach out via WhatsApp for the fastest response.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 gap-10">
        {/* Contact form */}
        <div>
          <ContactForm />
        </div>

        {/* Contact info */}
        <div className="space-y-6">
          <div className="bg-white border border-sand p-6">
            <h2 className="font-display text-xl font-medium mb-5">
              Contact Information
            </h2>
            <div className="space-y-4">
              {[
                {
                  icon: Phone,
                  label: "WhatsApp / Call",
                  value: "+254 700 000 000",
                  href: "https://wa.me/254700000000",
                },
                {
                  icon: Mail,
                  label: "Email",
                  value: "hello@BNs Fashion Wear.co.ke",
                  href: "mailto:hello@BNs Fashion Wear.co.ke",
                },
                {
                  icon: MapPin,
                  label: "Showroom",
                  value: "Westlands Square, Ground Floor, Nairobi",
                  href: "https://maps.google.com",
                },
                {
                  icon: Clock,
                  label: "Business Hours",
                  value: "Mon–Sat: 9am–7pm | Sun: 10am–4pm",
                },
              ].map(({ icon: Icon, label, value, href }) => (
                <div key={label} className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-brand-50 flex items-center justify-center shrink-0">
                    <Icon size={15} className="text-brand-600" />
                  </div>
                  <div>
                    <p className="text-xs text-muted uppercase tracking-wider">{label}</p>
                    {href ? (
                      <a
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm font-medium hover:text-brand-600 transition-colors"
                      >
                        {value}
                      </a>
                    ) : (
                      <p className="text-sm font-medium">{value}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* WhatsApp CTA */}
          <a
            href="https://wa.me/254700000000?text=Hi BNs Fashion Wear! I need help."
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 bg-[#25D366] text-white p-5 hover:brightness-95 transition-all"
          >
            <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            <div>
              <p className="font-semibold">Chat on WhatsApp</p>
              <p className="text-white/80 text-sm">Fastest response · Available daily</p>
            </div>
          </a>
        </div>
      </div>
    </div>
  );
}
