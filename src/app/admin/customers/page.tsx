import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth/auth.config";
import prisma from "@/lib/db/prisma";
import { Search, Mail, Phone, Calendar } from "lucide-react";

export const metadata = {
  title: "Customers | Admin",
};

export default async function AdminCustomersPage() {
  const session = await getServerSession(authOptions);
  const user = session?.user as any;

  if (!session || user?.role !== "ADMIN") {
    redirect("/login");
  }

  const customers = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: { orders: true, customDesigns: true }
      }
    }
  });

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-display text-3xl font-light">Customers</h1>
          <p className="text-muted text-sm mt-1">View registered users and their activity.</p>
        </div>
      </div>

      <div className="bg-white border border-sand">
        <div className="p-4 border-b border-sand flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={16} />
            <input 
              type="text" 
              placeholder="Search customers by name or email..." 
              className="w-full pl-9 pr-4 py-2 text-sm border border-sand bg-gray-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-brand-600 transition-colors"
            />
          </div>
          <div className="text-sm text-muted shrink-0">
            {customers.length} total registered
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-sand text-left text-xs uppercase tracking-wider text-muted font-medium">
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Contact</th>
                <th className="px-6 py-4">Status / Role</th>
                <th className="px-6 py-4">Joined</th>
                <th className="px-6 py-4 text-right">Orders</th>
                <th className="px-6 py-4 text-right">Custom Designs</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sand">
              {customers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-muted">
                    No customers found.
                  </td>
                </tr>
              ) : (
                customers.map((customer) => (
                  <tr key={customer.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-sand flex items-center justify-center text-brand-600 font-medium">
                          {customer.name ? customer.name.charAt(0).toUpperCase() : customer.email?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-medium text-charcoal">{customer.name || "Guest User"}</div>
                          <div className="text-xs text-muted">ID: {customer.id.substring(customer.id.length - 8)}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-muted">
                      <div className="flex items-center gap-2 mb-1 text-charcoal">
                        <Mail size={12} className="text-muted" />
                        {customer.email || "No email"}
                      </div>
                      <div className="flex items-center gap-2 text-xs">
                        <Phone size={12} className="text-muted" />
                        {customer.phone || "No phone"}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-sm border ${
                        customer.role === "ADMIN" 
                          ? "bg-purple-100 text-purple-800 border-purple-200" 
                          : "bg-blue-100 text-blue-800 border-blue-200"
                      }`}>
                        {customer.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-muted">
                      <div className="flex items-center gap-2">
                        <Calendar size={14} />
                        {new Date(customer.createdAt).toLocaleDateString("en-KE", {
                          month: "short",
                          day: "numeric",
                          year: "numeric"
                        })}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right font-medium text-charcoal">
                      {customer._count.orders}
                    </td>
                    <td className="px-6 py-4 text-right font-medium text-charcoal">
                      {customer._count.customDesigns}
                    </td>
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
