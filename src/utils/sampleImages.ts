/**
 * PixelProof — Curated Sample Assets
 * Provides instant laboratory test images for immediate inspection.
 */

// Import generated sample images
import lensUrl from '../assets/images/sample_optical_lens_1791541591008.jpg';
import facadeUrl from '../assets/images/sample_architecture_facade_1791541608113.jpg';
import leafUrl from '../assets/images/sample_botanical_leaf_1791541619705.jpg';

export interface SampleItem {
  id: string;
  name: string;
  description: string;
  format: 'JPEG' | 'PNG' | 'WebP';
  dimensions: string;
  hasAlpha: boolean;
  url: string;
}

// Generate a clean transparent PNG laboratory test badge as an SVG-data-URL converted to File
export function createTransparentBadgeBlob(): Promise<Blob> {
  const canvas = document.createElement('canvas');
  canvas.width = 600;
  canvas.height = 600;
  const ctx = canvas.getContext('2d');

  if (!ctx) return Promise.reject(new Error('Canvas unavailable'));

  // Completely transparent background
  ctx.clearRect(0, 0, 600, 600);

  // Outer ring with alpha
  ctx.beginPath();
  ctx.arc(300, 300, 240, 0, Math.PI * 2);
  ctx.strokeStyle = '#2563EB';
  ctx.lineWidth = 16;
  ctx.stroke();

  // Inner geometric aperture ring
  ctx.beginPath();
  ctx.arc(300, 300, 160, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(37, 99, 235, 0.15)';
  ctx.fill();
  ctx.strokeStyle = '#3B82F6';
  ctx.lineWidth = 8;
  ctx.stroke();

  // Center crosshair
  ctx.strokeStyle = '#1D4ED8';
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.moveTo(300, 80);
  ctx.lineTo(300, 520);
  ctx.moveTo(80, 300);
  ctx.lineTo(520, 300);
  ctx.stroke();

  // Center dot
  ctx.beginPath();
  ctx.arc(300, 300, 32, 0, Math.PI * 2);
  ctx.fillStyle = '#1E40AF';
  ctx.fill();

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error('Could not generate badge blob'));
    }, 'image/png');
  });
}

export const SAMPLE_IMAGES: SampleItem[] = [
  {
    id: 'lens',
    name: 'Optical Lens Element',
    description: 'Macro studio photograph of camera aperture with chromatic reflections and mechanical barrel.',
    format: 'JPEG',
    dimensions: '1920×1080 (16:9)',
    hasAlpha: false,
    url: lensUrl,
  },
  {
    id: 'facade',
    name: 'Architectural Facade',
    description: 'Minimalist concrete and glass structure with geometric shadow lines and crisp contrast.',
    format: 'JPEG',
    dimensions: '1440×1080 (4:3)',
    hasAlpha: false,
    url: facadeUrl,
  },
  {
    id: 'leaf',
    name: 'Botanical Leaf Macro',
    description: 'High-resolution Monstera leaf exhibiting cellular chlorophyll veins and water droplets.',
    format: 'JPEG',
    dimensions: '1080×1080 (1:1)',
    hasAlpha: false,
    url: leafUrl,
  },
];

/**
 * Fetch a sample image by URL and convert to a File object
 */
export async function fetchSampleAsFile(sample: SampleItem): Promise<File> {
  const response = await fetch(sample.url);
  if (!response.ok) {
    throw new Error(`Failed to load sample image "${sample.name}": HTTP ${response.status}`);
  }
  const blob = await response.blob();
  const extension = sample.format.toLowerCase();
  const mimeType = blob.type || (sample.format === 'JPEG' ? 'image/jpeg' : 'image/png');
  const file = new File([blob], `${sample.id}_sample.${extension}`, {
    type: mimeType,
  });
  return file;
}
