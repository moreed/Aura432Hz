/**
 * Aura 432Hz — Monetization & Compliance Configuration
 * Central configuration for Google AdSense and Affiliate Programs.
 * 
 * Safety & Publisher Policy:
 * - AdSense slots remain disabled by default until manually reviewed and approved.
 * - Outbound affiliate links strictly use rel="sponsored noopener noreferrer".
 * - Affiliate disclosures are standardized across all product cards and editorial pages.
 */

export interface MonetizationConfig {
  adsenseEnabled: boolean;
  adsenseClientId: string;
  adSlots: {
    editorialInContent: string;
    buyingGuideFooter: string;
    desktopSidebar: string;
  };
  affiliateDisclosure: {
    standard: string;
    compact: string;
  };
  amazonTag: string;
}

export const MONETIZATION_CONFIG: MonetizationConfig = {
  // Kept disabled behind feature flag until manual approval
  adsenseEnabled: false,
  adsenseClientId: 'ca-pub-XXXXXXXXXXXXXXXX',
  adSlots: {
    editorialInContent: '1092837465',
    buyingGuideFooter: '2837465019',
    desktopSidebar: '3746501928',
  },
  affiliateDisclosure: {
    standard:
      'Some links are affiliate links. If you purchase through them, Aura 432Hz may earn a commission at no additional cost to you. This does not change our testing or opinion.',
    compact:
      'Aura 432Hz may earn an affiliate commission on qualifying purchases at zero extra cost to you.',
  },
  // Placeholder tag clearly marked for replacement by the site owner
  amazonTag: 'aura432-20',
};
