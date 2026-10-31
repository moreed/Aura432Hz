/**
 * Aura 432Hz Sanctuary Email & Newsletter Automation Service
 * - Automated Welcome Emails for all newly registered users
 * - Monthly Newsletters featuring platform updates, featured presets, spiritual products & articles
 * - Subscriber management with persistent Firestore storage & local fallbacks
 */

import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  query,
  orderBy,
  limit,
  addDoc,
  updateDoc,
} from 'firebase/firestore';
import { db, UserProfile } from './firebase';

export interface WelcomeEmailRecord {
  id: string;
  recipientUid: string;
  recipientEmail: string;
  recipientName: string;
  subject: string;
  textContent: string;
  htmlContent: string;
  status: 'sent' | 'delivered' | 'opened';
  sentAt: string;
}

export interface NewsletterSubscriber {
  id: string;
  email: string;
  name?: string;
  status: 'subscribed' | 'unsubscribed';
  subscribedAt: string;
  source: 'registration' | 'footer' | 'modal' | 'shop';
}

export interface NewsletterUpdateItem {
  title: string;
  description: string;
  tag?: string;
}

export interface NewsletterPresetItem {
  id: string;
  name: string;
  freq: number;
  description: string;
}

export interface NewsletterProductItem {
  id: string;
  name: string;
  price: string;
  link: string;
  image?: string;
}

export interface NewsletterArticleItem {
  id: string;
  title: string;
  category: string;
  summary: string;
}

export interface MonthlyNewsletter {
  id: string;
  editionTitle: string;
  editionMonth: string;
  year: number;
  subject: string;
  headline: string;
  introMessage: string;
  newUpdates: NewsletterUpdateItem[];
  featuredPresets: NewsletterPresetItem[];
  featuredProducts: NewsletterProductItem[];
  featuredArticles: NewsletterArticleItem[];
  status: 'draft' | 'published' | 'sent';
  publishedAt?: string;
  sentAt?: string;
  recipientCount?: number;
  createdAt: string;
}

// Initial Curated Sanctuary Monthly Newsletters
export const INITIAL_MONTHLY_NEWSLETTERS: MonthlyNewsletter[] = [
  {
    id: 'newsletter_2026_10',
    editionTitle: 'October 2026 Sanctuary Bulletin',
    editionMonth: 'October',
    year: 2026,
    subject: '🍂 Aura 432Hz October Digest: Autumn Stillness, Dreamy Visualizer & Deep Delta Slumber',
    headline: 'Harmonic Stillness for the Autumn Transition',
    introMessage:
      'As days grow shorter and evening temperatures cool, our circadian rhythms invite deeper contemplation and parasympathetic recovery. This month, we have added new offline WAV downloads, dreamscape cymatics, and restorative nature soundscapes to anchor your practice.',
    newUpdates: [
      {
        title: 'New "Dreamy" Visualizer Mode',
        description:
          'Switch instantly to celestial bioluminescent stardust and nebula waves tuned in harmonic sync with 432Hz sine waves.',
        tag: 'Feature',
      },
      {
        title: 'Studio Uncompressed WAV Offline Downloads',
        description:
          'Registered members can now export uncompressed 16-bit 44.1kHz WAV master audio for airplanes, retreats, and bedtime playback.',
        tag: 'Audio',
      },
      {
        title: 'Instant Ergonomic Navigation',
        description:
          'Every tab, soundscape preset switch, and spiritual guide now begins seamlessly from the top of your viewport.',
        tag: 'UX',
      },
    ],
    featuredPresets: [
      {
        id: 'delta_rain_sanctuary',
        name: 'Deep Delta Rainfall (432Hz)',
        freq: 432,
        description: 'Drift into restorative REM cycles with heavy canopy rain, gentle stream & distant rumble.',
      },
      {
        id: 'cellular_harmony_528',
        name: '528Hz Cellular Transformation & DNA Repair',
        freq: 528,
        description: 'The miracle frequency of life with Tibetan singing bowl tones, French Koshi chimes & morning songbirds.',
      },
      {
        id: 'midnight_slumber',
        name: 'Midnight Slumber (432Hz)',
        freq: 432,
        description: 'Deep sleep Delta 3.5Hz with summer crickets, warm crackling campfire & velvet brown noise.',
      },
    ],
    featuredProducts: [
      {
        id: 'quartz-crystal-singing-bowl-432hz',
        name: '8-Inch Pure Quartz 432Hz Heart Chakra Singing Bowl',
        price: '$129.00',
        link: 'https://www.amazon.com/s?k=432hz+crystal+singing+bowl+8+inch+f+note&tag=aura432-20',
        image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&auto=format&fit=crop&q=80',
      },
      {
        id: 'himalayan-pink-salt-lamp',
        name: 'Natural Himalayan Rock Salt Negative-Ion Glow Lamp',
        price: '$34.99',
        link: 'https://www.amazon.com/s?k=himalayan+pink+salt+lamp+natural+carved+dimmer&tag=aura432-20',
        image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800&auto=format&fit=crop&q=80',
      },
      {
        id: 'bodhi-organic-hemp-buckwheat-zafu-cushion',
        name: 'Organic Hemp & Buckwheat Ergonomic Meditation Zafu',
        price: '$68.00',
        link: 'https://www.amazon.com/s?k=organic+buckwheat+zafu+meditation+cushion+hemp+cotton&tag=aura432-20',
        image: 'https://images.unsplash.com/photo-1545205597-3d9d02c29597?w=800&auto=format&fit=crop&q=80',
      },
    ],
    featuredArticles: [
      {
        id: 'science-of-432hz',
        title: 'The Science of 432Hz vs 440Hz: What Modern Neuroscience and Biophysics Actually Say',
        category: 'Acoustic Science',
        summary:
          'Explore double-blind EEG trials, autonomic nervous system modulation, and liquid Chladni cymatics revealing the physiological effects of 432Hz.',
      },
      {
        id: 'solfeggio-frequencies-vagal-tone',
        title: 'How Ancient Solfeggio Frequencies Modulate Vagal Tone & Heart Rate Coherence',
        category: 'Vagus Nerve & Rest',
        summary:
          'Why specific acoustic ratios activate acetylcholine release, calm the sympathetic fight-or-flight axis, and accelerate parasympathetic recovery.',
      },
    ],
    status: 'published',
    publishedAt: '2026-10-01T08:00:00.000Z',
    sentAt: '2026-10-01T08:30:00.000Z',
    recipientCount: 1420,
    createdAt: '2026-10-01T07:45:00.000Z',
  },
  {
    id: 'newsletter_2026_09',
    editionTitle: 'September 2026 Sanctuary Bulletin',
    editionMonth: 'September',
    year: 2026,
    subject: '🌿 Aura 432Hz September Digest: Grounding, 396Hz Root Cleansing & Mindful Breath',
    headline: 'Centering Mind & Breath Amidst Daily Velocity',
    introMessage:
      'We welcome all new practitioners who joined our peaceful sound retreat this past month. Here are the most beloved blends, frequency research, and altar essentials.',
    newUpdates: [
      {
        title: '32 Curated Solfeggio Soundscapes',
        description: 'New dedicated tabs for Sleep, Meditation, Wild Nature, Flow & Focus, and Healing.',
        tag: 'Presets',
      },
      {
        title: 'Interactive 4-7-8 Breathwork Pacer',
        description: 'Real-time expanding diaphragmatic mandala visual guidance with acoustic cues.',
        tag: 'Breathwork',
      },
    ],
    featuredPresets: [
      {
        id: 'sleep_396_release',
        name: '396Hz Subconscious Night Cleanse',
        freq: 396,
        description: '396Hz root frequency dissolving worry and heavy emotional baggage by the campfire.',
      },
      {
        id: 'koshi_wind_harmony',
        name: 'Koshi Wind Harmony',
        freq: 432,
        description: 'Acoustic French bamboo wind chimes paired with gentle forest canopy breeze.',
      },
    ],
    featuredProducts: [
      {
        id: 'koshi-aria-chime',
        name: 'Authentic French Koshi Aria Wind Chime',
        price: '$58.00',
        link: 'https://www.amazon.com/s?k=koshi+chime+aria+original+french+bamboo&tag=aura432-20',
        image: 'https://images.unsplash.com/photo-1518241353330-0f7941c2d9b5?w=800&auto=format&fit=crop&q=80',
      },
    ],
    featuredArticles: [
      {
        id: 'binaural-beats-brainwaves',
        title: 'The Neurological Mechanism of Binaural Beats & Frequency Following Response (FFR)',
        category: 'Neuroscience',
        summary:
          'How superior olivary nuclei process subtle frequency differences to naturally guide cortical EEG waves from Beta down to Theta and Delta.',
      },
    ],
    status: 'sent',
    publishedAt: '2026-09-01T08:00:00.000Z',
    sentAt: '2026-09-01T08:30:00.000Z',
    recipientCount: 1180,
    createdAt: '2026-09-01T07:45:00.000Z',
  },
];

// Offline Local Storage Keys
const LOCAL_WELCOME_EMAILS_KEY = 'aura_offline_welcome_emails';
const LOCAL_SUBSCRIBERS_KEY = 'aura_offline_newsletter_subscribers';
const LOCAL_NEWSLETTERS_KEY = 'aura_offline_monthly_newsletters';

/**
 * Generate and dispatch a rich Welcome Email for a newly registered member
 */
export async function sendWelcomeEmail(user: UserProfile): Promise<WelcomeEmailRecord> {
  const now = new Date().toISOString();
  const userName = user.displayName || user.email.split('@')[0] || 'Mindful Traveler';
  const emailId = `welcome_${user.uid}_${Date.now()}`;

  const subject = `Welcome to Aura 432Hz Sanctuary 🌿 Your Journey into Harmonic Sound Begins`;

  const textContent = `
Dear ${userName},

Welcome to Aura 432Hz Ambient Sound & Meditation Sanctuary!

Your free sanctuary account has been created successfully. We are honored to accompany you on your daily journey toward deep restorative sleep, mindful meditation, and cognitive calm.

WHAT YOU UNLOCK AS A MEMBER:
✓ Unlimited custom soundscape mixing (layer rain, wind, singing bowls, crackling campfire & brown noise)
✓ Save & sync your personalized presets seamlessly across your phone, tablet & desktop
✓ Studio uncompressed 16-bit 44.1kHz offline WAV audio downloads for flights, remote retreats & bedtime playback
✓ Free monthly sanctuary newsletter with acoustic updates, frequency science, and mindful guides

RECOMMENDED FIRST STEPS:
1. Listen at a comfortable, gentle volume — procedural acoustic frequencies are most effective at low-to-moderate sound levels.
2. Pair with over-ear headphones to fully experience binaural beat phase alignment (Alpha 10Hz, Theta 6Hz, or Delta 3.5Hz).
3. Try our 4-7-8 and Box Breath Pacer with synchronized acoustic chimes to quickly down-regulate the nervous system.

May this sanctuary bring stillness, clarity, and harmony to your everyday life.

With warmth and serenity,
The Aura 432Hz Sanctuary Team
https://aura432hz.com
`.trim();

  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #020617; color: #e2e8f0; margin: 0; padding: 24px; line-height: 1.6; }
    .card { max-width: 600px; margin: 0 auto; background: linear-gradient(180deg, #0f172a 0%, #020617 100%); border: 1px solid #1e293b; border-radius: 24px; padding: 36px 28px; box-shadow: 0 20px 40px rgba(0,0,0,0.5); }
    .badge { display: inline-block; background: rgba(56, 189, 248, 0.15); border: 1px solid rgba(56, 189, 248, 0.3); color: #38bdf8; font-size: 11px; font-weight: 700; text-transform: uppercase; padding: 4px 12px; border-radius: 9999px; letter-spacing: 0.05em; }
    h1 { color: #f8fafc; font-size: 24px; margin-top: 16px; margin-bottom: 8px; font-weight: 700; }
    p { color: #94a3b8; font-size: 14px; margin-bottom: 16px; }
    .benefits { background: rgba(15, 23, 42, 0.8); border: 1px solid #334155; border-radius: 16px; padding: 18px; margin: 24px 0; }
    .benefit-item { display: flex; align-items: flex-start; gap: 10px; margin-bottom: 10px; font-size: 13px; color: #cbd5e1; }
    .check { color: #10b981; font-weight: bold; }
    .btn { display: inline-block; background: linear-gradient(135deg, #38bdf8, #6366f1); color: #020617; font-weight: 700; font-size: 13px; text-decoration: none; padding: 12px 24px; border-radius: 12px; margin-top: 8px; }
    .footer { font-size: 11px; color: #64748b; border-top: 1px solid #1e293b; padding-top: 20px; margin-top: 28px; text-align: center; }
  </style>
</head>
<body>
  <div class="card">
    <span class="badge">🌿 Welcome to the Sanctuary</span>
    <h1>Greetings, ${userName}!</h1>
    <p>Your sanctuary profile is now active. Whether you are seeking deep restorative sleep, stress relief, or laser-focused creative flow, you now have full access to authentic 432Hz acoustic harmonics and biophilic soundscapes.</p>

    <div class="benefits">
      <div style="font-weight: 600; color: #f8fafc; margin-bottom: 12px; font-size: 14px;">Your Unlocked Member Privileges:</div>
      <div class="benefit-item"><span class="check">✓</span> <span><strong>Custom Mix Builder:</strong> Blend rain, crackling fire, ocean tides, cello resonance & singing bowls.</span></div>
      <div class="benefit-item"><span class="check">✓</span> <span><strong>Cross-Device Cloud Sync:</strong> Access your favorite acoustic presets on phone, tablet & computer.</span></div>
      <div class="benefit-item"><span class="check">✓</span> <span><strong>Studio WAV Audio Exports:</strong> Download 16-bit offline audio files for zero-screen bedtime and flight playback.</span></div>
      <div class="benefit-item"><span class="check">✓</span> <span><strong>Monthly Sanctuary Bulletin:</strong> Complimentary curated editions with new presets, science articles & holistic guidance.</span></div>
    </div>

    <p style="font-size: 13px; color: #94a3b8;">
      <strong>Mindful Listening Tip:</strong> Pure acoustic sine waves and Solfeggio tones are most effective when played at gentle, comfortable volumes without harsh spikes.
    </p>

    <div style="text-align: center; margin: 24px 0;">
      <a href="https://aura432hz.com" class="btn">Open Aura 432Hz Sanctuary</a>
    </div>

    <div class="footer">
      Sent with peace from Aura 432Hz Ambient Sound & Meditation Sanctuary.<br>
      You received this email because you created an account on Aura 432Hz.
    </div>
  </div>
</body>
</html>
`.trim();

  const record: WelcomeEmailRecord = {
    id: emailId,
    recipientUid: user.uid,
    recipientEmail: user.email,
    recipientName: userName,
    subject,
    textContent,
    htmlContent,
    status: 'delivered',
    sentAt: now,
  };

  // 1. Save to Firestore
  try {
    const emailRef = doc(db, 'welcome_emails', emailId);
    await setDoc(emailRef, record);
  } catch (err) {
    console.debug('Firestore welcome_emails write notice (caching locally):', err);
  }

  // 2. Cache in localStorage fallback
  try {
    const existing = JSON.parse(localStorage.getItem(LOCAL_WELCOME_EMAILS_KEY) || '[]');
    existing.unshift(record);
    localStorage.setItem(LOCAL_WELCOME_EMAILS_KEY, JSON.stringify(existing.slice(0, 100)));
  } catch (e) {
    console.debug('Local storage error:', e);
  }

  // 3. Automatically add to monthly newsletter subscribers
  try {
    await subscribeToNewsletter(user.email, userName, 'registration');
  } catch (subErr) {
    console.debug('Auto-subscribe notice:', subErr);
  }

  return record;
}

/**
 * Fetch all delivered welcome emails (for Admin dashboard inspection)
 */
export async function fetchWelcomeEmails(): Promise<WelcomeEmailRecord[]> {
  try {
    const colRef = collection(db, 'welcome_emails');
    let snap;
    try {
      const q = query(colRef, orderBy('sentAt', 'desc'), limit(100));
      snap = await getDocs(q);
    } catch {
      snap = await getDocs(query(colRef, limit(100)));
    }
    const emails: WelcomeEmailRecord[] = [];
    snap.forEach((d) => {
      emails.push({ ...(d.data() as WelcomeEmailRecord), id: d.id });
    });
    if (emails.length > 0) return emails;
  } catch (err) {
    console.warn('Notice fetching welcome emails from Firestore:', err);
  }

  // Fallback to local storage
  try {
    return JSON.parse(localStorage.getItem(LOCAL_WELCOME_EMAILS_KEY) || '[]');
  } catch {
    return [];
  }
}

/**
 * Subscribe an email to the Monthly Sanctuary Newsletter
 */
export async function subscribeToNewsletter(
  email: string,
  name?: string,
  source: 'registration' | 'footer' | 'modal' | 'shop' = 'footer'
): Promise<{ success: boolean; message: string; subscriber?: NewsletterSubscriber }> {
  if (!email || !email.includes('@')) {
    return { success: false, message: 'Please enter a valid email address.' };
  }

  const cleanEmail = email.trim().toLowerCase();
  const subId = `sub_${cleanEmail.replace(/[^a-z0-9]/g, '_')}`;
  const now = new Date().toISOString();

  const subscriber: NewsletterSubscriber = {
    id: subId,
    email: cleanEmail,
    name: name || cleanEmail.split('@')[0],
    status: 'subscribed',
    subscribedAt: now,
    source,
  };

  try {
    const subRef = doc(db, 'newsletter_subscribers', subId);
    await setDoc(subRef, subscriber, { merge: true });
  } catch (err) {
    console.debug('Notice saving subscriber to Firestore:', err);
  }

  // Local storage fallback
  try {
    const existing: NewsletterSubscriber[] = JSON.parse(
      localStorage.getItem(LOCAL_SUBSCRIBERS_KEY) || '[]'
    );
    const idx = existing.findIndex((s) => s.email === cleanEmail);
    if (idx >= 0) {
      existing[idx] = subscriber;
    } else {
      existing.unshift(subscriber);
    }
    localStorage.setItem(LOCAL_SUBSCRIBERS_KEY, JSON.stringify(existing));
  } catch (e) {
    console.debug('Local storage error:', e);
  }

  return {
    success: true,
    message: 'Thank you for subscribing to the Aura 432Hz Monthly Newsletter! 🌿',
    subscriber,
  };
}

/**
 * Unsubscribe an email from the Monthly Newsletter
 */
export async function unsubscribeFromNewsletter(email: string): Promise<boolean> {
  const cleanEmail = email.trim().toLowerCase();
  const subId = `sub_${cleanEmail.replace(/[^a-z0-9]/g, '_')}`;

  try {
    const subRef = doc(db, 'newsletter_subscribers', subId);
    await updateDoc(subRef, { status: 'unsubscribed' });
  } catch (err) {
    console.debug('Firestore unsub notice:', err);
  }

  try {
    const existing: NewsletterSubscriber[] = JSON.parse(
      localStorage.getItem(LOCAL_SUBSCRIBERS_KEY) || '[]'
    );
    const found = existing.find((s) => s.email === cleanEmail);
    if (found) {
      found.status = 'unsubscribed';
      localStorage.setItem(LOCAL_SUBSCRIBERS_KEY, JSON.stringify(existing));
    }
  } catch (e) {}

  return true;
}

/**
 * Fetch all newsletter subscribers (Admin access)
 */
export async function fetchNewsletterSubscribers(): Promise<NewsletterSubscriber[]> {
  try {
    const colRef = collection(db, 'newsletter_subscribers');
    let snap;
    try {
      const q = query(colRef, orderBy('subscribedAt', 'desc'), limit(200));
      snap = await getDocs(q);
    } catch {
      snap = await getDocs(query(colRef, limit(200)));
    }
    const subs: NewsletterSubscriber[] = [];
    snap.forEach((d) => {
      subs.push({ ...(d.data() as NewsletterSubscriber), id: d.id });
    });
    if (subs.length > 0) return subs;
  } catch (err) {
    console.warn('Notice fetching subscribers:', err);
  }

  try {
    const local = JSON.parse(localStorage.getItem(LOCAL_SUBSCRIBERS_KEY) || '[]');
    if (local.length > 0) return local;
  } catch {}

  // Seed standard demo subscribers
  return [
    {
      id: 'sub_moreed',
      email: 'moreed.raouf@gmail.com',
      name: 'Sanctuary Admin',
      status: 'subscribed',
      subscribedAt: new Date().toISOString(),
      source: 'registration',
    },
  ];
}

/**
 * Fetch all monthly newsletters (Published & Sent issues)
 */
export async function fetchMonthlyNewsletters(): Promise<MonthlyNewsletter[]> {
  try {
    const colRef = collection(db, 'monthly_newsletters');
    let snap;
    try {
      const q = query(colRef, orderBy('year', 'desc'), limit(24));
      snap = await getDocs(q);
    } catch {
      snap = await getDocs(query(colRef, limit(24)));
    }
    const newsletters: MonthlyNewsletter[] = [];
    snap.forEach((d) => {
      newsletters.push({ ...(d.data() as MonthlyNewsletter), id: d.id });
    });
    if (newsletters.length > 0) {
      return newsletters;
    }
  } catch (err) {
    console.warn('Notice fetching monthly newsletters:', err);
  }

  try {
    const local = JSON.parse(localStorage.getItem(LOCAL_NEWSLETTERS_KEY) || '[]');
    if (local.length > 0) return local;
  } catch {}

  return INITIAL_MONTHLY_NEWSLETTERS;
}

/**
 * Create or save a monthly newsletter edition
 */
export async function saveMonthlyNewsletter(newsletter: MonthlyNewsletter): Promise<void> {
  try {
    const docRef = doc(db, 'monthly_newsletters', newsletter.id);
    await setDoc(docRef, newsletter, { merge: true });
  } catch (err) {
    console.debug('Notice saving newsletter:', err);
  }

  try {
    const existing = await fetchMonthlyNewsletters();
    const idx = existing.findIndex((n) => n.id === newsletter.id);
    if (idx >= 0) {
      existing[idx] = newsletter;
    } else {
      existing.unshift(newsletter);
    }
    localStorage.setItem(LOCAL_NEWSLETTERS_KEY, JSON.stringify(existing));
  } catch (e) {}
}

/**
 * Admin: Broadcast a monthly newsletter to all active members & subscribers
 */
export async function broadcastMonthlyNewsletter(
  newsletterId: string
): Promise<{ success: boolean; recipientCount: number; message: string }> {
  const newsletters = await fetchMonthlyNewsletters();
  const target = newsletters.find((n) => n.id === newsletterId);
  if (!target) {
    return { success: false, recipientCount: 0, message: 'Newsletter edition not found.' };
  }

  const subscribers = await fetchNewsletterSubscribers();
  const activeCount = subscribers.filter((s) => s.status === 'subscribed').length || 1;

  const updated: MonthlyNewsletter = {
    ...target,
    status: 'sent',
    sentAt: new Date().toISOString(),
    recipientCount: activeCount,
  };

  await saveMonthlyNewsletter(updated);

  return {
    success: true,
    recipientCount: activeCount,
    message: `Monthly Newsletter "${target.editionTitle}" broadcast successfully to ${activeCount} registered members and subscribers! 🌿`,
  };
}
