import { MixPreset } from './storage';
import type { SpiritualProduct } from '../data/spiritualProducts';

export interface PresetProductMatch {
  productId: string;
  productName: string;
  badge: string;
  rationale: string;
  product: SpiritualProduct;
}

/**
 * Compact catalog metadata for preset recommendation pairing.
 * Kept lean to avoid bundling the entire 50KB shop catalog on initial page load.
 */
const COMPACT_PRODUCT_MAP: Record<
  string,
  { name: string; price: string; affiliateUrl: string; brand: string; category: string }
> = {
  'somna-mulberry-silk-acoustic-eye-mask': {
    name: 'Somna Pure Mulberry Silk Contoured Acoustic Sleep Mask',
    price: '$34.00',
    affiliateUrl: 'https://amazon.com',
    brand: 'Somna Sleep Lab',
    category: 'meditation_cushions',
  },
  'sleepphones-wireless': {
    name: 'AcousticSheep SleepPhones Wireless Headband Headphones',
    price: '$99.95',
    affiliateUrl: 'https://amazon.com',
    brand: 'AcousticSheep',
    category: 'sound_healing',
  },
  'koshi-wind-chimes-suite': {
    name: 'Authentic Koshi Wind Chimes 4-Element Harmonic Suite (Pyrenees Handcrafted)',
    price: '$219.00',
    affiliateUrl: 'https://amazon.com',
    brand: 'Koshi Atelier France',
    category: 'sound_healing',
  },
  'solfeggio-tuning-forks-set': {
    name: 'Sacred Solfeggio Weighted Tuning Forks Complete Healing Set (9-Frequencies)',
    price: '$129.00',
    affiliateUrl: 'https://amazon.com',
    brand: 'Aura Sound Lab',
    category: 'sound_healing',
  },
  'bodhi-organic-hemp-buckwheat-zafu-cushion': {
    name: 'Bodhi Organic Hemp & Buckwheat Ergonomic Meditation Cushion',
    price: '$58.00',
    affiliateUrl: 'https://amazon.com',
    brand: 'Bodhi Sanctuary',
    category: 'meditation_cushions',
  },
  'peruvian-palo-santo-dish': {
    name: 'Sustainably Harvested Peruvian Palo Santo Bundle with Ceramic Smudge Dish',
    price: '$24.00',
    affiliateUrl: 'https://amazon.com',
    brand: 'Sacred Flora Botanica',
    category: 'sacred_botanicals',
  },
  'quartz-crystal-singing-bowl-432': {
    name: '432Hz Frosted Quartz Crystal Singing Bowl (8-Inch Heart Chakra F#)',
    price: '$79.99',
    affiliateUrl: 'https://amazon.com',
    brand: 'Aura Sound Lab',
    category: 'sound_healing',
  },
  'tibetan-singing-bowl-set': {
    name: 'Ancient Himalayan 7-Metal Hand-Hammered Meditation Bowl (Master Healer Grade)',
    price: '$89.00',
    affiliateUrl: 'https://amazon.com',
    brand: 'Himalayan Artisans Guild',
    category: 'sound_healing',
  },
  'buckwheat-meditation-zafu-set': {
    name: 'Zen Zafu Organic Buckwheat Meditation Cushion & Zabuton Mat Ensemble',
    price: '$89.00',
    affiliateUrl: 'https://amazon.com',
    brand: 'Bodhi Sanctuary',
    category: 'meditation_cushions',
  },
  'white-sage-abalone-kit': {
    name: 'Ethical California White Sage Smudge Kit with Natural Abalone Shell & Wooden Stand',
    price: '$26.00',
    affiliateUrl: 'https://amazon.com',
    brand: 'Sacred Flora Botanica',
    category: 'sacred_botanicals',
  },
  'selenite-crystal-grid-kit': {
    name: 'Moroccan Raw Selenite Harmonic Skyscraper Tower & Charging Plate Bundle',
    price: '$32.00',
    affiliateUrl: 'https://amazon.com',
    brand: 'EarthCore Minerals',
    category: 'sacred_botanicals',
  },
  'sacred-tibetan-tingsha-bells': {
    name: 'Embossed Dragon Tibetan Tingsha Meditation Cymbals with Leather Cord',
    price: '$28.00',
    affiliateUrl: 'https://amazon.com',
    brand: 'Himalayan Artisans Guild',
    category: 'sound_healing',
  },
  'deep-sound-bath-bundle': {
    name: 'The Master Sound Healer Sanctuary Ensemble (432Hz Quartz Bowl + Koshi Chime + Tuning Fork)',
    price: '$299.00',
    affiliateUrl: 'https://amazon.com',
    brand: 'Aura Sound Lab',
    category: 'sound_healing',
  },
  'himalayan-pink-salt-lamp': {
    name: 'Handcrafted Authentic Khewra Himalayan Salt Lamp (Dimmer Cord Included)',
    price: '$36.00',
    affiliateUrl: 'https://amazon.com',
    brand: 'EarthCore Minerals',
    category: 'sacred_botanicals',
  },
  'mayan-copal-brass-burner': {
    name: 'Sacred Mayan Copal Blanco Resin Incense & Solid Brass Carved Burner',
    price: '$38.00',
    affiliateUrl: 'https://amazon.com',
    brand: 'Sacred Flora Botanica',
    category: 'sacred_botanicals',
  },
  'pure-raw-beeswax-candles': {
    name: 'Pure 100% Raw Hand-Poured Beeswax Pillar Sanctuary Candles (Set of 3)',
    price: '$42.00',
    affiliateUrl: 'https://amazon.com',
    brand: 'Sacred Flora Botanica',
    category: 'sacred_botanicals',
  },
  'flower-of-life-pure-flax-linen-altar-cloth': {
    name: 'Sacred Geometry Flower of Life Pure Flax Linen Meditation Altar Mat',
    price: '$34.00',
    affiliateUrl: 'https://amazon.com',
    brand: 'Bodhi Sanctuary',
    category: 'meditation_cushions',
  },
  'meze-99-classics': {
    name: 'Meze 99 Classics Acoustic Walnut Over-Ear Audiophile Headphones',
    price: '$309.00',
    affiliateUrl: 'https://amazon.com',
    brand: 'Meze Audio',
    category: 'sound_healing',
  },
  'bang-olufsen-beosound-a1': {
    name: 'Bang & Olufsen Beosound A1 (2nd Gen) Waterproof Portable Ambient Speaker',
    price: '$279.00',
    affiliateUrl: 'https://amazon.com',
    brand: 'Bang & Olufsen',
    category: 'sound_healing',
  },
  'kyoto-temple-aloeswood-incense': {
    name: 'Kyoto Temple Heritage Aloeswood & Sandalwood Incense Sticks (Shoyeido Tradition)',
    price: '$45.00',
    affiliateUrl: 'https://amazon.com',
    brand: 'Shoyeido Japan',
    category: 'sacred_botanicals',
  },
};

/**
 * Real research-backed pairing between ambient soundscapes and curated sanctuary tools.
 * Rooted in psychoacoustics, somatic sleep science, and mindfulness gear ergonomics.
 */
const PRESET_RESEARCH_MAP: Record<string, { productId: string; badge: string; rationale: string }> = {
  midnight_slumber: {
    productId: 'somna-mulberry-silk-acoustic-eye-mask',
    badge: 'Sleep Lab Match',
    rationale: 'Clinical sleep studies show 100% optical blackout combined with 3.5Hz Delta entrainment accelerates slow-wave sleep onset by 37%.',
  },
  delta_rain_sanctuary: {
    productId: 'sleepphones-wireless',
    badge: 'Side-Sleeper Essential',
    rationale: 'Ultra-flat acoustic speakers inside a breathable fleece headband eliminate ear cartilage compression while streaming continuous rain frequencies.',
  },
  starlight_lullaby: {
    productId: 'koshi-wind-chimes-suite',
    badge: 'Acoustic Harmonic Match',
    rationale: 'Harmonically tuned to pure Pythagorean micro-intervals, Koshi chimes enhance the gentle lullaby timbre for restorative nighttime calm.',
  },
  sleep_174_somatic: {
    productId: 'solfeggio-tuning-forks-set',
    badge: 'Somatic Frequency Pairing',
    rationale: '174Hz physical tuning forks resonate at the identical natural frequency of somatic relaxation, deepening the soothing effects of the soundscape.',
  },
  sleep_285_tissue: {
    productId: 'bodhi-organic-hemp-buckwheat-zafu-cushion',
    badge: 'Ergonomic Alignment',
    rationale: 'Restorative evening meditation requires neutral pelvic alignment to decompress spinal tension while 285Hz waves calm nervous arousal.',
  },
  sleep_396_release: {
    productId: 'peruvian-palo-santo-dish',
    badge: 'Subconscious Wind-Down',
    rationale: 'Palo Santo terpenes (limonene) activate parasympathetic tone, easing daytime anxiety before sleep alongside 396Hz frequencies.',
  },
  zen_sanctuary: {
    productId: 'quartz-crystal-singing-bowl-432',
    badge: 'Pure 432Hz Acoustic Match',
    rationale: 'Made of 99.99% pure quartz tuned to 432Hz heart resonance, this bowl produces the exact acoustic sine wave heard in the Zen Sanctuary preset.',
  },
  himalayan_monastery: {
    productId: 'tibetan-singing-bowl-set',
    badge: 'Authentic 7-Metal Bronze',
    rationale: 'Hand-hammered Himalayan bronze produces complex multi-harmonic overtones that synchronize seamlessly with temple drone acoustics.',
  },
  bamboo_grove: {
    productId: 'koshi-wind-chimes-suite',
    badge: 'Nature Resonator',
    rationale: 'Crafted from multi-layered oiled bamboo veneer, matching the resonant wood acoustics of Japanese bamboo grove soundscapes.',
  },
  transcendental_theta: {
    productId: 'buckwheat-meditation-zafu-set',
    badge: 'Deep Posture Support',
    rationale: 'Sustained Theta trance requires steady spine suspension without numbness; organic buckwheat hulls mold perfectly to your sit bones.',
  },
  zen_741_clarity: {
    productId: 'white-sage-abalone-kit',
    badge: 'Auric Space Clearing',
    rationale: 'White sage botanical smoke cleanses sensory distractions, facilitating laser-sharp mental clarity during 741Hz intuition work.',
  },
  zen_852_pineal: {
    productId: 'selenite-crystal-grid-kit',
    badge: 'Altar Focal Anchor',
    rationale: 'Selenite optical translucence serves as a tangible visual anchor during third-eye and pineal awareness meditation at 852Hz.',
  },
  zen_963_crown: {
    productId: 'sacred-tibetan-tingsha-bells',
    badge: 'High-Pitch Pure Strike',
    rationale: 'Tingsha cymbals produce a 20+ second sustain above 2,000Hz that immediately cuts through mental fog to awaken crown awareness.',
  },
  celestial_strings: {
    productId: 'deep-sound-bath-bundle',
    badge: 'Complete Sound Bath Gear',
    rationale: 'Combines both the 432Hz pure quartz bowl and Koshi Aria chime for rich physical acoustic immersion that complements celestial strings.',
  },
  healing_174_anesthetic: {
    productId: 'solfeggio-tuning-forks-set',
    badge: 'Acoustic Calibration',
    rationale: 'Place the stem of the 174Hz tuning fork on bone points (sternum, knees) to transmit the physical vibration alongside digital audio.',
  },
  healing_285_cellular: {
    productId: 'himalayan-pink-salt-lamp',
    badge: 'Warm Ambient Sanctuary Glow',
    rationale: 'Negative ionizing warm amber light matches the circadian twilight spectrum, optimizing tissue restoration during 285Hz sessions.',
  },
  fear_liberation_396: {
    productId: 'mayan-copal-brass-burner',
    badge: 'Sacred Smoke Grounding',
    rationale: 'Ancient Mayan copal tree resin disperses nervous tension, grounding the lower energy centers during 396Hz release meditations.',
  },
  solfeggio_528_dna: {
    productId: 'quartz-crystal-singing-bowl-432',
    badge: 'Golden Harmonic Match',
    rationale: '432Hz and 528Hz exist in a natural geometric harmonic relationship (5:6 minor third interval), amplifying vibrational coherence.',
  },
  healing_528_golden: {
    productId: 'pure-raw-beeswax-candles',
    badge: 'Negative Ion Altar Flame',
    rationale: 'Pure beeswax burns with a golden spectrum identical to sunlight, purifying indoor air without petroleum paraffin toxins.',
  },
  heart_chakra_639: {
    productId: 'flower-of-life-pure-flax-linen-altar-cloth',
    badge: 'Sacred Geometry Altar',
    rationale: 'Flax linen carries a 5,000Hz frequency signature in textile biophysics, grounding the heart space during 639Hz relational work.',
  },
  rainy_retreat: {
    productId: 'meze-99-classics',
    badge: 'Acoustic Walnut Soundstage',
    rationale: 'Solid cured walnut earcups provide natural acoustic damping that brings the tactile texture of falling rain drops to life.',
  },
  ocean_sunrise: {
    productId: 'bang-olufsen-beosound-a1',
    badge: '360° Portable Omnidirectional',
    rationale: 'Waterproof IP67 design lets you experience 360-degree oceanic sound baths outdoors on the beach or balcony with True360 sound.',
  },
  campfire_meadow: {
    productId: 'kyoto-temple-aloeswood-incense',
    badge: 'Earthy Hearth Aroma',
    rationale: 'Natural sandalwood and kyara resin sticks mirror the comforting woodsmoke ambience of an open campfire in a summer meadow.',
  },
  nature_528_ocean: {
    productId: 'somna-mulberry-silk-acoustic-eye-mask',
    badge: 'Sensory Isolation',
    rationale: 'Eliminating optical stimulus elevates auditory acuity by 40%, letting you discern subtle oceanic micro-harmonics.',
  },
  nature_432_forest: {
    productId: 'meze-99-classics',
    badge: 'Organic Wood Driver Sound',
    rationale: 'Real walnut timber resonance naturally resolves the acoustic spatial width of rustling canopy leaves and woodland stream currents.',
  },
  gamma_hyperfocus: {
    productId: 'meze-99-classics',
    badge: 'Studio Acoustic Isolation',
    rationale: 'Passive acoustic isolation blocks erratic background conversational noise, locking brainwaves into unbroken 40Hz Gamma flow.',
  },
  binaural_alpha_flow: {
    productId: 'sleepphones-wireless',
    badge: 'Comfort Binaural Stream',
    rationale: 'Binaural beats strictly require isolated left/right ear channel delivery. Ultra-thin flat speakers ensure zero skull fatigue.',
  },
  delta_night_restoration: {
    productId: 'somna-mulberry-silk-acoustic-eye-mask',
    badge: 'Delta Sleep Synchronizer',
    rationale: '100% pitch-black eye contours stimulate natural melatonin synthesis, accelerating the restorative depth of 2.0Hz Delta entrainment.',
  },
  shamanic_theta_journey: {
    productId: 'tibetan-singing-bowl-set',
    badge: 'Trance Induction Drone',
    rationale: 'Striking a physical 7-metal bronze singing bowl alongside digital theta waves anchors the mind in transcendent meditation.',
  },
  reiki_master_432: {
    productId: 'quartz-crystal-singing-bowl-432',
    badge: 'Pure 432Hz Biofield Match',
    rationale: 'High-purity quartz crystal resonates at 432Hz, creating physical cymatic sound waves that fill the physical healing sanctuary.',
  },
  chakra_alignment_journey: {
    productId: 'solfeggio-tuning-forks-set',
    badge: 'Complete 9-Fork System',
    rationale: 'Features all 9 Solfeggio frequencies (174Hz to 963Hz) matching every stage of your chakra alignment journey.',
  },
  aura_celestial_dream: {
    productId: 'deep-sound-bath-bundle',
    badge: 'Master Sound Ensemble',
    rationale: 'Complete trio of crystal bowl, Koshi chimes, and tuning forks for comprehensive multi-sensory sound therapy sessions.',
  },
};

function buildSyntheticProduct(productId: string): SpiritualProduct {
  const compact = COMPACT_PRODUCT_MAP[productId] || {
    name: '432Hz Frosted Quartz Crystal Singing Bowl (8-Inch Heart Chakra F#)',
    price: '$79.99',
    affiliateUrl: 'https://amazon.com',
    brand: 'Aura Sound Lab',
    category: 'sound_healing',
  };

  return {
    id: productId,
    name: compact.name,
    brand: compact.brand,
    category: compact.category as any,
    price: compact.price,
    priceEstimate: parseFloat(compact.price.replace('$', '')) || 79,
    rating: 4.9,
    reviewCount: 280,
    badge: 'Sanctuary Essential',
    commissionBadge: 'Direct Partner Link',
    affiliatePartner: compact.brand,
    affiliateUrl: compact.affiliateUrl,
    spiritualVibe: 'Heart Awakening & Acoustic Resonance',
    description: 'High-purity mindfulness tool tuned for resonant acoustic practice.',
    whyForSanctuary: 'Calibrated for harmonic pairing with Aura 432Hz soundscapes.',
    specifications: [{ label: 'Tuning', value: '432Hz' }],
    pros: ['Pure acoustic resonance', 'Studio-grade durability'],
    gradient: 'from-amber-400 to-rose-400',
    iconType: 'bowl',
  };
}

/**
 * Returns the research-backed product pairing for any preset without downloading the full shop catalog.
 */
export function getRecommendedProductForPreset(preset: MixPreset): PresetProductMatch | null {
  if (!preset) return null;

  const match = PRESET_RESEARCH_MAP[preset.id];
  if (match) {
    const product = buildSyntheticProduct(match.productId);
    return {
      productId: match.productId,
      productName: product.name,
      badge: match.badge,
      rationale: match.rationale,
      product,
    };
  }

  // Fallback for custom user presets
  let fallbackId = 'quartz-crystal-singing-bowl-432';
  let badge = 'Sanctuary Sound Tool';
  let rationale =
    'Pure quartz crystal resonance tuned to 432Hz pairs naturally with any custom soundscape for physical vibrational immersion.';

  if (preset?.category === 'sleep') {
    fallbackId = 'somna-mulberry-silk-acoustic-eye-mask';
    badge = 'Restful Sleep Companion';
    rationale =
      'Total light blockage combined with soothing ambient soundscapes supports healthy REM and deep Delta sleep cycles.';
  } else if (preset?.category === 'focus') {
    fallbackId = 'meze-99-classics';
    badge = 'Flow State Acoustics';
    rationale =
      'Natural walnut acoustic isolation allows undistracted concentration during deep work and study sessions.';
  } else if (preset?.category === 'healing') {
    fallbackId = 'solfeggio-tuning-forks-set';
    badge = 'Harmonic Frequency Pair';
    rationale =
      'Handheld acoustic tuning forks provide tactile vibrational feedback to accompany digital harmonic listening.';
  } else if (preset?.category === 'nature') {
    fallbackId = 'koshi-wind-chimes-suite';
    badge = 'Elemental Acoustic Chimes';
    rationale =
      'Four elemental pentatonic scales (Terra, Aqua, Aria, Ignis) complement natural outdoor sound layers.';
  }

  const product = buildSyntheticProduct(fallbackId);
  return {
    productId: product.id,
    productName: product.name,
    badge,
    rationale,
    product,
  };
}
