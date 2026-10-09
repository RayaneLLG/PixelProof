/**
 * PixelProof — Before & After Image Comparison Lab
 * Side-by-side and interactive split-curtain comparison slider with pixel dimensions,
 * file weight diffing, and zoom inspection.
 */

import React, { useState, useEffect, useRef } from 'react';
import { PageHeader } from '../../components/common/PageHeader';
import { analyzeImageFile } from '../../utils/imageParser';
import { ImageMetadata } from '../../types';
import { formatBytes, calculatePercentageDiff } from '../../utils/mathAndFormatting';
import { SAMPLE_IMAGES, fetchSampleAsFile } from '../../utils/sampleImages';
import {
  SplitSquareVertical,
  Columns,
  ZoomIn,
  ZoomOut,
  RefreshCw,
  Upload,
  ArrowRightLeft,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

export function ComparePage() {
  const [imageA, setImageA] = useState<{
    file: File;
    metadata: ImageMetadata;
    url: string;
  } | null>(null);

  const [imageB, setImageB] = useState<{
    file: File;
    metadata: ImageMetadata;
    url: string;
  } | null>(null);

  const [viewMode, setViewMode] = useState<'slider' | 'side-by-side'>('slider');
  const [sliderPos, setSliderPos] = useState<number>(50); // percentage 0 to 100
  const [zoomLevel, setZoomLevel] = useState<number>(1); // 1x to 3x
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputARef = useRef<HTMLInputElement>(null);
  const inputBRef = useRef<HTMLInputElement>(null);
  const trackedUrlsRef = useRef<Set<string>>(new Set());

  // Clean up object URLs on component unmount only
  useEffect(() => {
    return () => {
      trackedUrlsRef.current.forEach((url) => {
        URL.revokeObjectURL(url);
      });
      trackedUrlsRef.current.clear();
    };
  }, []);

  const loadFileIntoSlot = async (file: File, slot: 'A' | 'B') => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await analyzeImageFile(file);
      trackedUrlsRef.current.add(res.objectUrl);

      if (slot === 'A') {
        if (imageA?.url) {
          URL.revokeObjectURL(imageA.url);
          trackedUrlsRef.current.delete(imageA.url);
        }
        setImageA({ file, metadata: res.metadata, url: res.objectUrl });
      } else {
        if (imageB?.url) {
          URL.revokeObjectURL(imageB.url);
          trackedUrlsRef.current.delete(imageB.url);
        }
        setImageB({ file, metadata: res.metadata, url: res.objectUrl });
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to inspect image.';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      // Ignore if pointer capture fails in non-standard context
    }
    setIsDragging(true);
    updateSliderFromClientX(e.clientX);
  };

  const updateSliderFromClientX = (clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    if (rect.width <= 0) return;
    const x = clientX - rect.left;
    const pct = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPos(Number(pct.toFixed(1)));
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    updateSliderFromClientX(e.clientX);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    setIsDragging(false);
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      // Ignore
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const step = e.shiftKey ? 10 : 2;
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      setSliderPos((pos) => Math.max(0, Math.round(pos - step)));
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      setSliderPos((pos) => Math.min(100, Math.round(pos + step)));
    } else if (e.key === 'Home') {
      e.preventDefault();
      setSliderPos(0);
    } else if (e.key === 'End') {
      e.preventDefault();
      setSliderPos(100);
    }
  };

  const swapImages = () => {
    const temp = imageA;
    setImageA(imageB);
    setImageB(temp);
  };

  const loadSampleComparison = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const file1 = await fetchSampleAsFile(SAMPLE_IMAGES[0]);
      const file2 = await fetchSampleAsFile(SAMPLE_IMAGES[1]);
      const res1 = await analyzeImageFile(file1);
      const res2 = await analyzeImageFile(file2);

      trackedUrlsRef.current.add(res1.objectUrl);
      trackedUrlsRef.current.add(res2.objectUrl);

      setImageA({ file: file1, metadata: res1.metadata, url: res1.objectUrl });
      setImageB({ file: file2, metadata: res2.metadata, url: res2.objectUrl });
    } catch {
      setError('Could not load sample images.');
    } finally {
      setIsLoading(false);
    }
  };

  // Dimensions & payload difference metrics
  const diffMetrics = imageA && imageB ? {
    sizeDiff: calculatePercentageDiff(imageA.metadata.fileSize, imageB.metadata.fileSize),
    isDimIdentical:
      imageA.metadata.width === imageB.metadata.width &&
      imageA.metadata.height === imageB.metadata.height,
    widthDelta: imageB.metadata.width - imageA.metadata.width,
    heightDelta: imageB.metadata.height - imageA.metadata.height,
  } : null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <PageHeader
        category="Visual Comparison"
        title="Before & After Image Comparison Lab"
        description="Compare two images with an interactive split-curtain slider or side-by-side viewer. Measure dimensional changes, byte variations, and compression differences."
        badgeText="Interactive Inspection"
      />

      {error && (
        <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-sm flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Hidden file inputs */}
      <input
        ref={inputARef}
        type="file"
        accept="image/*"
        onChange={(e) => e.target.files?.[0] && loadFileIntoSlot(e.target.files[0], 'A')}
        className="sr-only"
        id="image-a-input"
        aria-label="Upload Image A (Primary / Original)"
      />
      <input
        ref={inputBRef}
        type="file"
        accept="image/*"
        onChange={(e) => e.target.files?.[0] && loadFileIntoSlot(e.target.files[0], 'B')}
        className="sr-only"
        id="image-b-input"
        aria-label="Upload Image B (Secondary / Modified)"
      />

      {/* Slot Uploaders */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {/* Slot A */}
        <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
              Image A (Original / Baseline)
            </span>
            {imageA && (
              <button
                type="button"
                onClick={() => inputARef.current?.click()}
                className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1"
              >
                <Upload className="w-3 h-3" /> Replace
              </button>
            )}
          </div>

          {imageA ? (
            <div className="flex items-center gap-3">
              <img
                src={imageA.url}
                alt="Image A"
                className="w-12 h-12 object-cover rounded-md border border-slate-200"
              />
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-slate-900 truncate">{imageA.metadata.fileName}</p>
                <p className="text-[11px] font-mono text-slate-500">
                  {imageA.metadata.width}×{imageA.metadata.height} px · {imageA.metadata.fileSizeBytesText} · {imageA.metadata.format}
                </p>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => inputARef.current?.click()}
              className="w-full py-6 border-2 border-dashed border-slate-300 hover:border-slate-400 rounded-lg text-center text-xs text-slate-600 flex flex-col items-center justify-center gap-1.5 transition-colors"
            >
              <Upload className="w-5 h-5 text-slate-400" />
              <span>Select or drop Image A (Original)</span>
            </button>
          )}
        </div>

        {/* Slot B */}
        <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
              Image B (Modified / Comparison)
            </span>
            {imageB && (
              <button
                type="button"
                onClick={() => inputBRef.current?.click()}
                className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1"
              >
                <Upload className="w-3 h-3" /> Replace
              </button>
            )}
          </div>

          {imageB ? (
            <div className="flex items-center gap-3">
              <img
                src={imageB.url}
                alt="Image B"
                className="w-12 h-12 object-cover rounded-md border border-slate-200"
              />
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-slate-900 truncate">{imageB.metadata.fileName}</p>
                <p className="text-[11px] font-mono text-slate-500">
                  {imageB.metadata.width}×{imageB.metadata.height} px · {imageB.metadata.fileSizeBytesText} · {imageB.metadata.format}
                </p>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => inputBRef.current?.click()}
              className="w-full py-6 border-2 border-dashed border-slate-300 hover:border-slate-400 rounded-lg text-center text-xs text-slate-600 flex flex-col items-center justify-center gap-1.5 transition-colors"
            >
              <Upload className="w-5 h-5 text-slate-400" />
              <span>Select or drop Image B (Modified)</span>
            </button>
          )}
        </div>
      </div>

      {/* Quick Sample Comparison trigger if neither loaded */}
      {(!imageA || !imageB) && (
        <div className="text-center py-4">
          <button
            type="button"
            disabled={isLoading}
            onClick={loadSampleComparison}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Load Sample Comparison Pair (Lens vs Facade)
          </button>
        </div>
      )}

      {/* When both images are loaded */}
      {imageA && imageB && diffMetrics && (
        <div className="space-y-6">
          {/* Controls Ribbon */}
          <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-white border border-slate-200 rounded-xl shadow-xs">
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-slate-500">View Mode:</span>
              <button
                type="button"
                onClick={() => setViewMode('slider')}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                  viewMode === 'slider'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <SplitSquareVertical className="w-3.5 h-3.5" />
                Split Slider
              </button>
              <button
                type="button"
                onClick={() => setViewMode('side-by-side')}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                  viewMode === 'side-by-side'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <Columns className="w-3.5 h-3.5" />
                Side-by-Side
              </button>

              <button
                type="button"
                onClick={swapImages}
                title="Swap Image A and Image B"
                className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-100 rounded-lg"
              >
                <ArrowRightLeft className="w-3.5 h-3.5" /> Swap
              </button>
            </div>

            {/* Zoom Controls */}
            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-500">Zoom:</span>
              <button
                type="button"
                disabled={zoomLevel <= 1}
                onClick={() => setZoomLevel((z) => Math.max(1, z - 0.5))}
                className="p-1 rounded bg-slate-100 hover:bg-slate-200 disabled:opacity-40"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <span className="font-mono text-slate-700 font-medium">{zoomLevel}×</span>
              <button
                type="button"
                disabled={zoomLevel >= 3}
                onClick={() => setZoomLevel((z) => Math.min(3, z + 0.5))}
                className="p-1 rounded bg-slate-100 hover:bg-slate-200 disabled:opacity-40"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
              {zoomLevel > 1 && (
                <button
                  type="button"
                  onClick={() => setZoomLevel(1)}
                  className="text-[11px] text-blue-600 underline ml-1"
                >
                  Reset
                </button>
              )}
            </div>
          </div>

          {/* Telemetry Diff Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 bg-white border border-slate-200 rounded-xl shadow-xs">
              <p className="text-[11px] font-mono text-slate-400 uppercase">Image A Weight</p>
              <p className="text-base font-bold font-mono text-slate-900 mt-0.5">
                {imageA.metadata.fileSizeBytesText}
              </p>
              <p className="text-[11px] text-slate-500 font-mono">{imageA.metadata.format}</p>
            </div>

            <div className="p-3 bg-white border border-slate-200 rounded-xl shadow-xs">
              <p className="text-[11px] font-mono text-slate-400 uppercase">Image B Weight</p>
              <p className="text-base font-bold font-mono text-slate-900 mt-0.5">
                {imageB.metadata.fileSizeBytesText}
              </p>
              <p className="text-[11px] text-slate-500 font-mono">{imageB.metadata.format}</p>
            </div>

            <div className="p-3 bg-white border border-slate-200 rounded-xl shadow-xs">
              <p className="text-[11px] font-mono text-slate-400 uppercase">Weight Delta</p>
              <p
                className={`text-base font-bold font-mono mt-0.5 ${
                  diffMetrics.sizeDiff.isReduction
                    ? 'text-emerald-600'
                    : diffMetrics.sizeDiff.isSame
                    ? 'text-slate-700'
                    : 'text-amber-600'
                }`}
              >
                {diffMetrics.sizeDiff.text}
              </p>
              <p className="text-[11px] text-slate-500 font-mono">
                {diffMetrics.sizeDiff.isReduction ? 'Smaller in B' : 'Relative to A'}
              </p>
            </div>

            <div className="p-3 bg-white border border-slate-200 rounded-xl shadow-xs">
              <p className="text-[11px] font-mono text-slate-400 uppercase">Resolution Match</p>
              <p className="text-base font-bold font-mono text-slate-900 mt-0.5">
                {diffMetrics.isDimIdentical ? (
                  <span className="text-emerald-700">Identical</span>
                ) : (
                  <span className="text-slate-800">
                    Δ {diffMetrics.widthDelta >= 0 ? `+${diffMetrics.widthDelta}` : diffMetrics.widthDelta} × {diffMetrics.heightDelta >= 0 ? `+${diffMetrics.heightDelta}` : diffMetrics.heightDelta} px
                  </span>
                )}
              </p>
              <p className="text-[11px] text-slate-500">
                {diffMetrics.isDimIdentical ? '1:1 Pixel Match' : 'Different Dimensions'}
              </p>
            </div>
          </div>

          {/* Interactive Comparison Viewport */}
          {viewMode === 'slider' ? (
            <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs space-y-4">
              <div
                ref={containerRef}
                role="slider"
                tabIndex={0}
                aria-label="Comparison split slider"
                aria-valuenow={sliderPos}
                aria-valuemin={0}
                aria-valuemax={100}
                onKeyDown={handleKeyDown}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerCancel={handlePointerUp}
                className="relative select-none cursor-ew-resize overflow-hidden rounded-xl border border-slate-300 bg-slate-950 min-h-[460px] sm:min-h-[560px] max-h-[700px] flex items-center justify-center touch-none shadow-inner focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              >
                {/* Laboratory corner reticles */}
                <span className="pointer-events-none absolute top-3 left-3 w-3 h-3 border-t-2 border-l-2 border-slate-500/80 z-20" />
                <span className="pointer-events-none absolute top-3 right-3 w-3 h-3 border-t-2 border-r-2 border-slate-500/80 z-20" />
                <span className="pointer-events-none absolute bottom-3 left-3 w-3 h-3 border-b-2 border-l-2 border-slate-500/80 z-20" />
                <span className="pointer-events-none absolute bottom-3 right-3 w-3 h-3 border-b-2 border-r-2 border-slate-500/80 z-20" />

                {/* Background: Image B */}
                <div
                  style={{ transform: `scale(${zoomLevel})` }}
                  className="w-full h-full flex items-center justify-center transition-transform duration-75 p-4"
                >
                  <img
                    src={imageB.url}
                    alt="Image B"
                    className="max-h-[520px] sm:max-h-[620px] max-w-full object-contain pointer-events-none shadow-sm"
                    referrerPolicy="no-referrer"
                  />
                </div>

                {/* Foreground Clip: Image A */}
                <div
                  style={{
                    clipPath: `inset(0 ${100 - sliderPos}% 0 0)`,
                  }}
                  className="absolute inset-0 flex items-center justify-center pointer-events-none p-4"
                >
                  <div
                    style={{ transform: `scale(${zoomLevel})` }}
                    className="w-full h-full flex items-center justify-center transition-transform duration-75"
                  >
                    <img
                      src={imageA.url}
                      alt="Image A"
                      className="max-h-[520px] sm:max-h-[620px] max-w-full object-contain pointer-events-none shadow-sm"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                </div>

                {/* Divider Line & Handle */}
                <div
                  style={{ left: `${sliderPos}%` }}
                  className="absolute top-0 bottom-0 w-0.5 bg-white shadow-[0_0_12px_rgba(0,0,0,0.8)] z-30 pointer-events-none"
                >
                  <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 px-2.5 py-1 rounded-full bg-slate-900 border border-slate-200 text-white shadow-lg flex items-center justify-center text-[10px] font-mono font-bold whitespace-nowrap">
                    <span>{sliderPos.toFixed(0)}%</span>
                  </div>
                </div>

                {/* Corner Indicator Badges */}
                <span className="absolute top-4 left-4 z-10 px-2.5 py-1 rounded-md bg-slate-900/80 border border-slate-700 text-white font-mono text-xs backdrop-blur-md pointer-events-none shadow-sm">
                  Image A: {imageA.metadata.fileName} ({sliderPos.toFixed(0)}%)
                </span>
                <span className="absolute top-4 right-4 z-10 px-2.5 py-1 rounded-md bg-slate-900/80 border border-slate-700 text-white font-mono text-xs backdrop-blur-md pointer-events-none shadow-sm">
                  Image B: {imageB.metadata.fileName} ({(100 - sliderPos).toFixed(0)}%)
                </span>
              </div>

              {/* Range Slider Track for Keyboard/Touch Accessibility */}
              <div className="flex items-center gap-3 pt-2">
                <span className="text-xs font-mono font-bold text-slate-700">Image A (100%)</span>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={sliderPos}
                  onChange={(e) => setSliderPos(Number(e.target.value))}
                  className="w-full h-2 bg-slate-200 rounded-lg cursor-pointer"
                  aria-label="Image comparison wipe split position"
                />
                <span className="text-xs font-mono font-bold text-slate-700">Image B (100%)</span>
              </div>
            </div>
          ) : (
            /* Side-by-side View */
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs space-y-3">
                <div className="flex items-center justify-between text-xs pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded">
                      Image A
                    </span>
                    <span className="font-semibold text-slate-900 truncate max-w-xs">{imageA.metadata.fileName}</span>
                  </div>
                  <span className="font-mono text-slate-500 font-semibold">{imageA.metadata.width}×{imageA.metadata.height} px</span>
                </div>
                <div className="rounded-xl bg-slate-950 min-h-[420px] sm:min-h-[500px] flex items-center justify-center p-4 overflow-hidden shadow-inner">
                  <img
                    src={imageA.url}
                    alt="Image A"
                    style={{ transform: `scale(${zoomLevel})` }}
                    className="max-h-[460px] max-w-full object-contain transition-transform select-none"
                  />
                </div>
              </div>

              <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs space-y-3">
                <div className="flex items-center justify-between text-xs pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded">
                      Image B
                    </span>
                    <span className="font-semibold text-slate-900 truncate max-w-xs">{imageB.metadata.fileName}</span>
                  </div>
                  <span className="font-mono text-slate-500 font-semibold">{imageB.metadata.width}×{imageB.metadata.height} px</span>
                </div>
                <div className="rounded-xl bg-slate-950 min-h-[420px] sm:min-h-[500px] flex items-center justify-center p-4 overflow-hidden shadow-inner">
                  <img
                    src={imageB.url}
                    alt="Image B"
                    style={{ transform: `scale(${zoomLevel})` }}
                    className="max-h-[460px] max-w-full object-contain transition-transform select-none"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
