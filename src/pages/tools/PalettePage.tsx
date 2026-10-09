/**
 * PixelProof — Color Palette Extractor
 * Quantizes image pixels using Paul Heckbert's Median Cut algorithm,
 * providing accurate dominant palettes, HEX, RGB, HSL values, and area distribution.
 */

import React, { useState, useEffect, useRef } from 'react';
import { PageHeader } from '../../components/common/PageHeader';
import { DropZone } from '../../components/common/DropZone';
import { extractColorPalette } from '../../utils/colorPalette';
import { copyTextToClipboard, triggerFileDownload } from '../../utils/mathAndFormatting';
import { PaletteColor } from '../../types';
import {
  Palette,
  Copy,
  Check,
  RefreshCw,
  Info,
  SlidersHorizontal,
  Download,
  Layers,
} from 'lucide-react';

export function PalettePage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [objectUrl, setObjectUrl] = useState<string | null>(null);
  const [palette, setPalette] = useState<PaletteColor[]>([]);
  const [paletteSize, setPaletteSize] = useState<number>(8);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [imageElement, setImageElement] = useState<HTMLImageElement | null>(null);

  const objectUrlRef = useRef<string | null>(null);

  useEffect(() => {
    objectUrlRef.current = objectUrl;
  }, [objectUrl]);

  useEffect(() => {
    return () => {
      if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    };
  }, []);

  // When palette size changes or new image is loaded, re-extract
  useEffect(() => {
    if (imageElement) {
      extractColors(imageElement, paletteSize);
    }
  }, [paletteSize, imageElement]);

  const extractColors = async (img: HTMLImageElement, size: number) => {
    try {
      setIsLoading(true);
      setError(null);
      const extracted = await extractColorPalette(img, size);
      setPalette(extracted);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Color quantization failed.';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFile = async (file: File) => {
    try {
      setIsLoading(true);
      setError(null);
      if (objectUrl) URL.revokeObjectURL(objectUrl);

      const url = URL.createObjectURL(file);
      setObjectUrl(url);
      setSelectedFile(file);

      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        setImageElement(img);
        extractColors(img, paletteSize);
      };
      img.onerror = () => {
        setError('Could not decode image pixels.');
        setIsLoading(false);
      };
      img.src = url;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to process file.';
      setError(msg);
      setIsLoading(false);
    }
  };

  const copyValue = async (text: string, label: string) => {
    const success = await copyTextToClipboard(text);
    if (success) {
      setCopiedText(`${label}:${text}`);
      setTimeout(() => setCopiedText(null), 2000);
    }
  };

  const copyAllHex = () => {
    if (palette.length === 0) return;
    const allHex = palette.map((c) => c.hex).join(', ');
    copyValue(allHex, 'all-hex');
  };

  const copyJsonPalette = () => {
    if (palette.length === 0) return;
    const json = JSON.stringify(
      palette.map((c) => ({
        hex: c.hex,
        rgb: c.rgb,
        hsl: c.hsl,
        percentage: c.percentage,
        name: c.nameEstimate,
      })),
      null,
      2
    );
    copyValue(json, 'all-json');
  };

  const exportPaletteAsCss = () => {
    if (palette.length === 0) return;
    const cssVars = palette
      .map((c, idx) => `  --color-${idx + 1}: ${c.hex}; /* ${c.nameEstimate} (~${c.percentage}%) */`)
      .join('\n');
    const cssBlock = `:root {\n${cssVars}\n}`;

    const blob = new Blob([cssBlock], { type: 'text/css' });
    const url = URL.createObjectURL(blob);
    triggerFileDownload(
      url,
      `${selectedFile?.name.replace(/\.[^/.]+$/, '') || 'palette'}_tokens.css`
    );
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <PageHeader
        category="Color & Pigment"
        title="Image Color Palette Extractor"
        description="Extract representative color swatches from any digital image using Paul Heckbert's Median Cut clustering algorithm, with full HEX, RGB, and HSL breakdowns."
        badgeText="Quantized in Browser"
      />

      {!selectedFile && (
        <div className="max-w-3xl mx-auto space-y-8">
          <DropZone onFileSelected={handleFile} isLoading={isLoading} />

          {/* Educational Empty State Swatch Preview */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs">
            <div className="flex items-center gap-2 mb-3 pb-2.5 border-b border-slate-100">
              <Palette className="w-4 h-4 text-blue-600" />
              <h3 className="text-xs font-bold text-slate-950 uppercase tracking-wider">
                How Median Cut Color Quantization Works
              </h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed mb-4">
              When an image is loaded, its pixels are plotted in a 3-dimensional RGB color cube. The algorithm iteratively splits the box along its longest color axis until the desired cluster count is reached, deriving mathematical centroids that represent true perceptual dominance.
            </p>
            <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
              {[
                { hex: '#0f172a', name: 'Slate Deep' },
                { hex: '#1e3a8a', name: 'Cobalt Blue' },
                { hex: '#0284c7', name: 'Sky Cyan' },
                { hex: '#059669', name: 'Emerald' },
                { hex: '#d97706', name: 'Amber Gold' },
                { hex: '#dc2626', name: 'Crimson' },
                { hex: '#7c3aed', name: 'Violet' },
                { hex: '#f8fafc', name: 'Pure Neutral' },
              ].map((sample) => (
                <div key={sample.hex} className="rounded-xl overflow-hidden border border-slate-200 shadow-2xs">
                  <div style={{ backgroundColor: sample.hex }} className="h-10 w-full" />
                  <div className="p-1.5 bg-white text-center">
                    <p className="font-mono text-[10px] font-bold text-slate-900">{sample.hex}</p>
                    <p className="text-[9px] text-slate-400 truncate">{sample.name}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="max-w-3xl mx-auto mt-4 p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-sm">
          {error}
        </div>
      )}

      {selectedFile && objectUrl && (
        <div className="space-y-6">
          {/* Header Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-white border border-slate-200/90 rounded-2xl shadow-xs">
            <div className="flex items-center gap-3 min-w-0">
              <span className="text-sm font-bold text-slate-950 truncate max-w-xs">{selectedFile.name}</span>
              <span className="text-xs text-blue-700 bg-blue-50 border border-blue-200 font-mono font-bold px-2.5 py-1 rounded-md shrink-0">
                {palette.length} Dominant Swatches
              </span>
            </div>

            <div className="flex items-center flex-wrap gap-2">
              {/* Palette Size Selector */}
              <div className="flex items-center gap-2 text-xs text-slate-700 bg-slate-50 border border-slate-200/90 px-3 py-1.5 rounded-xl">
                <SlidersHorizontal className="w-3.5 h-3.5 text-slate-500" />
                <span className="font-bold">Swatches:</span>
                <div className="inline-flex rounded-lg bg-white border border-slate-200 p-0.5 shadow-2xs">
                  {[4, 6, 8, 12, 16].map((count) => (
                    <button
                      key={count}
                      type="button"
                      onClick={() => setPaletteSize(count)}
                      className={`px-2 py-0.5 text-xs font-mono font-semibold rounded-md transition-all ${
                        paletteSize === count
                          ? 'bg-slate-900 text-white shadow-2xs'
                          : 'text-slate-600 hover:text-slate-950'
                      }`}
                    >
                      {count}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="button"
                onClick={copyAllHex}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors shadow-2xs"
              >
                {copiedText?.startsWith('all-hex:') ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-700">Copied All HEX</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-slate-400" />
                    <span>Copy All HEX</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={exportPaletteAsCss}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors shadow-2xs"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export CSS</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setSelectedFile(null);
                  if (objectUrl) URL.revokeObjectURL(objectUrl);
                  setObjectUrl(null);
                  setPalette([]);
                  setImageElement(null);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors shadow-2xs"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>New Specimen</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Preview Stage (4 cols) */}
            <div className="lg:col-span-4 bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs space-y-4">
              <h2 className="text-xs font-bold text-slate-950 uppercase tracking-wider pb-3 border-b border-slate-100">
                Source Visual Asset
              </h2>

              <div className="rounded-xl border border-slate-200/90 bg-slate-100 p-3 flex items-center justify-center min-h-[220px] max-h-[340px] overflow-hidden shadow-inner">
                <img
                  src={objectUrl}
                  alt={selectedFile.name}
                  className="max-h-[300px] max-w-full object-contain rounded shadow-xs select-none"
                />
              </div>

              {/* Informational Note */}
              <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-xl text-xs space-y-2 text-slate-600">
                <div className="flex items-center gap-1.5 text-slate-900 font-bold">
                  <Info className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>Quantization Algorithm</span>
                </div>
                <p className="leading-relaxed">
                  Extracted colors are mathematical centroids of dominant 3D RGB clusters calculated via Paul Heckbert's Median Cut algorithm. Fully transparent pixels are excluded automatically.
                </p>
              </div>
            </div>

            {/* Right Swatch Matrix & Specifications (8 cols) */}
            <div className="lg:col-span-8 space-y-6">
              {/* Full Spectrum Bar Strip */}
              <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs">
                <h2 className="text-xs font-bold text-slate-950 uppercase tracking-wider mb-3">
                  Dominance Distribution Spectrum
                </h2>
                <div className="h-11 rounded-xl overflow-hidden flex shadow-inner border border-slate-200">
                  {palette.map((color, idx) => (
                    <div
                      key={idx}
                      style={{
                        backgroundColor: color.hex,
                        width: `${Math.max(4, color.percentage)}%`,
                      }}
                      className="h-full relative group transition-all cursor-pointer hover:opacity-90"
                      title={`${color.nameEstimate} (${color.hex}) - ~${color.percentage}%`}
                      onClick={() => copyValue(color.hex, `hex-${idx}`)}
                    />
                  ))}
                </div>
              </div>

              {/* Swatch Grid Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5">
                {palette.map((color, idx) => {
                  const isHexCopied = copiedText === `hex-${idx}:${color.hex}`;
                  const rgbText = `rgb(${color.rgb.r}, ${color.rgb.g}, ${color.rgb.b})`;
                  const isRgbCopied = copiedText === `rgb-${idx}:${rgbText}`;

                  return (
                    <div
                      key={idx}
                      className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-2xs hover:shadow-xs hover:border-slate-300 transition-all flex flex-col"
                    >
                      {/* Swatch color block */}
                      <div
                        style={{ backgroundColor: color.hex }}
                        className="h-28 sm:h-32 w-full relative p-2.5 flex items-start justify-between shadow-inner"
                      >
                        <span
                          className={`text-[10px] font-mono px-2 py-0.5 rounded-md font-bold backdrop-blur-md shadow-2xs border ${
                            color.isLight
                              ? 'bg-slate-950/20 text-slate-950 border-black/10'
                              : 'bg-white/30 text-white border-white/20'
                          }`}
                        >
                          ~{color.percentage}%
                        </span>
                      </div>

                      {/* Info & Copy Buttons */}
                      <div className="p-3.5 space-y-2.5 flex-1 flex flex-col justify-between text-xs">
                        <div className="flex items-center justify-between">
                          <p className="font-bold text-slate-950 text-xs truncate">
                            {color.nameEstimate}
                          </p>
                          <span className="w-2.5 h-2.5 rounded-full border border-slate-300 shrink-0" style={{ backgroundColor: color.hex }} />
                        </div>

                        <div className="space-y-2 pt-2 border-t border-slate-100">
                          {/* HEX Row */}
                          <div className="flex items-center justify-between">
                            <span className="font-mono text-slate-400 font-semibold text-[10px]">HEX</span>
                            <button
                              type="button"
                              onClick={() => copyValue(color.hex, `hex-${idx}`)}
                              className="font-mono font-bold text-slate-950 hover:text-blue-700 bg-slate-100 hover:bg-blue-50 border border-slate-200/90 hover:border-blue-300 px-2 py-0.5 rounded-md inline-flex items-center gap-1.5 text-xs transition-colors shadow-2xs"
                              title="Click to copy HEX code"
                            >
                              <span>{color.hex}</span>
                              {isHexCopied ? (
                                <Check className="w-3 h-3 text-emerald-600" />
                              ) : (
                                <Copy className="w-3 h-3 text-slate-400" />
                              )}
                            </button>
                          </div>

                          {/* RGB Row */}
                          <div className="flex items-center justify-between">
                            <span className="font-mono text-slate-400 font-semibold text-[10px]">RGB</span>
                            <button
                              type="button"
                              onClick={() => copyValue(rgbText, `rgb-${idx}`)}
                              className="font-mono text-slate-700 hover:text-blue-700 bg-slate-50 hover:bg-slate-100 px-1.5 py-0.5 rounded inline-flex items-center gap-1 text-[11px] transition-colors tabular-nums"
                              title="Click to copy RGB values"
                            >
                              <span>{color.rgb.r},{color.rgb.g},{color.rgb.b}</span>
                              {isRgbCopied ? (
                                <Check className="w-3 h-3 text-emerald-600" />
                              ) : (
                                <Copy className="w-3 h-3 text-slate-400" />
                              )}
                            </button>
                          </div>

                          {/* HSL Row */}
                          <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 tabular-nums">
                            <span className="text-slate-400 font-semibold text-[10px]">HSL</span>
                            <span>{color.hsl.h}°, {color.hsl.s}%, {color.hsl.l}%</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
