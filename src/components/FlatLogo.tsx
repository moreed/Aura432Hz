import React, { useEffect, useState } from 'react';
import { audioEngine } from '../services/audioEngine';

interface FlatLogoProps {
  className?: string;
  size?: number;
  showText?: boolean;
  isPlaying?: boolean;
  variant?: 'emblem' | 'horizontal';
}

/**
 * Official Aura 432Hz Brand Logo Component
 * Uses the exact, official circular medallion asset provided by the user (/icon-512.png).
 * Displays with authentic fidelity, crisp high-DPI rendering, and balanced responsive typography.
 */
export const FlatLogo: React.FC<FlatLogoProps> = ({
  className = '',
  size = 40,
  showText = true,
  isPlaying: isPlayingProp,
}) => {
  const [internalPlaying, setInternalPlaying] = useState<boolean>(() => audioEngine.getIsPlaying());

  const activePlaying = isPlayingProp !== undefined ? isPlayingProp : internalPlaying;

  useEffect(() => {
    if (isPlayingProp === undefined) {
      const unsub = audioEngine.subscribePlayingStatus((playing) => {
        setInternalPlaying(playing);
      });
      return unsub;
    }
  }, [isPlayingProp]);

  return (
    <div className={`inline-flex items-center gap-2 sm:gap-2.5 select-none ${className}`}>
      {/* Official Sacred Lotus Brand Logo Medallion */}
      <div
        className="relative shrink-0 flex items-center justify-center transition-transform duration-300"
        style={{ width: `${size}px`, height: `${size}px` }}
      >
        {activePlaying && (
          <span
            className="absolute -inset-1 rounded-full pointer-events-none bg-sky-400/25 animate-pulse blur-xs"
            aria-hidden="true"
          />
        )}
        <picture className="w-full h-full flex items-center justify-center">
          <source
            type="image/webp"
            srcSet="/icon-64.webp 64w, /icon-96.webp 96w, /icon-128.webp 128w, /icon-192.webp 192w"
            sizes={`${size}px`}
          />
          <img
            src="/icon-96.webp"
            srcSet="/icon-64.webp 64w, /icon-96.webp 96w, /icon-128.webp 128w, /icon-192.webp 192w"
            sizes={`${size}px`}
            alt="Aura 432Hz Official Logo"
            width={size}
            height={size}
            className={`w-full h-full object-contain rounded-full select-none transition-transform duration-300 ${
              activePlaying ? 'scale-105 drop-shadow-[0_0_10px_rgba(56,189,248,0.45)]' : 'hover:scale-105'
            }`}
            loading="eager"
            decoding="async"
            fetchPriority="high"
          />
        </picture>
      </div>

      {/* Companion branding typography for visual brand presence */}
      {showText && (
        <div className="flex flex-col leading-tight select-none min-w-0">
          <div className="flex items-center gap-1 sm:gap-1.5">
            <span className="text-sm sm:text-base md:text-lg lg:text-xl font-black tracking-wider text-slate-100 uppercase truncate font-sans">
              Aura <span className="text-sky-400 font-black">432Hz</span>
            </span>
            {activePlaying && (
              <span className="relative flex h-2 w-2 shrink-0" title="Sound Sanctuary Active">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-sky-400 shadow-[0_0_8px_#38bdf8]" />
              </span>
            )}
          </div>
          <span className="hidden sm:inline-block text-[10px] md:text-xs tracking-wide text-slate-400 font-medium truncate">
            Ambient Sound &amp; Meditation Sanctuary
          </span>
        </div>
      )}
    </div>
  );
};
