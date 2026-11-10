import {
  collection,
  getDocs,
  doc,
  setDoc,
  deleteDoc,
  query,
  orderBy,
} from 'firebase/firestore';
import { db } from './firebase';
import {
  CommissionEarning,
  OperatingExpense,
  FinancialSummary,
  DateFilterConfig,
  MonthlyFinancialSummary,
  CommissionType,
  ExpenseCategory,
  FinancialImportResult,
  ExpenseCostType,
  ExpenseBillingCycle,
} from '../types/finance';
import {
  downloadCSV,
  downloadJSON,
  downloadText,
  printIsolatedDocument,
} from './printService';

const STORAGE_KEY_EARNINGS = 'aura_finance_commission_earnings_v2';
const STORAGE_KEY_EXPENSES = 'aura_finance_operating_expenses_v2';
const STORAGE_KEY_CLEARED = 'aura_finance_data_cleared_v2';

// Set cleared flag by default to fulfill user request to clear all transactions
if (typeof window !== 'undefined' && !localStorage.getItem(STORAGE_KEY_CLEARED)) {
  try {
    localStorage.setItem(STORAGE_KEY_CLEARED, 'true');
    localStorage.setItem(STORAGE_KEY_EARNINGS, '[]');
    localStorage.setItem(STORAGE_KEY_EXPENSES, '[]');
  } catch {}
}

// Initial realistic default dataset (kept for optional reference or schema definition)
const DEFAULT_COMMISSIONS: CommissionEarning[] = [
  {
    id: 'comm-001',
    title: '432Hz Frosted Quartz Singing Bowl (8-Inch C Note)',
    type: 'affiliate_store',
    partnerOrPlatform: 'SoundCraft Pro Affiliate',
    orderReference: 'ORD-SC-8831',
    saleAmount: 189.0,
    commissionRate: 15,
    netEarnings: 28.35,
    currency: 'USD',
    status: 'received',
    date: '2026-03-24',
    notes: 'Sold via Gear Sanctuary shop banner',
    createdAt: '2026-03-24T14:30:00Z',
  },
  {
    id: 'comm-002',
    title: 'Shure AONIC 50 Gen 2 Wireless Studio Headphones',
    type: 'affiliate_store',
    partnerOrPlatform: 'Sweetwater Audio Partner',
    orderReference: 'SW-991204',
    saleAmount: 349.0,
    commissionRate: 10,
    netEarnings: 34.9,
    currency: 'USD',
    status: 'received',
    date: '2026-03-20',
    notes: 'Acoustic monitoring gear guide recommendation',
    createdAt: '2026-03-20T11:15:00Z',
  },
  {
    id: 'comm-003',
    title: 'Custom 432Hz Restorative Ambient Album Commission',
    type: 'custom_external',
    partnerOrPlatform: 'Soma Yoga Studio Berlin',
    orderReference: 'ORD-SOMA-2026',
    saleAmount: 650.0,
    commissionRate: 100,
    netEarnings: 650.0,
    currency: 'USD',
    status: 'received',
    date: '2026-03-01',
    notes: 'Client commissioned 60-min exclusive restorative soundscape',
    createdAt: '2026-03-01T09:00:00Z',
  },
  {
    id: 'comm-004',
    title: 'Chakra Tuned Aluminum Tuning Forks (Set of 8)',
    type: 'affiliate_store',
    partnerOrPlatform: 'Aura Store Amazon',
    orderReference: 'AMZ-882-9912',
    saleAmount: 95.0,
    commissionRate: 12,
    netEarnings: 11.4,
    currency: 'USD',
    status: 'received',
    date: '2026-03-14',
    notes: 'Affiliate referral link from Frequency Guide article',
    createdAt: '2026-03-14T16:20:00Z',
  },
  {
    id: 'comm-005',
    title: 'Binaural Mind Spa App Referral Program',
    type: 'partner_referral',
    partnerOrPlatform: 'MindSpa Network',
    orderReference: 'REF-MS-441',
    saleAmount: 120.0,
    commissionRate: 25,
    netEarnings: 30.0,
    currency: 'USD',
    status: 'received',
    date: '2026-03-08',
    notes: 'Annual partner referral subscription bonus',
    createdAt: '2026-03-08T10:05:00Z',
  },
  {
    id: 'comm-006',
    title: 'Bespoke Solfeggio Sleep Soundscapes for Wellness App',
    type: 'custom_external',
    partnerOrPlatform: 'CalmSphere Inc',
    orderReference: 'ORD-CS-901',
    saleAmount: 850.0,
    commissionRate: 100,
    netEarnings: 850.0,
    currency: 'USD',
    status: 'pending',
    date: '2026-04-02',
    notes: 'Invoice sent, payment net-30 pending clearance',
    createdAt: '2026-04-02T13:40:00Z',
  },
  {
    id: 'comm-007',
    title: 'Handmade Tibetan Copper Meditation Singing Bowl',
    type: 'affiliate_store',
    partnerOrPlatform: 'SoundCraft Pro Affiliate',
    orderReference: 'ORD-SC-7719',
    saleAmount: 145.0,
    commissionRate: 15,
    netEarnings: 21.75,
    currency: 'USD',
    status: 'received',
    date: '2026-02-18',
    notes: 'Tibetan singing bowl featured in sound bath demo',
    createdAt: '2026-02-18T18:10:00Z',
  },
  {
    id: 'comm-008',
    title: 'Acoustic Diffusion Foam Panels (12-Pack Charcoal)',
    type: 'affiliate_store',
    partnerOrPlatform: 'Aura Store Amazon',
    orderReference: 'AMZ-119-3320',
    saleAmount: 78.0,
    commissionRate: 10,
    netEarnings: 7.8,
    currency: 'USD',
    status: 'received',
    date: '2026-02-10',
    notes: 'Studio acoustics recommendation article',
    createdAt: '2026-02-10T12:00:00Z',
  },
  {
    id: 'comm-009',
    title: 'Sacred Geometry Meditation Cushion Partner Program',
    type: 'partner_referral',
    partnerOrPlatform: 'ZenLiving Referrals',
    orderReference: 'REF-ZL-802',
    saleAmount: 85.0,
    commissionRate: 20,
    netEarnings: 17.0,
    currency: 'USD',
    status: 'received',
    date: '2026-01-22',
    notes: 'Partner referral coupon code AURA432',
    createdAt: '2026-01-22T08:30:00Z',
  },
  {
    id: 'comm-010',
    title: 'Custom Corporate Relaxation Soundbath Soundtrack',
    type: 'custom_external',
    partnerOrPlatform: 'Aura Retreats Zurich',
    orderReference: 'ORD-AR-440',
    saleAmount: 500.0,
    commissionRate: 100,
    netEarnings: 500.0,
    currency: 'USD',
    status: 'received',
    date: '2026-01-15',
    notes: 'Mastered 30-min binaural wave journey',
    createdAt: '2026-01-15T15:00:00Z',
  },
];

const DEFAULT_EXPENSES: OperatingExpense[] = [
  {
    id: 'exp-001',
    title: 'Google Cloud Run & Cloud SQL Production Hosting',
    category: 'hosting',
    costType: 'recurring_subscription',
    billingCycle: 'monthly',
    amount: 42.5,
    currency: 'USD',
    status: 'paid',
    vendor: 'Google Cloud Platform',
    date: '2026-03-01',
    renewalDate: '2026-04-01',
    invoiceRef: 'GCP-INV-2026-03',
    notes: 'Containerized hosting and PostgreSQL database instance',
    createdAt: '2026-03-01T08:00:00Z',
  },
  {
    id: 'exp-002',
    title: 'Cloudflare Pro Domain DNS & CDN Protection',
    category: 'domain',
    costType: 'recurring_subscription',
    billingCycle: 'monthly',
    amount: 20.0,
    currency: 'USD',
    status: 'paid',
    vendor: 'Cloudflare',
    date: '2026-03-01',
    renewalDate: '2026-04-01',
    invoiceRef: 'CF-882910',
    notes: 'Aura432Hz Account ID: 276fd4c1809c05056b1ff2fa8d9908e8. SSL certificate, DDoS mitigation and global edge caching',
    createdAt: '2026-03-01T08:05:00Z',
  },
  {
    id: 'exp-003',
    title: 'Meta & Instagram Ads - Spring Sound Healing Campaign',
    category: 'ads',
    costType: 'one_off',
    billingCycle: 'one_time',
    amount: 145.0,
    currency: 'USD',
    status: 'paid',
    vendor: 'Meta Platforms (Instagram Ads)',
    date: '2026-03-12',
    invoiceRef: 'FB-ADS-39918',
    notes: 'Targeted meditation, mindfulness, and sound wellness audiophiles',
    createdAt: '2026-03-12T10:30:00Z',
  },
  {
    id: 'exp-004',
    title: "Google Search Ads - '432Hz Sound Healing' Keywords",
    category: 'ads',
    costType: 'recurring_subscription',
    billingCycle: 'monthly',
    amount: 85.0,
    currency: 'USD',
    status: 'paid',
    vendor: 'Google Ads',
    date: '2026-03-15',
    renewalDate: '2026-04-15',
    invoiceRef: 'GADS-772183',
    notes: 'Targeting exact match high intent healing frequencies keywords',
    createdAt: '2026-03-15T12:00:00Z',
  },
  {
    id: 'exp-005',
    title: 'Namecheap Domain Registration (aura432hzhealing.com)',
    category: 'domain',
    costType: 'recurring_subscription',
    billingCycle: 'yearly',
    amount: 14.98,
    currency: 'USD',
    status: 'paid',
    vendor: 'Namecheap Inc',
    date: '2026-01-10',
    renewalDate: '2027-01-10',
    invoiceRef: 'NC-991823',
    notes: 'Primary apex domain registration with WhoisGuard privacy',
    createdAt: '2026-01-10T14:15:00Z',
  },
  {
    id: 'exp-006',
    title: 'Soundiron & Spitfire Audio Sacred Crystal Sample Licenses',
    category: 'production',
    costType: 'one_off',
    billingCycle: 'one_time',
    amount: 129.0,
    currency: 'USD',
    status: 'paid',
    vendor: 'Soundiron Audio',
    date: '2026-02-05',
    invoiceRef: 'SND-44102',
    notes: 'High resolution 24-bit 96kHz acoustic sample instruments for sound generator',
    createdAt: '2026-02-05T16:45:00Z',
  },
  {
    id: 'exp-007',
    title: 'Ableton Live Suite & FabFilter Pro Bundle Maintenance',
    category: 'software',
    costType: 'recurring_subscription',
    billingCycle: 'yearly',
    amount: 199.0,
    currency: 'USD',
    status: 'paid',
    vendor: 'FabFilter Software',
    date: '2026-01-05',
    renewalDate: '2027-01-05',
    invoiceRef: 'FF-2026-ANN',
    notes: 'Acoustic mastering plugins and EQ dynamic tools license',
    createdAt: '2026-01-05T09:30:00Z',
  },
  {
    id: 'exp-008',
    title: 'Google Workspace & Dedicated Sanctuary Email',
    category: 'software',
    costType: 'recurring_subscription',
    billingCycle: 'monthly',
    amount: 12.0,
    currency: 'USD',
    status: 'paid',
    vendor: 'Google Workspace',
    date: '2026-03-01',
    renewalDate: '2026-04-01',
    invoiceRef: 'GW-0038291',
    notes: 'Custom domain email support@aura432hzhealing.com',
    createdAt: '2026-03-01T08:10:00Z',
  },
  {
    id: 'exp-009',
    title: 'Meta Ads - April Mindful Relaxation Boost',
    category: 'ads',
    costType: 'one_off',
    billingCycle: 'one_time',
    amount: 90.0,
    currency: 'USD',
    status: 'scheduled',
    date: '2026-04-05',
    vendor: 'Meta Platforms',
    invoiceRef: 'FB-ADS-APR-SCHED',
    notes: 'Scheduled campaign for upcoming April New Moon soundbath release',
    createdAt: '2026-03-28T11:00:00Z',
  },
];

// Helper: safe local storage load/save
function getLocalItems<T>(key: string, defaults: T[]): T[] {
  try {
    const raw = localStorage.getItem(key);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn(`Error reading ${key} from localStorage:`, err);
  }
  return [];
}

function saveLocalItems<T>(key: string, items: T[]): void {
  try {
    localStorage.setItem(key, JSON.stringify(items));
  } catch (err) {
    console.warn(`Error saving ${key} to localStorage:`, err);
  }
}

// ==========================================
// Financial Ledger Clear & Reset Service
// ==========================================
export async function clearAllFinancialData(): Promise<void> {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(STORAGE_KEY_CLEARED, 'true');
      localStorage.setItem(STORAGE_KEY_EARNINGS, '[]');
      localStorage.setItem(STORAGE_KEY_EXPENSES, '[]');
    } catch {}
  }

  try {
    const colRef = collection(db, 'commission_earnings');
    const snapshot = await getDocs(colRef);
    for (const d of snapshot.docs) {
      try {
        await deleteDoc(d.ref);
      } catch (err) {
        console.warn('Error deleting commission record:', err);
      }
    }
  } catch (err) {
    console.warn('Firestore clear commission_earnings error:', err);
  }

  try {
    const colRef = collection(db, 'operating_expenses');
    const snapshot = await getDocs(colRef);
    for (const d of snapshot.docs) {
      try {
        await deleteDoc(d.ref);
      } catch (err) {
        console.warn('Error deleting operating expense record:', err);
      }
    }
  } catch (err) {
    console.warn('Firestore clear operating_expenses error:', err);
  }
}

// ==========================================
// Commission Earnings Service
// ==========================================
export async function fetchCommissionEarnings(): Promise<CommissionEarning[]> {
  try {
    const isCleared = typeof window !== 'undefined' && localStorage.getItem(STORAGE_KEY_CLEARED) === 'true';
    const colRef = collection(db, 'commission_earnings');
    const q = query(colRef, orderBy('date', 'desc'));
    const snapshot = await getDocs(q);

    if (!snapshot.empty) {
      if (isCleared) {
        // If data was marked cleared, purge any lingering docs from Firestore
        for (const d of snapshot.docs) {
          try {
            await deleteDoc(d.ref);
          } catch {}
        }
        saveLocalItems(STORAGE_KEY_EARNINGS, []);
        return [];
      }
      const results: CommissionEarning[] = [];
      snapshot.forEach((d) => {
        results.push({ id: d.id, ...(d.data() as Omit<CommissionEarning, 'id'>) });
      });
      saveLocalItems(STORAGE_KEY_EARNINGS, results);
      return results;
    }

    // Collection empty -> never re-seed demo data; maintain clean zero ledger
    saveLocalItems(STORAGE_KEY_EARNINGS, []);
    return [];
  } catch (err) {
    console.warn('Firestore fetchCommissionEarnings error, falling back to local cache:', err);
    return getLocalItems<CommissionEarning>(STORAGE_KEY_EARNINGS, []);
  }
}

export async function saveCommissionEarning(
  earning: Omit<CommissionEarning, 'id' | 'createdAt'> & { id?: string; createdAt?: string }
): Promise<CommissionEarning> {
  const now = new Date().toISOString();
  const id = earning.id || `comm-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
  const fullEarning: CommissionEarning = {
    ...earning,
    id,
    createdAt: earning.createdAt || now,
    updatedAt: now,
  };

  // Update local cache immediately
  const localList = getLocalItems<CommissionEarning>(STORAGE_KEY_EARNINGS, []);
  const existingIdx = localList.findIndex((item) => item.id === id);
  if (existingIdx >= 0) {
    localList[existingIdx] = fullEarning;
  } else {
    localList.unshift(fullEarning);
  }
  saveLocalItems(STORAGE_KEY_EARNINGS, localList);

  // Sync to Firestore
  try {
    const docRef = doc(db, 'commission_earnings', id);
    await setDoc(docRef, fullEarning, { merge: true });
  } catch (err) {
    console.warn('Failed to sync commission earning to Firestore (saved locally):', err);
  }

  return fullEarning;
}

export async function deleteCommissionEarning(id: string): Promise<boolean> {
  const localList = getLocalItems<CommissionEarning>(STORAGE_KEY_EARNINGS, []);
  const updated = localList.filter((item) => item.id !== id);
  saveLocalItems(STORAGE_KEY_EARNINGS, updated);

  try {
    await deleteDoc(doc(db, 'commission_earnings', id));
    return true;
  } catch (err) {
    console.warn('Failed to delete commission earning from Firestore:', err);
    return true; // Still removed locally
  }
}

// ==========================================
// Operating Expenses Service
// ==========================================
export async function fetchOperatingExpenses(): Promise<OperatingExpense[]> {
  try {
    const isCleared = typeof window !== 'undefined' && localStorage.getItem(STORAGE_KEY_CLEARED) === 'true';
    const colRef = collection(db, 'operating_expenses');
    const q = query(colRef, orderBy('date', 'desc'));
    const snapshot = await getDocs(q);

    if (!snapshot.empty) {
      if (isCleared) {
        // If data was marked cleared, purge any lingering docs from Firestore
        for (const d of snapshot.docs) {
          try {
            await deleteDoc(d.ref);
          } catch {}
        }
        saveLocalItems(STORAGE_KEY_EXPENSES, []);
        return [];
      }
      const results: OperatingExpense[] = [];
      snapshot.forEach((d) => {
        results.push({ id: d.id, ...(d.data() as Omit<OperatingExpense, 'id'>) });
      });
      saveLocalItems(STORAGE_KEY_EXPENSES, results);
      return results;
    }

    // Collection empty -> never re-seed demo data; maintain clean zero ledger
    saveLocalItems(STORAGE_KEY_EXPENSES, []);
    return [];
  } catch (err) {
    console.warn('Firestore fetchOperatingExpenses error, falling back to local cache:', err);
    return getLocalItems<OperatingExpense>(STORAGE_KEY_EXPENSES, []);
  }
}

export async function saveOperatingExpense(
  expense: Omit<OperatingExpense, 'id' | 'createdAt'> & { id?: string; createdAt?: string }
): Promise<OperatingExpense> {
  const now = new Date().toISOString();
  const id = expense.id || `exp-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
  const fullExpense: OperatingExpense = {
    ...expense,
    id,
    createdAt: expense.createdAt || now,
    updatedAt: now,
  };

  // Update local cache
  const localList = getLocalItems<OperatingExpense>(STORAGE_KEY_EXPENSES, []);
  const existingIdx = localList.findIndex((item) => item.id === id);
  if (existingIdx >= 0) {
    localList[existingIdx] = fullExpense;
  } else {
    localList.unshift(fullExpense);
  }
  saveLocalItems(STORAGE_KEY_EXPENSES, localList);

  // Sync to Firestore
  try {
    const docRef = doc(db, 'operating_expenses', id);
    await setDoc(docRef, fullExpense, { merge: true });
  } catch (err) {
    console.warn('Failed to sync operating expense to Firestore (saved locally):', err);
  }

  return fullExpense;
}

export async function deleteOperatingExpense(id: string): Promise<boolean> {
  const localList = getLocalItems<OperatingExpense>(STORAGE_KEY_EXPENSES, []);
  const updated = localList.filter((item) => item.id !== id);
  saveLocalItems(STORAGE_KEY_EXPENSES, updated);

  try {
    await deleteDoc(doc(db, 'operating_expenses', id));
    return true;
  } catch (err) {
    console.warn('Failed to delete operating expense from Firestore:', err);
    return true;
  }
}

// ==========================================
// Date Range Filtering & Summary Calculation
// ==========================================
export interface DateRangeBounds {
  startDateStr: string | null;
  endDateStr: string | null;
  label: string;
  humanRange: string;
}

export function getDateRangeBounds(filter: DateFilterConfig): DateRangeBounds {
  const now = new Date();
  const y = now.getFullYear();
  const m = now.getMonth(); // 0-indexed
  const d = now.getDate();

  const toYmd = (date: Date): string => {
    const yr = date.getFullYear();
    const mo = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${yr}-${mo}-${day}`;
  };

  const toHuman = (date: Date): string => {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  if (filter.preset === 'today') {
    const todayStr = toYmd(now);
    return {
      startDateStr: todayStr,
      endDateStr: todayStr,
      label: 'Today',
      humanRange: toHuman(now),
    };
  }

  if (filter.preset === 'last_7_days') {
    const past7 = new Date(now);
    past7.setDate(d - 7);
    return {
      startDateStr: toYmd(past7),
      endDateStr: toYmd(now),
      label: 'Last 7 Days',
      humanRange: `${toHuman(past7)} – ${toHuman(now)}`,
    };
  }

  if (filter.preset === 'last_30_days') {
    const past30 = new Date(now);
    past30.setDate(d - 30);
    return {
      startDateStr: toYmd(past30),
      endDateStr: toYmd(now),
      label: 'Last 30 Days',
      humanRange: `${toHuman(past30)} – ${toHuman(now)}`,
    };
  }

  if (filter.preset === 'this_month') {
    const firstDay = new Date(y, m, 1);
    const lastDay = new Date(y, m + 1, 0);
    return {
      startDateStr: toYmd(firstDay),
      endDateStr: toYmd(lastDay),
      label: 'Current Month',
      humanRange: `${toHuman(firstDay)} – ${toHuman(lastDay)}`,
    };
  }

  if (filter.preset === 'last_month') {
    const firstDay = new Date(y, m - 1, 1);
    const lastDay = new Date(y, m, 0);
    return {
      startDateStr: toYmd(firstDay),
      endDateStr: toYmd(lastDay),
      label: 'Last Month',
      humanRange: `${toHuman(firstDay)} – ${toHuman(lastDay)}`,
    };
  }

  if (filter.preset === 'this_quarter') {
    const qStartMonth = Math.floor(m / 3) * 3;
    const firstDay = new Date(y, qStartMonth, 1);
    const lastDay = new Date(y, qStartMonth + 3, 0);
    return {
      startDateStr: toYmd(firstDay),
      endDateStr: toYmd(lastDay),
      label: 'This Quarter',
      humanRange: `${toHuman(firstDay)} – ${toHuman(lastDay)}`,
    };
  }

  if (filter.preset === 'this_year') {
    const firstDay = new Date(y, 0, 1);
    const lastDay = new Date(y, 11, 31);
    return {
      startDateStr: toYmd(firstDay),
      endDateStr: toYmd(lastDay),
      label: 'Year to Date',
      humanRange: `${toHuman(firstDay)} – ${toHuman(lastDay)}`,
    };
  }

  if (filter.preset === 'custom') {
    const s = filter.startDate || '';
    const e = filter.endDate || '';
    let humanRange = 'Select dates';
    if (s && e) {
      humanRange = `${s} to ${e}`;
    } else if (s) {
      humanRange = `From ${s}`;
    } else if (e) {
      humanRange = `Until ${e}`;
    }
    return {
      startDateStr: s || null,
      endDateStr: e || null,
      label: 'Custom Range',
      humanRange,
    };
  }

  return {
    startDateStr: null,
    endDateStr: null,
    label: 'All Time',
    humanRange: 'All historical records',
  };
}

export function formatDateRangeDisplay(filter: DateFilterConfig): { label: string; humanRange: string } {
  const bounds = getDateRangeBounds(filter);
  return {
    label: bounds.label,
    humanRange: bounds.humanRange,
  };
}

export function filterItemsByDate<T extends { date: string }>(
  items: T[],
  filter: DateFilterConfig
): T[] {
  if (filter.preset === 'all') {
    return items;
  }

  const { startDateStr, endDateStr } = getDateRangeBounds(filter);

  return items.filter((item) => {
    const dateStr = item.date;
    if (startDateStr && dateStr < startDateStr) return false;
    if (endDateStr && dateStr > endDateStr) return false;
    return true;
  });
}

export function calculateFinancialSummary(
  earnings: CommissionEarning[],
  expenses: OperatingExpense[]
): FinancialSummary {
  let totalCommissions = 0;
  let totalPendingCommissions = 0;
  let totalReceivedCommissions = 0;

  const commissionsByType: Record<CommissionType, number> = {
    affiliate_store: 0,
    partner_referral: 0,
    custom_external: 0,
  };

  earnings.forEach((e) => {
    totalCommissions += e.netEarnings;
    if (e.status === 'received') {
      totalReceivedCommissions += e.netEarnings;
    } else if (e.status === 'pending') {
      totalPendingCommissions += e.netEarnings;
    }
    if (commissionsByType[e.type] !== undefined) {
      commissionsByType[e.type] += e.netEarnings;
    }
  });

  let totalExpenses = 0;
  let totalPaidExpenses = 0;
  let totalPendingExpenses = 0;

  const expensesByCategory: Record<ExpenseCategory, number> = {
    ads: 0,
    hosting: 0,
    domain: 0,
    software: 0,
    production: 0,
    other: 0,
  };

  expenses.forEach((exp) => {
    totalExpenses += exp.amount;
    if (exp.status === 'paid') {
      totalPaidExpenses += exp.amount;
    } else {
      totalPendingExpenses += exp.amount;
    }
    if (expensesByCategory[exp.category] !== undefined) {
      expensesByCategory[exp.category] += exp.amount;
    }
  });

  const netOperatingIncome = totalCommissions - totalExpenses;
  const profitMarginPercent = totalCommissions > 0
    ? (netOperatingIncome / totalCommissions) * 100
    : 0;

  // Monthly trends aggregation
  const monthMap = new Map<string, { commissions: number; grossRevenue: number; expenses: number }>();

  earnings.forEach((e) => {
    const mKey = e.date.substring(0, 7); // 'YYYY-MM'
    const curr = monthMap.get(mKey) || { commissions: 0, grossRevenue: 0, expenses: 0 };
    curr.commissions += e.netEarnings;
    curr.grossRevenue += e.saleAmount;
    monthMap.set(mKey, curr);
  });

  expenses.forEach((exp) => {
    const mKey = exp.date.substring(0, 7);
    const curr = monthMap.get(mKey) || { commissions: 0, grossRevenue: 0, expenses: 0 };
    curr.expenses += exp.amount;
    monthMap.set(mKey, curr);
  });

  // Sort months chronologically
  const sortedMonthKeys = Array.from(monthMap.keys()).sort();

  const monthlyTrends: MonthlyFinancialSummary[] = sortedMonthKeys.map((mKey) => {
    const data = monthMap.get(mKey)!;
    const [year, month] = mKey.split('-');
    const dateObj = new Date(parseInt(year, 10), parseInt(month, 10) - 1, 1);
    const monthLabel = dateObj.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });

    return {
      monthKey: mKey,
      monthLabel,
      grossRevenue: Math.round(data.grossRevenue * 100) / 100,
      commissions: Math.round(data.commissions * 100) / 100,
      expenses: Math.round(data.expenses * 100) / 100,
      netProfit: Math.round((data.commissions - data.expenses) * 100) / 100,
    };
  });

  return {
    totalCommissions: Math.round(totalCommissions * 100) / 100,
    totalPendingCommissions: Math.round(totalPendingCommissions * 100) / 100,
    totalReceivedCommissions: Math.round(totalReceivedCommissions * 100) / 100,
    totalExpenses: Math.round(totalExpenses * 100) / 100,
    totalPaidExpenses: Math.round(totalPaidExpenses * 100) / 100,
    totalPendingExpenses: Math.round(totalPendingExpenses * 100) / 100,
    netOperatingIncome: Math.round(netOperatingIncome * 100) / 100,
    profitMarginPercent: Math.round(profitMarginPercent * 10) / 10,
    commissionsByType,
    expensesByCategory,
    monthlyTrends,
  };
}

// ==========================================
// Financial Reports Export Utilities
// ==========================================

/**
 * Generates and triggers download of a detailed, formatted CSV financial report
 */
function escapeCSV(val: string | number | undefined): string {
  if (val === undefined || val === null) return '""';
  const s = String(val).replace(/"/g, '""');
  return `"${s}"`;
}

export function exportFinancialCSV(
  earnings: CommissionEarning[],
  expenses: OperatingExpense[],
  summary: FinancialSummary,
  periodLabel: string = 'All Time'
): void {
  const lines: string[] = [];

  // Header
  lines.push('AURA 432HZ SANCTUARY - FINANCIAL COMMISSION & EXPENSE AUDIT REPORT');
  lines.push(`Generated: ${new Date().toISOString()} | Period: ${periodLabel}`);
  lines.push('');

  // Executive Summary Section
  lines.push('--- EXECUTIVE FINANCIAL SUMMARY ---');
  lines.push('Metric,Amount (USD),Notes');
  lines.push(`Gross Commission Income,$${summary.totalCommissions.toFixed(2)},All earned & pending commissions`);
  lines.push(`Received Commission Income,$${summary.totalReceivedCommissions.toFixed(2)},Cleared funds`);
  lines.push(`Pending Commission Income,$${summary.totalPendingCommissions.toFixed(2)},Pending partner clearance`);
  lines.push(`Total Operating Costs,$${summary.totalExpenses.toFixed(2)},All ad, hosting, domain, software costs`);
  lines.push(`Net Operating Income,$${summary.netOperatingIncome.toFixed(2)},Net profit before tax`);
  lines.push(`Operating Profit Margin,${summary.profitMarginPercent.toFixed(1)}%,Net profit / total commissions`);
  lines.push('');

  // Cost Category Breakdown
  lines.push('--- OPERATING EXPENSE BREAKDOWN BY CATEGORY ---');
  lines.push('Category,Total Spent (USD)');
  lines.push(`Advertising & Marketing (Meta / Google Ads),$${(summary.expensesByCategory.ads || 0).toFixed(2)}`);
  lines.push(`Cloud Hosting & Server Infrastructure,$${(summary.expensesByCategory.hosting || 0).toFixed(2)}`);
  lines.push(`Domain Registrations & DNS,$${(summary.expensesByCategory.domain || 0).toFixed(2)}`);
  lines.push(`Software Licenses & Audio Subscriptions,$${(summary.expensesByCategory.software || 0).toFixed(2)}`);
  lines.push(`Acoustic Production & Gear,$${(summary.expensesByCategory.production || 0).toFixed(2)}`);
  lines.push(`Other Operating Expenses,$${(summary.expensesByCategory.other || 0).toFixed(2)}`);
  lines.push('');

  // Commission Revenue Streams Breakdown
  lines.push('--- COMMISSION REVENUE STREAMS BREAKDOWN ---');
  lines.push('Stream Type,Net Earnings (USD)');
  lines.push(`Affiliate Store Gear & Bowls,$${(summary.commissionsByType.affiliate_store || 0).toFixed(2)}`);
  lines.push(`Partner Referrals & Wellness Networks,$${(summary.commissionsByType.partner_referral || 0).toFixed(2)}`);
  lines.push(`Custom Client Commissions & Mastered Soundtracks,$${(summary.commissionsByType.custom_external || 0).toFixed(2)}`);
  lines.push('');

  // Detailed Commission Ledger
  lines.push('--- DETAILED COMMISSION TRANSACTIONS LEDGER ---');
  lines.push([
    'ID',
    'Date',
    'Title / Item Description',
    'Stream Type',
    'Partner / Platform',
    'Order Ref',
    'Gross Sale ($)',
    'Rate (%)',
    'Net Commission ($)',
    'Status',
    'Notes',
  ].map(escapeCSV).join(','));

  earnings.forEach((e) => {
    lines.push([
      e.id,
      e.date,
      e.title,
      e.type,
      e.partnerOrPlatform,
      e.orderReference || 'N/A',
      e.saleAmount.toFixed(2),
      `${e.commissionRate}%`,
      e.netEarnings.toFixed(2),
      e.status.toUpperCase(),
      e.notes || '',
    ].map(escapeCSV).join(','));
  });
  lines.push('');

  // Detailed Expense Ledger
  lines.push('--- DETAILED OPERATING EXPENSES LEDGER ---');
  lines.push([
    'ID',
    'Date',
    'Expense Description',
    'Category',
    'Cost Type',
    'Billing Cadence',
    'Vendor / Service',
    'Invoice Ref',
    'Amount ($)',
    'Status',
    'Next Renewal',
    'Notes',
  ].map(escapeCSV).join(','));

  expenses.forEach((exp) => {
    lines.push([
      exp.id,
      exp.date,
      exp.title,
      exp.category.toUpperCase(),
      exp.costType,
      exp.billingCycle,
      exp.vendor,
      exp.invoiceRef || 'N/A',
      exp.amount.toFixed(2),
      exp.status.toUpperCase(),
      exp.renewalDate || 'N/A',
      exp.notes || '',
    ].map(escapeCSV).join(','));
  });

  const csvContent = lines.join('\n');
  const timestamp = new Date().toISOString().slice(0, 10);
  downloadCSV(csvContent, `aura432_financial_report_${timestamp}.csv`);
}

/**
 * Exports commissions-only tabular CSV for direct spreadsheet analysis
 */
export function exportCommissionsOnlyCSV(earnings: CommissionEarning[], periodLabel = 'All Time'): void {
  const lines: string[] = [];
  lines.push([
    'ID',
    'Date',
    'Title / Item Description',
    'Stream Type',
    'Partner / Platform',
    'Order Ref',
    'Gross Sale ($)',
    'Commission Rate (%)',
    'Net Commission ($)',
    'Status',
    'Notes',
  ].map(escapeCSV).join(','));

  earnings.forEach((e) => {
    lines.push([
      e.id,
      e.date,
      e.title,
      e.type,
      e.partnerOrPlatform,
      e.orderReference || '',
      e.saleAmount.toFixed(2),
      `${e.commissionRate}%`,
      e.netEarnings.toFixed(2),
      e.status.toUpperCase(),
      e.notes || '',
    ].map(escapeCSV).join(','));
  });

  const timestamp = new Date().toISOString().slice(0, 10);
  downloadCSV(lines.join('\n'), `aura432_commissions_${timestamp}.csv`);
}

/**
 * Exports operating expenses-only tabular CSV
 */
export function exportExpensesOnlyCSV(expenses: OperatingExpense[], periodLabel = 'All Time'): void {
  const lines: string[] = [];
  lines.push([
    'ID',
    'Date',
    'Expense Description',
    'Category',
    'Cost Type',
    'Billing Cadence',
    'Vendor / Service',
    'Invoice Ref',
    'Amount ($)',
    'Status',
    'Next Renewal',
    'Notes',
  ].map(escapeCSV).join(','));

  expenses.forEach((exp) => {
    lines.push([
      exp.id,
      exp.date,
      exp.title,
      exp.category.toUpperCase(),
      exp.costType,
      exp.billingCycle,
      exp.vendor,
      exp.invoiceRef || '',
      exp.amount.toFixed(2),
      exp.status.toUpperCase(),
      exp.renewalDate || '',
      exp.notes || '',
    ].map(escapeCSV).join(','));
  });

  const timestamp = new Date().toISOString().slice(0, 10);
  downloadCSV(lines.join('\n'), `aura432_expenses_${timestamp}.csv`);
}

/**
 * Full JSON Audit Ledger Backup for external accounting software
 */
export function exportFinancialJSON(
  earnings: CommissionEarning[],
  expenses: OperatingExpense[],
  summary: FinancialSummary
): void {
  const payload = {
    sanctuary: 'Aura 432Hz Sound Healing',
    exportedAt: new Date().toISOString(),
    currency: 'USD',
    version: '1.0.0',
    summary,
    ledger: {
      commissionEarnings: earnings,
      operatingExpenses: expenses,
    },
  };

  const timestamp = new Date().toISOString().slice(0, 10);
  downloadJSON(payload, `aura432_financial_ledger_backup_${timestamp}.json`);
}

/**
 * Generates the clean standalone HTML for printing or saving as PDF
 */
export function generatePrintableHTML(
  earnings: CommissionEarning[],
  expenses: OperatingExpense[],
  summary: FinancialSummary,
  periodLabel: string = 'All Time'
): string {
  const currentDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const netIncomeColor = summary.netOperatingIncome >= 0 ? '#059669' : '#dc2626';

  const earningsRows = earnings.length === 0
    ? `<tr><td colspan="8" style="padding: 16px; text-align: center; color: #6b7280; font-size: 13px;">No commission earnings in this period.</td></tr>`
    : earnings
        .map(
          (e) => `
    <tr>
      <td style="padding: 8px 12px; border-bottom: 1px solid #e5e7eb; font-size: 13px;">${e.date}</td>
      <td style="padding: 8px 12px; border-bottom: 1px solid #e5e7eb; font-size: 13px; font-weight: 500;">${e.title}</td>
      <td style="padding: 8px 12px; border-bottom: 1px solid #e5e7eb; font-size: 12px; color: #4b5563;">${e.partnerOrPlatform}</td>
      <td style="padding: 8px 12px; border-bottom: 1px solid #e5e7eb; font-size: 12px; text-transform: capitalize;">${e.type.replace('_', ' ')}</td>
      <td style="padding: 8px 12px; border-bottom: 1px solid #e5e7eb; font-size: 13px; text-align: right;">$${e.saleAmount.toFixed(2)}</td>
      <td style="padding: 8px 12px; border-bottom: 1px solid #e5e7eb; font-size: 13px; text-align: right;">${e.commissionRate}%</td>
      <td style="padding: 8px 12px; border-bottom: 1px solid #e5e7eb; font-size: 13px; text-align: right; font-weight: 600; color: #059669;">+$${e.netEarnings.toFixed(2)}</td>
      <td style="padding: 8px 12px; border-bottom: 1px solid #e5e7eb; font-size: 12px; text-align: center;">
        <span style="display: inline-block; padding: 2px 8px; border-radius: 9999px; font-size: 11px; font-weight: 600; background: ${e.status === 'received' ? '#d1fae5; color: #065f46' : '#fef3c7; color: #92400e'};">
          ${e.status.toUpperCase()}
        </span>
      </td>
    </tr>`
        )
        .join('');

  const expenseRows = expenses.length === 0
    ? `<tr><td colspan="7" style="padding: 16px; text-align: center; color: #6b7280; font-size: 13px;">No operating expenses in this period.</td></tr>`
    : expenses
        .map(
          (exp) => `
    <tr>
      <td style="padding: 8px 12px; border-bottom: 1px solid #e5e7eb; font-size: 13px;">${exp.date}</td>
      <td style="padding: 8px 12px; border-bottom: 1px solid #e5e7eb; font-size: 13px; font-weight: 500;">${exp.title}</td>
      <td style="padding: 8px 12px; border-bottom: 1px solid #e5e7eb; font-size: 12px; color: #4b5563;">${exp.vendor}</td>
      <td style="padding: 8px 12px; border-bottom: 1px solid #e5e7eb; font-size: 12px; text-transform: uppercase;">${exp.category}</td>
      <td style="padding: 8px 12px; border-bottom: 1px solid #e5e7eb; font-size: 12px; text-transform: capitalize;">${exp.costType.replace('_', ' ')}</td>
      <td style="padding: 8px 12px; border-bottom: 1px solid #e5e7eb; font-size: 13px; text-align: right; font-weight: 600; color: #dc2626;">-$${exp.amount.toFixed(2)}</td>
      <td style="padding: 8px 12px; border-bottom: 1px solid #e5e7eb; font-size: 12px; text-align: center;">
        <span style="display: inline-block; padding: 2px 8px; border-radius: 9999px; font-size: 11px; font-weight: 600; background: ${exp.status === 'paid' ? '#dcfce7; color: #166534' : '#fee2e2; color: #991b1b'};">
          ${exp.status.toUpperCase()}
        </span>
      </td>
    </tr>`
        )
        .join('');

  const monthlyTrendRows = summary.monthlyTrends.length === 0
    ? `<tr><td colspan="4" style="padding: 16px; text-align: center; color: #6b7280; font-size: 13px;">No trend data recorded.</td></tr>`
    : summary.monthlyTrends
        .map(
          (m) => `
    <tr>
      <td style="padding: 8px 12px; border-bottom: 1px solid #e5e7eb; font-size: 13px; font-weight: 600;">${m.monthLabel}</td>
      <td style="padding: 8px 12px; border-bottom: 1px solid #e5e7eb; font-size: 13px; text-align: right; color: #059669;">$${m.commissions.toFixed(2)}</td>
      <td style="padding: 8px 12px; border-bottom: 1px solid #e5e7eb; font-size: 13px; text-align: right; color: #dc2626;">$${m.expenses.toFixed(2)}</td>
      <td style="padding: 8px 12px; border-bottom: 1px solid #e5e7eb; font-size: 13px; text-align: right; font-weight: 700; color: ${m.netProfit >= 0 ? '#059669' : '#dc2626'};">
        ${m.netProfit >= 0 ? '+' : ''}$${m.netProfit.toFixed(2)}
      </td>
    </tr>`
        )
        .join('');

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Aura 432Hz Financial Statement - ${periodLabel}</title>
  <style>
    @media print {
      body { margin: 0; padding: 12mm; color: #111827; background: #ffffff !important; }
      .no-print { display: none !important; }
      @page { size: portrait; margin: 10mm; }
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      color: #1f2937;
      background: #ffffff;
      padding: 30px;
      line-height: 1.5;
      max-width: 900px;
      margin: 0 auto;
    }
    .header {
      border-bottom: 2px solid #e5e7eb;
      padding-bottom: 20px;
      margin-bottom: 24px;
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
    }
    .brand-title {
      font-size: 24px;
      font-weight: 800;
      color: #0f766e;
      letter-spacing: -0.5px;
      margin: 0;
    }
    .brand-subtitle {
      font-size: 13px;
      color: #6b7280;
      margin-top: 4px;
    }
    .meta-box {
      text-align: right;
      font-size: 12px;
      color: #6b7280;
      line-height: 1.6;
    }
    .kpi-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 16px;
      margin-bottom: 28px;
    }
    .kpi-card {
      background: #f9fafb;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      padding: 16px;
    }
    .kpi-label {
      font-size: 11px;
      font-weight: 600;
      color: #6b7280;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 4px;
    }
    .kpi-val {
      font-size: 22px;
      font-weight: 800;
      margin: 0;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 30px;
    }
    th {
      background: #f3f4f6;
      padding: 10px 12px;
      font-size: 11px;
      font-weight: 700;
      color: #374151;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      border-bottom: 2px solid #d1d5db;
    }
    .section-title {
      font-size: 16px;
      font-weight: 700;
      color: #111827;
      margin-top: 24px;
      margin-bottom: 12px;
      padding-bottom: 6px;
      border-bottom: 1px solid #e5e7eb;
      display: flex;
      justify-content: space-between;
    }
    .actions-bar {
      margin-bottom: 20px;
      padding: 12px 16px;
      background: #f0fdf4;
      border: 1px solid #bbf7d0;
      border-radius: 8px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .print-btn {
      background: #0f766e;
      color: #ffffff;
      border: none;
      padding: 8px 18px;
      font-weight: 600;
      font-size: 14px;
      border-radius: 6px;
      cursor: pointer;
    }
    .print-btn:hover {
      background: #115e59;
    }
  </style>
</head>
<body>
  <div class="actions-bar no-print">
    <span style="font-size: 14px; font-weight: 600; color: #166534;">
      📄 Financial Statement Ready for Printing / PDF Export
    </span>
    <button class="print-btn" onclick="window.print()">Print Statement / Save PDF</button>
  </div>

  <div class="header">
    <div>
      <h1 class="brand-title">AURA 432Hz SANCTUARY</h1>
      <div class="brand-subtitle">Executive Commission Earnings & Operating Expenses Report</div>
      <div style="font-size: 12px; color: #4b5563; margin-top: 4px;">Reporting Period: <strong>${periodLabel}</strong></div>
    </div>
    <div class="meta-box">
      <div>Statement Date: <strong>${currentDate}</strong></div>
      <div>Accounting Currency: <strong>USD ($)</strong></div>
      <div>Admin Audit Ref: <strong>AUDIT-${Date.now().toString(36).toUpperCase()}</strong></div>
    </div>
  </div>

  <div class="kpi-grid">
    <div class="kpi-card">
      <div class="kpi-label">Gross Commissions</div>
      <div class="kpi-val" style="color: #059669;">$${summary.totalCommissions.toFixed(2)}</div>
      <div style="font-size: 11px; color: #6b7280; margin-top: 4px;">Received: $${summary.totalReceivedCommissions.toFixed(2)}</div>
    </div>
    <div class="kpi-card">
      <div class="kpi-label">Operating Expenses</div>
      <div class="kpi-val" style="color: #dc2626;">$${summary.totalExpenses.toFixed(2)}</div>
      <div style="font-size: 11px; color: #6b7280; margin-top: 4px;">Paid: $${summary.totalPaidExpenses.toFixed(2)}</div>
    </div>
    <div class="kpi-card">
      <div class="kpi-label">Net Operating Income</div>
      <div class="kpi-val" style="color: ${netIncomeColor};">
        ${summary.netOperatingIncome >= 0 ? '+' : ''}$${summary.netOperatingIncome.toFixed(2)}
      </div>
      <div style="font-size: 11px; color: #6b7280; margin-top: 4px;">P&L Balance</div>
    </div>
    <div class="kpi-card">
      <div class="kpi-label">Profit Margin</div>
      <div class="kpi-val" style="color: #0f766e;">${summary.profitMarginPercent.toFixed(1)}%</div>
      <div style="font-size: 11px; color: #6b7280; margin-top: 4px;">Net operating margin</div>
    </div>
  </div>

  <div class="section-title">
    <span>1. Commission Revenue Streams</span>
    <span style="font-size: 13px; font-weight: 500; color: #059669;">Total: $${summary.totalCommissions.toFixed(2)}</span>
  </div>
  <table>
    <thead>
      <tr>
        <th style="text-align: left;">Date</th>
        <th style="text-align: left;">Description</th>
        <th style="text-align: left;">Partner / Platform</th>
        <th style="text-align: left;">Type</th>
        <th style="text-align: right;">Sale Amount</th>
        <th style="text-align: right;">Rate</th>
        <th style="text-align: right;">Net Commission</th>
        <th style="text-align: center;">Status</th>
      </tr>
    </thead>
    <tbody>
      ${earningsRows}
    </tbody>
  </table>

  <div class="section-title">
    <span>2. Operating Expenses & Costs (Ads, Hosting, Domains)</span>
    <span style="font-size: 13px; font-weight: 500; color: #dc2626;">Total: $${summary.totalExpenses.toFixed(2)}</span>
  </div>
  <table>
    <thead>
      <tr>
        <th style="text-align: left;">Date</th>
        <th style="text-align: left;">Expense Item</th>
        <th style="text-align: left;">Vendor</th>
        <th style="text-align: left;">Category</th>
        <th style="text-align: left;">Cost Type</th>
        <th style="text-align: right;">Amount</th>
        <th style="text-align: center;">Status</th>
      </tr>
    </thead>
    <tbody>
      ${expenseRows}
    </tbody>
  </table>

  <div class="section-title">
    <span>3. Monthly Performance Trends (P&L)</span>
  </div>
  <table>
    <thead>
      <tr>
        <th style="text-align: left;">Month</th>
        <th style="text-align: right;">Commissions</th>
        <th style="text-align: right;">Expenses</th>
        <th style="text-align: right;">Net Operating Income</th>
      </tr>
    </thead>
    <tbody>
      ${monthlyTrendRows}
    </tbody>
  </table>

  <div style="margin-top: 40px; padding-top: 16px; border-top: 1px solid #e5e7eb; display: flex; justify-content: space-between; font-size: 11px; color: #9ca3af;">
    <div>Generated automatically by Sanctuary Admin Studio &bull; Confidential</div>
    <div>Page 1 of 1</div>
  </div>
</body>
</html>`;
}

/**
 * Generates an executive printable financial summary report
 * Safely tries window.open; if blocked (by iframe or popup blocker), automatically downloads HTML file
 */
export function generatePrintableReport(
  earnings: CommissionEarning[],
  expenses: OperatingExpense[],
  summary: FinancialSummary,
  periodLabel: string = 'All Time'
): void {
  const html = generatePrintableHTML(earnings, expenses, summary, periodLabel);
  printIsolatedDocument(html);
}

/**
 * Downloads the standalone executive HTML report file
 */
export function downloadFinancialHTMLReport(
  earnings: CommissionEarning[],
  expenses: OperatingExpense[],
  summary: FinancialSummary,
  periodLabel: string = 'All Time'
): void {
  const html = generatePrintableHTML(earnings, expenses, summary, periodLabel);
  const timestamp = new Date().toISOString().slice(0, 10);
  downloadText(html, `aura432_financial_statement_${timestamp}.html`, 'text/html;charset=utf-8;');
}

// ==========================================
// CSV & JSON Data Importers
// ==========================================

function parseCSVLineTokens(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim().replace(/^["']|["']$/g, ''));
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim().replace(/^["']|["']$/g, ''));
  return result;
}

function parseNormalizedDate(raw?: string): string {
  if (!raw) return new Date().toISOString().slice(0, 10);
  const trimmed = raw.trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return trimmed;
  if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(trimmed)) {
    const parts = trimmed.split('/');
    if (parts.length === 3) {
      const month = parts[0].padStart(2, '0');
      const day = parts[1].padStart(2, '0');
      const year = parts[2];
      return `${year}-${month}-${day}`;
    }
  }
  const d = new Date(trimmed);
  if (!isNaN(d.getTime())) return d.toISOString().slice(0, 10);
  return new Date().toISOString().slice(0, 10);
}

function parseCleanNumber(val?: string, fallback = 0): number {
  if (!val) return fallback;
  const cleaned = val.replace(/[^0-9.-]/g, '');
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? fallback : parsed;
}

/**
 * Imports commission earnings and operating expenses from CSV string
 */
export async function importFinancialCSV(csvText: string): Promise<FinancialImportResult> {
  const lines = csvText.split(/\r?\n/).map((l) => l.trim()).filter((l) => l.length > 0);
  const result: FinancialImportResult = {
    commissions: [],
    expenses: [],
    importedCount: 0,
    errors: [],
  };

  if (lines.length === 0) {
    result.errors.push('The provided CSV file is empty.');
    return result;
  }

  let currentSection: 'unknown' | 'commissions' | 'expenses' = 'unknown';
  let headerMap: Record<string, number> = {};

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Detect section dividers in combined reports
    if (line.toUpperCase().includes('COMMISSION TRANSACTIONS LEDGER')) {
      currentSection = 'commissions';
      headerMap = {};
      continue;
    }
    if (line.toUpperCase().includes('OPERATING EXPENSES LEDGER')) {
      currentSection = 'expenses';
      headerMap = {};
      continue;
    }
    if (line.startsWith('---') || line.startsWith('===') || line.startsWith('#')) {
      continue;
    }

    const tokens = parseCSVLineTokens(line);
    if (tokens.length < 2) continue;

    // Check if this row looks like a header
    const lowerTokens = tokens.map((t) => t.toLowerCase());
    const isCommissionHeader =
      lowerTokens.includes('gross sale ($)') ||
      lowerTokens.includes('net commission ($)') ||
      lowerTokens.includes('commission rate') ||
      (lowerTokens.includes('title') && lowerTokens.includes('rate')) ||
      (lowerTokens.includes('stream type') && lowerTokens.includes('partner'));
    
    const isExpenseHeader =
      lowerTokens.includes('expense description') ||
      lowerTokens.includes('vendor') ||
      lowerTokens.includes('billing cadence') ||
      (lowerTokens.includes('category') && lowerTokens.includes('cost type')) ||
      (lowerTokens.includes('amount ($)') && lowerTokens.includes('vendor'));

    if (isCommissionHeader) {
      currentSection = 'commissions';
      headerMap = {};
      lowerTokens.forEach((t, idx) => {
        headerMap[t] = idx;
      });
      continue;
    }

    if (isExpenseHeader) {
      currentSection = 'expenses';
      headerMap = {};
      lowerTokens.forEach((t, idx) => {
        headerMap[t] = idx;
      });
      continue;
    }

    // If section still unknown, guess from header row or first row tokens
    if (currentSection === 'unknown') {
      if (lowerTokens.some((t) => t.includes('commission') || t.includes('partner') || t.includes('sale') || t.includes('stream'))) {
        currentSection = 'commissions';
        lowerTokens.forEach((t, idx) => {
          headerMap[t] = idx;
        });
        continue;
      }
      if (lowerTokens.some((t) => t.includes('expense') || t.includes('vendor') || t.includes('cost') || t.includes('cadence'))) {
        currentSection = 'expenses';
        lowerTokens.forEach((t, idx) => {
          headerMap[t] = idx;
        });
        continue;
      }
    }

    // Helper to find column value by key substring in headerMap
    const getVal = (possibleKeys: string[]): string => {
      for (const k of possibleKeys) {
        for (const [header, colIdx] of Object.entries(headerMap)) {
          if (header.includes(k) && tokens[colIdx] !== undefined) {
            return tokens[colIdx];
          }
        }
      }
      return '';
    };

    // Default to commissions if neither section is detected
    if (currentSection === 'unknown') {
      currentSection = 'commissions';
    }

    if (currentSection === 'commissions') {
      try {
        const title = getVal(['title', 'item', 'description']) || tokens[1] || tokens[2] || 'Imported Commission';
        const date = parseNormalizedDate(getVal(['date']) || tokens[0] || tokens[1]);
        const partner = getVal(['partner', 'platform']) || tokens[3] || tokens[4] || 'Affiliate Partner';
        const typeRaw = (getVal(['stream', 'type']) || tokens[2] || tokens[3] || 'affiliate_store').toLowerCase();
        const type: CommissionType =
          typeRaw.includes('referral') ? 'partner_referral' : typeRaw.includes('custom') ? 'custom_external' : 'affiliate_store';

        const saleAmount = Math.abs(parseCleanNumber(getVal(['sale', 'gross']) || tokens[5] || tokens[6], 100));
        const commissionRate = Math.abs(parseCleanNumber(getVal(['rate']) || tokens[6] || tokens[7], 15));
        const computedNet = Math.round((saleAmount * (commissionRate / 100)) * 100) / 100;
        const netEarnings = Math.abs(parseCleanNumber(getVal(['net', 'earnings']) || tokens[7] || tokens[8], computedNet));

        const statusRaw = (getVal(['status']) || tokens[8] || tokens[9] || 'received').toLowerCase();
        const status = statusRaw.includes('pend') ? 'pending' : statusRaw.includes('refund') ? 'refunded' : 'received';

        const notes = getVal(['note', 'remark']) || tokens[9] || tokens[10] || 'Imported via CSV ledger';
        const orderRef = getVal(['order', 'ref']) || tokens[4] || tokens[5] || undefined;

        const saved = await saveCommissionEarning({
          title,
          type,
          partnerOrPlatform: partner,
          orderReference: orderRef,
          saleAmount,
          commissionRate,
          netEarnings,
          currency: 'USD',
          status,
          date,
          notes,
        });

        result.commissions.push(saved);
        result.importedCount++;
      } catch (err: any) {
        result.errors.push(`Row ${i + 1}: ${err?.message || 'Failed to parse commission'}`);
      }
    } else if (currentSection === 'expenses') {
      try {
        const title = getVal(['description', 'expense', 'title']) || tokens[1] || tokens[2] || 'Imported Expense';
        const date = parseNormalizedDate(getVal(['date']) || tokens[0] || tokens[1]);
        const vendor = getVal(['vendor', 'service', 'payee']) || tokens[5] || tokens[6] || 'Service Provider';

        const catRaw = (getVal(['category']) || tokens[2] || 'other').toLowerCase();
        const category: ExpenseCategory =
          catRaw.includes('ad') || catRaw.includes('marketing') || catRaw.includes('promo') ? 'ads' :
          catRaw.includes('host') || catRaw.includes('server') || catRaw.includes('cloud') ? 'hosting' :
          catRaw.includes('domain') || catRaw.includes('dns') ? 'domain' :
          catRaw.includes('soft') || catRaw.includes('app') || catRaw.includes('licen') || catRaw.includes('daw') ? 'software' :
          catRaw.includes('prod') || catRaw.includes('studio') || catRaw.includes('gear') ? 'production' : 'other';

        const costTypeRaw = (getVal(['cost', 'type']) || tokens[3] || 'recurring_subscription').toLowerCase();
        const costType: ExpenseCostType = costTypeRaw.includes('one') || costTypeRaw.includes('single') || costTypeRaw.includes('campaign')
          ? 'one_off'
          : 'recurring_subscription';

        const cycleRaw = (getVal(['billing', 'cadence', 'cycle']) || tokens[4] || 'monthly').toLowerCase();
        const billingCycle: ExpenseBillingCycle =
          cycleRaw.includes('year') || cycleRaw.includes('ann')
            ? 'yearly'
            : cycleRaw.includes('one') || cycleRaw.includes('single')
            ? 'one_time'
            : 'monthly';

        const amount = Math.abs(parseCleanNumber(getVal(['amount']) || tokens[7] || tokens[8], 50));

        const statusRaw = (getVal(['status']) || tokens[8] || tokens[9] || 'paid').toLowerCase();
        const status = statusRaw.includes('sched') ? 'scheduled' : statusRaw.includes('pend') ? 'pending' : 'paid';

        const invoiceRef = getVal(['invoice', 'ref']) || tokens[6] || tokens[7] || undefined;
        const notes = getVal(['notes', 'remark']) || tokens[9] || tokens[10] || 'Imported via CSV ledger';

        const saved = await saveOperatingExpense({
          title,
          category,
          costType,
          billingCycle,
          amount,
          currency: 'USD',
          status,
          vendor,
          date,
          invoiceRef,
          notes,
        });

        result.expenses.push(saved);
        result.importedCount++;
      } catch (err: any) {
        result.errors.push(`Row ${i + 1}: ${err?.message || 'Failed to parse expense'}`);
      }
    }
  }

  return result;
}

/**
 * Imports financial records from JSON string
 */
export async function importFinancialJSON(jsonText: string): Promise<FinancialImportResult> {
  const result: FinancialImportResult = {
    commissions: [],
    expenses: [],
    importedCount: 0,
    errors: [],
  };

  try {
    const parsed = JSON.parse(jsonText);
    const commList: any[] =
      parsed.ledger?.commissionEarnings ||
      parsed.commissionEarnings ||
      parsed.commissions ||
      (Array.isArray(parsed) ? parsed.filter((item) => item.saleAmount !== undefined || item.netEarnings !== undefined) : []);

    const expList: any[] =
      parsed.ledger?.operatingExpenses ||
      parsed.operatingExpenses ||
      parsed.expenses ||
      (Array.isArray(parsed) ? parsed.filter((item) => item.vendor !== undefined || item.category !== undefined) : []);

    for (const c of commList) {
      try {
        const saved = await saveCommissionEarning({
          title: c.title || 'Imported Commission',
          type: c.type || 'affiliate_store',
          partnerOrPlatform: c.partnerOrPlatform || 'Affiliate Partner',
          orderReference: c.orderReference,
          saleAmount: Number(c.saleAmount) || 100,
          commissionRate: Number(c.commissionRate) || 15,
          netEarnings: Number(c.netEarnings) || 15,
          currency: c.currency || 'USD',
          status: c.status || 'received',
          date: parseNormalizedDate(c.date),
          notes: c.notes || 'Imported JSON record',
        });
        result.commissions.push(saved);
        result.importedCount++;
      } catch (e: any) {
        result.errors.push(`Commission "${c.title}": ${e?.message}`);
      }
    }

    for (const exp of expList) {
      try {
        const saved = await saveOperatingExpense({
          title: exp.title || 'Imported Operating Expense',
          category: exp.category || 'other',
          costType: exp.costType || 'recurring_subscription',
          billingCycle: exp.billingCycle || 'monthly',
          amount: Number(exp.amount) || 50,
          currency: exp.currency || 'USD',
          status: exp.status || 'paid',
          vendor: exp.vendor || 'Provider',
          date: parseNormalizedDate(exp.date),
          renewalDate: exp.renewalDate,
          invoiceRef: exp.invoiceRef,
          notes: exp.notes || 'Imported JSON record',
        });
        result.expenses.push(saved);
        result.importedCount++;
      } catch (e: any) {
        result.errors.push(`Expense "${exp.title}": ${e?.message}`);
      }
    }
  } catch (err: any) {
    result.errors.push(`Invalid JSON format: ${err?.message || 'Parse error'}`);
  }

  return result;
}

/**
 * Downloads standard CSV templates so admins can format spreadsheets easily
 */
export function downloadSampleCSVTemplate(type: 'commissions' | 'expenses' | 'combined'): void {
  let content = '';
  let filename = '';

  if (type === 'commissions') {
    filename = 'aura432_commissions_import_template.csv';
    content = [
      'Date,Title / Item Description,Stream Type,Partner / Platform,Order Ref,Gross Sale ($),Rate (%),Net Commission ($),Status,Notes',
      '2026-10-10,432Hz Quartz Singing Bowl,affiliate_store,SoundCraft Pro,ORD-1002,189.00,15,28.35,received,Sold via shop banner',
      '2026-10-11,MindSpa Referral Bonus,partner_referral,MindSpa Network,REF-992,120.00,25,30.00,received,Partner referral coupon code',
      '2026-10-12,Custom 60min Binaural Soundscape,custom_external,Soma Yoga Berlin,ORD-2026,600.00,100,600.00,pending,Invoice sent net-30',
    ].join('\n');
  } else if (type === 'expenses') {
    filename = 'aura432_expenses_import_template.csv';
    content = [
      'Date,Expense Description,Category,Cost Type,Billing Cadence,Vendor,Invoice Ref,Amount ($),Status,Notes',
      '2026-10-01,Google Cloud Run Hosting,hosting,recurring_subscription,monthly,Google Cloud,GCP-OCT-01,42.50,paid,Production hosting',
      '2026-10-05,Cloudflare Pro Domain DNS,domain,recurring_subscription,monthly,Cloudflare,CF-OCT-05,20.00,paid,Domain DNS & SSL',
      '2026-10-08,Meta Instagram Meditation Ads,ads,one_off,one_time,Meta Ads,FB-8812,145.00,paid,Targeted meditation audience',
      '2026-10-10,Ableton Live Software DAW,software,recurring_subscription,monthly,Ableton,ABL-1092,24.99,paid,Synthesis plug-ins',
    ].join('\n');
  } else {
    filename = 'aura432_full_ledger_template.csv';
    content = [
      '--- DETAILED COMMISSION TRANSACTIONS LEDGER ---',
      'Date,Title / Item Description,Stream Type,Partner / Platform,Order Ref,Gross Sale ($),Rate (%),Net Commission ($),Status,Notes',
      '2026-10-10,432Hz Quartz Singing Bowl,affiliate_store,SoundCraft Pro,ORD-1002,189.00,15,28.35,received,Sample commission',
      '',
      '--- DETAILED OPERATING EXPENSES LEDGER ---',
      'Date,Expense Description,Category,Cost Type,Billing Cadence,Vendor,Invoice Ref,Amount ($),Status,Notes',
      '2026-10-01,Google Cloud Run Hosting,hosting,recurring_subscription,monthly,Google Cloud,GCP-OCT-01,42.50,paid,Sample expense',
    ].join('\n');
  }

  downloadCSV(content, filename);
}
