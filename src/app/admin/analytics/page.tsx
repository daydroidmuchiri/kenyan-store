import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth/auth.config";
import prisma from "@/lib/db/prisma";
import { formatPrice } from "@/lib/utils";
import { TrendingUp, CreditCard, ShoppingBag, ArrowUpRight } from "lucide-react";

export const metadata = {
  title: "Analytics | Admin",
};

export default async function AdminAnalyticsPage() {
  const session = await getServerSession(authOptions);
  const user = session?.user as any;

  if (!session || user?.role !== "ADMIN") {
    redirect("/login");
  }

  // 1. Fetch all PAID orders to calculate total revenue generated
  const revenueAggregation = await prisma.order.aggregate({
    where: { paymentStatus: "PAID" },
    _sum: { total: true },
  });
  const totalRevenue = Number(revenueAggregation._sum.total || 0);

  // 2. Aggregate orders by payment method
  const ordersByPaymentMethod = await prisma.order.groupBy({
    by: ["paymentMethod"],
    _count: { id: true },
    _sum: { total: true },
  });

  // 3. Find top selling products (raw counting from OrderItems)
  const topProducts = await prisma.orderItem.groupBy({
    by: ["productId", "productName"],
    _sum: { quantity: true, price: true },
    orderBy: { _sum: { quantity: "desc" } },
    take: 5,
  });

  // 4. Custom prints vs Standard products revenue breakdown
  const customOrdersAgg = await prisma.customOrderItem.count();
  const standardOrdersAgg = await prisma.orderItem.count();

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-display text-3xl font-light">Analytics</h1>
          <p className="text-muted text-sm mt-1">Deep dive into your store&apos;s performance metrics.</p>
        </div>
      </div>

      {/* High Level KPI */}
      <div className="bg-charcoal text-cream p-8 mb-8 border border-charcoal relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
        <div className="relative z-10 hidden sm:block">
          <TrendingUp size={120} className="absolute right-0 bottom-0 text-white/5 -mb-6 -mr-6" />
        </div>
        
        <p className="text-sm text-white/70 uppercase tracking-widest font-semibold mb-2">Lifetime Revenue</p>
        <h2 className="font-display text-5xl font-light mb-4">{formatPrice(totalRevenue)}</h2>
        <div className="flex items-center gap-2 text-sm text-green-400 font-medium">
          <ArrowUpRight size={16} />
          <span>Active & Growing</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Payment Methods Breakdown */}
        <div className="bg-white border border-sand p-6">
          <div className="flex items-center gap-2 mb-6 text-charcoal">
            <CreditCard size={20} />
            <h3 className="font-display text-xl font-medium">Payment Methods</h3>
          </div>
          <div className="space-y-4">
            {ordersByPaymentMethod.length === 0 ? (
              <p className="text-muted text-sm">No payment data available yet.</p>
            ) : (
              ordersByPaymentMethod.map((method) => (
                <div key={method.paymentMethod} className="flex items-center justify-between border-b border-sand pb-4 last:border-0 last:pb-0">
                  <div className="flex flex-col">
                    <span className="font-medium text-sm text-charcoal">{method.paymentMethod}</span>
                    <span className="text-xs text-muted">{method._count.id} transactions</span>
                  </div>
                  <div className="font-medium text-brand-600">
                    {formatPrice(Number(method._sum.total || 0))}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Product Mix (Standard vs Custom) */}
        <div className="bg-white border border-sand p-6">
          <div className="flex items-center gap-2 mb-6 text-charcoal">
            <ShoppingBag size={20} />
            <h3 className="font-display text-xl font-medium">Product Mix</h3>
          </div>
          <div className="space-y-6">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="font-medium text-charcoal">Standard Products</span>
                <span className="text-muted">{standardOrdersAgg} sold</span>
              </div>
              <div className="w-full bg-sand h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-brand-600 h-full rounded-full" 
                  style={{ width: `${Math.max(5, (standardOrdersAgg / (standardOrdersAgg + customOrdersAgg || 1)) * 100)}%` }}
                ></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="font-medium text-charcoal">Custom Prints</span>
                <span className="text-muted">{customOrdersAgg} sold</span>
              </div>
              <div className="w-full bg-sand h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-purple-500 h-full rounded-full" 
                  style={{ width: `${Math.max(5, (customOrdersAgg / (standardOrdersAgg + customOrdersAgg || 1)) * 100)}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Top Products */}
      <div className="bg-white border border-sand p-6">
        <h3 className="font-display text-xl font-medium text-charcoal mb-6">Top Selling Products</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-sand text-left text-xs uppercase tracking-wider text-muted font-medium">
                <th className="pb-4">Product Name</th>
                <th className="pb-4 text-right">Units Sold</th>
                <th className="pb-4 text-right">Revenue Generated</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sand">
              {topProducts.length === 0 ? (
                <tr>
                  <td colSpan={3} className="py-8 text-center text-muted">No sales data available yet.</td>
                </tr>
              ) : (
                topProducts.map((product) => (
                  <tr key={product.productId} className="hover:bg-gray-50/50 transition-colors">
                    <td className="py-4 font-medium text-charcoal">{product.productName}</td>
                    <td className="py-4 text-right text-brand-600 font-medium">{product._sum.quantity}</td>
                    <td className="py-4 text-right text-muted">{formatPrice(Number(product._sum.price || 0) * Number(product._sum.quantity || 0))}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
