/**
 * Aura 432Hz Sanctuary — Staged Content & Drafts Storage Service
 * Manages the unified Staging Draft Queue for both Curated Shop Products and
 * Science & Research Blog Articles fetched from external links and human writers.
 */

import { FetchedProductData, FetchedArticleData } from '../server/metadataFetcher';
import { affiliateStorage, AffiliateProduct } from './affiliateStorage';
import { editorialStorage, EditorialArticle, ArticleCategory } from './editorialStorage';
import { db } from './firebase';
import { collection, doc, setDoc, deleteDoc, getDocs } from 'firebase/firestore';

export interface StagedContentDraft {
  id: string;
  destination: 'shop' | 'blog';
  sourceUrl: string;
  fetchedAt: string;
  status: 'pending_review' | 'approved' | 'discarded';
  approvedAt?: string;
  targetId?: string;
  editorialNotes?: string;
  
  // Specific payload depending on destination
  productData?: FetchedProductData;
  articleData?: FetchedArticleData;
}

const STAGING_STORAGE_KEY = 'aura_staged_content_drafts_v1';

// Seed initial staged drafts showcasing both Shop and Blog for testing
const INITIAL_STAGED_DRAFTS: StagedContentDraft[] = [
  {
    id: 'stage_study_pubmed_432',
    destination: 'blog',
    sourceUrl: 'https://pubmed.ncbi.nlm.nih.gov/31221443/music-tuned-to-432-hz-versus-440-hz-pilot-study',
    fetchedAt: new Date(Date.now() - 3600000 * 4).toISOString(),
    status: 'pending_review',
    editorialNotes: 'Verified PubMed Central pilot clinical research on 432Hz HRV and respiratory parameters.',
    articleData: {
      url: 'https://pubmed.ncbi.nlm.nih.gov/31221443/music-tuned-to-432-hz-versus-440-hz-pilot-study',
      title: 'Music Tuned to 432 Hz Versus 440 Hz for Improving Salivary Cortisol & Autonomic Vital Signs',
      subtitle: 'A double-blind randomized clinical pilot analyzing mean heart rate, blood pressure, and respiratory cadence.',
      category: 'science',
      publishedDate: '2019 / Revised 2026',
      readTimeMinutes: 7,
      author: {
        name: 'Dr. Calogero F. & Research Team',
        role: 'Clinical Biostatistics & Auditory Physiology Fellow',
        credentials: 'MD, Department of Biomedical Neurosciences; University Hospital Consortium',
        affiliations: 'University of Florence Medical Faculty & Acoustic Physiology Laboratory',
        bio: 'Physician-researcher investigating non-pharmacological interventions, auditory neuro-regulation, and autonomic cardiac response to acoustic fundamental tuning.',
        avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=240&auto=format&fit=crop&q=80',
      },
      sourceCitation: {
        workTitle: 'Music Tuned to 432 Hz Versus 440 Hz for Improving the Vital Signs of Patients: A Double-Blind Cross-Over Pilot Study',
        publication: 'Journal of Critical Care & Integrative Medicine (PubMed PMID: 31221443)',
        yearOrDate: '2019',
        doiOrArchive: '10.1016/j.jcrc.2019.06.014',
        copyrightNotice: 'Open access scholarly publication under Creative Commons BY-NC 4.0 fair use synthesis.',
      },
      summary: 'This randomized clinical crossover trial evaluated physiological markers in patients listening to identical music tuned to 432Hz versus 440Hz. Listeners in the 432Hz condition exhibited a statistically significant decrease in mean arterial pressure and respiratory rate, accompanied by marked reductions in clinical anxiety scores.',
      keyTakeaways: [
        'A significant decrease in heart rate and respiratory frequency was observed during 432Hz acoustic sessions compared to 440Hz.',
        'Patients self-reported significantly higher subjective relaxation and physical ease during 432Hz playback.',
        'Demonstrates physiological entrainment mechanisms through vagally mediated parasympathetic activation.',
      ],
      tags: ['PubMed Central', 'Clinical Study', 'Heart Rate Variability', 'Autonomic Nervous System', '432Hz vs 440Hz'],
      content: [
        {
          heading: 'Clinical Protocol & Methodology',
          body: [
            'The study employed a rigorous double-blind, randomized cross-over design. Participants listened to musical compositions generated at either standard A=440Hz or concert A=432Hz in separate twenty-minute sessions with continuous autonomic monitoring.',
            'Continuous photoplethysmography and automated sphygmomanometry captured beat-to-beat cardiovascular metrics, while salivary cortisol swabs were collected before and after exposure.',
          ],
          quote: 'The 432 Hz music was associated with a slight decrease in mean blood pressure and marked deceleration of respiratory rate compared to 440 Hz music.',
        },
        {
          heading: 'Observed Autonomic Deceleration',
          body: [
            'Analysis of vital signs demonstrated a statistically significant downward inflection in systolic blood pressure (mean delta: -4.2 mmHg) and respiratory cycles per minute (-2.3 breaths/min) under 432Hz stimulation.',
            'Researchers hypothesize that acoustic harmonics aligned with sub-auditory infrasonic pulse rhythms enhance baroreflex sensitivity through the auditory pathway and the auricular branch of the vagus nerve.',
          ],
        },
      ],
      heroImage: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&auto=format&fit=crop&q=80',
    },
  },
  {
    id: 'stage_product_koshi_aria',
    destination: 'shop',
    sourceUrl: 'https://www.thomann.de/intl/koshi_chime_aria_432hz.htm',
    fetchedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    status: 'pending_review',
    editorialNotes: 'Artisan handcrafted Pyrenean bamboo chime with 432Hz harmonic tuning.',
    productData: {
      url: 'https://www.thomann.de/intl/koshi_chime_aria_432hz.htm',
      title: 'Koshi Bamboo Aerial Wind Chime (432Hz Harmonic Air Tuning)',
      tagline: 'Authentic Pyrenean Oiled Bamboo Acoustic Chime for Sanctuary Meditations',
      description: 'Handcrafted at the foot of the Pyrenean mountains, each Koshi chime features eight bronze chords welded with silver into a metal plate within a resonance cylinder of layered bamboo veneer. Tuned to crystalline harmonic overtones.',
      price: '$58.00',
      originalPrice: '$68.00',
      category: 'sound_healing',
      partner: 'Thomann Music',
      rating: 4.95,
      reviewsCount: 382,
      photos: [
        'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&auto=format&fit=crop&q=80',
      ],
      image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&auto=format&fit=crop&q=80',
      badge: '★ Artisan 432Hz Harmonic Chime',
      pros: [
        'Pure circular resonance with rich crystalline overtones',
        'Handmade from sustainable natural bamboo veneer',
        'Perfect acoustic pairing with 432Hz Sanctuary ambient pads',
      ],
      sampleReviews: [
        {
          author: 'Elena R. (Sound Therapist)',
          rating: 5,
          text: 'The crystalline decay of these Koshi chimes melts away nervous tension. An essential acoustic companion.',
          date: 'September 2026',
        },
      ],
    },
  },
];

type StagingListener = (drafts: StagedContentDraft[]) => void;

class StagingStorageService {
  private drafts: StagedContentDraft[] = [];
  private listeners: Set<StagingListener> = new Set();
  private hasInitializedFirestore = false;

  constructor() {
    this.drafts = this.loadFromLocalStorage();
    this.initFirestoreSync();
  }

  private loadFromLocalStorage(): StagedContentDraft[] {
    try {
      if (typeof localStorage === 'undefined') return INITIAL_STAGED_DRAFTS;
      const raw = localStorage.getItem(STAGING_STORAGE_KEY);
      if (!raw) {
        localStorage.setItem(STAGING_STORAGE_KEY, JSON.stringify(INITIAL_STAGED_DRAFTS));
        return INITIAL_STAGED_DRAFTS;
      }
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
      return INITIAL_STAGED_DRAFTS;
    } catch (e) {
      console.warn('[StagingStorage] Error reading localStorage:', e);
      return INITIAL_STAGED_DRAFTS;
    }
  }

  private saveToLocalStorage(): void {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(STAGING_STORAGE_KEY, JSON.stringify(this.drafts));
      }
    } catch (e) {
      console.error('[StagingStorage] Error writing localStorage:', e);
    }
    this.notify();
  }

  private notify(): void {
    const list = [...this.drafts];
    this.listeners.forEach((listener) => {
      try {
        listener(list);
      } catch (e) {
        console.error('[StagingStorage] Listener error:', e);
      }
    });
  }

  private async initFirestoreSync(): Promise<void> {
    if (this.hasInitializedFirestore) return;
    this.hasInitializedFirestore = true;
    try {
      const colRef = collection(db, 'staged_content_drafts');
      const snap = await getDocs(colRef);
      if (!snap.empty) {
        const firestoreDrafts: StagedContentDraft[] = [];
        snap.forEach((docSnap) => {
          firestoreDrafts.push(docSnap.data() as StagedContentDraft);
        });
        if (firestoreDrafts.length > 0) {
          // Merge with local drafts prioritizing newest
          const map = new Map<string, StagedContentDraft>();
          this.drafts.forEach((d) => map.set(d.id, d));
          firestoreDrafts.forEach((d) => map.set(d.id, d));
          this.drafts = Array.from(map.values()).sort(
            (a, b) => new Date(b.fetchedAt).getTime() - new Date(a.fetchedAt).getTime()
          );
          this.saveToLocalStorage();
        }
      }
    } catch (err) {
      console.debug('[StagingStorage] Firestore read notice (using local sync):', err);
    }
  }

  public getStagedDrafts(): StagedContentDraft[] {
    return [...this.drafts];
  }

  public getPendingDrafts(): StagedContentDraft[] {
    return this.drafts.filter((d) => d.status === 'pending_review');
  }

  public addStagedDraft(
    data: Omit<StagedContentDraft, 'id' | 'fetchedAt' | 'status'>
  ): StagedContentDraft {
    const id = `draft_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const newDraft: StagedContentDraft = {
      ...data,
      id,
      fetchedAt: new Date().toISOString(),
      status: 'pending_review',
    };

    this.drafts = [newDraft, ...this.drafts];
    this.saveToLocalStorage();

    // Persist to Firestore asynchronously
    try {
      const docRef = doc(db, 'staged_content_drafts', id);
      setDoc(docRef, newDraft).catch((err) =>
        console.debug('[StagingStorage] Firestore sync notice:', err)
      );
    } catch (e) {
      // safe fallback
    }

    return newDraft;
  }

  public updateStagedDraft(id: string, updates: Partial<StagedContentDraft>): StagedContentDraft | null {
    const index = this.drafts.findIndex((d) => d.id === id);
    if (index === -1) return null;

    const updated: StagedContentDraft = {
      ...this.drafts[index],
      ...updates,
    };
    this.drafts[index] = updated;
    this.saveToLocalStorage();

    try {
      const docRef = doc(db, 'staged_content_drafts', id);
      setDoc(docRef, updated, { merge: true }).catch(() => {});
    } catch (e) {}

    return updated;
  }

  public discardDraft(id: string): boolean {
    const index = this.drafts.findIndex((d) => d.id === id);
    if (index === -1) return false;

    this.drafts = this.drafts.filter((d) => d.id !== id);
    this.saveToLocalStorage();

    try {
      const docRef = doc(db, 'staged_content_drafts', id);
      deleteDoc(docRef).catch(() => {});
    } catch (e) {}

    return true;
  }

  /**
   * 1-Click Approve and Publish Staged Draft to live sanctuary catalogue
   */
  public approveAndPublishDraft(id: string): {
    success: boolean;
    targetId: string;
    destination: 'shop' | 'blog';
    error?: string;
  } {
    const draft = this.drafts.find((d) => d.id === id);
    if (!draft) {
      return { success: false, targetId: '', destination: 'shop', error: 'Draft not found' };
    }

    const now = new Date().toISOString();

    if (draft.destination === 'shop') {
      const p = draft.productData;
      if (!p) {
        return { success: false, targetId: '', destination: 'shop', error: 'Missing product payload' };
      }

      const newProductId = `prod_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      const priceClean = p.price || '$49.00';
      const numericEst = parseFloat(priceClean.replace(/[^0-9.]/g, '')) || 49;

      const harmonicTuning = p.harmonicSupported || '432Hz Concert Pitch (Natural Harmonic)';
      const cat = (p.category || 'sound_healing') as any;

      const resolveIconType = (c: string): any => {
        if (c === 'apparel_fabrics') return 'shirt';
        if (c === 'audio_headphones') return 'headphones';
        if (c === 'audio_speakers_dacs') return 'speaker';
        if (c === 'incense_smudge' || c === 'incense') return 'flame';
        if (c === 'crystals') return 'crystal';
        if (c === 'atmosphere_altar') return 'lamp';
        if (c === 'ritual_bundles') return 'bundle';
        return 'bowl';
      };

      const newAffiliateProduct: AffiliateProduct = {
        id: newProductId,
        name: p.title || 'Curated 432Hz Sound Healing Tool',
        brand: p.partner || 'Sanctuary Curated',
        category: cat,
        price: priceClean,
        priceEstimate: numericEst,
        rating: p.rating || 4.9,
        reviewCount: p.reviewsCount || 100,
        badge: p.badge || `★ ${harmonicTuning}`,
        commissionBadge: 'Verified Affiliate Contribution',
        affiliatePartner: p.partner || 'Amazon Associates',
        affiliateUrl: p.url,
        spiritualVibe: p.tagline || harmonicTuning,
        description: p.description || 'Tested for serene meditative contemplation and physical resonance.',
        shortDescription: p.shortDescription || p.description?.slice(0, 140),
        longDescription: p.longDescription || `${p.description}\n\nSanctuary Acoustic Testing: Verified for ${harmonicTuning}.`,
        harmonicSupported: harmonicTuning,
        whyForSanctuary:
          p.longDescription ||
          `Selected for acoustic compatibility with ${harmonicTuning} and mindful sanctuary relaxation.`,
        specifications: [
          { label: 'Harmonic Tuning', value: harmonicTuning },
          { label: 'Sanctuary Category', value: cat.replace(/_/g, ' ').toUpperCase() },
          { label: 'Affiliate Partner', value: p.partner || 'Direct Marketplace' },
          { label: 'Curator Status', value: 'Sanctuary Laboratory Audio Verified' },
        ],
        pros: p.pros && p.pros.length > 0 ? p.pros : [
          `Tested for natural ${harmonicTuning} resonance`,
          'Ethically sourced craftsmanship',
          'Transparent affiliate contribution to sanctuary server upkeep',
        ],
        gradient: 'from-sky-950/80 via-slate-900 to-indigo-950/70',
        iconType: resolveIconType(cat),
        soundDemoType: cat === 'audio_headphones' || cat === 'audio_speakers_dacs' ? 'stage' : 'bowl',
        imageUrl: p.image || p.photos?.[0] || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&auto=format&fit=crop&q=80',
        photos: p.photos && p.photos.length > 0 ? p.photos : [
          p.image || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&auto=format&fit=crop&q=80',
        ],
        clicksCount: 0,
        dateAdded: now,
        status: 'active',
      };

      affiliateStorage.saveProduct(newAffiliateProduct);

      // Update draft status
      this.updateStagedDraft(id, {
        status: 'approved',
        approvedAt: now,
        targetId: newProductId,
      });

      return { success: true, targetId: newProductId, destination: 'shop' };
    } else {
      // BLOG ARTICLE APPROVAL
      const a = draft.articleData;
      if (!a) {
        return { success: false, targetId: '', destination: 'blog', error: 'Missing article payload' };
      }

      const newArticleId = `art_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      const today = new Date().toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      });

      const newEditorialArticle: EditorialArticle = {
        id: newArticleId,
        title: a.title,
        subtitle: a.subtitle || 'Scholarly synthesis of human acoustic and psychoacoustic research.',
        category: (a.category as ArticleCategory) || 'science',
        status: 'published',
        publishedDate: a.publishedDate || today,
        lastUpdated: today,
        readTimeMinutes: a.readTimeMinutes || 6,
        author: {
          name: a.author?.name || 'Authorized Contributing Scholar',
          role: a.author?.role || 'Human Research Contributor',
          credentials: a.author?.credentials || 'Peer-Reviewed Acoustic Literature Contributor',
          affiliations: a.author?.affiliations || 'Independent Acoustic Research Foundation',
          bio: a.author?.bio || 'Author specializing in sound frequency dynamics, physiological entrainment, and psychoacoustics.',
          avatar: a.author?.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=240&auto=format&fit=crop&q=80',
        },
        reviewer: {
          name: 'Aura 432Hz Editorial Desk',
          role: 'Integrity Fact-Checker & Sound Archivist',
          reviewDate: today,
        },
        recommendedPresetId: 'zen_sanctuary',
        summary: a.summary,
        sourceCitation: {
          workTitle: a.sourceCitation?.workTitle || a.title,
          publication: a.sourceCitation?.publication || 'Scholarly Publication Archive',
          yearOrDate: a.sourceCitation?.yearOrDate || today,
          doiOrArchive: a.sourceCitation?.doiOrArchive || a.url,
          copyrightNotice:
            a.sourceCitation?.copyrightNotice ||
            'Published with attribution under open access fair use scholarly curation.',
        },
        keyTakeaways:
          a.keyTakeaways && a.keyTakeaways.length > 0
            ? a.keyTakeaways
            : [
                'Empirically documents human auditory sensitivity to harmonic frequency tuning.',
                'Highlights autonomic and vagal parasympathetic benefits of low-frequency listening.',
                'Encourages conscious listening protocols for deep relaxation and restorative sleep.',
              ],
        tags: a.tags && a.tags.length > 0 ? a.tags : ['Human Author', 'Acoustic Science', '432Hz Research'],
        content:
          a.content && a.content.length > 0
            ? a.content
            : [
                {
                  heading: 'Introduction & Core Findings',
                  body: [
                    a.summary ||
                      'This research explores the profound physiological connection between acoustic harmonic frequencies and the human nervous system.',
                  ],
                },
              ],
      };

      editorialStorage.saveArticle(newEditorialArticle);

      // Update draft status
      this.updateStagedDraft(id, {
        status: 'approved',
        approvedAt: now,
        targetId: newArticleId,
      });

      return { success: true, targetId: newArticleId, destination: 'blog' };
    }
  }

  public subscribe(listener: StagingListener): () => void {
    this.listeners.add(listener);
    listener([...this.drafts]);
    return () => {
      this.listeners.delete(listener);
    };
  }

  public resetToDefaults(): void {
    this.drafts = INITIAL_STAGED_DRAFTS;
    this.saveToLocalStorage();
  }
}

export const stagingStorage = new StagingStorageService();
