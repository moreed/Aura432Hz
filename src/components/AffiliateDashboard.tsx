import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  ShoppingBag,
  ExternalLink,
  Search,
  Filter,
  Plus,
  Trash2,
  Edit3,
  Check,
  Sparkles,
  Star,
  Copy,
  TrendingUp,
  DollarSign,
  Layers,
  ArrowRight,
  Eye,
  CheckCircle2,
  RefreshCw,
  AlertCircle,
  Tag,
  MessageSquare,
  Image as ImageIcon,
  Flame,
  Bell,
  Shirt,
  Headphones,
  Sliders,
} from 'lucide-react';
import { affiliateStorage, AffiliateProduct } from '../services/affiliateStorage';
import { FetchedProductData } from '../server/metadataFetcher';
import { stagingStorage } from '../services/stagingStorage';
import { ShopAddProductModal } from './ShopAddProductModal';

const SAMPLE_FETCH_PRESETS = [
  {
    label: '432Hz Quartz Crystal Singing Bowl Set',
    url: 'https://www.amazon.com/dp/B08XYZ432B/432hz-frosted-quartz-crystal-singing-bowl-set',
    partner: 'Amazon Associates',
  },
  {
    label: 'Sennheiser HD650 Reference Audiophile Headphones',
    url: 'https://www.sweetwater.com/store/detail/HD650--sennheiser-hd-650-open-back-audiophile-headphones',
    partner: 'Sweetwater / Direct',
  },
  {
    label: 'Koshi Bamboo Wind Chimes (Aria 432Hz)',
    url: 'https://www.thomann.de/intl/koshi_chime_aria_432hz.htm',
    partner: 'Thomann Music',
  },
  {
    label: 'GOTS Organic Cotton Cymatics 432Hz T-Shirt',
    url: 'https://aura432hz.com/gear',
    partner: 'Sanctuary Apparel',
  },
];

export const AffiliateDashboard: React.FC = () => {
  const [products, setProducts] = useState<AffiliateProduct[]>(() => affiliateStorage.getProducts());
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [partnerFilter, setPartnerFilter] = useState<string>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Link Fetcher Tool State
  const [fetchUrl, setFetchUrl] = useState('');
  const [isFetching, setIsFetching] = useState(false);
  const [fetchedData, setFetchedData] = useState<FetchedProductData | null>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [activePhotoIdx, setActivePhotoIdx] = useState(0);

  // Edit / Manual Modal State
  const [editingProduct, setEditingProduct] = useState<AffiliateProduct | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<AffiliateProduct | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  useEffect(() => {
    const unsub = affiliateStorage.subscribe((updated) => {
      setProducts(updated);
    });
    return unsub;
  }, []);

  const totalClicks = products.reduce((acc, p) => acc + (p.clicksCount || 0), 0);
  const activeProducts = products.filter((p) => p.status === 'active');
  const partners = Array.from(new Set(products.map((p) => p.affiliatePartner || 'Direct Partner')));

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      searchQuery.trim() === '' ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || p.category === categoryFilter;
    const matchesPartner = partnerFilter === 'all' || p.affiliatePartner === partnerFilter;
    return matchesSearch && matchesCategory && matchesPartner;
  });

  const handleFetchLink = async (urlToFetch: string) => {
    const target = urlToFetch.trim();
    if (!target) return;

    setIsFetching(true);
    setFetchError(null);
    setFetchedData(null);

    try {
      const data = await affiliateStorage.fetchProductFromUrl(target);
      setFetchedData(data);
      setActivePhotoIdx(0);
      setSuccessToast(`Successfully extracted metadata for: "${data.title.slice(0, 32)}..."`);
      setTimeout(() => setSuccessToast(null), 4000);
    } catch (err: any) {
      setFetchError(err?.message || 'Could not fetch external link metadata');
    } finally {
      setIsFetching(false);
    }
  };

  const handleImportFetched = () => {
    if (!fetchedData) return;

    const newProduct: AffiliateProduct = {
      id: `affiliate-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      name: fetchedData.title,
      brand: fetchedData.partner.split(' ')[0] + ' Sanctuary Collection',
      category:
        fetchedData.category === 'apparel_fabrics'
          ? 'apparel_fabrics'
          : fetchedData.category === 'audio_gears'
          ? 'audio_headphones'
          : 'sound_healing',
      price: fetchedData.price,
      priceEstimate: parseFloat(fetchedData.price.replace(/[^0-9.]/g, '')) || 79,
      rating: fetchedData.rating,
      reviewCount: fetchedData.reviewsCount,
      badge: fetchedData.badge || '★ Harmonic Verified',
      commissionBadge: 'Partner Affiliate (4-8% Commission)',
      affiliatePartner: fetchedData.partner,
      affiliateUrl: fetchedData.url,
      spiritualVibe: 'Harmonic 432Hz Acoustic Alignment',
      description: fetchedData.description,
      whyForSanctuary:
        'Ethically sourced acoustic tool evaluated for sound meditation, harmonic overtone clarity, and nervous system calm.',
      specifications: [
        { label: 'Harmonic Alignment', value: 'Tested for 432Hz Pythagorean compatibility' },
        { label: 'Craftsmanship', value: 'Hand-inspected acoustic resonance materials' },
      ],
      pros: fetchedData.pros || [
        'Acoustically certified for 432Hz overtone resonance',
        'Verified reviews from sound practitioners',
      ],
      gradient: 'from-sky-950/80 via-slate-900 to-indigo-950/70',
      iconType: fetchedData.category === 'apparel_fabrics' ? 'shirt' : 'bowl',
      soundDemoType: 'bowl',
      photos: fetchedData.photos,
      sampleReviews: fetchedData.sampleReviews,
      clicksCount: 0,
      dateAdded: new Date().toISOString(),
      status: 'active',
    };

    affiliateStorage.saveProduct(newProduct);
    setFetchedData(null);
    setFetchUrl('');
    setSuccessToast(`Published "${newProduct.name}" to Sanctuary Shop!`);
    setTimeout(() => setSuccessToast(null), 4000);
  };

  const handleStageProductInQueue = () => {
    if (!fetchedData) return;
    stagingStorage.addStagedDraft({
      destination: 'shop',
      sourceUrl: fetchedData.url,
      productData: fetchedData,
      editorialNotes: `Fetched from ${fetchedData.partner || 'Affiliate Partner'}.`,
    });
    setFetchedData(null);
    setFetchUrl('');
    setSuccessToast(`Staged "${fetchedData.title}" in Draft Queue for admin review!`);
    setTimeout(() => setSuccessToast(null), 4000);
  };

  const handleCopyLink = (p: AffiliateProduct) => {
    navigator.clipboard.writeText(p.affiliateUrl);
    setCopiedId(p.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDelete = (p: AffiliateProduct) => {
    setProductToDelete(p);
  };

  const confirmDelete = () => {
    if (!productToDelete) return;
    const { id, name } = productToDelete;
    affiliateStorage.deleteProduct(id);
    setProducts(affiliateStorage.getProducts());
    setSuccessToast(`Removed "${name}" from affiliate catalog.`);
    setTimeout(() => setSuccessToast(null), 3500);
    setProductToDelete(null);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Toast Notice */}
      {successToast && (
        <div className="p-3 bg-emerald-500/20 border border-emerald-400 text-emerald-200 rounded-xl text-xs flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{successToast}</span>
          </div>
          <button
            type="button"
            onClick={() => setSuccessToast(null)}
            className="w-6 h-6 rounded-md text-emerald-300 hover:text-white inline-flex items-center justify-center cursor-pointer"
            aria-label="Dismiss notification"
          >
            ✕
          </button>
        </div>
      )}

      {/* Overview KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-sky-500/20 text-sky-300 flex items-center justify-center shrink-0">
            <ShoppingBag className="w-5 h-5 text-sky-400" />
          </div>
          <div>
            <div className="text-xl font-bold text-white font-mono">{activeProducts.length}</div>
            <div className="text-xs text-slate-400">Active Products</div>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center shrink-0">
            <TrendingUp className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <div className="text-xl font-bold text-white font-mono">{totalClicks.toLocaleString()}</div>
            <div className="text-xs text-slate-400">Outbound Clicks</div>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-300 flex items-center justify-center shrink-0">
            <DollarSign className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <div className="text-xl font-bold text-white font-mono">${(totalClicks * 0.42).toFixed(2)}</div>
            <div className="text-xs text-slate-400">Est. Commission Pipeline</div>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center shrink-0">
            <Tag className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <div className="text-xl font-bold text-white font-mono">{partners.length}</div>
            <div className="text-xs text-slate-400">Affiliate Networks</div>
          </div>
        </div>
      </div>

      {/* EXTERNAL LINK FETCHER TOOL (HERO) */}
      <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950/40 to-slate-950 border border-indigo-500/30 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 mb-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-sky-500/20 border border-sky-400/40 text-sky-200 text-[11px] font-bold uppercase tracking-wider mb-1.5">
              <Sparkles className="w-3.5 h-3.5 text-sky-400" />
              <span>Tool: Add New Products to Shop via URL Auto-Fetcher</span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
              Auto-Extract Photos, Title, Description, Price, Reviews &amp; Specifications
            </h2>
            <p className="text-xs text-slate-300 max-w-2xl mt-0.5">
              Paste any product URL from Amazon, Thomann, Sweetwater, Etsy, or specialty sound stores. The system auto-extracts high-res photo galleries, customer reviews, prices, and specifications for 1-click publishing to the Sanctuary Shop.
            </p>
          </div>
        </div>

        {/* 3-Step Workflow Banner */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 mb-4 text-xs">
          <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-sky-500/20 border border-sky-400/50 text-sky-300 flex items-center justify-center font-bold text-[11px] shrink-0">1</span>
            <div>
              <div className="font-semibold text-slate-200">Paste Product Link</div>
              <div className="text-[10px] text-slate-400">Amazon, Thomann, Sweetwater, Etsy</div>
            </div>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-indigo-500/20 border border-indigo-400/50 text-indigo-300 flex items-center justify-center font-bold text-[11px] shrink-0">2</span>
            <div>
              <div className="font-semibold text-slate-200">Auto-Extract Details</div>
              <div className="text-[10px] text-slate-400">Pulls title, price, photos, and ratings</div>
            </div>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-emerald-500/20 border border-emerald-400/50 text-emerald-300 flex items-center justify-center font-bold text-[11px] shrink-0">3</span>
            <div>
              <div className="font-semibold text-slate-200">1-Click Publish</div>
              <div className="text-[10px] text-slate-400">Instantly live in Gear &amp; Sacred Shop</div>
            </div>
          </div>
        </div>

        {/* Input Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-1">
          <div className="relative flex-1">
            <input
              type="url"
              value={fetchUrl}
              onChange={(e) => setFetchUrl(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && fetchUrl.trim()) handleFetchLink(fetchUrl);
              }}
              placeholder="Paste external product link (e.g. https://www.amazon.com/dp/... or https://www.thomann.de/...)"
              className="w-full px-4 py-3 rounded-2xl bg-slate-950/80 border border-slate-700/80 text-white placeholder-slate-400 text-xs sm:text-sm focus:outline-none focus:border-sky-400 focus:ring-1 focus:ring-sky-400/50 shadow-inner"
            />
          </div>
          <button
            type="button"
            disabled={isFetching || !fetchUrl.trim()}
            onClick={() => handleFetchLink(fetchUrl)}
            className="px-6 py-3 rounded-2xl bg-gradient-to-r from-sky-400 to-indigo-500 hover:from-sky-300 hover:to-indigo-400 disabled:opacity-50 text-slate-950 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-sky-500/25 active:scale-95 cursor-pointer shrink-0"
          >
            {isFetching ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Fetching Metadata...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 fill-current" />
                <span>Fetch Product Data</span>
              </>
            )}
          </button>
        </div>

        {/* Quick Sample Presets for Instant 1-Click Testing */}
        <div className="mt-3 flex items-center gap-2 flex-wrap text-xs">
          <span className="text-slate-400 text-[11px] font-medium">Try 1-Click Samples:</span>
          {SAMPLE_FETCH_PRESETS.map((preset, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                setFetchUrl(preset.url);
                handleFetchLink(preset.url);
              }}
              className="px-2.5 py-1 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-[11px] transition-all flex items-center gap-1 cursor-pointer active:scale-95"
            >
              <span>{preset.label}</span>
              <span className="text-[10px] text-sky-400 font-mono">({preset.partner.split(' ')[0]})</span>
            </button>
          ))}
        </div>

        {/* Error Notice */}
        {fetchError && (
          <div className="mt-3 p-3 rounded-xl bg-rose-500/20 border border-rose-400/40 text-rose-200 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{fetchError}</span>
          </div>
        )}

        {/* FETCHED PRODUCT LIVE PREVIEW CARD */}
        {fetchedData && (
          <div className="mt-5 p-4 sm:p-5 rounded-2xl bg-slate-950/90 border border-sky-400/50 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  Extracted Product Preview
                </span>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
                  {fetchedData.partner}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={handleStageProductInQueue}
                  className="min-h-[36px] px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs inline-flex items-center justify-center gap-1.5 whitespace-nowrap transition-all shadow-md active:scale-95 cursor-pointer"
                >
                  <Layers className="w-3.5 h-3.5 text-indigo-300" />
                  <span>Stage in Draft Queue</span>
                </button>
                <button
                  type="button"
                  onClick={handleImportFetched}
                  className="min-h-[36px] px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs inline-flex items-center justify-center gap-1.5 whitespace-nowrap transition-all shadow-md active:scale-95 cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>Publish to Sanctuary Shop</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
              {/* Photo Carousel & Gallery */}
              <div className="md:col-span-4 space-y-2">
                <div className="aspect-square rounded-2xl overflow-hidden bg-slate-900 border border-slate-800 relative">
                  <img
                    src={fetchedData.photos[activePhotoIdx] || fetchedData.image}
                    alt={fetchedData.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-slate-950/80 backdrop-blur-md text-[10px] text-amber-300 font-bold border border-slate-700">
                    {fetchedData.badge}
                  </div>
                </div>

                {fetchedData.photos.length > 1 && (
                  <div className="flex flex-wrap items-center gap-1.5 pb-1">
                    {fetchedData.photos.map((photo, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setActivePhotoIdx(i)}
                        className={`w-12 h-12 rounded-lg overflow-hidden border transition-all shrink-0 ${
                          activePhotoIdx === i ? 'border-sky-400 ring-2 ring-sky-400/50' : 'border-slate-800 opacity-60'
                        }`}
                      >
                        <img src={photo} alt="" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Product Details Form & Review Quotes */}
              <div className="md:col-span-8 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-white leading-snug">
                      {fetchedData.title}
                    </h3>
                    <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
                      <div className="flex items-center text-amber-400 gap-1 font-bold">
                        <Star className="w-3.5 h-3.5 fill-current" />
                        <span>{fetchedData.rating}</span>
                      </div>
                      <span>•</span>
                      <span>{fetchedData.reviewsCount.toLocaleString()} Verified Reviews</span>
                      <span>•</span>
                      <span className="text-emerald-400 font-semibold font-mono text-sm">
                        {fetchedData.price}
                      </span>
                    </div>
                  </div>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed bg-slate-900/60 p-3 rounded-xl border border-slate-850">
                  {fetchedData.description}
                </p>

                {/* Verified Customer Reviews */}
                {fetchedData.sampleReviews.length > 0 && (
                  <div className="space-y-1.5">
                    <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                      <MessageSquare className="w-3 h-3 text-sky-400" />
                      <span>Extracted Customer Reviews</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {fetchedData.sampleReviews.map((rev, idx) => (
                        <div key={idx} className="p-2.5 rounded-xl bg-slate-900/70 border border-slate-800 text-[11px] space-y-1">
                          <div className="flex items-center justify-between text-slate-300">
                            <span className="font-semibold">{rev.author}</span>
                            <div className="flex items-center text-amber-400">
                              {'★'.repeat(Math.round(rev.rating))}
                            </div>
                          </div>
                          <p className="text-slate-400 italic">"{rev.text}"</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Pros List */}
                <div className="flex items-center gap-2 flex-wrap pt-1">
                  {fetchedData.pros.map((pro, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded-lg bg-sky-500/15 border border-sky-400/30 text-sky-300 text-[11px]"
                    >
                      ✓ {pro}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* CATALOG SEARCH & CONTROLS */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-1 max-w-md">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products by title, partner or tags..."
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white placeholder-slate-400 text-xs focus:outline-none focus:border-sky-400"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 text-xs focus:outline-none focus:border-sky-400 cursor-pointer"
          >
            <option value="all">All Categories</option>
            <option value="apparel_fabrics">Mindful Fabrics & Apparel</option>
            <option value="sound_healing">Singing Bowls & Tuning Forks</option>
            <option value="audio_headphones">Audiophile Headphones</option>
            <option value="audio_speakers_dacs">Acoustic DACs & Transducers</option>
            <option value="incense_smudge">Sacred Incense & Resins</option>
            <option value="atmosphere_altar">Atmosphere & Salt Lamps</option>
          </select>

          <select
            value={partnerFilter}
            onChange={(e) => setPartnerFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 text-xs focus:outline-none focus:border-sky-400 cursor-pointer"
          >
            <option value="all">All Partners</option>
            {partners.map((pt) => (
              <option key={pt} value={pt}>{pt}</option>
            ))}
          </select>

          <button
            type="button"
            onClick={() => {
              if (window.confirm('Reset catalog back to curated defaults?')) {
                affiliateStorage.resetToDefaults();
              }
            }}
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800 transition-colors text-xs"
            title="Reset to initial products"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* PRODUCT GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredProducts.map((prod) => {
          const isCopied = copiedId === prod.id;
          return (
            <div
              key={prod.id}
              className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 flex flex-col justify-between gap-3 shadow-md hover:border-slate-700 transition-all group"
            >
              <div className="space-y-2.5">
                <div className="flex items-start justify-between gap-2">
                  <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 text-[10px] font-medium border border-slate-700">
                    <span>{prod.brand}</span>
                    <span>•</span>
                    <span className="text-sky-300">{prod.affiliatePartner}</span>
                  </div>
                  <span className="text-emerald-400 font-mono font-bold text-sm">
                    {prod.price}
                  </span>
                </div>

                <h4 className="text-sm font-bold text-white group-hover:text-sky-300 transition-colors line-clamp-2">
                  {prod.name}
                </h4>

                <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                  {prod.description}
                </p>

                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-850">
                  <div className="flex items-center gap-1 text-amber-400 font-semibold">
                    <Star className="w-3.5 h-3.5 fill-current" />
                    <span>{prod.rating}</span>
                    <span className="text-slate-500 font-normal">({prod.reviewCount})</span>
                  </div>
                  <div className="flex items-center gap-1 text-slate-300">
                    <TrendingUp className="w-3.5 h-3.5 text-sky-400" />
                    <span>{prod.clicksCount || 0} clicks</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => handleCopyLink(prod)}
                  className={`flex-1 py-1.5 px-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    isCopied
                      ? 'bg-emerald-500/20 border-emerald-400 text-emerald-200'
                      : 'bg-slate-800/80 hover:bg-slate-750 border-slate-700 text-slate-300 hover:text-white'
                  }`}
                  title="Copy direct affiliate tracking link"
                >
                  {isCopied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Link</span>
                    </>
                  )}
                </button>

                <a
                  href={prod.affiliateUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => affiliateStorage.recordClick(prod.id)}
                  className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-sky-300 transition-colors"
                  title="Test link externally"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>

                {/* Edit Product Button */}
                <button
                  type="button"
                  onClick={() => {
                    setEditingProduct(prod);
                    setIsEditModalOpen(true);
                  }}
                  className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-amber-400 text-slate-300 hover:text-amber-300 transition-colors cursor-pointer"
                  title="Edit product details"
                >
                  <Edit3 className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={() => handleDelete(prod)}
                  className="p-1.5 rounded-xl bg-slate-800 hover:bg-rose-950/60 border border-slate-700 hover:border-rose-500 text-slate-400 hover:text-rose-300 transition-colors cursor-pointer"
                  title="Delete from catalog"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Edit Product Modal */}
      <ShopAddProductModal
        isOpen={isEditModalOpen}
        editingProduct={editingProduct}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingProduct(null);
        }}
        onProductAdded={() => {
          setProducts(affiliateStorage.getProducts());
        }}
      />

      {/* Delete Confirmation Modal */}
      {productToDelete &&
        createPortal(
          <div
            role="dialog"
            aria-modal="true"
            className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto overscroll-contain animate-fade-in"
          >
            <div className="bg-slate-900 border border-rose-500/40 rounded-2xl sm:rounded-3xl p-4 sm:p-6 landscape:p-4 max-w-md w-full shadow-2xl space-y-3.5 sm:space-y-4 max-h-[92dvh] landscape:max-h-[94dvh] overflow-y-auto overscroll-contain my-auto">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-rose-500/20 border border-rose-400/40 flex items-center justify-center text-rose-400 shrink-0">
                  <Trash2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Delete Product?</h3>
                  <p className="text-xs text-slate-400">Affiliate Catalog Management</p>
                </div>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Are you sure you want to remove <strong className="text-white">"{productToDelete.name}"</strong>? It will be deleted from the database and catalog.
              </p>
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setProductToDelete(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={confirmDelete}
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-colors cursor-pointer shadow-md shadow-rose-900/40"
                >
                  Yes, Delete Product
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
};
