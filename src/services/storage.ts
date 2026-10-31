/**
 * Local Storage & IndexedDB persistence for offline meditation tracks & nature presets
 */

export interface SavedTrack {
  id: string;
  title: string;
  prompt: string;
  model: string;
  audioBase64: string;
  mimeType: string;
  createdAt: string;
  durationSec?: number;
  lyrics?: string;
  frequency?: number;
}

export type PresetCategory = 'sleep' | 'meditation' | 'healing' | 'nature' | 'focus';
export type PresetFilterCategory = PresetCategory | 'all' | 'custom' | 'favorites';

export interface PresetCategoryMeta {
  id: PresetFilterCategory;
  label: string;
  tagline: string;
  color: string;
}

export const PRESET_CATEGORIES: PresetCategoryMeta[] = [
  { id: 'all', label: 'All Presets', tagline: 'Full Sanctuary Sound Library', color: 'text-sky-400' },
  { id: 'favorites', label: 'Favorites ❤️', tagline: 'Your Bookmarked Sanctuary Soundscapes', color: 'text-rose-400' },
  { id: 'sleep', label: 'Sleep & Rest', tagline: 'Delta Waves & Nocturnal Wilderness', color: 'text-indigo-400' },
  { id: 'meditation', label: 'Meditation & Zen', tagline: 'Theta Waves & Sacred Atmosphere', color: 'text-emerald-400' },
  { id: 'healing', label: 'Harmonic Restoration', tagline: 'Solfeggio Soundscapes & Meditative Frequencies', color: 'text-amber-400' },
  { id: 'nature', label: 'Wild Nature', tagline: 'Biophilic Forests, Rain & Oceans', color: 'text-cyan-400' },
  { id: 'focus', label: 'Flow & Focus', tagline: 'Low-Alpha Calm Cognitive Clarity', color: 'text-teal-400' },
  { id: 'custom', label: 'My Presets', tagline: 'Custom Personalized Blends', color: 'text-purple-400' },
];

export interface MixPreset {
  id: string;
  name: string;
  description: string;
  category: PresetCategory;
  icon?: string; // Unique visual glyph representing the soundscape
  isCustom?: boolean;
  isFavorite?: boolean;
  baseFreq: number;
  brainwaveMode: string;
  natureLevels: Record<string, number>; // id -> volume (0 means disabled)
  tags?: string[];
}

export const BUILT_IN_MIX_PRESETS: MixPreset[] = [
  // ==========================================
  // 1. SLEEP & REST (6 PRESETS)
  // ==========================================
  {
    id: 'midnight_slumber',
    name: 'Midnight Slumber',
    description: 'Deep sleep Delta 3.5Hz with summer crickets, warm campfire & velvet brown noise',
    category: 'sleep',
    icon: '🌙',
    baseFreq: 432,
    brainwaveMode: 'delta_sleep',
    natureLevels: { crickets: 0.45, fire: 0.35, brown_noise: 0.3 },
    tags: ['432Hz', 'Delta 3.5Hz', 'Deep Sleep', 'Crickets'],
  },
  {
    id: 'delta_rain_sanctuary',
    name: 'Deep Delta Rainfall',
    description: 'Drift into restorative REM cycles with heavy canopy rain, gentle stream & distant rumble',
    category: 'sleep',
    icon: '🌧️',
    baseFreq: 432,
    brainwaveMode: 'delta_sleep',
    natureLevels: { rain: 0.65, stream: 0.3, thunder: 0.25, brown_noise: 0.25 },
    tags: ['432Hz', 'Delta 3.5Hz', 'Rain', 'Night Rest'],
  },
  {
    id: 'starlight_lullaby',
    name: 'Starlight Lullaby',
    description: 'Soothing bamboo Koshi chimes and celestial harp string harmonics at 3.5Hz Delta',
    category: 'sleep',
    icon: '⭐',
    baseFreq: 432,
    brainwaveMode: 'delta_sleep',
    natureLevels: { koshi: 0.45, harp: 0.4, wind: 0.3 },
    tags: ['432Hz', 'Delta 3.5Hz', 'Koshi', 'Harp'],
  },
  {
    id: 'sleep_174_somatic',
    name: '174Hz Somatic Night Sanctuary',
    description: '174Hz natural bio-anesthetic frequency melting physical tension with oceanic swells & singing bowls',
    category: 'sleep',
    icon: '🌊',
    baseFreq: 174,
    brainwaveMode: 'delta_sleep',
    natureLevels: { ocean: 0.55, brown_noise: 0.35, bowls: 0.3 },
    tags: ['174Hz', 'Soothing Comfort', 'Delta 3.5Hz', 'Ocean'],
  },
  {
    id: 'sleep_285_tissue',
    name: '285Hz Ambient Nocturnal Rest',
    description: '285Hz harmonic soundscape for deep evening stillness with cello resonance & quiet mountain rain',
    category: 'sleep',
    icon: '🕯️',
    baseFreq: 285,
    brainwaveMode: 'delta_sleep',
    natureLevels: { cello: 0.5, stream: 0.35, rain: 0.3 },
    tags: ['285Hz', 'Restoration', 'Delta 3.5Hz', 'Cello'],
  },
  {
    id: 'sleep_396_release',
    name: '396Hz Subconscious Night Cleanse',
    description: '396Hz root frequency dissolving worry and heavy emotional baggage by the campfire',
    category: 'sleep',
    icon: '🔥',
    baseFreq: 396,
    brainwaveMode: 'delta_sleep',
    natureLevels: { crickets: 0.45, fire: 0.4, bowls: 0.3 },
    tags: ['396Hz', 'Root Release', 'Delta 3.5Hz', 'Embers'],
  },

  // ==========================================
  // 2. MEDITATION & ZEN (7 PRESETS)
  // ==========================================
  {
    id: 'zen_sanctuary',
    name: 'Zen Sanctuary',
    description: '432Hz Alpha 10Hz with Tibetan singing bowls and gentle mountain rain',
    category: 'meditation',
    icon: '🧘',
    baseFreq: 432,
    brainwaveMode: 'alpha_healing',
    natureLevels: { rain: 0.45, bowls: 0.55 },
    tags: ['432Hz', 'Alpha 10Hz', 'Singing Bowls', 'Rain'],
  },
  {
    id: 'himalayan_monastery',
    name: 'Sacred Monastery',
    description: 'Sacred Indian Tanpura, singing bowls, and distant rolling thunder',
    category: 'meditation',
    icon: '🏛️',
    baseFreq: 432,
    brainwaveMode: 'theta_meditation',
    natureLevels: { tanpura: 0.5, bowls: 0.45, thunder: 0.35 },
    tags: ['432Hz', 'Theta 6Hz', 'Tanpura', 'Bowls'],
  },
  {
    id: 'bamboo_grove',
    name: 'Kyoto Bamboo Grove',
    description: 'Zen bansuri flute, Koshi wind chimes, and chirping forest morning birds',
    category: 'meditation',
    icon: '🎋',
    baseFreq: 432,
    brainwaveMode: 'alpha_flow',
    natureLevels: { flute: 0.5, koshi: 0.45, birds: 0.4, wind: 0.25 },
    tags: ['432Hz', 'Alpha 8.5Hz', 'Flute', 'Koshi'],
  },
  {
    id: 'transcendental_theta',
    name: 'Transcendental Theta',
    description: '6Hz deep subconscious theta opening with singing bowls, bansuri flute and meadow crickets',
    category: 'meditation',
    icon: '👁️',
    baseFreq: 432,
    brainwaveMode: 'theta_meditation',
    natureLevels: { bowls: 0.5, flute: 0.4, crickets: 0.25 },
    tags: ['432Hz', 'Theta 6Hz', 'Subconscious', 'Bowls'],
  },
  {
    id: 'zen_741_clarity',
    name: '741Hz Intuitive Awakening',
    description: '741Hz throat & third eye cleansing frequency with breathy flute, Koshi chimes & mountain stream',
    category: 'meditation',
    icon: '💠',
    baseFreq: 741,
    brainwaveMode: 'theta_meditation',
    natureLevels: { flute: 0.5, koshi: 0.45, stream: 0.35 },
    tags: ['741Hz', 'Intuition', 'Theta 6Hz', 'Cleansing'],
  },
  {
    id: 'zen_852_pineal',
    name: '852Hz Pineal Gland Stillness',
    description: '852Hz spiritual order frequency restoring inner vision with singing bowls & celestial harp',
    category: 'meditation',
    icon: '🔮',
    baseFreq: 852,
    brainwaveMode: 'theta_meditation',
    natureLevels: { bowls: 0.55, harp: 0.4, wind: 0.3 },
    tags: ['852Hz', 'Third Eye', 'Theta 6Hz', 'Vision'],
  },
  {
    id: 'zen_963_crown',
    name: '963Hz Crown Cosmic Oneness',
    description: '963Hz "Frequency of the Gods" connecting to pure source awareness with sacred Tanpura & chimes',
    category: 'meditation',
    icon: '👑',
    baseFreq: 963,
    brainwaveMode: 'theta_meditation',
    natureLevels: { tanpura: 0.5, bowls: 0.45, koshi: 0.35 },
    tags: ['963Hz', 'Crown Chakra', 'Theta 6Hz', 'Divine'],
  },

  // ==========================================
  // 3. HARMONIC RESTORATION & SOLFEGGIO (7 PRESETS)
  // ==========================================
  {
    id: 'celestial_strings',
    name: 'Celestial Strings',
    description: 'Deep cello string drone, crystalline harp plucks & Tibetan singing bowls in 432Hz',
    category: 'healing',
    icon: '🎻',
    baseFreq: 432,
    brainwaveMode: 'alpha_healing',
    natureLevels: { cello: 0.55, harp: 0.45, bowls: 0.4 },
    tags: ['432Hz', 'Alpha 10Hz', 'Cello', 'Harmonics'],
  },
  {
    id: 'healing_174_anesthetic',
    name: '174Hz Somatic Grounding',
    description: '174Hz low harmonic soundscape for deep relaxation with warm cello & mountain stream',
    category: 'healing',
    icon: '🫧',
    baseFreq: 174,
    brainwaveMode: 'alpha_healing',
    natureLevels: { cello: 0.5, stream: 0.4, bowls: 0.35 },
    tags: ['174Hz', 'Soothing Calm', 'Alpha 10Hz', 'Somatic'],
  },
  {
    id: 'healing_285_cellular',
    name: '285Hz Ambient Restoration',
    description: '285Hz tranquil harmonic tone with Koshi wind chimes, songbirds and morning breeze',
    category: 'healing',
    icon: '🌿',
    baseFreq: 285,
    brainwaveMode: 'alpha_healing',
    natureLevels: { koshi: 0.5, birds: 0.4, wind: 0.3 },
    tags: ['285Hz', 'Restoration', 'Alpha 10Hz', 'Peaceful'],
  },
  {
    id: 'fear_liberation_396',
    name: '396Hz Root Grounding & Balance',
    description: '396Hz Root Chakra frequency clearing mental clutter and emotional weight with cello & soft rain',
    category: 'healing',
    icon: '🛡️',
    baseFreq: 396,
    brainwaveMode: 'theta_meditation',
    natureLevels: { cello: 0.5, tanpura: 0.4, rain: 0.35 },
    tags: ['396Hz', 'Root Chakra', 'Grounding', 'Liberation'],
  },
  {
    id: 'solfeggio_528_dna',
    name: '528Hz Harmonic Soundscape',
    description: '528Hz uplifting frequency for emotional harmony, inner calm, singing bowls & stream',
    category: 'healing',
    icon: '🧬',
    baseFreq: 528,
    brainwaveMode: 'alpha_healing',
    natureLevels: { bowls: 0.5, koshi: 0.4, stream: 0.35 },
    tags: ['528Hz', 'Harmonic Tone', 'Emotional Balance', 'Renewal'],
  },
  {
    id: 'healing_528_golden',
    name: '528Hz Golden Harmonic Bath',
    description: 'Rich 528Hz harmonic bath with crystalline harp plucks, cello drones and warm singing bowl resonance',
    category: 'healing',
    icon: '✨',
    baseFreq: 528,
    brainwaveMode: 'alpha_healing',
    natureLevels: { harp: 0.55, cello: 0.45, bowls: 0.4 },
    tags: ['528Hz', 'Golden Ratio', 'Harp', 'Harmonics'],
  },
  {
    id: 'heart_chakra_639',
    name: '639Hz Heart Harmony',
    description: '639Hz Heart Chakra frequency stimulating compassion, interpersonal bonding & celestial harp',
    category: 'healing',
    icon: '💚',
    baseFreq: 639,
    brainwaveMode: 'alpha_healing',
    natureLevels: { harp: 0.5, birds: 0.35, wind: 0.3 },
    tags: ['639Hz', 'Heart Chakra', 'Love', 'Compassion'],
  },

  // ==========================================
  // 4. WILD NATURE IMMERSION (6 PRESETS)
  // ==========================================
  {
    id: 'rainy_retreat',
    name: 'Rainy Forest Retreat',
    description: 'Deep biophilic relaxation with rain drops, mountain stream, songbirds and canopy breeze',
    category: 'nature',
    icon: '☔',
    baseFreq: 432,
    brainwaveMode: 'alpha_flow',
    natureLevels: { rain: 0.6, stream: 0.35, birds: 0.3, wind: 0.25 },
    tags: ['432Hz', 'Biophilic', 'Rain', 'Stream'],
  },
  {
    id: 'ocean_sunrise',
    name: 'Ocean Shoreline Sunrise',
    description: 'Rhythmic rolling surf waves with seafoam hiss, oceanic gusts and warm celestial harp',
    category: 'nature',
    icon: '🌅',
    baseFreq: 432,
    brainwaveMode: 'alpha_healing',
    natureLevels: { ocean: 0.65, wind: 0.25, harp: 0.3 },
    tags: ['432Hz', 'Ocean Swells', 'Waves', 'Coastal'],
  },
  {
    id: 'campfire_meadow',
    name: 'Alpine Campfire & Meadow',
    description: 'Wood spark pops, soft canopy breeze and rhythmic night meadow cicadas under starry skies',
    category: 'nature',
    icon: '🏕️',
    baseFreq: 432,
    brainwaveMode: 'alpha_flow',
    natureLevels: { fire: 0.45, crickets: 0.35, wind: 0.3 },
    tags: ['432Hz', 'Campfire', 'Embers', 'Meadow'],
  },
  {
    id: 'nature_528_ocean',
    name: '528Hz Emerald Coastal Waves',
    description: '528Hz love vibration carried across rolling ocean surf swells and bamboo Koshi wind chimes',
    category: 'nature',
    icon: '🐬',
    baseFreq: 528,
    brainwaveMode: 'alpha_healing',
    natureLevels: { ocean: 0.6, koshi: 0.4, wind: 0.25 },
    tags: ['528Hz', 'Ocean Waves', 'Koshi', 'Coastal'],
  },
  {
    id: 'nature_639_canopy',
    name: '639Hz Rainforest Canopy Bath',
    description: '639Hz heart frequency bathed in tropical raindrops, vibrant morning birds & gentle bansuri flute',
    category: 'nature',
    icon: '🦜',
    baseFreq: 639,
    brainwaveMode: 'alpha_flow',
    natureLevels: { rain: 0.55, birds: 0.45, flute: 0.35 },
    tags: ['639Hz', 'Rainforest', 'Birds', 'Flute'],
  },
  {
    id: 'nature_174_mountain',
    name: '174Hz Mountain Stream Grounding',
    description: '174Hz somatic grounding paired with pure liquid pebble brook bubbles & velvet brown noise',
    category: 'nature',
    icon: '🏔️',
    baseFreq: 174,
    brainwaveMode: 'alpha_flow',
    natureLevels: { stream: 0.6, wind: 0.3, brown_noise: 0.25 },
    tags: ['174Hz', 'Pebble Stream', 'Grounding', 'Breeze'],
  },

  // ==========================================
  // 5. FLOW & FOCUS (6 PRESETS)
  // ==========================================
  {
    id: 'river_flow_focus',
    name: 'Mountain Brook Focus',
    description: 'Relaxed cognitive clarity with pebble water bubbles, forest canopy & velvet brown noise in 432Hz',
    category: 'focus',
    icon: '🏞️',
    baseFreq: 432,
    brainwaveMode: 'alpha_flow',
    natureLevels: { stream: 0.55, wind: 0.3, brown_noise: 0.25 },
    tags: ['432Hz', 'Alpha 8.5Hz', 'Stream', 'Focus'],
  },
  {
    id: 'acoustic_clarity',
    name: 'Acoustic Clarity',
    description: 'Gentle Koshi chime ripples with breathy bansuri flute and singing bowl drone for deep work',
    category: 'focus',
    icon: '🎐',
    baseFreq: 432,
    brainwaveMode: 'alpha_flow',
    natureLevels: { koshi: 0.45, flute: 0.4, bowls: 0.3 },
    tags: ['432Hz', 'Alpha Flow', 'Koshi', 'Flute'],
  },
  {
    id: 'focus_528_creativity',
    name: '528Hz Creative Flow Matrix',
    description: '528Hz spark of inspiration with shimmering harp notes, Koshi chimes & continuous pebble stream',
    category: 'focus',
    icon: '💡',
    baseFreq: 528,
    brainwaveMode: 'alpha_flow',
    natureLevels: { harp: 0.5, koshi: 0.4, stream: 0.35 },
    tags: ['528Hz', 'Creativity', 'Flow State', 'Harp'],
  },
  {
    id: 'focus_741_insight',
    name: '741Hz Intuitive Problem Solving',
    description: '741Hz cognitive cleansing dissolving mental blocks with singing bowls & velvet noise',
    category: 'focus',
    icon: '⚡',
    baseFreq: 741,
    brainwaveMode: 'alpha_flow',
    natureLevels: { bowls: 0.45, wind: 0.35, brown_noise: 0.3 },
    tags: ['741Hz', 'Problem Solving', 'Alpha 8.5Hz', 'Clarity'],
  },
  {
    id: 'focus_852_deep_study',
    name: '852Hz Deep Study Sanctuary',
    description: '852Hz heightened concentration with rich cello drones, trickling brook & velvet brown noise',
    category: 'focus',
    icon: '📚',
    baseFreq: 852,
    brainwaveMode: 'alpha_flow',
    natureLevels: { cello: 0.5, stream: 0.35, brown_noise: 0.3 },
    tags: ['852Hz', 'Deep Work', 'Cello', 'Focus'],
  },
  {
    id: 'focus_963_transcendent',
    name: '963Hz Transcendent Alignment',
    description: '963Hz pure harmonic cosmic alignment with sacred Indian Tanpura & crystalline Koshi chimes',
    category: 'focus',
    icon: '🌌',
    baseFreq: 963,
    brainwaveMode: 'pure_432',
    natureLevels: { tanpura: 0.5, koshi: 0.45, bowls: 0.35 },
    tags: ['963Hz', 'Pure State', 'Tanpura', 'Cosmic'],
  },
];

const DB_NAME = 'Aura432_OfflineStorage';
const DB_VERSION = 1;
const STORE_TRACKS = 'saved_tracks';

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_TRACKS)) {
        db.createObjectStore(STORE_TRACKS, { keyPath: 'id' });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function saveTrackOffline(track: SavedTrack): Promise<void> {
  try {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_TRACKS, 'readwrite');
      const store = tx.objectStore(STORE_TRACKS);
      const req = store.put(track);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (e) {
    console.error('IndexedDB save failed:', e);
  }
}

export async function getSavedTracksOffline(): Promise<SavedTrack[]> {
  try {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_TRACKS, 'readonly');
      const store = tx.objectStore(STORE_TRACKS);
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => reject(req.error);
    });
  } catch (e) {
    console.error('IndexedDB get failed:', e);
    return [];
  }
}

export async function deleteSavedTrackOffline(id: string): Promise<void> {
  try {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_TRACKS, 'readwrite');
      const store = tx.objectStore(STORE_TRACKS);
      const req = store.delete(id);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (e) {
    console.error('IndexedDB delete failed:', e);
  }
}

// Custom Nature Mix Presets in LocalStorage
const PRESETS_STORAGE_KEY = 'aura_432_custom_presets';

export function getCustomPresets(): MixPreset[] {
  try {
    const data = localStorage.getItem(PRESETS_STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function saveCustomPreset(preset: MixPreset): void {
  try {
    const list = getCustomPresets().filter((p) => p.id !== preset.id);
    list.unshift(preset);
    localStorage.setItem(PRESETS_STORAGE_KEY, JSON.stringify(list));
  } catch (e) {
    console.error('Failed to save preset:', e);
  }
}

export function deleteCustomPreset(id: string): void {
  try {
    const list = getCustomPresets().filter((p) => p.id !== id);
    localStorage.setItem(PRESETS_STORAGE_KEY, JSON.stringify(list));
  } catch (e) {
    console.error('Failed to delete preset:', e);
  }
}

// Favorite Soundscape Presets in LocalStorage
const FAVORITE_PRESETS_KEY = 'aura_432_favorite_presets';
export const DEFAULT_FAVORITE_PRESET_IDS = [
  'zen_sanctuary',
  'midnight_slumber',
  'delta_rain_sanctuary',
  'solfeggio_528_dna',
];

export function getFavoritePresetIds(): string[] {
  try {
    const data = localStorage.getItem(FAVORITE_PRESETS_KEY);
    if (!data) return DEFAULT_FAVORITE_PRESET_IDS;
    const parsed = JSON.parse(data);
    return Array.isArray(parsed) ? parsed : DEFAULT_FAVORITE_PRESET_IDS;
  } catch {
    return DEFAULT_FAVORITE_PRESET_IDS;
  }
}

export function saveFavoritePresetIds(ids: string[]): void {
  try {
    localStorage.setItem(FAVORITE_PRESETS_KEY, JSON.stringify(ids));
  } catch (e) {
    console.error('Failed to save favorite preset ids:', e);
  }
}

export function toggleFavoritePresetId(id: string): string[] {
  const current = getFavoritePresetIds();
  const exists = current.includes(id);
  const next = exists ? current.filter((x) => x !== id) : [...current, id];
  saveFavoritePresetIds(next);
  return next;
}

