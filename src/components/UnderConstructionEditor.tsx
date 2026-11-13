import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  Power,
  Save,
  RotateCcw,
  Eye,
  Check,
  Calendar,
  Clock,
  Mail,
  Quote,
  Sparkles,
  Waves,
  Wind,
  Download,
  Users,
  Copy,
  ChevronRight,
  Sliders,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Monitor,
  Tablet,
  Smartphone,
  Share2,
  Zap,
  Edit3,
  Globe,
  EyeOff,
  Plus,
  Trash2,
  Link2,
} from 'lucide-react';
import {
  useSiteContent,
  updateSiteContent,
  bulkToggleAllSocialVisibility,
  UnderConstructionConfig,
  DEFAULT_UNDER_CONSTRUCTION,
  fetchConstructionSubscribers,
  ConstructionSubscriber,
  SocialVisibilityConfig,
  SocialLinksConfig,
  CustomSocialLink,
} from '../services/siteContent';
import { UnderConstructionPage } from './UnderConstructionPage';
import {
  SacredSocialIcon,
  SacredSocialLinks,
  SocialAccountsModal,
  SocialAccountsConfig,
} from './SacredSocialIcons';

interface UnderConstructionEditorProps {
  adminEmail?: string;
  onSavedNotification?: (msg: string) => void;
  onOpenFullscreenPreview?: () => void;
}

// Curated Sacred Quotes for easy 1-click loading
const SACRED_QUOTE_PRESETS = [
  {
    author: 'Nikola Tesla',
    quote: 'If you want to find the secrets of the universe, think in terms of energy, frequency and vibration.',
  },
  {
    author: 'Pythagoras',
    quote: 'There is geometry in the humming of the strings, there is music in the spacing of the spheres.',
  },
  {
    author: 'Rumi',
    quote: 'Silence is the language of God, all else is poor translation.',
  },
  {
    author: 'Hazrat Inayat Khan',
    quote: 'The one who knows the mystery of sound knows the mystery of the whole universe.',
  },
  {
    author: 'Albert Einstein',
    quote: 'Everything in life is vibration.',
  },
  {
    author: 'Hermes Trismegistus',
    quote: 'As above, so below; as within, so without; as the universe, so the soul.',
  },
];

export const UnderConstructionEditor: React.FC<UnderConstructionEditorProps> = ({
  adminEmail = 'moreed.raouf@gmail.com',
  onSavedNotification,
  onOpenFullscreenPreview,
}) => {
  const liveContent = useSiteContent();
  const [config, setConfig] = useState<UnderConstructionConfig>(() => ({
    ...DEFAULT_UNDER_CONSTRUCTION,
    ...liveContent.underConstruction,
  }));

  // Local synced state for social media accounts to prevent input jitter and loss
  const [socialForm, setSocialForm] = useState<SocialLinksConfig>(() => ({
    ...liveContent.social,
    customLinks: liveContent.social?.customLinks || [],
  }));

  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Subscribed leads
  const [subscribers, setSubscribers] = useState<ConstructionSubscriber[]>([]);
  const [loadingSubscribers, setLoadingSubscribers] = useState(false);

  // Active view tab in editor: 'editor' | 'subscribers'
  const [editorTab, setEditorTab] = useState<'editor' | 'subscribers'>('editor');
  // Preview mode in editor: 'split' | 'form-only' | 'preview-only'
  const [previewMode, setPreviewMode] = useState<'split' | 'form' | 'preview'>('split');
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');

  // Social Media Accounts Modal State
  const [isSocialModalOpen, setIsSocialModalOpen] = useState(false);
  const [socialActionNotice, setSocialActionNotice] = useState<string | null>(null);

  const showSocialNotice = (msg: string) => {
    setSocialActionNotice(msg);
    setTimeout(() => setSocialActionNotice(null), 3000);
  };

  // Sync social form when liveContent changes externally
  useEffect(() => {
    setSocialForm({
      ...liveContent.social,
      customLinks: liveContent.social?.customLinks || [],
    });
  }, [liveContent.social]);

  const handleSaveSocialAccounts = async (newAccounts: SocialAccountsConfig) => {
    try {
      const updatedSocial: SocialLinksConfig = {
        ...liveContent.social,
        facebookUrl: (newAccounts.facebookUrl || '').trim(),
        instagramUrl: (newAccounts.instagramUrl || '').trim(),
        tiktokUrl: (newAccounts.tiktokUrl || '').trim(),
        youtubeUrl: (newAccounts.youtubeUrl || '').trim(),
        twitterUrl: (newAccounts.twitterUrl || '').trim(),
        telegramUrl: (newAccounts.telegramUrl || '').trim(),
        socialHeadline: newAccounts.socialHeadline || liveContent.social.socialHeadline,
        socialSubtext: newAccounts.socialSubtext || liveContent.social.socialSubtext,
        customLinks: newAccounts.customLinks || [],
      };
      setSocialForm(updatedSocial);
      await updateSiteContent(
        {
          social: updatedSocial,
        },
        adminEmail
      );
      showSocialNotice('Social media accounts updated and synced successfully!');
      if (onSavedNotification) onSavedNotification('Social links updated');
    } catch {
      showSocialNotice('Failed to update social media accounts');
    }
  };

  const handleSaveInlineSocials = async () => {
    try {
      const updatedSocial: SocialLinksConfig = {
        ...socialForm,
        facebookUrl: (socialForm.facebookUrl || '').trim(),
        instagramUrl: (socialForm.instagramUrl || '').trim(),
        tiktokUrl: (socialForm.tiktokUrl || '').trim(),
        youtubeUrl: (socialForm.youtubeUrl || '').trim(),
        twitterUrl: (socialForm.twitterUrl || '').trim(),
        telegramUrl: (socialForm.telegramUrl || '').trim(),
        customLinks: socialForm.customLinks || [],
      };
      await updateSiteContent(
        {
          social: updatedSocial,
        },
        adminEmail
      );
      showSocialNotice('Social media links and custom channels published live!');
      if (onSavedNotification) onSavedNotification('Social media links saved');
    } catch {
      showSocialNotice('Failed to save social media accounts');
    }
  };

  const handleToggleSingleVisibility = async (platform: keyof SocialVisibilityConfig, visible: boolean) => {
    try {
      await updateSiteContent(
        {
          socialVisibility: {
            ...liveContent.socialVisibility,
            [platform]: visible,
          },
        },
        adminEmail
      );
      showSocialNotice(`${platform.charAt(0).toUpperCase() + platform.slice(1)} icon is now ${visible ? 'VISIBLE' : 'HIDDEN'}`);
    } catch {
      showSocialNotice('Failed to toggle visibility');
    }
  };

  const handleBulkSocialVisibility = async (visible: boolean) => {
    try {
      await bulkToggleAllSocialVisibility(visible, adminEmail);
      showSocialNotice(visible ? 'All social icons set to VISIBLE' : 'All social icons HIDDEN');
      if (onSavedNotification) onSavedNotification(visible ? 'All social icons visible' : 'All social icons hidden');
    } catch {
      showSocialNotice('Failed to bulk toggle social icons');
    }
  };

  // Sync when liveContent changes from other tabs or firestore
  useEffect(() => {
    if (liveContent.underConstruction) {
      setConfig((prev) => ({
        ...prev,
        ...liveContent.underConstruction,
      }));
    }
  }, [liveContent.underConstruction]);

  // Load subscribers when tab selected
  useEffect(() => {
    if (editorTab === 'subscribers') {
      loadSubscribers();
    }
  }, [editorTab]);

  const loadSubscribers = async () => {
    setLoadingSubscribers(true);
    try {
      const data = await fetchConstructionSubscribers();
      setSubscribers(data);
    } catch (e) {
      console.error('Failed to load subscribers:', e);
    } finally {
      setLoadingSubscribers(false);
    }
  };

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSaving(true);
    setSaveSuccess(null);
    setSaveError(null);
    try {
      await updateSiteContent(
        {
          underConstruction: config,
          social: {
            ...socialForm,
            facebookUrl: (socialForm.facebookUrl || '').trim(),
            instagramUrl: (socialForm.instagramUrl || '').trim(),
            tiktokUrl: (socialForm.tiktokUrl || '').trim(),
            youtubeUrl: (socialForm.youtubeUrl || '').trim(),
            twitterUrl: (socialForm.twitterUrl || '').trim(),
            telegramUrl: (socialForm.telegramUrl || '').trim(),
            customLinks: socialForm.customLinks || [],
          },
        },
        adminEmail
      );
      setSaveSuccess(
        config.enabled
          ? 'Under Construction Mode is now ACTIVE on the public website!'
          : 'Under Construction Mode is now OFF. Sanctuary is live to the public!'
      );
      if (onSavedNotification) {
        onSavedNotification(
          config.enabled
            ? 'Under Construction Mode is ACTIVE'
            : 'Under Construction Mode turned OFF'
        );
      }
      setTimeout(() => setSaveSuccess(null), 4000);
    } catch (err: any) {
      console.error('Failed to save under construction settings:', err);
      setSaveError(err?.message || 'Failed to save settings. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    if (window.confirm('Reset all Under Construction settings back to default values?')) {
      setConfig(DEFAULT_UNDER_CONSTRUCTION);
    }
  };

  const applyQuotePreset = (preset: { author: string; quote: string }) => {
    setConfig((prev) => ({
      ...prev,
      quote: preset.quote,
      quoteAuthor: preset.author,
    }));
  };

  const applyTimePresetDays = (days: number) => {
    const future = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
    setConfig((prev) => ({
      ...prev,
      launchDate: future.toISOString(),
    }));
  };

  // Export subscribers to CSV
  const handleExportCSV = () => {
    if (subscribers.length === 0) return;
    const headers = ['Email', 'Subscribed Timestamp', 'User Agent'];
    const rows = subscribers.map((s) => [
      `"${s.email.replace(/"/g, '""')}"`,
      `"${new Date(s.timestamp).toLocaleString().replace(/"/g, '""')}"`,
      `"${(s.userAgent || '').replace(/"/g, '""')}"`,
    ]);
    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `sanctuary-construction-subscribers-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Convert ISO string to datetime-local format YYYY-MM-DDTHH:mm
  const formatDatetimeLocal = (isoString: string) => {
    try {
      const d = new Date(isoString);
      if (isNaN(d.getTime())) return '';
      const pad = (n: number) => String(n).padStart(2, '0');
      return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
    } catch {
      return '';
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Master Switch Bar */}
      <div className="p-6 rounded-3xl bg-slate-950/80 border border-slate-800 shadow-2xl backdrop-blur-xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                  <span>Under Construction Mode</span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs font-mono font-bold border ${
                      config.enabled
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                        : 'bg-slate-800 text-slate-400 border-slate-700'
                    }`}
                  >
                    {config.enabled ? 'ACTIVE (VISITORS SEE TEASER)' : 'DISABLED (NORMAL OPERATION)'}
                  </span>
                </h2>
                <p className="text-xs text-slate-400">
                  Toggle on to display a catchy teaser with silent 432Hz visualizer, guided breathwork, and launch countdown.
                </p>
              </div>
            </div>
          </div>

          {/* Master Toggle Button */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={async () => {
                const nextEnabled = !config.enabled;
                const updatedConfig = { ...config, enabled: nextEnabled };
                setConfig(updatedConfig);
                setSaving(true);
                try {
                  await updateSiteContent(
                    { underConstruction: updatedConfig },
                    adminEmail
                  );
                  setSaveSuccess(
                    nextEnabled
                      ? '✓ Under Construction Mode is now ACTIVE for all visitors!'
                      : '✓ Under Construction Mode turned OFF. Sanctuary is live to the public!'
                  );
                  if (onSavedNotification) {
                    onSavedNotification(
                      nextEnabled
                        ? 'Under Construction Mode is ACTIVE'
                        : 'Under Construction Mode turned OFF'
                    );
                  }
                  setTimeout(() => setSaveSuccess(null), 4000);
                } catch (err: any) {
                  setSaveError(err?.message || 'Failed to toggle mode');
                } finally {
                  setSaving(false);
                }
              }}
              disabled={saving}
              className={`px-5 py-2.5 rounded-2xl font-bold text-xs transition-all shadow-lg flex items-center gap-2 cursor-pointer ${
                config.enabled
                  ? 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-amber-500/20 ring-2 ring-amber-400/50'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
              }`}
            >
              <Power className={`w-4 h-4 ${config.enabled ? 'text-slate-950' : 'text-slate-400'}`} />
              <span>{config.enabled ? 'Mode is ON · Turn OFF' : 'Mode is OFF · Turn ON'}</span>
            </button>

            {onOpenFullscreenPreview && (
              <button
                type="button"
                onClick={onOpenFullscreenPreview}
                className="px-4 py-2.5 rounded-2xl bg-indigo-900/60 hover:bg-indigo-800/80 text-indigo-200 border border-indigo-700/60 font-bold text-xs transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
                title="Preview the exact Under Construction page seen by visitors"
              >
                <Eye className="w-4 h-4 text-indigo-400" />
                <span>Preview Visitor View</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="px-5 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-all shadow-lg shadow-emerald-600/20 flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Publishing...' : 'Save All Changes'}</span>
            </button>
          </div>
        </div>

        {/* Status Alerts */}
        {saveSuccess && (
          <div className="p-3 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{saveSuccess}</span>
          </div>
        )}

        {saveError && (
          <div className="p-3 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{saveError}</span>
          </div>
        )}

        {/* Tab switchers: Editor vs Waitlist Subscribers */}
        <div className="flex flex-wrap items-center justify-between gap-2.5 border-t border-slate-800/80 pt-3">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setEditorTab('editor')}
              className={`px-3 py-1.5 min-h-[36px] rounded-xl border text-xs font-semibold transition-colors inline-flex items-center justify-center gap-1.5 whitespace-nowrap cursor-pointer ${
                editorTab === 'editor'
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Sliders className="w-3.5 h-3.5 shrink-0" />
              <span>Teaser Content Editor &amp; Preview</span>
            </button>
            <button
              type="button"
              onClick={() => setEditorTab('subscribers')}
              className={`px-3 py-1.5 min-h-[36px] rounded-xl border text-xs font-semibold transition-colors inline-flex items-center justify-center gap-1.5 whitespace-nowrap cursor-pointer ${
                editorTab === 'subscribers'
                  ? 'bg-sky-500/20 text-sky-300 border-sky-500/40'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Users className="w-3.5 h-3.5 shrink-0" />
              <span>Waitlist Subscribers ({subscribers.length})</span>
            </button>
          </div>

          {editorTab === 'editor' && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] text-slate-400 hidden sm:inline">Preview:</span>
              <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 p-0.5 rounded-xl text-[11px]">
                <button
                  type="button"
                  onClick={() => setPreviewMode('split')}
                  className={`px-2 py-1 rounded-lg font-mono cursor-pointer ${
                    previewMode === 'split' ? 'bg-amber-500/20 text-amber-300 font-bold' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Split View
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewMode('form')}
                  className={`px-2 py-1 rounded-lg font-mono cursor-pointer ${
                    previewMode === 'form' ? 'bg-amber-500/20 text-amber-300 font-bold' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Form Only
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewMode('preview')}
                  className={`px-2 py-1 rounded-lg font-mono cursor-pointer ${
                    previewMode === 'preview' ? 'bg-amber-500/20 text-amber-300 font-bold' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Preview Only
                </button>
              </div>

              {onOpenFullscreenPreview && (
                <button
                  type="button"
                  onClick={onOpenFullscreenPreview}
                  className="min-h-[32px] px-2.5 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs border border-slate-700 transition-colors inline-flex items-center justify-center gap-1 cursor-pointer whitespace-nowrap"
                  title="Open full window preview"
                >
                  <Eye className="w-3.5 h-3.5 text-amber-400" />
                  <span className="hidden md:inline">Fullscreen</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* TAB 1: CONTENT EDITOR + LIVE PREVIEW */}
      {editorTab === 'editor' && (
        <div
          className={`grid gap-6 ${
            previewMode === 'split'
              ? 'grid-cols-1 lg:grid-cols-12'
              : previewMode === 'form'
              ? 'grid-cols-1 max-w-4xl mx-auto'
              : 'grid-cols-1'
          }`}
        >
          {/* Left Form Editor */}
          {previewMode !== 'preview' && (
            <div className={previewMode === 'split' ? 'lg:col-span-6 space-y-6' : 'space-y-6'}>
              {/* Card 1: Messaging & Headlines */}
              <div className="p-6 rounded-3xl bg-slate-950/70 border border-slate-800 space-y-4">
                <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>Main Headlines &amp; Messaging</span>
                </h3>

                {/* Title */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">
                    Main Teaser Headline
                  </label>
                  <input
                    type="text"
                    value={config.title}
                    onChange={(e) => setConfig({ ...config, title: e.target.value })}
                    placeholder="Sanctuary Under Acoustic Realignment"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 text-sm focus:outline-none focus:border-amber-400"
                  />
                </div>

                {/* Subtitle */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">
                    Subtitle Narrative
                  </label>
                  <input
                    type="text"
                    value={config.subtitle}
                    onChange={(e) => setConfig({ ...config, subtitle: e.target.value })}
                    placeholder="Calibrating harmonic frequencies and sacred acoustics for your highest tranquility."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 text-sm focus:outline-none focus:border-amber-400"
                  />
                </div>

                {/* Stay Tuned Detailed Message */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">
                    Stay Tuned Story / Maintenance Note
                  </label>
                  <textarea
                    rows={4}
                    value={config.stayTunedMessage}
                    onChange={(e) => setConfig({ ...config, stayTunedMessage: e.target.value })}
                    placeholder="Describe the upgrades or sacred alignment taking place..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 text-sm focus:outline-none focus:border-amber-400 resize-y"
                  />
                </div>
              </div>

              {/* Card 2: Sacred Quote & 1-Click Presets */}
              <div className="p-6 rounded-3xl bg-slate-950/70 border border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                    <Quote className="w-4 h-4 text-amber-400" />
                    <span>Inspirational Sacred Quote</span>
                  </h3>
                  <span className="text-[11px] text-slate-400">1-Click Presets Available</span>
                </div>

                {/* 1-Click Preset Buttons */}
                <div className="flex flex-wrap gap-1.5">
                  {SACRED_QUOTE_PRESETS.map((p, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => applyQuotePreset(p)}
                      className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-amber-300 border border-slate-800 text-[11px] transition-colors"
                      title={p.quote}
                    >
                      {p.author}
                    </button>
                  ))}
                </div>

                {/* Quote Text */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Quote Text</label>
                  <textarea
                    rows={3}
                    value={config.quote}
                    onChange={(e) => setConfig({ ...config, quote: e.target.value })}
                    placeholder="If you want to find the secrets of the universe, think in terms of energy, frequency and vibration."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 text-sm focus:outline-none focus:border-amber-400 resize-y italic font-serif"
                  />
                </div>

                {/* Author */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Quote Author / Origin</label>
                  <input
                    type="text"
                    value={config.quoteAuthor}
                    onChange={(e) => setConfig({ ...config, quoteAuthor: e.target.value })}
                    placeholder="Nikola Tesla"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 text-sm focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              {/* Card 3: Launch Countdown & Target Time */}
              <div className="p-6 rounded-3xl bg-slate-950/70 border border-slate-800 space-y-4">
                <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-amber-400" />
                  <span>Launch Countdown &amp; Schedule</span>
                </h3>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">
                    Scheduled Reopening Date &amp; Time
                  </label>
                  <input
                    type="datetime-local"
                    value={formatDatetimeLocal(config.launchDate)}
                    onChange={(e) => {
                      if (e.target.value) {
                        const parsed = new Date(e.target.value);
                        if (!isNaN(parsed.getTime())) {
                          setConfig({ ...config, launchDate: parsed.toISOString() });
                        }
                      }
                    }}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 text-sm focus:outline-none focus:border-amber-400 font-mono"
                  />
                </div>

                {/* Quick Presets */}
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-slate-400 text-[11px]">Quick Extend:</span>
                  {[1, 3, 7, 14, 30].map((days) => (
                    <button
                      key={days}
                      type="button"
                      onClick={() => applyTimePresetDays(days)}
                      className="px-2 py-0.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-[11px] text-amber-300 font-mono"
                    >
                      +{days}d
                    </button>
                  ))}
                </div>
              </div>

              {/* Card 4: Contact Email & Feature Toggles */}
              <div className="p-6 rounded-3xl bg-slate-950/70 border border-slate-800 space-y-4">
                <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                  <Mail className="w-4 h-4 text-amber-400" />
                  <span>Contact Information &amp; Interactive Widgets</span>
                </h3>

                {/* Contact Email */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-slate-300">
                      Curator Contact Email
                    </label>
                    <button
                      type="button"
                      onClick={() => setConfig({ ...config, contactEmail: 'admin@aura432hz.com' })}
                      className="text-[11px] text-amber-400 hover:underline"
                    >
                      Set default (admin@aura432hz.com)
                    </button>
                  </div>
                  <input
                    type="email"
                    value={config.contactEmail}
                    onChange={(e) => setConfig({ ...config, contactEmail: e.target.value })}
                    placeholder="admin@aura432hz.com"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 text-sm focus:outline-none focus:border-amber-400 font-mono"
                  />
                </div>

                {/* Widget Toggles */}
                <div className="space-y-3 pt-2 border-t border-slate-800">
                  <label className="text-xs font-semibold text-slate-300 block">
                    Interactive Modules Displayed to Visitors:
                  </label>

                  {/* Sacred Lotus Breathwork Visualizer Toggle */}
                  <label className="flex items-center justify-between p-3 rounded-2xl bg-slate-900/60 border border-slate-800/80 cursor-pointer hover:bg-slate-900">
                    <div className="flex items-center gap-2.5">
                      <Sparkles className="w-4 h-4 text-amber-400" />
                      <div>
                        <div className="text-xs font-semibold text-slate-200">
                          Sacred Lotus Breathwork Visualizer
                        </div>
                        <div className="text-[10px] text-slate-400">
                          Harmonic blooming lotus with guided visual breathing (pure visual, strictly zero sound)
                        </div>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={config.showVisualizer}
                      onChange={(e) => setConfig({ ...config, showVisualizer: e.target.checked })}
                      className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
                    />
                  </label>

                  {/* Countdown Timer Toggle */}
                  <label className="flex items-center justify-between p-3 rounded-2xl bg-slate-900/60 border border-slate-800/80 cursor-pointer hover:bg-slate-900">
                    <div className="flex items-center gap-2.5">
                      <Clock className="w-4 h-4 text-sky-400" />
                      <div>
                        <div className="text-xs font-semibold text-slate-200">
                          Launch Countdown Timer
                        </div>
                        <div className="text-[10px] text-slate-400">
                          Live days/hours/mins/secs ticker
                        </div>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={config.showCountdown}
                      onChange={(e) => setConfig({ ...config, showCountdown: e.target.checked })}
                      className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
                    />
                  </label>

                  {/* Email Waitlist Toggle */}
                  <label className="flex items-center justify-between p-3 rounded-2xl bg-slate-900/60 border border-slate-800/80 cursor-pointer hover:bg-slate-900">
                    <div className="flex items-center gap-2.5">
                      <Mail className="w-4 h-4 text-indigo-400" />
                      <div>
                        <div className="text-xs font-semibold text-slate-200">
                          Reopening Waitlist Signup
                        </div>
                        <div className="text-[10px] text-slate-400">
                          Lead capture form saving visitor emails
                        </div>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={config.showNewsletterSignup}
                      onChange={(e) => setConfig({ ...config, showNewsletterSignup: e.target.checked })}
                      className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
                    />
                  </label>
                </div>
              </div>

              {/* Card 5: Sacred Social Media Banner */}
              <div className="p-6 rounded-3xl bg-slate-950/70 border border-slate-800 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
                  <div>
                    <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                      <Globe className="w-4 h-4 text-sky-400" />
                      <span>Sacred Social Media Banner</span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-sky-500/20 text-sky-300 border border-sky-500/30">
                        {Object.values(liveContent.socialVisibility || {}).filter(Boolean).length} / 5 Active
                      </span>
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Configure the community social media links banner for Under Construction mode. Applies live to visitors.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsSocialModalOpen(true)}
                    className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500/20 to-sky-500/20 hover:from-amber-500/30 hover:to-sky-500/30 text-amber-300 hover:text-amber-200 border border-amber-400/40 text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm active:scale-95 cursor-pointer self-start sm:self-auto"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Open Full Social Editor Modal</span>
                  </button>
                </div>

                {socialActionNotice && (
                  <div className="p-2.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs flex items-center gap-2 animate-in fade-in">
                    <Check className="w-3.5 h-3.5 text-amber-400" />
                    <span>{socialActionNotice}</span>
                  </div>
                )}

                {/* Main Banner Visibility Toggle */}
                <label className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 cursor-pointer hover:bg-slate-900 transition-colors">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-sky-500/15 border border-sky-500/30 text-sky-400">
                      <Share2 className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-slate-100">
                        Display Social Media Banner in Under Construction Mode
                      </div>
                      <div className="text-[10px] text-slate-400">
                        Shows lotus social icons and community invitations to public visitors
                      </div>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={config.showSocialBanner !== false}
                    onChange={(e) => setConfig({ ...config, showSocialBanner: e.target.checked })}
                    className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
                  />
                </label>

                {/* Custom Headline for Under Construction Mode */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-slate-300">
                      Social Banner Teaser Headline
                    </label>
                    <button
                      type="button"
                      onClick={() => setConfig({ ...config, socialHeadline: 'Connect with our Sanctuary Community • Follow our Reopening Journey' })}
                      className="text-[10px] text-amber-400 hover:underline"
                    >
                      Default Reopening Headline
                    </button>
                  </div>
                  <input
                    type="text"
                    value={config.socialHeadline ?? ''}
                    onChange={(e) => setConfig({ ...config, socialHeadline: e.target.value })}
                    placeholder="Connect with our Sanctuary Community • Follow our Reopening Journey"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 text-xs sm:text-sm focus:outline-none focus:border-amber-400"
                  />
                </div>

                {/* Live Preview Box & Quick 1-Action Bulk Visibility */}
                <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-slate-300 flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5 text-amber-400" />
                      <span>Live Banner Preview &amp; 1-Click Visibility</span>
                    </span>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleBulkSocialVisibility(true)}
                        className="px-2.5 py-1 rounded-lg text-[10px] font-semibold bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 transition-all flex items-center gap-1 cursor-pointer active:scale-95"
                        title="Show all social media icons across the sanctuary"
                      >
                        <Eye className="w-3 h-3" />
                        <span>Show All</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleBulkSocialVisibility(false)}
                        className="px-2.5 py-1 rounded-lg text-[10px] font-semibold bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 transition-all flex items-center gap-1 cursor-pointer active:scale-95"
                        title="Hide all social media icons"
                      >
                        <EyeOff className="w-3 h-3" />
                        <span>Hide All</span>
                      </button>
                    </div>
                  </div>

                  {/* Visual Lotus Icons Preview - Exact sync with Main Page & Under Construction mode */}
                  <div className="py-3 px-2 rounded-xl bg-slate-950/80 border border-slate-800/80 flex flex-col items-center justify-center gap-2">
                    <SacredSocialLinks
                      size={36}
                      showLabels={true}
                      headline={config.socialHeadline || socialForm.socialHeadline || 'Connect with our Sanctuary Community • Follow our Reopening Journey'}
                      className="w-full"
                    />
                  </div>
                </div>

                {/* Direct Platform Quick Toggle & URL Edit Cards - Synced with Main Page */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  {/* 1. Facebook */}
                  <div className="p-3 rounded-xl bg-slate-900/70 border border-slate-800 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-sky-300">Facebook</span>
                      <div className="flex items-center gap-2">
                        <label className="flex items-center gap-1 cursor-pointer text-xs select-none">
                          <input
                            type="checkbox"
                            checked={Boolean(liveContent.socialVisibility?.facebook ?? true)}
                            onChange={(e) => handleToggleSingleVisibility('facebook', e.target.checked)}
                            className="w-3.5 h-3.5 rounded text-sky-500 accent-sky-400"
                          />
                          <span className={`text-[10px] font-semibold ${liveContent.socialVisibility?.facebook ?? true ? 'text-sky-300' : 'text-slate-500'}`}>
                            {liveContent.socialVisibility?.facebook ?? true ? 'Visible' : 'Hidden'}
                          </span>
                        </label>
                        {socialForm.facebookUrl && (
                          <a href={socialForm.facebookUrl} target="_blank" rel="noopener noreferrer" className="text-sky-400 hover:text-sky-300">
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                    </div>
                    <input
                      type="url"
                      value={socialForm.facebookUrl || ''}
                      onChange={(e) => setSocialForm({ ...socialForm, facebookUrl: e.target.value })}
                      placeholder="https://facebook.com/..."
                      className="w-full px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-[11px] text-slate-200 font-mono focus:border-sky-400 focus:outline-none"
                    />
                  </div>

                  {/* 2. Instagram */}
                  <div className="p-3 rounded-xl bg-slate-900/70 border border-slate-800 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-rose-300">Instagram</span>
                      <div className="flex items-center gap-2">
                        <label className="flex items-center gap-1 cursor-pointer text-xs select-none">
                          <input
                            type="checkbox"
                            checked={Boolean(liveContent.socialVisibility?.instagram ?? true)}
                            onChange={(e) => handleToggleSingleVisibility('instagram', e.target.checked)}
                            className="w-3.5 h-3.5 rounded text-rose-500 accent-rose-400"
                          />
                          <span className={`text-[10px] font-semibold ${liveContent.socialVisibility?.instagram ?? true ? 'text-rose-300' : 'text-slate-500'}`}>
                            {liveContent.socialVisibility?.instagram ?? true ? 'Visible' : 'Hidden'}
                          </span>
                        </label>
                        {socialForm.instagramUrl && (
                          <a href={socialForm.instagramUrl} target="_blank" rel="noopener noreferrer" className="text-rose-400 hover:text-rose-300">
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                    </div>
                    <input
                      type="url"
                      value={socialForm.instagramUrl || ''}
                      onChange={(e) => setSocialForm({ ...socialForm, instagramUrl: e.target.value })}
                      placeholder="https://instagram.com/..."
                      className="w-full px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-[11px] text-slate-200 font-mono focus:border-rose-400 focus:outline-none"
                    />
                  </div>

                  {/* 3. TikTok */}
                  <div className="p-3 rounded-xl bg-slate-900/70 border border-slate-800 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-emerald-300">TikTok</span>
                      <div className="flex items-center gap-2">
                        <label className="flex items-center gap-1 cursor-pointer text-xs select-none">
                          <input
                            type="checkbox"
                            checked={Boolean(liveContent.socialVisibility?.tiktok ?? true)}
                            onChange={(e) => handleToggleSingleVisibility('tiktok', e.target.checked)}
                            className="w-3.5 h-3.5 rounded text-emerald-500 accent-emerald-400"
                          />
                          <span className={`text-[10px] font-semibold ${liveContent.socialVisibility?.tiktok ?? true ? 'text-emerald-300' : 'text-slate-500'}`}>
                            {liveContent.socialVisibility?.tiktok ?? true ? 'Visible' : 'Hidden'}
                          </span>
                        </label>
                        {socialForm.tiktokUrl && (
                          <a href={socialForm.tiktokUrl} target="_blank" rel="noopener noreferrer" className="text-emerald-400 hover:text-emerald-300">
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                    </div>
                    <input
                      type="url"
                      value={socialForm.tiktokUrl || ''}
                      onChange={(e) => setSocialForm({ ...socialForm, tiktokUrl: e.target.value })}
                      placeholder="https://tiktok.com/@..."
                      className="w-full px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-[11px] text-slate-200 font-mono focus:border-emerald-400 focus:outline-none"
                    />
                  </div>

                  {/* 4. YouTube */}
                  <div className="p-3 rounded-xl bg-slate-900/70 border border-slate-800 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-red-300">YouTube</span>
                      <div className="flex items-center gap-2">
                        <label className="flex items-center gap-1 cursor-pointer text-xs select-none">
                          <input
                            type="checkbox"
                            checked={Boolean(liveContent.socialVisibility?.youtube ?? true)}
                            onChange={(e) => handleToggleSingleVisibility('youtube', e.target.checked)}
                            className="w-3.5 h-3.5 rounded text-red-500 accent-red-400"
                          />
                          <span className={`text-[10px] font-semibold ${liveContent.socialVisibility?.youtube ?? true ? 'text-red-300' : 'text-slate-500'}`}>
                            {liveContent.socialVisibility?.youtube ?? true ? 'Visible' : 'Hidden'}
                          </span>
                        </label>
                        {socialForm.youtubeUrl && (
                          <a href={socialForm.youtubeUrl} target="_blank" rel="noopener noreferrer" className="text-red-400 hover:text-red-300">
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                    </div>
                    <input
                      type="url"
                      value={socialForm.youtubeUrl || ''}
                      onChange={(e) => setSocialForm({ ...socialForm, youtubeUrl: e.target.value })}
                      placeholder="https://www.youtube.com/@Aura432Hz-d1g"
                      className="w-full px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-[11px] text-slate-200 font-mono focus:border-red-400 focus:outline-none"
                    />
                  </div>

                  {/* 5. X / Twitter */}
                  <div className="p-3 rounded-xl bg-slate-900/70 border border-slate-800 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-sky-200">X (Twitter)</span>
                      <div className="flex items-center gap-2">
                        <label className="flex items-center gap-1 cursor-pointer text-xs select-none">
                          <input
                            type="checkbox"
                            checked={Boolean(liveContent.socialVisibility?.twitter ?? true)}
                            onChange={(e) => handleToggleSingleVisibility('twitter', e.target.checked)}
                            className="w-3.5 h-3.5 rounded text-sky-400 accent-sky-400"
                          />
                          <span className={`text-[10px] font-semibold ${liveContent.socialVisibility?.twitter ?? true ? 'text-sky-300' : 'text-slate-500'}`}>
                            {liveContent.socialVisibility?.twitter ?? true ? 'Visible' : 'Hidden'}
                          </span>
                        </label>
                        {socialForm.twitterUrl && (
                          <a href={socialForm.twitterUrl} target="_blank" rel="noopener noreferrer" className="text-sky-400 hover:text-sky-300">
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                    </div>
                    <input
                      type="url"
                      value={socialForm.twitterUrl || ''}
                      onChange={(e) => setSocialForm({ ...socialForm, twitterUrl: e.target.value })}
                      placeholder="https://x.com/..."
                      className="w-full px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-[11px] text-slate-200 font-mono focus:border-sky-400 focus:outline-none"
                    />
                  </div>

                  {/* 6. Telegram */}
                  <div className="p-3 rounded-xl bg-slate-900/70 border border-slate-800 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-sky-400">Telegram</span>
                      <div className="flex items-center gap-2">
                        <label className="flex items-center gap-1 cursor-pointer text-xs select-none">
                          <input
                            type="checkbox"
                            checked={Boolean(liveContent.socialVisibility?.telegram ?? true)}
                            onChange={(e) => handleToggleSingleVisibility('telegram', e.target.checked)}
                            className="w-3.5 h-3.5 rounded text-sky-400 accent-sky-400"
                          />
                          <span className={`text-[10px] font-semibold ${liveContent.socialVisibility?.telegram ?? true ? 'text-sky-300' : 'text-slate-500'}`}>
                            {liveContent.socialVisibility?.telegram ?? true ? 'Visible' : 'Hidden'}
                          </span>
                        </label>
                        {socialForm.telegramUrl && (
                          <a href={socialForm.telegramUrl} target="_blank" rel="noopener noreferrer" className="text-sky-400 hover:text-sky-300">
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                    </div>
                    <input
                      type="url"
                      value={socialForm.telegramUrl || ''}
                      onChange={(e) => setSocialForm({ ...socialForm, telegramUrl: e.target.value })}
                      placeholder="https://t.me/..."
                      className="w-full px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-[11px] text-slate-200 font-mono focus:border-sky-400 focus:outline-none"
                    />
                  </div>

                  {/* 7. Custom Sanctuary Channels & Links */}
                  <div className="sm:col-span-2 p-3.5 rounded-xl bg-slate-900/70 border border-slate-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Link2 className="w-4 h-4 text-purple-400" />
                        <span className="text-xs font-semibold text-purple-200">Custom Sanctuary Channels (Spotify, SoundCloud, Bandcamp, Website)</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          const newLinks: CustomSocialLink[] = [
                            ...(socialForm.customLinks || []),
                            {
                              id: 'custom_' + Date.now(),
                              label: '',
                              url: '',
                              visible: true,
                            },
                          ];
                          setSocialForm({ ...socialForm, customLinks: newLinks });
                        }}
                        className="px-2.5 py-1 rounded-lg text-[10px] font-semibold bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/40 transition-all flex items-center gap-1 cursor-pointer active:scale-95"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Add Custom Link</span>
                      </button>
                    </div>

                    {(!socialForm.customLinks || socialForm.customLinks.length === 0) ? (
                      <p className="text-[11px] text-slate-500 italic">No custom channels added. Click "+ Add Custom Link" above to add your music, stream, or community channels.</p>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {socialForm.customLinks.map((link, idx) => (
                          <div key={link.id || idx} className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 space-y-2">
                            <div className="flex items-center justify-between gap-2">
                              <input
                                type="text"
                                value={link.label}
                                onChange={(e) => {
                                  const updated = [...(socialForm.customLinks || [])];
                                  updated[idx] = { ...updated[idx], label: e.target.value };
                                  setSocialForm({ ...socialForm, customLinks: updated });
                                }}
                                placeholder="Channel Name (e.g. Spotify)"
                                className="w-1/2 bg-slate-900 border border-slate-750 rounded-lg px-2 py-1 text-xs text-slate-200 focus:outline-none focus:border-purple-400 font-medium"
                              />
                              <div className="flex items-center gap-2">
                                <label className="flex items-center gap-1 cursor-pointer text-xs select-none">
                                  <input
                                    type="checkbox"
                                    checked={link.visible !== false}
                                    onChange={(e) => {
                                      const updated = [...(socialForm.customLinks || [])];
                                      updated[idx] = { ...updated[idx], visible: e.target.checked };
                                      setSocialForm({ ...socialForm, customLinks: updated });
                                    }}
                                    className="w-3.5 h-3.5 rounded text-purple-500 bg-slate-900 border-slate-750 cursor-pointer accent-purple-400"
                                  />
                                  <span className={`text-[10px] font-semibold ${link.visible !== false ? 'text-purple-300' : 'text-slate-500'}`}>
                                    {link.visible !== false ? 'Visible' : 'Hidden'}
                                  </span>
                                </label>
                                {link.url && (
                                  <a href={link.url} target="_blank" rel="noopener noreferrer" className="text-purple-400 hover:text-purple-300">
                                    <ExternalLink className="w-3 h-3" />
                                  </a>
                                )}
                                <button
                                  type="button"
                                  onClick={() => {
                                    const updated = (socialForm.customLinks || []).filter((_, i) => i !== idx);
                                    setSocialForm({ ...socialForm, customLinks: updated });
                                  }}
                                  className="p-1 text-slate-500 hover:text-rose-400 transition-colors cursor-pointer"
                                  title="Remove link"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>
                            </div>
                            <input
                              type="url"
                              value={link.url}
                              onChange={(e) => {
                                const updated = [...(socialForm.customLinks || [])];
                                updated[idx] = { ...updated[idx], url: e.target.value };
                                setSocialForm({ ...socialForm, customLinks: updated });
                              }}
                              placeholder="https://..."
                              className="w-full bg-slate-900 border border-slate-750 rounded-lg px-2.5 py-1 text-xs text-slate-200 focus:outline-none focus:border-purple-400 font-mono"
                            />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Card 5 Quick Save Button */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-800">
                  <span className="text-[11px] text-slate-400">
                    Saves and synchronizes social media links &amp; custom channels across both Under Construction mode and Main Sanctuary pages.
                  </span>
                  <button
                    type="button"
                    onClick={handleSaveInlineSocials}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-sky-400 to-indigo-500 hover:from-sky-300 hover:to-indigo-400 text-slate-950 font-bold text-xs transition-all shadow-md flex items-center gap-1.5 cursor-pointer active:scale-95 shrink-0"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Save Social Links</span>
                  </button>
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={handleReset}
                  className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 text-xs border border-slate-800 transition-colors flex items-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset to Sanctuary Defaults</span>
                </button>

                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving}
                  className="px-6 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-all shadow-lg shadow-emerald-600/20 flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  <span>{saving ? 'Publishing...' : 'Save & Publish Live'}</span>
                </button>
              </div>
            </div>
          )}

          {/* Right: Real-time Live Preview */}
          {previewMode !== 'form' && (
            <div className={previewMode === 'split' ? 'lg:col-span-6 space-y-3' : 'space-y-3'}>
              <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
                  <Eye className="w-4 h-4 text-amber-400" />
                  <span>Live Interactive Preview</span>
                  <span className="text-[11px] text-slate-400">(Updates in real-time)</span>
                </div>

                <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 p-0.5 rounded-xl text-[11px]">
                  <button
                    type="button"
                    onClick={() => setPreviewDevice('desktop')}
                    className={`px-2 py-1 rounded-lg inline-flex items-center gap-1 transition-all cursor-pointer ${
                      previewDevice === 'desktop' ? 'bg-slate-800 text-amber-300 font-bold' : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Monitor className="w-3 h-3" />
                    <span>Desktop</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewDevice('tablet')}
                    className={`px-2 py-1 rounded-lg inline-flex items-center gap-1 transition-all cursor-pointer ${
                      previewDevice === 'tablet' ? 'bg-slate-800 text-amber-300 font-bold' : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Tablet className="w-3 h-3" />
                    <span>Tablet</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewDevice('mobile')}
                    className={`px-2 py-1 rounded-lg inline-flex items-center gap-1 transition-all cursor-pointer ${
                      previewDevice === 'mobile' ? 'bg-slate-800 text-amber-300 font-bold' : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Smartphone className="w-3 h-3" />
                    <span>Mobile</span>
                  </button>
                </div>
              </div>

              {/* Scaled Preview Frame with Tablet / Desktop / Mobile sizing */}
              <div
                className={`rounded-3xl border-2 border-slate-800 bg-slate-950 overflow-hidden shadow-2xl transition-all duration-300 ${
                  previewDevice === 'mobile'
                    ? 'max-w-sm mx-auto'
                    : previewDevice === 'tablet'
                    ? 'max-w-[768px] mx-auto'
                    : 'w-full'
                }`}
                style={{ maxHeight: '720px', height: '720px' }}
              >
                <div className="h-full overflow-y-auto transform origin-top">
                  <UnderConstructionPage
                    customConfig={config}
                    isPreview={false}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: WAITLIST SUBSCRIBERS */}
      {editorTab === 'subscribers' && (
        <div className="p-6 rounded-3xl bg-slate-950/70 border border-slate-800 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                <Users className="w-4 h-4 text-sky-400" />
                <span>Sanctuary Reopening Waitlist Leads</span>
              </h3>
              <p className="text-xs text-slate-400">
                Visitors who signed up during Under Construction mode to receive launch notification.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={loadSubscribers}
                disabled={loadingSubscribers}
                className="min-h-[34px] px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs border border-slate-800 transition-colors inline-flex items-center justify-center cursor-pointer whitespace-nowrap"
              >
                {loadingSubscribers ? 'Refreshing...' : 'Refresh List'}
              </button>
              <button
                type="button"
                onClick={handleExportCSV}
                disabled={subscribers.length === 0}
                className="min-h-[34px] px-3 py-1.5 rounded-xl border border-transparent bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition-colors inline-flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer whitespace-nowrap"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export CSV ({subscribers.length})</span>
              </button>
            </div>
          </div>

          <div className="border border-slate-800 rounded-2xl overflow-hidden bg-slate-900/50">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/90 text-slate-400 uppercase tracking-wider text-[10px] border-b border-slate-800">
                <tr>
                  <th className="py-2.5 px-4">#</th>
                  <th className="py-2.5 px-4">Email Address</th>
                  <th className="py-2.5 px-4">Subscribed At</th>
                  <th className="py-2.5 px-4">Device</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {subscribers.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-slate-500 text-xs">
                      {loadingSubscribers
                        ? 'Loading registered leads...'
                        : 'No visitor signups recorded yet. Leads will appear here once visitors submit their email.'}
                    </td>
                  </tr>
                ) : (
                  subscribers.map((sub, idx) => (
                    <tr key={sub.id || idx} className="hover:bg-slate-900/40">
                      <td className="py-2.5 px-4 text-slate-500 font-mono text-[11px]">{idx + 1}</td>
                      <td className="py-2.5 px-4 font-mono font-medium text-amber-300">{sub.email}</td>
                      <td className="py-2.5 px-4 text-slate-400 font-mono text-[11px]">
                        {new Date(sub.timestamp).toLocaleString()}
                      </td>
                      <td className="py-2.5 px-4 text-slate-400 text-[11px] truncate max-w-[200px]">
                        {sub.userAgent || 'Web Visitor'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Full Social Accounts Modal */}
      <SocialAccountsModal
        isOpen={isSocialModalOpen}
        onClose={() => setIsSocialModalOpen(false)}
        accounts={{
          facebookUrl: socialForm.facebookUrl || 'https://facebook.com',
          instagramUrl: socialForm.instagramUrl || 'https://instagram.com',
          tiktokUrl: socialForm.tiktokUrl || 'https://tiktok.com',
          youtubeUrl: socialForm.youtubeUrl || 'https://www.youtube.com/@Aura432Hz-d1g',
          twitterUrl: socialForm.twitterUrl || 'https://x.com',
          telegramUrl: socialForm.telegramUrl || '',
          socialHeadline: config.socialHeadline || socialForm.socialHeadline,
          socialSubtext: socialForm.socialSubtext,
          customLinks: socialForm.customLinks || [],
        }}
        onSave={handleSaveSocialAccounts}
      />
    </div>
  );
};
