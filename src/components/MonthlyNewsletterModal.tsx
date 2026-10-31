import React, { useState, useEffect } from 'react';
import {
  X,
  Mail,
  Sparkles,
  Calendar,
  Send,
  CheckCircle2,
  Play,
  ExternalLink,
  BookOpen,
  ShoppingBag,
  Bell,
  ChevronRight,
  ShieldCheck,
  Headphones,
} from 'lucide-react';
import {
  MonthlyNewsletter,
  fetchMonthlyNewsletters,
  subscribeToNewsletter,
} from '../services/emailService';
import { MixPreset, BUILT_IN_MIX_PRESETS } from '../services/storage';

interface MonthlyNewsletterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyPreset?: (preset: MixPreset) => void;
  onOpenArticle?: (articleId: string) => void;
  onOpenShop?: () => void;
}

export const MonthlyNewsletterModal: React.FC<MonthlyNewsletterModalProps> = ({
  isOpen,
  onClose,
  onApplyPreset,
  onOpenArticle,
  onOpenShop,
}) => {
  const [newsletters, setNewsletters] = useState<MonthlyNewsletter[]>([]);
  const [selectedNewsletterId, setSelectedNewsletterId] = useState<string>('');
  const [subscribeEmail, setSubscribeEmail] = useState('');
  const [subscribeStatus, setSubscribeStatus] = useState<string | null>(null);
  const [isSubscribing, setIsSubscribing] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchMonthlyNewsletters().then((list) => {
        setNewsletters(list);
        if (list.length > 0 && !selectedNewsletterId) {
          setSelectedNewsletterId(list[0].id);
        }
      });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const currentNewsletter =
    newsletters.find((n) => n.id === selectedNewsletterId) || newsletters[0];

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subscribeEmail.trim()) return;
    setIsSubscribing(true);
    const res = await subscribeToNewsletter(subscribeEmail, undefined, 'modal');
    setIsSubscribing(false);
    setSubscribeStatus(res.message);
    if (res.success) {
      setSubscribeEmail('');
    }
  };

  const handlePlayPresetItem = (presetId: string) => {
    const found = BUILT_IN_MIX_PRESETS.find((p) => p.id === presetId);
    if (found && onApplyPreset) {
      onApplyPreset(found);
      onClose();
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="newsletter-modal-title"
      className="fixed inset-0 z-[80] flex items-center justify-center p-2.5 sm:p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto overscroll-contain animate-fade-in"
    >
      <div className="relative w-full max-w-3xl my-auto bg-slate-900 border border-slate-750 rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92dvh] landscape:max-h-[94dvh]">
        {/* Top Header */}
        <div className="p-3.5 sm:p-6 landscape:py-2.5 landscape:px-4 bg-gradient-to-r from-slate-900 via-slate-850 to-indigo-950/60 border-b border-slate-800 flex items-center justify-between gap-3 sm:gap-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-sky-500/15 border border-sky-400/40 text-sky-400 flex items-center justify-center shrink-0 shadow-inner">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded-full border border-sky-500/30 font-mono">
                  Monthly Bulletin
                </span>
                <span className="text-xs text-slate-400 flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-slate-500" />
                  {currentNewsletter?.editionMonth} {currentNewsletter?.year}
                </span>
              </div>
              <h2 id="newsletter-modal-title" className="text-lg sm:text-xl font-bold text-slate-100 mt-0.5">
                {currentNewsletter?.headline || 'Sanctuary Monthly Newsletter'}
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-100 rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
            title="Close Newsletter"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Edition Selector Bar (Wrapping Flex - No Horizontal Scroll) */}
        {newsletters.length > 1 && (
          <div className="px-4 sm:px-6 py-2.5 bg-slate-950/60 border-b border-slate-800 flex flex-wrap items-center gap-2 shrink-0">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider shrink-0 mr-1">
              Editions:
            </span>
            {newsletters.map((n) => {
              const isSelected = n.id === currentNewsletter?.id;
              return (
                <button
                  key={n.id}
                  onClick={() => setSelectedNewsletterId(n.id)}
                  className={`px-3 py-1 rounded-xl text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-sky-500/20 text-sky-200 border border-sky-400/60 shadow-sm font-semibold'
                      : 'bg-slate-800/60 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-750'
                  }`}
                >
                  {n.editionMonth} {n.year}
                </button>
              );
            })}
          </div>
        )}

        {/* Newsletter Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 text-left">
          {/* Intro Message */}
          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 leading-relaxed text-xs sm:text-sm text-slate-300 space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-amber-300">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Sanctuary Curators' Note</span>
            </div>
            <p className="italic text-slate-300">
              &quot;{currentNewsletter?.introMessage}&quot;
            </p>
          </div>

          {/* SECTION 1: WHAT'S NEW IN THE APP */}
          {currentNewsletter?.newUpdates && currentNewsletter.newUpdates.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-sky-400" />
                  <span>Platform &amp; Acoustic Updates</span>
                </h3>
                <span className="text-[10px] text-slate-400 font-mono">
                  {currentNewsletter.newUpdates.length} Enhancements
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
                {currentNewsletter.newUpdates.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-2xl bg-slate-850/70 border border-slate-800 hover:border-slate-700 transition-colors space-y-1.5"
                  >
                    <div className="flex items-center justify-between gap-1.5">
                      <span className="font-semibold text-xs text-slate-100">{item.title}</span>
                      {item.tag && (
                        <span className="text-[9px] font-mono uppercase px-1.5 py-0.5 rounded-full bg-sky-500/15 text-sky-300 border border-sky-500/30 shrink-0">
                          {item.tag}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed">{item.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SECTION 2: FEATURED PRESETS */}
          {currentNewsletter?.featuredPresets && currentNewsletter.featuredPresets.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                  <Headphones className="w-4 h-4 text-emerald-400" />
                  <span>Featured Soundscape Presets</span>
                </h3>
                <span className="text-[10px] text-slate-400 font-mono">Curated Listening</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {currentNewsletter.featuredPresets.map((preset) => (
                  <div
                    key={preset.id}
                    className="p-3.5 rounded-2xl bg-slate-850/80 border border-slate-800 flex flex-col justify-between space-y-2 group"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <span className="font-semibold text-xs text-slate-100 group-hover:text-sky-300 transition-colors">
                          {preset.name}
                        </span>
                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-slate-900 border border-slate-750 text-sky-400">
                          {preset.freq}Hz
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                        {preset.description}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => handlePlayPresetItem(preset.id)}
                      className="w-full py-1.5 px-2.5 rounded-xl bg-slate-800 hover:bg-emerald-500 hover:text-slate-950 text-slate-200 text-[11px] font-semibold border border-slate-700 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Play className="w-3 h-3 fill-current" />
                      <span>Play in Sanctuary</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SECTION 3: CURATED SPIRITUAL & SOUND TOOLS */}
          {currentNewsletter?.featuredProducts && currentNewsletter.featuredProducts.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                  <ShoppingBag className="w-4 h-4 text-amber-400" />
                  <span>Curated Altar &amp; Acoustic Instruments</span>
                </h3>
                {onOpenShop && (
                  <button
                    onClick={() => {
                      onOpenShop();
                      onClose();
                    }}
                    className="text-[11px] text-amber-400 hover:text-amber-300 flex items-center gap-1 font-medium transition-colors"
                  >
                    <span>View Shop</span>
                    <ChevronRight className="w-3 h-3" />
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {currentNewsletter.featuredProducts.map((prod) => (
                  <div
                    key={prod.id}
                    className="p-3 rounded-2xl bg-slate-850/80 border border-slate-800 flex flex-col justify-between space-y-2"
                  >
                    {prod.image && (
                      <div className="w-full h-24 rounded-xl overflow-hidden bg-slate-900">
                        <img
                          src={prod.image}
                          alt={prod.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    )}
                    <div>
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <span className="font-semibold text-xs text-slate-100 line-clamp-1">{prod.name}</span>
                        <span className="text-xs font-mono font-bold text-emerald-400 shrink-0">{prod.price}</span>
                      </div>
                    </div>
                    <a
                      href={prod.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-1.5 px-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-semibold border border-slate-700 transition-colors flex items-center justify-center gap-1"
                    >
                      <span>Learn More</span>
                      <ExternalLink className="w-3 h-3 text-slate-400" />
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SECTION 4: EDITORIAL & SCIENCE ARTICLES */}
          {currentNewsletter?.featuredArticles && currentNewsletter.featuredArticles.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-indigo-400" />
                  <span>Wisdom &amp; Neuroscience Articles</span>
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {currentNewsletter.featuredArticles.map((art) => (
                  <div
                    key={art.id}
                    className="p-4 rounded-2xl bg-slate-850/80 border border-slate-800 space-y-2 flex flex-col justify-between"
                  >
                    <div>
                      <span className="text-[9px] font-mono uppercase px-2 py-0.5 rounded-full bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
                        {art.category}
                      </span>
                      <h4 className="text-xs font-bold text-slate-100 mt-1.5 leading-snug">
                        {art.title}
                      </h4>
                      <p className="text-[11px] text-slate-400 leading-relaxed mt-1">
                        {art.summary}
                      </p>
                    </div>

                    {onOpenArticle && (
                      <button
                        type="button"
                        onClick={() => {
                          onOpenArticle(art.id);
                          onClose();
                        }}
                        className="text-[11px] text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1 transition-colors self-start cursor-pointer pt-1"
                      >
                        <span>Read Full Scientific Study</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SUBSCRIBE / NEWSLETTER SIGNUP BOX */}
          <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-sky-950/40 via-slate-900 to-indigo-950/50 border border-sky-500/30 space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center shrink-0">
                <Bell className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-slate-100">
                  Receive the Monthly Sanctuary Bulletin via Email
                </h4>
                <p className="text-[11px] text-slate-400">
                  Delivered on the 1st of every month. No spam, zero clutter, easily unsubscribe anytime.
                </p>
              </div>
            </div>

            <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-2">
              <input
                type="email"
                placeholder="Enter your email address..."
                value={subscribeEmail}
                onChange={(e) => setSubscribeEmail(e.target.value)}
                className="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-750 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-sky-400"
                required
              />
              <button
                type="submit"
                disabled={isSubscribing || !subscribeEmail.trim()}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-sky-400 to-indigo-500 hover:from-sky-300 hover:to-indigo-400 disabled:opacity-50 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-md shadow-sky-500/20"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isSubscribing ? 'Subscribing...' : 'Subscribe Free'}</span>
              </button>
            </form>

            {subscribeStatus && (
              <div className="p-2.5 rounded-xl bg-emerald-950/50 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{subscribeStatus}</span>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 sm:p-4 bg-slate-950/80 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400 shrink-0">
          <div className="flex items-center gap-1.5 text-slate-400">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Curated monthly by Aura 432Hz Sound Therapists &amp; Engineers</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
