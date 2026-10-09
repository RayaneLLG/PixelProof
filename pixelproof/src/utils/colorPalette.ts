/**
 * PixelProof — Color Palette Extractor
 * High-performance browser-based color quantization using modified Median Cut
 * with alpha transparency rejection and perceptual sorting.
 */

import { PaletteColor } from '../types';
import { rgbToHex, rgbToHsl, estimateColorName, getLuminance } from './mathAndFormatting';

interface ColorBox {
  pixels: Array<[number, number, number]>;
  rMin: number;
  rMax: number;
  gMin: number;
  gMax: number;
  bMin: number;
  bMax: number;
}

function createBox(pixels: Array<[number, number, number]>): ColorBox {
  let rMin = 255, rMax = 0;
  let gMin = 255, gMax = 0;
  let bMin = 255, bMax = 0;

  for (let i = 0; i < pixels.length; i++) {
    const [r, g, b] = pixels[i];
    if (r < rMin) rMin = r;
    if (r > rMax) rMax = r;
    if (g < gMin) gMin = g;
    if (g > gMax) gMax = g;
    if (b < bMin) bMin = b;
    if (b > bMax) bMax = b;
  }

  return { pixels, rMin, rMax, gMin, gMax, bMin, bMax };
}

function getBoxRange(box: ColorBox): { axis: 'r' | 'g' | 'b'; range: number } {
  const rRange = box.rMax - box.rMin;
  const gRange = box.gMax - box.gMin;
  const bRange = box.bMax - box.bMin;

  if (rRange >= gRange && rRange >= bRange) return { axis: 'r', range: rRange };
  if (gRange >= rRange && gRange >= bRange) return { axis: 'g', range: gRange };
  return { axis: 'b', range: bRange };
}

function splitBox(box: ColorBox): [ColorBox, ColorBox] {
  if (box.pixels.length <= 1) return [box, createBox([])];

  const { axis } = getBoxRange(box);
  const axisIdx = axis === 'r' ? 0 : axis === 'g' ? 1 : 2;

  // Sort by the widest color channel
  box.pixels.sort((p1, p2) => p1[axisIdx] - p2[axisIdx]);

  const medianIdx = Math.floor(box.pixels.length / 2);
  const part1 = box.pixels.slice(0, medianIdx);
  const part2 = box.pixels.slice(medianIdx);

  return [createBox(part1), createBox(part2)];
}

/**
 * Extract dominant palette from an HTMLImageElement or ImageBitmap
 */
export async function extractColorPalette(
  img: HTMLImageElement,
  paletteSize: number = 8
): Promise<PaletteColor[]> {
  const canvas = document.createElement('canvas');
  // Sample at a balanced resolution (max 200x200 = 40,000 pixels) for instant real-time extraction
  const maxDimension = 200;
  const naturalWidth = img.naturalWidth || img.width || 100;
  const naturalHeight = img.naturalHeight || img.height || 100;

  const scale = Math.min(1, maxDimension / Math.max(naturalWidth, naturalHeight));
  const width = Math.max(1, Math.round(naturalWidth * scale));
  const height = Math.max(1, Math.round(naturalHeight * scale));

  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) return [];

  ctx.drawImage(img, 0, 0, width, height);
  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;

  const sampledPixels: Array<[number, number, number]> = [];
  let opaquePixelCount = 0;

  // Step across pixels: filter transparent pixels (alpha < 128)
  for (let i = 0; i < data.length; i += 4) {
    const alpha = data[i + 3];
    if (alpha >= 128) {
      opaquePixelCount++;
      // Sample every 2nd or 3rd pixel for speed while preserving fidelity
      sampledPixels.push([data[i], data[i + 1], data[i + 2]]);
    }
  }

  if (sampledPixels.length === 0) {
    // If entirely transparent image, return a fallback neutral indicator
    return [
      {
        hex: '#FFFFFF',
        rgb: { r: 255, g: 255, b: 255 },
        hsl: { h: 0, s: 0, l: 100 },
        percentage: 100,
        isLight: true,
        nameEstimate: 'Transparent / Alpha Empty',
      },
    ];
  }

  // Initial root color box
  const boxes: ColorBox[] = [createBox(sampledPixels)];

  // Iteratively split the box with largest range until target count reached
  while (boxes.length < paletteSize) {
    let bestBoxIdx = -1;
    let maxRange = -1;

    for (let i = 0; i < boxes.length; i++) {
      if (boxes[i].pixels.length > 4) {
        const { range } = getBoxRange(boxes[i]);
        if (range > maxRange) {
          maxRange = range;
          bestBoxIdx = i;
        }
      }
    }

    if (bestBoxIdx === -1 || maxRange <= 0) {
      break; // cannot split further
    }

    const boxToSplit = boxes.splice(bestBoxIdx, 1)[0];
    const [b1, b2] = splitBox(boxToSplit);
    if (b1.pixels.length > 0) boxes.push(b1);
    if (b2.pixels.length > 0) boxes.push(b2);
  }

  // Calculate average color for each box
  const totalPixelsInBoxes = boxes.reduce((acc, b) => acc + b.pixels.length, 0);

  const colors: PaletteColor[] = boxes.map((box) => {
    let rSum = 0, gSum = 0, bSum = 0;
    for (let i = 0; i < box.pixels.length; i++) {
      rSum += box.pixels[i][0];
      gSum += box.pixels[i][1];
      bSum += box.pixels[i][2];
    }
    const count = box.pixels.length;
    const r = Math.round(rSum / count);
    const g = Math.round(gSum / count);
    const b = Math.round(bSum / count);

    const hex = rgbToHex(r, g, b);
    const hsl = rgbToHsl(r, g, b);
    const luminance = getLuminance(r, g, b);
    const percentage = Number(((count / totalPixelsInBoxes) * 100).toFixed(1));
    const nameEstimate = estimateColorName(r, g, b);

    return {
      hex,
      rgb: { r, g, b },
      hsl,
      percentage,
      isLight: luminance > 0.55,
      nameEstimate,
    };
  });

  // Sort by representation percentage descending
  colors.sort((a, b) => b.percentage - a.percentage);

  return colors;
}
