// src/types/print.ts
// Types for the print-on-demand system

export interface GarmentColor {
  name: string;
  hex: string;
  mockupUrl: string;     // mockup image for this color variant
  mockupBackUrl?: string;
}

export interface PrintableProductData {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  basePrice: number;
  printSurcharge: number;
  mockupImageUrl: string;
  mockupBack: string | null;
  printAreaX: number;     // % from left of mockup image
  printAreaY: number;     // % from top of mockup image
  printAreaWidth: number; // % width of mockup image
  printAreaHeight: number;// % height of mockup image
  availableColors: GarmentColor[];
  availableSizes: string[];
  isActive: boolean;
}

// The live placement state inside the design studio
export interface DesignPlacement {
  // Position as % within the print area (0=left/top, 100=right/bottom)
  x: number;
  y: number;
  // Scale as % of print area width (10–200)
  scale: number;
  // Rotation in degrees
  rotation: number;
}

export interface DesignStudioState {
  product: PrintableProductData;
  selectedColor: GarmentColor;
  selectedSize: string;
  uploadedImageUrl: string | null;
  uploadedImageFile: File | null;
  placement: DesignPlacement;
  previewDataUrl: string | null; // canvas snapshot
  qualityWarnings: string[];
  isUploading: boolean;
  isGeneratingPreview: boolean;
}

// Data sent to server when saving a design
export interface SaveDesignPayload {
  printableProductId: string;
  originalFileUrl: string;
  originalPublicId: string;
  fileType: string;
  fileSizeBytes: number;
  imageWidth: number;
  imageHeight: number;
  placementX: number;
  placementY: number;
  designScale: number;
  designRotation: number;
  selectedColor: string;
  selectedSize: string;
  garmentColorHex: string;
  previewImageUrl?: string;
  previewPublicId?: string;
  qualityWarnings: string[];
}

// Upload validation result
export interface FileValidationResult {
  valid: boolean;
  warnings: string[];
  errors: string[];
  width?: number;
  height?: number;
  fileSizeBytes?: number;
}

// Admin design review view
export interface AdminDesignView {
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
