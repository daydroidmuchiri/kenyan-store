// src/lib/utils/design-validation.ts
// Client + server-side validation for uploaded design files

import type { FileValidationResult } from "@/types/print";

// ─── CONSTANTS ────────────────────────────────────────────────────────────────
export const ALLOWED_TYPES = ["image/png", "image/jpeg", "image/svg+xml"];
export const ALLOWED_EXTENSIONS = ["png", "jpg", "jpeg", "svg"];
export const MAX_FILE_SIZE_MB = 20;
export const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
export const MIN_DIMENSION_PX = 300;   // minimum 300px for quality
export const RECOMMENDED_DPI = 300;
export const MIN_PRINT_SIZE_PX = 1000; // ~3.3 inch at 300 DPI — ideal for printing

// ─── CLIENT-SIDE VALIDATION ───────────────────────────────────────────────────

/**
 * Validate a File object before uploading.
 * Returns errors (blocking) and warnings (non-blocking).
 */
export async function validateDesignFile(
  file: File
): Promise<FileValidationResult> {
  const errors: string[] = [];
  const warnings: string[] = [];

  // ── File type check ──
  if (!ALLOWED_TYPES.includes(file.type)) {
    errors.push(
      `File type "${file.type}" is not supported. Please upload a PNG, JPG, or SVG.`
    );
    return { valid: false, errors, warnings, fileSizeBytes: file.size };
  }

  // ── File size check ──
  if (file.size > MAX_FILE_SIZE_BYTES) {
    errors.push(
      `File is too large (${(file.size / 1024 / 1024).toFixed(1)}MB). Maximum size is ${MAX_FILE_SIZE_MB}MB.`
    );
  }

  // ── Image dimension check (only for raster images) ──
  let width = 0;
  let height = 0;

  if (file.type !== "image/svg+xml") {
    const dims = await getImageDimensions(file);
    width = dims.width;
    height = dims.height;

    if (width < MIN_DIMENSION_PX || height < MIN_DIMENSION_PX) {
      errors.push(
        `Image is too small (${width}×${height}px). Minimum size is ${MIN_DIMENSION_PX}×${MIN_DIMENSION_PX}px for print quality.`
      );
    } else if (width < MIN_PRINT_SIZE_PX || height < MIN_PRINT_SIZE_PX) {
      warnings.push(
        `low_res:Image resolution (${width}×${height}px) may result in a slightly blurry print. We recommend at least ${MIN_PRINT_SIZE_PX}×${MIN_PRINT_SIZE_PX}px for best results.`
      );
    }
  }

  // ── PNG transparency check ──
  if (file.type === "image/png") {
    const hasTransparency = await checkPngTransparency(file);
    if (!hasTransparency) {
      warnings.push(
        "no_transparency:Your PNG does not appear to have a transparent background. For best results, use a PNG with transparency so only your design shows on the garment."
      );
    }
  }

  // ── JPG warning ──
  if (file.type === "image/jpeg") {
    warnings.push(
      "jpg_format:JPG files don't support transparency. For best results, convert to PNG with a transparent background."
    );
  }

  // ── Possible copyright check (heuristic by filename) ──
  const suspiciousTerms = [
    "nike", "adidas", "supreme", "gucci", "louis", "prada",
    "coca-cola", "pepsi", "disney", "marvel", "dc-comics",
    "nba", "fifa", "uefa", "champion"
  ];
  const nameLower = file.name.toLowerCase();
  if (suspiciousTerms.some((term) => nameLower.includes(term))) {
    warnings.push(
      "possible_copyright:This design may contain trademarked content. Please ensure you have the rights to use all elements in your design. Designs with unauthorized copyrighted material will be rejected."
    );
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings: warnings.map((w) => w.split(":")[0]), // return warning codes
    width,
    height,
    fileSizeBytes: file.size,
  };
}

/**
 * Get image dimensions from a File object
 */
export function getImageDimensions(
  file: File
): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Failed to load image"));
    };
    img.src = url;
  });
}

/**
 * Check if a PNG file has any transparent pixels (alpha < 255)
 */
async function checkPngTransparency(file: File): Promise<boolean> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        // Sample a small portion for performance
        canvas.width = Math.min(img.naturalWidth, 200);
        canvas.height = Math.min(img.naturalHeight, 200);
        const ctx = canvas.getContext("2d");
        if (!ctx) { resolve(false); return; }
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
        // Check every 4th byte (alpha channel)
        for (let i = 3; i < data.length; i += 4) {
          if (data[i] < 255) { resolve(true); return; }
        }
        resolve(false);
      } catch {
        resolve(false);
      } finally {
        URL.revokeObjectURL(url);
      }
    };
    img.onerror = () => { URL.revokeObjectURL(url); resolve(false); };
    img.src = url;
  });
}

// ─── WARNING LABEL MAP ────────────────────────────────────────────────────────

export const WARNING_LABELS: Record<string, { label: string; severity: "info" | "warn" }> = {
  low_res: {
    label: "Low resolution — print quality may be reduced",
    severity: "warn",
  },
  no_transparency: {
    label: "No transparent background detected — design may have a white box around it",
    severity: "warn",
  },
  jpg_format: {
    label: "JPG format — no transparency support",
    severity: "info",
  },
  possible_copyright: {
    label: "Possible copyrighted content detected — admin review required",
    severity: "warn",
  },
};

// ─── SERVER-SIDE VALIDATION ───────────────────────────────────────────────────

/**
 * Validate uploaded file metadata on the server
 */
export function validateUploadedFileMeta(data: {
  fileType: string;
  fileSizeBytes: number;
  imageWidth?: number;
  imageHeight?: number;
}): { valid: boolean; error?: string } {
  if (!ALLOWED_EXTENSIONS.includes(data.fileType)) {
    return { valid: false, error: "Invalid file type" };
  }
  if (data.fileSizeBytes > MAX_FILE_SIZE_BYTES) {
    return { valid: false, error: "File too large" };
  }
  if (
    data.imageWidth !== undefined &&
    data.imageHeight !== undefined &&
    (data.imageWidth < MIN_DIMENSION_PX || data.imageHeight < MIN_DIMENSION_PX)
  ) {
    return { valid: false, error: "Image dimensions too small for printing" };
  }
  return { valid: true };
}
