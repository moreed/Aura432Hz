export type CommissionType = 'affiliate_store' | 'partner_referral' | 'custom_external';

export type CommissionStatus = 'received' | 'pending' | 'refunded';

export interface CommissionEarning {
  id: string;
  title: string;
  type: CommissionType;
  partnerOrPlatform: string; // e.g., 'Amazon Associates', 'SoundCraft Affiliate', 'Custom Client', 'Aura Store'
  orderReference?: string;    // e.g., 'ORD-2026-8812'
  saleAmount: number;         // Total order / merchandise value
  commissionRate: number;     // e.g., 12 (means 12%)
  netEarnings: number;        // Actual commission received / pending
  currency: string;           // 'USD', 'EUR', 'GBP'
  status: CommissionStatus;
  date: string;               // ISO date string 'YYYY-MM-DD'
  notes?: string;
  createdAt: string;          // ISO timestamp
  updatedAt?: string;
}

export type ExpenseCategory =
  | 'ads'
  | 'hosting'
  | 'domain'
  | 'software'
  | 'production'
  | 'other';

export type ExpenseCostType = 'recurring_subscription' | 'one_off';

export type ExpenseBillingCycle = 'monthly' | 'yearly' | 'one_time';

export type ExpenseStatus = 'paid' | 'pending' | 'scheduled';

export interface OperatingExpense {
  id: string;
  title: string;
  category: ExpenseCategory;
  costType: ExpenseCostType;
  billingCycle: ExpenseBillingCycle;
  amount: number;
  currency: string;
  status: ExpenseStatus;
  vendor: string;             // e.g., 'Google Cloud', 'Namecheap', 'Meta Ads', 'Ableton'
  date: string;               // ISO date string 'YYYY-MM-DD'
  renewalDate?: string;       // Next renewal if recurring
  invoiceRef?: string;        // e.g., 'INV-99214'
  notes?: string;
  createdAt: string;          // ISO timestamp
  updatedAt?: string;
}

export interface MonthlyFinancialSummary {
  monthKey: string;           // '2026-01', '2026-02', etc.
  monthLabel: string;         // 'Jan 2026'
  grossRevenue: number;
  commissions: number;
  expenses: number;
  netProfit: number;
}

export interface FinancialSummary {
  totalCommissions: number;
  totalPendingCommissions: number;
  totalReceivedCommissions: number;
  totalExpenses: number;
  totalPaidExpenses: number;
  totalPendingExpenses: number;
  netOperatingIncome: number; // commissions - expenses
  profitMarginPercent: number; // (netOperatingIncome / commissions) * 100
  commissionsByType: Record<CommissionType, number>;
  expensesByCategory: Record<ExpenseCategory, number>;
  monthlyTrends: MonthlyFinancialSummary[];
}

export type DateFilterPreset =
  | 'all'
  | 'today'
  | 'last_7_days'
  | 'last_30_days'
  | 'this_month'
  | 'last_month'
  | 'this_quarter'
  | 'this_year'
  | 'custom';

export interface DateFilterConfig {
  preset: DateFilterPreset;
  startDate?: string;
  endDate?: string;
}

export interface FinancialImportResult {
  commissions: CommissionEarning[];
  expenses: OperatingExpense[];
  importedCount: number;
  errors: string[];
}
