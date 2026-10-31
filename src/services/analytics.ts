/**
 * Aura 432Hz — Privacy-First Analytics Abstraction
 * 
 * Privacy & Compliance:
 * - Zero health, biometric, or personally identifiable data is ever collected.
 * - Tracks only functional interface telemetry, session milestones, and affiliate clicks.
 * - Events are kept in-memory / local storage and can bridge to any analytics provider
 *   (e.g., Google Analytics 4, Plausible, or PostHog) once configured by the app owner.
 */

export type AnalyticsEventType =
  | 'play_started'
  | 'play_paused'
  | 'play_paused_instant'
  | 'play_fade_resumed'
  | 'play_paused_fade_started'
  | 'play_paused_fade_completed'
  | 'play_paused_fade'
  | 'play_completed'
  | 'listen_5_min'
  | 'listen_15_min'
  | 'listen_30_min'
  | 'preset_selected'
  | 'timer_started'
  | 'advanced_controls_opened'
  | 'signup_started'
  | 'signup_completed'
  | 'saved_preset'
  | 'affiliate_card_viewed'
  | 'affiliate_clicked'
  | 'shop_clicked'
  | 'ad_slot_viewed';

export interface AnalyticsEventPayload {
  freq?: number;
  mode?: string;
  presetId?: string;
  durationSeconds?: number;
  productId?: string;
  partner?: string;
  slotId?: string;
  minutes?: number;
  source?: string;
}

export interface StoredAnalyticsEvent {
  event: AnalyticsEventType;
  payload?: AnalyticsEventPayload;
  timestamp: string;
}

const STORAGE_KEY = 'aura_analytics_log';
const MAX_STORED_EVENTS = 100;

class AnalyticsService {
  private isEnabled = true;

  public track(event: AnalyticsEventType, payload?: AnalyticsEventPayload) {
    if (!this.isEnabled) return;

    const entry: StoredAnalyticsEvent = {
      event,
      payload,
      timestamp: new Date().toISOString(),
    };

    // Safe dev log
    if (process.env.NODE_ENV !== 'production') {
      console.log(`[Aura Analytics] ${event}`, payload || {});
    }

    // Window dataLayer bridge for GTM / GA4 if present
    if (typeof window !== 'undefined' && (window as any).dataLayer) {
      (window as any).dataLayer.push({
        event,
        ...payload,
      });
    }

    // Keep lightweight local history for admin telemetry
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const list: StoredAnalyticsEvent[] = raw ? JSON.parse(raw) : [];
      list.push(entry);
      if (list.length > MAX_STORED_EVENTS) {
        list.splice(0, list.length - MAX_STORED_EVENTS);
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    } catch {
      // Storage unavailable or quota exceeded
    }
  }

  public getRecentEvents(): StoredAnalyticsEvent[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  public clearEvents() {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {}
  }
}

export const analytics = new AnalyticsService();
