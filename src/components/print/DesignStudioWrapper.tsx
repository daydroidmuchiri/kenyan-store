"use client";
// src/components/print/DesignStudioWrapper.tsx
// Interactive design studio — pick garment, upload design, preview live, order.

import { useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  Upload,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  RotateCw,
  ShoppingBag,
  Trash2,
  ChevronLeft,
  MoveHorizontal,
  MoveVertical,
  Info,
} from "lucide-react";
import toast from "react-hot-toast";
import {
  GARMENT_SVG_MAP,
  TShirtSVG,
} from "./GarmentSVG";
import { formatPrice } from "@/lib/utils";
import Link from "next/link";
import { useCart } from "@/hooks/use-cart";
import { getSession } from "next-auth/react";

// ─── Types ────────────────────────────────────────────────────────────────────
interface GarmentColor {
  name: string;
  hex: string;
}

interface PrintableProductData {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  basePrice: number;
  printSurcharge: number;
  mockupImageUrl: string;
  printAreaX: number;
  printAreaY: number;
  printAreaWidth: number;
  printAreaHeight: number;
  availableColors: any;
  availableSizes: string[];
}

interface DesignState {
  imageUrl: string | null;
  scale: number;       // 10–150
  rotation: number;    // -180 to 180
  offsetX: number;     // -50 to 50 (% within print area)
  offsetY: number;     // -50 to 50
}

interface Props {
  product: PrintableProductData;
}

// ─── Component ───────────────────────────────────────────────────────────────
export function DesignStudioWrapper({ product }: Props) {
  const router = useRouter();
  const { addItem, openCart } = useCart();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const colors = product.availableColors as GarmentColor[];
  const [selectedColor, setSelectedColor] = useState<GarmentColor>(colors[0] || { name: "White", hex: "#ffffff" });
  const [selectedSize, setSelectedSize] = useState<string>(product.availableSizes[2] || "M");
  const [design, setDesign] = useState<DesignState>({
    imageUrl: null,
    scale: 80,
    rotation: 0,
    offsetX: 0,
    offsetY: 0,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const GarmentComponent = Object.keys(GARMENT_SVG_MAP).includes(product.slug) 
    ? GARMENT_SVG_MAP[product.slug] 
    : TShirtSVG;
    
  const totalPrice = product.basePrice + product.printSurcharge;

  // ── Upload handler ──────────────────────────────────────────────────────
  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file (PNG, JPG, SVG)");
      return;
    }
    if (file.size > 20 * 1024 * 1024) {
      toast.error("File must be under 20MB");
      return;
    }

    const reader = new FileReader();
    reader.onload = (ev) => {
      setDesign((d) => ({ ...d, imageUrl: ev.target?.result as string }));
    };
    reader.readAsDataURL(file);
  }, []);

  // ── Order handler ───────────────────────────────────────────────────────
  const handleOrder = async () => {
    if (!design.imageUrl) {
      toast.error("Please upload your design first");
      return;
    }
    
    const session = await getSession();
    if (!session) {
      toast.error("Please sign in to place an order");
      router.push(`/login?callbackUrl=/custom-print/${product.slug}`);
      return;
    }

    setIsSubmitting(true);
    try {
      // 1. Upload the image to Cloudinary via our existing API
      const res = await fetch("/api/designs/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          printableProductId: product.id,
          imageDataUrl: design.imageUrl,
          placementX: 50 + design.offsetX,
          placementY: 50 + design.offsetY,
          designScale: design.scale,
          designRotation: design.rotation,
          selectedColor: selectedColor.name,
          selectedSize,
          garmentColorHex: selectedColor.hex,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to save design");
      }

      const { designId } = await res.json();
      
      // 2. Add to cart
      addItem({
        id: `custom-${designId}`,
        productId: product.id,
        variantId: `custom-${designId}`,
        name: `Custom ${product.name}`,
        slug: `custom-print`,
        price: totalPrice,
        image: design.imageUrl, // Use uploaded image as preview in cart for now
        size: selectedSize,
        color: selectedColor.name,
        stock: 999,
        quantity: 1,
      });

      toast.success("Custom design added to cart! 🎨");
      openCart();
      router.push("/custom-print");
    } catch (err: any) {
      toast.error(err.message || "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ─── Print area styles ─────────────────────────────────────────────────
  const printAreaStyle: React.CSSProperties = {
    position: "absolute",
    left: `${product.printAreaX}%`,
    top: `${product.printAreaY}%`,
    width: `${product.printAreaWidth}%`,
    height: `${product.printAreaHeight}%`,
    overflow: "hidden",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  };

  const designImageStyle: React.CSSProperties = {
    position: "absolute",
    maxWidth: "100%",
    maxHeight: "100%",
    width: `${design.scale}%`,
    transform: `translate(${design.offsetX}%, ${design.offsetY}%) rotate(${design.rotation}deg)`,
    transformOrigin: "center center",
    pointerEvents: "none",
    userSelect: "none",
  };

  return (
    <div className="min-h-screen bg-[#faf7f2]">
      {/* ── Header ─────────────────────────────────────────── */}
      <div className="border-b border-sand bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/custom-print" className="flex items-center gap-1.5 text-muted hover:text-charcoal transition-colors text-sm">
              <ChevronLeft size={16} />
              All Garments
            </Link>
            <span className="text-sand hidden sm:inline">|</span>
            <h1 className="font-display text-xl font-medium hidden sm:block">{product.name}</h1>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid lg:grid-cols-[1fr_380px] gap-8">

          {/* ── LEFT: Canvas + Controls ─────────────────────── */}
          <div className="space-y-6">
            {/* Canvas */}
            <div className="bg-white border border-sand p-6 rounded-sm shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <p className="text-xs text-muted flex items-center gap-1.5">
                  <Info size={12} />
                  Dashed outline shows the printable area
                </p>
                {design.imageUrl && (
                  <button
                    onClick={() => setDesign((d) => ({ ...d, imageUrl: null }))}
                    className="text-xs text-red-500 hover:text-red-700 flex items-center gap-1"
                  >
                    <Trash2 size={12} />
                    Remove design
                  </button>
                )}
              </div>

              {/* Garment preview */}
              <div
                className="relative mx-auto bg-white"
                style={{ maxWidth: 420, aspectRatio: "1 / 1.15" }}
              >
                <GarmentComponent
                  color={selectedColor.hex}
                  className="w-full h-full drop-shadow-sm transition-colors duration-300"
                />

                {/* Design overlay in print area */}
                {design.imageUrl && (
                  <div style={printAreaStyle}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={design.imageUrl}
                      alt="Your design"
                      style={designImageStyle}
                    />
                  </div>
                )}

                {/* Upload prompt if no design */}
                {!design.imageUrl && (
                  <div
                    style={printAreaStyle}
                    className="flex flex-col items-center justify-center cursor-pointer group"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <div className="bg-white/80 backdrop-blur-sm border border-dashed border-sand group-hover:border-brand-400 transition-colors rounded-sm p-4 text-center">
                      <Upload size={20} className="mx-auto mb-1 text-muted group-hover:text-brand-600 transition-colors" />
                      <p className="text-xs text-muted group-hover:text-brand-600 transition-colors font-medium">
                        Click to upload
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Controls — only shown when design is uploaded */}
            {design.imageUrl && (
              <div className="bg-white border border-sand p-5 space-y-5 rounded-sm shadow-sm">
                <h3 className="font-medium text-sm text-charcoal">Adjust Design</h3>

                {/* Scale */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs text-muted uppercase tracking-wider">Size</label>
                    <span className="text-xs font-medium">{design.scale}%</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <ZoomOut size={14} className="text-muted shrink-0" />
                    <input
                      type="range" min={10} max={150} value={design.scale}
                      onChange={(e) => setDesign((d) => ({ ...d, scale: +e.target.value }))}
                      className="flex-1 accent-brand-600"
                    />
                    <ZoomIn size={14} className="text-muted shrink-0" />
                  </div>
                </div>

                {/* Horizontal offset */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs text-muted uppercase tracking-wider">Horizontal</label>
                    <span className="text-xs font-medium">{design.offsetX > 0 ? "+" : ""}{design.offsetX}%</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <MoveHorizontal size={14} className="text-muted shrink-0" />
                    <input
                      type="range" min={-45} max={45} value={design.offsetX}
                      onChange={(e) => setDesign((d) => ({ ...d, offsetX: +e.target.value }))}
                      className="flex-1 accent-brand-600"
                    />
                  </div>
                </div>

                {/* Vertical offset */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs text-muted uppercase tracking-wider">Vertical</label>
                    <span className="text-xs font-medium">{design.offsetY > 0 ? "+" : ""}{design.offsetY}%</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <MoveVertical size={14} className="text-muted shrink-0" />
                    <input
                      type="range" min={-45} max={45} value={design.offsetY}
                      onChange={(e) => setDesign((d) => ({ ...d, offsetY: +e.target.value }))}
                      className="flex-1 accent-brand-600"
                    />
                  </div>
                </div>

                {/* Rotation */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs text-muted uppercase tracking-wider">Rotation</label>
                    <span className="text-xs font-medium">{design.rotation}°</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <RotateCcw size={14} className="text-muted shrink-0" />
                    <input
                      type="range" min={-180} max={180} value={design.rotation}
                      onChange={(e) => setDesign((d) => ({ ...d, rotation: +e.target.value }))}
                      className="flex-1 accent-brand-600"
                    />
                    <RotateCw size={14} className="text-muted shrink-0" />
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    onClick={() => setDesign((d) => ({ ...d, scale: 80, rotation: 0, offsetX: 0, offsetY: 0 }))}
                    className="text-xs text-muted hover:text-charcoal underline"
                  >
                    Reset adjustments
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* ── RIGHT: Options + Order ──────────────────────── */}
          <div className="space-y-6">
            {/* Product info */}
            <div className="bg-white border border-sand p-6 rounded-sm shadow-sm">
              <h2 className="font-display text-2xl font-medium mb-1 block sm:hidden">{product.name}</h2>
              {product.description && (
                <p className="text-muted text-sm mb-4 leading-relaxed">{product.description}</p>
              )}
              <div className="flex items-baseline gap-2 mb-1">
                <p className="font-display text-3xl font-medium text-brand-700">{formatPrice(totalPrice)}</p>
              </div>
              <p className="text-xs text-muted flex justify-between border-t border-sand/50 mt-3 pt-3">
                <span>Garment: {formatPrice(product.basePrice)}</span>
                <span>Print: {formatPrice(product.printSurcharge)}</span>
              </p>
            </div>

            {/* Color selector */}
            <div className="bg-white border border-sand p-5 rounded-sm shadow-sm">
              <p className="text-xs uppercase tracking-wider text-muted mb-3">
                Garment Colour — <span className="font-medium text-charcoal">{selectedColor.name}</span>
              </p>
              <div className="flex flex-wrap gap-2">
                {colors.map((c: GarmentColor) => (
                  <button
                    key={c.name}
                    title={c.name}
                    onClick={() => setSelectedColor(c)}
                    className={`w-9 h-9 rounded-full border border-sand transition-all ${
                      selectedColor.name === c.name
                        ? "outline outline-2 outline-offset-2 outline-brand-600 shadow-md scale-105"
                        : "hover:scale-105 hover:shadow-sm"
                    }`}
                    style={{ backgroundColor: c.hex }}
                    aria-label={`Select ${c.name}`}
                  />
                ))}
              </div>
            </div>

            {/* Size selector */}
            <div className="bg-white border border-sand p-5 rounded-sm shadow-sm">
              <p className="text-xs uppercase tracking-wider text-muted mb-3">
                Size — <span className="font-medium text-charcoal">{selectedSize}</span>
              </p>
              <div className="flex flex-wrap gap-2">
                {product.availableSizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`w-12 h-10 border border-sand rounded-sm text-sm font-medium transition-all ${
                      selectedSize === size 
                        ? "bg-brand-600 border-brand-600 text-white" 
                        : "bg-white text-charcoal hover:border-brand-300"
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Upload button */}
            <div className="bg-white border border-sand p-5 rounded-sm shadow-sm">
              <p className="text-xs uppercase tracking-wider text-muted mb-3 flex justify-between">
                <span>Your Design</span>
                {design.imageUrl && <span className="text-green-600 flex items-center gap-1"><Info size={12}/>Uploaded</span>}
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/svg+xml,image/webp"
                onChange={handleFileChange}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full border-2 border-dashed border-sand hover:border-brand-400 hover:bg-brand-50/30 transition-all py-6 flex flex-col items-center gap-2 group rounded-sm"
              >
                <Upload size={22} className="text-muted group-hover:text-brand-600 transition-colors" />
                <span className="text-sm font-medium group-hover:text-brand-700 transition-colors">
                  {design.imageUrl ? "Replace Design" : "Upload Your Design"}
                </span>
                <span className="text-xs text-muted">PNG, JPG, SVG · Max 20MB</span>
              </button>
              <p className="text-xs text-muted mt-3 text-center bg-sand/20 p-2 rounded-sm border border-sand/50">
                💡 PNG with transparent background works best
              </p>
            </div>

            {/* Order CTA */}
            <button
              onClick={handleOrder}
              disabled={isSubmitting || !design.imageUrl}
              className="w-full bg-brand-600 hover:bg-brand-700 text-white font-medium py-4 rounded-sm transition-colors flex items-center justify-center gap-2 text-base disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg disabled:shadow-none"
            >
              {isSubmitting ? (
                "Adding to Cart..."
              ) : (
                <>
                  <ShoppingBag size={18} />
                  {design.imageUrl ? `Add to Cart — ${formatPrice(totalPrice)}` : "Upload a design to order"}
                </>
              )}
            </button>

            <p className="text-xs text-muted text-center max-w-xs mx-auto">
              Your design will be reviewed by our team before printing to ensure best quality.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
