import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth/auth.config";
import prisma from "@/lib/db/prisma";
import Link from "next/link";
import { Search, Eye, Filter } from "lucide-react";
import { formatPrice } from "@/lib/utils";

export const metadata = {
  title: "Orders Management | Admin",
};

export default async function AdminOrdersPage() {
  const session = await getServerSession(authOptions);
  const user = session?.user as any;

  if (!session || user?.role !== "ADMIN") {
    redirect("/login");
  }

  const orders = await prisma.order.findMany({
    include: {
      user: {
        select: { name: true, email: true },
      },
      _count: {
        select: { items: true, customOrderItems: true }
      }
    },
    orderBy: { createdAt: "desc" },
  });

  const statusColors: Record<string, string> = {
    PENDING: "bg-yellow-100 text-yellow-800 border-yellow-200",
    CONFIRMED: "bg-blue-100 text-blue-800 border-blue-200",
    PROCESSING: "bg-indigo-100 text-indigo-800 border-indigo-200",
    SHIPPED: "bg-purple-100 text-purple-800 border-purple-200",
    DELIVERED: "bg-green-100 text-green-800 border-green-200",
    CANCELLED: "bg-red-100 text-red-800 border-red-200",
    REFUNDED: "bg-gray-100 text-gray-800 border-gray-200",
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-display text-3xl font-light">Orders</h1>
          <p className="text-muted text-sm mt-1">Track and manage customer purchases and fulfillment.</p>
        </div>
      </div>

      <div className="bg-white border border-sand">
        <div className="p-4 border-b border-sand flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={16} />
            <input 
              type="text" 
              placeholder="Search by order number or email..." 
              className="w-full pl-9 pr-4 py-2 text-sm border border-sand bg-gray-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-brand-600 transition-colors"
            />
          </div>
          <div className="flex items-center gap-4 w-full sm:w-auto">
            <button className="flex items-center gap-2 px-3 py-2 text-sm border border-sand hover:bg-gray-50 transition-colors bg-white">
              <Filter size={14} />
              Filter by Status
            </button>
            <div className="text-sm text-muted shrink-0">
              {orders.length} orders total
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-sand text-left text-xs uppercase tracking-wider text-muted font-medium">
                <th className="px-6 py-4">Order Number</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Payment</th>
                <th className="px-6 py-4">Fulfillment</th>
                <th className="px-6 py-4">Items</th>
                <th className="px-6 py-4">Total</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sand">
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-muted">
                    No orders have been placed yet.
                  </td>
                </tr>
              ) : (
                orders.map((order) => {
                  const totalItems = order._count.items + order._count.customOrderItems;
                  
                  return (
                    <tr key={order.id} className="hover:bg-gray-50/50 transition-colors group">
                      <td className="px-6 py-4 font-medium text-brand-600">
                        <Link href={`/admin/orders/${order.id}`}>
                          {order.orderNumber}
                        </Link>
                      </td>
                      <td className="px-6 py-4 text-muted">
                        {new Date(order.createdAt).toLocaleDateString("en-KE", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-charcoal font-medium">{order.user.name || "Guest"}</div>
                        <div className="text-xs text-muted">{order.user.email}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1 items-start">
                          <span className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-sm border ${
                            order.paymentStatus === "PAID" ? "bg-green-100 text-green-800 border-green-200" :
                            order.paymentStatus === "FAILED" ? "bg-red-100 text-red-800 border-red-200" :
                            "bg-yellow-100 text-yellow-800 border-yellow-200"
                          }`}>
                            {order.paymentStatus}
                          </span>
                          <span className="text-[10px] uppercase text-muted tracking-wider font-semibold">
                            {order.paymentMethod}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-sm border ${
                          statusColors[order.status] || "bg-gray-100 text-gray-800 border-gray-200"
                        }`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-charcoal">
                        {totalItems} items
                      </td>
                      <td className="px-6 py-4 font-medium text-charcoal">
                        {formatPrice(Number(order.total))}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link 
                          href={`/admin/orders/${order.id}`}
                          className="inline-flex p-1.5 text-muted hover:text-brand-600 transition-colors" 
                          title="View Order Details"
                        >
                          <Eye size={16} />
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
