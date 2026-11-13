import React, { useState } from 'react';
import {
  FileText,
  Shield,
  AlertTriangle,
  CheckCircle2,
  Download,
  Printer,
  ChevronDown,
  ChevronUp,
  X,
  ExternalLink,
  HeartHandshake,
  Lock,
  Headphones,
  Scale,
} from 'lucide-react';

interface EulaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAccept?: () => void;
}

export const EulaModal: React.FC<EulaModalProps> = ({ isOpen, onClose, onAccept }) => {
  const [activeSection, setActiveSection] = useState<string | null>('license');
  const [hasAccepted, setHasAccepted] = useState<boolean>(() => {
    return localStorage.getItem('aura_eula_accepted') === 'true';
  });

  if (!isOpen) return null;

  const handleAccept = () => {
    localStorage.setItem('aura_eula_accepted', 'true');
    setHasAccepted(true);
    if (onAccept) onAccept();
  };

  const handlePrint = () => {
    window.print();
  };

  const toggleSection = (id: string) => {
    setActiveSection(activeSection === id ? null : id);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="eula-modal-title"
      className="fixed inset-0 z-[80] flex items-center justify-center p-2.5 sm:p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto overscroll-contain animate-in fade-in duration-200"
    >
      <div className="bg-slate-900 border border-slate-800 rounded-2xl sm:rounded-3xl max-w-3xl w-full max-h-[92dvh] landscape:max-h-[94dvh] flex flex-col shadow-2xl overflow-hidden print-clean-container my-auto">
        {/* Header */}
        <div className="p-4 sm:p-6 landscape:py-2.5 landscape:px-4 border-b border-slate-800/80 flex items-center justify-between gap-3 sm:gap-4 bg-gradient-to-r from-slate-900 via-slate-850 to-indigo-950/20 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 id="eula-modal-title" className="text-base sm:text-lg font-semibold text-slate-100">
                  End User License Agreement (EULA)
                </h3>
                {hasAccepted && (
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Accepted
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Terms of Service, Health Disclaimer & Audio Intellectual Property Rights • Version 2.4
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handlePrint}
              className="min-h-[36px] px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 transition-colors inline-flex items-center justify-center gap-1.5 whitespace-nowrap text-xs font-semibold cursor-pointer shadow-sm no-print"
              title="Print EULA Document"
              aria-label="Print EULA Document"
            >
              <Printer className="w-4 h-4 text-sky-400" />
              <span className="hidden sm:inline">Print EULA</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-400 hover:text-slate-200 inline-flex items-center justify-center shrink-0 transition-colors cursor-pointer no-print"
              title="Close Dialog"
              aria-label="Close Dialog"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Notice Banner */}
        <div className="bg-amber-500/10 border-b border-amber-500/20 p-3.5 px-6 flex items-start gap-2.5 text-xs text-amber-300">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-amber-400" />
          <div>
            <strong>Medical & Safety Disclaimer:</strong> Aura 432Hz Sanctuary produces acoustic frequencies, binaural beats, and brainwave entrainment designed solely for relaxation, mindfulness, and meditation. It is NOT intended to diagnose, treat, cure, or prevent any medical or psychiatric condition.
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4 text-xs text-slate-300 leading-relaxed scrollbar-thin scrollbar-thumb-slate-700">
          {/* Section 1: Acceptance & Overview */}
          <div className="border border-slate-800 rounded-2xl overflow-hidden bg-slate-900/60 print-avoid-break">
            <button
              type="button"
              onClick={() => toggleSection('overview')}
              className="w-full p-4 flex items-center justify-between text-left font-semibold text-slate-200 hover:bg-slate-800/50 transition-colors cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-sky-400" />
                1. Acceptance of Terms & Overview
              </span>
              <span className="no-print">
                {activeSection === 'overview' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </span>
            </button>
            <div className={`${activeSection === 'overview' ? 'block' : 'hidden print:block'} p-4 pt-1 border-t border-slate-800 text-slate-400 space-y-2`}>
              <p>
                By accessing, generating audio with, downloading, or using Aura 432Hz Ambient Sound &amp; Meditation Sanctuary (&quot;the Application&quot;), you acknowledge that you have read, understood, and agreed to be bound by this End User License Agreement (&quot;EULA&quot;).
              </p>
              <p>
                If you do not agree to the terms of this EULA, do not access or use the Application. This EULA applies to all visitors, registered accounts, offline users, and administrators.
              </p>
            </div>
          </div>

          {/* Section 2: Medical Disclaimer & Sound Therapy Safety */}
          <div className="border border-slate-800 rounded-2xl overflow-hidden bg-slate-900/60 print-avoid-break">
            <button
              type="button"
              onClick={() => toggleSection('health')}
              className="w-full p-4 flex items-center justify-between text-left font-semibold text-slate-200 hover:bg-slate-800/50 transition-colors cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-amber-400" />
                2. Health, Neurological & Audio Safety Advisory
              </span>
              <span className="no-print">
                {activeSection === 'health' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </span>
            </button>
            <div className={`${activeSection === 'health' ? 'block' : 'hidden print:block'} p-4 pt-1 border-t border-slate-800 text-slate-400 space-y-2.5`}>
              <p className="text-slate-300 font-medium">
                Please observe the following critical health and safety guidelines when listening to brainwave entrainment frequencies:
              </p>
              <ul className="list-disc pl-5 space-y-1.5">
                <li>
                  <strong>Never use while driving or operating heavy machinery:</strong> Binaural beats in Alpha (8–12Hz), Theta (4–7Hz), and Delta (0.5–4Hz) induce deep altered states of consciousness, relaxation, and drowsiness.
                </li>
                <li>
                  <strong>Epilepsy and Seizure Disorders:</strong> Individuals diagnosed with photosensitive or auditory epilepsy or history of seizures should consult a licensed physician before engaging with repetitive acoustic pulsation.
                </li>
                <li>
                  <strong>Safe Listening Volume:</strong> Extended exposure to loud audio above 85 dB can cause permanent hearing damage. Use our built-in EBU R128 Volume Normalization and keep device levels comfortable.
                </li>
                <li>
                  <strong>Pacemakers & Medical Implants:</strong> Sound frequencies from speakers do not interfere with standard pacemakers, but users with implanted cardiac defibrillators should maintain standard precautions around high-power magnets.
                </li>
              </ul>
            </div>
          </div>

          {/* Section 3: Audio Generation, Procedural Synthesis & IP Rights */}
          <div className="border border-slate-800 rounded-2xl overflow-hidden bg-slate-900/60 print-avoid-break">
            <button
              type="button"
              onClick={() => toggleSection('license')}
              className="w-full p-4 flex items-center justify-between text-left font-semibold text-slate-200 hover:bg-slate-800/50 transition-colors cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <Headphones className="w-4 h-4 text-emerald-400" />
                3. Intellectual Property, Synthesized Audio & Personal Use License
              </span>
              <span className="no-print">
                {activeSection === 'license' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </span>
            </button>
            <div className={`${activeSection === 'license' ? 'block' : 'hidden print:block'} p-4 pt-1 border-t border-slate-800 text-slate-400 space-y-2`}>
              <p>
                <strong>Personal Non-Commercial License:</strong> We grant you a worldwide, non-exclusive, revocable, non-transferable license to generate, stream, and save procedural acoustic compositions for personal meditation, yoga, sleep, study, and wellness therapy.
              </p>
              <p>
                <strong>Offline Audio Export:</strong> Any audio files saved or exported through the Application to your device storage are licensed for your personal offline playback. You may not repackage, re-license, or sell procedural soundscapes as standalone commercial stock music without prior written authorization.
              </p>
              <p>
                <strong>Proprietary Technology:</strong> The underlying procedural synthesis algorithms, mathematical binaural beat calculations, visual sacred geometry shaders, and UI design are proprietary assets of Aura 432Hz Sanctuary.
              </p>
            </div>
          </div>

          {/* Section 4: User Accounts, Privacy & Cloud Storage */}
          <div className="border border-slate-800 rounded-2xl overflow-hidden bg-slate-900/60 print-avoid-break">
            <button
              type="button"
              onClick={() => toggleSection('privacy')}
              className="w-full p-4 flex items-center justify-between text-left font-semibold text-slate-200 hover:bg-slate-800/50 transition-colors cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-indigo-400" />
                4. User Accounts, Privacy & Data Storage
              </span>
              <span className="no-print">
                {activeSection === 'privacy' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </span>
            </button>
            <div className={`${activeSection === 'privacy' ? 'block' : 'hidden print:block'} p-4 pt-1 border-t border-slate-800 text-slate-400 space-y-2`}>
              <p>
                <strong>No Selling of Personal Data:</strong> We do not sell, rent, or monetize your personal information or meditation habits to third parties.
              </p>
              <p>
                <strong>Local-First Guarantee:</strong> Your sound mixes, offline tracks, and breathing preferences are stored primarily in your browser&apos;s IndexedDB and LocalStorage. Cloud authentication and sync (powered by Google Firebase) are optional and secured with role-based access control.
              </p>
              <p>
                <strong>Community Submissions:</strong> Any gratitude notes or community testimonials you submit to the public wall are shared with the sanctuary community anonymously or under your chosen display name.
              </p>
            </div>
          </div>

          {/* Section 5: Limitation of Liability & Governing Law */}
          <div className="border border-slate-800 rounded-2xl overflow-hidden bg-slate-900/60 print-avoid-break">
            <button
              type="button"
              onClick={() => toggleSection('liability')}
              className="w-full p-4 flex items-center justify-between text-left font-semibold text-slate-200 hover:bg-slate-800/50 transition-colors cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <HeartHandshake className="w-4 h-4 text-purple-400" />
                5. Limitation of Liability & Warranty Disclaimer
              </span>
              <span className="no-print">
                {activeSection === 'liability' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </span>
            </button>
            <div className={`${activeSection === 'liability' ? 'block' : 'hidden print:block'} p-4 pt-1 border-t border-slate-800 text-slate-400 space-y-2`}>
              <p>
                THE APPLICATION IS PROVIDED &quot;AS IS&quot; AND &quot;AS AVAILABLE&quot; WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED. TO THE FULLEST EXTENT PERMISSIBLE BY APPLICABLE LAW, AURA 432HZ DISCLAIMS ALL WARRANTIES INCLUDING MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.
              </p>
              <p>
                IN NO EVENT SHALL AURA 432HZ, ITS CREATORS, OR CONTRIBUTORS BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, OR CONSEQUENTIAL DAMAGES ARISING FROM YOUR LISTENING SESSIONS OR DEPENDENCE ON ACOUSTIC FREQUENCIES.
              </p>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 border-t border-slate-800 bg-slate-900/90 flex flex-col sm:flex-row items-center justify-between gap-3 no-print">
          <div className="text-[11px] text-slate-400 text-center sm:text-left">
            Last Updated: September 2026 • Valid for all 32 Solfeggio presets & offline sessions.
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium rounded-xl transition-colors"
            >
              Close
            </button>
            {!hasAccepted && (
              <button
                type="button"
                onClick={handleAccept}
                className="px-5 py-2 bg-sky-500 hover:bg-sky-400 text-slate-950 text-xs font-semibold rounded-xl transition-colors shadow-lg shadow-sky-500/20 flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                Accept Terms & EULA
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
