/**
 * PixelProof — Deep Browser-Native Image Parser
 * Reads binary headers, EXIF APP1 tags, PNG chunks, WebP descriptors,
 * and performs alpha channel pixel inspection.
 */

import { calculateAspectRatio, formatBytes } from './mathAndFormatting';
import { ImageMetadata } from '../types';

/**
 * Read EXIF metadata from raw JPEG ArrayBuffer
 */
function parseJpegExif(buffer: ArrayBuffer): Record<string, string | number> {
  const exif: Record<string, string | number> = {};
  const view = new DataView(buffer);

  if (view.byteLength < 4) return exif;
  // Check SOI marker
  if (view.getUint16(0) !== 0xffd8) return exif;

  let offset = 2;
  const length = view.byteLength;

  while (offset < length - 4) {
    const marker = view.getUint16(offset);
    offset += 2;

    // APP1 marker 0xFFE1 (EXIF)
    if (marker === 0xffe1) {
      const app1Length = view.getUint16(offset);
      offset += 2;

      // Check for 'Exif\0\0' (0x45786966 0x0000)
      if (
        view.getUint32(offset) === 0x45786966 &&
        view.getUint16(offset + 4) === 0x0000
      ) {
        const tiffOffset = offset + 6;
        parseTiffHeader(view, tiffOffset, exif);
      }
      break;
    } else if ((marker & 0xff00) === 0xff00 && marker !== 0xffd8 && marker !== 0xffd9) {
      // Skip other APP markers
      const markerLength = view.getUint16(offset);
      offset += markerLength;
    } else {
      break;
    }
  }

  return exif;
}

function parseTiffHeader(
  view: DataView,
  tiffOffset: number,
  exif: Record<string, string | number>
) {
  if (tiffOffset + 8 > view.byteLength) return;

  const endian = view.getUint16(tiffOffset);
  const littleEndian = endian === 0x4949; // 'II' = little endian, 'MM' = big endian

  // TIFF tag 42 check
  if (view.getUint16(tiffOffset + 2, littleEndian) !== 0x002a) return;

  const firstIfdOffset = view.getUint32(tiffOffset + 4, littleEndian);
  if (firstIfdOffset < 8) return;

  const ifd0Start = tiffOffset + firstIfdOffset;
  parseIfd(view, tiffOffset, ifd0Start, littleEndian, exif);
}

const TAG_NAMES: Record<number, string> = {
  0x010f: 'Camera Make',
  0x0110: 'Camera Model',
  0x0112: 'Orientation',
  0x011a: 'X Resolution',
  0x011b: 'Y Resolution',
  0x0128: 'Resolution Unit',
  0x0131: 'Software',
  0x0132: 'Date Modified',
  0x013b: 'Artist',
  0x8298: 'Copyright',
  0x8769: 'ExifIFDPointer',
  0x829a: 'Exposure Time (s)',
  0x829d: 'F-Number (Aperture)',
  0x8827: 'ISO Speed',
  0x9003: 'Date Taken',
  0x920a: 'Focal Length (mm)',
  0xa434: 'Lens Model',
};

function parseIfd(
  view: DataView,
  tiffOffset: number,
  ifdStart: number,
  littleEndian: boolean,
  exif: Record<string, string | number>
) {
  if (ifdStart + 2 > view.byteLength) return;

  const entryCount = view.getUint16(ifdStart, littleEndian);
  let entryOffset = ifdStart + 2;

  let exifSubIfdOffset: number | null = null;

  for (let i = 0; i < entryCount; i++) {
    if (entryOffset + 12 > view.byteLength) break;

    const tag = view.getUint16(entryOffset, littleEndian);
    const type = view.getUint16(entryOffset + 2, littleEndian);
    const count = view.getUint32(entryOffset + 4, littleEndian);
    const valueOffset = entryOffset + 8;

    if (tag === 0x8769) {
      // SubIFD pointer
      exifSubIfdOffset = view.getUint32(valueOffset, littleEndian);
    } else if (TAG_NAMES[tag]) {
      const tagName = TAG_NAMES[tag];
      const parsedValue = readTagValue(view, tiffOffset, type, count, valueOffset, littleEndian);
      if (parsedValue !== null) {
        exif[tagName] = parsedValue;
      }
    }

    entryOffset += 12;
  }

  // If there's an Exif SubIFD, parse it for exposure, lens, etc.
  if (exifSubIfdOffset && tiffOffset + exifSubIfdOffset + 2 <= view.byteLength) {
    const subIfdStart = tiffOffset + exifSubIfdOffset;
    const subCount = view.getUint16(subIfdStart, littleEndian);
    let subEntryOffset = subIfdStart + 2;

    for (let j = 0; j < subCount; j++) {
      if (subEntryOffset + 12 > view.byteLength) break;
      const tag = view.getUint16(subEntryOffset, littleEndian);
      const type = view.getUint16(subEntryOffset + 2, littleEndian);
      const count = view.getUint32(subEntryOffset + 4, littleEndian);
      const valueOffset = subEntryOffset + 8;

      if (TAG_NAMES[tag]) {
        const tagName = TAG_NAMES[tag];
        const parsedValue = readTagValue(view, tiffOffset, type, count, valueOffset, littleEndian);
        if (parsedValue !== null) {
          exif[tagName] = parsedValue;
        }
      }
      subEntryOffset += 12;
    }
  }
}

function readTagValue(
  view: DataView,
  tiffOffset: number,
  type: number,
  count: number,
  valueOffset: number,
  littleEndian: boolean
): string | number | null {
  try {
    // Type 2: ASCII string
    if (type === 2) {
      const dataOffset = count > 4 ? tiffOffset + view.getUint32(valueOffset, littleEndian) : valueOffset;
      if (dataOffset + count > view.byteLength) return null;
      let str = '';
      for (let i = 0; i < count - 1; i++) {
        const charCode = view.getUint8(dataOffset + i);
        if (charCode === 0) break;
        str += String.fromCharCode(charCode);
      }
      return str.trim();
    }

    // Type 3: SHORT (uint16)
    if (type === 3) {
      return view.getUint16(valueOffset, littleEndian);
    }

    // Type 4: LONG (uint32)
    if (type === 4) {
      return view.getUint32(valueOffset, littleEndian);
    }

    // Type 5: RATIONAL (two uint32s: numerator and denominator)
    if (type === 5) {
      const dataOffset = tiffOffset + view.getUint32(valueOffset, littleEndian);
      if (dataOffset + 8 > view.byteLength) return null;
      const num = view.getUint32(dataOffset, littleEndian);
      const den = view.getUint32(dataOffset + 4, littleEndian);
      if (den === 0) return 0;
      if (num === 1) return `1/${den}`;
      return Number((num / den).toFixed(2));
    }
  } catch {
    return null;
  }

  return null;
}

/**
 * Parse PNG Chunks (IHDR, pHYs, tEXt, tRNS)
 */
function parsePngDetails(buffer: ArrayBuffer): {
  colorType?: number;
  bitDepth?: number;
  hasAlpha: boolean;
  dpi?: { x: number; y: number };
  chunks: string[];
} {
  const view = new DataView(buffer);
  const chunks: string[] = [];
  let hasAlpha = false;
  let colorType: number | undefined;
  let bitDepth: number | undefined;
  let dpi: { x: number; y: number } | undefined;

  if (view.byteLength < 8) return { hasAlpha, chunks };

  // PNG magic number check
  if (
    view.getUint32(0) !== 0x89504e47 ||
    view.getUint32(4) !== 0x0d0a1a0a
  ) {
    return { hasAlpha, chunks };
  }

  let offset = 8;
  while (offset + 8 <= view.byteLength) {
    const length = view.getUint32(offset);
    offset += 4;

    let chunkType = '';
    for (let i = 0; i < 4; i++) {
      chunkType += String.fromCharCode(view.getUint8(offset + i));
    }
    offset += 4;

    if (!chunks.includes(chunkType)) {
      chunks.push(chunkType);
    }

    if (chunkType === 'IHDR' && length >= 13) {
      bitDepth = view.getUint8(offset + 8);
      colorType = view.getUint8(offset + 9);
      // colorType 4 (grayscale+alpha) or 6 (truecolor+alpha)
      if (colorType === 4 || colorType === 6) {
        hasAlpha = true;
      }
    } else if (chunkType === 'tRNS') {
      // Transparency chunk present
      hasAlpha = true;
    } else if (chunkType === 'pHYs' && length >= 9) {
      const ppuX = view.getUint32(offset);
      const ppuY = view.getUint32(offset + 4);
      const unit = view.getUint8(offset + 8);
      if (unit === 1) {
        // unit 1 is meters (convert to DPI: dots per meter / 39.3701)
        const dpiX = Math.round(ppuX * 0.0254);
        const dpiY = Math.round(ppuY * 0.0254);
        dpi = { x: dpiX, y: dpiY };
      }
    }

    // Advance data + 4 bytes CRC
    offset += length + 4;
  }

  return { colorType, bitDepth, hasAlpha, dpi, chunks };
}

/**
 * Inspect canvas pixels to determine whether image actually contains transparent pixels.
 */
function inspectAlphaChannel(
  img: HTMLImageElement,
  width: number,
  height: number
): boolean {
  try {
    const canvas = document.createElement('canvas');
    // Scale down sample size if image is very large for instant processing
    const sampleWidth = Math.min(width, 400);
    const sampleHeight = Math.min(height, 400);
    canvas.width = sampleWidth;
    canvas.height = sampleHeight;

    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return false;

    ctx.clearRect(0, 0, sampleWidth, sampleHeight);
    ctx.drawImage(img, 0, 0, sampleWidth, sampleHeight);

    const imgData = ctx.getImageData(0, 0, sampleWidth, sampleHeight);
    const data = imgData.data;

    // Check alpha bytes (every 4th byte starting at index 3)
    for (let i = 3; i < data.length; i += 4) {
      if (data[i] < 255) {
        return true;
      }
    }
    return false;
  } catch {
    return false;
  }
}

/**
 * Detect file format based on magic bytes
 */
export function detectFileFormat(buffer: ArrayBuffer): {
  format: string;
  mimeType: string;
} {
  const view = new DataView(buffer);
  if (view.byteLength < 4) {
    return { format: 'Unknown', mimeType: 'application/octet-stream' };
  }

  // JPEG: FF D8 FF
  if (view.getUint16(0) === 0xffd8) {
    return { format: 'JPEG', mimeType: 'image/jpeg' };
  }

  // PNG: 89 50 4E 47
  if (view.getUint32(0) === 0x89504e47) {
    return { format: 'PNG', mimeType: 'image/png' };
  }

  // GIF: GIF87a or GIF89a
  if (
    view.getUint32(0) === 0x47494638 &&
    (view.getUint16(4) === 0x3761 || view.getUint16(4) === 0x3961)
  ) {
    return { format: 'GIF', mimeType: 'image/gif' };
  }

  // WebP: RIFF .... WEBP
  if (
    view.getUint32(0) === 0x52494646 &&
    view.byteLength >= 12 &&
    view.getUint32(8) === 0x57454250
  ) {
    return { format: 'WebP', mimeType: 'image/webp' };
  }

  // AVIF: check ftyp box
  if (view.byteLength >= 12 && view.getUint32(4) === 0x66747970) {
    const brand = view.getUint32(8);
    if (brand === 0x61766966 || brand === 0x61766973) {
      return { format: 'AVIF', mimeType: 'image/avif' };
    }
  }

  // SVG: ASCII check for '<svg' or '<?xml'
  try {
    const textDecoder = new TextDecoder('utf-8');
    const headerSample = textDecoder.decode(new Uint8Array(buffer.slice(0, 256)));
    if (headerSample.includes('<svg') || headerSample.includes('<?xml')) {
      return { format: 'SVG', mimeType: 'image/svg+xml' };
    }
  } catch {
    // ignore
  }

  return { format: 'Unknown', mimeType: 'application/octet-stream' };
}

/**
 * Full image inspector entry point.
 * Takes a File or Blob, loads it safely, extracts headers, dimensions, and pixel attributes.
 */
export async function analyzeImageFile(file: File | Blob, customName?: string): Promise<{
  metadata: ImageMetadata;
  objectUrl: string;
}> {
  const fileName = customName || (file instanceof File ? file.name : 'image_sample.jpg');
  const fileSize = file.size;
  const fileSizeBytesText = formatBytes(fileSize);

  // 1. Read binary buffer
  const buffer = await file.arrayBuffer();
  const detected = detectFileFormat(buffer);

  // 2. Create object URL safely
  const objectUrl = URL.createObjectURL(file);

  try {
    // 3. Load image in an HTMLImageElement to obtain physical dimensions
    const img = new Image();
    img.crossOrigin = 'anonymous';

    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        reject(
          new Error(
            'The uploaded file could not be decoded as an image. It may be corrupted or in an unsupported format.'
          )
        );
      };
      img.src = objectUrl;
    });

    const width = img.naturalWidth || img.width;
    const height = img.naturalHeight || img.height;

    if (width <= 0 || height <= 0) {
      URL.revokeObjectURL(objectUrl);
      throw new Error('Image dimensions could not be determined.');
    }

    // 4. Calculate aspect ratio
    const aspectRatio = calculateAspectRatio(width, height);

    // 5. Determine orientation
    let orientation = 'Square (1:1)';
    if (width > height) {
      orientation = 'Landscape (Horizontal)';
    } else if (height > width) {
      orientation = 'Portrait (Vertical)';
    }

    // 6. Format-specific extraction
    let exifData: Record<string, string | number> | undefined;
    let pngChunks: string[] | undefined;
    let dpi: { x: number; y: number } | undefined;
    let hasAlphaChannel: boolean | 'unknown' = false;

    if (detected.format === 'JPEG') {
      exifData = parseJpegExif(buffer);
      hasAlphaChannel = false; // JPEG spec does not support alpha channels
    } else if (detected.format === 'PNG') {
      const pngInfo = parsePngDetails(buffer);
      pngChunks = pngInfo.chunks;
      dpi = pngInfo.dpi;
      hasAlphaChannel = pngInfo.hasAlpha || inspectAlphaChannel(img, width, height);
    } else if (detected.format === 'WebP') {
      hasAlphaChannel = inspectAlphaChannel(img, width, height);
    } else if (detected.format === 'GIF') {
      hasAlphaChannel = inspectAlphaChannel(img, width, height);
    } else if (detected.format === 'SVG') {
      hasAlphaChannel = true;
    } else {
      hasAlphaChannel = inspectAlphaChannel(img, width, height);
    }

    const metadata: ImageMetadata = {
      fileName,
      fileSize,
      fileSizeBytesText,
      mimeType: detected.mimeType || file.type || 'image/unknown',
      format: detected.format,
      width,
      height,
      aspectRatio,
      orientation,
      hasAlphaChannel,
      dpi,
      exif: exifData && Object.keys(exifData).length > 0 ? exifData : undefined,
      pngChunks: pngChunks && pngChunks.length > 0 ? pngChunks : undefined,
      lastModified: file instanceof File ? file.lastModified : undefined,
    };

    return { metadata, objectUrl };
  } catch (err) {
    URL.revokeObjectURL(objectUrl);
    throw err;
  }
}
