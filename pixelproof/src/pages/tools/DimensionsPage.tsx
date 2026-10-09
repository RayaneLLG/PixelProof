/**
 * PixelProof — Image Dimensions Checker & Proportional Resize Calculator
 * Inspects pixel dimensions, calculates Euclidean aspect ratios, provides
 * responsive display presets, and calculates proportional target dimensions locally.
 */

import React, { useState, useEffect, useRef } from 'react';
import { PageHeader } from '../../components/common/PageHeader';
import { DropZone } from '../../components/common/DropZone';
import { analyzeImageFile } from '../../utils/imageParser';
import { calculateProportionalDimensions, copyTextToClipboard } from '../../utils/mathAndFormatting';
import { ImageMetadata, PresetDimension } from '../../types';
import {
  Maximize2,
  Lock,
  Unlock,
  AlertTriangle,
  RefreshCw,
  Sliders,
  CheckCircle2,
  ArrowRight,
  Monitor,
  Share2,
  Copy,
  Check,
  Percent,
} from 'lucide-react';

const COMMON_PRESETS: PresetDimension[] = [
  { name: '1080p Full HD Banner', width: 1920, height: 1080, category: 'Web', aspectRatio: '16:9' },
  { name: '2K QHD Desktop', width: 2560, height: 1440, category: 'Web', aspectRatio: '16:9' },
  { name: 'Instagram Square', width: 1080, height: 1080, category: 'Social', aspectRatio: '1:1' },
  { name: 'Instagram Portrait', width: 1080, height: 1350, category: 'Social', aspectRatio: '4:5' },
  { name: 'Story / Reel / TikTok', width: 1080, height: 1920, category: 'Social', aspectRatio: '9:16' },
  { name: 'X / Twitter Banner', width: 1500, height: 500, category: 'Social', aspectRatio: '3:1' },
  { name: 'Tablet / iPad Retina', width: 2048, height: 1536, category: 'Standard Display', aspectRatio: '4:3' },
  { name: '4K UHD Reference', width: 3840, height: 2160, category: 'Standard Display', aspectRatio: '16:9' },
];

export function DimensionsPage() {
  const [metadata, setMetadata] = useState<ImageMetadata | null>(null);
  const [objectUrl, setObjectUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Resize calculator state
  const [targetWidth, setTargetWidth] = useState<number>(1920);
  const [targetHeight, setTargetHeight] = useState<number>(1080);
  const [isRatioLocked, setIsRatioLocked] = useState<boolean>(true);
  const [activePreset, setActivePreset] = useState<string | null>(null);

  const objectUrlRef = useRef<string | null>(null);

  useEffect(() => {
    objectUrlRef.current = objectUrl;
  }, [objectUrl]);

  useEffect(() => {
    return () => {
      if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    };
  }, []);

  const copyToClipboard = async (text: string, key: string) => {
    const success = await copyTextToClipboard(text);
    if (success) {
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2000);
    }
  };

  const scaleByFactor = (factor: number) => {
    if (!metadata) return;
    const newW = Math.max(1, Math.round(metadata.width * factor));
    const newH = Math.max(1, Math.round(metadata.height * factor));
    setTargetWidth(newW);
    setTargetHeight(newH);
    setActivePreset(null);
  };

  const handleFile = async (file: File) => {
    try {
      setIsLoading(true);
      setError(null);
      if (objectUrl) URL.revokeObjectURL(objectUrl);

      const result = await analyzeImageFile(file);
      setMetadata(result.metadata);
      setObjectUrl(result.objectUrl);

      // Initialize calculator with current dimensions
      setTargetWidth(result.metadata.width);
      setTargetHeight(result.metadata.height);
      setActivePreset(null);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to inspect image dimensions.';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  // Synchronize proportional dimension calculations
  const handleWidthChange = (val: number) => {
    if (isNaN(val) || val <= 0) {
      setTargetWidth(1);
      return;
    }
    const w = Math.max(1, Math.min(20000, Math.round(val)));
    setTargetWidth(w);
    setActivePreset(null);
    if (isRatioLocked && metadata && metadata.width > 0) {
      const calc = calculateProportionalDimensions(metadata.width, metadata.height, w, undefined);
      setTargetHeight(calc.height);
    }
  };

  const handleHeightChange = (val: number) => {
    if (isNaN(val) || val <= 0) {
      setTargetHeight(1);
      return;
    }
    const h = Math.max(1, Math.min(20000, Math.round(val)));
    setTargetHeight(h);
    setActivePreset(null);
    if (isRatioLocked && metadata && metadata.height > 0) {
      const calc = calculateProportionalDimensions(metadata.width, metadata.height, undefined, h);
      setTargetWidth(calc.width);
    }
  };

  const applyPreset = (preset: PresetDimension) => {
    setActivePreset(preset.name);
    setTargetWidth(preset.width);
    setTargetHeight(preset.height);
  };

  const currentCalc = metadata
    ? calculateProportionalDimensions(metadata.width, metadata.height, targetWidth, targetHeight)
    : null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <PageHeader
        category="Geometry & Scaling"
        title="Image Dimensions Checker & Resize Calculator"
        description="Inspect intrinsic pixel dimensions, reduce aspect ratios using Euclidean GCD math, test common display targets, and calculate proportional resizing safely."
        badgeText="Client-Side Math"
      />

      {!metadata && (
        <div className="max-w-3xl mx-auto space-y-8">
          <DropZone onFileSelected={handleFile} isLoading={isLoading} />

          {/* Educational Empty State Cheat Sheet */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs">
            <div className="flex items-center gap-2 mb-3 pb-2.5 border-b border-slate-100">
              <Monitor className="w-4 h-4 text-blue-600" />
              <h3 className="text-xs font-bold text-slate-950 uppercase tracking-wider">
                Common Aspect Ratio Reference
              </h3>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl">
                <div className="w-full h-8 bg-blue-100 border border-blue-200 rounded flex items-center justify-center font-mono font-bold text-blue-700 text-[11px] mb-2">
                  16:9
                </div>
                <p className="font-bold text-slate-900">Widescreen Video</p>
                <p className="text-[10px] text-slate-500 mt-0.5">1920×1080 · 4K UHD · YouTube</p>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl">
                <div className="w-full h-8 bg-indigo-100 border border-indigo-200 rounded flex items-center justify-center font-mono font-bold text-indigo-700 text-[11px] mb-2">
                  4:3
                </div>
                <p className="font-bold text-slate-900">Standard Photo / iPad</p>
                <p className="text-[10px] text-slate-500 mt-0.5">Micro 4/3 sensors · Tablets</p>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl">
                <div className="w-8 h-8 mx-auto bg-emerald-100 border border-emerald-200 rounded flex items-center justify-center font-mono font-bold text-emerald-700 text-[11px] mb-2">
                  1:1
                </div>
                <p className="font-bold text-slate-900 text-center">Square Format</p>
                <p className="text-[10px] text-slate-500 mt-0.5 text-center">1080×1080 · Avatars</p>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl">
                <div className="w-6 h-8 mx-auto bg-violet-100 border border-violet-200 rounded flex items-center justify-center font-mono font-bold text-violet-700 text-[11px] mb-2">
                  9:16
                </div>
                <p className="font-bold text-slate-900 text-center">Vertical Mobile</p>
                <p className="text-[10px] text-slate-500 mt-0.5 text-center">Reels · Stories · Shorts</p>
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

      {metadata && objectUrl && currentCalc && (
        <div className="space-y-6">
          {/* Top Bar Summary */}
          <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-white border border-slate-200/90 rounded-2xl shadow-xs">
            <div className="flex items-center gap-3 min-w-0">
              <span className="text-sm font-bold text-slate-950 truncate max-w-xs">{metadata.fileName}</span>
              <span className="text-xs font-mono font-bold bg-blue-50 text-blue-700 border border-blue-200 px-2.5 py-1 rounded-md shrink-0">
                {metadata.width} × {metadata.height} px
              </span>
              <span className="text-xs font-mono text-slate-500 shrink-0">
                Ratio: {metadata.aspectRatio.ratioString} ({metadata.aspectRatio.decimal}:1)
              </span>
            </div>

            <button
              type="button"
              onClick={() => {
                setMetadata(null);
                if (objectUrl) URL.revokeObjectURL(objectUrl);
                setObjectUrl(null);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors shadow-2xs"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>New Specimen</span>
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Stage & Visual Comparison Preview (5 cols) */}
            <div className="lg:col-span-5 bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between text-xs text-slate-500 pb-3 border-b border-slate-100">
                <span className="font-bold text-slate-950">Intrinsic Specimen Frame</span>
                <span className="font-mono text-slate-600 font-semibold">
                  {((metadata.width * metadata.height) / 1000000).toFixed(2)} MP
                </span>
              </div>

              <div className="relative rounded-xl border border-slate-200/90 bg-slate-100/70 p-3 flex items-center justify-center min-h-[260px] max-h-[360px] overflow-hidden shadow-inner">
                <img
                  src={objectUrl}
                  alt={metadata.fileName}
                  className="max-h-[320px] max-w-full object-contain rounded select-none shadow-xs"
                />
              </div>

              {/* Dimension telemetry details */}
              <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-xl text-xs space-y-2">
                <div className="flex justify-between py-1 border-b border-slate-200/60">
                  <span className="text-slate-500 font-medium">Original Width</span>
                  <span className="font-mono font-bold text-slate-950 tabular-nums">{metadata.width} px</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200/60">
                  <span className="text-slate-500 font-medium">Original Height</span>
                  <span className="font-mono font-bold text-slate-950 tabular-nums">{metadata.height} px</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200/60">
                  <span className="text-slate-500 font-medium">Aspect Ratio Fraction</span>
                  <span className="font-mono font-bold text-slate-950">
                    {metadata.aspectRatio.ratioString}
                  </span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500 font-medium">Recognized Standard</span>
                  <span className="font-semibold text-blue-700">
                    {metadata.aspectRatio.nearestStandard || 'Custom Aspect'}
                  </span>
                </div>
              </div>
            </div>

            {/* Right: Proportional Calculator & Target Dimensions (7 cols) */}
            <div className="lg:col-span-7 space-y-6">
              {/* Calculator Panel */}
              <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs">
                <div className="flex items-center justify-between mb-5 pb-3 border-b border-slate-100">
                  <h2 className="text-xs font-bold text-slate-950 uppercase tracking-wider flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-blue-600" />
                    Proportional Resize Engine
                  </h2>
                  <button
                    type="button"
                    onClick={() => setIsRatioLocked(!isRatioLocked)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg transition-all font-semibold ${
                      isRatioLocked
                        ? 'bg-blue-50 text-blue-700 border border-blue-200 shadow-2xs'
                        : 'bg-slate-100 text-slate-700 border border-slate-200 hover:bg-slate-200'
                    }`}
                  >
                    {isRatioLocked ? (
                      <>
                        <Lock className="w-3.5 h-3.5 text-blue-600" />
                        <span>Ratio Locked</span>
                      </>
                    ) : (
                      <>
                        <Unlock className="w-3.5 h-3.5 text-slate-500" />
                        <span>Ratio Unlocked</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Quick Proportional Scale Chips */}
                <div className="mb-5 pb-4 border-b border-slate-100">
                  <div className="flex items-center justify-between text-xs text-slate-600 mb-2">
                    <span className="font-semibold flex items-center gap-1.5">
                      <Percent className="w-3.5 h-3.5 text-blue-600" />
                      Quick Scale Presets:
                    </span>
                    <button
                      type="button"
                      onClick={() => scaleByFactor(1)}
                      className="text-blue-600 hover:text-blue-800 text-[11px] font-semibold"
                    >
                      Reset (100%)
                    </button>
                  </div>
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5 text-xs font-mono">
                    {[
                      { label: '25%', factor: 0.25 },
                      { label: '50%', factor: 0.5 },
                      { label: '75%', factor: 0.75 },
                      { label: '100%', factor: 1.0 },
                      { label: '150%', factor: 1.5 },
                      { label: '200%', factor: 2.0 },
                    ].map((chip) => {
                      const isActive =
                        targetWidth === Math.round(metadata.width * chip.factor);
                      return (
                        <button
                          key={chip.label}
                          type="button"
                          onClick={() => scaleByFactor(chip.factor)}
                          className={`py-1.5 px-2 rounded-lg border font-semibold transition-all text-center ${
                            isActive
                              ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                              : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          {chip.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
                  <div>
                    <label
                      htmlFor="target-width-input"
                      className="block text-xs font-bold text-slate-800 mb-1.5"
                    >
                      Target Width (pixels)
                    </label>
                    <div className="relative">
                      <input
                        id="target-width-input"
                        type="number"
                        min="1"
                        max="20000"
                        value={targetWidth}
                        onChange={(e) => handleWidthChange(Number(e.target.value))}
                        className="w-full px-3.5 py-2.5 text-sm font-mono font-bold text-slate-950 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white shadow-2xs"
                      />
                      <span className="absolute right-3.5 top-3 text-xs text-slate-400 font-mono">
                        px
                      </span>
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="target-height-input"
                      className="block text-xs font-bold text-slate-800 mb-1.5"
                    >
                      Target Height (pixels)
                    </label>
                    <div className="relative">
                      <input
                        id="target-height-input"
                        type="number"
                        min="1"
                        max="20000"
                        value={targetHeight}
                        onChange={(e) => handleHeightChange(Number(e.target.value))}
                        className="w-full px-3.5 py-2.5 text-sm font-mono font-bold text-slate-950 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white shadow-2xs"
                      />
                      <span className="absolute right-3.5 top-3 text-xs text-slate-400 font-mono">
                        px
                      </span>
                    </div>
                  </div>
                </div>

                {/* Calculation Outcome Summary */}
                <div className="p-4 bg-slate-50 border border-slate-200/90 rounded-2xl space-y-3">
                  <div className="grid grid-cols-3 gap-2.5 text-center">
                    <div className="p-3 bg-white border border-slate-200/80 rounded-xl shadow-2xs">
                      <p className="text-[10px] uppercase font-mono tracking-wider text-slate-400 font-semibold">Target Area</p>
                      <p className="text-sm sm:text-base font-bold font-mono text-slate-950 mt-0.5 tabular-nums">
                        {targetWidth} × {targetHeight}
                      </p>
                    </div>
                    <div className="p-3 bg-white border border-slate-200/80 rounded-xl shadow-2xs">
                      <p className="text-[10px] uppercase font-mono tracking-wider text-slate-400 font-semibold">Scale Factor</p>
                      <p className="text-sm sm:text-base font-bold font-mono text-slate-950 mt-0.5 tabular-nums">
                        {(currentCalc.scaleFactor * 100).toFixed(0)}%
                      </p>
                    </div>
                    <div className="p-3 bg-white border border-slate-200/80 rounded-xl shadow-2xs">
                      <p className="text-[10px] uppercase font-mono tracking-wider text-slate-400 font-semibold">Projected MP</p>
                      <p className="text-sm sm:text-base font-bold font-mono text-slate-950 mt-0.5 tabular-nums">
                        {(currentCalc.pixelCount / 1000000).toFixed(2)} MP
                      </p>
                    </div>
                  </div>

                  {/* Warning if upscaling or extreme distortion */}
                  {currentCalc.warning && (
                    <div className="p-3.5 bg-amber-50 border border-amber-200/90 rounded-xl flex items-start gap-2.5 text-amber-900 text-xs">
                      <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      <p className="leading-relaxed font-medium">{currentCalc.warning}</p>
                    </div>
                  )}

                  {!currentCalc.warning && currentCalc.scaleFactor <= 1 && (
                    <div className="p-3 bg-emerald-50 border border-emerald-200/90 rounded-xl flex items-center gap-2.5 text-emerald-900 text-xs">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span className="font-medium">
                        Proportional downscale. Native pixels preserved without synthetic interpolation.
                      </span>
                    </div>
                  )}

                  {/* Copy actions toolbar */}
                  <div className="pt-2 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        copyToClipboard(`${targetWidth}x${targetHeight}`, 'dim-copy')
                      }
                      className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold inline-flex items-center gap-1.5 transition-colors shadow-2xs"
                    >
                      {copiedKey === 'dim-copy' ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="text-emerald-700">Copied {targetWidth}×{targetHeight}</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 text-slate-400" />
                          <span>Copy Dimensions ({targetWidth}×{targetHeight})</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        copyToClipboard(
                          `aspect-ratio: ${metadata.aspectRatio.ratioString.replace(':', ' / ')};\nwidth: ${targetWidth}px;\nheight: ${targetHeight}px;`,
                          'css-copy'
                        )
                      }
                      className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold inline-flex items-center gap-1.5 transition-colors shadow-2xs"
                    >
                      {copiedKey === 'css-copy' ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="text-emerald-700">Copied CSS Rule</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 text-slate-400" />
                          <span>Copy CSS Snippet</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Common Display Presets */}
              <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs">
                <h2 className="text-xs font-bold text-slate-950 uppercase tracking-wider flex items-center gap-2 mb-2 pb-3 border-b border-slate-100">
                  <Monitor className="w-4 h-4 text-slate-700" />
                  Common Display & Media Presets
                </h2>
                <p className="text-xs text-slate-500 mb-3.5">
                  Click any standard preset to populate the calculator targets instantly:
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {COMMON_PRESETS.map((preset) => {
                    const isSelected = activePreset === preset.name;
                    return (
                      <button
                        key={preset.name}
                        type="button"
                        onClick={() => applyPreset(preset)}
                        className={`p-3 rounded-xl border text-left transition-all flex items-center justify-between ${
                          isSelected
                            ? 'border-blue-600 bg-blue-50/60 shadow-xs'
                            : 'border-slate-200/90 bg-white hover:bg-slate-50 hover:border-slate-300 shadow-2xs'
                        }`}
                      >
                        <div>
                          <p className="text-xs font-bold text-slate-950">{preset.name}</p>
                          <p className="text-[11px] font-mono text-slate-500 mt-0.5 tabular-nums">
                            {preset.width} × {preset.height} px ({preset.aspectRatio})
                          </p>
                        </div>
                        <span className="text-[10px] font-mono uppercase bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md font-semibold">
                          {preset.category}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
