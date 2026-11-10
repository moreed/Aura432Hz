import React, { useState, useEffect } from 'react';
import {
  Activity,
  Gauge,
  Sliders,
  RotateCcw,
  Volume2,
  Check,
  ChevronDown,
  ChevronUp,
  Info,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import {
  r128LoudnessMeter,
  LoudnessMetrics,
  TargetLoudnessPreset,
} from '../services/r128LoudnessMeter';

interface LoudnessMeterHUDProps {
  className?: string;
  isCompact?: boolean;
}

export const LoudnessMeterHUD: React.FC<LoudnessMeterHUDProps> = ({
  className = '',
  isCompact = false,
}) => {
  const [metrics, setMetrics] = useState<LoudnessMetrics>(r128LoudnessMeter.getMetrics());
  const [isExpanded, setIsExpanded] = useState<boolean>(!isCompact);
  const [showTooltip, setShowTooltip] = useState<boolean>(false);

  useEffect(() => {
    const unsubscribe = r128LoudnessMeter.subscribe((newMetrics) => {
      setMetrics(newMetrics);
    });
    return () => {
      unsubscribe();
    };
  }, []);

  const handleToggleAutoLevel = () => {
    r128LoudnessMeter.setAutoLevelEnabled(!metrics.isAutoLevelEnabled);
  };

  const handleSetTarget = (target: TargetLoudnessPreset) => {
    r128LoudnessMeter.setTargetLoudness(target);
  };

  const handleResetIntegrated = () => {
    r128LoudnessMeter.resetIntegrated();
  };

  // Convert LUFS to percentage for visual meter bar (-60 LUFS to 0 LUFS)
  // -60 LUFS -> 0%, 0 LUFS -> 100%
  const lufsToPercent = (lufs: number) => {
    const clamped = Math.max(-60, Math.min(0, lufs));
    return ((clamped + 60) / 60) * 100;
  };

  const momPercent = lufsToPercent(metrics.momentaryLUFS);
  const shortPercent = lufsToPercent(metrics.shortTermLUFS);
  const targetPercent = lufsToPercent(metrics.targetLUFS);

  // Meter color logic
  const getMeterColor = (lufs: number) => {
    if (lufs > -6) return 'from-rose-500 to-red-600';
    if (lufs > -12) return 'from-amber-400 to-rose-500';
    if (lufs > -20) return 'from-teal-400 to-emerald-500';
    return 'from-cyan-500 to-teal-500';
  };

  return (
    <div
      className={`rounded-2xl bg-stone-900/90 border border-teal-500/25 shadow-xl backdrop-blur-md transition-all overflow-hidden ${className}`}
    >
      {/* Header Bar */}
      <div className="flex items-center justify-between px-4 py-3 bg-stone-950/60 border-b border-stone-800/80">
        <div className="flex items-center space-x-2.5">
          <div className="w-7 h-7 rounded-lg bg-teal-500/15 border border-teal-500/30 flex items-center justify-center text-teal-300">
            <Gauge className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold text-stone-100 tracking-wide uppercase font-sans">
                EBU R128 Loudness Analyzer
              </span>
              <span
                className={`text-[10px] font-mono px-2 py-0.5 rounded-full border transition-all ${
                  metrics.isAudioActive
                    ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30 animate-pulse'
                    : 'bg-stone-800 text-stone-400 border-stone-700'
                }`}
              >
                {metrics.isAudioActive ? 'LIVE' : 'STANDBY'}
              </span>
            </div>
            <div className="text-[11px] text-stone-400 font-mono hidden sm:block">
              ITU-R BS.1770-4 K-Weighting • Dynamic Multi-Layer Leveler
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {/* Auto Level Status Badge */}
          <button
            type="button"
            onClick={handleToggleAutoLevel}
            title={metrics.isAutoLevelEnabled ? 'Auto-Leveler Active' : 'Auto-Leveler Paused'}
            className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-lg text-xs font-mono font-medium transition-all cursor-pointer border ${
              metrics.isAutoLevelEnabled
                ? 'bg-teal-500/20 text-teal-200 border-teal-500/40 hover:bg-teal-500/30'
                : 'bg-stone-800 text-stone-400 border-stone-700 hover:text-stone-300'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Auto-Level: {metrics.isAutoLevelEnabled ? 'ON' : 'OFF'}</span>
          </button>

          {/* Expand/Collapse Toggle */}
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-200 hover:bg-stone-800 transition-colors cursor-pointer"
            title={isExpanded ? 'Collapse meter details' : 'Expand meter telemetry'}
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Main Meter Telemetry Section */}
      <div className="p-4 space-y-4">
        {/* Real-Time Horizontal LUFS Bar */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-stone-400 flex items-center space-x-1">
              <Activity className="w-3.5 h-3.5 text-teal-400" />
              <span>Momentary Loudness (M)</span>
            </span>
            <div className="flex items-center space-x-2">
              <span className="font-bold text-stone-100 tabular-nums">
                {metrics.isAudioActive ? `${metrics.momentaryLUFS.toFixed(1)} LUFS` : '-∞ LUFS'}
              </span>
              <span className="text-[11px] text-stone-500">
                Target: {metrics.targetLUFS} LUFS
              </span>
            </div>
          </div>

          {/* Meter Track with Target Marker */}
          <div className="relative w-full h-3.5 bg-stone-950 rounded-lg overflow-hidden border border-stone-800 p-0.5">
            {/* Background Scale Gradients */}
            <div className="absolute inset-0 flex">
              <div className="w-[66.6%] bg-cyan-950/20 border-r border-stone-800/40" />
              <div className="w-[16.6%] bg-teal-950/20 border-r border-stone-800/40" />
              <div className="w-[16.8%] bg-amber-950/20" />
            </div>

            {/* Target Line Marker */}
            <div
              className="absolute top-0 bottom-0 w-0.5 bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.8)] z-10"
              style={{ left: `${targetPercent}%` }}
              title={`Target Loudness: ${metrics.targetLUFS} LUFS`}
            />

            {/* Momentary Bar */}
            <div
              className={`h-full rounded-md bg-gradient-to-r ${getMeterColor(
                metrics.momentaryLUFS
              )} transition-all duration-75 relative z-0`}
              style={{ width: `${momPercent}%` }}
            />
          </div>

          {/* Scale Labels */}
          <div className="flex justify-between text-[10px] font-mono text-stone-500 px-0.5">
            <span>-60</span>
            <span>-40</span>
            <span>-23 (Broadcast)</span>
            <span>-14 (Stream)</span>
            <span>-6</span>
            <span>0 LUFS</span>
          </div>
        </div>

        {/* Primary Readouts 4-Column Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {/* Momentary (M) */}
          <div className="bg-stone-950/70 border border-stone-800/80 rounded-xl p-2.5 text-center">
            <div className="text-[10px] font-mono uppercase tracking-wider text-stone-400">
              Momentary (400ms)
            </div>
            <div className="text-base sm:text-lg font-mono font-bold text-teal-300 tabular-nums mt-0.5">
              {metrics.isAudioActive ? `${metrics.momentaryLUFS.toFixed(1)}` : '-∞'}
              <span className="text-[10px] font-sans font-normal text-stone-500 ml-1">LUFS</span>
            </div>
          </div>

          {/* Short-Term (S) */}
          <div className="bg-stone-950/70 border border-stone-800/80 rounded-xl p-2.5 text-center">
            <div className="text-[10px] font-mono uppercase tracking-wider text-stone-400">
              Short-Term (3s)
            </div>
            <div className="text-base sm:text-lg font-mono font-bold text-cyan-300 tabular-nums mt-0.5">
              {metrics.isAudioActive ? `${metrics.shortTermLUFS.toFixed(1)}` : '-∞'}
              <span className="text-[10px] font-sans font-normal text-stone-500 ml-1">LUFS</span>
            </div>
          </div>

          {/* Integrated (I) */}
          <div className="bg-stone-950/70 border border-stone-800/80 rounded-xl p-2.5 text-center relative group">
            <div className="text-[10px] font-mono uppercase tracking-wider text-stone-400 flex items-center justify-center space-x-1">
              <span>Integrated (I)</span>
            </div>
            <div className="text-base sm:text-lg font-mono font-bold text-amber-300 tabular-nums mt-0.5">
              {metrics.isAudioActive && metrics.integratedLUFS > -65
                ? `${metrics.integratedLUFS.toFixed(1)}`
                : '-∞'}
              <span className="text-[10px] font-sans font-normal text-stone-500 ml-1">LUFS</span>
            </div>
          </div>

          {/* Dynamic Auto-Level Trim */}
          <div className="bg-stone-950/70 border border-stone-800/80 rounded-xl p-2.5 text-center">
            <div className="text-[10px] font-mono uppercase tracking-wider text-stone-400">
              Leveler Trim
            </div>
            <div
              className={`text-base sm:text-lg font-mono font-bold tabular-nums mt-0.5 ${
                Math.abs(metrics.autoLevelDeltaDb) > 0.5
                  ? metrics.autoLevelDeltaDb > 0
                    ? 'text-emerald-400'
                    : 'text-rose-400'
                  : 'text-stone-300'
              }`}
            >
              {metrics.isAutoLevelEnabled
                ? `${metrics.autoLevelDeltaDb >= 0 ? '+' : ''}${metrics.autoLevelDeltaDb.toFixed(1)}`
                : 'OFF'}
              <span className="text-[10px] font-sans font-normal text-stone-500 ml-1">dB</span>
            </div>
          </div>
        </div>

        {/* Expanded Telemetry Controls */}
        {isExpanded && (
          <div className="pt-3 border-t border-stone-800/80 space-y-3 animate-in fade-in duration-150">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Target Preset Selector */}
              <div className="bg-stone-950/50 p-2.5 rounded-xl border border-stone-800">
                <div className="text-[11px] font-mono text-stone-400 mb-1.5 flex items-center justify-between">
                  <span>Target Loudness Standard:</span>
                  <span className="text-amber-400 font-bold">{metrics.targetLUFS} LUFS</span>
                </div>
                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleSetTarget(-14)}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-mono font-medium transition-all cursor-pointer flex items-center justify-center space-x-1.5 ${
                      metrics.targetLUFS === -14
                        ? 'bg-amber-500/20 text-amber-200 border border-amber-500/40 shadow-sm'
                        : 'bg-stone-900 text-stone-400 hover:text-stone-200 hover:bg-stone-800'
                    }`}
                  >
                    <span>-14 LUFS (Streaming)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSetTarget(-23)}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-mono font-medium transition-all cursor-pointer flex items-center justify-center space-x-1.5 ${
                      metrics.targetLUFS === -23
                        ? 'bg-teal-500/20 text-teal-200 border border-teal-500/40 shadow-sm'
                        : 'bg-stone-900 text-stone-400 hover:text-stone-200 hover:bg-stone-800'
                    }`}
                  >
                    <span>-23 LUFS (Broadcast)</span>
                  </button>
                </div>
              </div>

              {/* Secondary Metrics: LRA & True Peak */}
              <div className="bg-stone-950/50 p-2.5 rounded-xl border border-stone-800 flex items-center justify-around text-center">
                <div>
                  <div className="text-[10px] font-mono text-stone-400 uppercase">
                    Loudness Range (LRA)
                  </div>
                  <div className="text-sm font-mono font-bold text-stone-200 mt-0.5">
                    {metrics.loudnessRangeLRA.toFixed(1)}{' '}
                    <span className="text-[10px] font-sans font-normal text-stone-500">LU</span>
                  </div>
                </div>

                <div className="w-px h-8 bg-stone-800" />

                <div>
                  <div className="text-[10px] font-mono text-stone-400 uppercase">True Peak</div>
                  <div
                    className={`text-sm font-mono font-bold mt-0.5 ${
                      metrics.truePeakDbfs > -1.0 ? 'text-rose-400' : 'text-stone-200'
                    }`}
                  >
                    {metrics.isAudioActive ? metrics.truePeakDbfs.toFixed(1) : '-∞'}{' '}
                    <span className="text-[10px] font-sans font-normal text-stone-500">dBFS</span>
                  </div>
                </div>

                <div className="w-px h-8 bg-stone-800" />

                <div>
                  <button
                    type="button"
                    onClick={handleResetIntegrated}
                    className="flex flex-col items-center text-[10px] font-mono text-stone-400 hover:text-amber-300 transition-colors cursor-pointer"
                    title="Reset long-term integrated measurement"
                  >
                    <RotateCcw className="w-3.5 h-3.5 mb-0.5 text-stone-400 hover:text-amber-300" />
                    <span>Reset I</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Explanatory Footer */}
            <div className="flex items-center justify-between text-[11px] text-stone-400 px-1 pt-1">
              <span className="flex items-center space-x-1">
                <Sparkles className="w-3 h-3 text-teal-400" />
                <span>
                  Dynamic auto-leveler balances total loudness across active Solfeggio tones, chords,
                  and ambient nature sound tracks.
                </span>
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
