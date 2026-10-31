/**
 * Aura 432Hz Sanctuary — Dynamic SEO, OpenGraph & Structured Data Manager
 * 
 * Provides dynamic document title, description, OpenGraph tags, canonical links,
 * and Schema.org structured data for sanctuary tabs, editorial articles, and shop products.
 */

import type { EditorialArticle } from './editorialStorage';
import type { SpiritualProduct } from '../data/spiritualProducts';

const BASE_URL = 'https://aura432hz.com';
const DEFAULT_TITLE = 'Aura 432Hz — Harmonic Resonance & Ambient Meditation Sanctuary';
const DEFAULT_DESCRIPTION =
  '432Hz Alpha Waves ambient relaxation soundscapes, harmonic breath pacer, interactive crystal sound harp, sacred visualizer animations, nature mixer, and offline meditation sanctuary.';

function updateMetaTag(attribute: 'name' | 'property', key: string, content: string) {
  if (typeof document === 'undefined') return;
  let element = document.querySelector(`meta[${attribute}="${key}"]`);
  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(attribute, key);
    document.head.appendChild(element);
  }
  element.setAttribute('content', content);
}

function updateCanonical(url: string) {
  if (typeof document === 'undefined') return;
  let link = document.querySelector('link[rel="canonical"]');
  if (!link) {
    link = document.createElement('link');
    link.setAttribute('rel', 'canonical');
    document.head.appendChild(link);
  }
  link.setAttribute('href', url);
}

function updateDynamicJsonLd(schema: object | null) {
  if (typeof document === 'undefined') return;
  let script = document.getElementById('dynamic-jsonld-schema') as HTMLScriptElement | null;
  if (!schema) {
    if (script) script.remove();
    return;
  }
  if (!script) {
    script = document.createElement('script');
    script.id = 'dynamic-jsonld-schema';
    script.type = 'application/ld+json';
    document.head.appendChild(script);
  }
  script.textContent = JSON.stringify(schema);
}

const PAGE_METADATA: Record<string, { title: string; description: string }> = {
  player: {
    title: 'Aura 432Hz — Harmonic Resonance & Ambient Meditation Sanctuary',
    description: DEFAULT_DESCRIPTION,
  },
  mixer: {
    title: 'Soundscapes & Nature Mixer - Aura 432Hz Sanctuary',
    description:
      'Mix 32 soothing ambient nature layers including mountain rain, Himalayan singing bowls, ocean waves, and forest wind in pure 432Hz harmonic tuning.',
  },
  breath: {
    title: 'Harmonic Breathwork Pacer (4-7-8) - Aura 432Hz',
    description:
      'Guided visual and acoustic breathing pacer for mindful relaxation, steady pacing, restorative calm, and meditation coherence.',
  },
  musical: {
    title: '432Hz Crystal Sound Harp & Sound Bowls - Aura 432Hz',
    description:
      'Interactive pentatonic and celestial acoustic sound harp tuned to 432Hz Verdi Diapason Normale for acoustic harmony and ambient meditation exploration.',
  },
  gear: {
    title: 'Aura Shop - Audio Gear & Sacred Atmosphere Tools',
    description:
      'Expert-tested meditation cushions, crystal singing bowls, studio audiophile headphones, and natural incense for your sacred space.',
  },
  blog: {
    title: 'Science & History of 432Hz Tuning - Aura 432Hz Research',
    description:
      'Peer-reviewed acoustic research, Verdi Diapason Normale history, biophysics of binaural beats, and clinical sleep medicine studies.',
  },
  community: {
    title: 'Sanctuary Community Hub - Aura 432Hz',
    description:
      'Join global meditators, share sacred session reflections, gratitude journals, and synchronized listening milestones.',
  },
  contact: {
    title: 'Sanctuary Support & Acoustic Consultation - Aura 432Hz',
    description:
      'Contact the Aura 432Hz sound engineering and wellness team for feedback, custom presets, or technical inquiries.',
  },
  admin: {
    title: 'Sanctuary Studio Console - Aura 432Hz',
    description: 'Aura 432Hz administrative editorial and system control console.',
  },
};

/**
 * Updates page-level title and meta tags when changing sanctuary tabs
 */
export function applyPageSeo(tabName: string, isPlaying: boolean = false) {
  if (typeof document === 'undefined') return;

  const meta = PAGE_METADATA[tabName] || PAGE_METADATA.player;
  const pageTitle = isPlaying ? `▶ ${meta.title}` : meta.title;
  const canonicalPath = tabName === 'player' ? '/' : `/${tabName}`;
  const canonicalUrl = `${BASE_URL}${canonicalPath}`;

  document.title = pageTitle;
  updateMetaTag('name', 'description', meta.description);
  updateMetaTag('property', 'og:title', pageTitle);
  updateMetaTag('property', 'og:description', meta.description);
  updateMetaTag('property', 'og:type', 'website');
  updateMetaTag('property', 'og:url', canonicalUrl);
  updateMetaTag('name', 'twitter:title', pageTitle);
  updateMetaTag('name', 'twitter:description', meta.description);
  updateCanonical(canonicalUrl);

  // Clear tab-level specific dynamic JSON-LD
  updateDynamicJsonLd(null);
}

/**
 * Updates dynamic SEO for individual research articles
 */
export function applyArticleSeo(article: EditorialArticle) {
  if (typeof document === 'undefined' || !article) return;

  const title = `${article.title} | Aura 432Hz Research`;
  const desc = article.subtitle || article.summary || DEFAULT_DESCRIPTION;
  const url = `${BASE_URL}/blog?article=${encodeURIComponent(article.id)}`;

  document.title = title;
  updateMetaTag('name', 'description', desc);
  updateMetaTag('property', 'og:title', title);
  updateMetaTag('property', 'og:description', desc);
  updateMetaTag('property', 'og:type', 'article');
  updateMetaTag('property', 'og:url', url);
  updateMetaTag('name', 'twitter:title', title);
  updateMetaTag('name', 'twitter:description', desc);
  updateCanonical(url);

  // Inject Article Structured Data
  updateDynamicJsonLd({
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: desc,
    author: {
      '@type': 'Organization',
      name: 'Aura 432Hz Research Editorial',
    },
    publisher: {
      '@type': 'Organization',
      name: 'Aura 432Hz Sanctuary',
      logo: `${BASE_URL}/icon.svg`,
    },
    mainEntityOfPage: url,
    datePublished: article.publishedDate || '2026-01-01',
  });
}

/**
 * Updates dynamic SEO for individual shop products
 */
export function applyProductSeo(product: SpiritualProduct) {
  if (typeof document === 'undefined' || !product) return;

  const title = `${product.name} | Aura 432Hz Shop`;
  const desc = product.description || product.whyForSanctuary || DEFAULT_DESCRIPTION;
  const url = `${BASE_URL}/gear?product=${encodeURIComponent(product.id)}`;

  document.title = title;
  updateMetaTag('name', 'description', desc);
  updateMetaTag('property', 'og:title', title);
  updateMetaTag('property', 'og:description', desc);
  updateMetaTag('property', 'og:type', 'product');
  updateMetaTag('property', 'og:url', url);
  updateMetaTag('name', 'twitter:title', title);
  updateMetaTag('name', 'twitter:description', desc);
  updateCanonical(url);

  // Inject Product Structured Data
  updateDynamicJsonLd({
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: desc,
    image: `${BASE_URL}/icon.svg`,
    category: product.category,
    brand: {
      '@type': 'Brand',
      name: 'Aura 432Hz Curated',
    },
    offers: {
      '@type': 'Offer',
      price: product.price ? product.price.replace(/[^0-9.]/g, '') : '0.00',
      priceCurrency: 'USD',
      availability: 'https://schema.org/InStock',
      url: product.affiliateUrl || url,
    },
  });
}
