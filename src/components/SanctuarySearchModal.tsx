import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Search,
  X,
  Headphones,
  Sliders,
  ShoppingBag,
  BookOpen,
  Volume2,
  VolumeX,
  Play,
  Pause,
  Check,
  ArrowRight,
  ExternalLink,
  Brain,
  Radio,
  FileText,
  ShieldCheck,
  Sparkles,
  Command,
  CornerDownLeft,
  Flame,
  Droplets,
  CloudRain,
  Waves,
  Wind,
  Bird,
  CloudLightning,
  Moon,
  Bell,
  Music,
  Layers,
  Star,
  Tag,
} from 'lucide-react';
import { SearchCategoryFilter, SearchResultItem } from '../types/search';
import {
  buildSearchCatalog,
  searchSanctuaryCatalog,
  POPULAR_SEARCH_SUGGESTIONS,
} from '../services/searchService';
import { NatureSoundState, BrainwaveMode } from '../services/audioEngine';
import { MixPreset } from '../services/storage';
import { SpiritualProduct } from '../data/spiritualProducts';
import { EditorialArticle } from '../services/editorialStorage';
import { BuyingGuideArticle } from './BuyingGuidesSection';

interface SanctuarySearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeNatureSounds: NatureSoundState[];
  isPlaying: boolean;
  currentPresetId: string | null;
  baseFreq: number;
  brainwaveMode: BrainwaveMode;
  onApplyPreset: (preset: MixPreset) => void;
  onSelectFrequency: (freq: number, mode?: BrainwaveMode) => void;
  onToggleNatureSound: (id: string) => void;
  onNatureVolumeChange: (id: string, volume: number) => void;
  onOpenProduct: (productId: string) => void;
  onOpenArticle: (article: EditorialArticle) => void;
  onOpenSafetyModal: () => void;
  onNavigateToTab: (tab: 'player' | 'gear' | 'blog') => void;
  onTogglePlay?: () => void;
}

export const SanctuarySearchModal: React.FC<SanctuarySearchModalProps> = ({
  isOpen,
  onClose,
  activeNatureSounds,
  isPlaying,
  currentPresetId,
  baseFreq,
  brainwaveMode,
  onApplyPreset,
  onSelectFrequency,
  onToggleNatureSound,
  onNatureVolumeChange,
  onOpenProduct,
  onOpenArticle,
  onOpenSafetyModal,
  onNavigateToTab,
  onTogglePlay,
}) => {
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<SearchCategoryFilter>('all');
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Build searchable catalog whenever active nature sounds change
  const catalog = useMemo(() => {
    return buildSearchCatalog(activeNatureSounds);
  }, [activeNatureSounds]);

  // Execute live search
  const results = useMemo(() => {
    return searchSanctuaryCatalog(query, selectedCategory, catalog);
  }, [query, selectedCategory, catalog]);

  // Compute category counts for current query
  const categoryCounts = useMemo(() => {
    const rawAll = searchSanctuaryCatalog(query, 'all', catalog);
    return {
      all: rawAll.length,
      soundscapes: rawAll.filter((i) => i.category === 'soundscapes').length,
      layers: rawAll.filter((i) => i.category === 'layers').length,
      products: rawAll.filter((i) => i.category === 'products').length,
      science: rawAll.filter((i) => i.category === 'science').length,
    };
  }, [query, catalog]);

  // Reset selected index when results change
  useEffect(() => {
    setSelectedIndex(0);
  }, [results.length, selectedCategory, query]);

  // Auto-focus input on open and lock body scroll
  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      setTimeout(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
      }, 50);
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    } else {
      setQuery('');
      setSelectedCategory('all');
    }
  }, [isOpen]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev < results.length - 1 ? prev + 1 : 0));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : Math.max(0, results.length - 1)));
      } else if (e.key === 'Enter') {
        if (results[selectedIndex]) {
          e.preventDefault();
          handleExecuteItemAction(results[selectedIndex]);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, results, selectedIndex]);

  // Scroll selected item into view
  useEffect(() => {
    if (listRef.current) {
      const selectedEl = listRef.current.querySelector(`[data-index="${selectedIndex}"]`);
      if (selectedEl) {
        selectedEl.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      }
    }
  }, [selectedIndex]);

  if (!isOpen) return null;

  // Handle primary action on any search item
  const handleExecuteItemAction = (item: SearchResultItem) => {
    if (item.type === 'soundscape' && item.preset) {
      if (currentPresetId === item.preset.id && isPlaying) {
        if (onTogglePlay) onTogglePlay();
      } else {
        onApplyPreset(item.preset);
        if (!isPlaying && onTogglePlay) {
          onTogglePlay();
        }
      }
      onClose();
    } else if (item.type === 'solfeggio' && item.frequencyHz) {
      onSelectFrequency(item.frequencyHz);
      onClose();
    } else if (item.type === 'brainwave' && item.brainwaveMode) {
      onSelectFrequency(baseFreq, item.brainwaveMode);
      onClose();
    } else if (item.type === 'acoustic_layer' && item.layer) {
      onToggleNatureSound(item.layer.id);
    } else if (item.type === 'product' && item.product) {
      onOpenProduct(item.product.id);
      onClose();
    } else if (item.type === 'editorial_article' && item.article) {
      onOpenArticle(item.article);
      onClose();
    } else if (item.type === 'buying_guide') {
      onNavigateToTab('gear');
      onClose();
    } else if (item.type === 'acoustic_safety') {
      onOpenSafetyModal();
      onClose();
    }
  };

  // Render icon helper
  const renderItemIcon = (iconName: string, category: string) => {
    const iconClass = 'w-5 h-5';
    switch (iconName) {
      case 'Headphones':
        return <Headphones className={`${iconClass} text-emerald-400`} />;
      case 'Brain':
        return <Brain className={`${iconClass} text-purple-400`} />;
      case 'Radio':
        return <Radio className={`${iconClass} text-cyan-400`} />;
      case 'CloudRain':
        return <CloudRain className={`${iconClass} text-sky-400`} />;
      case 'Waves':
        return <Waves className={`${iconClass} text-cyan-400`} />;
      case 'Bird':
        return <Bird className={`${iconClass} text-emerald-400`} />;
      case 'Wind':
        return <Wind className={`${iconClass} text-teal-400`} />;
      case 'CloudLightning':
        return <CloudLightning className={`${iconClass} text-purple-400`} />;
      case 'Droplets':
        return <Droplets className={`${iconClass} text-blue-400`} />;
      case 'Flame':
        return <Flame className={`${iconClass} text-amber-400`} />;
      case 'Moon':
        return <Moon className={`${iconClass} text-indigo-400`} />;
      case 'Bell':
        return <Bell className={`${iconClass} text-yellow-400`} />;
      case 'Music':
        return <Music className={`${iconClass} text-emerald-300`} />;
      case 'Layers':
        return <Layers className={`${iconClass} text-rose-400`} />;
      case 'ShoppingBag':
        return <ShoppingBag className={`${iconClass} text-amber-400`} />;
      case 'BookOpen':
        return <BookOpen className={`${iconClass} text-indigo-400`} />;
      case 'FileText':
        return <FileText className={`${iconClass} text-sky-400`} />;
      case 'ShieldCheck':
        return <ShieldCheck className={`${iconClass} text-emerald-400`} />;
      default:
        return category === 'layers' ? (
          <Sliders className={`${iconClass} text-teal-400`} />
        ) : (
          <Sparkles className={`${iconClass} text-amber-400`} />
        );
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Sanctuary Search & Acoustic Control Palette"
      className="fixed inset-0 z-50 flex items-start justify-center pt-8 sm:pt-16 p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-3xl bg-slate-900 border border-slate-700/80 rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* TOP SEARCH BAR */}
        <div className="p-3.5 sm:p-4 border-b border-slate-800 bg-slate-950/70 flex items-center gap-3">
          <div className="p-2 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20 shrink-0">
            <Search className="w-5 h-5" />
          </div>

          <div className="flex-1 relative">
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search soundscapes, acoustic layers, gear, science & research..."
              className="w-full bg-transparent text-sm sm:text-base font-medium text-slate-100 placeholder-slate-400 focus:outline-none"
            />
          </div>

          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery('');
                inputRef.current?.focus();
              }}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors cursor-pointer"
              title="Clear search query"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          <div className="hidden sm:flex items-center gap-1 text-[10px] font-mono text-slate-400 bg-slate-800/80 px-2 py-1 rounded-lg border border-slate-700/60 shrink-0">
            <span>ESC</span>
            <span>to close</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer sm:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* CATEGORY FILTER PILLS */}
        <div className="px-3.5 sm:px-4 py-2 border-b border-slate-800/80 bg-slate-950/40 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          {(
            [
              { id: 'all', label: 'All Results', count: categoryCounts.all },
              { id: 'soundscapes', label: 'Soundscapes', count: categoryCounts.soundscapes },
              { id: 'layers', label: 'Acoustic Layers', count: categoryCounts.layers },
              { id: 'products', label: 'Products & Gear', count: categoryCounts.products },
              { id: 'science', label: 'Science & Blog', count: categoryCounts.science },
            ] as const
          ).map((cat) => {
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-2.5 py-1 rounded-xl text-xs font-semibold transition-all shrink-0 flex items-center gap-1.5 cursor-pointer ${
                  isSelected
                    ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border border-transparent'
                }`}
              >
                <span>{cat.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                    isSelected ? 'bg-sky-500/30 text-sky-200' : 'bg-slate-800 text-slate-500'
                  }`}
                >
                  {cat.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* RESULTS SCROLLABLE LIST */}
        <div ref={listRef} className="flex-1 overflow-y-auto p-2 sm:p-3 space-y-1.5 max-h-[58vh]">
          {/* EMPTY QUERY: SUGGESTIONS BANNER */}
          {!query.trim() && (
            <div className="p-3 mb-2 bg-slate-950/40 rounded-2xl border border-slate-800/80 space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-300">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Popular Quick Searches:</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {POPULAR_SEARCH_SUGGESTIONS.map((sugg) => (
                  <button
                    key={sugg.query}
                    type="button"
                    onClick={() => {
                      setQuery(sugg.query);
                      setSelectedCategory(sugg.category);
                      inputRef.current?.focus();
                    }}
                    className="px-2.5 py-1 rounded-lg text-xs bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-sky-300 border border-slate-700/80 hover:border-sky-500/40 transition-all cursor-pointer"
                  >
                    {sugg.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* NO RESULTS STATE */}
          {results.length === 0 && (
            <div className="py-12 px-4 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-slate-800/60 border border-slate-700 flex items-center justify-center mx-auto text-slate-500">
                <Search className="w-6 h-6" />
              </div>
              <div className="text-sm font-semibold text-slate-200">
                No matching results found for "{query}"
              </div>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Try searching for specific frequencies (e.g. "432", "528"), acoustic layers (e.g. "rain", "bowls", "koshi"), equipment ("headphones"), or topics ("sleep", "vagus").
              </p>
              <button
                type="button"
                onClick={() => {
                  setQuery('');
                  setSelectedCategory('all');
                }}
                className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 transition-colors"
              >
                Reset Search
              </button>
            </div>
          )}

          {/* RESULT ITEMS */}
          {results.map((item, index) => {
            const isSelected = index === selectedIndex;
            const currentLiveLayer =
              item.type === 'acoustic_layer'
                ? activeNatureSounds.find((s) => s.id === item.layer?.id) || item.layer
                : null;

            const isCurrentlyPlayingSoundscape =
              item.type === 'soundscape' &&
              item.preset &&
              currentPresetId === item.preset.id &&
              isPlaying;

            return (
              <div
                key={item.id}
                data-index={index}
                onClick={() => handleExecuteItemAction(item)}
                onMouseEnter={() => setSelectedIndex(index)}
                className={`group relative p-3 sm:p-3.5 rounded-2xl border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-slate-800/90 border-sky-500/60 shadow-lg shadow-sky-950/20'
                    : 'bg-slate-950/50 hover:bg-slate-800/60 border-slate-800/80 hover:border-slate-700'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  {/* Left: Icon & Description */}
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 shrink-0 mt-0.5 shadow-sm group-hover:scale-105 transition-transform">
                      {renderItemIcon(item.iconName, item.category)}
                    </div>

                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="text-xs sm:text-sm font-bold text-slate-100 group-hover:text-white truncate">
                          {item.title}
                        </span>

                        <span
                          className={`text-[10px] font-mono px-2 py-0.2 rounded-full border font-semibold ${item.badgeColor}`}
                        >
                          {item.badge}
                        </span>

                        {isCurrentlyPlayingSoundscape && (
                          <span className="text-[10px] font-mono px-2 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1 animate-pulse">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                            Now Playing
                          </span>
                        )}
                      </div>

                      {item.subtitle && (
                        <p className="text-xs text-sky-300/80 font-medium line-clamp-1">
                          {item.subtitle}
                        </p>
                      )}

                      <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                        {item.description}
                      </p>

                      {/* SPECIAL: INTERACTIVE CONTROLS FOR INDIVIDUAL ACOUSTIC LAYERS */}
                      {item.type === 'acoustic_layer' && currentLiveLayer && (
                        <div
                          className="mt-2.5 pt-2 border-t border-slate-800 flex flex-wrap items-center gap-2 sm:gap-4"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {/* Live Toggle Button */}
                          <button
                            type="button"
                            onClick={() => onToggleNatureSound(currentLiveLayer.id)}
                            className={`px-2.5 py-1 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                              currentLiveLayer.enabled
                                ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm'
                                : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
                            }`}
                          >
                            {currentLiveLayer.enabled ? (
                              <>
                                <Volume2 className="w-3.5 h-3.5 text-white" />
                                <span>Layer Active</span>
                              </>
                            ) : (
                              <>
                                <VolumeX className="w-3.5 h-3.5 text-slate-400" />
                                <span>Muted (Tap to Activate)</span>
                              </>
                            )}
                          </button>

                          {/* Live Volume Slider */}
                          <div className="flex items-center gap-2 flex-1 min-w-[140px] max-w-xs">
                            <span className="text-[10px] text-slate-400 font-mono shrink-0">
                              Vol: {Math.round(currentLiveLayer.volume * 100)}%
                            </span>
                            <input
                              type="range"
                              min="0"
                              max="1"
                              step="0.05"
                              value={currentLiveLayer.volume}
                              onChange={(e) =>
                                onNatureVolumeChange(currentLiveLayer.id, parseFloat(e.target.value))
                              }
                              className="w-full accent-sky-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                            />
                          </div>

                          {/* Quick Volume Preset Buttons */}
                          <div className="flex items-center space-x-1">
                            {[0.25, 0.5, 0.75, 1.0].map((v) => (
                              <button
                                key={v}
                                type="button"
                                onClick={() => onNatureVolumeChange(currentLiveLayer.id, v)}
                                className={`px-1.5 py-0.5 rounded text-[10px] font-mono transition-colors ${
                                  Math.abs(currentLiveLayer.volume - v) < 0.05
                                    ? 'bg-sky-500/30 text-sky-200 border border-sky-400/40'
                                    : 'bg-slate-900 text-slate-400 hover:text-slate-200'
                                }`}
                              >
                                {Math.round(v * 100)}%
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right: Quick Action Trigger */}
                  <div className="shrink-0 flex items-center space-x-1.5">
                    {item.type === 'soundscape' && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleExecuteItemAction(item);
                        }}
                        className={`px-3 py-1.5 rounded-xl font-semibold text-xs shadow-md active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer ${
                          isCurrentlyPlayingSoundscape
                            ? 'bg-rose-500 hover:bg-rose-400 text-white shadow-rose-500/25'
                            : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white'
                        }`}
                        title={isCurrentlyPlayingSoundscape ? 'Pause soundscape' : 'Play this soundscape'}
                      >
                        {isCurrentlyPlayingSoundscape ? (
                          <>
                            <Pause className="w-3.5 h-3.5 fill-current" />
                            <span className="hidden sm:inline">Pause</span>
                          </>
                        ) : (
                          <>
                            <Play className="w-3.5 h-3.5 fill-current" />
                            <span className="hidden sm:inline">Play Soundscape</span>
                          </>
                        )}
                      </button>
                    )}

                    {item.type === 'solfeggio' && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleExecuteItemAction(item);
                        }}
                        className="px-3 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs shadow-md active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer"
                      >
                        <Radio className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Tune {item.frequencyHz}Hz</span>
                      </button>
                    )}

                    {item.type === 'product' && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleExecuteItemAction(item);
                        }}
                        className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-semibold text-xs shadow-md active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer"
                      >
                        <ShoppingBag className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">View Gear</span>
                      </button>
                    )}

                    {item.type === 'editorial_article' && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleExecuteItemAction(item);
                        }}
                        className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-md active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer"
                      >
                        <BookOpen className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Read Article</span>
                      </button>
                    )}

                    {item.type === 'buying_guide' && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleExecuteItemAction(item);
                        }}
                        className="px-3 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs shadow-md active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">View Guide</span>
                      </button>
                    )}

                    {item.type === 'acoustic_safety' && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleExecuteItemAction(item);
                        }}
                        className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-md active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer"
                      >
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">View Standards</span>
                      </button>
                    )}

                    <div className="p-1 text-slate-500 group-hover:text-slate-300 transition-colors">
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* FOOTER SHORTCUTS HELPER */}
        <div className="p-2.5 sm:p-3 border-t border-slate-800 bg-slate-950/80 text-[11px] text-slate-400 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-[10px] font-mono text-slate-300">
                ↑
              </kbd>
              <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-[10px] font-mono text-slate-300">
                ↓
              </kbd>
              <span>to navigate</span>
            </span>

            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-[10px] font-mono text-slate-300 flex items-center">
                <CornerDownLeft className="w-2.5 h-2.5" />
              </kbd>
              <span>to select / play</span>
            </span>

            <span className="hidden sm:inline-flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-[10px] font-mono text-slate-300">
                ESC
              </kbd>
              <span>to close</span>
            </span>
          </div>

          <div className="flex items-center gap-1 text-slate-500">
            <span>Aura 432Hz Unified Sanctuary Omnisearch</span>
          </div>
        </div>
      </div>
    </div>
  );
};
