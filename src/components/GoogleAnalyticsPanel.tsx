import React, { useState, useEffect } from 'react';
import {
  Activity,
  BarChart3,
  Clock,
  Globe,
  RefreshCw,
  Check,
  AlertCircle,
  KeyRound,
  LogOut,
  Eye,
  Zap,
  Share2,
  ExternalLink,
} from 'lucide-react';
import {
  GA4_MEASUREMENT_ID,
  Ga4Config,
  Ga4DateRange,
  Ga4PropertySummary,
  Ga4SyncPayload,
} from '../services/googleAnalytics';

interface GoogleAnalyticsPanelProps {
  connected: boolean;
  accountEmail: string | null;
  config: Ga4Config | null;
  properties: Ga4PropertySummary[];
  propertiesLoading: boolean;
  data: Ga4SyncPayload | null;
  syncing: boolean;
  error: string | null;
  range: Ga4DateRange;
  pollIntervalSec: number;
  onChangeRange: (range: Ga4DateRange) => void;
  onChangePollInterval: (seconds: number) => void;
  onConnectOAuth: () => Promise<void>;
  onDisconnectOAuth: () => void;
  onDiscoverProperties: () => Promise<void>;
  onSaveProperty: (propertyId: string, displayName?: string) => Promise<void>;
  onSyncNow: () => Promise<void>;
}

function formatDuration(sec: number): string {
  if (!sec || sec <= 0) return '0s';
  const m = Math.floor(sec / 60);
  const s = Math.round(sec % 60);
  if (m === 0) return `${s}s`;
  return `${m}m ${s.toString().padStart(2, '0')}s`;
}

export const GoogleAnalyticsPanel: React.FC<GoogleAnalyticsPanelProps> = ({
  connected,
  accountEmail,
  config,
  properties,
  propertiesLoading,
  data,
  syncing,
  error,
  range,
  pollIntervalSec,
  onChangeRange,
  onChangePollInterval,
  onConnectOAuth,
  onDisconnectOAuth,
  onDiscoverProperties,
  onSaveProperty,
  onSyncNow,
}) => {
  const [manualPropertyId, setManualPropertyId] = useState<string>(config?.propertyId || '');
  const [manualPropertyName, setManualPropertyName] = useState<string>(config?.propertyDisplayName || '');
  const [savingProp, setSavingProp] = useState<boolean>(false);
  const [authLoading, setAuthLoading] = useState<boolean>(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [saveFeedback, setSaveFeedback] = useState<string | null>(null);

  useEffect(() => {
    if (config?.propertyId) {
      setManualPropertyId(config.propertyId);
      setManualPropertyName(config.propertyDisplayName || '');
    }
  }, [config]);

  const handleGoogleSignIn = async () => {
    setAuthLoading(true);
    setLocalError(null);
    try {
      await onConnectOAuth();
    } catch (err: any) {
      setLocalError(err?.message || 'Unable to authorize Google Analytics.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleSavePropertySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = manualPropertyId.replace(/^properties\//, '').trim();
    if (!/^\d+$/.test(cleaned)) {
      setLocalError('Enter a valid numeric GA4 Property ID (e.g. 412345678). Measurement ID G-D8TKJBBET7 maps to your numeric GA4 Property ID under GA Admin > Property Details.');
      return;
    }
    setLocalError(null);
    setSavingProp(true);
    try {
      await onSaveProperty(cleaned, manualPropertyName || undefined);
      setSaveFeedback(`Connected Property ${cleaned}`);
      setTimeout(() => setSaveFeedback(null), 3000);
    } catch (err: any) {
      setLocalError(err?.message || 'Failed to save GA4 Property ID.');
    } finally {
      setSavingProp(false);
    }
  };

  const activeError = localError || error;
  const isLivePollingActive = connected && Boolean(config?.propertyId) && pollIntervalSec > 0 && !activeError;

  const rt = data?.realtime;
  const hist = data?.historical;
  const totalPeriodSessions = Math.max(
    hist?.trafficSources?.reduce((acc, s) => acc + s.sessions, 0) || hist?.sessions || 0,
    1
  );

  // Merge realtime and period event views smoothly
  const mergedEvents = React.useMemo(() => {
    const map = new Map<string, { eventName: string; realtimeCount: number; periodCount: number; activeUsers: number }>();
    (rt?.topEvents || []).forEach((ev) => {
      map.set(ev.eventName, {
        eventName: ev.eventName,
        realtimeCount: ev.eventCount,
        periodCount: 0,
        activeUsers: ev.activeUsers,
      });
    });
    (hist?.topEvents || []).forEach((ev) => {
      const existing = map.get(ev.eventName);
      if (existing) {
        existing.periodCount = ev.eventCount;
        existing.activeUsers = Math.max(existing.activeUsers, ev.activeUsers);
      } else {
        map.set(ev.eventName, {
          eventName: ev.eventName,
          realtimeCount: 0,
          periodCount: ev.eventCount,
          activeUsers: ev.activeUsers,
        });
      }
    });
    return Array.from(map.values()).sort(
      (a, b) => b.realtimeCount - a.realtimeCount || b.periodCount - a.periodCount
    );
  }, [rt, hist]);

  return (
    <div className="space-y-6">
      {/* Top Toolbar: Auth Status, Property ID & Real-Time Polling Controls */}
      <div className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5 flex-wrap">
              <BarChart3 className="w-5 h-5 text-teal-400 shrink-0" />
              <h3 className="text-base font-semibold text-slate-100">
                Google Analytics 4 Real-Time Bridge
              </h3>
              {isLivePollingActive && (
                <span className="inline-flex items-center gap-1.5 text-xs font-mono text-emerald-400">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Live Sync Every {pollIntervalSec}s</span>
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-400 flex-wrap">
              <span>Tag: <span className="font-mono text-slate-200">{GA4_MEASUREMENT_ID}</span></span>
              <span aria-hidden="true">·</span>
              <span>
                Property:{' '}
                <span className="font-mono text-slate-200">
                  {config?.propertyId ? `${config.propertyDisplayName} (${config.propertyId})` : 'Not selected'}
                </span>
              </span>
              {data?.syncedAt && (
                <>
                  <span aria-hidden="true">·</span>
                  <span>
                    Synced <span className="font-mono tabular-nums text-slate-300">{new Date(data.syncedAt).toLocaleTimeString()}</span>
                  </span>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {connected && (
              <>
                {/* Timeframe Segmented Control */}
                <div className="flex items-center gap-1 p-1 bg-slate-900 border border-slate-800 rounded-xl">
                  {(
                    [
                      { id: 'today', label: 'Today' },
                      { id: '7days', label: '7 Days' },
                      { id: '30days', label: '30 Days' },
                    ] as const
                  ).map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => onChangeRange(opt.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                        range === opt.id
                          ? 'bg-teal-400/20 text-teal-300 border border-teal-400/40'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>

                {/* Auto-Sync Polling Cadence */}
                <select
                  value={pollIntervalSec}
                  onChange={(e) => onChangePollInterval(Number(e.target.value))}
                  aria-label="Real-time sync interval"
                  className="bg-slate-900 border border-slate-800 text-xs text-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:border-teal-400 font-mono"
                >
                  <option value={15}>Auto-Sync: 15s</option>
                  <option value={30}>Auto-Sync: 30s</option>
                  <option value={60}>Auto-Sync: 60s</option>
                  <option value={0}>Auto-Sync: Paused</option>
                </select>

                <button
                  type="button"
                  onClick={onSyncNow}
                  disabled={syncing || !config?.propertyId}
                  className="px-4 py-2 rounded-xl bg-teal-400 hover:bg-teal-300 text-slate-950 font-semibold text-xs transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0 disabled:opacity-50 cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin' : ''}`} />
                  <span>{syncing ? 'Syncing...' : 'Sync Now'}</span>
                </button>

                <button
                  type="button"
                  onClick={onDisconnectOAuth}
                  className="px-3 py-2 rounded-xl bg-slate-900 hover:bg-rose-950/50 text-slate-300 hover:text-rose-300 border border-slate-800 hover:border-rose-500/40 text-xs font-medium transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
                  title="Clear in-memory Google Analytics authorization"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Disconnect</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Auth & Property Configuration Row */}
        {!connected ? (
          <div className="py-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-1.5 max-w-2xl">
              <div className="text-sm font-semibold text-slate-100">
                Authorize Read-Only Google Analytics Access
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Sign in with the Google account that manages your GA4 property (<span className="font-mono text-slate-300">{GA4_MEASUREMENT_ID}</span>).
                Access tokens stay strictly in browser memory for your current admin session and immediately unlock real-time active users, pageviews, traffic sources, and live events.
              </p>
              {config?.propertyId && (
                <p className="text-xs text-teal-400 font-mono">
                  Saved Property ID ready: {config.propertyDisplayName} ({config.propertyId})
                </p>
              )}
            </div>

            {/* Official Sign in with Google button style */}
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={authLoading}
              className="inline-flex items-center gap-3 px-5 py-2.5 rounded-xl bg-white hover:bg-slate-100 text-slate-900 border border-slate-300 text-sm font-medium shadow-sm transition-all active:scale-98 whitespace-nowrap shrink-0 cursor-pointer disabled:opacity-60"
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 48 48" aria-hidden="true">
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
              </svg>
              <span>{authLoading ? 'Connecting...' : 'Sign in with Google'}</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-end">
            {/* Property Discovery Dropdown */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>
                  Authorized as <strong className="text-slate-200">{accountEmail || 'Google Account'}</strong>
                </span>
                <button
                  type="button"
                  onClick={onDiscoverProperties}
                  disabled={propertiesLoading}
                  className="text-teal-400 hover:text-teal-300 font-medium cursor-pointer"
                >
                  {propertiesLoading ? 'Scanning Properties...' : 'Refresh Property List'}
                </button>
              </div>
              {properties.length > 0 ? (
                <select
                  value={config?.propertyId || ''}
                  onChange={async (e) => {
                    const selected = properties.find((p) => p.propertyId === e.target.value);
                    if (selected) {
                      setManualPropertyId(selected.propertyId);
                      setManualPropertyName(selected.displayName);
                      await onSaveProperty(selected.propertyId, selected.displayName);
                    }
                  }}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-teal-400"
                >
                  <option value="">Select a discovered GA4 Property...</option>
                  {properties.map((p) => (
                    <option key={p.propertyId} value={p.propertyId}>
                      {p.displayName} ({p.propertyId}) {p.matchesTargetTag ? `— Matches ${GA4_MEASUREMENT_ID}` : ''} · {p.accountName}
                    </option>
                  ))}
                </select>
              ) : (
                <div className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-400">
                  {propertiesLoading
                    ? 'Searching accessible Google Analytics 4 properties...'
                    : 'No properties auto-listed yet — enter your numeric GA4 Property ID on the right.'}
                </div>
              )}
            </div>

            {/* Direct Numeric Property ID Input */}
            <form onSubmit={handleSavePropertySubmit} className="flex items-end gap-2">
              <div className="flex-1 space-y-1.5">
                <label className="block text-xs text-slate-400">
                  Numeric GA4 Property ID <span className="text-slate-500">(GA Admin &rarr; Property Details)</span>
                </label>
                <input
                  type="text"
                  value={manualPropertyId}
                  onChange={(e) => setManualPropertyId(e.target.value)}
                  placeholder="e.g. 458912304"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-slate-100 focus:outline-none focus:border-teal-400"
                />
              </div>
              <button
                type="submit"
                disabled={savingProp}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer disabled:opacity-50"
              >
                {savingProp ? 'Saving...' : 'Save & Sync'}
              </button>
            </form>
          </div>
        )}

        {saveFeedback && (
          <div className="flex items-center gap-2 text-xs text-emerald-300">
            <Check className="w-4 h-4 shrink-0" />
            <span>{saveFeedback}</span>
          </div>
        )}

        {activeError && (
          <div className="p-3.5 rounded-xl bg-rose-950/40 border border-rose-500/40 text-xs text-rose-200 flex items-start justify-between gap-3">
            <div className="flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <div className="font-semibold text-rose-100">Google Analytics Sync Diagnostic</div>
                <p className="text-rose-200/90 leading-relaxed">{activeError}</p>
                {activeError.toLowerCase().includes('has not been used') || activeError.toLowerCase().includes('disabled') ? (
                  <p className="text-[11px] text-rose-300">
                    Enable both <strong>Google Analytics Data API</strong> and <strong>Google Analytics Admin API</strong> in Google Cloud Console for project <span className="font-mono">aura432-23a28</span>.
                  </p>
                ) : null}
              </div>
            </div>
            {(activeError.toLowerCase().includes('401') ||
              activeError.toLowerCase().includes('expired') ||
              activeError.toLowerCase().includes('credential') ||
              activeError.toLowerCase().includes('unauthorized')) && (
              <button
                type="button"
                onClick={handleGoogleSignIn}
                className="px-3 py-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 border border-rose-400/40 text-rose-100 text-xs font-medium whitespace-nowrap shrink-0 cursor-pointer"
              >
                Reconnect Google
              </button>
            )}
          </div>
        )}
      </div>

      {/* Loading Skeleton State */}
      {connected && config?.propertyId && syncing && !data && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[0, 1, 2, 3].map((idx) => (
            <div key={idx} className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2 animate-pulse">
              <div className="h-3 w-28 bg-slate-800 rounded" />
              <div className="h-7 w-16 bg-slate-800 rounded" />
              <div className="h-2.5 w-36 bg-slate-800 rounded" />
            </div>
          ))}
        </div>
      )}

      {/* Main Live Metrics & Breakdown Panels */}
      {data && (
        <>
          {/* 4-Column KPI Strip */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
            <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-1">
              <div className="flex items-center justify-between text-slate-400 text-xs">
                <span>Live Active Users (30m)</span>
                <Activity className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-2xl font-bold text-slate-100 font-mono tabular-nums">
                {rt?.activeUsers30m.toLocaleString()}
              </div>
              <div className="text-[11px] text-emerald-400">
                Last 30 minutes · GA4 Realtime
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-1">
              <div className="flex items-center justify-between text-slate-400 text-xs">
                <span>Live Events &amp; Views (30m)</span>
                <Zap className="w-4 h-4 text-teal-400" />
              </div>
              <div className="text-2xl font-bold text-slate-100 font-mono tabular-nums">
                {rt?.eventCount30m.toLocaleString()}
              </div>
              <div className="text-[11px] text-teal-400 font-mono tabular-nums">
                {rt?.screenPageViews30m.toLocaleString()} live pageviews
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-1">
              <div className="flex items-center justify-between text-slate-400 text-xs">
                <span>Pageviews ({range === 'today' ? 'Today' : range === '7days' ? '7d' : '30d'})</span>
                <Eye className="w-4 h-4 text-sky-400" />
              </div>
              <div className="text-2xl font-bold text-slate-100 font-mono tabular-nums">
                {hist?.screenPageViews.toLocaleString()}
              </div>
              <div className="text-[11px] text-sky-400 font-mono tabular-nums">
                {hist?.activeUsers.toLocaleString()} users · {hist?.sessions.toLocaleString()} sessions
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-1">
              <div className="flex items-center justify-between text-slate-400 text-xs">
                <span>Engagement &amp; Events</span>
                <Clock className="w-4 h-4 text-indigo-400" />
              </div>
              <div className="text-2xl font-bold text-slate-100 font-mono tabular-nums">
                {formatDuration(hist?.averageSessionDurationSec || 0)}
              </div>
              <div className="text-[11px] text-indigo-400 font-mono tabular-nums">
                {hist?.eventCount.toLocaleString()} total events logged
              </div>
            </div>
          </div>

          {/* Traffic Sources & Live/Period Events */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Traffic Sources */}
            <div className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                  <Share2 className="w-4 h-4 text-teal-400" />
                  <span>Traffic Sources &amp; Acquisition</span>
                </h4>
                <span className="text-[11px] font-mono text-slate-400 tabular-nums">
                  {range === 'today' ? 'Today' : range === '7days' ? 'Last 7 Days' : 'Last 30 Days'}
                </span>
              </div>

              {!hist?.trafficSources || hist.trafficSources.length === 0 ? (
                <div className="py-10 text-center text-xs text-slate-400">
                  No acquisition sessions recorded in Google Analytics for this date range yet.
                </div>
              ) : (
                <div className="space-y-3">
                  {hist.trafficSources.map((src, idx) => {
                    const pct = Math.round((src.sessions / totalPeriodSessions) * 100);
                    return (
                      <div key={`${src.source}-${src.medium}-${idx}`} className="space-y-1">
                        <div className="flex items-center justify-between text-xs gap-2">
                          <span className="text-slate-200 font-medium truncate">
                            {src.source} <span className="text-slate-500">/ {src.medium}</span>
                          </span>
                          <span className="text-slate-400 font-mono text-[11px] tabular-nums shrink-0">
                            {src.activeUsers.toLocaleString()} users · {src.sessions.toLocaleString()} sessions ({pct}%)
                          </span>
                        </div>
                        <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                          <div
                            className="h-full bg-teal-400 rounded-full transition-all duration-500"
                            style={{ width: `${Math.max(pct, 3)}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Live & Period Events */}
            <div className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                  <Zap className="w-4 h-4 text-indigo-400" />
                  <span>GA4 Events &amp; Sanctuary Milestones</span>
                </h4>
                <span className="text-[11px] font-mono text-slate-400">
                  30m Live + Period
                </span>
              </div>

              {mergedEvents.length === 0 ? (
                <div className="py-10 text-center text-xs text-slate-400">
                  Waiting for gtag events from active visitors...
                </div>
              ) : (
                <div className="overflow-x-auto max-h-[320px]">
                  <table className="w-full text-left text-xs">
                    <thead className="text-[10px] uppercase tracking-wider text-slate-400 border-b border-slate-800">
                      <tr>
                        <th className="py-2 pr-3">Event Name</th>
                        <th className="py-2 px-3 text-right">30m Live</th>
                        <th className="py-2 pl-3 text-right">Period Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {mergedEvents.map((ev) => (
                        <tr key={ev.eventName} className="hover:bg-slate-900/40">
                          <td className="py-2 pr-3 font-mono text-slate-200">{ev.eventName}</td>
                          <td className="py-2 px-3 text-right font-mono tabular-nums text-emerald-400">
                            {ev.realtimeCount > 0 ? ev.realtimeCount.toLocaleString() : '—'}
                          </td>
                          <td className="py-2 pl-3 text-right font-mono tabular-nums text-slate-300">
                            {ev.periodCount > 0 ? ev.periodCount.toLocaleString() : '—'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* Active Screens (Realtime 30m) & Top Page Paths */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                  <Globe className="w-4 h-4 text-emerald-400" />
                  <span>Active Screens Right Now (Last 30 Minutes)</span>
                </h4>
              </div>
              {!rt?.topScreens || rt.topScreens.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400">
                  No active screens detected in the last 30 minutes. Open the main Sanctuary player in another tab to test live tracking.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="text-[10px] uppercase tracking-wider text-slate-400 border-b border-slate-800">
                      <tr>
                        <th className="py-2 pr-3">Page / Screen Title</th>
                        <th className="py-2 px-3 text-right">Active Users</th>
                        <th className="py-2 px-3 text-right">Views</th>
                        <th className="py-2 pl-3 text-right">Events</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {rt.topScreens.map((scr, idx) => (
                        <tr key={`${scr.screenName}-${idx}`} className="hover:bg-slate-900/40">
                          <td className="py-2 pr-3 text-slate-200 truncate max-w-[240px]" title={scr.screenName}>
                            {scr.screenName}
                          </td>
                          <td className="py-2 px-3 text-right font-mono tabular-nums text-emerald-400 font-semibold">
                            {scr.activeUsers.toLocaleString()}
                          </td>
                          <td className="py-2 px-3 text-right font-mono tabular-nums text-slate-300">
                            {scr.screenPageViews.toLocaleString()}
                          </td>
                          <td className="py-2 pl-3 text-right font-mono tabular-nums text-slate-400">
                            {scr.eventCount.toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                  <ExternalLink className="w-4 h-4 text-sky-400" />
                  <span>Top Page Paths ({range === 'today' ? 'Today' : range === '7days' ? 'Last 7 Days' : 'Last 30 Days'})</span>
                </h4>
              </div>
              {!hist?.topPages || hist.topPages.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400">
                  No page paths reported for this date range yet.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="text-[10px] uppercase tracking-wider text-slate-400 border-b border-slate-800">
                      <tr>
                        <th className="py-2 pr-3">Path</th>
                        <th className="py-2 px-3 text-right">Users</th>
                        <th className="py-2 px-3 text-right">Pageviews</th>
                        <th className="py-2 pl-3 text-right">Events</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {hist.topPages.map((pg, idx) => (
                        <tr key={`${pg.pagePath}-${idx}`} className="hover:bg-slate-900/40">
                          <td className="py-2 pr-3 font-mono text-slate-200 truncate max-w-[240px]" title={pg.pagePath}>
                            {pg.pagePath}
                          </td>
                          <td className="py-2 px-3 text-right font-mono tabular-nums text-sky-400">
                            {pg.activeUsers.toLocaleString()}
                          </td>
                          <td className="py-2 px-3 text-right font-mono tabular-nums text-slate-200 font-semibold">
                            {pg.screenPageViews.toLocaleString()}
                          </td>
                          <td className="py-2 pl-3 text-right font-mono tabular-nums text-slate-400">
                            {pg.eventCount.toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* Empty State when OAuth is connected but no Property ID has been saved/synced yet */}
      {connected && !data && !syncing && !activeError && (
        <div className="p-8 rounded-2xl bg-slate-950/60 border border-slate-800 text-center space-y-2">
          <KeyRound className="w-6 h-6 text-teal-400 mx-auto" />
          <div className="text-sm font-semibold text-slate-200">
            Select or Save Your GA4 Property ID Above
          </div>
          <p className="text-xs text-slate-400 max-w-lg mx-auto">
            Choose your Aura 432Hz property from the dropdown or paste your numeric GA4 Property ID and click <strong>Save &amp; Sync</strong> to stream live active users, pageviews, traffic sources, and events.
          </p>
        </div>
      )}
    </div>
  );
};
