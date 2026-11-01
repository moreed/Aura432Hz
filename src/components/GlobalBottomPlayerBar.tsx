import React from 'react';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Timer,
  Headphones,
  Sparkles,
  Maximize2,
  Sliders,
  Music,
  Download,
} from 'lucide-react';
import { FlatLogo } from './FlatLogo';

interface GlobalBottomPlayerBarProps {
  isPlaying: boolean;
  onTogglePlay: () => void;
  baseFreq: number;
  solfeggioName: string;
  presetName?: string;
  activeNatureCount: number;
  masterVolume: number;
  onVolumeChange: (vol: number) => void;
  timerSecondsRemaining: number | null;
  formatTimer: (seconds: number) => string;
  onOpenTimer: () => void;
  onNavigateHome: () => void;
  onOpenAmbient: () => void;
  isFadingOut?: boolean;
  fadeSecondsRemaining?: number;
  onInstantStop?: () => void;
  onResumeFromFade?: () => void;
  isMusicalMode?: boolean;
  onToggleMusicalMode?: () => void;
  onOpenExportAudio?: () => void;
  onOpenExportModal?: () => void;
  brainwavePulseDuration?: number;
}

export const GlobalBottomPlayerBar: React.FC<GlobalBottomPlayerBarProps> = ({
  isPlaying,
  onTogglePlay,
  baseFreq,
  solfeggioName,
  presetName,
  activeNatureCount,
  masterVolume,
  onVolumeChange,
  timerSecondsRemaining,
  formatTimer,
  onOpenTimer,
  onNavigateHome,
  onOpenAmbient,
  isFadingOut = false,
  fadeSecondsRemaining = 0,
  onInstantStop,
  onResumeFromFade,
  isMusicalMode = false,
  onToggleMusicalMode,
  onOpenExportAudio,
  onOpenExportModal,
  brainwavePulseDuration = 5.5,
}) => {
  const handleOpenExport = onOpenExportModal || onOpenExportAudio;
  const isMuted = masterVolume === 0;
  const lastNonZeroVolumeRef = React.useRef<number>(0.6);

  React.useEffect(() => {
    if (masterVolume > 0) {
      lastNonZeroVolumeRef.current = masterVolume;
    }
  }, [masterVolume]);

  const handleMuteToggle = () => {
    if (isMuted) {
      onVolumeChange(lastNonZeroVolumeRef.current || 0.6);
    } else {
      onVolumeChange(0);
    }
  };

  return (
    <aside
      role="region"
      aria-label="Persistent bottom audio player controls"
      className="fixed bottom-0 left-0 right-0 z-50 bg-slate-950/95 backdrop-blur-2xl border-t border-slate-800 shadow-[0_-8px_30px_rgba(0,0,0,0.6)] py-2 landscape:py-1.5 sm:py-2.5 md:py-3 px-2.5 landscape:px-3 sm:px-4 md:px-6 pb-[calc(0.5rem+env(safe-area-inset-bottom,0px))] pl-[max(0.625rem,env(safe-area-inset-left,0px))] pr-[max(0.625rem,env(safe-area-inset-right,0px))] animate-in slide-in-from-bottom-5 duration-200"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 sm:gap-3 md:gap-4 lg:gap-6">
        {/* Left: Current Track / Soundscape Information */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0 max-w-[140px] sm:max-w-[200px] md:max-w-[230px] lg:max-w-sm shrink">
          {/* Animated Brand Logo / Return to Player button */}
          <button
            onClick={onNavigateHome}
            className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl flex items-center justify-center shrink-0 shadow-sm hover:scale-105 active:scale-95 transition-all cursor-pointer group"
            title="Return to Sanctuary Home Player"
            aria-label="Return to Sanctuary Home Player"
          >
            <FlatLogo size={42} showText={false} isPlaying={isPlaying} />
          </button>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <span className="font-mono text-xs font-bold text-aurora-teal shrink-0">
                {baseFreq}Hz
              </span>
              <span className="text-xs font-semibold text-slate-100 truncate">
                {presetName || solfeggioName}
              </span>
            </div>
            <div className="text-[10px] sm:text-[11px] text-slate-400 truncate flex items-center gap-1 mt-0.5">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
              <span className="truncate">
                {activeNatureCount > 0
                  ? `+${activeNatureCount} layer${activeNatureCount > 1 ? 's' : ''}`
                  : 'Pure 432Hz tone'}
              </span>
              {timerSecondsRemaining !== null && (
                <>
                  <span>•</span>
                  <span className="text-cosmic-lavender font-mono shrink-0">
                    {formatTimer(timerSecondsRemaining)}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Center: Main Playback & Auxiliary Controls (Protected from shrinking) */}
        <div className="flex items-center gap-1.5 sm:gap-2 md:gap-3 shrink-0">

          {/* 1. Musical Mode (Ambient Ethereal Pads) Toggle */}
          {onToggleMusicalMode && (
            <button
              type="button"
              onClick={onToggleMusicalMode}
              className={`p-2 sm:px-2.5 md:px-3 sm:py-2 rounded-xl border active:scale-95 transition-all text-xs font-semibold flex items-center gap-1.5 cursor-pointer shrink-0 ${
                isMusicalMode
                  ? 'bg-cosmic-lavender/25 border-cosmic-lavender/60 text-cosmic-lavender shadow-sm shadow-cosmic-lavender/20'
                  : 'bg-slate-900 hover:bg-slate-800 border-slate-800 text-slate-300 hover:text-cosmic-lavender'
              }`}
              title={isMusicalMode ? 'Musical Mode Active: Ambient Ethereal Pads (Click to turn off)' : 'Turn On Musical Mode: Ethereal Pads'}
              aria-label="Toggle Musical Mode"
            >
              <Music className={`w-4 h-4 ${isMusicalMode ? 'text-cosmic-lavender animate-pulse' : 'text-slate-400'} shrink-0`} />
              <span className="hidden sm:inline">
                {isMusicalMode ? 'Music: ON' : 'Music'}
              </span>
            </button>
          )}

          {/* 2. Sleep Timer */}
          <button
            type="button"
            onClick={onOpenTimer}
            className={`p-2 sm:px-2.5 md:px-3 sm:py-2 rounded-xl border active:scale-95 transition-all text-xs font-semibold flex items-center gap-1.5 cursor-pointer shrink-0 ${
              timerSecondsRemaining !== null
                ? 'bg-cosmic-lavender/20 border-cosmic-lavender/60 text-cosmic-lavender'
                : 'bg-slate-900 hover:bg-slate-800 border-slate-800 text-slate-300 hover:text-cosmic-lavender'
            }`}
            title="Configure Sleep Timer"
            aria-label="Configure Sleep Timer"
          >
            <Timer className="w-4 h-4 text-cosmic-lavender shrink-0" />
            <span className="hidden sm:inline">
              {timerSecondsRemaining !== null
                ? formatTimer(timerSecondsRemaining)
                : 'Timer'}
            </span>
          </button>

          {/* 3. Discreet Export Download Button (Triggers isExportModalOpen) */}
          {handleOpenExport && (
            <button
              type="button"
              onClick={handleOpenExport}
              className="p-2 sm:px-2.5 md:px-3 sm:py-2 rounded-xl border border-slate-800 bg-slate-900/90 hover:bg-slate-800 hover:border-aurora-teal/50 text-slate-300 hover:text-aurora-teal active:scale-95 transition-all text-xs font-semibold flex items-center gap-1.5 cursor-pointer shrink-0 group shadow-xs"
              title="Quick Export: Save current soundscape offline (Studio WAV / Compact MP3)"
              aria-label="Quick Export Offline Soundscape"
            >
              <Download className="w-4 h-4 text-aurora-teal/80 group-hover:text-aurora-teal group-hover:scale-105 transition-transform shrink-0" />
              <span className="hidden sm:inline">Export</span>
            </button>
          )}

          {/* 4. Primary Play / Pause Button with 5-Second Fadeout State */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={onTogglePlay}
              style={
                isPlaying
                  ? {
                      animation: `sanctuaryBreathPulse ${brainwavePulseDuration}s ease-in-out infinite`,
                    }
                  : undefined
              }
              className={`px-3.5 sm:px-5 md:px-6 py-2 sm:py-2.5 rounded-2xl font-bold text-xs sm:text-sm transition-all shadow-lg flex items-center gap-1.5 sm:gap-2 active:scale-95 cursor-pointer shrink-0 ${
                isPlaying
                  ? 'animate-sanctuary-pulse transform-gpu bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-400 hover:to-pink-500 text-white shadow-rose-500/25 ring-1 ring-rose-300/40'
                  : 'bg-gradient-to-r from-aurora-teal via-teal-300 to-cosmic-lavender hover:from-teal-300 hover:to-purple-300 text-midnight shadow-md shadow-aurora-teal/30'
              }`}
              title={isPlaying ? 'Pause audio' : 'Play audio'}
              aria-label={isPlaying ? 'Pause audio' : 'Play audio'}
            >
              {isPlaying ? (
                <>
                  <Pause className="w-4 h-4 fill-current shrink-0" />
                  <span className="hidden sm:inline">Pause</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current shrink-0" />
                  <span>Play</span>
                </>
              )}
            </button>

            {isFadingOut && onResumeFromFade && (
              <button
                type="button"
                onClick={onResumeFromFade}
                className="px-2.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-aurora-teal border border-aurora-teal/40 text-xs font-semibold flex items-center gap-1 transition-all active:scale-95 cursor-pointer"
                title="Cancel fade out and resume full volume"
              >
                <Play className="w-3 h-3 fill-current" />
                <span className="hidden sm:inline">Resume</span>
              </button>
            )}
          </div>
        </div>

        {/* Right: Master Volume Slider (Tablet & Desktop Friendly) */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Master Volume Controls (Visible on tablet sm/md and desktop lg) */}
          <div className="hidden sm:flex items-center gap-1.5 sm:gap-2 p-1.5 px-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
            <button
              onClick={handleMuteToggle}
              className="text-slate-400 hover:text-aurora-teal transition-colors cursor-pointer p-0.5 shrink-0"
              title={isMuted ? 'Unmute master volume' : 'Mute master volume'}
              aria-label={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted ? (
                <VolumeX className="w-4 h-4 text-rose-400" />
              ) : (
                <Volume2 className="w-4 h-4 text-aurora-teal" />
              )}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={masterVolume}
              onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
              className="w-16 sm:w-20 md:w-24 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-aurora-teal"
              aria-label="Master volume slider"
            />
            <span className="text-[10px] font-mono text-slate-400 w-7 text-right">
              {Math.round(masterVolume * 100)}%
            </span>
          </div>

          {/* Return to Full Sanctuary Home (Desktop only, preserves space on tablet) */}
          <button
            onClick={onNavigateHome}
            className="hidden lg:flex px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 hover:text-aurora-teal border border-slate-800 text-slate-300 text-xs font-semibold items-center gap-1.5 transition-colors cursor-pointer shrink-0"
            title="Open Full Sanctuary Player"
          >
            <Maximize2 className="w-3.5 h-3.5" />
            <span>Sanctuary</span>
          </button>
        </div>
      </div>
    </aside>
  );
};
