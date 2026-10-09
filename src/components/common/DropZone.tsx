/**
 * PixelProof — Accessible Universal Image DropZone
 * Supports drag-and-drop, native file browser, clipboard paste (Ctrl/Cmd+V),
 * and 1-click curated sample loading.
 */

import React, { useState, useRef, useEffect } from 'react';
import { UploadCloud, Image as ImageIcon, Sparkles, AlertCircle, FileCheck } from 'lucide-react';
import { SAMPLE_IMAGES, fetchSampleAsFile, createTransparentBadgeBlob, SampleItem } from '../../utils/sampleImages';

interface DropZoneProps {
  onFileSelected: (file: File) => void;
  isLoading?: boolean;
  acceptedFormatsText?: string;
  className?: string;
  compact?: boolean;
}

export function DropZone({
  onFileSelected,
  isLoading = false,
  acceptedFormatsText = 'JPEG, PNG, WebP, AVIF, GIF, SVG',
  className = '',
  compact = false,
}: DropZoneProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [sampleLoadingId, setSampleLoadingId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle clipboard paste
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        if (items[i].type.startsWith('image/')) {
          const file = items[i].getAsFile();
          if (file) {
            validateAndProcessFile(file);
            break;
          }
        }
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, []);

  const validateAndProcessFile = (file: File) => {
    setErrorMessage(null);

    // Validate size (< 60MB for browser responsiveness)
    if (file.size > 60 * 1024 * 1024) {
      setErrorMessage(`The file is ${Math.round(file.size / 1024 / 1024)}MB. Please choose an image under 60MB to avoid browser memory exhaustion.`);
      return;
    }

    // Validate MIME type or extension
    const validExtensions = /\.(jpe?g|png|webp|avif|gif|svg)$/i;
    const isImageMime = file.type.startsWith('image/') || validExtensions.test(file.name);

    if (!isImageMime) {
      setErrorMessage(`Unsupported file format "${file.type || file.name}". Please upload a JPEG, PNG, WebP, AVIF, GIF, or SVG.`);
      return;
    }

    handleValidFile(file);
  };

  const handleValidFile = (file: File) => {
    setErrorMessage(null);
    onFileSelected(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      validateAndProcessFile(e.dataTransfer.files[0]);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      validateAndProcessFile(e.target.files[0]);
    }
    // Reset input so re-selecting same file triggers change
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const loadSample = async (sample: SampleItem) => {
    try {
      setSampleLoadingId(sample.id);
      setErrorMessage(null);
      const file = await fetchSampleAsFile(sample);
      onFileSelected(file);
    } catch {
      setErrorMessage('Could not load sample asset. Please select a local file.');
    } finally {
      setSampleLoadingId(null);
    }
  };

  const loadTransparentBadge = async () => {
    try {
      setSampleLoadingId('transparent_badge');
      setErrorMessage(null);
      const blob = await createTransparentBadgeBlob();
      const file = new File([blob], 'transparent_lab_badge.png', { type: 'image/png' });
      onFileSelected(file);
    } catch {
      setErrorMessage('Could not generate test badge.');
    } finally {
      setSampleLoadingId(null);
    }
  };

  return (
    <div className={`w-full ${className}`}>
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/avif,image/gif,image/svg+xml,.jpg,.jpeg,.png,.webp,.avif,.gif,.svg"
        onChange={handleInputChange}
        className="sr-only"
        id="pixelproof-file-input"
        aria-label="Upload an image for analysis"
      />

      {/* Main Drag Area */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            fileInputRef.current?.click();
          }
        }}
        className={`group relative cursor-pointer transition-all duration-150 rounded-2xl border-2 border-dashed ${
          isDragOver
            ? 'border-blue-600 bg-blue-50/70 scale-[0.99] shadow-inner'
            : 'border-slate-300 hover:border-blue-500 bg-white hover:bg-slate-50/70 shadow-xs hover:shadow-sm'
        } ${compact ? 'p-6' : 'p-8 sm:p-11'} text-center focus-visible:outline-2 focus-visible:outline-blue-600`}
      >
        {/* Optical corner reticle accents */}
        <span className="pointer-events-none absolute top-3 left-3 w-2.5 h-2.5 border-t-2 border-l-2 border-slate-300 group-hover:border-blue-500 transition-colors rounded-tl-xs" />
        <span className="pointer-events-none absolute top-3 right-3 w-2.5 h-2.5 border-t-2 border-r-2 border-slate-300 group-hover:border-blue-500 transition-colors rounded-tr-xs" />
        <span className="pointer-events-none absolute bottom-3 left-3 w-2.5 h-2.5 border-b-2 border-l-2 border-slate-300 group-hover:border-blue-500 transition-colors rounded-bl-xs" />
        <span className="pointer-events-none absolute bottom-3 right-3 w-2.5 h-2.5 border-b-2 border-r-2 border-slate-300 group-hover:border-blue-500 transition-colors rounded-br-xs" />

        <div className="flex flex-col items-center justify-center max-w-lg mx-auto">
          <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-slate-100 group-hover:bg-blue-50 text-slate-700 group-hover:text-blue-600 mb-3.5 border border-slate-200/80 group-hover:border-blue-200 transition-colors shadow-2xs">
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
            ) : (
              <UploadCloud className="w-5 h-5 transition-transform group-hover:-translate-y-0.5" />
            )}
          </div>

          <h3 className="text-base sm:text-lg font-bold text-slate-950 tracking-tight mb-1">
            Drop image here, paste, or browse
          </h3>

          <p className="text-xs text-slate-500 mb-4 max-w-md leading-relaxed">
            Format support: <span className="font-semibold text-slate-700">{acceptedFormatsText}</span>.
            <span className="block sm:inline sm:ml-1 text-slate-400">Zero uploads — stays in browser RAM.</span>
          </p>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-slate-900 group-hover:bg-blue-600 rounded-lg transition-colors shadow-2xs">
              <ImageIcon className="w-3.5 h-3.5 opacity-90" />
              <span>Select Local File</span>
            </span>
            <span className="hidden sm:inline-block text-[11px] font-mono text-slate-500 bg-slate-100 px-2 py-1 rounded-md border border-slate-200">
              or Ctrl+V
            </span>
          </div>
        </div>
      </div>

      {/* Error state */}
      {errorMessage && (
        <div className="mt-3 p-3 bg-rose-50 border border-rose-200 rounded-lg flex items-start gap-2.5 text-rose-800 text-xs animate-in fade-in">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
          <p className="leading-relaxed">{errorMessage}</p>
        </div>
      )}

      {/* Quick Sample Selector */}
      <div className="mt-5 pt-4 border-t border-slate-200/80">
        <div className="flex items-center justify-between flex-wrap gap-2 mb-2.5">
          <span className="text-xs font-semibold text-slate-600 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            No image ready? Test immediately with a lab specimen:
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {SAMPLE_IMAGES.map((sample) => (
            <button
              key={sample.id}
              type="button"
              disabled={isLoading || sampleLoadingId !== null}
              onClick={() => loadSample(sample)}
              className="group flex items-center gap-2.5 p-2 rounded-xl border border-slate-200/90 bg-white hover:bg-slate-50 hover:border-blue-300 text-left transition-all shadow-2xs hover:shadow-xs focus-visible:outline-2 focus-visible:outline-blue-600 disabled:opacity-50"
            >
              <img
                src={sample.url}
                alt={sample.name}
                className="w-9 h-9 rounded-lg object-cover border border-slate-200/80 shrink-0 group-hover:scale-105 transition-transform"
              />
              <div className="min-w-0">
                <p className="text-xs font-semibold text-slate-900 truncate group-hover:text-blue-600 transition-colors">
                  {sample.name}
                </p>
                <p className="text-[10px] text-slate-400 font-mono truncate">
                  {sample.format} · {sample.dimensions.split(' ')[0]}
                </p>
              </div>
            </button>
          ))}

          {/* Transparent sample badge */}
          <button
            type="button"
            disabled={isLoading || sampleLoadingId !== null}
            onClick={loadTransparentBadge}
            className="group flex items-center gap-2.5 p-2 rounded-xl border border-slate-200/90 bg-white hover:bg-slate-50 hover:border-blue-300 text-left transition-all shadow-2xs hover:shadow-xs focus-visible:outline-2 focus-visible:outline-blue-600 disabled:opacity-50"
          >
            <div className="w-9 h-9 rounded-lg bg-checkerboard border border-slate-200 shrink-0 flex items-center justify-center group-hover:scale-105 transition-transform">
              <FileCheck className="w-4 h-4 text-blue-600" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-slate-900 truncate group-hover:text-blue-600 transition-colors">
                Transparent PNG
              </p>
              <p className="text-[10px] text-slate-400 font-mono truncate">
                PNG · Alpha Layer
              </p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
