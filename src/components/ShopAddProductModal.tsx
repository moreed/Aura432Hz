import React, { useState } from 'react';
import {
  X,
  Sparkles,
  ShoppingBag,
  ExternalLink,
  Plus,
  RefreshCw,
  Check,
  AlertCircle,
  CheckCircle2,
  Tag,
  DollarSign,
  Star,
  Image as ImageIcon,
  Flame,
  Shirt,
  Headphones,
  Sliders,
  FileText,
  Wand2,
  Trash2,
} from 'lucide-react';
import { affiliateStorage, AffiliateProduct } from '../services/affiliateStorage';
import { SpiritualProduct } from '../data/spiritualProducts';
import { FetchedProductData } from '../server/metadataFetcher';
import { SANCTUARY_CATEGORIES, SANCTUARY_HARMONICS } from './ContentFetcherSection';

const SAMPLE_FETCH_PRESETS = [
  {
    label: '432Hz Quartz Crystal Singing Bowl (Verified Real Photos)',
    url: 'https://www.amazon.com/dp/B07CY1CCDY/quartz-crystal-singing-bowl-432hz',
    partner: 'Amazon Associates',
  },
  {
    label: 'Koshi Bamboo Wind Chimes Aria 432Hz (Verified Real Photos)',
    url: 'https://www.amazon.com/dp/B07HKPC2P4/koshi-aria-wind-chimes',
    partner: 'Amazon Associates',
  },
  {
    label: 'Sennheiser HD650 Audiophile Headphones (Verified Real Photos)',
    url: 'https://www.amazon.com/dp/B07Q9MJKBV/sennheiser-hd-650-open-back-audiophile-headphones',
    partner: 'Amazon Associates',
  },
  {
    label: 'Audio-Technica ATH-M50x Studio Headphones (18 Verified Real Photos)',
    url: 'https://www.amazon.com/dp/B00HVLUR86/audio-technica-ath-m50x-professional-studio-monitor-headphones',
    partner: 'Amazon Associates',
  },
];

interface ShopAddProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProductAdded?: (product: AffiliateProduct) => void;
  editingProduct?: SpiritualProduct | AffiliateProduct | null;
}

export const ShopAddProductModal: React.FC<ShopAddProductModalProps> = ({
  isOpen,
  onClose,
  onProductAdded,
  editingProduct,
}) => {
  const [activeTab, setActiveTab] = useState<'fetch' | 'manual'>('fetch');

  // Auto-Fetcher State
  const [fetchUrl, setFetchUrl] = useState('');
  const [isFetching, setIsFetching] = useState(false);
  const [fetchedData, setFetchedData] = useState<FetchedProductData | null>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [activePhotoIdx, setActivePhotoIdx] = useState(0);
  const [fetchDescTab, setFetchDescTab] = useState<'original' | 'short' | 'long'>('original');
  const [fetchNewPhotoUrl, setFetchNewPhotoUrl] = useState('');

  const handleAutoGenerateShort = (data: FetchedProductData) => {
    const mainDesc = data.description || '';
    const firstSentence = mainDesc.split(/[.!?]/)[0] || mainDesc;
    return firstSentence.length > 140 ? firstSentence.slice(0, 137) + '...' : firstSentence;
  };

  const handleGenerateHarmonicTemplate = (data: FetchedProductData) => {
    const harmonic = data.harmonicSupported || '432Hz Concert Pitch (Natural Harmonic / Heart Tuning)';
    const categoryName = data.category?.replace(/_/g, ' ') || 'sound healing';
    return `${data.description || ''}\n\nSanctuary Harmonic Resonance Dossier:\n- Harmonic Tuning: Calibrated for ${harmonic} resonance.\n- Audio Compatibility: Pairs seamlessly with 432Hz Sanctuary ambient audio.\n- Category Standard: Curated specifically for ${categoryName} sanctuary practice.\n- Craftsmanship: Verified for natural resonance and diaphragmatic breath synchronization.`;
  };

  // Manual Form State
  const [manualName, setManualName] = useState('');
  const [manualBrand, setManualBrand] = useState('');
  const [manualCategory, setManualCategory] = useState<
    'sound_healing' | 'audio_headphones' | 'audio_speakers_dacs' | 'incense_smudge' | 'atmosphere_altar' | 'ritual_bundles' | 'apparel_fabrics'
  >('sound_healing');
  const [manualPrice, setManualPrice] = useState('$69.00');
  const [manualPartner, setManualPartner] = useState('Amazon Associates');
  const [manualUrl, setManualUrl] = useState('https://www.amazon.com/?tag=aura432-20');
  const [manualVibe, setManualVibe] = useState('Harmonic 432Hz Frequency Resonance');
  const [manualDescription, setManualDescription] = useState('');
  const [manualWhy, setManualWhy] = useState('');
  const [manualPros, setManualPros] = useState('Certified 432Hz acoustic alignment, Ethical natural materials, Deep restorative alpha entrainment');
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Sync form when editingProduct changes
  React.useEffect(() => {
    if (editingProduct) {
      setActiveTab('manual');
      setManualName(editingProduct.name || '');
      setManualBrand(editingProduct.brand || '');
      setManualCategory((editingProduct.category as any) || 'sound_healing');
      setManualPrice(editingProduct.price || '$69.00');
      setManualPartner(editingProduct.affiliatePartner || 'Amazon Associates');
      setManualUrl(editingProduct.affiliateUrl || '');
      setManualVibe(editingProduct.spiritualVibe || '');
      setManualDescription(editingProduct.description || '');
      setManualWhy(editingProduct.whyForSanctuary || '');
      setManualPros(editingProduct.pros ? editingProduct.pros.join(', ') : '');
    } else {
      setManualName('');
      setManualBrand('');
      setManualCategory('sound_healing');
      setManualPrice('$69.00');
      setManualPartner('Amazon Associates');
      setManualUrl('https://www.amazon.com/?tag=aura432-20');
      setManualVibe('Harmonic 432Hz Frequency Resonance');
      setManualDescription('');
      setManualWhy('');
      setManualPros('Certified 432Hz acoustic alignment, Ethical natural materials, Deep restorative alpha entrainment');
    }
  }, [editingProduct, isOpen]);

  if (!isOpen) return null;

  const handleFetchLink = async (targetUrl: string) => {
    const target = targetUrl.trim();
    if (!target) return;

    setIsFetching(true);
    setFetchError(null);
    setFetchedData(null);

    try {
      const data = await affiliateStorage.fetchProductFromUrl(target);
      if (!data.harmonicSupported) {
        data.harmonicSupported = '432Hz Concert Pitch (Natural Harmonic / Heart Tuning)';
      }
      if (!data.shortDescription) {
        data.shortDescription = handleAutoGenerateShort(data);
      }
      if (!data.longDescription) {
        data.longDescription = handleGenerateHarmonicTemplate(data);
      }
      setFetchedData(data);
      setFetchDescTab('original');
      setActivePhotoIdx(0);
      setSuccessToast(`Extracted metadata & photos for: "${data.title.slice(0, 36)}..."`);
      setTimeout(() => setSuccessToast(null), 4000);
    } catch (err: any) {
      setFetchError(err?.message || 'Could not fetch external product metadata');
    } finally {
      setIsFetching(false);
    }
  };

  const handlePublishFetched = () => {
    if (!fetchedData) return;

    const harmonicTuning = fetchedData.harmonicSupported || '432Hz Concert Pitch (Natural Harmonic)';
    const cat = fetchedData.category || 'sound_healing';
    const resolveIcon = (c: string): any => {
      if (c === 'apparel_fabrics') return 'shirt';
      if (c === 'audio_headphones') return 'headphones';
      if (c === 'audio_speakers_dacs') return 'speaker';
      if (c === 'incense_smudge' || c === 'incense') return 'flame';
      if (c === 'crystals') return 'crystal';
      if (c === 'atmosphere_altar') return 'lamp';
      if (c === 'ritual_bundles') return 'bundle';
      return 'bowl';
    };

    const newProduct: AffiliateProduct = {
      id: `shop-product-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      name: fetchedData.title,
      brand: fetchedData.partner.split(' ')[0] + ' Curated Collection',
      category: cat as any,
      price: fetchedData.price,
      priceEstimate: parseFloat(fetchedData.price.replace(/[^0-9.]/g, '')) || 79,
      rating: fetchedData.rating || 5.0,
      reviewCount: fetchedData.reviewsCount || 120,
      badge: fetchedData.badge || `★ ${harmonicTuning}`,
      commissionBadge: 'Verified Partner Affiliate Link',
      affiliatePartner: fetchedData.partner,
      affiliateUrl: fetchedData.url,
      spiritualVibe: fetchedData.tagline || harmonicTuning,
      description: fetchedData.description,
      shortDescription: fetchedData.shortDescription || fetchedData.description?.slice(0, 140),
      longDescription: fetchedData.longDescription || `${fetchedData.description}\n\nSanctuary Acoustic Testing: Verified for ${harmonicTuning}.`,
      harmonicSupported: harmonicTuning,
      whyForSanctuary:
        fetchedData.longDescription ||
        'Ethically sourced acoustic equipment evaluated for sound meditation, harmonic overtone clarity, and nervous system calm.',
      specifications: [
        { label: 'Harmonic Alignment', value: harmonicTuning },
        { label: 'Curator Assessment', value: 'Tested for diaphragmatic breath resonance' },
      ],
      pros: fetchedData.pros || [
        `Acoustically certified for ${harmonicTuning}`,
        'Verified reviews from sound practitioners',
      ],
      gradient: 'from-amber-950/80 via-slate-900 to-indigo-950/70',
      iconType: resolveIcon(cat),
      soundDemoType: cat === 'audio_headphones' || cat === 'audio_speakers_dacs' ? 'stage' : 'bowl',
      imageUrl: fetchedData.image || fetchedData.photos?.[0],
      photos: fetchedData.photos,
      sampleReviews: fetchedData.sampleReviews,
      clicksCount: 0,
      dateAdded: new Date().toISOString(),
      status: 'active',
    };

    affiliateStorage.saveProduct(newProduct);
    if (onProductAdded) onProductAdded(newProduct);

    setFetchedData(null);
    setFetchUrl('');
    setSuccessToast(`Successfully published "${newProduct.name}" to the Shop!`);
    setTimeout(() => {
      setSuccessToast(null);
      onClose();
    }, 1500);
  };

  const handleSaveManualProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualName.trim()) return;

    const priceNum = parseFloat(manualPrice.replace(/[^0-9.]/g, '')) || 49;
    const prosArray = manualPros
      .split(',')
      .map((p) => p.trim())
      .filter(Boolean);

    const newProduct: AffiliateProduct = {
      id: editingProduct?.id || `shop-manual-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      name: manualName.trim(),
      brand: manualBrand.trim() || 'Aura Sanctuary Essentials',
      category: manualCategory,
      price: manualPrice.startsWith('$') ? manualPrice : `$${manualPrice}`,
      priceEstimate: priceNum,
      rating: (editingProduct as any)?.rating || 5.0,
      reviewCount: (editingProduct as any)?.reviewCount || 48,
      badge: editingProduct?.badge || '★ Verified Sanctuary Equipment',
      commissionBadge: `${manualPartner} (Curated Partner)`,
      affiliatePartner: manualPartner,
      affiliateUrl: manualUrl.trim() || 'https://www.amazon.com/?tag=aura432-20',
      spiritualVibe: manualVibe.trim() || 'Harmonic Wave Coherence & Grounding',
      description: manualDescription.trim() || 'Authentic artisan sound and meditation equipment curated for 432Hz deep listening.',
      whyForSanctuary: manualWhy.trim() || 'Enhances acoustic immersion and supports somatic relaxation during daily sound sessions.',
      specifications: editingProduct?.specifications || [
        { label: 'Tuning Resonance', value: '432Hz Harmonic Frequency' },
        { label: 'Curation Standard', value: 'Hand-inspected for sanctuary quality' },
      ],
      pros: prosArray.length > 0 ? prosArray : (editingProduct?.pros || ['Artisan craftsmanship', 'Acoustic wave purity', 'Fast partner fulfillment']),
      gradient: editingProduct?.gradient || 'from-amber-950/70 via-slate-900 to-indigo-950/60',
      iconType: editingProduct?.iconType || (manualCategory === 'apparel_fabrics' ? 'shirt' : 'bowl'),
      soundDemoType: editingProduct?.soundDemoType || 'bowl',
      clicksCount: (editingProduct as any)?.clicksCount || 0,
      dateAdded: (editingProduct as any)?.dateAdded || new Date().toISOString(),
      status: 'active',
    };

    affiliateStorage.saveProduct(newProduct);
    if (onProductAdded) onProductAdded(newProduct);

    setSuccessToast(editingProduct ? `Updated "${newProduct.name}"!` : `Added "${newProduct.name}" to the Shop!`);
    setTimeout(() => {
      setSuccessToast(null);
      onClose();
    }, 1200);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[90] flex items-center justify-center p-2.5 sm:p-5 bg-slate-950/85 backdrop-blur-md overflow-y-auto overscroll-contain animate-in fade-in duration-200"
    >
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl sm:rounded-3xl max-w-4xl w-full max-h-[92dvh] landscape:max-h-[94dvh] flex flex-col shadow-2xl overflow-hidden relative my-auto">
        {/* Top Header */}
        <div className="p-3.5 sm:p-5 landscape:py-2.5 landscape:px-4 border-b border-slate-800 bg-slate-900/95 sticky top-0 z-20 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center justify-center shrink-0">
              <ShoppingBag className="w-4 h-4 text-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-bold text-slate-100">
                  {editingProduct ? `Edit Product: ${editingProduct.name.slice(0, 32)}...` : 'Tool: Add New Product to Shop Catalog'}
                </h3>
                <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/30">
                  {editingProduct ? 'Product Editor' : 'Shop Link Auto-Fetcher'}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {editingProduct
                  ? 'Update details, pricing, description, partner link, or specifications for this sanctuary product.'
                  : 'Auto-extract photos, title, price & reviews from Amazon, Thomann, Sweetwater, or enter custom details.'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-100 transition-colors shrink-0 cursor-pointer"
            title="Close Tool"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Success Toast */}
        {successToast && (
          <div className="mx-4 sm:mx-6 mt-4 p-3 bg-emerald-500/20 border border-emerald-400 text-emerald-200 rounded-2xl text-xs flex items-center gap-2 shadow-md">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="font-medium">{successToast}</span>
          </div>
        )}

        {/* Mode Selector Tabs */}
        <div className="px-4 sm:px-6 pt-4 flex items-center gap-2 border-b border-slate-800/80">
          <button
            type="button"
            onClick={() => setActiveTab('fetch')}
            className={`px-4 py-2 rounded-t-xl text-xs font-semibold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
              activeTab === 'fetch'
                ? 'border-amber-400 text-amber-300 bg-slate-850/60'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Smart URL Link Auto-Fetcher</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('manual')}
            className={`px-4 py-2 rounded-t-xl text-xs font-semibold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
              activeTab === 'manual'
                ? 'border-amber-400 text-amber-300 bg-slate-850/60'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Plus className="w-3.5 h-3.5 text-amber-400" />
            <span>Manual Product Form</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5">
          {activeTab === 'fetch' ? (
            /* ========================================================================= */
            /* SMART URL LINK FETCHER TOOL                                               */
            /* ========================================================================= */
            <div className="space-y-4">
              {/* 3-Step Guide */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/40 flex items-center justify-center font-bold text-[10px] shrink-0">1</span>
                  <div>
                    <div className="font-semibold text-slate-200">Paste Product URL</div>
                    <div className="text-[10px] text-slate-400">Amazon, Thomann, Sweetwater, etc.</div>
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-sky-500/20 text-sky-300 border border-sky-400/40 flex items-center justify-center font-bold text-[10px] shrink-0">2</span>
                  <div>
                    <div className="font-semibold text-slate-200">Auto-Extract Details</div>
                    <div className="text-[10px] text-slate-400">High-res photos, specs &amp; pricing</div>
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 flex items-center justify-center font-bold text-[10px] shrink-0">3</span>
                  <div>
                    <div className="font-semibold text-slate-200">1-Click Publish</div>
                    <div className="text-[10px] text-slate-400">Instantly visible in Shop catalog</div>
                  </div>
                </div>
              </div>

              {/* URL Input Bar */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                <div className="relative flex-1">
                  <input
                    type="url"
                    value={fetchUrl}
                    onChange={(e) => setFetchUrl(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && fetchUrl.trim()) handleFetchLink(fetchUrl);
                    }}
                    placeholder="Paste external product link (e.g. https://www.amazon.com/dp/... or https://www.sweetwater.com/...)"
                    className="w-full px-4 py-3 rounded-2xl bg-slate-950/80 border border-slate-700/80 text-white placeholder-slate-400 text-xs sm:text-sm focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/50 shadow-inner"
                  />
                </div>
                <button
                  type="button"
                  disabled={isFetching || !fetchUrl.trim()}
                  onClick={() => handleFetchLink(fetchUrl)}
                  className="px-6 py-3 rounded-2xl bg-amber-400 hover:bg-amber-300 disabled:opacity-50 text-slate-950 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-amber-400/20 active:scale-95 cursor-pointer shrink-0"
                >
                  {isFetching ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
                      <span>Fetching Metadata...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 fill-current text-slate-950" />
                      <span>Fetch Product Details</span>
                    </>
                  )}
                </button>
              </div>

              {/* 1-Click Sample Presets */}
              <div className="flex items-center gap-2 flex-wrap text-xs pt-1">
                <span className="text-slate-400 text-[11px] font-medium">Quick 1-Click Samples:</span>
                {SAMPLE_FETCH_PRESETS.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setFetchUrl(preset.url);
                      handleFetchLink(preset.url);
                    }}
                    className="px-2.5 py-1 rounded-xl bg-slate-800/80 hover:bg-slate-750 text-slate-300 hover:text-white border border-slate-700 text-[11px] transition-all flex items-center gap-1 cursor-pointer active:scale-95"
                  >
                    <span>{preset.label}</span>
                  </button>
                ))}
              </div>

              {/* Error Box */}
              {fetchError && (
                <div className="p-3.5 bg-rose-500/20 border border-rose-400/40 text-rose-200 text-xs rounded-2xl flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>{fetchError}</span>
                </div>
              )}

              {/* Extracted Product Preview Card */}
              {fetchedData && (
                <div className="p-5 rounded-2xl bg-slate-950/80 border border-amber-400/50 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3 flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                      <span className="text-xs font-bold text-white uppercase tracking-wider">
                        Extracted Product Preview
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/30 uppercase font-semibold">
                        {fetchedData.partner}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setFetchedData(null)}
                        className="px-3 py-1.5 text-xs text-slate-400 hover:text-slate-200 rounded-xl bg-slate-800 cursor-pointer"
                      >
                        Dismiss
                      </button>
                      <button
                        type="button"
                        onClick={handlePublishFetched}
                        className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-all shadow-md active:scale-95 cursor-pointer"
                      >
                        <Check className="w-4 h-4" />
                        <span>1-Click Publish to Shop</span>
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
                    {/* Left: Photos Preview & Real Photo Manager (5 cols) */}
                    <div className="md:col-span-5 space-y-2.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-slate-200 flex items-center gap-1.5">
                          <ImageIcon className="w-3.5 h-3.5 text-amber-400" />
                          <span>Real Product Photos ({fetchedData.photos?.length || 0})</span>
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          Cover: #{activePhotoIdx + 1}
                        </span>
                      </div>

                      {/* Main Cover Photo Display */}
                      <div className="aspect-square rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 relative group shadow-inner">
                        {fetchedData.photos && fetchedData.photos.length > 0 ? (
                          <img
                            src={fetchedData.photos[activePhotoIdx] || fetchedData.photos[0]}
                            alt={fetchedData.title}
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                            referrerPolicy="no-referrer"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src =
                                'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&auto=format&fit=crop&q=80';
                            }}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-600">
                            <ImageIcon className="w-10 h-10" />
                          </div>
                        )}
                        <span className="absolute bottom-2 left-2 px-2.5 py-1 rounded-lg bg-slate-950/85 backdrop-blur-xs text-[10px] text-emerald-300 font-mono font-bold border border-emerald-500/30">
                          Photo {activePhotoIdx + 1} of {fetchedData.photos?.length || 1}
                        </span>
                      </div>

                      {/* Photo Thumbnails Strip */}
                      {fetchedData.photos && fetchedData.photos.length > 1 && (
                        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-950/60 rounded-xl border border-slate-800 max-h-36 overflow-y-auto">
                          {fetchedData.photos.map((photo, pIdx) => {
                            const isCurrent = activePhotoIdx === pIdx;
                            return (
                              <div
                                key={pIdx}
                                className={`relative group/item aspect-square w-12 rounded-lg overflow-hidden border cursor-pointer transition-all ${
                                  isCurrent
                                    ? 'border-amber-400 ring-2 ring-amber-400/40 scale-105'
                                    : 'border-slate-800 opacity-60 hover:opacity-100 hover:border-slate-600'
                                }`}
                                onClick={() => {
                                  setActivePhotoIdx(pIdx);
                                  setFetchedData({
                                    ...fetchedData,
                                    image: photo,
                                  });
                                }}
                              >
                                <img
                                  src={photo}
                                  alt=""
                                  className="w-full h-full object-cover"
                                  referrerPolicy="no-referrer"
                                />
                                {fetchedData.photos && fetchedData.photos.length > 1 && (
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      const updated = fetchedData.photos?.filter((_, idx) => idx !== pIdx) || [];
                                      setFetchedData({
                                        ...fetchedData,
                                        photos: updated,
                                        image: updated[0] || '',
                                      });
                                      if (activePhotoIdx >= updated.length) {
                                        setActivePhotoIdx(Math.max(0, updated.length - 1));
                                      }
                                    }}
                                    className="absolute top-0.5 right-0.5 p-0.5 rounded bg-slate-950/90 text-rose-400 hover:text-white hover:bg-rose-600 opacity-0 group-hover/item:opacity-100 transition-opacity"
                                    title="Remove this photo"
                                  >
                                    <Trash2 className="w-2.5 h-2.5" />
                                  </button>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {/* Add Custom Photo URL */}
                      <div className="p-2.5 bg-slate-950/80 border border-slate-800 rounded-xl space-y-1.5">
                        <span className="text-[10px] font-semibold text-slate-300 block">
                          + Add Photo URL directly:
                        </span>
                        <div className="flex items-center gap-1">
                          <input
                            type="url"
                            value={fetchNewPhotoUrl}
                            onChange={(e) => setFetchNewPhotoUrl(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                const val = fetchNewPhotoUrl.trim();
                                if (val && val.startsWith('http')) {
                                  const curr = fetchedData.photos || [];
                                  setFetchedData({
                                    ...fetchedData,
                                    photos: [val, ...curr],
                                    image: val,
                                  });
                                  setActivePhotoIdx(0);
                                  setFetchNewPhotoUrl('');
                                }
                              }
                            }}
                            placeholder="https://... photo link"
                            className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-[11px] text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-amber-400"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const val = fetchNewPhotoUrl.trim();
                              if (val && val.startsWith('http')) {
                                const curr = fetchedData.photos || [];
                                setFetchedData({
                                  ...fetchedData,
                                  photos: [val, ...curr],
                                  image: val,
                                });
                                setActivePhotoIdx(0);
                                setFetchNewPhotoUrl('');
                              }
                            }}
                            className="px-2.5 py-1 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-[11px] shrink-0 cursor-pointer"
                          >
                            Add
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Right: Extracted Metadata Details (7 cols) */}
                    <div className="md:col-span-7 space-y-3.5">
                      {/* Title & Price */}
                      <div className="space-y-1.5">
                        <input
                          type="text"
                          value={fetchedData.title}
                          onChange={(e) =>
                            setFetchedData({ ...fetchedData, title: e.target.value })
                          }
                          className="w-full text-sm sm:text-base font-bold text-slate-100 bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 focus:border-amber-400 focus:outline-none"
                          placeholder="Product Name"
                        />
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={fetchedData.price}
                            onChange={(e) =>
                              setFetchedData({ ...fetchedData, price: e.target.value })
                            }
                            className="w-28 bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-emerald-400 font-bold font-mono focus:border-amber-400 focus:outline-none"
                            placeholder="Price"
                          />
                          <span className="text-xs text-amber-300 font-mono">★ {fetchedData.rating} ({fetchedData.reviewsCount} reviews)</span>
                        </div>
                      </div>

                      {/* Dropdown 1: Category & Dropdown 2: Sanctuary Harmonic Supported */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1">
                          <label className="text-[10px] font-semibold text-emerald-400 flex items-center gap-1 block">
                            <Tag className="w-3 h-3" />
                            <span>Category (Dropdown):</span>
                          </label>
                          <select
                            value={fetchedData.category}
                            onChange={(e) =>
                              setFetchedData({
                                ...fetchedData,
                                category: e.target.value as any,
                              })
                            }
                            className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-100 focus:border-emerald-400 focus:outline-none cursor-pointer"
                          >
                            {SANCTUARY_CATEGORIES.map((cat) => (
                              <option key={cat.value} value={cat.value} className="bg-slate-900 py-1">
                                {cat.icon} {cat.label}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1">
                          <label className="text-[10px] font-semibold text-amber-300 flex items-center gap-1 block">
                            <Sparkles className="w-3 h-3" />
                            <span>Sanctuary Harmonic (Dropdown):</span>
                          </label>
                          <select
                            value={
                              fetchedData.harmonicSupported ||
                              '432Hz Concert Pitch (Natural Harmonic / Heart Tuning)'
                            }
                            onChange={(e) =>
                              setFetchedData({
                                ...fetchedData,
                                harmonicSupported: e.target.value,
                                badge: `★ ${e.target.value}`,
                              })
                            }
                            className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-amber-200 focus:border-amber-400 focus:outline-none cursor-pointer"
                          >
                            {SANCTUARY_HARMONICS.map((h) => (
                              <option key={h.value} value={h.value} className="bg-slate-900 py-1">
                                {h.label}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {/* Description Suite: Original, Short, Long */}
                      <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2">
                        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                          <span className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                            <FileText className="w-3.5 h-3.5 text-sky-400" />
                            <span>Description Suite</span>
                          </span>

                          {/* 3 Tabs */}
                          <div className="flex items-center gap-1 p-0.5 bg-slate-950 rounded-lg border border-slate-800">
                            <button
                              type="button"
                              onClick={() => setFetchDescTab('original')}
                              className={`px-2 py-0.5 rounded text-[10px] font-semibold transition-all cursor-pointer ${
                                fetchDescTab === 'original'
                                  ? 'bg-sky-500 text-slate-950 font-bold'
                                  : 'text-slate-400 hover:text-slate-200'
                              }`}
                            >
                              Original
                            </button>
                            <button
                              type="button"
                              onClick={() => setFetchDescTab('short')}
                              className={`px-2 py-0.5 rounded text-[10px] font-semibold transition-all cursor-pointer ${
                                fetchDescTab === 'short'
                                  ? 'bg-emerald-500 text-slate-950 font-bold'
                                  : 'text-slate-400 hover:text-slate-200'
                              }`}
                            >
                              Short
                            </button>
                            <button
                              type="button"
                              onClick={() => setFetchDescTab('long')}
                              className={`px-2 py-0.5 rounded text-[10px] font-semibold transition-all cursor-pointer ${
                                fetchDescTab === 'long'
                                  ? 'bg-purple-500 text-white font-bold'
                                  : 'text-slate-400 hover:text-slate-200'
                              }`}
                            >
                              Long
                            </button>
                          </div>
                        </div>

                        {/* Original Tab */}
                        {fetchDescTab === 'original' && (
                          <div className="space-y-1.5 animate-in fade-in">
                            <div className="flex items-center justify-between text-[10px] text-slate-400">
                              <span>Original product description from link:</span>
                              <span className="font-mono">{fetchedData.description?.length || 0} chars</span>
                            </div>
                            <textarea
                              rows={3}
                              value={fetchedData.description}
                              onChange={(e) =>
                                setFetchedData({
                                  ...fetchedData,
                                  description: e.target.value,
                                })
                              }
                              className="w-full text-xs text-slate-200 bg-slate-950 border border-slate-700 rounded-lg p-2.5 focus:border-amber-400 focus:outline-none"
                              placeholder="Original product description..."
                            />
                          </div>
                        )}

                        {/* Short Description Tab */}
                        {fetchDescTab === 'short' && (
                          <div className="space-y-1.5 animate-in fade-in">
                            <div className="flex items-center justify-between text-[10px] text-slate-400">
                              <span className="text-emerald-400 font-medium">Short Card Summary:</span>
                              <div className="flex items-center gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => {
                                    const short = handleAutoGenerateShort(fetchedData);
                                    setFetchedData({
                                      ...fetchedData,
                                      shortDescription: short,
                                    });
                                  }}
                                  className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30 text-[10px] font-semibold flex items-center gap-1 cursor-pointer"
                                >
                                  <Wand2 className="w-2.5 h-2.5" />
                                  <span>Auto-Generate</span>
                                </button>
                                <span className="font-mono">{fetchedData.shortDescription?.length || 0} chars</span>
                              </div>
                            </div>
                            <textarea
                              rows={3}
                              value={fetchedData.shortDescription || ''}
                              onChange={(e) =>
                                setFetchedData({
                                  ...fetchedData,
                                  shortDescription: e.target.value,
                                })
                              }
                              className="w-full text-xs text-emerald-200 bg-slate-950 border border-emerald-500/40 rounded-lg p-2.5 focus:border-emerald-400 focus:outline-none"
                              placeholder="Brief 1-2 sentence short summary for quick catalogue cards..."
                            />
                          </div>
                        )}

                        {/* Long Description Tab */}
                        {fetchDescTab === 'long' && (
                          <div className="space-y-1.5 animate-in fade-in">
                            <div className="flex items-center justify-between text-[10px] text-slate-400">
                              <span className="text-purple-300 font-medium">Long Description Dossier:</span>
                              <div className="flex items-center gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => {
                                    const long = handleGenerateHarmonicTemplate(fetchedData);
                                    setFetchedData({
                                      ...fetchedData,
                                      longDescription: long,
                                    });
                                  }}
                                  className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/40 hover:bg-purple-500/30 text-[10px] font-semibold flex items-center gap-1 cursor-pointer"
                                >
                                  <Wand2 className="w-2.5 h-2.5" />
                                  <span>Generate Template</span>
                                </button>
                                <span className="font-mono">{fetchedData.longDescription?.length || 0} chars</span>
                              </div>
                            </div>
                            <textarea
                              rows={4}
                              value={fetchedData.longDescription || ''}
                              onChange={(e) =>
                                setFetchedData({
                                  ...fetchedData,
                                  longDescription: e.target.value,
                                })
                              }
                              className="w-full text-xs text-purple-100 bg-slate-950 border border-purple-500/40 rounded-lg p-2.5 focus:border-purple-400 focus:outline-none font-mono"
                              placeholder="Detailed multi-paragraph sanctuary acoustic dossier..."
                            />
                          </div>
                        )}
                      </div>

                      {/* Partner & Original Link */}
                      <div className="text-[11px] text-slate-400 flex items-center justify-between pt-1">
                        <span>Partner: <strong className="text-slate-200">{fetchedData.partner}</strong></span>
                        <a
                          href={fetchedData.url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-sky-400 hover:text-sky-300 flex items-center gap-1 font-medium"
                        >
                          <span>Verify Original Link</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* ========================================================================= */
            /* MANUAL PRODUCT CREATOR FORM                                               */
            /* ========================================================================= */
            <form onSubmit={handleSaveManualProduct} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Product Title *</label>
                  <input
                    type="text"
                    required
                    value={manualName}
                    onChange={(e) => setManualName(e.target.value)}
                    placeholder="e.g. Certified 432Hz Quartz Crystal Singing Bowl (8-Inch F-Note)"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Brand / Artisan</label>
                  <input
                    type="text"
                    value={manualBrand}
                    onChange={(e) => setManualBrand(e.target.value)}
                    placeholder="e.g. Kathmandu Acoustic Guild"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Category</label>
                  <select
                    value={manualCategory}
                    onChange={(e) => setManualCategory(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-amber-400"
                  >
                    <option value="sound_healing">Sound Healing Instruments</option>
                    <option value="audio_headphones">Planar Headphones</option>
                    <option value="audio_speakers_dacs">Audiophile DACs &amp; Speakers</option>
                    <option value="incense_smudge">Sacred Incense &amp; Smudge</option>
                    <option value="atmosphere_altar">Atmosphere &amp; Altar</option>
                    <option value="ritual_bundles">Ritual Bundles</option>
                    <option value="apparel_fabrics">Mindful Fabrics &amp; Apparel</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Retail Price ($)</label>
                  <input
                    type="text"
                    value={manualPrice}
                    onChange={(e) => setManualPrice(e.target.value)}
                    placeholder="$89.00"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Affiliate Partner</label>
                  <input
                    type="text"
                    value={manualPartner}
                    onChange={(e) => setManualPartner(e.target.value)}
                    placeholder="Amazon Associates / Sweetwater"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Outbound Affiliate URL</label>
                <input
                  type="url"
                  value={manualUrl}
                  onChange={(e) => setManualUrl(e.target.value)}
                  placeholder="https://www.amazon.com/dp/.../?tag=aura432-20"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Spiritual / Acoustic Vibe</label>
                <input
                  type="text"
                  value={manualVibe}
                  onChange={(e) => setManualVibe(e.target.value)}
                  placeholder="e.g. Heart Chakra Opening, Grounding &amp; Stress Dissolution"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Description</label>
                <textarea
                  rows={2}
                  value={manualDescription}
                  onChange={(e) => setManualDescription(e.target.value)}
                  placeholder="Detailed description of the product craftsmanship and sonic properties..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Why Selected for Sanctuary</label>
                <textarea
                  rows={2}
                  value={manualWhy}
                  onChange={(e) => setManualWhy(e.target.value)}
                  placeholder="Why this item specifically benefits sound meditation or alpha brainwave entrainment..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Key Pros (Comma-Separated)</label>
                <input
                  type="text"
                  value={manualPros}
                  onChange={(e) => setManualPros(e.target.value)}
                  placeholder="Acoustic clarity, Sustainable natural deadwood, Easy to ignite"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold shadow-md shadow-amber-400/20 flex items-center gap-1.5 cursor-pointer active:scale-95"
                >
                  <Check className="w-4 h-4 text-slate-950" />
                  <span>Publish Product to Shop</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
