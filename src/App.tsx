/**
 * AURORA 432HZ SANCTUARY - PERMANENT DESIGN & ARCHITECTURE LOCK
 * ============================================================================
 * THE THEME, DESIGN, ICONS, LAYOUT, FONT, COLORS, SECTIONS, AND TABS IN THIS
 * APPLICATION ARE PERMANENTLY LOCKED AND MUST NEVER BE CHANGED OR REDESIGNED.
 * SEE /DESIGN_SYSTEM_LOCKED.md FOR FULL SPECIFICATIONS.
 * ============================================================================
 */
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Clock,
  Sparkles,
  Download,
  Wifi,
  WifiOff,
  Headphones,
  Sliders,
  SlidersHorizontal,
  ShieldCheck,
  Moon,
  Sun,
  Timer,
  Printer,
  Info,
  Layers,
  Wind,
  Music,
  Heart,
  RotateCcw,
  Share2,
  MessageCircle,
  Send,
  Star,
  MessageSquare,
  LogIn,
  User,
  Maximize2,
  Minimize2,
  Eye,
  ChevronRight,
  ChevronDown,
  MoreHorizontal,
  BookOpen,
  Scale,
  Mail,
  Flame,
  Edit3,
  Cookie,
  Bot,
  Lock,
  Search,
  Activity,
} from 'lucide-react';
import {
  audioEngine,
  BrainwaveMode,
  BRAINWAVE_MODES,
  SOLFEGGIO_FREQUENCIES,
  DEFAULT_NATURE_SOUNDS,
  NatureSoundState,
} from './services/audioEngine';
import {
  MixPreset,
  BUILT_IN_MIX_PRESETS,
  getFavoritePresetIds,
  toggleFavoritePresetId,
  getCustomPresets,
  saveCustomPreset,
} from './services/storage';
import { getRecommendedProductForPreset } from './services/presetProductRecommendations';
import { useSiteContent } from './services/siteContent';
import { AudioVisualizer } from './components/AudioVisualizer';
import { LoudnessMeterHUD } from './components/LoudnessMeterHUD';
import { FlatLogo } from './components/FlatLogo';
import { SacredSocialLinks } from './components/SacredSocialIcons';
import { AdSenseBanner } from './components/AdSenseBanner';
import { GlobalBottomPlayerBar } from './components/GlobalBottomPlayerBar';
import { CookieConsentBanner } from './components/CookieConsentBanner';
import { FloatingCookieButton } from './components/FloatingCookieButton';
import type { LegalTabType } from './components/TrustAndLegalModal';
import { applyPageSeo } from './services/seo';

import { ErrorBoundary } from './components/ErrorBoundary';

// Performance optimization: code-split secondary tab views & on-demand modals
const BreathPacer = React.lazy(() => import('./components/BreathPacer').then((m) => ({ default: m.BreathPacer })));
const MusicalPlayground = React.lazy(() => import('./components/MusicalPlayground').then((m) => ({ default: m.MusicalPlayground })));
const SpiritualShopSection = React.lazy(() => import('./components/SpiritualShopSection').then((m) => ({ default: m.SpiritualShopSection })));
const BlogSection = React.lazy(() => import('./components/BlogSection').then((m) => ({ default: m.BlogSection })));
const CommunityHub = React.lazy(() => import('./components/CommunityHub').then((m) => ({ default: m.CommunityHub })));
const ContactSection = React.lazy(() => import('./components/ContactSection').then((m) => ({ default: m.ContactSection })));
const AdminDashboard = React.lazy(() => import('./components/AdminDashboard').then((m) => ({ default: m.AdminDashboard })));
const SleepTimerModal = React.lazy(() => import('./components/SleepTimerModal').then((m) => ({ default: m.SleepTimerModal })));
const SocialShareModal = React.lazy(() => import('./components/SocialShareModal').then((m) => ({ default: m.SocialShareModal })));
const LoginModal = React.lazy(() => import('./components/LoginModal').then((m) => ({ default: m.LoginModal })));
const AdminLoginModal = React.lazy(() => import('./components/AdminLoginModal').then((m) => ({ default: m.AdminLoginModal })));
const AmbientModeView = React.lazy(() => import('./components/AmbientModeView').then((m) => ({ default: m.AmbientModeView })));
const EulaModal = React.lazy(() => import('./components/EulaModal').then((m) => ({ default: m.EulaModal })));
const FrequencySafetyModal = React.lazy(() => import('./components/FrequencySafetyModal').then((m) => ({ default: m.FrequencySafetyModal })));
const TrustAndLegalModal = React.lazy(() => import('./components/TrustAndLegalModal').then((m) => ({ default: m.TrustAndLegalModal })));
const SessionSummaryModal = React.lazy(() => import('./components/SessionSummaryModal').then((m) => ({ default: m.SessionSummaryModal })));
const HowItWorksModal = React.lazy(() => import('./components/HowItWorksModal').then((m) => ({ default: m.HowItWorksModal })));
const MonthlyNewsletterModal = React.lazy(() => import('./components/MonthlyNewsletterModal').then((m) => ({ default: m.MonthlyNewsletterModal })));
const WelcomeLetterModal = React.lazy(() => import('./components/WelcomeLetterModal').then((m) => ({ default: m.WelcomeLetterModal })));
const CookieSettingsModal = React.lazy(() => import('./components/CookieSettingsModal').then((m) => ({ default: m.CookieSettingsModal })));
const SanctuarySearchModal = React.lazy(() => import('./components/SanctuarySearchModal').then((m) => ({ default: m.SanctuarySearchModal })));
const AudioRegressionTestSuite = React.lazy(() => import('./components/AudioRegressionTestSuite').then((m) => ({ default: m.AudioRegressionTestSuite })));
const OfflineExportModal = React.lazy(() => import('./components/OfflineExportModal').then((m) => ({ default: m.OfflineExportModal })));
const NatureMixer = React.lazy(() => import('./components/NatureMixer').then((m) => ({ default: m.NatureMixer })));
const UnderConstructionPage = React.lazy(() => import('./components/UnderConstructionPage').then((m) => ({ default: m.UnderConstructionPage })));
const FloatingAdminMaintenanceBar = React.lazy(() => import('./components/FloatingAdminMaintenanceBar').then((m) => ({ default: m.FloatingAdminMaintenanceBar })));
import { AUTHORIZED_ADMIN_EMAIL, isAuthorizedAdminEmail, getActiveAdminSession } from './services/adminAuth';
import { analytics } from './services/analytics';
import { MONETIZATION_CONFIG } from './config/monetization';
import {
  subscribeToSanctuaryAuth,
  logSanctuaryUsageEvent as logUsageEvent,
  getActiveGuestUser,
  clearActiveGuestUser,
  type UserProfile,
} from './services/sessionAuth';

// 1-Tap Mindful Intentions for a clean, user-friendly home page
const MINDFUL_INTENTIONS = [
  {
    id: 'sleep',
    label: 'Deep Sleep',
    icon: '🌙',
    freq: 432,
    mode: 'delta_sleep' as BrainwaveMode,
    desc: '3.5Hz Delta + 432Hz for peaceful bedtime rest',
  },
  {
    id: 'calm',
    label: 'Mindful Calm',
    icon: '🌿',
    freq: 432,
    mode: 'alpha_healing' as BrainwaveMode,
    desc: '10Hz Alpha + 432Hz for deep relaxation & stillness',
  },
  {
    id: 'meditate',
    label: 'Meditation',
    icon: '🧘',
    freq: 528,
    mode: 'theta_meditation' as BrainwaveMode,
    desc: '6Hz Theta + 528Hz for heart-centered presence',
  },
  {
    id: 'flow',
    label: 'Focus & Flow',
    icon: '💡',
    freq: 741,
    mode: 'alpha_flow' as BrainwaveMode,
    desc: '8.5Hz Alpha + 741Hz intuition & mental clarity',
  },
  {
    id: 'pure432',
    label: 'Pure 432Hz',
    icon: '✨',
    freq: 432,
    mode: 'pure_432' as BrainwaveMode,
    desc: 'Pythagorean cosmic harmonic acoustic tone',
  },
];

// Featured Top Soundscape Presets for quick-start on home page
const FEATURED_PRESETS = [
  {
    id: 'midnight_slumber',
    name: 'Midnight Slumber',
    tag: 'Deep Sleep',
    freq: 432,
    icon: '🌙',
    summary: 'Rain, night crickets, campfire & velvet brown noise',
  },
  {
    id: 'zen_sanctuary',
    name: 'Zen Sanctuary',
    tag: 'Meditation',
    freq: 432,
    icon: '🧘',
    summary: 'Tibetan singing bowls & gentle mountain canopy rain',
  },
  {
    id: 'solfeggio_528_dna',
    name: '528Hz Harmonic Soundscape',
    tag: 'Harmonic Balance',
    freq: 528,
    icon: '🧬',
    summary: 'Singing bowls, Koshi bamboo chimes & pebble stream',
  },
  {
    id: 'celestial_strings',
    name: 'Celestial Strings',
    tag: 'Relaxation',
    freq: 432,
    icon: '🎻',
    summary: 'Deep cello drone, crystalline harp plucks & bowls',
  },
];

export default function App() {
  // Playback state
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [baseFreq, setBaseFreq] = useState<number>(432);
  const [brainwaveMode, setBrainwaveMode] = useState<BrainwaveMode>('alpha_healing');
  const [masterVolume, setMasterVolume] = useState<number>(0.6); // 60% WHO recommended safe listening default
  const [pulseDepth, setPulseDepth] = useState<number>(0.6);
  const [subDrone, setSubDrone] = useState<number>(0.4);
  const [headphoneBinaural, setHeadphoneBinaural] = useState<boolean>(true);
  const [isVolumeNormalized, setIsVolumeNormalized] = useState<boolean>(() => audioEngine.getVolumeNormalization());

  // Musical Mode State (Ambient Ethereal Harmonic Pads & Slow Chord Swells)
  const [isMusicalMode, setIsMusicalMode] = useState<boolean>(() => audioEngine.isMusicalModeConfigured());
  const [musicalVolume, setMusicalVolume] = useState<number>(() => audioEngine.getMusicalModeVolume() || 0.6);

  const handleToggleMusicalMode = useCallback(() => {
    setIsMusicalMode((prev) => {
      const next = !prev;
      audioEngine.setMusicalMode(next);
      if (next && !audioEngine.getIsPlaying() && !isPlaying) {
        setIsPlaying(true);
        setIsFadingOut(false);
        audioEngine.start(0.4, 0).catch((err) => {
          console.error('AudioEngine start error:', err);
        });
      }
      return next;
    });
  }, [isPlaying]);

  const handleMusicalVolumeChange = useCallback((vol: number) => {
    setMusicalVolume(vol);
    audioEngine.setMusicalModeVolume(vol);
  }, []);

  // 3-Minute Fade Out on Pause State
  const [isFadingOut, setIsFadingOut] = useState<boolean>(() => audioEngine.getIsFadingOut());
  const [fadeRemainingSeconds, setFadeRemainingSeconds] = useState<number>(() => audioEngine.getFadeRemainingSeconds());

  useEffect(() => {
    const unsubFade = audioEngine.subscribeFadeStatus((status) => {
      setIsFadingOut(status.isFadingOut);
      setFadeRemainingSeconds(status.remainingSeconds);
    });
    const unsubPlaying = audioEngine.subscribePlayingStatus((playing) => {
      setIsPlaying(playing);
    });
    return () => {
      unsubFade();
      unsubPlaying();
    };
  }, []);

  // Live Sanctuary Site Content & Social Media Config
  const siteContent = useSiteContent();

  // Nature Sounds State
  const [natureSounds, setNatureSounds] = useState<NatureSoundState[]>(DEFAULT_NATURE_SOUNDS);
  const natureSoundsRef = useRef<NatureSoundState[]>(DEFAULT_NATURE_SOUNDS);
  const [currentPresetId, setCurrentPresetId] = useState<string>('zen_sanctuary');

  // User Authentication & RBAC State
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState<boolean>(false);
  const [isAdminLoginModalOpen, setIsAdminLoginModalOpen] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const p = window.location.pathname.toLowerCase();
      const h = window.location.hash.toLowerCase();
      const isAdminRoute = p.includes('a432hz_admin') || h.includes('a432hz_admin') || p === '/admin' || p.startsWith('/admin/') || h === '#admin';
      return isAdminRoute && !getActiveAdminSession();
    }
    return false;
  });
  const [showAdminPreview, setShowAdminPreview] = useState<boolean>(false);
  const [forceVisitorMode, setForceVisitorMode] = useState<boolean>(false);
  const sessionStartTimeRef = useRef<number | null>(null);

  // Helper to resolve initial sanctuary tab from URL path or anchor
  const getInitialTab = (): 'player' | 'mixer' | 'breath' | 'musical' | 'gear' | 'blog' | 'community' | 'contact' | 'admin' => {
    if (typeof window === 'undefined') return 'player';
    const path = window.location.pathname.replace(/^\/+|\/+$/g, '').toLowerCase();
    const hash = window.location.hash.replace(/^#+/, '').toLowerCase();
    const target = path || hash;
    if (target.includes('a432hz_admin') || target === 'admin') return 'admin';
    if (target === 'shop' || target === 'store' || target === 'gear') return 'gear';
    if (target === 'science' || target === 'research' || target === 'articles' || target === 'blog') return 'blog';
    if (target === 'soundscapes' || target === 'nature' || target === 'mixer') return 'mixer';
    if (target === 'breathwork' || target === 'breathe' || target === 'breath') return 'breath';
    if (target === 'harp' || target === 'soundharp' || target === 'musical') return 'musical';
    if (target === 'community') return 'community';
    if (target === 'contact' || target === 'support') return 'contact';
    if (['player', 'mixer', 'breath', 'musical', 'gear', 'blog', 'community', 'contact', 'admin'].includes(target)) {
      return target as any;
    }
    return 'player';
  };

  // Navigation tab with URL and browser history synchronization
  const [activeTab, setActiveTab] = useState<
    'player' | 'mixer' | 'breath' | 'musical' | 'gear' | 'blog' | 'community' | 'contact' | 'admin'
  >(getInitialTab);

  // Synchronize browser back/forward buttons with activeTab
  useEffect(() => {
    const handlePopState = () => {
      setActiveTab(getInitialTab());
    };
    window.addEventListener('popstate', handlePopState);
    window.addEventListener('hashchange', handlePopState);

    // Global listener for cross-frame or delegated safe file downloads
    const handleDownloadMessage = (event: MessageEvent) => {
      if (event.data && event.data.type === 'AURA_DOWNLOAD_FILE') {
        try {
          const { buffer, fileType, fileName } = event.data;
          const blob = new Blob([buffer], { type: fileType || 'audio/wav' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.style.display = 'none';
          a.href = url;
          a.download = fileName || 'Aura432Hz-StudioAudio.wav';
          document.body.appendChild(a);
          a.click();
          setTimeout(() => {
            try { document.body.removeChild(a); } catch {}
            URL.revokeObjectURL(url);
          }, 1000);
        } catch (err) {
          console.warn('Cross-frame download error:', err);
        }
      }
    };
    window.addEventListener('message', handleDownloadMessage);

    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('hashchange', handlePopState);
      window.removeEventListener('message', handleDownloadMessage);
    };
  }, []);

  // Auto-hide navigation tabs bar state on mobile & tablet view
  const [isTabsBarHidden, setIsTabsBarHidden] = useState<boolean>(false);

  // Auto-hide navigation tabs bar on mobile & tablet during scroll-down
  useEffect(() => {
    let lastScrollY = window.scrollY;
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const currentScrollY = window.scrollY;
          // Target mobile & tablet viewports (< 1024px)
          const isMobileOrTablet = window.innerWidth < 1024;

          if (isMobileOrTablet) {
            const docHeight = document.documentElement.scrollHeight;
            const winHeight = window.innerHeight;

            if (currentScrollY <= 40) {
              // At or near top, always keep tabs visible
              setIsTabsBarHidden(false);
            } else if (currentScrollY + winHeight >= docHeight - 50) {
              // Near bottom of page, reveal tabs to ease navigation
              setIsTabsBarHidden(false);
            } else if (currentScrollY > lastScrollY + 10 && currentScrollY > 70) {
              // Scrolling down past threshold: auto-hide tabs bar to maximize viewport area
              setIsTabsBarHidden(true);
            } else if (currentScrollY < lastScrollY - 6) {
              // Scrolling up: reveal tabs bar smoothly
              setIsTabsBarHidden(false);
            }
          } else {
            // On desktop viewports (>= 1024px), keep tabs bar visible
            setIsTabsBarHidden(false);
          }

          lastScrollY = Math.max(0, currentScrollY);
          ticking = false;
        });
        ticking = true;
      }
    };

    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsTabsBarHidden(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleResize, { passive: true });
    window.addEventListener('orientationchange', handleResize, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, []);

  const skipNextTabScrollTopRef = useRef(false);

  // Scroll to top & sync URL path ONLY when changing navigation tabs
  useEffect(() => {
    setIsTabsBarHidden(false);
    if (skipNextTabScrollTopRef.current) {
      skipNextTabScrollTopRef.current = false;
    } else {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      if (document.documentElement) document.documentElement.scrollTop = 0;
      if (document.body) document.body.scrollTop = 0;
    }

    const targetPath = activeTab === 'player' ? '/' : `/${activeTab}`;
    if (window.location.pathname !== targetPath && !window.location.hash) {
      window.history.pushState(null, '', targetPath);
    }
  }, [activeTab]);

  // Update dynamic SEO without scrolling the page
  useEffect(() => {
    applyPageSeo(activeTab, isPlaying);
  }, [activeTab, isPlaying]);

  // Visualizer Section Ref & Scroll-Away Detection for Main Page
  const visualizerSectionRef = useRef<HTMLDivElement>(null);
  const [isScrolledPastVisualizer, setIsScrolledPastVisualizer] = useState<boolean>(false);

  useEffect(() => {
    if (activeTab !== 'player') {
      setIsScrolledPastVisualizer(false);
      return;
    }

    const checkVisualizerScroll = () => {
      const el = visualizerSectionRef.current || document.getElementById('sanctuary-visualizer-section');
      if (!el) {
        const scrollY = window.scrollY || window.pageYOffset || document.documentElement.scrollTop || 0;
        setIsScrolledPastVisualizer(scrollY > 400);
        return;
      }
      const rect = el.getBoundingClientRect();
      // Appears on the main player page only after the user scrolls past the visualizer section
      const hasScrolledPast = rect.bottom <= 80;
      setIsScrolledPastVisualizer(hasScrolledPast);
    };

    window.addEventListener('scroll', checkVisualizerScroll, { passive: true });
    window.addEventListener('resize', checkVisualizerScroll, { passive: true });
    checkVisualizerScroll();

    return () => {
      window.removeEventListener('scroll', checkVisualizerScroll);
      window.removeEventListener('resize', checkVisualizerScroll);
    };
  }, [activeTab]);

  // Quick Tools & Resources Dropdown Menu
  const [isToolsDropdownOpen, setIsToolsDropdownOpen] = useState<boolean>(false);
  const toolsDropdownRef = useRef<HTMLDivElement>(null);

  // Close tools dropdown if user clicks or touches anywhere outside (Unified pointerdown event)
  useEffect(() => {
    if (!isToolsDropdownOpen) return;
    const handleOutsideInteraction = (event: PointerEvent) => {
      if (
        toolsDropdownRef.current &&
        !toolsDropdownRef.current.contains(event.target as Node)
      ) {
        setIsToolsDropdownOpen(false);
      }
    };

    document.addEventListener('pointerdown', handleOutsideInteraction);
    return () => {
      document.removeEventListener('pointerdown', handleOutsideInteraction);
    };
  }, [isToolsDropdownOpen]);

  // Shop Highlight Product State (From Presets Recommendation Click)
  const [shopHighlightProductId, setShopHighlightProductId] = useState<string | null>(null);

  const handleOpenShopProduct = (productId: string) => {
    skipNextTabScrollTopRef.current = true;
    setShopHighlightProductId(productId);
    setActiveTab('gear');
    window.scrollTo({ top: 380, behavior: 'smooth' });
  };

  // Collapsible Advanced Acoustic Settings on Sanctuary Home
  const [showAdvancedAudio, setShowAdvancedAudio] = useState<boolean>(false);

  // Sanctuary OmniSearch Modal State (Soundscapes, Acoustic Layers, Products, Science & Blog)
  const [isSearchModalOpen, setIsSearchModalOpen] = useState<boolean>(false);

  // Global Keyboard Shortcut: Cmd+K / Ctrl+K or / to open Sanctuary Search
  useEffect(() => {
    const handleGlobalSearchKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchModalOpen((prev) => !prev);
      } else if (
        e.key === '/' &&
        document.activeElement?.tagName !== 'INPUT' &&
        document.activeElement?.tagName !== 'TEXTAREA'
      ) {
        e.preventDefault();
        setIsSearchModalOpen(true);
      }
    };
    window.addEventListener('keydown', handleGlobalSearchKey);
    return () => window.removeEventListener('keydown', handleGlobalSearchKey);
  }, []);

  // EULA Modal State
  const [isEulaModalOpen, setIsEulaModalOpen] = useState<boolean>(false);

  // Frequency Safety & Original Calibration Modal State
  const [isSafetyModalOpen, setIsSafetyModalOpen] = useState<boolean>(false);
  const [isAudioTestSuiteOpen, setIsAudioTestSuiteOpen] = useState<boolean>(false);

  // Sleep Timer State
  const [isTimerModalOpen, setIsTimerModalOpen] = useState<boolean>(false);
  const [timerSecondsRemaining, setTimerSecondsRemaining] = useState<number | null>(null);
  const [fadeDurationMinutes, setFadeDurationMinutes] = useState<number>(3);
  const timerIntervalRef = useRef<number | null>(null);

  // Offline Export Modal State
  const [isExportModalOpen, setIsExportModalOpen] = useState<boolean>(false);

  // Social Share Modal State
  const [isShareModalOpen, setIsShareModalOpen] = useState<boolean>(false);

  // Ambient Sanctuary Fullscreen Mode State
  const [isAmbientMode, setIsAmbientMode] = useState<boolean>(false);

  // Persistent Bottom Audio Player Bar visibility:
  // - In all other tabs & pages (mixer, breath, musical, gear, blog, community, contact, admin): ALWAYS visible
  // - On the main sanctuary page ('player'): ONLY visible when scrolled away from visualizer section
  // - Distraction-free ambient mode: hidden
  const shouldShowBottomPlayer =
    !isAmbientMode && (activeTab !== 'player' || isScrolledPastVisualizer);

  // Network Offline Detection
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);

  // Comprehensive Trust & Legal Center Modal State
  const [isLegalModalOpen, setIsLegalModalOpen] = useState<boolean>(false);
  const [legalInitialTab, setLegalInitialTab] = useState<LegalTabType>('about');

  // Cookie & Storage Preferences Modal State
  const [isCookieSettingsOpen, setIsCookieSettingsOpen] = useState<boolean>(false);

  // How It Works Modal
  const [isHowItWorksOpen, setIsHowItWorksOpen] = useState<boolean>(false);

  // Session Listening Time & Post-Session Summary Modal
  const [sessionListenSeconds, setSessionListenSeconds] = useState<number>(0);
  const [isSummaryModalOpen, setIsSummaryModalOpen] = useState<boolean>(false);
  const [wasTimerCompleted, setWasTimerCompleted] = useState<boolean>(false);
  const [recommendedBreathPattern, setRecommendedBreathPattern] = useState<
    'relax_478' | 'box_4444' | 'coherence_55' | 'refresh_426'
  >('coherence_55');

  // Light / Dark Theme Mode: Dark mode is unconditional default for all users, browsers & system settings
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('aura_theme_manual') as 'dark' | 'light' | null;
      if (saved === 'light') return 'light';
    }
    return 'dark';
  });

  // Explicit theme toggle handler with instant persistence and meta sync
  const handleToggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    try {
      localStorage.setItem('aura_theme_manual', nextTheme);
    } catch {}
  };

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'light') {
      root.classList.add('theme-light');
      root.classList.remove('theme-dark', 'dark');
      root.style.colorScheme = 'light';
      const metaTheme = document.querySelector('meta[name="theme-color"]');
      if (metaTheme) metaTheme.setAttribute('content', '#f6f8f7');
    } else {
      root.classList.add('dark', 'theme-dark');
      root.classList.remove('theme-light');
      root.style.colorScheme = 'dark';
      const metaTheme = document.querySelector('meta[name="theme-color"]');
      if (metaTheme) metaTheme.setAttribute('content', '#030712');
    }
  }, [theme]);

  // Compact View Mode is standard for minimal footprint and friendly ergonomics

  // Compact View Mode is standard for minimal footprint and friendly ergonomics
  const isCompactView = true;

  // Monthly Newsletter and Welcome Letter Modals
  const [isNewsletterModalOpen, setIsNewsletterModalOpen] = useState<boolean>(false);
  const [isWelcomeLetterModalOpen, setIsWelcomeLetterModalOpen] = useState<boolean>(false);

  const openLegalModal = (tab: LegalTabType) => {
    setLegalInitialTab(tab);
    setIsLegalModalOpen(true);
  };

  // Favorite Presets State
  const [favoritePresetIds, setFavoritePresetIds] = useState<string[]>(() => getFavoritePresetIds());
  const [presetViewTab, setPresetViewTab] = useState<'featured' | 'favorites'>('featured');

  const handleToggleFavoritePreset = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const updated = toggleFavoritePresetId(id);
    setFavoritePresetIds(updated);
  };

  // Listen to Auth state (immediate guest from storage, deferred Firebase background listener)
  useEffect(() => {
    const unsubscribe = subscribeToSanctuaryAuth((user) => {
      setCurrentUser(user);
    });
    return () => {
      unsubscribe();
    };
  }, []);

  // Track feature navigation visits (deferred to idle to eliminate main thread contention during initial paint)
  const isInitialTabTrackedRef = useRef(false);
  useEffect(() => {
    if (!activeTab) return;
    const track = () => {
      logUsageEvent({
        userId: currentUser?.uid || 'guest',
        userName: currentUser?.displayName || 'Guest Meditator',
        userEmail: currentUser?.email || 'guest@aura432.sanctuary',
        role: currentUser?.role || 'user',
        action: 'view_tab',
        feature: activeTab,
        frequencyHz: baseFreq,
        brainwaveMode,
      });
    };

    if (!isInitialTabTrackedRef.current) {
      isInitialTabTrackedRef.current = true;
      if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
        (window as any).requestIdleCallback(track, { timeout: 3500 });
      } else {
        setTimeout(track, 3000);
      }
    } else {
      track();
    }
  }, [activeTab]);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Consolidated audio engine synchronization (skips redundant initial mount tick)
  const isAudioMountedRef = useRef(false);
  useEffect(() => {
    if (!isAudioMountedRef.current) {
      isAudioMountedRef.current = true;
      return;
    }
    audioEngine.setBaseFrequency(baseFreq);
    audioEngine.setBrainwaveMode(brainwaveMode);
    audioEngine.setMasterVolume(masterVolume);
    audioEngine.setPulseDepth(pulseDepth);
    audioEngine.setSubDrone(subDrone);
    audioEngine.setHeadphoneBinaural(headphoneBinaural);
    audioEngine.setVolumeNormalization(isVolumeNormalized);
  }, [baseFreq, brainwaveMode, masterVolume, pulseDepth, subDrone, headphoneBinaural, isVolumeNormalized]);

  // Session Listening Duration Ticker for Milestone Tracking
  useEffect(() => {
    let interval: number | null = null;
    if (isPlaying) {
      interval = window.setInterval(() => {
        setSessionListenSeconds((prev) => {
          const next = prev + 1;
          if (next === 300) analytics.track('listen_5_min', { freq: baseFreq });
          if (next === 900) analytics.track('listen_15_min', { freq: baseFreq });
          if (next === 1800) analytics.track('listen_30_min', { freq: baseFreq });
          return next;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlaying, baseFreq]);

  const handleInstantStop = useCallback(() => {
    audioEngine.instantStop();
    setIsPlaying(false);
    setIsFadingOut(false);
    analytics.track('play_paused_instant', { freq: baseFreq, durationSeconds: sessionListenSeconds });

    if (sessionStartTimeRef.current) {
      const durationSec = Math.max(1, Math.round((Date.now() - sessionStartTimeRef.current) / 1000));
      logUsageEvent({
        userId: currentUser?.uid || 'guest',
        userName: currentUser?.displayName || 'Guest Meditator',
        userEmail: currentUser?.email || 'guest@aura432.sanctuary',
        role: currentUser?.role || 'user',
        action: 'session_end',
        feature: 'player',
        frequencyHz: baseFreq,
        brainwaveMode,
        durationSeconds: durationSec,
      });
      sessionStartTimeRef.current = null;
    }
  }, [baseFreq, sessionListenSeconds, currentUser, brainwaveMode]);

  const handleResumeFromFade = useCallback(() => {
    audioEngine.cancelFadeOutAndResume();
    setIsFadingOut(false);
    setIsPlaying(true);
    analytics.track('play_fade_resumed', { freq: baseFreq });
  }, [baseFreq]);

  const lastMasterVolumeRef = useRef<number>(0.6);

  const handleMasterMuteToggle = () => {
    if (masterVolume > 0) {
      lastMasterVolumeRef.current = masterVolume;
      setMasterVolume(0);
    } else {
      setMasterVolume(lastMasterVolumeRef.current || 0.6);
    }
  };

  const lastTogglePlayTimeRef = useRef<number>(0);

  // Handle Play / Pause Toggle with Immediate Responsive Action
  const handleTogglePlay = useCallback(() => {
    const now = Date.now();
    if (now - lastTogglePlayTimeRef.current < 280) {
      return;
    }
    lastTogglePlayTimeRef.current = now;

    const isCurrentlyActive = audioEngine.getIsPlaying() || isPlaying;
    if (isCurrentlyActive) {
      // Immediate clean pause: silence playback instantly without lingering 1-second waves
      setIsPlaying(false);
      setIsFadingOut(false);
      audioEngine.instantStop();
      analytics.track('play_paused_instant', { freq: baseFreq, durationSeconds: sessionListenSeconds });

      if (sessionStartTimeRef.current) {
        const durationSec = Math.max(1, Math.round((Date.now() - sessionStartTimeRef.current) / 1000));
        logUsageEvent({
          userId: currentUser?.uid || 'guest',
          userName: currentUser?.displayName || 'Guest Meditator',
          userEmail: currentUser?.email || 'guest@aura432.sanctuary',
          role: currentUser?.role || 'user',
          action: 'session_end',
          feature: 'player',
          frequencyHz: baseFreq,
          brainwaveMode,
          durationSeconds: durationSec,
        });
        sessionStartTimeRef.current = null;
      }
    } else {
      // Synchronously set isPlaying to true immediately so all play icons instantly turn to pause signs
      setIsPlaying(true);
      setIsFadingOut(false);
      sessionStartTimeRef.current = Date.now();

      // Launch audio start: 2-second smooth fade in, active atmosphere sounds start together with main tone
      audioEngine.cancelFadeOutAndResume();
      audioEngine
        .start(2.0, 0)
        .then(() => {
          // Synchronously initialize active atmosphere nature sounds with 2-second fade in
          natureSoundsRef.current.forEach((s) => {
            if (s.enabled) {
              audioEngine.updateNatureSound(s.id, true, s.volume, 2.0);
            }
          });
        })
        .catch((err) => {
          console.error('AudioEngine start error:', err);
        });

      // Usage analytics & session logging
      try {
        analytics.track('play_started', { freq: baseFreq, mode: brainwaveMode });
        logUsageEvent({
          userId: currentUser?.uid || 'guest',
          userName: currentUser?.displayName || 'Guest Meditator',
          userEmail: currentUser?.email || 'guest@aura432.sanctuary',
          role: currentUser?.role || 'user',
          action: 'session_start',
          feature: 'player',
          frequencyHz: baseFreq,
          brainwaveMode,
        });
      } catch (err) {
        console.error('Analytics tracking error:', err);
      }
    }
  }, [isPlaying, handleInstantStop, baseFreq, brainwaveMode, currentUser]);

  const handleOpenAmbientMode = useCallback(() => {
    setIsAmbientMode(true);
  }, []);

  const handleToggleVolumeNormalized = useCallback(() => {
    setIsVolumeNormalized((prev) => !prev);
  }, []);

  const handleOpenLoginModal = useCallback(() => {
    setIsLoginModalOpen(true);
  }, []);

  // Update Nature Sound
  const handleNatureSoundChange = (id: string, enabled: boolean, volume: number) => {
    const updated = natureSounds.map((s) =>
      s.id === id ? { ...s, enabled, volume } : s
    );
    natureSoundsRef.current = updated;
    setNatureSounds(updated);
    if (isPlaying) {
      audioEngine.updateNatureSound(id, enabled, volume, 5.0);
    }
    setCurrentPresetId('');
  };

  const handleToggleNatureSound = (id: string) => {
    const s = natureSounds.find((item) => item.id === id);
    if (s) {
      handleNatureSoundChange(id, !s.enabled, s.volume);
    }
  };

  // Apply Mix Preset with Smart Presets Fading & Real-Time Audio Transition
  const handleApplyPreset = useCallback((preset: MixPreset, autoStart: boolean = false) => {
    setCurrentPresetId(preset.id);
    const targetFreq = preset.baseFreq || baseFreq;
    const targetMode = (preset.brainwaveMode as BrainwaveMode) || brainwaveMode;

    setBaseFreq(targetFreq);
    setBrainwaveMode(targetMode);

    const updated = DEFAULT_NATURE_SOUNDS.map((def) => {
      const existing = natureSoundsRef.current.find((s) => s.id === def.id) || def;
      const vol = preset.natureLevels[def.id] ?? 0;
      const isEnabled = vol > 0;
      return {
        ...existing,
        enabled: isEnabled,
        volume: isEnabled ? vol : existing.volume,
      };
    });

    natureSoundsRef.current = updated;
    setNatureSounds(updated);

    const isEngineActive = audioEngine.getIsPlaying() || isPlaying;

    if (isEngineActive || autoStart) {
      if (!isPlaying) {
        setIsPlaying(true);
        setIsFadingOut(false);
        sessionStartTimeRef.current = Date.now();
      }
      audioEngine.cancelFadeOutAndResume();
      audioEngine.smartFadePreset(targetFreq, targetMode, preset.natureLevels, 2.5);
    } else {
      audioEngine.setBaseFrequency(targetFreq);
      audioEngine.setBrainwaveMode(targetMode);
      audioEngine.setStagedNatureLevels(preset.natureLevels);
    }
  }, [baseFreq, brainwaveMode, isPlaying]);

  const activeBuiltInPreset = BUILT_IN_MIX_PRESETS.find((p) => p.id === currentPresetId);
  const isBuiltInPresetActive = Boolean(activeBuiltInPreset);
  const activePresetName = activeBuiltInPreset?.name;

  const handleDuplicateActivePresetAsCustom = () => {
    if (!activeBuiltInPreset) return;
    const levels: Record<string, number> = {};
    natureSounds.forEach((s) => {
      levels[s.id] = s.enabled ? s.volume : 0;
    });
    const duplicatedPreset: MixPreset = {
      id: `custom_${Date.now()}`,
      name: `${activeBuiltInPreset.name} (Custom Mix)`,
      description: `Personalized user version of ${activeBuiltInPreset.name}`,
      category: activeBuiltInPreset.category,
      isCustom: true,
      baseFreq: baseFreq,
      brainwaveMode: brainwaveMode,
      natureLevels: levels,
      tags: ['Custom Mix', 'Unlocked WAV'],
    };
    saveCustomPreset(duplicatedPreset);
    setCurrentPresetId(duplicatedPreset.id);
  };

  const handleExportWavForPreset = (preset: MixPreset) => {
    handleApplyPreset(preset);
    setIsExportModalOpen(true);
  };

  // Sleep Timer Controller
  const handleStartTimer = (minutes: number, fadeOutMins: number) => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
    }

    const totalSeconds = minutes * 60;
    setTimerSecondsRemaining(totalSeconds);
    setFadeDurationMinutes(fadeOutMins);

    // Auto start playing if not playing
    if (!isPlaying) {
      handleTogglePlay();
    }

    analytics.track('timer_started', { minutes });

    let remaining = totalSeconds;
    let fadeTriggered = false;

    timerIntervalRef.current = window.setInterval(() => {
      remaining -= 1;
      setTimerSecondsRemaining(remaining);

      // Default fade-out is 5 seconds if fadeOutMins is 0, or fadeOutMins * 60
      const fadeSeconds = fadeOutMins > 0 ? fadeOutMins * 60 : 5;
      if (remaining <= fadeSeconds && !fadeTriggered) {
        fadeTriggered = true;
        const fadeOutDuration = Math.max(5, remaining);
        audioEngine.startFadeOut(fadeOutDuration, () => {
          setIsPlaying(false);
          setTimerSecondsRemaining(null);
          if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
          analytics.track('play_completed', { freq: baseFreq });
          setWasTimerCompleted(true);
          setIsSummaryModalOpen(true);
        });
      }

      if (remaining <= 0) {
        if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
        setTimerSecondsRemaining(null);
        setIsPlaying(false);
        audioEngine.stop();
        analytics.track('play_completed', { freq: baseFreq });
        setWasTimerCompleted(true);
        setIsSummaryModalOpen(true);
      }
    }, 1000);
  };

  const handleCancelTimer = () => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    audioEngine.cancelFadeOut();
    setTimerSecondsRemaining(null);
  };

  const formatTimerDisplay = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const currentBrainwave = BRAINWAVE_MODES[brainwaveMode];

  // Subtle BPM-synced breathing cycle duration based on selected Alpha/Theta/Delta brainwave frequency
  const brainwavePulseDuration = useMemo(() => {
    switch (brainwaveMode) {
      case 'delta_sleep':
        // 3.5Hz Delta: 8.0s restorative sleep respiration cycle (7.5 breaths/min)
        return 8.0;
      case 'theta_meditation':
        // 6.0Hz Theta: 6.0s deep meditative & autonomic heart-rate coherence (10.0 breaths/min)
        return 6.0;
      case 'alpha_flow':
        // 8.5Hz Low-Alpha: 4.8s rhythmic flow state & calm respiration (12.5 breaths/min)
        return 4.8;
      case 'alpha_healing':
        // 10.0Hz Alpha: 4.0s soothing alpha relaxation breath (15.0 breaths/min)
        return 4.0;
      case 'pure_432':
      default:
        // Pure 432Hz: 5.5s golden-ratio harmonic coherence breath (10.9 breaths/min)
        return 5.5;
    }
  }, [brainwaveMode]);

  const brainwaveBpm = useMemo(() => {
    return Math.round((60 / brainwavePulseDuration) * 10) / 10;
  }, [brainwavePulseDuration]);

  const currentSolfeggio = SOLFEGGIO_FREQUENCIES.find((s) => s.freq === baseFreq);
  const solfeggioShortName = currentSolfeggio
    ? (baseFreq === 432 ? 'Sanctuary' : currentSolfeggio.name.split('/')[0].split('&')[0].trim())
    : 'Harmonics';
  const activeNatureList = natureSounds.filter((s) => s.enabled);
  const currentPreset =
    BUILT_IN_MIX_PRESETS.find((p) => p.id === currentPresetId) ||
    getCustomPresets().find((p) => p.id === currentPresetId);

  const isAdmin = currentUser?.role === 'admin' ||
    isAuthorizedAdminEmail(currentUser?.email) ||
    Boolean(getActiveAdminSession());
  const isUnderConstructionActive = Boolean(siteContent.underConstruction?.enabled);
  const isDirectAdminUrl = typeof window !== 'undefined' && (
    window.location.pathname.toLowerCase().includes('a432hz_admin') ||
    window.location.hash.toLowerCase().includes('a432hz_admin') ||
    window.location.pathname.toLowerCase().includes('admin') ||
    window.location.hash.toLowerCase().includes('admin') ||
    activeTab === 'admin'
  );

  // If Under Construction Mode is active:
  // - Public visitors (!isAdmin && !isDirectAdminUrl) see the Under Construction Page immediately on Frame 0 with ZERO flash
  // - Direct admin route visitors (/admin, /a432hz_admin) or authenticated admins access the sanctuary admin studio
  // - Admins testing visitor mode (forceVisitorMode or showAdminPreview) see it with an easy exit banner
  if (isUnderConstructionActive && !isDirectAdminUrl && (!isAdmin || forceVisitorMode || showAdminPreview)) {
    return (
      <div className="min-h-screen min-h-[100dvh] bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-sky-500/30 overflow-x-hidden w-full">
        {/* Sticky top banner when Admin is testing/experiencing visitor view */}
        {isAdmin && (forceVisitorMode || showAdminPreview) && (
          <div className="sticky top-0 z-[120] w-full bg-slate-950/95 backdrop-blur-md border-b-2 border-amber-500/80 px-4 py-2 flex items-center justify-between text-xs text-amber-300 shadow-xl">
            <span className="font-semibold flex items-center gap-2">
              <span className="animate-pulse">👁️</span>
              <span>You are viewing the live Under Construction page as a public visitor.</span>
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setShowAdminPreview(false);
                  setForceVisitorMode(false);
                  setActiveTab('admin');
                  if (typeof window !== 'undefined') {
                    window.history.pushState(null, '', '/admin');
                  }
                }}
                className="px-3 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg font-bold text-xs cursor-pointer shadow-md transition-all active:scale-95"
              >
                Exit Visitor Mode &amp; Return to Sanctuary ✕
              </button>
            </div>
          </div>
        )}
        <React.Suspense fallback={null}>
          <UnderConstructionPage
            isAdmin={isAdmin}
            isPreview={showAdminPreview}
            onClosePreview={() => {
              setShowAdminPreview(false);
              setForceVisitorMode(false);
            }}
            onOpenAdminLogin={() => setIsAdminLoginModalOpen(true)}
            onOpenLegalModal={openLegalModal}
            onOpenCookieSettings={() => setIsCookieSettingsOpen(true)}
            onOpenShareModal={() => setIsShareModalOpen(true)}
          />
        </React.Suspense>
        <React.Suspense fallback={null}>
          {isAdminLoginModalOpen && (
            <AdminLoginModal
              isOpen={isAdminLoginModalOpen}
              onClose={() => setIsAdminLoginModalOpen(false)}
              onSuccess={(adminUser) => {
                setIsAdminLoginModalOpen(false);
                setShowAdminPreview(false);
                setForceVisitorMode(false);
                if (adminUser) {
                  setCurrentUser(adminUser);
                }
                setActiveTab('admin');
                if (typeof window !== 'undefined') {
                  window.history.pushState(null, '', '/admin');
                }
              }}
            />
          )}
          {isExportModalOpen && (
            <ErrorBoundary
              fallbackMessage="The offline audio exporter encountered an unexpected condition. Your session is unaffected."
              onClose={() => setIsExportModalOpen(false)}
            >
              <React.Suspense fallback={null}>
                <OfflineExportModal
                  isOpen={isExportModalOpen}
                  onClose={() => setIsExportModalOpen(false)}
                  baseFreq={baseFreq || 432}
                  brainwaveMode={brainwaveMode}
                  brainwaveModeName={currentBrainwave?.name || BRAINWAVE_MODES[brainwaveMode]?.name || 'Alpha Harmonic'}
                  activeNatureSounds={Array.isArray(natureSounds) ? natureSounds : []}
                  currentUser={currentUser}
                  isLoggedIn={Boolean(currentUser) || isAdmin}
                  isAdmin={isAdmin}
                  isBuiltInPresetActive={isBuiltInPresetActive}
                  activePresetName={activePresetName}
                  onOpenLogin={() => setIsLoginModalOpen(true)}
                  onDuplicateAsCustom={handleDuplicateActivePresetAsCustom}
                />
              </React.Suspense>
            </ErrorBoundary>
          )}
          <TrustAndLegalModal
            isOpen={isLegalModalOpen}
            onClose={() => setIsLegalModalOpen(false)}
            initialTab={legalInitialTab}
            onNavigateContact={() => {
              setIsLegalModalOpen(false);
            }}
            onOpenCookieSettings={() => {
              setIsLegalModalOpen(false);
              setIsCookieSettingsOpen(true);
            }}
          />
          <CookieSettingsModal
            isOpen={isCookieSettingsOpen}
            onClose={() => setIsCookieSettingsOpen(false)}
            onOpenCookiePolicy={() => openLegalModal('cookies')}
          />
          <SocialShareModal
            isOpen={isShareModalOpen}
            onClose={() => setIsShareModalOpen(false)}
            baseFreq={baseFreq}
          />
        </React.Suspense>
        <CookieConsentBanner
          onOpenSettings={() => setIsCookieSettingsOpen(true)}
          onOpenCookiePolicy={() => openLegalModal('cookies')}
          isBottomPlayerVisible={false}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen min-h-[100dvh] bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-sky-500/30 overflow-x-hidden w-full">
      {/* Floating Admin Maintenance Bar: Displayed during automatic admin bypass */}
      {isAdmin && isUnderConstructionActive && (
        <React.Suspense fallback={null}>
          <FloatingAdminMaintenanceBar
            adminEmail={currentUser?.email || AUTHORIZED_ADMIN_EMAIL}
            onOpenPreview={() => setShowAdminPreview(true)}
            onToggleForceVisitorMode={() => setForceVisitorMode(true)}
            onNavigateToSettings={() => setActiveTab('admin')}
          />
        </React.Suspense>
      )}

      {/* Top Ambient Glow Gradient (Lightweight & Smooth GPU) */}
      <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-5xl h-80 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-sky-900/25 via-indigo-950/15 to-transparent -z-10" />

      {/* Live Announcement Broadcast Bar */}
      {siteContent.announcementEnabled && siteContent.announcementText && (
        <div className="bg-gradient-to-r from-sky-950 via-indigo-950 to-purple-950 border-b border-indigo-900/60 text-xs py-1 px-2.5 sm:px-4 pl-[max(0.625rem,env(safe-area-inset-left,0px))] pr-[max(0.625rem,env(safe-area-inset-right,0px))] text-slate-200 flex items-center justify-center gap-1.5 sm:gap-2 text-center relative z-40 overflow-hidden">
          {siteContent.announcementBadge && (
            <span className="px-1.5 sm:px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 shrink-0">
              {siteContent.announcementBadge}
            </span>
          )}
          <span className="font-medium text-[11px] sm:text-xs text-sky-100 truncate max-w-full">{siteContent.announcementText}</span>
          {currentUser?.role === 'admin' && (
            <button
              type="button"
              onClick={() => setActiveTab('admin')}
              className="text-[9px] sm:text-[10px] font-semibold text-amber-300 hover:text-amber-200 underline ml-1 cursor-pointer shrink-0"
              title="Edit Announcement in Sanctuary CMS"
            >
              [Edit]
            </button>
          )}
        </div>
      )}

      {/* Navigation Header */}
      <header
        onClick={() => {
          if (isTabsBarHidden) setIsTabsBarHidden(false);
        }}
        className="sticky top-0 z-40 bg-slate-950/92 backdrop-blur-md border-b border-slate-800/80 will-change-transform transform-gpu shadow-md shadow-black/20 w-full pl-[max(0.5rem,env(safe-area-inset-left,0px))] pr-[max(0.5rem,env(safe-area-inset-right,0px))]"
      >
        <div className="max-w-6xl mx-auto px-2 sm:px-4 py-1.5 sm:py-2 landscape:py-1 flex items-center justify-between gap-1 sm:gap-2">
          {/* Main Website Brand Logo */}
          <button
            type="button"
            onClick={() => setActiveTab('player')}
            className="flex items-center gap-1.5 sm:gap-2.5 cursor-pointer transition-transform duration-200 hover:scale-[1.02] shrink-0 group min-w-0 text-left bg-transparent border-none p-0 focus:outline-none"
            aria-label="Aura 432Hz Sanctuary - Return to Sound Player"
          >
            <FlatLogo size={38} className="lg:scale-105 transition-transform" isPlaying={isPlaying} />
          </button>

          {/* RESPONSIVE HEADER ACTION TOOLS (Mobile, Tablet, Desktop) */}
          <div className="flex items-center gap-1 sm:gap-1.5 lg:gap-2 shrink-0">
            {/* Sanctuary Unified Search Tool (Soundscapes, Layers, Products, Science & Blog) */}
            <button
              type="button"
              onClick={() => setIsSearchModalOpen(true)}
              className="w-9 h-9 sm:w-9.5 sm:h-9.5 lg:w-auto lg:h-9 lg:px-3 lg:py-0 p-0 inline-flex items-center justify-center gap-1.5 rounded-xl text-xs font-semibold bg-aurora-teal/15 hover:bg-aurora-teal/25 border border-aurora-teal/40 text-aurora-teal transition-all shadow-sm active:scale-95 group shrink-0 cursor-pointer whitespace-nowrap"
              title="Search Soundscapes, Acoustic Layers, Products, Science & Blog (Cmd+K or /)"
              aria-label="Search sanctuary"
            >
              <Search className="w-4 h-4 text-aurora-teal group-hover:scale-120 group-hover:rotate-6 transition-transform duration-200 shrink-0" />
              <span className="hidden lg:inline">Search</span>
              <kbd className="hidden xl:inline text-[9px] font-mono bg-midnight/80 border border-aurora-teal/30 px-1.5 py-0.2 rounded text-aurora-teal">
                ⌘K
              </kbd>
            </button>

            {/* Ambient Zen Mode Toggle */}
            <button
              type="button"
              onClick={() => setIsAmbientMode(true)}
              className="w-9 h-9 sm:w-9.5 sm:h-9.5 lg:w-auto lg:h-9 lg:px-3 lg:py-0 p-0 inline-flex items-center justify-center gap-1.5 rounded-xl text-xs font-semibold bg-amber-500/15 hover:bg-amber-500/25 border border-amber-400/40 text-amber-200 transition-all shadow-sm active:scale-95 group shrink-0 cursor-pointer whitespace-nowrap"
              title="Launch Distraction-Free Fullscreen Ambient Sanctuary (Esc to exit)"
              aria-label="Launch Distraction-Free Fullscreen Ambient Sanctuary"
            >
              <Sparkles className="w-4 h-4 text-amber-400 group-hover:scale-120 group-hover:rotate-12 transition-transform duration-200 shrink-0" />
              <span className="hidden lg:inline">Zen Mode</span>
              <Maximize2 className="w-3.5 h-3.5 text-amber-300/80 hidden xl:inline" />
            </button>

            {/* Sleep Timer Pill */}
            <button
              type="button"
              onClick={() => setIsTimerModalOpen(true)}
              className={`${timerSecondsRemaining !== null ? 'w-auto h-9 sm:h-9.5 px-2 sm:px-2.5' : 'w-9 h-9 sm:w-9.5 sm:h-9.5 p-0'} lg:w-auto lg:h-9 lg:px-3 lg:py-0 inline-flex items-center justify-center gap-1 sm:gap-1.5 rounded-xl text-xs font-medium border transition-all shrink-0 cursor-pointer group whitespace-nowrap ${
                timerSecondsRemaining !== null
                  ? 'bg-cosmic-lavender/25 border-cosmic-lavender/60 text-cosmic-lavender shadow-sm shadow-cosmic-lavender/20'
                  : 'bg-slate-900 border-slate-700/80 text-slate-300 hover:bg-slate-800'
              }`}
              title="Set Auto-Fadeout Sleep Timer"
              aria-label={timerSecondsRemaining !== null ? `Sleep timer active: ${formatTimerDisplay(timerSecondsRemaining)}` : 'Set Auto-Fadeout Sleep Timer'}
            >
              <Timer className="w-4 h-4 text-cosmic-lavender group-hover:scale-120 group-hover:-rotate-12 transition-transform duration-200 shrink-0" />
              <span className={timerSecondsRemaining !== null ? 'font-mono text-xs font-semibold text-cosmic-lavender' : 'hidden lg:inline'}>
                {timerSecondsRemaining !== null
                  ? formatTimerDisplay(timerSecondsRemaining)
                  : 'Timer'}
              </span>
            </button>

            {/* Dark / Light Mode Toggle Button for High-Contrast Reading */}
            <button
              type="button"
              onClick={handleToggleTheme}
              className={`w-9 h-9 sm:w-9.5 sm:h-9.5 lg:w-auto lg:h-9 lg:px-3 lg:py-0 p-0 inline-flex items-center justify-center gap-1.5 rounded-xl text-xs font-semibold border transition-all shadow-sm active:scale-95 shrink-0 cursor-pointer group whitespace-nowrap ${
                theme === 'light'
                  ? 'bg-amber-100 hover:bg-amber-200 border-amber-300 text-amber-950 shadow-amber-200/50'
                  : 'bg-slate-900 hover:bg-slate-800 border-slate-700/80 text-amber-300 hover:text-amber-200'
              }`}
              title={theme === 'dark' ? 'Switch to Light Mode for high-contrast reading' : 'Switch to Dark Mode for relaxed nighttime listening'}
              aria-label={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {theme === 'dark' ? (
                <Moon className="w-4 h-4 text-amber-400 group-hover:scale-120 group-hover:rotate-45 transition-transform duration-200 shrink-0" />
              ) : (
                <Sun className="w-4 h-4 text-indigo-700 group-hover:scale-120 group-hover:rotate-45 transition-transform duration-200 shrink-0" />
              )}
              <span className="hidden lg:inline">{theme === 'dark' ? 'Night' : 'Light'}</span>
            </button>

            {/* Tools Dropdown (Available on ALL Viewports: Mobile, Tablet & Desktop with outside-dismiss) */}
            <div className="relative" ref={toolsDropdownRef}>
              <button
                type="button"
                onClick={() => setIsToolsDropdownOpen(!isToolsDropdownOpen)}
                className="w-9 h-9 sm:w-9.5 sm:h-9.5 lg:w-auto lg:h-9 lg:px-2.5 lg:py-0 p-0 inline-flex items-center justify-center gap-1 rounded-xl text-xs font-medium bg-slate-900 border border-slate-700/80 text-slate-300 hover:bg-slate-800 hover:text-slate-100 transition-colors shadow-sm shrink-0 cursor-pointer group whitespace-nowrap"
                title="Sanctuary Tools, Offline Download, Safety Certificate & EULA"
                aria-label="Sanctuary Tools, Offline Download, Safety Certificate and Settings"
              >
                <MoreHorizontal className="w-4 h-4 text-slate-400 group-hover:scale-120 transition-transform duration-200" />
                <span className="hidden lg:inline">Tools</span>
                <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 group-hover:scale-110 hidden lg:inline ${isToolsDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {isToolsDropdownOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setIsToolsDropdownOpen(false)}
                    onTouchStart={() => setIsToolsDropdownOpen(false)}
                    onPointerDown={() => setIsToolsDropdownOpen(false)}
                  />
                  <div
                    className="absolute right-0 mt-2 w-60 bg-slate-900/98 backdrop-blur-2xl border border-slate-700/80 rounded-2xl shadow-2xl p-1.5 z-50 animate-in fade-in zoom-in-95 space-y-1"
                  >
                    <button
                      type="button"
                      onClick={() => {
                        setIsExportModalOpen(true);
                        setIsToolsDropdownOpen(false);
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-slate-200 hover:bg-slate-800 rounded-xl transition-colors text-left group"
                    >
                      <Download className="w-4 h-4 text-emerald-400 shrink-0 group-hover:scale-120 transition-transform duration-200" />
                      <div>
                        <div className="font-medium">Export Offline Audio</div>
                        <div className="text-[10px] text-slate-400">Download studio uncompressed WAV</div>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setIsSafetyModalOpen(true);
                        setIsToolsDropdownOpen(false);
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-slate-200 hover:bg-slate-800 rounded-xl transition-colors text-left group"
                    >
                      <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 group-hover:scale-120 transition-transform duration-200" />
                      <div>
                        <div className="font-medium flex items-center gap-1">
                          <span>Safe Hz Verified</span>
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                        </div>
                        <div className="text-[10px] text-slate-400">100% Acoustic • 0.00 MHz RF</div>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setIsShareModalOpen(true);
                        setIsToolsDropdownOpen(false);
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-slate-200 hover:bg-slate-800 rounded-xl transition-colors text-left group"
                    >
                      <Share2 className="w-4 h-4 text-sky-400 shrink-0 group-hover:scale-120 transition-transform duration-200" />
                      <div>
                        <div className="font-medium">Share Sanctuary</div>
                        <div className="text-[10px] text-slate-400">Invite friends to meditate</div>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setIsEulaModalOpen(true);
                        setIsToolsDropdownOpen(false);
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-slate-200 hover:bg-slate-800 rounded-xl transition-colors text-left group"
                    >
                      <Scale className="w-4 h-4 text-indigo-400 shrink-0 group-hover:scale-120 transition-transform duration-200" />
                      <div>
                        <div className="font-medium">EULA & Health Advisory</div>
                        <div className="text-[10px] text-slate-400">Licensing & Safety Terms</div>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setIsNewsletterModalOpen(true);
                        setIsToolsDropdownOpen(false);
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-purple-300 hover:bg-purple-950/40 rounded-xl transition-colors text-left cursor-pointer group"
                    >
                      <Mail className="w-4 h-4 text-purple-400 shrink-0 group-hover:scale-120 transition-transform duration-200" />
                      <div>
                        <div className="font-medium">Monthly Newsletter</div>
                        <div className="text-[10px] text-slate-400">Curated Presets, Gear &amp; Science</div>
                      </div>
                    </button>

                    {currentUser && (
                      <button
                        type="button"
                        onClick={() => {
                          setIsWelcomeLetterModalOpen(true);
                          setIsToolsDropdownOpen(false);
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-sky-300 hover:bg-sky-950/40 rounded-xl transition-colors text-left group"
                      >
                        <Sparkles className="w-4 h-4 text-sky-400 shrink-0 group-hover:scale-120 transition-transform duration-200" />
                        <div>
                          <div className="font-medium">Member Welcome Letter</div>
                          <div className="text-[10px] text-slate-400">Your member privileges &amp; guide</div>
                        </div>
                      </button>
                    )}

                    {currentUser?.role === 'admin' && (
                      <button
                        type="button"
                        onClick={() => {
                          setIsToolsDropdownOpen(false);
                          setActiveTab('admin');
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-indigo-300 hover:bg-indigo-950/40 rounded-xl transition-colors text-left cursor-pointer group"
                      >
                        <ShieldCheck className="w-4 h-4 text-indigo-400 shrink-0 group-hover:scale-120 transition-transform duration-200" />
                        <div>
                          <div className="font-medium flex items-center gap-1.5">
                            <span>Studio Console</span>
                            <span className="text-[9px] bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 px-1 py-0.2 rounded font-mono">2FA</span>
                          </div>
                          <div className="text-[10px] text-slate-400">Master Sanctuary Reports</div>
                        </div>
                      </button>
                    )}

                    <div className="pt-1 border-t border-slate-800 px-3 py-1 flex items-center justify-between text-[10px] text-slate-400">
                      <span className="flex items-center gap-1">
                        {isOnline ? <Wifi className="w-3 h-3 text-emerald-400" /> : <WifiOff className="w-3 h-3 text-amber-400" />}
                        <span>{isOnline ? 'Online Ready' : 'Offline Mode'}</span>
                      </span>
                      <span className="font-mono text-[9px] text-slate-400">v2.4</span>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* 1-Click Login / User Profile Pill (Responsive across Mobile/Tablet/Desktop) */}
            {currentUser ? (
              <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsLoginModalOpen(true)}
                  className="w-9 h-9 sm:w-9.5 sm:h-9.5 lg:w-auto lg:h-9 lg:px-2.5 lg:py-0 p-0 inline-flex items-center justify-center gap-1.5 rounded-xl text-xs font-medium bg-slate-900 border border-slate-700 hover:border-sky-500/50 text-slate-200 transition-colors shadow-sm group cursor-pointer whitespace-nowrap"
                  title="View user account & session details"
                  aria-label="User account and session details"
                >
                  <img
                    src={currentUser.photoURL || `https://api.dicebear.com/7.x/bottts/svg?seed=${currentUser.uid}`}
                    alt={currentUser.displayName}
                    className="w-5 h-5 rounded-full object-cover border border-sky-400/50 shrink-0 group-hover:scale-110 transition-transform duration-200"
                  />
                  <span className="hidden lg:inline max-w-[80px] truncate">{currentUser.displayName}</span>
                  <span
                    className={`hidden lg:inline-flex items-center text-[9px] px-1.5 py-0.5 leading-none rounded font-bold uppercase ${
                      currentUser.role === 'admin'
                        ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40'
                        : 'bg-sky-500/20 text-sky-300 border border-sky-500/40'
                    }`}
                  >
                    {currentUser.role === 'admin' ? 'lead' : currentUser.role}
                  </span>
                </button>

                {currentUser.role === 'admin' && (
                  <button
                    type="button"
                    onClick={() => setActiveTab('admin')}
                    className={`hidden xl:inline-flex h-9 px-2.5 py-0 rounded-xl text-xs font-semibold border transition-colors items-center justify-center gap-1.5 cursor-pointer group whitespace-nowrap ${
                      activeTab === 'admin'
                        ? 'bg-indigo-500/30 border-indigo-400 text-indigo-200 shadow-sm'
                        : 'bg-indigo-950/60 border-indigo-800/80 text-indigo-300 hover:bg-indigo-900'
                    }`}
                    title="Open Studio Control Center & Reports"
                    aria-label="Open Studio Control Center & Reports"
                  >
                    <ShieldCheck className="w-3.5 h-3.5 group-hover:scale-120 transition-transform duration-200" />
                    <span>Studio</span>
                  </button>
                )}
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setIsLoginModalOpen(true)}
                className="w-9 h-9 sm:w-9.5 sm:h-9.5 lg:w-auto lg:h-9 lg:px-3 lg:py-0 p-0 inline-flex items-center justify-center gap-1 rounded-xl border border-transparent text-xs font-bold bg-gradient-to-r from-aurora-teal to-cosmic-lavender hover:opacity-95 text-midnight transition-all shadow-md active:scale-95 shrink-0 cursor-pointer group whitespace-nowrap"
                title="1-Click Login with Google or Instant Guest"
                aria-label="1-Click Login with Google or Instant Guest"
              >
                <LogIn className="w-4 h-4 shrink-0 text-midnight group-hover:scale-120 group-hover:translate-x-0.5 transition-transform duration-200" />
                <span className="hidden lg:inline text-midnight">Login</span>
              </button>
            )}
            {/* Mobile & Tablet Auto-Hide Indicator / Quick Tab Opener */}
            {isTabsBarHidden && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsTabsBarHidden(false);
                }}
                className="lg:hidden flex items-center gap-1 px-2.5 py-1 rounded-xl bg-aurora-teal/20 hover:bg-aurora-teal/30 border border-aurora-teal/40 text-[11px] font-semibold text-aurora-teal animate-in fade-in transition-all active:scale-95 cursor-pointer shrink-0"
                title="Tap to reveal navigation tabs"
                aria-label="Reveal navigation tabs bar"
              >
                <span className="capitalize">{activeTab === 'player' ? 'Sanctuary' : activeTab === 'musical' ? 'Harp' : activeTab === 'gear' ? 'Aura Shop (Soon)' : activeTab}</span>
                <ChevronDown className="w-3 h-3 text-aurora-teal" />
              </button>
            )}
          </div>
        </div>

        {/* UNIFIED SANCTUARY TABS BAR - RESPONSIVE ADAPTIVE AUTO-HIDE ON MOBILE & TABLET */}
        <nav
          aria-label="Sanctuary Navigation"
          className={`w-full border-t border-slate-800/80 bg-slate-950/90 backdrop-blur-md px-2 sm:px-4 pl-[max(0.5rem,env(safe-area-inset-left,0px))] pr-[max(0.5rem,env(safe-area-inset-right,0px))] select-none transition-all duration-300 ease-in-out lg:max-h-none lg:opacity-100 lg:translate-y-0 lg:pointer-events-auto lg:overflow-visible ${
            isTabsBarHidden
              ? 'max-h-0 py-0 opacity-0 -translate-y-2 pointer-events-none border-t-transparent overflow-hidden'
              : 'max-h-96 py-1.5 sm:py-2 landscape:py-1 opacity-100 translate-y-0 overflow-visible'
          }`}
        >
          <div className="max-w-6xl mx-auto w-full">
            {/* Clean Grid on all mobile, tablet, and desktop devices: 4 columns on phones (2 rows), 8 columns on rotated landscape phones, tablet & desktop (1 clean row) */}
            <div
              className={`grid gap-1 sm:gap-1.5 landscape:gap-1 w-full ${
                currentUser?.role === 'admin'
                  ? 'grid-cols-4 sm:grid-cols-4 md:grid-cols-9 landscape:grid-cols-9'
                  : 'grid-cols-4 sm:grid-cols-4 md:grid-cols-8 landscape:grid-cols-8'
              }`}
            >
              {/* 1. Sanctuary */}
              <button
                type="button"
                onClick={() => setActiveTab('player')}
                aria-current={activeTab === 'player' ? 'page' : undefined}
                className={`group min-h-[48px] sm:min-h-[40px] py-1.5 sm:py-2 px-1 sm:px-1.5 rounded-xl text-[10px] sm:text-[11px] md:text-xs font-semibold transition-all flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-1.5 active:scale-95 text-center cursor-pointer border whitespace-nowrap ${
                  activeTab === 'player'
                    ? 'bg-aurora-teal/20 text-white border-aurora-teal/60 shadow-sm shadow-aurora-teal/20'
                    : 'bg-slate-900/80 text-slate-100 border-slate-700/80 hover:bg-slate-800 hover:text-white hover:border-slate-600'
                }`}
                title="Sanctuary Player (432Hz Cosmic Tuning & Ambient Waves)"
              >
                <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-aurora-teal group-hover:scale-125 group-hover:rotate-12 transition-transform duration-200 shrink-0" />
                <span className="truncate">Sanctuary</span>
              </button>

              {/* 2. Soundscapes */}
              <button
                type="button"
                onClick={() => setActiveTab('mixer')}
                aria-current={activeTab === 'mixer' ? 'page' : undefined}
                className={`group min-h-[48px] sm:min-h-[40px] py-1.5 sm:py-2 px-1 sm:px-1.5 rounded-xl text-[10px] sm:text-[11px] md:text-xs font-semibold transition-all flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-1.5 active:scale-95 text-center relative cursor-pointer border whitespace-nowrap ${
                  activeTab === 'mixer'
                    ? 'bg-aurora-teal/20 text-white border-aurora-teal/60 shadow-sm shadow-aurora-teal/20'
                    : 'bg-slate-900/80 text-slate-100 border-slate-700/80 hover:bg-slate-850 hover:text-white hover:border-slate-600'
                }`}
                title="Soundscapes & Multi-track Acoustic Nature Mixer"
              >
                <Wind className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-aurora-teal group-hover:scale-125 group-hover:-rotate-12 transition-transform duration-200 shrink-0" />
                <span className="truncate md:hidden">Mixer</span>
                <span className="hidden md:inline truncate">Soundscapes</span>
                {natureSounds.filter((s) => s.enabled).length > 0 && (
                  <span className="text-[9px] px-1 sm:px-1.5 py-0.5 leading-none rounded-full bg-teal-950 text-teal-200 border border-teal-400/60 font-mono font-medium shrink-0">
                    {natureSounds.filter((s) => s.enabled).length}
                  </span>
                )}
              </button>

              {/* 3. Breathwork */}
              <button
                type="button"
                onClick={() => setActiveTab('breath')}
                aria-current={activeTab === 'breath' ? 'page' : undefined}
                className={`group min-h-[48px] sm:min-h-[40px] py-1.5 sm:py-2 px-1 sm:px-1.5 rounded-xl text-[10px] sm:text-[11px] md:text-xs font-semibold transition-all flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-1.5 active:scale-95 text-center cursor-pointer border whitespace-nowrap ${
                  activeTab === 'breath'
                    ? 'bg-emerald-500/25 text-emerald-100 border-emerald-400/60 shadow-sm shadow-emerald-500/20'
                    : 'bg-slate-900/80 text-slate-100 border-slate-700/80 hover:bg-slate-850 hover:text-white hover:border-slate-600'
                }`}
                title="Breathwork Pacer (4-7-8 Vagal Stimulation & Coherence)"
              >
                <Wind className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400 group-hover:scale-125 group-hover:rotate-12 transition-transform duration-200 shrink-0" />
                <span className="truncate md:hidden">Breath</span>
                <span className="hidden md:inline truncate">Breathwork</span>
              </button>

              {/* 4. Sound Harp */}
              <button
                type="button"
                onClick={() => setActiveTab('musical')}
                aria-current={activeTab === 'musical' ? 'page' : undefined}
                className={`group min-h-[48px] sm:min-h-[40px] py-1.5 sm:py-2 px-1 sm:px-1.5 rounded-xl text-[10px] sm:text-[11px] md:text-xs font-semibold transition-all flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-1.5 active:scale-95 text-center cursor-pointer border whitespace-nowrap ${
                  activeTab === 'musical'
                    ? 'bg-cosmic-lavender/25 text-white border-cosmic-lavender/60 shadow-sm shadow-cosmic-lavender/20'
                    : 'bg-slate-900/80 text-slate-100 border-slate-700/80 hover:bg-slate-850 hover:text-white hover:border-slate-600'
                }`}
                title="Harmonic Sound Harp & Interactive Solfeggio Strings"
              >
                <Music className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-cosmic-lavender group-hover:scale-125 group-hover:rotate-12 transition-transform duration-200 shrink-0" />
                <span className="truncate md:hidden">Harp</span>
                <span className="hidden md:inline truncate">Sound Harp</span>
              </button>

              {/* 5. Aura Shop (Soon) */}
              <button
                type="button"
                onClick={() => setActiveTab('gear')}
                aria-current={activeTab === 'gear' ? 'page' : undefined}
                className={`group min-h-[48px] sm:min-h-[40px] py-1.5 sm:py-2 px-1 sm:px-2 rounded-xl text-[10px] sm:text-[11px] md:text-xs font-semibold transition-all flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-1.5 active:scale-95 text-center cursor-pointer border relative overflow-visible whitespace-nowrap ${
                  activeTab === 'gear'
                    ? 'bg-amber-500/25 text-amber-100 border-amber-400/60 shadow-sm shadow-amber-500/20'
                    : 'bg-slate-900/80 text-slate-100 border-slate-700/80 hover:bg-slate-850 hover:text-white hover:border-slate-600'
                }`}
                title="Aura Shop: Sacred Sound Gear, Singing Bowls & Audio Tools (Launching Soon)"
              >
                <Flame className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400 group-hover:scale-125 group-hover:scale-y-130 transition-transform duration-200 shrink-0" />
                <span className="whitespace-nowrap font-bold text-slate-100 group-hover:text-amber-200">Aura Shop</span>
                <span className="px-1.5 py-0.5 rounded-full bg-amber-400 text-slate-950 text-[8px] sm:text-[9px] font-black uppercase tracking-wider leading-none shadow-sm shadow-amber-400/40 shrink-0">
                  Soon
                </span>
              </button>

              {/* 6. Community */}
              <button
                type="button"
                onClick={() => setActiveTab('community')}
                aria-current={activeTab === 'community' ? 'page' : undefined}
                className={`group min-h-[48px] sm:min-h-[40px] py-1.5 sm:py-2 px-1 sm:px-1.5 rounded-xl text-[10px] sm:text-[11px] md:text-xs font-semibold transition-all flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-1.5 active:scale-95 text-center cursor-pointer border whitespace-nowrap ${
                  activeTab === 'community'
                    ? 'bg-rose-500/25 text-rose-100 border-rose-400/60 shadow-sm shadow-rose-500/20'
                    : 'bg-slate-900/80 text-slate-100 border-slate-700/80 hover:bg-slate-850 hover:text-white hover:border-slate-600'
                }`}
                title="Sanctuary Global Meditation Community & Intentions"
              >
                <Heart className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-rose-400 group-hover:scale-130 group-hover:scale-125 transition-transform duration-200 shrink-0" />
                <span className="truncate">Community</span>
              </button>

              {/* 7. Science & Blog */}
              <button
                type="button"
                onClick={() => setActiveTab('blog')}
                aria-current={activeTab === 'blog' ? 'page' : undefined}
                className={`group min-h-[48px] sm:min-h-[40px] py-1.5 sm:py-2 px-1 sm:px-1.5 rounded-xl text-[10px] sm:text-[11px] md:text-xs font-semibold transition-all flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-1.5 active:scale-95 text-center cursor-pointer border whitespace-nowrap ${
                  activeTab === 'blog'
                    ? 'bg-cosmic-lavender/25 text-white border-cosmic-lavender/60 shadow-sm shadow-cosmic-lavender/20'
                    : 'bg-slate-900/80 text-slate-100 border-slate-700/80 hover:bg-slate-850 hover:text-white hover:border-slate-600'
                }`}
                title="Science & Blog: Historical Treatises, Acoustic Research & Clinical Studies"
              >
                <BookOpen className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-cosmic-lavender group-hover:scale-125 group-hover:-rotate-12 transition-transform duration-200 shrink-0" />
                <span className="truncate md:hidden">Science</span>
                <span className="hidden md:inline truncate">Science &amp; Blog</span>
              </button>

              {/* 8. Contact */}
              <button
                type="button"
                onClick={() => setActiveTab('contact')}
                aria-current={activeTab === 'contact' ? 'page' : undefined}
                className={`group min-h-[48px] sm:min-h-[40px] py-1.5 sm:py-2 px-1 sm:px-1.5 rounded-xl text-[10px] sm:text-[11px] md:text-xs font-semibold transition-all flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-1.5 active:scale-95 text-center cursor-pointer border whitespace-nowrap ${
                  activeTab === 'contact'
                    ? 'bg-aurora-teal/20 text-white border-aurora-teal/60 shadow-sm shadow-aurora-teal/20'
                    : 'bg-slate-900/80 text-slate-100 border-slate-700/80 hover:bg-slate-850 hover:text-white hover:border-slate-600'
                }`}
                title="Sanctuary Concierge & Community Feedback"
              >
                <Mail className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-aurora-teal group-hover:scale-125 group-hover:rotate-12 transition-transform duration-200 shrink-0" />
                <span className="truncate">Contact</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0 hidden sm:inline-block" />
              </button>

              {/* 9. Studio Console (Admin Only) */}
              {currentUser?.role === 'admin' && (
                <button
                  type="button"
                  onClick={() => setActiveTab('admin')}
                  aria-current={activeTab === 'admin' ? 'page' : undefined}
                  className={`group min-h-[48px] sm:min-h-[40px] py-1.5 sm:py-2 px-1 sm:px-1.5 rounded-xl text-[10px] sm:text-[11px] md:text-xs font-semibold transition-all flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-1.5 active:scale-95 text-center cursor-pointer border col-span-4 sm:col-span-4 md:col-span-1 landscape:col-span-1 whitespace-nowrap ${
                    activeTab === 'admin'
                      ? 'bg-cosmic-lavender/30 text-white border-cosmic-lavender/70 shadow-sm shadow-cosmic-lavender/20'
                      : 'bg-indigo-950/40 text-cosmic-lavender border-cosmic-lavender/30 hover:bg-indigo-900/50 hover:text-white'
                  }`}
                  title="Sanctuary Studio Console & Editorial CMS"
                >
                  <ShieldCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-cosmic-lavender group-hover:scale-125 group-hover:rotate-12 transition-transform duration-200 shrink-0" />
                  <span className="truncate">Studio</span>
                </button>
              )}
            </div>
          </div>
        </nav>
      </header>

      {/* Prominent Aura Shop Announcement Bar - Clear place visible to everyone with zero text hidden */}
      <div className="w-full bg-gradient-to-r from-amber-500/15 via-slate-900 to-amber-500/15 border-b border-amber-500/30 px-3 py-1.5 sm:py-2 shadow-inner">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-2 sm:gap-4 flex-wrap">
          <div className="flex items-center gap-2 min-w-0">
            <span className="px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 font-black text-[10px] sm:text-xs uppercase tracking-wider shadow-sm shrink-0">
              Soon
            </span>
            <div className="flex items-center gap-1.5 text-xs sm:text-sm flex-wrap">
              <span className="font-extrabold text-amber-300 whitespace-nowrap">Aura Shop:</span>
              <span className="text-slate-200 font-medium">
                Sacred 432Hz Sound Gear, Himalayan Singing Bowls &amp; Temple Incense Launching Soon
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              setActiveTab('gear');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="px-3 py-1 rounded-xl bg-amber-400/20 hover:bg-amber-400/30 text-amber-300 border border-amber-400/50 hover:border-amber-300 text-xs font-bold transition-all flex items-center gap-1 active:scale-95 cursor-pointer ml-auto shrink-0 shadow-sm"
          >
            <span>{activeTab === 'gear' ? 'You are here' : 'Explore Preview'}</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Layout Area with Right AdSense Gutter (Optimized for Left-to-Right users) */}
      <div className={`flex-1 w-full max-w-7xl mx-auto px-2 sm:px-4 pl-[max(0.5rem,env(safe-area-inset-left,0px))] pr-[max(0.5rem,env(safe-area-inset-right,0px))] py-3 md:py-6 flex justify-center items-start gap-4 lg:gap-8 ${isPlaying || activeTab !== 'player' ? 'pb-28 sm:pb-32' : 'pb-12 md:pb-8'}`}>
        {/* Central Sanctuary Content */}
        <main className={`flex-1 max-w-5xl w-full min-w-0 ${isCompactView ? 'space-y-4' : 'space-y-6'}`}>
          <h1 className="sr-only">Aura 432Hz — Harmonic Resonance &amp; Ambient Meditation Sanctuary</h1>
          {/* Offline Banner when offline */}
        {!isOnline && (
          <div className="p-3 bg-amber-950/40 border border-amber-600/40 rounded-xl text-xs text-amber-200 flex items-center gap-2.5">
            <WifiOff className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              <strong>Offline Mode Active:</strong> You are currently disconnected from the internet.
              The 432Hz ambient audio synthesizer, nature sound mixer, and offline library are fully functional!
            </span>
          </div>
        )}

        {/* TAB 1: 432Hz AMBIENT SOUND & MEDITATION PLAYER */}
        {activeTab === 'player' && (
          <div className={isCompactView ? 'space-y-4' : 'space-y-6'}>
            {/* Sanctuary Hero Message: Friendly Compact View with Minimal Footprint */}
            <div className="bg-gradient-to-r from-slate-900/95 via-slate-900/85 to-indigo-950/40 border border-slate-800 rounded-2xl p-3 sm:p-4 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-3.5 relative overflow-hidden">
              <div className="space-y-1 min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-aurora-teal/15 border border-aurora-teal/30 text-aurora-teal flex items-center justify-center shrink-0">
                    <Sparkles className="w-3.5 h-3.5" />
                  </div>
                  <h2 className="text-sm sm:text-base font-bold text-white tracking-tight">
                    Ambient audio for focused, restful listening.
                  </h2>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed pl-8">
                  Choose a soundscape, set a timer, and listen at a comfortable volume—free to start.
                </p>

                <div className="text-xs text-slate-400 flex items-center gap-2 flex-wrap pl-8 pt-0.5">
                  <span className="text-emerald-400 font-medium">✓ No login required</span>
                  <span aria-hidden="true" className="text-slate-600">·</span>
                  <span>Free guest listening</span>
                  <span aria-hidden="true" className="text-slate-600">·</span>
                  <span>Optional account to save &amp; sync mixes</span>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0 self-start md:self-center pl-8 md:pl-0 flex-wrap">
                <button
                  type="button"
                  onClick={handleTogglePlay}
                  className="min-h-[38px] px-4 py-2 rounded-xl border border-transparent bg-gradient-to-r from-aurora-teal to-cosmic-lavender hover:from-teal-300 hover:to-purple-300 text-midnight font-bold text-xs transition-all shadow-md active:scale-95 inline-flex items-center justify-center gap-1.5 cursor-pointer shadow-aurora-teal/20 whitespace-nowrap"
                >
                  {isPlaying ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                  <span>{isPlaying ? 'Pause' : 'Start listening'}</span>
                </button>

                {/* Musical Mode Toggle in Player Header */}
                <button
                  type="button"
                  onClick={handleToggleMusicalMode}
                  className={`min-h-[38px] px-3 sm:px-3.5 py-2 rounded-xl text-xs font-semibold transition-all shadow-md active:scale-95 inline-flex items-center justify-center gap-1.5 cursor-pointer border whitespace-nowrap ${
                    isMusicalMode
                      ? 'bg-cosmic-lavender/25 text-white border-cosmic-lavender/50 shadow-cosmic-lavender/20'
                      : 'bg-slate-800/80 hover:bg-slate-750 text-slate-300 border-slate-700/80'
                  }`}
                  title={`Toggle Musical Mode: Ambient ethereal harmonic pads and slow chord swells (${audioEngine.getSolfeggioKeyName(baseFreq)})`}
                >
                  <Music className={`w-3.5 h-3.5 ${isMusicalMode ? 'text-cosmic-lavender animate-pulse' : 'text-slate-400'}`} />
                  <span>{isMusicalMode ? 'Music: ON' : 'Musical Mode'}</span>
                  {isMusicalMode && (
                    <span className="text-[10px] bg-cosmic-lavender/30 text-cosmic-lavender px-1.5 py-0.5 leading-none rounded-full font-mono">
                      {audioEngine.getSolfeggioKeyName(baseFreq).split(' ')[1] || 'Pad'}
                    </span>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setIsHowItWorksOpen(true)}
                  className="min-h-[38px] px-3 py-2 rounded-xl border border-transparent bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-all inline-flex items-center justify-center gap-1 cursor-pointer whitespace-nowrap"
                  title="Sanctuary 3-Step Guided Experience"
                >
                  <Info className="w-3.5 h-3.5 text-slate-400" />
                  <span>Guide</span>
                </button>

                {/* Export WAV Quick-Action Button */}
                <button
                  type="button"
                  onClick={() => setIsExportModalOpen(true)}
                  className="min-h-[38px] px-3 sm:px-3.5 py-2 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/40 text-emerald-300 hover:text-emerald-200 text-xs font-semibold transition-all shadow-sm active:scale-95 inline-flex items-center justify-center gap-1.5 cursor-pointer group whitespace-nowrap"
                  title="Export offline 16-bit 44.1kHz studio WAV audio for active soundscape"
                  aria-label="Export WAV audio"
                >
                  <Download className="w-3.5 h-3.5 text-emerald-400 group-hover:scale-115 transition-transform duration-200" />
                  <span>Export WAV</span>
                </button>
              </div>
            </div>

            {/* Hero Player Card */}
            <div
              ref={visualizerSectionRef}
              id="sanctuary-visualizer-section"
              className={`bg-gradient-to-b from-slate-900/90 to-slate-950 border border-slate-800 rounded-3xl ${isCompactView ? 'p-3.5 sm:p-5' : 'p-4 sm:p-6 md:p-8'} shadow-2xl relative overflow-hidden min-h-[420px] lg:min-h-[460px]`}
            >
              <div className={`grid grid-cols-1 lg:grid-cols-12 ${isCompactView ? 'gap-4 md:gap-5' : 'gap-6 md:gap-8'} items-center`}>
                {/* Visualizer Column */}
                <div className="lg:col-span-6 flex flex-col items-center justify-center">
                  <AudioVisualizer
                    isPlaying={isPlaying}
                    baseFreq={baseFreq}
                    alphaBeatHz={currentBrainwave.beatHz}
                    brainwaveName={currentBrainwave.name}
                    isLight={theme === 'light'}
                    isMusicalMode={isMusicalMode}
                    onOpenAmbientMode={handleOpenAmbientMode}
                    onTogglePlay={handleTogglePlay}
                  />

                  {/* Primary Controls Row: Ordered Musical Mode, Timer, then Begin 432Hz Sanctuary */}
                  <div className="mt-4 w-full flex flex-wrap items-center justify-center gap-2.5 sm:gap-3.5">
                    {/* 1. Musical Mode (Ambient Ethereal Harmonic Pads) */}
                    <button
                      type="button"
                      onClick={handleToggleMusicalMode}
                      className={`min-h-[44px] py-2.5 px-3.5 sm:px-4 border rounded-2xl transition-all shadow-md active:scale-95 inline-flex items-center justify-center gap-2 text-xs font-semibold cursor-pointer shrink-0 whitespace-nowrap ${
                        isMusicalMode
                          ? 'bg-gradient-to-r from-indigo-950/90 via-purple-950/90 to-indigo-900/90 text-indigo-200 border-indigo-400/80 shadow-indigo-500/25 ring-1 ring-indigo-400/40'
                          : 'bg-slate-900/90 hover:bg-slate-800 text-slate-300 hover:text-indigo-300 border-slate-700/80'
                      }`}
                      title={`Toggle Musical Mode: Ambient ethereal harmonic pads and slow chord swells (${audioEngine.getSolfeggioKeyName(baseFreq)})`}
                      aria-label="Toggle Musical Mode"
                    >
                      <Music className={`w-4 h-4 ${isMusicalMode ? 'text-indigo-400 animate-pulse' : 'text-indigo-300'}`} />
                      <span>{isMusicalMode ? 'Music: ON' : 'Musical Mode'}</span>
                    </button>

                    {/* 2. Sleep Timer */}
                    <button
                      type="button"
                      onClick={() => setIsTimerModalOpen(true)}
                      className={`min-h-[44px] py-2.5 px-3.5 sm:px-4 rounded-2xl border transition-all shadow-md active:scale-95 inline-flex items-center justify-center gap-2 text-xs font-semibold cursor-pointer shrink-0 whitespace-nowrap ${
                        timerSecondsRemaining !== null
                          ? 'bg-indigo-600/30 border-indigo-400 text-indigo-200 shadow-indigo-500/20 ring-1 ring-indigo-400/40'
                          : 'bg-slate-900/90 hover:bg-slate-800 text-slate-300 hover:text-indigo-300 border-slate-700/80'
                      }`}
                      title="Set Sleep Timer"
                      aria-label="Set Sleep Timer"
                    >
                      <Timer className="w-4 h-4 text-indigo-400" />
                      <span>
                        {timerSecondsRemaining !== null
                          ? formatTimerDisplay(timerSecondsRemaining)
                          : 'Timer'}
                      </span>
                    </button>

                    {/* 3. Begin 432Hz Sanctuary Primary Action Button with BPM-synced brainwave pulse */}
                    <button
                      type="button"
                      onClick={handleTogglePlay}
                      style={
                        isPlaying
                          ? {
                              animation: `sanctuaryBreathPulse ${brainwavePulseDuration}s ease-in-out infinite`,
                            }
                          : undefined
                      }
                      className={`relative min-h-[46px] px-6 sm:px-8 py-3 rounded-2xl font-bold text-xs sm:text-sm transition-all shadow-xl inline-flex items-center justify-center gap-2.5 active:scale-95 cursor-pointer shrink-0 whitespace-nowrap ${
                        isPlaying
                          ? 'animate-sanctuary-pulse transform-gpu bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-400 hover:to-pink-500 text-white shadow-rose-500/25 ring-1 ring-rose-300/40'
                          : 'bg-gradient-to-r from-aurora-teal via-teal-300 to-cosmic-lavender hover:from-teal-300 hover:to-purple-300 text-midnight shadow-aurora-teal/35 ring-1 ring-aurora-teal/60'
                      }`}
                      title={
                        isPlaying
                          ? `Pause ${baseFreq === 432 ? '432Hz Sanctuary' : `${baseFreq}Hz ${solfeggioShortName}`} • ${currentBrainwave.name} Pulse (${brainwaveBpm} BPM Coherence)`
                          : `Begin ${baseFreq === 432 ? '432Hz Sanctuary' : `${baseFreq}Hz ${solfeggioShortName}`}`
                      }
                      aria-label={isPlaying ? 'Pause Sanctuary Audio' : 'Begin 432Hz Sanctuary'}
                    >
                      {/* Ethereal BPM-synced ambient aura glow behind button */}
                      {isPlaying && (
                        <span
                          aria-hidden="true"
                          className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-rose-500/35 via-pink-500/30 to-rose-400/35 blur-sm pointer-events-none transform-gpu"
                          style={{
                            animation: `sanctuaryGlowHalo ${brainwavePulseDuration}s ease-in-out infinite`,
                          }}
                        />
                      )}
                      {isPlaying ? (
                        <>
                          <Pause className="w-5 h-5 fill-current relative z-10" />
                          <span className="relative z-10">
                            Pause {baseFreq === 432 ? '432Hz Sanctuary' : `${baseFreq}Hz ${solfeggioShortName}`}
                          </span>
                        </>
                      ) : (
                        <>
                          <Play className="w-5 h-5 fill-current relative z-10" />
                          <span className="relative z-10">
                            Begin {baseFreq === 432 ? '432Hz Sanctuary' : `${baseFreq}Hz ${solfeggioShortName}`}
                          </span>
                        </>
                      )}
                    </button>

                    {/* Ambient Mode Sparkle Button (Mobile Quick Access) */}
                    <button
                      type="button"
                      onClick={() => setIsAmbientMode(true)}
                      className="sm:hidden min-h-[44px] min-w-[44px] p-2.5 bg-slate-900/90 hover:bg-slate-800 text-amber-300 border border-amber-500/40 rounded-2xl transition-all shadow-md active:scale-95 inline-flex items-center justify-center cursor-pointer shrink-0"
                      title="Fullscreen Ambient Sanctuary"
                      aria-label="Fullscreen Ambient Sanctuary"
                    >
                      <Sparkles className="w-4 h-4 text-amber-400" />
                    </button>
                  </div>

                  {/* Real-time Playing & Entrainment Status Badge + Volume Guidance */}
                  <div className="mt-3 flex flex-col items-center justify-center gap-1.5 text-center">
                    {isPlaying ? (
                      <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs shadow-sm flex-wrap justify-center">
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping will-change-transform transform-gpu absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                        </span>
                        <span className="font-medium">
                          Playing: <strong className="text-white font-mono">{baseFreq}Hz</strong> ({currentBrainwave.name})
                          {activeNatureList.length > 0 && (
                            <span className="text-emerald-400/90">
                              {' '}• {activeNatureList.length} Ambient Layer{activeNatureList.length > 1 ? 's' : ''}
                            </span>
                          )}
                          {isMusicalMode && (
                            <span className="text-indigo-300 font-medium">
                              {' '}• ♫ {audioEngine.getSolfeggioKeyName(baseFreq)}
                            </span>
                          )}
                        </span>
                      </div>
                    ) : (
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900/60 border border-slate-800 text-slate-400 text-xs">
                        <span>State: <strong className="text-sky-300">Ready to listen</strong></span>
                        <span>•</span>
                        <span className="font-mono text-slate-300">{baseFreq}Hz</span>
                        <span>•</span>
                        <span className="text-slate-300">{currentBrainwave.name}</span>
                      </div>
                    )}

                    <div className="text-[11px] text-slate-300 flex items-center gap-2 flex-wrap justify-center">
                      <span>Recommended volume: <strong className="text-white">40%–60%</strong></span>
                      <span>•</span>
                      <span className="text-emerald-400 font-medium">3–5s Acoustic Fade-In Active</span>
                      <span>•</span>
                      <span className="text-slate-400">For relaxation only; not medical treatment</span>
                    </div>
                  </div>
                </div>

                {/* Frequency & Brainwave Controls Column */}
                <div className="lg:col-span-6 space-y-5">
                  {/* Current State Info */}
                  <div className="border-b border-slate-800/80 pb-3">
                    <div className="text-xs uppercase tracking-widest text-sky-400 font-bold mb-1 flex items-center justify-between">
                      <span>{currentSolfeggio ? currentSolfeggio.name : currentBrainwave.targetState}</span>
                      <span className="text-[11px] font-mono text-slate-400">Pure Acoustic • 0.00 MHz RF</span>
                    </div>
                    <h2 className="text-2xl font-light text-slate-100 flex items-center gap-2">
                      <span>{baseFreq}Hz Harmonic Frequency</span>
                    </h2>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                      {currentSolfeggio
                        ? `${currentSolfeggio.name} — ${currentSolfeggio.description}`
                        : currentBrainwave.description}
                    </p>
                  </div>

                  {/* Sacred Solfeggio Tuning Bar */}
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2 flex-wrap">
                      <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                        Sacred Solfeggio Tuning:
                      </label>
                      <button
                        type="button"
                        onClick={() => setIsSafetyModalOpen(true)}
                        className="text-[11px] text-emerald-400 hover:text-emerald-300 flex items-center gap-1 font-medium transition-colors"
                        title="View Acoustic Safety & Original Frequency Verification Certificate"
                      >
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Safe Acoustic Hz (0.00 MHz) ✓</span>
                      </button>
                    </div>
                    <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-9 gap-1.5 sm:gap-2">
                      {SOLFEGGIO_FREQUENCIES.map((s) => {
                        const isCurrent = baseFreq === s.freq;
                        return (
                          <button
                            key={s.freq}
                            type="button"
                            onClick={() => setBaseFreq(s.freq)}
                            className={`py-2 px-2 min-h-[54px] flex flex-col items-center justify-center rounded-xl border text-center transition-all cursor-pointer ${
                              isCurrent
                                ? 'bg-indigo-500/25 border-indigo-400 text-indigo-200 font-semibold shadow-sm'
                                : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                            }`}
                          >
                            <div className="text-xs font-mono font-medium">{s.label}</div>
                            <div className="text-[9px] text-slate-400 truncate max-w-full mt-0.5">
                              {s.name.split('/')[0].split('&')[0].trim()}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* 1-Tap Mindful Intentions (Quick, Zero-Friction Mood Selector) */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                      Mindful Listening Intentions:
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {MINDFUL_INTENTIONS.map((item) => {
                        const isSelected = baseFreq === item.freq && brainwaveMode === item.mode;
                        return (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => {
                              setBaseFreq(item.freq);
                              setBrainwaveMode(item.mode);
                            }}
                            className={`p-2.5 rounded-2xl text-left border transition-all text-xs flex flex-col justify-between cursor-pointer ${
                              isSelected
                                ? 'bg-sky-500/20 border-sky-400 text-sky-100 shadow-md shadow-sky-500/10 font-medium'
                                : 'bg-slate-900/60 border-slate-800/80 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                            }`}
                          >
                            <div className="flex items-center gap-1.5 font-semibold text-slate-200">
                              <span>{item.icon}</span>
                              <span>{item.label}</span>
                            </div>
                            <div className="text-[10px] text-slate-400 mt-1 line-clamp-1">
                              {item.desc}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Recommended Breathwork for Selected Tuning */}
                  {currentSolfeggio?.recommendedBreath && (
                    <div className="p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-sky-950/40 via-indigo-950/30 to-purple-950/40 border border-sky-500/25 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-md">
                      <div className="flex items-start gap-3">
                        <div className="w-9 h-9 rounded-xl bg-sky-500/20 border border-sky-400/40 flex items-center justify-center text-sky-300 shrink-0 mt-0.5 shadow-sm">
                          <Wind className="w-4 h-4 text-sky-400" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs font-bold text-sky-200">
                              Recommended Breathwork for {baseFreq}Hz:
                            </span>
                            <span className="text-xs font-semibold text-white bg-cosmic-lavender/25 border border-cosmic-lavender/40 px-2 py-0.5 rounded-full shadow-sm">
                              {currentSolfeggio.recommendedBreath.patternName}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-300 mt-1 leading-snug">
                            <strong className="text-sky-300 font-mono">{currentSolfeggio.recommendedBreath.ratio}</strong> — {currentSolfeggio.recommendedBreath.focus}. {currentSolfeggio.recommendedBreath.instruction}
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setRecommendedBreathPattern(currentSolfeggio.recommendedBreath.patternId);
                          setActiveTab('breath');
                        }}
                        className="w-full sm:w-auto px-4 py-2 min-h-[38px] rounded-xl bg-gradient-to-r from-sky-500/25 to-indigo-500/25 hover:from-sky-500/35 hover:to-indigo-500/35 border border-sky-400/40 text-sky-200 hover:text-white text-xs font-semibold inline-flex items-center justify-center gap-1.5 transition-all shrink-0 cursor-pointer active:scale-95 shadow-sm whitespace-nowrap"
                        title={`Start ${currentSolfeggio.recommendedBreath.patternName} with ${baseFreq}Hz`}
                      >
                        <span>Start Breathwork</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}

                  {/* Primary Master Volume Slider */}
                  <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800/80 flex items-center gap-3">
                    <button
                      type="button"
                      onClick={handleMasterMuteToggle}
                      className="p-1 hover:text-aurora-teal text-slate-400 transition-colors cursor-pointer"
                      title={masterVolume > 0 ? 'Mute Master Volume' : 'Unmute Master Volume'}
                      aria-label={masterVolume > 0 ? 'Mute Master Volume' : 'Unmute Master Volume'}
                    >
                      {masterVolume > 0 ? (
                        <Volume2 className="w-4 h-4 text-aurora-teal" />
                      ) : (
                        <VolumeX className="w-4 h-4 text-rose-400" />
                      )}
                    </button>
                    <div className="flex-1">
                      <div className="flex justify-between text-xs text-slate-300 mb-1 items-center">
                        <span className="font-medium flex items-center gap-1.5">
                          <span>Master Sanctuary Volume</span>
                          {masterVolume > 0.70 && (
                            <span className="text-[10px] font-semibold text-amber-300 bg-amber-500/20 border border-amber-400/40 px-1.5 py-0.2 rounded-md font-mono">
                              Safety Limit (&gt;70%)
                            </span>
                          )}
                        </span>
                        <span className="font-mono text-slate-400">{Math.round(masterVolume * 100)}%</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.01"
                        value={masterVolume}
                        onChange={(e) => setMasterVolume(parseFloat(e.target.value))}
                        className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-aurora-teal"
                        aria-label="Master Sanctuary Volume Slider"
                      />
                    </div>
                  </div>

                  {/* Collapsible Advanced Audio Controls Drawer (Entrainment Depth, Sub-Drone, Binaural, EBU R128) */}
                  <div className="rounded-2xl bg-slate-900/50 border border-slate-800/80 overflow-hidden transition-all">
                    <button
                      type="button"
                      onClick={() => {
                        const next = !showAdvancedAudio;
                        setShowAdvancedAudio(next);
                        if (next) analytics.track('advanced_controls_opened');
                      }}
                      className="w-full p-3.5 px-4 flex items-center justify-between text-xs font-medium text-slate-300 hover:text-slate-100 hover:bg-slate-850/60 transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <SlidersHorizontal className="w-4 h-4 text-indigo-400" />
                        <span className="font-semibold">Advanced audio controls</span>
                        <span className="text-[10px] text-slate-400 font-normal hidden sm:inline">
                          (Pulse Depth, Sub-Drone, Headphone Binaural, EBU R128)
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-[11px] text-slate-400">
                        <span>{showAdvancedAudio ? 'Hide' : 'Expand'}</span>
                        <ChevronDown
                          className={`w-3.5 h-3.5 transition-transform duration-200 ${
                            showAdvancedAudio ? 'rotate-180' : ''
                          }`}
                        />
                      </div>
                    </button>

                    {showAdvancedAudio && (
                      <div className="p-4 pt-1 border-t border-slate-800/60 space-y-3.5 animate-in fade-in duration-200">
                        {/* Brainwave Entrainment Selector */}
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                            Brainwave Mode:
                          </label>
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                            {(Object.keys(BRAINWAVE_MODES) as BrainwaveMode[]).map((modeKey) => {
                              const m = BRAINWAVE_MODES[modeKey];
                              const isSelected = brainwaveMode === modeKey;
                              return (
                                <button
                                  key={modeKey}
                                  type="button"
                                  onClick={() => setBrainwaveMode(modeKey)}
                                  className={`p-2 rounded-xl text-left border transition-all text-xs cursor-pointer ${
                                    isSelected
                                      ? 'bg-sky-500/20 border-sky-400 text-sky-200 font-medium'
                                      : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                                  }`}
                                >
                                  <div className="font-medium truncate">{m.name}</div>
                                  <div className="text-[10px] text-slate-400">
                                    {m.beatHz > 0 ? `${m.beatHz}Hz Beat` : 'Pure Tone'}
                                  </div>
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {/* Alpha Beat Pulse Depth */}
                        <div className="flex items-center gap-3">
                          <Sliders className="w-4 h-4 text-slate-400 shrink-0" />
                          <div className="flex-1">
                            <div className="flex justify-between text-xs text-slate-300 mb-1">
                              <span>Alpha Pulse Entrainment Depth</span>
                              <span className="font-mono">{Math.round(pulseDepth * 100)}%</span>
                            </div>
                            <input
                              type="range"
                              min="0"
                              max="1"
                              step="0.01"
                              value={pulseDepth}
                              onChange={(e) => setPulseDepth(parseFloat(e.target.value))}
                              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-sky-400"
                              aria-label="Alpha Pulse Entrainment Depth Slider"
                            />
                          </div>
                        </div>

                        {/* Sub-Bass Drone */}
                        <div className="flex items-center gap-3">
                          <Layers className="w-4 h-4 text-slate-400 shrink-0" />
                          <div className="flex-1">
                            <div className="flex justify-between text-xs text-slate-300 mb-1">
                              <span>Sub-Harmonic Drone ({Math.round(baseFreq / 4)}Hz)</span>
                              <span className="font-mono">{Math.round(subDrone * 100)}%</span>
                            </div>
                            <input
                              type="range"
                              min="0"
                              max="1"
                              step="0.01"
                              value={subDrone}
                              onChange={(e) => setSubDrone(parseFloat(e.target.value))}
                              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-sky-400"
                              aria-label="Sub-Harmonic Drone Volume Slider"
                            />
                          </div>
                        </div>

                        {/* Headphone Binaural Mode Switch */}
                        <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Headphones className="w-4 h-4 text-indigo-400" />
                            <div>
                              <div className="text-xs font-medium text-slate-200">
                                Stereo Headphones Binaural Mode
                              </div>
                              <div className="text-[10px] text-slate-400">
                                Isochronic pulses enabled for room speakers
                              </div>
                            </div>
                          </div>

                          <button
                            type="button"
                            role="switch"
                            aria-checked={headphoneBinaural}
                            aria-label="Stereo Headphones Binaural Mode"
                            onClick={() => setHeadphoneBinaural(!headphoneBinaural)}
                            className={`w-9 h-5 rounded-full transition-colors relative p-0.5 focus:outline-none cursor-pointer ${
                              headphoneBinaural ? 'bg-indigo-500' : 'bg-slate-700'
                            }`}
                          >
                            <div
                              className={`w-4 h-4 rounded-full bg-white transition-transform ${
                                headphoneBinaural ? 'translate-x-4' : 'translate-x-0'
                              }`}
                            />
                          </button>
                        </div>

                        {/* Dedicated EBU R128 Loudness Meter & Real-Time Auto-Leveler */}
                        <div className="pt-2 border-t border-slate-800/80">
                          <LoudnessMeterHUD className="mt-1" />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Featured Soundscapes & Nature Layers Bar */}
            <div className="bg-slate-900/60 border border-slate-800/80 rounded-3xl p-5 shadow-xl space-y-3.5 cv-auto-section">
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-sky-500/10 border border-sky-500/30 text-sky-400">
                    <Wind className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-sm font-semibold text-slate-200">
                        Soundscape Presets
                      </h3>
                      {/* Sub-tab pills for Featured vs Favorites */}
                      <div className="flex items-center bg-slate-950/80 border border-slate-800 rounded-xl p-0.5 text-[11px]">
                        <button
                          type="button"
                          onClick={() => setPresetViewTab('featured')}
                          className={`px-2.5 py-1 rounded-lg transition-all font-medium cursor-pointer ${
                            presetViewTab === 'featured'
                              ? 'bg-sky-500/20 text-sky-300 font-semibold'
                              : 'text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          Featured
                        </button>
                        <button
                          type="button"
                          onClick={() => setPresetViewTab('favorites')}
                          className={`px-2.5 py-1 rounded-lg transition-all inline-flex items-center gap-1 font-medium cursor-pointer ${
                            presetViewTab === 'favorites'
                              ? 'bg-rose-500/20 text-rose-300 font-semibold'
                              : 'text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          <Heart className={`w-3 h-3 ${favoritePresetIds.length > 0 ? 'fill-rose-500 text-rose-500' : ''}`} />
                          <span>Favorites</span>
                          <span className="text-[9px] px-1 rounded-full bg-slate-800 font-mono">
                            {favoritePresetIds.length}
                          </span>
                        </button>
                      </div>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      {presetViewTab === 'featured'
                        ? 'Instant multi-layered procedural atmospheres tuned to sacred frequencies'
                        : 'Your personal bookmarked soundscapes for instant one-tap session launch'}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setActiveTab('mixer')}
                  className="min-h-[36px] text-xs text-sky-400 hover:text-sky-300 font-semibold inline-flex items-center justify-center gap-1 transition-colors px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 shadow-sm cursor-pointer whitespace-nowrap"
                >
                  <span>Browse All 32 Soundscapes</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Preset Cards Grid (Featured or Favorites) */}
              {presetViewTab === 'featured' ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                  {FEATURED_PRESETS.map((presetItem) => {
                    const isCurrent = currentPresetId === presetItem.id;
                    const isFav = favoritePresetIds.includes(presetItem.id);
                    return (
                      <div
                        key={presetItem.id}
                        onClick={() => {
                          const found = BUILT_IN_MIX_PRESETS.find((p) => p.id === presetItem.id);
                          if (found) {
                            if (isCurrent && isPlaying) {
                              handleTogglePlay();
                            } else {
                              handleApplyPreset(found, true);
                            }
                          }
                        }}
                        className={`p-3 rounded-2xl border text-left transition-all group cursor-pointer relative ${
                          isCurrent
                            ? 'bg-sky-500/20 border-sky-400 text-sky-200 shadow-md shadow-sky-500/10'
                            : 'bg-slate-900/60 border-slate-800/80 hover:border-slate-700 hover:bg-slate-800/60 text-slate-300'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2 mb-1.5">
                          <span className="text-lg">{presetItem.icon}</span>
                          <div className="flex items-center gap-1">
                            <span className="text-[10px] px-2 py-0.5 rounded-full font-mono font-medium bg-slate-800 border border-slate-700 text-slate-400">
                              {presetItem.freq}Hz
                            </span>
                            <button
                              type="button"
                              onClick={(e) => handleToggleFavoritePreset(presetItem.id, e)}
                              className={`p-1 rounded-lg transition-all active:scale-90 cursor-pointer ${
                                isFav
                                  ? 'text-rose-400 bg-rose-500/20 border border-rose-500/40'
                                  : 'text-slate-500 hover:text-rose-400 bg-slate-850/80 border border-slate-750'
                              }`}
                              title={isFav ? 'Remove from favorites' : 'Bookmark as favorite preset'}
                              aria-label={isFav ? 'Remove preset from favorites' : 'Bookmark preset as favorite'}
                            >
                              <Heart className={`w-3 h-3 ${isFav ? 'fill-rose-500 text-rose-500' : ''}`} />
                            </button>
                          </div>
                        </div>
                        <div className="font-semibold text-xs text-slate-100 group-hover:text-sky-300 transition-colors">
                          {presetItem.name}
                        </div>
                        <div className="text-[10px] text-slate-400 mt-1 line-clamp-1">
                          {presetItem.summary}
                        </div>

                        <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex items-center justify-between">
                          <span className="text-[10px] text-slate-400 font-mono">
                            {isCurrent && isPlaying ? 'Active now' : 'Ready'}
                          </span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              const found = BUILT_IN_MIX_PRESETS.find((p) => p.id === presetItem.id);
                              if (found) {
                                if (isCurrent && isPlaying) {
                                  handleTogglePlay();
                                } else {
                                  handleApplyPreset(found, true);
                                }
                              }
                            }}
                            className={`text-xs px-2.5 py-1 rounded-xl font-semibold transition-all flex items-center gap-1 shadow-sm cursor-pointer active:scale-95 ${
                              isCurrent && isPlaying
                                ? 'bg-rose-500 text-white shadow-rose-500/20'
                                : 'bg-slate-800 hover:bg-sky-400 hover:text-slate-950 text-slate-200'
                            }`}
                          >
                            {isCurrent && isPlaying ? (
                              <>
                                <Pause className="w-3 h-3 fill-current" />
                                <span>Pause</span>
                              </>
                            ) : (
                              <>
                                <Play className="w-3 h-3 fill-current text-sky-400 group-hover:text-slate-950" />
                                <span>Play</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                /* Favorites View */
                (() => {
                  const allAvailable = [...BUILT_IN_MIX_PRESETS, ...getCustomPresets()];
                  const favPresets = allAvailable.filter((p) => favoritePresetIds.includes(p.id));

                  if (favPresets.length === 0) {
                    return (
                      <div className="p-6 text-center bg-slate-950/40 border border-slate-800/80 rounded-2xl space-y-2">
                        <Heart className="w-6 h-6 text-slate-500 mx-auto" />
                        <div className="text-xs font-semibold text-slate-300">
                          No Favorite Presets Saved Yet
                        </div>
                        <p className="text-[11px] text-slate-400 max-w-sm mx-auto">
                          Tap the heart icon on any soundscape to bookmark your preferred meditation atmospheres here.
                        </p>
                        <button
                          type="button"
                          onClick={() => setPresetViewTab('featured')}
                          className="mt-1 text-xs text-sky-400 hover:text-sky-300 font-medium cursor-pointer"
                        >
                          View Featured Presets
                        </button>
                      </div>
                    );
                  }

                  return (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                      {favPresets.map((preset) => {
                        const isCurrent = currentPresetId === preset.id;
                        return (
                          <div
                            key={preset.id}
                            onClick={() => {
                              if (isCurrent && isPlaying) {
                                handleTogglePlay();
                              } else {
                                handleApplyPreset(preset, true);
                              }
                            }}
                            className={`p-3 rounded-2xl border text-left transition-all group cursor-pointer relative ${
                              isCurrent
                                ? 'bg-rose-500/15 border-rose-400/80 text-rose-200 shadow-md shadow-rose-950/20'
                                : 'bg-slate-900/60 border-slate-800/80 hover:border-slate-700 hover:bg-slate-800/60 text-slate-300'
                            }`}
                          >
                            <div className="flex items-center justify-between gap-2 mb-1.5">
                              <span className="text-xs font-mono font-medium text-rose-300 flex items-center gap-1">
                                <Heart className="w-3 h-3 fill-rose-500 text-rose-500" />
                                <span>{preset.baseFreq}Hz</span>
                              </span>
                              <button
                                type="button"
                                onClick={(e) => handleToggleFavoritePreset(preset.id, e)}
                                className="p-1 rounded-lg text-rose-400 bg-rose-500/20 border border-rose-500/40 hover:bg-rose-500/30 transition-all active:scale-90 cursor-pointer"
                                title="Remove from favorites"
                                aria-label="Remove preset from favorites"
                              >
                                <Heart className={`w-3 h-3 fill-rose-500 text-rose-500`} />
                              </button>
                            </div>
                            <div className="font-semibold text-xs text-slate-100 group-hover:text-rose-300 transition-colors truncate">
                              {preset.name}
                            </div>
                            <div className="text-[10px] text-slate-400 mt-1 line-clamp-1">
                              {preset.description}
                            </div>

                            <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex items-center justify-between">
                              <span className="text-[10px] text-slate-400 font-mono">
                                {isCurrent && isPlaying ? 'Active now' : 'Ready'}
                              </span>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (isCurrent && isPlaying) {
                                    handleTogglePlay();
                                  } else {
                                    handleApplyPreset(preset, true);
                                  }
                                }}
                                className={`text-xs px-2.5 py-1 rounded-xl font-semibold transition-all flex items-center gap-1 shadow-sm cursor-pointer active:scale-95 ${
                                  isCurrent && isPlaying
                                    ? 'bg-rose-500 text-white shadow-rose-500/20'
                                    : 'bg-slate-800 hover:bg-rose-400 hover:text-slate-950 text-slate-200'
                                }`}
                              >
                                {isCurrent && isPlaying ? (
                                  <>
                                    <Pause className="w-3 h-3 fill-current" />
                                    <span>Pause</span>
                                  </>
                                ) : (
                                  <>
                                    <Play className="w-3 h-3 fill-current text-rose-400 group-hover:text-slate-950" />
                                    <span>Play</span>
                                  </>
                                )}
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })()
              )}

              {/* Active Ambiance Status line */}
              {activeNatureList.length > 0 && (
                <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between text-xs text-slate-400">
                  <span className="flex items-center gap-1.5 truncate">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse transform-gpu will-change-opacity shrink-0" />
                    <strong className="text-slate-300 font-medium">Active Atmosphere:</strong>
                    <span className="text-sky-300 font-mono truncate">{activeNatureList.map((n) => n.name).join(' • ')}</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      natureSounds.forEach((s) => {
                        if (s.enabled) handleNatureSoundChange(s.id, false, s.volume);
                      });
                    }}
                    className="text-[11px] text-slate-400 hover:text-rose-400 transition-colors shrink-0 ml-2 cursor-pointer"
                  >
                    Clear Layers
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* VIEW 2: SOUNDSCAPES & 32 SACRED PRESETS MIXER */}
        {activeTab === 'mixer' && (
          <React.Suspense fallback={null}>
            <NatureMixer
              sounds={natureSounds}
              onSoundChange={handleNatureSoundChange}
              onApplyPreset={(preset) => handleApplyPreset(preset, true)}
              currentPresetId={currentPresetId}
              isVolumeNormalized={isVolumeNormalized}
              onToggleVolumeNormalized={handleToggleVolumeNormalized}
              isPlaying={isPlaying}
              onTogglePlay={handleTogglePlay}
              isLoggedIn={Boolean(currentUser)}
              isAdmin={currentUser?.role === 'admin'}
              onOpenLogin={handleOpenLoginModal}
              onExportWavForPreset={handleExportWavForPreset}
              onOpenShopProduct={handleOpenShopProduct}
              isMusicalMode={isMusicalMode}
              onToggleMusicalMode={handleToggleMusicalMode}
              musicalVolume={musicalVolume}
              onMusicalVolumeChange={handleMusicalVolumeChange}
              baseFreq={baseFreq}
            />
          </React.Suspense>
        )}

        {/* VIEW 3: BREATH PACER */}
        {activeTab === 'breath' && (
          <React.Suspense fallback={<div className="min-h-[300px] flex items-center justify-center p-12 text-slate-500"><div className="w-6 h-6 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" /></div>}>
            <BreathPacer
              initialPattern={recommendedBreathPattern}
              tuningHz={baseFreq}
              onApplyPreset={(preset) => handleApplyPreset(preset, true)}
              activePresetId={currentPresetId}
              isPlaying={isPlaying}
              onTogglePlay={handleTogglePlay}
            />
          </React.Suspense>
        )}

        {/* VIEW 4: MUSICAL SOUND HARP & CHORDS */}
        {activeTab === 'musical' && (
          <React.Suspense fallback={<div className="min-h-[300px] flex items-center justify-center p-12 text-slate-500"><div className="w-6 h-6 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" /></div>}>
            <MusicalPlayground />
          </React.Suspense>
        )}

        {/* VIEW 5: SPIRITUAL SANCTUARY SHOP & SACRED AUDIO GEAR */}
        {activeTab === 'gear' && (
          <React.Suspense fallback={<div className="min-h-[300px] flex items-center justify-center p-12 text-slate-500"><div className="w-6 h-6 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" /></div>}>
            <SpiritualShopSection
              isAdmin={currentUser?.role === 'admin'}
              highlightProductId={shopHighlightProductId}
            />
          </React.Suspense>
        )}

        {/* VIEW 6: RESEARCH & SCIENTIFIC BLOG */}
        {activeTab === 'blog' && (
          <React.Suspense fallback={<div className="min-h-[300px] flex items-center justify-center p-12 text-slate-500"><div className="w-6 h-6 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" /></div>}>
            <BlogSection
              onSelectPreset={(preset) => handleApplyPreset(preset, true)}
              isAdmin={currentUser?.role === 'admin'}
              onOpenAdminLogin={() => setIsAdminLoginModalOpen(true)}
              onNavigateToAdminEditorial={() => setActiveTab('admin')}
            />
          </React.Suspense>
        )}

        {/* VIEW 6: COMMUNITY HUB (GRATITUDE & TESTIMONIAL STORIES) */}
        {activeTab === 'community' && (
          <React.Suspense fallback={<div className="min-h-[300px] flex items-center justify-center p-12 text-slate-500"><div className="w-6 h-6 border-2 border-rose-400 border-t-transparent rounded-full animate-spin" /></div>}>
            <CommunityHub isAdmin={currentUser?.role === 'admin'} />
          </React.Suspense>
        )}

        {/* VIEW 7: CONTACT US & LIVE CHAT CONCIERGE */}
        {activeTab === 'contact' && (
          <React.Suspense fallback={<div className="min-h-[300px] flex items-center justify-center p-12 text-slate-500"><div className="w-6 h-6 border-2 border-sky-400 border-t-transparent rounded-full animate-spin" /></div>}>
            <ContactSection currentUser={currentUser} onApplyPreset={(preset) => handleApplyPreset(preset, true)} />
          </React.Suspense>
        )}

        {/* VIEW 8: ADMIN CONTROL PANEL & REPORTS */}
        {activeTab === 'admin' && (
          <React.Suspense fallback={<div className="min-h-[300px] flex items-center justify-center p-12 text-slate-500"><div className="w-6 h-6 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" /></div>}>
            <AdminDashboard
              currentUser={currentUser}
              onOpenFullscreenPreview={() => setShowAdminPreview(true)}
              onOpenExportAudio={() => setIsExportModalOpen(true)}
              onRefreshUser={async () => {
                const { auth, syncUserProfile } = await import('./services/firebase');
                if (auth.currentUser) {
                  const u = await syncUserProfile(auth.currentUser);
                  setCurrentUser(u);
                }
              }}
            />
          </React.Suspense>
        )}
      </main>

      {/* Right Google AdSense Banner Space */}
      <AdSenseBanner side="right" adSlot="5647382910" />
    </div>

      {/* Modals & Fullscreen Overlays (Code-split with React.Suspense) */}
      <React.Suspense fallback={null}>
        {/* EULA Legal & Medical Disclaimer Modal */}
        <EulaModal
          isOpen={isEulaModalOpen}
          onClose={() => setIsEulaModalOpen(false)}
        />

        {/* Unified Sanctuary Omnisearch Modal (Soundscapes, Acoustic Layers, Products, Science & Blog) */}
        <SanctuarySearchModal
          isOpen={isSearchModalOpen}
          onClose={() => setIsSearchModalOpen(false)}
          activeNatureSounds={natureSounds}
          isPlaying={isPlaying}
          currentPresetId={currentPresetId}
          baseFreq={baseFreq}
          brainwaveMode={brainwaveMode}
          onApplyPreset={(preset) => handleApplyPreset(preset, true)}
          onSelectFrequency={(freq, mode) => {
            setBaseFreq(freq);
            if (mode) setBrainwaveMode(mode);
          }}
          onToggleNatureSound={handleToggleNatureSound}
          onNatureVolumeChange={(id, vol) => handleNatureSoundChange(id, true, vol)}
          onOpenProduct={(productId) => handleOpenShopProduct(productId)}
          onOpenArticle={(_article) => {
            setActiveTab('blog');
            window.scrollTo({ top: 380, behavior: 'smooth' });
          }}
          onOpenSafetyModal={() => setIsSafetyModalOpen(true)}
          onNavigateToTab={(tab) => {
            if (tab === 'gear') {
              setActiveTab('gear');
            } else if (tab === 'blog') {
              setActiveTab('blog');
            } else {
              setActiveTab('player');
            }
          }}
          onTogglePlay={handleTogglePlay}
        />

        {/* Acoustic Safety & Original Frequency Verification Modal */}
        <FrequencySafetyModal
          isOpen={isSafetyModalOpen}
          onClose={() => setIsSafetyModalOpen(false)}
          currentFreq={baseFreq}
        />

        {/* Audio Engine Studio Diagnostics & Regression Test Suite */}
        <AudioRegressionTestSuite
          isOpen={isAudioTestSuiteOpen}
          onClose={() => setIsAudioTestSuiteOpen(false)}
        />

        {/* Sleep Timer Modal */}
        <SleepTimerModal
          isOpen={isTimerModalOpen}
          onClose={() => setIsTimerModalOpen(false)}
          activeSecondsRemaining={timerSecondsRemaining}
          onStartTimer={handleStartTimer}
          onCancelTimer={handleCancelTimer}
        />

        {/* Offline Export Modal (Member-Gated for Logged-In Users & Protected Presets) */}
        {isExportModalOpen && (
          <ErrorBoundary
            fallbackMessage="The offline audio exporter encountered an unexpected condition. Your playback and sanctuary session are unaffected."
            onClose={() => setIsExportModalOpen(false)}
          >
            <React.Suspense fallback={null}>
              <OfflineExportModal
                isOpen={isExportModalOpen}
                onClose={() => setIsExportModalOpen(false)}
                baseFreq={baseFreq || 432}
                brainwaveMode={brainwaveMode}
                brainwaveModeName={currentBrainwave?.name || BRAINWAVE_MODES[brainwaveMode]?.name || 'Alpha Harmonic'}
                activeNatureSounds={Array.isArray(natureSounds) ? natureSounds : []}
                currentUser={currentUser}
                isLoggedIn={Boolean(currentUser) || isAdmin}
                isAdmin={isAdmin}
                isBuiltInPresetActive={isBuiltInPresetActive}
                activePresetName={activePresetName}
                onOpenLogin={() => setIsLoginModalOpen(true)}
                onDuplicateAsCustom={handleDuplicateActivePresetAsCustom}
              />
            </React.Suspense>
          </ErrorBoundary>
        )}

        {/* Social Media Share Modal */}
        <SocialShareModal
          isOpen={isShareModalOpen}
          onClose={() => setIsShareModalOpen(false)}
          baseFreq={baseFreq}
        />

        {/* 1-Click Login & User Profile Modal */}
        <LoginModal
          isOpen={isLoginModalOpen}
          onClose={() => setIsLoginModalOpen(false)}
          currentUser={currentUser}
          onUserChange={setCurrentUser}
          onOpenAdmin={() => {
            setActiveTab('admin');
            if (typeof window !== 'undefined') {
              window.history.pushState(null, '', '/admin');
            }
          }}
          onOpenWelcomeLetter={() => setIsWelcomeLetterModalOpen(true)}
        />

        {/* 2FA Protected Master Admin Login Modal (Moreed) */}
        <AdminLoginModal
          isOpen={isAdminLoginModalOpen}
          onClose={() => setIsAdminLoginModalOpen(false)}
          onSuccess={(adminUser) => {
            if (adminUser) setCurrentUser(adminUser);
            setIsAdminLoginModalOpen(false);
            setShowAdminPreview(false);
            setForceVisitorMode(false);
            setActiveTab('admin');
            if (typeof window !== 'undefined') {
              window.history.pushState(null, '', '/admin');
            }
          }}
        />

        {/* Monthly Sanctuary Bulletin Modal */}
        <MonthlyNewsletterModal
          isOpen={isNewsletterModalOpen}
          onClose={() => setIsNewsletterModalOpen(false)}
          onApplyPreset={(preset) => {
            handleApplyPreset(preset, true);
          }}
          onOpenArticle={() => setActiveTab('blog')}
          onOpenShop={() => setActiveTab('gear')}
        />

        {/* Member Welcome Letter Modal */}
        <WelcomeLetterModal
          isOpen={isWelcomeLetterModalOpen}
          onClose={() => setIsWelcomeLetterModalOpen(false)}
          user={currentUser}
          onStartListening={() => {
            if (!isPlaying) {
              handleTogglePlay();
            }
          }}
        />

        {/* How It Works 3-Step Guided Modal */}
        <HowItWorksModal
          isOpen={isHowItWorksOpen}
          onClose={() => setIsHowItWorksOpen(false)}
          onStartListening={() => {
            setIsHowItWorksOpen(false);
            if (!isPlaying) {
              handleTogglePlay();
            }
          }}
        />

        {/* Comprehensive Trust & Legal Center Modal */}
        <TrustAndLegalModal
          isOpen={isLegalModalOpen}
          onClose={() => setIsLegalModalOpen(false)}
          initialTab={legalInitialTab}
          onNavigateContact={() => {
            setIsLegalModalOpen(false);
            setActiveTab('contact');
          }}
          onOpenCookieSettings={() => setIsCookieSettingsOpen(true)}
        />

        {/* Cookie & Storage Preferences Modal (Code-split) */}
        <CookieSettingsModal
          isOpen={isCookieSettingsOpen}
          onClose={() => setIsCookieSettingsOpen(false)}
          onOpenCookiePolicy={() => openLegalModal('cookies')}
        />

        {/* Post-Session Listening Summary Modal */}
        <SessionSummaryModal
          isOpen={isSummaryModalOpen}
          onClose={() => setIsSummaryModalOpen(false)}
          durationSeconds={sessionListenSeconds}
          baseFreq={baseFreq}
          brainwaveName={currentBrainwave.name}
          activeSoundscapes={activeNatureList.map((n) => n.name)}
          timerCompleted={wasTimerCompleted}
          onOpenGratitude={() => {
            setIsSummaryModalOpen(false);
            setActiveTab('community');
          }}
          onOpenBreathwork={() => {
            setIsSummaryModalOpen(false);
            setActiveTab('breath');
          }}
        />

        {/* Fullscreen Distraction-Free Ambient Sanctuary & Visualizer */}
        <AmbientModeView
          isOpen={isAmbientMode}
          onClose={() => setIsAmbientMode(false)}
          isPlaying={isPlaying}
          onTogglePlay={handleTogglePlay}
          baseFreq={baseFreq}
          onSelectBaseFreq={(freq) => setBaseFreq(freq)}
          brainwaveMode={brainwaveMode}
          onSelectBrainwaveMode={(mode) => setBrainwaveMode(mode)}
          natureSounds={natureSounds}
          onToggleNatureSound={handleToggleNatureSound}
          masterVolume={masterVolume}
          onChangeMasterVolume={setMasterVolume}
          timerSecondsRemaining={timerSecondsRemaining}
          onOpenTimerModal={() => setIsTimerModalOpen(true)}
          isVolumeNormalized={isVolumeNormalized}
          onToggleVolumeNormalized={() => setIsVolumeNormalized(!isVolumeNormalized)}
        />
      </React.Suspense>

      {/* Global Persistent Bottom Audio Player Bar: Appears on all tabs and pages, and on the main page only when scrolled away from visualizer section */}
      {shouldShowBottomPlayer && (
        <GlobalBottomPlayerBar
          isPlaying={isPlaying}
          onTogglePlay={handleTogglePlay}
          baseFreq={baseFreq}
          solfeggioName={solfeggioShortName}
          presetName={currentPreset?.name}
          activeNatureCount={activeNatureList.length}
          masterVolume={masterVolume}
          onVolumeChange={setMasterVolume}
          timerSecondsRemaining={timerSecondsRemaining}
          formatTimer={formatTimerDisplay}
          onOpenTimer={() => setIsTimerModalOpen(true)}
          onNavigateHome={() => {
            setActiveTab('player');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          onOpenAmbient={() => setIsAmbientMode(true)}
          isFadingOut={isFadingOut}
          fadeSecondsRemaining={fadeRemainingSeconds}
          onInstantStop={handleInstantStop}
          onResumeFromFade={handleResumeFromFade}
          isMusicalMode={isMusicalMode}
          onToggleMusicalMode={handleToggleMusicalMode}
          onOpenExportAudio={() => setIsExportModalOpen(true)}
          brainwavePulseDuration={brainwavePulseDuration}
        />
      )}

      {/* Daily Sacred Affirmation */}
      {(siteContent.flags ? siteContent.flags.dailyAffirmation !== false : true) && siteContent.dailyAffirmation && (
        <div className="max-w-3xl mx-auto px-4 py-2.5 mb-2 rounded-2xl bg-indigo-950/20 border border-indigo-900/40 text-center text-xs text-indigo-200/90 italic flex items-center justify-center gap-2 shadow-sm">
          <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0 not-italic" />
          <span>"{siteContent.dailyAffirmation}"</span>
          {currentUser?.role === 'admin' && (
            <button
              type="button"
              onClick={() => setActiveTab('admin')}
              className="ml-2 text-[10px] text-amber-300 hover:text-amber-200 underline not-italic cursor-pointer shrink-0"
              title="Edit Affirmation in Sanctuary CMS"
            >
              [Edit]
            </button>
          )}
        </div>
      )}

      {/* Minimized, Focused & Attractive Sanctuary Footer (Zero-Scroll Responsive Grid) */}
      <footer className={`border-t border-slate-800/80 bg-slate-950/80 backdrop-blur-md transition-all overflow-hidden cv-auto-footer ${shouldShowBottomPlayer ? 'mb-20 sm:mb-24' : ''}`}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-7 space-y-5">
          {/* Top Bar: Brand, Tagline & Sacred Social Community */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-4 border-b border-slate-800/70">
            <div className="flex items-center gap-3 text-center sm:text-left">
              <FlatLogo size={58} showText={false} />
              <div>
                <div className="flex items-center gap-2 justify-center sm:justify-start">
                  <span className="font-bold text-sm sm:text-base text-slate-100 tracking-tight">
                    {siteContent.brandName || 'Aura 432Hz Sanctuary'}
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                    432Hz Solfeggio
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-1">
                  {siteContent.footerTagline || 'Acoustic Soundscapes • Meditation • Breathwork • Deep Rest'}
                </p>
              </div>
            </div>

            {/* Custom Sacred Social Icons */}
            <div className="flex items-center gap-2">
              <SacredSocialLinks
                size={32}
              />
            </div>
          </div>

          {/* 2x2 Mobile / 4-Column Desktop Responsive Footer Navigation Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-6 py-3 text-xs">
            {/* Column 1: Sanctuary Audio */}
            <div className="space-y-2">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-200 font-mono flex items-center gap-1.5 pb-0.5">
                <Wind className="w-3.5 h-3.5 text-sky-400" />
                <span>Sanctuary Audio</span>
              </div>
              <ul className="space-y-1 sm:space-y-1.5 text-slate-300 text-xs">
                <li>
                  <button
                    type="button"
                    onClick={() => setActiveTab('player')}
                    className="w-full text-left py-1.5 sm:py-1 min-h-[36px] sm:min-h-0 text-slate-300 hover:text-white transition-colors duration-150 cursor-pointer flex items-center"
                  >
                    Sanctuary Player
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => setActiveTab('mixer')}
                    className="w-full text-left py-1.5 sm:py-1 min-h-[36px] sm:min-h-0 text-slate-300 hover:text-white transition-colors duration-150 cursor-pointer flex items-center"
                  >
                    Nature Sound Mixer
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => setActiveTab('breath')}
                    className="w-full text-left py-1.5 sm:py-1 min-h-[36px] sm:min-h-0 text-slate-300 hover:text-white transition-colors duration-150 cursor-pointer flex items-center"
                  >
                    4-7-8 Breath Pacer
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => setActiveTab('community')}
                    className="w-full text-left py-1.5 sm:py-1 min-h-[36px] sm:min-h-0 text-slate-300 hover:text-rose-200 transition-colors duration-150 cursor-pointer flex items-center gap-1.5"
                  >
                    <Heart className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                    <span>Sanctuary Community</span>
                  </button>
                </li>
              </ul>
            </div>

            {/* Column 2: Science & Standards */}
            <div className="space-y-2">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-200 font-mono flex items-center gap-1.5 pb-0.5">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                <span>Science &amp; Wisdom</span>
              </div>
              <ul className="space-y-1 sm:space-y-1.5 text-slate-300 text-xs">
                <li>
                  <button
                    type="button"
                    onClick={() => setActiveTab('blog')}
                    className="w-full text-left py-1.5 sm:py-1 min-h-[36px] sm:min-h-0 text-slate-300 hover:text-white transition-colors duration-150 cursor-pointer flex items-center"
                  >
                    Research Articles
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => setIsSafetyModalOpen(true)}
                    className="w-full text-left py-1.5 sm:py-1 min-h-[36px] sm:min-h-0 text-emerald-300 hover:text-emerald-200 transition-colors duration-150 cursor-pointer flex items-center gap-1.5"
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Safe Hz Standards</span>
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => setIsAudioTestSuiteOpen(true)}
                    className="w-full text-left py-1.5 sm:py-1 min-h-[36px] sm:min-h-0 text-amber-300 hover:text-amber-200 transition-colors duration-150 cursor-pointer flex items-center gap-1.5"
                    title="Audio Engine Studio Diagnostics & Regression Suite"
                  >
                    <Activity className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span>Audio Engine Diagnostics</span>
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => openLegalModal('safety')}
                    className="w-full text-left py-1.5 sm:py-1 min-h-[36px] sm:min-h-0 text-slate-300 hover:text-white transition-colors duration-150 cursor-pointer flex items-center"
                  >
                    Listening Guidelines
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => setIsNewsletterModalOpen(true)}
                    className="w-full text-left py-1.5 sm:py-1 min-h-[36px] sm:min-h-0 text-purple-300 hover:text-purple-200 transition-colors duration-150 cursor-pointer flex items-center gap-1.5"
                  >
                    <Mail className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                    <span>Monthly Newsletter</span>
                  </button>
                </li>
              </ul>
            </div>

            {/* Column 3: Gear & Support */}
            <div className="space-y-2">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-200 font-mono flex items-center gap-1.5 pb-0.5">
                <Flame className="w-3.5 h-3.5 text-amber-400" />
                <span>Gear &amp; Support</span>
              </div>
              <ul className="space-y-1 sm:space-y-1.5 text-slate-300 text-xs">
                <li>
                  <button
                    type="button"
                    onClick={() => setActiveTab('gear')}
                    className="w-full text-left py-1.5 sm:py-1 min-h-[36px] sm:min-h-0 text-slate-300 hover:text-amber-200 transition-colors duration-150 cursor-pointer flex items-center gap-1.5"
                  >
                    <span>Aura Shop</span>
                    <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/40 uppercase font-bold">
                      Soon
                    </span>
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => setActiveTab('contact')}
                    className="w-full text-left py-1.5 sm:py-1 min-h-[36px] sm:min-h-0 text-slate-300 hover:text-sky-200 transition-colors duration-150 cursor-pointer flex items-center gap-1.5"
                  >
                    <Bot className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                    <span>Live Concierge Chat</span>
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => openLegalModal('about')}
                    className="w-full text-left py-1.5 sm:py-1 min-h-[36px] sm:min-h-0 text-slate-300 hover:text-white transition-colors duration-150 cursor-pointer flex items-center"
                  >
                    About Aura Sanctuary
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => setIsNewsletterModalOpen(true)}
                    className="w-full text-left py-1.5 sm:py-1 min-h-[36px] sm:min-h-0 text-slate-300 hover:text-white transition-colors duration-150 cursor-pointer flex items-center"
                  >
                    Subscriber Perks
                  </button>
                </li>
              </ul>
            </div>

            {/* Column 4: Trust & Compliance */}
            <div className="space-y-2">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-200 font-mono flex items-center gap-1.5 pb-0.5">
                <Scale className="w-3.5 h-3.5 text-emerald-400" />
                <span>Trust &amp; Legal</span>
              </div>
              <ul className="space-y-1 sm:space-y-1.5 text-slate-300 text-xs">
                <li>
                  <button
                    type="button"
                    onClick={() => openLegalModal('privacy')}
                    className="w-full text-left py-1.5 sm:py-1 min-h-[36px] sm:min-h-0 text-slate-300 hover:text-white transition-colors duration-150 cursor-pointer flex items-center"
                  >
                    Privacy Policy
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => openLegalModal('terms')}
                    className="w-full text-left py-1.5 sm:py-1 min-h-[36px] sm:min-h-0 text-slate-300 hover:text-white transition-colors duration-150 cursor-pointer flex items-center"
                  >
                    Terms &amp; EULA
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => openLegalModal('cookies')}
                    className="w-full text-left py-1.5 sm:py-1 min-h-[36px] sm:min-h-0 text-slate-300 hover:text-white transition-colors duration-150 cursor-pointer flex items-center"
                  >
                    Cookie Policy
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => openLegalModal('affiliate')}
                    className="w-full text-left py-1.5 sm:py-1 min-h-[36px] sm:min-h-0 text-slate-300 hover:text-white transition-colors duration-150 cursor-pointer flex items-center"
                  >
                    Affiliate Disclosure
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => setIsCookieSettingsOpen(true)}
                    className="w-full text-left py-1.5 sm:py-1 min-h-[36px] sm:min-h-0 text-slate-300 hover:text-amber-200 transition-colors duration-150 cursor-pointer flex items-center gap-1.5"
                  >
                    <Cookie className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span>Cookie Settings</span>
                  </button>
                </li>
                {currentUser?.role === 'admin' && (
                  <li>
                    <button
                      type="button"
                      onClick={() => setActiveTab('admin')}
                      className="w-full text-left py-1.5 sm:py-1 min-h-[36px] sm:min-h-0 text-sky-400 hover:text-sky-300 font-semibold transition-colors duration-150 cursor-pointer flex items-center"
                      title="Studio Control Center & Editorial CMS"
                    >
                      Studio CMS
                    </button>
                  </li>
                )}
              </ul>
            </div>
          </div>

          {/* Bottom Bar: Softly Framed Wellness Notice & Compliance Card */}
          <div className="rounded-xl bg-slate-900/60 border border-slate-800/80 p-3.5 sm:p-4 text-center space-y-2 backdrop-blur-xs">
            <p className="text-[11px] sm:text-xs text-slate-300 leading-relaxed max-w-2xl mx-auto">
              <strong className="text-emerald-400 font-medium">Wellness Notice:</strong> Ambient acoustic soundscapes and breathwork for relaxation, meditation, and well-being. Not intended to diagnose, treat, or replace medical care. Calibrated to WHO safe listening volume.
            </p>
            <div className="text-[10px] sm:text-[11px] text-slate-400 font-mono flex flex-wrap items-center justify-center gap-x-2 gap-y-1">
              <span>&copy; {new Date().getFullYear()} Aura 432Hz Sanctuary</span>
              <span>&bull;</span>
              <span>Real-time Web Audio API</span>
              <span>&bull;</span>
              <span>0.00 MHz RF</span>
              <span>&bull;</span>
              <span>Verdi Diapason Normale</span>
            </div>
          </div>
        </div>
      </footer>

      {/* Floating Cookie Consent Banner (Appears floating at end of web page with Accept, Decline, and Settings) */}
      <CookieConsentBanner
        onOpenSettings={() => setIsCookieSettingsOpen(true)}
        onOpenCookiePolicy={() => openLegalModal('cookies')}
        isBottomPlayerVisible={shouldShowBottomPlayer}
      />

      {/* Floating Re-Open Cookie Preferences Button */}
      <FloatingCookieButton
        onClick={() => setIsCookieSettingsOpen(true)}
        isBottomPlayerVisible={shouldShowBottomPlayer}
      />
    </div>
  );
}
