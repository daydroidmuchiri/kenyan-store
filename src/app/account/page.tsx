export const dynamic = "force-dynamic";
// src/app/account/page.tsx
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Package, MapPin, Heart, User, LogOut } from "lucide-react";
import { authOptions } from "@/lib/auth/auth.config";
import prisma from "@/lib/db/prisma";
import { formatPrice } from "@/lib/utils";

async function getAccountData(userId: string) {
  const [orders, addresses, wishlistCount] = await Promise.all([
    prisma.order.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 5,
      include: { items: { take: 1 } },
    }),
    prisma.address.count({ where: { userId } }),
    prisma.wishlistItem.count({ where: { userId } }),
  ]);
  return { orders, addresses, wishlistCount };
}

const statusColors: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-800",
  CONFIRMED: "bg-blue-100 text-blue-800",
  PROCESSING: "bg-indigo-100 text-indigo-800",
  SHIPPED: "bg-purple-100 text-purple-800",
  DELIVERED: "bg-green-100 text-green-800",
  CANCELLED: "bg-red-100 text-red-800",
};

export default async function AccountPage() {
  const session = await getServerSession(authOptions);
  const user = session?.user as any;

  if (!user?.id) {
    redirect("/login?callbackUrl=/account");
  }

  const { orders, addresses, wishlistCount } = await getAccountData(user.id);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl font-light">
            Hello, {user?.name?.split(" ")[0] || "there"} 👋
          </h1>
          <p className="text-muted text-sm mt-1">{user?.email}</p>
        </div>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
        {[
          { label: "Orders", value: orders.length, icon: Package, href: "/account/orders" },
          { label: "Addresses", value: addresses, icon: MapPin, href: "/account/addresses" },
          { label: "Wishlist", value: wishlistCount, icon: Heart, href: "/account/wishlist" },
          { label: "My Designs", value: "🎨", icon: User, href: "/account/designs" },
        ].map((stat) => (
          <Link
            key={stat.label}
            href={stat.href}
            className="bg-white border border-sand p-4 hover:border-charcoal transition-colors group"
          >
            <stat.icon size={20} className="text-brand-600 mb-2" />
            <p className="font-display text-2xl font-medium text-charcoal">
              {stat.value}
            </p>
            <p className="text-xs text-muted uppercase tracking-wider">
              {stat.label}
            </p>
          </Link>
        ))}
      </div>

      {/* Recent Orders */}
      <div className="bg-white border border-sand">
        <div className="flex items-center justify-between px-5 py-4 border-b border-sand">
          <h2 className="font-display text-lg font-medium">Recent Orders</h2>
          <Link href="/account/orders" className="text-xs text-brand-600 hover:underline">
            View all
          </Link>
        </div>

        {orders.length === 0 ? (
          <div className="text-center py-12">
            <Package size={40} className="text-sand mx-auto mb-3" />
            <p className="font-display text-xl font-light mb-2">No orders yet</p>
            <p className="text-muted text-sm mb-5">Your order history will appear here</p>
            <Link href="/shop" className="btn-primary">
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-sand">
            {orders.map((order) => (
              <Link
                key={order.id}
                href={`/account/orders/${order.id}`}
                className="flex items-center justify-between px-5 py-4 hover:bg-cream transition-colors"
              >
                <div>
                  <p className="font-medium text-sm">{order.orderNumber}</p>
                  <p className="text-xs text-muted mt-0.5">
                    {new Date(order.createdAt).toLocaleDateString("en-KE", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                    {" · "}
                    {order.items.length} item{order.items.length !== 1 ? "s" : ""}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className={`text-xs px-2 py-0.5 font-medium ${
                      statusColors[order.status] || "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {order.status}
                  </span>
                  <span className="font-semibold text-sm">
                    {formatPrice(Number(order.total))}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
