export const dynamic = "force-dynamic";
// src/app/privacy/page.tsx

import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function PrivacyPage() {
  return (
    <div className="bg-cream min-h-screen py-16 sm:py-24">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-muted hover:text-charcoal mb-10 transition-colors"
        >
          <ArrowLeft size={14} />
          Back to home
        </Link>

        <h1 className="font-display text-4xl sm:text-5xl font-light text-charcoal mb-8">
          Privacy Policy
        </h1>
        
        <div className="prose prose-sand max-w-none space-y-8 text-charcoal/80 leading-relaxed font-body">
          <section>
            <p className="text-xs uppercase tracking-widest text-muted mb-2">Last Updated: March 2025</p>
            <p>
              At BNs Fashion Wear, we value your trust and are committed to protecting your personal information. This Privacy Policy explains how we collect, use, and share your data when you visit our store.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl font-medium text-charcoal mb-4">1. Information We Collect</h2>
            <p>We collect information you provide directly to us, including:</p>
            <ul className="list-disc pl-5 space-y-2 mt-2">
              <li>Contact information (email, phone number, name)</li>
              <li>Delivery address</li>
              <li>Order history</li>
              <li>Communication preferences</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-2xl font-medium text-charcoal mb-4">2. How We Use Your Information</h2>
            <p>We use your data to:</p>
            <ul className="list-disc pl-5 space-y-2 mt-2">
              <li>Process and deliver your orders</li>
              <li>Communicate with you about transactions</li>
              <li>Send marketing updates (if you opt-in)</li>
              <li>Improve our website and customer experience</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-2xl font-medium text-charcoal mb-4">3. Data Sharing</h2>
            <p>
              We do not sell your personal data. We share information only with trusted partners necessary to fulfill your order, such as delivery carriers and payment processors (e.g., Safaricom for M-Pesa).
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl font-medium text-charcoal mb-4">4. Cookies</h2>
            <p>
              We use cookies to enhance your browsing experience, remember your cart items, and understand how you interact with our site. You can manage cookie preferences through your browser settings.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl font-medium text-charcoal mb-4">5. Security</h2>
            <p>
              We implement industry-standard security measures to protect your information. However, no transmission over the internet is 100% secure. We encourage you to use strong passwords for your account.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl font-medium text-charcoal mb-4">6. Your Rights</h2>
            <p>
              You have the right to access, correct, or delete your personal information. To exercise these rights, please contact our support team.
            </p>
          </section>

          <section className="pt-10 border-t border-sand">
            <p className="text-sm">
              For more information about our privacy practices, please contact us at <a href="mailto:privacy@BNs Fashion Wear.co.ke" className="text-brand-600 hover:underline">privacy@BNs Fashion Wear.co.ke</a>.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
