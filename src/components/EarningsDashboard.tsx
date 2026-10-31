import React, { useState, useEffect, useMemo } from 'react';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Receipt,
  FileSpreadsheet,
  Printer,
  FileCode,
  Plus,
  Search,
  Filter,
  Calendar,
  Layers,
  Server,
  Globe,
  Radio,
  Music,
  ShoppingBag,
  ExternalLink,
  Edit2,
  Trash2,
  CheckCircle2,
  Clock,
  AlertCircle,
  RefreshCw,
  X,
  PieChart,
  BarChart3,
  Percent,
  Check,
  ChevronDown,
  Upload,
  Download,
  FileText,
  FileDown,
} from 'lucide-react';
import {
  CommissionEarning,
  OperatingExpense,
  FinancialSummary,
  DateFilterPreset,
  DateFilterConfig,
  CommissionType,
  ExpenseCategory,
  CommissionStatus,
  ExpenseStatus,
  ExpenseCostType,
  ExpenseBillingCycle,
  FinancialImportResult,
} from '../types/finance';
import {
  fetchCommissionEarnings,
  fetchOperatingExpenses,
  saveCommissionEarning,
  deleteCommissionEarning,
  saveOperatingExpense,
  deleteOperatingExpense,
  filterItemsByDate,
  calculateFinancialSummary,
  exportFinancialCSV,
  exportCommissionsOnlyCSV,
  exportExpensesOnlyCSV,
  exportFinancialJSON,
  generatePrintableReport,
  generatePrintableHTML,
  downloadFinancialHTMLReport,
  formatDateRangeDisplay,
  importFinancialCSV,
  importFinancialJSON,
  downloadSampleCSVTemplate,
} from '../services/financeService';
import { printIsolatedDocument } from '../services/printService';
import { DateRangePicker } from './DateRangePicker';

interface EarningsDashboardProps {
  onRefreshParent?: () => void;
}

export const EarningsDashboard: React.FC<EarningsDashboardProps> = () => {
  const [earnings, setEarnings] = useState<CommissionEarning[]>([]);
  const [expenses, setExpenses] = useState<OperatingExpense[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  // Filters
  const [datePreset, setDatePreset] = useState<DateFilterPreset>('all');
  const [customStartDate, setCustomStartDate] = useState<string>('');
  const [customEndDate, setCustomEndDate] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'all' | 'commissions' | 'expenses'>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Modals
  const [showCommissionModal, setShowCommissionModal] = useState<boolean>(false);
  const [showExpenseModal, setShowExpenseModal] = useState<boolean>(false);
  const [editingCommission, setEditingCommission] = useState<CommissionEarning | null>(null);
  const [editingExpense, setEditingExpense] = useState<OperatingExpense | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Print & Import Modals
  const [showPrintModal, setShowPrintModal] = useState<boolean>(false);
  const [showImportModal, setShowImportModal] = useState<boolean>(false);
  const [importMode, setImportMode] = useState<'file' | 'paste' | 'templates'>('file');
  const [importPastedText, setImportPastedText] = useState<string>('');
  const [importFileName, setImportFileName] = useState<string>('');
  const [importFileContent, setImportFileContent] = useState<string>('');
  const [importing, setImporting] = useState<boolean>(false);
  const [importError, setImportError] = useState<string | null>(null);

  const [isDraggingFile, setIsDraggingFile] = useState<boolean>(false);
  const [showExportMenu, setShowExportMenu] = useState<boolean>(false);

  const processFile = (file: File) => {
    setImportError(null);
    if (!file) return;
    setImportFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setImportFileContent(content || '');
    };
    reader.onerror = () => {
      setImportError('Failed to read file content.');
    };
    reader.readAsText(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingFile(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleFileDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingFile(true);
  };

  const handleFileDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingFile(false);
  };

  const handleExecuteImport = async () => {
    const rawData = importMode === 'file' ? importFileContent : importPastedText;
    if (!rawData.trim()) {
      setImportError('Please select a file or paste data before importing.');
      return;
    }

    setImporting(true);
    setImportError(null);

    try {
      let result: FinancialImportResult;
      const isJson = rawData.trim().startsWith('{') || rawData.trim().startsWith('[');

      if (isJson) {
        result = await importFinancialJSON(rawData);
      } else {
        result = await importFinancialCSV(rawData);
      }

      if (result.importedCount === 0) {
        setImportError(
          result.errors.length > 0
            ? result.errors.join('; ')
            : 'No valid transaction records found in the provided data.'
        );
        setImporting(false);
        return;
      }

      await loadData();
      setShowImportModal(false);
      setImportFileContent('');
      setImportFileName('');
      setImportPastedText('');
      triggerToast(
        `Successfully imported ${result.importedCount} transactions (${result.commissions.length} commissions, ${result.expenses.length} expenses)!`
      );
    } catch (err: any) {
      setImportError(err?.message || 'Failed to process import.');
    } finally {
      setImporting(false);
    }
  };

  // Form states - Commission
  const [commForm, setCommForm] = useState({
    title: '',
    type: 'affiliate_store' as CommissionType,
    partnerOrPlatform: '',
    orderReference: '',
    saleAmount: 100,
    commissionRate: 15,
    netEarnings: 15,
    currency: 'USD',
    status: 'received' as CommissionStatus,
    date: new Date().toISOString().slice(0, 10),
    notes: '',
  });

  // Form states - Expense
  const [expForm, setExpForm] = useState({
    title: '',
    category: 'ads' as ExpenseCategory,
    costType: 'recurring_subscription' as ExpenseCostType,
    billingCycle: 'monthly' as ExpenseBillingCycle,
    amount: 50,
    currency: 'USD',
    status: 'paid' as ExpenseStatus,
    vendor: '',
    date: new Date().toISOString().slice(0, 10),
    renewalDate: '',
    invoiceRef: '',
    notes: '',
  });

  const loadData = async () => {
    try {
      const [commData, expData] = await Promise.all([
        fetchCommissionEarnings(),
        fetchOperatingExpenses(),
      ]);
      setEarnings(commData);
      setExpenses(expData);
    } catch (err) {
      console.warn('Error loading financial records:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleManualRefresh = async () => {
    setRefreshing(true);
    await loadData();
    triggerToast('Financial records refreshed from database');
  };

  const triggerToast = (msg: string) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(null), 3500);
  };

  // Date Filter configuration
  const dateFilterConfig: DateFilterConfig = useMemo(() => ({
    preset: datePreset,
    startDate: datePreset === 'custom' ? customStartDate : undefined,
    endDate: datePreset === 'custom' ? customEndDate : undefined,
  }), [datePreset, customStartDate, customEndDate]);

  // Filtered lists
  const filteredEarnings = useMemo(() => {
    let list = filterItemsByDate(earnings, dateFilterConfig);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (e) =>
          e.title.toLowerCase().includes(q) ||
          e.partnerOrPlatform.toLowerCase().includes(q) ||
          (e.orderReference && e.orderReference.toLowerCase().includes(q)) ||
          (e.notes && e.notes.toLowerCase().includes(q))
      );
    }
    if (typeFilter !== 'all') {
      list = list.filter((e) => e.type === typeFilter);
    }
    if (statusFilter !== 'all') {
      list = list.filter((e) => e.status === statusFilter);
    }
    return list;
  }, [earnings, dateFilterConfig, searchQuery, typeFilter, statusFilter]);

  const filteredExpenses = useMemo(() => {
    let list = filterItemsByDate(expenses, dateFilterConfig);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (exp) =>
          exp.title.toLowerCase().includes(q) ||
          exp.vendor.toLowerCase().includes(q) ||
          (exp.invoiceRef && exp.invoiceRef.toLowerCase().includes(q)) ||
          (exp.notes && exp.notes.toLowerCase().includes(q))
      );
    }
    if (typeFilter !== 'all') {
      list = list.filter((exp) => exp.category === typeFilter);
    }
    if (statusFilter !== 'all') {
      list = list.filter((exp) => exp.status === statusFilter);
    }
    return list;
  }, [expenses, dateFilterConfig, searchQuery, typeFilter, statusFilter]);

  // Overall Financial Summary based on date filter
  const dateFilteredOnlyEarnings = useMemo(
    () => filterItemsByDate(earnings, dateFilterConfig),
    [earnings, dateFilterConfig]
  );
  const dateFilteredOnlyExpenses = useMemo(
    () => filterItemsByDate(expenses, dateFilterConfig),
    [expenses, dateFilterConfig]
  );

  const summary: FinancialSummary = useMemo(
    () => calculateFinancialSummary(dateFilteredOnlyEarnings, dateFilteredOnlyExpenses),
    [dateFilteredOnlyEarnings, dateFilteredOnlyExpenses]
  );

  // Formatted period info for UI and exports
  const periodDisplay = useMemo(() => {
    return formatDateRangeDisplay(dateFilterConfig);
  }, [dateFilterConfig]);

  const periodLabel = useMemo(() => {
    return `${periodDisplay.label} (${periodDisplay.humanRange})`;
  }, [periodDisplay]);

  // Open Edit Commission
  const handleOpenEditCommission = (item: CommissionEarning) => {
    setEditingCommission(item);
    setCommForm({
      title: item.title,
      type: item.type,
      partnerOrPlatform: item.partnerOrPlatform,
      orderReference: item.orderReference || '',
      saleAmount: item.saleAmount,
      commissionRate: item.commissionRate,
      netEarnings: item.netEarnings,
      currency: item.currency,
      status: item.status,
      date: item.date,
      notes: item.notes || '',
    });
    setShowCommissionModal(true);
  };

  // Open Add Commission
  const handleOpenAddCommission = () => {
    setEditingCommission(null);
    setCommForm({
      title: '',
      type: 'affiliate_store',
      partnerOrPlatform: '',
      orderReference: '',
      saleAmount: 120,
      commissionRate: 15,
      netEarnings: 18,
      currency: 'USD',
      status: 'received',
      date: new Date().toISOString().slice(0, 10),
      notes: '',
    });
    setShowCommissionModal(true);
  };

  // Save Commission
  const handleSaveCommissionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const saved = await saveCommissionEarning({
        id: editingCommission?.id,
        title: commForm.title,
        type: commForm.type,
        partnerOrPlatform: commForm.partnerOrPlatform,
        orderReference: commForm.orderReference || undefined,
        saleAmount: Number(commForm.saleAmount),
        commissionRate: Number(commForm.commissionRate),
        netEarnings: Number(commForm.netEarnings),
        currency: commForm.currency,
        status: commForm.status,
        date: commForm.date,
        notes: commForm.notes || undefined,
        createdAt: editingCommission?.createdAt,
      });

      setEarnings((prev) => {
        const idx = prev.findIndex((i) => i.id === saved.id);
        if (idx >= 0) {
          const updated = [...prev];
          updated[idx] = saved;
          return updated;
        }
        return [saved, ...prev];
      });

      setShowCommissionModal(false);
      triggerToast(
        editingCommission ? 'Commission updated successfully' : 'New commission recorded'
      );
    } catch (err) {
      console.warn('Failed to save commission:', err);
    }
  };

  // Delete Commission
  const handleDeleteCommission = async (id: string) => {
    await deleteCommissionEarning(id);
    setEarnings((prev) => prev.filter((i) => i.id !== id));
    setDeleteConfirmId(null);
    triggerToast('Commission entry removed');
  };

  // Open Edit Expense
  const handleOpenEditExpense = (item: OperatingExpense) => {
    setEditingExpense(item);
    setExpForm({
      title: item.title,
      category: item.category,
      costType: item.costType,
      billingCycle: item.billingCycle,
      amount: item.amount,
      currency: item.currency,
      status: item.status,
      vendor: item.vendor,
      date: item.date,
      renewalDate: item.renewalDate || '',
      invoiceRef: item.invoiceRef || '',
      notes: item.notes || '',
    });
    setShowExpenseModal(true);
  };

  // Open Add Expense
  const handleOpenAddExpense = () => {
    setEditingExpense(null);
    setExpForm({
      title: '',
      category: 'ads',
      costType: 'recurring_subscription',
      billingCycle: 'monthly',
      amount: 45,
      currency: 'USD',
      status: 'paid',
      vendor: '',
      date: new Date().toISOString().slice(0, 10),
      renewalDate: '',
      invoiceRef: '',
      notes: '',
    });
    setShowExpenseModal(true);
  };

  // Save Expense
  const handleSaveExpenseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const saved = await saveOperatingExpense({
        id: editingExpense?.id,
        title: expForm.title,
        category: expForm.category,
        costType: expForm.costType,
        billingCycle: expForm.billingCycle,
        amount: Number(expForm.amount),
        currency: expForm.currency,
        status: expForm.status,
        vendor: expForm.vendor,
        date: expForm.date,
        renewalDate: expForm.renewalDate || undefined,
        invoiceRef: expForm.invoiceRef || undefined,
        notes: expForm.notes || undefined,
        createdAt: editingExpense?.createdAt,
      });

      setExpenses((prev) => {
        const idx = prev.findIndex((i) => i.id === saved.id);
        if (idx >= 0) {
          const updated = [...prev];
          updated[idx] = saved;
          return updated;
        }
        return [saved, ...prev];
      });

      setShowExpenseModal(false);
      triggerToast(
        editingExpense ? 'Operating expense updated' : 'New operating expense recorded'
      );
    } catch (err) {
      console.warn('Failed to save expense:', err);
    }
  };

  // Delete Expense
  const handleDeleteExpense = async (id: string) => {
    await deleteOperatingExpense(id);
    setExpenses((prev) => prev.filter((i) => i.id !== id));
    setDeleteConfirmId(null);
    triggerToast('Operating expense removed');
  };

  // Toggle quick status
  const handleToggleCommissionStatus = async (item: CommissionEarning) => {
    const nextStatus: CommissionStatus =
      item.status === 'received' ? 'pending' : 'received';
    const updated = await saveCommissionEarning({ ...item, status: nextStatus });
    setEarnings((prev) => prev.map((e) => (e.id === updated.id ? updated : e)));
    triggerToast(`Commission marked as ${nextStatus.toUpperCase()}`);
  };

  const handleToggleExpenseStatus = async (item: OperatingExpense) => {
    const nextStatus: ExpenseStatus = item.status === 'paid' ? 'pending' : 'paid';
    const updated = await saveOperatingExpense({ ...item, status: nextStatus });
    setExpenses((prev) => prev.map((e) => (e.id === updated.id ? updated : e)));
    triggerToast(`Expense marked as ${nextStatus.toUpperCase()}`);
  };

  // Helpers for category styling
  const getCategoryBadge = (category: ExpenseCategory) => {
    switch (category) {
      case 'ads':
        return { label: 'Ads & Marketing', bg: 'bg-rose-500/10 text-rose-400 border-rose-500/20' };
      case 'hosting':
        return { label: 'Cloud Hosting', bg: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20' };
      case 'domain':
        return { label: 'Domain & DNS', bg: 'bg-blue-500/10 text-blue-400 border-blue-500/20' };
      case 'software':
        return { label: 'Software / DAW', bg: 'bg-violet-500/10 text-violet-400 border-violet-500/20' };
      case 'production':
        return { label: 'Audio Samples', bg: 'bg-amber-500/10 text-amber-400 border-amber-500/20' };
      default:
        return { label: 'General Cost', bg: 'bg-stone-500/10 text-stone-400 border-stone-500/20' };
    }
  };

  const getTypeBadge = (type: CommissionType) => {
    switch (type) {
      case 'affiliate_store':
        return { label: 'Affiliate Gear', bg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' };
      case 'partner_referral':
        return { label: 'Partner Referral', bg: 'bg-teal-500/10 text-teal-400 border-teal-500/20' };
      case 'custom_external':
        return { label: 'Custom Commission', bg: 'bg-amber-500/10 text-amber-400 border-amber-500/20' };
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {successToast && (
        <div className="fixed top-20 right-6 z-50 flex items-center space-x-2.5 bg-emerald-950/90 border border-emerald-500/40 text-emerald-200 px-4 py-3 rounded-xl shadow-2xl backdrop-blur-md animate-in fade-in slide-in-from-top-2 duration-200">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-xs sm:text-sm font-medium">{successToast}</span>
        </div>
      )}

      {/* Header & Main Actions */}
      <div className="bg-stone-900/90 border border-amber-500/20 rounded-2xl p-5 sm:p-6 backdrop-blur-md shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-3 mb-1.5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500/20 to-teal-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-inner">
                <DollarSign className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-serif font-bold text-amber-100 flex items-center space-x-2">
                  <span>Commission Earnings & Costs</span>
                  <span className="text-[10px] tracking-wider uppercase font-sans font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                    P&L Ledger
                  </span>
                </h2>
                <p className="text-xs sm:text-sm text-stone-400">
                  Real-time profit tracking for affiliate merchandise, custom soundtrack commissions, and operational overhead.
                </p>
              </div>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={handleOpenAddCommission}
              className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-medium text-xs sm:text-sm shadow-md transition-all active:scale-95 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Log Commission</span>
            </button>

            <button
              onClick={handleOpenAddExpense}
              className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-stone-800 hover:bg-stone-700/80 border border-amber-500/20 hover:border-amber-500/40 text-amber-200 font-medium text-xs sm:text-sm transition-all active:scale-95 shadow-sm cursor-pointer"
            >
              <Plus className="w-4 h-4 text-rose-400" />
              <span>Add Operating Cost</span>
            </button>

            {/* Import Ledger Button */}
            <button
              onClick={() => {
                setShowImportModal(true);
                setImportError(null);
              }}
              className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-sky-950/40 hover:bg-sky-900/60 border border-sky-500/30 hover:border-sky-400 text-sky-200 font-medium text-xs sm:text-sm transition-all active:scale-95 shadow-sm cursor-pointer"
              title="Import commissions or operating costs from CSV or JSON"
            >
              <Upload className="w-4 h-4 text-sky-400" />
              <span>Import Ledger</span>
            </button>

            {/* Export & Print Group */}
            <div className="relative flex items-center bg-stone-950/80 border border-stone-800 rounded-xl p-1 space-x-1">
              <div className="relative flex items-center">
                <button
                  type="button"
                  onClick={() => {
                    exportFinancialCSV(dateFilteredOnlyEarnings, dateFilteredOnlyExpenses, summary, periodLabel);
                    triggerToast('Full Financial CSV report downloaded!');
                  }}
                  title="Download CSV for Excel / Google Sheets"
                  className="flex items-center space-x-1 px-2 py-1.5 rounded-l-lg text-xs text-stone-300 hover:text-white hover:bg-stone-800 transition-colors cursor-pointer"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="hidden sm:inline">CSV</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowExportMenu(!showExportMenu)}
                  title="CSV Export Options (Commissions only, Expenses only, Full Report)"
                  className="px-1 py-1.5 rounded-r-lg text-xs text-stone-400 hover:text-white hover:bg-stone-800 transition-colors cursor-pointer border-l border-stone-800"
                >
                  <ChevronDown className="w-3 h-3" />
                </button>

                {showExportMenu && (
                  <div className="absolute top-full left-0 mt-1.5 w-60 bg-stone-900 border border-stone-800 rounded-xl shadow-2xl p-1.5 z-40 space-y-1 animate-in fade-in duration-100">
                    <button
                      type="button"
                      onClick={() => {
                        exportFinancialCSV(dateFilteredOnlyEarnings, dateFilteredOnlyExpenses, summary, periodLabel);
                        setShowExportMenu(false);
                        triggerToast('Full Financial CSV report downloaded!');
                      }}
                      className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs text-stone-200 hover:bg-stone-800 flex items-center justify-between cursor-pointer"
                    >
                      <span className="font-medium">Full Financial Report</span>
                      <span className="text-[10px] text-emerald-400 font-mono">P&amp;L + Ledger</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        exportCommissionsOnlyCSV(dateFilteredOnlyEarnings, periodLabel);
                        setShowExportMenu(false);
                        triggerToast('Commissions ledger CSV downloaded!');
                      }}
                      className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs text-stone-200 hover:bg-stone-800 flex items-center justify-between cursor-pointer"
                    >
                      <span className="font-medium">Commissions Only</span>
                      <span className="text-[10px] text-teal-400 font-mono">{dateFilteredOnlyEarnings.length} items</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        exportExpensesOnlyCSV(dateFilteredOnlyExpenses, periodLabel);
                        setShowExportMenu(false);
                        triggerToast('Operating Expenses ledger CSV downloaded!');
                      }}
                      className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs text-stone-200 hover:bg-stone-800 flex items-center justify-between cursor-pointer"
                    >
                      <span className="font-medium">Expenses Only</span>
                      <span className="text-[10px] text-rose-400 font-mono">{dateFilteredOnlyExpenses.length} items</span>
                    </button>
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={() => setShowPrintModal(true)}
                title="Print Executive P&L Statement / Save PDF"
                className="flex items-center space-x-1 px-2.5 py-1.5 rounded-lg text-xs text-stone-300 hover:text-white hover:bg-stone-800 transition-colors cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5 text-cyan-400" />
                <span className="hidden sm:inline">Print Statement</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  exportFinancialJSON(dateFilteredOnlyEarnings, dateFilteredOnlyExpenses, summary);
                  triggerToast('Full JSON audit ledger backup downloaded!');
                }}
                title="Backup full JSON Ledger for Accounting"
                className="flex items-center space-x-1 px-2.5 py-1.5 rounded-lg text-xs text-stone-300 hover:text-white hover:bg-stone-800 transition-colors cursor-pointer"
              >
                <FileCode className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden sm:inline">JSON</span>
              </button>
            </div>

            <button
              onClick={handleManualRefresh}
              disabled={refreshing}
              className="p-2 rounded-xl bg-stone-800/80 hover:bg-stone-800 border border-stone-700 text-stone-400 hover:text-stone-200 transition-colors cursor-pointer"
              title="Refresh database records"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-amber-400' : ''}`} />
            </button>
          </div>
        </div>

        {/* Date Filter & Control Bar */}
        <div className="mt-5 pt-4 border-t border-stone-800/80 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            {/* Dedicated Date Range Picker Component */}
            <DateRangePicker
              config={dateFilterConfig}
              onChange={(newConfig) => {
                setDatePreset(newConfig.preset);
                setCustomStartDate(newConfig.startDate || '');
                setCustomEndDate(newConfig.endDate || '');
              }}
              totalFilteredCount={filteredEarnings.length + filteredExpenses.length}
            />

            {/* Quick-Access Preset Chips for 1-click toggling */}
            <div className="hidden sm:flex items-center space-x-1 bg-stone-950/60 p-1 rounded-xl border border-stone-800/80">
              {(['all', 'last_30_days', 'this_month', 'last_month'] as DateFilterPreset[]).map((preset) => {
                const labels: Record<DateFilterPreset, string> = {
                  all: 'All Time',
                  today: 'Today',
                  last_7_days: '7 Days',
                  last_30_days: 'Last 30 Days',
                  this_month: 'Current Month',
                  last_month: 'Last Month',
                  this_quarter: 'Quarter',
                  this_year: 'Year',
                  custom: 'Custom',
                };
                const active = datePreset === preset;
                return (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => {
                      setDatePreset(preset);
                      if (preset !== 'custom') {
                        setCustomStartDate('');
                        setCustomEndDate('');
                      }
                    }}
                    className={`text-xs px-2.5 py-1 rounded-lg font-medium transition-all ${
                      active
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                        : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800/60'
                    }`}
                  >
                    {labels[preset]}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Period Display & Quick Reset */}
          <div className="flex items-center space-x-2 text-xs">
            <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-stone-950/70 border border-stone-800 text-stone-300">
              <span className="text-stone-400">Period:</span>
              <span className="text-amber-300 font-semibold font-mono">{periodDisplay.label}</span>
              <span className="text-stone-500 font-mono text-[11px] hidden sm:inline">
                ({periodDisplay.humanRange})
              </span>
            </div>

            {datePreset !== 'all' && (
              <button
                type="button"
                onClick={() => {
                  setDatePreset('all');
                  setCustomStartDate('');
                  setCustomEndDate('');
                }}
                className="text-xs text-stone-400 hover:text-amber-300 px-2 py-1 rounded-lg hover:bg-stone-800 transition-colors flex items-center space-x-1"
                title="Reset to All Time"
              >
                <X className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Active Filter Summary Banner */}
      {(datePreset !== 'all' || searchQuery.trim() || typeFilter !== 'all' || statusFilter !== 'all') && (
        <div className="flex flex-wrap items-center justify-between gap-2.5 px-4 py-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200 backdrop-blur-sm">
          <div className="flex flex-wrap items-center gap-2">
            <span className="flex items-center space-x-1 font-semibold text-amber-300">
              <Filter className="w-3.5 h-3.5" />
              <span>Active Filter:</span>
            </span>
            {datePreset !== 'all' && (
              <span className="px-2 py-0.5 rounded-md bg-stone-900/80 border border-amber-500/30 text-amber-200 font-mono text-[11px]">
                {periodDisplay.label}: {periodDisplay.humanRange}
              </span>
            )}
            {searchQuery.trim() && (
              <span className="px-2 py-0.5 rounded-md bg-stone-900/80 border border-amber-500/30 text-amber-200 text-[11px]">
                Query: "{searchQuery}"
              </span>
            )}
            {typeFilter !== 'all' && (
              <span className="px-2 py-0.5 rounded-md bg-stone-900/80 border border-amber-500/30 text-amber-200 text-[11px]">
                Type: {typeFilter}
              </span>
            )}
            {statusFilter !== 'all' && (
              <span className="px-2 py-0.5 rounded-md bg-stone-900/80 border border-amber-500/30 text-amber-200 text-[11px]">
                Status: {statusFilter}
              </span>
            )}
            <span className="text-stone-400 text-[11px]">
              ({filteredEarnings.length} commissions · {filteredExpenses.length} expenses)
            </span>
          </div>

          <button
            onClick={() => {
              setDatePreset('all');
              setCustomStartDate('');
              setCustomEndDate('');
              setSearchQuery('');
              setTypeFilter('all');
              setStatusFilter('all');
            }}
            className="text-[11px] font-semibold text-amber-300 hover:text-amber-100 underline underline-offset-2 transition-colors ml-auto"
          >
            Clear All Filters
          </button>
        </div>
      )}

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Gross Commissions */}
        <div className="bg-stone-900/80 border border-stone-800 hover:border-emerald-500/30 rounded-2xl p-4 sm:p-5 transition-all shadow-lg relative overflow-hidden group">
          <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-emerald-500/5 rounded-full blur-xl group-hover:bg-emerald-500/10 transition-all pointer-events-none" />
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-stone-400 uppercase tracking-wider">Gross Commissions</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-serif font-bold text-emerald-400">
            ${summary.totalCommissions.toFixed(2)}
          </div>
          <div className="mt-2 text-[11px] text-stone-400 flex items-center justify-between">
            <span className="text-stone-300">Received: ${summary.totalReceivedCommissions.toFixed(2)}</span>
            {summary.totalPendingCommissions > 0 && (
              <span className="text-amber-400 font-medium">Pending: ${summary.totalPendingCommissions.toFixed(2)}</span>
            )}
          </div>
        </div>

        {/* Operating Expenses */}
        <div className="bg-stone-900/80 border border-stone-800 hover:border-rose-500/30 rounded-2xl p-4 sm:p-5 transition-all shadow-lg relative overflow-hidden group">
          <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-rose-500/5 rounded-full blur-xl group-hover:bg-rose-500/10 transition-all pointer-events-none" />
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-stone-400 uppercase tracking-wider">Operating Expenses</span>
            <div className="p-2 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
              <Receipt className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-serif font-bold text-rose-400">
            ${summary.totalExpenses.toFixed(2)}
          </div>
          <div className="mt-2 text-[11px] text-stone-400 flex items-center justify-between">
            <span className="text-stone-300">Paid: ${summary.totalPaidExpenses.toFixed(2)}</span>
            {summary.totalPendingExpenses > 0 && (
              <span className="text-rose-400 font-medium">Scheduled: ${summary.totalPendingExpenses.toFixed(2)}</span>
            )}
          </div>
        </div>

        {/* Net Operating Income */}
        <div className="bg-stone-900/80 border border-stone-800 hover:border-amber-500/30 rounded-2xl p-4 sm:p-5 transition-all shadow-lg relative overflow-hidden group">
          <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-amber-500/5 rounded-full blur-xl group-hover:bg-amber-500/10 transition-all pointer-events-none" />
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-stone-400 uppercase tracking-wider">Net Operating Income</span>
            <div className={`p-2 rounded-xl border ${summary.netOperatingIncome >= 0 ? 'bg-teal-500/10 text-teal-400 border-teal-500/20' : 'bg-rose-500/10 text-rose-400 border-rose-500/20'}`}>
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className={`text-2xl sm:text-3xl font-serif font-bold ${summary.netOperatingIncome >= 0 ? 'text-teal-300' : 'text-rose-400'}`}>
            {summary.netOperatingIncome >= 0 ? '+' : ''}${summary.netOperatingIncome.toFixed(2)}
          </div>
          <div className="mt-2 text-[11px] text-stone-400 flex items-center justify-between">
            <span>Commissions &minus; Expenses</span>
            <span className="text-stone-300 font-medium">P&L Balance</span>
          </div>
        </div>

        {/* Operating Margin */}
        <div className="bg-stone-900/80 border border-stone-800 hover:border-cyan-500/30 rounded-2xl p-4 sm:p-5 transition-all shadow-lg relative overflow-hidden group">
          <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-cyan-500/5 rounded-full blur-xl group-hover:bg-cyan-500/10 transition-all pointer-events-none" />
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-stone-400 uppercase tracking-wider">Profit Margin</span>
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Percent className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-serif font-bold text-cyan-300">
            {summary.profitMarginPercent.toFixed(1)}%
          </div>
          <div className="mt-2 text-[11px] text-stone-400 flex items-center justify-between">
            <span>Net Margin Ratio</span>
            <span className="text-emerald-400 font-medium">{summary.profitMarginPercent > 50 ? 'Healthy' : 'Moderate'}</span>
          </div>
        </div>
      </div>

      {/* Visual Analytics & Breakdown Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Operating Costs Breakdown by Category */}
        <div className="bg-stone-900/80 border border-stone-800 rounded-2xl p-5 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-stone-200 flex items-center space-x-2">
              <Receipt className="w-4 h-4 text-rose-400" />
              <span>Operating Costs by Category</span>
            </h3>
            <span className="text-xs text-stone-400 font-mono">${summary.totalExpenses.toFixed(2)} total</span>
          </div>

          <div className="space-y-3.5">
            {[
              { key: 'ads' as ExpenseCategory, label: 'Ads & Campaigns', icon: Radio, color: 'bg-rose-500' },
              { key: 'hosting' as ExpenseCategory, label: 'Cloud Hosting & DB', icon: Server, color: 'bg-cyan-500' },
              { key: 'domain' as ExpenseCategory, label: 'Domain & DNS', icon: Globe, color: 'bg-blue-500' },
              { key: 'software' as ExpenseCategory, label: 'Software & DAW', icon: Layers, color: 'bg-violet-500' },
              { key: 'production' as ExpenseCategory, label: 'Acoustic Samples & Gear', icon: Music, color: 'bg-amber-500' },
              { key: 'other' as ExpenseCategory, label: 'Other Operating Fees', icon: AlertCircle, color: 'bg-stone-500' },
            ].map(({ key, label, icon: Icon, color }) => {
              const amount = summary.expensesByCategory[key] || 0;
              const percent = summary.totalExpenses > 0 ? (amount / summary.totalExpenses) * 100 : 0;
              return (
                <div key={key} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-stone-300 flex items-center space-x-1.5">
                      <Icon className="w-3.5 h-3.5 text-stone-400" />
                      <span>{label}</span>
                    </span>
                    <span className="font-medium text-stone-200">
                      ${amount.toFixed(2)}{' '}
                      <span className="text-[10px] text-stone-500">({percent.toFixed(0)}%)</span>
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-stone-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${color} transition-all duration-500`}
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Commission Revenue Streams Breakdown */}
        <div className="bg-stone-900/80 border border-stone-800 rounded-2xl p-5 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-stone-200 flex items-center space-x-2">
              <ShoppingBag className="w-4 h-4 text-emerald-400" />
              <span>Commission Revenue Streams</span>
            </h3>
            <span className="text-xs text-stone-400 font-mono">${summary.totalCommissions.toFixed(2)} total</span>
          </div>

          <div className="space-y-3.5">
            {[
              {
                key: 'affiliate_store' as CommissionType,
                label: 'Affiliate Store Gear',
                desc: 'Quartz bowls, headphones, tuning forks',
                amount: summary.commissionsByType.affiliate_store || 0,
                color: 'bg-emerald-500',
              },
              {
                key: 'partner_referral' as CommissionType,
                label: 'Partner Referrals',
                desc: 'MindSpa & sound wellness app partner programs',
                amount: summary.commissionsByType.partner_referral || 0,
                color: 'bg-teal-500',
              },
              {
                key: 'custom_external' as CommissionType,
                label: 'Custom Commissions',
                desc: 'External client soundbath & custom audio commissions',
                amount: summary.commissionsByType.custom_external || 0,
                color: 'bg-amber-500',
              },
            ].map(({ key, label, desc, amount, color }) => {
              const percent = summary.totalCommissions > 0 ? (amount / summary.totalCommissions) * 100 : 0;
              return (
                <div key={key} className="space-y-1 bg-stone-950/40 p-2.5 rounded-xl border border-stone-800/60">
                  <div className="flex items-center justify-between text-xs">
                    <div>
                      <div className="font-semibold text-stone-200">{label}</div>
                      <div className="text-[10px] text-stone-500">{desc}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-emerald-400">${amount.toFixed(2)}</div>
                      <div className="text-[10px] text-stone-500">{percent.toFixed(0)}%</div>
                    </div>
                  </div>
                  <div className="w-full h-1.5 bg-stone-800 rounded-full overflow-hidden mt-1">
                    <div
                      className={`h-full ${color} transition-all duration-500`}
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Monthly Performance Trends */}
        <div className="bg-stone-900/80 border border-stone-800 rounded-2xl p-5 shadow-lg flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-stone-200 flex items-center space-x-2">
                <BarChart3 className="w-4 h-4 text-cyan-400" />
                <span>Monthly Trends (P&L)</span>
              </h3>
              <span className="text-[10px] text-stone-400 uppercase tracking-wider font-mono">Net Profit</span>
            </div>

            {summary.monthlyTrends.length === 0 ? (
              <div className="py-12 text-center text-xs text-stone-500">
                No monthly data points in selected date range
              </div>
            ) : (
              <div className="space-y-3">
                {summary.monthlyTrends.slice(-5).map((m) => {
                  const maxVal = Math.max(m.commissions, m.expenses, 1);
                  const commPct = (m.commissions / maxVal) * 100;
                  const expPct = (m.expenses / maxVal) * 100;
                  return (
                    <div key={m.monthKey} className="bg-stone-950/40 p-2.5 rounded-xl border border-stone-800/60">
                      <div className="flex items-center justify-between text-xs mb-1.5">
                        <span className="font-semibold text-stone-300">{m.monthLabel}</span>
                        <div className="flex items-center space-x-2 text-[11px]">
                          <span className="text-emerald-400 font-medium">+${m.commissions.toFixed(0)}</span>
                          <span className="text-rose-400 font-medium">&minus;${m.expenses.toFixed(0)}</span>
                          <span className={`font-bold ${m.netProfit >= 0 ? 'text-teal-300' : 'text-rose-400'}`}>
                            = ${m.netProfit.toFixed(0)}
                          </span>
                        </div>
                      </div>
                      {/* Comparative visual bar */}
                      <div className="grid grid-cols-2 gap-1.5 h-1.5">
                        <div className="bg-stone-800 rounded-full overflow-hidden flex justify-end">
                          <div
                            className="h-full bg-emerald-500 rounded-full"
                            style={{ width: `${commPct}%` }}
                            title={`Commissions: $${m.commissions}`}
                          />
                        </div>
                        <div className="bg-stone-800 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-rose-500 rounded-full"
                            style={{ width: `${expPct}%` }}
                            title={`Expenses: $${m.expenses}`}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-stone-800 flex items-center justify-between text-[11px] text-stone-400">
            <span className="flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
              <span>Income</span>
              <span className="w-2 h-2 rounded-full bg-rose-500 inline-block ml-2" />
              <span>Expense</span>
            </span>
            <button
              onClick={() => setShowPrintModal(true)}
              className="text-amber-400 hover:text-amber-300 font-medium cursor-pointer"
            >
              View Full Statement &rarr;
            </button>
          </div>
        </div>
      </div>

      {/* Interactive Records Explorer */}
      <div className="bg-stone-900/90 border border-stone-800 rounded-2xl overflow-hidden shadow-xl">
        {/* Explorer Subtabs & Search */}
        <div className="p-4 sm:p-5 border-b border-stone-800 flex flex-col md:flex-row md:items-center justify-between gap-3 bg-stone-950/40">
          <div className="flex items-center space-x-1 bg-stone-900 p-1 rounded-xl border border-stone-800">
            <button
              onClick={() => setActiveTab('all')}
              className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-all ${
                activeTab === 'all'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              All Records ({filteredEarnings.length + filteredExpenses.length})
            </button>
            <button
              onClick={() => setActiveTab('commissions')}
              className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-all flex items-center space-x-1 ${
                activeTab === 'commissions'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              <span>Commissions</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800">
                {filteredEarnings.length}
              </span>
            </button>
            <button
              onClick={() => setActiveTab('expenses')}
              className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-all flex items-center space-x-1 ${
                activeTab === 'expenses'
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              <span>Operating Costs</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-rose-950 text-rose-400 border border-rose-800">
                {filteredExpenses.length}
              </span>
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Search */}
            <div className="relative flex-1 sm:w-60">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-stone-500" />
              <input
                type="text"
                placeholder="Search vendor, order, partner..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-stone-900 border border-stone-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-stone-200 placeholder:text-stone-500 focus:outline-none focus:border-amber-500/40"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-500 hover:text-stone-300"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            {/* Type Filter */}
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="bg-stone-900 border border-stone-800 rounded-xl px-2.5 py-1.5 text-xs text-stone-300 focus:outline-none focus:border-amber-500/40"
            >
              <option value="all">All Categories</option>
              {activeTab !== 'expenses' && (
                <>
                  <option value="affiliate_store">Affiliate Store Gear</option>
                  <option value="partner_referral">Partner Referral</option>
                  <option value="custom_external">Custom Commission</option>
                </>
              )}
              {activeTab !== 'commissions' && (
                <>
                  <option value="ads">Ads & Marketing</option>
                  <option value="hosting">Cloud Hosting</option>
                  <option value="domain">Domain & DNS</option>
                  <option value="software">Software / DAW</option>
                  <option value="production">Audio Production</option>
                  <option value="other">Other Operating</option>
                </>
              )}
            </select>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-stone-900 border border-stone-800 rounded-xl px-2.5 py-1.5 text-xs text-stone-300 focus:outline-none focus:border-amber-500/40"
            >
              <option value="all">All Statuses</option>
              <option value="received">Received / Paid</option>
              <option value="pending">Pending / Scheduled</option>
              <option value="refunded">Refunded</option>
            </select>
          </div>
        </div>

        {/* Ledger Table */}
        <div className="overflow-x-auto">
          {loading ? (
            <div className="py-16 text-center text-stone-400 flex flex-col items-center justify-center space-y-3">
              <RefreshCw className="w-6 h-6 animate-spin text-amber-400" />
              <span className="text-xs">Loading financial ledgers...</span>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-stone-800 bg-stone-950/60 text-[11px] font-semibold text-stone-400 uppercase tracking-wider">
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Transaction / Item</th>
                  <th className="py-3 px-4">Type / Category</th>
                  <th className="py-3 px-4">Partner / Vendor</th>
                  <th className="py-3 px-4 text-right">Gross Value</th>
                  <th className="py-3 px-4 text-right">Net Amount</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-800/60 text-xs">
                {/* When showing all or commissions */}
                {(activeTab === 'all' || activeTab === 'commissions') &&
                  filteredEarnings.map((comm) => {
                    const badge = getTypeBadge(comm.type);
                    return (
                      <tr
                        key={comm.id}
                        className="hover:bg-stone-800/30 transition-colors group"
                      >
                        <td className="py-3 px-4 font-mono text-stone-400 whitespace-nowrap">
                          {comm.date}
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-medium text-stone-100 flex items-center space-x-1.5">
                            <span>{comm.title}</span>
                          </div>
                          {comm.notes && (
                            <div className="text-[11px] text-stone-500 mt-0.5 max-w-xs truncate">
                              {comm.notes}
                            </div>
                          )}
                          {comm.orderReference && (
                            <span className="text-[10px] font-mono text-stone-400 bg-stone-800 px-1.5 py-0.5 rounded mt-0.5 inline-block">
                              Ref: {comm.orderReference}
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          <span
                            className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold border ${badge.bg}`}
                          >
                            {badge.label}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-stone-300 font-medium whitespace-nowrap">
                          {comm.partnerOrPlatform}
                        </td>
                        <td className="py-3 px-4 text-right font-mono text-stone-400">
                          ${comm.saleAmount.toFixed(2)}
                          <span className="text-[10px] text-stone-500 ml-1">
                            ({comm.commissionRate}%)
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right font-mono font-bold text-emerald-400 whitespace-nowrap">
                          +${comm.netEarnings.toFixed(2)}
                        </td>
                        <td className="py-3 px-4 text-center whitespace-nowrap">
                          <button
                            onClick={() => handleToggleCommissionStatus(comm)}
                            title="Click to toggle status"
                            className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold border transition-transform active:scale-95 ${
                              comm.status === 'received'
                                ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/20'
                                : comm.status === 'pending'
                                ? 'bg-amber-500/10 text-amber-300 border-amber-500/30 hover:bg-amber-500/20'
                                : 'bg-rose-500/10 text-rose-300 border-rose-500/30'
                            }`}
                          >
                            {comm.status === 'received' ? (
                              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                            ) : (
                              <Clock className="w-3 h-3 text-amber-400" />
                            )}
                            <span className="uppercase">{comm.status}</span>
                          </button>
                        </td>
                        <td className="py-3 px-4 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end space-x-1 opacity-80 group-hover:opacity-100">
                            <button
                              onClick={() => handleOpenEditCommission(comm)}
                              className="p-1.5 rounded-lg hover:bg-stone-800 text-stone-400 hover:text-amber-300 transition-colors"
                              title="Edit commission"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setDeleteConfirmId(comm.id)}
                              className="p-1.5 rounded-lg hover:bg-stone-800 text-stone-400 hover:text-rose-400 transition-colors"
                              title="Delete commission"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}

                {/* When showing all or expenses */}
                {(activeTab === 'all' || activeTab === 'expenses') &&
                  filteredExpenses.map((exp) => {
                    const badge = getCategoryBadge(exp.category);
                    return (
                      <tr
                        key={exp.id}
                        className="hover:bg-stone-800/30 transition-colors group"
                      >
                        <td className="py-3 px-4 font-mono text-stone-400 whitespace-nowrap">
                          {exp.date}
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-medium text-stone-100 flex items-center space-x-1.5">
                            <span>{exp.title}</span>
                          </div>
                          {exp.notes && (
                            <div className="text-[11px] text-stone-500 mt-0.5 max-w-xs truncate">
                              {exp.notes}
                            </div>
                          )}
                          <div className="flex items-center space-x-2 mt-0.5">
                            <span className="text-[10px] text-stone-400 capitalize">
                              {exp.costType.replace('_', ' ')} ({exp.billingCycle})
                            </span>
                            {exp.invoiceRef && (
                              <span className="text-[10px] font-mono text-stone-400 bg-stone-800 px-1.5 py-0.2 rounded">
                                Inv: {exp.invoiceRef}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          <span
                            className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold border ${badge.bg}`}
                          >
                            {badge.label}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-stone-300 font-medium whitespace-nowrap">
                          {exp.vendor}
                        </td>
                        <td className="py-3 px-4 text-right font-mono text-stone-400">
                          {exp.renewalDate ? (
                            <span className="text-[10px] text-stone-400" title={`Renews: ${exp.renewalDate}`}>
                              Renews {exp.renewalDate.slice(5)}
                            </span>
                          ) : (
                            <span className="text-[10px] text-stone-500">One-off</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right font-mono font-bold text-rose-400 whitespace-nowrap">
                          &minus;${exp.amount.toFixed(2)}
                        </td>
                        <td className="py-3 px-4 text-center whitespace-nowrap">
                          <button
                            onClick={() => handleToggleExpenseStatus(exp)}
                            title="Click to toggle status"
                            className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold border transition-transform active:scale-95 ${
                              exp.status === 'paid'
                                ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/20'
                                : 'bg-rose-500/10 text-rose-300 border-rose-500/30 hover:bg-rose-500/20'
                            }`}
                          >
                            {exp.status === 'paid' ? (
                              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                            ) : (
                              <Clock className="w-3 h-3 text-rose-400" />
                            )}
                            <span className="uppercase">{exp.status}</span>
                          </button>
                        </td>
                        <td className="py-3 px-4 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end space-x-1 opacity-80 group-hover:opacity-100">
                            <button
                              onClick={() => handleOpenEditExpense(exp)}
                              className="p-1.5 rounded-lg hover:bg-stone-800 text-stone-400 hover:text-amber-300 transition-colors"
                              title="Edit expense"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setDeleteConfirmId(exp.id)}
                              className="p-1.5 rounded-lg hover:bg-stone-800 text-stone-400 hover:text-rose-400 transition-colors"
                              title="Delete expense"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}

                {filteredEarnings.length === 0 && filteredExpenses.length === 0 && (
                  <tr>
                    <td colSpan={8} className="py-14 text-center">
                      <div className="flex flex-col items-center justify-center space-y-2.5 max-w-sm mx-auto">
                        <div className="w-10 h-10 rounded-full bg-stone-800/80 border border-stone-700 flex items-center justify-center text-amber-400">
                          <Calendar className="w-5 h-5" />
                        </div>
                        <p className="text-sm font-semibold text-stone-200">
                          No transactions found for this period
                        </p>
                        <p className="text-xs text-stone-400">
                          {datePreset !== 'all'
                            ? `No records match the selected date filter (${periodDisplay.label}). Try choosing a broader period or reset to All Time.`
                            : 'No financial records currently logged. Use the buttons above to log commissions or operating costs.'}
                        </p>
                        {datePreset !== 'all' && (
                          <button
                            type="button"
                            onClick={() => {
                              setDatePreset('all');
                              setCustomStartDate('');
                              setCustomEndDate('');
                            }}
                            className="mt-2 px-3.5 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 text-xs font-medium transition-all"
                          >
                            Reset to All Time
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-stone-900 border border-stone-800 rounded-2xl max-w-sm w-full p-5 shadow-2xl text-stone-200">
            <h4 className="text-base font-bold text-stone-100 mb-2 flex items-center space-x-2">
              <AlertCircle className="w-5 h-5 text-rose-400" />
              <span>Confirm Deletion</span>
            </h4>
            <p className="text-xs text-stone-400 mb-5">
              Are you sure you want to remove this transaction entry from the financial ledger? This action cannot be undone.
            </p>
            <div className="flex items-center justify-end space-x-2.5">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-3.5 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-medium"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (deleteConfirmId.startsWith('comm-')) {
                    handleDeleteCommission(deleteConfirmId);
                  } else {
                    handleDeleteExpense(deleteConfirmId);
                  }
                }}
                className="px-4 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow-md"
              >
                Delete Entry
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Log / Edit Commission */}
      {showCommissionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-md overflow-y-auto">
          <div className="bg-stone-900 border border-amber-500/30 rounded-2xl max-w-lg w-full p-5 sm:p-6 shadow-2xl text-stone-200 my-8">
            <div className="flex items-center justify-between pb-3.5 border-b border-stone-800 mb-4">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center">
                  <DollarSign className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-stone-100">
                    {editingCommission ? 'Edit Commission Entry' : 'Log Commission Income'}
                  </h3>
                  <p className="text-[11px] text-stone-400">
                    Affiliate gear sales, partner referral revenue, or client audio work
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowCommissionModal(false)}
                className="p-1 rounded-lg hover:bg-stone-800 text-stone-400 hover:text-stone-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveCommissionSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-stone-300 mb-1">
                  Item / Commission Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 432Hz Quartz Singing Bowl 8-inch"
                  value={commForm.title}
                  onChange={(e) => setCommForm({ ...commForm, title: e.target.value })}
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-xs text-stone-100 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-300 mb-1">
                    Commission Type *
                  </label>
                  <select
                    value={commForm.type}
                    onChange={(e) => {
                      const t = e.target.value as CommissionType;
                      const rate = t === 'custom_external' ? 100 : t === 'partner_referral' ? 20 : 15;
                      const net = (commForm.saleAmount * rate) / 100;
                      setCommForm({
                        ...commForm,
                        type: t,
                        commissionRate: rate,
                        netEarnings: Math.round(net * 100) / 100,
                      });
                    }}
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-xs text-stone-100 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="affiliate_store">Affiliate Store Gear</option>
                    <option value="partner_referral">Partner Referral</option>
                    <option value="custom_external">Custom External Commission</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-300 mb-1">
                    Partner / Platform *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. SoundCraft, Sweetwater, Amazon"
                    value={commForm.partnerOrPlatform}
                    onChange={(e) => setCommForm({ ...commForm, partnerOrPlatform: e.target.value })}
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-xs text-stone-100 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2.5">
                <div>
                  <label className="block text-xs font-semibold text-stone-300 mb-1">
                    Sale Amount ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={commForm.saleAmount}
                    onChange={(e) => {
                      const sale = parseFloat(e.target.value) || 0;
                      const net = (sale * commForm.commissionRate) / 100;
                      setCommForm({
                        ...commForm,
                        saleAmount: sale,
                        netEarnings: Math.round(net * 100) / 100,
                      });
                    }}
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-xs text-stone-100 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-300 mb-1">
                    Rate (%)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="100"
                    required
                    value={commForm.commissionRate}
                    onChange={(e) => {
                      const rate = parseFloat(e.target.value) || 0;
                      const net = (commForm.saleAmount * rate) / 100;
                      setCommForm({
                        ...commForm,
                        commissionRate: rate,
                        netEarnings: Math.round(net * 100) / 100,
                      });
                    }}
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-xs text-stone-100 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-emerald-400 mb-1">
                    Net Payout ($) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={commForm.netEarnings}
                    onChange={(e) =>
                      setCommForm({ ...commForm, netEarnings: parseFloat(e.target.value) || 0 })
                    }
                    className="w-full bg-stone-950 border border-emerald-500/50 rounded-xl px-3 py-2 text-xs text-emerald-300 font-bold focus:outline-none focus:border-emerald-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <div>
                  <label className="block text-xs font-semibold text-stone-300 mb-1">
                    Status
                  </label>
                  <select
                    value={commForm.status}
                    onChange={(e) => setCommForm({ ...commForm, status: e.target.value as CommissionStatus })}
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-xs text-stone-100 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="received">Received</option>
                    <option value="pending">Pending</option>
                    <option value="refunded">Refunded</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-300 mb-1">
                    Transaction Date
                  </label>
                  <input
                    type="date"
                    required
                    value={commForm.date}
                    onChange={(e) => setCommForm({ ...commForm, date: e.target.value })}
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-xs text-stone-100 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-300 mb-1">
                    Order Ref
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. ORD-9921"
                    value={commForm.orderReference}
                    onChange={(e) => setCommForm({ ...commForm, orderReference: e.target.value })}
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-xs text-stone-100 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-300 mb-1">
                  Notes & Details
                </label>
                <textarea
                  rows={2}
                  placeholder="Additional context, affiliate link source, customer details..."
                  value={commForm.notes}
                  onChange={(e) => setCommForm({ ...commForm, notes: e.target.value })}
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-xs text-stone-100 focus:outline-none focus:border-emerald-500 resize-none"
                />
              </div>

              <div className="flex items-center justify-end space-x-2.5 pt-3 border-t border-stone-800">
                <button
                  type="button"
                  onClick={() => setShowCommissionModal(false)}
                  className="px-4 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-semibold shadow-md active:scale-95"
                >
                  {editingCommission ? 'Save Changes' : 'Record Commission'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add / Edit Operating Expense */}
      {showExpenseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-md overflow-y-auto">
          <div className="bg-stone-900 border border-rose-500/30 rounded-2xl max-w-lg w-full p-5 sm:p-6 shadow-2xl text-stone-200 my-8">
            <div className="flex items-center justify-between pb-3.5 border-b border-stone-800 mb-4">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-lg bg-rose-500/15 border border-rose-500/30 text-rose-400 flex items-center justify-center">
                  <Receipt className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-stone-100">
                    {editingExpense ? 'Edit Operating Expense' : 'Add Operating Expense'}
                  </h3>
                  <p className="text-[11px] text-stone-400">
                    Log ads, cloud hosting fees, domain renewals, or audio tools
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowExpenseModal(false)}
                className="p-1 rounded-lg hover:bg-stone-800 text-stone-400 hover:text-stone-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveExpenseSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-stone-300 mb-1">
                  Cost / Expense Description *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Meta Ads - Spring Soundbath Campaign"
                  value={expForm.title}
                  onChange={(e) => setExpForm({ ...expForm, title: e.target.value })}
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-xs text-stone-100 focus:outline-none focus:border-rose-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-300 mb-1">
                    Category *
                  </label>
                  <select
                    value={expForm.category}
                    onChange={(e) => setExpForm({ ...expForm, category: e.target.value as ExpenseCategory })}
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-xs text-stone-100 focus:outline-none focus:border-rose-500"
                  >
                    <option value="ads">Advertising & Marketing (Meta, Google)</option>
                    <option value="hosting">Cloud Hosting & Server (GCP, Run)</option>
                    <option value="domain">Domain Registration & DNS (Cloudflare, Namecheap)</option>
                    <option value="software">Software Licenses & Audio Subscriptions</option>
                    <option value="production">Acoustic Samples & Studio Gear</option>
                    <option value="other">Other Operating Costs</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-300 mb-1">
                    Vendor / Provider *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Google Cloud, Meta, Cloudflare"
                    value={expForm.vendor}
                    onChange={(e) => setExpForm({ ...expForm, vendor: e.target.value })}
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-xs text-stone-100 focus:outline-none focus:border-rose-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <div>
                  <label className="block text-xs font-semibold text-rose-400 mb-1">
                    Amount ($) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={expForm.amount}
                    onChange={(e) => setExpForm({ ...expForm, amount: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-stone-950 border border-rose-500/50 rounded-xl px-3 py-2 text-xs text-rose-300 font-bold focus:outline-none focus:border-rose-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-300 mb-1">
                    Cost Type
                  </label>
                  <select
                    value={expForm.costType}
                    onChange={(e) => setExpForm({ ...expForm, costType: e.target.value as ExpenseCostType })}
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-xs text-stone-100 focus:outline-none focus:border-rose-500"
                  >
                    <option value="recurring_subscription">Recurring Subscription</option>
                    <option value="one_off">One-Off Campaign / Cost</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-300 mb-1">
                    Billing Cadence
                  </label>
                  <select
                    value={expForm.billingCycle}
                    onChange={(e) => setExpForm({ ...expForm, billingCycle: e.target.value as ExpenseBillingCycle })}
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-xs text-stone-100 focus:outline-none focus:border-rose-500"
                  >
                    <option value="monthly">Monthly</option>
                    <option value="yearly">Yearly / Annual</option>
                    <option value="one_time">One Time</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <div>
                  <label className="block text-xs font-semibold text-stone-300 mb-1">
                    Payment Status
                  </label>
                  <select
                    value={expForm.status}
                    onChange={(e) => setExpForm({ ...expForm, status: e.target.value as ExpenseStatus })}
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-xs text-stone-100 focus:outline-none focus:border-rose-500"
                  >
                    <option value="paid">Paid</option>
                    <option value="pending">Pending</option>
                    <option value="scheduled">Scheduled</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-300 mb-1">
                    Expense Date
                  </label>
                  <input
                    type="date"
                    required
                    value={expForm.date}
                    onChange={(e) => setExpForm({ ...expForm, date: e.target.value })}
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-xs text-stone-100 focus:outline-none focus:border-rose-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-300 mb-1">
                    Next Renewal Date
                  </label>
                  <input
                    type="date"
                    value={expForm.renewalDate}
                    onChange={(e) => setExpForm({ ...expForm, renewalDate: e.target.value })}
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-xs text-stone-100 focus:outline-none focus:border-rose-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-300 mb-1">
                  Invoice / Receipt Reference
                </label>
                <input
                  type="text"
                  placeholder="e.g. GCP-INV-2026-03 or FB-ADS-9912"
                  value={expForm.invoiceRef}
                  onChange={(e) => setExpForm({ ...expForm, invoiceRef: e.target.value })}
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-xs text-stone-100 focus:outline-none focus:border-rose-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-300 mb-1">
                  Notes & Details
                </label>
                <textarea
                  rows={2}
                  placeholder="Billing account details, tax notes, campaign targets..."
                  value={expForm.notes}
                  onChange={(e) => setExpForm({ ...expForm, notes: e.target.value })}
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-xs text-stone-100 focus:outline-none focus:border-rose-500 resize-none"
                />
              </div>

              <div className="flex items-center justify-end space-x-2.5 pt-3 border-t border-stone-800">
                <button
                  type="button"
                  onClick={() => setShowExpenseModal(false)}
                  className="px-4 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white text-xs font-semibold shadow-md active:scale-95"
                >
                  {editingExpense ? 'Save Changes' : 'Record Operating Cost'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: EXECUTIVE FINANCIAL STATEMENT PRINT & PREVIEW */}
      {showPrintModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-stone-900 border border-stone-800 rounded-2xl max-w-4xl w-full flex flex-col shadow-2xl max-h-[94vh] overflow-hidden print-clean-container">
            {/* Modal Header (Hidden on Print) */}
            <div className="p-4 sm:p-5 border-b border-stone-800 bg-stone-950/70 flex items-center justify-between no-print">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                  <Printer className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-stone-100 flex items-center space-x-2">
                    <span>Executive Financial Statement</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      Print Preview
                    </span>
                  </h3>
                  <p className="text-xs text-stone-400">
                    High-contrast, paper-optimized P&amp;L statement ready for physical printing or saving as PDF.
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => {
                    const html = generatePrintableHTML(dateFilteredOnlyEarnings, dateFilteredOnlyExpenses, summary, periodLabel);
                    printIsolatedDocument(html);
                  }}
                  className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs transition-all shadow-md active:scale-95 cursor-pointer"
                  title="Open Print Dialog or Save as PDF"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print / Save PDF</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    downloadFinancialHTMLReport(dateFilteredOnlyEarnings, dateFilteredOnlyExpenses, summary, periodLabel);
                    triggerToast('Financial Statement HTML downloaded successfully!');
                  }}
                  className="flex items-center space-x-1 px-3 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white text-xs font-medium border border-stone-700 transition-colors cursor-pointer"
                  title="Download Standalone HTML Document"
                >
                  <FileDown className="w-3.5 h-3.5 text-amber-400" />
                  <span className="hidden sm:inline">Download HTML</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    exportFinancialCSV(dateFilteredOnlyEarnings, dateFilteredOnlyExpenses, summary, periodLabel);
                    triggerToast('Financial CSV spreadsheet downloaded!');
                  }}
                  className="flex items-center space-x-1 px-3 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white text-xs font-medium border border-stone-700 transition-colors cursor-pointer"
                  title="Download Full CSV Report"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="hidden sm:inline">Save CSV</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowPrintModal(false)}
                  className="p-2 rounded-xl hover:bg-stone-800 text-stone-400 hover:text-stone-200 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Document Body (Renders White Paper on Screen and in Print) */}
            <div className="p-6 sm:p-10 bg-white text-stone-900 overflow-y-auto space-y-6 max-h-[80vh]">
              {/* Document Header */}
              <div className="border-b-2 border-stone-200 pb-5 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-black text-teal-800 tracking-tight">
                    AURA 432Hz SANCTUARY
                  </h1>
                  <p className="text-sm font-semibold text-stone-600 mt-0.5">
                    Executive Commission Earnings &amp; Operating Expenses Report
                  </p>
                  <div className="mt-2 inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-md bg-stone-100 text-stone-700 text-xs font-medium border border-stone-200">
                    <span>Reporting Period:</span>
                    <strong className="text-stone-900">{periodLabel}</strong>
                  </div>
                </div>

                <div className="text-right text-xs text-stone-600 space-y-1">
                  <div>Statement Date: <strong>{new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</strong></div>
                  <div>Accounting Currency: <strong>USD ($)</strong></div>
                  <div>Audit Reference: <strong>AUDIT-{Date.now().toString(36).toUpperCase()}</strong></div>
                  <div>Total Active Records: <strong>{dateFilteredOnlyEarnings.length + dateFilteredOnlyExpenses.length}</strong></div>
                </div>
              </div>

              {/* KPI Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
                <div className="p-3.5 bg-stone-50 border border-stone-200 rounded-xl">
                  <div className="text-[10px] uppercase font-bold text-stone-500 tracking-wider">Gross Commissions</div>
                  <div className="text-xl font-black text-emerald-700 mt-1">${summary.totalCommissions.toFixed(2)}</div>
                  <div className="text-[11px] text-stone-500 mt-1">Received: ${summary.totalReceivedCommissions.toFixed(2)}</div>
                </div>

                <div className="p-3.5 bg-stone-50 border border-stone-200 rounded-xl">
                  <div className="text-[10px] uppercase font-bold text-stone-500 tracking-wider">Operating Costs</div>
                  <div className="text-xl font-black text-rose-700 mt-1">${summary.totalExpenses.toFixed(2)}</div>
                  <div className="text-[11px] text-stone-500 mt-1">Paid: ${summary.totalPaidExpenses.toFixed(2)}</div>
                </div>

                <div className="p-3.5 bg-stone-50 border border-stone-200 rounded-xl">
                  <div className="text-[10px] uppercase font-bold text-stone-500 tracking-wider">Net Operating Income</div>
                  <div className={`text-xl font-black mt-1 ${summary.netOperatingIncome >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                    {summary.netOperatingIncome >= 0 ? '+' : ''}${summary.netOperatingIncome.toFixed(2)}
                  </div>
                  <div className="text-[11px] text-stone-500 mt-1">Period Balance</div>
                </div>

                <div className="p-3.5 bg-stone-50 border border-stone-200 rounded-xl">
                  <div className="text-[10px] uppercase font-bold text-stone-500 tracking-wider">Net Profit Margin</div>
                  <div className="text-xl font-black text-teal-800 mt-1">{summary.profitMarginPercent.toFixed(1)}%</div>
                  <div className="text-[11px] text-stone-500 mt-1">Return on Commissions</div>
                </div>
              </div>

              {/* Commissions Table */}
              <div>
                <div className="flex items-center justify-between border-b border-stone-200 pb-2 mb-3">
                  <h3 className="text-sm font-bold text-stone-900">1. Commission Revenue Streams</h3>
                  <span className="text-xs font-bold text-emerald-700">${summary.totalCommissions.toFixed(2)}</span>
                </div>
                <div className="overflow-x-auto border border-stone-200 rounded-lg">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="bg-stone-100 text-stone-700 font-bold border-b border-stone-200 text-[10px] uppercase">
                      <tr>
                        <th className="py-2 px-3">Date</th>
                        <th className="py-2 px-3">Description</th>
                        <th className="py-2 px-3">Platform</th>
                        <th className="py-2 px-3">Type</th>
                        <th className="py-2 px-3 text-right">Sale</th>
                        <th className="py-2 px-3 text-right">Rate</th>
                        <th className="py-2 px-3 text-right">Net Commission</th>
                        <th className="py-2 px-3 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-200">
                      {dateFilteredOnlyEarnings.length === 0 ? (
                        <tr><td colSpan={8} className="py-4 text-center text-stone-500">No commissions recorded in this period.</td></tr>
                      ) : (
                        dateFilteredOnlyEarnings.map((c) => (
                          <tr key={c.id}>
                            <td className="py-2 px-3 font-mono text-stone-600">{c.date}</td>
                            <td className="py-2 px-3 font-medium text-stone-900">{c.title}</td>
                            <td className="py-2 px-3 text-stone-600">{c.partnerOrPlatform}</td>
                            <td className="py-2 px-3 capitalize text-stone-600">{c.type.replace('_', ' ')}</td>
                            <td className="py-2 px-3 text-right text-stone-600">${c.saleAmount.toFixed(2)}</td>
                            <td className="py-2 px-3 text-right text-stone-600">{c.commissionRate}%</td>
                            <td className="py-2 px-3 text-right font-bold text-emerald-700">+${c.netEarnings.toFixed(2)}</td>
                            <td className="py-2 px-3 text-center">
                              <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${c.status === 'received' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                                {c.status.toUpperCase()}
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Operating Expenses Table */}
              <div>
                <div className="flex items-center justify-between border-b border-stone-200 pb-2 mb-3">
                  <h3 className="text-sm font-bold text-stone-900">2. Operating Expenses &amp; Costs</h3>
                  <span className="text-xs font-bold text-rose-700">${summary.totalExpenses.toFixed(2)}</span>
                </div>
                <div className="overflow-x-auto border border-stone-200 rounded-lg">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="bg-stone-100 text-stone-700 font-bold border-b border-stone-200 text-[10px] uppercase">
                      <tr>
                        <th className="py-2 px-3">Date</th>
                        <th className="py-2 px-3">Expense Item</th>
                        <th className="py-2 px-3">Vendor</th>
                        <th className="py-2 px-3">Category</th>
                        <th className="py-2 px-3">Cadence</th>
                        <th className="py-2 px-3 text-right">Amount</th>
                        <th className="py-2 px-3 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-200">
                      {dateFilteredOnlyExpenses.length === 0 ? (
                        <tr><td colSpan={7} className="py-4 text-center text-stone-500">No expenses recorded in this period.</td></tr>
                      ) : (
                        dateFilteredOnlyExpenses.map((exp) => (
                          <tr key={exp.id}>
                            <td className="py-2 px-3 font-mono text-stone-600">{exp.date}</td>
                            <td className="py-2 px-3 font-medium text-stone-900">{exp.title}</td>
                            <td className="py-2 px-3 text-stone-600">{exp.vendor}</td>
                            <td className="py-2 px-3 uppercase text-stone-600">{exp.category}</td>
                            <td className="py-2 px-3 capitalize text-stone-600">{exp.billingCycle}</td>
                            <td className="py-2 px-3 text-right font-bold text-rose-700">-${exp.amount.toFixed(2)}</td>
                            <td className="py-2 px-3 text-center">
                              <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${exp.status === 'paid' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                                {exp.status.toUpperCase()}
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Monthly Trend Summary */}
              {summary.monthlyTrends.length > 0 && (
                <div>
                  <div className="flex items-center justify-between border-b border-stone-200 pb-2 mb-3">
                    <h3 className="text-sm font-bold text-stone-900">3. Monthly Performance Trend (P&amp;L)</h3>
                  </div>
                  <div className="overflow-x-auto border border-stone-200 rounded-lg">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead className="bg-stone-100 text-stone-700 font-bold border-b border-stone-200 text-[10px] uppercase">
                        <tr>
                          <th className="py-2 px-3">Month</th>
                          <th className="py-2 px-3 text-right">Commissions</th>
                          <th className="py-2 px-3 text-right">Expenses</th>
                          <th className="py-2 px-3 text-right">Net Operating Income</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-stone-200">
                        {summary.monthlyTrends.map((m) => (
                          <tr key={m.monthKey}>
                            <td className="py-2 px-3 font-bold text-stone-800">{m.monthLabel}</td>
                            <td className="py-2 px-3 text-right text-emerald-700">${m.commissions.toFixed(2)}</td>
                            <td className="py-2 px-3 text-right text-rose-700">${m.expenses.toFixed(2)}</td>
                            <td className={`py-2 px-3 text-right font-bold ${m.netProfit >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                              {m.netProfit >= 0 ? '+' : ''}${m.netProfit.toFixed(2)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Document Signoff Footer */}
              <div className="pt-4 border-t border-stone-200 flex flex-col sm:flex-row items-center justify-between text-[11px] text-stone-500 gap-2">
                <div>Generated by Aura 432Hz Sanctuary Admin Studio &bull; Verified Audit Ledger</div>
                <div>Page 1 of 1</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: IMPORT FINANCIAL LEDGER (CSV / JSON) */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-stone-900 border border-stone-800 rounded-2xl max-w-2xl w-full p-5 sm:p-6 shadow-2xl text-stone-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-stone-800">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/30">
                  <Upload className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-stone-100">
                    Import Financial Records
                  </h3>
                  <p className="text-xs text-stone-400">
                    Import commission revenue or operating expenses from CSV spreadsheets or JSON backup files.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowImportModal(false)}
                className="p-1.5 rounded-lg hover:bg-stone-800 text-stone-400 hover:text-stone-200 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Mode Tabs */}
            <div className="flex items-center space-x-1.5 bg-stone-950 p-1 rounded-xl border border-stone-800 mb-4">
              <button
                type="button"
                onClick={() => setImportMode('file')}
                className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  importMode === 'file'
                    ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                    : 'text-stone-400 hover:text-stone-200'
                }`}
              >
                Upload File (.csv / .json)
              </button>
              <button
                type="button"
                onClick={() => setImportMode('paste')}
                className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  importMode === 'paste'
                    ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                    : 'text-stone-400 hover:text-stone-200'
                }`}
              >
                Paste Raw Data
              </button>
              <button
                type="button"
                onClick={() => setImportMode('templates')}
                className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  importMode === 'templates'
                    ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                    : 'text-stone-400 hover:text-stone-200'
                }`}
              >
                Download Templates
              </button>
            </div>

            {/* Mode Content */}
            {importMode === 'file' && (
              <div className="space-y-4">
                <label
                  onDragOver={handleFileDragOver}
                  onDragLeave={handleFileDragLeave}
                  onDrop={handleFileDrop}
                  className={`border-2 border-dashed rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer transition-all group ${
                    isDraggingFile
                      ? 'border-sky-400 bg-sky-950/60 ring-2 ring-sky-400/50 scale-[1.01]'
                      : 'border-stone-700 hover:border-sky-500/50 bg-stone-950/40 hover:bg-stone-950/70'
                  }`}
                >
                  <Upload className={`w-8 h-8 mb-2 transition-colors ${isDraggingFile ? 'text-sky-400 animate-bounce' : 'text-stone-500 group-hover:text-sky-400'}`} />
                  <span className="text-xs font-semibold text-stone-200">
                    {importFileName ? `Selected: ${importFileName}` : isDraggingFile ? 'Drop CSV or JSON file here' : 'Click to select or drop CSV / JSON file'}
                  </span>
                  <span className="text-[11px] text-stone-500 mt-1">
                    Accepts .csv spreadsheets or .json audit packages
                  </span>
                  <input
                    type="file"
                    accept=".csv, .json, text/csv, application/json"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>

                {importFileContent && (
                  <div className="p-3 bg-stone-950 border border-stone-800 rounded-xl text-xs font-mono text-stone-300 max-h-36 overflow-y-auto relative">
                    <div className="flex items-center justify-between mb-1">
                      <div className="text-[10px] text-sky-400 uppercase font-sans font-semibold">
                        File Content Preview ({importFileContent.split('\n').filter(Boolean).length} lines):
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setImportFileContent('');
                          setImportFileName('');
                        }}
                        className="text-[10px] text-rose-400 hover:text-rose-300 font-sans cursor-pointer underline"
                      >
                        Remove file
                      </button>
                    </div>
                    <pre className="whitespace-pre-wrap truncate">{importFileContent.slice(0, 500)}...</pre>
                  </div>
                )}
              </div>
            )}

            {importMode === 'paste' && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-semibold text-stone-300">
                    Paste CSV or JSON Content:
                  </label>
                  {importPastedText && (
                    <button
                      type="button"
                      onClick={() => setImportPastedText('')}
                      className="text-[11px] text-rose-400 hover:text-rose-300 cursor-pointer"
                    >
                      Clear
                    </button>
                  )}
                </div>
                <textarea
                  rows={7}
                  placeholder={`Paste CSV lines, e.g.:\nDate,Title,Stream Type,Partner,Sale Amount,Rate,Net Commission,Status\n2026-10-10,Quartz Singing Bowl,affiliate_store,SoundCraft Pro,189.00,15,28.35,received\n\nOr paste JSON backup content...`}
                  value={importPastedText}
                  onChange={(e) => {
                    setImportPastedText(e.target.value);
                    setImportError(null);
                  }}
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl p-3 text-xs font-mono text-stone-200 focus:outline-none focus:border-sky-500"
                />
              </div>
            )}

            {importMode === 'templates' && (
              <div className="space-y-3">
                <p className="text-xs text-stone-400">
                  Download standard spreadsheet CSV templates formatted with all required columns for seamless importing:
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      downloadSampleCSVTemplate('commissions');
                      triggerToast('Commissions CSV template downloaded!');
                    }}
                    className="p-3 rounded-xl bg-stone-950 border border-stone-800 hover:border-emerald-500/40 text-left transition-all hover:bg-stone-800/40 group cursor-pointer"
                  >
                    <FileSpreadsheet className="w-4 h-4 text-emerald-400 mb-1" />
                    <div className="text-xs font-semibold text-stone-200 group-hover:text-emerald-300">
                      Commissions CSV
                    </div>
                    <div className="text-[10px] text-stone-500 mt-0.5">
                      Gear sales, rates &amp; referral fees
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      downloadSampleCSVTemplate('expenses');
                      triggerToast('Operating Expenses CSV template downloaded!');
                    }}
                    className="p-3 rounded-xl bg-stone-950 border border-stone-800 hover:border-rose-500/40 text-left transition-all hover:bg-stone-800/40 group cursor-pointer"
                  >
                    <Receipt className="w-4 h-4 text-rose-400 mb-1" />
                    <div className="text-xs font-semibold text-stone-200 group-hover:text-rose-300">
                      Expenses CSV
                    </div>
                    <div className="text-[10px] text-stone-500 mt-0.5">
                      Ads, hosting, domains &amp; DAW fees
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      downloadSampleCSVTemplate('combined');
                      triggerToast('Full Combined Ledger CSV template downloaded!');
                    }}
                    className="p-3 rounded-xl bg-stone-950 border border-stone-800 hover:border-sky-500/40 text-left transition-all hover:bg-stone-800/40 group cursor-pointer"
                  >
                    <FileCode className="w-4 h-4 text-sky-400 mb-1" />
                    <div className="text-xs font-semibold text-stone-200 group-hover:text-sky-300">
                      Full Ledger CSV
                    </div>
                    <div className="text-[10px] text-stone-500 mt-0.5">
                      Combined two-tier financial sheet
                    </div>
                  </button>
                </div>
              </div>
            )}

            {/* Error Message */}
            {importError && (
              <div className="mt-4 p-3 bg-rose-950/60 border border-rose-500/40 rounded-xl text-xs text-rose-300 flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{importError}</span>
              </div>
            )}

            {/* Modal Actions */}
            <div className="flex items-center justify-end space-x-2.5 pt-4 mt-4 border-t border-stone-800">
              <button
                type="button"
                onClick={() => setShowImportModal(false)}
                className="px-4 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-medium cursor-pointer"
              >
                Cancel
              </button>

              {importMode !== 'templates' && (
                <button
                  type="button"
                  onClick={handleExecuteImport}
                  disabled={importing || (importMode === 'file' ? !importFileContent : !importPastedText.trim())}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-semibold shadow-md active:scale-95 transition-all flex items-center space-x-1.5 cursor-pointer"
                >
                  {importing ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Importing...</span>
                    </>
                  ) : (
                    <>
                      <Upload className="w-3.5 h-3.5" />
                      <span>Parse &amp; Import Records</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
