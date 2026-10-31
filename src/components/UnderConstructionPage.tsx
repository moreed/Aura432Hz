import React, { useState, useEffect } from 'react';
import {
  Clock,
  Mail,
  Check,
  Copy,
  Lock,
  ArrowRight,
  Quote,
  Eye,
  X,
  Sparkles,
  RefreshCw,
  Share2,
} from 'lucide-react';
import {
  useSiteContent,
  subscribeToConstructionWaitlist,
  UnderConstructionConfig,
} from '../services/siteContent';
import { SacredLotusBreathVisualizer } from './SacredLotusBreathVisualizer';
import { FlatLogo } from './FlatLogo';
import { SacredSocialLinks } from './SacredSocialIcons';
import { getActiveAdminSession } from '../services/adminAuth';

interface UnderConstructionPageProps {
  customConfig?: UnderConstructionConfig;
  isPreview?: boolean;
  isAdmin?: boolean;
  onClosePreview?: () => void;
  onOpenAdminLogin?: () => void;
  onOpenLegalModal?: (tab: 'about' | 'privacy' | 'cookies' | 'terms' | 'affiliate' | 'safety') => void;
  onOpenCookieSettings?: () => void;
  onOpenShareModal?: () => void;
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isPast: boolean;
}

export interface SacredQuote {
  quote: string;
  author: string;
}

export const SACRED_VISITOR_QUOTES: SacredQuote[] = [
  {
    quote: 'Silence is the language of God, all else is poor translation.',
    author: 'Rumi',
  },
  {
    quote: 'If you want to find the secrets of the universe, think in terms of energy, frequency and vibration.',
    author: 'Nikola Tesla',
  },
  {
    quote: 'To the mind that is still, the whole universe surrenders.',
    author: 'Lao Tzu',
  },
  {
    quote: 'The quieter you become, the more you are able to hear.',
    author: 'Zen Proverb',
  },
  {
    quote: 'In the stillness of your presence, you can feel your own formless and timeless reality.',
    author: 'Eckhart Tolle',
  },
  {
    quote: 'Within you there is a stillness and a sanctuary to which you can retreat at any time and be yourself.',
    author: 'Hermann Hesse',
  },
  {
    quote: 'The soul always knows what to do to heal itself. The challenge is to silence the mind.',
    author: 'Caroline Myss',
  },
  {
    quote: 'The one who knows the mystery of sound knows the mystery of the whole universe.',
    author: 'Hazrat Inayat Khan',
  },
  {
    quote: 'Feelings come and go like clouds in a windy sky. Conscious breathing is my anchor.',
    author: 'Thich Nhat Hanh',
  },
  {
    quote: 'Everything in life is vibration.',
    author: 'Albert Einstein',
  },
  {
    quote: 'Peace comes from within. Do not seek it without.',
    author: 'Buddha',
  },
  {
    quote: 'Music in the soul can be heard by the universe.',
    author: 'Lao Tzu',
  },
  {
    quote: 'There is a voice that doesn’t use words. Listen.',
    author: 'Rumi',
  },
  {
    quote: 'The secret of change is to focus all of your energy not on fighting the old, but on building the new.',
    author: 'Socrates',
  },
];

function calculateTimeLeft(targetIso: string): TimeLeft {
  const target = new Date(targetIso).getTime();
  const now = Date.now();
  const diff = target - now;

  if (isNaN(target) || diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, isPast: true };
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  return { days, hours, minutes, seconds, isPast: false };
}

export const UnderConstructionPage: React.FC<UnderConstructionPageProps> = ({
  customConfig,
  isPreview = false,
  isAdmin = false,
  onClosePreview,
  onOpenAdminLogin,
  onOpenLegalModal,
  onOpenCookieSettings,
  onOpenShareModal,
}) => {
  const liveContent = useSiteContent();
  const config = customConfig || liveContent.underConstruction;
  const activeAdminSession = getActiveAdminSession();
  const isUserAdmin = Boolean(isAdmin || activeAdminSession);

  // Countdown timer state
  const [timeLeft, setTimeLeft] = useState<TimeLeft>(() => calculateTimeLeft(config.launchDate));

  useEffect(() => {
    setTimeLeft(calculateTimeLeft(config.launchDate));
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft(config.launchDate));
    }, 1000);
    return () => clearInterval(timer);
  }, [config.launchDate]);

  // Quote state: changes randomly on every visit / page mount
  const [activeQuote, setActiveQuote] = useState<SacredQuote>(() => {
    const pool = config.quote
      ? [{ quote: config.quote, author: config.quoteAuthor || 'Curator' }, ...SACRED_VISITOR_QUOTES]
      : SACRED_VISITOR_QUOTES;
    const randomIndex = Math.floor(Math.random() * pool.length);
    return pool[randomIndex];
  });

  const [quoteFading, setQuoteFading] = useState(false);

  // Allow visitor to cycle to another random quote
  const handleShuffleQuote = () => {
    setQuoteFading(true);
    setTimeout(() => {
      const pool = config.quote
        ? [{ quote: config.quote, author: config.quoteAuthor || 'Curator' }, ...SACRED_VISITOR_QUOTES]
        : SACRED_VISITOR_QUOTES;
      const filtered = pool.filter((q) => q.quote !== activeQuote.quote);
      const chosen = filtered.length > 0 ? filtered[Math.floor(Math.random() * filtered.length)] : pool[0];
      setActiveQuote(chosen);
      setQuoteFading(false);
    }, 200);
  };

  // Email waitlist signup state
  const [waitlistEmail, setWaitlistEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [signupMessage, setSignupMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Email copy state
  const [copiedEmail, setCopiedEmail] = useState(false);

  const handleWaitlistSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!waitlistEmail.trim()) return;

    setIsSubmitting(true);
    setSignupMessage(null);
    try {
      const res = await subscribeToConstructionWaitlist(waitlistEmail);
      if (res.success) {
        setSignupMessage({ type: 'success', text: res.message });
        setWaitlistEmail('');
      } else {
        setSignupMessage({ type: 'error', text: res.message });
      }
    } catch {
      setSignupMessage({ type: 'error', text: 'Unable to register email right now. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyEmail = () => {
    const emailToCopy = config.contactEmail || 'admin@aura432hz.com';
    navigator.clipboard.writeText(emailToCopy);
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2500);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-amber-500/30 selection:text-amber-200 relative overflow-x-hidden font-sans">
      {/* Background Sacred Atmosphere & Subtle Ambient Glow */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[10%] left-1/2 -translate-x-1/2 w-[650px] h-[650px] rounded-full bg-amber-500/10 blur-[140px]" />
        <div className="absolute bottom-[-15%] right-[-10%] w-[550px] h-[550px] rounded-full bg-emerald-500/10 blur-[150px]" />
        <div className="absolute top-[60%] left-[-10%] w-[450px] h-[450px] rounded-full bg-indigo-500/10 blur-[130px]" />
        {/* Sacred Geometry background grid */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, #f59e0b 1px, transparent 0)`,
            backgroundSize: '36px 36px',
          }}
        />
      </div>

      {/* Admin Preview Header Banner */}
      {isPreview && (
        <aside
          aria-label="Admin preview status"
          className="sticky top-0 z-50 bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 text-slate-950 px-4 py-2 text-xs font-semibold flex items-center justify-between shadow-lg"
        >
          <div className="flex items-center gap-2">
            <Eye className="w-4 h-4" />
            <span>Admin Live Preview · Visitor Under Construction Mode</span>
          </div>
          {onClosePreview && (
            <button
              type="button"
              onClick={onClosePreview}
              className="px-2.5 py-0.5 rounded-md bg-slate-950 text-amber-300 hover:bg-slate-900 transition-colors flex items-center gap-1 text-[11px]"
            >
              <X className="w-3.5 h-3.5" />
              <span>Close Preview</span>
            </button>
          )}
        </aside>
      )}

      {/* Top Bar Branding: Side-to-Side Layout with Big, Crisp, Clear Logo (Never covers title) */}
      <header className="relative z-10 w-full pt-7 pb-3 px-4 flex justify-center items-center">
        <div className="inline-flex items-center gap-4 px-5 py-2.5 rounded-2xl bg-slate-900/90 border border-amber-500/30 backdrop-blur-xl shadow-2xl hover:border-amber-500/50 transition-all">
          {/* Big, Crisp Logo without internal overlapping text */}
          <div className="shrink-0 flex items-center justify-center p-1.5 rounded-2xl bg-amber-500/10 border border-amber-500/25 shadow-[0_0_20px_rgba(245,158,11,0.25)]">
            <FlatLogo
              size={84}
              showText={false}
              className="drop-shadow-[0_0_20px_rgba(245,158,11,0.7)]"
            />
          </div>

          {/* Side-by-side title & sanctuary status */}
          <div className="flex flex-col text-left justify-center select-none">
            <div className="flex items-center gap-2">
              <span className="text-lg sm:text-xl md:text-2xl font-black tracking-wider text-white uppercase font-sans">
                Aura <span className="text-amber-400">432Hz</span>
              </span>
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-[9px] font-mono text-amber-300 font-bold uppercase tracking-wider">
                Sanctuary
              </span>
            </div>
            <span className="text-[11px] text-amber-200/75 tracking-wider uppercase font-medium">
              Acoustic Realignment in Progress
            </span>
          </div>
        </div>
      </header>

      {/* Main Focus Hierarchy:
          1. Breath work inside sacred lotus visualizer (with Interactive Breathing Guide)
          2. Main text (Headline & Attention-Holding Subtitle)
          3. Quote (changes randomly for every visit)
          4. Countdown time
          5. Sign up section */}
      <main className="relative z-10 container mx-auto px-4 py-6 md:py-8 max-w-3xl flex-1 flex flex-col items-center justify-center text-center">
        
        {/* 1. Breath work inside Sacred Lotus Visualizer + Interactive Breathing Guide */}
        {config.showVisualizer !== false && (
          <section aria-label="Sacred Lotus Breathwork" className="mb-8 md:mb-10 w-full flex justify-center">
            <SacredLotusBreathVisualizer size={340} />
          </section>
        )}

        {/* 2. Main Text (Headline & Attention-Holding Subtitle) */}
        <section aria-label="Sanctuary Teaser" className="space-y-4 mb-8 md:mb-10 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-medium tracking-wide">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Something Sacred Is Awakening</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white leading-tight">
            {config.title || 'A Sanctuary for Deep Stillness is Awakening'}
          </h1>

          <p className="text-base sm:text-lg text-slate-300 leading-relaxed font-light">
            {config.subtitle ||
              'We are quietly crafting a realm of pure natural resonance and mindful peace. Stay close as our sanctuary doors prepare to open.'}
          </p>
        </section>

        {/* 3. Sacred Quote (Random on every visit with interactive shuffle) */}
        <section
          aria-label="Inspirational sacred quote"
          className="mb-8 md:mb-10 w-full max-w-xl mx-auto p-5 sm:p-6 rounded-2xl bg-gradient-to-b from-slate-900/90 to-slate-950/90 border border-amber-500/25 shadow-xl backdrop-blur-xl relative group transition-all"
        >
          <Quote className="absolute top-3 right-4 w-8 h-8 text-amber-500/15 pointer-events-none" />
          <blockquote className={`space-y-2 relative z-10 text-center transition-opacity duration-200 ${quoteFading ? 'opacity-20' : 'opacity-100'}`}>
            <p className="text-sm sm:text-base font-serif italic text-amber-100/95 leading-relaxed">
              &ldquo;{activeQuote.quote}&rdquo;
            </p>
            {activeQuote.author && (
              <cite className="block text-[11px] sm:text-xs font-sans uppercase tracking-widest text-amber-400/80 font-semibold not-italic">
                — {activeQuote.author}
              </cite>
            )}
          </blockquote>

          {/* Interactive quote shuffle action */}
          <div className="mt-3 pt-3 border-t border-slate-800/60 flex items-center justify-center">
            <button
              type="button"
              onClick={handleShuffleQuote}
              className="text-[11px] text-slate-400 hover:text-amber-300 transition-colors inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg hover:bg-slate-800/60 cursor-pointer"
              title="Reflect on another sacred quote"
            >
              <RefreshCw className="w-3 h-3 text-amber-400/70" />
              <span>Another Reflection</span>
            </button>
          </div>
        </section>

        {/* 4. Launch Countdown Time */}
        {config.showCountdown && (
          <section
            aria-label="Opening countdown timer"
            className="mb-8 md:mb-10 w-full max-w-lg mx-auto text-center space-y-3"
          >
            <div className="flex items-center justify-center gap-1.5 text-xs font-medium text-slate-400 uppercase tracking-widest">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span>Target Sanctuary Opening</span>
            </div>

            {timeLeft.isPast ? (
              <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 font-medium text-xs sm:text-sm">
                ✨ Opening Imminent · The Sanctuary is Awakening
              </div>
            ) : (
              <div className="grid grid-cols-4 gap-2.5 sm:gap-4">
                {[
                  { label: 'Days', value: timeLeft.days },
                  { label: 'Hours', value: timeLeft.hours },
                  { label: 'Minutes', value: timeLeft.minutes },
                  { label: 'Seconds', value: timeLeft.seconds },
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 sm:p-3 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-md shadow-md flex flex-col items-center"
                  >
                    <span className="text-xl sm:text-3xl font-extrabold font-mono text-amber-300">
                      {String(item.value).padStart(2, '0')}
                    </span>
                    <span className="text-[9px] sm:text-[10px] text-slate-400 uppercase tracking-wider mt-0.5">
                      {item.label}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* 5. Sign Up Section (Email waitlist + Direct curator email) */}
        <section
          aria-label="Sanctuary invitation sign up"
          className="w-full max-w-md mx-auto space-y-5"
        >
          {config.showNewsletterSignup && (
            <div className="space-y-3">
              <div className="space-y-1">
                <h2 className="text-base sm:text-lg font-bold text-white tracking-wide">
                  Be the First to Enter
                </h2>
                <p className="text-xs text-slate-400">
                  Receive a private invitation the moment our sanctuary unlocks.
                </p>
              </div>

              <form onSubmit={handleWaitlistSubmit} className="flex flex-col sm:flex-row gap-2">
                <input
                  type="email"
                  value={waitlistEmail}
                  onChange={(e) => setWaitlistEmail(e.target.value)}
                  placeholder="Enter your email address..."
                  required
                  className="flex-1 px-4 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700 text-slate-100 placeholder-slate-500 text-xs sm:text-sm focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-all"
                />
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs sm:text-sm transition-all shadow-lg shadow-amber-500/20 disabled:opacity-60 flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap"
                >
                  {isSubmitting ? (
                    <span>Joining...</span>
                  ) : (
                    <>
                      <span>Notify Me</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </form>

              {signupMessage && (
                <div
                  className={`p-2.5 rounded-xl text-xs ${
                    signupMessage.type === 'success'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                  }`}
                >
                  {signupMessage.text}
                </div>
              )}
            </div>
          )}

          {/* Contact Curator Email */}
          <div className="pt-2 flex flex-col items-center gap-1.5 text-center">
            <span className="text-[11px] text-slate-400">
              Inquiries &amp; Curators:
            </span>
            <div className="inline-flex items-center gap-2 p-1.5 px-3 rounded-xl bg-slate-900/80 border border-slate-800">
              <Mail className="w-3.5 h-3.5 text-amber-400" />
              <a
                href={`mailto:${config.contactEmail || 'admin@aura432hz.com'}`}
                className="text-xs font-mono text-amber-300 hover:text-amber-200 transition-colors"
              >
                {config.contactEmail || 'admin@aura432hz.com'}
              </a>
              <button
                type="button"
                onClick={handleCopyEmail}
                className="p-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors text-[10px] flex items-center gap-1 ml-1 cursor-pointer"
                title="Copy contact email"
              >
                {copiedEmail ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-400" />
                    <span className="text-emerald-400">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* 6. Sacred Social Media Icons Banner */}
          {config.showSocialBanner !== false && (
            <div className="pt-2 flex flex-col items-center gap-2 text-center w-full">
              <div className="w-full p-4 sm:p-5 rounded-2xl sm:rounded-3xl bg-slate-900/80 border border-slate-800/80 backdrop-blur-xl shadow-xl flex flex-col items-center text-center gap-3 relative group hover:border-amber-500/30 transition-all">
                {/* Subtle sacred ambient glow */}
                <div className="absolute inset-0 rounded-2xl sm:rounded-3xl bg-gradient-to-r from-amber-500/5 via-sky-500/5 to-purple-500/5 pointer-events-none" />

                <div className="flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span className="text-[11px] font-bold uppercase tracking-wider text-amber-300 font-mono">
                    Sacred Community Channels
                  </span>
                </div>

                <SacredSocialLinks
                  size={36}
                  showLabels={true}
                  headline={config.socialHeadline || liveContent.social.socialHeadline || 'Connect with the Global Sacred Community • Follow our Reopening Journey'}
                  className="w-full"
                />
              </div>
            </div>
          )}
        </section>
      </main>

      {/* Footer & Discreet Administrator Access */}
      <footer className="relative z-10 border-t border-slate-900/80 bg-slate-950/80 backdrop-blur-md py-6 px-4 text-center text-xs text-slate-400 space-y-3">
        {/* Trust & Legal Consistency Navigation */}
        <div className="flex items-center justify-center gap-3 sm:gap-4 flex-wrap text-[11px] text-slate-400">
          {onOpenLegalModal && (
            <>
              <button
                type="button"
                onClick={() => onOpenLegalModal('privacy')}
                className="hover:text-slate-200 transition-colors cursor-pointer"
              >
                Privacy Policy
              </button>
              <span className="text-slate-700">&bull;</span>
              <button
                type="button"
                onClick={() => onOpenLegalModal('terms')}
                className="hover:text-slate-200 transition-colors cursor-pointer"
              >
                Terms &amp; EULA
              </button>
              <span className="text-slate-700">&bull;</span>
              <button
                type="button"
                onClick={() => onOpenLegalModal('safety')}
                className="hover:text-slate-200 transition-colors cursor-pointer"
              >
                Listening Guidelines
              </button>
              <span className="text-slate-700">&bull;</span>
            </>
          )}
          {onOpenCookieSettings && (
            <>
              <button
                type="button"
                onClick={onOpenCookieSettings}
                className="hover:text-amber-300 transition-colors cursor-pointer"
              >
                Cookie Preferences
              </button>
              <span className="text-slate-700">&bull;</span>
            </>
          )}
          {onOpenShareModal && (
            <button
              type="button"
              onClick={onOpenShareModal}
              className="hover:text-sky-300 transition-colors cursor-pointer inline-flex items-center gap-1"
            >
              <Share2 className="w-3 h-3 text-sky-400" />
              <span>Share Sanctuary</span>
            </button>
          )}
        </div>

        <div>
          &copy; {new Date().getFullYear()} Aura 432Hz Sanctuary. All sacred sound &amp; meditation rights reserved.
        </div>
        <div>
          {onOpenAdminLogin && (
            <button
              type="button"
              onClick={onOpenAdminLogin}
              className="inline-flex items-center gap-1.5 text-slate-400 hover:text-amber-400/80 transition-colors text-[11px] cursor-pointer"
              title="Curator Access"
            >
              <Lock className="w-3 h-3" />
              <span>Curator Portal &amp; Admin Sign In</span>
            </button>
          )}
        </div>
      </footer>
    </div>
  );
};
