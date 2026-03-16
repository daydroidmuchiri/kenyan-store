export const dynamic = "force-dynamic";
// src/app/admin/dashboard/page.tsx
// Admin dashboard with stats and recent orders

import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  Package,
  ShoppingBag,
  Users,
  TrendingUp,
  ArrowRight,
  Plus,
} from "lucide-react";
import { authOptions } from "@/lib/auth/auth.config";
import prisma from "@/lib/db/prisma";
import { formatPrice } from "@/lib/utils";

async function getAdminStats() {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [
    totalRevenue,
    totalOrders,
    totalProducts,
    totalCustomers,
    revenueThisMonth,
    ordersThisMonth,
    recentOrders,
  ] = await Promise.all([
    prisma.order
      .aggregate({
        where: { paymentStatus: "PAID" },
        _sum: { total: true },
      })
      .then((r) => Number(r._sum.total || 0)),

    prisma.order.count(),

    prisma.product.count({ where: { isActive: true } }),

    prisma.user.count({ where: { role: "CUSTOMER" } }),

    prisma.order
      .aggregate({
        where: {
          paymentStatus: "PAID",
          createdAt: { gte: startOfMonth },
        },
        _sum: { total: true },
      })
      .then((r) => Number(r._sum.total || 0)),

    prisma.order.count({
      where: { createdAt: { gte: startOfMonth } },
    }),

    prisma.order.findMany({
      take: 10,
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { name: true, email: true } },
      },
    }),
  ]);

  return {
    totalRevenue,
    totalOrders,
    totalProducts,
    totalCustomers,
    revenueThisMonth,
    ordersThisMonth,
    recentOrders,
  };
}

export default async function AdminDashboard() {
  const session = await getServerSession(authOptions);
  const user = session?.user as any;

  if (!session || user?.role !== "ADMIN") {
    redirect("/login");
  }

  const stats = await getAdminStats();

  const statCards = [
    {
      label: "Total Revenue",
      value: formatPrice(stats.totalRevenue),
      sub: `${formatPrice(stats.revenueThisMonth)} this month`,
      icon: TrendingUp,
      color: "text-green-600 bg-green-50",
    },
    {
      label: "Total Orders",
      value: stats.totalOrders.toLocaleString(),
      sub: `${stats.ordersThisMonth} this month`,
      icon: ShoppingBag,
      color: "text-blue-600 bg-blue-50",
    },
    {
      label: "Products",
      value: stats.totalProducts.toLocaleString(),
      sub: "Active listings",
      icon: Package,
      color: "text-brand-600 bg-brand-50",
    },
    {
      label: "Customers",
      value: stats.totalCustomers.toLocaleString(),
      sub: "Registered users",
      icon: Users,
      color: "text-purple-600 bg-purple-50",
    },
  ];

  const statusColors: Record<string, string> = {
    PENDING: "bg-yellow-100 text-yellow-800",
    CONFIRMED: "bg-blue-100 text-blue-800",
    PROCESSING: "bg-indigo-100 text-indigo-800",
    SHIPPED: "bg-purple-100 text-purple-800",
    DELIVERED: "bg-green-100 text-green-800",
    CANCELLED: "bg-red-100 text-red-800",
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Admin Nav */}
      <header className="bg-charcoal text-cream px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="font-display text-xl font-semibold tracking-widest"
          >
            BNs Fashion Wear
          </Link>
          <span className="text-white/30">|</span>
          <span className="text-sm text-white/70">Admin</span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/shop" className="text-sm text-white/70 hover:text-white">
            View Store
          </Link>
          <span className="text-xs text-white/50">{user?.email}</span>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-56 bg-white border-r border-sand min-h-screen p-4">
          <nav className="space-y-1">
            {[
              { label: "Dashboard", href: "/admin/dashboard", active: true },
              { label: "Products", href: "/admin/products" },
              { label: "Orders", href: "/admin/orders" },
              { label: "Custom Prints", href: "/admin/designs" },
              { label: "Customers", href: "/admin/customers" },
              { label: "Analytics", href: "/admin/analytics" },
            ].map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className={`block px-3 py-2.5 text-sm transition-colors ${
                  item.active
                    ? "bg-charcoal text-cream font-medium"
                    : "text-charcoal hover:bg-sand"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </aside>

        {/* Main content */}
        <main className="flex-1 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="font-display text-3xl font-light">Dashboard</h1>
              <p className="text-muted text-sm">
                {new Date().toLocaleDateString("en-KE", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
            <Link href="/admin/products/new" className="btn-primary gap-2">
              <Plus size={16} />
              Add Product
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {statCards.map((card) => (
              <div key={card.label} className="bg-white p-5 border border-sand">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs text-muted uppercase tracking-wider">
                    {card.label}
                  </p>
                  <div className={`w-8 h-8 flex items-center justify-center ${card.color}`}>
                    <card.icon size={16} />
                  </div>
                </div>
                <p className="font-display text-2xl font-medium text-charcoal">
                  {card.value}
                </p>
                <p className="text-xs text-muted mt-1">{card.sub}</p>
              </div>
            ))}
          </div>

          {/* Recent Orders */}
          <div className="bg-white border border-sand">
            <div className="flex items-center justify-between px-5 py-4 border-b border-sand">
              <h2 className="font-display text-lg font-medium">Recent Orders</h2>
              <Link
                href="/admin/orders"
                className="text-xs text-brand-600 flex items-center gap-1 hover:gap-2 transition-all"
              >
                View all <ArrowRight size={12} />
              </Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-sand bg-gray-50">
                    <th className="text-left px-5 py-3 text-xs uppercase tracking-wider text-muted font-medium">
                      Order
                    </th>
                    <th className="text-left px-5 py-3 text-xs uppercase tracking-wider text-muted font-medium">
                      Customer
                    </th>
                    <th className="text-left px-5 py-3 text-xs uppercase tracking-wider text-muted font-medium">
                      Total
                    </th>
                    <th className="text-left px-5 py-3 text-xs uppercase tracking-wider text-muted font-medium">
                      Payment
                    </th>
                    <th className="text-left px-5 py-3 text-xs uppercase tracking-wider text-muted font-medium">
                      Status
                    </th>
                    <th className="text-left px-5 py-3 text-xs uppercase tracking-wider text-muted font-medium">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-sand">
                  {stats.recentOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-3 font-medium text-brand-600">
                        <Link href={`/admin/orders/${order.id}`}>
                          {order.orderNumber}
                        </Link>
                      </td>
                      <td className="px-5 py-3 text-muted">
                        {order.user.name || order.user.email}
                      </td>
                      <td className="px-5 py-3 font-medium">
                        {formatPrice(Number(order.total))}
                      </td>
                      <td className="px-5 py-3">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 text-xs font-medium ${
                            order.paymentMethod === "MPESA"
                              ? "bg-green-100 text-green-800"
                              : order.paymentMethod === "CARD"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {order.paymentMethod}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 text-xs font-medium ${
                            statusColors[order.status] || "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {order.status}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-muted">
                        {new Date(order.createdAt).toLocaleDateString("en-KE", {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
