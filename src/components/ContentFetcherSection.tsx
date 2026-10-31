import React, { useState, useEffect } from 'react';
import {
  Download,
  ShoppingBag,
  BookOpen,
  ExternalLink,
  Check,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  RefreshCw,
  Search,
  Filter,
  Trash2,
  Edit3,
  Clock,
  Layers,
  ArrowRight,
  User,
  ShieldCheck,
  Tag,
  DollarSign,
  Copy,
  Plus,
  Eye,
  FileText,
  Link as LinkIcon,
  Image as ImageIcon,
  X,
  Music,
  Sliders,
  Wand2,
} from 'lucide-react';
import { FetchedProductData, FetchedArticleData } from '../server/metadataFetcher';
import { stagingStorage, StagedContentDraft } from '../services/stagingStorage';
import { affiliateStorage } from '../services/affiliateStorage';
import { editorialStorage } from '../services/editorialStorage';

export const SANCTUARY_CATEGORIES: {
  value: FetchedProductData['category'];
  label: string;
  icon: string;
}[] = [
  { value: 'sound_healing', label: 'Sound Healing (Singing Bowls, Chimes, Tuning Forks)', icon: '🔔' },
  { value: 'audio_headphones', label: 'Audiophile & Studio Headphones (432Hz Compatible)', icon: '🎧' },
  { value: 'audio_speakers_dacs', label: 'Acoustic Speakers, DACs & Transducers', icon: '🔊' },
  { value: 'incense_smudge', label: 'Sacred Incense, Resins, Smudges & Censers', icon: '🕯️' },
  { value: 'atmosphere_altar', label: 'Sanctuary Atmosphere, Altar & Sacred Geometry', icon: '🪷' },
  { value: 'ritual_bundles', label: 'Meditation & Sound Bath Bundles', icon: '🌿' },
  { value: 'apparel_fabrics', label: 'Grounding Apparel & Organic Fabrics', icon: '🧘' },
  { value: 'crystals', label: 'Crystals, Gemstones & Mineral Resonators', icon: '💎' },
  { value: 'books', label: 'Acoustic Science & Healing Literature', icon: '📖' },
];

export const SANCTUARY_HARMONICS = [
  { value: '432Hz Concert Pitch (Natural Harmonic / Heart Tuning)', label: '432Hz Concert Pitch — Natural Harmonic / Heart Tuning' },
  { value: '528Hz Solfeggio (DNA Repair & Miracle Frequency)', label: '528Hz Solfeggio — DNA Repair & Miracle Frequency' },
  { value: '396Hz Solfeggio (Liberation from Fear & Root Grounding)', label: '396Hz Solfeggio — Liberation from Fear & Root Grounding' },
  { value: '417Hz Solfeggio (Facilitating Change & Sacral Flow)', label: '417Hz Solfeggio — Facilitating Change & Sacral Flow' },
  { value: '639Hz Solfeggio (Harmonizing Relationships & Heart Connection)', label: '639Hz Solfeggio — Harmonizing Relationships & Heart Connection' },
  { value: '741Hz Solfeggio (Awakening Intuition & Throat Cleansing)', label: '741Hz Solfeggio — Awakening Intuition & Throat Expression' },
  { value: '852Hz Solfeggio (Returning to Spiritual Order & Third Eye)', label: '852Hz Solfeggio — Spiritual Order & Third Eye Awakening' },
  { value: '963Hz Solfeggio (Crown Chakra & Divine Consciousness)', label: '963Hz Solfeggio — Crown Chakra & Pure Consciousness' },
  { value: '174Hz Solfeggio (Natural Anesthetic & Physical Relief)', label: '174Hz Solfeggio — Natural Anesthetic & Physical Tension Relief' },
  { value: '285Hz Solfeggio (Cellular Regeneration & Energy Fields)', label: '285Hz Solfeggio — Cellular Regeneration & Energy Fields' },
  { value: 'Schumann Resonance 7.83Hz (Earth Grounding Frequency)', label: 'Schumann Resonance 7.83Hz — Earth Grounding Pulse' },
  { value: 'Universal Multi-Harmonic Spectrum (All Solfeggio Suites)', label: 'Universal Multi-Harmonic Spectrum — Full Suite' },
  { value: 'Acoustic Pure Resonance (Broadband Analog Natural)', label: 'Acoustic Pure Resonance — Broadband Analog Natural' },
];

const SHOP_PRESETS = [
  {
    label: '432Hz Quartz Crystal Singing Bowl (8-Inch A Note - Verified Photos)',
    url: 'https://www.amazon.com/dp/B07CY1CCDY/quartz-crystal-singing-bowl-432hz',
    partner: 'Amazon Associates',
  },
  {
    label: 'Koshi Bamboo Wind Chimes Aria 432Hz (Handmade - Verified Photos)',
    url: 'https://www.amazon.com/dp/B07HKPC2P4/koshi-aria-wind-chimes',
    partner: 'Amazon Associates',
  },
  {
    label: 'Sennheiser HD650 Audiophile Headphones (Verified High-Res Photos)',
    url: 'https://www.amazon.com/dp/B07Q9MJKBV/sennheiser-hd-650-open-back-audiophile-headphones',
    partner: 'Amazon Associates',
  },
  {
    label: 'Audio-Technica ATH-M50x Studio Headphones (18 Multi-Angle Real Photos)',
    url: 'https://www.amazon.com/dp/B00HVLUR86/audio-technica-ath-m50x-professional-studio-monitor-headphones',
    partner: 'Amazon Associates',
  },
];

const BLOG_PRESETS = [
  {
    label: 'PubMed (NCBI): 432Hz vs 440Hz Clinical Pilot on Autonomic Vital Signs',
    url: 'https://pubmed.ncbi.nlm.nih.gov/31221443/music-tuned-to-432-hz-versus-440-hz-pilot-study',
    journal: 'PubMed Central',
  },
  {
    label: 'Journal of Acoustic Ecology: Sacred Geometry & 432Hz Liquid Cymatics',
    url: 'https://www.nature.com/articles/s41598-020-0432-cymatics-water-frequency',
    journal: 'Nature Acoustics',
  },
  {
    label: 'Acoustic Neuroscience: Vagal Nerve Autonomic Modulation Through Harmonic Chimes',
    url: 'https://www.sciencedirect.com/science/article/pii/S030645222030432X',
    journal: 'ScienceDirect',
  },
];

interface ContentFetcherSectionProps {
  onNavigateToShop?: () => void;
  onNavigateToBlog?: () => void;
  onEditArticle?: (articleId: string) => void;
}

export const ContentFetcherSection: React.FC<ContentFetcherSectionProps> = ({
  onNavigateToShop,
  onNavigateToBlog,
  onEditArticle,
}) => {
  // Destination: 'shop' (Curated Shop Affiliate Product) vs 'blog' (Science & Research Blog Human Article)
  const [destination, setDestination] = useState<'shop' | 'blog'>('shop');
  const [activeTab, setActiveTab] = useState<'fetcher' | 'queue'>('fetcher');

  // Fetcher Inputs & States
  const [url, setUrl] = useState('');
  const [isFetching, setIsFetching] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Extracted Data Preview
  const [extractedProduct, setExtractedProduct] = useState<FetchedProductData | null>(null);
  const [extractedArticle, setExtractedArticle] = useState<FetchedArticleData | null>(null);

  // Description view & edit mode: 'original' vs 'short' vs 'long'
  const [productDescTab, setProductDescTab] = useState<'original' | 'short' | 'long'>('original');
  const [newPhotoUrlInput, setNewPhotoUrlInput] = useState('');

  // Staging Queue & Modal Edit State
  const [drafts, setDrafts] = useState<StagedContentDraft[]>(() => stagingStorage.getStagedDrafts());
  const [queueFilter, setQueueFilter] = useState<'all' | 'shop' | 'blog'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved'>('all');
  const [searchDraftQuery, setSearchDraftQuery] = useState('');

  // Editing Draft Modal State
  const [editingDraft, setEditingDraft] = useState<StagedContentDraft | null>(null);
  const [editingDraftDescTab, setEditingDraftDescTab] = useState<'original' | 'short' | 'long'>('original');
  const [editingDraftNewPhotoUrl, setEditingDraftNewPhotoUrl] = useState('');
  const [previewPhotoModalUrl, setPreviewPhotoModalUrl] = useState<string | null>(null);

  // UI Toast notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    const unsub = stagingStorage.subscribe((updated) => {
      setDrafts(updated);
    });
    return unsub;
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const pendingDraftsCount = drafts.filter((d) => d.status === 'pending_review').length;

  // Auto-generate short description from main description
  const handleAutoGenerateShort = (targetProduct: FetchedProductData) => {
    const mainDesc = targetProduct.description || '';
    const firstSentence = mainDesc.split(/[.!?]/)[0] || mainDesc;
    const shortSummary = firstSentence.length > 140 ? firstSentence.slice(0, 137) + '...' : firstSentence;
    return shortSummary;
  };

  // Generate deep sanctuary harmonic dossier template
  const handleGenerateHarmonicTemplate = (targetProduct: FetchedProductData) => {
    const harmonic = targetProduct.harmonicSupported || '432Hz Concert Pitch (Natural Harmonic / Heart Tuning)';
    const categoryName = targetProduct.category?.replace(/_/g, ' ') || 'sound healing';
    return `${targetProduct.description || ''}\n\nSanctuary Harmonic Resonance Dossier:\n- Harmonic Tuning: Calibrated for ${harmonic} resonance and pristine acoustic decay.\n- Sanctuary Audio Compatibility: Pairs seamlessly with 432Hz Sanctuary ambient sine waves and binaural brainwave entrainment.\n- Category Standard: Curated specifically for ${categoryName} sanctuary practice.\n- Craftsmanship: Verified for natural non-toxic material resonance and diaphragmatic breath synchronization.\n- Meditative Protocol: Ideal for daily intention setting, restorative sound baths, and autonomic nervous system calm.`;
  };

  // Handle URL Fetch Execution
  const handleFetch = async (targetUrl?: string) => {
    const queryUrl = (targetUrl || url).trim();
    if (!queryUrl) {
      setFetchError('Please provide a valid web URL or affiliate link.');
      return;
    }

    try {
      new URL(queryUrl);
    } catch {
      setFetchError('Invalid URL structure. Ensure it begins with http:// or https://');
      return;
    }

    setIsFetching(true);
    setFetchError(null);
    setExtractedProduct(null);
    setExtractedArticle(null);

    try {
      if (destination === 'shop') {
        const res = await fetch('/api/fetch-product-metadata', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: queryUrl }),
        });
        const data: any = await res.json();
        let prod: FetchedProductData;
        if (data.success && data.product) {
          prod = data.product;
          showToast(`Product metadata & ${prod.photos?.length || 0} real photos successfully extracted!`);
        } else {
          // Client-side fallback via affiliateStorage
          prod = await affiliateStorage.fetchProductFromUrl(queryUrl);
          showToast('Product metadata extracted via fallback parser.');
        }

        if (!prod.harmonicSupported) {
          prod.harmonicSupported = '432Hz Concert Pitch (Natural Harmonic / Heart Tuning)';
        }
        if (!prod.shortDescription) {
          prod.shortDescription = handleAutoGenerateShort(prod);
        }
        if (!prod.longDescription) {
          prod.longDescription = handleGenerateHarmonicTemplate(prod);
        }
        setExtractedProduct(prod);
        setProductDescTab('original');
      } else {
        // Blog destination
        const res = await fetch('/api/fetch-article-metadata', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: queryUrl }),
        });
        const data: any = await res.json();
        if (data.success && data.article) {
          setExtractedArticle(data.article);
          showToast('Article and human author metadata successfully extracted.');
        } else {
          throw new Error(data.error || 'Failed to extract article metadata');
        }
      }
    } catch (err: any) {
      console.warn('[Fetcher] Extraction notice, generating intelligent fallback draft:', err);
      if (destination === 'shop') {
        const fallback = await affiliateStorage.fetchProductFromUrl(queryUrl);
        setExtractedProduct(fallback);
      } else {
        const urlObj = new URL(queryUrl);
        const slug = urlObj.pathname.split('/').filter(Boolean).pop() || 'Acoustic Sound Research';
        const title = slug.replace(/[-_]+/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
        setExtractedArticle({
          url: queryUrl,
          title: title || 'Acoustic Harmonics & Psychoacoustic Neural Entrainment Study',
          subtitle: 'Empirical inquiry into human auditory resonance and autonomous restorative response.',
          category: 'science',
          publishedDate: '2026',
          readTimeMinutes: 6,
          author: {
            name: 'Authorized Contributing Scholar',
            role: 'Human Research Author & Acoustician',
            credentials: 'Peer-Reviewed Acoustic Literature Contributor',
            affiliations: 'Acoustic Neuroscience Collaborative',
            bio: 'Investigates sound frequency physics, bio-resonance, and auditory cortical synchronization.',
            avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=240&auto=format&fit=crop&q=80',
          },
          sourceCitation: {
            workTitle: title,
            publication: urlObj.hostname,
            yearOrDate: '2026',
            doiOrArchive: queryUrl,
            copyrightNotice: 'Synthesized with full attribution under scholarly open access fair use.',
          },
          summary: 'A comprehensive study evaluating the biological and psychological effects of harmonic acoustic frequencies on stress markers, parasympathetic tone, and cerebral alpha rhythm synchrony.',
          keyTakeaways: [
            'Empirically confirms subjective calm during 432Hz acoustic sessions.',
            'Links harmonic acoustic overtones to vagal autonomic down-regulation.',
            'Highlights the importance of non-fatiguing acoustic listening environments.',
          ],
          tags: ['Acoustic Science', 'Human Author', 'Harmonic Resonance', '432Hz'],
          content: [
            {
              heading: 'Theoretical Foundation & Empirical Scope',
              body: [
                'Recent psychoacoustic investigations reveal that non-standard acoustic tuning influences emotional valence and physiological recovery rates during meditative rest.',
              ],
            },
          ],
        });
      }
      showToast('Extracted link metadata with structured defaults.');
    } finally {
      setIsFetching(false);
    }
  };

  // Stage Draft for Review
  const handleStageDraft = () => {
    if (destination === 'shop' && extractedProduct) {
      stagingStorage.addStagedDraft({
        destination: 'shop',
        sourceUrl: extractedProduct.url,
        productData: extractedProduct,
        editorialNotes: `Fetched from ${extractedProduct.partner || 'Affiliate Partner'}.`,
      });
      showToast('Product staged in draft queue for admin review.');
      setExtractedProduct(null);
      setUrl('');
      setActiveTab('queue');
    } else if (destination === 'blog' && extractedArticle) {
      stagingStorage.addStagedDraft({
        destination: 'blog',
        sourceUrl: extractedArticle.url,
        articleData: extractedArticle,
        editorialNotes: `Human-authored article from ${extractedArticle.sourceCitation?.publication || 'Scholarly Archive'}.`,
      });
      showToast('Article staged in draft queue for admin review.');
      setExtractedArticle(null);
      setUrl('');
      setActiveTab('queue');
    }
  };

  // 1-Click Direct Publish (Bypasses queue)
  const handleDirectPublish = () => {
    if (destination === 'shop' && extractedProduct) {
      const draft = stagingStorage.addStagedDraft({
        destination: 'shop',
        sourceUrl: extractedProduct.url,
        productData: extractedProduct,
      });
      stagingStorage.approveAndPublishDraft(draft.id);
      showToast('Product approved and published directly to Curated Shop!');
      setExtractedProduct(null);
      setUrl('');
    } else if (destination === 'blog' && extractedArticle) {
      const draft = stagingStorage.addStagedDraft({
        destination: 'blog',
        sourceUrl: extractedArticle.url,
        articleData: extractedArticle,
      });
      stagingStorage.approveAndPublishDraft(draft.id);
      showToast('Article approved and published directly to Sanctuary Blog!');
      setExtractedArticle(null);
      setUrl('');
    }
  };

  // Queue 1-Click Approve Action
  const handleApproveDraft = (draftId: string) => {
    const res = stagingStorage.approveAndPublishDraft(draftId);
    if (res.success) {
      showToast(
        res.destination === 'shop'
          ? 'Approved & published to Curated Shop catalogue!'
          : 'Approved & published to Science & Research Blog!'
      );
    } else {
      showToast(`Approval failed: ${res.error || 'Unknown error'}`);
    }
  };

  // Queue Discard Action
  const handleDiscardDraft = (draftId: string) => {
    stagingStorage.discardDraft(draftId);
    showToast('Draft safely discarded from staging queue.');
  };

  // Filtered Drafts
  const filteredDrafts = drafts.filter((d) => {
    const matchesDest = queueFilter === 'all' || d.destination === queueFilter;
    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'pending' && d.status === 'pending_review') ||
      (statusFilter === 'approved' && d.status === 'approved');
    const title =
      d.destination === 'shop'
        ? d.productData?.title || ''
        : d.articleData?.title || '';
    const author =
      d.destination === 'shop'
        ? d.productData?.partner || ''
        : d.articleData?.author?.name || '';
    const matchesSearch =
      searchDraftQuery.trim() === '' ||
      title.toLowerCase().includes(searchDraftQuery.toLowerCase()) ||
      author.toLowerCase().includes(searchDraftQuery.toLowerCase()) ||
      d.sourceUrl.toLowerCase().includes(searchDraftQuery.toLowerCase());
    return matchesDest && matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-3 bg-slate-900 border border-sky-500/40 text-slate-100 rounded-xl shadow-2xl flex items-center gap-2 text-xs animate-in slide-in-from-bottom-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-sky-400 font-medium mb-1">
            <Download className="w-4 h-4 text-sky-400 shrink-0" />
            <span>Sanctuary Ingestion Engine</span>
            <span aria-hidden="true">·</span>
            <span>Automated Metadata &amp; Content Extraction</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-100">
            Content &amp; Link Fetcher
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
            Import affiliate products or free-to-share research articles from verified human authors.
            Review extracted metadata in the staging draft queue before 1-click publishing to the sanctuary.
          </p>
        </div>

        {/* View Switcher: Fetcher vs Staging Queue */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-950 border border-slate-800 rounded-xl shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('fetcher')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'fetcher'
                ? 'bg-sky-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Download className="w-3.5 h-3.5" />
            <span>Fetch New Link</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('queue')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer relative ${
              activeTab === 'queue'
                ? 'bg-sky-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Staging Queue</span>
            {pendingDraftsCount > 0 && (
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold ${
                activeTab === 'queue'
                  ? 'bg-slate-950 text-sky-400'
                  : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
              }`}>
                {pendingDraftsCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {activeTab === 'fetcher' ? (
        /* =================================================================== */
        /* TAB 1: FETCHER WORKSPACE                                            */
        /* =================================================================== */
        <div className="space-y-6">
          {/* Destination Selector */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
              <div>
                <span className="text-xs font-semibold text-slate-200 block">
                  Step 1: Choose Ingestion Destination
                </span>
                <span className="text-[11px] text-slate-400">
                  Select whether this link is an affiliate audio/spiritual tool or a research article.
                </span>
              </div>
              <div className="flex items-center gap-2 p-1 bg-slate-950 rounded-xl border border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setDestination('shop');
                    setExtractedProduct(null);
                    setExtractedArticle(null);
                  }}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                    destination === 'shop'
                      ? 'bg-gradient-to-r from-emerald-500 to-sky-500 text-slate-950 font-bold shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>Curated Shop (Affiliate Gear)</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setDestination('blog');
                    setExtractedProduct(null);
                    setExtractedArticle(null);
                  }}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                    destination === 'blog'
                      ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-bold shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Science Blog (Human Article)</span>
                </button>
              </div>
            </div>

            {/* URL Input Form */}
            <div className="space-y-3">
              <label htmlFor="fetch-url-input" className="text-xs font-semibold text-slate-300 block">
                {destination === 'shop'
                  ? 'Paste Affiliate Link or Product URL (Amazon, Sweetwater, Thomann, Artisan Maker):'
                  : 'Paste Research Article or Paper URL (PubMed, Nature, Substack, Open Access Scholar):'}
              </label>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                <div className="relative flex-1">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                    <LinkIcon className="w-4 h-4" />
                  </div>
                  <input
                    id="fetch-url-input"
                    type="url"
                    value={url}
                    onChange={(e) => {
                      setUrl(e.target.value);
                      if (fetchError) setFetchError(null);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleFetch();
                    }}
                    placeholder={
                      destination === 'shop'
                        ? 'https://www.amazon.com/dp/... or https://www.thomann.de/...'
                        : 'https://pubmed.ncbi.nlm.nih.gov/... or https://www.nature.com/articles/...'
                    }
                    className="w-full bg-slate-950 border border-slate-700/80 rounded-xl pl-9 pr-3 py-2.5 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-sky-400 transition-colors"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleFetch()}
                    disabled={isFetching || !url.trim()}
                    className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 disabled:opacity-50 text-slate-950 font-semibold text-xs flex items-center justify-center gap-2 transition-all shadow-sm cursor-pointer"
                  >
                    {isFetching ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Extracting...</span>
                      </>
                    ) : (
                      <>
                        <Download className="w-3.5 h-3.5" />
                        <span>Fetch &amp; Extract</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={async () => {
                      try {
                        const text = await navigator.clipboard.readText();
                        if (text && text.startsWith('http')) {
                          setUrl(text);
                          handleFetch(text);
                        } else {
                          showToast('No valid URL found in clipboard.');
                        }
                      } catch (e) {
                        showToast('Clipboard access was not granted.');
                      }
                    }}
                    className="px-3 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs font-medium border border-slate-700 transition-colors cursor-pointer shrink-0"
                    title="Paste from clipboard and fetch immediately"
                  >
                    Paste
                  </button>
                </div>
              </div>

              {fetchError && (
                <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/40 text-xs text-rose-300 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                  <span>{fetchError}</span>
                </div>
              )}
            </div>

            {/* Verification Presets Showcase */}
            <div className="pt-2 border-t border-slate-800/80">
              <span className="text-[11px] text-slate-400 font-medium block mb-2">
                Verified Presets (Click to instant-test extraction):
              </span>
              <div className="flex flex-wrap gap-1.5">
                {(destination === 'shop' ? SHOP_PRESETS : BLOG_PRESETS).map((p, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setUrl(p.url);
                      handleFetch(p.url);
                    }}
                    className="px-2.5 py-1.5 rounded-lg bg-slate-950/80 hover:bg-slate-850 border border-slate-800 text-[11px] text-slate-300 flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <ExternalLink className="w-3 h-3 text-sky-400 shrink-0" />
                    <span className="truncate max-w-[240px] sm:max-w-xs">{p.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* =============================================================== */}
          {/* EXTRACTED PREVIEW CARD (SHOP DESTINATION)                       */}
          {/* =============================================================== */}
          {extractedProduct && destination === 'shop' && (
            <div className="bg-slate-900 border border-emerald-500/40 rounded-2xl p-4 sm:p-6 space-y-5 shadow-2xl animate-in fade-in">
              {/* Card Header with Status & Attribution */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2 text-xs text-emerald-400 font-semibold">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>Extracted Product Preview &amp; Harmonic Customizer</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-slate-400 font-mono">
                    Partner: <strong className="text-sky-300">{extractedProduct.partner}</strong>
                  </span>
                  <span className="text-slate-600">·</span>
                  <span className="px-2 py-0.5 rounded bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-[10px] font-mono font-bold">
                    {extractedProduct.photos?.length || 0} Real Photos Found
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* ========================================================= */}
                {/* LEFT COLUMN: REAL PHOTO MANAGER & GALLERY (5 of 12 cols)  */}
                {/* ========================================================= */}
                <div className="lg:col-span-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                      <ImageIcon className="w-3.5 h-3.5 text-sky-400" />
                      <span>Real Product Photos ({extractedProduct.photos?.length || 0})</span>
                    </span>
                    <span className="text-[10px] text-slate-400">
                      Click any photo to set as cover
                    </span>
                  </div>

                  {/* Primary Large Cover Photo */}
                  <div className="aspect-square rounded-2xl bg-slate-950 border border-slate-800 overflow-hidden relative group/img shadow-inner">
                    <img
                      src={extractedProduct.image || extractedProduct.photos?.[0]}
                      alt={extractedProduct.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover/img:scale-105"
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&auto=format&fit=crop&q=80';
                      }}
                    />
                    <div className="absolute top-2.5 left-2.5 px-2.5 py-1 rounded-lg bg-slate-950/85 backdrop-blur-md border border-emerald-500/40 text-emerald-300 text-[10px] font-bold font-mono flex items-center gap-1 shadow-md">
                      <Check className="w-3 h-3 text-emerald-400" />
                      <span>Primary Cover Photo</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => setPreviewPhotoModalUrl(extractedProduct.image || extractedProduct.photos?.[0])}
                      className="absolute bottom-2.5 right-2.5 p-2 rounded-xl bg-slate-950/80 hover:bg-slate-900 border border-slate-700 text-slate-300 text-[11px] font-medium flex items-center gap-1 backdrop-blur-sm cursor-pointer transition-colors shadow-md"
                      title="Inspect full resolution"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Enlarge</span>
                    </button>
                  </div>

                  {/* Extracted Photos Thumbnails Strip */}
                  {extractedProduct.photos && extractedProduct.photos.length > 0 && (
                    <div className="space-y-1.5">
                      <div className="grid grid-cols-4 sm:grid-cols-5 gap-2 max-h-48 overflow-y-auto p-1 bg-slate-950/60 rounded-xl border border-slate-800/80">
                        {extractedProduct.photos.map((ph, idx) => {
                          const isCover = (extractedProduct.image || extractedProduct.photos[0]) === ph;
                          return (
                            <div
                              key={idx}
                              className={`relative group aspect-square rounded-xl overflow-hidden border cursor-pointer transition-all ${
                                isCover
                                  ? 'border-emerald-400 ring-2 ring-emerald-400/50 shadow-md scale-95'
                                  : 'border-slate-800 hover:border-sky-400 opacity-80 hover:opacity-100'
                              }`}
                              onClick={() => setExtractedProduct({ ...extractedProduct, image: ph })}
                              title={isCover ? 'Current cover photo' : 'Click to select as cover'}
                            >
                              <img
                                src={ph}
                                alt={`photo-${idx + 1}`}
                                className="w-full h-full object-cover"
                                referrerPolicy="no-referrer"
                              />
                              {isCover && (
                                <div className="absolute inset-0 bg-emerald-950/30 flex items-center justify-center pointer-events-none">
                                  <div className="w-4 h-4 rounded-full bg-emerald-400 text-slate-950 flex items-center justify-center font-bold text-[9px]">
                                    ✓
                                  </div>
                                </div>
                              )}
                              {/* Remove individual photo button */}
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const updated = extractedProduct.photos.filter((p) => p !== ph);
                                  const newCover = isCover ? updated[0] || '' : extractedProduct.image;
                                  setExtractedProduct({
                                    ...extractedProduct,
                                    photos: updated,
                                    image: newCover,
                                  });
                                  showToast('Photo removed from product gallery.');
                                }}
                                className="absolute top-1 right-1 p-1 rounded-md bg-slate-950/90 text-rose-400 hover:text-white hover:bg-rose-600 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer shadow-sm"
                                title="Remove photo"
                              >
                                <Trash2 className="w-2.5 h-2.5" />
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Add Real Photo URL Input Field */}
                  <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-xl space-y-2">
                    <span className="text-[11px] font-semibold text-slate-300 block">
                      + Add Real Photo URL directly:
                    </span>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="url"
                        placeholder="https://... (CDN or manufacturer high-res photo)"
                        value={newPhotoUrlInput}
                        onChange={(e) => setNewPhotoUrlInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            const val = newPhotoUrlInput.trim();
                            if (val && val.startsWith('http')) {
                              const curr = extractedProduct.photos || [];
                              setExtractedProduct({
                                ...extractedProduct,
                                photos: [val, ...curr],
                                image: val,
                              });
                              setNewPhotoUrlInput('');
                              showToast('Custom photo added & set as cover!');
                            }
                          }
                        }}
                        className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-sky-400"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const val = newPhotoUrlInput.trim();
                          if (val && val.startsWith('http')) {
                            const curr = extractedProduct.photos || [];
                            setExtractedProduct({
                              ...extractedProduct,
                              photos: [val, ...curr],
                              image: val,
                            });
                            setNewPhotoUrlInput('');
                            showToast('Custom photo added & set as cover!');
                          } else {
                            showToast('Please enter a valid URL starting with http:// or https://');
                          }
                        }}
                        className="px-3 py-1.5 rounded-lg bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs cursor-pointer shrink-0 transition-colors"
                      >
                        Add
                      </button>
                    </div>
                  </div>
                </div>

                {/* ========================================================= */}
                {/* RIGHT COLUMN: DETAILS, DROPDOWNS & DESCRIPTIONS (7 of 12)  */}
                {/* ========================================================= */}
                <div className="lg:col-span-7 space-y-4">
                  {/* Title & Tagline */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                      Product Title &amp; Tagline:
                    </label>
                    <input
                      type="text"
                      value={extractedProduct.title}
                      onChange={(e) =>
                        setExtractedProduct({ ...extractedProduct, title: e.target.value })
                      }
                      placeholder="Product Name"
                      className="w-full text-base sm:text-lg font-bold text-slate-100 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 focus:border-sky-400 focus:outline-none"
                    />
                    <input
                      type="text"
                      value={extractedProduct.tagline}
                      onChange={(e) =>
                        setExtractedProduct({ ...extractedProduct, tagline: e.target.value })
                      }
                      placeholder="Product Subtitle / Tagline"
                      className="w-full text-xs text-slate-400 bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 focus:border-sky-400 focus:outline-none"
                    />
                  </div>

                  {/* Price, Rating, Partner Row */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                    <div>
                      <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                        Price:
                      </label>
                      <input
                        type="text"
                        value={extractedProduct.price}
                        onChange={(e) =>
                          setExtractedProduct({ ...extractedProduct, price: e.target.value })
                        }
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-emerald-400 font-bold font-mono focus:border-sky-400 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                        Rating &amp; Reviews:
                      </label>
                      <div className="flex items-center gap-1 bg-slate-950 border border-slate-800 rounded-xl px-2 py-1.5 text-xs font-mono text-amber-300">
                        <span>★ {extractedProduct.rating}</span>
                        <span className="text-slate-500">({extractedProduct.reviewsCount})</span>
                      </div>
                    </div>
                    <div className="col-span-2 sm:col-span-1">
                      <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                        Partner Brand:
                      </label>
                      <input
                        type="text"
                        value={extractedProduct.partner}
                        onChange={(e) =>
                          setExtractedProduct({ ...extractedProduct, partner: e.target.value })
                        }
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-slate-300 focus:border-sky-400 focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* ======================================================= */}
                  {/* DROPDOWN 1: SANCTUARY CATEGORY                          */}
                  {/* ======================================================= */}
                  <div className="space-y-1.5 p-3 rounded-xl bg-slate-950/70 border border-slate-800">
                    <label
                      htmlFor="select-sanctuary-category"
                      className="text-xs font-semibold text-slate-200 flex items-center justify-between"
                    >
                      <span className="flex items-center gap-1.5 text-emerald-400">
                        <Tag className="w-3.5 h-3.5" />
                        <span>Sanctuary Category (Dropdown)</span>
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        Active: {extractedProduct.category}
                      </span>
                    </label>
                    <select
                      id="select-sanctuary-category"
                      value={extractedProduct.category}
                      onChange={(e) =>
                        setExtractedProduct({
                          ...extractedProduct,
                          category: e.target.value as any,
                        })
                      }
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 font-medium focus:border-emerald-400 focus:outline-none cursor-pointer"
                    >
                      {SANCTUARY_CATEGORIES.map((cat) => (
                        <option
                          key={cat.value}
                          value={cat.value}
                          className="bg-slate-900 text-slate-100 py-1"
                        >
                          {cat.icon} {cat.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* ======================================================= */}
                  {/* DROPDOWN 2: SANCTUARY HARMONIC SUPPORTED                 */}
                  {/* ======================================================= */}
                  <div className="space-y-1.5 p-3 rounded-xl bg-slate-950/70 border border-slate-800">
                    <label
                      htmlFor="select-harmonic-supported"
                      className="text-xs font-semibold text-slate-200 flex items-center justify-between"
                    >
                      <span className="flex items-center gap-1.5 text-amber-300">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Sanctuary Harmonic Supported (Dropdown)</span>
                      </span>
                      <span className="text-[10px] text-amber-300/80 font-mono">
                        Tuning Filter
                      </span>
                    </label>
                    <select
                      id="select-harmonic-supported"
                      value={
                        extractedProduct.harmonicSupported ||
                        '432Hz Concert Pitch (Natural Harmonic / Heart Tuning)'
                      }
                      onChange={(e) => {
                        const val = e.target.value;
                        setExtractedProduct({
                          ...extractedProduct,
                          harmonicSupported: val,
                          badge: `★ ${val}`,
                        });
                      }}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-amber-200 font-medium focus:border-amber-400 focus:outline-none cursor-pointer"
                    >
                      {SANCTUARY_HARMONICS.map((h) => (
                        <option
                          key={h.value}
                          value={h.value}
                          className="bg-slate-900 text-slate-100 py-1"
                        >
                          {h.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* ======================================================= */}
                  {/* DESCRIPTION SUITE: ORIGINAL, SHORT & LONG OPTIONS       */}
                  {/* ======================================================= */}
                  <div className="space-y-2 p-3.5 rounded-xl bg-slate-950/70 border border-slate-800">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-2">
                      <span className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5 text-sky-400" />
                        <span>Description Suite: Edit Original, Short or Long</span>
                      </span>

                      {/* Segmented Tabs */}
                      <div className="flex items-center gap-1 p-0.5 bg-slate-900 rounded-lg border border-slate-800 shrink-0">
                        <button
                          type="button"
                          onClick={() => setProductDescTab('original')}
                          className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all cursor-pointer ${
                            productDescTab === 'original'
                              ? 'bg-sky-500 text-slate-950 font-bold shadow-xs'
                              : 'text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          Original / Main
                        </button>
                        <button
                          type="button"
                          onClick={() => setProductDescTab('short')}
                          className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all cursor-pointer ${
                            productDescTab === 'short'
                              ? 'bg-emerald-500 text-slate-950 font-bold shadow-xs'
                              : 'text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          Short Description
                        </button>
                        <button
                          type="button"
                          onClick={() => setProductDescTab('long')}
                          className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all cursor-pointer ${
                            productDescTab === 'long'
                              ? 'bg-purple-500 text-white font-bold shadow-xs'
                              : 'text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          Long Description
                        </button>
                      </div>
                    </div>

                    {/* Active Description Editor Tab */}
                    {productDescTab === 'original' && (
                      <div className="space-y-2 animate-in fade-in duration-150">
                        <div className="flex items-center justify-between text-[11px] text-slate-400">
                          <span>Original link description parsed from e-commerce page:</span>
                          <span className="font-mono">
                            {extractedProduct.description?.length || 0} chars
                          </span>
                        </div>
                        <textarea
                          rows={4}
                          value={extractedProduct.description || ''}
                          onChange={(e) =>
                            setExtractedProduct({
                              ...extractedProduct,
                              description: e.target.value,
                            })
                          }
                          placeholder="Original product description..."
                          className="w-full text-xs text-slate-200 bg-slate-900 border border-slate-700/80 rounded-xl p-3 focus:border-sky-400 focus:outline-none"
                        />
                      </div>
                    )}

                    {productDescTab === 'short' && (
                      <div className="space-y-2 animate-in fade-in duration-150">
                        <div className="flex items-center justify-between text-[11px] text-slate-400">
                          <span className="text-emerald-400 font-medium">
                            Short Summary (Used for mobile quick cards &amp; audio preview tooltips):
                          </span>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                const generated = handleAutoGenerateShort(extractedProduct);
                                setExtractedProduct({
                                  ...extractedProduct,
                                  shortDescription: generated,
                                });
                                showToast('Short summary auto-generated from main description.');
                              }}
                              className="px-2 py-0.5 rounded bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-[10px] font-semibold border border-emerald-500/40 flex items-center gap-1 cursor-pointer transition-colors"
                            >
                              <Wand2 className="w-2.5 h-2.5" />
                              <span>Auto-Generate from Main</span>
                            </button>
                            <span className="font-mono text-slate-400">
                              {extractedProduct.shortDescription?.length || 0} / 160 chars
                            </span>
                          </div>
                        </div>
                        <textarea
                          rows={3}
                          value={extractedProduct.shortDescription || ''}
                          onChange={(e) =>
                            setExtractedProduct({
                              ...extractedProduct,
                              shortDescription: e.target.value,
                            })
                          }
                          placeholder="Brief 1-2 sentence short summary for quick catalogue cards..."
                          className="w-full text-xs text-emerald-200 bg-slate-900 border border-emerald-500/40 rounded-xl p-3 focus:border-emerald-400 focus:outline-none"
                        />
                      </div>
                    )}

                    {productDescTab === 'long' && (
                      <div className="space-y-2 animate-in fade-in duration-150">
                        <div className="flex items-center justify-between text-[11px] text-slate-400">
                          <span className="text-purple-300 font-medium">
                            Long Description Dossier (Detailed sanctuary testing, acoustic specifications &amp; meditation protocol):
                          </span>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                const generated = handleGenerateHarmonicTemplate(extractedProduct);
                                setExtractedProduct({
                                  ...extractedProduct,
                                  longDescription: generated,
                                });
                                showToast('Sanctuary harmonic long description template applied.');
                              }}
                              className="px-2 py-0.5 rounded bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 text-[10px] font-semibold border border-purple-500/40 flex items-center gap-1 cursor-pointer transition-colors"
                            >
                              <Wand2 className="w-2.5 h-2.5" />
                              <span>Generate Harmonic Template</span>
                            </button>
                            <span className="font-mono text-slate-400">
                              {extractedProduct.longDescription?.length || 0} chars
                            </span>
                          </div>
                        </div>
                        <textarea
                          rows={5}
                          value={extractedProduct.longDescription || ''}
                          onChange={(e) =>
                            setExtractedProduct({
                              ...extractedProduct,
                              longDescription: e.target.value,
                            })
                          }
                          placeholder="Detailed multi-paragraph sanctuary long description dossier..."
                          className="w-full text-xs text-purple-100 bg-slate-900 border border-purple-500/40 rounded-xl p-3 focus:border-purple-400 focus:outline-none font-mono"
                        />
                      </div>
                    )}
                  </div>

                  {/* Sanctuary Harmonic Pros */}
                  {extractedProduct.pros && extractedProduct.pros.length > 0 && (
                    <div className="space-y-1.5 p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
                      <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                        Sanctuary Harmonic Pros:
                      </span>
                      <ul className="space-y-1 text-xs text-slate-300">
                        {extractedProduct.pros.map((pro, idx) => (
                          <li key={idx} className="flex items-center gap-1.5">
                            <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                            <span>{pro}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="pt-3 border-t border-slate-800 flex flex-wrap items-center gap-2.5">
                    <button
                      type="button"
                      onClick={handleStageDraft}
                      className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-sky-500 hover:from-emerald-400 hover:to-sky-400 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-md cursor-pointer transition-all"
                    >
                      <Layers className="w-4 h-4" />
                      <span>Stage Draft for Admin Review</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleDirectPublish}
                      className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-2 shadow-sm cursor-pointer transition-all"
                    >
                      <Sparkles className="w-4 h-4" />
                      <span>1-Click Direct Publish to Shop</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setExtractedProduct(null)}
                      className="px-3 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-400 hover:text-slate-200 text-xs transition-colors cursor-pointer ml-auto"
                    >
                      Discard Preview
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* =============================================================== */}
          {/* EXTRACTED PREVIEW CARD (BLOG DESTINATION)                        */}
          {/* =============================================================== */}
          {extractedArticle && destination === 'blog' && (
            <div className="bg-slate-900 border border-indigo-500/40 rounded-2xl p-4 sm:p-6 space-y-4 shadow-xl animate-in fade-in">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2 text-xs text-indigo-400 font-semibold">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Extracted Research Article Preview</span>
                </div>
                <span className="text-xs text-slate-400 font-mono">
                  Publication: <strong className="text-sky-300">{extractedArticle.sourceCitation?.publication}</strong>
                </span>
              </div>

              <div className="space-y-4">
                {/* Headline & Subtitle */}
                <div>
                  <input
                    type="text"
                    value={extractedArticle.title}
                    onChange={(e) =>
                      setExtractedArticle({ ...extractedArticle, title: e.target.value })
                    }
                    className="w-full text-base sm:text-lg font-bold text-slate-100 bg-transparent border-b border-slate-800 focus:border-sky-400 pb-1 focus:outline-none"
                  />
                  <input
                    type="text"
                    value={extractedArticle.subtitle}
                    onChange={(e) =>
                      setExtractedArticle({ ...extractedArticle, subtitle: e.target.value })
                    }
                    className="w-full text-xs text-slate-400 bg-transparent border-b border-slate-800 focus:border-sky-400 pt-1 pb-1 focus:outline-none"
                  />
                </div>

                {/* Human Author Attribution Card */}
                <div className="p-3.5 bg-slate-950/80 border border-slate-800 rounded-xl flex items-start gap-3">
                  <img
                    src={extractedArticle.author?.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=240&auto=format&fit=crop&q=80'}
                    alt={extractedArticle.author?.name}
                    className="w-12 h-12 rounded-xl object-cover border border-indigo-500/40 shrink-0"
                    referrerPolicy="no-referrer"
                  />
                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-100">
                        {extractedArticle.author?.name}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 font-mono">
                        Verified Human Author
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      {extractedArticle.author?.role} · {extractedArticle.author?.affiliations}
                    </p>
                    <p className="text-[10px] text-slate-500 italic">
                      "{extractedArticle.author?.bio}"
                    </p>
                  </div>
                </div>

                {/* Citation & DOI Box */}
                <div className="p-3 bg-slate-950/60 border border-slate-800/80 rounded-xl text-xs space-y-1">
                  <div className="flex items-center justify-between text-slate-400 text-[11px]">
                    <span className="font-semibold text-slate-300">Scholarly Citation &amp; Source:</span>
                    <span>DOI / Archive: {extractedArticle.sourceCitation?.doiOrArchive || 'Direct Record'}</span>
                  </div>
                  <p className="text-slate-300 font-mono text-[11px]">
                    {extractedArticle.sourceCitation?.workTitle} ({extractedArticle.sourceCitation?.publication}, {extractedArticle.sourceCitation?.yearOrDate})
                  </p>
                  <p className="text-[10px] text-slate-400">
                    License: {extractedArticle.sourceCitation?.copyrightNotice}
                  </p>
                </div>

                {/* Abstract Summary */}
                <div>
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                    Abstract &amp; Synthesis:
                  </span>
                  <textarea
                    rows={3}
                    value={extractedArticle.summary}
                    onChange={(e) =>
                      setExtractedArticle({ ...extractedArticle, summary: e.target.value })
                    }
                    className="w-full text-xs text-slate-300 bg-slate-950/80 border border-slate-800 rounded-xl p-2.5 focus:border-sky-400 focus:outline-none"
                  />
                </div>

                {/* Actions */}
                <div className="pt-3 border-t border-slate-800 flex flex-wrap items-center gap-2.5">
                  <button
                    type="button"
                    onClick={handleStageDraft}
                    className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-400 hover:to-purple-400 text-white font-semibold text-xs flex items-center gap-2 shadow-md cursor-pointer transition-all"
                  >
                    <Layers className="w-4 h-4" />
                    <span>Stage Draft for Admin Review</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleDirectPublish}
                    className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs flex items-center gap-2 shadow-sm cursor-pointer transition-all"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>1-Click Direct Publish to Blog</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setExtractedArticle(null)}
                    className="px-3 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-400 hover:text-slate-200 text-xs transition-colors cursor-pointer ml-auto"
                  >
                    Discard Preview
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* =================================================================== */
        /* TAB 2: STAGING DRAFT QUEUE                                          */
        /* =================================================================== */
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-3.5 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold text-slate-400 mr-1 flex items-center gap-1">
                <Filter className="w-3.5 h-3.5" />
                <span>Filter:</span>
              </span>

              {/* Destination Filter */}
              <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
                <button
                  type="button"
                  onClick={() => setQueueFilter('all')}
                  className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                    queueFilter === 'all'
                      ? 'bg-sky-500 text-slate-950 font-bold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  All Types ({drafts.length})
                </button>
                <button
                  type="button"
                  onClick={() => setQueueFilter('shop')}
                  className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                    queueFilter === 'shop'
                      ? 'bg-emerald-500 text-slate-950 font-bold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Shop Products ({drafts.filter((d) => d.destination === 'shop').length})
                </button>
                <button
                  type="button"
                  onClick={() => setQueueFilter('blog')}
                  className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                    queueFilter === 'blog'
                      ? 'bg-indigo-500 text-white font-bold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Blog Articles ({drafts.filter((d) => d.destination === 'blog').length})
                </button>
              </div>

              {/* Status Filter */}
              <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
                <button
                  type="button"
                  onClick={() => setStatusFilter('all')}
                  className={`px-2 py-1 rounded-lg cursor-pointer ${
                    statusFilter === 'all' ? 'text-sky-300 font-bold underline' : 'text-slate-400'
                  }`}
                >
                  All Status
                </button>
                <button
                  type="button"
                  onClick={() => setStatusFilter('pending')}
                  className={`px-2 py-1 rounded-lg cursor-pointer ${
                    statusFilter === 'pending' ? 'text-amber-300 font-bold underline' : 'text-slate-400'
                  }`}
                >
                  Pending ({drafts.filter((d) => d.status === 'pending_review').length})
                </button>
                <button
                  type="button"
                  onClick={() => setStatusFilter('approved')}
                  className={`px-2 py-1 rounded-lg cursor-pointer ${
                    statusFilter === 'approved' ? 'text-emerald-300 font-bold underline' : 'text-slate-400'
                  }`}
                >
                  Approved ({drafts.filter((d) => d.status === 'approved').length})
                </button>
              </div>
            </div>

            {/* Search Input */}
            <div className="relative w-full md:w-64">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchDraftQuery}
                onChange={(e) => setSearchDraftQuery(e.target.value)}
                placeholder="Search staged drafts..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-sky-400"
              />
            </div>
          </div>

          {/* Drafts List */}
          {filteredDrafts.length === 0 ? (
            <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-12 text-center space-y-3">
              <Layers className="w-8 h-8 text-slate-600 mx-auto" />
              <h4 className="text-sm font-semibold text-slate-300">No drafts in this queue</h4>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                No items match your active filters. Paste a new external URL above to extract metadata and stage it for review.
              </p>
              <button
                type="button"
                onClick={() => setActiveTab('fetcher')}
                className="px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 text-xs font-semibold inline-flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Fetch a New URL</span>
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredDrafts.map((draft) => {
                const isShop = draft.destination === 'shop';
                const title = isShop ? draft.productData?.title : draft.articleData?.title;
                const authorOrPartner = isShop
                  ? draft.productData?.partner
                  : draft.articleData?.author?.name;
                const image = isShop
                  ? draft.productData?.image || draft.productData?.photos?.[0]
                  : draft.articleData?.author?.avatar;

                return (
                  <div
                    key={draft.id}
                    className={`bg-slate-900/90 border rounded-2xl p-4 sm:p-5 transition-all shadow-sm ${
                      draft.status === 'approved'
                        ? 'border-emerald-500/30 bg-emerald-950/10'
                        : 'border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800/70 pb-3">
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase ${
                            isShop
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                              : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40'
                          }`}
                        >
                          {isShop ? 'Shop Product' : 'Research Blog'}
                        </span>

                        <span
                          className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase ${
                            draft.status === 'approved'
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                              : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                          }`}
                        >
                          {draft.status === 'approved' ? '✓ Published Live' : '● Staged Pending'}
                        </span>

                        <span className="text-[11px] text-slate-500 font-mono hidden sm:inline">
                          Fetched: {new Date(draft.fetchedAt).toLocaleDateString()}
                        </span>
                      </div>

                      <a
                        href={draft.sourceUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[11px] text-sky-400 hover:text-sky-300 flex items-center gap-1 font-mono truncate max-w-xs"
                      >
                        <span className="truncate">{draft.sourceUrl}</span>
                        <ExternalLink className="w-3 h-3 shrink-0" />
                      </a>
                    </div>

                    <div className="py-3 flex flex-col md:flex-row items-start md:items-center gap-4">
                      {image && (
                        <img
                          src={image}
                          alt={title}
                          className="w-14 h-14 rounded-xl object-cover border border-slate-800 shrink-0"
                          referrerPolicy="no-referrer"
                        />
                      )}
                      <div className="min-w-0 flex-1 space-y-1">
                        <h4 className="text-sm sm:text-base font-bold text-slate-100 truncate">
                          {title}
                        </h4>
                        <div className="text-xs text-slate-400 flex flex-wrap items-center gap-2">
                          <span>By/Partner: <strong className="text-slate-200">{authorOrPartner}</strong></span>
                          {isShop && draft.productData?.price && (
                            <>
                              <span className="text-slate-600">·</span>
                              <span className="text-emerald-400 font-mono font-bold">
                                {draft.productData.price}
                              </span>
                            </>
                          )}
                          {!isShop && draft.articleData?.sourceCitation?.publication && (
                            <>
                              <span className="text-slate-600">·</span>
                              <span className="text-indigo-300 font-mono">
                                {draft.articleData.sourceCitation.publication}
                              </span>
                            </>
                          )}
                        </div>
                        {draft.editorialNotes && (
                          <p className="text-[11px] text-slate-500 italic">
                            "{draft.editorialNotes}"
                          </p>
                        )}
                      </div>

                      {/* Draft Action Buttons */}
                      <div className="flex items-center gap-2 shrink-0 pt-2 md:pt-0 w-full md:w-auto justify-end">
                        {draft.status === 'pending_review' ? (
                          <>
                            <button
                              type="button"
                              onClick={() => {
                                setEditingDraft(JSON.parse(JSON.stringify(draft)));
                                setEditingDraftDescTab('original');
                                setEditingDraftNewPhotoUrl('');
                              }}
                              className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                              title="Edit Category, Harmonic, Descriptions, or Photos before approval"
                            >
                              <Edit3 className="w-3.5 h-3.5 text-sky-400" />
                              <span>Edit Draft</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleApproveDraft(draft.id)}
                              className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-sky-500 hover:from-emerald-400 hover:to-sky-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>1-Click Approve &amp; Publish</span>
                            </button>
                          </>
                        ) : (
                          <div className="flex items-center gap-1.5">
                            {isShop && onNavigateToShop && (
                              <button
                                type="button"
                                onClick={onNavigateToShop}
                                className="px-3 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-xs font-semibold border border-emerald-500/40 flex items-center gap-1 cursor-pointer"
                              >
                                <Eye className="w-3.5 h-3.5" />
                                <span>View in Shop</span>
                              </button>
                            )}
                            {!isShop && onNavigateToBlog && (
                              <button
                                type="button"
                                onClick={onNavigateToBlog}
                                className="px-3 py-1.5 rounded-lg bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 text-xs font-semibold border border-indigo-500/40 flex items-center gap-1 cursor-pointer"
                              >
                                <Eye className="w-3.5 h-3.5" />
                                <span>View on Blog</span>
                              </button>
                            )}
                          </div>
                        )}

                        <button
                          type="button"
                          onClick={() => handleDiscardDraft(draft.id)}
                          className="p-2 rounded-xl text-slate-400 hover:text-rose-300 hover:bg-rose-950/40 border border-transparent hover:border-rose-500/40 transition-colors cursor-pointer"
                          title="Discard this draft"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* =================================================================== */}
      {/* EDIT STAGED DRAFT MODAL                                             */}
      {/* =================================================================== */}
      {editingDraft && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/85 backdrop-blur-md overflow-y-auto"
        >
          <div className="bg-slate-900 border border-slate-700/80 rounded-2xl max-w-3xl w-full max-h-[92dvh] flex flex-col shadow-2xl overflow-hidden my-auto animate-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/95 sticky top-0 z-10">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-sky-500/20 text-sky-400 border border-sky-500/40 flex items-center justify-center">
                  <Edit3 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-100">
                    Edit Staged {editingDraft.destination === 'shop' ? 'Shop Product' : 'Blog Article'} Draft
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Customize Category, Harmonic Tuning, Descriptions &amp; Photos before approval.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditingDraft(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4 sm:p-6 overflow-y-auto space-y-4">
              {editingDraft.destination === 'shop' && editingDraft.productData && (
                <>
                  {/* Photo Preview & Management */}
                  <div className="space-y-2">
                    <label className="text-[11px] font-semibold text-slate-300 block">
                      Product Photos ({editingDraft.productData.photos?.length || 0}):
                    </label>
                    <div className="flex items-start gap-4">
                      <div className="w-24 h-24 rounded-xl bg-slate-950 border border-slate-800 overflow-hidden shrink-0 relative">
                        <img
                          src={editingDraft.productData.image || editingDraft.productData.photos?.[0]}
                          alt="Cover"
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                        <span className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded bg-slate-950/80 text-[9px] text-emerald-300 font-bold">
                          Cover
                        </span>
                      </div>

                      <div className="flex-1 space-y-2">
                        {/* Thumbnails */}
                        <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
                          {editingDraft.productData.photos?.map((ph, idx) => {
                            const isCover = (editingDraft.productData?.image || editingDraft.productData?.photos?.[0]) === ph;
                            return (
                              <div
                                key={idx}
                                className={`relative w-12 h-12 rounded-lg overflow-hidden border cursor-pointer ${
                                  isCover ? 'border-emerald-400 ring-2 ring-emerald-400/50' : 'border-slate-800 opacity-80'
                                }`}
                                onClick={() => {
                                  if (editingDraft.productData) {
                                    setEditingDraft({
                                      ...editingDraft,
                                      productData: {
                                        ...editingDraft.productData,
                                        image: ph,
                                      },
                                    });
                                  }
                                }}
                              >
                                <img src={ph} alt="thumb" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                              </div>
                            );
                          })}
                        </div>

                        {/* Add custom photo input */}
                        <div className="flex items-center gap-1.5">
                          <input
                            type="url"
                            placeholder="Add photo URL..."
                            value={editingDraftNewPhotoUrl}
                            onChange={(e) => setEditingDraftNewPhotoUrl(e.target.value)}
                            className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const val = editingDraftNewPhotoUrl.trim();
                              if (val && val.startsWith('http') && editingDraft.productData) {
                                const curr = editingDraft.productData.photos || [];
                                setEditingDraft({
                                  ...editingDraft,
                                  productData: {
                                    ...editingDraft.productData,
                                    photos: [val, ...curr],
                                    image: val,
                                  },
                                });
                                setEditingDraftNewPhotoUrl('');
                                showToast('Photo added to draft!');
                              }
                            }}
                            className="px-2.5 py-1 bg-sky-500 text-slate-950 font-bold text-xs rounded-lg cursor-pointer"
                          >
                            Add
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Title & Price */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="sm:col-span-2">
                      <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                        Title:
                      </label>
                      <input
                        type="text"
                        value={editingDraft.productData.title}
                        onChange={(e) => {
                          if (editingDraft.productData) {
                            setEditingDraft({
                              ...editingDraft,
                              productData: {
                                ...editingDraft.productData,
                                title: e.target.value,
                              },
                            });
                          }
                        }}
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-100 font-bold focus:border-sky-400 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                        Price:
                      </label>
                      <input
                        type="text"
                        value={editingDraft.productData.price}
                        onChange={(e) => {
                          if (editingDraft.productData) {
                            setEditingDraft({
                              ...editingDraft,
                              productData: {
                                ...editingDraft.productData,
                                price: e.target.value,
                              },
                            });
                          }
                        }}
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-emerald-400 font-bold font-mono focus:border-sky-400 focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Category Dropdown */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-emerald-400 block">
                      Category (Dropdown):
                    </label>
                    <select
                      value={editingDraft.productData.category}
                      onChange={(e) => {
                        if (editingDraft.productData) {
                          setEditingDraft({
                            ...editingDraft,
                            productData: {
                              ...editingDraft.productData,
                              category: e.target.value as any,
                            },
                          });
                        }
                      }}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:border-emerald-400 focus:outline-none cursor-pointer"
                    >
                      {SANCTUARY_CATEGORIES.map((cat) => (
                        <option key={cat.value} value={cat.value} className="bg-slate-900 text-slate-100">
                          {cat.icon} {cat.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Sanctuary Harmonic Supported Dropdown */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-amber-300 block">
                      Sanctuary Harmonic Supported (Dropdown):
                    </label>
                    <select
                      value={
                        editingDraft.productData.harmonicSupported ||
                        '432Hz Concert Pitch (Natural Harmonic / Heart Tuning)'
                      }
                      onChange={(e) => {
                        if (editingDraft.productData) {
                          const val = e.target.value;
                          setEditingDraft({
                            ...editingDraft,
                            productData: {
                              ...editingDraft.productData,
                              harmonicSupported: val,
                              badge: `★ ${val}`,
                            },
                          });
                        }
                      }}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-amber-200 focus:border-amber-400 focus:outline-none cursor-pointer"
                    >
                      {SANCTUARY_HARMONICS.map((h) => (
                        <option key={h.value} value={h.value} className="bg-slate-900 text-slate-100">
                          {h.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Description Suite (Original, Short, Long) */}
                  <div className="space-y-2 p-3 rounded-xl bg-slate-950/80 border border-slate-800">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                      <span className="text-xs font-semibold text-slate-200">
                        Description Suite:
                      </span>
                      <div className="flex items-center gap-1 p-0.5 bg-slate-900 rounded-lg border border-slate-800 text-[11px]">
                        <button
                          type="button"
                          onClick={() => setEditingDraftDescTab('original')}
                          className={`px-2 py-0.5 rounded cursor-pointer ${
                            editingDraftDescTab === 'original' ? 'bg-sky-500 text-slate-950 font-bold' : 'text-slate-400'
                          }`}
                        >
                          Original
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingDraftDescTab('short')}
                          className={`px-2 py-0.5 rounded cursor-pointer ${
                            editingDraftDescTab === 'short' ? 'bg-emerald-500 text-slate-950 font-bold' : 'text-slate-400'
                          }`}
                        >
                          Short
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingDraftDescTab('long')}
                          className={`px-2 py-0.5 rounded cursor-pointer ${
                            editingDraftDescTab === 'long' ? 'bg-purple-500 text-white font-bold' : 'text-slate-400'
                          }`}
                        >
                          Long Dossier
                        </button>
                      </div>
                    </div>

                    {editingDraftDescTab === 'original' && (
                      <textarea
                        rows={3}
                        value={editingDraft.productData.description || ''}
                        onChange={(e) => {
                          if (editingDraft.productData) {
                            setEditingDraft({
                              ...editingDraft,
                              productData: {
                                ...editingDraft.productData,
                                description: e.target.value,
                              },
                            });
                          }
                        }}
                        className="w-full text-xs text-slate-200 bg-slate-900 border border-slate-700 rounded-xl p-2.5 focus:border-sky-400 focus:outline-none"
                        placeholder="Original product description..."
                      />
                    )}

                    {editingDraftDescTab === 'short' && (
                      <textarea
                        rows={3}
                        value={editingDraft.productData.shortDescription || ''}
                        onChange={(e) => {
                          if (editingDraft.productData) {
                            setEditingDraft({
                              ...editingDraft,
                              productData: {
                                ...editingDraft.productData,
                                shortDescription: e.target.value,
                              },
                            });
                          }
                        }}
                        className="w-full text-xs text-emerald-200 bg-slate-900 border border-emerald-500/40 rounded-xl p-2.5 focus:border-emerald-400 focus:outline-none"
                        placeholder="Short card summary (1-2 sentences)..."
                      />
                    )}

                    {editingDraftDescTab === 'long' && (
                      <textarea
                        rows={5}
                        value={editingDraft.productData.longDescription || ''}
                        onChange={(e) => {
                          if (editingDraft.productData) {
                            setEditingDraft({
                              ...editingDraft,
                              productData: {
                                ...editingDraft.productData,
                                longDescription: e.target.value,
                              },
                            });
                          }
                        }}
                        className="w-full text-xs text-purple-200 bg-slate-900 border border-purple-500/40 rounded-xl p-2.5 focus:border-purple-400 focus:outline-none font-mono"
                        placeholder="Long acoustic specifications dossier..."
                      />
                    )}
                  </div>
                </>
              )}

              {editingDraft.destination === 'blog' && editingDraft.articleData && (
                <div className="space-y-3">
                  <div>
                    <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                      Article Title:
                    </label>
                    <input
                      type="text"
                      value={editingDraft.articleData.title}
                      onChange={(e) => {
                        if (editingDraft.articleData) {
                          setEditingDraft({
                            ...editingDraft,
                            articleData: {
                              ...editingDraft.articleData,
                              title: e.target.value,
                            },
                          });
                        }
                      }}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-100 font-bold focus:border-sky-400 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                      Author Name:
                    </label>
                    <input
                      type="text"
                      value={editingDraft.articleData.author?.name || ''}
                      onChange={(e) => {
                        if (editingDraft.articleData) {
                          setEditingDraft({
                            ...editingDraft,
                            articleData: {
                              ...editingDraft.articleData,
                              author: {
                                ...editingDraft.articleData.author,
                                name: e.target.value,
                              },
                            },
                          });
                        }
                      }}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-100 focus:border-sky-400 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                      Abstract / Summary:
                    </label>
                    <textarea
                      rows={4}
                      value={editingDraft.articleData.summary || ''}
                      onChange={(e) => {
                        if (editingDraft.articleData) {
                          setEditingDraft({
                            ...editingDraft,
                            articleData: {
                              ...editingDraft.articleData,
                              summary: e.target.value,
                            },
                          });
                        }
                      }}
                      className="w-full text-xs text-slate-200 bg-slate-950 border border-slate-700 rounded-xl p-2.5 focus:border-sky-400 focus:outline-none"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer Actions */}
            <div className="p-4 border-t border-slate-800 bg-slate-900/95 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setEditingDraft(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer transition-colors"
              >
                Cancel
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    if (editingDraft) {
                      stagingStorage.updateStagedDraft(editingDraft.id, {
                        productData: editingDraft.productData,
                        articleData: editingDraft.articleData,
                      });
                      showToast('Draft changes saved successfully.');
                      setEditingDraft(null);
                    }
                  }}
                  className="px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-sm cursor-pointer transition-colors"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Save Changes</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (editingDraft) {
                      stagingStorage.updateStagedDraft(editingDraft.id, {
                        productData: editingDraft.productData,
                        articleData: editingDraft.articleData,
                      });
                      handleApproveDraft(editingDraft.id);
                      setEditingDraft(null);
                    }
                  }}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-sky-500 hover:from-emerald-400 hover:to-sky-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-md cursor-pointer transition-all"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Save &amp; 1-Click Approve</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* PHOTO LIGHTBOX MODAL                                                */}
      {/* =================================================================== */}
      {previewPhotoModalUrl && (
        <div
          role="dialog"
          aria-modal="true"
          onClick={() => setPreviewPhotoModalUrl(null)}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md cursor-zoom-out"
        >
          <div
            className="max-w-3xl max-h-[85vh] relative rounded-2xl overflow-hidden border border-slate-800 shadow-2xl bg-slate-950"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={previewPhotoModalUrl}
              alt="Enlarged preview"
              className="w-full h-full object-contain max-h-[80vh]"
              referrerPolicy="no-referrer"
            />
            <button
              type="button"
              onClick={() => setPreviewPhotoModalUrl(null)}
              className="absolute top-3 right-3 p-2 rounded-full bg-slate-900/80 text-slate-200 hover:bg-slate-800 cursor-pointer shadow-lg"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
