export const dynamic = "force-dynamic";
// src/app/confirmation/page.tsx
import { notFound } from "next/navigation";
import Link from "next/link";
import { CheckCircle, Package, Truck, MapPin } from "lucide-react";
import prisma from "@/lib/db/prisma";
import { formatPrice } from "@/lib/utils";

interface ConfirmationPageProps {
  searchParams: { orderId?: string };
}

async function getOrder(orderId: string) {
  return prisma.order.findUnique({
    where: { id: orderId },
    include: {
      items: true,
    },
  });
}

export default async function ConfirmationPage({
  searchParams,
}: ConfirmationPageProps) {
  if (!searchParams.orderId) notFound();

  const order = await getOrder(searchParams.orderId);
  if (!order) notFound();

  const deliveryAddress = order.deliveryAddress as any;

  const statusSteps = [
    { label: "Order Confirmed", icon: CheckCircle, done: true },
    {
      label: "Processing",
      icon: Package,
      done: ["PROCESSING", "SHIPPED", "DELIVERED"].includes(order.status),
    },
    {
      label: "Shipped",
      icon: Truck,
      done: ["SHIPPED", "DELIVERED"].includes(order.status),
    },
    {
      label: "Delivered",
      icon: MapPin,
      done: order.status === "DELIVERED",
    },
  ];

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12">
      {/* Success header */}
      <div className="text-center mb-10">
        <div className="w-20 h-20 bg-green-100 flex items-center justify-center mx-auto mb-5">
          <CheckCircle size={40} className="text-green-600" />
        </div>
        <h1 className="font-display text-4xl font-light mb-2">
          Order Confirmed!
        </h1>
        <p className="text-muted">
          Thank you for shopping with KWELI. Your order has been received.
        </p>
      </div>

      {/* Order number */}
      <div className="bg-white border border-sand p-5 mb-6 text-center">
        <p className="text-xs text-muted uppercase tracking-widest mb-1">
          Order Number
        </p>
        <p className="font-display text-2xl font-medium text-brand-600">
          {order.orderNumber}
        </p>
        {order.mpesaReceiptNumber && (
          <>
            <p className="text-xs text-muted mt-2">M-Pesa Receipt</p>
            <p className="font-medium text-green-700">
              {order.mpesaReceiptNumber}
            </p>
          </>
        )}
      </div>

      {/* Order tracking */}
      <div className="bg-white border border-sand p-5 mb-6">
        <h2 className="font-display text-lg font-medium mb-5">
          Order Status
        </h2>
        <div className="flex items-center justify-between">
          {statusSteps.map((step, i) => (
            <div key={step.label} className="flex flex-col items-center flex-1">
              <div
                className={`w-8 h-8 flex items-center justify-center mb-2 ${
                  step.done ? "text-green-600" : "text-sand"
                }`}
              >
                <step.icon size={22} />
              </div>
              <p
                className={`text-xs text-center ${
                  step.done ? "text-charcoal font-medium" : "text-muted"
                }`}
              >
                {step.label}
              </p>
              {i < statusSteps.length - 1 && (
                <div
                  className={`absolute h-px w-1/4 mt-4 ${
                    step.done ? "bg-green-300" : "bg-sand"
                  }`}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Order items */}
      <div className="bg-white border border-sand p-5 mb-6">
        <h2 className="font-display text-lg font-medium mb-4">
          Items Ordered
        </h2>
        <ul className="space-y-3">
          {order.items.map((item) => (
            <li
              key={item.id}
              className="flex items-center justify-between text-sm"
            >
              <div>
                <p className="font-medium">{item.productName}</p>
                <p className="text-muted text-xs">
                  Size: {item.size}
                  {item.color && ` · ${item.color}`} · Qty: {item.quantity}
                </p>
              </div>
              <p className="font-medium">{formatPrice(Number(item.price) * item.quantity)}</p>
            </li>
          ))}
        </ul>

        <div className="border-t border-sand mt-4 pt-4 space-y-1.5 text-sm">
          <div className="flex justify-between">
            <span className="text-muted">Subtotal</span>
            <span>{formatPrice(Number(order.subtotal))}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted">Delivery</span>
            <span>
              {Number(order.deliveryFee) === 0
                ? "FREE"
                : formatPrice(Number(order.deliveryFee))}
            </span>
          </div>
          <div className="flex justify-between font-semibold text-base pt-1 border-t border-sand">
            <span>Total Paid</span>
            <span>{formatPrice(Number(order.total))}</span>
          </div>
        </div>
      </div>

      {/* Delivery info */}
      {deliveryAddress && (
        <div className="bg-white border border-sand p-5 mb-6">
          <h2 className="font-display text-lg font-medium mb-3">
            Delivery Details
          </h2>
          <div className="text-sm space-y-1 text-muted">
            <p className="text-charcoal font-medium">{deliveryAddress.fullName}</p>
            <p>{deliveryAddress.phone}</p>
            {deliveryAddress.town && (
              <p>
                {deliveryAddress.town}
                {deliveryAddress.county && `, ${deliveryAddress.county}`}
              </p>
            )}
            {deliveryAddress.street && <p>{deliveryAddress.street}</p>}
          </div>
        </div>
      )}

      {/* Next steps */}
      <div className="bg-brand-50 border border-brand-100 p-5 mb-8">
        <p className="font-medium text-sm mb-2">What happens next?</p>
        <ul className="space-y-1.5 text-sm text-muted">
          <li>📧 You&apos;ll receive an email confirmation shortly</li>
          <li>📦 We&apos;ll prepare your order within 24 hours</li>
          <li>🚚 You&apos;ll get a tracking update when it ships</li>
          <li>
            💬 Questions?{" "}
            <a
              href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER}?text=Hi! My order number is ${order.orderNumber}`}
              className="text-brand-600 underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              WhatsApp us
            </a>
          </li>
        </ul>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <Link href="/shop" className="btn-primary flex-1 text-center">
          Continue Shopping
        </Link>
        <Link href="/account/orders" className="btn-secondary flex-1 text-center">
          View My Orders
        </Link>
      </div>
    </div>
  );
}
