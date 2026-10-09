/**
 * PixelProof — Online Image Analysis Lab
 * Type Definitions
 */

export interface ImageMetadata {
  fileName: string;
  fileSize: number;
  fileSizeBytesText: string;
  mimeType: string;
  format: string; // 'JPEG' | 'PNG' | 'WebP' | 'AVIF' | 'GIF' | 'SVG' | 'Unknown'
  width: number;
  height: number;
  aspectRatio: {
    ratioString: string;
    decimal: number;
    nearestStandard?: string;
  };
  orientation: string;
  hasAlphaChannel: boolean | 'unknown';
  colorDepth?: number;
  dpi?: { x: number; y: number };
  exif?: Record<string, string | number>;
  pngChunks?: string[];
  lastModified?: number;
}

export interface PaletteColor {
  hex: string;
  rgb: { r: number; g: number; b: number };
  hsl: { h: number; s: number; l: number };
  percentage: number;
  isLight: boolean;
  nameEstimate: string;
}

export interface ResizeTarget {
  width: number;
  height: number;
  aspectRatioPreserved: boolean;
  scaleFactor: number;
  pixelCount: number;
  qualityWarning?: string;
}

export interface PresetDimension {
  name: string;
  width: number;
  height: number;
  category: 'Social' | 'Web' | 'Print' | 'Standard Display';
  aspectRatio: string;
}

export interface OptimizationOption {
  format: 'image/jpeg' | 'image/png' | 'image/webp' | 'image/avif';
  quality: number; // 0.1 to 1.0
  maxWidth?: number;
  maxHeight?: number;
}

export interface OptimizationResult {
  blob: Blob;
  dataUrl: string;
  fileName: string;
  originalSize: number;
  optimizedSize: number;
  sizeDifference: number; // bytes
  percentReduction: number; // e.g. 42.5%
  format: string;
  width: number;
  height: number;
  processingTimeMs: number;
  hasAlphaStrippedWarning: boolean;
}

export interface EducationalGuide {
  slug: string;
  title: string;
  summary: string;
  category: 'Dimensions & Geometry' | 'Color & Pigment' | 'Compression & Optimization' | 'Formats & Protocols' | 'Metadata & Privacy';
  readTime: string;
  lastUpdated: string;
  relatedToolUrl: string;
  relatedToolName: string;
  content: {
    introduction: string;
    sections: Array<{
      heading: string;
      body: string[];
      codeExample?: string;
      callout?: {
        type: 'info' | 'warning' | 'tip';
        text: string;
      };
    }>;
    limitations: string[];
    faq: Array<{ question: string; answer: string }>;
  };
}
