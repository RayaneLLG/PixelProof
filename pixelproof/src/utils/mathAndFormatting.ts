/**
 * PixelProof — Math, Formatting, and Algorithmic Utilities
 */

/**
 * Format raw bytes into human-readable units (B, KB, MB, GB).
 */
export function formatBytes(bytes: number, decimals: number = 2): string {
  if (!Number.isFinite(bytes) || bytes < 0) return '0 B';
  if (bytes === 0) return '0 B';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));
  const unitIndex = Math.min(i, sizes.length - 1);

  const value = bytes / Math.pow(k, unitIndex);
  // Format with specified decimals, omitting trailing zeros for cleaner look when integer
  const formatted = value.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: dm,
  });

  return `${formatted} ${sizes[unitIndex]}`;
}

/**
 * Compute the Greatest Common Divisor using the Euclidean algorithm.
 */
export function gcd(a: number, b: number): number {
  a = Math.abs(Math.round(a));
  b = Math.abs(Math.round(b));
  while (b) {
    const t = b;
    b = a % b;
    a = t;
  }
  return a;
}

/**
 * Standard known photographic & digital display aspect ratios.
 */
const STANDARD_RATIOS: Array<{ name: string; decimal: number; tolerance: number }> = [
  { name: '1:1 (Square)', decimal: 1.0, tolerance: 0.015 },
  { name: '4:3 (Standard Photo/Tablet)', decimal: 4 / 3, tolerance: 0.02 },
  { name: '3:4 (Portrait Standard)', decimal: 3 / 4, tolerance: 0.02 },
  { name: '3:2 (Classic 35mm DSLR)', decimal: 3 / 2, tolerance: 0.02 },
  { name: '2:3 (Portrait 35mm)', decimal: 2 / 3, tolerance: 0.02 },
  { name: '16:9 (Widescreen HD/4K)', decimal: 16 / 9, tolerance: 0.02 },
  { name: '9:16 (Vertical Video/Story)', decimal: 9 / 16, tolerance: 0.02 },
  { name: '16:10 (Computer Display)', decimal: 16 / 10, tolerance: 0.02 },
  { name: '21:9 (Ultrawide Cinematic)', decimal: 21 / 9, tolerance: 0.03 },
  { name: '5:4 (Large Format/Monitor)', decimal: 5 / 4, tolerance: 0.02 },
  { name: '4:5 (Social Portrait)', decimal: 4 / 5, tolerance: 0.02 },
];

/**
 * Calculate precise aspect ratio and find nearest recognized standard.
 */
export function calculateAspectRatio(
  width: number,
  height: number
): {
  ratioString: string;
  decimal: number;
  nearestStandard?: string;
  reducedWidth: number;
  reducedHeight: number;
} {
  if (!width || !height || width <= 0 || height <= 0) {
    return {
      ratioString: '0:0',
      decimal: 0,
      reducedWidth: 0,
      reducedHeight: 0,
    };
  }

  const divisor = gcd(width, height);
  let reducedWidth = Math.round(width / divisor);
  let reducedHeight = Math.round(height / divisor);

  // If numbers are very large primes (e.g. 1919:1079), simplify to closest standard or clean ratio
  const decimal = width / height;

  let nearestMatch: string | undefined;
  for (const std of STANDARD_RATIOS) {
    if (Math.abs(decimal - std.decimal) <= std.tolerance) {
      nearestMatch = std.name;
      break;
    }
  }

  return {
    ratioString: `${reducedWidth}:${reducedHeight}`,
    decimal: Number(decimal.toFixed(4)),
    nearestStandard: nearestMatch,
    reducedWidth,
    reducedHeight,
  };
}

/**
 * Calculate proportional resize given target width or target height.
 */
export function calculateProportionalDimensions(
  originalWidth: number,
  originalHeight: number,
  targetWidth?: number,
  targetHeight?: number
): {
  width: number;
  height: number;
  scaleFactor: number;
  pixelCount: number;
  warning?: string;
} {
  if (!originalWidth || !originalHeight || originalWidth <= 0 || originalHeight <= 0) {
    return { width: 0, height: 0, scaleFactor: 1, pixelCount: 0 };
  }

  const originalAspect = originalWidth / originalHeight;
  let newWidth = originalWidth;
  let newHeight = originalHeight;

  if (targetWidth && targetWidth > 0 && (!targetHeight || targetHeight <= 0)) {
    newWidth = Math.round(targetWidth);
    newHeight = Math.round(targetWidth / originalAspect);
  } else if (targetHeight && targetHeight > 0 && (!targetWidth || targetWidth <= 0)) {
    newHeight = Math.round(targetHeight);
    newWidth = Math.round(targetHeight * originalAspect);
  } else if (targetWidth && targetHeight && targetWidth > 0 && targetHeight > 0) {
    newWidth = Math.round(targetWidth);
    newHeight = Math.round(targetHeight);
  }

  // Ensure minimum dimensions of 1x1
  newWidth = Math.max(1, newWidth);
  newHeight = Math.max(1, newHeight);

  const scaleFactor = Number((newWidth / originalWidth).toFixed(4));
  const pixelCount = newWidth * newHeight;

  let warning: string | undefined;
  if (scaleFactor > 1.25) {
    warning = `Upscaling by ${(scaleFactor * 100).toFixed(0)}% may cause pixelation, blurriness, or interpolation artifacts as the browser generates synthetic pixels.`;
  } else if (newWidth < 32 || newHeight < 32) {
    warning = `Extremely small dimensions (${newWidth}×${newHeight}px). High-frequency details and legibility will be lost.`;
  }

  return {
    width: newWidth,
    height: newHeight,
    scaleFactor,
    pixelCount,
    warning,
  };
}

/**
 * Calculate exact percentage difference between original and optimized file size.
 * Positive percent = size reduction (savings).
 * Negative percent = size increase (expansion).
 */
export function calculatePercentageDiff(
  originalBytes: number,
  newBytes: number
): {
  percent: number; // e.g. 42.5 for 42.5% smaller, -15.0 for 15% larger
  isReduction: boolean;
  isSame: boolean;
  text: string;
} {
  if (originalBytes <= 0 || newBytes <= 0) {
    return { percent: 0, isReduction: false, isSame: true, text: '0% change' };
  }

  const diffBytes = originalBytes - newBytes;
  const percent = Number(((diffBytes / originalBytes) * 100).toFixed(1));

  if (Math.abs(percent) < 0.1) {
    return { percent: 0, isReduction: false, isSame: true, text: 'No measurable change' };
  }

  if (percent > 0) {
    return {
      percent,
      isReduction: true,
      isSame: false,
      text: `${percent}% smaller (${formatBytes(diffBytes)} saved)`,
    };
  }

  const increasePercent = Math.abs(percent);
  return {
    percent,
    isReduction: false,
    isSame: false,
    text: `${increasePercent}% larger (+${formatBytes(Math.abs(diffBytes))})`,
  };
}

/**
 * Color converters
 */
export function rgbToHex(r: number, g: number, b: number): string {
  const clamp = (v: number) => Math.max(0, Math.min(255, Math.round(v)));
  const hexR = clamp(r).toString(16).padStart(2, '0');
  const hexG = clamp(g).toString(16).padStart(2, '0');
  const hexB = clamp(b).toString(16).padStart(2, '0');
  return `#${hexR}${hexG}${hexB}`.toUpperCase();
}

export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const sanitized = hex.replace('#', '').trim();
  if (sanitized.length === 3) {
    const r = parseInt(sanitized[0] + sanitized[0], 16);
    const g = parseInt(sanitized[1] + sanitized[1], 16);
    const b = parseInt(sanitized[2] + sanitized[2], 16);
    return { r, g, b };
  }
  if (sanitized.length === 6) {
    const r = parseInt(sanitized.substring(0, 2), 16);
    const g = parseInt(sanitized.substring(2, 4), 16);
    const b = parseInt(sanitized.substring(4, 6), 16);
    return { r, g, b };
  }
  return null;
}

export function rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
}

/**
 * Determine perceived luminance using standard Rec. 709 formula.
 */
export function getLuminance(r: number, g: number, b: number): number {
  return 0.2126 * (r / 255) + 0.7152 * (g / 255) + 0.0722 * (b / 255);
}

/**
 * Rough descriptive color name heuristics based on HSL.
 */
export function estimateColorName(r: number, g: number, b: number): string {
  const { h, s, l } = rgbToHsl(r, g, b);

  if (l <= 8) return 'Jet Black';
  if (l >= 95 && s <= 10) return 'Crisp White';
  if (s <= 10) {
    if (l < 30) return 'Charcoal Grey';
    if (l < 60) return 'Neutral Grey';
    return 'Soft Silver';
  }

  if (h >= 345 || h < 15) {
    if (l < 35) return 'Deep Crimson';
    if (l > 75) return 'Pastel Rose';
    return 'Ruby Red';
  }
  if (h >= 15 && h < 45) {
    if (l < 40) return 'Burnt Sienna';
    if (l > 75) return 'Warm Peach';
    return 'Amber Orange';
  }
  if (h >= 45 && h < 70) {
    if (l < 40) return 'Olive Gold';
    if (l > 80) return 'Pale Cream';
    return 'Golden Yellow';
  }
  if (h >= 70 && h < 165) {
    if (l < 35) return 'Forest Green';
    if (l > 75) return 'Mint Green';
    if (s < 40) return 'Muted Sage';
    return 'Vibrant Emerald';
  }
  if (h >= 165 && h < 200) {
    if (l < 40) return 'Deep Teal';
    return 'Cyan Aqua';
  }
  if (h >= 200 && h < 260) {
    if (l < 30) return 'Navy Cobalt';
    if (l > 75) return 'Sky Cerulean';
    if (s < 40) return 'Slate Blue';
    return 'Ultramarine Blue';
  }
  if (h >= 260 && h < 315) {
    if (l < 35) return 'Deep Indigo';
    if (l > 75) return 'Soft Lavender';
    return 'Royal Violet';
  }
  if (h >= 315 && h < 345) {
    if (l < 40) return 'Dark Plum';
    return 'Magenta Fuchsia';
  }

  return 'Chromatic Tone';
}

/**
 * Reliably copy text to clipboard with modern Async Clipboard API and legacy fallback.
 * Handles unprivileged iframes, mobile browsers, and focus restrictions gracefully.
 */
export async function copyTextToClipboard(text: string): Promise<boolean> {
  // 1. Attempt modern navigator.clipboard API if available
  if (
    typeof navigator !== 'undefined' &&
    navigator.clipboard &&
    typeof navigator.clipboard.writeText === 'function'
  ) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // Fall through to fallback DOM method
    }
  }

  // 2. Fallback using temporary textarea element and document.execCommand
  if (typeof document !== 'undefined' && document.body) {
    try {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.top = '-9999px';
      textArea.style.left = '-9999px';
      textArea.style.opacity = '0';
      textArea.setAttribute('readonly', '');
      textArea.setAttribute('aria-hidden', 'true');
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      const successful = document.execCommand('copy');
      document.body.removeChild(textArea);
      return successful;
    } catch {
      return false;
    }
  }

  return false;
}

/**
 * Reliably trigger file download across modern and legacy browsers (including Firefox DOM requirements).
 */
export function triggerFileDownload(url: string, filename: string): void {
  if (typeof document === 'undefined') return;
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.style.display = 'none';
  document.body.appendChild(a);
  a.click();
  // Cleanup after click event dispatches
  setTimeout(() => {
    if (a.parentNode) {
      a.parentNode.removeChild(a);
    }
  }, 100);
}
