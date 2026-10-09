/**
 * PixelProof — Laboratory Footer
 * Semantic layout, crawlable internal links, privacy notice, and technical disclosures.
 */

import React from 'react';
import { Link } from '../../router/Link';
import { ShieldCheck, HardDrive, Cpu } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-400 text-xs border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Trust & Architecture Banner */}
        <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60 mb-10 text-slate-300">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-white text-sm">100% Client-Side Privacy</p>
                <p className="text-xs text-slate-400 mt-0.5">
                  Your images never leave your computer. Processing occurs entirely in local browser RAM via native Canvas and ArrayBuffer APIs.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Cpu className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-white text-sm">Hardware-Accelerated Engine</p>
                <p className="text-xs text-slate-400 mt-0.5">
                  Sub-millisecond quantization, EXIF header parsing, and native WebP/JPEG encoding with zero remote network latency.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <HardDrive className="w-5 h-5 text-sky-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-white text-sm">Zero Persistence Policy</p>
                <p className="text-xs text-slate-400 mt-0.5">
                  Temporary object URLs are garbage-collected automatically when you navigate away or close your browser tab.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Brand identity header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-8 mb-8 border-b border-slate-800 gap-4">
          <div className="flex items-center gap-2.5">
            <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-blue-600 text-white shadow-xs">
              <ShieldCheck className="w-4 h-4" />
            </span>
            <span className="text-base font-bold text-white tracking-tight">
              Pixel<span className="text-blue-400">Proof</span>
              <span className="ml-2 text-[10px] font-mono uppercase tracking-widest text-slate-400 font-normal">
                Laboratory v2.4
              </span>
            </span>
          </div>
          <p className="text-xs text-slate-400 max-w-md">
            The private, browser-native digital image analysis and optimization laboratory for creators, designers, and engineers.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          {/* Col 1: Tools */}
          <div>
            <p className="font-semibold text-white uppercase tracking-wider text-xs mb-3">
              Laboratory Tools
            </p>
            <ul className="space-y-2">
              <li>
                <Link to="/tools/image-inspector" className="hover:text-white transition-colors">
                  Image Inspector
                </Link>
              </li>
              <li>
                <Link to="/tools/image-dimensions" className="hover:text-white transition-colors">
                  Dimensions Checker
                </Link>
              </li>
              <li>
                <Link to="/tools/color-palette" className="hover:text-white transition-colors">
                  Color Palette Extractor
                </Link>
              </li>
              <li>
                <Link to="/tools/image-compare" className="hover:text-white transition-colors">
                  Image Comparison Slider
                </Link>
              </li>
              <li>
                <Link to="/tools/image-optimizer" className="hover:text-white transition-colors">
                  Image Optimizer & Exporter
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 2: Educational Guides */}
          <div>
            <p className="font-semibold text-white uppercase tracking-wider text-xs mb-3">
              Educational Guides
            </p>
            <ul className="space-y-2">
              <li>
                <Link to="/guides/image-dimensions-guide" className="hover:text-white transition-colors">
                  Checking Dimensions
                </Link>
              </li>
              <li>
                <Link to="/guides/aspect-ratios-explained" className="hover:text-white transition-colors">
                  Aspect Ratios Explained
                </Link>
              </li>
              <li>
                <Link to="/guides/color-palette-extraction" className="hover:text-white transition-colors">
                  Extracting Color Palettes
                </Link>
              </li>
              <li>
                <Link to="/guides/reduce-image-file-size" className="hover:text-white transition-colors">
                  Reducing Web Image Weight
                </Link>
              </li>
              <li>
                <Link to="/guides/format-comparison-jpeg-png-webp-avif" className="hover:text-white transition-colors">
                  JPEG vs PNG vs WebP vs AVIF
                </Link>
              </li>
              <li>
                <Link to="/guides/why-image-metadata-missing" className="hover:text-white transition-colors">
                  Why EXIF Metadata Is Missing
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Principles & Limitations */}
          <div>
            <p className="font-semibold text-white uppercase tracking-wider text-xs mb-3">
              Architecture & Trust
            </p>
            <ul className="space-y-2">
              <li>
                <Link to="/about" className="hover:text-white transition-colors">
                  Project Purpose & Specs
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="hover:text-white transition-colors">
                  Local Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/about#limitations" className="hover:text-white transition-colors">
                  Browser Technical Limitations
                </Link>
              </li>
              <li>
                <a
                  href="/sitemap.xml"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors"
                >
                  XML Sitemap
                </a>
              </li>
            </ul>
          </div>

          {/* Col 4: Contact & Feedback */}
          <div>
            <p className="font-semibold text-white uppercase tracking-wider text-xs mb-3">
              Communication
            </p>
            <ul className="space-y-2">
              <li>
                <Link to="/contact" className="hover:text-white transition-colors">
                  Technical Inquiries & Feedback
                </Link>
              </li>
              <li>
                <span className="text-slate-500">
                  Open specification for designers, students, and engineers.
                </span>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-slate-500 text-xs">
          <p>© {new Date().getFullYear()} PixelProof. Built for precision digital image analysis without software installation.</p>
          <div className="flex items-center gap-4">
            <Link to="/privacy" className="hover:text-slate-300 transition-colors">
              Privacy
            </Link>
            <span>·</span>
            <Link to="/about" className="hover:text-slate-300 transition-colors">
              About
            </Link>
            <span>·</span>
            <Link to="/contact" className="hover:text-slate-300 transition-colors">
              Contact
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
