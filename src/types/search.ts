import { MixPreset } from '../services/storage';
import { NatureSoundState, BrainwaveMode } from '../services/audioEngine';
import { SpiritualProduct } from '../data/spiritualProducts';
import { EditorialArticle } from '../services/editorialStorage';
import { BuyingGuideArticle } from '../components/BuyingGuidesSection';

export type SearchCategoryFilter = 'all' | 'soundscapes' | 'layers' | 'products' | 'science';

export type SearchItemType =
  | 'soundscape'
  | 'solfeggio'
  | 'brainwave'
  | 'acoustic_layer'
  | 'product'
  | 'editorial_article'
  | 'buying_guide'
  | 'acoustic_safety';

export interface SearchResultItem {
  id: string;
  type: SearchItemType;
  category: 'soundscapes' | 'layers' | 'products' | 'science';
  title: string;
  subtitle?: string;
  description: string;
  tags: string[];
  badge: string;
  badgeColor: string;
  iconName: string;
  highlightMatch?: string;

  // Type-specific payloads
  preset?: MixPreset;
  frequencyHz?: number;
  brainwaveMode?: BrainwaveMode;
  layer?: NatureSoundState;
  product?: SpiritualProduct;
  article?: EditorialArticle;
  buyingGuide?: BuyingGuideArticle;
}
