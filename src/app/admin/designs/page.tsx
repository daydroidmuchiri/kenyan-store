// src/app/admin/designs/page.tsx
// Admin panel for reviewing and managing custom print designs

import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { authOptions } from "@/lib/auth/auth.config";
import prisma from "@/lib/db/prisma";
import { formatPrice } from "@/lib/utils";
import { AdminDesignCard } from "@/components/print/AdminDesignCard";

interface AdminDesignsPageProps {
  searchParams: { status?: string; page?: string };
}

async function getDesigns(status?: string, page = 1) {
  const where = status
    ? { status: status as any }
    : {};

  const [designs, total] = await Promise.all([
    prisma.customDesign.findMany({
      where,
      include: {
        user: { select: { name: true, email: true } },
        printableProduct: { select: { name: true } },
        customOrderItem: {
          include: {
            order: { select: { orderNumber: true, total: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 20,
      skip: (page - 1) * 20,
    }),
    prisma.customDesign.count({ where }),
  ]);

  return { designs, total };
}

async function getStatusCounts() {
  const statuses = [
    "PENDING_REVIEW",
    "APPROVED",
    "REJECTED",
    "FLAGGED",
    "IN_PRODUCTION",
    "COMPLETED",
  ];

  const counts = await Promise.all(
    statuses.map((s) =>
      prisma.customDesign.count({ where: { status: s as any } })
    )
  );

  return Object.fromEntries(statuses.map((s, i) => [s, counts[i]]));
}

const STATUS_CONFIG: Record<
  string,
  { label: string; color: string; bg: string }
> = {
  PENDING_REVIEW: { label: "Pending Review", color: "text-yellow-800", bg: "bg-yellow-100" },
  APPROVED: { label: "Approved", color: "text-green-800", bg: "bg-green-100" },
  REJECTED: { label: "Rejected", color: "text-red-800", bg: "bg-red-100" },
  FLAGGED: { label: "Flagged", color: "text-orange-800", bg: "bg-orange-100" },
  IN_PRODUCTION: { label: "In Production", color: "text-blue-800", bg: "bg-blue-100" },
  COMPLETED: { label: "Completed", color: "text-gray-800", bg: "bg-gray-100" },
};

export default async function AdminDesignsPage({
  searchParams,
}: AdminDesignsPageProps) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any)?.role !== "ADMIN") {
    redirect("/login");
  }

  const page = parseInt(searchParams.page || "1");
  const { designs, total } = await getDesigns(searchParams.status, page);
  const statusCounts = await getStatusCounts();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Admin Nav */}
      <header className="bg-charcoal text-cream px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/" className="font-display text-xl font-semibold tracking-widest">
            KWELI
          </Link>
          <span className="text-white/30">|</span>
          <span className="text-sm text-white/70">Admin · Custom Prints</span>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-56 bg-white border-r border-sand min-h-screen p-4">
          <nav className="space-y-1">
            {[
              { label: "Dashboard", href: "/admin/dashboard" },
              { label: "Products", href: "/admin/products" },
              { label: "Orders", href: "/admin/orders" },
              { label: "Custom Prints", href: "/admin/designs", active: true },
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

        <main className="flex-1 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="font-display text-3xl font-light">
                Custom Print Designs
              </h1>
              <p className="text-muted text-sm mt-0.5">
                Review and approve customer designs before printing
              </p>
            </div>
          </div>

          {/* Status filter tabs */}
          <div className="flex flex-wrap gap-2 mb-6">
            <Link
              href="/admin/designs"
              className={`px-3 py-1.5 text-sm border transition-colors ${
                !searchParams.status
                  ? "bg-charcoal text-cream border-charcoal"
                  : "border-sand hover:border-charcoal bg-white"
              }`}
            >
              All ({Object.values(statusCounts).reduce((a, b) => a + b, 0)})
            </Link>
            {Object.entries(statusCounts).map(([status, count]) => {
              const cfg = STATUS_CONFIG[status];
              return (
                <Link
                  key={status}
                  href={`/admin/designs?status=${status}`}
                  className={`px-3 py-1.5 text-sm border transition-colors ${
                    searchParams.status === status
                      ? "bg-charcoal text-cream border-charcoal"
                      : "border-sand hover:border-charcoal bg-white"
                  }`}
                >
                  {cfg?.label} ({count})
                  {status === "PENDING_REVIEW" && count > 0 && (
                    <span className="ml-1.5 w-4 h-4 bg-red-500 text-white text-[10px] inline-flex items-center justify-center">
                      {count}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>

          {/* Designs grid */}
          {designs.length === 0 ? (
            <div className="bg-white border border-sand p-12 text-center">
              <p className="font-display text-xl font-light text-muted">
                No designs found
              </p>
              {searchParams.status && (
                <Link
                  href="/admin/designs"
                  className="mt-4 inline-block text-sm text-brand-600 underline"
                >
                  View all designs
                </Link>
              )}
            </div>
          ) : (
            <div className="grid lg:grid-cols-2 xl:grid-cols-3 gap-5">
              {designs.map((design) => (
                <AdminDesignCard
                  key={design.id}
                  design={{
                    ...design,
                    customOrderItem: design.customOrderItem
                      ? {
                          ...design.customOrderItem,
                          order: {
                            ...design.customOrderItem.order,
                            total: Number(design.customOrderItem.order.total),
                          },
                        }
                      : null,
                  }}
                />
              ))}
            </div>
          )}

          {/* Pagination */}
          {total > 20 && (
            <div className="flex justify-center gap-2 mt-8">
              {Array.from({ length: Math.ceil(total / 20) }, (_, i) => i + 1).map(
                (p) => (
                  <Link
                    key={p}
                    href={`/admin/designs?${
                      searchParams.status ? `status=${searchParams.status}&` : ""
                    }page=${p}`}
                    className={`w-9 h-9 flex items-center justify-center text-sm border ${
                      page === p
                        ? "bg-charcoal text-cream border-charcoal"
                        : "border-sand hover:border-charcoal bg-white"
                    }`}
                  >
                    {p}
                  </Link>
                )
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
