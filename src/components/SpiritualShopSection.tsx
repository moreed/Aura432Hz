import React, { useState } from 'react';
import {
  Flame,
  Sparkles,
  Heart,
  Play,
  Pause,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Send,
  BellRing,
  Award,
  Sparkle,
} from 'lucide-react';
import { audioEngine } from '../services/audioEngine';
import { SpiritualProduct, SPIRITUAL_AND_AUDIO_PRODUCTS } from '../data/spiritualProducts';
import { applyPageSeo } from '../services/seo';

export type { SpiritualProduct };
export { SPIRITUAL_AND_AUDIO_PRODUCTS };

export interface SpiritualShopSectionProps {
  isAdmin?: boolean;
  highlightProductId?: string | null;
}

export const SpiritualShopSection: React.FC<SpiritualShopSectionProps> = ({
  isAdmin = false,
  highlightProductId = null,
}) => {
  const [isTestingSound, setIsTestingSound] = useState<string | null>(null);
  const [notifyEmail, setNotifyEmail] = useState<string>('');
  const [isSubscribed, setIsSubscribed] = useState<boolean>(() => {
    try {
      return localStorage.getItem('aura_shop_launch_notify') === 'true';
    } catch {
      return false;
    }
  });
  const [subscribeMessage, setSubscribeMessage] = useState<string | null>(null);

  // Apply SEO on mount
  React.useEffect(() => {
    applyPageSeo('gear', false);
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    if (document.documentElement) document.documentElement.scrollTop = 0;
    if (document.body) document.body.scrollTop = 0;
  }, []);

  // Handle Notify Me Submission
  const handleNotifySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!notifyEmail || !notifyEmail.includes('@')) return;

    try {
      localStorage.setItem('aura_shop_launch_notify', 'true');
      const savedList = JSON.parse(localStorage.getItem('aura_shop_notify_emails') || '[]');
      if (!savedList.includes(notifyEmail.trim().toLowerCase())) {
        savedList.push(notifyEmail.trim().toLowerCase());
        localStorage.setItem('aura_shop_notify_emails', JSON.stringify(savedList));
      }
    } catch {}

    setIsSubscribed(true);
    setSubscribeMessage('Blessing received! You are on our priority sanctuary launch circle.');
    setNotifyEmail('');
  };

  // Enhanced Sound triggers using Web Audio API via audioEngine
  const handleTriggerAcoustic = async (type: 'bowl' | 'chime' | 'fork' | 'stage' | 'crystal' | 'bundle') => {
    try {
      if (isTestingSound === type) {
        audioEngine.stop();
        setIsTestingSound(null);
        return;
      }

      setIsTestingSound(type);

      if (type === 'bundle') {
        audioEngine.playSacredBundleExperience();
        setTimeout(() => {
          audioEngine.playKoshiElementalChimes();
        }, 1200);
        setTimeout(() => setIsTestingSound(null), 6500);
      } else if (type === 'crystal') {
        audioEngine.playCrystalSingingBowl(432);
        setTimeout(() => setIsTestingSound(null), 7000);
      } else if (type === 'bowl') {
        audioEngine.strikeTibetanBowl();
        setTimeout(() => setIsTestingSound(null), 5500);
      } else if (type === 'chime') {
        audioEngine.playKoshiElementalChimes();
        setTimeout(() => setIsTestingSound(null), 5000);
      } else if (type === 'fork') {
        audioEngine.playTuningFork432();
        setTimeout(() => setIsTestingSound(null), 5500);
      } else if (type === 'stage') {
        audioEngine.playSoundstageSeparationTest();
        setTimeout(() => setIsTestingSound(null), 6000);
      }
    } catch (err) {
      console.warn('Acoustic test trigger notice:', err);
      setIsTestingSound(null);
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300">
      {/* ========================================================================= */}
      {/* 1. WELCOME SECTION (HERO BANNER) */}
      {/* ========================================================================= */}
      <div className="relative overflow-hidden bg-gradient-to-b from-slate-900 via-slate-900/95 to-slate-950 border border-slate-800 rounded-3xl p-5 sm:p-7 md:p-9 shadow-2xl">
        {/* Glow Spheres */}
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-96 h-96 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />
        <div className="absolute left-1/3 bottom-0 w-80 h-80 rounded-full bg-sky-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl">
          <div className="flex items-center gap-2.5 flex-wrap mb-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/25 border border-amber-400/60 text-amber-300 text-xs sm:text-sm font-bold shadow-md">
              <Flame className="w-4 h-4 text-amber-400 animate-pulse" />
              <span>Official Aura Shop</span>
            </div>

            <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-amber-400 text-slate-950 font-black text-xs sm:text-sm uppercase tracking-wider shadow-lg shadow-amber-500/40 border border-amber-300 animate-pulse">
              <Clock className="w-4 h-4 text-slate-950" />
              <span>Launching Soon</span>
            </div>
          </div>

          <h2 className="text-2xl sm:text-4xl md:text-5xl font-light text-slate-100 tracking-tight leading-tight">
            Welcome to the <strong className="text-amber-400 font-extrabold">Aura Shop</strong>{' '}
            <span className="text-amber-300 font-bold text-xl sm:text-3xl md:text-4xl block sm:inline mt-1 sm:mt-0">
              — Launching Soon
            </span>
          </h2>
          <div className="text-sm sm:text-base text-slate-300 font-medium mt-1">
            Audio Gear, Mindful Atmosphere, Sacred Incense &amp; Sound Meditation Tools
          </div>

          <p className="text-xs sm:text-sm text-slate-400 mt-2 leading-relaxed">
            Curated acoustic tools and mindful gear tested for 432Hz harmonic coherence, deep meditation, and acoustic comfort.
          </p>

          {/* Interactive Live Acoustic Station */}
          <div className="mt-5 pt-5 border-t border-slate-800/80">
            <div className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-2.5 flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Interactive Acoustic Sound &amp; Atmosphere Check:</span>
            </div>

            <div className="flex flex-wrap items-center gap-2 sm:gap-3">

              <button
                type="button"
                onClick={() => handleTriggerAcoustic('chime')}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all shadow-md active:scale-95 cursor-pointer ${
                  isTestingSound === 'chime'
                    ? 'bg-emerald-400 text-slate-950 border border-emerald-300 shadow-emerald-400/30'
                    : 'bg-slate-900 border border-slate-750 text-slate-200 hover:border-emerald-400/50 hover:bg-slate-850'
                }`}
                title={isTestingSound === 'chime' ? 'Stop Koshi Chimes' : 'Ring French Koshi elemental bamboo chimes'}
              >
                {isTestingSound === 'chime' ? (
                  <>
                    <Pause className="w-3.5 h-3.5 fill-current animate-pulse text-slate-950" />
                    <span>Stop Koshi Chimes</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 text-emerald-400 fill-current" />
                    <span>Ring Koshi Chimes</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => handleTriggerAcoustic('fork')}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all shadow-md active:scale-95 cursor-pointer ${
                  isTestingSound === 'fork'
                    ? 'bg-indigo-400 text-slate-950 border border-indigo-300 shadow-indigo-400/30'
                    : 'bg-slate-900 border border-slate-750 text-slate-200 hover:border-indigo-400/50 hover:bg-slate-850'
                }`}
                title={isTestingSound === 'fork' ? 'Stop 432Hz tone' : 'Sound 432Hz pure sinusoidal tuning tone'}
              >
                {isTestingSound === 'fork' ? (
                  <>
                    <Pause className="w-3.5 h-3.5 fill-current animate-pulse text-slate-950" />
                    <span>Stop 432Hz Tone</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 text-indigo-400 fill-current" />
                    <span>432Hz Tuning Tone</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => handleTriggerAcoustic('crystal')}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all shadow-md active:scale-95 cursor-pointer ${
                  isTestingSound === 'crystal'
                    ? 'bg-sky-400 text-slate-950 border border-sky-300 shadow-sky-400/30'
                    : 'bg-slate-900 border border-slate-750 text-slate-200 hover:border-sky-400/50 hover:bg-slate-850'
                }`}
                title={isTestingSound === 'crystal' ? 'Stop Crystal Bowl sound' : 'Sound pure 432Hz quartz crystal singing bowl'}
              >
                {isTestingSound === 'crystal' ? (
                  <>
                    <Pause className="w-3.5 h-3.5 fill-current animate-pulse text-slate-950" />
                    <span>Stop Crystal Bowl (432Hz)</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 text-sky-400 fill-current" />
                    <span>Quartz Crystal Bowl (432Hz)</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => handleTriggerAcoustic('bundle')}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all shadow-md active:scale-95 cursor-pointer ${
                  isTestingSound === 'bundle'
                    ? 'bg-gradient-to-r from-amber-400 to-rose-400 text-slate-950 border border-amber-300 shadow-amber-400/30'
                    : 'bg-slate-900 border border-slate-750 text-slate-200 hover:border-amber-400/50 hover:bg-slate-850'
                }`}
                title={isTestingSound === 'bundle' ? 'Stop Sacred Bundle Immersion' : 'Listen to multi-layered Sacred Bundle sound immersion'}
              >
                {isTestingSound === 'bundle' ? (
                  <>
                    <Pause className="w-3.5 h-3.5 fill-current animate-pulse text-slate-950" />
                    <span>Stop Sacred Bundle</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 text-amber-300 fill-current" />
                    <span>Sacred Bundle Immersion</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => handleTriggerAcoustic('stage')}
                className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all shadow-md active:scale-95 cursor-pointer ${
                  isTestingSound === 'stage'
                    ? 'bg-rose-500 text-white border border-rose-400 shadow-rose-500/30'
                    : 'bg-gradient-to-r from-sky-400 to-indigo-500 text-slate-950 hover:from-sky-300 hover:to-indigo-400'
                }`}
                title={isTestingSound === 'stage' ? 'Stop Soundstage Test' : 'Test stereo soundstage separation and 432Hz binaural wave'}
              >
                {isTestingSound === 'stage' ? (
                  <>
                    <Pause className="w-3.5 h-3.5 fill-current animate-pulse" />
                    <span>Stop Soundstage (432Hz)</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Test Stereo Soundstage (432Hz)</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. LAUNCHING SOON PROMISE SECTION (TO VISITORS) */}
      {/* ========================================================================= */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-900/90 to-amber-950/30 border border-amber-500/30 rounded-3xl p-6 sm:p-8 md:p-10 shadow-2xl space-y-8">
        {/* Ambient background aura glow */}
        <div className="absolute -top-24 -left-24 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-80 h-80 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header Statement */}
        <div className="relative z-10 text-center max-w-2xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-400/10 border border-amber-400/40 text-amber-300 text-xs font-bold uppercase tracking-widest shadow-sm">
            <Sparkle className="w-3.5 h-3.5 text-amber-400 animate-spin" style={{ animationDuration: '6s' }} />
            <span>Our Sacred Promise to Visitors</span>
          </div>

          <h3 className="text-2xl sm:text-3xl md:text-4xl font-light text-slate-100 tracking-tight">
            We Are Launching <strong className="font-bold text-amber-400">Very Soon</strong>
          </h3>

          <p className="text-xs sm:text-sm md:text-base text-slate-300 leading-relaxed font-normal">
            We are hand-crafting and meticulously curating our sanctuary storefront. We promise to bring you certified 
            432Hz harmonic acoustic gear, authentic Himalayan singing bowls, pure organic temple incense, and audiophile 
            sound meditation equipment — all tuned to elevate your daily practice.
          </p>
        </div>

        {/* Feature Preview Cards */}
        <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
          <div className="p-5 sm:p-6 rounded-2xl bg-slate-950/60 border border-slate-800/80 hover:border-amber-400/30 transition-all space-y-2.5">
            <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-400/30 flex items-center justify-center text-amber-300 text-lg">
              🥣
            </div>
            <h4 className="text-sm sm:text-base font-semibold text-slate-100 flex items-center gap-2">
              <span>Hand-Hammered Tibetan &amp; Crystal Singing Bowls</span>
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Crafted by generational Himalayan artisans and tuned specifically to pure Solfeggio 432Hz, 528Hz, and 639Hz 
              heart frequencies with deep harmonic resonance and sustained overtones.
            </p>
          </div>

          <div className="p-5 sm:p-6 rounded-2xl bg-slate-950/60 border border-slate-800/80 hover:border-amber-400/30 transition-all space-y-2.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-400/30 flex items-center justify-center text-emerald-300 text-lg">
              🌿
            </div>
            <h4 className="text-sm sm:text-base font-semibold text-slate-100 flex items-center gap-2">
              <span>Sacred Temple Incense &amp; Organic Smudge Bundles</span>
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Ethically wildcrafted Palo Santo, pure white sage, and natural aromatic resins free of synthetic binders, 
              preservatives, or artificial fragrances for deep energetic space clearing.
            </p>
          </div>

          <div className="p-5 sm:p-6 rounded-2xl bg-slate-950/60 border border-slate-800/80 hover:border-amber-400/30 transition-all space-y-2.5">
            <div className="w-10 h-10 rounded-xl bg-sky-500/15 border border-sky-400/30 flex items-center justify-center text-sky-300 text-lg">
              🎧
            </div>
            <h4 className="text-sm sm:text-base font-semibold text-slate-100 flex items-center gap-2">
              <span>Audiophile Headphones &amp; 432Hz Soundstage DACs</span>
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Acoustically transparent open-back headphones and low-jitter digital-to-analog converters chosen for pristine 
              micro-detail reproduction in binaural beats and subtle frequency medicine.
            </p>
          </div>

          <div className="p-5 sm:p-6 rounded-2xl bg-slate-950/60 border border-slate-800/80 hover:border-amber-400/30 transition-all space-y-2.5">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/15 border border-indigo-400/30 flex items-center justify-center text-indigo-300 text-lg">
              🕯️
            </div>
            <h4 className="text-sm sm:text-base font-semibold text-slate-100 flex items-center gap-2">
              <span>Mindful Sanctuary Altars, Zafu Cushions &amp; Chimes</span>
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Organic buckwheat meditation cushions, precision tuned elemental Koshi wind chimes, and handcrafted sacred 
              geometry focal pieces to complete your home sanctuary space.
            </p>
          </div>
        </div>

        {/* Our Sanctuary Pledges & Guarantees */}
        <div className="relative z-10 pt-4 border-t border-slate-800/80">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            <div className="p-3 rounded-xl bg-slate-950/40 border border-slate-800/60 space-y-1">
              <ShieldCheck className="w-5 h-5 text-amber-400 mx-auto" />
              <div className="text-[11px] font-bold text-slate-200">100% 432Hz Verified</div>
              <div className="text-[10px] text-slate-400">Tested harmonic coherence</div>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/40 border border-slate-800/60 space-y-1">
              <Heart className="w-5 h-5 text-rose-400 mx-auto" />
              <div className="text-[11px] font-bold text-slate-200">Ethical &amp; Pure</div>
              <div className="text-[10px] text-slate-400">Zero synthetic fillers</div>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/40 border border-slate-800/60 space-y-1">
              <Award className="w-5 h-5 text-emerald-400 mx-auto" />
              <div className="text-[11px] font-bold text-slate-200">Artisan Fair Trade</div>
              <div className="text-[10px] text-slate-400">Direct creator support</div>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/40 border border-slate-800/60 space-y-1">
              <Sparkles className="w-5 h-5 text-sky-400 mx-auto" />
              <div className="text-[11px] font-bold text-slate-200">Sanctuary Guarantee</div>
              <div className="text-[10px] text-slate-400">Tested for deep peace</div>
            </div>
          </div>
        </div>

        {/* Launch Invitation Circle Card */}
        <div className="relative z-10 max-w-xl mx-auto p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-amber-500/10 via-slate-950 to-amber-500/10 border border-amber-400/40 text-center space-y-3.5 shadow-xl">
          <div className="w-11 h-11 rounded-2xl bg-amber-400/20 border border-amber-400/40 flex items-center justify-center mx-auto text-amber-300">
            <BellRing className="w-5 h-5 text-amber-300 animate-pulse" />
          </div>

          <div className="space-y-1">
            <h4 className="text-base sm:text-lg font-bold text-slate-100">
              Be the First to Step Inside
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              Leave your email to receive an intimate invitation and launch-day gift when the Aura Shop opens its sanctuary doors.
            </p>
          </div>

          {isSubscribed ? (
            <div className="p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-400/40 text-emerald-200 text-xs flex items-center justify-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{subscribeMessage || 'You are on our priority sanctuary launch circle! We will notify you upon launch.'}</span>
            </div>
          ) : (
            <form onSubmit={handleNotifySubmit} className="flex flex-col sm:flex-row items-center gap-2 max-w-md mx-auto">
              <input
                type="email"
                required
                placeholder="Enter your email for the launch invitation..."
                value={notifyEmail}
                onChange={(e) => setNotifyEmail(e.target.value)}
                className="w-full sm:flex-1 px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700/80 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-400 transition-colors"
              />
              <button
                type="submit"
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md active:scale-95 cursor-pointer shrink-0"
              >
                <span>Notify Me</span>
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          )}

          <p className="text-[11px] text-slate-400">
            🕊️ Sacred privacy promise: zero spam, only one warm notification when we launch.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SpiritualShopSection;
