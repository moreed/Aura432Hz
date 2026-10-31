import React, { useState, useEffect } from 'react';
import { X, Check, ExternalLink, Sparkles, Eye, EyeOff, Zap, Plus, Trash2, Globe, Link2 } from 'lucide-react';
import { useSiteContent, updateSiteContent, bulkToggleAllSocialVisibility, CustomSocialLink } from '../services/siteContent';

export type SocialPlatform = 'facebook' | 'instagram' | 'tiktok' | 'youtube' | 'twitter' | 'telegram' | 'custom';

export interface SocialAccountsConfig {
  facebookUrl: string;
  instagramUrl: string;
  tiktokUrl: string;
  youtubeUrl?: string;
  twitterUrl?: string;
  telegramUrl?: string;
  socialHeadline?: string;
  socialSubtext?: string;
  customLinks?: CustomSocialLink[];
}

export const DEFAULT_SOCIAL_ACCOUNTS: SocialAccountsConfig = {
  facebookUrl: 'https://facebook.com',
  instagramUrl: 'https://instagram.com',
  tiktokUrl: 'https://tiktok.com',
  youtubeUrl: 'https://www.youtube.com/@Aura432Hz-d1g',
  twitterUrl: 'https://x.com',
  telegramUrl: '',
  customLinks: [],
};

interface SacredSocialIconProps {
  platform: SocialPlatform;
  href?: string;
  size?: number;
  label?: string;
  className?: string;
}

export const SacredSocialIcon: React.FC<SacredSocialIconProps> = ({
  platform,
  href,
  size = 40,
  label,
  className = '',
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const getPlatformMeta = () => {
    switch (platform) {
      case 'facebook':
        return {
          name: 'Facebook',
          defaultUrl: 'https://facebook.com',
          ariaLabel: 'Visit Aura 432 on Facebook',
        };
      case 'instagram':
        return {
          name: 'Instagram',
          defaultUrl: 'https://instagram.com',
          ariaLabel: 'Visit Aura 432 on Instagram',
        };
      case 'tiktok':
        return {
          name: 'TikTok',
          defaultUrl: 'https://tiktok.com',
          ariaLabel: 'Visit Aura 432 on TikTok',
        };
      case 'youtube':
        return {
          name: 'YouTube',
          defaultUrl: 'https://www.youtube.com/@Aura432Hz-d1g',
          ariaLabel: 'Visit Aura 432 on YouTube',
        };
      case 'twitter':
        return {
          name: 'X (Twitter)',
          defaultUrl: 'https://x.com',
          ariaLabel: 'Visit Aura 432 on X / Twitter',
        };
      case 'telegram':
        return {
          name: 'Telegram',
          defaultUrl: 'https://t.me',
          ariaLabel: 'Visit Aura 432 on Telegram',
        };
      case 'custom':
        return {
          name: 'Sanctuary Link',
          defaultUrl: 'https://aura432hz.com',
          ariaLabel: 'Visit Sanctuary Link',
        };
    }
  };

  const meta = getPlatformMeta();
  const effectiveHref = href && href.trim().length > 0 && href.trim() !== '#' ? href.trim() : meta.defaultUrl;

  return (
    <a
      href={effectiveHref}
      target="_blank"
      rel="noopener noreferrer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`group relative inline-flex items-center justify-center transition-all duration-300 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 rounded-full cursor-pointer ${className}`}
      aria-label={label || 'Sacred Community Channel'}
    >
      {/* SVG Icon matching FlatLogo sacred geometry aesthetic */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0 transition-all duration-300"
        style={{
          filter: isHovered
            ? 'drop-shadow(0 0 10px rgba(56, 189, 248, 0.6)) drop-shadow(0 0 18px rgba(129, 140, 248, 0.35))'
            : 'drop-shadow(0 1px 3px rgba(15, 23, 42, 0.6))',
          transform: isHovered ? 'scale(1.08)' : 'scale(1)',
        }}
      >
        <defs>
          <linearGradient id={`socialOuterGrad_${platform}`} x1="15%" y1="15%" x2="85%" y2="85%">
            <stop offset="0%" stopColor="#22d3ee" />
            <stop offset="40%" stopColor="#60a5fa" />
            <stop offset="70%" stopColor="#c084fc" />
            <stop offset="100%" stopColor="#fef08a" />
          </linearGradient>
          <linearGradient id={`socialInnerGrad_${platform}`} x1="10%" y1="20%" x2="90%" y2="80%">
            <stop offset="0%" stopColor="#38bdf8" />
            <stop offset="50%" stopColor="#a855f7" />
            <stop offset="100%" stopColor="#fde047" />
          </linearGradient>
        </defs>

        {/* Sacred Outer Grounding Disc (Matches FlatLogo.tsx) */}
        <circle
          cx="24"
          cy="24"
          r="22"
          className="fill-slate-900 transition-colors duration-300"
          stroke={isHovered ? `url(#socialOuterGrad_${platform})` : '#334155'}
          strokeWidth="1.6"
        />

        {/* Outer Sacred Harmonic Aura Ring (Matches FlatLogo.tsx) */}
        <circle
          cx="24"
          cy="24"
          r="19.2"
          stroke={`url(#socialInnerGrad_${platform})`}
          strokeWidth="1"
          strokeOpacity={isHovered ? '0.95' : '0.45'}
          className="transition-all duration-300"
        />

        {/* Lotus Base Sepals / Water Pad Leaves (Matches FlatLogo.tsx) */}
        <path
          d="M 24 34 C 17 36, 12 34, 11 31 C 15 31, 20 32, 24 34 Z"
          fill="#818cf8"
          fillOpacity={isHovered ? '0.35' : '0.2'}
          stroke="#818cf8"
          strokeWidth="0.9"
        />
        <path
          d="M 24 34 C 31 36, 36 34, 37 31 C 33 31, 28 32, 24 34 Z"
          fill="#818cf8"
          fillOpacity={isHovered ? '0.35' : '0.2'}
          stroke="#818cf8"
          strokeWidth="0.9"
        />

        {/* 432Hz Sound Wave Water Base Ripple (Matches FlatLogo.tsx) */}
        <path
          d="M 9 38 C 14 35, 19 41, 24 38 C 29 35, 34 41, 39 38"
          stroke="#38bdf8"
          strokeWidth="1.4"
          strokeLinecap="round"
          strokeOpacity={isHovered ? '0.95' : '0.7'}
        />

        {/* Crown Chakra Transcendence Node at top (Matches FlatLogo.tsx cx=24 cy=5.5 r=1.4) */}
        <circle
          cx="24"
          cy="5.5"
          r="1.4"
          fill={isHovered ? '#38bdf8' : '#818cf8'}
          className="transition-colors duration-300"
        />

        {/* ============================================================== */}
        {/* PLATFORM SPECIFIC SACRED GLYPH IN APP LOGO DESIGN STYLE        */}
        {/* ============================================================== */}

        {/* 1. FACEBOOK SACRED GLYPH */}
        {platform === 'facebook' && (
          <g className="transition-transform duration-300" style={{ transformOrigin: '24px 24px' }}>
            {/* Soft inner glow shield */}
            <circle
              cx="24"
              cy="23"
              r="12.5"
              fill="#818cf8"
              fillOpacity={isHovered ? '0.2' : '0.08'}
              stroke="#38bdf8"
              strokeWidth="0.75"
              strokeOpacity={isHovered ? '0.65' : '0.25'}
            />

            {/* Stylized Spiritual 'f' with Lotus Curvature */}
            <path
              d="M 26 30 V 23.5 H 28.8 L 29.3 20.2 H 26 V 18 C 26 17 26.3 16.4 27.6 16.4 H 29.3 V 13.5 C 28.9 13.4 27.7 13.3 26.3 13.3 C 23.5 13.3 21.6 15 21.6 18.2 V 20.2 H 18.8 V 23.5 H 21.6 V 30 Z"
              fill="#38bdf8"
              fillOpacity={isHovered ? '0.95' : '0.8'}
              stroke="#818cf8"
              strokeWidth="1.1"
              strokeLinejoin="round"
            />

            {/* Sacred Heart Bindu Jewel at the cross of 'f' */}
            <circle cx="21.6" cy="21.8" r="1.5" fill="#fef08a" />
            <circle cx="21.6" cy="21.8" r="0.75" fill="#ffffff" />
          </g>
        )}

        {/* 2. INSTAGRAM SACRED GLYPH */}
        {platform === 'instagram' && (
          <g className="transition-transform duration-300" style={{ transformOrigin: '24px 24px' }}>
            {/* Sacred Outer Squircle with Dual-Tone Gradient Outline */}
            <rect
              x="14.5"
              y="13.5"
              width="19"
              height="19"
              rx="5.5"
              fill="#818cf8"
              fillOpacity={isHovered ? '0.22' : '0.1'}
              stroke={isHovered ? '#38bdf8' : '#818cf8'}
              strokeWidth="1.3"
            />

            {/* Concentric Sacred Lens Bindu (Lotus Eye) */}
            <circle
              cx="24"
              cy="23"
              r="5.2"
              fill="#0f172a"
              fillOpacity="0.85"
              stroke="#38bdf8"
              strokeWidth="1.2"
            />
            <circle
              cx="24"
              cy="23"
              r="3.2"
              fill="#818cf8"
              fillOpacity={isHovered ? '0.5' : '0.3'}
              stroke="#38bdf8"
              strokeWidth="0.8"
            />
            <circle cx="24" cy="23" r="1.6" fill="#38bdf8" />
            <circle cx="24" cy="23" r="0.7" fill="#ffffff" />

            {/* Radiant Flash / Starlight Bindu */}
            <circle cx="29.4" cy="17.6" r="1.2" fill="#fef08a" />
          </g>
        )}

        {/* 3. TIKTOK SACRED GLYPH */}
        {platform === 'tiktok' && (
          <g className="transition-transform duration-300" style={{ transformOrigin: '24px 24px' }}>
            {/* Left Frequency Shadow (Violet/Indigo #818cf8 harmonic wave) */}
            <path
              d="M 26 13.5 C 27 15.8 28.9 17.6 31.2 18 V 20.6 C 29.2 20.6 27.5 19.6 26 18.5 V 25.5 C 26 28.5 23.5 31 20.5 31 C 17.5 31 15 28.5 15 25.5 C 15 22.5 17.5 20 20.5 20 C 21.1 20 21.7 20.1 22.2 20.3 V 22.8 C 21.7 22.5 21.1 22.4 20.5 22.4 C 18.8 22.4 17.4 23.8 17.4 25.5 C 17.4 27.2 18.8 28.6 20.5 28.6 C 22.2 28.6 23.6 27.2 23.6 25.5 V 13.5 Z"
              fill="#818cf8"
              fillOpacity={isHovered ? '0.45' : '0.28'}
              stroke="#818cf8"
              strokeWidth="0.85"
            />

            {/* Right Primary Frequency Note (Sky Blue #38bdf8 harmonic wave) */}
            <path
              d="M 27.5 14 C 28.5 16.3 30.4 18.1 32.7 18.5 V 21.1 C 20.7 21.1 29 20.1 27.5 19 V 26 C 27.5 29 25 31.5 22 31.5 C 19 31.5 16.5 29 16.5 26 C 16.5 23 19 20.5 22 20.5 C 22.6 20.5 23.2 20.6 23.7 20.8 V 23.3 C 23.2 23 22.6 22.9 22 22.9 C 20.3 22.9 18.9 24.3 18.9 26 C 18.9 27.7 20.3 29.1 22 29.1 C 23.7 29.1 25.1 27.7 25.1 26 V 14 Z"
              fill="#38bdf8"
              fillOpacity={isHovered ? '0.95' : '0.8'}
              stroke="#38bdf8"
              strokeWidth="1.1"
              strokeLinejoin="round"
            />

            {/* Sacred Heart Bindu on note head */}
            <circle cx="22" cy="26" r="1.5" fill="#fef08a" />
            <circle cx="22" cy="26" r="0.75" fill="#ffffff" />
          </g>
        )}

        {/* 4. YOUTUBE SACRED GLYPH */}
        {platform === 'youtube' && (
          <g className="transition-transform duration-300" style={{ transformOrigin: '24px 24px' }}>
            <rect
              x="13"
              y="16"
              width="22"
              height="15"
              rx="4.5"
              fill="#ef4444"
              fillOpacity={isHovered ? '0.35' : '0.18'}
              stroke="#ef4444"
              strokeWidth="1.2"
            />
            {/* Sacred Play Triangle */}
            <path
              d="M 22 19.8 L 27.5 23.5 L 22 27.2 Z"
              fill="#ffffff"
              stroke="#fef08a"
              strokeWidth="0.6"
            />
            <circle cx="27.5" cy="23.5" r="1" fill="#fef08a" />
          </g>
        )}

        {/* 5. TWITTER / X SACRED GLYPH */}
        {platform === 'twitter' && (
          <g className="transition-transform duration-300" style={{ transformOrigin: '24px 24px' }}>
            <circle
              cx="24"
              cy="23.5"
              r="10.5"
              fill="#818cf8"
              fillOpacity={isHovered ? '0.2' : '0.08'}
              stroke="#38bdf8"
              strokeWidth="0.8"
            />
            {/* Sacred Geometric X / Starlight Crossing */}
            <path
              d="M 18.5 17.5 L 29.5 29.5 M 29.5 17.5 L 18.5 29.5"
              stroke={isHovered ? '#38bdf8' : '#818cf8'}
              strokeWidth="1.8"
              strokeLinecap="round"
            />
            <circle cx="24" cy="23.5" r="1.5" fill="#fef08a" />
            <circle cx="24" cy="23.5" r="0.75" fill="#ffffff" />
          </g>
        )}

        {/* 6. TELEGRAM SACRED GLYPH */}
        {platform === 'telegram' && (
          <g className="transition-transform duration-300" style={{ transformOrigin: '24px 24px' }}>
            <circle
              cx="24"
              cy="23"
              r="11.5"
              fill="#0ea5e9"
              fillOpacity={isHovered ? '0.25' : '0.1'}
              stroke="#0ea5e9"
              strokeWidth="0.9"
            />
            {/* Paper Airplane Sacred Glyph */}
            <path
              d="M 16 23 L 31 16 L 27 30 L 22.5 25.5 L 20 28 L 19.5 24.5 Z"
              fill="#38bdf8"
              fillOpacity={isHovered ? '0.95' : '0.8'}
              stroke="#38bdf8"
              strokeWidth="0.8"
              strokeLinejoin="round"
            />
            <circle cx="22.5" cy="25.5" r="1.2" fill="#fef08a" />
          </g>
        )}

        {/* 7. CUSTOM SACRED GLYPH */}
        {platform === 'custom' && (
          <g className="transition-transform duration-300" style={{ transformOrigin: '24px 24px' }}>
            <circle
              cx="24"
              cy="23"
              r="11"
              fill="#8b5cf6"
              fillOpacity={isHovered ? '0.25' : '0.12'}
              stroke="#a78bfa"
              strokeWidth="0.9"
            />
            {/* Celestial Lotus Star / Linked Harmonics */}
            <path
              d="M 19 23 C 19 20.2 21.2 18 24 18 C 26.8 18 29 20.2 29 23 C 29 25.8 26.8 28 24 28 C 21.2 28 19 25.8 19 23 Z"
              stroke={isHovered ? '#fef08a' : '#c084fc'}
              strokeWidth="1.1"
            />
            <path
              d="M 24 15 L 24 31 M 16 23 L 32 23"
              stroke={isHovered ? '#38bdf8' : '#818cf8'}
              strokeWidth="0.8"
              strokeLinecap="round"
            />
            <circle cx="24" cy="23" r="1.6" fill="#fef08a" />
            <circle cx="24" cy="23" r="0.75" fill="#ffffff" />
          </g>
        )}
      </svg>
    </a>
  );
};

interface SocialAccountsModalProps {
  isOpen: boolean;
  onClose: () => void;
  accounts: SocialAccountsConfig;
  onSave: (accounts: SocialAccountsConfig) => void;
}

export const SocialAccountsModal: React.FC<SocialAccountsModalProps> = ({
  isOpen,
  onClose,
  accounts,
  onSave,
}) => {
  const siteContent = useSiteContent();
  const [formData, setFormData] = useState<SocialAccountsConfig>(accounts);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    setFormData(accounts);
  }, [accounts, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 700);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto overscroll-contain animate-in fade-in"
    >
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl sm:rounded-3xl w-full max-w-lg p-4 sm:p-6 landscape:p-4 shadow-2xl relative text-left max-h-[92dvh] landscape:max-h-[94dvh] overflow-y-auto overscroll-contain my-auto">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-200 p-1.5 rounded-xl hover:bg-slate-800 transition-colors"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-2.5 mb-2">
          <div className="w-8 h-8 rounded-xl bg-sky-500/15 border border-sky-400/30 flex items-center justify-center text-sky-400">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-100">
              Sacred Social Media Links (Admin)
            </h3>
            <p className="text-xs text-slate-400">
              Configure sanctuary social media accounts. Applies live to all visitors.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5 mt-4">
          {/* Quick Bulk Toggle Bar for Admin */}
          <div className="p-2.5 bg-slate-950/70 border border-slate-800 rounded-2xl flex items-center justify-between gap-2 text-xs">
            <span className="text-[11px] font-medium text-slate-300 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>Bulk Visibility (1-Action)</span>
            </span>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={async () => {
                  await bulkToggleAllSocialVisibility(true);
                  setSavedSuccess(true);
                  setTimeout(() => setSavedSuccess(false), 2000);
                }}
                className="px-2.5 py-1 rounded-lg text-[10px] font-semibold bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 transition-all flex items-center gap-1 cursor-pointer active:scale-95"
                title="Enable visibility for all social media icons across the sanctuary"
              >
                <Eye className="w-3 h-3" />
                <span>Show All</span>
              </button>
              <button
                type="button"
                onClick={async () => {
                  await bulkToggleAllSocialVisibility(false);
                  setSavedSuccess(true);
                  setTimeout(() => setSavedSuccess(false), 2000);
                }}
                className="px-2.5 py-1 rounded-lg text-[10px] font-semibold bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 transition-all flex items-center gap-1 cursor-pointer active:scale-95"
                title="Hide all social media icons across the sanctuary in 1 single action"
              >
                <EyeOff className="w-3 h-3" />
                <span>Hide All</span>
              </button>
            </div>
          </div>

          {/* Facebook */}
          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-sky-300 flex items-center gap-1.5">
                <span>Facebook</span>
              </label>
              <div className="flex items-center gap-2">
                <label className="flex items-center gap-1.5 cursor-pointer text-xs select-none">
                  <input
                    type="checkbox"
                    checked={Boolean(siteContent.socialVisibility?.facebook ?? true)}
                    onChange={async (e) => {
                      await updateSiteContent({
                        socialVisibility: {
                          ...siteContent.socialVisibility,
                          facebook: e.target.checked,
                        },
                      });
                    }}
                    className="w-3.5 h-3.5 rounded text-sky-500 bg-slate-900 border-slate-700 cursor-pointer accent-sky-400"
                  />
                  <span className={`text-[10px] font-semibold ${siteContent.socialVisibility?.facebook ?? true ? 'text-sky-300' : 'text-slate-500'}`}>
                    {siteContent.socialVisibility?.facebook ?? true ? 'Visible' : 'Hidden'}
                  </span>
                </label>
                {formData.facebookUrl && (
                  <a
                    href={formData.facebookUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[10px] text-sky-400 hover:underline flex items-center gap-0.5"
                  >
                    Test <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                )}
              </div>
            </div>
            <input
              type="text"
              value={formData.facebookUrl}
              onChange={(e) => setFormData({ ...formData, facebookUrl: e.target.value })}
              placeholder="https://facebook.com/your-sanctuary"
              className="w-full bg-slate-900/80 border border-slate-750 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-sky-400 font-mono"
            />
          </div>

          {/* Instagram */}
          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-rose-300 flex items-center gap-1.5">
                <span>Instagram</span>
              </label>
              <div className="flex items-center gap-2">
                <label className="flex items-center gap-1.5 cursor-pointer text-xs select-none">
                  <input
                    type="checkbox"
                    checked={Boolean(siteContent.socialVisibility?.instagram ?? true)}
                    onChange={async (e) => {
                      await updateSiteContent({
                        socialVisibility: {
                          ...siteContent.socialVisibility,
                          instagram: e.target.checked,
                        },
                      });
                    }}
                    className="w-3.5 h-3.5 rounded text-rose-500 bg-slate-900 border-slate-700 cursor-pointer accent-rose-400"
                  />
                  <span className={`text-[10px] font-semibold ${siteContent.socialVisibility?.instagram ?? true ? 'text-rose-300' : 'text-slate-500'}`}>
                    {siteContent.socialVisibility?.instagram ?? true ? 'Visible' : 'Hidden'}
                  </span>
                </label>
                {formData.instagramUrl && (
                  <a
                    href={formData.instagramUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[10px] text-rose-400 hover:underline flex items-center gap-0.5"
                  >
                    Test <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                )}
              </div>
            </div>
            <input
              type="text"
              value={formData.instagramUrl}
              onChange={(e) => setFormData({ ...formData, instagramUrl: e.target.value })}
              placeholder="https://instagram.com/your-sanctuary"
              className="w-full bg-slate-900/80 border border-slate-750 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-rose-400 font-mono"
            />
          </div>

          {/* TikTok */}
          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-teal-300 flex items-center gap-1.5">
                <span>TikTok</span>
              </label>
              <div className="flex items-center gap-2">
                <label className="flex items-center gap-1.5 cursor-pointer text-xs select-none">
                  <input
                    type="checkbox"
                    checked={Boolean(siteContent.socialVisibility?.tiktok ?? true)}
                    onChange={async (e) => {
                      await updateSiteContent({
                        socialVisibility: {
                          ...siteContent.socialVisibility,
                          tiktok: e.target.checked,
                        },
                      });
                    }}
                    className="w-3.5 h-3.5 rounded text-teal-500 bg-slate-900 border-slate-700 cursor-pointer accent-teal-400"
                  />
                  <span className={`text-[10px] font-semibold ${siteContent.socialVisibility?.tiktok ?? true ? 'text-teal-300' : 'text-slate-500'}`}>
                    {siteContent.socialVisibility?.tiktok ?? true ? 'Visible' : 'Hidden'}
                  </span>
                </label>
                {formData.tiktokUrl && (
                  <a
                    href={formData.tiktokUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[10px] text-teal-400 hover:underline flex items-center gap-0.5"
                  >
                    Test <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                )}
              </div>
            </div>
            <input
              type="text"
              value={formData.tiktokUrl}
              onChange={(e) => setFormData({ ...formData, tiktokUrl: e.target.value })}
              placeholder="https://tiktok.com/@your-sanctuary"
              className="w-full bg-slate-900/80 border border-slate-750 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-teal-400 font-mono"
            />
          </div>

          {/* YouTube */}
          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-rose-400 flex items-center gap-1.5">
                <span>YouTube Channel</span>
              </label>
              <div className="flex items-center gap-2">
                <label className="flex items-center gap-1.5 cursor-pointer text-xs select-none">
                  <input
                    type="checkbox"
                    checked={Boolean(siteContent.socialVisibility?.youtube ?? true)}
                    onChange={async (e) => {
                      await updateSiteContent({
                        socialVisibility: {
                          ...siteContent.socialVisibility,
                          youtube: e.target.checked,
                        },
                      });
                    }}
                    className="w-3.5 h-3.5 rounded text-rose-500 bg-slate-900 border-slate-700 cursor-pointer accent-rose-400"
                  />
                  <span className={`text-[10px] font-semibold ${siteContent.socialVisibility?.youtube ?? true ? 'text-rose-300' : 'text-slate-500'}`}>
                    {siteContent.socialVisibility?.youtube ?? true ? 'Visible' : 'Hidden'}
                  </span>
                </label>
                {formData.youtubeUrl && (
                  <a
                    href={formData.youtubeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[10px] text-rose-400 hover:underline flex items-center gap-0.5"
                  >
                    Test <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                )}
              </div>
            </div>
            <input
              type="text"
              value={formData.youtubeUrl || ''}
              onChange={(e) => setFormData({ ...formData, youtubeUrl: e.target.value })}
              placeholder="https://www.youtube.com/@Aura432Hz-d1g"
              className="w-full bg-slate-900/80 border border-slate-750 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-rose-400 font-mono"
            />
          </div>

          {/* Twitter / X */}
          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-indigo-300 flex items-center gap-1.5">
                <span>Twitter / X</span>
              </label>
              <div className="flex items-center gap-2">
                <label className="flex items-center gap-1.5 cursor-pointer text-xs select-none">
                  <input
                    type="checkbox"
                    checked={Boolean(siteContent.socialVisibility?.twitter ?? true)}
                    onChange={async (e) => {
                      await updateSiteContent({
                        socialVisibility: {
                          ...siteContent.socialVisibility,
                          twitter: e.target.checked,
                        },
                      });
                    }}
                    className="w-3.5 h-3.5 rounded text-indigo-500 bg-slate-900 border-slate-700 cursor-pointer accent-indigo-400"
                  />
                  <span className={`text-[10px] font-semibold ${siteContent.socialVisibility?.twitter ?? true ? 'text-indigo-300' : 'text-slate-500'}`}>
                    {siteContent.socialVisibility?.twitter ?? true ? 'Visible' : 'Hidden'}
                  </span>
                </label>
                {formData.twitterUrl && (
                  <a
                    href={formData.twitterUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[10px] text-indigo-400 hover:underline flex items-center gap-0.5"
                  >
                    Test <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                )}
              </div>
            </div>
            <input
              type="text"
              value={formData.twitterUrl || ''}
              onChange={(e) => setFormData({ ...formData, twitterUrl: e.target.value })}
              placeholder="https://x.com/your-sanctuary"
              className="w-full bg-slate-900/80 border border-slate-750 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-400 font-mono"
            />
          </div>

          {/* Telegram */}
          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-sky-400 flex items-center gap-1.5">
                <span>Telegram</span>
              </label>
              <div className="flex items-center gap-2">
                <label className="flex items-center gap-1.5 cursor-pointer text-xs select-none">
                  <input
                    type="checkbox"
                    checked={Boolean(siteContent.socialVisibility?.telegram ?? true)}
                    onChange={async (e) => {
                      await updateSiteContent({
                        socialVisibility: {
                          ...siteContent.socialVisibility,
                          telegram: e.target.checked,
                        },
                      });
                    }}
                    className="w-3.5 h-3.5 rounded text-sky-500 bg-slate-900 border-slate-700 cursor-pointer accent-sky-400"
                  />
                  <span className={`text-[10px] font-semibold ${siteContent.socialVisibility?.telegram ?? true ? 'text-sky-300' : 'text-slate-500'}`}>
                    {siteContent.socialVisibility?.telegram ?? true ? 'Visible' : 'Hidden'}
                  </span>
                </label>
                {formData.telegramUrl && (
                  <a
                    href={formData.telegramUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[10px] text-sky-400 hover:underline flex items-center gap-0.5"
                  >
                    Test <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                )}
              </div>
            </div>
            <input
              type="text"
              value={formData.telegramUrl || ''}
              onChange={(e) => setFormData({ ...formData, telegramUrl: e.target.value })}
              placeholder="https://t.me/your-sanctuary"
              className="w-full bg-slate-900/80 border border-slate-750 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-sky-400 font-mono"
            />
          </div>

          {/* Custom Sanctuary Channels & Links */}
          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Link2 className="w-4 h-4 text-purple-400" />
                <span className="text-xs font-semibold text-purple-200">Custom Sanctuary Channels & Links</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  const newLinks: CustomSocialLink[] = [
                    ...(formData.customLinks || []),
                    {
                      id: 'custom_' + Date.now(),
                      label: '',
                      url: '',
                      visible: true,
                    },
                  ];
                  setFormData({ ...formData, customLinks: newLinks });
                }}
                className="px-2.5 py-1 rounded-lg text-[10px] font-semibold bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/40 transition-all flex items-center gap-1 cursor-pointer active:scale-95"
              >
                <Plus className="w-3 h-3" />
                <span>Add Custom Link</span>
              </button>
            </div>

            {(!formData.customLinks || formData.customLinks.length === 0) ? (
              <p className="text-[11px] text-slate-500 italic">No custom channels added yet. Add Spotify, SoundCloud, Bandcamp, or custom URLs above.</p>
            ) : (
              <div className="space-y-2.5">
                {formData.customLinks.map((link, idx) => (
                  <div key={link.id || idx} className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <input
                        type="text"
                        value={link.label}
                        onChange={(e) => {
                          const updated = [...(formData.customLinks || [])];
                          updated[idx] = { ...updated[idx], label: e.target.value };
                          setFormData({ ...formData, customLinks: updated });
                        }}
                        placeholder="Channel Name (e.g. Spotify, SoundCloud)"
                        className="w-1/2 bg-slate-950 border border-slate-750 rounded-lg px-2.5 py-1 text-xs text-slate-200 focus:outline-none focus:border-purple-400 font-medium"
                      />
                      <div className="flex items-center gap-2">
                        <label className="flex items-center gap-1 cursor-pointer text-xs select-none">
                          <input
                            type="checkbox"
                            checked={link.visible !== false}
                            onChange={(e) => {
                              const updated = [...(formData.customLinks || [])];
                              updated[idx] = { ...updated[idx], visible: e.target.checked };
                              setFormData({ ...formData, customLinks: updated });
                            }}
                            className="w-3.5 h-3.5 rounded text-purple-500 bg-slate-900 border-slate-750 cursor-pointer accent-purple-400"
                          />
                          <span className={`text-[10px] font-semibold ${link.visible !== false ? 'text-purple-300' : 'text-slate-500'}`}>
                            {link.visible !== false ? 'Visible' : 'Hidden'}
                          </span>
                        </label>
                        {link.url && (
                          <a
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[10px] text-purple-400 hover:underline flex items-center gap-0.5"
                          >
                            Test <ExternalLink className="w-2.5 h-2.5" />
                          </a>
                        )}
                        <button
                          type="button"
                          onClick={() => {
                            const updated = (formData.customLinks || []).filter((_, i) => i !== idx);
                            setFormData({ ...formData, customLinks: updated });
                          }}
                          className="p-1 text-slate-500 hover:text-rose-400 transition-colors cursor-pointer"
                          title="Remove custom link"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                    <input
                      type="url"
                      value={link.url}
                      onChange={(e) => {
                        const updated = [...(formData.customLinks || [])];
                        updated[idx] = { ...updated[idx], url: e.target.value };
                        setFormData({ ...formData, customLinks: updated });
                      }}
                      placeholder="https://..."
                      className="w-full bg-slate-950 border border-slate-750 rounded-lg px-2.5 py-1 text-xs text-slate-200 focus:outline-none focus:border-purple-400 font-mono"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="pt-2 flex items-center justify-end gap-2.5 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs text-slate-400 hover:text-slate-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-gradient-to-r from-sky-400 to-indigo-500 hover:from-sky-300 hover:to-indigo-400 text-slate-950 font-semibold text-xs rounded-xl transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
            >
              {savedSuccess ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Published Live!</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Save Social Links</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export interface SacredSocialLinksProps {
  facebookUrl?: string;
  instagramUrl?: string;
  tiktokUrl?: string;
  youtubeUrl?: string;
  twitterUrl?: string;
  telegramUrl?: string;
  customLinks?: CustomSocialLink[];
  className?: string;
  showLabels?: boolean;
  headline?: string;
  size?: number;
  isAdmin?: boolean;
  onOpenAdminLogin?: () => void;
}

export const SacredSocialLinks: React.FC<SacredSocialLinksProps> = ({
  facebookUrl: propFacebookUrl,
  instagramUrl: propInstagramUrl,
  tiktokUrl: propTiktokUrl,
  youtubeUrl: propYoutubeUrl,
  twitterUrl: propTwitterUrl,
  telegramUrl: propTelegramUrl,
  customLinks: propCustomLinks,
  className = '',
  showLabels = false,
  headline,
  size = 40,
  isAdmin = false,
  onOpenAdminLogin,
}) => {
  const siteContent = useSiteContent();

  const visibility = siteContent.socialVisibility || {
    facebook: true,
    instagram: true,
    tiktok: true,
    youtube: true,
    twitter: true,
    telegram: false,
  };
  const sectionEnabled = siteContent.flags ? siteContent.flags.socialSection !== false : true;

  const activeAccounts: SocialAccountsConfig = {
    facebookUrl: propFacebookUrl !== undefined ? propFacebookUrl : (siteContent.social.facebookUrl || 'https://facebook.com'),
    instagramUrl: propInstagramUrl !== undefined ? propInstagramUrl : (siteContent.social.instagramUrl || 'https://instagram.com'),
    tiktokUrl: propTiktokUrl !== undefined ? propTiktokUrl : (siteContent.social.tiktokUrl || 'https://tiktok.com'),
    youtubeUrl: propYoutubeUrl !== undefined ? propYoutubeUrl : (siteContent.social.youtubeUrl || 'https://www.youtube.com/@Aura432Hz-d1g'),
    twitterUrl: propTwitterUrl !== undefined ? propTwitterUrl : (siteContent.social.twitterUrl || 'https://x.com'),
    telegramUrl: propTelegramUrl !== undefined ? propTelegramUrl : (siteContent.social.telegramUrl || ''),
    socialHeadline: headline || siteContent.social.socialHeadline,
    socialSubtext: siteContent.social.socialSubtext,
    customLinks: propCustomLinks !== undefined ? propCustomLinks : (siteContent.social.customLinks || []),
  };

  // If social section flag is disabled and not admin, hide entirely
  if (!sectionEnabled && !isAdmin) {
    return null;
  }

  const anyVisible =
    visibility.facebook ||
    visibility.instagram ||
    visibility.tiktok ||
    (visibility.youtube && Boolean(activeAccounts.youtubeUrl)) ||
    (visibility.twitter && Boolean(activeAccounts.twitterUrl)) ||
    (visibility.telegram && Boolean(activeAccounts.telegramUrl)) ||
    (Boolean(activeAccounts.customLinks && activeAccounts.customLinks.some(l => l.visible !== false && l.url)));

  if (!anyVisible && !isAdmin) {
    return null;
  }

  return (
    <div className={`inline-flex flex-col items-center gap-1.5 select-none ${className}`}>
      {/* Interactive Social Media Icons Styled as FlatLogo Sacred Lotus */}
      <div className="flex items-center gap-2.5 sm:gap-3.5 flex-wrap justify-center">
        {visibility.facebook && (
          <SacredSocialIcon
            platform="facebook"
            href={activeAccounts.facebookUrl}
            size={size}
            label="Aura 432Hz Sanctuary on Facebook"
          />
        )}
        {visibility.instagram && (
          <SacredSocialIcon
            platform="instagram"
            href={activeAccounts.instagramUrl}
            size={size}
            label="Aura 432Hz Sanctuary on Instagram"
          />
        )}
        {visibility.tiktok && (
          <SacredSocialIcon
            platform="tiktok"
            href={activeAccounts.tiktokUrl}
            size={size}
            label="Aura 432Hz Sanctuary on TikTok"
          />
        )}
        {visibility.youtube && activeAccounts.youtubeUrl && (
          <SacredSocialIcon
            platform="youtube"
            href={activeAccounts.youtubeUrl}
            size={size}
            label="Aura 432Hz Sanctuary on YouTube"
          />
        )}
        {visibility.twitter && activeAccounts.twitterUrl && (
          <SacredSocialIcon
            platform="twitter"
            href={activeAccounts.twitterUrl}
            size={size}
            label="Aura 432Hz Sanctuary on X / Twitter"
          />
        )}
        {visibility.telegram && activeAccounts.telegramUrl && (
          <SacredSocialIcon
            platform="telegram"
            href={activeAccounts.telegramUrl}
            size={size}
            label="Aura 432Hz Sanctuary on Telegram"
          />
        )}
        {activeAccounts.customLinks?.filter(l => l.visible !== false && l.url).map((link) => (
          <SacredSocialIcon
            key={link.id}
            platform="custom"
            href={link.url}
            size={size}
            label={link.label || 'Aura 432Hz Sacred Link'}
          />
        ))}

        {!anyVisible && isAdmin && (
          <span className="text-[10px] text-amber-300/80 bg-amber-950/40 border border-amber-500/30 px-2.5 py-0.5 rounded-full font-mono">
            All Socials Hidden (Admin Mode)
          </span>
        )}

      </div>

      {showLabels && (
        <span className="text-[11px] text-slate-400 font-medium">
          {activeAccounts.socialHeadline || 'Connect with the Global Sacred Community'}
        </span>
      )}
    </div>
  );
};
