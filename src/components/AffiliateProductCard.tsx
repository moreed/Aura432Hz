import React from 'react';
import {
  ExternalLink,
  Check,
  AlertCircle,
  ShieldCheck,
  Clock,
  Sparkles,
  Info,
  DollarSign,
  Tag,
  Edit3,
  Trash2,
} from 'lucide-react';
import { MONETIZATION_CONFIG } from '../config/monetization';
import { analytics } from '../services/analytics';

export interface RetailerOption {
  sellerName: string;
  priceEstimate: string;
  url: string;
  isPrimary?: boolean;
}

export interface CuratedAffiliateProduct {
  id: string;
  name: string;
  brand: string;
  category:
    | 'headphones_ambient'
    | 'earbuds_sleep'
    | 'speakers_corner'
    | 'wired_vs_bluetooth'
    | 'acoustic_tools'
    | 'volume_guide';
  priceBand: '$' | '$$' | '$$$' | '$$$$';
  priceDisplay: string;
  lastCheckedDate: string;
  availabilityCaveat: string;
  imageUrl?: string;
  whyItFits: string;
  strengths: string[];
  limitations: string[];
  specifications: { label: string; value: string }[];
  retailers: RetailerOption[];
  editorialTestedBy?: string;
  personalPreferenceNote?: string;
}

interface AffiliateProductCardProps {
  product: CuratedAffiliateProduct;
  onPlaySoundDemo?: (type: string) => void;
  onEdit?: (product: CuratedAffiliateProduct) => void;
  onDelete?: (productId: string) => void;
}

export const AffiliateProductCard: React.FC<AffiliateProductCardProps> = ({
  product,
  onPlaySoundDemo,
  onEdit,
  onDelete,
}) => {
  const handleRetailerClick = (sellerName: string) => {
    analytics.track('affiliate_clicked', {
      productId: product.id,
      partner: sellerName,
    });
  };

  return (
    <article
      className="bg-slate-900/70 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl flex flex-col justify-between transition-all hover:border-slate-700/80 group space-y-4"
      aria-label={`Product review: ${product.name}`}
    >
      {/* Top Meta Bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between gap-2 flex-wrap text-[11px] text-slate-400">
          <span className="font-mono px-2 py-0.5 rounded-md bg-slate-950/80 border border-slate-800 text-sky-300">
            {product.brand}
          </span>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-slate-400 flex items-center gap-1">
              <Clock className="w-3 h-3 text-slate-400" />
              Verified {product.lastCheckedDate}
            </span>
            <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 font-mono text-[10px] border border-amber-500/20">
              {product.priceBand} {product.priceDisplay}
            </span>
            {onEdit && (
              <button
                type="button"
                onClick={() => onEdit(product)}
                className="p-1 rounded-md text-slate-400 hover:text-amber-300 hover:bg-slate-800 transition-colors cursor-pointer"
                title={`Edit ${product.name}`}
                aria-label={`Edit ${product.name}`}
              >
                <Edit3 className="w-3.5 h-3.5" />
              </button>
            )}
            {onDelete && (
              <button
                type="button"
                onClick={() => onDelete(product.id)}
                className="p-1 rounded-md text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors cursor-pointer"
                title={`Delete ${product.name}`}
                aria-label={`Delete ${product.name}`}
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        <h3 className="text-base sm:text-lg font-bold text-slate-100 group-hover:text-sky-300 transition-colors">
          {product.name}
        </h3>

        <div className="text-[11px] text-slate-400 italic">
          Availability notice: {product.availabilityCaveat}
        </div>
      </div>

      {/* Why It May Fit This Use */}
      <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-850 space-y-1.5">
        <div className="text-[11px] font-semibold text-slate-300 flex items-center gap-1.5 uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5 text-sky-400" />
          <span>Why It Fits This Soundscape Use:</span>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">
          {product.whyItFits}
        </p>
      </div>

      {/* Measurable Specifications */}
      {product.specifications.length > 0 && (
        <div className="grid grid-cols-2 gap-2 text-[11px] py-1 border-y border-slate-800/80">
          {product.specifications.map((spec) => (
            <div key={spec.label} className="truncate">
              <span className="text-slate-400">{spec.label}: </span>
              <span className="text-slate-200 font-medium">{spec.value}</span>
            </div>
          ))}
        </div>
      )}

      {/* Strengths & Limitations Grid (Evidence-based & Balanced) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
        {/* Strengths */}
        <div className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-500/20 space-y-1.5">
          <div className="text-[11px] font-semibold text-emerald-400 flex items-center gap-1">
            <Check className="w-3.5 h-3.5" /> Strengths
          </div>
          <ul className="space-y-1 text-slate-300 text-[11px]">
            {product.strengths.map((str, idx) => (
              <li key={idx} className="flex items-start gap-1.5 leading-snug">
                <span className="text-emerald-400 text-xs shrink-0">•</span>
                <span>{str}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Limitations (Honest Trade-offs) */}
        <div className="p-3 rounded-xl bg-amber-950/20 border border-amber-500/20 space-y-1.5">
          <div className="text-[11px] font-semibold text-amber-400 flex items-center gap-1">
            <AlertCircle className="w-3.5 h-3.5" /> Limitations
          </div>
          <ul className="space-y-1 text-slate-300 text-[11px]">
            {product.limitations.map((lim, idx) => (
              <li key={idx} className="flex items-start gap-1.5 leading-snug">
                <span className="text-amber-400 text-xs shrink-0">•</span>
                <span>{lim}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Editorial Tester Note */}
      {product.personalPreferenceNote && (
        <div className="text-[11px] text-slate-400 bg-slate-950/40 p-2.5 rounded-xl border border-slate-800/60">
          <strong className="text-slate-300">Editorial Note:</strong> {product.personalPreferenceNote}
        </div>
      )}

      {/* Retailers CTAs & Direct Affiliate Disclosure */}
      <div className="pt-2 border-t border-slate-800/80 space-y-2.5">
        <div className="text-[10px] text-slate-400 leading-tight">
          {MONETIZATION_CONFIG.affiliateDisclosure.compact}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {product.retailers.map((retailer) => (
            <a
              key={retailer.sellerName}
              href={retailer.url}
              target="_blank"
              rel="sponsored noopener noreferrer"
              onClick={() => handleRetailerClick(retailer.sellerName)}
              className={`flex-1 min-w-[140px] px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-between gap-2 transition-all active:scale-95 cursor-pointer ${
                retailer.isPrimary
                  ? 'bg-sky-500 hover:bg-sky-400 text-slate-950 shadow-md shadow-sky-500/20'
                  : 'bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700'
              }`}
            >
              <span>View on {retailer.sellerName}</span>
              <div className="flex items-center gap-1">
                <span className="font-mono text-[10px] opacity-80">{retailer.priceEstimate}</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </div>
            </a>
          ))}
        </div>
      </div>
    </article>
  );
};
