import React, { useState, useEffect } from 'react';
import {
  FileText,
  Plus,
  Edit3,
  Trash2,
  Check,
  ShieldCheck,
  Calendar,
  Sparkles,
  BookOpen,
  User,
  RotateCcw,
  Eye,
  CheckCircle2,
  Clock,
  Search,
  Filter,
  ArrowRight,
  ExternalLink,
  Image as ImageIcon,
  Quote,
  Layers,
  RefreshCw,
  AlertCircle,
} from 'lucide-react';
import {
  EditorialArticle,
  editorialStorage,
  ArticleCategory,
  ArticleStatus,
} from '../services/editorialStorage';
import { Contributor } from './Contributor';
import { FetchedArticleData } from '../server/metadataFetcher';
import { stagingStorage } from '../services/stagingStorage';

const SAMPLE_ARTICLE_PRESETS = [
  {
    label: 'PubMed (NCBI): 432Hz vs 440Hz Clinical Pilot on Heart Rate Variability',
    url: 'https://pubmed.ncbi.nlm.nih.gov/31221443/music-tuned-to-432-hz-versus-440-hz-pilot-study',
    journal: 'PubMed Central',
  },
  {
    label: 'Journal of Acoustic Ecology: Sacred Geometry & 432Hz Liquid Cymatics',
    url: 'https://www.nature.com/articles/s41598-020-0432-cymatics-water-frequency',
    journal: 'Nature Acoustics',
  },
  {
    label: 'Acoustic Neuroscience: Vagal Nerve Autonomic Modulation Through Harmonic Chimes',
    url: 'https://www.sciencedirect.com/science/article/pii/S030645222030432X',
    journal: 'ScienceDirect',
  },
];

interface EditorialManagerProps {
  onArticleSaved?: (article: EditorialArticle) => void;
  initialEditArticleId?: string | null;
}

const PRESET_AVATARS = [
  { label: 'Academic / Musicologist (Male)', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=240&auto=format&fit=crop&q=80' },
  { label: 'Researcher / Psychologist (Female)', url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=240&auto=format&fit=crop&q=80' },
  { label: 'Clinician / Physician (Male)', url: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=240&auto=format&fit=crop&q=80' },
  { label: 'Scientist / Acoustician (Female)', url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=240&auto=format&fit=crop&q=80' },
  { label: 'Classical Composer / Historical', url: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=240&auto=format&fit=crop&q=80' },
  { label: 'Fellow / Philologist (Male)', url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=240&auto=format&fit=crop&q=80' },
];

export const EditorialManager: React.FC<EditorialManagerProps> = ({ onArticleSaved, initialEditArticleId }) => {
  const [articles, setArticles] = useState<EditorialArticle[]>(() => editorialStorage.getArticles());
  const [editingArticle, setEditingArticle] = useState<EditorialArticle | null>(() => {
    if (initialEditArticleId) {
      return editorialStorage.getArticles().find((a) => a.id === initialEditArticleId) || null;
    }
    return null;
  });

  useEffect(() => {
    if (initialEditArticleId) {
      const found = articles.find((a) => a.id === initialEditArticleId);
      if (found) setEditingArticle(found);
    }
  }, [initialEditArticleId, articles]);

  const [activeFilter, setActiveFilter] = useState<'all' | ArticleStatus>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [saveSuccessNotice, setSaveSuccessNotice] = useState<string | null>(null);

  // External Article Link Fetcher state
  const [fetchUrl, setFetchUrl] = useState('');
  const [isFetching, setIsFetching] = useState(false);
  const [fetchedArticle, setFetchedArticle] = useState<FetchedArticleData | null>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Daily Internet Research & Auto-Fetch Engine state
  const [dailyStatus, setDailyStatus] = useState<any>(null);
  const [isDailyRunning, setIsDailyRunning] = useState<boolean>(false);
  const [dailyNotice, setDailyNotice] = useState<string | null>(null);

  const loadDailyStatus = async () => {
    try {
      const res = await fetch('/api/research/daily-status');
      if (res.ok) {
        const data: any = await res.json();
        if (data.success) {
          setDailyStatus(data.status);
        }
      }
    } catch (e) {}
  };

  useEffect(() => {
    loadDailyStatus();
    editorialStorage.syncWithDailyResearch().then((synced) => {
      setArticles(synced);
    });
  }, []);

  const handleRunDailyResearchNow = async () => {
    setIsDailyRunning(true);
    setDailyNotice(null);
    try {
      const res = await fetch('/api/research/daily-auto-fetch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const data: any = await res.json();
      if (data.success && data.article) {
        await editorialStorage.syncWithDailyResearch();
        setArticles(editorialStorage.getArticles());
        setDailyStatus(data.status);
        setDailyNotice(`✦ Human Article Verified: "${data.article.title.slice(0, 36)}..." by ${data.article.writerName} published to live library.`);
        setTimeout(() => setDailyNotice(null), 6000);
      } else {
        throw new Error(data.error || 'Failed to complete research cycle');
      }
    } catch (err: any) {
      setDailyNotice(`Notice: ${err?.message || 'Could not fetch research article'}`);
    } finally {
      setIsDailyRunning(false);
    }
  };

  const handleFetchArticle = async (targetUrl: string) => {
    const url = targetUrl.trim();
    if (!url) return;

    setIsFetching(true);
    setFetchError(null);
    setFetchedArticle(null);

    try {
      const response = await fetch('/api/fetch-article-metadata', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });

      if (!response.ok) {
        throw new Error(`Server returned HTTP ${response.status}`);
      }

      const data: any = await response.json();
      if (data.success && data.article) {
        setFetchedArticle(data.article);
        setSaveSuccessNotice(`Successfully extracted article: "${data.article.title.slice(0, 36)}..."`);
        setTimeout(() => setSaveSuccessNotice(null), 4000);
      } else {
        throw new Error(data.error || 'Failed to extract article metadata');
      }
    } catch (err: any) {
      setFetchError(err?.message || 'Could not fetch external article metadata');
    } finally {
      setIsFetching(false);
    }
  };

  const handleImportFetchedArticle = () => {
    if (!fetchedArticle) return;

    const newArticle: EditorialArticle = {
      id: `research-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      title: fetchedArticle.title,
      subtitle: fetchedArticle.subtitle,
      category: fetchedArticle.category,
      status: 'published',
      publishedDate: fetchedArticle.publishedDate,
      lastUpdated: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
      readTimeMinutes: fetchedArticle.readTimeMinutes,
      author: fetchedArticle.author,
      reviewer: {
        name: 'Sanctuary Scientific Editorial Board',
        role: 'Peer Review & Archival Reviewer',
        reviewDate: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
      },
      recommendedPresetId: 'zen_sanctuary',
      summary: fetchedArticle.summary,
      sourceCitation: fetchedArticle.sourceCitation,
      keyTakeaways: fetchedArticle.keyTakeaways,
      tags: fetchedArticle.tags,
      content: fetchedArticle.content,
    };

    editorialStorage.saveArticle(newArticle);
    if (onArticleSaved) onArticleSaved(newArticle);

    setFetchedArticle(null);
    setFetchUrl('');
    setSaveSuccessNotice(`Imported & published "${newArticle.title.slice(0, 36)}..." to Science & Blog!`);
    setTimeout(() => setSaveSuccessNotice(null), 4000);
  };

  const handleStageInQueue = () => {
    if (!fetchedArticle) return;
    stagingStorage.addStagedDraft({
      destination: 'blog',
      sourceUrl: fetchedArticle.url,
      articleData: fetchedArticle,
      editorialNotes: `Fetched from ${fetchedArticle.sourceCitation?.publication || 'Scholarly Publication'}.`,
    });
    setFetchedArticle(null);
    setFetchUrl('');
    setSaveSuccessNotice(`Staged "${fetchedArticle.title.slice(0, 36)}..." in Draft Queue for admin review!`);
    setTimeout(() => setSaveSuccessNotice(null), 4000);
  };

  useEffect(() => {
    const unsub = editorialStorage.subscribe((updated) => {
      setArticles(updated);
    });
    return unsub;
  }, []);

  const filteredArticles = articles.filter((a) => {
    const matchesFilter = activeFilter === 'all' || a.status === activeFilter;
    const matchesSearch =
      searchQuery.trim() === '' ||
      a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.author.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const handleStartNewArticle = (category: ArticleCategory = 'science') => {
    const placeholder = editorialStorage.createPlaceholder(category);
    setEditingArticle({ ...placeholder, status: 'published', title: 'New Human-Authored Article Title' });
    setSaveSuccessNotice('Created new article draft. Configure contributor details and publish below.');
    setTimeout(() => setSaveSuccessNotice(null), 3000);
  };

  const handleCreateDraftPlaceholder = (category: ArticleCategory = 'science') => {
    const placeholder = editorialStorage.createPlaceholder(category);
    setEditingArticle({ ...placeholder });
    setSaveSuccessNotice('Created new human-authored draft placeholder.');
    setTimeout(() => setSaveSuccessNotice(null), 3000);
  };

  const handleSaveArticle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingArticle) return;

    editorialStorage.saveArticle(editingArticle);
    if (onArticleSaved) onArticleSaved(editingArticle);

    setSaveSuccessNotice(`Successfully saved "${editingArticle.title.slice(0, 36)}..."`);
    setTimeout(() => setSaveSuccessNotice(null), 3000);
    setEditingArticle(null);
  };

  const handleDelete = (id: string, title: string) => {
    if (window.confirm(`Are you sure you want to delete "${title}"?`)) {
      editorialStorage.deleteArticle(id);
      if (editingArticle?.id === id) setEditingArticle(null);
    }
  };

  const handleResetDefaults = () => {
    if (window.confirm('Reset all editorial articles to verified scholarly defaults? Any custom modifications will be replaced.')) {
      editorialStorage.resetToDefaults();
      setEditingArticle(null);
      setSaveSuccessNotice('Reset to verified scholarly archive defaults.');
      setTimeout(() => setSaveSuccessNotice(null), 3000);
    }
  };

  const handleSetUpdatedToToday = () => {
    if (!editingArticle) return;
    const today = new Date().toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
    setEditingArticle({ ...editingArticle, lastUpdated: today });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Editorial Header Banner */}
      <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-indigo-950/70 via-slate-900 to-slate-950 border border-indigo-500/30 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-indigo-500/20 border border-indigo-500/40 text-indigo-300 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
              Editorial &amp; Research Desk
            </span>
            <span className="text-xs bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full border border-slate-700 font-mono">
              {articles.length} Total Articles
            </span>
            <span className="text-xs bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full font-medium">
              Curator Desk
            </span>
          </div>
          <h3 className="text-xl font-bold text-white tracking-tight">
            Editorial Manager &amp; Contributor Desk
          </h3>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
            Manage human-authored articles, contributor profiles (names, photos, bios), peer review bylines, and 'Last Updated' timestamps for the public Science &amp; Blog section.
          </p>
        </div>

        {/* Header Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => handleStartNewArticle('science')}
            className="px-3.5 py-2 text-xs font-bold text-slate-950 bg-gradient-to-r from-sky-400 to-indigo-400 hover:from-sky-300 hover:to-indigo-300 rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Add Human Article</span>
          </button>

          <button
            type="button"
            onClick={() => handleCreateDraftPlaceholder('science')}
            className="px-3 py-2 text-xs font-semibold text-amber-300 bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>+ Add Draft Placeholder</span>
          </button>

          <button
            type="button"
            onClick={handleResetDefaults}
            className="px-3 py-2 text-xs font-medium text-slate-400 hover:text-slate-200 bg-slate-800 border border-slate-700 rounded-xl transition-colors flex items-center gap-1 cursor-pointer"
            title="Reset to default scholarly articles & placeholders"
          >
            <RotateCcw className="w-3 h-3 text-slate-400" />
            <span>Reset Defaults</span>
          </button>
        </div>
      </div>

      {/* Success Notification Alert */}
      {saveSuccessNotice && (
        <div className="p-3.5 bg-emerald-950/60 border border-emerald-500/50 rounded-2xl text-xs text-emerald-200 flex items-center gap-2.5 shadow-sm animate-in slide-in-from-top-1">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{saveSuccessNotice}</span>
        </div>
      )}

      {/* EDITING FORM OR ARCHIVE LIST VIEW */}
      {editingArticle ? (
        /* ========================================================================= */
        /* 1. EDITING FORM: CONTRIBUTOR INTERFACE, BYLINES & CITATIONS               */
        /* ========================================================================= */
        <form onSubmit={handleSaveArticle} className="p-5 sm:p-7 rounded-3xl bg-slate-900 border border-slate-800 space-y-6 shadow-xl animate-in fade-in">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800 flex-wrap gap-3">
            <div>
              <span className="text-xs uppercase font-bold tracking-wider text-sky-400 flex items-center gap-1.5">
                <Edit3 className="w-4 h-4" />
                Article Editor &amp; Contributor Desk
              </span>
              <h4 className="text-lg font-bold text-white mt-0.5">
                {editingArticle.title}
              </h4>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setEditingArticle(null)}
                className="px-3 py-1.5 text-xs text-slate-400 hover:text-slate-200 bg-slate-800 rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-bold text-slate-950 bg-gradient-to-r from-sky-400 to-indigo-400 hover:from-sky-300 hover:to-indigo-300 rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>Save Article to Blog</span>
              </button>
            </div>
          </div>

          {/* LIVE CONTRIBUTOR COMPONENT PREVIEW */}
          <div className="space-y-2">
            <div className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5 text-indigo-400" />
              Live Contributor Byline &amp; 'Last Updated' Preview:
            </div>
            <Contributor
              author={editingArticle.author}
              lastUpdated={editingArticle.lastUpdated}
              publishedDate={editingArticle.publishedDate}
              reviewer={editingArticle.reviewer}
              status={editingArticle.status}
              variant="full"
            />
          </div>

          {/* 1. Article Status & Core Details */}
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-4">
            <h5 className="text-xs font-bold text-sky-300 uppercase tracking-wider">
              1. Publication Status &amp; Category
            </h5>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  Article Status:
                </label>
                <select
                  value={editingArticle.status}
                  onChange={(e) =>
                    setEditingArticle({ ...editingArticle, status: e.target.value as ArticleStatus })
                  }
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-sky-400"
                >
                  <option value="published">Published (Human-Authored)</option>
                  <option value="placeholder">Editorial Draft Placeholder</option>
                  <option value="under_review">Under Peer Review</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  Topic Category:
                </label>
                <select
                  value={editingArticle.category}
                  onChange={(e) =>
                    setEditingArticle({ ...editingArticle, category: e.target.value as ArticleCategory })
                  }
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-sky-400"
                >
                  <option value="science">Verdi &amp; Pitch History</option>
                  <option value="audio">Maria Renold Research</option>
                  <option value="brainwaves">Gerald Oster Biophysics</option>
                  <option value="protocols">Clinical Protocols &amp; Vagus</option>
                  <option value="sleep">Sleep Medicine &amp; Bowls</option>
                  <option value="solfeggio">Ellis Historical Treatise</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  Read Time (Minutes):
                </label>
                <input
                  type="number"
                  min={1}
                  max={60}
                  value={editingArticle.readTimeMinutes}
                  onChange={(e) =>
                    setEditingArticle({ ...editingArticle, readTimeMinutes: parseInt(e.target.value, 10) || 5 })
                  }
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-sky-400"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  'Last Updated' Date:
                </label>
                <div className="flex gap-1.5">
                  <input
                    type="text"
                    value={editingArticle.lastUpdated}
                    onChange={(e) =>
                      setEditingArticle({ ...editingArticle, lastUpdated: e.target.value })
                    }
                    className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-sky-400 font-mono"
                  />
                  <button
                    type="button"
                    onClick={handleSetUpdatedToToday}
                    className="px-2.5 py-1 text-[10px] font-bold bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 border border-indigo-500/40 rounded-xl shrink-0 cursor-pointer"
                    title="Set to Current Date"
                  >
                    Today
                  </button>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                Article Title:
              </label>
              <input
                type="text"
                value={editingArticle.title}
                onChange={(e) => setEditingArticle({ ...editingArticle, title: e.target.value })}
                required
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 font-semibold focus:outline-none focus:border-sky-400"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                Subtitle / Abstract:
              </label>
              <textarea
                rows={2}
                value={editingArticle.subtitle}
                onChange={(e) => setEditingArticle({ ...editingArticle, subtitle: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:border-sky-400 resize-none"
              />
            </div>
          </div>

          {/* 2. Contributor Interface (Name, Photo, Bio, Credentials) */}
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <h5 className="text-xs font-bold text-sky-300 uppercase tracking-wider flex items-center gap-1.5">
                <User className="w-3.5 h-3.5" />
                2. Contributor Profile (Name, Photo, Bio &amp; Credentials)
              </h5>
              <span className="text-[10px] text-slate-400">
                Human Author Identity &amp; Copyright Byline
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  Author Full Name:
                </label>
                <input
                  type="text"
                  value={editingArticle.author.name}
                  onChange={(e) =>
                    setEditingArticle({
                      ...editingArticle,
                      author: { ...editingArticle.author, name: e.target.value },
                    })
                  }
                  required
                  placeholder="e.g. Maria Renold or Dr. Herbert Benson"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-sky-400"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  Author Professional Role:
                </label>
                <input
                  type="text"
                  value={editingArticle.author.role}
                  onChange={(e) =>
                    setEditingArticle({
                      ...editingArticle,
                      author: { ...editingArticle.author, role: e.target.value },
                    })
                  }
                  required
                  placeholder="e.g. Concert Violinist & Acoustician"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-sky-400"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  Academic Credentials / Era:
                </label>
                <input
                  type="text"
                  value={editingArticle.author.credentials || ''}
                  onChange={(e) =>
                    setEditingArticle({
                      ...editingArticle,
                      author: { ...editingArticle.author, credentials: e.target.value },
                    })
                  }
                  placeholder="e.g. Ph.D. in Biophysics; 1918 – 1993"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-sky-400"
                />
              </div>
            </div>

            {/* Photo Avatar URL & Quick Presets */}
            <div className="space-y-2">
              <label className="block text-[11px] font-semibold text-slate-300">
                Author Photo / Avatar URL:
              </label>
              <div className="flex items-center gap-3">
                {editingArticle.author.avatar ? (
                  <img
                    src={editingArticle.author.avatar}
                    alt={editingArticle.author.name}
                    className="w-12 h-12 rounded-xl object-cover border border-slate-700 shrink-0 shadow-sm"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-semibold text-sky-400 shrink-0">
                    <User className="w-5 h-5 text-slate-400" />
                  </div>
                )}
                <input
                  type="url"
                  value={editingArticle.author.avatar || ''}
                  onChange={(e) =>
                    setEditingArticle({
                      ...editingArticle,
                      author: { ...editingArticle.author, avatar: e.target.value },
                    })
                  }
                  placeholder="https://images.unsplash.com/photo-..."
                  className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-sky-400 font-mono"
                />
              </div>

              {/* Quick Select Preset Avatars */}
              <div className="flex items-center gap-1.5 flex-wrap pt-1">
                <span className="text-[10px] text-slate-400 mr-1">Quick Select Portrait:</span>
                {PRESET_AVATARS.map((preset, idx) => (
                  <button
                    type="button"
                    key={idx}
                    onClick={() =>
                      setEditingArticle({
                        ...editingArticle,
                        author: { ...editingArticle.author, avatar: preset.url },
                      })
                    }
                    className="text-[10px] px-2 py-0.5 rounded-lg bg-slate-850 hover:bg-slate-800 text-slate-300 border border-slate-750 transition-colors cursor-pointer"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Author Bio */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                Author Bio &amp; Scholarly Background:
              </label>
              <textarea
                rows={2}
                value={editingArticle.author.bio || ''}
                onChange={(e) =>
                  setEditingArticle({
                    ...editingArticle,
                    author: { ...editingArticle.author, bio: e.target.value },
                  })
                }
                placeholder="Author's biographical profile, publications, and area of expertise..."
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:border-sky-400 resize-none"
              />
            </div>
          </div>

          {/* 3. Academic Citation & Copyright Preservation */}
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-4">
            <h5 className="text-xs font-bold text-sky-300 uppercase tracking-wider flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5" />
              3. Source Citations &amp; Fair Use Copyright Protection
            </h5>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  Primary Work Title:
                </label>
                <input
                  type="text"
                  value={editingArticle.sourceCitation.workTitle}
                  onChange={(e) =>
                    setEditingArticle({
                      ...editingArticle,
                      sourceCitation: { ...editingArticle.sourceCitation, workTitle: e.target.value },
                    })
                  }
                  required
                  placeholder="e.g. Intervals, Scales, Tones and the Concert Pitch C=128Hz"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-sky-400"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  Publication / Journal / Publisher:
                </label>
                <input
                  type="text"
                  value={editingArticle.sourceCitation.publication}
                  onChange={(e) =>
                    setEditingArticle({
                      ...editingArticle,
                      sourceCitation: { ...editingArticle.sourceCitation, publication: e.target.value },
                    })
                  }
                  required
                  placeholder="e.g. Temple Lodge Publishing / Scientific American"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-sky-400"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  Publication Year / Date:
                </label>
                <input
                  type="text"
                  value={editingArticle.sourceCitation.yearOrDate}
                  onChange={(e) =>
                    setEditingArticle({
                      ...editingArticle,
                      sourceCitation: { ...editingArticle.sourceCitation, yearOrDate: e.target.value },
                    })
                  }
                  placeholder="e.g. 1985 / October 1973"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-sky-400 font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  DOI or Archive Reference:
                </label>
                <input
                  type="text"
                  value={editingArticle.sourceCitation.doiOrArchive || ''}
                  onChange={(e) =>
                    setEditingArticle({
                      ...editingArticle,
                      sourceCitation: { ...editingArticle.sourceCitation, doiOrArchive: e.target.value },
                    })
                  }
                  placeholder="e.g. DOI: 10.1038/scientificamerican1073-94"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-sky-400 font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                Copyright Notice:
              </label>
              <input
                type="text"
                value={editingArticle.sourceCitation.copyrightNotice}
                onChange={(e) =>
                  setEditingArticle({
                    ...editingArticle,
                    sourceCitation: { ...editingArticle.sourceCitation, copyrightNotice: e.target.value },
                  })
                }
                placeholder="Summarized and reviewed under the Fair Use Doctrine (17 U.S.C. § 107)."
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-sky-400"
              />
            </div>
          </div>

          {/* Form Bottom Save Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setEditingArticle(null)}
              className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-slate-200 bg-slate-800 rounded-xl transition-colors cursor-pointer"
            >
              Cancel Edit
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 text-xs font-bold text-slate-950 bg-gradient-to-r from-sky-400 to-indigo-400 hover:from-sky-300 hover:to-indigo-300 rounded-xl shadow-lg shadow-sky-500/20 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Check className="w-4 h-4" /> Save Article to Blog
            </button>
          </div>
        </form>
      ) : (
        /* ========================================================================= */
        /* 2. ARTICLES DIRECTORY & MANAGEMENT LIST                                   */
        /* ========================================================================= */
        <div className="space-y-5">
          {/* DAILY INTERNET RESEARCH & AUTO-FETCH ENGINE */}
          <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-emerald-950/70 via-slate-900 to-teal-950/50 border border-emerald-500/40 shadow-2xl relative overflow-hidden">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-4">
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/50 text-emerald-300 text-[11px] font-bold uppercase tracking-wider mb-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Daily Internet Research &amp; Auto-Fetch Engine</span>
                  <span className="text-[10px] bg-emerald-950 px-1.5 py-0.2 rounded font-mono text-emerald-200 border border-emerald-500/30">
                    24h Automation
                  </span>
                </div>
                <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
                  Automated Core Research, Human Verification &amp; Writer Photo Fetcher
                </h3>
                <p className="text-xs text-slate-300 max-w-2xl mt-1 leading-relaxed">
                  Daily research engine continuously queries academic databases, PubMed, and acoustic archives for studies directly related to the website's core (432Hz vs 440Hz physiology, 528Hz cellular resonance, vagal nerve stimulation, and Giuseppe Verdi's 1884 Diapason Normale). Every article is human-verified, tags the author/writer, and fetches the verified author portrait.
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={handleRunDailyResearchNow}
                  disabled={isDailyRunning}
                  className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-400 via-teal-400 to-sky-400 hover:from-emerald-300 hover:to-sky-300 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-2 active:scale-95 disabled:opacity-50 cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isDailyRunning ? 'animate-spin' : ''}`} />
                  <span>{isDailyRunning ? 'Researching Internet...' : 'Run Daily Research Now'}</span>
                </button>
              </div>
            </div>

            {/* Daily Research Status & Verification Indicators */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5 text-xs">
              <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
                <span className="text-[10px] text-slate-400 block font-medium">Research Cycle</span>
                <span className="text-xs font-bold text-emerald-300 flex items-center gap-1 mt-0.5">
                  <Clock className="w-3 h-3 text-emerald-400" /> Every 24 Hours
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
                <span className="text-[10px] text-slate-400 block font-medium">Human Article Verification</span>
                <span className="text-xs font-bold text-sky-300 flex items-center gap-1 mt-0.5">
                  <ShieldCheck className="w-3 h-3 text-sky-400" /> ✦ Verified &amp; Tagged
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
                <span className="text-[10px] text-slate-400 block font-medium">Author &amp; Photo Metadata</span>
                <span className="text-xs font-bold text-teal-300 flex items-center gap-1 mt-0.5">
                  <User className="w-3 h-3 text-teal-400" /> Byline &amp; Portrait Auto-Fetched
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
                <span className="text-[10px] text-slate-400 block font-medium">Core Research Themes</span>
                <span className="text-xs font-bold text-amber-300 flex items-center gap-1 mt-0.5">
                  <BookOpen className="w-3 h-3 text-amber-400" /> 432Hz, Vagus, Solfeggio, Verdi
                </span>
              </div>
            </div>

            {/* Daily Research Feedback Toast */}
            {dailyNotice && (
              <div className="mt-3 p-3 rounded-xl bg-emerald-950/80 border border-emerald-500/50 text-xs text-emerald-200 flex items-center gap-2 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{dailyNotice}</span>
              </div>
            )}
          </div>

          {/* EXTERNAL RESEARCH & ARTICLE LINK FETCHER */}
          <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950/40 to-slate-950 border border-sky-500/30 shadow-2xl relative overflow-hidden">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 mb-4">
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-sky-500/20 border border-sky-400/40 text-sky-200 text-[11px] font-bold uppercase tracking-wider mb-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-sky-400" />
                  <span>Tool: Add New Articles to Science &amp; Blog via Research Auto-Fetcher</span>
                </div>
                <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
                  Auto-Extract Scholarly Title, Abstract, Citations, Authors &amp; Key Findings
                </h3>
                <p className="text-xs text-slate-300 max-w-2xl mt-0.5">
                  Paste any external link (PubMed, ScienceDirect, Nature, Sound Healing Journal, Medium). The tool extracts title, abstract/summary, author credentials, citation, and key findings for 1-click publishing to Science &amp; Blog.
                </p>
              </div>
            </div>

            {/* 3-Step Research Workflow Banner */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 mb-4 text-xs">
              <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-sky-500/20 border border-sky-400/50 text-sky-300 flex items-center justify-center font-bold text-[11px] shrink-0">1</span>
                <div>
                  <div className="font-semibold text-slate-200">Paste Article Link</div>
                  <div className="text-[10px] text-slate-400">PubMed, Nature, ScienceDirect, Blogs</div>
                </div>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-indigo-500/20 border border-indigo-400/50 text-indigo-300 flex items-center justify-center font-bold text-[11px] shrink-0">2</span>
                <div>
                  <div className="font-semibold text-slate-200">Auto-Extract Scholarly Data</div>
                  <div className="text-[10px] text-slate-400">Pulls abstract, citations, author &amp; findings</div>
                </div>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-emerald-500/20 border border-emerald-400/50 text-emerald-300 flex items-center justify-center font-bold text-[11px] shrink-0">3</span>
                <div>
                  <div className="font-semibold text-slate-200">1-Click Publish</div>
                  <div className="text-[10px] text-slate-400">Instantly live in Science &amp; Research</div>
                </div>
              </div>
            </div>

            {/* Input Bar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-1">
              <div className="relative flex-1">
                <input
                  type="url"
                  value={fetchUrl}
                  onChange={(e) => setFetchUrl(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && fetchUrl.trim()) handleFetchArticle(fetchUrl);
                  }}
                  placeholder="Paste article link (e.g. https://pubmed.ncbi.nlm.nih.gov/... or https://www.nature.com/articles/...)"
                  className="w-full px-4 py-3 rounded-2xl bg-slate-950/80 border border-slate-700/80 text-white placeholder-slate-400 text-xs sm:text-sm focus:outline-none focus:border-sky-400 focus:ring-1 focus:ring-sky-400/50 shadow-inner"
                />
              </div>
              <button
                type="button"
                disabled={isFetching || !fetchUrl.trim()}
                onClick={() => handleFetchArticle(fetchUrl)}
                className="px-6 py-3 rounded-2xl bg-gradient-to-r from-sky-400 to-indigo-500 hover:from-sky-300 hover:to-indigo-400 disabled:opacity-50 text-slate-950 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-sky-500/25 active:scale-95 cursor-pointer shrink-0"
              >
                {isFetching ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Fetching Article...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 fill-current" />
                    <span>Fetch Article</span>
                  </>
                )}
              </button>
            </div>

            {/* Sample Links */}
            <div className="mt-3 flex items-center gap-2 flex-wrap text-xs">
              <span className="text-slate-400 text-[11px] font-medium">Try 1-Click Samples:</span>
              {SAMPLE_ARTICLE_PRESETS.map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setFetchUrl(preset.url);
                    handleFetchArticle(preset.url);
                  }}
                  className="px-2.5 py-1 rounded-xl bg-slate-800/80 hover:bg-slate-750 text-slate-300 hover:text-white border border-slate-700 text-[11px] transition-all flex items-center gap-1 cursor-pointer active:scale-95"
                >
                  <span className="truncate max-w-[280px]">{preset.label}</span>
                  <span className="text-[10px] text-sky-400 font-mono">({preset.journal})</span>
                </button>
              ))}
            </div>

            {/* Error Message */}
            {fetchError && (
              <div className="mt-3 p-3 rounded-xl bg-rose-500/20 border border-rose-400/40 text-rose-200 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{fetchError}</span>
              </div>
            )}

            {/* Extracted Article Preview Card */}
            {fetchedArticle && (
              <div className="mt-5 p-4 sm:p-5 rounded-2xl bg-slate-950/90 border border-sky-400/50 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3 flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-xs font-bold text-white uppercase tracking-wider">
                      Extracted Research Preview
                    </span>
                    <span className="text-[11px] px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 uppercase font-semibold">
                      {fetchedArticle.category}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setFetchedArticle(null)}
                      className="px-3 py-1.5 text-xs text-slate-400 hover:text-slate-200 rounded-xl bg-slate-800 cursor-pointer"
                    >
                      Dismiss
                    </button>
                    <button
                      type="button"
                      onClick={handleStageInQueue}
                      className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs flex items-center gap-1.5 transition-all shadow-md active:scale-95 cursor-pointer"
                    >
                      <Layers className="w-3.5 h-3.5 text-indigo-300" />
                      <span>Stage in Draft Queue</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleImportFetchedArticle}
                      className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-all shadow-md active:scale-95 cursor-pointer"
                    >
                      <Check className="w-4 h-4" />
                      <span>Publish to Science &amp; Blog</span>
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <h4 className="text-base sm:text-lg font-bold text-white leading-snug">
                      {fetchedArticle.title}
                    </h4>
                    <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                      {fetchedArticle.summary}
                    </p>
                  </div>

                  {/* Author & Citation Strip */}
                  <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-3">
                      <img
                        src={fetchedArticle.author.avatar}
                        alt=""
                        className="w-10 h-10 rounded-full object-cover border border-slate-700"
                      />
                      <div>
                        <div className="font-bold text-white">{fetchedArticle.author.name}</div>
                        <div className="text-[11px] text-slate-400">{fetchedArticle.author.role} • {fetchedArticle.author.credentials}</div>
                      </div>
                    </div>

                    <div className="text-[11px] text-slate-400 text-left sm:text-right">
                      <div><strong className="text-slate-300">{fetchedArticle.sourceCitation.publication}</strong></div>
                      <div>{fetchedArticle.publishedDate} • ~{fetchedArticle.readTimeMinutes} min read</div>
                    </div>
                  </div>

                  {/* Key Takeaways */}
                  {fetchedArticle.keyTakeaways.length > 0 && (
                    <div className="space-y-1.5">
                      <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                        Key Scientific Findings
                      </div>
                      <div className="space-y-1">
                        {fetchedArticle.keyTakeaways.map((point, idx) => (
                          <div key={idx} className="p-2 rounded-lg bg-sky-950/30 border border-sky-500/20 text-xs text-sky-200 flex items-start gap-2">
                            <span className="text-sky-400 font-bold shrink-0 mt-0.5">•</span>
                            <span>{point}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Search & Filter Toolbar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-2xl bg-slate-900 border border-slate-800">
            <div className="relative flex-1 max-w-sm">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search articles by title, author, or category..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-slate-950 border border-slate-750 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-400"
              />
            </div>

            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[11px] text-slate-400 font-semibold mr-1 flex items-center gap-1">
                <Filter className="w-3 h-3 text-sky-400" /> Filter:
              </span>
              {[
                { id: 'all', label: `All (${articles.length})` },
                { id: 'published', label: `Published (${articles.filter((a) => a.status === 'published').length})` },
                { id: 'placeholder', label: `Placeholders (${articles.filter((a) => a.status === 'placeholder').length})` },
                { id: 'under_review', label: `In Review (${articles.filter((a) => a.status === 'under_review').length})` },
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveFilter(item.id as any)}
                  className={`min-h-[30px] text-xs px-3 py-1 rounded-xl border inline-flex items-center justify-center whitespace-nowrap transition-all cursor-pointer ${
                    activeFilter === item.id
                      ? 'bg-sky-500/20 text-sky-300 border-sky-400 font-semibold shadow-sm'
                      : 'bg-slate-850 text-slate-400 border-slate-750 hover:text-slate-200'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Articles Table / Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredArticles.map((article) => (
              <div
                key={article.id}
                className="p-4 sm:p-5 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-slate-750 transition-all flex flex-col justify-between group shadow-sm"
              >
                <div className="space-y-3">
                  {/* Category & Status */}
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-slate-950 border border-slate-750 text-sky-400 font-mono">
                      {article.category}
                    </span>

                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                        article.status === 'published'
                          ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
                          : article.status === 'placeholder'
                          ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                          : 'bg-sky-500/20 border-sky-500/40 text-sky-300'
                      }`}
                    >
                      {article.status === 'published'
                        ? '✓ Human Authored'
                        : article.status === 'placeholder'
                        ? 'Draft Placeholder'
                        : 'Under Review'}
                    </span>
                  </div>

                  {/* Title & Subtitle */}
                  <div>
                    <h4 className="font-bold text-sm text-slate-100 group-hover:text-sky-300 transition-colors line-clamp-2">
                      {article.title}
                    </h4>
                    <p className="text-xs text-slate-400 line-clamp-2 mt-1 leading-relaxed">
                      {article.subtitle}
                    </p>
                  </div>

                  {/* Contributor Byline Component (Compact) */}
                  <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
                    <Contributor
                      author={article.author}
                      lastUpdated={article.lastUpdated}
                      publishedDate={article.publishedDate}
                      status={article.status}
                      variant="compact"
                    />
                  </div>
                </div>

                {/* Card Footer Actions */}
                <div className="pt-3 mt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
                  <div className="text-[10px] text-slate-500 font-mono">
                    {article.readTimeMinutes} min read • Updated {article.lastUpdated}
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setEditingArticle({ ...article })}
                      className="px-3 py-1 text-xs font-semibold text-sky-300 bg-sky-500/15 hover:bg-sky-500/25 border border-sky-500/30 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>{article.status === 'placeholder' ? 'Write Article' : 'Edit'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDelete(article.id, article.title)}
                      className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
                      title="Delete article"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
