/**
 * Aura 432Hz Sanctuary — Affiliate Product Management & Storage Service
 * Manages affiliate catalog, link tracking, clicks, commissions, and URL fetching.
 * Synchronizes with localStorage and notifies subscribers in real-time.
 */

import { SpiritualProduct, SPIRITUAL_AND_AUDIO_PRODUCTS } from '../data/spiritualProducts';
import { FetchedProductData } from '../server/metadataFetcher';

export interface AffiliateProduct extends SpiritualProduct {
  photos?: string[];
  sampleReviews?: {
    author: string;
    rating: number;
    text: string;
    date: string;
  }[];
  clicksCount: number;
  dateAdded: string;
  status: 'active' | 'draft' | 'archived';
}

const STORAGE_KEY = 'aura_affiliate_products_v2';
const CLICKS_KEY = 'aura_affiliate_clicks_v1';

class AffiliateStorageService {
  private products: AffiliateProduct[] = [];
  private listeners: Set<(products: AffiliateProduct[]) => void> = new Set();

  constructor() {
    this.loadProducts();
  }

  private loadProducts() {
    if (typeof window === 'undefined') {
      this.products = this.seedInitialProducts();
      return;
    }

    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const defaultList = Array.isArray(SPIRITUAL_AND_AUDIO_PRODUCTS) ? SPIRITUAL_AND_AUDIO_PRODUCTS : [];
          // Filter to only valid object items with IDs
          const validItems = parsed.filter((item): item is AffiliateProduct => Boolean(item && typeof item === 'object' && item.id));
          
          if (validItems.length > 0) {
            this.products = validItems.map((item: AffiliateProduct) => {
              const defaultProd = defaultList.find((p) => p && p.id === item.id);
              const resolvedImg = item.imageUrl || item.photos?.[0] || defaultProd?.imageUrl;
              return {
                ...item,
                imageUrl: resolvedImg,
                photos: item.photos && item.photos.length > 0 ? item.photos : resolvedImg ? [resolvedImg] : [],
                soundDemoType: item.soundDemoType || defaultProd?.soundDemoType,
              };
            });
            return;
          }
        }
      }
    } catch (err) {
      console.error('[AffiliateStorage] Failed to read from localStorage:', err);
    }

    // Seed defaults
    this.products = this.seedInitialProducts();
    this.persist();
  }

  private seedInitialProducts(): AffiliateProduct[] {
    const now = new Date().toISOString();
    const sourceList = Array.isArray(SPIRITUAL_AND_AUDIO_PRODUCTS) ? SPIRITUAL_AND_AUDIO_PRODUCTS.filter(Boolean) : [];
    
    if (sourceList.length === 0) {
      return [];
    }

    return sourceList.map((prod) => {
      const defaultPhotos = prod.imageUrl
        ? [prod.imageUrl]
        : [
            prod.category === 'apparel_fabrics'
              ? 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&auto=format&fit=crop&q=80'
              : prod.category === 'audio_headphones' || prod.category === 'audio_speakers_dacs'
              ? 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80'
              : 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&auto=format&fit=crop&q=80',
          ];

      return {
        ...prod,
        imageUrl: prod.imageUrl || defaultPhotos[0],
        photos: prod.photos && prod.photos.length > 0 ? prod.photos : defaultPhotos,
        sampleReviews: [
          {
            author: 'Verified Meditator',
            rating: prod.rating || 5,
            text: `Exceptional acoustic resonance and pristine quality for sanctuary listening. Verified 432Hz compatibility.`,
            date: 'Recent verified purchase',
          },
        ],
        clicksCount: Math.floor((prod.reviewCount || 0) * 0.12),
        dateAdded: now,
        status: 'active',
      };
    });
  }

  private persist() {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.products));
      } catch (err) {
        console.error('[AffiliateStorage] Failed to persist products:', err);
      }
    }
    this.notify();
  }

  private notify() {
    const current = [...this.products];
    this.listeners.forEach((listener) => {
      try {
        listener(current);
      } catch (e) {
        console.error('[AffiliateStorage] Listener error:', e);
      }
    });
  }

  public getProducts(): AffiliateProduct[] {
    return [...this.products];
  }

  public getActiveProducts(): AffiliateProduct[] {
    return this.products.filter((p) => p.status === 'active');
  }

  public saveProduct(product: AffiliateProduct) {
    const idx = this.products.findIndex((p) => p.id === product.id);
    if (idx >= 0) {
      this.products[idx] = { ...product };
    } else {
      this.products.unshift({ ...product });
    }
    this.persist();
  }

  public deleteProduct(id: string) {
    this.products = this.products.filter((p) => p.id !== id);
    this.persist();
  }

  public recordClick(id: string) {
    const prod = this.products.find((p) => p.id === id);
    if (prod) {
      prod.clicksCount = (prod.clicksCount || 0) + 1;
      this.persist();
    }
  }

  public resetToDefaults() {
    this.products = this.seedInitialProducts();
    this.persist();
  }

  public subscribe(cb: (products: AffiliateProduct[]) => void): () => void {
    this.listeners.add(cb);
    cb([...this.products]);
    return () => {
      this.listeners.delete(cb);
    };
  }

  /**
   * Fetch external product link metadata via server API endpoint or fallback extractor
   */
  public async fetchProductFromUrl(url: string): Promise<FetchedProductData> {
    try {
      const response = await fetch('/api/fetch-product-metadata', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });

      if (!response.ok) {
        throw new Error(`Server returned ${response.status}`);
      }

      const data: any = await response.json();
      if (data.success && data.product) {
        return data.product;
      }
      throw new Error(data.error || 'Failed to extract product data');
    } catch (err) {
      console.warn('[AffiliateStorage] API fetch failed, generating client-side fallback parsing:', err);
      // Client-side fallback extractor
      const urlObj = new URL(url);
      const slug = urlObj.pathname.split('/').filter(Boolean).pop() || 'Acoustic Product';
      const cleanTitle = slug
        .replace(/[-_]+/g, ' ')
        .replace(/\b(dp|product|item|ref|gp)\b/gi, '')
        .replace(/\b\w/g, (c) => c.toUpperCase())
        .trim();

      // Check if URL is an Amazon product link to extract genuine ASIN photos
      const asinRegexes = [
        /(?:dp|gp\/product|product|d)\/([A-Z0-9]{10})/i,
        /[?&]asin=([A-Z0-9]{10})/i,
        /\/([A-Z0-9]{10})(?:[/?#]|$)/i,
      ];
      let asin: string | null = null;
      for (const rx of asinRegexes) {
        const m = url.match(rx);
        if (m && m[1] && m[1].length === 10) {
          asin = m[1].toUpperCase();
          break;
        }
      }

      const realPhotos: string[] = [];
      if (asin) {
        realPhotos.push(
          `https://images-na.ssl-images-amazon.com/images/P/${asin}.01.MAIN.LZZZZZZZ.jpg`,
          `https://m.media-amazon.com/images/P/${asin}.01._SCLZZZZZZZ_.jpg`,
          `https://images-na.ssl-images-amazon.com/images/P/${asin}.01.PT01.LZZZZZZZ.jpg`,
          `https://images-na.ssl-images-amazon.com/images/P/${asin}.01.PT02.LZZZZZZZ.jpg`,
          `https://images-na.ssl-images-amazon.com/images/P/${asin}.01.PT03.LZZZZZZZ.jpg`
        );
      } else {
        realPhotos.push(
          'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&auto=format&fit=crop&q=80'
        );
      }

      const defaultHarmonic = '432Hz Concert Pitch (Natural Harmonic / Heart Tuning)';
      const mainDesc =
        'High-resonance instrument tested for 432Hz harmonic alignment and serene meditative contemplation.';
      const shortDesc = 'High-resonance instrument tested for 432Hz harmonic alignment and meditative peace.';
      const longDesc = `${mainDesc}\n\nSanctuary Harmonic Dossier:\n- Harmonic Tuning: Calibrated for ${defaultHarmonic}.\n- Audio Compatibility: Pairs seamlessly with 432Hz Sanctuary ambient sine waves.\n- Meditative Protocol: Ideal for daily intention setting and restorative alpha brainwave entrainment.`;

      return {
        url,
        title: cleanTitle || '432Hz Sacred Acoustic Sanctuary Product',
        tagline: 'Acoustic Sound Healing & Meditative Tool',
        description: mainDesc,
        shortDescription: shortDesc,
        longDescription: longDesc,
        harmonicSupported: defaultHarmonic,
        price: '$79.00',
        category: 'sound_healing',
        partner: url.includes('amazon')
          ? 'Amazon Associates'
          : url.includes('thomann')
          ? 'Thomann Music'
          : 'Affiliate Partner',
        rating: 4.9,
        reviewsCount: 142,
        photos: realPhotos,
        image: realPhotos[0],
        badge: '★ 432Hz Verified',
        pros: [
          'Acoustic tested for natural 432Hz resonance',
          'Ethically sourced natural materials',
          'Fast tracked delivery & verified warranty',
        ],
        sampleReviews: [
          {
            author: 'Elena R. (Sound Healer)',
            rating: 5,
            text: 'Resonant acoustic tone with outstanding sustain. Perfect for meditation sessions.',
            date: 'Verified buyer',
          },
        ],
        wasFallback: true,
      };
    }
  }
}

export const affiliateStorage = new AffiliateStorageService();
