/**
 * PixelProof — Privacy Policy
 * Authentic disclosure of client-side execution, zero server uploads, and RAM lifecycle.
 */

import React from 'react';
import { PageHeader } from '../components/common/PageHeader';
import { Link } from '../router/Link';
import { ShieldCheck, EyeOff, ServerOff, Database } from 'lucide-react';

export function PrivacyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      <PageHeader
        category="Legal & Governance"
        title="Privacy Policy: 100% Local In-Browser Processing"
        description="Our technical and operational commitment to your privacy: no cookies, no tracking telemetry, and zero server-side image transfers."
        badgeText="Last Verified: October 2026"
      />

      {/* Summary Trust Box */}
      <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-start gap-4 text-emerald-900">
        <ShieldCheck className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <h2 className="text-sm font-bold">The PixelProof Privacy Guarantee</h2>
          <p className="text-xs leading-relaxed text-emerald-800">
            When you select or drop an image into PixelProof, that file never travels across the internet. It is parsed, inspected, rendered, quantized, and optimized entirely within your computer’s local memory (RAM) via standard browser sandboxes.
          </p>
        </div>
      </div>

      <div className="space-y-8 text-sm text-slate-700 leading-relaxed">
        {/* Section 1 */}
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <ServerOff className="w-4 h-4 text-slate-600" />
            1. Zero Remote Image Transmission
          </h2>
          <p>
            Traditional online image converters upload your confidential images to remote cloud servers (such as AWS S3 or Google Cloud Storage) where background workers process them. This creates substantial privacy exposure, risks data breaches, and violates strict internal confidentiality protocols.
          </p>
          <p>
            PixelProof has no image processing backend. Every algorithm—including binary EXIF parsing, Euclidean aspect-ratio reduction, Median Cut color quantization, and Canvas WebP/JPEG re-encoding—runs directly in your browser tab using compiled client-side JavaScript and browser C++ native graphics engines.
          </p>
        </section>

        {/* Section 2 */}
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Database className="w-4 h-4 text-slate-600" />
            2. Ephemeral In-Memory Storage & Object URLs
          </h2>
          <p>
            When an image is loaded, PixelProof generates a temporary in-memory reference using the browser's standard <code className="bg-slate-100 text-slate-800 px-1 py-0.5 rounded text-xs font-mono">URL.createObjectURL()</code> method.
          </p>
          <p>
            These object URLs exist solely in your local browser tab session. As soon as you navigate away, choose another image, or close your browser tab, PixelProof invokes <code className="bg-slate-100 text-slate-800 px-1 py-0.5 rounded text-xs font-mono">URL.revokeObjectURL()</code> to release the memory immediately back to your operating system.
          </p>
        </section>

        {/* Section 3 */}
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <EyeOff className="w-4 h-4 text-slate-600" />
            3. Zero Analytical Profiling & Third-Party Trackers
          </h2>
          <p>
            PixelProof does not embed invasive advertising pixels, third-party user fingerprinting scripts, behavioral trackers, or monetization telemetry. We do not inspect your images for personal identification, faces, or sensitive EXIF geolocation metadata.
          </p>
        </section>

        {/* Section 4 */}
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-slate-900">
            4. Enterprise & HIPAA/GDPR Compliance Readiness
          </h2>
          <p>
            Because no data transfer occurs between client and server, PixelProof does not act as a data processor or data controller for the contents of your images. It is safe for inspecting proprietary product mockups, patient medical records, legal scans, and copyrighted photographs.
          </p>
        </section>

        {/* Section 5 */}
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-slate-900">
            5. Inquiries Regarding Privacy Practices
          </h2>
          <p>
            If you have questions about our architectural implementation or wish to audit our client-side routines, please contact our engineering team via the <Link to="/contact" className="text-blue-600 font-semibold hover:underline">Contact page</Link>.
          </p>
        </section>
      </div>
    </div>
  );
}
