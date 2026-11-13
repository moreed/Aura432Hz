import React from 'react';
import {
  Play,
  Pause,
  Timer,
  Volume2,
  Maximize2,
  Sparkles,
  Download,
} from 'lucide-react';

interface MobileMiniPlayerProps {
  isPlaying: boolean;
  onTogglePlay: () => void;
  baseFreq: number;
  solfeggioName: string;
  timerSecondsRemaining: number | null;
  formatTimer: (seconds: number) => string;
  onOpenTimer: () => void;
  onOpenAmbient: () => void;
  activeNatureCount: number;
  onOpenExport?: () => void;
}

export const MobileMiniPlayer: React.FC<MobileMiniPlayerProps> = ({
  isPlaying,
  onTogglePlay,
  baseFreq,
  solfeggioName,
  timerSecondsRemaining,
  formatTimer,
  onOpenTimer,
  onOpenAmbient,
  activeNatureCount,
  onOpenExport,
}) => {
  // Only show when audio is playing or active
  if (!isPlaying && timerSecondsRemaining === null) return null;

  return (
    <aside
      aria-label="Mobile audio player quick controls"
      className="md:hidden fixed bottom-3 left-3 right-3 z-30 bg-slate-900/95 backdrop-blur-xl border border-slate-700/80 rounded-2xl p-2.5 px-3.5 shadow-2xl flex items-center justify-between gap-3 animate-in slide-in-from-bottom-3 duration-200"
    >
      {/* Current Soundscape Info */}
      <div className="flex items-center gap-2.5 min-w-0 flex-1">
        <button
          type="button"
          onClick={onOpenAmbient}
          className="w-9 h-9 p-0 rounded-xl bg-sky-500/20 border border-sky-500/40 text-sky-300 inline-flex items-center justify-center shrink-0 cursor-pointer"
          title="Open Fullscreen Ambient Sanctuary"
          aria-label="Open Fullscreen Ambient Sanctuary"
        >
          <Sparkles className="w-4 h-4 text-sky-400 animate-pulse" />
        </button>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <span className="font-mono text-xs font-bold text-sky-300">{baseFreq}Hz</span>
            <span className="text-[11px] font-medium text-slate-200 truncate">{solfeggioName}</span>
          </div>
          <div className="text-[10px] text-slate-400 truncate">
            {activeNatureCount > 0 ? `+${activeNatureCount} nature sounds` : 'Pure tone'}
            {timerSecondsRemaining !== null && ` • ${formatTimer(timerSecondsRemaining)} left`}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-1.5 shrink-0">
        {onOpenExport && (
          <button
            type="button"
            onClick={onOpenExport}
            className="w-9 h-9 p-0 rounded-xl bg-slate-800 text-teal-300 border border-slate-700 inline-flex items-center justify-center shrink-0 active:scale-90 transition-all cursor-pointer"
            title="Export Studio Audio (WAV)"
            aria-label="Export Studio Audio"
          >
            <Download className="w-4 h-4" />
          </button>
        )}

        <button
          type="button"
          onClick={onOpenTimer}
          className="w-9 h-9 p-0 rounded-xl bg-slate-800 text-indigo-300 border border-slate-700 inline-flex items-center justify-center shrink-0 active:scale-90 transition-all cursor-pointer"
          title="Sleep Timer"
          aria-label="Set Sleep Timer"
        >
          <Timer className="w-4 h-4" />
        </button>

        {/* Primary Play/Pause Button */}
        <button
          type="button"
          onClick={onTogglePlay}
          className={`w-9 h-9 p-0 rounded-xl font-bold transition-all shadow-md active:scale-95 cursor-pointer inline-flex items-center justify-center shrink-0 ${
            isPlaying
              ? 'bg-rose-500 text-white shadow-rose-500/20'
              : 'bg-sky-400 text-slate-950 shadow-sky-400/20'
          }`}
          title={isPlaying ? 'Pause Audio' : 'Resume Audio'}
          aria-label={isPlaying ? 'Pause Audio' : 'Resume Audio'}
        >
          {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
        </button>
      </div>
    </aside>
  );
};
