/**
 * PixelProof — Top Navigation Bar
 * Follows the 3-Zone Top Bar Contract with precision typography and accessible mobile toggle.
 */

import React, { useState } from 'react';
import { Link } from '../../router/Link';
import { useRouter } from '../../router/Router';
import { Menu, X, ArrowUpRight, Aperture } from 'lucide-react';

export function Navbar() {
  const { currentPath, navigate } = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { label: 'Inspector', path: '/tools/image-inspector' },
    { label: 'Dimensions', path: '/tools/image-dimensions' },
    { label: 'Palette', path: '/tools/color-palette' },
    { label: 'Compare', path: '/tools/image-compare' },
    { label: 'Optimizer', path: '/tools/image-optimizer' },
    { label: 'Guides', path: '/guides' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200/80 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-8">
          {/* Zone 1: Brand wordmark */}
          <Link
            to="/"
            className="group flex items-center gap-2.5 text-base font-bold tracking-tight text-slate-900 whitespace-nowrap shrink-0 rounded-md focus-visible:outline-2 focus-visible:outline-blue-600"
          >
            <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-slate-900 text-white shadow-xs group-hover:bg-blue-600 transition-colors">
              <Aperture className="w-4 h-4 text-blue-400 group-hover:text-white transition-colors" />
            </span>
            <div className="flex flex-col">
              <span className="tracking-tight font-extrabold text-slate-950 text-sm sm:text-base leading-none">
                Pixel<span className="text-blue-600 font-semibold">Proof</span>
              </span>
              <span className="text-[9px] font-mono uppercase tracking-widest text-slate-600 font-semibold leading-tight mt-0.5">
                Image Lab
              </span>
            </div>
          </Link>

          {/* Zone 2: Single-line clean text links */}
          <nav className="hidden md:flex items-center gap-1 text-sm font-medium text-slate-600">
            {navLinks.map((link) => {
              const isActive = currentPath === link.path || (link.path === '/guides' && currentPath.startsWith('/guides'));
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap shrink-0 transition-all ${
                    isActive
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-950 hover:bg-slate-100/80'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Zone 3: 1 primary action */}
          <div className="flex items-center gap-2.5 shrink-0">
            <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 border border-slate-200/60 text-[11px] font-mono text-slate-600">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>100% In-Browser</span>
            </div>

            <button
              type="button"
              onClick={() => navigate('/tools/image-inspector')}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 active:scale-[0.98] rounded-lg transition-all whitespace-nowrap shadow-xs hover:shadow-sm focus-visible:outline-2 focus-visible:outline-blue-600"
            >
              <span>Inspect Image</span>
              <ArrowUpRight className="w-3.5 h-3.5 text-blue-200" />
            </button>

            {/* Mobile menu toggle */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden inline-flex items-center justify-center p-2 rounded-lg text-slate-600 hover:text-slate-950 hover:bg-slate-100 transition-colors focus-visible:outline-2 focus-visible:outline-blue-600"
              aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile navigation drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-200 bg-white/98 backdrop-blur-md px-4 pt-2 pb-5 space-y-1 shadow-lg animate-in fade-in duration-150">
          {navLinks.map((link) => {
            const isActive = currentPath === link.path || (link.path === '/guides' && currentPath.startsWith('/guides'));
            return (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 font-bold'
                    : 'text-slate-700 hover:bg-slate-50 hover:text-slate-950'
                }`}
              >
                {link.label}
              </Link>
            );
          })}
          <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
            <Link
              to="/about"
              onClick={() => setMobileMenuOpen(false)}
              className="text-xs text-slate-500 hover:text-slate-800 px-3 py-1"
            >
              About & Technical Limitations
            </Link>
            <Link
              to="/privacy"
              onClick={() => setMobileMenuOpen(false)}
              className="text-xs text-slate-500 hover:text-slate-800 px-3 py-1"
            >
              Privacy Policy (Local-Only)
            </Link>
            <Link
              to="/contact"
              onClick={() => setMobileMenuOpen(false)}
              className="text-xs text-slate-500 hover:text-slate-800 px-3 py-1"
            >
              Contact Support
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}

