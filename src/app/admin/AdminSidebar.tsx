"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, ShoppingBag, ShoppingCart, Users, BarChart3, Palette } from "lucide-react";

export function AdminSidebar() {
  const pathname = usePathname();

  const navItems = [
    { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
    { label: "Products", href: "/admin/products", icon: ShoppingBag },
    { label: "Orders", href: "/admin/orders", icon: ShoppingCart },
    { label: "Custom Prints", href: "/admin/designs", icon: Palette },
    { label: "Customers", href: "/admin/customers", icon: Users },
    { label: "Analytics", href: "/admin/analytics", icon: BarChart3 },
  ];

  return (
    <aside className="w-64 bg-white border-r border-sand h-full overflow-y-auto py-6 flex flex-col hidden md:flex">
      <div className="px-6 mb-6">
        <h2 className="text-xs font-semibold text-muted uppercase tracking-wider">
          Management
        </h2>
      </div>
      <nav className="flex-1 space-y-1 px-3">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.label}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition-all ${
                isActive
                  ? "bg-charcoal text-cream font-medium shadow-sm"
                  : "text-charcoal hover:bg-sand"
              }`}
            >
              <item.icon size={18} className={isActive ? "text-cream" : "text-muted"} />
              {item.label}
            </Link>
          );
        })}
      </nav>
      
      <div className="p-6 mt-auto">
        <div className="bg-sand/30 rounded-lg p-4">
          <h3 className="text-sm font-medium text-charcoal mb-1">Need help?</h3>
          <p className="text-xs text-muted mb-3">Check the technical documentation for guidance.</p>
          <a href="#" className="text-xs font-medium text-brand-600 hover:text-brand-700">View Docs &rarr;</a>
        </div>
      </div>
    </aside>
  );
}
