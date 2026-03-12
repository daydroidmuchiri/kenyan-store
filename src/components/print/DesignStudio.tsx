// src/components/print/DesignStudio.tsx
"use client";

import {
  useState,
  useRef,
  useCallback,
  useEffect,
  type PointerEvent,
} from "react";
import Image from "next/image";
import {
  Upload,
  ZoomIn,
  ZoomOut,
  RotateCw,
  RotateCcw,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Loader2,
  ShoppingBag,
  X,
  Move,
} from "lucide-react";
import toast from "react-hot-toast";

import type {
  PrintableProductData,
  DesignPlacement,
  GarmentColor,
} from "@/types/print";
import {
  validateDesignFile,
  WARNING_LABELS,
} from "@/lib/utils/design-validation";
import {
  renderPreviewToCanvas,
  drawPrintAreaGuide,
  canvasToDataUrl,
  canvasToBlob,
  canvasCoordsToPlacement,
} from "@/lib/utils/design-canvas";
import { formatPrice } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { useCart } from "@/hooks/use-cart";

interface DesignStudioProps {
  product: PrintableProductData;
  onClose?: () => void;
}

const DEFAULT_PLACEMENT: DesignPlacement = {
  x: 50,
  y: 50,
  scale: 60,
  rotation: 0,
};

export function DesignStudio({ product, onClose }: DesignStudioProps) {
  const colors: GarmentColor[] = product.availableColors as GarmentColor[];

  // ── State ────────────────────────────────────────────────────────────────
  const [selectedColor, setSelectedColor] = useState<GarmentColor>(colors[0]);
  const [selectedSize, setSelectedSize] = useState(
    product.availableSizes[2] || product.availableSizes[0]
  );
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
  const [placement, setPlacement] = useState<DesignPlacement>(DEFAULT_PLACEMENT);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [showGuide, setShowGuide] = useState(true);
  const [step, setStep] = useState<"upload" | "design" | "confirm">("upload");
  const [fileMeta, setFileMeta] = useState<{
    width: number;
    height: number;
    size: number;
    type: string;
    cloudinaryUrl: string;
    cloudinaryId: string;
  } | null>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dragStartRef = useRef<{ mouseX: number; mouseY: number; px: number; py: number } | null>(null);

  const { addItem, openCart } = useCart();

  // ── Canvas render ─────────────────────────────────────────────────────────
  const renderCanvas = useCallback(async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    try {
      await renderPreviewToCanvas(canvas, {
        product,
        selectedColor,
        designImageUrl: uploadedImageUrl,
        placement,
        canvasWidth: 500,
        canvasHeight: 600,
      });
      if (showGuide && uploadedImageUrl) {
        drawPrintAreaGuide(canvas, product);
      }
    } catch (err) {
      console.error("Canvas render error:", err);
    }
  }, [product, selectedColor, uploadedImageUrl, placement, showGuide]);

  useEffect(() => {
    renderCanvas();
  }, [renderCanvas]);

  // ── File upload handler ───────────────────────────────────────────────────
  const handleFileSelect = async (file: File) => {
    setErrors([]);
    setWarnings([]);

    // Client-side validation
    const validation = await validateDesignFile(file);
    if (!validation.valid) {
      setErrors(validation.errors);
      return;
    }
    setWarnings(validation.warnings);

    // Preview locally while uploading to Cloudinary
    const localUrl = URL.createObjectURL(file);
    setUploadedImageUrl(localUrl);
    setUploadedFile(file);
    setIsUploading(true);

    try {
      // Upload to Cloudinary via our API route
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", "kweli_designs");

      const res = await fetch("/api/designs/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Upload failed");
      }

      const data = await res.json();
      setFileMeta({
        width: validation.width || 0,
        height: validation.height || 0,
        size: file.size,
        type: file.type.split("/")[1].replace("svg+xml", "svg"),
        cloudinaryUrl: data.secure_url,
        cloudinaryId: data.public_id,
      });

      // Replace blob URL with Cloudinary URL
      setUploadedImageUrl(data.secure_url);
      setStep("design");
      toast.success("Design uploaded! Now position it on your garment.");
    } catch (err: any) {
      toast.error(err.message || "Upload failed. Please try again.");
      setUploadedImageUrl(null);
      setUploadedFile(null);
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileSelect(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  };

  // ── Canvas drag-to-position ───────────────────────────────────────────────
  const getCanvasCoords = (
    e: PointerEvent<HTMLCanvasElement>
  ): { x: number; y: number } => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  const handleCanvasPointerDown = (e: PointerEvent<HTMLCanvasElement>) => {
    if (!uploadedImageUrl) return;
    const canvas = canvasRef.current!;
    canvas.setPointerCapture(e.pointerId);
    const { x, y } = getCanvasCoords(e);
    dragStartRef.current = {
      mouseX: x,
      mouseY: y,
      px: placement.x,
      py: placement.y,
    };
    setIsDragging(true);
  };

  const handleCanvasPointerMove = (e: PointerEvent<HTMLCanvasElement>) => {
    if (!isDragging || !dragStartRef.current || !uploadedImageUrl) return;
    const canvas = canvasRef.current!;
    const { x, y } = getCanvasCoords(e);

    const printAreaW = (product.printAreaWidth / 100) * canvas.width;
    const printAreaH = (product.printAreaHeight / 100) * canvas.height;

    const deltaX = ((x - dragStartRef.current.mouseX) / printAreaW) * 100;
    const deltaY = ((y - dragStartRef.current.mouseY) / printAreaH) * 100;

    setPlacement((prev) => ({
      ...prev,
      x: Math.max(0, Math.min(100, dragStartRef.current!.px + deltaX)),
      y: Math.max(0, Math.min(100, dragStartRef.current!.py + deltaY)),
    }));
  };

  const handleCanvasPointerUp = () => {
    setIsDragging(false);
    dragStartRef.current = null;
  };

  // ── Add to cart ───────────────────────────────────────────────────────────
  const handleAddToCart = async () => {
    if (!uploadedImageUrl || !fileMeta) {
      toast.error("Please upload a design first");
      return;
    }
    setIsSaving(true);

    try {
      // Generate final preview snapshot from canvas
      const canvas = canvasRef.current!;
      // Render without guide for clean preview
      await renderPreviewToCanvas(canvas, {
        product,
        selectedColor,
        designImageUrl: uploadedImageUrl,
        placement,
      });
      const previewDataUrl = canvasToDataUrl(canvas);

      // Upload preview to Cloudinary
      const previewBlob = await canvasToBlob(canvas);
      const previewForm = new FormData();
      previewForm.append("file", previewBlob, "preview.jpg");
      previewForm.append("upload_preset", "kweli_previews");

      const previewRes = await fetch("/api/designs/upload", {
        method: "POST",
        body: previewForm,
      });
      const previewData = previewRes.ok ? await previewRes.json() : null;

      // Save design record to DB
      const saveRes = await fetch("/api/designs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          printableProductId: product.id,
          originalFileUrl: fileMeta.cloudinaryUrl,
          originalPublicId: fileMeta.cloudinaryId,
          fileType: fileMeta.type,
          fileSizeBytes: fileMeta.size,
          imageWidth: fileMeta.width,
          imageHeight: fileMeta.height,
          placementX: placement.x,
          placementY: placement.y,
          designScale: placement.scale,
          designRotation: placement.rotation,
          selectedColor: selectedColor.name,
          selectedSize,
          garmentColorHex: selectedColor.hex,
          previewImageUrl: previewData?.secure_url,
          previewPublicId: previewData?.public_id,
          qualityWarnings: warnings,
        }),
      });

      if (!saveRes.ok) {
        const err = await saveRes.json();
        throw new Error(err.error || "Failed to save design");
      }

      const { designId } = await saveRes.json();
      const totalPrice = product.basePrice + product.printSurcharge;

      // Add to cart as a custom item
      addItem({
        id: `custom-${designId}`,
        productId: product.id,
        variantId: `custom-${designId}`,
        name: `Custom ${product.name}`,
        slug: `custom-print`,
        price: totalPrice,
        image: previewData?.secure_url || previewDataUrl,
        size: selectedSize,
        color: selectedColor.name,
        stock: 999,
        quantity: 1,
      });

      toast.success("Custom design added to cart! 🎨");
      openCart();
      onClose?.();
    } catch (err: any) {
      toast.error(err.message || "Something went wrong");
    } finally {
      setIsSaving(false);
    }
  };

  const totalPrice = product.basePrice + product.printSurcharge;

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-cream">
      {/* Header */}
      <div className="bg-charcoal text-cream px-4 sm:px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="font-display text-xl font-medium">Design Studio</h1>
          <p className="text-white/60 text-xs mt-0.5">
            Create your custom {product.name}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-2 text-sm">
            <span className="text-white/50">Total:</span>
            <span className="font-semibold text-brand-300">
              {formatPrice(totalPrice)}
            </span>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="p-2 hover:text-brand-400 transition-colors"
              aria-label="Close studio"
            >
              <X size={20} />
            </button>
          )}
        </div>
      </div>

      {/* Step indicator */}
      <div className="bg-white border-b border-sand px-4 sm:px-6 py-3">
        <div className="flex items-center gap-2 max-w-3xl mx-auto">
          {(["upload", "design", "confirm"] as const).map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div
                className={cn(
                  "w-6 h-6 flex items-center justify-center text-xs font-bold",
                  step === s
                    ? "bg-brand-600 text-white"
                    : i < ["upload", "design", "confirm"].indexOf(step)
                    ? "bg-green-500 text-white"
                    : "bg-sand text-muted"
                )}
              >
                {i < ["upload", "design", "confirm"].indexOf(step) ? (
                  <CheckCircle size={14} />
                ) : (
                  i + 1
                )}
              </div>
              <span
                className={cn(
                  "text-xs font-medium capitalize",
                  step === s ? "text-charcoal" : "text-muted"
                )}
              >
                {s === "upload" ? "Upload Design" : s === "design" ? "Position & Style" : "Review"}
              </span>
              {i < 2 && <div className="w-8 h-px bg-sand mx-1" />}
            </div>
          ))}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid lg:grid-cols-5 gap-8">
          {/* ── LEFT: Canvas Preview ── */}
          <div className="lg:col-span-3">
            <div className="bg-white border border-sand p-4">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs text-muted uppercase tracking-wider">
                  Live Preview
                </p>
                {uploadedImageUrl && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setShowGuide(!showGuide)}
                      className={cn(
                        "text-xs px-2 py-1 border transition-colors",
                        showGuide
                          ? "border-brand-400 text-brand-600"
                          : "border-sand text-muted"
                      )}
                    >
                      {showGuide ? "Hide" : "Show"} Grid
                    </button>
                  </div>
                )}
              </div>

              {/* Canvas */}
              <div
                className={cn(
                  "relative mx-auto",
                  isDragging ? "cursor-grabbing" : uploadedImageUrl ? "cursor-grab" : "cursor-default"
                )}
                style={{ maxWidth: "500px" }}
              >
                <canvas
                  ref={canvasRef}
                  className="w-full h-auto border border-sand/50 select-none"
                  onPointerDown={handleCanvasPointerDown}
                  onPointerMove={handleCanvasPointerMove}
                  onPointerUp={handleCanvasPointerUp}
                  onPointerLeave={handleCanvasPointerUp}
                />
                {isUploading && (
                  <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
                    <div className="text-center">
                      <Loader2 size={32} className="animate-spin text-brand-600 mx-auto mb-2" />
                      <p className="text-sm text-muted">Uploading design...</p>
                    </div>
                  </div>
                )}
                {!uploadedImageUrl && !isUploading && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <p className="text-muted text-sm bg-white/80 px-3 py-1.5 border border-sand">
                      Upload a design to see it here
                    </p>
                  </div>
                )}
              </div>

              {uploadedImageUrl && (
                <p className="text-xs text-center text-muted mt-2 flex items-center justify-center gap-1">
                  <Move size={12} />
                  Drag on the preview to reposition your design
                </p>
              )}
            </div>

            {/* Color selector */}
            <div className="mt-4 bg-white border border-sand p-4">
              <p className="label mb-3">Garment Color</p>
              <div className="flex flex-wrap gap-2">
                {colors.map((color) => (
                  <button
                    key={color.name}
                    onClick={() => setSelectedColor(color)}
                    title={color.name}
                    className={cn(
                      "w-9 h-9 border-2 transition-all",
                      selectedColor.name === color.name
                        ? "border-brand-600 scale-110 shadow-md"
                        : "border-transparent hover:border-sand"
                    )}
                    style={{ backgroundColor: color.hex }}
                    aria-label={`Select ${color.name}`}
                  />
                ))}
              </div>
              <p className="text-xs text-muted mt-2">
                Selected: <span className="font-medium">{selectedColor.name}</span>
              </p>
            </div>
          </div>

          {/* ── RIGHT: Controls ── */}
          <div className="lg:col-span-2 space-y-4">
            {/* Upload zone */}
            <div className="bg-white border border-sand p-5">
              <p className="label mb-3">Your Design</p>

              {!uploadedImageUrl ? (
                <div
                  className={cn(
                    "border-2 border-dashed rounded p-8 text-center cursor-pointer transition-all",
                    isDragging
                      ? "border-brand-500 bg-brand-50"
                      : "border-sand hover:border-brand-400 hover:bg-brand-50/30"
                  )}
                  onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={(e) => { setIsDragging(false); handleDrop(e); }}
                  onClick={() => fileInputRef.current?.click()}
                  role="button"
                  aria-label="Upload design file"
                >
                  <Upload size={32} className="text-brand-400 mx-auto mb-3" />
                  <p className="font-medium text-sm text-charcoal mb-1">
                    Drop your design here
                  </p>
                  <p className="text-xs text-muted">
                    or click to browse
                  </p>
                  <p className="text-xs text-muted mt-2">
                    PNG (recommended), JPG, SVG · Max 20MB
                  </p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".png,.jpg,.jpeg,.svg"
                    className="hidden"
                    onChange={handleFileInputChange}
                  />
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-200">
                    <CheckCircle size={16} className="text-green-600 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-green-800 truncate">
                        {uploadedFile?.name || "Design uploaded"}
                      </p>
                      {fileMeta && (
                        <p className="text-xs text-green-600">
                          {fileMeta.width}×{fileMeta.height}px ·{" "}
                          {(fileMeta.size / 1024).toFixed(0)}KB
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => {
                        setUploadedImageUrl(null);
                        setUploadedFile(null);
                        setFileMeta(null);
                        setPlacement(DEFAULT_PLACEMENT);
                        setStep("upload");
                      }}
                      className="text-green-600 hover:text-red-500 transition-colors"
                      aria-label="Remove design"
                    >
                      <X size={16} />
                    </button>
                  </div>
                </div>
              )}

              {/* Errors */}
              {errors.length > 0 && (
                <div className="mt-3 space-y-1">
                  {errors.map((e) => (
                    <p key={e} className="text-xs text-red-600 flex items-start gap-1.5">
                      <AlertTriangle size={12} className="mt-0.5 shrink-0" />
                      {e}
                    </p>
                  ))}
                </div>
              )}

              {/* Warnings */}
              {warnings.length > 0 && (
                <div className="mt-3 space-y-1.5">
                  {warnings.map((code) => {
                    const w = WARNING_LABELS[code];
                    if (!w) return null;
                    return (
                      <p
                        key={code}
                        className={cn(
                          "text-xs flex items-start gap-1.5 p-2",
                          w.severity === "warn"
                            ? "text-amber-700 bg-amber-50 border border-amber-200"
                            : "text-blue-700 bg-blue-50 border border-blue-200"
                        )}
                      >
                        <AlertTriangle size={12} className="mt-0.5 shrink-0" />
                        {w.label}
                      </p>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Position & Scale controls */}
            {uploadedImageUrl && (
              <div className="bg-white border border-sand p-5 space-y-5">
                <p className="label">Adjust Design</p>

                {/* Scale */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs text-muted">Size</span>
                    <span className="text-xs font-medium">{Math.round(placement.scale)}%</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() =>
                        setPlacement((p) => ({ ...p, scale: Math.max(10, p.scale - 5) }))
                      }
                      className="w-8 h-8 flex items-center justify-center border border-sand hover:bg-sand transition-colors"
                      aria-label="Shrink design"
                    >
                      <ZoomOut size={14} />
                    </button>
                    <input
                      type="range"
                      min={10}
                      max={150}
                      value={placement.scale}
                      onChange={(e) =>
                        setPlacement((p) => ({
                          ...p,
                          scale: parseInt(e.target.value),
                        }))
                      }
                      className="flex-1 accent-brand-600"
                      aria-label="Design size"
                    />
                    <button
                      onClick={() =>
                        setPlacement((p) => ({ ...p, scale: Math.min(150, p.scale + 5) }))
                      }
                      className="w-8 h-8 flex items-center justify-center border border-sand hover:bg-sand transition-colors"
                      aria-label="Grow design"
                    >
                      <ZoomIn size={14} />
                    </button>
                  </div>
                </div>

                {/* Rotation */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs text-muted">Rotation</span>
                    <span className="text-xs font-medium">{Math.round(placement.rotation)}°</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() =>
                        setPlacement((p) => ({
                          ...p,
                          rotation: (p.rotation - 15 + 360) % 360,
                        }))
                      }
                      className="w-8 h-8 flex items-center justify-center border border-sand hover:bg-sand"
                      aria-label="Rotate counter-clockwise"
                    >
                      <RotateCcw size={14} />
                    </button>
                    <input
                      type="range"
                      min={-180}
                      max={180}
                      value={placement.rotation}
                      onChange={(e) =>
                        setPlacement((p) => ({
                          ...p,
                          rotation: parseInt(e.target.value),
                        }))
                      }
                      className="flex-1 accent-brand-600"
                      aria-label="Design rotation"
                    />
                    <button
                      onClick={() =>
                        setPlacement((p) => ({
                          ...p,
                          rotation: (p.rotation + 15) % 360,
                        }))
                      }
                      className="w-8 h-8 flex items-center justify-center border border-sand hover:bg-sand"
                      aria-label="Rotate clockwise"
                    >
                      <RotateCw size={14} />
                    </button>
                  </div>
                </div>

                {/* Reset */}
                <button
                  onClick={() => setPlacement(DEFAULT_PLACEMENT)}
                  className="text-xs text-muted flex items-center gap-1.5 hover:text-brand-600 transition-colors"
                >
                  <RefreshCw size={12} />
                  Reset position
                </button>
              </div>
            )}

            {/* Size selector */}
            <div className="bg-white border border-sand p-5">
              <p className="label mb-3">Select Size</p>
              <div className="flex flex-wrap gap-2">
                {product.availableSizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={cn(
                      "size-option w-12 h-10 text-sm",
                      selectedSize === size && "selected"
                    )}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Pricing */}
            <div className="bg-white border border-sand p-5">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-muted">
                  <span>Base garment</span>
                  <span>{formatPrice(product.basePrice)}</span>
                </div>
                <div className="flex justify-between text-muted">
                  <span>Custom print</span>
                  <span>{formatPrice(product.printSurcharge)}</span>
                </div>
                <div className="flex justify-between font-semibold text-base pt-2 border-t border-sand">
                  <span>Total per item</span>
                  <span className="text-brand-600">{formatPrice(totalPrice)}</span>
                </div>
              </div>
            </div>

            {/* Important notice */}
            <div className="text-xs text-muted bg-amber-50 border border-amber-200 p-3 space-y-1">
              <p className="font-medium text-amber-800">⚠️ Before you order:</p>
              <ul className="space-y-0.5 text-amber-700">
                <li>• Your design will be reviewed by our team</li>
                <li>• Production starts only after approval (1–2 days)</li>
                <li>• Custom orders cannot be returned unless defective</li>
                <li>• Designs with copyrighted content will be rejected</li>
              </ul>
            </div>

            {/* Add to Cart */}
            <button
              onClick={handleAddToCart}
              disabled={!uploadedImageUrl || isSaving || isUploading}
              className="btn-primary w-full py-4 text-base"
            >
              {isSaving ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Saving design...
                </>
              ) : (
                <>
                  <ShoppingBag size={20} />
                  Add Custom Item to Cart
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
