import React, { useState, useEffect } from 'react';
import {
  Globe,
  Save,
  RotateCcw,
  Check,
  ExternalLink,
  Sparkles,
  Megaphone,
  Type,
  Mail,
  Radio,
  Layers,
  Info,
  Zap,
  Eye,
  EyeOff,
  Sliders,
  CheckCircle2,
  AlertCircle,
  Moon,
  ArrowRightLeft,
  CheckSquare,
  Square,
  ShieldAlert,
} from 'lucide-react';
import {
  SiteContentConfig,
  SocialVisibilityConfig,
  SiteFlagsConfig,
  fetchSiteContent,
  updateSiteContent,
  resetSiteContent,
  bulkToggleAllSocialVisibility,
  bulkResetSiteFlags,
  bulkUpdateContentFlags,
  DEFAULT_SITE_CONTENT,
  DEFAULT_SOCIAL_VISIBILITY,
  DEFAULT_SITE_FLAGS,
} from '../services/siteContent';
import { SacredSocialIcon } from './SacredSocialIcons';
import { UnderConstructionEditor } from './UnderConstructionEditor';

interface SiteContentCustomizerProps {
  adminEmail?: string;
  onSavedNotification?: (msg: string) => void;
  initialSection?: 'socials' | 'hero' | 'branding' | 'bulk' | 'construction';
  onOpenFullscreenPreview?: () => void;
}

export const SiteContentCustomizer: React.FC<SiteContentCustomizerProps> = ({
  adminEmail = 'moreed.raouf@gmail.com',
  onSavedNotification,
  initialSection = 'socials',
  onOpenFullscreenPreview,
}) => {
  const [formData, setFormData] = useState<SiteContentConfig>(DEFAULT_SITE_CONTENT);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<'socials' | 'hero' | 'branding' | 'bulk' | 'construction'>(initialSection);

  useEffect(() => {
    loadContent();
  }, []);

  const loadContent = async () => {
    setLoading(true);
    try {
      const data = await fetchSiteContent();
      setFormData(data);
    } catch (e) {
      console.error('Failed to load site content', e);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSaving(true);
    setSaveSuccess(null);
    try {
      await updateSiteContent(formData, adminEmail);
      setSaveSuccess('Live site content & social links published successfully!');
      if (onSavedNotification) {
        onSavedNotification('Live site content & social links updated in real-time!');
      }
      setTimeout(() => setSaveSuccess(null), 4000);
    } catch (err) {
      console.error('Error saving content:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    if (
      window.confirm(
        'Are you sure you want to reset all sanctuary site texts and social links back to defaults?'
      )
    ) {
      setSaving(true);
      try {
        const reset = await resetSiteContent(adminEmail);
        setFormData(reset);
        setSaveSuccess('Sanctuary site content reset to defaults.');
        setTimeout(() => setSaveSuccess(null), 3000);
      } finally {
        setSaving(false);
      }
    }
  };

  // ==============================================================
  // BULK ACTIONS (Single-Action Operations)
  // ==============================================================

  /**
   * Bulk Toggle All Social Links Visibility in a Single Action
   */
  const handleBulkToggleSocials = async (visible: boolean) => {
    setSaving(true);
    setSaveSuccess(null);
    try {
      const updated = await bulkToggleAllSocialVisibility(visible, adminEmail);
      setFormData(updated);
      const msg = visible
        ? 'Single Action Applied: Enabled visibility for all 6 social media platforms!'
        : 'Single Action Applied: Disabled visibility for all social media platforms!';
      setSaveSuccess(msg);
      if (onSavedNotification) onSavedNotification(msg);
      setTimeout(() => setSaveSuccess(null), 4000);
    } catch (e) {
      console.error('Failed bulk toggling socials', e);
    } finally {
      setSaving(false);
    }
  };

  /**
   * Invert Current Social Visibility in a Single Action
   */
  const handleInvertSocials = async () => {
    setSaving(true);
    setSaveSuccess(null);
    try {
      const currentVis = formData.socialVisibility || DEFAULT_SOCIAL_VISIBILITY;
      const inverted: SocialVisibilityConfig = {
        facebook: !currentVis.facebook,
        instagram: !currentVis.instagram,
        tiktok: !currentVis.tiktok,
        youtube: !currentVis.youtube,
        twitter: !currentVis.twitter,
        telegram: !currentVis.telegram,
      };
      const updated = await updateSiteContent({ socialVisibility: inverted }, adminEmail);
      setFormData(updated);
      const msg = 'Single Action Applied: Inverted visibility states across all social links!';
      setSaveSuccess(msg);
      if (onSavedNotification) onSavedNotification(msg);
      setTimeout(() => setSaveSuccess(null), 4000);
    } catch (e) {
      console.error('Failed inverting socials', e);
    } finally {
      setSaving(false);
    }
  };

  /**
   * Reset Site-Wide Content Flags in a Single Action
   */
  const handleBulkResetSiteFlags = async () => {
    setSaving(true);
    setSaveSuccess(null);
    try {
      const updated = await bulkResetSiteFlags(adminEmail);
      setFormData(updated);
      const msg = 'Single Action Applied: All site-wide content flags & social visibility reset to standard defaults!';
      setSaveSuccess(msg);
      if (onSavedNotification) onSavedNotification(msg);
      setTimeout(() => setSaveSuccess(null), 4000);
    } catch (e) {
      console.error('Failed resetting site flags', e);
    } finally {
      setSaving(false);
    }
  };

  /**
   * Enable All Site Flags in a Single Action
   */
  const handleBulkEnableAllFlags = async () => {
    setSaving(true);
    setSaveSuccess(null);
    try {
      const allEnabled: SiteFlagsConfig = {
        announcementBar: true,
        dailyAffirmation: true,
        socialSection: true,
        offlineDownloadsEnabled: true,
        communityFeaturesEnabled: true,
      };
      const updated = await bulkUpdateContentFlags(allEnabled, adminEmail);
      setFormData(updated);
      const msg = 'Single Action Applied: Enabled all 5 site-wide content flags (Full Experience)!';
      setSaveSuccess(msg);
      if (onSavedNotification) onSavedNotification(msg);
      setTimeout(() => setSaveSuccess(null), 4000);
    } catch (e) {
      console.error('Failed enabling all flags', e);
    } finally {
      setSaving(false);
    }
  };

  /**
   * Minimal Zen Silence Mode in a Single Action
   */
  const handleBulkZenMode = async () => {
    setSaving(true);
    setSaveSuccess(null);
    try {
      const updated = await updateSiteContent(
        {
          announcementEnabled: false,
          flags: {
            ...formData.flags,
            announcementBar: false,
            socialSection: false,
            dailyAffirmation: false,
          },
        },
        adminEmail
      );
      setFormData(updated);
      const msg = 'Single Action Applied: Minimal Zen Silence Mode (Banners & Socials hidden for pure acoustic meditation)';
      setSaveSuccess(msg);
      if (onSavedNotification) onSavedNotification(msg);
      setTimeout(() => setSaveSuccess(null), 4000);
    } catch (e) {
      console.error('Failed applying minimal mode', e);
    } finally {
      setSaving(false);
    }
  };

  /**
   * Toggle individual platform visibility
   */
  const handleTogglePlatform = async (platform: keyof SocialVisibilityConfig) => {
    const newVis = {
      ...(formData.socialVisibility || DEFAULT_SOCIAL_VISIBILITY),
      [platform]: !(formData.socialVisibility?.[platform] ?? true),
    };
    const updated = await updateSiteContent({ socialVisibility: newVis }, adminEmail);
    setFormData(updated);
  };

  /**
   * Toggle individual site flag
   */
  const handleToggleFlag = async (flag: keyof SiteFlagsConfig) => {
    const currentFlags = formData.flags || DEFAULT_SITE_FLAGS;
    const newFlags = {
      ...currentFlags,
      [flag]: !currentFlags[flag],
    };
    const updated = await updateSiteContent(
      {
        flags: newFlags,
        ...(flag === 'announcementBar' ? { announcementEnabled: newFlags.announcementBar } : {}),
      },
      adminEmail
    );
    setFormData(updated);
  };

  const updateSocial = (field: keyof SiteContentConfig['social'], val: string) => {
    setFormData((prev) => ({
      ...prev,
      social: {
        ...prev.social,
        [field]: val,
      },
    }));
  };

  const updateSocialVisibility = async (platform: keyof SocialVisibilityConfig, val: boolean) => {
    const newVis: SocialVisibilityConfig = {
      ...(formData.socialVisibility || DEFAULT_SOCIAL_VISIBILITY),
      [platform]: val,
    };
    setFormData((prev) => ({
      ...prev,
      socialVisibility: newVis,
    }));
    await updateSiteContent({ socialVisibility: newVis }, adminEmail);
  };

  const vis = formData.socialVisibility || DEFAULT_SOCIAL_VISIBILITY;
  const flags = formData.flags || DEFAULT_SITE_FLAGS;
  const activeSocialCount = [vis.facebook, vis.instagram, vis.tiktok, vis.youtube, vis.twitter, vis.telegram].filter(Boolean).length;
  const activeFlagCount = [flags.announcementBar, flags.dailyAffirmation, flags.socialSection, flags.offlineDownloadsEnabled, flags.communityFeaturesEnabled].filter(Boolean).length;

  if (loading) {
    return (
      <div className="p-8 text-center text-slate-400 flex items-center justify-center gap-2">
        <Sparkles className="w-5 h-5 text-sky-400 animate-spin" />
        <span>Loading sanctuary live content settings...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Banner & Control Bar */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950/60 to-slate-900 border border-indigo-900/60 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">
              <Globe className="w-4 h-4" />
            </span>
            <h2 className="text-base font-bold text-slate-100">Live Sanctuary CMS & Socials Editor</h2>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
              Live Real-Time
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1 font-mono">
              <Zap className="w-3 h-3" />
              <span>Bulk Edit Ready</span>
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Configure social links, headlines, announcements, and use Bulk Edit mode to toggle all visibility or reset flags in a single action.
          </p>
        </div>

        {/* Quick Bulk Action Buttons right on top bar */}
        <div className="flex items-center gap-2 w-full md:w-auto flex-wrap">
          {/* 1-Action Bulk Toggle Socials Button */}
          <button
            type="button"
            onClick={() => handleBulkToggleSocials(activeSocialCount === 0)}
            disabled={saving}
            className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-all flex items-center gap-1.5 shadow-sm active:scale-95 cursor-pointer ${
              activeSocialCount > 0
                ? 'bg-rose-500/15 hover:bg-rose-500/25 border-rose-500/40 text-rose-300'
                : 'bg-emerald-500/15 hover:bg-emerald-500/25 border-emerald-500/40 text-emerald-300'
            }`}
            title="Toggle visibility for all 6 social media icons in a single click"
          >
            {activeSocialCount > 0 ? (
              <>
                <EyeOff className="w-3.5 h-3.5" />
                <span>Bulk Hide Socials ({activeSocialCount}/6)</span>
              </>
            ) : (
              <>
                <Eye className="w-3.5 h-3.5" />
                <span>Bulk Show All Socials</span>
              </>
            )}
          </button>

          {/* 1-Action Bulk Reset Content Flags */}
          <button
            type="button"
            onClick={handleBulkResetSiteFlags}
            disabled={saving}
            className="px-3 py-2 rounded-xl text-xs font-semibold bg-indigo-500/20 hover:bg-indigo-500/30 border border-indigo-500/40 text-indigo-300 transition-all flex items-center gap-1.5 shadow-sm active:scale-95 cursor-pointer"
            title="Reset all site-wide content flags & social visibility to sanctuary defaults in 1 single action"
          >
            <RotateCcw className="w-3.5 h-3.5 text-indigo-400" />
            <span>Bulk Reset Flags</span>
          </button>

          <button
            type="button"
            onClick={() => handleSave()}
            disabled={saving}
            className="flex-1 md:flex-none px-5 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-sky-400 to-indigo-500 hover:from-sky-300 hover:to-indigo-400 text-slate-950 transition-all shadow-md active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
          >
            {saving ? (
              <>
                <Sparkles className="w-3.5 h-3.5 animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5" />
                <span>Save All Live</span>
              </>
            )}
          </button>
        </div>
      </div>

      {saveSuccess && (
        <div className="p-3.5 bg-emerald-950/70 border border-emerald-500/60 rounded-xl text-xs text-emerald-200 flex items-center gap-2.5 shadow-lg shadow-emerald-950/50 animate-in fade-in">
          <Check className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="font-medium">{saveSuccess}</span>
        </div>
      )}

      {/* Navigation Sub-Tabs (Wrapping Flex - No Horizontal Scroll) */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-2">
        <button
          type="button"
          onClick={() => setActiveSection('socials')}
          className={`px-3.5 py-1.5 min-h-[36px] rounded-xl text-xs font-semibold transition-all inline-flex items-center gap-1.5 shrink-0 border whitespace-nowrap cursor-pointer ${
            activeSection === 'socials'
              ? 'bg-sky-500/20 text-sky-200 border-sky-500/40 shadow-sm'
              : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
          }`}
        >
          <Radio className="w-3.5 h-3.5 text-sky-400" />
          <span>Social Media Links & URLs</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSection('bulk')}
          className={`px-3.5 py-1.5 min-h-[36px] rounded-xl text-xs font-semibold transition-all inline-flex items-center gap-1.5 shrink-0 border whitespace-nowrap cursor-pointer ${
            activeSection === 'bulk'
              ? 'bg-amber-500/25 text-amber-200 border-amber-500/50 shadow-sm'
              : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
          }`}
        >
          <Zap className="w-3.5 h-3.5 text-amber-400" />
          <span>⚡ Bulk Edit & Site Flags</span>
          <span className="px-1.5 py-0.5 rounded-full text-[9px] font-mono bg-amber-500/20 text-amber-300 border border-amber-500/40 leading-none">
            1-Action
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSection('hero')}
          className={`px-3.5 py-1.5 min-h-[36px] rounded-xl text-xs font-semibold transition-all inline-flex items-center gap-1.5 shrink-0 border whitespace-nowrap cursor-pointer ${
            activeSection === 'hero'
              ? 'bg-indigo-500/20 text-indigo-200 border-indigo-500/40 shadow-sm'
              : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
          }`}
        >
          <Megaphone className="w-3.5 h-3.5 text-indigo-400" />
          <span>Announcements & Hero Texts</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSection('branding')}
          className={`px-3.5 py-1.5 min-h-[36px] rounded-xl text-xs font-semibold transition-all inline-flex items-center gap-1.5 shrink-0 border whitespace-nowrap cursor-pointer ${
            activeSection === 'branding'
              ? 'bg-purple-500/20 text-purple-200 border-purple-500/40 shadow-sm'
              : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
          }`}
        >
          <Type className="w-3.5 h-3.5 text-purple-400" />
          <span>Footer, Affirmation & Contact</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSection('construction')}
          className={`px-3.5 py-1.5 min-h-[36px] rounded-xl text-xs font-semibold transition-all inline-flex items-center gap-1.5 shrink-0 border whitespace-nowrap cursor-pointer ${
            activeSection === 'construction'
              ? 'bg-gradient-to-r from-amber-500/30 to-amber-600/30 text-amber-200 border-amber-400/60 shadow-sm ring-1 ring-amber-400/30'
              : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
          }`}
        >
          <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
          <span>Under Construction Mode</span>
          {formData.underConstruction?.enabled && (
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
          )}
        </button>
      </div>

      {/* ============================================================== */}
      {/* SECTION: BULK EDIT MODE & SITE-WIDE CONTENT FLAGS               */}
      {/* ============================================================== */}
      {activeSection === 'bulk' && (
        <div className="space-y-6 animate-in fade-in">
          {/* Card 1: Bulk Social Link Visibility Controller */}
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-amber-500/30 space-y-4 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                  <Zap className="w-4 h-4 text-amber-400" />
                  <span>Bulk Social Link Visibility Controller</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-amber-500/20 text-amber-300 border border-amber-500/40">
                    {activeSocialCount} / 6 Visible
                  </span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Toggle all social link visibility across the sanctuary in a single action, or toggle individual platforms below.
                </p>
              </div>

              {/* Single-Action Bulk Buttons */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleBulkToggleSocials(true)}
                  disabled={saving}
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 transition-all flex items-center gap-1.5 active:scale-95 cursor-pointer"
                  title="Enable visibility for Facebook, Instagram, TikTok, YouTube, Twitter & Telegram in a single action"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Show All (1-Action)</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleBulkToggleSocials(false)}
                  disabled={saving}
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 transition-all flex items-center gap-1.5 active:scale-95 cursor-pointer"
                  title="Hide all social links across the website in a single action"
                >
                  <EyeOff className="w-3.5 h-3.5" />
                  <span>Hide All (1-Action)</span>
                </button>

                <button
                  type="button"
                  onClick={handleInvertSocials}
                  disabled={saving}
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-750 text-slate-300 border border-slate-700 transition-all flex items-center gap-1.5 active:scale-95 cursor-pointer"
                  title="Flip current visibility state of each platform in a single action"
                >
                  <ArrowRightLeft className="w-3.5 h-3.5 text-sky-400" />
                  <span>Invert</span>
                </button>
              </div>
            </div>

            {/* Grid of All 6 Platforms with Fast Toggles */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-1">
              {[
                { key: 'facebook' as const, name: 'Facebook', url: formData.social.facebookUrl, color: 'text-sky-400' },
                { key: 'instagram' as const, name: 'Instagram', url: formData.social.instagramUrl, color: 'text-rose-400' },
                { key: 'tiktok' as const, name: 'TikTok', url: formData.social.tiktokUrl, color: 'text-teal-400' },
                { key: 'youtube' as const, name: 'YouTube', url: formData.social.youtubeUrl, color: 'text-red-400' },
                { key: 'twitter' as const, name: 'X / Twitter', url: formData.social.twitterUrl, color: 'text-indigo-400' },
                { key: 'telegram' as const, name: 'Telegram', url: formData.social.telegramUrl, color: 'text-sky-300' },
              ].map((p) => {
                const isVisible = vis[p.key] ?? false;
                return (
                  <div
                    key={p.key}
                    onClick={() => handleTogglePlatform(p.key)}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                      isVisible
                        ? 'bg-slate-950/80 border-slate-700/80 hover:border-sky-500/60 shadow-sm'
                        : 'bg-slate-950/40 border-slate-850 opacity-60 hover:opacity-100'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="shrink-0">
                        {p.key !== 'telegram' ? (
                          <SacredSocialIcon platform={p.key} href={p.url} size={28} />
                        ) : (
                          <div className="w-7 h-7 rounded-full bg-sky-500/20 border border-sky-400/30 flex items-center justify-center text-sky-400 text-xs font-bold">
                            TG
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                          <span>{p.name}</span>
                          <span
                            className={`text-[9px] px-1.5 py-0.2 rounded font-mono ${
                              isVisible
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                : 'bg-slate-800 text-slate-400'
                            }`}
                          >
                            {isVisible ? 'Visible' : 'Hidden'}
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-500 truncate font-mono">
                          {p.url || 'No URL configured'}
                        </div>
                      </div>
                    </div>

                    <div className="shrink-0">
                      <div
                        className={`w-9 h-5 rounded-full transition-colors relative ${
                          isVisible ? 'bg-emerald-500' : 'bg-slate-800'
                        }`}
                      >
                        <div
                          className={`w-4 h-4 rounded-full bg-white transition-transform absolute top-0.5 ${
                            isVisible ? 'left-4.5 translate-x-0' : 'left-0.5'
                          }`}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Card 2: Site-Wide Content Flags Controller */}
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-indigo-500/30 space-y-4 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-indigo-400" />
                  <span>Site-Wide Content Flags Center</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">
                    {activeFlagCount} / 5 Active
                  </span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Reset all sanctuary content flags or apply sanctuary display modes in a single action.
                </p>
              </div>

              {/* Single-Action Bulk Flag Controls */}
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={handleBulkResetSiteFlags}
                  disabled={saving}
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-indigo-500/25 hover:bg-indigo-500/35 text-indigo-200 border border-indigo-400/50 transition-all flex items-center gap-1.5 active:scale-95 cursor-pointer shadow-sm"
                  title="Reset all flags to sanctuary production defaults in a single action"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-indigo-300" />
                  <span>Reset All Flags (1-Action)</span>
                </button>

                <button
                  type="button"
                  onClick={handleBulkEnableAllFlags}
                  disabled={saving}
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 transition-all flex items-center gap-1.5 active:scale-95 cursor-pointer"
                  title="Enable all 5 content flags across the site in a single action"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Enable All (1-Action)</span>
                </button>

                <button
                  type="button"
                  onClick={handleBulkZenMode}
                  disabled={saving}
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-750 text-amber-300 border border-amber-500/30 transition-all flex items-center gap-1.5 active:scale-95 cursor-pointer"
                  title="Minimal Zen Silence Mode: Hides top banners and social links for deep quiet contemplation"
                >
                  <Moon className="w-3.5 h-3.5 text-amber-400" />
                  <span>Minimal Zen Mode</span>
                </button>
              </div>
            </div>

            {/* Content Flags Matrix */}
            <div className="space-y-2.5">
              {[
                {
                  key: 'announcementBar' as const,
                  title: 'Top Notification Broadcast Banner',
                  description: 'Display live 432Hz frequency alerts, announcements and solfeggio notices at the very top of the website.',
                  icon: Megaphone,
                  color: 'text-amber-400',
                  badge: formData.announcementBadge || 'Live Frequency',
                },
                {
                  key: 'dailyAffirmation' as const,
                  title: 'Daily Sacred Affirmation Display',
                  description: 'Display inspirational mindfulness and ambient restoration affirmations right above the sanctuary footer.',
                  icon: Sparkles,
                  color: 'text-purple-400',
                  badge: 'Ambient Restoration',
                },
                {
                  key: 'socialSection' as const,
                  title: 'Sacred Social Media Links Section',
                  description: 'Display official community channels (Facebook, Instagram, TikTok, YouTube, etc.) in the footer.',
                  icon: Globe,
                  color: 'text-sky-400',
                  badge: `${activeSocialCount} Platforms`,
                },
                {
                  key: 'offlineDownloadsEnabled' as const,
                  title: 'Studio Uncompressed WAV Audio Downloads',
                  description: 'Allow meditators to export studio-mastered 432Hz audio files for offline retreat usage without internet.',
                  icon: Layers,
                  color: 'text-emerald-400',
                  badge: '24-Bit WAV',
                },
                {
                  key: 'communityFeaturesEnabled' as const,
                  title: 'Live Sanctuary Chat & Community Hub',
                  description: 'Enable real-time meditator discussions, global intention sharing, and community engagement features.',
                  icon: Radio,
                  color: 'text-rose-400',
                  badge: 'Real-Time',
                },
              ].map((flagItem) => {
                const isActive = flags[flagItem.key] ?? true;
                const IconComponent = flagItem.icon;
                return (
                  <div
                    key={flagItem.key}
                    onClick={() => handleToggleFlag(flagItem.key)}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-4 ${
                      isActive
                        ? 'bg-slate-950/70 border-slate-750 hover:border-indigo-500/50'
                        : 'bg-slate-950/30 border-slate-850 opacity-60 hover:opacity-90'
                    }`}
                  >
                    <div className="flex items-start gap-3 min-w-0">
                      <div className={`p-2 rounded-lg bg-slate-900 border border-slate-800 ${flagItem.color} shrink-0 mt-0.5`}>
                        <IconComponent className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-slate-100 flex items-center gap-2 flex-wrap">
                          <span>{flagItem.title}</span>
                          <span
                            className={`text-[9px] px-1.5 py-0.2 rounded font-mono ${
                              isActive
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                                : 'bg-slate-800 text-slate-400'
                            }`}
                          >
                            {isActive ? 'Active' : 'Disabled'}
                          </span>
                          <span className="text-[10px] text-slate-500 font-mono">
                            [{flagItem.badge}]
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                          {flagItem.description}
                        </p>
                      </div>
                    </div>

                    <div className="shrink-0">
                      <div
                        className={`w-9 h-5 rounded-full transition-colors relative ${
                          isActive ? 'bg-indigo-500' : 'bg-slate-800'
                        }`}
                      >
                        <div
                          className={`w-4 h-4 rounded-full bg-white transition-transform absolute top-0.5 ${
                            isActive ? 'left-4.5 translate-x-0' : 'left-0.5'
                          }`}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* SECTION 1: SOCIAL MEDIA LINKS */}
      {activeSection === 'socials' && (
        <div className="space-y-6">
          {/* Live Preview Card */}
          <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800/80 space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-semibold text-slate-200 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-sky-400" />
                Live Social Icons Preview
              </span>
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-amber-400 font-mono">
                  {activeSocialCount} / 6 Active
                </span>
                <span className="text-[11px] text-sky-400 font-mono">Sacred Lotus Styling</span>
              </div>
            </div>

            <div className="py-4 bg-slate-900/60 rounded-xl border border-slate-800 flex flex-col items-center justify-center gap-2">
              <div className="flex items-center gap-3 flex-wrap justify-center">
                {vis.facebook && <SacredSocialIcon platform="facebook" href={formData.social.facebookUrl} size={42} />}
                {vis.instagram && <SacredSocialIcon platform="instagram" href={formData.social.instagramUrl} size={42} />}
                {vis.tiktok && <SacredSocialIcon platform="tiktok" href={formData.social.tiktokUrl} size={42} />}
                {vis.youtube && <SacredSocialIcon platform="youtube" href={formData.social.youtubeUrl} size={42} />}
                {vis.twitter && <SacredSocialIcon platform="twitter" href={formData.social.twitterUrl} size={42} />}
                {vis.telegram && <SacredSocialIcon platform="telegram" href={formData.social.telegramUrl} size={42} />}
                {formData.social.customLinks?.filter((l) => l.visible !== false && l.url).map((link) => (
                  <SacredSocialIcon key={link.id} platform="custom" href={link.url} size={42} label={link.label} />
                ))}
              </div>
              {activeSocialCount === 0 && (
                <span className="text-xs text-amber-400 bg-amber-950/50 border border-amber-500/40 px-3 py-1 rounded-full font-mono">
                  All Social Media Icons Currently Hidden via Bulk Action
                </span>
              )}
              <span className="text-[11px] text-slate-400 font-medium">
                {formData.social.socialHeadline || 'Connect with the Global Sacred Community'}
              </span>
            </div>
          </div>

          {/* Social Links Form with Individual Show/Hide Checkboxes */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Facebook */}
            <div className={`p-4 rounded-2xl border transition-all space-y-2.5 ${
              vis.facebook ? 'bg-slate-900/80 border-sky-500/40' : 'bg-slate-950/60 border-slate-850 opacity-75'
            }`}>
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-sky-300 flex items-center gap-1.5">
                  <span>Facebook Profile / Page</span>
                </label>
                <div className="flex items-center gap-2">
                  <label className="flex items-center gap-1.5 cursor-pointer text-xs select-none bg-slate-950/80 px-2 py-0.5 rounded-lg border border-slate-800">
                    <input
                      type="checkbox"
                      checked={Boolean(vis.facebook)}
                      onChange={(e) => updateSocialVisibility('facebook', e.target.checked)}
                      className="w-3.5 h-3.5 rounded text-sky-500 bg-slate-900 border-slate-700 cursor-pointer accent-sky-400"
                    />
                    <span className={`text-[10px] font-semibold ${vis.facebook ? 'text-sky-300' : 'text-slate-500'}`}>
                      {vis.facebook ? 'Visible' : 'Hidden'}
                    </span>
                  </label>
                  {formData.social.facebookUrl && (
                    <a
                      href={formData.social.facebookUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] text-sky-400 hover:text-sky-300 flex items-center gap-1"
                    >
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </div>
              <input
                type="url"
                value={formData.social.facebookUrl}
                onChange={(e) => updateSocial('facebookUrl', e.target.value)}
                placeholder="https://facebook.com/your-sanctuary"
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700/80 text-xs text-slate-200 focus:outline-none focus:border-sky-400 transition-colors font-mono"
              />
              <p className="text-[10px] text-slate-400">Leave blank to point to default Facebook community.</p>
            </div>

            {/* Instagram */}
            <div className={`p-4 rounded-2xl border transition-all space-y-2.5 ${
              vis.instagram ? 'bg-slate-900/80 border-rose-500/40' : 'bg-slate-950/60 border-slate-850 opacity-75'
            }`}>
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-rose-300 flex items-center gap-1.5">
                  <span>Instagram Profile</span>
                </label>
                <div className="flex items-center gap-2">
                  <label className="flex items-center gap-1.5 cursor-pointer text-xs select-none bg-slate-950/80 px-2 py-0.5 rounded-lg border border-slate-800">
                    <input
                      type="checkbox"
                      checked={Boolean(vis.instagram)}
                      onChange={(e) => updateSocialVisibility('instagram', e.target.checked)}
                      className="w-3.5 h-3.5 rounded text-rose-500 bg-slate-900 border-slate-700 cursor-pointer accent-rose-400"
                    />
                    <span className={`text-[10px] font-semibold ${vis.instagram ? 'text-rose-300' : 'text-slate-500'}`}>
                      {vis.instagram ? 'Visible' : 'Hidden'}
                    </span>
                  </label>
                  {formData.social.instagramUrl && (
                    <a
                      href={formData.social.instagramUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] text-rose-400 hover:text-rose-300 flex items-center gap-1"
                    >
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </div>
              <input
                type="url"
                value={formData.social.instagramUrl}
                onChange={(e) => updateSocial('instagramUrl', e.target.value)}
                placeholder="https://instagram.com/your-sanctuary"
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700/80 text-xs text-slate-200 focus:outline-none focus:border-rose-400 transition-colors font-mono"
              />
              <p className="text-[10px] text-slate-400">Links directly to your official Instagram page.</p>
            </div>

            {/* TikTok */}
            <div className={`p-4 rounded-2xl border transition-all space-y-2.5 ${
              vis.tiktok ? 'bg-slate-900/80 border-teal-500/40' : 'bg-slate-950/60 border-slate-850 opacity-75'
            }`}>
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-teal-300 flex items-center gap-1.5">
                  <span>TikTok Channel</span>
                </label>
                <div className="flex items-center gap-2">
                  <label className="flex items-center gap-1.5 cursor-pointer text-xs select-none bg-slate-950/80 px-2 py-0.5 rounded-lg border border-slate-800">
                    <input
                      type="checkbox"
                      checked={Boolean(vis.tiktok)}
                      onChange={(e) => updateSocialVisibility('tiktok', e.target.checked)}
                      className="w-3.5 h-3.5 rounded text-teal-500 bg-slate-900 border-slate-700 cursor-pointer accent-teal-400"
                    />
                    <span className={`text-[10px] font-semibold ${vis.tiktok ? 'text-teal-300' : 'text-slate-500'}`}>
                      {vis.tiktok ? 'Visible' : 'Hidden'}
                    </span>
                  </label>
                  {formData.social.tiktokUrl && (
                    <a
                      href={formData.social.tiktokUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] text-teal-400 hover:text-teal-300 flex items-center gap-1"
                    >
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </div>
              <input
                type="url"
                value={formData.social.tiktokUrl}
                onChange={(e) => updateSocial('tiktokUrl', e.target.value)}
                placeholder="https://tiktok.com/@your-sanctuary"
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700/80 text-xs text-slate-200 focus:outline-none focus:border-teal-400 transition-colors font-mono"
              />
              <p className="text-[10px] text-slate-400">Opens TikTok in new tab with sacred audio content.</p>
            </div>

            {/* YouTube */}
            <div className={`p-4 rounded-2xl border transition-all space-y-2.5 ${
              vis.youtube ? 'bg-slate-900/80 border-rose-500/40' : 'bg-slate-950/60 border-slate-850 opacity-75'
            }`}>
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-rose-400 flex items-center gap-1.5">
                  <span>YouTube Channel</span>
                </label>
                <div className="flex items-center gap-2">
                  <label className="flex items-center gap-1.5 cursor-pointer text-xs select-none bg-slate-950/80 px-2 py-0.5 rounded-lg border border-slate-800">
                    <input
                      type="checkbox"
                      checked={Boolean(vis.youtube)}
                      onChange={(e) => updateSocialVisibility('youtube', e.target.checked)}
                      className="w-3.5 h-3.5 rounded text-rose-500 bg-slate-900 border-slate-700 cursor-pointer accent-rose-400"
                    />
                    <span className={`text-[10px] font-semibold ${vis.youtube ? 'text-rose-300' : 'text-slate-500'}`}>
                      {vis.youtube ? 'Visible' : 'Hidden'}
                    </span>
                  </label>
                  {formData.social.youtubeUrl && (
                    <a
                      href={formData.social.youtubeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] text-rose-400 hover:text-rose-300 flex items-center gap-1"
                    >
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </div>
              <input
                type="url"
                value={formData.social.youtubeUrl}
                onChange={(e) => updateSocial('youtubeUrl', e.target.value)}
                placeholder="https://www.youtube.com/@Aura432Hz-d1g"
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700/80 text-xs text-slate-200 focus:outline-none focus:border-rose-400 transition-colors font-mono"
              />
              <p className="text-[10px] text-slate-400">Displays custom Sacred Lotus YouTube icon.</p>
            </div>

            {/* Twitter / X */}
            <div className={`p-4 rounded-2xl border transition-all space-y-2.5 ${
              vis.twitter ? 'bg-slate-900/80 border-indigo-500/40' : 'bg-slate-950/60 border-slate-850 opacity-75'
            }`}>
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-indigo-300 flex items-center gap-1.5">
                  <span>Twitter / X Profile</span>
                </label>
                <div className="flex items-center gap-2">
                  <label className="flex items-center gap-1.5 cursor-pointer text-xs select-none bg-slate-950/80 px-2 py-0.5 rounded-lg border border-slate-800">
                    <input
                      type="checkbox"
                      checked={Boolean(vis.twitter)}
                      onChange={(e) => updateSocialVisibility('twitter', e.target.checked)}
                      className="w-3.5 h-3.5 rounded text-indigo-500 bg-slate-900 border-slate-700 cursor-pointer accent-indigo-400"
                    />
                    <span className={`text-[10px] font-semibold ${vis.twitter ? 'text-indigo-300' : 'text-slate-500'}`}>
                      {vis.twitter ? 'Visible' : 'Hidden'}
                    </span>
                  </label>
                  {formData.social.twitterUrl && (
                    <a
                      href={formData.social.twitterUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                    >
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </div>
              <input
                type="url"
                value={formData.social.twitterUrl}
                onChange={(e) => updateSocial('twitterUrl', e.target.value)}
                placeholder="https://x.com/your-sanctuary"
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700/80 text-xs text-slate-200 focus:outline-none focus:border-indigo-400 transition-colors font-mono"
              />
              <p className="text-[10px] text-slate-400">Displays custom Sacred Lotus X glyph.</p>
            </div>

            {/* Telegram Channel */}
            <div className={`p-4 rounded-2xl border transition-all space-y-2.5 ${
              vis.telegram ? 'bg-slate-900/80 border-sky-500/40' : 'bg-slate-950/60 border-slate-850 opacity-75'
            }`}>
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-sky-400 flex items-center gap-1.5">
                  <span>Telegram Channel</span>
                </label>
                <div className="flex items-center gap-2">
                  <label className="flex items-center gap-1.5 cursor-pointer text-xs select-none bg-slate-950/80 px-2 py-0.5 rounded-lg border border-slate-800">
                    <input
                      type="checkbox"
                      checked={Boolean(vis.telegram)}
                      onChange={(e) => updateSocialVisibility('telegram', e.target.checked)}
                      className="w-3.5 h-3.5 rounded text-sky-500 bg-slate-900 border-slate-700 cursor-pointer accent-sky-400"
                    />
                    <span className={`text-[10px] font-semibold ${vis.telegram ? 'text-sky-300' : 'text-slate-500'}`}>
                      {vis.telegram ? 'Visible' : 'Hidden'}
                    </span>
                  </label>
                  {formData.social.telegramUrl && (
                    <a
                      href={formData.social.telegramUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] text-sky-400 hover:text-sky-300 flex items-center gap-1"
                    >
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </div>
              <input
                type="url"
                value={formData.social.telegramUrl}
                onChange={(e) => updateSocial('telegramUrl', e.target.value)}
                placeholder="https://t.me/your-channel"
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700/80 text-xs text-slate-200 focus:outline-none focus:border-sky-400 transition-colors font-mono"
              />
              <p className="text-[10px] text-slate-400">Direct link to your private or broadcast group.</p>
            </div>
          </div>

          {/* Social Headline & Footer texts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Social Call-to-Action Headline</label>
              <input
                type="text"
                value={formData.social.socialHeadline}
                onChange={(e) => updateSocial('socialHeadline', e.target.value)}
                placeholder="Connect with the Global Sacred Community"
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700/80 text-xs text-slate-200 focus:outline-none focus:border-sky-400"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Footer Social Subtext List</label>
              <input
                type="text"
                value={formData.social.socialSubtext}
                onChange={(e) => updateSocial('socialSubtext', e.target.value)}
                placeholder="Facebook • Instagram • TikTok • YouTube"
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700/80 text-xs text-slate-200 focus:outline-none focus:border-sky-400"
              />
            </div>
          </div>
        </div>
      )}

      {/* SECTION 2: HERO & ANNOUNCEMENTS */}
      {activeSection === 'hero' && (
        <div className="space-y-5">
          {/* Top Announcement Bar Configuration */}
          <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                  <Megaphone className="w-4 h-4 text-amber-400" />
                  Top Notification Banner (Live Broadcast Bar)
                </h3>
                <p className="text-[11px] text-slate-400">Displayed at the very top of the sanctuary for all visitors.</p>
              </div>

              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.announcementEnabled}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      announcementEnabled: e.target.checked,
                      flags: { ...prev.flags, announcementBar: e.target.checked },
                    }))
                  }
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500"></div>
                <span className="ml-2 text-xs font-medium text-slate-300">
                  {formData.announcementEnabled ? 'Enabled' : 'Disabled'}
                </span>
              </label>
            </div>

            {formData.announcementEnabled && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-slate-300">Badge Label</label>
                  <input
                    type="text"
                    value={formData.announcementBadge}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, announcementBadge: e.target.value }))
                    }
                    placeholder="Live Frequency"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700/80 text-xs text-slate-200 focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div className="md:col-span-2 space-y-1">
                  <label className="text-[11px] font-medium text-slate-300">Banner Announcement Message</label>
                  <input
                    type="text"
                    value={formData.announcementText}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, announcementText: e.target.value }))
                    }
                    placeholder="✨ Welcome to Aura 432Hz Sanctuary..."
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700/80 text-xs text-slate-200 focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Hero Section Texts */}
          <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-4">
            <h3 className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
              <Type className="w-4 h-4 text-sky-400" />
              Hero Header & Subtitle
            </h3>

            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-[11px] font-medium text-slate-300">Hero Badge Pill</label>
                <input
                  type="text"
                  value={formData.heroBadge}
                  onChange={(e) => setFormData((prev) => ({ ...prev, heroBadge: e.target.value }))}
                  placeholder="432Hz Pure Ambient Sound Engine"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700/80 text-xs text-slate-200 focus:outline-none focus:border-sky-400"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-medium text-slate-300">Sanctuary Main Headline</label>
                <input
                  type="text"
                  value={formData.heroTitle}
                  onChange={(e) => setFormData((prev) => ({ ...prev, heroTitle: e.target.value }))}
                  placeholder="Whole-Body & Spirit Relaxation Engine"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700/80 text-xs text-slate-200 focus:outline-none focus:border-sky-400 font-semibold"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-medium text-slate-300">Sanctuary Descriptive Subtitle</label>
                <textarea
                  rows={3}
                  value={formData.heroSubtitle}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, heroSubtitle: e.target.value }))
                  }
                  placeholder="Harmonize mind, body, and consciousness..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700/80 text-xs text-slate-200 focus:outline-none focus:border-sky-400"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 3: FOOTER, AFFIRMATION & CONTACT */}
      {activeSection === 'branding' && (
        <div className="space-y-5">
          <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-4">
            <h3 className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-purple-400" />
              Daily Sacred Affirmation
            </h3>
            <p className="text-[11px] text-slate-400">
              Shown above the footer on the sanctuary. Inspires meditators with daily spiritual wisdom.
            </p>

            <div className="space-y-1">
              <label className="text-[11px] font-medium text-slate-300">Affirmation Text</label>
              <textarea
                rows={2}
                value={formData.dailyAffirmation}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, dailyAffirmation: e.target.value }))
                }
                placeholder="In every harmonic 432Hz soundscape lies the gentle invitation to deep rest and mindful calm..."
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700/80 text-xs text-slate-200 focus:outline-none focus:border-purple-400 italic"
              />
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-4">
            <h3 className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-indigo-400" />
              Branding & Contact Information
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[11px] font-medium text-slate-300">Sanctuary Brand Name</label>
                <input
                  type="text"
                  value={formData.brandName}
                  onChange={(e) => setFormData((prev) => ({ ...prev, brandName: e.target.value }))}
                  placeholder="Aura 432Hz Sanctuary"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700/80 text-xs text-slate-200 focus:outline-none focus:border-indigo-400 font-medium"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-medium text-slate-300">Footer Tagline</label>
                <input
                  type="text"
                  value={formData.footerTagline}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, footerTagline: e.target.value }))
                  }
                  placeholder="Whole-Body & Spirit Relaxation Engine"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700/80 text-xs text-slate-200 focus:outline-none focus:border-indigo-400"
                />
              </div>

              <div className="space-y-1 md:col-span-2">
                <label className="text-[11px] font-medium text-slate-300 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-sky-400" />
                  Official Contact & Support Email
                </label>
                <input
                  type="email"
                  value={formData.contactEmail}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, contactEmail: e.target.value }))
                  }
                  placeholder="curator@aura432hz.app"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700/80 text-xs text-slate-200 focus:outline-none focus:border-sky-400 font-mono"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* SECTION: UNDER CONSTRUCTION / MAINTENANCE TEASER MODE          */}
      {/* ============================================================== */}
      {activeSection === 'construction' && (
        <div className="animate-in fade-in">
          <UnderConstructionEditor
            adminEmail={adminEmail}
            onSavedNotification={onSavedNotification}
            onOpenFullscreenPreview={onOpenFullscreenPreview}
          />
        </div>
      )}

      {/* Bottom Save Action for standard tabs */}
      {activeSection !== 'construction' && (
        <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
          <span className="text-[11px] text-slate-400 flex items-center gap-1">
            <Info className="w-3.5 h-3.5 text-slate-500" />
            Last published by: <strong className="text-slate-300">{formData.lastUpdatedBy}</strong>
          </span>

          <button
            type="button"
            onClick={() => handleSave()}
            disabled={saving}
            className="px-6 py-2.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-sky-400 to-indigo-500 hover:from-sky-300 hover:to-indigo-400 text-slate-950 transition-all shadow-md active:scale-95 flex items-center gap-2 cursor-pointer"
          >
            {saving ? (
              <>
                <Sparkles className="w-3.5 h-3.5 animate-spin" />
                <span>Publishing to Sanctuary...</span>
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5" />
                <span>Save & Publish All Changes Live</span>
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
};
