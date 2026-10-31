import React from 'react';
import {
  Calendar,
  Clock,
  ShieldCheck,
  User,
  CheckCircle2,
  ExternalLink,
  BookOpen,
  FileCheck2,
} from 'lucide-react';

export interface ContributorProfile {
  name: string;
  role: string;
  avatar?: string;
  bio?: string;
  credentials?: string;
  affiliations?: string;
  emailOrContact?: string;
}

export interface ReviewerProfile {
  name: string;
  role: string;
  avatar?: string;
  reviewDate?: string;
}

interface ContributorProps {
  author: ContributorProfile;
  lastUpdated: string;
  publishedDate?: string;
  reviewer?: ReviewerProfile;
  variant?: 'compact' | 'full' | 'profile';
  status?: 'published' | 'placeholder' | 'under_review';
  onEdit?: () => void;
  className?: string;
}

export const Contributor: React.FC<ContributorProps> = ({
  author,
  lastUpdated,
  publishedDate,
  reviewer,
  variant = 'compact',
  status = 'published',
  onEdit,
  className = '',
}) => {
  const getStatusBadge = () => {
    switch (status) {
      case 'placeholder':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
            Editorial Placeholder
          </span>
        );
      case 'under_review':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-sky-500/20 border border-sky-500/40 text-sky-300">
            <FileCheck2 className="w-3 h-3 text-sky-400" />
            Peer Review Draft
          </span>
        );
      case 'published':
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300">
            <ShieldCheck className="w-3 h-3 text-emerald-400" />
            Human Authored
          </span>
        );
    }
  };

  // Compact variant for article cards in grid
  if (variant === 'compact') {
    return (
      <div className={`space-y-2 ${className}`}>
        <div className="flex items-center justify-between gap-2 text-[11px]">
          <div className="flex items-center gap-2 min-w-0">
            {author.avatar ? (
              <img
                src={author.avatar}
                alt={author.name}
                className="w-7 h-7 rounded-full object-cover border border-slate-700 shrink-0"
                loading="lazy"
              />
            ) : (
              <div className="w-7 h-7 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-semibold text-sky-400 shrink-0">
                {author.name.charAt(0) || <User className="w-3.5 h-3.5" />}
              </div>
            )}
            <div className="min-w-0">
              <div className="font-medium text-slate-200 truncate flex items-center gap-1">
                <span>{author.name}</span>
              </div>
              <div className="text-[10px] text-slate-400 truncate">
                {author.role}
              </div>
            </div>
          </div>

          {getStatusBadge()}
        </div>

        {/* Date Row: Last Updated */}
        <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1.5 border-t border-slate-800/60 font-mono">
          <div className="flex items-center gap-1 text-slate-300">
            <Calendar className="w-3 h-3 text-indigo-400 shrink-0" />
            <span>Updated: <strong className="text-slate-200 font-semibold">{lastUpdated}</strong></span>
          </div>
          {publishedDate && (
            <span className="text-slate-500 hidden sm:inline">
              Pub: {publishedDate}
            </span>
          )}
        </div>
      </div>
    );
  }

  // Full variant for article reader header and modal
  if (variant === 'full') {
    return (
      <div className={`p-4 sm:p-5 rounded-2xl bg-slate-850/90 border border-slate-800 space-y-3.5 ${className}`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div className="flex items-start sm:items-center gap-3.5">
            {author.avatar ? (
              <img
                src={author.avatar}
                alt={author.name}
                className="w-13 h-13 sm:w-14 sm:h-14 rounded-2xl object-cover border border-slate-700 shrink-0 shadow-md"
              />
            ) : (
              <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center text-lg font-bold text-sky-400 shrink-0">
                {author.name.charAt(0) || <User className="w-6 h-6" />}
              </div>
            )}
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h4 className="text-sm sm:text-base font-bold text-slate-100">
                  {author.name}
                </h4>
                {getStatusBadge()}
              </div>
              <p className="text-xs text-sky-300/90 font-medium mt-0.5">
                {author.role}
              </p>
              {author.credentials && (
                <p className="text-[11px] text-slate-400 mt-0.5">
                  {author.credentials}
                </p>
              )}
            </div>
          </div>

          {/* Dates & Revisions Badge */}
          <div className="flex flex-col sm:items-end text-xs text-slate-400 font-mono space-y-1 shrink-0 bg-slate-900/60 p-2.5 rounded-xl border border-slate-800/80">
            <div className="flex items-center gap-1.5 text-slate-200">
              <Calendar className="w-3.5 h-3.5 text-indigo-400" />
              <span>
                Last Updated: <strong className="text-white">{lastUpdated}</strong>
              </span>
            </div>
            {publishedDate && (
              <div className="text-[11px] text-slate-400">
                First Published: {publishedDate}
              </div>
            )}
          </div>
        </div>

        {/* Bio / Affiliations if available */}
        {author.bio && (
          <p className="text-xs text-slate-300 leading-relaxed italic bg-slate-900/40 p-3 rounded-xl border border-slate-800/50">
            &ldquo;{author.bio}&rdquo;
          </p>
        )}

        {/* Fact-Checked / Peer-Reviewed Byline */}
        {reviewer && (
          <div className="pt-2 flex items-center gap-2 text-xs text-emerald-400/90 font-medium">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>
              Reviewed &amp; Fact-Checked by <strong>{reviewer.name}</strong> ({reviewer.role})
              {reviewer.reviewDate && <span className="text-slate-400 font-mono ml-1">• {reviewer.reviewDate}</span>}
            </span>
          </div>
        )}
      </div>
    );
  }

  // Profile variant for author bio sidebar or directory
  return (
    <div className={`p-4 rounded-2xl bg-slate-900 border border-slate-800 text-center space-y-3 ${className}`}>
      {author.avatar ? (
        <img
          src={author.avatar}
          alt={author.name}
          className="w-16 h-16 rounded-full object-cover border-2 border-indigo-400/40 mx-auto shadow-md"
        />
      ) : (
        <div className="w-16 h-16 rounded-full bg-slate-800 border-2 border-slate-700 flex items-center justify-center text-xl font-bold text-sky-400 mx-auto">
          {author.name.charAt(0)}
        </div>
      )}
      <div>
        <h4 className="font-bold text-sm text-slate-100">{author.name}</h4>
        <p className="text-xs text-sky-300">{author.role}</p>
        {author.credentials && (
          <p className="text-[11px] text-slate-400 mt-1">{author.credentials}</p>
        )}
      </div>
      <div className="text-[10px] text-slate-400 font-mono flex items-center justify-center gap-1">
        <Calendar className="w-3 h-3 text-indigo-400" />
        <span>Updated: {lastUpdated}</span>
      </div>
    </div>
  );
};
