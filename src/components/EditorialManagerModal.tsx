import React from 'react';
import { X, Sparkles, BookOpen } from 'lucide-react';
import { EditorialArticle } from '../services/editorialStorage';
import { EditorialManager } from './EditorialManager';

interface EditorialManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  articles?: EditorialArticle[];
  onSelectArticleForReading?: (article: EditorialArticle) => void;
  initialEditArticleId?: string | null;
  onOpenAdminLogin?: () => void;
}

export const EditorialManagerModal: React.FC<EditorialManagerModalProps> = ({
  isOpen,
  onClose,
  onSelectArticleForReading,
  initialEditArticleId,
}) => {
  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[90] flex items-center justify-center p-2.5 sm:p-5 bg-slate-950/85 backdrop-blur-md overflow-y-auto overscroll-contain animate-in fade-in duration-200"
    >
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl sm:rounded-3xl max-w-5xl w-full max-h-[92dvh] landscape:max-h-[94dvh] flex flex-col shadow-2xl overflow-hidden relative my-auto">
        {/* Modal Top Header Bar */}
        <div className="p-3.5 sm:p-5 landscape:py-2.5 landscape:px-4 border-b border-slate-800 bg-slate-900/95 sticky top-0 z-20 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4 text-indigo-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-bold text-slate-100">
                  Science &amp; Blog Article Desk &amp; Link Auto-Fetcher
                </h3>
                <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 hidden sm:inline">
                  Research Publishing Tool
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Auto-fetch scholarly metadata from PubMed / Nature or author human research articles with citations.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-100 transition-colors shrink-0 cursor-pointer"
            title="Close Article Tool"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body: Embedded Editorial Manager */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6">
          <EditorialManager
            initialEditArticleId={initialEditArticleId}
            onArticleSaved={(article) => {
              if (onSelectArticleForReading) {
                onSelectArticleForReading(article);
              }
            }}
          />
        </div>
      </div>
    </div>
  );
};
