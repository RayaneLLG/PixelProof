/**
 * PixelProof — Image Inspector Tool
 * Examines file structure, exact byte dimensions, MIME formats, alpha channel,
 * EXIF tags, and PNG chunks with deep client-side diagnostics.
 */

import React, { useState, useEffect, useRef } from 'react';
import { PageHeader } from '../../components/common/PageHeader';
import { DropZone } from '../../components/common/DropZone';
import { analyzeImageFile } from '../../utils/imageParser';
import { ImageMetadata } from '../../types';
import { useRouter } from '../../router/Router';
import { copyTextToClipboard } from '../../utils/mathAndFormatting';
import {
  FileText,
  Maximize2,
  Sliders,
  Layers,
  Camera,
  Info,
  Copy,
  Check,
  RefreshCw,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';

export function InspectorPage() {
  const { navigate } = useRouter();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [metadata, setMetadata] = useState<ImageMetadata | null>(null);
  const [objectUrl, setObjectUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [bgMode, setBgMode] = useState<'checkerboard' | 'white' | 'dark'>('checkerboard');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const objectUrlRef = useRef<string | null>(null);

  useEffect(() => {
    objectUrlRef.current = objectUrl;
  }, [objectUrl]);

  // Clean up object URLs on unmount only
  useEffect(() => {
    return () => {
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
      }
    };
  }, []);

  const handleFile = async (file: File) => {
    try {
      setIsLoading(true);
      setError(null);
      if (objectUrl) URL.revokeObjectURL(objectUrl);

      const result = await analyzeImageFile(file);
      setSelectedFile(file);
      setMetadata(result.metadata);
      setObjectUrl(result.objectUrl);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'An error occurred while inspecting the image.';
      setError(msg);
      setSelectedFile(null);
      setMetadata(null);
      setObjectUrl(null);
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = async (text: string, key: string) => {
    const success = await copyTextToClipboard(text);
    if (success) {
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2000);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <PageHeader
        category="Image Analysis"
        title="Image Inspector & Metadata Lab"
        description="Inspect physical dimensions, byte weight, real MIME container headers, alpha transparency, and embedded EXIF photographic tags without transmitting files to any server."
        badgeText="100% Client-Side"
      />

      {/* Upload Zone */}
      {!metadata && (
        <div className="max-w-3xl mx-auto">
          <DropZone onFileSelected={handleFile} isLoading={isLoading} />
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="max-w-3xl mx-auto mt-4 p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-sm flex items-start gap-3">
          <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">Inspection Failed</p>
            <p className="mt-0.5 text-xs text-rose-700">{error}</p>
          </div>
        </div>
      )}

      {/* Results View */}
      {metadata && objectUrl && (
        <div className="space-y-6">
          {/* Top action toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-white border border-slate-200/90 rounded-2xl shadow-xs">
            <div className="flex items-center gap-3 min-w-0">
              <span className="text-xs font-mono font-bold text-blue-700 bg-blue-50 border border-blue-200/80 px-2.5 py-1 rounded-md shrink-0">
                {metadata.format}
              </span>
              <span className="text-sm font-bold text-slate-950 truncate max-w-xs sm:max-w-md">
                {metadata.fileName}
              </span>
              <span className="text-xs text-slate-500 font-mono shrink-0">
                {metadata.fileSizeBytesText}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() =>
                  copyToClipboard(
                    `File: ${metadata.fileName}\nFormat: ${metadata.format} (${metadata.mimeType})\nResolution: ${metadata.width}x${metadata.height}\nRatio: ${metadata.aspectRatio.ratioString}\nWeight: ${metadata.fileSizeBytesText}\nAlpha: ${metadata.hasAlphaChannel ? 'Yes' : 'No'}`,
                    'all-specs'
                  )
                }
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors shadow-2xs"
              >
                {copiedKey === 'all-specs' ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-700">Copied Full Specs</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-slate-400" />
                    <span>Copy All Specs</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  setMetadata(null);
                  setSelectedFile(null);
                  if (objectUrl) URL.revokeObjectURL(objectUrl);
                  setObjectUrl(null);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors shadow-2xs"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Inspect New Specimen</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left: Viewport Stage (5 Cols) */}
            <div className="lg:col-span-5 bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between text-xs text-slate-500 pb-3 border-b border-slate-100">
                <span className="font-bold text-slate-900">Laboratory Stage</span>
                {/* Background Stage Mode */}
                <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg border border-slate-200/60">
                  <button
                    type="button"
                    onClick={() => setBgMode('checkerboard')}
                    className={`px-2.5 py-1 text-[11px] rounded-md transition-colors ${
                      bgMode === 'checkerboard' ? 'bg-white text-slate-950 font-bold shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Alpha Grid
                  </button>
                  <button
                    type="button"
                    onClick={() => setBgMode('white')}
                    className={`px-2.5 py-1 text-[11px] rounded-md transition-colors ${
                      bgMode === 'white' ? 'bg-white text-slate-950 font-bold shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    White
                  </button>
                  <button
                    type="button"
                    onClick={() => setBgMode('dark')}
                    className={`px-2.5 py-1 text-[11px] rounded-md transition-colors ${
                      bgMode === 'dark' ? 'bg-white text-slate-950 font-bold shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Dark
                  </button>
                </div>
              </div>

              {/* Image Stage Container with corner reticle accents */}
              <div
                className={`relative rounded-xl border border-slate-200/90 overflow-hidden flex items-center justify-center min-h-[300px] max-h-[460px] p-4 shadow-inner ${
                  bgMode === 'checkerboard'
                    ? 'bg-checkerboard'
                    : bgMode === 'dark'
                    ? 'bg-slate-950'
                    : 'bg-white'
                }`}
              >
                {/* Stage Reticle Corners */}
                <span className="pointer-events-none absolute top-2.5 left-2.5 w-2 h-2 border-t-2 border-l-2 border-slate-400/70" />
                <span className="pointer-events-none absolute top-2.5 right-2.5 w-2 h-2 border-t-2 border-r-2 border-slate-400/70" />
                <span className="pointer-events-none absolute bottom-2.5 left-2.5 w-2 h-2 border-b-2 border-l-2 border-slate-400/70" />
                <span className="pointer-events-none absolute bottom-2.5 right-2.5 w-2 h-2 border-b-2 border-r-2 border-slate-400/70" />

                <img
                  src={objectUrl}
                  alt={`Inspected image: ${metadata.fileName}`}
                  className="max-h-[420px] max-w-full object-contain rounded select-none shadow-xs"
                  referrerPolicy="no-referrer"
                />

                <div className="absolute bottom-3 left-3 px-2 py-0.5 rounded bg-slate-950/80 backdrop-blur-xs text-[10px] font-mono text-white">
                  {metadata.width} × {metadata.height} px
                </div>
              </div>

              {/* Pass to other tools */}
              <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-xl text-xs space-y-2.5">
                <p className="font-bold text-slate-800 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                  Analyze with other laboratory tools:
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => navigate('/tools/image-dimensions')}
                    className="p-2.5 text-left bg-white hover:bg-slate-50 border border-slate-200 hover:border-blue-400 rounded-lg transition-colors flex items-center justify-between text-slate-900 shadow-2xs group"
                  >
                    <div>
                      <span className="font-bold block group-hover:text-blue-600 transition-colors">Dimensions</span>
                      <span className="text-[10px] text-slate-400">Scale & Presets</span>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all" />
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate('/tools/color-palette')}
                    className="p-2.5 text-left bg-white hover:bg-slate-50 border border-slate-200 hover:border-blue-400 rounded-lg transition-colors flex items-center justify-between text-slate-900 shadow-2xs group"
                  >
                    <div>
                      <span className="font-bold block group-hover:text-blue-600 transition-colors">Color Palette</span>
                      <span className="text-[10px] text-slate-400">Median Cut</span>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all" />
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate('/tools/image-optimizer')}
                    className="p-2.5 text-left bg-white hover:bg-slate-50 border border-slate-200 hover:border-blue-400 rounded-lg transition-colors flex items-center justify-between text-slate-900 shadow-2xs group col-span-2"
                  >
                    <div>
                      <span className="font-bold block group-hover:text-blue-600 transition-colors">Image Optimizer & Exporter</span>
                      <span className="text-[10px] text-slate-400">Encode to WebP, JPEG, PNG, or AVIF</span>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all" />
                  </button>
                </div>
              </div>
            </div>

            {/* Right: Technical Telemetry & Specifications (7 Cols) */}
            <div className="lg:col-span-7 space-y-6">
              {/* Group 1: Spatial & Physical Geometry */}
              <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs">
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
                  <h2 className="text-xs font-bold text-slate-950 uppercase tracking-wider flex items-center gap-2">
                    <Maximize2 className="w-4 h-4 text-blue-600" />
                    Spatial & Physical Geometry
                  </h2>
                  <button
                    type="button"
                    onClick={() =>
                      copyToClipboard(
                        `${metadata.width}x${metadata.height} (${metadata.aspectRatio.ratioString})`,
                        'geometry'
                      )
                    }
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-950 transition-colors"
                  >
                    {copiedKey === 'geometry' ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-600">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-slate-400" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5">
                  <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl">
                    <p className="text-[10px] font-mono uppercase tracking-wider text-slate-500 font-semibold">Resolution</p>
                    <p className="text-xl sm:text-2xl font-bold font-mono text-slate-950 mt-1 tabular-nums">
                      {metadata.width} <span className="text-xs font-normal text-slate-400">×</span> {metadata.height}
                    </p>
                    <p className="text-[11px] text-slate-500 mt-1 font-mono">
                      {((metadata.width * metadata.height) / 1000000).toFixed(2)} Megapixels
                    </p>
                  </div>

                  <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl">
                    <p className="text-[10px] font-mono uppercase tracking-wider text-slate-500 font-semibold">Aspect Ratio</p>
                    <p className="text-xl sm:text-2xl font-bold font-mono text-slate-950 mt-1 tabular-nums">
                      {metadata.aspectRatio.ratioString}
                    </p>
                    <p className="text-[11px] text-slate-500 mt-1 truncate">
                      {metadata.aspectRatio.nearestStandard || `${metadata.aspectRatio.decimal}:1 decimal`}
                    </p>
                  </div>

                  <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl col-span-2 sm:col-span-1">
                    <p className="text-[10px] font-mono uppercase tracking-wider text-slate-500 font-semibold">Orientation</p>
                    <p className="text-base sm:text-lg font-bold text-slate-950 mt-1 truncate">
                      {metadata.orientation.split(' ')[0]}
                    </p>
                    <p className="text-[11px] text-slate-500 mt-1">
                      {metadata.orientation}
                    </p>
                  </div>
                </div>
              </div>

              {/* Group 2: Format & Container Diagnostics */}
              <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs">
                <h2 className="text-xs font-bold text-slate-950 uppercase tracking-wider flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
                  <FileText className="w-4 h-4 text-indigo-600" />
                  Container & Header Diagnostics
                </h2>

                <div className="divide-y divide-slate-100 text-xs">
                  <div className="py-2.5 flex items-center justify-between">
                    <span className="text-slate-500 font-medium">Verified MIME Signature</span>
                    <span className="font-mono text-slate-950 font-bold">{metadata.mimeType}</span>
                  </div>

                  <div className="py-2.5 flex items-center justify-between">
                    <span className="text-slate-500 font-medium">Exact Payload Weight</span>
                    <span className="font-mono text-slate-950 font-bold tabular-nums">
                      {metadata.fileSize.toLocaleString()} bytes ({metadata.fileSizeBytesText})
                    </span>
                  </div>

                  <div className="py-2.5 flex items-center justify-between">
                    <span className="text-slate-500 font-medium">Alpha Transparency Channel</span>
                    <span className="font-semibold flex items-center gap-1.5">
                      {metadata.hasAlphaChannel ? (
                        <span className="text-emerald-700 bg-emerald-50 border border-emerald-200/90 px-2 py-0.5 rounded-md text-[11px] font-semibold">
                          Alpha Present (Transparent Pixels Detected)
                        </span>
                      ) : (
                        <span className="text-slate-600 bg-slate-100 border border-slate-200/90 px-2 py-0.5 rounded-md text-[11px] font-semibold">
                          Opaque (No Alpha Transparency)
                        </span>
                      )}
                    </span>
                  </div>

                  {metadata.dpi && (
                    <div className="py-2.5 flex items-center justify-between">
                      <span className="text-slate-500 font-medium">Physical Density (pHYs)</span>
                      <span className="font-mono text-slate-950 tabular-nums">
                        {metadata.dpi.x} × {metadata.dpi.y} DPI
                      </span>
                    </div>
                  )}

                  {metadata.pngChunks && metadata.pngChunks.length > 0 && (
                    <div className="py-2.5 flex flex-col gap-1.5">
                      <span className="text-slate-500 font-medium">Identified PNG Chunks:</span>
                      <div className="flex flex-wrap gap-1">
                        {metadata.pngChunks.map((chunk) => (
                          <span
                            key={chunk}
                            className="font-mono text-[10px] bg-slate-100 border border-slate-200 px-2 py-0.5 rounded text-slate-700 font-semibold"
                          >
                            {chunk}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Group 3: EXIF Metadata */}
              <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs">
                <h2 className="text-xs font-bold text-slate-950 uppercase tracking-wider flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
                  <Camera className="w-4 h-4 text-blue-600" />
                  Photographic EXIF Tags (APP1)
                </h2>

                {metadata.exif && Object.keys(metadata.exif).length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    {Object.entries(metadata.exif).map(([key, value]) => (
                      <div
                        key={key}
                        className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl flex flex-col justify-between"
                      >
                        <span className="text-[10px] font-mono uppercase text-slate-500 font-semibold">{key}</span>
                        <span className="font-mono text-slate-950 font-bold mt-1 truncate">
                          {String(value)}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-xl text-xs space-y-2 text-slate-600">
                    <div className="flex items-center gap-2 text-slate-900 font-bold">
                      <Info className="w-4 h-4 text-blue-600 shrink-0" />
                      <span>No EXIF Photographic Tags Found</span>
                    </div>
                    <p className="leading-relaxed">
                      This file does not contain camera shooting parameters or GPS geolocation markers. This is standard behavior:
                    </p>
                    <ul className="list-disc list-inside space-y-1 text-slate-500 pl-1">
                      <li>Web graphics and screenshots do not originate from camera sensors.</li>
                      <li>Messaging apps and social networks strip metadata upon upload to protect user privacy.</li>
                      <li>Modern build systems and CMS compressors remove EXIF tags to save bandwidth.</li>
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
