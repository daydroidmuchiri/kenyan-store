export const dynamic = "force-dynamic";
// src/app/account/designs/page.tsx
// Customer's custom print designs history

import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Palette, Plus, ExternalLink } from "lucide-react";
import { authOptions } from "@/lib/auth/auth.config";
import prisma from "@/lib/db/prisma";
import { cn } from "@/lib/utils";

async function getUserDesigns(userId: string) {
  return prisma.customDesign.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: {
      printableProduct: { select: { name: true, slug: true } },
      customOrderItem: {
        include: {
          order: { select: { orderNumber: true, status: true } },
        },
      },
    },
  });
}

const STATUS_STYLE: Record<string, { label: string; classes: string }> = {
  PENDING_REVIEW: { label: "Under Review", classes: "bg-yellow-100 text-yellow-800" },
  APPROVED: { label: "Approved", classes: "bg-green-100 text-green-800" },
  REJECTED: { label: "Rejected", classes: "bg-red-100 text-red-800" },
  FLAGGED: { label: "Flagged", classes: "bg-orange-100 text-orange-800" },
  IN_PRODUCTION: { label: "Being Printed", classes: "bg-blue-100 text-blue-800" },
  COMPLETED: { label: "Completed", classes: "bg-gray-100 text-gray-700" },
};

const PRINT_STATUS_STYLE: Record<string, string> = {
  AWAITING_APPROVAL: "Awaiting Approval",
  APPROVED_FOR_PRINT: "Approved for Print",
  PRINTING: "🖨️ Printing...",
  QUALITY_CHECK: "Quality Check",
  SHIPPED: "📦 Shipped!",
  CANCELLED: "Cancelled",
};

export default async function MyDesignsPage() {
  const session = await getServerSession(authOptions);
  const user = session?.user as any;
  
  if (!user?.id) {
    redirect("/login?callbackUrl=/account/designs");
  }

  const designs = await getUserDesigns(user.id);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl font-light">My Custom Prints</h1>
          <p className="text-muted text-sm mt-1">
            Track your designs and print status
          </p>
        </div>
        <Link href="/custom-print" className="btn-primary gap-2">
          <Plus size={16} />
          New Design
        </Link>
      </div>

      {designs.length === 0 ? (
        <div className="bg-white border border-sand p-16 text-center">
          <Palette size={48} className="text-sand mx-auto mb-4" />
          <h2 className="font-display text-2xl font-light mb-2">
            No custom designs yet
          </h2>
          <p className="text-muted mb-6">
            Upload your artwork and we&apos;ll print it on a premium garment.
          </p>
          <Link href="/custom-print" className="btn-primary">
            Create Your First Design
          </Link>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {designs.map((design) => {
            const statusCfg = STATUS_STYLE[design.status] || {
              label: design.status,
              classes: "bg-gray-100 text-gray-700",
            };

            return (
              <div key={design.id} className="bg-white border border-sand overflow-hidden">
                {/* Preview */}
                <div className="relative aspect-[4/3] bg-gray-50">
                  {design.previewImageUrl ? (
                    <Image
                      src={design.previewImageUrl}
                      alt={`Custom ${design.printableProduct.name}`}
                      fill
                      className="object-contain p-3"
                      sizes="400px"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Image
                        src={design.originalFileUrl}
                        alt="Your design"
                        fill
                        className="object-contain p-8"
                        sizes="400px"
                      />
                    </div>
                  )}
                  <div className="absolute top-2 left-2">
                    <span
                      className={cn(
                        "text-xs font-medium px-2 py-0.5",
                        statusCfg.classes
                      )}
                    >
                      {statusCfg.label}
                    </span>
                  </div>
                </div>

                <div className="p-4 space-y-3">
                  <div>
                    <p className="font-medium text-sm">
                      Custom {design.printableProduct.name}
                    </p>
                    <p className="text-xs text-muted">
                      {design.selectedColor} · Size {design.selectedSize}
                    </p>
                    <p className="text-xs text-muted">
                      {new Date(design.createdAt).toLocaleDateString("en-KE", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                  </div>

                  {/* Print status */}
                  {design.customOrderItem && (
                    <div className="border-t border-sand pt-3">
                      <p className="text-xs text-muted mb-1">Print Status</p>
                      <p className="text-sm font-medium">
                        {PRINT_STATUS_STYLE[design.customOrderItem.printStatus] ||
                          design.customOrderItem.printStatus}
                      </p>
                      <p className="text-xs text-muted mt-0.5">
                        Order:{" "}
                        <span className="text-brand-600 font-medium">
                          {design.customOrderItem.order.orderNumber}
                        </span>
                      </p>
                    </div>
                  )}

                  {/* Admin rejection note */}
                  {design.status === "REJECTED" && design.moderationNotes && (
                    <div className="border border-red-200 bg-red-50 p-2.5">
                      <p className="text-xs text-red-700 font-medium mb-0.5">
                        Rejection reason:
                      </p>
                      <p className="text-xs text-red-600">
                        {design.moderationNotes}
                      </p>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2">
                    <a
                      href={design.originalFileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-xs text-muted hover:text-brand-600 transition-colors"
                    >
                      <ExternalLink size={12} />
                      View File
                    </a>
                    {design.status === "REJECTED" && (
                      <Link
                        href={`/custom-print/${design.printableProduct.slug}`}
                        className="text-xs text-brand-600 hover:underline ml-auto"
                      >
                        Try Again →
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
