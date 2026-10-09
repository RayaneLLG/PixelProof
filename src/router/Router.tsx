/**
 * PixelProof — Client-Side Router with Dynamic SEO Synchronization
 */

import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';

interface RouterContextType {
  currentPath: string;
  navigate: (to: string, state?: unknown) => void;
  searchParams: URLSearchParams;
}

const RouterContext = createContext<RouterContextType>({
  currentPath: '/',
  navigate: () => {},
  searchParams: new URLSearchParams(),
});

export function useRouter() {
  return useContext(RouterContext);
}

interface SEOConfig {
  title: string;
  description: string;
  canonicalPath?: string;
}

const ROUTE_SEO: Record<string, SEOConfig> = {
  '/': {
    title: 'PixelProof — Online Image Analysis Lab',
    description: 'Inspect dimensions, extract color palettes, compare before-and-after differences, and optimize digital images directly in your browser.',
  },
  '/tools/image-inspector': {
    title: 'Image Inspector — PixelProof Lab',
    description: 'Inspect image metadata, exact dimensions, byte size, format validation, alpha transparency, and EXIF tags locally.',
  },
  '/tools/image-dimensions': {
    title: 'Image Dimensions Checker & Aspect Ratio Calculator — PixelProof',
    description: 'Calculate image dimensions, proportional scaling, standard display presets, and aspect ratio fractions in real time.',
  },
  '/tools/color-palette': {
    title: 'Color Palette Extractor — PixelProof Lab',
    description: 'Extract dominant color palettes, RGB/HEX/HSL swatches, and area percentages from uploaded photos using client-side quantization.',
  },
  '/tools/image-compare': {
    title: 'Before & After Image Comparison Slider — PixelProof',
    description: 'Compare two images side-by-side or with an interactive split slider. Inspect dimensional and compression differences.',
  },
  '/tools/image-optimizer': {
    title: 'Browser Image Optimizer & Exporter — PixelProof',
    description: 'Optimize, scale, and convert images to WebP, JPEG, PNG, or AVIF locally with quality controls and live byte comparisons.',
  },
  '/guides': {
    title: 'Educational Image Guides — PixelProof Knowledge Base',
    description: 'Deep-dive technical guides on image geometry, color quantization, aspect ratios, format comparisons, and metadata privacy.',
  },
  '/about': {
    title: 'About PixelProof — Architecture & Technical Principles',
    description: 'Learn about PixelProof, our client-side processing architecture, mathematical algorithms, and technical limitations.',
  },
  '/privacy': {
    title: 'Privacy Policy — 100% Client-Side Processing | PixelProof',
    description: 'PixelProof processes all image files entirely within your local browser memory. No images or metadata are transmitted to external servers.',
  },
  '/contact': {
    title: 'Contact & Feedback — PixelProof Lab',
    description: 'Submit technical inquiries, report image decoding anomalies, or contribute feedback to the PixelProof development team.',
  },
};

export function updateDocumentSEO(pathname: string, customConfig?: Partial<SEOConfig>) {
  const baseConfig = ROUTE_SEO[pathname] || {
    title: 'PixelProof — Online Image Analysis Lab',
    description: 'Online image inspection, color palette extraction, and optimization lab.',
  };

  const title = customConfig?.title || baseConfig.title;
  const description = customConfig?.description || baseConfig.description;

  document.title = title;

  // Update meta description
  const metaDesc = document.querySelector('meta[name="description"]');
  if (metaDesc) {
    metaDesc.setAttribute('content', description);
  }

  // Update OpenGraph
  const ogTitle = document.querySelector('meta[property="og:title"]');
  if (ogTitle) ogTitle.setAttribute('content', title);

  const ogDesc = document.querySelector('meta[property="og:description"]');
  if (ogDesc) ogDesc.setAttribute('content', description);

  // Update Canonical
  let canonicalLink = document.querySelector('link[rel="canonical"]');
  if (!canonicalLink) {
    canonicalLink = document.createElement('link');
    canonicalLink.setAttribute('rel', 'canonical');
    document.head.appendChild(canonicalLink);
  }
  canonicalLink.setAttribute('href', `${window.location.origin}${pathname}`);
}

/**
 * Normalizes browser pathname by stripping trailing slashes and hash/query fragments
 * ensuring uniform direct route resolution.
 */
export function normalizePath(path: string): string {
  if (!path) return '/';
  const clean = path.split('?')[0].split('#')[0];
  const normalized = clean.replace(/\/+$/, '');
  return normalized || '/';
}

export function RouterProvider({ children }: { children: React.ReactNode }) {
  const [currentPath, setCurrentPath] = useState<string>(() => {
    return normalizePath(window.location.pathname || '/');
  });
  const [search, setSearch] = useState<string>(() => window.location.search);

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(normalizePath(window.location.pathname || '/'));
      setSearch(window.location.search);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  useEffect(() => {
    updateDocumentSEO(currentPath);
    // Smooth scroll to top on navigation
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [currentPath]);

  const navigate = (to: string) => {
    const [pathname, searchStr] = to.split('?');
    const normalized = normalizePath(pathname || '/');
    const targetSearch = searchStr ? `?${searchStr}` : '';
    if (normalized === currentPath && targetSearch === search) return;

    window.history.pushState({}, '', to);
    setCurrentPath(normalized);
    setSearch(targetSearch);
  };

  const searchParams = useMemo(() => new URLSearchParams(search), [search]);

  return (
    <RouterContext.Provider value={{ currentPath, navigate, searchParams }}>
      {children}
    </RouterContext.Provider>
  );
}
