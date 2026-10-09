/**
 * PixelProof — Consistent Semantic Page Header
 */

import React from 'react';
import { Link } from '../../router/Link';
import { ChevronRight, Home as HomeIcon } from 'lucide-react';

interface PageHeaderProps {
  category?: string;
  title: string;
  description: string;
  badgeText?: string;
  action?: React.ReactNode;
}

export function PageHeader({ category = 'Laboratory Tools', title, description, badgeText, action }: PageHeaderProps) {
  return (
    <div className="mb-8 pb-6 border-b border-slate-200/80">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-slate-500">
          <Link to="/" className="inline-flex items-center gap-1 text-slate-600 hover:text-slate-950 font-medium transition-colors">
            <HomeIcon className="w-3.5 h-3.5 text-slate-400" />
            <span>PixelProof</span>
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-slate-900 font-semibold">{category}</span>
        </nav>

        {badgeText && (
          <div className="shrink-0 self-start sm:self-auto">
            <span className="inline-flex items-center gap-1.5 text-[11px] font-mono text-slate-700 bg-white border border-slate-200 px-2.5 py-1 rounded-md shadow-2xs">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
              {badgeText}
            </span>
          </div>
        )}
      </div>

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-1.5 max-w-3xl">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-950 text-balance">
            {title}
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed text-balance">
            {description}
          </p>
        </div>

        {action && <div className="shrink-0">{action}</div>}
      </div>
    </div>
  );
}
