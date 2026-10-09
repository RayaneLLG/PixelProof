/**
 * PixelProof — Homepage & Tool Directory
 * High-utility technical laboratory homepage with instant client-side inspection,
 * comprehensive tool directory, use-cases, and educational guide links.
 */

import React, { useState, useEffect, useRef } from 'react';
import { Link } from '../router/Link';
import { useRouter } from '../router/Router';
import { DropZone } from '../components/common/DropZone';
import { analyzeImageFile } from '../utils/imageParser';
import { ImageMetadata } from '../types';
import { GUIDES } from '../data/guidesData';
import {
  Search,
  Maximize2,
  Palette,
  ArrowRightLeft,
  Sliders,
  ShieldCheck,
  Cpu,
  BookOpen,
  HelpCircle,
  ArrowRight,
  Code2,
  PenTool,
  GraduationCap,
  Sparkles,
} from 'lucide-react';

export function Home() {
  const { navigate } = useRouter();
  const [analyzedAsset, setAnalyzedAsset] = useState<{
    file: File;
    metadata: ImageMetadata;
    url: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const analyzedUrlRef = useRef<string | null>(null);

  useEffect(() => {
    analyzedUrlRef.current = analyzedAsset?.url || null;
  }, [analyzedAsset?.url]);

  useEffect(() => {
    return () => {
      if (analyzedUrlRef.current) URL.revokeObjectURL(analyzedUrlRef.current);
    };
  }, []);

  const handleHomeUpload = async (file: File) => {
    try {
      setIsLoading(true);
      if (analyzedAsset?.url) URL.revokeObjectURL(analyzedAsset.url);
      const res = await analyzeImageFile(file);
      setAnalyzedAsset({ file, metadata: res.metadata, url: res.objectUrl });
    } catch {
      // If error, navigate directly to inspector
      navigate('/tools/image-inspector');
    } finally {
      setIsLoading(false);
    }
  };

  const tools = [
    {
      title: 'Image Inspector',
      path: '/tools/image-inspector',
      icon: Search,
      badge: 'Core Lab',
      description:
        'Verify exact byte sizes, real MIME headers, alpha channels, and photographic EXIF metadata tags directly in memory.',
      features: ['EXIF Metadata', 'MIME Headers', 'Alpha Channel', 'Binary Chunks'],
    },
    {
      title: 'Dimensions Checker',
      path: '/tools/image-dimensions',
      icon: Maximize2,
      badge: 'Geometry',
      description:
        'Calculate aspect ratios with Euclidean GCD reduction, test against common display presets, and prevent upscaling blur.',
      features: ['Euclidean GCD', 'Responsive Presets', 'Proportional Lock', 'Display Densities'],
    },
    {
      title: 'Color Palette Extractor',
      path: '/tools/color-palette',
      icon: Palette,
      badge: 'Quantization',
      description:
        'Partition 3D RGB color space via Paul Heckbert’s Median Cut algorithm to extract dominant swatches, percentages, and tokens.',
      features: ['Median Cut Algorithm', 'HEX · RGB · HSL', 'Perceptual Names', 'CSS Variables Export'],
    },
    {
      title: 'Before & After Comparison',
      path: '/tools/image-compare',
      icon: ArrowRightLeft,
      badge: 'Visual Diff',
      description:
        'Inspect side-by-side or drag a split curtain slider to measure visual artifacts, dimension deltas, and compression savings.',
      features: ['Interactive Split Curtain', 'Side-by-Side Mode', 'Synchronized Zoom', 'Byte Weight Delta'],
    },
    {
      title: 'Image Optimizer & Exporter',
      path: '/tools/image-optimizer',
      icon: Sliders,
      badge: 'Encoding',
      description:
        'Re-encode to WebP, JPEG, PNG, or AVIF with live quality sliders, bounding constraints, and true percentage byte reductions.',
      features: ['WebP · AVIF · JPEG · PNG', 'Quality Scrubbing', 'Bounding Box Rescale', 'Zero-Server Privacy'],
    },
  ];

  const useCases = [
    {
      title: 'For Web Developers & Engineers',
      icon: Code2,
      description:
        'Audit Largest Contentful Paint (LCP) assets, verify aspect-ratio CSS properties to eradicate layout shift (CLS), and generate optimized WebP variants.',
    },
    {
      title: 'For Product & Visual Designers',
      icon: PenTool,
      description:
        'Extract tonal color palettes for UI design tokens, confirm alpha channel transparency before shipping icons, and ensure Retina display readiness.',
    },
    {
      title: 'For Students & Photographers',
      icon: GraduationCap,
      description:
        'Learn how color quantization, discrete cosine transforms, and lossless deflate algorithms function without paying for proprietary suites.',
    },
  ];

  const faqs = [
    {
      q: 'Are my uploaded images transmitted to a cloud server?',
      a: 'Never. PixelProof operates 100% inside your local browser sandbox via native HTML5 Canvas, DataView, and ArrayBuffer APIs. No network packets containing your images are ever sent.',
    },
    {
      q: 'Why does PixelProof not require software installation or account creation?',
      a: 'Modern web browsers provide high-performance hardware-accelerated graphics engines. We believe basic diagnostic tools should be universally accessible, free, and private.',
    },
    {
      q: 'Why are EXIF tags missing from some images?',
      a: 'Screenshots, web assets, and images shared across social media or messaging platforms are routinely scrubbed of metadata for privacy and bandwidth efficiency.',
    },
    {
      q: 'Does PixelProof support transparent WebP and PNG formats?',
      a: 'Yes. The laboratory inspects alpha channels pixel-by-pixel and alerts you if converting to JPEG will flatten transparent pixels onto solid white backgrounds.',
    },
  ];

  return (
    <div className="space-y-16 py-10">
      {/* 1. Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 border border-slate-200/90 text-slate-700 text-xs font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span>Local Browser Sandbox</span>
            <span aria-hidden="true" className="text-slate-300">·</span>
            <span>Zero Remote Storage</span>
            <span aria-hidden="true" className="text-slate-300">·</span>
            <span>Instant Diagnostics</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-slate-950 text-balance leading-[1.15]">
            Online Image Analysis & <span className="text-blue-600">Optimization Lab</span>
          </h1>

          <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto text-balance">
            Inspect intrinsic dimensions, extract dominant palettes, compare visual compression artifacts, and optimize assets locally in your browser.
          </p>
        </div>

        {/* Working Upload Area */}
        <div className="max-w-2xl mx-auto">
          {analyzedAsset ? (
            <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-sm space-y-5 animate-in fade-in">
              {/* Quick specimen preview card */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 pb-4 border-b border-slate-100">
                <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-checkerboard border border-slate-200 shrink-0 shadow-2xs">
                  <img
                    src={analyzedAsset.url}
                    alt={analyzedAsset.file.name}
                    className="w-full h-full object-cover"
                  />
                  <span className="absolute bottom-1 right-1 px-1 py-0.2 rounded text-[9px] font-mono font-bold bg-slate-950/80 text-white">
                    {analyzedAsset.metadata.format}
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200/80 px-2 py-0.5 rounded-md shrink-0">
                      Specimen Loaded
                    </span>
                    <span className="text-xs text-slate-400 font-mono">
                      {analyzedAsset.metadata.fileSizeBytesText}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-slate-950 truncate mt-1">
                    {analyzedAsset.file.name}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (analyzedAsset?.url) URL.revokeObjectURL(analyzedAsset.url);
                    setAnalyzedAsset(null);
                  }}
                  className="text-xs font-semibold text-slate-500 hover:text-slate-900 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors shrink-0"
                >
                  Change Specimen
                </button>
              </div>

              <div className="grid grid-cols-3 gap-3 text-xs font-mono">
                <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl">
                  <span className="text-slate-500 uppercase text-[10px] tracking-wider font-sans font-semibold">Resolution</span>
                  <p className="text-base font-bold text-slate-900 mt-0.5">
                    {analyzedAsset.metadata.width}×{analyzedAsset.metadata.height}
                  </p>
                  <span className="text-[10px] text-slate-400 font-sans">
                    {(analyzedAsset.metadata.width * analyzedAsset.metadata.height / 1000000).toFixed(2)} MP
                  </span>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl">
                  <span className="text-slate-500 uppercase text-[10px] tracking-wider font-sans font-semibold">Aspect Ratio</span>
                  <p className="text-base font-bold text-slate-900 mt-0.5">
                    {analyzedAsset.metadata.aspectRatio.ratioString}
                  </p>
                  <span className="text-[10px] text-slate-400 font-sans">
                    {analyzedAsset.metadata.aspectRatio.decimal.toFixed(2)}:1 decimal
                  </span>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl">
                  <span className="text-slate-500 uppercase text-[10px] tracking-wider font-sans font-semibold">Alpha Channel</span>
                  <p className="text-base font-bold text-slate-900 mt-0.5">
                    {analyzedAsset.metadata.hasAlphaChannel ? 'Present' : 'Opaque'}
                  </p>
                  <span className="text-[10px] text-slate-400 font-sans">
                    {analyzedAsset.metadata.hasAlphaChannel ? 'Transparent pixels' : 'Solid background'}
                  </span>
                </div>
              </div>

              {/* Action selection */}
              <div>
                <p className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                  Select analysis tool for this specimen:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => navigate('/tools/image-inspector')}
                    className="p-3 text-left border border-slate-200 hover:border-blue-500 bg-white hover:bg-blue-50/30 rounded-xl transition-all flex items-center justify-between group shadow-2xs hover:shadow-xs"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-slate-100 group-hover:bg-blue-600 text-slate-700 group-hover:text-white flex items-center justify-center transition-colors">
                        <Search className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                          Full Image Inspector
                        </p>
                        <p className="text-[11px] text-slate-500">EXIF tags, alpha & MIME headers</p>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all" />
                  </button>

                  <button
                    type="button"
                    onClick={() => navigate('/tools/image-dimensions')}
                    className="p-3 text-left border border-slate-200 hover:border-blue-500 bg-white hover:bg-blue-50/30 rounded-xl transition-all flex items-center justify-between group shadow-2xs hover:shadow-xs"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-slate-100 group-hover:bg-blue-600 text-slate-700 group-hover:text-white flex items-center justify-center transition-colors">
                        <Maximize2 className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                          Dimensions Calculator
                        </p>
                        <p className="text-[11px] text-slate-500">Proportional scale & presets</p>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all" />
                  </button>

                  <button
                    type="button"
                    onClick={() => navigate('/tools/color-palette')}
                    className="p-3 text-left border border-slate-200 hover:border-blue-500 bg-white hover:bg-blue-50/30 rounded-xl transition-all flex items-center justify-between group shadow-2xs hover:shadow-xs"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-slate-100 group-hover:bg-blue-600 text-slate-700 group-hover:text-white flex items-center justify-center transition-colors">
                        <Palette className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                          Color Palette Extractor
                        </p>
                        <p className="text-[11px] text-slate-500">Median-cut swatches & CSS tokens</p>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all" />
                  </button>

                  <button
                    type="button"
                    onClick={() => navigate('/tools/image-optimizer')}
                    className="p-3 text-left border border-slate-200 hover:border-blue-500 bg-white hover:bg-blue-50/30 rounded-xl transition-all flex items-center justify-between group shadow-2xs hover:shadow-xs"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-slate-100 group-hover:bg-blue-600 text-slate-700 group-hover:text-white flex items-center justify-center transition-colors">
                        <Sliders className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                          Optimizer & Exporter
                        </p>
                        <p className="text-[11px] text-slate-500">Encode to WebP, JPEG, PNG, AVIF</p>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all" />
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <DropZone onFileSelected={handleHomeUpload} isLoading={isLoading} />
          )}
        </div>
      </section>

      {/* 2. Tools Directory Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="text-xs font-mono font-semibold text-blue-600 uppercase tracking-wider mb-1">
              Precision Tool Suite
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-950">
              Laboratory Diagnostics & Encoders
            </h2>
            <p className="text-sm text-slate-600 mt-1 max-w-xl">
              Purpose-built utilities designed for immediate, local browser execution.
            </p>
          </div>
          <span className="text-xs font-mono text-slate-500 bg-white border border-slate-200/90 px-3 py-1.5 rounded-lg shadow-2xs shrink-0 self-start sm:self-auto">
            5 Core Utilities Active
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tools.map((tool, idx) => {
            const Icon = tool.icon;
            return (
              <Link
                key={tool.path}
                to={tool.path}
                className="group p-6 bg-white border border-slate-200/90 rounded-2xl hover:border-blue-400 hover:shadow-md transition-all duration-200 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200/80 flex items-center justify-center text-slate-800 group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-600 transition-colors shadow-2xs">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-mono uppercase bg-slate-50 text-slate-600 border border-slate-200/80 px-2 py-0.5 rounded-md font-semibold">
                      {tool.badge}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-950 group-hover:text-blue-600 transition-colors">
                    {tool.title}
                  </h3>
                  <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                    {tool.description}
                  </p>

                  {/* Feature highlights */}
                  <div className="flex flex-wrap gap-1.5 mt-3.5">
                    {tool.features.map((feat) => (
                      <span
                        key={feat}
                        className="text-[10px] font-mono text-slate-600 bg-slate-100 group-hover:bg-blue-50 group-hover:text-blue-700 px-2 py-0.5 rounded border border-slate-200/60 group-hover:border-blue-200/60 transition-colors"
                      >
                        {feat}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mt-5 pt-3.5 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
                  <span>Launch Tool</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* 3. How Browser-Based Processing Works */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 sm:p-10 bg-slate-900 text-white rounded-3xl shadow-md border border-slate-800">
          <div className="max-w-2xl mb-10">
            <span className="text-xs font-mono uppercase tracking-wider text-blue-400 font-semibold">
              Zero-Server Architecture
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white mt-1">
              How Local In-Browser Processing Operates
            </h2>
            <p className="text-sm text-slate-400 mt-2 leading-relaxed">
              PixelProof executes calculations on your device's native CPU and GPU graphics pipelines.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-5 bg-slate-800/60 rounded-2xl border border-slate-700/60 space-y-3">
              <span className="inline-block text-xs font-mono font-bold text-blue-400 bg-blue-950/60 border border-blue-800/80 px-2.5 py-1 rounded-md">
                Step 01
              </span>
              <h3 className="text-sm font-bold text-white">Direct Memory Ingestion</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                When you drag a file into PixelProof, JavaScript reads the raw byte headers directly into an ArrayBuffer. Magic numbers, EXIF markers, and PNG chunks are inspected instantly without network transmission.
              </p>
            </div>

            <div className="p-5 bg-slate-800/60 rounded-2xl border border-slate-700/60 space-y-3">
              <span className="inline-block text-xs font-mono font-bold text-indigo-400 bg-indigo-950/60 border border-indigo-800/80 px-2.5 py-1 rounded-md">
                Step 02
              </span>
              <h3 className="text-sm font-bold text-white">Canvas 2D Quantization</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Bitmap samples are rendered to an off-screen HTML5 Canvas. The Median Cut clustering algorithm divides 3D RGB space to group dominant tones while alpha channel pixels are filtered to preserve true transparency.
              </p>
            </div>

            <div className="p-5 bg-slate-800/60 rounded-2xl border border-slate-700/60 space-y-3">
              <span className="inline-block text-xs font-mono font-bold text-sky-400 bg-sky-950/60 border border-sky-800/80 px-2.5 py-1 rounded-md">
                Step 03
              </span>
              <h3 className="text-sm font-bold text-white">Hardware Codec Compression</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Re-encoding to WebP, JPEG, PNG, or AVIF utilizes your browser’s compiled C++ graphics libraries. Files are generated as local Blobs and downloaded directly to your device with zero cloud intermediary.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Use Cases */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="text-xs font-mono font-semibold text-blue-600 uppercase tracking-wider mb-1">
            Engineered For Precision
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-950">
            Built for Technical Workflows
          </h2>
          <p className="text-sm text-slate-600 mt-1">
            Empowering professionals with transparent data without bloat or software subscriptions.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {useCases.map((uc) => {
            const Icon = uc.icon;
            return (
              <div
                key={uc.title}
                className="p-6 bg-white border border-slate-200/90 rounded-2xl shadow-xs space-y-3.5 hover:border-slate-300 transition-colors"
              >
                <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200/80 flex items-center justify-center text-slate-800 shadow-2xs">
                  <Icon className="w-5 h-5 text-blue-600" />
                </div>
                <h3 className="text-sm font-bold text-slate-950">{uc.title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed">{uc.description}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* 5. Educational Guides Highlight */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <div className="text-xs font-mono font-semibold text-blue-600 uppercase tracking-wider mb-1">
              Knowledge Base
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-950">
              Educational Imaging Guides
            </h2>
            <p className="text-sm text-slate-600 mt-1">
              In-depth articles covering digital image mathematics, format specifications, and compression.
            </p>
          </div>
          <Link
            to="/guides"
            className="text-xs font-semibold text-blue-600 hover:text-blue-700 inline-flex items-center gap-1.5 self-start sm:self-auto"
          >
            <span>Browse All Guides</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {GUIDES.slice(0, 3).map((guide) => (
            <Link
              key={guide.slug}
              to={`/guides/${guide.slug}`}
              className="group p-6 bg-white border border-slate-200/90 rounded-2xl hover:border-blue-400 hover:shadow-md transition-all duration-200 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 mb-3">
                  <span className="text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md font-sans font-semibold">
                    {guide.category}
                  </span>
                  <span>{guide.readTime}</span>
                </div>
                <h3 className="text-base font-bold text-slate-950 group-hover:text-blue-600 transition-colors line-clamp-2">
                  {guide.title}
                </h3>
                <p className="text-xs text-slate-600 mt-2.5 line-clamp-3 leading-relaxed">
                  {guide.summary}
                </p>
              </div>
              <div className="mt-5 pt-3.5 border-t border-slate-100 text-xs font-semibold text-slate-900 group-hover:text-blue-600 flex items-center justify-between transition-colors">
                <span>Read Guide</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 6. FAQ Section */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <div className="text-xs font-mono font-semibold text-blue-600 uppercase tracking-wider mb-1">
            Support & Clarifications
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-950">
            Frequently Asked Questions
          </h2>
          <p className="text-sm text-slate-600 mt-1 max-w-lg mx-auto">
            Transparent answers regarding local processing, privacy, and browser mechanics.
          </p>
        </div>

        <div className="space-y-3.5">
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className="p-5 bg-white border border-slate-200/90 rounded-2xl shadow-2xs space-y-2 hover:border-slate-300 transition-colors"
            >
              <h3 className="text-sm font-bold text-slate-950 flex items-center gap-2.5">
                <HelpCircle className="w-4 h-4 text-blue-600 shrink-0" />
                {faq.q}
              </h3>
              <p className="text-xs text-slate-600 pl-6.5 leading-relaxed">{faq.a}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
