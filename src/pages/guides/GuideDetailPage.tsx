/**
 * PixelProof — Educational Guide Detail Page
 * Technical article view with semantic typography, callouts, limitations, and tool integrations.
 */

import React, { useEffect } from 'react';
import { Link } from '../../router/Link';
import { useRouter } from '../../router/Router';
import { GUIDES } from '../../data/guidesData';
import { updateDocumentSEO } from '../../router/Router';
import {
  ChevronLeft,
  ArrowRight,
  Info,
  AlertTriangle,
  Lightbulb,
  ExternalLink,
  ShieldCheck,
  HelpCircle,
} from 'lucide-react';

interface GuideDetailPageProps {
  slug: string;
}

export function GuideDetailPage({ slug }: GuideDetailPageProps) {
  const { navigate } = useRouter();
  const guide = GUIDES.find((g) => g.slug === slug);

  useEffect(() => {
    if (guide) {
      updateDocumentSEO(`/guides/${slug}`, {
        title: `${guide.title} — PixelProof Guides`,
        description: guide.summary,
      });
    }
  }, [guide, slug]);

  if (!guide) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center space-y-4">
        <h1 className="text-2xl font-bold text-slate-900">Guide Not Found</h1>
        <p className="text-sm text-slate-600">
          The educational article you requested does not exist or has moved.
        </p>
        <Link
          to="/guides"
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white text-xs font-semibold rounded-lg"
        >
          <ChevronLeft className="w-4 h-4" /> Return to Guides Index
        </Link>
      </div>
    );
  }

  return (
    <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Breadcrumb & Navigation */}
      <div>
        <Link
          to="/guides"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-800 transition-colors mb-4"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
          <span>Back to All Guides</span>
        </Link>

        <div className="flex items-center gap-2 text-xs font-mono text-slate-400 mb-2">
          <span className="text-blue-700 bg-blue-50 px-2 py-0.5 rounded font-sans font-medium">
            {guide.category}
          </span>
          <span aria-hidden="true">·</span>
          <span>{guide.readTime}</span>
          <span aria-hidden="true">·</span>
          <span>Updated {guide.lastUpdated}</span>
        </div>

        <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight text-balance">
          {guide.title}
        </h1>

        <p className="mt-4 text-base text-slate-600 leading-relaxed pb-6 border-b border-slate-200">
          {guide.summary}
        </p>
      </div>

      {/* Main Content Sections */}
      <div className="space-y-8 text-slate-800 text-sm leading-relaxed">
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 leading-relaxed">
          {guide.content.introduction}
        </div>

        {guide.content.sections.map((sec, idx) => (
          <section key={idx} className="space-y-4">
            <h2 className="text-lg font-bold text-slate-900 tracking-tight pt-2">
              {sec.heading}
            </h2>

            {sec.body.map((p, pIdx) => (
              <p key={pIdx} className="text-slate-700 leading-relaxed">
                {p}
              </p>
            ))}

            {sec.callout && (
              <div
                className={`p-4 rounded-xl border flex items-start gap-3 my-4 ${
                  sec.callout.type === 'tip'
                    ? 'bg-blue-50 border-blue-200 text-blue-900'
                    : sec.callout.type === 'warning'
                    ? 'bg-amber-50 border-amber-200 text-amber-900'
                    : 'bg-slate-50 border-slate-200 text-slate-800'
                }`}
              >
                {sec.callout.type === 'tip' && (
                  <Lightbulb className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                )}
                {sec.callout.type === 'warning' && (
                  <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                )}
                {sec.callout.type === 'info' && (
                  <Info className="w-5 h-5 text-slate-600 shrink-0 mt-0.5" />
                )}
                <div className="text-xs leading-relaxed font-medium">
                  {sec.callout.text}
                </div>
              </div>
            )}
          </section>
        ))}
      </div>

      {/* Interactive Tool Callout */}
      <div className="p-6 bg-blue-50/70 border border-blue-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-mono uppercase text-blue-700 font-semibold tracking-wider">
            Hands-on Laboratory Tool
          </span>
          <h3 className="text-base font-bold text-slate-900 mt-0.5">
            Try the {guide.relatedToolName}
          </h3>
          <p className="text-xs text-slate-600 mt-1">
            Apply these principles immediately on your own images inside your browser.
          </p>
        </div>

        <Link
          to={guide.relatedToolUrl}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors whitespace-nowrap shadow-xs"
        >
          <span>Open {guide.relatedToolName}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Practical Limitations */}
      {guide.content.limitations.length > 0 && (
        <div className="p-5 bg-white border border-slate-200 rounded-xl space-y-3">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <Info className="w-4 h-4 text-slate-500" />
            Technical Limitations & Boundaries
          </h3>
          <ul className="list-disc list-inside text-xs text-slate-600 space-y-1.5 pl-1 leading-relaxed">
            {guide.content.limitations.map((lim, lIdx) => (
              <li key={lIdx}>{lim}</li>
            ))}
          </ul>
        </div>
      )}

      {/* FAQ */}
      {guide.content.faq.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-blue-600" />
            Frequently Asked Questions
          </h3>
          <div className="space-y-3">
            {guide.content.faq.map((item, fIdx) => (
              <div key={fIdx} className="p-4 bg-white border border-slate-200 rounded-xl text-xs space-y-1.5">
                <p className="font-bold text-slate-900">{item.question}</p>
                <p className="text-slate-600 leading-relaxed">{item.answer}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Footer Navigation */}
      <div className="pt-6 border-t border-slate-200 flex items-center justify-between">
        <Link
          to="/guides"
          className="text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1"
        >
          <ChevronLeft className="w-3.5 h-3.5" /> Back to Guides Directory
        </Link>
        <Link
          to="/"
          className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
        >
          PixelProof Lab Home <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </article>
  );
}
