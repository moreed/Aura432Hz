import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import {
  Download,
  Check,
  RefreshCw,
  X,
  ShieldCheck,
  Sparkles,
  LogIn,
  CheckCircle2,
  Clock,
  Sliders,
  AlertTriangle,
  Share2,
  Play,
  Pause,
  RotateCcw,
  HardDrive,
  Trash2,
  Radio,
  FileAudio,
  FolderDown,
  Layers,
  Music,
} from 'lucide-react';
import { audioEngine, NatureSoundState, BrainwaveMode } from '../services/audioEngine';
import type { UserProfile } from '../services/sessionAuth';
import {
  UserWavQuota,
  LIFETIME_MAX_TRACKS,
  LIFETIME_MAX_MINUTES,
  MAX_SINGLE_TRACK_MINUTES,
  GUEST_MAX_TRACKS,
  GUEST_MAX_MINUTES,
  GUEST_MAX_SINGLE_TRACK_MINUTES,
  ADMIN_MAX_SINGLE_TRACK_MINUTES,
  isGuestUser,
  getLocalUserWavQuota,
  fetchUserWavQuota,
  recordWavDownload,
} from '../services/quotaService';
import { offlineVault, VaultTrack } from '../services/offlineVault';

export type ExportAudioFormat = 'wav' | 'mp3';

interface OfflineExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  baseFreq?: number;
  brainwaveMode?: BrainwaveMode;
  brainwaveModeName?: string;
  activeNatureSounds?: NatureSoundState[];
  currentUser?: UserProfile | null;
  isLoggedIn?: boolean;
  isAdmin?: boolean;
  isBuiltInPresetActive?: boolean;
  activePresetName?: string;
  onOpenLogin?: () => void;
  onDuplicateAsCustom?: () => void;
}

export const OfflineExportModal: React.FC<OfflineExportModalProps> = ({
  isOpen,
  onClose,
  baseFreq = 432,
  brainwaveMode = 'alpha_healing',
  brainwaveModeName = 'Alpha Harmonic',
  activeNatureSounds = [],
  currentUser,
  isLoggedIn = false,
  isAdmin = false,
  activePresetName,
  onOpenLogin,
}) => {
  // Main Navigation Tabs: 'export' or 'vault'
  const [activeTab, setActiveTab] = useState<'export' | 'vault'>('export');

  // Format selection: Studio WAV (16-bit 44.1kHz lossless) vs Compact MP3 (128kbps stereo)
  const [exportFormat, setExportFormat] = useState<ExportAudioFormat>('wav');

  // Determine user tier: admin (unlimited), member (50m pool), guest (10m trial)
  const userTier: 'admin' | 'member' | 'guest' = useMemo(() => {
    try {
      if (isAdmin) return 'admin';
      if (isLoggedIn && currentUser && !isGuestUser(currentUser)) return 'member';
      return 'guest';
    } catch {
      return 'guest';
    }
  }, [isAdmin, isLoggedIn, currentUser]);

  const maxPoolMinutes =
    userTier === 'admin' ? 9999 : userTier === 'member' ? LIFETIME_MAX_MINUTES : GUEST_MAX_MINUTES;
  const maxPoolTracks =
    userTier === 'admin' ? 999 : userTier === 'member' ? LIFETIME_MAX_TRACKS : GUEST_MAX_TRACKS;
  const singleTrackLimit =
    userTier === 'admin'
      ? ADMIN_MAX_SINGLE_TRACK_MINUTES
      : userTier === 'member'
      ? MAX_SINGLE_TRACK_MINUTES
      : GUEST_MAX_SINGLE_TRACK_MINUTES;

  const [quota, setQuota] = useState<UserWavQuota>(() => {
    if (userTier === 'admin') {
      return {
        userId: 'admin',
        lifetimeWavTracksDownloaded: 0,
        lifetimeWavMinutesDownloaded: 0,
        remainingMinutes: 9999,
        remainingTracks: 999,
        downloadHistory: [],
        isGuest: false,
      };
    }
    try {
      const uid = typeof currentUser?.uid === 'string' ? currentUser.uid : undefined;
      const initial = getLocalUserWavQuota(uid);
      if (initial && typeof initial === 'object') return initial;
    } catch (e) {
      console.debug('Failed to get initial local quota:', e);
    }
    return {
      userId: typeof currentUser?.uid === 'string' && currentUser.uid ? currentUser.uid : 'guest',
      lifetimeWavTracksDownloaded: 0,
      lifetimeWavMinutesDownloaded: 0,
      remainingMinutes: maxPoolMinutes,
      remainingTracks: maxPoolTracks,
      downloadHistory: [],
      isGuest: userTier === 'guest',
    };
  });

  // Safe numeric derivations to guarantee zero crashes on undefined/null/NaN
  const safeRemainingMinutes = Math.max(
    0,
    typeof quota?.remainingMinutes === 'number' && !isNaN(quota.remainingMinutes)
      ? quota.remainingMinutes
      : maxPoolMinutes
  );
  const safeRemainingTracks = Math.max(
    0,
    typeof quota?.remainingTracks === 'number' && !isNaN(quota.remainingTracks)
      ? quota.remainingTracks
      : maxPoolTracks
  );
  const safeDownloadedTracks = Math.max(
    0,
    typeof quota?.lifetimeWavTracksDownloaded === 'number' && !isNaN(quota.lifetimeWavTracksDownloaded)
      ? quota.lifetimeWavTracksDownloaded
      : 0
  );
  const safeDownloadedMinutes = Math.max(
    0,
    typeof quota?.lifetimeWavMinutesDownloaded === 'number' && !isNaN(quota.lifetimeWavMinutesDownloaded)
      ? quota.lifetimeWavMinutesDownloaded
      : 0
  );

  // Sync quota reactively
  useEffect(() => {
    if (userTier === 'admin') {
      setQuota({
        userId: 'admin',
        lifetimeWavTracksDownloaded: 0,
        lifetimeWavMinutesDownloaded: 0,
        remainingMinutes: 9999,
        remainingTracks: 999,
        downloadHistory: [],
        isGuest: false,
      });
      return;
    }

    try {
      const uid = typeof currentUser?.uid === 'string' ? currentUser.uid : undefined;
      const initial = getLocalUserWavQuota(uid);
      if (initial && typeof initial === 'object') setQuota(initial);
    } catch (e) {
      console.debug('Failed to get initial local quota:', e);
    }

    if (userTier === 'member' && typeof currentUser?.uid === 'string' && currentUser.uid) {
      fetchUserWavQuota(currentUser.uid)
        .then((q) => {
          if (q && typeof q === 'object') setQuota(q);
        })
        .catch(console.debug);
    }

    const handleQuotaChange = (e: Event) => {
      try {
        const customEvent = e as CustomEvent<UserWavQuota>;
        if (customEvent.detail && typeof customEvent.detail === 'object') {
          if (userTier === 'member' && customEvent.detail.userId === currentUser?.uid) {
            setQuota(customEvent.detail);
          } else if (userTier === 'guest' && customEvent.detail.isGuest) {
            setQuota(customEvent.detail);
          }
        }
      } catch {}
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('aura-wav-quota-changed', handleQuotaChange);
      return () => {
        window.removeEventListener('aura-wav-quota-changed', handleQuotaChange);
      };
    }
  }, [currentUser?.uid, userTier]);

  // Max selectable duration
  const effectiveMaxDuration = useMemo(() => {
    if (userTier === 'admin') return ADMIN_MAX_SINGLE_TRACK_MINUTES;
    const limit = typeof singleTrackLimit === 'number' && !isNaN(singleTrackLimit) ? singleTrackLimit : 5;
    const remain = typeof safeRemainingMinutes === 'number' && !isNaN(safeRemainingMinutes) ? safeRemainingMinutes : limit;
    return Math.max(0.5, Math.min(limit, remain));
  }, [userTier, singleTrackLimit, safeRemainingMinutes]);

  const [durationMinutes, setDurationMinutes] = useState<number>(() => {
    const defaultDuration = userTier === 'guest' ? 3 : 5;
    const maxDur = typeof effectiveMaxDuration === 'number' && !isNaN(effectiveMaxDuration) ? effectiveMaxDuration : 5;
    return Math.max(0.5, Math.min(defaultDuration, maxDur));
  });

  const safeDurationMinutes =
    typeof durationMinutes === 'number' && !isNaN(durationMinutes) && durationMinutes > 0
      ? durationMinutes
      : (userTier === 'guest' ? 3 : 5);

  useEffect(() => {
    if (userTier !== 'admin' && typeof durationMinutes === 'number' && durationMinutes > effectiveMaxDuration) {
      setDurationMinutes(Math.max(0.5, Number(effectiveMaxDuration.toFixed(1))));
    }
  }, [effectiveMaxDuration, userTier, durationMinutes]);

  // Render & Download States
  const [isRendering, setIsRendering] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [renderedBlob, setRenderedBlob] = useState<Blob | null>(null);
  const [renderedFileName, setRenderedFileName] = useState<string>('');
  const [renderedSizeMb, setRenderedSizeMb] = useState<string>('');
  const [renderedFormat, setRenderedFormat] = useState<ExportAudioFormat>('wav');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [canShare, setCanShare] = useState<boolean>(false);
  const [hasDownloaded, setHasDownloaded] = useState<boolean>(false);
  const [isVaultCached, setIsVaultCached] = useState<boolean>(false);

  // Vault Management States
  const [vaultTracks, setVaultTracks] = useState<VaultTrack[]>([]);
  const [vaultPlayingId, setVaultPlayingId] = useState<string | null>(null);
  const [vaultAudioUrl, setVaultAudioUrl] = useState<string | null>(null);
  const [vaultLoadingId, setVaultLoadingId] = useState<string | null>(null);
  const vaultAudioRef = useRef<HTMLAudioElement | null>(null);

  const isMountedRef = useRef<boolean>(true);
  const downloadUrlRef = useRef<string | null>(null);

  // Refresh vault tracks safely
  const refreshVault = useCallback(() => {
    try {
      const tracks = offlineVault.getTracks();
      setVaultTracks(Array.isArray(tracks) ? tracks : []);
    } catch (e) {
      console.warn('Failed to refresh vault tracks:', e);
      setVaultTracks([]);
    }
  }, []);

  useEffect(() => {
    isMountedRef.current = true;
    try {
      if (typeof navigator !== 'undefined' && typeof (navigator as any).canShare === 'function') {
        setCanShare(true);
      }
    } catch {}
    refreshVault();
    return () => {
      isMountedRef.current = false;
      if (downloadUrlRef.current) {
        try {
          URL.revokeObjectURL(downloadUrlRef.current);
        } catch {}
        downloadUrlRef.current = null;
      }
      if (vaultAudioUrl) {
        try {
          URL.revokeObjectURL(vaultAudioUrl);
        } catch {}
      }
    };
  }, [refreshVault, vaultAudioUrl]);

  // Safe background scroll lock with guarded element access
  useEffect(() => {
    if (!isOpen) return;
    try {
      if (typeof document !== 'undefined' && document.body && document.documentElement) {
        const originalOverflow = document.body.style.overflow;
        const originalPaddingRight = document.body.style.paddingRight;
        const scrollbarWidth = (window.innerWidth || 0) - (document.documentElement.clientWidth || 0);
        if (scrollbarWidth > 0) {
          document.body.style.paddingRight = `${scrollbarWidth}px`;
        }
        document.body.style.overflow = 'hidden';
        return () => {
          try {
            document.body.style.overflow = originalOverflow;
            document.body.style.paddingRight = originalPaddingRight;
          } catch {}
        };
      }
    } catch (e) {
      console.warn('Scroll lock notice:', e);
    }
  }, [isOpen]);

  // Safe prop derivations
  const safeBaseFreq = typeof baseFreq === 'number' && !isNaN(baseFreq) && baseFreq > 0 ? baseFreq : 432;
  const safeBrainwaveModeName = typeof brainwaveModeName === 'string' && brainwaveModeName.trim()
    ? brainwaveModeName
    : 'Alpha Harmonic';
  const safePresetName = typeof activePresetName === 'string' && activePresetName.trim()
    ? activePresetName
    : 'Sanctuary Mix';
  const safeVaultTracks = Array.isArray(vaultTracks)
    ? vaultTracks.filter((t) => t && typeof t === 'object' && typeof t.id === 'string')
    : [];
  const safeActiveNatureSounds = Array.isArray(activeNatureSounds)
    ? activeNatureSounds.filter((s) => s && typeof s === 'object')
    : [];

  if (!isOpen) return null;

  // Quota status
  const isQuotaDepleted =
    userTier !== 'admin' && (safeRemainingTracks <= 0 || safeRemainingMinutes <= 0);
  const isSelectedDurationExceeding =
    userTier !== 'admin' && safeDurationMinutes > safeRemainingMinutes;

  // File size estimate
  const estimatedMb = useMemo(() => {
    const durationSeconds = Math.max(1, safeDurationMinutes * 60);
    if (exportFormat === 'mp3') {
      // 128 kbps = 16,000 bytes/sec
      return ((durationSeconds * 16000) / (1024 * 1024)).toFixed(1);
    }
    // WAV 16-bit 44.1kHz stereo = 176,400 bytes/sec
    const totalBytes = durationSeconds * 44100 * 2 * 2;
    return (totalBytes / (1024 * 1024)).toFixed(1);
  }, [safeDurationMinutes, exportFormat]);

  // Execute Offline Synthesis
  const handleExport = async () => {
    if (userTier !== 'admin' && (isQuotaDepleted || isSelectedDurationExceeding)) {
      if (userTier === 'guest' && onOpenLogin) {
        onClose();
        onOpenLogin();
      }
      return;
    }

    setIsRendering(true);
    setProgress(5);
    setErrorMessage(null);

    const activeList = safeActiveNatureSounds
      .filter((s) => s && s.enabled)
      .map((s) => ({ id: s.id, volume: s.volume }));

    try {
      const durationSeconds = Math.round(safeDurationMinutes * 60);
      const renderResult = await audioEngine.renderOfflineAudio(
        durationSeconds,
        activeList,
        (p) => {
          if (isMountedRef.current) setProgress(p);
        },
        {
          format: exportFormat,
          baseFreq: safeBaseFreq,
          brainwaveMode,
        }
      );

      const blob = renderResult.blob;
      const formatUsed = renderResult.format;

      if (downloadUrlRef.current) {
        try {
          URL.revokeObjectURL(downloadUrlRef.current);
        } catch {}
      }

      const url = URL.createObjectURL(blob);
      downloadUrlRef.current = url;

      const cleanPresetName = (safePresetName || 'SanctuarySession')
        .replace(/[^a-zA-Z0-9]/g, '_')
        .slice(0, 24);
      const ext = formatUsed === 'mp3' ? 'mp3' : 'wav';
      const fileName = `Aura432Hz-${cleanPresetName}-${safeBaseFreq}Hz-${safeDurationMinutes}m.${ext}`;
      const sizeMb = (blob.size / (1024 * 1024)).toFixed(1);

      if (isMountedRef.current) {
        setDownloadUrl(url);
        setRenderedBlob(blob);
        setRenderedFileName(fileName);
        setRenderedSizeMb(sizeMb);
        setRenderedFormat(formatUsed);
      }

      // Save to Offline Sanctuary Vault Cache
      try {
        await offlineVault.saveTrack(
          {
            title: safePresetName
              ? `${safePresetName} (${safeBaseFreq}Hz)`
              : `Sacred ${safeBaseFreq}Hz Session`,
            format: formatUsed,
            durationSeconds,
            presetName: safePresetName,
            baseFreq: safeBaseFreq,
            brainwaveMode: safeBrainwaveModeName,
          },
          blob
        );
        refreshVault();
        if (isMountedRef.current) {
          setIsVaultCached(true);
        }
      } catch (vaultErr) {
        console.warn('Offline vault auto-save notice:', vaultErr);
      }

      // Record against quota
      const targetUid = currentUser?.uid || (userTier === 'admin' ? 'admin' : 'guest');
      const updated = await recordWavDownload(
        targetUid,
        durationMinutes,
        {
          freqHz: baseFreq,
          brainwaveMode: brainwaveModeName,
          presetName: activePresetName,
          fileName,
        },
        userTier === 'admin'
      );

      if (isMountedRef.current) {
        setQuota(updated);
      }
    } catch (err: any) {
      console.error('Offline export error:', err);
      if (isMountedRef.current) {
        const msg = err?.message || '';
        if (msg.includes('allocation') || msg.includes('memory') || msg.includes('buffer')) {
          setErrorMessage(
            'Browser memory limit reached for long duration. Please select a shorter length or Compact MP3 format and try again.'
          );
        } else {
          setErrorMessage(
            msg || 'Failed to synthesize offline audio. Please adjust duration or format and retry.'
          );
        }
      }
    } finally {
      if (isMountedRef.current) {
        setIsRendering(false);
      }
    }
  };

  // Safe Multi-Tier Zero-Redirect Download System
  const triggerSafeDownloadForBlob = async (
    blobToDownload: Blob,
    fileName: string,
    format: 'wav' | 'mp3'
  ) => {
    const mime = format === 'mp3' ? 'audio/mp3' : 'audio/wav';
    const desc = format === 'mp3' ? 'Compact MP3 Audio (128kbps)' : '16-bit 44.1kHz Studio WAV Audio';
    const ext = format === 'mp3' ? '.mp3' : '.wav';

    // Tier 1: Modern Native File System Access API (Zero redirects, no anchors)
    if (typeof window !== 'undefined' && 'showSaveFilePicker' in window) {
      try {
        const handle = await (window as any).showSaveFilePicker({
          suggestedName: fileName,
          types: [
            {
              description: desc,
              accept: { [mime]: [ext] },
            },
          ],
        });
        const writable = await handle.createWritable();
        await writable.write(blobToDownload);
        await writable.close();
        setHasDownloaded(true);
        return;
      } catch (pickerErr: any) {
        if (pickerErr?.name === 'AbortError') {
          return; // User canceled dialog
        }
        console.debug('showSaveFilePicker fallback:', pickerErr);
      }
    }

    // Tier 2: Mobile Web Share API
    if (typeof navigator !== 'undefined' && navigator.canShare) {
      try {
        const file = new File([blobToDownload], fileName, { type: mime });
        if (navigator.canShare({ files: [file] })) {
          await navigator.share({
            files: [file],
            title: fileName,
            text: `Aura 432Hz Offline Audio — ${baseFreq}Hz`,
          });
          setHasDownloaded(true);
          return;
        }
      } catch (shareErr: any) {
        if (shareErr?.name === 'AbortError') {
          return;
        }
        console.debug('navigator.share fallback:', shareErr);
      }
    }

    // Tier 3: Sandboxed iframe postMessage
    const isInsideIframe = typeof window !== 'undefined' && window.self !== window.top;
    if (isInsideIframe) {
      try {
        const reader = new FileReader();
        reader.onload = () => {
          try {
            window.parent.postMessage(
              {
                type: 'AURA_DOWNLOAD_FILE',
                buffer: reader.result,
                fileType: mime,
                fileName,
              },
              '*'
            );
            setHasDownloaded(true);
          } catch {}
        };
        reader.readAsArrayBuffer(blobToDownload);
      } catch {}
    }

    // Tier 4: Isolated DOM Anchor Download (Strict zero-navigation, no target="_blank")
    try {
      const fileUrl = URL.createObjectURL(blobToDownload);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = fileUrl;
      a.download = fileName;
      a.setAttribute('download', fileName);
      a.rel = 'noopener noreferrer';

      a.onclick = (evt) => {
        evt.stopPropagation();
      };

      document.body.appendChild(a);
      a.click();
      setHasDownloaded(true);

      setTimeout(() => {
        try {
          document.body.removeChild(a);
          URL.revokeObjectURL(fileUrl);
        } catch {}
      }, 1000);
    } catch (err) {
      console.warn('Anchor download notice:', err);
    }
  };

  const handleSafeDownload = async (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (!renderedBlob) return;
    const ext = renderedFormat === 'mp3' ? 'mp3' : 'wav';
    const fileName =
      renderedFileName || `Aura432Hz-${baseFreq}Hz-${durationMinutes}m.${ext}`;
    await triggerSafeDownloadForBlob(renderedBlob, fileName, renderedFormat);
  };

  const handleShareFile = async (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    await handleSafeDownload(e);
  };

  const handleResetExport = () => {
    if (downloadUrlRef.current) {
      URL.revokeObjectURL(downloadUrlRef.current);
      downloadUrlRef.current = null;
    }
    setDownloadUrl(null);
    setRenderedBlob(null);
    setErrorMessage(null);
    setProgress(0);
    setHasDownloaded(false);
    setIsVaultCached(false);
  };

  // Vault Track Interactions
  const handlePlayVaultTrack = async (track: VaultTrack) => {
    if (vaultPlayingId === track.id) {
      // Pause
      if (vaultAudioRef.current) {
        vaultAudioRef.current.pause();
      }
      setVaultPlayingId(null);
      return;
    }

    setVaultLoadingId(track.id);
    try {
      const blob = await offlineVault.getTrackBlob(track.id);
      if (!blob) {
        alert('Track audio is not in cache or was cleared by browser storage.');
        setVaultLoadingId(null);
        return;
      }
      if (vaultAudioUrl) {
        URL.revokeObjectURL(vaultAudioUrl);
      }
      const url = URL.createObjectURL(blob);
      setVaultAudioUrl(url);
      setVaultPlayingId(track.id);

      setTimeout(() => {
        if (vaultAudioRef.current) {
          vaultAudioRef.current.play().catch(console.warn);
        }
      }, 50);
    } catch (err) {
      console.warn('Failed to play vault track:', err);
    } finally {
      setVaultLoadingId(null);
    }
  };

  const handleDownloadVaultTrack = async (track: VaultTrack, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    try {
      const blob = await offlineVault.getTrackBlob(track.id);
      if (!blob) {
        alert('Track audio data is not available.');
        return;
      }
      const ext = track.format === 'mp3' ? 'mp3' : 'wav';
      const cleanTitle = (track.title || 'SanctuaryTrack').replace(/[^a-zA-Z0-9]/g, '_');
      const fileName = `Aura432Hz-${cleanTitle}-${track.durationSeconds}s.${ext}`;
      await triggerSafeDownloadForBlob(blob, fileName, track.format);
    } catch (err) {
      console.warn('Vault download error:', err);
    }
  };

  const handleDeleteVaultTrack = async (id: string, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (vaultPlayingId === id) {
      if (vaultAudioRef.current) {
        vaultAudioRef.current.pause();
      }
      setVaultPlayingId(null);
    }
    await offlineVault.deleteTrack(id);
    refreshVault();
  };

  const handleClearAllVault = async () => {
    if (window.confirm('Are you sure you want to remove all saved tracks from the offline vault?')) {
      if (vaultAudioRef.current) {
        vaultAudioRef.current.pause();
      }
      setVaultPlayingId(null);
      await offlineVault.clearAll();
      refreshVault();
    }
  };

  // Quota styling
  const remainingColorClass =
    safeRemainingMinutes > maxPoolMinutes * 0.4
      ? 'text-emerald-400'
      : safeRemainingMinutes > maxPoolMinutes * 0.2
      ? 'text-amber-400'
      : 'text-rose-400';

  const progressPercent = Math.min(
    100,
    Math.max(
      0,
      Math.round(((maxPoolMinutes - safeRemainingMinutes) / (maxPoolMinutes || 1)) * 100)
    )
  );

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="export-modal-title"
      className="fixed inset-0 z-[110] flex items-center justify-center p-2.5 sm:p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto overscroll-contain animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isRendering) onClose();
      }}
    >
      <div className="relative w-full max-w-xl bg-slate-900 border border-slate-700/80 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-2xl text-left max-h-[92dvh] overflow-y-auto overscroll-contain my-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          disabled={isRendering}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-200 rounded-xl hover:bg-slate-800 transition-colors cursor-pointer disabled:opacity-40"
          title="Close Dialog"
          aria-label="Close export dialog"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-aurora-teal/20 border border-aurora-teal/40 text-aurora-teal flex items-center justify-center shrink-0">
              <Download className="w-5 h-5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 id="export-modal-title" className="text-lg font-bold text-slate-100">
                  Offline Audio Exporter
                </h2>
                {userTier === 'admin' ? (
                  <span className="text-[10px] bg-purple-500/20 text-purple-300 border border-purple-500/40 px-2 py-0.5 rounded-full font-semibold flex items-center gap-1 font-mono">
                    <ShieldCheck className="w-3 h-3 text-purple-400" />
                    Admin Unlimited
                  </span>
                ) : userTier === 'member' ? (
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded-full font-semibold flex items-center gap-1 font-mono">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                    Member (50m Pool)
                  </span>
                ) : (
                  <span className="text-[10px] bg-aurora-teal/20 text-aurora-teal border border-aurora-teal/40 px-2 py-0.5 rounded-full font-semibold flex items-center gap-1 font-mono">
                    <Sparkles className="w-3 h-3 text-aurora-teal" />
                    Visitor Free Trial (10m)
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Generate offline audio for meditation flights, forest retreats &amp; off-grid listening
              </p>
            </div>
          </div>

          {/* VIEW SWITCHER TABS: 'export' or 'vault' */}
          <div className="flex rounded-xl bg-slate-950/80 p-1 border border-slate-800">
            <button
              type="button"
              onClick={() => setActiveTab('export')}
              disabled={isRendering}
              className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                activeTab === 'export'
                  ? 'bg-aurora-teal/20 text-aurora-teal border border-aurora-teal/40 shadow-xs'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Mix</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('vault')}
              disabled={isRendering}
              className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                activeTab === 'vault'
                  ? 'bg-aurora-teal/20 text-aurora-teal border border-aurora-teal/40 shadow-xs'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <HardDrive className="w-3.5 h-3.5" />
              <span>Offline Vault</span>
              {safeVaultTracks.length > 0 && (
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-full bg-slate-800 text-aurora-teal border border-slate-700">
                  {safeVaultTracks.length}
                </span>
              )}
            </button>
          </div>

          {/* TAB 1: EXPORT MIX VIEW */}
          {activeTab === 'export' && (
            <div className="space-y-3.5">
              {/* Admin Exemption Badge */}
              {userTier === 'admin' && (
                <div className="p-2.5 rounded-xl bg-purple-950/50 border border-purple-500/40 text-purple-200 text-xs flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-purple-400 shrink-0" />
                  <span>Sanctuary Admin: Unlimited Master Studio Export Active (Quota Exemption)</span>
                </div>
              )}

              {/* QUOTA METER (VISITORS & REGISTERED MEMBERS) */}
              {userTier !== 'admin' && (
                <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-aurora-teal" />
                      <span>
                        {userTier === 'guest'
                          ? 'Visitor Free Trial Allowance:'
                          : 'Lifetime Member Allowance:'}
                      </span>
                    </span>
                    <span className="text-xs font-mono font-bold">
                      <span className={remainingColorClass}>{safeRemainingMinutes.toFixed(1)}</span>
                      <span className="text-slate-400 font-normal"> / {maxPoolMinutes} mins</span>
                    </span>
                  </div>

                  {/* Visual Capacity Bar */}
                  <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden p-0.5 border border-slate-700/60">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        safeRemainingMinutes > maxPoolMinutes * 0.4
                          ? 'bg-gradient-to-r from-aurora-teal to-emerald-400'
                          : safeRemainingMinutes > maxPoolMinutes * 0.2
                          ? 'bg-gradient-to-r from-amber-500 to-yellow-400'
                          : 'bg-gradient-to-r from-rose-500 to-amber-500'
                      }`}
                      style={{ width: `${Math.max(4, 100 - progressPercent)}%` }}
                    />
                  </div>

                  {/* Tracks Count & Remaining Breakdown */}
                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-0.5">
                    <div className="flex items-center gap-1.5">
                      <span>Tracks left:</span>
                      <strong
                        className={
                          safeRemainingTracks > 0
                            ? 'text-aurora-teal font-mono'
                            : 'text-rose-400 font-mono'
                        }
                      >
                        {safeRemainingTracks} of {maxPoolTracks}
                      </strong>
                      <div className="flex items-center gap-1 ml-1">
                        {Array.from({ length: Math.min(20, Math.max(1, maxPoolTracks)) }).map((_, idx) => (
                          <span
                            key={idx}
                            className={`w-2 h-2 rounded-full ${
                              idx < safeDownloadedTracks
                                ? 'bg-slate-700 border border-slate-600'
                                : 'bg-aurora-teal shadow-[0_0_4px_rgba(72,225,208,0.8)]'
                            }`}
                            title={`Track ${idx + 1}`}
                          />
                        ))}
                      </div>
                    </div>

                    <span>
                      Used:{' '}
                      <strong className="text-slate-200">
                        {safeDownloadedMinutes.toFixed(1)}m
                      </strong>
                    </span>
                  </div>

                  {/* Guest Upgrade Invitation */}
                  {userTier === 'guest' && !isQuotaDepleted && (
                    <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between gap-2 text-[11px]">
                      <span className="text-slate-400">
                        Want <strong className="text-slate-200">50 mins &amp; 5 tracks</strong>?
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          onClose();
                          if (onOpenLogin) onOpenLogin();
                        }}
                        className="text-aurora-teal hover:text-teal-300 font-semibold cursor-pointer underline"
                      >
                        Sign in free to expand
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Depletion Notice */}
              {isQuotaDepleted && (
                <div className="p-3.5 rounded-2xl bg-amber-950/40 border border-amber-500/40 text-amber-200 text-xs space-y-2">
                  <div className="flex items-center gap-2 font-semibold text-amber-300">
                    <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>
                      {userTier === 'guest'
                        ? 'Visitor Free Trial Completed'
                        : 'Lifetime Offline Allowance Completed'}
                    </span>
                  </div>
                  <p className="text-[11px] text-amber-200/90 leading-relaxed">
                    {userTier === 'guest' ? (
                      <>
                        You have used your <strong>10-minute visitor trial</strong>. Create a free
                        account or sign in to instantly claim your{' '}
                        <strong>50-minute / 5-track lifetime allowance</strong>!
                      </>
                    ) : (
                      <>
                        You have downloaded all <strong>5 lifetime tracks</strong> or used your{' '}
                        <strong>50-minute allowance</strong>. You can continue listening to all
                        frequencies online with unlimited free real-time streaming anytime!
                      </>
                    )}
                  </p>
                  {userTier === 'guest' && onOpenLogin && (
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onOpenLogin();
                      }}
                      className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-aurora-teal to-cosmic-lavender text-midnight font-bold text-xs shadow-md flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-98"
                    >
                      <LogIn className="w-3.5 h-3.5 text-midnight" />
                      <span>Sign In or Join Free to Unlock 50 Mins</span>
                    </button>
                  )}
                </div>
              )}

              {/* SUCCESS STATE WITH AUDIO PLAYER AND DIRECT DOWNLOAD BUTTONS */}
              {downloadUrl ? (
                <div className="p-4 rounded-2xl bg-gradient-to-b from-emerald-950/60 to-slate-950 border border-emerald-500/50 space-y-3.5 animate-in fade-in">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 flex items-center justify-center shrink-0">
                        <Check className="w-5 h-5 text-emerald-400" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-emerald-200">
                          {renderedFormat === 'mp3' ? 'Compact MP3 Ready' : 'Studio WAV Ready'}
                        </h4>
                        <p className="text-[11px] text-slate-300 font-mono truncate max-w-[260px]">
                          {renderedFileName} ({renderedSizeMb} MB)
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleResetExport}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors text-xs flex items-center gap-1 cursor-pointer"
                      title="Render another duration or format"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span className="text-[10px]">New</span>
                    </button>
                  </div>

                  {/* In-Modal Instant Audio Player */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span className="flex items-center gap-1 text-slate-300">
                        <Play className="w-3 h-3 text-emerald-400" />
                        <span>Instant Audio Preview:</span>
                      </span>
                      <span className="text-[10px] font-mono text-emerald-400">
                        {renderedFormat === 'mp3' ? '128kbps Stereo MP3' : 'Studio 44.1kHz • 16-bit WAV'}
                      </span>
                    </div>
                    <audio
                      controls
                      src={downloadUrl}
                      className="w-full h-8 rounded-lg accent-aurora-teal bg-slate-950 border border-slate-800"
                    />
                  </div>

                  {/* Vault Cache Notice */}
                  {isVaultCached && (
                    <div className="p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-500/30 flex items-center justify-between text-xs text-emerald-300">
                      <span className="flex items-center gap-1.5">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span>Saved to Offline Vault &bull; 100% Offline Ready</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => setActiveTab('vault')}
                        className="text-[11px] text-emerald-300 hover:text-white underline font-medium cursor-pointer"
                      >
                        View Vault
                      </button>
                    </div>
                  )}

                  {/* Direct Save Action Buttons */}
                  <div className="flex flex-col sm:flex-row items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={handleSafeDownload}
                      className="w-full flex-1 py-3 px-4 bg-gradient-to-r from-emerald-500 via-teal-400 to-aurora-teal hover:opacity-95 text-midnight font-bold text-xs rounded-xl shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98 text-center"
                    >
                      {hasDownloaded ? (
                        <>
                          <Check className="w-4 h-4 text-midnight shrink-0" />
                          <span>Saved to Device ({renderedSizeMb} MB)</span>
                        </>
                      ) : (
                        <>
                          <Download className="w-4 h-4 text-midnight shrink-0" />
                          <span>Save / Download File ({renderedSizeMb} MB)</span>
                        </>
                      )}
                    </button>

                    {canShare && (
                      <button
                        type="button"
                        onClick={handleShareFile}
                        className="w-full sm:w-auto py-3 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs rounded-xl border border-slate-700 transition-colors flex items-center justify-center gap-1.5 cursor-pointer active:scale-98"
                        title="Share to Google Drive, Files, or messaging apps"
                      >
                        <Share2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span>Share / Files</span>
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                /* CONFIGURATION VIEW */
                <>
                  {/* FORMAT SELECTOR: Studio WAV vs Compact MP3 */}
                  <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-2.5">
                    <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                      <FileAudio className="w-3.5 h-3.5 text-aurora-teal" />
                      <span>Output Audio Format:</span>
                    </label>

                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setExportFormat('wav')}
                        disabled={isRendering}
                        className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                          exportFormat === 'wav'
                            ? 'bg-aurora-teal/15 border-aurora-teal text-white shadow-xs'
                            : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs">Studio WAV</span>
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-sm bg-slate-800 text-aurora-teal">
                            Lossless
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-400 mt-1">
                          16-bit 44.1kHz uncompressed. Purest acoustic depth (~10.5 MB/min).
                        </p>
                      </button>

                      <button
                        type="button"
                        onClick={() => setExportFormat('mp3')}
                        disabled={isRendering}
                        className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                          exportFormat === 'mp3'
                            ? 'bg-aurora-teal/15 border-aurora-teal text-white shadow-xs'
                            : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs">Compact MP3</span>
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-sm bg-slate-800 text-emerald-400">
                            Fast &bull; 90% Lighter
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-400 mt-1">
                          128kbps stereo MP3. Fast mobile download (~0.9 MB/min).
                        </p>
                      </button>
                    </div>
                  </div>

                  {/* DURATION SLIDER & PRESETS */}
                  <div
                    className={`p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-3 ${
                      isQuotaDepleted ? 'opacity-50 pointer-events-none' : ''
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <label
                        htmlFor="duration-slider"
                        className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5"
                      >
                        <Sliders className="w-3.5 h-3.5 text-aurora-teal" />
                        <span>Track Length (max {singleTrackLimit}m):</span>
                      </label>
                      <div className="text-right">
                        <span className="text-sm font-mono font-bold text-aurora-teal">
                          {Math.floor(safeDurationMinutes)}m {Math.round((safeDurationMinutes % 1) * 60)}s
                        </span>
                        <span className="text-[10px] text-slate-400 ml-1.5 font-mono">
                          (~{estimatedMb} MB)
                        </span>
                      </div>
                    </div>

                    {/* Interactive Range Slider */}
                    <div className="space-y-1.5">
                      <input
                        id="duration-slider"
                        type="range"
                        min="0.5"
                        max={Math.max(0.5, effectiveMaxDuration || 5)}
                        step="0.5"
                        value={safeDurationMinutes}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value);
                          if (!isNaN(val) && val > 0) setDurationMinutes(val);
                        }}
                        disabled={isRendering || isQuotaDepleted}
                        className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-aurora-teal"
                        aria-label="Track length in minutes"
                      />

                      <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                        <span>30s</span>
                        <span>
                          {userTier === 'guest' ? '2.5m' : userTier === 'admin' ? '15m' : '5m'}
                        </span>
                        <span>{effectiveMaxDuration}m max</span>
                      </div>
                    </div>

                    {/* Quick Preset Duration Buttons */}
                    <div className="grid grid-cols-5 gap-1.5 pt-1">
                      {(userTier === 'admin'
                        ? [1, 5, 10, 20, 30]
                        : userTier === 'member'
                        ? [1, 3, 5, 7, 9.5]
                        : [1, 2, 3, 4, 5]
                      ).map((d) => {
                        const isExceeding = userTier !== 'admin' && d > safeRemainingMinutes;
                        return (
                          <button
                            key={d}
                            type="button"
                            disabled={isRendering || isExceeding || isQuotaDepleted}
                            onClick={() => setDurationMinutes(d)}
                            className={`py-1.5 rounded-xl text-xs font-medium border transition-all cursor-pointer ${
                              safeDurationMinutes === d
                                ? 'bg-aurora-teal/20 border-aurora-teal text-aurora-teal font-semibold shadow-xs'
                                : isExceeding
                                ? 'bg-slate-900/40 border-slate-800 text-slate-600 cursor-not-allowed opacity-50'
                                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-850'
                            }`}
                            title={isExceeding ? 'Exceeds allowance' : `${d} minute track`}
                          >
                            {d === 9.5 ? '9.5m' : `${d}m`}
                          </button>
                        );
                      })}
                    </div>

                    {/* Deduction Projection */}
                    {userTier !== 'admin' && (
                      <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-800/80">
                        <span>After this export:</span>
                        <span className="font-mono">
                          <strong className="text-slate-200">
                            {Math.max(
                              0,
                              Number((safeRemainingMinutes - safeDurationMinutes).toFixed(1))
                            )}
                            m
                          </strong>{' '}
                          remaining ({Math.max(0, safeRemainingTracks - 1)} tracks left)
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Mix Composition Summary */}
                  <div className="p-3 rounded-2xl bg-slate-950/50 border border-slate-800/80 text-xs space-y-1">
                    <div className="flex items-center justify-between text-slate-300">
                      <span className="text-slate-400">Composition:</span>
                      <span className="font-semibold text-aurora-teal">
                        {safeBaseFreq}Hz &bull; {safeBrainwaveModeName}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-slate-300">
                      <span className="text-slate-400">Nature Layers:</span>
                      <span className="text-slate-200 truncate max-w-[220px]">
                        {safeActiveNatureSounds.filter((s) => s && s.enabled).map((s) => s.name || s.id || 'Layer').join(', ') || 'Pure Frequency'}
                      </span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  {isRendering && (
                    <div className="p-3 rounded-2xl bg-slate-950/90 border border-aurora-teal/40">
                      <div className="flex items-center justify-between text-xs text-aurora-teal mb-1.5">
                        <span className="flex items-center gap-1.5">
                          <RefreshCw className="w-3.5 h-3.5 animate-spin text-aurora-teal" />
                          <span>
                            Synthesizing {exportFormat === 'mp3' ? 'Compact MP3' : 'Studio WAV'}...
                          </span>
                        </span>
                        <span className="font-mono font-semibold">{progress}%</span>
                      </div>
                      <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-aurora-teal to-emerald-400 h-full transition-all duration-300"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Error Message */}
                  {errorMessage && (
                    <div className="p-3 bg-rose-950/50 border border-rose-500/50 rounded-2xl text-xs text-rose-300 flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                      <span>{errorMessage}</span>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2.5 pt-1">
                    <button
                      type="button"
                      onClick={onClose}
                      disabled={isRendering}
                      className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-300 text-xs font-semibold rounded-xl border border-slate-700 transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleExport}
                      disabled={isRendering || isQuotaDepleted || isSelectedDurationExceeding}
                      className="flex-1 py-3 bg-gradient-to-r from-aurora-teal via-teal-300 to-cosmic-lavender hover:opacity-95 disabled:opacity-40 disabled:cursor-not-allowed text-midnight text-xs font-bold rounded-xl shadow-lg shadow-aurora-teal/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-98"
                    >
                      {isRendering ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin text-midnight" />
                          <span>Rendering ({progress}%)...</span>
                        </>
                      ) : (
                        <>
                          <Download className="w-4 h-4 text-midnight" />
                          <span>
                            Render {exportFormat === 'mp3' ? 'Compact MP3' : 'Studio WAV'}
                          </span>
                        </>
                      )}
                    </button>
                  </div>
                </>
              )}
            </div>
          )}

          {/* TAB 2: OFFLINE VAULT VIEW */}
          {activeTab === 'vault' && (
            <div className="space-y-3.5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                    <HardDrive className="w-4 h-4 text-aurora-teal" />
                    <span>In-App Offline Vault</span>
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Exported soundscapes stored in browser cache. 100% playable without internet.
                  </p>
                </div>

                {safeVaultTracks.length > 0 && (
                  <button
                    type="button"
                    onClick={handleClearAllVault}
                    className="text-[11px] text-slate-500 hover:text-rose-400 flex items-center gap-1 transition-colors cursor-pointer"
                    title="Remove all tracks from cache"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Clear All</span>
                  </button>
                )}
              </div>

              {/* Hidden Audio Player for Vault preview */}
              {vaultAudioUrl && (
                <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span className="flex items-center gap-1 text-aurora-teal font-medium">
                      <Music className="w-3 h-3" />
                      <span>Playing from Offline Vault</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        if (vaultAudioRef.current) vaultAudioRef.current.pause();
                        setVaultPlayingId(null);
                      }}
                      className="text-slate-500 hover:text-slate-300 cursor-pointer"
                    >
                      Stop
                    </button>
                  </div>
                  <audio
                    ref={vaultAudioRef}
                    controls
                    src={vaultAudioUrl}
                    className="w-full h-8 rounded-lg accent-aurora-teal bg-slate-950"
                    onEnded={() => setVaultPlayingId(null)}
                  />
                </div>
              )}

              {/* Vault Track List */}
              {safeVaultTracks.length === 0 ? (
                <div className="p-8 text-center rounded-2xl bg-slate-950/40 border border-dashed border-slate-800 space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-slate-800/80 text-slate-500 flex items-center justify-center mx-auto">
                    <FolderDown className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-slate-300">Your Offline Vault is Empty</h4>
                    <p className="text-[11px] text-slate-500 mt-1 max-w-sm mx-auto">
                      Render soundscapes from the "Export Mix" tab. They are automatically archived here
                      for offline airplane flights and nature retreats.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveTab('export')}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-aurora-teal text-xs font-semibold border border-slate-700 transition-colors cursor-pointer"
                  >
                    Export Your First Soundscape
                  </button>
                </div>
              ) : (
                <div className="space-y-2 max-h-[50dvh] overflow-y-auto pr-1">
                  {safeVaultTracks.map((track) => {
                    if (!track || typeof track !== 'object' || !track.id) return null;
                    const isCurrentPlaying = vaultPlayingId === track.id;
                    const isLoadingThis = vaultLoadingId === track.id;
                    const trackFormat = track.format === 'mp3' ? 'mp3' : 'wav';
                    const trackTitle = track.title || 'Sanctuary Track';
                    const trackDuration = typeof track.durationSeconds === 'number' && !isNaN(track.durationSeconds) ? track.durationSeconds : 0;
                    const trackBytes = typeof track.fileSizeBytes === 'number' && !isNaN(track.fileSizeBytes) ? track.fileSizeBytes : 0;

                    return (
                      <div
                        key={track.id}
                        className={`p-3 rounded-xl border transition-all flex items-center justify-between gap-3 ${
                          isCurrentPlaying
                            ? 'bg-aurora-teal/10 border-aurora-teal/50'
                            : 'bg-slate-950/70 border-slate-800/80 hover:border-slate-700'
                        }`}
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-semibold text-xs text-slate-200 truncate">
                              {trackTitle}
                            </span>
                            <span
                              className={`text-[9px] font-mono px-1.5 py-0.5 rounded-sm uppercase ${
                                trackFormat === 'mp3'
                                  ? 'bg-emerald-950 border border-emerald-500/40 text-emerald-300'
                                  : 'bg-sky-950 border border-sky-500/40 text-sky-300'
                              }`}
                            >
                              {trackFormat}
                            </span>
                          </div>

                          <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5 font-mono">
                            <span>{offlineVault.formatDuration(trackDuration)}</span>
                            <span>&bull;</span>
                            <span>{offlineVault.formatBytes(trackBytes)}</span>
                            {track.baseFreq && (
                              <>
                                <span>&bull;</span>
                                <span>{track.baseFreq}Hz</span>
                              </>
                            )}
                          </div>
                        </div>

                        {/* Action buttons: Play/Pause, Download, Delete */}
                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            type="button"
                            onClick={() => handlePlayVaultTrack(track)}
                            disabled={isLoadingThis}
                            className={`p-2 rounded-lg border transition-all cursor-pointer ${
                              isCurrentPlaying
                                ? 'bg-aurora-teal text-midnight border-aurora-teal'
                                : 'bg-slate-800 text-slate-300 border-slate-700 hover:text-white hover:bg-slate-750'
                            }`}
                            title={isCurrentPlaying ? 'Pause audio' : 'Play track from offline cache'}
                          >
                            {isLoadingThis ? (
                              <RefreshCw className="w-3.5 h-3.5 animate-spin text-aurora-teal" />
                            ) : isCurrentPlaying ? (
                              <Pause className="w-3.5 h-3.5 text-midnight" />
                            ) : (
                              <Play className="w-3.5 h-3.5" />
                            )}
                          </button>

                          <button
                            type="button"
                            onClick={(e) => handleDownloadVaultTrack(track, e)}
                            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-aurora-teal border border-slate-700 transition-colors cursor-pointer"
                            title="Download to device storage"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={(e) => handleDeleteVaultTrack(track.id, e)}
                            className="p-2 rounded-lg bg-slate-900/80 hover:bg-rose-950/60 text-slate-500 hover:text-rose-400 border border-slate-800 hover:border-rose-500/40 transition-colors cursor-pointer"
                            title="Delete from offline vault"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
