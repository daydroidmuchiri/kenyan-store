// src/app/checkout/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Shield, ChevronDown, Check, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { useCart } from "@/hooks/use-cart";
import {
  formatPrice,
  DELIVERY_OPTIONS,
  getDeliveryFee,
  KENYAN_COUNTIES,
} from "@/lib/utils";
import { checkoutSchema, type CheckoutInput } from "@/lib/validation/schemas";
import { cn } from "@/lib/utils";

type Step = "details" | "payment" | "confirming";

export default function CheckoutPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const { items, getTotalPrice, clearCart } = useCart();
  const [step, setStep] = useState<Step>("details");
  const [deliveryType, setDeliveryType] = useState<"NAIROBI" | "OUTSIDE_NAIROBI" | "PICKUP">("NAIROBI");
  const [paymentMethod, setPaymentMethod] = useState<"MPESA" | "CARD" | "CASH_ON_DELIVERY">("MPESA");
  const [mpesaStatus, setMpesaStatus] = useState<"idle" | "pending" | "checking" | "success" | "failed">("idle");
  const [checkoutRequestId, setCheckoutRequestId] = useState<string | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);

  const subtotal = getTotalPrice();
  const deliveryFee = getDeliveryFee(deliveryType);
  const total = subtotal + deliveryFee;

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<CheckoutInput>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      fullName: session?.user?.name || "",
      email: session?.user?.email || "",
      deliveryType: "NAIROBI",
      paymentMethod: "MPESA",
    },
  });

  // Redirect if cart empty
  useEffect(() => {
    if (items.length === 0 && step === "details") {
      router.push("/cart");
    }
  }, [items.length, router, step]);

  const onSubmit = async (data: CheckoutInput) => {
    try {
      // Create order in DB
      const orderRes = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          items: items.map((item) => ({
            productId: item.productId,
            variantId: item.variantId,
            quantity: item.quantity,
            price: item.price,
            productName: item.name,
            productImage: item.image,
            size: item.size,
            color: item.color,
          })),
          subtotal,
          deliveryFee,
          total,
        }),
      });

      if (!orderRes.ok) {
        const err = await orderRes.json();
        throw new Error(err.error || "Failed to create order");
      }

      const { orderId: newOrderId, orderNumber } = await orderRes.json();
      setOrderId(newOrderId);

      if (data.paymentMethod === "MPESA") {
        // Initiate STK Push
        setStep("payment");
        setMpesaStatus("pending");

        const mpesaRes = await fetch("/api/payments/mpesa/initiate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            phone: data.mpesaPhone || data.phone,
            orderId: newOrderId,
            orderNumber,
            amount: total,
          }),
        });

        const mpesaData = await mpesaRes.json();

        if (!mpesaData.success) {
          setMpesaStatus("failed");
          toast.error(mpesaData.error || "M-Pesa payment failed");
          return;
        }

        setCheckoutRequestId(mpesaData.checkoutRequestId);

        // Poll for payment status
        pollMpesaStatus(mpesaData.checkoutRequestId, newOrderId);
      } else if (data.paymentMethod === "CASH_ON_DELIVERY") {
        clearCart();
        router.push(`/confirmation?orderId=${newOrderId}`);
      } else {
        // Card payment — redirect to Stripe
        const stripeRes = await fetch("/api/payments/stripe/create-session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ orderId: newOrderId }),
        });
        const { url } = await stripeRes.json();
        window.location.href = url;
      }
    } catch (error: any) {
      toast.error(error.message || "Something went wrong");
    }
  };

  const pollMpesaStatus = async (
    checkoutId: string,
    oid: string,
    attempts = 0
  ) => {
    if (attempts >= 15) {
      // ~75 seconds timeout
      setMpesaStatus("failed");
      toast.error("Payment timeout. Please try again.");
      return;
    }

    setTimeout(async () => {
      try {
        const res = await fetch(
          `/api/payments/mpesa/status?checkoutRequestId=${checkoutId}&orderId=${oid}`
        );
        const data = await res.json();

        if (data.status === "PAID") {
          setMpesaStatus("success");
          clearCart();
          setTimeout(() => router.push(`/confirmation?orderId=${oid}`), 1500);
        } else if (data.status === "FAILED") {
          setMpesaStatus("failed");
          toast.error("Payment failed. Please try again.");
        } else {
          // Still pending
          pollMpesaStatus(checkoutId, oid, attempts + 1);
        }
      } catch {
        pollMpesaStatus(checkoutId, oid, attempts + 1);
      }
    }, 5000);
  };

  if (step === "payment") {
    return <MpesaWaitingScreen status={mpesaStatus} total={total} onRetry={() => setStep("details")} />;
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
      <h1 className="font-display text-4xl font-light mb-8">Checkout</h1>

      <div className="grid lg:grid-cols-5 gap-10">
        {/* Form */}
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="lg:col-span-3 space-y-8"
        >
          {/* ── CONTACT DETAILS ─── */}
          <section>
            <h2 className="font-display text-xl font-medium mb-4 pb-3 border-b border-sand">
              Contact Details
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="label">Full Name *</label>
                <input {...register("fullName")} className="input-field" placeholder="Jane Mwangi" />
                {errors.fullName && <p className="error-message">{errors.fullName.message}</p>}
              </div>
              <div>
                <label className="label">Email *</label>
                <input {...register("email")} type="email" className="input-field" placeholder="jane@example.com" />
                {errors.email && <p className="error-message">{errors.email.message}</p>}
              </div>
              <div>
                <label className="label">Phone Number *</label>
                <input {...register("phone")} className="input-field" placeholder="0712345678" />
                {errors.phone && <p className="error-message">{errors.phone.message}</p>}
              </div>
            </div>
          </section>

          {/* ── DELIVERY ─── */}
          <section>
            <h2 className="font-display text-xl font-medium mb-4 pb-3 border-b border-sand">
              Delivery
            </h2>
            <div className="space-y-3 mb-5">
              {DELIVERY_OPTIONS.map((option) => (
                <label
                  key={option.type}
                  className={cn(
                    "flex items-start gap-3 p-4 border cursor-pointer transition-all",
                    deliveryType === option.type
                      ? "border-charcoal bg-white"
                      : "border-sand hover:border-charcoal/40"
                  )}
                >
                  <input
                    type="radio"
                    value={option.type}
                    {...register("deliveryType")}
                    onChange={() => {
                      setDeliveryType(option.type);
                      setValue("deliveryType", option.type);
                    }}
                    className="mt-0.5 accent-charcoal"
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-sm">{option.label}</p>
                      <p className="font-semibold text-sm">
                        {option.fee === 0 ? "FREE" : formatPrice(option.fee)}
                      </p>
                    </div>
                    <p className="text-xs text-muted mt-0.5">{option.description}</p>
                    <p className="text-xs text-brand-600 mt-0.5">📅 {option.estimatedDays}</p>
                  </div>
                </label>
              ))}
            </div>

            {deliveryType !== "PICKUP" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="label">County *</label>
                  <select {...register("county")} className="input-field">
                    <option value="">Select county</option>
                    {KENYAN_COUNTIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                  {errors.county && <p className="error-message">{errors.county.message}</p>}
                </div>
                <div>
                  <label className="label">Town / Area *</label>
                  <input {...register("town")} className="input-field" placeholder="Westlands" />
                  {errors.town && <p className="error-message">{errors.town.message}</p>}
                </div>
                <div className="sm:col-span-2">
                  <label className="label">Street Address (optional)</label>
                  <input {...register("street")} className="input-field" placeholder="Building name, floor, apartment..." />
                </div>
              </div>
            )}
          </section>

          {/* ── PAYMENT ─── */}
          <section>
            <h2 className="font-display text-xl font-medium mb-4 pb-3 border-b border-sand">
              Payment Method
            </h2>
            <div className="space-y-3">
              {/* M-Pesa */}
              <label
                className={cn(
                  "flex items-start gap-3 p-4 border cursor-pointer transition-all",
                  paymentMethod === "MPESA"
                    ? "border-green-500 bg-green-50/30"
                    : "border-sand hover:border-green-300"
                )}
              >
                <input
                  type="radio"
                  value="MPESA"
                  {...register("paymentMethod")}
                  onChange={() => {
                    setPaymentMethod("MPESA");
                    setValue("paymentMethod", "MPESA");
                  }}
                  className="mt-0.5 accent-green-600"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-green-700 bg-green-100 px-2 py-0.5 text-sm">
                      M-PESA
                    </span>
                    <p className="font-medium text-sm">Pay with M-Pesa</p>
                    <span className="text-xs text-green-600 bg-green-50 border border-green-200 px-1.5 py-0.5">
                      Recommended
                    </span>
                  </div>
                  <p className="text-xs text-muted mt-1">
                    You&apos;ll receive an STK Push on your phone
                  </p>

                  {paymentMethod === "MPESA" && (
                    <div className="mt-3">
                      <label className="label">M-Pesa Phone Number</label>
                      <input
                        {...register("mpesaPhone")}
                        className="input-field"
                        placeholder="0712345678"
                      />
                      <p className="text-xs text-muted mt-1">
                        Enter the Safaricom number to receive the payment prompt
                      </p>
                      {errors.mpesaPhone && (
                        <p className="error-message">{errors.mpesaPhone.message}</p>
                      )}
                    </div>
                  )}
                </div>
              </label>

              {/* Card */}
              <label
                className={cn(
                  "flex items-start gap-3 p-4 border cursor-pointer transition-all",
                  paymentMethod === "CARD"
                    ? "border-charcoal bg-white"
                    : "border-sand hover:border-charcoal/40"
                )}
              >
                <input
                  type="radio"
                  value="CARD"
                  {...register("paymentMethod")}
                  onChange={() => {
                    setPaymentMethod("CARD");
                    setValue("paymentMethod", "CARD");
                  }}
                  className="mt-0.5 accent-charcoal"
                />
                <div>
                  <p className="font-medium text-sm">Pay with Card</p>
                  <p className="text-xs text-muted mt-0.5">Visa, Mastercard · Powered by Stripe</p>
                </div>
              </label>

              {/* COD */}
              <label
                className={cn(
                  "flex items-start gap-3 p-4 border cursor-pointer transition-all",
                  paymentMethod === "CASH_ON_DELIVERY"
                    ? "border-charcoal bg-white"
                    : "border-sand hover:border-charcoal/40"
                )}
              >
                <input
                  type="radio"
                  value="CASH_ON_DELIVERY"
                  {...register("paymentMethod")}
                  onChange={() => {
                    setPaymentMethod("CASH_ON_DELIVERY");
                    setValue("paymentMethod", "CASH_ON_DELIVERY");
                  }}
                  className="mt-0.5 accent-charcoal"
                />
                <div>
                  <p className="font-medium text-sm">Cash on Delivery</p>
                  <p className="text-xs text-muted mt-0.5">Pay when you receive your order</p>
                </div>
              </label>
            </div>
          </section>

          {/* Notes */}
          <div>
            <label className="label">Order Notes (optional)</label>
            <textarea
              {...register("notes")}
              rows={2}
              className="input-field resize-none"
              placeholder="Any special instructions for your order..."
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-primary w-full py-4 text-base"
          >
            {isSubmitting ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Processing...
              </>
            ) : paymentMethod === "MPESA" ? (
              "Pay with M-Pesa →"
            ) : paymentMethod === "CARD" ? (
              "Continue to Card Payment →"
            ) : (
              "Place Order →"
            )}
          </button>

          <div className="flex items-center justify-center gap-2 text-xs text-muted">
            <Shield size={13} />
            <span>Your information is secure and encrypted</span>
          </div>
        </form>

        {/* ── ORDER SUMMARY ─── */}
        <aside className="lg:col-span-2">
          <div className="bg-white border border-sand p-5 sticky top-24">
            <h3 className="font-display text-lg font-medium mb-4">
              Order Summary
            </h3>
            <ul className="space-y-3 mb-4">
              {items.map((item) => (
                <li key={item.variantId} className="flex gap-3 text-sm">
                  <div className="w-12 h-14 bg-sand shrink-0 relative overflow-hidden">
                    {item.image && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={item.image}
                        alt={item.name}
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                    )}
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-charcoal text-white text-[9px] flex items-center justify-center rounded-full">
                      {item.quantity}
                    </span>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium leading-snug">{item.name}</p>
                    <p className="text-muted text-xs">Size: {item.size}</p>
                  </div>
                  <p className="font-medium shrink-0">
                    {formatPrice(item.price * item.quantity)}
                  </p>
                </li>
              ))}
            </ul>

            <div className="divider" />

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted">Subtotal</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Delivery</span>
                <span>
                  {deliveryFee === 0 ? (
                    <span className="text-green-600 font-medium">FREE</span>
                  ) : (
                    formatPrice(deliveryFee)
                  )}
                </span>
              </div>
              <div className="flex justify-between font-semibold text-base pt-2 border-t border-sand">
                <span>Total</span>
                <span>{formatPrice(total)}</span>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

// M-Pesa waiting/status screen
function MpesaWaitingScreen({
  status,
  total,
  onRetry,
}: {
  status: string;
  total: number;
  onRetry: () => void;
}) {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        {status === "success" ? (
          <>
            <div className="w-20 h-20 bg-green-100 flex items-center justify-center mx-auto mb-5">
              <Check size={40} className="text-green-600" />
            </div>
            <h2 className="font-display text-3xl font-light mb-2">
              Payment Successful!
            </h2>
            <p className="text-muted">Redirecting you to your order confirmation...</p>
          </>
        ) : status === "failed" ? (
          <>
            <div className="w-20 h-20 bg-red-100 flex items-center justify-center mx-auto mb-5">
              <span className="text-4xl">✗</span>
            </div>
            <h2 className="font-display text-3xl font-light mb-2 text-red-600">
              Payment Failed
            </h2>
            <p className="text-muted mb-6">
              The payment was not completed. Please try again.
            </p>
            <button onClick={onRetry} className="btn-primary">
              Try Again
            </button>
          </>
        ) : (
          <>
            <div className="w-20 h-20 bg-green-100 flex items-center justify-center mx-auto mb-5">
              <span className="text-3xl font-bold text-green-700">M</span>
            </div>
            <h2 className="font-display text-3xl font-light mb-3">
              Check Your Phone
            </h2>
            <div className="bg-green-50 border border-green-200 p-5 mb-6 text-left">
              <p className="text-sm text-charcoal font-medium mb-3">
                Follow these steps:
              </p>
              <ol className="space-y-2 text-sm text-charcoal/80">
                <li className="flex gap-2">
                  <span className="font-bold text-green-700 shrink-0">1.</span>
                  A payment request for{" "}
                  <strong>{formatPrice(total)}</strong> has been sent to your
                  Safaricom number
                </li>
                <li className="flex gap-2">
                  <span className="font-bold text-green-700 shrink-0">2.</span>
                  Enter your <strong>M-Pesa PIN</strong> when prompted
                </li>
                <li className="flex gap-2">
                  <span className="font-bold text-green-700 shrink-0">3.</span>
                  Wait for confirmation — do not close this page
                </li>
              </ol>
            </div>
            <div className="flex items-center justify-center gap-2 text-muted text-sm">
              <Loader2 size={16} className="animate-spin" />
              Waiting for payment confirmation...
            </div>
            <button
              onClick={onRetry}
              className="mt-6 text-xs text-muted underline"
            >
              Cancel and go back
            </button>
          </>
        )}
      </div>
    </div>
  );
}
