/**
 * PixelProof — Educational Guides Directory
 * Structured learning resources on digital image geometry, compression, and algorithms.
 */

import React, { useState } from 'react';
import { PageHeader } from '../../components/common/PageHeader';
import { Link } from '../../router/Link';
import { GUIDES } from '../../data/guidesData';
import { BookOpen, ArrowRight, Tag } from 'lucide-react';

export function GuidesIndexPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const categories = ['All', 'Dimensions & Geometry', 'Color & Pigment', 'Compression & Optimization', 'Formats & Protocols', 'Metadata & Privacy'];

  const filteredGuides = selectedCategory === 'All'
    ? GUIDES
    : GUIDES.filter((g) => g.category === selectedCategory);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <PageHeader
        category="Knowledge Base"
        title="Educational Technical Guides"
        description="Comprehensive, peer-grade articles on digital imaging mathematics, compression tradeoffs, aspect ratios, and format specifications."
        badgeText="6 Technical Articles"
      />

      {/* Category Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {categories.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap transition-all ${
              selectedCategory === cat
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-slate-950'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Guides Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredGuides.map((guide) => (
          <article
            key={guide.slug}
            className="group p-6 bg-white border border-slate-200/90 rounded-2xl hover:border-blue-400 hover:shadow-md transition-all duration-200 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 mb-3">
                <span className="text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-md border border-blue-200/60 font-sans font-semibold">
                  {guide.category}
                </span>
                <span>{guide.readTime}</span>
              </div>

              <h2 className="text-base font-bold text-slate-950 group-hover:text-blue-600 transition-colors">
                <Link to={`/guides/${guide.slug}`} className="focus:outline-none">
                  {guide.title}
                </Link>
              </h2>

              <p className="text-xs text-slate-600 mt-2.5 leading-relaxed line-clamp-3">
                {guide.summary}
              </p>

              {/* Related tool tag */}
              <div className="flex flex-wrap gap-1.5 mt-4">
                <span className="text-[10px] font-mono text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200/80">
                  Tool: {guide.relatedToolName}
                </span>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[11px] text-slate-400 font-mono">
                Updated {guide.lastUpdated}
              </span>
              <Link
                to={`/guides/${guide.slug}`}
                className="text-xs font-semibold text-slate-900 group-hover:text-blue-600 flex items-center gap-1 transition-colors"
              >
                <span>Read article</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </article>
        ))}
      </div>

      {/* Laboratory Quick Access Banner */}
      <div className="p-6 bg-slate-100 border border-slate-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-bold text-slate-950">Put Theory Into Practice</h3>
          <p className="text-xs text-slate-600 mt-0.5">
            Test any concept from our technical articles using PixelProof’s 100% client-side laboratory suite.
          </p>
        </div>
        <Link
          to="/tools/image-inspector"
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg transition-colors shrink-0 shadow-2xs"
        >
          <span>Open Image Inspector</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
