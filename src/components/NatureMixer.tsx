import React, { useState, useMemo, useCallback, useRef } from 'react';
import {
  CloudRain,
  Waves,
  Wind,
  Droplets,
  Moon,
  Flame,
  Bell,
  Sparkles,
  Volume2,
  VolumeX,
  RotateCcw,
  BookmarkPlus,
  Trash2,
  Check,
  Music,
  Bird,
  CloudLightning,
  Layers,
  Radio,
  Dices,
  Filter,
  ShieldCheck,
  SlidersHorizontal,
  Info,
  Tag,
  Sliders,
  Heart,
  Play,
  Pause,
  Download,
  Lock,
  FileDown,
  ShoppingBag,
  ChevronRight,
  Search,
  Upload,
  FileUp,
  X,
  AlertCircle,
  Disc,
  Activity,
} from 'lucide-react';
import { downloadJSON } from '../services/printService';
import { NatureSoundState, audioEngine } from '../services/audioEngine';
import {
  MixPreset,
  BUILT_IN_MIX_PRESETS,
  getCustomPresets,
  saveCustomPreset,
  deleteCustomPreset,
  PresetCategory,
  PresetFilterCategory,
  PRESET_CATEGORIES,
  getFavoritePresetIds,
  toggleFavoritePresetId,
} from '../services/storage';
import { getRecommendedProductForPreset } from '../services/presetProductRecommendations';

function renderSoundIcon(iconName: string, className: string) {
  switch (iconName) {
    case 'CloudRain':
      return <CloudRain className={className} />;
    case 'Waves':
      return <Waves className={className} />;
    case 'Bird':
      return <Bird className={className} />;
    case 'Wind':
      return <Wind className={className} />;
    case 'CloudLightning':
      return <CloudLightning className={className} />;
    case 'Droplets':
      return <Droplets className={className} />;
    case 'Flame':
      return <Flame className={className} />;
    case 'Moon':
      return <Moon className={className} />;
    case 'Bell':
      return <Bell className={className} />;
    case 'Music':
      return <Music className={className} />;
    case 'Layers':
      return <Layers className={className} />;
    case 'Radio':
      return <Radio className={className} />;
    case 'Disc':
      return <Disc className={className} />;
    case 'Activity':
      return <Activity className={className} />;
    case 'Sparkles':
    default:
      return <Sparkles className={className} />;
  }
}

interface SoundControlCardProps {
  sound: NatureSoundState;
  isPlaying: boolean;
  onSoundChange: (id: string, enabled: boolean, volume: number) => void;
}

function areSoundControlPropsEqual(
  prev: SoundControlCardProps,
  next: SoundControlCardProps
): boolean {
  return (
    prev.isPlaying === next.isPlaying &&
    prev.sound.id === next.sound.id &&
    prev.sound.enabled === next.sound.enabled &&
    prev.sound.volume === next.sound.volume &&
    prev.sound.name === next.sound.name &&
    prev.sound.category === next.sound.category &&
    prev.sound.icon === next.sound.icon &&
    prev.sound.description === next.sound.description
  );
}

const SoundControlCard = React.memo<SoundControlCardProps>(function SoundControlCard({
  sound,
  isPlaying,
  onSoundChange,
}) {
  const isEnabled = sound.enabled;
  const isSoundActive = isEnabled && sound.volume > 0;
  const isSoundPlaying = isSoundActive && isPlaying;
  const isSoundArmed = isSoundActive && !isPlaying;

  const handleToggle = useCallback(() => {
    onSoundChange(sound.id, !isEnabled, sound.volume);
  }, [onSoundChange, sound.id, isEnabled, sound.volume]);

  const handleIconToggle = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onSoundChange(sound.id, !isEnabled, sound.volume > 0 ? sound.volume : 0.5);
  }, [onSoundChange, sound.id, isEnabled, sound.volume]);

  const handleMuteToggle = useCallback(() => {
    if (!isEnabled) {
      onSoundChange(sound.id, true, sound.volume > 0 ? sound.volume : 0.5);
    } else if (sound.volume > 0) {
      onSoundChange(sound.id, isEnabled, 0);
    } else {
      onSoundChange(sound.id, true, 0.5);
    }
  }, [onSoundChange, sound.id, isEnabled, sound.volume]);

  const handleVolumeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    onSoundChange(sound.id, true, parseFloat(e.target.value));
  }, [onSoundChange, sound.id]);

  const soundIcon = useMemo(() => {
    return renderSoundIcon(sound.icon, 'w-4 h-4');
  }, [sound.icon]);

  const categoryGlow = useMemo(() => {
    if (!isEnabled) {
      return {
        card: 'bg-slate-850/60 border-slate-800 hover:border-slate-700/80',
        btn: 'bg-slate-800 text-slate-500 hover:text-slate-300 hover:bg-slate-750 border border-slate-750',
        accentText: 'text-slate-400',
        sliderAccent: 'accent-sky-400',
      };
    }
    switch (sound.category) {
      case 'nature':
        return {
          card: isSoundPlaying
            ? 'bg-gradient-to-br from-emerald-950/60 via-slate-900 to-teal-950/40 border-emerald-500/50 shadow-lg shadow-emerald-950/30 ring-1 ring-emerald-500/30'
            : 'bg-emerald-950/30 border-emerald-500/30 shadow-sm',
          btn: isSoundPlaying
            ? 'bg-gradient-to-br from-emerald-400 to-teal-500 text-slate-950 shadow-md shadow-emerald-500/30 border border-emerald-300 font-bold'
            : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40',
          accentText: 'text-emerald-300',
          sliderAccent: 'accent-emerald-400',
        };
      case 'musical':
        return {
          card: isSoundPlaying
            ? 'bg-gradient-to-br from-indigo-950/60 via-slate-900 to-purple-950/40 border-indigo-500/50 shadow-lg shadow-indigo-950/30 ring-1 ring-indigo-500/30'
            : 'bg-indigo-950/30 border-indigo-500/30 shadow-sm',
          btn: isSoundPlaying
            ? 'bg-gradient-to-br from-indigo-400 to-purple-500 text-white shadow-md shadow-indigo-500/30 border border-indigo-300 font-bold'
            : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40',
          accentText: 'text-indigo-300',
          sliderAccent: 'accent-indigo-400',
        };
      case 'sacred':
        return {
          card: isSoundPlaying
            ? 'bg-gradient-to-br from-amber-950/60 via-slate-900 to-orange-950/40 border-amber-500/50 shadow-lg shadow-amber-950/30 ring-1 ring-amber-500/30'
            : 'bg-amber-950/30 border-amber-500/30 shadow-sm',
          btn: isSoundPlaying
            ? 'bg-gradient-to-br from-amber-400 to-orange-500 text-slate-950 shadow-md shadow-amber-500/30 border border-amber-300 font-bold'
            : 'bg-amber-500/20 text-amber-300 border border-amber-500/40',
          accentText: 'text-amber-300',
          sliderAccent: 'accent-amber-400',
        };
      default:
        return {
          card: 'bg-slate-800/80 border-sky-500/40 shadow-md shadow-sky-950/20',
          btn: 'bg-sky-500/20 text-sky-300 border border-sky-500/30',
          accentText: 'text-sky-300',
          sliderAccent: 'accent-sky-400',
        };
    }
  }, [isEnabled, isSoundPlaying, sound.category]);

  return (
    <div
      className={`p-4 rounded-2xl border transition-all duration-300 flex flex-col justify-between ${categoryGlow.card}`}
    >
      <div>
        <div className="flex items-center justify-between mb-2">
          <div
            onClick={handleToggle}
            className="flex items-center gap-2.5 cursor-pointer select-none"
          >
            {/* Animated Soundscape Icon Button with Colorful Category Palette */}
            <button
              type="button"
              onClick={handleIconToggle}
              className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all relative shrink-0 cursor-pointer ${
                isSoundPlaying
                  ? `${categoryGlow.btn} animate-soundscape-active`
                  : isSoundArmed
                  ? 'bg-sky-500/25 text-sky-200 border border-sky-400/50 shadow-sm animate-soundscape-armed'
                  : categoryGlow.btn
              }`}
              title={
                isSoundPlaying
                  ? `Playing ${sound.name} (${Math.round(sound.volume * 100)}%) - Click to mute`
                  : isSoundArmed
                  ? `Armed & Ready: ${sound.name} (Start Sanctuary to hear) - Click to mute`
                  : `Activate ${sound.name}`
              }
              aria-label={`Toggle ${sound.name} soundscape`}
            >
              <div className={isSoundPlaying ? 'animate-soundscape-icon' : ''}>
                {soundIcon}
              </div>
              {isSoundPlaying && (
                <span className="absolute -top-1 -right-1 flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400 border border-slate-900" />
                </span>
              )}
            </button>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-semibold text-slate-200">{sound.name}</span>
                {sound.category === 'musical' && (
                  <span className="text-[9px] bg-indigo-500/20 text-indigo-300 px-1.5 py-0.2 rounded font-semibold border border-indigo-500/30">
                    432Hz
                  </span>
                )}
                {sound.category === 'sacred' && (
                  <span className="text-[9px] bg-amber-500/20 text-amber-300 px-1.5 py-0.2 rounded font-semibold border border-amber-500/30">
                    Sacred
                  </span>
                )}
              </div>
              <div className="text-[10px] text-slate-400 flex items-center gap-1">
                {isSoundPlaying ? (
                  <span className={`${categoryGlow.accentText} font-medium flex items-center gap-1`}>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse inline-block" />
                    {Math.round(sound.volume * 100)}% Playing
                  </span>
                ) : isSoundArmed ? (
                  <span className="text-sky-400/90 font-medium">
                    {Math.round(sound.volume * 100)}% Armed (Paused)
                  </span>
                ) : isEnabled ? (
                  <span className={categoryGlow.accentText}>{Math.round(sound.volume * 100)}% Volume</span>
                ) : (
                  <span className="text-slate-500">Muted</span>
                )}
              </div>
            </div>
          </div>

          {/* Toggle Switch */}
          <button
            type="button"
            onClick={handleToggle}
            className={`w-9 h-5 rounded-full transition-colors relative p-0.5 focus:outline-none cursor-pointer ${
              isEnabled ? 'bg-sky-500' : 'bg-slate-700'
            }`}
            aria-label={`Toggle ${sound.name}`}
          >
            <div
              className={`w-4 h-4 rounded-full bg-white transition-transform ${
                isEnabled ? 'translate-x-4' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        <p className="text-[11px] text-slate-400 mb-3 line-clamp-1">
          {sound.description}
        </p>
      </div>

      {/* Volume Slider */}
      <div className="flex items-center gap-2 pt-1">
        <button
          type="button"
          onClick={handleMuteToggle}
          className="text-slate-400 hover:text-slate-200 p-0.5 cursor-pointer"
          title={sound.volume === 0 ? 'Unmute' : 'Mute'}
          aria-label={sound.volume === 0 || !isEnabled ? `Unmute ${sound.name}` : `Mute ${sound.name}`}
        >
          {sound.volume === 0 || !isEnabled ? (
            <VolumeX className="w-3.5 h-3.5 text-slate-500" />
          ) : (
            <Volume2 className="w-3.5 h-3.5 text-sky-400" />
          )}
        </button>

        <input
          type="range"
          min="0"
          max="1"
          step="0.02"
          value={isEnabled ? sound.volume : 0}
          disabled={!isEnabled}
          onChange={handleVolumeChange}
          className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-sky-400 disabled:opacity-30 disabled:cursor-not-allowed"
          aria-label={`${sound.name} volume`}
        />
      </div>
    </div>
  );
}, areSoundControlPropsEqual);

interface PresetCardProps {
  preset: MixPreset;
  isSelected: boolean;
  isPlaying: boolean;
  isFav: boolean;
  isLoggedIn: boolean;
  isAdmin: boolean;
  recommendation: ReturnType<typeof getRecommendedProductForPreset>;
  onApplyPreset: (preset: MixPreset) => void;
  onTogglePlay?: () => void;
  onToggleFavorite: (id: string, e?: React.MouseEvent) => void;
  onDownloadPreset: (preset: MixPreset, e?: React.MouseEvent) => void;
  onExportWavClick: (preset: MixPreset, e?: React.MouseEvent) => void;
  onDeletePreset: (id: string, e: React.MouseEvent) => void;
  onOpenShopProduct?: (productId: string) => void;
}

function arePresetCardPropsEqual(prev: PresetCardProps, next: PresetCardProps) {
  return (
    prev.preset.id === next.preset.id &&
    prev.isSelected === next.isSelected &&
    prev.isPlaying === next.isPlaying &&
    prev.isFav === next.isFav &&
    prev.isLoggedIn === next.isLoggedIn &&
    prev.isAdmin === next.isAdmin &&
    prev.preset.name === next.preset.name &&
    prev.preset.icon === next.preset.icon &&
    prev.preset.baseFreq === next.preset.baseFreq &&
    prev.recommendation?.productId === next.recommendation?.productId
  );
}

const PresetCard = React.memo<PresetCardProps>(function PresetCard({
  preset,
  isSelected,
  isPlaying,
  isFav,
  isLoggedIn,
  isAdmin,
  recommendation: rec,
  onApplyPreset,
  onTogglePlay,
  onToggleFavorite,
  onDownloadPreset,
  onExportWavClick,
  onDeletePreset,
  onOpenShopProduct,
}) {
  const activeLayers = useMemo(
    () => Object.entries(preset.natureLevels).filter(([_, vol]) => vol > 0),
    [preset.natureLevels]
  );

  const cardStyle = useMemo(() => {
    if (isSelected) {
      return {
        card: 'bg-gradient-to-br from-sky-900/80 via-indigo-950 to-purple-900/80 border-sky-400 ring-2 ring-sky-400/60 shadow-xl shadow-sky-500/25',
        badge: 'bg-gradient-to-br from-sky-400 via-teal-400 to-indigo-500 text-slate-950 border-sky-350 font-bold shadow-lg shadow-sky-500/35 ring-1 ring-white/30',
        freqBadge: 'bg-sky-950/90 border-sky-400/80 text-sky-200 font-semibold shadow-sm shadow-sky-500/20',
        accentText: 'text-sky-300',
        layerPill: 'bg-sky-950/80 text-sky-200 border-sky-500/40',
      };
    }
    switch (preset.category) {
      case 'sleep':
        return {
          card: 'bg-gradient-to-br from-indigo-950/80 via-slate-900/90 to-purple-950/70 border-indigo-500/40 hover:border-indigo-400 shadow-lg shadow-indigo-950/50 hover:shadow-indigo-500/20',
          badge: 'bg-gradient-to-br from-indigo-500/30 to-purple-500/30 text-indigo-200 border-indigo-400/50 shadow-md shadow-indigo-500/20',
          freqBadge: 'bg-indigo-950/90 border-indigo-500/50 text-indigo-300 font-semibold',
          accentText: 'text-indigo-300',
          layerPill: 'bg-indigo-950/80 text-indigo-200 border-indigo-500/40',
        };
      case 'meditation':
        return {
          card: 'bg-gradient-to-br from-emerald-950/80 via-slate-900/90 to-teal-950/70 border-emerald-500/40 hover:border-emerald-400 shadow-lg shadow-emerald-950/50 hover:shadow-emerald-500/20',
          badge: 'bg-gradient-to-br from-emerald-500/30 to-teal-500/30 text-emerald-200 border-emerald-400/50 shadow-md shadow-emerald-500/20',
          freqBadge: 'bg-emerald-950/90 border-emerald-500/50 text-emerald-300 font-semibold',
          accentText: 'text-emerald-300',
          layerPill: 'bg-emerald-950/80 text-emerald-200 border-emerald-500/40',
        };
      case 'healing':
        return {
          card: 'bg-gradient-to-br from-amber-950/80 via-slate-900/90 to-rose-950/70 border-amber-500/40 hover:border-amber-400 shadow-lg shadow-amber-950/50 hover:shadow-amber-500/20',
          badge: 'bg-gradient-to-br from-amber-500/30 to-rose-500/30 text-amber-200 border-amber-400/50 shadow-md shadow-amber-500/20',
          freqBadge: 'bg-amber-950/90 border-amber-500/50 text-amber-300 font-semibold',
          accentText: 'text-amber-300',
          layerPill: 'bg-amber-950/80 text-amber-200 border-amber-500/40',
        };
      case 'nature':
        return {
          card: 'bg-gradient-to-br from-cyan-950/80 via-slate-900/90 to-sky-950/70 border-cyan-500/40 hover:border-cyan-400 shadow-lg shadow-cyan-950/50 hover:shadow-cyan-500/20',
          badge: 'bg-gradient-to-br from-cyan-500/30 to-sky-500/30 text-cyan-200 border-cyan-400/50 shadow-md shadow-cyan-500/20',
          freqBadge: 'bg-cyan-950/90 border-cyan-500/50 text-cyan-300 font-semibold',
          accentText: 'text-cyan-300',
          layerPill: 'bg-cyan-950/80 text-cyan-200 border-cyan-500/40',
        };
      case 'focus':
        return {
          card: 'bg-gradient-to-br from-violet-950/80 via-slate-900/90 to-fuchsia-950/70 border-violet-500/40 hover:border-violet-400 shadow-lg shadow-violet-950/50 hover:shadow-violet-500/20',
          badge: 'bg-gradient-to-br from-violet-500/30 to-fuchsia-500/30 text-violet-200 border-violet-400/50 shadow-md shadow-violet-500/20',
          freqBadge: 'bg-violet-950/90 border-violet-500/50 text-violet-300 font-semibold',
          accentText: 'text-violet-300',
          layerPill: 'bg-violet-950/80 text-violet-200 border-violet-500/40',
        };
      default:
        return {
          card: 'bg-gradient-to-br from-slate-900 via-indigo-950/40 to-slate-900 border-slate-700 hover:border-sky-500/60 shadow-md',
          badge: 'bg-gradient-to-br from-sky-500/20 to-indigo-500/20 text-sky-200 border-sky-500/40',
          freqBadge: 'bg-slate-900 border-slate-700 text-sky-300 font-semibold',
          accentText: 'text-sky-300',
          layerPill: 'bg-slate-900/80 text-slate-200 border-slate-700',
        };
    }
  }, [isSelected, preset.category]);

  return (
    <div
      onClick={() => {
        if (isSelected && isPlaying) {
          if (onTogglePlay) onTogglePlay();
        } else {
          onApplyPreset(preset);
        }
      }}
      className={`p-4 rounded-2xl border transition-all duration-300 cursor-pointer flex flex-col justify-between group ${cardStyle.card}`}
    >
      <div>
        <div className="flex items-start justify-between gap-2.5 mb-2.5">
          <div className="flex items-center gap-3 min-w-0">
            {/* Unique Soundscape Preset Icon Badge */}
            <div
              className={`w-10 h-10 rounded-2xl flex items-center justify-center text-xl shrink-0 border transition-transform duration-300 group-hover:scale-110 shadow-sm ${cardStyle.badge}`}
              title={`${preset.name} (${preset.category})`}
            >
              {preset.icon || '✨'}
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="font-semibold text-xs sm:text-sm text-slate-100 truncate group-hover:text-sky-300 transition-colors">
                  {preset.name}
                </span>
                {preset.isCustom && (
                  <span className="text-[9px] bg-purple-500/20 text-purple-300 border border-purple-500/30 px-1.5 py-0.2 rounded font-bold uppercase shrink-0">
                    Custom
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${cardStyle.freqBadge}`}>
                  {preset.baseFreq}Hz
                </span>
                <span className="text-[10px] font-medium text-slate-400 capitalize">
                  {preset.category}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {/* Favorite Preset Heart Button */}
            <button
              type="button"
              onClick={(e) => onToggleFavorite(preset.id, e)}
              className={`w-8 h-8 rounded-lg border inline-flex items-center justify-center shrink-0 transition-all active:scale-90 cursor-pointer ${
                isFav
                  ? 'bg-rose-500/20 border-rose-500/40 text-rose-400'
                  : 'bg-slate-900/80 border-slate-750 text-slate-500 hover:text-rose-400 hover:border-slate-650'
              }`}
              title={isFav ? 'Remove from Favorite Presets' : 'Save to Favorite Presets'}
              aria-label={isFav ? 'Remove from favorites' : 'Add to favorites'}
            >
              <Heart className={`w-3.5 h-3.5 transition-transform ${isFav ? 'fill-rose-500 text-rose-500 scale-105' : ''}`} />
            </button>

            {/* Download / Protection Controls */}
            {preset.isCustom ? (
              // Custom Preset: Downloadable by Logged-in Users & Admin
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={(e) => onDownloadPreset(preset, e)}
                  className={`w-8 h-8 rounded-lg border inline-flex items-center justify-center shrink-0 transition-all active:scale-90 cursor-pointer ${
                    isLoggedIn || isAdmin
                      ? 'bg-purple-950/60 border-purple-500/40 text-purple-300 hover:bg-purple-900/60 hover:text-purple-200'
                      : 'bg-slate-900/80 border-slate-750 text-slate-500 hover:text-amber-400 hover:border-amber-500/40'
                  }`}
                  title={
                    isLoggedIn || isAdmin
                      ? 'Download Custom Preset JSON'
                      : 'Member Exclusive: Log in to download custom presets'
                  }
                  aria-label="Download preset JSON"
                >
                  {isLoggedIn || isAdmin ? (
                    <Download className="w-3.5 h-3.5" />
                  ) : (
                    <Lock className="w-3.5 h-3.5 text-amber-400" />
                  )}
                </button>

                {onExportWavClick && (
                  <button
                    type="button"
                    onClick={(e) => onExportWavClick(preset, e)}
                    className="w-8 h-8 rounded-lg border bg-emerald-950/60 border-emerald-500/40 text-emerald-300 hover:bg-emerald-900/60 hover:text-emerald-100 transition-all active:scale-95 cursor-pointer inline-flex items-center justify-center shrink-0 group"
                    title={`Export Offline Audio (Studio WAV / MP3) for "${preset.name}"`}
                    aria-label={`Export Offline Audio for ${preset.name}`}
                  >
                    <Download className="w-3.5 h-3.5 text-emerald-400 group-hover:scale-110 transition-transform" />
                  </button>
                )}
              </div>
            ) : (
              // Built-In Soundscape Preset: Allow exporting offline studio WAV / MP3
              <div className="flex items-center gap-1.5">
                {onExportWavClick && (
                  <button
                    type="button"
                    onClick={(e) => onExportWavClick(preset, e)}
                    className="w-8 h-8 rounded-lg border bg-emerald-950/60 border-emerald-500/40 text-emerald-300 hover:bg-emerald-900/60 hover:text-emerald-100 transition-all active:scale-95 cursor-pointer inline-flex items-center justify-center shrink-0 group"
                    title={`Export Offline Audio (Studio WAV / MP3) for "${preset.name}"`}
                    aria-label={`Export Offline Audio for ${preset.name}`}
                  >
                    <Download className="w-3.5 h-3.5 text-emerald-400 group-hover:scale-110 transition-transform" />
                  </button>
                )}

                {isAdmin && (
                  <button
                    type="button"
                    onClick={(e) => onDownloadPreset(preset, e)}
                    className="w-8 h-8 rounded-lg border inline-flex items-center justify-center shrink-0 bg-sky-950/60 border-sky-500/40 text-sky-300 hover:bg-sky-900/60 transition-all active:scale-90 cursor-pointer"
                    title="Admin Download: Creator Preset JSON"
                    aria-label="Admin download"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            )}

            {preset.isCustom && (
              <button
                type="button"
                onClick={(e) => onDeletePreset(preset.id, e)}
                className="w-8 h-8 rounded-lg border border-slate-750 bg-slate-900/80 text-slate-400 hover:text-rose-400 hover:border-rose-500/40 inline-flex items-center justify-center shrink-0 transition-colors cursor-pointer"
                title="Delete Custom Preset"
                aria-label="Delete Custom Preset"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        <p className="text-[11px] text-slate-300 line-clamp-2 leading-relaxed mb-3">
          {preset.description}
        </p>
      </div>

      <div className="pt-2.5 border-t border-slate-800/80 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 overflow-hidden flex-wrap">
          {activeLayers.slice(0, 3).map(([soundId]) => (
            <span
              key={soundId}
              className={`text-[10px] px-2 py-0.5 rounded-lg border capitalize truncate max-w-[85px] font-medium shadow-xs ${cardStyle.layerPill}`}
            >
              {soundId}
            </span>
          ))}
          {activeLayers.length > 3 && (
            <span className="text-[10px] text-sky-400 font-mono font-semibold">
              +{activeLayers.length - 3}
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            if (isSelected && isPlaying) {
              if (onTogglePlay) onTogglePlay();
            } else {
              onApplyPreset(preset);
            }
          }}
          className={`text-xs px-3.5 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1.5 shrink-0 shadow-md cursor-pointer active:scale-95 ${
            isSelected && isPlaying
              ? 'bg-gradient-to-r from-rose-500 to-pink-600 text-white hover:brightness-110 shadow-rose-500/30 animate-soundscape-active'
              : isSelected
              ? 'bg-gradient-to-r from-sky-400 to-indigo-500 text-slate-950 hover:brightness-110 shadow-sky-400/25'
              : 'bg-slate-800/90 hover:bg-gradient-to-r hover:from-sky-400 hover:to-indigo-500 hover:text-slate-950 text-slate-200 border border-slate-700'
          }`}
          title={isSelected && isPlaying ? 'Pause soundscape' : `Play ${preset.name}`}
        >
          {isSelected && isPlaying ? (
            <>
              <Pause className="w-3.5 h-3.5 fill-current" />
              <span>Pause</span>
            </>
          ) : (
            <>
              <Play className="w-3.5 h-3.5 fill-current text-sky-400 group-hover:text-slate-950" />
              <span>Play</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}, arePresetCardPropsEqual);

interface NatureMixerProps {
  sounds: NatureSoundState[];
  onSoundChange: (id: string, enabled: boolean, volume: number) => void;
  onApplyPreset: (preset: MixPreset) => void;
  currentPresetId?: string;
  isVolumeNormalized?: boolean;
  onToggleVolumeNormalized?: () => void;
  isPlaying?: boolean;
  onTogglePlay?: () => void;
  isLoggedIn?: boolean;
  isAdmin?: boolean;
  onOpenLogin?: () => void;
  onExportWavForPreset?: (preset: MixPreset) => void;
  onOpenShopProduct?: (productId: string) => void;
  isMusicalMode?: boolean;
  onToggleMusicalMode?: () => void;
  musicalVolume?: number;
  onMusicalVolumeChange?: (vol: number) => void;
  baseFreq?: number;
}

const NatureMixerComponent: React.FC<NatureMixerProps> = ({
  sounds,
  onSoundChange,
  onApplyPreset,
  currentPresetId,
  isVolumeNormalized = true,
  onToggleVolumeNormalized,
  isPlaying = false,
  onTogglePlay,
  isLoggedIn = false,
  isAdmin = false,
  onOpenLogin,
  onExportWavForPreset,
  onOpenShopProduct,
  isMusicalMode = false,
  onToggleMusicalMode,
  musicalVolume = 0.35,
  onMusicalVolumeChange,
  baseFreq = 432,
}) => {
  const [customPresets, setCustomPresets] = useState<MixPreset[]>(() => getCustomPresets());
  const [favoritePresetIds, setFavoritePresetIds] = useState<string[]>(() => getFavoritePresetIds());
  const [isSavingPreset, setIsSavingPreset] = useState(false);
  const [newPresetName, setNewPresetName] = useState('');
  const [newPresetCategory, setNewPresetCategory] = useState<PresetCategory>('meditation');
  const [selectedPresetCategory, setSelectedPresetCategory] = useState<PresetFilterCategory>('all');
  const [selectedFreqFilter, setSelectedFreqFilter] = useState<number | 'all'>('all');
  const [soundCategoryFilter, setSoundCategoryFilter] = useState<'all' | 'nature' | 'musical' | 'sacred'>('all');
  const [showNormalizationInfo, setShowNormalizationInfo] = useState(false);

  const activeCount = useMemo(() => sounds.filter((s) => s.enabled).length, [sounds]);
  const previouslyActiveSoundsRef = useRef<{ id: string; volume: number }[]>([]);

  const handleMuteAll = useCallback(() => {
    const active = sounds
      .filter((s) => s.enabled)
      .map((s) => ({ id: s.id, volume: s.volume }));
    if (active.length > 0) {
      previouslyActiveSoundsRef.current = active;
    }
    sounds.forEach((s) => {
      if (s.enabled) {
        onSoundChange(s.id, false, s.volume);
      }
    });
  }, [sounds, onSoundChange]);

  const handleUnmuteAll = useCallback(() => {
    if (previouslyActiveSoundsRef.current.length > 0) {
      previouslyActiveSoundsRef.current.forEach((saved) => {
        onSoundChange(saved.id, true, saved.volume > 0 ? saved.volume : 0.45);
      });
    } else {
      const defaultSoundIds = ['ocean', 'stream', 'forest_birds', 'rain'];
      sounds.forEach((s) => {
        if (defaultSoundIds.includes(s.id)) {
          onSoundChange(s.id, true, s.volume > 0 ? s.volume : 0.45);
        }
      });
    }
  }, [sounds, onSoundChange]);

  const handleRandomizeMix = useCallback(() => {
    sounds.forEach((s) => {
      const enable = Math.random() > 0.65;
      const vol = enable ? 0.25 + Math.random() * 0.45 : 0;
      onSoundChange(s.id, enable, vol);
    });
  }, [sounds, onSoundChange]);

  const handleSavePreset = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (!newPresetName.trim()) return;

    const levels: Record<string, number> = {};
    sounds.forEach((s) => {
      levels[s.id] = s.enabled ? s.volume : 0;
    });

    const newPreset: MixPreset = {
      id: `custom_${Date.now()}`,
      name: newPresetName.trim(),
      description: 'Personalized multi-layer sound blend',
      category: newPresetCategory,
      isCustom: true,
      baseFreq: 432,
      brainwaveMode: 'alpha_healing',
      icon: (() => {
        const existing = new Set(allPresets.map((p) => p.icon));
        const candidates = ['🎶', '🪐', '🍃', '🌺', '🌈', '🪷', '🎵', '🌻', '🌲', '🦋', '💫', '☀️', '🍁', '🐚', '🪶'];
        return candidates.find((ic) => !existing.has(ic)) || '🎶';
      })(),
      natureLevels: levels,
      tags: ['Custom', `${activeCount} Sounds`],
    };

    saveCustomPreset(newPreset);
    setCustomPresets(getCustomPresets());
    setNewPresetName('');
    setIsSavingPreset(false);
    onApplyPreset(newPreset);
  }, [newPresetName, newPresetCategory, sounds, activeCount, onApplyPreset]);

  const handleDeletePreset = useCallback((id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    deleteCustomPreset(id);
    setCustomPresets(getCustomPresets());
  }, []);

  const handleToggleFavorite = useCallback((id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const updated = toggleFavoritePresetId(id);
    setFavoritePresetIds(updated);
  }, []);

  const [presetSearchQuery, setPresetSearchQuery] = useState('');
  const [layerSearchQuery, setLayerSearchQuery] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [downloadNotice, setDownloadNotice] = useState<{ message: string; type: 'success' | 'warning' | 'info' } | null>(null);

  const handleDownloadPreset = useCallback((preset: MixPreset, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();

    // Check if trying to download built-in (creator) preset
    if (!preset.isCustom) {
      if (!isAdmin) {
        setDownloadNotice({
          message: `The sanctuary creator's built-in soundscape "${preset.name}" is protected and streaming-only. You cannot download built-in presets. Save this mix as your own Custom Preset to download it!`,
          type: 'warning',
        });
        setTimeout(() => setDownloadNotice(null), 6500);
        return;
      }
    }

    // If custom preset, check user login status
    if (preset.isCustom && !isLoggedIn && !isAdmin) {
      setDownloadNotice({
        message: 'Custom preset downloads are reserved for registered sanctuary members and admins. Please log in or join free to download your presets!',
        type: 'info',
      });
      setTimeout(() => setDownloadNotice(null), 5500);
      if (onOpenLogin) onOpenLogin();
      return;
    }

    // Perform JSON download safely via downloadJSON utility
    try {
      const exportData = {
        aura432PresetVersion: '1.0',
        exportedAt: new Date().toISOString(),
        isCustom: true,
        preset: {
          id: preset.id,
          name: preset.name,
          description: preset.description,
          category: preset.category,
          baseFreq: preset.baseFreq,
          brainwaveMode: preset.brainwaveMode,
          natureLevels: preset.natureLevels,
          tags: preset.tags,
        },
      };

      const safeName = preset.name.replace(/[^a-z0-9]/gi, '_');
      downloadJSON(exportData, `Aura432-Preset-${safeName}.json`);

      setDownloadNotice({
        message: `Preset "${preset.name}" exported as JSON successfully!`,
        type: 'success',
      });
      setTimeout(() => setDownloadNotice(null), 4000);
    } catch (err) {
      console.error('Download error:', err);
    }
  }, [isAdmin, isLoggedIn, onOpenLogin]);

  // Handle Import Custom Preset JSON File
  const handleImportPresetClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileImportChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const parsed = JSON.parse(text);

        // Support both wrapped export { preset: {...} } and direct preset objects
        const rawPreset = parsed.preset || parsed;
        if (!rawPreset || !rawPreset.name || !rawPreset.natureLevels) {
          throw new Error('Invalid preset file structure. Missing preset name or natureLevels.');
        }

        const importedPreset: MixPreset = {
          id: `custom_${Date.now()}`,
          name: `${rawPreset.name} (Imported)`.trim(),
          description: rawPreset.description || 'Imported custom soundscape blend',
          category: rawPreset.category || 'meditation',
          isCustom: true,
          baseFreq: typeof rawPreset.baseFreq === 'number' ? rawPreset.baseFreq : 432,
          brainwaveMode: rawPreset.brainwaveMode || 'alpha_healing',
          natureLevels: rawPreset.natureLevels || {},
          tags: Array.isArray(rawPreset.tags) ? [...rawPreset.tags, 'Imported'] : ['Custom', 'Imported'],
        };

        saveCustomPreset(importedPreset);
        setCustomPresets(getCustomPresets());
        onApplyPreset(importedPreset);

        setDownloadNotice({
          message: `Preset "${importedPreset.name}" imported and applied to player successfully!`,
          type: 'success',
        });
        setTimeout(() => setDownloadNotice(null), 5000);
      } catch (err: any) {
        setDownloadNotice({
          message: `Failed to import preset: ${err?.message || 'Invalid JSON file format'}`,
          type: 'warning',
        });
        setTimeout(() => setDownloadNotice(null), 6000);
      } finally {
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    };
    reader.readAsText(file);
  };

  const handleExportWavClick = useCallback((preset: MixPreset, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (onExportWavForPreset) {
      onExportWavForPreset(preset);
    }
  }, [onExportWavForPreset]);

  // Filter Presets by Category and Frequency (Memoized with useMemo to eliminate playback lag)
  const allPresets = useMemo(
    () => [...BUILT_IN_MIX_PRESETS, ...customPresets],
    [customPresets]
  );

  const filteredPresets = useMemo(() => {
    const query = presetSearchQuery.trim().toLowerCase();
    return allPresets.filter((p) => {
      const matchCategory =
        selectedPresetCategory === 'all'
          ? true
          : selectedPresetCategory === 'favorites'
          ? favoritePresetIds.includes(p.id)
          : selectedPresetCategory === 'custom'
          ? Boolean(p.isCustom)
          : p.category === selectedPresetCategory;
      const matchFreq =
        selectedFreqFilter === 'all' ? true : p.baseFreq === selectedFreqFilter;

      const matchSearch =
        !query ||
        p.name.toLowerCase().includes(query) ||
        p.description.toLowerCase().includes(query) ||
        p.category.toLowerCase().includes(query) ||
        `${p.baseFreq}hz`.includes(query) ||
        `${p.baseFreq}`.includes(query) ||
        (p.tags && p.tags.some((t) => t.toLowerCase().includes(query)));

      return matchCategory && matchFreq && matchSearch;
    });
  }, [allPresets, selectedPresetCategory, favoritePresetIds, selectedFreqFilter, presetSearchQuery]);

  const filteredSounds = useMemo(() => {
    const query = layerSearchQuery.trim().toLowerCase();
    let result = sounds;
    if (soundCategoryFilter !== 'all') {
      result = result.filter((s) => s.category === soundCategoryFilter);
    }
    if (query) {
      result = result.filter(
        (s) =>
          s.name.toLowerCase().includes(query) ||
          s.category.toLowerCase().includes(query) ||
          (s.description && s.description.toLowerCase().includes(query))
      );
    }
    return result;
  }, [sounds, soundCategoryFilter, layerSearchQuery]);

  const activeCategoryMeta = useMemo(
    () => PRESET_CATEGORIES.find((c) => c.id === selectedPresetCategory),
    [selectedPresetCategory]
  );

  const freqCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    const freqs: (number | 'all')[] = ['all', 432, 528, 174, 285, 396, 639, 741, 852, 963];
    freqs.forEach((freq) => {
      counts[String(freq)] = allPresets.filter((p) => {
        const matchCat =
          selectedPresetCategory === 'all'
            ? true
            : selectedPresetCategory === 'custom'
            ? Boolean(p.isCustom)
            : p.category === selectedPresetCategory;
        return matchCat && (freq === 'all' || p.baseFreq === freq);
      }).length;
    });
    return counts;
  }, [allPresets, selectedPresetCategory]);

  const presetRecommendations = useMemo(() => {
    const map = new Map<string, ReturnType<typeof getRecommendedProductForPreset>>();
    allPresets.forEach((p) => {
      map.set(p.id, getRecommendedProductForPreset(p));
    });
    return map;
  }, [allPresets]);

  const soundCategoryCounts = useMemo(() => {
    return {
      all: sounds.length,
      nature: sounds.filter((s) => s.category === 'nature').length,
      musical: sounds.filter((s) => s.category === 'musical').length,
      sacred: sounds.filter((s) => s.category === 'sacred').length,
    };
  }, [sounds]);

  const soundCategoryFilterTabs = useMemo(() => [
    { id: 'all' as const, label: `All (${soundCategoryCounts.all})` },
    { id: 'nature' as const, label: `Nature (${soundCategoryCounts.nature})` },
    { id: 'musical' as const, label: `Musical (${soundCategoryCounts.musical})` },
    { id: 'sacred' as const, label: `Sacred (${soundCategoryCounts.sacred})` },
  ], [soundCategoryCounts]);

  return (
    <div className="space-y-6">
      {/* 1. TOP HEADER & STUDIO TOOLS BAR */}
      <div className="bg-slate-900/70 backdrop-blur-xl border border-slate-800 rounded-3xl p-5 md:p-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-lg font-medium text-slate-100 flex items-center gap-2">
                <Wind className="w-5 h-5 text-sky-400" />
                Nature & Acoustic Sound Mixer
              </h3>
              <span className="text-xs bg-slate-800 text-sky-300 px-2.5 py-0.5 rounded-full border border-slate-700 font-mono font-medium">
                {activeCount} Active Layers
              </span>
              <span className="text-xs bg-emerald-950/60 text-emerald-400 border border-emerald-800/60 px-2.5 py-0.5 rounded-full font-medium">
                100% Offline Engine
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed max-w-2xl">
              Synthesize organic 432Hz soundscapes with rain, wind, singing bowls, chimes, and flutes.
            </p>
          </div>

          {/* Quick Action Tools */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={handleRandomizeMix}
              className="text-xs inline-flex items-center justify-center gap-1.5 px-3 py-1.5 min-h-[36px] bg-slate-800/90 hover:bg-slate-750 text-slate-200 rounded-xl transition-colors border border-slate-700/80 active:scale-95 shadow-sm cursor-pointer whitespace-nowrap"
              title="Generate random acoustic blend"
            >
              <Dices className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
              <span>Random Blend</span>
            </button>

            {activeCount > 0 ? (
              <button
                type="button"
                onClick={handleMuteAll}
                className="text-xs inline-flex items-center justify-center gap-1.5 px-3 py-1.5 min-h-[36px] bg-slate-800/90 hover:bg-slate-750 text-rose-300 rounded-xl transition-colors border border-slate-700/80 active:scale-95 shadow-sm cursor-pointer whitespace-nowrap"
                title="Mute all active nature sound layers"
              >
                <VolumeX className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                <span>Mute All</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleUnmuteAll}
                className="text-xs inline-flex items-center justify-center gap-1.5 px-3 py-1.5 min-h-[36px] bg-slate-800/90 hover:bg-slate-750 text-emerald-300 rounded-xl transition-colors border border-slate-700/80 active:scale-95 shadow-sm cursor-pointer whitespace-nowrap"
                title="Unmute & activate ambient nature soundscape"
              >
                <Volume2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Unmute All</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => setIsSavingPreset(!isSavingPreset)}
              className="text-xs inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 min-h-[36px] bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 rounded-xl transition-colors border border-sky-500/40 active:scale-95 font-medium shadow-sm cursor-pointer whitespace-nowrap"
            >
              <BookmarkPlus className="w-3.5 h-3.5 shrink-0" />
              <span>Save Mix</span>
            </button>

            <button
              type="button"
              onClick={handleImportPresetClick}
              className="text-xs inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 min-h-[36px] bg-purple-500/20 hover:bg-purple-500/30 text-purple-200 rounded-xl transition-colors border border-purple-500/40 active:scale-95 font-medium shadow-sm cursor-pointer whitespace-nowrap"
              title="Import custom soundscape JSON preset"
            >
              <FileUp className="w-3.5 h-3.5 shrink-0" />
              <span>Import Preset</span>
            </button>

            {/* Hidden JSON file input for Import Preset */}
            <input
              ref={fileInputRef}
              type="file"
              accept=".json,application/json"
              className="hidden"
              onChange={handleFileImportChange}
            />
          </div>
        </div>

        {/* 2. VOLUME NORMALIZATION (EBU R128 & DYNAMIC HEADROOM LIMITER) */}
        <div className="mt-4 p-4 rounded-2xl bg-gradient-to-r from-slate-900/90 via-slate-850 to-indigo-950/20 border border-slate-800/90 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-md">
          <div className="flex items-start sm:items-center gap-3">
            <div className={`p-2.5 rounded-xl border shrink-0 transition-colors ${
              isVolumeNormalized
                ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400'
                : 'bg-slate-800 border-slate-700 text-slate-500'
            }`}>
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs sm:text-sm font-semibold text-slate-200">
                  Volume Normalization (EBU R128 Studio Limiter)
                </span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                  isVolumeNormalized
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    : 'bg-slate-800 text-slate-400 border border-slate-700'
                }`}>
                  {isVolumeNormalized ? 'Active' : 'Off'}
                </span>
                <button
                  type="button"
                  onClick={() => setShowNormalizationInfo(!showNormalizationInfo)}
                  className="text-slate-500 hover:text-slate-300 transition-colors"
                  title="How volume normalization works"
                >
                  <Info className="w-3.5 h-3.5" />
                </button>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Automatically balances perceived loudness across presets and prevents digital clipping when stacking multiple sound layers.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0 self-end md:self-center">
            {isVolumeNormalized && (
              <span className="text-[11px] font-mono text-emerald-400/90 hidden lg:inline">
                Equal-Loudness Headroom Protected
              </span>
            )}
            <button
              type="button"
              onClick={() => onToggleVolumeNormalized ? onToggleVolumeNormalized() : audioEngine.setVolumeNormalization(!isVolumeNormalized)}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                isVolumeNormalized ? 'bg-emerald-500' : 'bg-slate-700'
              }`}
              role="switch"
              aria-checked={isVolumeNormalized}
              title={isVolumeNormalized ? 'Disable volume normalization' : 'Enable volume normalization'}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                  isVolumeNormalized ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Normalization Info Explainer Dropdown */}
        {showNormalizationInfo && (
          <div className="mt-3 p-3.5 rounded-xl bg-slate-900/95 border border-sky-500/30 text-xs text-slate-300 space-y-2 animate-in fade-in">
            <div className="font-semibold text-sky-300 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Why Volume Normalization is essential for sound therapy:
            </div>
            <ul className="list-disc pl-4 space-y-1 text-slate-400 text-[11px] leading-relaxed">
              <li>
                <strong>Consistent Loudness:</strong> Switching from a single Singing Bowl tone to a heavy 5-layer Forest Storm won't blast your ears or wake you up.
              </li>
              <li>
                <strong>Equal-Loudness Summation:</strong> Automatically scales the master bus headroom based on active layers using studio power summation.
              </li>
              <li>
                <strong>Broadcast Soft-Knee Limiter:</strong> Fast 3ms lookahead catching transients without introducing harsh digital clipping or fatigue.
              </li>
            </ul>
          </div>
        )}

        {/* Save Preset Form Dialog */}
        {isSavingPreset && (
          <form onSubmit={handleSavePreset} className="mt-4 p-4 bg-slate-800/80 border border-sky-500/30 rounded-2xl space-y-3 animate-in fade-in">
            <div className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
              <BookmarkPlus className="w-4 h-4 text-sky-400" />
              Save Current Mix as Personalized Preset
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
              <div className="sm:col-span-8">
                <input
                  type="text"
                  placeholder="Preset Name (e.g., Midnight Rain & Bowls)"
                  value={newPresetName}
                  onChange={(e) => setNewPresetName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-100 focus:outline-none focus:border-sky-400"
                  aria-label="Preset Name"
                  autoFocus
                />
              </div>
              <div className="sm:col-span-4">
                <select
                  value={newPresetCategory}
                  onChange={(e) => setNewPresetCategory(e.target.value as PresetCategory)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-sky-400"
                  aria-label="Preset Category"
                >
                  <option value="sleep">Sleep & Rest</option>
                  <option value="meditation">Meditation & Zen</option>
                  <option value="healing">Ambient Restoration</option>
                  <option value="nature">Wild Nature</option>
                  <option value="focus">Flow & Focus</option>
                </select>
              </div>
            </div>
            <div className="flex items-center gap-2 justify-end">
              <button
                type="button"
                onClick={() => setIsSavingPreset(false)}
                className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-300 text-xs rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!newPresetName.trim()}
                className="px-4 py-1.5 bg-sky-500 hover:bg-sky-400 disabled:opacity-50 text-slate-950 font-semibold text-xs rounded-xl transition-colors flex items-center gap-1.5"
              >
                <Check className="w-3.5 h-3.5" /> Save Preset
              </button>
            </div>
          </form>
        )}
      </div>

      {/* 3. PRESET CATEGORIES & SOUNDSCAPE LIBRARY */}
      <div className="bg-slate-900/70 backdrop-blur-xl border border-slate-800 rounded-3xl p-5 md:p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
          <div>
            <h4 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              Soundscape Preset Categories
            </h4>
            <p className="text-xs text-slate-400 mt-0.5">
              {activeCategoryMeta?.tagline || 'Curated acoustic blends tuned to sacred harmonic frequencies'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-mono">
              Showing {filteredPresets.length} of {allPresets.length} Presets
            </span>
          </div>
        </div>

        {/* Search Soundscapes Tool */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search soundscapes by name, frequency (432, 528), tag, or keyword..."
            value={presetSearchQuery}
            onChange={(e) => setPresetSearchQuery(e.target.value)}
            className="w-full pl-10 pr-9 py-2 bg-slate-950/80 border border-slate-800 rounded-2xl text-xs sm:text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-sky-400 transition-colors"
            aria-label="Search soundscapes by name, frequency, or keyword"
          />
          {presetSearchQuery && (
            <button
              type="button"
              onClick={() => setPresetSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 w-6 h-6 inline-flex items-center justify-center text-slate-400 hover:text-slate-200 rounded-md cursor-pointer"
              title="Clear search"
              aria-label="Clear soundscape search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Preset Category Switcher Pills (Wrap cleanly without horizontal scrolling cut-off) */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {PRESET_CATEGORIES.map((cat) => {
            const isSelected = selectedPresetCategory === cat.id;
            const count = allPresets.filter((p) => {
              if (cat.id === 'all') return true;
              if (cat.id === 'favorites') return favoritePresetIds.includes(p.id);
              if (cat.id === 'custom') return Boolean(p.isCustom);
              return p.category === cat.id;
            }).length;

            const getCategoryActiveStyle = (id: string) => {
              switch (id) {
                case 'favorites':
                  return 'bg-gradient-to-r from-rose-500/30 to-pink-500/30 border-rose-400 text-rose-200 shadow-sm shadow-rose-500/20 font-semibold';
                case 'sleep':
                  return 'bg-gradient-to-r from-indigo-500/30 to-purple-500/30 border-indigo-400 text-indigo-200 shadow-sm shadow-indigo-500/20 font-semibold';
                case 'meditation':
                  return 'bg-gradient-to-r from-emerald-500/30 to-teal-500/30 border-emerald-400 text-emerald-200 shadow-sm shadow-emerald-500/20 font-semibold';
                case 'healing':
                  return 'bg-gradient-to-r from-amber-500/30 to-orange-500/30 border-amber-400 text-amber-200 shadow-sm shadow-amber-500/20 font-semibold';
                case 'nature':
                  return 'bg-gradient-to-r from-cyan-500/30 to-teal-500/30 border-cyan-400 text-cyan-200 shadow-sm shadow-cyan-500/20 font-semibold';
                case 'focus':
                  return 'bg-gradient-to-r from-violet-500/30 to-fuchsia-500/30 border-violet-400 text-violet-200 shadow-sm shadow-violet-500/20 font-semibold';
                case 'custom':
                  return 'bg-gradient-to-r from-purple-500/30 to-pink-500/30 border-purple-400 text-purple-200 shadow-sm shadow-purple-500/20 font-semibold';
                default:
                  return 'bg-gradient-to-r from-sky-500/30 to-indigo-500/30 border-sky-400 text-sky-200 shadow-sm shadow-sky-500/20 font-semibold';
              }
            };

            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedPresetCategory(cat.id)}
                className={`px-3 py-1.5 min-h-[34px] rounded-xl text-xs font-medium whitespace-nowrap transition-all border inline-flex items-center justify-center gap-1.5 cursor-pointer ${
                  isSelected
                    ? getCategoryActiveStyle(cat.id)
                    : 'bg-slate-900/80 hover:bg-slate-800/90 border-slate-750 text-slate-400 hover:text-slate-200'
                }`}
              >
                <span>{cat.label}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-semibold ${
                  isSelected
                    ? 'bg-white/20 text-white'
                    : 'bg-slate-800 text-slate-400'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Sacred Hz Tuning Filter Chips (Wrap cleanly without horizontal scrolling cut-off) */}
        <div className="flex items-center gap-1 flex-wrap pt-1 border-t border-slate-800/50">
          <span className="text-[10px] uppercase font-semibold text-slate-400 mr-1 shrink-0 flex items-center gap-1">
            <Radio className="w-3 h-3 text-sky-400" />
            Tuning Hz:
          </span>
          {[
            { freq: 'all' as const, label: 'All Hz' },
            { freq: 432, label: '432 Hz' },
            { freq: 528, label: '528 Hz' },
            { freq: 174, label: '174 Hz' },
            { freq: 285, label: '285 Hz' },
            { freq: 396, label: '396 Hz' },
            { freq: 639, label: '639 Hz' },
            { freq: 741, label: '741 Hz' },
            { freq: 852, label: '852 Hz' },
            { freq: 963, label: '963 Hz' },
          ].map((item) => {
            const isSelected = selectedFreqFilter === item.freq;
            const count = freqCounts[String(item.freq)] ?? 0;

            if (count === 0 && item.freq !== 'all') return null;

            return (
              <button
                key={String(item.freq)}
                type="button"
                onClick={() => setSelectedFreqFilter(item.freq)}
                className={`text-[11px] font-mono px-2.5 py-1 min-h-[28px] rounded-lg border whitespace-nowrap transition-colors inline-flex items-center justify-center gap-1 cursor-pointer ${
                  isSelected
                    ? 'bg-indigo-500/25 border-indigo-400 text-indigo-200 font-semibold'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <span>{item.label}</span>
                <span className={`text-[9px] px-1 rounded-full ${
                  isSelected ? 'bg-indigo-400/20 text-indigo-300' : 'bg-slate-800 text-slate-500'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Download / Access Restriction Notification Banner */}
        {downloadNotice && (
          <div
            className={`p-3.5 rounded-2xl border text-xs flex items-center justify-between gap-3 animate-in fade-in ${
              downloadNotice.type === 'warning'
                ? 'bg-amber-950/70 border-amber-500/50 text-amber-200'
                : downloadNotice.type === 'success'
                ? 'bg-emerald-950/70 border-emerald-500/50 text-emerald-200'
                : 'bg-sky-950/70 border-sky-500/50 text-sky-200'
            }`}
          >
            <div className="flex items-center gap-2 min-w-0">
              {downloadNotice.type === 'warning' ? (
                <Lock className="w-4 h-4 text-amber-400 shrink-0" />
              ) : downloadNotice.type === 'success' ? (
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-sky-400 shrink-0" />
              )}
              <span className="leading-relaxed">{downloadNotice.message}</span>
            </div>
            <button
              type="button"
              onClick={() => setDownloadNotice(null)}
              className="px-2.5 py-1 min-h-[28px] rounded-lg bg-black/30 hover:bg-black/50 text-slate-300 text-[11px] shrink-0 transition-colors cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Presets Cards Grid */}
        {filteredPresets.length === 0 ? (
          <div className="p-8 text-center bg-slate-900/50 border border-slate-800 rounded-3xl space-y-3">
            <div className="w-12 h-12 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mx-auto">
              <Heart className="w-6 h-6" />
            </div>
            <div className="font-semibold text-sm text-slate-200">
              {presetSearchQuery
                ? `No Soundscapes Match "${presetSearchQuery}"`
                : selectedPresetCategory === 'favorites'
                ? 'No Favorite Soundscapes Bookmarked Yet'
                : 'No Presets Found'}
            </div>
            <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
              {presetSearchQuery
                ? 'Try checking for a different frequency (e.g. "432", "528"), tag ("sleep", "zen", "rain"), or clear your search query.'
                : selectedPresetCategory === 'favorites'
                ? 'Tap the heart icon on any soundscape card below to pin your favorite blends for fast one-tap meditation.'
                : 'Try adjusting your frequency tuning or category filter.'}
            </p>
            {presetSearchQuery ? (
              <button
                type="button"
                onClick={() => setPresetSearchQuery('')}
                className="mt-2 text-xs font-semibold px-4 py-2 min-h-[36px] inline-flex items-center justify-center rounded-xl bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 border border-sky-500/40 transition-colors cursor-pointer"
              >
                Clear Search Query
              </button>
            ) : selectedPresetCategory === 'favorites' ? (
              <button
                type="button"
                onClick={() => setSelectedPresetCategory('all')}
                className="mt-2 text-xs font-semibold px-4 py-2 min-h-[36px] inline-flex items-center justify-center rounded-xl bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 border border-sky-500/40 transition-colors cursor-pointer"
              >
                Browse All 32 Soundscapes
              </button>
            ) : null}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-1">
            {filteredPresets.map((preset) => (
              <PresetCard
                key={preset.id}
                preset={preset}
                isSelected={currentPresetId === preset.id}
                isPlaying={isPlaying}
                isFav={favoritePresetIds.includes(preset.id)}
                isLoggedIn={isLoggedIn}
                isAdmin={isAdmin}
                recommendation={presetRecommendations.get(preset.id) || getRecommendedProductForPreset(preset)}
                onApplyPreset={onApplyPreset}
                onTogglePlay={onTogglePlay}
                onToggleFavorite={handleToggleFavorite}
                onDownloadPreset={handleDownloadPreset}
                onExportWavClick={handleExportWavClick}
                onDeletePreset={handleDeletePreset}
                onOpenShopProduct={onOpenShopProduct}
              />
            ))}
          </div>
        )}
      </div>

      {/* 3.5 MUSICAL MODE & SOLFEGGIO HARMONIC PAD CHANNEL */}
      <div className={`p-4 sm:p-5 rounded-3xl border transition-all shadow-xl ${
        isMusicalMode
          ? 'bg-gradient-to-r from-indigo-950/70 via-slate-900 to-purple-950/60 border-indigo-400/50 shadow-indigo-500/10'
          : 'bg-slate-900/70 backdrop-blur-xl border-slate-800'
      }`}>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 border transition-all ${
              isMusicalMode
                ? 'bg-gradient-to-br from-indigo-500/30 to-purple-500/30 border-indigo-400/60 text-indigo-300 shadow-md shadow-indigo-500/20'
                : 'bg-slate-800/80 border-slate-700 text-slate-400'
            }`}>
              <Music className={`w-5 h-5 ${isMusicalMode ? 'animate-pulse text-indigo-300' : ''}`} />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h4 className="text-sm sm:text-base font-semibold text-slate-100 flex items-center gap-1.5">
                  <span>Musical Mode</span>
                  <span className="text-slate-400 font-normal hidden sm:inline">— Ethereal Harmonic Pads</span>
                </h4>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                  isMusicalMode
                    ? 'bg-indigo-500/25 text-indigo-300 border border-indigo-400/40'
                    : 'bg-slate-800 text-slate-400 border border-slate-700'
                }`}>
                  {isMusicalMode ? 'Active' : 'Off'}
                </span>
                {isMusicalMode && (
                  <span className="text-[10px] font-mono text-indigo-300/90 bg-indigo-950/60 px-2 py-0.5 rounded-full border border-indigo-500/30">
                    {audioEngine.getSolfeggioKeyName(baseFreq)}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Generates warm, evolving ambient chord swells tuned in real-time to your active Solfeggio carrier frequency ({baseFreq}Hz).
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end shrink-0">
            {isMusicalMode && onMusicalVolumeChange && (
              <div className="flex items-center gap-2 bg-slate-950/80 px-3 py-1.5 rounded-xl border border-slate-800">
                <Sliders className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={musicalVolume}
                  onChange={(e) => onMusicalVolumeChange(parseFloat(e.target.value))}
                  className="w-20 sm:w-28 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-400"
                  title="Musical Pad Volume"
                />
                <span className="text-[10px] font-mono text-indigo-300 w-8 text-right">
                  {Math.round(musicalVolume * 100)}%
                </span>
              </div>
            )}

            <button
              type="button"
              onClick={onToggleMusicalMode ? onToggleMusicalMode : () => audioEngine.toggleAmbientChords()}
              className={`px-4 py-2 min-h-[36px] rounded-xl border text-xs font-bold transition-all shadow-md active:scale-95 cursor-pointer inline-flex items-center justify-center gap-1.5 whitespace-nowrap shrink-0 ${
                isMusicalMode
                  ? 'bg-gradient-to-r from-indigo-500 to-purple-600 border-transparent text-white shadow-indigo-500/30 hover:brightness-110'
                  : 'bg-slate-800 hover:bg-slate-750 text-slate-200 border-slate-700'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isMusicalMode ? 'Turn Off Music' : 'Turn On Music'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4. INDIVIDUAL NATURE SOUND CARDS GRID */}
      <div className="bg-slate-900/70 backdrop-blur-xl border border-slate-800 rounded-3xl p-5 md:p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
          <div>
            <h4 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-sky-400" />
              Individual Acoustic Layer Controls
            </h4>
            <p className="text-xs text-slate-400 mt-0.5">
              Fine-tune the exact decibel presence and organic reverberation for each sound
            </p>
          </div>

          {/* Sound Type Filter Pills (Wrap cleanly without horizontal scrolling cut-off) */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold mr-1 flex items-center gap-1">
              <Filter className="w-3 h-3 text-sky-400" /> Filter:
            </span>
            {soundCategoryFilterTabs.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSoundCategoryFilter(cat.id as any)}
                className={`text-xs px-2.5 py-1 min-h-[30px] rounded-xl border transition-all inline-flex items-center justify-center whitespace-nowrap cursor-pointer ${
                  soundCategoryFilter === cat.id
                    ? 'bg-sky-500/20 text-sky-300 border-sky-400 font-medium'
                    : 'bg-slate-800/50 text-slate-400 border-slate-750 hover:text-slate-200'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Search Individual Acoustic Layers Tool */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search acoustic layers (e.g. rain, forest birds, wind, singing bowls, flute, ocean waves)..."
            value={layerSearchQuery}
            onChange={(e) => setLayerSearchQuery(e.target.value)}
            className="w-full pl-10 pr-9 py-2 bg-slate-950/80 border border-slate-800 rounded-2xl text-xs sm:text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-sky-400 transition-colors"
            aria-label="Search acoustic layers"
          />
          {layerSearchQuery && (
            <button
              type="button"
              onClick={() => setLayerSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 w-6 h-6 inline-flex items-center justify-center text-slate-400 hover:text-slate-200 rounded-md cursor-pointer"
              title="Clear layer search"
              aria-label="Clear acoustic layer search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Sound Cards Grid (Memoized with React.memo to prevent unnecessary re-renders) */}
        {filteredSounds.length === 0 ? (
          <div className="p-8 text-center bg-slate-900/50 border border-slate-800 rounded-3xl space-y-2">
            <Sliders className="w-8 h-8 text-slate-500 mx-auto" />
            <div className="font-semibold text-sm text-slate-200">
              No Acoustic Layers Match "{layerSearchQuery}"
            </div>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Try searching for "rain", "stream", "bowls", "harp", "flute", "campfire", or reset filters.
            </p>
            <button
              type="button"
              onClick={() => {
                setLayerSearchQuery('');
                setSoundCategoryFilter('all');
              }}
              className="mt-2 text-xs font-semibold px-3.5 py-1.5 min-h-[34px] inline-flex items-center justify-center rounded-xl bg-slate-800 hover:bg-slate-700 text-sky-300 border border-slate-700 transition-colors cursor-pointer"
            >
              Reset Sound Filter
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {filteredSounds.map((sound) => (
              <SoundControlCard
                key={sound.id}
                sound={sound}
                isPlaying={isPlaying}
                onSoundChange={onSoundChange}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

function areNatureMixerPropsEqual(
  prev: NatureMixerProps,
  next: NatureMixerProps
): boolean {
  if (prev.isPlaying !== next.isPlaying) return false;
  if (prev.currentPresetId !== next.currentPresetId) return false;
  if (prev.isVolumeNormalized !== next.isVolumeNormalized) return false;
  if (prev.isLoggedIn !== next.isLoggedIn) return false;
  if (prev.isAdmin !== next.isAdmin) return false;
  if (prev.isMusicalMode !== next.isMusicalMode) return false;
  if (prev.musicalVolume !== next.musicalVolume) return false;
  if (prev.baseFreq !== next.baseFreq) return false;
  if (prev.sounds !== next.sounds) {
    if (prev.sounds.length !== next.sounds.length) return false;
    for (let i = 0; i < prev.sounds.length; i++) {
      const p = prev.sounds[i];
      const n = next.sounds[i];
      if (p.id !== n.id || p.enabled !== n.enabled || p.volume !== n.volume) {
        return false;
      }
    }
  }
  return true;
}

export const NatureMixer = React.memo<NatureMixerProps>(
  NatureMixerComponent,
  areNatureMixerPropsEqual
);

