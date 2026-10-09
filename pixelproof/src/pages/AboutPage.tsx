/**
 * PixelProof — About Project & Technical Architecture
 * Purpose, engineering specifications, browser boundary limits, and open standards.
 */

import React from 'react';
import { PageHeader } from '../components/common/PageHeader';
import { Link } from '../router/Link';
import { ShieldCheck, Cpu, Terminal, AlertTriangle, Layers, ArrowRight } from 'lucide-react';

export function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      <PageHeader
        category="Project Specifications"
        title="About PixelProof Laboratory"
        description="An independent browser-based image inspection and optimization lab built to provide transparent, private digital asset diagnostics without native software installations."
        badgeText="Technical Disclosure"
      />

      {/* Purpose */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">
          1. Mission & Philosophy
        </h2>
        <p className="text-sm text-slate-700 leading-relaxed">
          Modern image utilities have increasingly shifted toward aggressive subscription models, cloud telemetry pipelines that harvest private photographs, and deceptive marketing around compression and artificial intelligence.
        </p>
        <p className="text-sm text-slate-700 leading-relaxed">
          PixelProof was engineered to demonstrate what modern browsers can achieve natively. By executing all parsing, color clustering, and image encoding locally through HTML5 Canvas and typed array memory buffers, we guarantee 100% privacy, near-instant turnaround, and uncompromising accuracy.
        </p>
      </section>

      {/* Architecture Highlights */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">
          2. Architectural Stack & Principles
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-5 bg-white border border-slate-200/90 rounded-2xl space-y-2 shadow-xs">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Cpu className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-slate-950">Zero Cloud Ingestion</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              No images or EXIF tags are uploaded to external APIs or remote endpoints. All computations occur within client-side JavaScript and graphics threads.
            </p>
          </div>

          <div className="p-5 bg-white border border-slate-200/90 rounded-2xl space-y-2 shadow-xs">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Terminal className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-slate-950">Native Binary Parsing</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Container identification uses raw byte signatures (magic bytes) and DataView offsets rather than trusting unreliable file extensions or OS MIME guesses.
            </p>
          </div>

          <div className="p-5 bg-white border border-slate-200/90 rounded-2xl space-y-2 shadow-xs">
            <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-slate-950">Median Cut Quantization</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Representative color extraction partitions 3D color cubes mathematically with alpha filtering, delivering legitimate swatches instead of arbitrary random pixel picks.
            </p>
          </div>

          <div className="p-5 bg-white border border-slate-200/90 rounded-2xl space-y-2 shadow-xs">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-slate-950">Responsible Memory Management</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Object URLs created during user analysis are explicitly revoked via <code className="text-blue-700 font-mono text-[11px]">URL.revokeObjectURL()</code> to prevent heap leakage.
            </p>
          </div>
        </div>
      </section>

      {/* Limitations Section */}
      <section id="limitations" className="space-y-4">
        <h2 className="text-xl font-bold text-slate-950 tracking-tight flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-amber-600" />
          3. Technical Limitations & Browser Constraints
        </h2>
        <p className="text-sm text-slate-700 leading-relaxed">
          Because PixelProof operates within the browser security sandbox without elevated operating system privileges, certain physical limitations exist:
        </p>

        <div className="p-6 bg-white border border-slate-200/90 rounded-2xl space-y-3 text-xs text-slate-600 leading-relaxed shadow-xs">
          <ul className="space-y-2.5 list-disc list-inside">
            <li>
              <strong>Memory Limits on Megapixel Images:</strong> Browsers allocate memory based on uncompressed raw bitmap dimensions (width × height × 4 bytes). An uncompressed 100-megapixel camera image requires 400 MB of continuous GPU/CPU buffer. Uploading files greater than 60 MB may cause mobile browser tabs to restart.
            </li>
            <li>
              <strong>Browser Codec Disparities:</strong> Encoding support for next-generation formats such as AVIF depends on your browser’s underlying media engine (Chromium, Firefox, or Safari). PixelProof dynamically probes for support before offering encoding.
            </li>
            <li>
              <strong>Irrecoverable Stripped Metadata:</strong> If an image was downloaded from a chat service or social network that stripped EXIF data, client-side code cannot magically recreate camera settings that were permanently discarded.
            </li>
            <li>
              <strong>No Multi-File Batching Overrides:</strong> Browsers do not permit direct silent overwriting of files on your local hard drive; optimized files must be downloaded through standard browser save dialogs.
            </li>
          </ul>
        </div>
      </section>

      {/* Links to Tools */}
      <section className="pt-6 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <span className="text-xs text-slate-500">
          Ready to inspect your digital assets?
        </span>
        <Link
          to="/tools/image-inspector"
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors self-start sm:self-auto"
        >
          <span>Launch Inspector</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </section>
    </div>
  );
}
