/**
 * Aura 432Hz Sanctuary — Curated Products Catalogue Data
 */

export interface SpiritualProduct {
  id: string;
  name: string;
  brand: string;
  category:
    | 'incense_smudge'
    | 'sound_healing'
    | 'atmosphere_altar'
    | 'audio_headphones'
    | 'audio_speakers_dacs'
    | 'ritual_bundles'
    | 'apparel_fabrics'
    | 'crystals'
    | 'audio_gears'
    | 'incense'
    | 'books';
  price: string;
  priceEstimate: number;
  rating: number;
  reviewCount: number;
  badge: string;
  commissionBadge: string;
  affiliatePartner: string;
  affiliateUrl: string;
  spiritualVibe: string;
  description: string;
  shortDescription?: string;
  longDescription?: string;
  harmonicSupported?: string;
  whyForSanctuary: string;
  specifications: { label: string; value: string }[];
  pros: string[];
  gradient: string;
  iconType: 'flame' | 'bowl' | 'chime' | 'crystal' | 'lamp' | 'cushion' | 'headphones' | 'speaker' | 'dac' | 'bundle' | 'shirt';
  soundDemoType?: 'bowl' | 'chime' | 'fork' | 'stage' | 'crystal' | 'bundle';
  imageUrl?: string;
  photos?: string[];
}

export const SPIRITUAL_AND_AUDIO_PRODUCTS: SpiritualProduct[] = [
  // ==========================================
  // 1. SACRED INCENSE, SMUDGING & RESINS
  // ==========================================
  {
    id: 'mayan-copal-brass-burner',
    name: 'Ceremonial White Copal Tears & Solid Brass Censer Kit',
    brand: 'Sacred Smoke Artesanía',
    category: 'incense_smudge',
    price: '$44.95',
    priceEstimate: 45,
    rating: 4.9,
    reviewCount: 524,
    badge: '★ Master Smudging Resin',
    commissionBadge: 'Verified Amazon Partner Link',
    affiliatePartner: 'Amazon Associates (Ethical Earth Resin)',
    affiliateUrl: 'https://www.amazon.com/s?k=white+copal+resin+charcoal+brass+burner&tag=aura432-20',
    spiritualVibe: 'Auric Cleansing & Divine Sun Energy',
    description:
      'Ethically harvested wild Mayan White Copal (Protium copal) tears from the Chiapas rainforest, paired with a hand-spun heavy brass incense burner and organic quartz smudging sand.',
    whyForSanctuary:
      'Copal has been burned for millennia to dispel heavy or stagnant stagnant energies before sound meditation. The crisp pine-citrus resin smoke cleanses the psychic space, preparing heart and mind for 432Hz deep trance.',
    specifications: [
      { label: 'Origin', value: 'Chiapas, Mexico (Wild Harvested)' },
      { label: 'Burner Material', value: '100% Solid Cast Brass with Wood Handle' },
      { label: 'Aroma Notes', value: 'Crisp Pine, Lemongrass, Sweet Forest Resin' },
      { label: 'Includes', value: '100g Copal Tears, Brass Censer, Quartz Sand, 10 Charcoals' },
    ],
    pros: [
      '100% chemical-free natural tree resin',
      'Non-toxic charcoal pucks included',
      'Heavy heat-insulated brass base protects altar wood',
    ],
    gradient: 'from-amber-950/70 via-slate-900 to-amber-950/40',
    iconType: 'flame',
    imageUrl: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=800&auto=format&fit=crop&q=80',
  },
  {
    id: 'peruvian-palo-santo-dish',
    name: 'Certified Sustainable Peruvian Palo Santo & Ceramic Smudge Dish',
    brand: 'Sacred Wood Essence',
    category: 'incense_smudge',
    price: '$28.50',
    priceEstimate: 29,
    rating: 5.0,
    reviewCount: 1480,
    badge: '★ 100% Fallen Deadwood Certified',
    commissionBadge: 'Verified Amazon Partner Link',
    affiliatePartner: 'Amazon Associates (Sacred Wood)',
    affiliateUrl: 'https://www.amazon.com/s?k=sacred+wood+essence+palo+santo+sticks&tag=aura432-20',
    spiritualVibe: 'Grounding, Calming & Sweet Holy Scent',
    description:
      'Ten hand-split sticks of Bursera graveolens gathered exclusively from naturally fallen branches cured for 4-10 years in the dry forests of Piura, Peru. Paired with a matte black stoneware snuffer bowl.',
    whyForSanctuary:
      'Releases high concentrations of natural limonene and terpineol terpenes that soothe the central nervous system, deepening Alpha brainwave entrainment during 432Hz sessions.',
    specifications: [
      { label: 'Harvest Certification', value: 'SERFOR Peru Sustainable Forestry Permit' },
      { label: 'Aromatic Profile', value: 'Sweet Mint, Warm Pine, Vanilla & Amber' },
      { label: 'Curing Time', value: 'Minimum 5 Years Natural Forest Aging' },
      { label: 'Dish', value: 'Handmade Stoneware Ceramic Snuffer' },
    ],
    pros: [
      'Never cut from live trees (ethical forestry)',
      'Clean white smoke that dissipates quickly',
      'Ceramic snuffer safely extinguishes embers without water',
    ],
    gradient: 'from-stone-900 via-slate-900 to-amber-950/50',
    iconType: 'flame',
    imageUrl: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&auto=format&fit=crop&q=80',
  },
  {
    id: 'white-sage-abalone-kit',
    name: 'Organic White Sage & Lavender Smudge Wand with Rainbow Abalone Shell',
    brand: 'Gaia Ritual Botanicals',
    category: 'incense_smudge',
    price: '$32.00',
    priceEstimate: 32,
    rating: 4.8,
    reviewCount: 890,
    badge: 'Four Elements Space Clearing',
    commissionBadge: 'Verified Amazon Partner Link',
    affiliatePartner: 'Amazon Associates (Gaia Botanicals)',
    affiliateUrl: 'https://www.amazon.com/s?k=organic+white+sage+smudge+wand+abalone+shell+stand&tag=aura432-20',
    spiritualVibe: 'Complete Energetic Reset & Purification',
    description:
      'Sustainably cultivated coastal California White Sage (Salvia apiana) bundled with fragrant French lavender and wild sweetgrass. Rests on a 6-inch iridescent natural abalone shell supported by a hand-carved wooden cobra tripod.',
    whyForSanctuary:
      'Represents all four sacred elements (Earth: Sage; Water: Abalone Shell; Fire: Ember; Air: Smoke). Clears electromagnetic and somatic tension before frequency entrainment.',
    specifications: [
      { label: 'Botanicals', value: 'Organic White Sage, French Lavender, Sweetgrass' },
      { label: 'Vessel', value: 'Natural 6" Polished Rainbow Abalone Shell' },
      { label: 'Stand', value: 'Hand-carved Interlocking Sheesham Wood Tripod' },
      { label: 'Feather', value: 'Cruelty-free Natural Turkey Feather Fan' },
    ],
    pros: [
      'Organically farm-cultivated (protects wild populations)',
      'Lavender softens traditional sage pungency',
      'Complete altar-ready four elements kit',
    ],
    gradient: 'from-emerald-950/60 via-slate-900 to-slate-950',
    iconType: 'flame',
    imageUrl: 'https://images.unsplash.com/photo-1515377905703-c4788e51af15?w=800&auto=format&fit=crop&q=80',
  },
  {
    id: 'kyoto-temple-aloeswood-incense',
    name: 'Japanese Temple Kyara & Sandalwood Incense with Slate Burner',
    brand: 'Shoyeido Kyoto Masters',
    category: 'incense_smudge',
    price: '$68.00',
    priceEstimate: 68,
    rating: 4.9,
    reviewCount: 395,
    badge: '★ Kyoto Zen Monastery Formula',
    commissionBadge: 'Verified Amazon Partner Link',
    affiliatePartner: 'Amazon Associates (Shoyeido Store)',
    affiliateUrl: 'https://www.amazon.com/s?k=shoyeido+japanese+incense+aloeswood+kyara&tag=aura432-20',
    spiritualVibe: 'Transcendent Stillness & Pure Focus',
    description:
      'Handcrafted in Kyoto, Japan without a bamboo wooden core, meaning you inhale only 100% pure precious Agarwood (Jinko/Kyara), aged Mysore sandalwood, and natural clove and cinnamon tree bark.',
    whyForSanctuary:
      'Bamboo-coreless Japanese incense emits virtually no bitter burning wood smoke. Creates a sublime, contemplative atmosphere that mirrors Zen monastery meditation halls.',
    specifications: [
      { label: 'Craft Origin', value: 'Kyoto, Japan (300-Year Heritage)' },
      { label: 'Core Type', value: 'Bamboo-Free (100% Botanical Mass)' },
      { label: 'Burn Duration', value: '30 Minutes per Stick (60 Sticks)' },
      { label: 'Burner', value: 'Natural Chiseled Slate Tile Stand' },
    ],
    pros: [
      'Subtle, non-choking smoke suitable for apartments',
      'Rare wild Indonesian agarwood resin',
      'Zero synthetic perfume binders or dip oils',
    ],
    gradient: 'from-slate-900 via-indigo-950/50 to-slate-950',
    iconType: 'flame',
    imageUrl: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&auto=format&fit=crop&q=80',
  },
  {
    id: 'cascading-lotus-backflow-burner',
    name: 'Cascading Mountain Waterfall Backflow Burner & 120 Sandalwood Cones',
    brand: 'Zenith Sacred Arts',
    category: 'incense_smudge',
    price: '$36.99',
    priceEstimate: 37,
    rating: 4.7,
    reviewCount: 1650,
    badge: 'Hypnotic Meditation Visualizer',
    commissionBadge: 'Verified Amazon Partner Link',
    affiliatePartner: 'Amazon Associates (Zenith Arts)',
    affiliateUrl: 'https://www.amazon.com/s?k=backflow+incense+burner+waterfall+ceramic+sandalwood&tag=aura432-20',
    spiritualVibe: 'Hypnotic Flow State & Breath Calming',
    description:
      'Handcrafted glazed ceramic mountain landscape. Specially drilled herbal incense cones draw negative-pressure smoke downward, creating a cascading visual mist pool that mirrors flowing water.',
    whyForSanctuary:
      'Watching the slow, fluid descent of the smoke cascade synchronizes with slow 4-7-8 breathing exercises and reduces visual hyper-vigilance during meditation transitions.',
    specifications: [
      { label: 'Material', value: 'High-fire Glazed Black Obsidian Ceramic' },
      { label: 'Mechanism', value: 'Gravity Backflow Negative Pressure Duct' },
      { label: 'Includes', value: 'Burner, 120 Herbal Cones, Tweezers, Mat' },
      { label: 'Dimensions', value: '7.8" Height x 4.2" Width' },
    ],
    pros: [
      'Stunning kinetic visual anchor for open-eye meditation',
      'Comes with 120 diverse aroma cones (Sandalwood, Rose, Amber)',
      'Washable ceramic glaze cleans in warm water',
    ],
    gradient: 'from-teal-950/60 via-slate-900 to-slate-950',
    iconType: 'flame',
    imageUrl: 'https://images.unsplash.com/photo-1518241353330-0f7941c2d9b5?w=800&auto=format&fit=crop&q=80',
  },

  // ==========================================
  // 2. SOUND MEDITATION & ACOUSTIC TOOLS
  // ==========================================
  {
    id: 'tibetan-singing-bowl-set',
    name: 'Master-Hammered 7-Chakra Bronze Tibetan Singing Bowl Set',
    brand: 'Kathmandu Artisan Guild',
    category: 'sound_healing',
    price: '$129.00',
    priceEstimate: 129,
    rating: 5.0,
    reviewCount: 920,
    badge: '★ Hand-Forged 7-Metal Alloy',
    commissionBadge: 'Verified Amazon Partner Link',
    affiliatePartner: 'Amazon Associates (Kathmandu Guild)',
    affiliateUrl: 'https://www.amazon.com/s?k=authentic+hand+hammered+tibetan+singing+bowl+set+7+chakra&tag=aura432-20',
    spiritualVibe: 'Deep Somatic Grounding & Sub-Harmonics',
    description:
      'Hand-hammered by master metallurgists in Nepal using traditional 7-metal bell bronze (copper, tin, zinc, iron, lead, silver, gold traces). Features hand-etched Om Mani Padme Hum mantras, suede-wrapped dual-wood striker, and Tibetan brocade ring cushion.',
    whyForSanctuary:
      'Produces rich acoustic overtone clusters (fundamental + 2.76x + 5.4x ratios) that naturally resonate at 432Hz harmonic divisions, providing deep sensory grounding and meditative calm.',
    specifications: [
      { label: 'Diameter', value: '8.5 inches (Weight: 1.4 kg / 3.1 lbs)' },
      { label: 'Tuning Note', value: 'F# / 432Hz Harmonic Heart Resonance' },
      { label: 'Sustain Time', value: 'Over 45 Seconds per Single Strike' },
      { label: 'Accessories', value: 'Suede/Wood Mallet, Ring Cushion, Silk Bag' },
    ],
    pros: [
      'Authentic acoustic hammer marks (not machine-spun brass)',
      'Rich multi-phonic singing overtones when rim is rotated',
      'Solid bronze mass gives deep, warm physical vibration',
    ],
    gradient: 'from-amber-950/80 via-slate-900 to-yellow-950/40',
    iconType: 'bowl',
    soundDemoType: 'bowl',
    imageUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&auto=format&fit=crop&q=80',
  },
  {
    id: 'quartz-crystal-singing-bowl-432',
    name: '432Hz Pure Quartz Frosted Crystal Singing Bowl (8" Heart Chakra)',
    brand: 'OmniQuartz Sound Baths',
    category: 'sound_healing',
    price: '$189.00',
    priceEstimate: 189,
    rating: 4.9,
    reviewCount: 460,
    badge: '★ 99.99% Pure Quartz 432Hz Tuned',
    commissionBadge: 'Verified Amazon Partner Link',
    affiliatePartner: 'Amazon Associates (Acoustic Sound Lab)',
    affiliateUrl: 'https://www.amazon.com/s?k=432hz+frosted+quartz+crystal+singing+bowl+8+inch+f+note&tag=aura432-20',
    spiritualVibe: 'Acoustic Clarity & Crystal Resonance',
    description:
      'Forged at 4,000°F from 99.99% pure American quartz crystal. Laser-calibrated to vibrate at precisely 432.0Hz Heart Chakra F-note with zero pitch wobble. Includes heavy-duty silicone friction striker and stabilizing rubber O-ring.',
    whyForSanctuary:
      'The pure acoustic sine wave envelops the room, easing mental chatter and elevating peaceful presence within minutes.',
    specifications: [
      { label: 'Material', value: '99.993% Pure Crushed Quartz Crystal' },
      { label: 'Frequency Accuracy', value: '432.0 Hz ± 0.5 Cent Deviation' },
      { label: 'Chakra Note', value: 'Note F (Anahata - Heart Chakra)' },
      { label: 'Includes', value: 'Heavy Silicone Mallet, O-Ring, Velvet Pouch' },
    ],
    pros: [
      'Immense acoustic volume fills large yoga studios effortlessly',
      'Sustained resonance continues for over 60 seconds',
      'Frosted exterior enables easy, non-skid rim singing',
    ],
    gradient: 'from-sky-950/70 via-slate-900 to-indigo-950/60',
    iconType: 'crystal',
    soundDemoType: 'crystal',
    imageUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&auto=format&fit=crop&q=80',
  },
  {
    id: 'koshi-wind-chimes-suite',
    name: 'Authentic French Koshi Chimes Suite (Set of 4: Terra, Aqua, Aria, Ignis)',
    brand: 'Koshi Atelier France',
    category: 'sound_healing',
    price: '$260.00',
    priceEstimate: 260,
    rating: 5.0,
    reviewCount: 1120,
    badge: '★ Original French Pyrenean Chimes',
    commissionBadge: 'Verified Amazon Partner Link',
    affiliatePartner: 'Amazon Associates (Koshi Atelier)',
    affiliateUrl: 'https://www.amazon.com/s?k=koshi+chimes+set+of+4+terra+aqua+aria+ignis&tag=aura432-20',
    spiritualVibe: 'Celestial Harmonic Angelic Shimmer',
    description:
      'Precision musical instruments crafted at the foot of the Pyrenees mountains. Eight bronze welding rods are silver-soldered into a metal resonance plate inside a multi-layered oiled bamboo resonance tube.',
    whyForSanctuary:
      'The magical overtone interaction creates a crystalline cascade of celestial tones that effortlessly lifts mental fatigue, releasing stuck emotional patterns during breathwork.',
    specifications: [
      { label: 'Origin', value: 'Pyrenees Mountains, France' },
      { label: 'Resonance Tube', value: 'Natural Multi-Laminated Oiled Bamboo' },
      { label: 'Four Elements', value: 'Terra (Earth), Aqua (Water), Aria (Air), Ignis (Fire)' },
      { label: 'Tuning Precision', value: 'Eight Tuned Bronze Chime Rods' },
    ],
    pros: [
      'Mesmerizing celestial decay that never sounds repetitive',
      'Can be played manually by hand or hung near gentle breeze',
      'Includes all 4 sacred elemental tunings in gift packaging',
    ],
    gradient: 'from-amber-950/60 via-slate-900 to-emerald-950/50',
    iconType: 'chime',
    soundDemoType: 'chime',
    imageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&auto=format&fit=crop&q=80',
  },
  {
    id: 'solfeggio-tuning-forks-set',
    name: 'Harmonic Solfeggio Tuning Forks Set (432Hz Verdi + 528Hz Harmonic Tone)',
    brand: 'Biosonics Sound Science',
    category: 'sound_healing',
    price: '$79.95',
    priceEstimate: 80,
    rating: 4.8,
    reviewCount: 680,
    badge: 'Acoustic Precision Tuned',
    commissionBadge: 'Verified Amazon Partner Link',
    affiliatePartner: 'Amazon Associates (Biosonics Sound)',
    affiliateUrl: 'https://www.amazon.com/s?k=432hz+528hz+solfeggio+tuning+forks+meditation&tag=aura432-20',
    spiritualVibe: 'Acoustic Resonance & Somatic Calming',
    description:
      'Machined from aerospace-grade aluminum alloy with weighted frequency nodes. Strike the rubber activator and hold the stem near the ear or comfortably on the body for soothing somatic vibration.',
    whyForSanctuary:
      'Delivers pure, pinpoint acoustic frequency for deep relaxation, sensory grounding, and mindful meditation sessions.',
    specifications: [
      { label: 'Frequencies', value: '432 Hz Verdi Tone & 528 Hz Harmonic Tone' },
      { label: 'Alloy', value: 'Machined Non-Rusting Space-Grade Aluminum' },
      { label: 'Nodes', value: 'Removable Precision Brass Weights' },
      { label: 'Accessories', value: 'Silicone Striker, Velvet Carry Roll, Acupoint Stem' },
    ],
    pros: [
      'Pleasant and gentle acoustic sustain for meditation',
      'Extremely long sustain with clean zero-buzz harmonic',
      'Compact for travel and personal altar rituals',
    ],
    gradient: 'from-indigo-950/60 via-slate-900 to-sky-950/50',
    iconType: 'bowl',
    soundDemoType: 'fork',
    imageUrl: 'https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?w=800&auto=format&fit=crop&q=80',
  },
  {
    id: 'sacred-tibetan-tingsha-bells',
    name: 'Cast Bronze Tibetan Tingsha Meditation Cymbals with Embossed Mantras',
    brand: 'DharmaStore Nepal',
    category: 'sound_healing',
    price: '$34.50',
    priceEstimate: 35,
    rating: 4.9,
    reviewCount: 740,
    badge: 'Space & Attention Awakening',
    commissionBadge: 'Verified Amazon Partner Link',
    affiliatePartner: 'Amazon Associates (Fair Trade Nepal)',
    affiliateUrl: 'https://www.amazon.com/s?k=tibetan+tingsha+cymbals+bronze+meditation+bells&tag=aura432-20',
    spiritualVibe: 'Instant Mindful Presence & Space Clearing',
    description:
      'Heavy cast bell bronze connected by a sturdy buffalo leather strap. Hand-chiseled with the 8 Auspicious Buddhist Symbols (Ashtamangala). Produces a piercing, pristine high-pitch bell chime that instantly snaps the wandering mind into the present moment.',
    whyForSanctuary:
      'Used traditionally by Tibetan monks to inaugurate and conclude meditation sessions. The high-frequency acoustic shockwave clears stagnant air and awakens dormant intuition.',
    specifications: [
      { label: 'Diameter', value: '3.0 inches (Extra Heavy 420g Bronze)' },
      { label: 'Strap', value: 'Genuine Vegetable-Tanned Braided Leather' },
      { label: 'Resonance', value: 'Ultra-High Pure Bell Frequency (Over 20s Ring)' },
      { label: 'Motif', value: 'Ashtamangala (8 Auspicious Sacred Emblems)' },
    ],
    pros: [
      'Piercing clarity that cuts through mental fog instantly',
      'Fits comfortably in palm or travel pouch',
      'Extremely durable cast bronze lasts lifetimes',
    ],
    gradient: 'from-amber-950/70 via-slate-900 to-slate-950',
    iconType: 'chime',
    soundDemoType: 'chime',
    imageUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&auto=format&fit=crop&q=80',
  },

  // ==========================================
  // 3. ATMOSPHERE, ALTAR & SACRED SPACE TOOLS
  // ==========================================
  {
    id: 'himalayan-pink-salt-lamp',
    name: 'Authentic 9-11 lb Hand-Carved Himalayan Pink Salt Ionizing Lamp',
    brand: 'Khewra Ancient Minerals',
    category: 'atmosphere_altar',
    price: '$39.99',
    priceEstimate: 40,
    rating: 4.8,
    reviewCount: 4200,
    badge: '★ Negative Ion Sanctuary Glow',
    commissionBadge: 'Verified Amazon Partner Link',
    affiliatePartner: 'Amazon Associates (Khewra Reserve)',
    affiliateUrl: 'https://www.amazon.com/s?k=hand+carved+himalayan+pink+salt+lamp+neem+wood+dimmer&tag=aura432-20',
    spiritualVibe: 'Warm 1800K Ambiance & Atmospheric Ionization',
    description:
      'Mined 5,000 feet deep beneath the Himalayan foothills in Pakistan from unpolluted 250-million-year-old crystallized ocean beds. Mounted on a solid neem wood base with a UL-certified rotary dimmer switch and warm amber incandescent bulb.',
    whyForSanctuary:
      'When warmed by the internal filament, the natural halite crystal attracts airborne moisture and releases negative ions that neutralize positive electromagnetic smog from phones and Wi-Fi, grounding your meditation sanctuary.',
    specifications: [
      { label: 'Weight', value: '9 to 11 lbs (Genuine Solid Crystal Block)' },
      { label: 'Base', value: 'Termite-Resistant Sustainable Neem Hardwood' },
      { label: 'Lighting', value: 'Warm 1800K Amber Filament with Stepless Dimmer' },
      { label: 'Mineral Source', value: 'Khewra Salt Mine, Punjab, Pakistan' },
    ],
    pros: [
      'Stepless dimmer lets you adjust from bright aura to midnight candle glow',
      'Natural hygroscopic air purification',
      'Each block is 100% unique in geological pink & peach veins',
    ],
    gradient: 'from-orange-950/70 via-slate-900 to-rose-950/40',
    iconType: 'lamp',
    imageUrl: 'https://images.unsplash.com/photo-1518241353330-0f7941c2d9b5?w=800&auto=format&fit=crop&q=80',
  },
  {
    id: 'ultrasonic-ceramic-diffuser',
    name: 'Matte Ceramic Stone Essential Oil Nebulizer & Ambient Glow Diffuser',
    brand: 'AuraMist Aromatics',
    category: 'atmosphere_altar',
    price: '$65.00',
    priceEstimate: 65,
    rating: 4.9,
    reviewCount: 1850,
    badge: 'Whisper-Quiet <19dB Operation',
    commissionBadge: 'Verified Amazon Partner Link',
    affiliatePartner: 'Amazon Associates (AuraMist)',
    affiliateUrl: 'https://www.amazon.com/s?k=matte+ceramic+stone+essential+oil+diffuser+ultrasonic&tag=aura432-20',
    spiritualVibe: 'Pure Botanical Mist & Olfactory Sanctuary',
    description:
      'Handcrafted artisan porcelain ceramic cover in matte slate black. Utilizes 2.4 MHz ultrasonic vibrations to aerosolize pure essential oils (Frankincense, Atlas Cedarwood, French Lavender) into microscopic cold vapor without heating or degrading fragile botanical terpenes.',
    whyForSanctuary:
      'Olfactory signals travel directly to the amygdala and limbic system in under 200 milliseconds. Diffusing grounding sacred oils alongside 432Hz sound induces profound emotional peace.',
    specifications: [
      { label: 'Vessel Cover', value: '100% Hand-Poured Matte Porcelain Ceramic' },
      { label: 'Capacity', value: '180 ml (Up to 9 Hours Continuous Mist)' },
      { label: 'Acoustic Noise', value: 'Ultra-Quiet < 19 dB (Zero Meditation Disruption)' },
      { label: 'Mood Light', value: 'Optional Soft Amber Candle Glow Ring' },
    ],
    pros: [
      'No heating elements (preserves medicinal oil properties)',
      'Auto-shutoff when water reservoir depletes',
      'Sophisticated sculptural design blends seamlessly on any altar',
    ],
    gradient: 'from-stone-900 via-slate-900 to-cyan-950/50',
    iconType: 'flame',
    imageUrl: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=800&auto=format&fit=crop&q=80',
  },
  {
    id: 'buckwheat-meditation-zafu-set',
    name: 'Organic Buckwheat Zafu & Zabuton Floor Meditation Cushion Set',
    brand: 'MindfulSutra Organics',
    category: 'atmosphere_altar',
    price: '$118.00',
    priceEstimate: 118,
    rating: 4.9,
    reviewCount: 780,
    badge: 'Ergonomic Spine Alignment',
    commissionBadge: 'Verified Amazon Partner Link',
    affiliatePartner: 'Amazon Associates (MindfulSutra)',
    affiliateUrl: 'https://www.amazon.com/s?k=organic+buckwheat+zafu+zabuton+floor+meditation+cushion+set&tag=aura432-20',
    spiritualVibe: 'Zero Spine Fatigue & Grounded Posture',
    description:
      'Includes an ergonomic crescent Zafu cushion filled with 100% cleaned domestic organic buckwheat hulls that contour precisely to your pelvic tilt, accompanied by a thick 36" x 28" Zabuton floor mat layered with natural cotton batting.',
    whyForSanctuary:
      'Prevents knee numbness, tailbone pressure, and spinal slouching during extended 60-to-90 minute 432Hz sound baths. When physical discomfort dissolves, consciousness expands unhindered.',
    specifications: [
      { label: 'Zafu Fill', value: '100% Triple-Cleaned US Organic Buckwheat Hulls' },
      { label: 'Zabuton Fill', value: 'Tufted 100% Unbleached Cotton Batting' },
      { label: 'Outer Shell', value: 'Heavyweight GOTS-Certified Organic Canvas (Machine Washable)' },
      { label: 'Zabuton Dimensions', value: '36" L x 28" W x 3" Thick Floor Barrier' },
    ],
    pros: [
      'Buckwheat hulls adjust to pelvic shape without packing down',
      'Removable washable covers with hidden brass zippers',
      'Heavy floor padding eliminates ankle and knee friction',
    ],
    gradient: 'from-emerald-950/70 via-slate-900 to-stone-950',
    iconType: 'cushion',
    imageUrl: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&auto=format&fit=crop&q=80',
  },
  {
    id: 'selenite-crystal-grid-kit',
    name: 'Moroccan Selenite Skyscraper Tower & Sacred Geometry Crystal Altar Grid',
    brand: 'CrystalMatrix Lab',
    category: 'atmosphere_altar',
    price: '$48.00',
    priceEstimate: 48,
    rating: 4.8,
    reviewCount: 610,
    badge: 'Energetic Shielding & Light Channel',
    commissionBadge: 'Verified Amazon Partner Link',
    affiliatePartner: 'Amazon Associates (CrystalMatrix)',
    affiliateUrl: 'https://www.amazon.com/s?k=moroccan+selenite+tower+sacred+geometry+crystal+altar+grid&tag=aura432-20',
    spiritualVibe: 'High-Frequency Crown Activation & Biofield Clearing',
    description:
      'Features a raw 8-inch luminous Moroccan Selenite tower, a laser-etched birch Metatron’s Cube wooden grid board, 6 natural Clear Quartz wand points, and a central Rose Quartz generator stone.',
    whyForSanctuary:
      'Selenite vibrates at an exceptionally high angelic frequency and never requires energetic cleansing itself; it continuously amplifies and focuses the 432Hz vibration across the room.',
    specifications: [
      { label: 'Selenite Tower', value: '8" Natural Moroccan Raw Form' },
      { label: 'Grid Plate', value: '8" Laser-Etched Metatron’s Cube Birch Board' },
      { label: 'Crystals', value: '6 Double-Terminated Clear Quartz Points, 1 Raw Rose Quartz' },
      { label: 'Care', value: 'Never immerse in water (water-soluble gypsum crystal)' },
    ],
    pros: [
      'Self-cleansing crystal charges other stones and jewelry',
      'Luminescent light refraction when placed near candlelight',
      'Sacred geometry focal point for visualization meditation',
    ],
    gradient: 'from-indigo-950/70 via-slate-900 to-sky-950/60',
    iconType: 'crystal',
    imageUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&auto=format&fit=crop&q=80',
  },
  {
    id: 'pure-raw-beeswax-candles',
    name: '100% Pure Raw Beeswax Altar Pillar Candles (Set of 3 with Cotton Wicks)',
    brand: 'HoneyLight Sanctuary',
    category: 'atmosphere_altar',
    price: '$38.50',
    priceEstimate: 39,
    rating: 5.0,
    reviewCount: 840,
    badge: 'Zero-Paraffin Negative Ion Clean Burn',
    commissionBadge: 'Verified Amazon Partner Link',
    affiliatePartner: 'Amazon Associates (HoneyLight)',
    affiliateUrl: 'https://www.amazon.com/s?k=100+percent+pure+beeswax+pillar+candles+natural+cotton+wick&tag=aura432-20',
    spiritualVibe: 'Warm Sunlight Spectrum & Sweet Natural Honey Aroma',
    description:
      'Hand-poured from 100% pure cappings beeswax harvested from sustainable chemical-free apiaries. Unbleached, lead-free cotton wicks burn with an incandescent flame that shares the light spectrum of natural morning sunlight.',
    whyForSanctuary:
      'Unlike petroleum paraffin candles that emit benzene and soot, pure beeswax burns cleanly while emitting negative ions that bond with dust and airborne toxins, dropping them safely from your breathing space.',
    specifications: [
      { label: 'Wax Source', value: '100% Pure Golden Cappings Beeswax' },
      { label: 'Burn Duration', value: 'Over 65 Hours Total (20-25 hrs per pillar)' },
      { label: 'Wick', value: '100% Raw Braided Cotton (Zero Zinc or Lead)' },
      { label: 'Scent', value: 'Naturally Subtle Sweet Honey & Wildflower Nectar' },
    ],
    pros: [
      'Emits purifying negative ions as it burns',
      'Hypoallergenic: safe for asthma and chemical sensitivity',
      'Drip-resistant dense wax burns with a steady, peaceful flame',
    ],
    gradient: 'from-amber-950/80 via-slate-900 to-yellow-950/50',
    iconType: 'flame',
    imageUrl: 'https://images.unsplash.com/photo-1515377905703-c4788e51af15?w=800&auto=format&fit=crop&q=80',
  },

  // ==========================================
  // 4. SPIRITUAL & AUDIOPHILE AUDIO GEAR
  // ==========================================
  {
    id: 'sennheiser-hd660s2',
    name: 'HD 660S2 Open-Back Reference Headphones',
    brand: 'Sennheiser Pro',
    category: 'audio_headphones',
    price: '$499.95',
    priceEstimate: 499,
    rating: 4.9,
    reviewCount: 348,
    badge: '★ Best Overall for 432Hz & Solfeggio',
    commissionBadge: 'Verified Amazon Partner Link',
    affiliatePartner: 'Amazon Associates (Sennheiser Pro)',
    affiliateUrl: 'https://www.amazon.com/s?k=sennheiser+hd+660s2+open+back+reference+headphones&tag=aura432-20',
    spiritualVibe: 'Sub-Bass Extension & Infinite Holographic Soundstage',
    description:
      'Engineered with an ultra-light aluminum voice coil and open-back acoustic chambers for effortless, fatigue-free meditation sessions.',
    whyForSanctuary:
      'Delivers an organic, natural soundstage where the 432Hz natural pitch breathes with authentic physical acoustic space. Sub-bass extension reveals low 3.5Hz Delta and 6.0Hz Theta modulation without artificial coloration.',
    specifications: [
      { label: 'Transducer', value: '38mm Dynamic Driver with Vented Magnet' },
      { label: 'Frequency Range', value: '8 Hz – 41,500 Hz (Ultra-Wide Sub-Bass)' },
      { label: 'Impedance', value: '300 Ohms (Pairs with Hi-Res DAC/Amp)' },
      { label: 'Design', value: 'Open-Back Circumaural Velour Pads' },
    ],
    pros: ['Zero ear-cup pressure resonance', 'Binaural channel separation >95dB', 'Exceptional harmonic accuracy'],
    gradient: 'from-sky-950/70 via-slate-900 to-indigo-950/70',
    iconType: 'headphones',
    soundDemoType: 'stage',
    imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80',
  },
  {
    id: 'hifiman-sundara',
    name: 'Sundara Planar Magnetic Open-Back Headphones',
    brand: 'HIFIMAN',
    category: 'audio_headphones',
    price: '$299.00',
    priceEstimate: 299,
    rating: 4.8,
    reviewCount: 612,
    badge: 'Best Value Planar Audiophile',
    commissionBadge: 'Verified Amazon Partner Link',
    affiliatePartner: 'Amazon Associates (HIFIMAN Audio)',
    affiliateUrl: 'https://www.amazon.com/s?k=hifiman+sundara+planar+magnetic+open+back+headphones&tag=aura432-20',
    spiritualVibe: 'Instantaneous Transient Speed & Shimmering Overtones',
    description:
      'Planar magnetic drivers use electromagnetic conductors distributed across the entire diaphragm for zero-mass transient responsiveness.',
    whyForSanctuary:
      'Tibetan singing bowl overtone harmonics and Koshi chime pings shimmer with holographic spatial decay that typical dynamic drivers smear.',
    specifications: [
      { label: 'Diaphragm', value: 'Ultra-Thin Neo Supernano Diaphragm (NsD)' },
      { label: 'Frequency Range', value: '6 Hz – 75,000 Hz' },
      { label: 'Impedance', value: '32 Ohms (Easy to Drive with Phone or DAC)' },
      { label: 'Weight', value: '372g Hybrid Headband Structure' },
    ],
    pros: ['Lightning-fast transient response', 'Planar magnetic speed', 'Zero ear fatigue in 90-min sessions'],
    gradient: 'from-indigo-950/70 via-slate-900 to-slate-950',
    iconType: 'headphones',
    soundDemoType: 'stage',
    imageUrl: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=800&auto=format&fit=crop&q=80',
  },
  {
    id: 'meze-99-classics',
    name: '99 Classics Real Walnut Wood Acoustic Headphones',
    brand: 'Meze Audio',
    category: 'audio_headphones',
    price: '$309.00',
    priceEstimate: 309,
    rating: 4.9,
    reviewCount: 420,
    badge: 'Organic Natural Wood Resonator',
    commissionBadge: 'Verified Amazon Partner Link',
    affiliatePartner: 'Amazon Associates (Meze Audio)',
    affiliateUrl: 'https://www.amazon.com/s?k=meze+99+classics+walnut+silver+headphones&tag=aura432-20',
    spiritualVibe: 'Warm Organic Wood Resonance & Earth Grounding',
    description:
      'CNC-carved solid walnut ear-cups that resonate like fine violins and acoustic cellos, completely free of chemical glues.',
    whyForSanctuary:
      'The natural density of cured walnut timber creates warm, non-metallic acoustic resonance that aligns seamlessly with sacred earth frequencies and forest nature soundscapes.',
    specifications: [
      { label: 'Earcups', value: '100% Solid Carved Natural Cured Walnut Wood' },
      { label: 'Transducer', value: '40mm Dynamic Neodymium / Mylar Transducer' },
      { label: 'Frequency Range', value: '15 Hz – 25,000 Hz' },
      { label: 'Cables', value: 'Detachable Kevlar-Reinforced OFC Copper' },
    ],
    pros: ['100% natural sustainably harvested walnut', 'Detachable Kevlar OFC cables', 'Zero plastic resonance'],
    gradient: 'from-amber-950/70 via-slate-900 to-slate-950',
    iconType: 'headphones',
    soundDemoType: 'stage',
    imageUrl: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800&auto=format&fit=crop&q=80',
  },
  {
    id: 'sleepphones-wireless',
    name: 'SleepPhones Effortless Bedtime Headband',
    brand: 'AcousticSheep',
    category: 'audio_headphones',
    price: '$99.95',
    priceEstimate: 100,
    rating: 4.7,
    reviewCount: 8900,
    badge: '★ Best for Side-Sleeping Meditation',
    commissionBadge: 'Verified Amazon Partner Link',
    affiliatePartner: 'Amazon Associates (AcousticSheep)',
    affiliateUrl: 'https://www.amazon.com/s?k=sleepphones+wireless+bedtime+headband+headphones&tag=aura432-20',
    spiritualVibe: 'Zero Ear Pressure & All-Night Delta Slumber',
    description:
      'Invented by a family doctor, soft breathable fleece headband housing wafer-thin flat speakers so side-sleepers feel zero bulk or pressure against the pillow.',
    whyForSanctuary:
      'Allows you to run 3.5Hz Delta sleep frequency cycles all night without waking up with sore ear cartilage or tangled wires.',
    specifications: [
      { label: 'Drivers', value: 'Lead-Free Ultra-Thin 4mm Flat Padded Drivers' },
      { label: 'Fabric', value: 'SheepCloud Breathable Moisture-Wicking Fleece' },
      { label: 'Battery', value: '12-14 Hours Continuous Bluetooth Playback' },
      { label: 'Safety', value: 'Volume-Capped Circuit for Safe Sleeping' },
    ],
    pros: ['Machine-washable SheepCloud fabric', 'Safe volume limiter circuit', 'Flat drivers will not hurt pillow ears'],
    gradient: 'from-purple-950/60 via-slate-900 to-slate-950',
    iconType: 'headphones',
    soundDemoType: 'stage',
    imageUrl: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800&auto=format&fit=crop&q=80',
  },
  {
    id: 'shokz-openrun-pro',
    name: 'OpenRun Pro Bone Conduction Open-Ear Transducers',
    brand: 'Shokz',
    category: 'audio_headphones',
    price: '$179.95',
    priceEstimate: 180,
    rating: 4.8,
    reviewCount: 6300,
    badge: '100% Open-Ear Bone Conduction',
    commissionBadge: 'Verified Amazon Partner Link',
    affiliatePartner: 'Amazon Associates (Shokz Store)',
    affiliateUrl: 'https://www.amazon.com/s?k=shokz+openrun+pro+bone+conduction+headphones&tag=aura432-20',
    spiritualVibe: 'Direct Cochlea Vibration & Ambient Awareness',
    description:
      'Transmits acoustic vibrations through the cheekbones directly to the inner cochlea, leaving ear canals 100% open to ambient room airflow, incense aromas, and breath guidance.',
    whyForSanctuary:
      'Ideal for practitioners who want to listen to 432Hz binaural tracks while maintaining full awareness of breathwork instructors, singing bowl live sessions, or sleeping children.',
    specifications: [
      { label: 'Technology', value: '9th Gen Bone Conduction (TurboPitch Bass Enforcers)' },
      { label: 'Frame', value: 'Wraparound Titanium Memory Wire' },
      { label: 'Battery', value: '10 Hours with 5-Minute Quick Charge (1.5 hrs play)' },
      { label: 'Water Rating', value: 'IP55 Sweat & Dust Resistant' },
    ],
    pros: ['Zero in-ear canal fatigue or wax buildup', 'Secure titanium wrap-around frame', 'Hear room atmosphere & chimes'],
    gradient: 'from-emerald-950/60 via-slate-900 to-slate-950',
    iconType: 'headphones',
    soundDemoType: 'stage',
    imageUrl: 'https://images.unsplash.com/photo-1572536147248-ac59a8abfa4b?w=800&auto=format&fit=crop&q=80',
  },

  // ==========================================
  // 5. SANCTUARY SPEAKERS & 32-BIT DACS
  // ==========================================
  {
    id: 'sonos-era-300',
    name: 'Sonos Era 300 Spatial Audio Room Speaker',
    brand: 'Sonos',
    category: 'audio_speakers_dacs',
    price: '$449.00',
    priceEstimate: 449,
    rating: 4.8,
    reviewCount: 2200,
    badge: 'Ultimate Multi-Directional Sound Field',
    commissionBadge: 'Verified Amazon Partner Link',
    affiliatePartner: 'Amazon Associates (Sonos Official)',
    affiliateUrl: 'https://www.amazon.com/s?k=sonos+era+300+spatial+audio+smart+speaker&tag=aura432-20',
    spiritualVibe: 'Multi-Directional Sound Dome & Temple Acoustics',
    description:
      'Breakthrough acoustic architecture featuring six optimally positioned drivers all around the front, sides, and top for Dolby Atmos room fill.',
    whyForSanctuary:
      'Fires high-frequency crystal chimes toward the ceiling while projecting 432Hz fundamental drone waves horizontally, replicating ancient temple acoustics.',
    specifications: [
      { label: 'Amplification', value: '6 Class-D Digital Amplifiers' },
      { label: 'Acoustic Array', value: '4 Tweeters (Up/Left/Right/Forward) + 2 Woofers' },
      { label: 'Connectivity', value: 'Wi-Fi 6, Bluetooth 5.0, Apple AirPlay 2' },
      { label: 'Tuning', value: 'Trueplay Room Acoustic Calibration' },
    ],
    pros: ['Trueplay room tuning for acoustic harmony', 'Wi-Fi lossless playback without phone notifications', 'Stereo pairable for binaural room fields'],
    gradient: 'from-indigo-950/70 via-slate-900 to-slate-950',
    iconType: 'speaker',
    soundDemoType: 'stage',
    imageUrl: 'https://images.unsplash.com/photo-1545454675-3531b543be5d?w=800&auto=format&fit=crop&q=80',
  },
  {
    id: 'bang-olufsen-beosound-a1',
    name: 'Beosound A1 (2nd Gen) Waterproof Sound Bath Resonator',
    brand: 'Bang & Olufsen',
    category: 'audio_speakers_dacs',
    price: '$299.00',
    priceEstimate: 299,
    rating: 4.9,
    reviewCount: 1150,
    badge: 'Best Portable Sound Bath Resonator',
    commissionBadge: 'Verified Amazon Partner Link',
    affiliatePartner: 'Amazon Associates (Bang & Olufsen)',
    affiliateUrl: 'https://www.amazon.com/s?k=bang+and+olufsen+beosound+a1+2nd+gen+portable+speaker&tag=aura432-20',
    spiritualVibe: '360° Omnidirectional Dispersion & Altar Aesthetics',
    description:
      'Crafted from pearl-blasted anodized aluminum and waterproof vegetable-tanned leather for indoor altar or outdoor garden meditation.',
    whyForSanctuary:
      'True360 omnidirectional acoustic pattern fills yoga studios, bedrooms, or therapy rooms evenly so everyone experiences balanced 432Hz standing waves.',
    specifications: [
      { label: 'Transducers', value: '3.5" Woofer + 0.6" Silk Dome Tweeter (2x 30W Class D)' },
      { label: 'Dispersion', value: 'True 360° Omnidirectional Sound Field' },
      { label: 'Waterproof', value: 'IP67 Dust & Water Submersion Proof' },
      { label: 'Playtime', value: 'Up to 18 Hours at Typical Listening Volumes' },
    ],
    pros: ['Omnidirectional 360-degree sonic field', 'IP67 waterproof for bath & spa relaxation', 'Up to 18 hours continuous battery'],
    gradient: 'from-amber-950/60 via-slate-900 to-slate-950',
    iconType: 'speaker',
    soundDemoType: 'stage',
    imageUrl: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=800&auto=format&fit=crop&q=80',
  },
  {
    id: 'fiio-btr7',
    name: 'BTR7 Dual ES9219C 32-bit Balanced Hi-Res DAC/Amp',
    brand: 'FiiO Audio',
    category: 'audio_speakers_dacs',
    price: '$199.99',
    priceEstimate: 200,
    rating: 4.9,
    reviewCount: 970,
    badge: 'Best Portable 432Hz Audio Engine',
    commissionBadge: 'Verified Amazon Partner Link',
    affiliatePartner: 'Amazon Associates (FiiO Audio)',
    affiliateUrl: 'https://www.amazon.com/s?k=fiio+btr7+dual+es9219c+balanced+bluetooth+dac+amp&tag=aura432-20',
    spiritualVibe: 'Zero Jitter & Pristine 432.000 Hz Sine Accuracy',
    description:
      'Bypasses cheap phone internal headphone jacks with true dual-mono high-fidelity digital-to-analog converters and balanced 4.4mm output.',
    whyForSanctuary:
      'Eliminates digital clock jitter and harmonic IMD distortion, delivering pure, clean mathematically authentic 432.000 Hz sinusoids with THD+N < 0.00048%.',
    specifications: [
      { label: 'DAC Architecture', value: 'Dual SABRE ES9219C + Dual THX AAA-28 Amplifiers' },
      { label: 'Resolution', value: '384kHz / 32-bit PCM & DSD256 Native' },
      { label: 'Outputs', value: '3.5mm Single-Ended + 4.4mm Balanced Pentagon' },
      { label: 'Screen', value: 'Full-Color IPS Status Display with Bit-Rate Feedback' },
    ],
    pros: ['THX AAA achromatic amplification', 'True 4.4mm balanced output', 'Color IPS status screen with bit-rate display'],
    gradient: 'from-cyan-950/70 via-slate-900 to-slate-950',
    iconType: 'dac',
    soundDemoType: 'stage',
    imageUrl: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&auto=format&fit=crop&q=80',
  },

  // ==========================================
  // 6. SANCTUARY RITUAL STARTER BUNDLES
  // ==========================================
  {
    id: 'sanctuary-starter-bundle',
    name: 'The Dawn Sanctuary Altar & Space Clearing Ritual Bundle',
    brand: 'Aura 432 Curated Sanctuary',
    category: 'ritual_bundles',
    price: '$89.00',
    priceEstimate: 89,
    rating: 5.0,
    reviewCount: 310,
    badge: '★ Complete Altar Starter Set',
    commissionBadge: 'Verified Amazon Partner Link',
    affiliatePartner: 'Amazon Associates (Curated Sanctuary)',
    affiliateUrl: 'https://www.amazon.com/s?k=meditation+altar+starter+kit+copal+palo+santo+singing+bowl&tag=aura432-20',
    spiritualVibe: 'Purification, Grounding & Sensory Harmony',
    description:
      'Everything you need to transform any bedroom or quiet corner into a dedicated sacred temple: Mayan Copal incense sticks, Peruvian Palo Santo sticks, hand-hammered mini bronze singing bowl, and Moroccan Selenite charging tower.',
    whyForSanctuary:
      'Curated specifically to harmonize all sensory channels: sacred smoke for the olfactory nerve, bronze harmonics for the ears, and selenite for the eyes.',
    specifications: [
      { label: 'Included Elements', value: '4 Sacred Essentials (Incense, Holy Wood, Bowl, Crystal)' },
      { label: 'Bonus Ritual Guide', value: 'Printable 12-page Altar Sanctification Manual' },
      { label: 'Packaging', value: 'Eco-Friendly Botanical Gift Box' },
    ],
    pros: ['Saves $25 compared to individual purchases', 'Ideal gift for meditation practitioners', 'Ready to ignite in under 2 minutes'],
    gradient: 'from-amber-950/80 via-slate-900 to-indigo-950/70',
    iconType: 'bundle',
    soundDemoType: 'bundle',
    imageUrl: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&auto=format&fit=crop&q=80',
  },
  {
    id: 'deep-sound-bath-bundle',
    name: 'Master Sound Bath Immersion Bundle (432Hz Quartz Bowl + Koshi Aria Chime)',
    brand: 'Aura 432 Masters',
    category: 'ritual_bundles',
    price: '$399.00',
    priceEstimate: 399,
    rating: 5.0,
    reviewCount: 180,
    badge: 'Professional Practitioner Suite',
    commissionBadge: 'Verified Amazon Partner Link',
    affiliatePartner: 'Amazon Associates (Aura Masters)',
    affiliateUrl: 'https://www.amazon.com/s?k=sound+bath+instruments+quartz+crystal+singing+bowl+chimes&tag=aura432-20',
    spiritualVibe: 'Full-Spectrum Acoustic Solfeggio Immersion',
    description:
      'The ultimate pairing for professional sound healers and dedicated meditators: 8-inch pure quartz 432Hz crystal singing bowl, French Koshi Aria wind chime, and a pair of tuned Solfeggio 432Hz/528Hz biofield tuning forks.',
    whyForSanctuary:
      'Creates physical standing waves and delicate high-register celestial decays that dissolve chronic stress, quiet the default mode network, and facilitate heart opening.',
    specifications: [
      { label: 'Instruments', value: '3 Professional Sound Meditation Instruments' },
      { label: 'Frequencies', value: '432Hz (Bowl), 432Hz/528Hz (Forks), A D F G A (Koshi)' },
      { label: 'Cases', value: 'Padded Travel Carrying Cases Included' },
    ],
    pros: ['Complete acoustic sound bath toolkit', 'Professional tuning accuracy guaranteed', 'Free acoustic frequency layout chart'],
    gradient: 'from-sky-950/80 via-slate-900 to-emerald-950/70',
    iconType: 'bundle',
    soundDemoType: 'bundle',
    imageUrl: 'https://images.unsplash.com/photo-1518241353330-0f7941c2d9b5?w=800&auto=format&fit=crop&q=80',
  },
  // ==========================================
  // 6. MINDFUL FABRICS, APPAREL & ACCESSORIES
  // ==========================================
  {
    id: 'aura-432hz-cymatics-organic-cotton-tshirt',
    name: '432Hz Sacred Geometry Cymatics Organic Cotton T-Shirt',
    brand: 'Aura Sanctuary Apparel',
    category: 'apparel_fabrics',
    price: '$34.00',
    priceEstimate: 34,
    rating: 4.92,
    reviewCount: 318,
    badge: '★ GOTS Certified Organic Cotton',
    commissionBadge: 'Affiliate Ready (Printify & Amazon)',
    affiliatePartner: 'Printify & Amazon Merch Affiliate',
    affiliateUrl: 'https://www.amazon.com/s?k=432hz+sacred+geometry+cymatics+organic+cotton+t+shirt&tag=aura432-20',
    spiritualVibe: 'Visual Soundwave Cymatics & Diaphragmatic Breath Ease',
    description:
      '100% GOTS-certified organic combed ring-spun cotton tee printed with eco-friendly non-toxic water-based inks, showcasing the precise mathematical Chladni cymatic plate resonance geometry created by a pure 432Hz tone.',
    whyForSanctuary:
      'Breathable natural plant fibers prevent static micro-disruptions during sound meditation. The relaxed mindful silhouette ensures full, unrestricted diaphragmatic expansion during 4-7-8 and Box breathwork.',
    specifications: [
      { label: 'Fabric', value: '100% GOTS Organic Combed Ring-Spun Cotton (180 GSM)' },
      { label: 'Print Chemistry', value: 'OEKO-TEX Certified Non-Toxic Water-Based Inks' },
      { label: 'Acoustic Visual', value: '432Hz Pure Sine Liquid Cymatic Node Geometry' },
      { label: 'Fit & Cut', value: 'Pre-Shrunk Relaxed Meditation Fit (Unisex)' },
    ],
    pros: [
      'Zero synthetic micro-plastics against the skin or biofield',
      'Water-based soft-touch print never cracks or feels stiff',
      'Tagless comfort neckline for distraction-free breath sessions',
    ],
    gradient: 'from-amber-950/60 via-slate-900 to-indigo-950/50',
    iconType: 'shirt',
    imageUrl: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&auto=format&fit=crop&q=80',
  },
  {
    id: 'flower-of-life-pure-flax-linen-altar-cloth',
    name: 'Sacred 432Hz Flower of Life Pure Flax Linen Altar & Meditation Cloth',
    brand: 'Solfeggio Weavers Guild',
    category: 'apparel_fabrics',
    price: '$28.50',
    priceEstimate: 29,
    rating: 4.95,
    reviewCount: 420,
    badge: '★ Raw European Flax (High Biofield Vibration)',
    commissionBadge: 'Verified Affiliate Partner',
    affiliatePartner: 'Amazon Associates / Artisan Textiles',
    affiliateUrl: 'https://www.amazon.com/s?k=pure+flax+linen+altar+cloth+flower+of+life+sacred+geometry&tag=aura432-20',
    spiritualVibe: 'Sacred Altar Damping & Textile Coherence',
    description:
      'Hand-fringed 100% raw unbleached European flax linen meditation cloth embroidered with a golden-threaded Metatron grid and the 432Hz Flower of Life mandala. Measures 24" x 24" (60cm x 60cm).',
    whyForSanctuary:
      'Flax linen is clinically documented for high natural vibrational frequency and zero electrostatic buildup. Spreading it on your altar table provides acoustic damping under bronze singing bowls and quartz crystal chalices, preventing unwanted table rattle.',
    specifications: [
      { label: 'Material', value: '100% Natural Raw European Flax Linen' },
      { label: 'Dimensions', value: '24" x 24" (60cm x 60cm) with Hand-Fringed Edges' },
      { label: 'Embroidery', value: 'Metallic Golden Thread Sacred Geometry' },
      { label: 'Acoustic Function', value: 'Surface Reflection & Vibration Absorption' },
    ],
    pros: [
      'Acoustic resonance dampening prevents bowl buzzing on hard desks',
      'Hypoallergenic raw flax naturally repels dust and static charges',
      'Multi-purpose: altar cloth, head cover, tarot spread, or crystal grid',
    ],
    gradient: 'from-amber-900/40 via-slate-900 to-amber-950/60',
    iconType: 'cushion',
    imageUrl: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=800&auto=format&fit=crop&q=80',
  },
  {
    id: 'bodhi-organic-hemp-buckwheat-zafu-cushion',
    name: 'Organic Hemp & Buckwheat Ergonomic Meditation Zafu Cushion',
    brand: 'Bodhi Loom Sanctuary',
    category: 'apparel_fabrics',
    price: '$68.00',
    priceEstimate: 68,
    rating: 4.94,
    reviewCount: 682,
    badge: '★ Ergonomic Pelvic & Spine Support',
    commissionBadge: 'Affiliate Ready',
    affiliatePartner: 'Amazon Associates (Yoga & Meditation Fabrics)',
    affiliateUrl: 'https://www.amazon.com/s?k=organic+buckwheat+zafu+meditation+cushion+hemp+cotton&tag=aura432-20',
    spiritualVibe: 'Root Chakra Grounding & Prolonged Stillness',
    description:
      'Ergonomic circular zafu cushion packed with triple-cleaned USA organic buckwheat hulls and encased in an unbleached heavy organic hemp and cotton canvas slipcover with sturdy handle.',
    whyForSanctuary:
      'Proper forward pelvic tilt naturally stacks the lumbar vertebrae, opening the thoracic diaphragm for unrestricted 4-7-8 breathwork and allowing 45+ minute binaural sessions with zero leg numbness.',
    specifications: [
      { label: 'Cover Shell', value: '55% Organic Hemp / 45% Organic Cotton Canvas' },
      { label: 'Core Filling', value: '100% Farmed Organic Buckwheat Hulls (Hypoallergenic)' },
      { label: 'Dimensions', value: '15" Diameter x 6" Loft (Adjustable Zipper)' },
      { label: 'Weight', value: '5.2 lbs with reinforced carry handle' },
    ],
    pros: [
      'Hull density dynamically molds to your exact pelvic contours',
      'Removable, machine-washable heavy canvas cover',
      'Substantially reduces hip and knee strain during long listening sits',
    ],
    gradient: 'from-emerald-950/60 via-slate-900 to-amber-950/50',
    iconType: 'cushion',
    imageUrl: 'https://images.unsplash.com/photo-1545205597-3d9d02c29597?w=800&auto=format&fit=crop&q=80',
  },
  {
    id: 'somna-mulberry-silk-acoustic-eye-mask',
    name: 'Mulberry Silk Acoustic Sound Eye Mask & Pineal Blindfold',
    brand: 'Somna Sound Sanctuary',
    category: 'apparel_fabrics',
    price: '$24.99',
    priceEstimate: 25,
    rating: 4.88,
    reviewCount: 512,
    badge: '★ 100% 22-Momme Grade 6A Pure Mulberry Silk',
    commissionBadge: 'Affiliate Partner Ready',
    affiliatePartner: 'Amazon Associates (Rest & Sleep Tech)',
    affiliateUrl: 'https://www.amazon.com/s?k=pure+mulberry+silk+sleep+eye+mask+side+sleeper+deep+rest&tag=aura432-20',
    spiritualVibe: 'Total Photic Darkness & Pineal Melatonin Immersion',
    description:
      'Dual-sided 22-Momme mulberry silk eye shield contoured with zero-pressure eye cups and plush silk-baffled nose bridge, explicitly engineered with flat side wings to wear under over-ear headphones.',
    whyForSanctuary:
      'Blocking 100% of ambient light triggers rapid optical stillness and pineal melatonin synthesis, accelerating entry into Theta (4-8Hz) and Delta (0.5-4Hz) states during guided breath and sound meditation.',
    specifications: [
      { label: 'Silk Grade', value: '100% Long Strand 22-Momme Grade 6A Mulberry Silk' },
      { label: 'Light Blocking', value: '100% True Blackout with Contoured Nose Baffle' },
      { label: 'Headphone Fit', value: 'Ultra-thin profile fits smoothly under studio cans' },
      { label: 'Strap', value: 'Silk-wrapped adjustable snag-free elastic headband' },
    ],
    pros: [
      'Zero friction on delicate facial skin, eyelids, or eyelashes',
      'Eliminates optical distractions for deeper sound immersion',
      'Breathable natural temperature-regulating protein fibers',
    ],
    gradient: 'from-indigo-950/70 via-slate-900 to-sky-950/50',
    iconType: 'cushion',
    imageUrl: 'https://images.unsplash.com/photo-1584285418504-006bdf567882?w=800&auto=format&fit=crop&q=80',
  },
  {
    id: 'aura-432hz-heavyweight-french-terry-hoodie',
    name: '432Hz Solfeggio Heavy French Terry Acoustic Meditation Hoodie',
    brand: 'Aura Sanctuary Apparel',
    category: 'apparel_fabrics',
    price: '$64.00',
    priceEstimate: 64,
    rating: 4.91,
    reviewCount: 247,
    badge: '★ 450 GSM Heavy Organic Cotton',
    commissionBadge: 'Affiliate Merch Ready',
    affiliatePartner: 'Printify / Amazon Merch Affiliate',
    affiliateUrl: 'https://www.amazon.com/s?k=heavyweight+french+terry+meditation+hoodie+organic+cotton&tag=aura432-20',
    spiritualVibe: 'Acoustic Isolation Cocoon & Core Sadhana Warmth',
    description:
      '450 GSM ultra-heavy organic French terry cotton hoodie featuring an oversized double-lined acoustic hood designed to fit comfortably over large studio headphones while blocking peripheral sightlines.',
    whyForSanctuary:
      'During prolonged meditative stillness, metabolism and body temperature decrease. This dense thermal shell keeps the spine and neck warm while the roomy hood acts as an acoustic baffle.',
    specifications: [
      { label: 'Fabric Composition', value: '100% Organic Cotton 450 GSM Unbrushed French Terry' },
      { label: 'Acoustic Hood', value: 'Oversized Double-Layered Room for Audiophile Cans' },
      { label: 'Chest Emblem', value: 'Minimalist Tone-on-Tone 432Hz Sound Wave Glyph' },
      { label: 'Origin', value: 'Fair-Trade Certified Eco-Friendly Facility' },
    ],
    pros: [
      'Hood comfortably encloses planar magnetic headphones without pinch',
      'Heavy drape anchors the posture and keeps drafts off neck',
      'Affiliate print-on-demand ready for customized sanctuary batches',
    ],
    gradient: 'from-slate-900 via-amber-950/40 to-slate-950',
    iconType: 'shirt',
    imageUrl: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=800&auto=format&fit=crop&q=80',
  },
  {
    id: 'prana-loom-bamboo-meditation-shawl',
    name: 'Natural Bamboo Fiber Thermal Meditation Wrap & Shawl',
    brand: 'Prana Loom Textiles',
    category: 'apparel_fabrics',
    price: '$38.00',
    priceEstimate: 38,
    rating: 4.89,
    reviewCount: 389,
    badge: '★ Cashmere-Soft Bamboo Viscose',
    commissionBadge: 'Verified Affiliate Partner',
    affiliatePartner: 'Amazon Associates (Mindful Accessories)',
    affiliateUrl: 'https://www.amazon.com/s?k=bamboo+meditation+shawl+wrap+buddhist+prayer+blanket&tag=aura432-20',
    spiritualVibe: 'Thermal Shielding & Energetic Containment',
    description:
      'Woven from 100% sustainable bamboo viscose fibers in a soft herringbone pattern. Generous 80" x 36" (200cm x 90cm) dimensions allow full wrapping of shoulders, spine, and crossed legs.',
    whyForSanctuary:
      'Ancient yogic traditions emphasize cloaking the spine during meditation to prevent subtle temperature drop and ground the nervous system in a cocoon of tactile safety.',
    specifications: [
      { label: 'Material', value: '100% Sustainable Bamboo Viscose Herringbone' },
      { label: 'Size', value: '80" Length x 36" Width (200cm x 90cm)' },
      { label: 'Texture', value: 'Silky Cashmere Softness with Delicate Fringe' },
      { label: 'Thermal Profile', value: 'Breathable in Summer, Insulating in Winter' },
    ],
    pros: [
      'Generous size wraps around full cross-legged sitting posture',
      'Non-static natural bamboo fiber will not disrupt audio electronics',
      'Lightweight and wrinkle-resistant for travel retreats and flights',
    ],
    gradient: 'from-amber-950/50 via-slate-900 to-emerald-950/40',
    iconType: 'cushion',
    imageUrl: 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?w=800&auto=format&fit=crop&q=80',
  },
];

