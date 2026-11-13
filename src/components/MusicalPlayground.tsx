import React, { useState, useEffect } from 'react';
import { Music, Volume2, Sparkles, Wand2, Bell, Play, Pause, Sliders, Layers } from 'lucide-react';
import { audioEngine } from '../services/audioEngine';

interface KalimbaKey {
  note: string;
  name: string;
  freq: number;
  keyLabel: string;
  color: string;
  chakra: string;
}

const KALIMBA_KEYS: KalimbaKey[] = [
  { note: 'A3', name: 'Root Tone', freq: 216.0, keyLabel: '1', color: 'from-rose-500/20 to-rose-600/30 border-rose-500/40 text-rose-300', chakra: 'Muladhara' },
  { note: 'C4', name: 'Earth Pulse', freq: 256.9, keyLabel: '2', color: 'from-amber-500/20 to-amber-600/30 border-amber-500/40 text-amber-300', chakra: 'Svadhisthana' },
  { note: 'D4', name: 'Water Flow', freq: 288.3, keyLabel: '3', color: 'from-yellow-500/20 to-yellow-600/30 border-yellow-500/40 text-yellow-300', chakra: 'Manipura' },
  { note: 'E4', name: 'Heart Radiance', freq: 323.6, keyLabel: '4', color: 'from-emerald-500/20 to-emerald-600/30 border-emerald-500/40 text-emerald-300', chakra: 'Anahata' },
  { note: 'G4', name: 'Celestial Air', freq: 384.9, keyLabel: '5', color: 'from-sky-500/20 to-sky-600/30 border-sky-500/40 text-sky-300', chakra: 'Vishuddha' },
  { note: 'A4', name: 'Sacred 432', freq: 432.0, keyLabel: '6', color: 'from-indigo-500/20 to-indigo-600/30 border-indigo-500/40 text-indigo-300', chakra: 'Ajna' },
  { note: 'C5', name: 'Crown Shimmer', freq: 513.7, keyLabel: '7', color: 'from-purple-500/20 to-purple-600/30 border-purple-500/40 text-purple-300', chakra: 'Sahasrara' },
  { note: 'D5', name: 'Ether Light', freq: 576.7, keyLabel: '8', color: 'from-cyan-500/20 to-cyan-600/30 border-cyan-500/40 text-cyan-300', chakra: 'Cosmic' },
];

export const MusicalPlayground: React.FC = () => {
  const [activeNoteIdx, setActiveNoteIdx] = useState<number | null>(null);
  const [isChordsActive, setIsChordsActive] = useState<boolean>(() => audioEngine.getIsChordsPlaying());
  const [chordProgression, setChordProgression] = useState<string>('celestial_harmony');
  const [chordsVol, setChordsVol] = useState<number>(0.35);

  // Auto Wind Chimes mode
  const [isAutoChimes, setIsAutoChimes] = useState<boolean>(false);

  // Handle Note Strike
  const handlePlayNote = (idx: number) => {
    const item = KALIMBA_KEYS[idx];
    const pan = (idx - 3.5) / 4; // stereo spread from left to right
    audioEngine.playKalimbaNote(item.freq, pan);
    setActiveNoteIdx(idx);
    setTimeout(() => setActiveNoteIdx((curr) => (curr === idx ? null : curr)), 350);
  };

  // Keyboard shortcut listener (1-8 and a-k)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      const key = e.key.toLowerCase();
      const numIdx = parseInt(key, 10) - 1;
      if (numIdx >= 0 && numIdx < KALIMBA_KEYS.length) {
        handlePlayNote(numIdx);
        return;
      }

      const letterMap: Record<string, number> = {
        a: 0, s: 1, d: 2, f: 3, g: 4, h: 5, j: 6, k: 7,
      };
      if (letterMap[key] !== undefined) {
        handlePlayNote(letterMap[key]);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Ambient Chords Controller
  const handleToggleChords = () => {
    const active = audioEngine.toggleAmbientChords();
    setIsChordsActive(active);
  };

  const handleProgressionChange = (pId: string) => {
    setChordProgression(pId);
    audioEngine.setChordProgression(pId);
  };

  const handleChordsVolChange = (val: number) => {
    setChordsVol(val);
    audioEngine.setChordsVolume(val);
  };

  // Auto Wind Chimes interval
  useEffect(() => {
    if (!isAutoChimes) return;

    const interval = setInterval(() => {
      // Pick random pentatonic note
      const randomIdx = Math.floor(Math.random() * KALIMBA_KEYS.length);
      const pan = (randomIdx - 3.5) / 4;
      audioEngine.playKalimbaNote(KALIMBA_KEYS[randomIdx].freq, pan);
      setActiveNoteIdx(randomIdx);
      setTimeout(() => setActiveNoteIdx((curr) => (curr === randomIdx ? null : curr)), 400);
    }, 2800 + Math.random() * 2200);

    return () => clearInterval(interval);
  }, [isAutoChimes]);

  return (
    <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-2xl p-3.5 sm:p-5 md:p-6 shadow-xl space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-base sm:text-lg font-semibold text-slate-100 flex items-center gap-2">
              <Music className="w-4 h-4 text-indigo-400" />
              <span>432Hz Musical Harmony &amp; Sound Harp</span>
            </h3>
            <span className="text-[10px] bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 px-2 py-0.5 rounded-full font-mono">
              Pentatonic Tuning
            </span>
          </div>
          <p className="text-[11px] sm:text-xs text-slate-400 mt-0.5 font-light">
            Crystalline sound harp keys &amp; harmonic ambient chords in sacred 432Hz synchronization.
          </p>
        </div>

        {/* Ambient Wind Chimes Toggle */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setIsAutoChimes(!isAutoChimes)}
            className={`text-xs inline-flex items-center gap-1.5 px-3 py-1.5 min-h-[34px] rounded-xl border transition-all cursor-pointer whitespace-nowrap ${
              isAutoChimes
                ? 'bg-amber-500/20 border-amber-400 text-amber-200 shadow-sm'
                : 'bg-slate-800/90 border-slate-700 text-slate-400 hover:text-slate-200'
            }`}
            title="Play subtle meditative wind chime melodies automatically"
          >
            <Bell className={`w-3.5 h-3.5 ${isAutoChimes ? 'text-amber-400 animate-bounce' : ''}`} />
            <span>{isAutoChimes ? 'Chimes: On' : 'Auto Chimes'}</span>
          </button>
        </div>
      </div>

      {/* SECTION 1: Interactive 432Hz Kalimba & Crystal Sound Harp */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-sky-400" />
            <span>432Hz Crystal Sound Harp (Keys 1-8 or Touch)</span>
          </label>
          <span className="text-[10px] text-slate-400 hidden sm:inline">
            Tuned to sacred 432Hz pentatonic scale
          </span>
        </div>

        {/* Compact, Ergonomic Keys */}
        <div className="grid grid-cols-4 sm:grid-cols-8 gap-1.5 sm:gap-2">
          {KALIMBA_KEYS.map((k, idx) => {
            const isPressed = activeNoteIdx === idx;
            return (
              <button
                type="button"
                key={k.note}
                onClick={() => handlePlayNote(idx)}
                className={`relative h-20 sm:h-24 md:h-26 rounded-xl border transition-all duration-150 flex flex-col items-center justify-between p-2 select-none active:scale-95 cursor-pointer ${
                  isPressed
                    ? 'bg-gradient-to-t ' + k.color + ' scale-95 shadow-md shadow-sky-500/30 border-white ring-1 ring-sky-300'
                    : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900/80'
                }`}
                aria-label={`Play ${k.note} ${k.freq}Hz`}
              >
                {/* Key Shortcut Badge */}
                <span className="text-[9px] font-mono px-1 py-0.5 rounded bg-slate-800/80 text-slate-400 border border-slate-700 leading-none">
                  {k.keyLabel}
                </span>

                {/* Center Note Pitch */}
                <div className="text-center my-auto">
                  <div className="text-xs sm:text-sm font-bold text-slate-100">{k.note}</div>
                  <div className="text-[9px] text-slate-400 font-mono">{k.freq}Hz</div>
                </div>

                {/* Chakra / Name */}
                <div className="text-[8px] sm:text-[9px] text-slate-400 uppercase tracking-wider truncate w-full text-center">
                  {k.name}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* SECTION 2: Ambient Musical Chords Companion - Minimized & Compact */}
      <div className="p-3 sm:p-4 rounded-xl bg-slate-950/50 border border-slate-800/90 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0">
              <Layers className="w-3.5 h-3.5" />
            </div>
            <div>
              <div className="text-xs font-semibold text-slate-200">
                Continuous Ambient Pad Progression (432Hz)
              </div>
              <div className="text-[10px] text-slate-400">
                Harmonic chords layered under your meditation drone.
              </div>
            </div>
          </div>

          {/* Toggle Chords Button */}
          <button
            type="button"
            onClick={handleToggleChords}
            className={`px-3.5 py-1.5 min-h-[34px] rounded-xl text-xs font-semibold inline-flex items-center justify-center gap-1.5 border transition-all cursor-pointer whitespace-nowrap ${
              isChordsActive
                ? 'bg-indigo-600 hover:bg-indigo-500 text-white border-transparent shadow-md shadow-indigo-600/30'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
            }`}
          >
            {isChordsActive ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
            <span>{isChordsActive ? 'Stop Chords' : 'Play Ambient Chords'}</span>
          </button>
        </div>

        {/* Progression Presets */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5">
          {[
            { id: 'celestial_harmony', name: 'Celestial Harmony', chords: 'Am • F • C • G' },
            { id: 'sacred_lotus', name: 'Sacred Lotus', chords: 'Dm • Bb • F • G' },
            { id: 'mystic_cosmos', name: 'Mystic Cosmos', chords: 'Asus2 • Dsus2 • Esus4' },
          ].map((item) => (
            <button
              type="button"
              key={item.id}
              onClick={() => handleProgressionChange(item.id)}
              className={`p-2 rounded-xl border text-left text-xs transition-all cursor-pointer ${
                chordProgression === item.id
                  ? 'bg-indigo-500/20 border-indigo-400 text-slate-100 font-medium'
                  : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
              }`}
            >
              <div className="font-semibold text-slate-200 text-xs">{item.name}</div>
              <div className="text-[10px] text-indigo-400 font-mono mt-0.5">{item.chords}</div>
            </button>
          ))}
        </div>

        {/* Chords Volume Slider */}
        <div className="flex items-center gap-3 pt-1">
          <Volume2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <div className="flex-1 flex items-center gap-3">
            <span className="text-[11px] text-slate-300 shrink-0 font-medium">Chords Vol</span>
            <input
              type="range"
              min="0"
              max="1"
              step="0.02"
              value={chordsVol}
              onChange={(e) => handleChordsVolChange(parseFloat(e.target.value))}
              className="flex-1 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-400"
            />
            <span className="font-mono text-[10px] text-slate-400 w-8 text-right">
              {Math.round(chordsVol * 100)}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
