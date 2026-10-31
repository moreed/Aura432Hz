import React, { useState, useEffect } from 'react';
import {
  Scale,
  Shield,
  FileText,
  Lock,
  Cookie,
  DollarSign,
  Headphones,
  Info,
  X,
  Printer,
  CheckCircle2,
  ExternalLink,
  Mail,
  AlertTriangle,
} from 'lucide-react';
import { MONETIZATION_CONFIG } from '../config/monetization';

export type LegalTabType =
  | 'about'
  | 'privacy'
  | 'cookies'
  | 'terms'
  | 'affiliate'
  | 'safety';

interface TrustAndLegalModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: LegalTabType;
  onNavigateContact?: () => void;
  onOpenCookieSettings?: () => void;
}

export const TrustAndLegalModal: React.FC<TrustAndLegalModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'terms',
  onNavigateContact,
  onOpenCookieSettings,
}) => {
  const [activeTab, setActiveTab] = useState<LegalTabType>(initialTab);

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab, isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const navItems: { id: LegalTabType; label: string; icon: React.FC<{ className?: string }> }[] = [
    { id: 'about', label: 'About Us', icon: Info },
    { id: 'safety', label: 'Safety & Listening', icon: Headphones },
    { id: 'affiliate', label: 'Affiliate Disclosure', icon: DollarSign },
    { id: 'terms', label: 'Terms of Service', icon: Scale },
    { id: 'privacy', label: 'Privacy Policy', icon: Lock },
    { id: 'cookies', label: 'Cookie Policy', icon: Cookie },
  ];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="legal-modal-title"
      className="fixed inset-0 z-[90] flex items-center justify-center p-2.5 sm:p-5 bg-slate-950/85 backdrop-blur-md overflow-y-auto overscroll-contain animate-in fade-in duration-200"
    >
      <div className="bg-slate-900 border border-slate-800 rounded-2xl sm:rounded-3xl max-w-4xl w-full max-h-[92dvh] landscape:max-h-[94dvh] flex flex-col shadow-2xl overflow-hidden print-clean-container my-auto">
        {/* Modal Top Header */}
        <div className="p-3.5 sm:p-5 landscape:py-2.5 landscape:px-4 border-b border-slate-800 flex items-center justify-between gap-3 bg-gradient-to-r from-slate-900 via-slate-850 to-indigo-950/30 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-sky-500/10 border border-sky-500/30 text-sky-400">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h2 id="legal-modal-title" className="text-base sm:text-lg font-bold text-slate-100 flex items-center gap-2">
                <span>Trust, Safety &amp; Legal Center</span>
                <span className="text-[10px] font-mono text-slate-400 font-normal">v2026.1</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Transparency, listening guidelines, privacy standards, and affiliate policies.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 transition-colors flex items-center gap-1.5 text-xs font-semibold cursor-pointer shadow-sm no-print"
              title="Print Full Policy Document (Clean High-Contrast Print)"
              aria-label="Print Policy Document"
            >
              <Printer className="w-4 h-4 text-sky-400" />
              <span>Print Document</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer no-print"
              title="Close Dialog (Esc)"
              aria-label="Close Dialog"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Global Wellness Notice Banner */}
        <div className="bg-amber-500/10 border-b border-amber-500/20 px-5 py-2.5 flex items-center gap-2 text-xs text-amber-300">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
          <span className="leading-tight">
            <strong>Wellness Disclaimer:</strong> For relaxation and personal listening only; not medical advice, treatment, or therapy.
          </span>
        </div>

        {/* Tab Navigation Pill Bar (Responsive Grid - No Horizontal Scroll) */}
        <div className="border-b border-slate-800/80 bg-slate-950/50 px-2 sm:px-4 py-2 grid grid-cols-3 sm:grid-cols-6 gap-1 sm:gap-1.5 no-print">
          {navItems.map((tab) => {
            const Icon = tab.icon;
            const isSelected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-2 py-1.5 rounded-xl text-[10.5px] sm:text-xs font-medium flex items-center justify-center gap-1 sm:gap-1.5 transition-all text-center cursor-pointer ${
                  isSelected
                    ? 'bg-sky-500 text-slate-950 font-bold shadow-md shadow-sky-500/20'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <Icon className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-7 space-y-5 text-xs text-slate-300 leading-relaxed">
          {/* TAB: ABOUT US */}
          {activeTab === 'about' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="border-b border-slate-800 pb-3">
                <h3 className="text-base font-bold text-slate-100">About Aura 432Hz Sanctuary</h3>
                <p className="text-slate-400 text-xs mt-1">
                  Our mission: creating serene, distraction-free ambient audio for mindful focus and restful sleep.
                </p>
              </div>

              <div className="space-y-3">
                <p>
                  Aura 432Hz was created to give listeners an immediate, friction-free sonic sanctuary. We believe that audio for relaxation should be pure, beautifully crafted, and accessible without forced paywalls, interruptive pop-ups, or invasive tracking.
                </p>

                <h4 className="font-semibold text-slate-200 text-sm mt-3">Our Core Principles</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800">
                    <div className="font-semibold text-sky-400 mb-1">1. Frictionless Guest Access</div>
                    <p className="text-[11px] text-slate-400">
                      You can start listening in one click. No account, credit card, or email address is required to experience our full sound library.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800">
                    <div className="font-semibold text-emerald-400 mb-1">2. Procedural &amp; Offline-Ready</div>
                    <p className="text-[11px] text-slate-400">
                      Our audio engine runs directly in your browser using the modern Web Audio API. It operates 100% offline without streaming gigabytes of repetitive audio files.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800">
                    <div className="font-semibold text-purple-400 mb-1">3. Non-Medical Framing</div>
                    <p className="text-[11px] text-slate-400">
                      We treat 432Hz and Solfeggio frequencies as aesthetic and historical acoustic preferences, avoiding pseudoscientific promises or medical cure claims.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800">
                    <div className="font-semibold text-amber-400 mb-1">4. Transparent Monetization</div>
                    <p className="text-[11px] text-slate-400">
                      We monetize strictly through honest equipment recommendations and non-intrusive editorial advertising. Audio playback is never interrupted by commercial audio ads.
                    </p>
                  </div>
                </div>

                <div className="pt-2">
                  <p className="text-slate-400">
                    Have questions, suggestions, or want to contribute? Contact our team anytime at{' '}
                    <span className="text-sky-300 font-mono">concierge@aura432.app</span> or via the in-app Concierge tab.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB: SAFETY & LISTENING */}
          {activeTab === 'safety' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="border-b border-slate-800 pb-3">
                <h3 className="text-base font-bold text-slate-100">Safety &amp; Safe Listening Guidelines</h3>
                <p className="text-slate-400 text-xs mt-1">
                  Responsible listening practices, volume recommendations, and contraindications.
                </p>
              </div>

              <div className="space-y-3">
                <div className="p-4 rounded-2xl bg-slate-950/70 border border-amber-500/30 text-amber-200">
                  <div className="font-bold flex items-center gap-1.5 text-amber-300 mb-1">
                    <AlertTriangle className="w-4 h-4" /> Important Safety Contraindications
                  </div>
                  <ul className="list-disc pl-5 space-y-1 text-[11px] text-slate-300">
                    <li>
                      <strong>Do not listen while driving or operating machinery:</strong> Low-frequency rhythmic tones (Delta and Theta binaural beats) encourage deep relaxation, mental calm, and drowsiness.
                    </li>
                    <li>
                      <strong>Epilepsy and Auditory Seizures:</strong> If you have photosensitive or auditory epilepsy, consult your physician before using repetitive rhythmic pulsation or visualizers.
                    </li>
                    <li>
                      <strong>Non-Medical Scope:</strong> Sound sessions are designed solely to support a calm environment. They are never a substitute for professional medical or psychiatric care.
                    </li>
                  </ul>
                </div>

                <h4 className="font-semibold text-slate-200 text-sm mt-3">World Health Organization (WHO) Volume Guidance</h4>
                <p>
                  Sustained exposure to sound levels above 85 dBA can cause hearing strain over time. We strongly recommend listening at moderate, comfortable volumes (typically <strong>40% to 60%</strong> on your device slider).
                </p>
                <p>
                  Our built-in <strong>Volume Normalization (EBU R128)</strong> balances loudness across all procedural nature sounds, preventing sudden audio spikes when mixing rain, chimes, or singing bowls.
                </p>

                <h4 className="font-semibold text-slate-200 text-sm mt-3">Pure Acoustic Synthesis</h4>
                <p>
                  All sound waves generated by Aura 432Hz are pure acoustic vibrations produced by software oscillators in your audio hardware. They do not emit radio frequencies (0.00 MHz RF), electromagnetic radiation, or harmful harmonics.
                </p>
              </div>
            </div>
          )}

          {/* TAB: AFFILIATE DISCLOSURE */}
          {activeTab === 'affiliate' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="border-b border-slate-800 pb-3">
                <h3 className="text-base font-bold text-slate-100">Affiliate Disclosure &amp; Commercial Ethics</h3>
                <p className="text-slate-400 text-xs mt-1">
                  Full compliance with Federal Trade Commission (FTC) guidelines and Google Publisher policies.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-indigo-950/40 border border-indigo-500/30 space-y-2">
                <div className="font-bold text-indigo-300 text-sm">Our Plain-Language Commitment</div>
                <p className="text-slate-200 leading-relaxed">
                  {MONETIZATION_CONFIG.affiliateDisclosure.standard}
                </p>
              </div>

              <div className="space-y-2.5">
                <h4 className="font-semibold text-slate-200 text-sm">How We Select and Review Gear</h4>
                <p>
                  Our gear guides (covering headphones, earbuds, small speakers, DACs, singing bowls, and meditation accessories) are researched and tested for acoustic clarity, build quality, comfort during extended listening, and natural frequency response.
                </p>
                <ul className="list-disc pl-5 space-y-1 text-slate-400">
                  <li>We never accept payment or incentives to give a positive product rating.</li>
                  <li>We highlight both <strong>strengths</strong> and <strong>limitations</strong> for every item so you can make an informed choice.</li>
                  <li>Outbound retailer links use strict <code className="text-sky-300 font-mono">rel=&quot;sponsored noopener noreferrer&quot;</code> attributes to ensure search engine transparency.</li>
                  <li>We link to multiple retailers where available to help you find the best availability and pricing.</li>
                </ul>

                <h4 className="font-semibold text-slate-200 text-sm mt-3">Amazon Associates Disclosure</h4>
                <p>
                  Aura 432Hz is a participant in the Amazon Services LLC Associates Program, an affiliate advertising program designed to provide a means for sites to earn advertising fees by advertising and linking to Amazon.com.
                </p>
              </div>
            </div>
          )}

          {/* TAB: TERMS OF SERVICE */}
          {activeTab === 'terms' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="border-b border-slate-800 pb-3">
                <h3 className="text-base font-bold text-slate-100">Terms of Service &amp; EULA</h3>
                <p className="text-slate-400 text-xs mt-1">
                  Version 2026.1 • Effective Date: October 2026
                </p>
              </div>

              <div className="space-y-3">
                <p>
                  By accessing or using Aura 432Hz Ambient Sound &amp; Meditation Sanctuary (&quot;the Service&quot;), you agree to be bound by these Terms of Service. If you disagree with any part of these terms, please discontinue use.
                </p>

                <h4 className="font-semibold text-slate-200 text-sm">1. Permitted Personal Use</h4>
                <p>
                  We grant you a personal, non-exclusive, non-transferable, revocable license to generate, listen to, and download procedural soundscapes for personal, non-commercial meditation, sleep, focus, or relaxation.
                </p>

                <h4 className="font-semibold text-slate-200 text-sm">2. Commercial Restrictions</h4>
                <p>
                  You may not extract, repackage, distribute, or sell audio files generated by our procedural synthesizer as standalone stock audio, sound effects libraries, or NFTs without express written authorization.
                </p>

                <h4 className="font-semibold text-slate-200 text-sm">3. Disclaimer of Warranties</h4>
                <p>
                  The Service is provided on an &quot;AS IS&quot; and &quot;AS AVAILABLE&quot; basis without warranties of any kind. We do not guarantee that playback will be completely uninterrupted or error-free on all browsers or hardware configurations.
                </p>

                <h4 className="font-semibold text-slate-200 text-sm">4. Limitation of Liability</h4>
                <p>
                  In no event shall Aura 432Hz, its operators, or affiliates be liable for any indirect, incidental, or consequential damages arising from your use of or inability to use the audio application.
                </p>
              </div>
            </div>
          )}

          {/* TAB: PRIVACY POLICY */}
          {activeTab === 'privacy' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="border-b border-slate-800 pb-3">
                <h3 className="text-base font-bold text-slate-100">Privacy Policy</h3>
                <p className="text-slate-400 text-xs mt-1">
                  Local-first, privacy-respecting audio experience.
                </p>
              </div>

              <div className="space-y-3">
                <p>
                  At Aura 432Hz, your privacy is fundamental. We do not require an account to enjoy full audio features, and we never collect sensitive biometric or health information.
                </p>

                <h4 className="font-semibold text-slate-200 text-sm">Information We Process</h4>
                <ul className="list-disc pl-5 space-y-1 text-slate-400">
                  <li>
                    <strong>Local Settings:</strong> Your volume sliders, chosen frequencies, timer preferences, and custom nature sound mixes are stored directly in your browser&apos;s LocalStorage.
                  </li>
                  <li>
                    <strong>Optional User Accounts:</strong> If you choose to log in (via Google Firebase Auth), we store your user ID, display name, and saved sound presets in secure cloud storage solely to synchronize your soundscapes across devices.
                  </li>
                  <li>
                    <strong>Functional Telemetry:</strong> Aggregated, non-personal interface events (such as session duration or button taps) may be logged to improve app performance and stability.
                  </li>
                </ul>

                <h4 className="font-semibold text-slate-200 text-sm mt-3">We Do Not Sell Your Data</h4>
                <p>
                  We never sell, rent, or trade your personal data or listening habits to data brokers or third-party advertisers.
                </p>

                <h4 className="font-semibold text-slate-200 text-sm mt-3">Data Deletion Rights</h4>
                <p>
                  You can clear your local audio presets at any time by clearing your browser site data or clicking &quot;Reset to Defaults&quot; in the nature mixer. To request deletion of a cloud account, email{' '}
                  <span className="text-sky-300 font-mono">privacy@aura432.app</span>.
                </p>
              </div>
            </div>
          )}

          {/* TAB: COOKIE POLICY */}
          {activeTab === 'cookies' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="border-b border-slate-800 pb-3">
                <h3 className="text-base font-bold text-slate-100">Cookie &amp; Storage Policy</h3>
                <p className="text-slate-400 text-xs mt-1">
                  How we use cookies and browser storage.
                </p>
              </div>

              <div className="space-y-3">
                <p>
                  Aura 432Hz uses cookies and browser LocalStorage primarily to ensure essential app functionality, persist your audio settings, and remember your interface preferences between visits.
                </p>

                <h4 className="font-semibold text-slate-200 text-sm">Categories of Cookies We Use</h4>
                <div className="space-y-2">
                  <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                    <span className="font-semibold text-sky-400">1. Essential Local Storage:</span>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Saves your audio volume, selected frequency, active nature layers, and dark mode display settings. These are necessary for the application to function.
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                    <span className="font-semibold text-indigo-400">2. Authentication Cookies (Optional):</span>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Used only if you log in to sync custom soundscape presets across devices via Firebase Auth.
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                    <span className="font-semibold text-amber-400">3. Partner Referral Attribution:</span>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      When clicking an external retailer link (e.g., Amazon), the retailer may place a standard affiliate tracking cookie on their domain to credit Aura 432Hz with referral fees.
                    </p>
                  </div>
                </div>

                <p className="text-slate-400 text-xs pt-2">
                  You can control or disable cookies through your browser settings. Essential audio playback will remain operational even with third-party cookies disabled.
                </p>

                {onOpenCookieSettings && (
                  <div className="pt-3">
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onOpenCookieSettings();
                      }}
                      className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-sky-400 hover:text-sky-300 border border-slate-700 font-medium text-xs transition-colors flex items-center gap-2 cursor-pointer shadow-sm"
                    >
                      <Cookie className="w-4 h-4 text-amber-400" />
                      <span>Manage Cookie &amp; Storage Preferences</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 border-t border-slate-800 bg-slate-900/90 flex flex-col sm:flex-row items-center justify-between gap-3 no-print">
          <div className="text-[11px] text-slate-400 text-center sm:text-left flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>All policies compliant with FTC &amp; Google Publisher Guidelines</span>
          </div>

          <div className="flex items-center gap-2">
            {onNavigateContact && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onNavigateContact();
                }}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs font-semibold rounded-xl transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <Mail className="w-3.5 h-3.5" />
                <span>Contact Concierge</span>
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs rounded-xl transition-all shadow-md shadow-sky-500/20 cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
