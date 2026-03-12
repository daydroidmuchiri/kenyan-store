"use client";
export const dynamic = "force-dynamic";
// src/app/forgot-password/page.tsx

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Loader2, Mail } from "lucide-react";
import toast from "react-hot-toast";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setIsSubmitting(false);
    setIsSent(true);
    toast.success("Reset link sent if account exists");
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 bg-cream">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <Link
            href="/"
            className="font-display text-4xl font-semibold tracking-[0.2em] text-charcoal uppercase"
          >
            KWELI
          </Link>
        </div>

        <div className="bg-white border border-sand p-8 sm:p-10 shadow-sm">
          {!isSent ? (
            <>
              <h1 className="font-display text-2xl font-light mb-3">
                Forgot password?
              </h1>
              <p className="text-muted text-sm mb-8 leading-relaxed">
                Enter your email address and we&apos;ll send you a link to reset your
                password.
              </p>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="label">Email Address</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="input-field"
                    placeholder="you@example.com"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-primary w-full py-3.5 flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    "Send Reset Link"
                  )}
                </button>
              </form>
            </>
          ) : (
            <div className="text-center">
              <div className="w-16 h-16 bg-brand-50 text-brand-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <Mail size={32} />
              </div>
              <h2 className="font-display text-2xl font-light mb-3">
                Check your email
              </h2>
              <p className="text-muted text-sm mb-8 leading-relaxed">
                We&apos;ve sent a password reset link to <br />
                <span className="font-medium text-charcoal">{email}</span>
              </p>
              <button
                onClick={() => setIsSent(false)}
                className="text-brand-600 font-medium text-sm hover:underline"
              >
                Didn&apos;t receive anything? Try again
              </button>
            </div>
          )}

          <div className="mt-8 pt-6 border-t border-sand text-center">
            <Link
              href="/login"
              className="inline-flex items-center gap-2 text-sm text-muted hover:text-charcoal transition-colors underline decoration-sand underline-offset-4"
            >
              <ArrowLeft size={14} />
              Return to login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
