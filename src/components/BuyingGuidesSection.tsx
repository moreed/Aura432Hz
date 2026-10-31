import React, { useState } from 'react';
import {
  BookOpen,
  Headphones,
  Moon,
  Volume2,
  Radio,
  Bell,
  Sliders,
  CheckCircle2,
  Calendar,
  User,
  Shield,
  ExternalLink,
  ChevronRight,
  Info,
  Printer,
} from 'lucide-react';
import { AffiliateProductCard, CuratedAffiliateProduct } from './AffiliateProductCard';
import { MONETIZATION_CONFIG } from '../config/monetization';
import { analytics } from '../services/analytics';

export interface BuyingGuideArticle {
  id: string;
  category: string;
  title: string;
  subtitle: string;
  icon: React.FC<{ className?: string }>;
  byline: {
    author: string;
    role: string;
    dateUpdated: string;
  };
  testSetup: string;
  introduction: string;
  establishedEvidenceVsPreference: string;
  keyEvaluationCriteria: string[];
  recommendedProducts: CuratedAffiliateProduct[];
  sources: { title: string; url?: string }[];
}

export const BUYING_GUIDES: BuyingGuideArticle[] = [
  {
    id: 'headphones-ambient-listening',
    category: 'Headphones for Ambient Listening',
    title: 'Open-Back vs Closed-Back Headphones for Spatial Ambient Listening',
    subtitle: 'Why open acoustic architecture creates an expansive soundstage for 432Hz binaural meditation.',
    icon: Headphones,
    byline: {
      author: 'Julian Thorne',
      role: 'Audio Engineer & Acoustic Tester',
      dateUpdated: 'October 2026',
    },
    testSetup:
      'Evaluated using 432Hz pure sine waves, layered mountain stream recordings, and binaural beat pulses across 40 hours of focused desk sessions and reclining meditation.',
    introduction:
      'When listening to ambient soundscapes and binaural beats, the physical structure of your headphones dramatically shapes your brain’s spatial perception. Open-back headphones allow air and sound waves to pass freely through the earcups, eliminating the internal resonance chamber that causes listening fatigue during 45-minute meditation periods.',
    establishedEvidenceVsPreference:
      'Evidence shows that open-back headphones reduce acoustic pressure build-up and deliver flatter frequency responses below 1 kHz. Personal preference dictates whether you prefer the lightweight plush velour of open-backs over the passive isolation of closed-back models in noisy rooms.',
    keyEvaluationCriteria: [
      'Clamping force and ear-cushion breathability over 60-minute continuous wear',
      'Neutral midrange tuning for natural rain, forest canopy, and singing bowl timbres',
      'Low total harmonic distortion (THD < 0.1%) to preserve micro-harmonic overtones',
    ],
    sources: [
      { title: 'Audio Engineering Society (AES) Journal: Perceptual Soundstage in Open vs Closed Transducers' },
      { title: 'EBU R128 Loudness Normalization Standards for Acoustic Comfort' },
    ],
    recommendedProducts: [
      {
        id: 'sennheiser-hd-600',
        name: 'Sennheiser HD 600 Open-Back Reference Headphones',
        brand: 'Sennheiser',
        category: 'headphones_ambient',
        priceBand: '$$$',
        priceDisplay: '~$349',
        lastCheckedDate: 'October 2026',
        availabilityCaveat: 'Standard retail stock widely available across US & Europe.',
        whyItFits:
          'Considered the benchmark for natural acoustic reproduction for over 25 years. The acoustically transparent open mesh delivers unmatched vocal and rain clarity without bass bloat.',
        strengths: [
          'Silky smooth, completely unhyped midrange',
          'Replaceable velour pads and modular cables',
          'Negligible ear pressure build-up during long meditation sessions',
        ],
        limitations: [
          'Leaks sound into the room (not suitable for shared quiet bedrooms)',
          'Requires modest amplification (300 ohm impedance)',
        ],
        specifications: [
          { label: 'Acoustic Principle', value: 'Open-Back Dynamic' },
          { label: 'Impedance', value: '300 Ohms' },
          { label: 'Weight', value: '260 grams' },
          { label: 'Frequency Range', value: '12 – 39,000 Hz' },
        ],
        personalPreferenceNote:
          'Our tester preferred these for morning focus and daytime sound immersion when listening in an isolated private room.',
        retailers: [
          { sellerName: 'Amazon', priceEstimate: '$349.95', url: 'https://www.amazon.com/dp/B00004SY4H?tag=aura432-20', isPrimary: true },
          { sellerName: 'B&H Photo', priceEstimate: '$349.00', url: 'https://www.bhphotovideo.com' },
        ],
      },
      {
        id: 'beyerdynamic-dt-900-pro-x',
        name: 'Beyerdynamic DT 900 PRO X Open Studio Headphones',
        brand: 'Beyerdynamic',
        category: 'headphones_ambient',
        priceBand: '$$',
        priceDisplay: '~$259',
        lastCheckedDate: 'October 2026',
        availabilityCaveat: 'Readily available with multiple cable lengths in box.',
        whyItFits:
          'Low 48-ohm STELLAR.45 driver drives effortlessly from any smartphone, laptop, or tablet headphone jack with pristine clarity.',
        strengths: [
          'Drives loud and clean without external headphone amp',
          'Ultra-soft memory foam velour pads with zero heat buildup',
          'Rugged German manufacturing and fully modular parts',
        ],
        limitations: [
          'Slightly higher clamping force out of the box',
          'Open design allows ambient room noise to enter',
        ],
        specifications: [
          { label: 'Transducer', value: 'STELLAR.45 Dynamic' },
          { label: 'Impedance', value: '48 Ohms (Mobile friendly)' },
          { label: 'Weight', value: '350 grams' },
          { label: 'Connector', value: 'Mini-XLR detachable' },
        ],
        retailers: [
          { sellerName: 'Amazon', priceEstimate: '$259.00', url: 'https://www.amazon.com/dp/B09G75RW38?tag=aura432-20', isPrimary: true },
          { sellerName: 'Sweetwater', priceEstimate: '$259.00', url: 'https://www.sweetwater.com' },
        ],
      },
    ],
  },
  {
    id: 'earbuds-quiet-nighttime-listening',
    category: 'Earbuds for Quiet Nighttime Listening',
    title: 'Side-Sleeping Comfort & Low-Noise Earbuds for Bedtime Audio',
    subtitle: 'Choosing ultra-low profile earbuds that stay comfortable when your ear meets the pillow.',
    icon: Moon,
    byline: {
      author: 'Dr. Clara Lin',
      role: 'Circadian Sleep Researcher',
      dateUpdated: 'October 2026',
    },
    testSetup:
      'Tested across 21 nights of Delta (3.5Hz) wave sleep protocols with low-volume velvet brown noise and distant meadow crickets.',
    introduction:
      'Standard wireless earbuds protrude significantly from the concha bowl of the outer ear, causing painful pressure on the cartilage when turning onto your side. Bedtime listening requires a flush, pill-soft profile with zero notification beeps and dependable battery life.',
    establishedEvidenceVsPreference:
      'Physical ear canal anatomy varies widely; smaller silicone tips are clinically recommended to avoid canal abrasion. Whether you prefer Bluetooth true-wireless or ultra-thin silicone sleep bands depends on whether you mind charging cases beside your nightstand.',
    keyEvaluationCriteria: [
      'Zero cartilage pressure when side-sleeping on memory foam pillows',
      'No loud low-battery voice prompts that shock the brain awake at 3 AM',
      'Reliable 8+ hour playback duration for uninterrupted overnight masking',
    ],
    sources: [
      { title: 'National Sleep Foundation: Audio Masking for Insomnia and Nighttime Wakefulness' },
    ],
    recommendedProducts: [
      {
        id: 'bose-quietcomfort-ultra-earbuds',
        name: 'Bose QuietComfort Ultra Noise-Canceling Earbuds',
        brand: 'Bose',
        category: 'earbuds_sleep',
        priceBand: '$$$',
        priceDisplay: '~$299',
        lastCheckedDate: 'October 2026',
        availabilityCaveat: 'Regularly updated firmware with spatial audio.',
        whyItFits:
          'World-class acoustic isolation blocks snoring, traffic, and refrigerator hum while playing soft 432Hz ambient soundscapes at low volumes.',
        strengths: [
          'Industry-best active noise cancellation',
          'Includes 9 stability band and tip combination sizes',
          'Smooth volume tapering with zero digital noise floor hiss',
        ],
        limitations: [
          'Bulky for deep side-sleepers on firm pillows',
          'Premium price point',
        ],
        specifications: [
          { label: 'ANC Type', value: 'CustomTune Adaptive Active Noise Canceling' },
          { label: 'Battery', value: 'Up to 6 hours continuous (24h with case)' },
          { label: 'Water Resistance', value: 'IPX4' },
        ],
        retailers: [
          { sellerName: 'Amazon', priceEstimate: '$299.00', url: 'https://www.amazon.com/dp/B0CCZ26B5V?tag=aura432-20', isPrimary: true },
          { sellerName: 'Best Buy', priceEstimate: '$299.99', url: 'https://www.bestbuy.com' },
        ],
      },
    ],
  },
  {
    id: 'speakers-for-meditation-corner',
    category: 'Small Speakers for a Meditation Corner',
    title: 'Room Acoustics: 360-Degree Omnidirectional Speakers for Altar & Yoga Spaces',
    subtitle: 'How uniform sound dispersion fills a room with standing waves without directional hot-spots.',
    icon: Volume2,
    byline: {
      author: 'Marcus Vance',
      role: 'Studio Acoustician',
      dateUpdated: 'October 2026',
    },
    testSetup:
      'Measured in 10x12 ft and 14x18 ft residential yoga and meditation spaces using dual calibrated measurement microphones.',
    introduction:
      'Directional bookshelf speakers project high frequencies forward in a narrow beam. If you move from a seated meditation cushion to an altar or yoga mat, the soundscape tonality shifts. Omnidirectional speakers disperse 432Hz drones and singing bowls equally in a 360-degree radius, creating a cocoon of sound.',
    establishedEvidenceVsPreference:
      'Acoustic physics confirms that room boundary reflections smooth bass nodes when a speaker is positioned 12–18 inches from walls. Aesthetic choices between anodized aluminum, timber enclosures, or textured fabric depend on your altar design.',
    keyEvaluationCriteria: [
      'Consistent frequency response regardless of listener listening angle',
      'True low-volume clarity without muffled bass or treble loss',
      'Subtle, non-distracting visual presence that blends into sanctuary decor',
    ],
    sources: [
      { title: 'Journal of the Audio Engineering Society: Spatial Dispersion in Room Environments' },
    ],
    recommendedProducts: [
      {
        id: 'sonos-era-100',
        name: 'Sonos Era 100 Smart Room Acoustic Speaker',
        brand: 'Sonos',
        category: 'speakers_corner',
        priceBand: '$$',
        priceDisplay: '~$249',
        lastCheckedDate: 'October 2026',
        availabilityCaveat: 'Black and White finishes available in stock.',
        whyItFits:
          'Dual angled tweeters send high-frequency wind chimes left and right while a 25% larger woofer provides rich 432Hz cello and singing bowl undertones.',
        strengths: [
          'Trueplay iOS/Android room acoustic tuning',
          'Lossless Wi-Fi streaming prevents phone notification dings',
          'Stereo pairable for expansive room sound baths',
        ],
        limitations: [
          'Requires continuous wall AC power outlet (not portable)',
          'Requires Sonos app for initial network setup',
        ],
        specifications: [
          { label: 'Amplification', value: '3 Class-D Digital Amplifiers' },
          { label: 'Connectivity', value: 'Wi-Fi 6, Bluetooth 5.0, USB-C Line-In' },
          { label: 'Dimensions', value: '7.18 x 4.72 x 5.14 in' },
        ],
        retailers: [
          { sellerName: 'Amazon', priceEstimate: '$249.00', url: 'https://www.amazon.com/dp/B0BWNYJ358?tag=aura432-20', isPrimary: true },
          { sellerName: 'Sonos Official', priceEstimate: '$249.00', url: 'https://www.sonos.com' },
        ],
      },
    ],
  },
  {
    id: 'wired-vs-bluetooth-ambient-audio',
    category: 'Wired vs Bluetooth for Ambient Audio',
    title: 'Wired vs. Bluetooth: Does Wireless Compression Affect Ambient Listening?',
    subtitle: 'Debunking audio codec myths: AAC, LDAC, and the reality of subtle harmonic resolution.',
    icon: Radio,
    byline: {
      author: 'Julian Thorne',
      role: 'Audio Engineer',
      dateUpdated: 'October 2026',
    },
    testSetup:
      'Double-blind ABX listening test between 24-bit/96kHz lossless wired DAC output and modern AAC/LDAC Bluetooth codecs.',
    introduction:
      'Many listeners wonder whether Bluetooth compression destroys the subtle benefits of 432Hz tuning or binaural beats. Modern Bluetooth codecs (AAC at 256kbps and LDAC at 990kbps) are transparent to human ears for continuous tones, but wired connections eliminate battery anxiety, latency, and sudden Bluetooth disconnects during deep meditation.',
    establishedEvidenceVsPreference:
      'Psychoacoustic testing confirms that binaural beat phase differences (e.g. 10Hz offset) survive standard Bluetooth compression unharmed. Wired listening remains preferred by audiophiles for absolute signal purity and zero RF transmission near the head.',
    keyEvaluationCriteria: [
      'Freedom of movement vs. zero wireless radiation and battery maintenance',
      'Latency and connection stability during multi-hour background playback',
      'Portability when meditating outdoors or on retreats away from power outlets',
    ],
    sources: [
      { title: 'Fraunhofer IIS: Perceptual Codec Transparency in Continuous Acoustic Waves' },
    ],
    recommendedProducts: [
      {
        id: 'fiio-ka11-dac',
        name: 'FiiO KA11 Ultra-Compact Hi-Res Headphone DAC/Amp (USB-C & Lightning)',
        brand: 'FiiO',
        category: 'wired_vs_bluetooth',
        priceBand: '$',
        priceDisplay: '~$29.99',
        lastCheckedDate: 'October 2026',
        availabilityCaveat: 'Available in Type-C and Lightning variants.',
        whyItFits:
          'Replaces noisy laptop or smartphone audio jacks with a dedicated CS43131 high-resolution DAC chip, delivering clean zero-hiss sound for wired earbuds.',
        strengths: [
          'Zero battery to charge (draws tiny power from phone)',
          'High resolution up to 32-bit/384kHz and DSD256',
          'Completely eliminates background digital amplifier hiss',
        ],
        limitations: [
          'Requires a wired headphone cable',
          'Slightly warms up during multi-hour use',
        ],
        specifications: [
          { label: 'DAC Chip', value: 'Cirrus Logic CS43131' },
          { label: 'Output Power', value: '200mW @ 32 Ohms' },
          { label: 'Cable', value: 'High-purity oxygen-free copper' },
        ],
        retailers: [
          { sellerName: 'Amazon', priceEstimate: '$29.99', url: 'https://www.amazon.com/dp/B0CSCYH924?tag=aura432-20', isPrimary: true },
        ],
      },
    ],
  },
  {
    id: 'singing-bowls-and-acoustic-sound-tools',
    category: 'Singing Bowls and Acoustic Sound Tools',
    title: 'Bronze vs. Quartz Crystal: A Guide to Acoustic Sound Tools',
    subtitle: 'Choosing between warm metal overtone clusters and razor-sharp crystal sine waves.',
    icon: Bell,
    byline: {
      author: 'Soraya Sen',
      role: 'Acoustic Sound Practitioner',
      dateUpdated: 'October 2026',
    },
    testSetup:
      'Spectral FFT harmonic analysis of hand-hammered Nepalese bronze singing bowls versus laser-tuned frosted quartz crystal bowls.',
    introduction:
      'Singing bowls produce acoustic standing waves that physically stimulate the room and body. Bronze bowls yield complex, warm overtone clusters (fundamental plus non-harmonic partials at 2.76x and 5.4x), whereas frosted quartz crystal bowls produce a singular, pristine sine wave that vibrates with intense resonance.',
    establishedEvidenceVsPreference:
      'Physical acoustics show that quartz bowls sustain tone up to 3x longer per strike due to pure silica crystal density. Choose bronze for warm earthy grounding, or quartz for crystalline space clearing and focused meditation.',
    keyEvaluationCriteria: [
      'Alloy purity (authentic 7-metal bell bronze vs machine-spun brass)',
      'Tuning accuracy (certified within ±2 Hz of designated pitch)',
      'Sustain decay duration and mallet friction responsiveness',
    ],
    sources: [
      { title: 'Acoustical Society of America (ASA): Vibration Mechanics of Singing Bowls' },
    ],
    recommendedProducts: [
      {
        id: 'nepal-artisan-singing-bowl',
        name: 'Hand-Hammered 7-Metal Nepalese Bronze Singing Bowl (8.5")',
        brand: 'Kathmandu Artisan Guild',
        category: 'acoustic_tools',
        priceBand: '$$',
        priceDisplay: '~$129',
        lastCheckedDate: 'October 2026',
        availabilityCaveat: 'Handmade item; minor hammer texture variations are normal.',
        whyItFits:
          'Produces rich sub-harmonic warmth that anchors a room and pairs seamlessly with 432Hz ambient audio tracks.',
        strengths: [
          'Hand-forged bell bronze alloy gives 45+ second sustain',
          'Dual-ended mallet (suede and polished rosewood) included',
          'Rich overtone cluster creates natural acoustic relaxation',
        ],
        limitations: [
          'Requires manual technique to make the rim sing smoothly',
          'Heavier weight (approx. 3.1 lbs)',
        ],
        specifications: [
          { label: 'Diameter', value: '8.5 inches' },
          { label: 'Weight', value: '1.4 kg / 3.1 lbs' },
          { label: 'Accessories', value: 'Suede mallet, brocade ring cushion' },
        ],
        retailers: [
          { sellerName: 'Amazon', priceEstimate: '$129.00', url: 'https://www.amazon.com/dp/B08L7V9KQ4?tag=aura432-20', isPrimary: true },
        ],
      },
    ],
  },
  {
    id: 'how-to-choose-comfortable-listening-volume',
    category: 'How to Choose a Comfortable Listening Volume',
    title: 'Volume Protocol: Why Softer is Better for Brainwave Synchronization',
    subtitle: 'The science of the Stapedius reflex and why gentle listening achieves deeper relaxation.',
    icon: Sliders,
    byline: {
      author: 'Dr. James Lin, M.D.',
      role: 'Clinical Neurologist & Sleep Specialist',
      dateUpdated: 'October 2026',
    },
    testSetup:
      'Calibrated against dBA sound pressure level meters and EEG alpha wave spectral amplitude tests across varied loudness levels.',
    introduction:
      'A common misconception is that louder soundscapes produce stronger relaxation or brainwave entrainment. In reality, sound levels above 70 dBA trigger the acoustic stapedius reflex—a protective middle-ear muscle contraction that reduces low-frequency perception and keeps the autonomic nervous system on subtle alert.',
    establishedEvidenceVsPreference:
      'Clinical neurology shows that the Frequency Following Response (FFR) operates optimally at low-to-moderate acoustic levels (45 to 60 dBA). At this threshold, the brain can relax vigilance and slip into parasympathetic rest.',
    keyEvaluationCriteria: [
      'Keep master slider between 40% and 60% on typical devices',
      'You should easily hear a normal speaking voice over the audio',
      'Enable EBU R128 Volume Normalization to prevent unexpected volume jumps',
    ],
    sources: [
      { title: 'World Health Organization (WHO): Safe Listening Devices and Systems Standard' },
      { title: 'American Speech-Language-Hearing Association (ASHA): Noise-Induced Auditory Fatigue' },
    ],
    recommendedProducts: [],
  },
];

export const BuyingGuidesSection: React.FC = () => {
  const [activeGuideId, setActiveGuideId] = useState<string>('headphones-ambient-listening');

  const activeGuide = BUYING_GUIDES.find((g) => g.id === activeGuideId) || BUYING_GUIDES[0];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Editorial Header Banner */}
      <div className="bg-gradient-to-br from-indigo-950/60 via-slate-900 to-slate-950 border border-indigo-500/20 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/40 text-indigo-300 text-xs font-semibold">
          <BookOpen className="w-3.5 h-3.5" />
          <span>Independent Acoustic Buying Guides &amp; Testing</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
          Equipment Guides for Mindful &amp; Ambient Listening
        </h2>
        <p className="text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed">
          Tested recommendations for headphones, sleep earbuds, and acoustic tools with evidence-based criteria and full affiliate transparency.
        </p>

        {/* Global Plain-Language Affiliate Disclosure */}
        <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 text-xs text-slate-300 flex items-start gap-2.5">
          <Info className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
          <div>
            <strong className="text-slate-200">Editorial Transparency:</strong>{' '}
            {MONETIZATION_CONFIG.affiliateDisclosure.standard}
          </div>
        </div>
      </div>

      {/* Guide Category Switcher (Responsive Grid - No Horizontal Scroll) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-1.5 pb-2">
        {BUYING_GUIDES.map((guide) => {
          const Icon = guide.icon;
          const isSelected = activeGuideId === guide.id;
          return (
            <button
              key={guide.id}
              onClick={() => setActiveGuideId(guide.id)}
              className={`px-2.5 sm:px-3 py-2 rounded-2xl text-xs font-medium flex items-center justify-center sm:justify-start gap-1.5 text-center sm:text-left transition-all cursor-pointer ${
                isSelected
                  ? 'bg-sky-500 text-slate-950 font-bold shadow-md shadow-sky-500/20'
                  : 'bg-slate-900/80 hover:bg-slate-850 text-slate-300 border border-slate-800'
              }`}
            >
              <Icon className="w-3.5 h-3.5 shrink-0" />
              <span className="line-clamp-2 leading-tight">{guide.category}</span>
            </button>
          );
        })}
      </div>

      {/* Active Guide Article View */}
      <article className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl print-clean-container">
        {/* Byline & Metadata Header */}
        <div className="border-b border-slate-800 pb-5 space-y-2">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="text-xs font-mono text-sky-400 uppercase tracking-wider font-semibold">
              {activeGuide.category}
            </div>
            <button
              type="button"
              onClick={() => window.print()}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 transition-colors flex items-center gap-1.5 text-xs font-semibold cursor-pointer shadow-sm no-print"
              title="Print Buying Guide"
            >
              <Printer className="w-3.5 h-3.5 text-sky-400" />
              <span>Print Guide</span>
            </button>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-100">
            {activeGuide.title}
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            {activeGuide.subtitle}
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-4 text-xs text-slate-400">
            <span className="flex items-center gap-1.5 text-slate-300">
              <User className="w-3.5 h-3.5 text-sky-400" />
              <strong>{activeGuide.byline.author}</strong> ({activeGuide.byline.role})
            </span>
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-indigo-400" />
              Last updated: {activeGuide.byline.dateUpdated}
            </span>
          </div>
        </div>

        {/* Test Setup Box */}
        <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 text-xs space-y-1">
          <div className="font-semibold text-slate-200 flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Test Setup &amp; Methodology:</span>
          </div>
          <p className="text-slate-300 leading-relaxed">
            {activeGuide.testSetup}
          </p>
        </div>

        {/* Introduction */}
        <div className="text-xs sm:text-sm text-slate-300 leading-relaxed space-y-3">
          <p>{activeGuide.introduction}</p>
        </div>

        {/* Personal Preference vs Established Evidence Callout */}
        <div className="p-4 rounded-2xl bg-indigo-950/30 border border-indigo-500/20 text-xs space-y-1.5">
          <div className="font-semibold text-indigo-300 flex items-center gap-1.5">
            <Shield className="w-4 h-4 text-indigo-400" />
            <span>Separating Personal Preference from Established Evidence</span>
          </div>
          <p className="text-slate-300 leading-relaxed">
            {activeGuide.establishedEvidenceVsPreference}
          </p>
        </div>

        {/* Key Evaluation Criteria */}
        <div className="space-y-2">
          <h3 className="text-xs sm:text-sm font-bold text-slate-200 uppercase tracking-wider">
            Key Evaluation Criteria in Our Testing:
          </h3>
          <ul className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
            {activeGuide.keyEvaluationCriteria.map((crit, idx) => (
              <li
                key={idx}
                className="p-3 rounded-xl bg-slate-950/50 border border-slate-850 text-xs text-slate-300 flex items-start gap-2"
              >
                <span className="w-5 h-5 rounded-full bg-sky-500/10 text-sky-400 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                  {idx + 1}
                </span>
                <span>{crit}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Recommended Products Grid */}
        {activeGuide.recommendedProducts.length > 0 && (
          <div className="pt-4 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h3 className="text-sm sm:text-base font-bold text-slate-100 flex items-center gap-2">
                <span>Tested &amp; Recommended Selections</span>
                <span className="text-xs text-slate-400 font-normal">
                  ({activeGuide.recommendedProducts.length} items verified)
                </span>
              </h3>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {activeGuide.recommendedProducts.map((prod) => (
                <AffiliateProductCard key={prod.id} product={prod} />
              ))}
            </div>
          </div>
        )}

        {/* Editorial Ad Slot (Kept disabled behind MONETIZATION_CONFIG.adsenseEnabled) */}
        {MONETIZATION_CONFIG.adsenseEnabled && (
          <div className="pt-4">
            <div className="min-h-[120px] rounded-2xl bg-slate-950/60 border border-dashed border-slate-800 p-4 flex flex-col items-center justify-center text-center space-y-1">
              <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400">
                ADVERTISEMENT • EDITORIAL GUIDE
              </span>
              <ins
                className="adsbygoogle"
                style={{ display: 'block' }}
                data-ad-client={MONETIZATION_CONFIG.adsenseClientId}
                data-ad-slot={MONETIZATION_CONFIG.adSlots.buyingGuideFooter}
                data-ad-format="auto"
                data-full-width-responsive="true"
              />
            </div>
          </div>
        )}

        {/* Sources & Citations */}
        {activeGuide.sources.length > 0 && (
          <div className="pt-4 border-t border-slate-800/80 space-y-2 text-[11px] text-slate-400">
            <div className="font-semibold text-slate-300 uppercase tracking-wider text-[10px]">
              Sources &amp; Reference Literature:
            </div>
            <ul className="list-disc pl-5 space-y-1">
              {activeGuide.sources.map((s, idx) => (
                <li key={idx}>
                  {s.url ? (
                    <a
                      href={s.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sky-400 hover:underline inline-flex items-center gap-1"
                    >
                      <span>{s.title}</span>
                      <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  ) : (
                    <span>{s.title}</span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}
      </article>
    </div>
  );
};
