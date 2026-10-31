import React from 'react';
import { SpiritualShopSection } from './SpiritualShopSection';
import { SPIRITUAL_AND_AUDIO_PRODUCTS, SpiritualProduct } from '../data/spiritualProducts';

// Re-export for backward compatibility
export { SpiritualShopSection, SPIRITUAL_AND_AUDIO_PRODUCTS };
export type { SpiritualProduct };
export type AudioProduct = SpiritualProduct;
export const RECOMMENDED_AUDIO_GEAR = SPIRITUAL_AND_AUDIO_PRODUCTS;

export const AudioGearSection: React.FC = () => {
  return <SpiritualShopSection />;
};
