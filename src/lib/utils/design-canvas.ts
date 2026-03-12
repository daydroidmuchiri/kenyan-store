// src/lib/utils/design-canvas.ts
// Canvas rendering utilities for the design studio preview

import type { PrintableProductData, DesignPlacement, GarmentColor } from "@/types/print";

export interface RenderOptions {
  product: PrintableProductData;
  selectedColor: GarmentColor;
  designImageUrl: string | null;
  placement: DesignPlacement;
  canvasWidth?: number;
  canvasHeight?: number;
}

/**
 * Render a composite preview onto a canvas element.
 * Returns the canvas for display or export.
 */
export async function renderPreviewToCanvas(
  canvas: HTMLCanvasElement,
  options: RenderOptions
): Promise<void> {
  const {
    product,
    selectedColor,
    designImageUrl,
    placement,
    canvasWidth = 500,
    canvasHeight = 600,
  } = options;

  canvas.width = canvasWidth;
  canvas.height = canvasHeight;

  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas context unavailable");

  ctx.clearRect(0, 0, canvasWidth, canvasHeight);

  // ── 1. Draw garment mockup ──
  const mockupUrl = selectedColor.mockupUrl || product.mockupImageUrl;
  const garmentImg = await loadImage(mockupUrl);
  ctx.drawImage(garmentImg, 0, 0, canvasWidth, canvasHeight);

  // ── 2. Draw design if uploaded ──
  if (designImageUrl) {
    const designImg = await loadImage(designImageUrl);

    // Calculate the print area in canvas pixels
    const printAreaPx = {
      x: (product.printAreaX / 100) * canvasWidth,
      y: (product.printAreaY / 100) * canvasHeight,
      w: (product.printAreaWidth / 100) * canvasWidth,
      h: (product.printAreaHeight / 100) * canvasHeight,
    };

    // Design size = scale% of print area width
    const designW = (placement.scale / 100) * printAreaPx.w;
    const aspectRatio = designImg.naturalHeight / designImg.naturalWidth;
    const designH = designW * aspectRatio;

    // Position: placement.x/y is center of design as % within print area
    const designCenterX = printAreaPx.x + (placement.x / 100) * printAreaPx.w;
    const designCenterY = printAreaPx.y + (placement.y / 100) * printAreaPx.h;

    ctx.save();
    ctx.translate(designCenterX, designCenterY);
    ctx.rotate((placement.rotation * Math.PI) / 180);
    ctx.drawImage(
      designImg,
      -designW / 2,
      -designH / 2,
      designW,
      designH
    );
    ctx.restore();
  }
}

/**
 * Export the canvas as a data URL (for preview display)
 */
export function canvasToDataUrl(
  canvas: HTMLCanvasElement,
  quality = 0.9
): string {
  return canvas.toDataURL("image/jpeg", quality);
}

/**
 * Export the canvas as a Blob (for Cloudinary upload)
 */
export function canvasToBlob(
  canvas: HTMLCanvasElement,
  quality = 0.92
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error("Canvas toBlob failed"));
      },
      "image/jpeg",
      quality
    );
  });
}

/**
 * Load an image from a URL, returning an HTMLImageElement.
 * Handles CORS by proxying through Next.js if needed.
 */
function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Failed to load image: ${src}`));
    img.src = src;
  });
}

/**
 * Draw the print area guide overlay (dashed rectangle)
 * Used in the interactive editor to show where the design can be placed.
 */
export function drawPrintAreaGuide(
  canvas: HTMLCanvasElement,
  product: PrintableProductData
): void {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const { width: w, height: h } = canvas;

  const x = (product.printAreaX / 100) * w;
  const y = (product.printAreaY / 100) * h;
  const pw = (product.printAreaWidth / 100) * w;
  const ph = (product.printAreaHeight / 100) * h;

  ctx.save();
  ctx.setLineDash([6, 4]);
  ctx.strokeStyle = "rgba(201, 124, 58, 0.7)"; // brand color
  ctx.lineWidth = 1.5;
  ctx.strokeRect(x, y, pw, ph);

  // Label
  ctx.setLineDash([]);
  ctx.fillStyle = "rgba(201, 124, 58, 0.85)";
  ctx.font = "11px DM Sans, sans-serif";
  ctx.fillText("Print Area", x + 4, y - 5);
  ctx.restore();
}

/**
 * Convert canvas coordinates to placement percentages within the print area.
 * Used when the user drags the design.
 */
export function canvasCoordsToPlacement(
  canvasX: number,
  canvasY: number,
  canvasWidth: number,
  canvasHeight: number,
  product: PrintableProductData
): { x: number; y: number } {
  const printAreaPx = {
    x: (product.printAreaX / 100) * canvasWidth,
    y: (product.printAreaY / 100) * canvasHeight,
    w: (product.printAreaWidth / 100) * canvasWidth,
    h: (product.printAreaHeight / 100) * canvasHeight,
  };

  const relX = ((canvasX - printAreaPx.x) / printAreaPx.w) * 100;
  const relY = ((canvasY - printAreaPx.y) / printAreaPx.h) * 100;

  return {
    x: Math.max(0, Math.min(100, relX)),
    y: Math.max(0, Math.min(100, relY)),
  };
}
