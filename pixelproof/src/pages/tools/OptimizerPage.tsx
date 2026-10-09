/**
 * PixelProof — Browser Image Optimizer & Exporter
 * Local hardware-accelerated image conversion, scaling, and compression
 * with live quality scrubbers, byte difference calculations, and zero-telemetry downloads.
 */

import React, { useState, useEffect, useRef } from 'react';
import { PageHeader } from '../../components/common/PageHeader';
import { DropZone } from '../../components/common/DropZone';
import { analyzeImageFile } from '../../utils/imageParser';
import { optimizeImage, isFormatSupported } from '../../utils/imageOptimizer';
import { formatBytes, triggerFileDownload } from '../../utils/mathAndFormatting';
import { ImageMetadata, OptimizationResult } from '../../types';
import {
  Download,
  AlertTriangle,
  RefreshCw,
  Sliders,
  CheckCircle2,
  FileCheck,
  Zap,
} from 'lucide-react';

export function OptimizerPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [metadata, setMetadata] = useState<ImageMetadata | null>(null);
  const [sourceUrl, setSourceUrl] = useState<string | null>(null);
  const [sourceImg, setSourceImg] = useState<HTMLImageElement | null>(null);

  // Optimizer parameters
  const [format, setFormat] = useState<'image/webp' | 'image/jpeg' | 'image/png' | 'image/avif'>('image/webp');
  const [quality, setQuality] = useState<number>(0.8);
  const [maxDimension, setMaxDimension] = useState<number | 'original'>('original');
  const [avifSupported, setAvifSupported] = useState<boolean>(false);
  const [previewMode, setPreviewMode] = useState<'optimized' | 'original'>('optimized');

  // Optimization output
  const [result, setResult] = useState<OptimizationResult | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const sourceUrlRef = useRef<string | null>(null);
  const resultUrlRef = useRef<string | null>(null);

  useEffect(() => {
    sourceUrlRef.current = sourceUrl;
  }, [sourceUrl]);

  useEffect(() => {
    resultUrlRef.current = result?.dataUrl || null;
  }, [result?.dataUrl]);

  // Check AVIF and WebP encoding support on mount
  useEffect(() => {
    isFormatSupported('image/avif').then(setAvifSupported);
    isFormatSupported('image/webp').then((supported) => {
      if (!supported) {
        setFormat('image/jpeg');
      }
    });
  }, []);

  // Cleanup URLs on unmount only
  useEffect(() => {
    return () => {
      if (sourceUrlRef.current) URL.revokeObjectURL(sourceUrlRef.current);
      if (resultUrlRef.current) URL.revokeObjectURL(resultUrlRef.current);
    };
  }, []);

  const handleFile = async (file: File) => {
    try {
      setError(null);
      if (sourceUrl) URL.revokeObjectURL(sourceUrl);
      if (result?.dataUrl) URL.revokeObjectURL(result.dataUrl);
      setResult(null);

      const parsed = await analyzeImageFile(file);
      setSelectedFile(file);
      setMetadata(parsed.metadata);
      setSourceUrl(parsed.objectUrl);

      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        setSourceImg(img);
        triggerOptimization(img, file, parsed.metadata.hasAlphaChannel === true);
      };
      img.onerror = () => {
        setError('Could not decode the uploaded image.');
      };
      img.src = parsed.objectUrl;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to inspect image.';
      setError(msg);
    }
  };

  const triggerOptimization = async (
    img: HTMLImageElement,
    file: File,
    hasAlpha: boolean
  ) => {
    try {
      setIsProcessing(true);
      setError(null);

      const maxDimVal = maxDimension === 'original' ? undefined : maxDimension;

      const optResult = await optimizeImage(
        img,
        { name: file.name, size: file.size },
        {
          format,
          quality,
          maxWidth: maxDimVal,
          maxHeight: maxDimVal,
        },
        hasAlpha
      );

      setResult((prev) => {
        if (prev?.dataUrl && prev.dataUrl !== optResult.dataUrl) {
          URL.revokeObjectURL(prev.dataUrl);
        }
        return optResult;
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Optimization failed.';
      setError(msg);
    } finally {
      setIsProcessing(false);
    }
  };

  // Re-run optimization when controls change
  useEffect(() => {
    if (!sourceImg || !selectedFile || !metadata) return;

    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);

    debounceTimerRef.current = setTimeout(() => {
      triggerOptimization(sourceImg, selectedFile, metadata.hasAlphaChannel === true);
    }, 120);

    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    };
  }, [format, quality, maxDimension]);

  const downloadOptimizedImage = () => {
    if (!result) return;
    triggerFileDownload(result.dataUrl, result.fileName);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <PageHeader
        category="Compression & Export"
        title="Browser Image Optimizer & Exporter"
        description="Encode, scale, and compress images directly in browser RAM with live byte reduction metrics, quality controls, and zero server uploads."
        badgeText="Lossless & Lossy Options"
      />

      {!selectedFile && (
        <div className="max-w-3xl mx-auto space-y-8">
          <DropZone onFileSelected={handleFile} />

          {/* Educational Empty State Format Matrix */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs">
            <div className="flex items-center gap-2 mb-3 pb-2.5 border-b border-slate-100">
              <Zap className="w-4 h-4 text-blue-600" />
              <h3 className="text-xs font-bold text-slate-950 uppercase tracking-wider">
                Web Image Format & Codec Capabilities
              </h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
              <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-blue-700 font-mono">WebP</span>
                  <span className="text-[10px] font-mono bg-blue-100 text-blue-800 px-1.5 py-0.2 rounded font-semibold">Standard</span>
                </div>
                <p className="text-[11px] text-slate-600">Google lossy/lossless standard with alpha support. ~30% smaller than JPEG.</p>
                <div className="text-[10px] text-slate-400 font-mono">Universal browser support</div>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-indigo-700 font-mono">AVIF</span>
                  <span className="text-[10px] font-mono bg-indigo-100 text-indigo-800 px-1.5 py-0.2 rounded font-semibold">Next-Gen</span>
                </div>
                <p className="text-[11px] text-slate-600">AOMedia AV1 intra-frame codec. Extreme compression at low bitrates.</p>
                <div className="text-[10px] text-slate-400 font-mono">Modern browsers (Chromium/Safari/Firefox)</div>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 font-mono">JPEG</span>
                  <span className="text-[10px] font-mono bg-slate-200 text-slate-800 px-1.5 py-0.2 rounded font-semibold">Legacy</span>
                </div>
                <p className="text-[11px] text-slate-600">Discrete cosine transform lossy compression. No transparency support.</p>
                <div className="text-[10px] text-slate-400 font-mono">Universal compatibility</div>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-emerald-700 font-mono">PNG</span>
                  <span className="text-[10px] font-mono bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded font-semibold">Lossless</span>
                </div>
                <p className="text-[11px] text-slate-600">Deflate lossless algorithm with full alpha transparency. Larger file weight.</p>
                <div className="text-[10px] text-slate-400 font-mono">Logos, charts & pixel art</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="max-w-3xl mx-auto mt-4 p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-sm">
          {error}
        </div>
      )}

      {selectedFile && metadata && sourceUrl && (
        <div className="space-y-6">
          {/* Header Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-white border border-slate-200 rounded-xl shadow-xs">
            <div className="flex items-center gap-3">
              <span className="text-sm font-semibold text-slate-900">{selectedFile.name}</span>
              <span className="text-xs font-mono text-slate-500">
                Original: {formatBytes(selectedFile.size)} ({metadata.width}×{metadata.height}px)
              </span>
            </div>

            <button
              type="button"
              onClick={() => {
                setSelectedFile(null);
                setMetadata(null);
                setSourceImg(null);
                if (sourceUrl) URL.revokeObjectURL(sourceUrl);
                if (result?.dataUrl) URL.revokeObjectURL(result.dataUrl);
                setSourceUrl(null);
                setResult(null);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Optimize Another Image
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Parameters Console (5 cols) */}
            <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-blue-600" />
                  Encoding Parameters
                </h2>
                {isProcessing && (
                  <span className="text-[11px] font-mono text-blue-600 flex items-center gap-1">
                    <Zap className="w-3 h-3 animate-pulse" /> Encoding...
                  </span>
                )}
              </div>

              {/* Format Selection */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-2">
                  Output Format
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setFormat('image/webp')}
                    className={`p-2.5 rounded-lg border text-left transition-all ${
                      format === 'image/webp'
                        ? 'border-blue-600 bg-blue-50/50 shadow-xs'
                        : 'border-slate-200 bg-white hover:bg-slate-50'
                    }`}
                  >
                    <p className="text-xs font-bold text-slate-900">WebP</p>
                    <p className="text-[10px] text-slate-500 mt-0.5">Recommended modern standard</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormat('image/jpeg')}
                    className={`p-2.5 rounded-lg border text-left transition-all ${
                      format === 'image/jpeg'
                        ? 'border-blue-600 bg-blue-50/50 shadow-xs'
                        : 'border-slate-200 bg-white hover:bg-slate-50'
                    }`}
                  >
                    <p className="text-xs font-bold text-slate-900">JPEG</p>
                    <p className="text-[10px] text-slate-500 mt-0.5">Universal fallback photo</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormat('image/png')}
                    className={`p-2.5 rounded-lg border text-left transition-all ${
                      format === 'image/png'
                        ? 'border-blue-600 bg-blue-50/50 shadow-xs'
                        : 'border-slate-200 bg-white hover:bg-slate-50'
                    }`}
                  >
                    <p className="text-xs font-bold text-slate-900">PNG</p>
                    <p className="text-[10px] text-slate-500 mt-0.5">Lossless with alpha channel</p>
                  </button>

                  <button
                    type="button"
                    disabled={!avifSupported}
                    onClick={() => setFormat('image/avif')}
                    className={`p-2.5 rounded-lg border text-left transition-all ${
                      !avifSupported ? 'opacity-40 cursor-not-allowed bg-slate-50 border-slate-200' : ''
                    } ${
                      format === 'image/avif'
                        ? 'border-blue-600 bg-blue-50/50 shadow-xs'
                        : 'border-slate-200 bg-white hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-bold text-slate-900">AVIF</p>
                      {!avifSupported && (
                        <span className="text-[9px] text-slate-400 font-mono">Not supported</span>
                      )}
                    </div>
                    <p className="text-[10px] text-slate-500 mt-0.5">Next-gen high density codec</p>
                  </button>
                </div>
              </div>

              {/* Quality Slider (for lossy formats) */}
              {format !== 'image/png' ? (
                <div>
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-700 mb-1.5">
                    <label htmlFor="quality-slider">Compression Quality</label>
                    <span className="font-mono text-blue-600 font-bold">
                      {Math.round(quality * 100)}%
                    </span>
                  </div>
                  <input
                    id="quality-slider"
                    type="range"
                    min="0.1"
                    max="1.0"
                    step="0.05"
                    value={quality}
                    onChange={(e) => setQuality(Number(e.target.value))}
                    className="w-full h-2 bg-slate-200 rounded-lg cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 font-mono mt-1">
                    <span>10% (High compression)</span>
                    <span>80% (Optimal)</span>
                    <span>100% (Maximum)</span>
                  </div>
                </div>
              ) : (
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-600">
                  <p className="font-medium text-slate-800">Lossless Encoding Active</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    PNG compression is mathematically lossless. All pixel data and transparency values are preserved verbatim without perceptual quantization.
                  </p>
                </div>
              )}

              {/* Max Dimension Bound */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-2">
                  Maximum Resolution Bound
                </label>
                <div className="grid grid-cols-4 gap-1.5 text-xs font-mono">
                  <button
                    type="button"
                    onClick={() => setMaxDimension('original')}
                    className={`py-1.5 rounded border transition-colors ${
                      maxDimension === 'original'
                        ? 'bg-blue-600 text-white font-bold border-blue-600 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    Original
                  </button>
                  <button
                    type="button"
                    onClick={() => setMaxDimension(1920)}
                    className={`py-1.5 rounded border transition-colors ${
                      maxDimension === 1920
                        ? 'bg-blue-600 text-white font-bold border-blue-600 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    1920px
                  </button>
                  <button
                    type="button"
                    onClick={() => setMaxDimension(1280)}
                    className={`py-1.5 rounded border transition-colors ${
                      maxDimension === 1280
                        ? 'bg-blue-600 text-white font-bold border-blue-600 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    1280px
                  </button>
                  <button
                    type="button"
                    onClick={() => setMaxDimension(800)}
                    className={`py-1.5 rounded border transition-colors ${
                      maxDimension === 800
                        ? 'bg-blue-600 text-white font-bold border-blue-600 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    800px
                  </button>
                </div>
              </div>

              {/* Transparency Warning if converting transparent to JPEG */}
              {result?.hasAlphaStrippedWarning && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-2.5 text-amber-800 text-xs">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <p className="leading-relaxed">
                    <strong>Transparency Alert:</strong> The JPEG specification does not support alpha transparency. Transparent areas have been rasterized with a solid white background. To preserve transparency, select WebP or PNG.
                  </p>
                </div>
              )}
            </div>

            {/* Right Output & Download Stage (7 cols) */}
            <div className="lg:col-span-7 space-y-6">
              {/* Output Preview */}
              <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100 text-xs">
                  <div className="flex items-center gap-1.5 bg-slate-100 p-0.5 rounded-lg border border-slate-200/60">
                    <button
                      type="button"
                      onClick={() => setPreviewMode('optimized')}
                      className={`px-3 py-1 text-xs rounded-md transition-all font-semibold ${
                        previewMode === 'optimized'
                          ? 'bg-blue-600 text-white shadow-2xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Optimized Export
                    </button>
                    <button
                      type="button"
                      onClick={() => setPreviewMode('original')}
                      className={`px-3 py-1 text-xs rounded-md transition-all font-semibold ${
                        previewMode === 'original'
                          ? 'bg-blue-600 text-white shadow-2xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Original Source
                    </button>
                  </div>

                  {result && (
                    <span className="font-mono text-slate-500 text-[11px] bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
                      {result.width} × {result.height} px · {result.processingTimeMs}ms local encode
                    </span>
                  )}
                </div>

                <div className="relative rounded-xl border border-slate-200 bg-checkerboard min-h-[300px] max-h-[440px] flex items-center justify-center p-3 overflow-hidden shadow-inner">
                  {/* Watermark badge indicating which view is active */}
                  <span className="absolute top-3 left-3 z-10 px-2.5 py-1 rounded-md bg-slate-900/80 text-white font-mono text-[11px] backdrop-blur-xs">
                    {previewMode === 'optimized'
                      ? `Viewing: ${result?.format.toUpperCase() || 'Optimized'}`
                      : `Viewing: Original (${metadata.format})`}
                  </span>

                  {previewMode === 'optimized' ? (
                    result ? (
                      <img
                        src={result.dataUrl}
                        alt="Optimized preview"
                        className="max-h-[400px] max-w-full object-contain rounded select-none shadow-xs"
                      />
                    ) : (
                      <div className="text-center text-xs text-slate-400">
                        Processing preview...
                      </div>
                    )
                  ) : (
                    <img
                      src={sourceUrl}
                      alt="Original preview"
                      className="max-h-[400px] max-w-full object-contain rounded select-none shadow-xs"
                    />
                  )}
                </div>

                {/* Delineated Before vs After Comparison Cards */}
                {result && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    {/* Original Asset Card */}
                    <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl space-y-1.5">
                      <span className="text-[10px] font-mono uppercase text-slate-400 font-semibold">Original Asset</span>
                      <div className="flex items-baseline justify-between">
                        <span className="text-base font-bold font-mono text-slate-900">
                          {formatBytes(result.originalSize)}
                        </span>
                        <span className="font-mono text-xs font-semibold text-slate-500">
                          {metadata.format} · {metadata.width}×{metadata.height}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500">
                        {metadata.hasAlphaChannel ? 'Alpha transparency present' : 'Opaque image layer'}
                      </p>
                    </div>

                    {/* Exported Asset Card */}
                    <div className={`p-3.5 rounded-xl border space-y-1.5 ${
                      result.percentReduction > 0
                        ? 'bg-emerald-50/70 border-emerald-200'
                        : 'bg-slate-50 border-slate-200'
                    }`}>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono uppercase text-emerald-800 font-semibold">Exported Target</span>
                        <span className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded ${
                          result.percentReduction > 0 ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-800'
                        }`}>
                          {result.percentReduction > 0 ? `-${result.percentReduction}% reduction` : `+${Math.abs(result.percentReduction)}%`}
                        </span>
                      </div>
                      <div className="flex items-baseline justify-between">
                        <span className="text-base font-bold font-mono text-slate-900">
                          {formatBytes(result.optimizedSize)}
                        </span>
                        <span className="font-mono text-xs font-semibold text-slate-700">
                          {result.format.toUpperCase()} · {result.width}×{result.height}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600">
                        Saved {formatBytes(Math.max(0, result.originalSize - result.optimizedSize))} of bandwidth
                      </p>
                    </div>
                  </div>
                )}

                {/* Download CTA Button */}
                {result && (
                  <button
                    type="button"
                    onClick={downloadOptimizedImage}
                    className="w-full py-3.5 px-4 bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white font-bold text-xs rounded-xl shadow-xs hover:shadow-sm transition-all flex items-center justify-center gap-2 focus-visible:outline-2 focus-visible:outline-blue-600"
                  >
                    <Download className="w-4 h-4 text-blue-200" />
                    <span>Download {result.fileName} ({formatBytes(result.optimizedSize)})</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
