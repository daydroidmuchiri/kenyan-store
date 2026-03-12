// src/components/print/AdminDesignCard.tsx
"use client";

import { useState } from "react";
import Image from "next/image";
import {
  CheckCircle,
  XCircle,
  Flag,
  ChevronDown,
  ExternalLink,
  Printer,
  AlertTriangle,
  Loader2,
} from "lucide-react";
import toast from "react-hot-toast";
import { formatPrice } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { WARNING_LABELS } from "@/lib/utils/design-validation";

interface AdminDesign {
  id: string;
  status: string;
  createdAt: Date;
  qualityWarnings: string[];
  moderationNotes: string | null;
  selectedColor: string;
  selectedSize: string;
  placementX: number;
  placementY: number;
  designScale: number;
  designRotation: number;
  originalFileUrl: string;
  previewImageUrl: string | null;
  imageWidth: number;
  imageHeight: number;
  fileSizeBytes: number;
  fileType: string;
  user: { name: string | null; email: string | null };
  printableProduct: { name: string };
  customOrderItem: {
    id: string;
    printStatus: string;
    orderId: string;
    order: { orderNumber: string; total: number };
  } | null;
}

interface AdminDesignCardProps {
  design: AdminDesign;
}

const STATUS_STYLE: Record<string, string> = {
  PENDING_REVIEW: "bg-yellow-100 text-yellow-800",
  APPROVED: "bg-green-100 text-green-800",
  REJECTED: "bg-red-100 text-red-800",
  FLAGGED: "bg-orange-100 text-orange-800",
  IN_PRODUCTION: "bg-blue-100 text-blue-800",
  COMPLETED: "bg-gray-100 text-gray-700",
};

const PRINT_STATUS_STYLE: Record<string, string> = {
  AWAITING_APPROVAL: "bg-yellow-100 text-yellow-800",
  APPROVED_FOR_PRINT: "bg-green-100 text-green-800",
  PRINTING: "bg-blue-100 text-blue-800",
  QUALITY_CHECK: "bg-purple-100 text-purple-800",
  SHIPPED: "bg-teal-100 text-teal-800",
  CANCELLED: "bg-red-100 text-red-800",
};

const PRINT_STATUSES = [
  "AWAITING_APPROVAL",
  "APPROVED_FOR_PRINT",
  "PRINTING",
  "QUALITY_CHECK",
  "SHIPPED",
  "CANCELLED",
];

export function AdminDesignCard({ design }: AdminDesignCardProps) {
  const [currentStatus, setCurrentStatus] = useState(design.status);
  const [currentPrintStatus, setCurrentPrintStatus] = useState(
    design.customOrderItem?.printStatus || "AWAITING_APPROVAL"
  );
  const [notes, setNotes] = useState(design.moderationNotes || "");
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const [showPrintData, setShowPrintData] = useState(false);

  const handleModerate = async (action: "approve" | "reject" | "flag") => {
    setIsLoading(action);
    try {
      const res = await fetch(`/api/admin/designs/${design.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, moderationNotes: notes }),
      });
      if (!res.ok) throw new Error("Update failed");
      const data = await res.json();
      setCurrentStatus(data.status);

      const msgs = {
        approve: "✅ Design approved for printing",
        reject: "❌ Design rejected",
        flag: "🚩 Design flagged for review",
      };
      toast.success(msgs[action]);

      if (action === "approve") {
        setCurrentPrintStatus("APPROVED_FOR_PRINT");
      }
      if (action === "reject") {
        setCurrentPrintStatus("CANCELLED");
      }
    } catch {
      toast.error("Action failed");
    } finally {
      setIsLoading(null);
    }
  };

  const handlePrintStatusUpdate = async (newStatus: string) => {
    if (!design.customOrderItem) return;
    setIsLoading("print");
    try {
      const res = await fetch("/api/admin/designs/print-status", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customOrderItemId: design.customOrderItem.id,
          printStatus: newStatus,
          adminNotes: notes,
        }),
      });
      if (!res.ok) throw new Error("Update failed");
      setCurrentPrintStatus(newStatus);
      toast.success(`Print status updated: ${newStatus.replace(/_/g, " ")}`);
    } catch {
      toast.error("Status update failed");
    } finally {
      setIsLoading(null);
    }
  };

  const isPendingReview = currentStatus === "PENDING_REVIEW";

  return (
    <div className="bg-white border border-sand overflow-hidden">
      {/* Preview */}
      <div className="relative aspect-[4/3] bg-gray-100">
        {design.previewImageUrl ? (
          <Image
            src={design.previewImageUrl}
            alt="Design preview"
            fill
            className="object-contain p-2"
            sizes="400px"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-muted text-sm">
            No preview generated
          </div>
        )}

        {/* Status badge */}
        <div className="absolute top-2 left-2 flex gap-1.5">
          <span
            className={cn(
              "text-xs font-medium px-2 py-0.5",
              STATUS_STYLE[currentStatus]
            )}
          >
            {currentStatus.replace(/_/g, " ")}
          </span>
          {design.qualityWarnings.length > 0 && (
            <span className="text-xs font-medium px-2 py-0.5 bg-amber-100 text-amber-800 flex items-center gap-1">
              <AlertTriangle size={10} />
              {design.qualityWarnings.length} warning{design.qualityWarnings.length > 1 ? "s" : ""}
            </span>
          )}
        </div>

        {/* View original */}
        <a
          href={design.originalFileUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="absolute top-2 right-2 p-1.5 bg-white/90 hover:bg-white transition-colors"
          title="View original file"
        >
          <ExternalLink size={14} className="text-charcoal" />
        </a>
      </div>

      <div className="p-4 space-y-3">
        {/* Customer + product info */}
        <div>
          <p className="font-medium text-sm">{design.printableProduct.name}</p>
          <p className="text-xs text-muted">
            {design.user.name || design.user.email}
          </p>
          <p className="text-xs text-muted">
            {new Date(design.createdAt).toLocaleDateString("en-KE", {
              day: "numeric",
              month: "short",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        </div>

        {/* Order link */}
        {design.customOrderItem && (
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted">
              Order:{" "}
              <span className="font-medium text-charcoal">
                {design.customOrderItem.order.orderNumber}
              </span>
            </span>
            <span className="font-semibold">
              {formatPrice(design.customOrderItem.order.total)}
            </span>
          </div>
        )}

        {/* Product specs */}
        <div className="flex flex-wrap gap-2 text-xs">
          <span className="bg-sand px-2 py-0.5">
            Color: {design.selectedColor}
          </span>
          <span className="bg-sand px-2 py-0.5">
            Size: {design.selectedSize}
          </span>
          <span className="bg-sand px-2 py-0.5">
            {design.fileType.toUpperCase()}
          </span>
          <span className="bg-sand px-2 py-0.5">
            {design.imageWidth}×{design.imageHeight}px
          </span>
        </div>

        {/* Warnings */}
        {design.qualityWarnings.length > 0 && (
          <div className="space-y-1">
            {design.qualityWarnings.map((code) => {
              const w = WARNING_LABELS[code];
              return (
                <p
                  key={code}
                  className="text-xs text-amber-700 bg-amber-50 px-2 py-1 flex items-start gap-1"
                >
                  <AlertTriangle size={11} className="mt-0.5 shrink-0" />
                  {w?.label || code}
                </p>
              );
            })}
          </div>
        )}

        {/* Print data accordion */}
        <button
          onClick={() => setShowPrintData(!showPrintData)}
          className="w-full flex items-center justify-between text-xs text-muted hover:text-charcoal transition-colors py-1 border-t border-sand"
        >
          <span className="flex items-center gap-1.5">
            <Printer size={12} />
            Print Placement Data
          </span>
          <ChevronDown
            size={12}
            className={cn("transition-transform", showPrintData && "rotate-180")}
          />
        </button>

        {showPrintData && (
          <div className="text-xs bg-gray-50 p-3 font-mono space-y-1 text-gray-700">
            <div>Position X: {design.placementX.toFixed(1)}%</div>
            <div>Position Y: {design.placementY.toFixed(1)}%</div>
            <div>Scale: {design.designScale.toFixed(1)}%</div>
            <div>Rotation: {design.designRotation.toFixed(1)}°</div>
            <div>File: {design.fileType.toUpperCase()}</div>
            <div>Dimensions: {design.imageWidth}×{design.imageHeight}px</div>
            <div>File size: {(design.fileSizeBytes / 1024).toFixed(0)}KB</div>
            <a
              href={design.originalFileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-brand-600 underline flex items-center gap-1"
            >
              Download original file <ExternalLink size={10} />
            </a>
          </div>
        )}

        {/* Admin notes */}
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Admin notes (optional — shown to customer if rejected)..."
          rows={2}
          className="w-full text-xs border border-sand px-2 py-1.5 resize-none focus:outline-none focus:border-charcoal"
        />

        {/* Moderation actions */}
        {isPendingReview || currentStatus === "FLAGGED" ? (
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => handleModerate("approve")}
              disabled={!!isLoading}
              className="flex items-center justify-center gap-1 py-2 text-xs font-medium bg-green-600 text-white hover:bg-green-700 disabled:opacity-50 transition-colors"
            >
              {isLoading === "approve" ? (
                <Loader2 size={12} className="animate-spin" />
              ) : (
                <CheckCircle size={12} />
              )}
              Approve
            </button>
            <button
              onClick={() => handleModerate("reject")}
              disabled={!!isLoading}
              className="flex items-center justify-center gap-1 py-2 text-xs font-medium bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 transition-colors"
            >
              {isLoading === "reject" ? (
                <Loader2 size={12} className="animate-spin" />
              ) : (
                <XCircle size={12} />
              )}
              Reject
            </button>
            <button
              onClick={() => handleModerate("flag")}
              disabled={!!isLoading}
              className="flex items-center justify-center gap-1 py-2 text-xs font-medium border border-orange-400 text-orange-600 hover:bg-orange-50 disabled:opacity-50 transition-colors"
            >
              {isLoading === "flag" ? (
                <Loader2 size={12} className="animate-spin" />
              ) : (
                <Flag size={12} />
              )}
              Flag
            </button>
          </div>
        ) : (
          /* Print workflow status for approved designs */
          currentStatus === "APPROVED" ||
          currentStatus === "IN_PRODUCTION" ||
          currentStatus === "COMPLETED" ? (
            <div>
              <p className="text-xs text-muted mb-1.5">Print Status</p>
              <div className="flex flex-wrap gap-1.5">
                <span
                  className={cn(
                    "text-xs px-2 py-0.5 font-medium",
                    PRINT_STATUS_STYLE[currentPrintStatus]
                  )}
                >
                  {currentPrintStatus.replace(/_/g, " ")}
                </span>
              </div>
              <select
                value={currentPrintStatus}
                onChange={(e) => handlePrintStatusUpdate(e.target.value)}
                disabled={isLoading === "print"}
                className="mt-2 w-full text-xs border border-sand px-2 py-1.5 focus:outline-none focus:border-charcoal bg-white"
              >
                {PRINT_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s.replace(/_/g, " ")}
                  </option>
                ))}
              </select>
            </div>
          ) : null
        )}
      </div>
    </div>
  );
}
