/**
 * PixelProof — Browser-Native Image Optimizer and Exporter
 * Converts, scales, and recompresses images locally via Canvas & Blob APIs.
 */

import { OptimizationOption, OptimizationResult } from '../types';
import { calculatePercentageDiff } from './mathAndFormatting';

/**
 * Check if the current browser environment can encode to a specific MIME format.
 */
export async function isFormatSupported(mimeType: string): Promise<boolean> {
  try {
    const canvas = document.createElement('canvas');
    canvas.width = 2;
    canvas.height = 2;
    return await new Promise<boolean>((resolve) => {
      canvas.toBlob((blob) => {
        resolve(Boolean(blob && blob.type === mimeType));
      }, mimeType, 0.8);
    });
  } catch {
    return false;
  }
}

/**
 * Optimize an image element using client-side canvas rasterization.
 */
export async function optimizeImage(
  img: HTMLImageElement,
  originalFile: { name: string; size: number },
  options: OptimizationOption,
  hasAlpha: boolean
): Promise<OptimizationResult> {
  const startTime = performance.now();

  const originalWidth = img.naturalWidth || img.width;
  const originalHeight = img.naturalHeight || img.height;

  // Determine target dimensions
  let targetWidth = originalWidth;
  let targetHeight = originalHeight;

  if (options.maxWidth && options.maxWidth < targetWidth) {
    const scale = options.maxWidth / targetWidth;
    targetWidth = Math.round(targetWidth * scale);
    targetHeight = Math.round(targetHeight * scale);
  }

  if (options.maxHeight && options.maxHeight < targetHeight) {
    const scale = options.maxHeight / targetHeight;
    targetWidth = Math.round(targetWidth * scale);
    targetHeight = Math.round(targetHeight * scale);
  }

  targetWidth = Math.max(1, targetWidth);
  targetHeight = Math.max(1, targetHeight);

  // Setup canvas
  const canvas = document.createElement('canvas');
  canvas.width = targetWidth;
  canvas.height = targetHeight;
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('Canvas 2D context could not be initialized.');
  }

  // Smooth resampling
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  // If exporting to JPEG and original had alpha, fill background with clean white
  const isLossyJpeg = options.format === 'image/jpeg';
  const hasAlphaStrippedWarning = Boolean(isLossyJpeg && hasAlpha);

  if (isLossyJpeg) {
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, targetWidth, targetHeight);
  } else {
    ctx.clearRect(0, 0, targetWidth, targetHeight);
  }

  ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

  // Encode to target format and quality
  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (b) => {
        if (!b) {
          reject(new Error(`Failed to encode image to ${options.format}.`));
          return;
        }
        // Per HTML Canvas specification: Browsers default to image/png when the requested format is unsupported
        if (options.format !== 'image/png' && b.type === 'image/png') {
          reject(
            new Error(
              `Your browser does not support encoding to ${options.format}. Please select WebP, JPEG, or PNG.`
            )
          );
          return;
        }
        resolve(b);
      },
      options.format,
      options.format === 'image/png' ? undefined : options.quality
    );
  });

  const processingTimeMs = Math.round(performance.now() - startTime);
  const dataUrl = URL.createObjectURL(blob);

  // Derive appropriate file extension
  let ext = 'jpg';
  if (options.format === 'image/png') ext = 'png';
  else if (options.format === 'image/webp') ext = 'webp';
  else if (options.format === 'image/avif') ext = 'avif';

  const baseName = originalFile.name.replace(/\.[^/.]+$/, '');
  const outFileName = `${baseName}_optimized.${ext}`;

  const diff = calculatePercentageDiff(originalFile.size, blob.size);

  return {
    blob,
    dataUrl,
    fileName: outFileName,
    originalSize: originalFile.size,
    optimizedSize: blob.size,
    sizeDifference: originalFile.size - blob.size,
    percentReduction: diff.percent,
    format: ext.toUpperCase(),
    width: targetWidth,
    height: targetHeight,
    processingTimeMs,
    hasAlphaStrippedWarning,
  };
}
