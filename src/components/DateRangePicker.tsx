import React, { useState, useRef, useEffect } from 'react';
import {
  Calendar,
  ChevronDown,
  Check,
  X,
  RotateCcw,
  Clock,
  ArrowRight,
  SlidersHorizontal,
} from 'lucide-react';
import { DateFilterPreset, DateFilterConfig } from '../types/finance';
import { getDateRangeBounds, formatDateRangeDisplay } from '../services/financeService';

interface DateRangePickerProps {
  config: DateFilterConfig;
  onChange: (config: DateFilterConfig) => void;
  className?: string;
  totalFilteredCount?: number;
}

interface PresetOption {
  key: DateFilterPreset;
  label: string;
  description?: string;
  badge?: string;
}

const PRESET_OPTIONS: PresetOption[] = [
  { key: 'all', label: 'All Time', description: 'Complete ledger history' },
  { key: 'last_30_days', label: 'Last 30 Days', description: 'Past 30 rolling days', badge: 'Popular' },
  { key: 'this_month', label: 'Current Month', description: '1st of current month to today' },
  { key: 'last_month', label: 'Last Month', description: 'Entire previous calendar month' },
  { key: 'last_7_days', label: 'Last 7 Days', description: 'Past week rolling period' },
  { key: 'this_quarter', label: 'This Quarter', description: 'Current 3-month quarter' },
  { key: 'this_year', label: 'Year to Date', description: 'Jan 1st to current date' },
  { key: 'custom', label: 'Custom Range', description: 'Choose specific start & end dates' },
];

export const DateRangePicker: React.FC<DateRangePickerProps> = ({
  config,
  onChange,
  className = '',
  totalFilteredCount,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [tempPreset, setTempPreset] = useState<DateFilterPreset>(config.preset);
  const [startDateInput, setStartDateInput] = useState<string>(config.startDate || '');
  const [endDateInput, setEndDateInput] = useState<string>(config.endDate || '');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);

  // Sync internal state when external config changes
  useEffect(() => {
    setTempPreset(config.preset);
    setStartDateInput(config.startDate || '');
    setEndDateInput(config.endDate || '');
  }, [config]);

  // Close on outside click
  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const currentDisplay = formatDateRangeDisplay(config);
  const isFiltered = config.preset !== 'all';

  const handleSelectPreset = (preset: DateFilterPreset) => {
    setTempPreset(preset);
    setErrorMsg(null);

    if (preset !== 'custom') {
      onChange({
        preset,
        startDate: undefined,
        endDate: undefined,
      });
      setIsOpen(false);
    } else {
      // Default to last 30 days dates if empty
      if (!startDateInput || !endDateInput) {
        const bounds = getDateRangeBounds({ preset: 'last_30_days' });
        if (bounds.startDateStr && bounds.endDateStr) {
          setStartDateInput(bounds.startDateStr);
          setEndDateInput(bounds.endDateStr);
        }
      }
    }
  };

  const handleApplyCustom = () => {
    if (!startDateInput && !endDateInput) {
      setErrorMsg('Please select at least a start or end date');
      return;
    }

    if (startDateInput && endDateInput && startDateInput > endDateInput) {
      setErrorMsg('Start date cannot be after end date');
      return;
    }

    setErrorMsg(null);
    onChange({
      preset: 'custom',
      startDate: startDateInput || undefined,
      endDate: endDateInput || undefined,
    });
    setIsOpen(false);
  };

  const handleResetToAll = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    onChange({ preset: 'all' });
    setStartDateInput('');
    setEndDateInput('');
    setErrorMsg(null);
    setIsOpen(false);
  };

  // Quick custom helpers
  const handleSetQuickCustomDays = (days: number) => {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - days);

    const endStr = end.toISOString().slice(0, 10);
    const startStr = start.toISOString().slice(0, 10);

    setStartDateInput(startStr);
    setEndDateInput(endStr);
    setErrorMsg(null);
  };

  return (
    <div className={`relative inline-block ${className}`} ref={containerRef}>
      {/* Trigger Button */}
      <div className="flex items-center">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={`group flex items-center space-x-2.5 px-3 py-2 rounded-xl border text-xs sm:text-sm font-medium transition-all shadow-sm active:scale-[0.98] ${
            isFiltered
              ? 'bg-amber-950/40 hover:bg-amber-950/60 text-amber-200 border-amber-500/40 shadow-amber-500/5 ring-1 ring-amber-500/20'
              : 'bg-stone-850 hover:bg-stone-800 text-stone-200 border-stone-700/80 hover:border-stone-600'
          }`}
          aria-haspopup="dialog"
          aria-expanded={isOpen}
          title="Click to filter earnings & expenses by date range"
        >
          <div
            className={`p-1.5 rounded-lg shrink-0 transition-colors ${
              isFiltered
                ? 'bg-amber-500/20 text-amber-300'
                : 'bg-stone-800 text-stone-400 group-hover:text-amber-300 group-hover:bg-amber-500/10'
            }`}
          >
            <Calendar className="w-4 h-4" />
          </div>

          <div className="flex flex-col text-left">
            <div className="flex items-center space-x-1.5">
              <span className="font-semibold text-xs tracking-tight">
                {currentDisplay.label}
              </span>
              {isFiltered && (
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
              )}
            </div>
            <span
              className={`text-[11px] font-mono leading-none ${
                isFiltered ? 'text-amber-300/80' : 'text-stone-400'
              }`}
            >
              {currentDisplay.humanRange}
            </span>
          </div>

          {totalFilteredCount !== undefined && isFiltered && (
            <span className="hidden sm:inline-block px-1.5 py-0.5 rounded-md bg-stone-900/90 text-amber-300/90 text-[10px] font-mono border border-amber-500/20 ml-1">
              {totalFilteredCount} {totalFilteredCount === 1 ? 'item' : 'items'}
            </span>
          )}

          <ChevronDown
            className={`w-4 h-4 ml-1 shrink-0 text-stone-400 group-hover:text-stone-200 transition-transform duration-200 ${
              isOpen ? 'rotate-180 text-amber-400' : ''
            }`}
          />
        </button>

        {/* Clear filter button if active */}
        {isFiltered && (
          <button
            type="button"
            onClick={handleResetToAll}
            className="ml-1.5 p-2 rounded-xl text-stone-400 hover:text-amber-200 hover:bg-stone-800 border border-transparent hover:border-stone-700 transition-colors"
            title="Reset period to All Time"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Popover Dropdown */}
      {isOpen && (
        <div className="absolute left-0 sm:right-auto sm:left-0 mt-2 z-50 w-[320px] sm:w-[480px] rounded-2xl bg-stone-900 border border-amber-500/30 shadow-2xl shadow-black/80 backdrop-blur-xl p-4 animate-in fade-in zoom-in-95 duration-150">
          {/* Header */}
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-stone-800">
            <div className="flex items-center space-x-2">
              <SlidersHorizontal className="w-4 h-4 text-amber-400" />
              <h4 className="text-xs font-semibold uppercase tracking-wider text-stone-200">
                Filter Financial Period
              </h4>
            </div>

            {isFiltered && (
              <button
                type="button"
                onClick={handleResetToAll}
                className="flex items-center space-x-1 text-[11px] text-amber-400 hover:text-amber-300 transition-colors"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset to All Time</span>
              </button>
            )}
          </div>

          {/* Quick Presets Grid */}
          <div className="mb-4">
            <span className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider mb-2 block">
              Quick Presets
            </span>
            <div className="grid grid-cols-2 gap-2">
              {PRESET_OPTIONS.map((opt) => {
                const isActive = tempPreset === opt.key;
                const bounds = getDateRangeBounds({ preset: opt.key });

                return (
                  <button
                    key={opt.key}
                    type="button"
                    onClick={() => handleSelectPreset(opt.key)}
                    className={`flex items-start justify-between p-2.5 rounded-xl border text-left transition-all ${
                      isActive
                        ? 'bg-amber-500/15 border-amber-500/50 text-amber-200 shadow-sm'
                        : 'bg-stone-950/60 hover:bg-stone-800 border-stone-800 text-stone-300 hover:text-stone-100'
                    }`}
                  >
                    <div className="min-w-0 pr-1">
                      <div className="flex items-center space-x-1.5">
                        <span className="text-xs font-medium truncate">{opt.label}</span>
                        {opt.badge && (
                          <span className="text-[9px] uppercase tracking-wider px-1 py-0.2 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                            {opt.badge}
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-stone-500 block truncate mt-0.5 font-mono">
                        {opt.key === 'all'
                          ? 'All records'
                          : opt.key === 'custom'
                          ? 'Select dates'
                          : bounds.humanRange}
                      </span>
                    </div>
                    {isActive && (
                      <Check className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Custom Date Pickers Section */}
          <div
            className={`rounded-xl border p-3 transition-all ${
              tempPreset === 'custom'
                ? 'bg-stone-950/80 border-amber-500/40'
                : 'bg-stone-950/40 border-stone-800/80'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-stone-300 flex items-center space-x-1.5">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                <span>Custom Date Bounds</span>
              </span>
              <span className="text-[10px] text-stone-500">YYYY-MM-DD</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-2.5">
              <div>
                <label className="block text-[11px] text-stone-400 mb-1">From (Start Date)</label>
                <input
                  type="date"
                  value={startDateInput}
                  onChange={(e) => {
                    setStartDateInput(e.target.value);
                    setTempPreset('custom');
                    setErrorMsg(null);
                  }}
                  className="w-full px-2.5 py-1.5 bg-stone-900 border border-stone-700 rounded-lg text-xs text-stone-100 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] text-stone-400 mb-1">To (End Date)</label>
                <input
                  type="date"
                  value={endDateInput}
                  onChange={(e) => {
                    setEndDateInput(e.target.value);
                    setTempPreset('custom');
                    setErrorMsg(null);
                  }}
                  className="w-full px-2.5 py-1.5 bg-stone-900 border border-stone-700 rounded-lg text-xs text-stone-100 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 font-mono"
                />
              </div>
            </div>

            {/* Quick shortcuts for custom */}
            <div className="flex flex-wrap items-center gap-1.5 mb-2">
              <span className="text-[10px] text-stone-500 mr-1">Shortcuts:</span>
              <button
                type="button"
                onClick={() => {
                  setTempPreset('custom');
                  handleSetQuickCustomDays(14);
                }}
                className="text-[10px] px-2 py-0.5 rounded-md bg-stone-900 hover:bg-stone-800 text-stone-300 border border-stone-800"
              >
                Past 14d
              </button>
              <button
                type="button"
                onClick={() => {
                  setTempPreset('custom');
                  handleSetQuickCustomDays(60);
                }}
                className="text-[10px] px-2 py-0.5 rounded-md bg-stone-900 hover:bg-stone-800 text-stone-300 border border-stone-800"
              >
                Past 60d
              </button>
              <button
                type="button"
                onClick={() => {
                  setTempPreset('custom');
                  handleSetQuickCustomDays(90);
                }}
                className="text-[10px] px-2 py-0.5 rounded-md bg-stone-900 hover:bg-stone-800 text-stone-300 border border-stone-800"
              >
                Past 90d
              </button>
            </div>

            {errorMsg && (
              <p className="text-[11px] text-rose-400 font-medium mb-2">{errorMsg}</p>
            )}

            {tempPreset === 'custom' && (
              <button
                type="button"
                onClick={handleApplyCustom}
                className="w-full flex items-center justify-center space-x-1.5 py-2 px-3 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-semibold text-xs transition-all shadow-md active:scale-95"
              >
                <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Apply Custom Range</span>
              </button>
            )}
          </div>

          {/* Footer Preview & Dismiss */}
          <div className="mt-3 pt-3 border-t border-stone-800 flex items-center justify-between text-xs">
            <div className="text-stone-400 truncate max-w-[280px]">
              Active:{' '}
              <span className="text-amber-300 font-medium">
                {currentDisplay.label} ({currentDisplay.humanRange})
              </span>
            </div>

            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="px-3 py-1 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white transition-colors text-xs font-medium"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
