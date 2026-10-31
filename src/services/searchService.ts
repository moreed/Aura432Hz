import { BUILT_IN_MIX_PRESETS, getCustomPresets, MixPreset } from './storage';
import {
  SOLFEGGIO_FREQUENCIES,
  BRAINWAVE_MODES,
  DEFAULT_NATURE_SOUNDS,
  NatureSoundState,
  BrainwaveMode,
} from './audioEngine';
import { SPIRITUAL_AND_AUDIO_PRODUCTS, SpiritualProduct } from '../data/spiritualProducts';
import { editorialStorage, EditorialArticle } from './editorialStorage';
import { BUYING_GUIDES, BuyingGuideArticle } from '../components/BuyingGuidesSection';
import { SearchResultItem, SearchCategoryFilter } from '../types/search';

/**
 * Builds the complete searchable catalog from all sanctuary domains:
 * 1. Soundscapes (Presets, Solfeggio frequencies, Brainwave states)
 * 2. Individual Acoustic Layer Controls (Nature, instruments, singing bowls)
 * 3. Products (Sacred sound gear, bowls, chimes, headphones)
 * 4. Science & Blog (Scholarly articles, research citations, buying guides, acoustic safety)
 */
export function buildSearchCatalog(activeNatureSounds: NatureSoundState[]): SearchResultItem[] {
  const items: SearchResultItem[] = [];

  // --------------------------------------------------------------------------
  // 1. SOUNDSCAPES & PRESETS
  // --------------------------------------------------------------------------
  const customPresets = getCustomPresets();
  const allPresets: MixPreset[] = [...BUILT_IN_MIX_PRESETS, ...customPresets];

  allPresets.forEach((preset) => {
    const activeLayerNames = Object.entries(preset.natureLevels || {})
      .filter(([_, vol]) => (vol as number) > 0)
      .map(([id]) => {
        const found = DEFAULT_NATURE_SOUNDS.find((s) => s.id === id);
        return found ? found.name : id;
      });

    items.push({
      id: `preset-${preset.id}`,
      type: 'soundscape',
      category: 'soundscapes',
      title: preset.name,
      subtitle: `${preset.baseFreq}Hz • ${(preset.brainwaveMode || 'alpha_healing').replace('_', ' ').toUpperCase()} • ${preset.category.toUpperCase()}`,
      description: preset.description || `Harmonically mastered ${preset.baseFreq}Hz soundscape with ${activeLayerNames.join(', ')}.`,
      tags: [
        'soundscape',
        'preset',
        preset.category,
        `${preset.baseFreq}hz`,
        preset.brainwaveMode,
        ...(preset.tags || []),
        ...activeLayerNames,
      ],
      badge: `${preset.baseFreq}Hz Soundscape`,
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
      iconName: 'Headphones',
      preset,
      frequencyHz: preset.baseFreq,
      brainwaveMode: (preset.brainwaveMode as BrainwaveMode) || 'alpha_healing',
    });
  });

  // Solfeggio Frequencies
  SOLFEGGIO_FREQUENCIES.forEach((solfeggio) => {
    items.push({
      id: `solfeggio-${solfeggio.freq}`,
      type: 'solfeggio',
      category: 'soundscapes',
      title: `${solfeggio.freq}Hz — ${solfeggio.name}`,
      subtitle: `Solfeggio Harmonic • ${solfeggio.label} • ${solfeggio.recommendedBreath.patternName}`,
      description: solfeggio.description,
      tags: [
        'solfeggio',
        'frequency',
        `${solfeggio.freq}hz`,
        `${solfeggio.freq}`,
        solfeggio.name,
        solfeggio.label,
        solfeggio.recommendedBreath.patternName,
        'healing tone',
      ],
      badge: `${solfeggio.freq}Hz Solfeggio`,
      badgeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
      iconName: 'Radio',
      frequencyHz: solfeggio.freq,
      brainwaveMode: 'alpha_healing',
    });
  });

  // Brainwave Modes
  (Object.keys(BRAINWAVE_MODES) as BrainwaveMode[]).forEach((modeKey) => {
    const mode = BRAINWAVE_MODES[modeKey];
    items.push({
      id: `brainwave-${modeKey}`,
      type: 'brainwave',
      category: 'soundscapes',
      title: `${mode.name} (${mode.beatHz > 0 ? `${mode.beatHz}Hz Beat` : 'Cosmic Pure'})`,
      subtitle: `${mode.beatHz > 0 ? `${mode.beatHz}Hz Modulation` : 'Pure Tone'} • Binaural & Isochronic Entrainment`,
      description: `${mode.description}. Target state: ${mode.targetState}.`,
      tags: [
        'brainwave',
        'binaural',
        'isochronic',
        mode.name,
        modeKey,
        mode.targetState,
        'entrainment',
      ],
      badge: `${mode.beatHz > 0 ? `${mode.beatHz}Hz` : 'Pure'} Brainwave`,
      badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
      iconName: 'Brain',
      frequencyHz: 432,
      brainwaveMode: modeKey,
    });
  });

  // --------------------------------------------------------------------------
  // 2. INDIVIDUAL ACOUSTIC LAYER CONTROLS
  // --------------------------------------------------------------------------
  const currentLayers = activeNatureSounds.length > 0 ? activeNatureSounds : DEFAULT_NATURE_SOUNDS;
  currentLayers.forEach((layer) => {
    const categoryLabel =
      layer.category === 'nature'
        ? 'Procedural Nature Layer'
        : layer.category === 'sacred'
        ? 'Sacred Meditative Drone'
        : '432Hz Acoustic Instrument';

    items.push({
      id: `layer-${layer.id}`,
      type: 'acoustic_layer',
      category: 'layers',
      title: layer.name,
      subtitle: `${categoryLabel} • ${layer.enabled ? `Active (${Math.round(layer.volume * 100)}%)` : 'Muted (Inactive)'}`,
      description: layer.description || `Procedurally generated ${layer.name} acoustic layer tuned for meditation and relaxation.`,
      tags: [
        'layer',
        'acoustic layer',
        'mixer',
        'nature sound',
        layer.name,
        layer.id,
        layer.category,
        'sound control',
        'volume',
      ],
      badge: layer.enabled ? `Active • ${Math.round(layer.volume * 100)}%` : 'Muted',
      badgeColor: layer.enabled
        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
        : 'bg-slate-800 text-slate-400 border-slate-700',
      iconName: layer.icon || 'Sliders',
      layer,
    });
  });

  // --------------------------------------------------------------------------
  // 3. PRODUCTS & SACRED AUDIO GEAR
  // --------------------------------------------------------------------------
  SPIRITUAL_AND_AUDIO_PRODUCTS.forEach((prod) => {
    const specsSummary = prod.specifications ? prod.specifications.map((s) => `${s.label}: ${s.value}`).join(' • ') : '';
    items.push({
      id: `product-${prod.id}`,
      type: 'product',
      category: 'products',
      title: prod.name,
      subtitle: `${prod.brand} • ${prod.price} • ★ ${prod.rating} (${prod.reviewCount} verified reviews)`,
      description: `${prod.description} ${specsSummary ? `Specifications: ${specsSummary}.` : ''}`,
      tags: [
        'product',
        'gear',
        'shop',
        'buy',
        prod.name,
        prod.brand,
        prod.category,
        prod.price,
        prod.spiritualVibe,
        ...(prod.pros || []),
      ],
      badge: `${prod.price} • Gear`,
      badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
      iconName: 'ShoppingBag',
      product: prod,
    });
  });

  // --------------------------------------------------------------------------
  // 4. SCIENCE & BLOG ARTICLES & BUYING GUIDES
  // --------------------------------------------------------------------------
  const editorialArticles: EditorialArticle[] = editorialStorage.getArticles();
  editorialArticles.forEach((art) => {
    const authorName = art.author?.name || 'Aura Editorial Contributor';
    const firstBody = art.content?.[0]?.body?.[0] || '';
    items.push({
      id: `article-${art.id}`,
      type: 'editorial_article',
      category: 'science',
      title: art.title,
      subtitle: `${art.category.replace('_', ' ').toUpperCase()} • ${art.readTimeMinutes} min read • By ${authorName}`,
      description: art.summary || (firstBody ? firstBody.slice(0, 160) + '...' : 'Peer-reviewed acoustic research article.'),
      tags: [
        'science',
        'blog',
        'article',
        'research',
        'scholarly',
        art.title,
        art.category,
        authorName,
        ...(art.tags || []),
      ],
      badge: 'Science & Blog',
      badgeColor: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
      iconName: 'BookOpen',
      article: art,
    });
  });

  // Buying Guides
  BUYING_GUIDES.forEach((guide) => {
    items.push({
      id: `guide-${guide.id}`,
      type: 'buying_guide',
      category: 'science',
      title: guide.title,
      subtitle: `Equipment Guide • ${guide.category.toUpperCase()} • Last updated: ${guide.byline.dateUpdated}`,
      description: guide.subtitle || 'Evidence-based testing and recommendations for acoustic meditation equipment.',
      tags: [
        'buying guide',
        'guide',
        'equipment',
        'science',
        'review',
        guide.title,
        guide.category,
        guide.byline.author,
      ],
      badge: 'Equipment Guide',
      badgeColor: 'bg-sky-500/20 text-sky-300 border-sky-500/30',
      iconName: 'FileText',
      buyingGuide: guide,
    });
  });

  // Acoustic Safety Standard
  items.push({
    id: 'safety-calibration-certificate',
    type: 'acoustic_safety',
    category: 'science',
    title: 'Acoustic Safety & Frequency Integrity Standards (Hz vs MHz)',
    subtitle: '100% Calibrated Audible Sound • 0.00 MHz RF Radiation • WHO Sound Safety',
    description: 'Clinical safety standards proving all 432Hz tones are purely mechanical acoustic sound waves with zero electromagnetic or radio frequency radiation.',
    tags: [
      'safety',
      'hz vs mhz',
      'radiation',
      'safe listening',
      'acoustic integrity',
      'calibration',
      'science',
      'who standards',
    ],
    badge: 'Safety Standard',
    badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    iconName: 'ShieldCheck',
  });

  return items;
}

/**
 * Searches the catalog with multi-keyword matching, frequency detection, and scoring
 */
export function searchSanctuaryCatalog(
  query: string,
  category: SearchCategoryFilter,
  catalog: SearchResultItem[]
): SearchResultItem[] {
  const cleanQuery = query.trim().toLowerCase();

  // If query is empty and user filtered by category, show all items for that category
  if (!cleanQuery) {
    if (category === 'all') {
      return catalog.slice(0, 15);
    }
    return catalog.filter((item) => item.category === category).slice(0, 25);
  }

  // Tokenize query words
  const queryTokens = cleanQuery.split(/\s+/).filter(Boolean);

  // Score each item
  const scoredItems: { item: SearchResultItem; score: number }[] = [];

  for (const item of catalog) {
    // Filter out if not in selected category
    if (category !== 'all' && item.category !== category) {
      continue;
    }

    const titleLower = item.title.toLowerCase();
    const descLower = item.description.toLowerCase();
    const subtitleLower = (item.subtitle || '').toLowerCase();
    const tagsLower = item.tags.map((t) => t.toLowerCase()).join(' ');

    let score = 0;

    // Check exact full string match
    if (titleLower === cleanQuery) {
      score += 100;
    } else if (titleLower.startsWith(cleanQuery)) {
      score += 60;
    } else if (titleLower.includes(cleanQuery)) {
      score += 40;
    }

    if (subtitleLower.includes(cleanQuery)) {
      score += 25;
    }

    if (descLower.includes(cleanQuery)) {
      score += 15;
    }

    // Token matching
    let allTokensMatched = true;
    for (const token of queryTokens) {
      const tokenInTitle = titleLower.includes(token);
      const tokenInSubtitle = subtitleLower.includes(token);
      const tokenInDesc = descLower.includes(token);
      const tokenInTags = tagsLower.includes(token);

      if (tokenInTitle) score += 20;
      else if (tokenInSubtitle) score += 12;
      else if (tokenInTags) score += 10;
      else if (tokenInDesc) score += 5;
      else {
        allTokensMatched = false;
      }
    }

    // Boost if all tokens matched
    if (allTokensMatched) {
      score += 30;
    }

    // Frequency specific query bonus (e.g. "432", "528", "174", "963")
    if (item.frequencyHz && cleanQuery.includes(String(item.frequencyHz))) {
      score += 45;
    }

    if (score > 0) {
      scoredItems.push({ item, score });
    }
  }

  // Sort descending by score
  scoredItems.sort((a, b) => b.score - a.score);

  return scoredItems.map((s) => s.item);
}

/**
 * Suggested popular searches
 */
export const POPULAR_SEARCH_SUGGESTIONS = [
  { label: 'Deep Sleep Delta', query: 'deep sleep delta', category: 'soundscapes' as const },
  { label: '528Hz Transformation', query: '528hz', category: 'soundscapes' as const },
  { label: 'Rain & Drops', query: 'rain', category: 'layers' as const },
  { label: 'Tibetan Singing Bowls', query: 'tibetan bowl', category: 'layers' as const },
  { label: 'Koshi Bamboo Chimes', query: 'koshi', category: 'products' as const },
  { label: 'Open-Back Headphones', query: 'headphones', category: 'products' as const },
  { label: 'Vagus Nerve & HRV Science', query: 'vagus', category: 'science' as const },
  { label: 'Cymatics Water Patterns', query: 'cymatics', category: 'science' as const },
];
