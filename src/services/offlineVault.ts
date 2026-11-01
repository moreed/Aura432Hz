export interface VaultTrack {
  id: string;
  title: string;
  format: 'wav' | 'mp3';
  durationSeconds: number;
  fileSizeBytes: number;
  createdAt: number;
  presetName?: string;
  baseFreq?: number;
  brainwaveMode?: string;
  urlKey: string;
}

const VAULT_CACHE_NAME = 'aura432-offline-vault-v1';
const VAULT_META_KEY = 'aura432_vault_tracks_v1';

export class OfflineVaultService {
  public isSupported(): boolean {
    return typeof window !== 'undefined' && 'caches' in window;
  }

  public getTracks(): VaultTrack[] {
    if (typeof window === 'undefined') return [];
    try {
      if (typeof localStorage === 'undefined') return [];
      const raw = localStorage.getItem(VAULT_META_KEY);
      if (!raw || raw === 'null' || raw === 'undefined') return [];
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return [];
      return parsed.filter((t) => t && typeof t === 'object' && typeof t.id === 'string');
    } catch (e) {
      console.warn('Failed to parse offline vault tracks from localStorage:', e);
      return [];
    }
  }

  private saveMeta(tracks: VaultTrack[]): void {
    if (typeof window === 'undefined') return;
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(VAULT_META_KEY, JSON.stringify(Array.isArray(tracks) ? tracks : []));
      }
    } catch (e) {
      console.warn('Failed to save offline vault meta to localStorage:', e);
    }
  }

  public async saveTrack(
    data: {
      title: string;
      format: 'wav' | 'mp3';
      durationSeconds: number;
      presetName?: string;
      baseFreq?: number;
      brainwaveMode?: string;
    },
    blob: Blob
  ): Promise<VaultTrack> {
    const id = `vault-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const ext = data.format === 'mp3' ? 'mp3' : 'wav';
    const mime = data.format === 'mp3' ? 'audio/mp3' : 'audio/wav';
    const urlKey = `/vault/tracks/${id}.${ext}`;

    const newTrack: VaultTrack = {
      id,
      title: data.title || `Sacred ${data.baseFreq || 432}Hz Session`,
      format: data.format,
      durationSeconds: Math.round(data.durationSeconds),
      fileSizeBytes: blob.size,
      createdAt: Date.now(),
      presetName: data.presetName,
      baseFreq: data.baseFreq,
      brainwaveMode: data.brainwaveMode,
      urlKey,
    };

    if (this.isSupported()) {
      try {
        const cache = await caches.open(VAULT_CACHE_NAME);
        const response = new Response(blob, {
          headers: {
            'Content-Type': mime,
            'Content-Length': blob.size.toString(),
            'X-Aura432-Vault-Id': id,
          },
        });
        await cache.put(urlKey, response);
      } catch (cacheErr) {
        console.warn('CacheStorage put failed (falling back to meta-only):', cacheErr);
      }
    }

    const current = this.getTracks();
    // Keep newest first
    const updated = [newTrack, ...current.filter((t) => t.id !== id)];
    this.saveMeta(updated);

    return newTrack;
  }

  public async getTrackBlob(id: string): Promise<Blob | null> {
    const tracks = this.getTracks();
    const track = tracks.find((t) => t.id === id);
    if (!track) return null;

    if (this.isSupported()) {
      try {
        const cache = await caches.open(VAULT_CACHE_NAME);
        const resp = await cache.match(track.urlKey);
        if (resp) {
          return await resp.blob();
        }
      } catch (err) {
        console.warn('Failed to retrieve blob from CacheStorage:', err);
      }
    }
    return null;
  }

  public async deleteTrack(id: string): Promise<boolean> {
    const tracks = this.getTracks();
    const track = tracks.find((t) => t.id === id);

    if (track && this.isSupported()) {
      try {
        const cache = await caches.open(VAULT_CACHE_NAME);
        await cache.delete(track.urlKey);
      } catch (err) {
        console.warn('Failed to delete blob from cache:', err);
      }
    }

    const updated = tracks.filter((t) => t.id !== id);
    this.saveMeta(updated);
    return true;
  }

  public async clearAll(): Promise<boolean> {
    if (this.isSupported()) {
      try {
        await caches.delete(VAULT_CACHE_NAME);
      } catch (err) {
        console.warn('Failed to clear CacheStorage:', err);
      }
    }
    this.saveMeta([]);
    return true;
  }

  public formatBytes(bytes?: number): string {
    if (!bytes || typeof bytes !== 'number' || isNaN(bytes) || bytes <= 0) return '0 B';
    const k = 1024;
    const dm = 1;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.min(sizes.length - 1, Math.floor(Math.log(bytes) / Math.log(k)));
    if (i < 0) return '0 B';
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
  }

  public formatDuration(seconds?: number): string {
    if (typeof seconds !== 'number' || isNaN(seconds) || seconds <= 0) return '0 min';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    if (mins === 0) return `${secs}s`;
    return secs > 0 ? `${mins}m ${secs}s` : `${mins} min`;
  }
}

export const offlineVault = new OfflineVaultService();
