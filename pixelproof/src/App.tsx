/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { RouterProvider, useRouter } from './router/Router';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { Home } from './pages/Home';
import { InspectorPage } from './pages/tools/InspectorPage';
import { DimensionsPage } from './pages/tools/DimensionsPage';
import { PalettePage } from './pages/tools/PalettePage';
import { ComparePage } from './pages/tools/ComparePage';
import { OptimizerPage } from './pages/tools/OptimizerPage';
import { GuidesIndexPage } from './pages/guides/GuidesIndexPage';
import { GuideDetailPage } from './pages/guides/GuideDetailPage';
import { AboutPage } from './pages/AboutPage';
import { PrivacyPage } from './pages/PrivacyPage';
import { ContactPage } from './pages/ContactPage';
import { Link } from './router/Link';
import { AlertCircle, ArrowLeft } from 'lucide-react';

function AppContent() {
  const { currentPath } = useRouter();

  // Route matching
  const renderRoute = () => {
    // Exact paths
    if (currentPath === '/') return <Home />;
    if (currentPath === '/tools/image-inspector') return <InspectorPage />;
    if (currentPath === '/tools/image-dimensions') return <DimensionsPage />;
    if (currentPath === '/tools/color-palette') return <PalettePage />;
    if (currentPath === '/tools/image-compare') return <ComparePage />;
    if (currentPath === '/tools/image-optimizer') return <OptimizerPage />;
    if (currentPath === '/guides') return <GuidesIndexPage />;
    if (currentPath === '/about') return <AboutPage />;
    if (currentPath === '/privacy') return <PrivacyPage />;
    if (currentPath === '/contact') return <ContactPage />;

    // Dynamic guide paths: /guides/:slug
    if (currentPath.startsWith('/guides/')) {
      const slug = currentPath.replace('/guides/', '').replace(/\/+$/, '').split('?')[0];
      if (!slug) return <GuidesIndexPage />;
      return <GuideDetailPage slug={slug} />;
    }

    // 404 Fallback
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto border border-amber-200">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900">Page Not Found</h1>
        <p className="text-xs text-slate-600">
          The requested route <code className="font-mono bg-slate-100 px-1 py-0.5 rounded text-slate-800">{currentPath}</code> does not exist in PixelProof.
        </p>
        <div className="pt-2">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to PixelProof Lab</span>
          </Link>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 antialiased font-sans">
      <Navbar />
      <main className="flex-1 focus:outline-none" tabIndex={-1}>
        {renderRoute()}
      </main>
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <RouterProvider>
      <AppContent />
    </RouterProvider>
  );
}
