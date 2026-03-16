export const dynamic = "force-dynamic";
// src/app/terms/page.tsx

import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function TermsPage() {
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
          Terms of Service
        </h1>
        
        <div className="prose prose-sand max-w-none space-y-8 text-charcoal/80 leading-relaxed font-body">
          <section>
            <p className="text-xs uppercase tracking-widest text-muted mb-2">Last Updated: March 2025</p>
            <p>
              Welcome to BNs Fashion Wear. These Terms of Service govern your use of our website and purchase of our products. By accessing or using our platform, you agree to be bound by these terms.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl font-medium text-charcoal mb-4">1. Use of Website</h2>
            <p>
              You must be at least 18 years old or under the supervision of a parent or guardian to use this site. You agree to provide accurate information during checkout and to maintain the security of your account.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl font-medium text-charcoal mb-4">2. Orders and Payments</h2>
            <p>
              All orders are subject to acceptance and availability. Prices are listed in Kenyan Shillings (KES). We accept payments via M-Pesa and major Credit/Debit cards. In the event of a pricing error, we reserve the right to cancel your order.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl font-medium text-charcoal mb-4">3. Delivery</h2>
            <p>
              We deliver across Kenya. Delivery times are estimates and may vary based on location and carrier. We are not responsible for delays beyond our control. Risk of loss passes to you upon delivery.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl font-medium text-charcoal mb-4">4. Returns and Refunds</h2>
            <p>
              We offer a 30-day return policy for unused items in original packaging. Please refer to our Delivery & Returns page for detailed instructions. Refunds will be processed within 5-7 business days of receiving the return.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl font-medium text-charcoal mb-4">5. Intellectual Property</h2>
            <p>
              All content on this site, including images, text, and designs, is the property of BNs Fashion Wear or its content suppliers and is protected by intellectual property laws.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl font-medium text-charcoal mb-4">6. Limitation of Liability</h2>
            <p>
              BNs Fashion Wear shall not be liable for any indirect, incidental, or consequential damages arising from the use of our website or products.
            </p>
          </section>

          <section className="pt-10 border-t border-sand">
            <p className="text-sm">
              If you have any questions about these terms, please contact us at <a href="mailto:legal@BNs Fashion Wear.co.ke" className="text-brand-600 hover:underline">legal@BNs Fashion Wear.co.ke</a>.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
