import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  BookOpen,
  Search,
  Tag,
  Clock,
  Calendar,
  Sparkles,
  ArrowRight,
  Headphones,
  CheckCircle2,
  Share2,
  Bookmark,
  ChevronRight,
  Flame,
  Volume2,
  Brain,
  Moon,
  Heart,
  Radio,
  X,
  ShieldCheck,
  ExternalLink,
  FileText,
  User,
  Edit3,
  Trash2,
  Plus,
  Printer,
  LayoutGrid,
  List,
} from 'lucide-react';
import { MixPreset, BUILT_IN_MIX_PRESETS } from '../services/storage';
import {
  EditorialArticle,
  editorialStorage,
  ArticleCategory,
} from '../services/editorialStorage';
import { applyArticleSeo, applyPageSeo } from '../services/seo';
import { Contributor } from './Contributor';
import { EditorialManagerModal } from './EditorialManagerModal';
import { Lock } from 'lucide-react';

interface BlogSectionProps {
  onSelectPreset?: (preset: MixPreset) => void;
  isAdmin?: boolean;
  onOpenAdminLogin?: () => void;
  onNavigateToAdminEditorial?: () => void;
}

export const BlogSection: React.FC<BlogSectionProps> = ({
  onSelectPreset,
  isAdmin = false,
  onOpenAdminLogin,
  onNavigateToAdminEditorial,
}) => {
  const [articles, setArticles] = useState<EditorialArticle[]>(() =>
    editorialStorage.getArticles()
  );
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [readingPost, setReadingPost] = useState<EditorialArticle | null>(null);
  const [isEditorialModalOpen, setIsEditorialModalOpen] = useState<boolean>(false);
  const [editingArticleId, setEditingArticleId] = useState<string | null>(null);
  const [articleActionNotice, setArticleActionNotice] = useState<string | null>(null);
  const [articleToDelete, setArticleToDelete] = useState<EditorialArticle | null>(null);

  const confirmDeleteArticle = () => {
    if (!isAdmin) return;
    if (!articleToDelete) return;
    const { id, title } = articleToDelete;
    editorialStorage.deleteArticle(id);
    if (readingPost?.id === id) setReadingPost(null);
    setArticles(editorialStorage.getArticles());
    setArticleActionNotice(`Deleted article "${title}".`);
    setTimeout(() => setArticleActionNotice(null), 3500);
    setArticleToDelete(null);
  };

  // Subscribe to live editorial storage updates
  useEffect(() => {
    const unsubscribe = editorialStorage.subscribe((updatedArticles) => {
      setArticles(updatedArticles);
      // Keep active reading post synchronized if it was edited
      if (readingPost) {
        const found = updatedArticles.find((a) => a.id === readingPost.id);
        if (found) setReadingPost(found);
      }
    });
    return unsubscribe;
  }, [readingPost]);

  // Start every tap / category switch or reading view from the top & apply article SEO
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    if (document.documentElement) document.documentElement.scrollTop = 0;
    if (document.body) document.body.scrollTop = 0;

    if (readingPost) {
      applyArticleSeo(readingPost);
    } else {
      applyPageSeo('blog', false);
    }
  }, [selectedCategory, readingPost]);

  const categories = [
    { id: 'all', label: 'All Articles' },
    { id: 'science', label: 'Verdi & Pitch History' },
    { id: 'audio', label: 'Maria Renold Research' },
    { id: 'brainwaves', label: 'Gerald Oster Biophysics' },
    { id: 'protocols', label: 'Clinical Protocols & Vagus' },
    { id: 'sleep', label: 'Sleep Medicine & Bowls' },
    { id: 'solfeggio', label: 'Ellis Historical Treatise' },
  ];

  const filteredPosts = articles.filter((post) => {
    const matchesCategory = selectedCategory === 'all' || post.category === selectedCategory;
    const matchesQuery =
      searchQuery.trim() === '' ||
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.subtitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.author.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesQuery;
  });

  const handlePlayPreset = (presetId: string) => {
    const preset = BUILT_IN_MIX_PRESETS.find((p) => p.id === presetId);
    if (preset && onSelectPreset) {
      onSelectPreset(preset);
    }
  };

  const handleOpenEditorialForArticle = (articleId: string) => {
    if (!isAdmin) return;
    setEditingArticleId(articleId);
    setIsEditorialModalOpen(true);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Blog Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-950/70 via-slate-900 to-slate-950 border border-indigo-500/30 p-6 md:p-8 shadow-2xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-3xl">
          <div className="flex items-center justify-between gap-3 flex-wrap mb-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/40 text-indigo-300 text-xs font-semibold">
              <BookOpen className="w-3.5 h-3.5" />
              <span>Human-Authored Research &amp; Editorial Placeholders</span>
            </div>

            {/* Launch Editorial Desk & Research Auto-Fetcher Button - Restricted to Sanctuary Admins */}
            {isAdmin && (
              <button
                type="button"
                onClick={() => {
                  setEditingArticleId(null);
                  setIsEditorialModalOpen(true);
                }}
                className="px-4 py-2 text-xs font-bold text-slate-950 bg-gradient-to-r from-sky-400 to-indigo-400 hover:from-sky-300 hover:to-indigo-300 rounded-xl shadow-lg shadow-sky-500/25 transition-all flex items-center gap-2 cursor-pointer active:scale-95 shrink-0"
                title="Article Fetcher Tool: Auto-extract scholarly research, citations, and hero photo from link"
              >
                <Sparkles className="w-4 h-4 text-slate-950 fill-current" />
                <span>⚡ Article Fetcher Tool</span>
              </button>
            )}
          </div>

          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            The Science &amp; History of Acoustic Relaxation
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-1.5 leading-relaxed">
            Peer research, acoustic studies, and historical treatises on 432Hz tuning, Solfeggio harmonics, and brainwave coherence.
          </p>
        </div>

        {/* Dedicated Article Fetcher Tool Card - Admin Only */}
        {isAdmin && (
          <div className="mt-5 p-4 sm:p-5 rounded-2xl bg-slate-900/90 border border-indigo-500/40 shadow-xl space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-indigo-500/20 text-indigo-300 border border-indigo-400/40 flex items-center justify-center font-bold shadow-md shrink-0">
                  <BookOpen className="w-4 h-4 text-indigo-400" />
                </div>
                <div>
                  <h3 className="text-xs sm:text-sm font-bold text-slate-100 flex items-center gap-2">
                    <span>Article Fetcher Tool</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 uppercase font-semibold">
                      Scholarly Metadata &amp; Citations
                    </span>
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Fetch research from PubMed, Nature, ScienceDirect, or science blogs with structured sections, hero photos, author dossiers &amp; DOI citations.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setEditingArticleId(null);
                  setIsEditorialModalOpen(true);
                }}
                className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-sky-400 to-indigo-400 hover:from-sky-300 hover:to-indigo-300 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-all shadow-md active:scale-95 cursor-pointer self-start sm:self-auto shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Launch Article Fetcher</span>
              </button>
            </div>

            {/* Quick preset chips */}
            <div className="pt-2 border-t border-slate-800/80 flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-semibold text-slate-400 flex items-center gap-1 shrink-0">
                <Sparkles className="w-3 h-3 text-indigo-400" />
                <span>Research Presets:</span>
              </span>
              {[
                { label: 'PubMed: 432Hz vs 440Hz Pilot Study' },
                { label: 'Nature: 432Hz Liquid Cymatics' },
                { label: 'ScienceDirect: Vagus Nerve Chimes' },
                { label: 'Acoustic Biophysics: Maria Renold' },
              ].map((p, pIdx) => (
                <button
                  key={pIdx}
                  type="button"
                  onClick={() => {
                    setEditingArticleId(null);
                    setIsEditorialModalOpen(true);
                  }}
                  className="px-2.5 py-1 rounded-xl bg-slate-850 hover:bg-slate-800 text-slate-300 hover:text-indigo-300 border border-slate-750 text-[10px] font-medium transition-all cursor-pointer active:scale-95"
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Editorial Integrity Notice */}
        <div className="mt-4 p-3 rounded-2xl bg-slate-950/80 border border-slate-800 text-[11px] text-slate-400 flex items-center gap-2">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span>Documented research &amp; peer contributions curated with verified citations and author attribution.</span>
        </div>

        {/* Search & Categories Bar */}
        <div className="mt-6 pt-5 border-t border-slate-800/80 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search science, research, author (Verdi, Renold, Oster), title, or keyword..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-9 py-2 bg-slate-900/80 border border-slate-700/80 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-400 transition-colors"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 w-6 h-6 inline-flex items-center justify-center text-slate-400 hover:text-slate-200 rounded cursor-pointer"
                title="Clear search query"
                aria-label="Clear search query"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-1.5 pb-1">
            {categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`min-h-[34px] text-xs px-3 py-1.5 rounded-xl border whitespace-nowrap inline-flex items-center justify-center transition-all font-medium cursor-pointer ${
                  selectedCategory === cat.id
                    ? 'bg-indigo-500/25 border-indigo-400 text-indigo-200 font-semibold shadow-sm'
                    : 'bg-slate-850 hover:bg-slate-800 border-slate-750 text-slate-400 hover:text-slate-200'
                }`}
              >
                {cat.label}
              </button>
            ))}

            {/* Grid vs List View Selector (Grid is Default) */}
            <div className="flex items-center p-1 bg-slate-950 border border-slate-800 rounded-xl ml-auto">
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={`min-h-[28px] px-2 py-1 rounded-lg text-xs font-semibold inline-flex items-center justify-center gap-1 transition-all cursor-pointer ${
                  viewMode === 'grid'
                    ? 'bg-indigo-500 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Grid View (Default)"
                aria-label="Grid view"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Grid</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('list')}
                className={`min-h-[28px] px-2 py-1 rounded-lg text-xs font-semibold inline-flex items-center justify-center gap-1 transition-all cursor-pointer ${
                  viewMode === 'list'
                    ? 'bg-indigo-500 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="List View"
                aria-label="List view"
              >
                <List className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">List</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Articles Container (Grid or List View) */}
      <div className={viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5" : "flex flex-col gap-4"}>
        {filteredPosts.map((post) => {
          const recommendedPreset = BUILT_IN_MIX_PRESETS.find((p) => p.id === post.recommendedPresetId);
          const isPlaceholder = post.status === 'placeholder';

          return (
            <article
              key={post.id}
              className={`bg-slate-900/70 backdrop-blur-xl border rounded-3xl p-5 flex flex-col justify-between transition-all hover:shadow-xl group relative ${
                isPlaceholder
                  ? 'border-amber-500/40 bg-gradient-to-b from-slate-900/90 to-amber-950/10'
                  : 'border-slate-800 hover:border-slate-700/80'
              }`}
            >
              <div>
                {/* Category & Read Time with Edit and Delete Icons */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-500/15 border border-indigo-500/30 text-indigo-300">
                    {post.category}
                  </span>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <div className="flex items-center gap-1 text-[11px] text-slate-400 font-mono">
                      <Clock className="w-3 h-3 text-slate-400" />
                      <span>{post.readTimeMinutes} min</span>
                    </div>

                    {/* Admin Only: Edit and Delete Article Buttons */}
                    {isAdmin && (
                      <>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenEditorialForArticle(post.id);
                          }}
                          className="p-1.5 rounded-lg bg-slate-950/70 hover:bg-slate-800 border border-slate-800 hover:border-indigo-400/60 text-slate-400 hover:text-indigo-300 transition-colors cursor-pointer shadow-sm"
                          title={`Edit article "${post.title}"`}
                          aria-label={`Edit ${post.title}`}
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setArticleToDelete(post);
                          }}
                          className="p-1.5 rounded-lg bg-slate-950/70 hover:bg-rose-950/40 border border-slate-800 hover:border-rose-500/60 text-slate-400 hover:text-rose-400 transition-colors cursor-pointer shadow-sm"
                          title={`Delete article "${post.title}"`}
                          aria-label={`Delete ${post.title}`}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* Title */}
                <h3
                  onClick={() => setReadingPost(post)}
                  className="font-bold text-sm sm:text-base text-slate-100 group-hover:text-sky-300 transition-colors cursor-pointer line-clamp-2 leading-snug mb-2"
                >
                  {post.title}
                </h3>

                <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed mb-3">
                  {post.subtitle}
                </p>

                {/* Source Citation Badge */}
                <div className="mb-3 p-2 rounded-xl bg-slate-950/70 border border-slate-800 text-[10px] text-slate-400 line-clamp-2">
                  <strong className="text-slate-300">Source:</strong> {post.sourceCitation.workTitle} ({post.sourceCitation.yearOrDate})
                </div>

                {/* Contributor Byline Component (Compact Card Variant) */}
                <div className="mb-3 p-2.5 rounded-2xl bg-slate-950/50 border border-slate-800/80">
                  <Contributor
                    author={post.author}
                    lastUpdated={post.lastUpdated}
                    publishedDate={post.publishedDate}
                    status={post.status}
                    variant="compact"
                  />
                </div>
              </div>

              <div>
                {/* Read Button & Quick Action */}
                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
                  <div className="text-[10px] text-slate-500 font-mono">
                    {isPlaceholder ? 'Awaiting Author Draft' : 'Peer-Reviewed Archive'}
                  </div>

                  <div className="flex items-center gap-1.5">
                    {isPlaceholder && isAdmin && (
                      <button
                        type="button"
                        onClick={() => handleOpenEditorialForArticle(post.id)}
                        className="text-xs px-2.5 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-medium rounded-xl transition-colors flex items-center gap-1 cursor-pointer"
                        title="Admin: Author or customize this placeholder"
                      >
                        <Edit3 className="w-3 h-3" />
                        <span>Write Draft</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => setReadingPost(post)}
                      className="text-xs px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-sky-300 hover:text-sky-200 font-medium rounded-xl transition-colors flex items-center gap-1 shrink-0 cursor-pointer"
                    >
                      <span>{isPlaceholder ? 'View Outline' : 'Read'}</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                {/* Audio preset quick listener */}
                {recommendedPreset && (
                  <div
                    onClick={() => handlePlayPreset(recommendedPreset.id)}
                    className="mt-3 p-2 rounded-xl bg-sky-500/10 hover:bg-sky-500/20 border border-sky-500/30 flex items-center justify-between gap-2 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <Headphones className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                      <div className="min-w-0">
                        <span className="text-[10px] text-sky-300 block truncate">
                          Listen: <strong>{recommendedPreset.name}</strong> ({recommendedPreset.baseFreq}Hz)
                        </span>
                      </div>
                    </div>
                    <span className="text-[10px] bg-sky-500 text-slate-950 font-bold px-2 py-0.5 rounded-lg shrink-0">
                      Play Now
                    </span>
                  </div>
                )}
              </div>
            </article>
          );
        })}
      </div>

      {/* Full Article Reader Modal (Portaled to document.body) */}
      {readingPost &&
        createPortal(
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="article-reader-title"
            className="fixed inset-0 z-[80] flex items-center justify-center p-2.5 sm:p-5 bg-slate-950/85 backdrop-blur-md overflow-y-auto overscroll-contain animate-in fade-in duration-200"
          >
            <div className="bg-slate-900 border border-slate-800 rounded-2xl sm:rounded-3xl max-w-3xl w-full max-h-[92dvh] landscape:max-h-[94dvh] flex flex-col shadow-2xl overflow-hidden print-clean-container my-auto">
              {/* Modal Header */}
              <div className="p-4 sm:p-6 landscape:py-2.5 landscape:px-4 border-b border-slate-800 flex items-start justify-between gap-3 sm:gap-4 bg-slate-900/95 sticky top-0 z-10">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-500/20 border border-indigo-500/40 text-indigo-300">
                      {readingPost.category}
                    </span>
                    <span className="text-xs text-slate-400 font-mono">
                      {readingPost.readTimeMinutes} min read
                    </span>
                    {readingPost.status === 'placeholder' && (
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300">
                        Draft Placeholder
                      </span>
                    )}
                  </div>
                  <h2 className="text-lg sm:text-xl font-bold text-white leading-snug">
                    {readingPost.title}
                  </h2>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {/* Admin Only: Edit & Delete Article in Reader */}
                  {isAdmin && (
                    <>
                      <button
                        type="button"
                        onClick={() => {
                          handleOpenEditorialForArticle(readingPost.id);
                          setReadingPost(null);
                        }}
                        className="min-h-[36px] px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-indigo-300 hover:text-indigo-200 border border-slate-700 hover:border-indigo-400/60 transition-colors inline-flex items-center justify-center gap-1.5 whitespace-nowrap text-xs font-semibold cursor-pointer shadow-sm no-print"
                        title="Edit this article in Editorial Desk"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Edit</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setArticleToDelete(readingPost)}
                        className="min-h-[36px] px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-rose-950/60 text-rose-400 hover:text-rose-300 border border-slate-700 hover:border-rose-500/60 transition-colors inline-flex items-center justify-center gap-1.5 whitespace-nowrap text-xs font-semibold cursor-pointer shadow-sm no-print"
                        title="Delete this article"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Delete</span>
                      </button>
                    </>
                  )}

                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="min-h-[36px] px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 transition-colors inline-flex items-center justify-center gap-1.5 whitespace-nowrap text-xs font-semibold cursor-pointer shadow-sm no-print"
                    title="Print Article &amp; Scholarly Citations"
                  >
                    <Printer className="w-3.5 h-3.5 text-sky-400" />
                    <span className="hidden sm:inline">Print Article</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setReadingPost(null)}
                    className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-400 hover:text-slate-100 transition-colors inline-flex items-center justify-center shrink-0 cursor-pointer no-print"
                    title="Close Article"
                    aria-label="Close Article"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Modal Body */}
              <div className="flex-1 overflow-y-auto p-5 sm:p-8 space-y-6 text-slate-300 text-sm leading-relaxed scrollbar-thin scrollbar-thumb-slate-700">
                {/* CONTRIBUTOR COMPONENT: FULL PROFILE WITH LAST UPDATED & REVIEWER BYLINE */}
                <Contributor
                  author={readingPost.author}
                  lastUpdated={readingPost.lastUpdated}
                  publishedDate={readingPost.publishedDate}
                  reviewer={readingPost.reviewer}
                  status={readingPost.status}
                  variant="full"
                />

                {/* Subtitle / Abstract */}
                <p className="text-base text-slate-200 font-medium italic border-l-2 border-indigo-400 pl-4 py-1">
                  &ldquo;{readingPost.subtitle}&rdquo;
                </p>

                {/* Placeholders Callout Notice if applicable */}
                {readingPost.status === 'placeholder' && (
                  <div className="p-4 rounded-2xl bg-amber-950/40 border border-amber-500/40 space-y-2 text-xs text-amber-200">
                    <div className="font-bold flex items-center gap-1.5 text-amber-300">
                      <Sparkles className="w-4 h-4" />
                      Editorial Contributor Notice:
                    </div>
                    <p className="leading-relaxed text-slate-300">
                      This article is currently an open editorial placeholder reserved for original human authorship. If you are a qualified researcher, clinician, or acoustic writer, you can customize this piece in our Editorial Desk.
                    </p>
                    {readingPost.editorialNotes && (
                      <div className="text-[11px] text-amber-300/90 font-mono bg-slate-900/60 p-2.5 rounded-xl border border-amber-500/30">
                        {readingPost.editorialNotes}
                      </div>
                    )}
                    {isAdmin && (
                      <button
                        type="button"
                        onClick={() => {
                          handleOpenEditorialForArticle(readingPost.id);
                          setReadingPost(null);
                        }}
                        className="mt-1 px-3 py-1.5 bg-amber-500 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer shadow"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Edit &amp; Author This Article in Editorial Desk</span>
                      </button>
                    )}
                  </div>
                )}

                {/* Verified Citation Box with Copyright Information */}
                <div className="p-4 rounded-2xl bg-slate-950/90 border border-indigo-500/30 space-y-2">
                  <div className="text-xs font-bold text-indigo-300 uppercase tracking-wider flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-sky-400" />
                    Archival &amp; Academic Citation:
                  </div>
                  <div className="text-xs text-slate-300 space-y-1">
                    <div>
                      <strong className="text-white">Original Work:</strong> {readingPost.sourceCitation.workTitle}
                    </div>
                    <div>
                      <strong className="text-white">Publication:</strong> {readingPost.sourceCitation.publication} ({readingPost.sourceCitation.yearOrDate})
                    </div>
                    {readingPost.sourceCitation.doiOrArchive && (
                      <div className="text-sky-300/90 font-mono text-[11px]">
                        <strong>Archive Ref:</strong> {readingPost.sourceCitation.doiOrArchive}
                      </div>
                    )}
                    <div className="pt-2 text-[10px] text-slate-400 border-t border-slate-800 leading-relaxed">
                      {readingPost.sourceCitation.copyrightNotice}
                    </div>
                  </div>
                </div>

                {/* Key Findings Box */}
                <div className="bg-indigo-950/20 border border-indigo-500/30 rounded-2xl p-4 space-y-2">
                  <div className="text-xs font-bold text-indigo-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    Key Research Takeaways:
                  </div>
                  <ul className="space-y-1.5 text-xs text-slate-300">
                    {readingPost.keyTakeaways.map((takeaway, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{takeaway}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Article Sections */}
                {readingPost.content.map((sec, idx) => (
                  <div key={idx} className="space-y-3">
                    <h3 className="text-base sm:text-lg font-bold text-slate-100">
                      {sec.heading}
                    </h3>
                    {sec.body.map((par, pIdx) => (
                      <p key={pIdx} className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                        {par}
                      </p>
                    ))}
                    {sec.quote && (
                      <blockquote className="my-4 p-4 rounded-xl bg-slate-850 border-l-4 border-sky-400 text-xs sm:text-sm text-sky-200 font-medium italic">
                        &ldquo;{sec.quote}&rdquo;
                      </blockquote>
                    )}
                  </div>
                ))}

                {/* Tags */}
                <div className="pt-4 border-t border-slate-800 flex items-center gap-1.5 flex-wrap">
                  <span className="text-xs text-slate-400 mr-1 flex items-center gap-1">
                    <Tag className="w-3 h-3 text-slate-400" /> Tags:
                  </span>
                  {readingPost.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-xs px-2.5 py-0.5 rounded-lg bg-slate-800 text-slate-300 border border-slate-700"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Modal Footer CTA */}
              <div className="p-4 sm:p-5 border-t border-slate-800 bg-slate-900/90 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  {isAdmin && (
                    <button
                      type="button"
                      onClick={() => {
                        handleOpenEditorialForArticle(readingPost.id);
                        setReadingPost(null);
                      }}
                      className="text-xs text-sky-300 hover:text-sky-200 flex items-center gap-1 font-medium cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Edit Article in Editorial Desk</span>
                    </button>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setReadingPost(null)}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded-xl transition-colors cursor-pointer"
                  >
                    Close Article
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      handlePlayPreset(readingPost.recommendedPresetId);
                      setReadingPost(null);
                    }}
                    className="px-5 py-2 bg-sky-500 hover:bg-sky-400 text-slate-950 font-semibold text-xs rounded-xl transition-colors shadow-lg shadow-sky-500/20 flex items-center gap-1.5 cursor-pointer"
                  >
                    <Headphones className="w-4 h-4" />
                    Apply &amp; Play Soundscape
                  </button>
                </div>
              </div>
            </div>
          </div>,
          document.body
        )}

      {/* Editorial Management Desk & Article Fetcher Modal - Admin Only */}
      {isAdmin && isEditorialModalOpen && (
        <EditorialManagerModal
          isOpen={isEditorialModalOpen}
          onClose={() => {
            setIsEditorialModalOpen(false);
            setEditingArticleId(null);
          }}
          articles={articles}
          onSelectArticleForReading={(article) => setReadingPost(article)}
          initialEditArticleId={editingArticleId}
          onOpenAdminLogin={onOpenAdminLogin}
        />
      )}

      {/* Delete Article In-App Confirmation Modal */}
      {articleToDelete &&
        createPortal(
          <div
            role="dialog"
            aria-modal="true"
            className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto overscroll-contain animate-fade-in"
          >
            <div className="bg-slate-900 border border-rose-500/40 rounded-2xl sm:rounded-3xl p-4 sm:p-6 landscape:p-4 max-w-md w-full shadow-2xl space-y-3.5 sm:space-y-4 max-h-[92dvh] landscape:max-h-[94dvh] overflow-y-auto overscroll-contain my-auto">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-rose-500/20 border border-rose-400/40 flex items-center justify-center text-rose-400 shrink-0">
                  <Trash2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Delete Article?</h3>
                  <p className="text-xs text-slate-400">Science &amp; Research Archive</p>
                </div>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Are you sure you want to permanently delete <strong className="text-white">"{articleToDelete.title}"</strong>? This will remove this research piece from the archive and editorial catalog.
              </p>
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setArticleToDelete(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={confirmDeleteArticle}
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-colors cursor-pointer shadow-md shadow-rose-900/40"
                >
                  Yes, Delete Article
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
};
