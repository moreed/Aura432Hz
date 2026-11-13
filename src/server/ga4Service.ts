/**
 * Google Analytics 4 (GA4) Admin & Data API v1beta Service
 * Server-side proxy using the client's in-memory Google OAuth Bearer token.
 */

export const EXPECTED_MEASUREMENT_ID = 'G-D8TKJBBET7';

export interface Ga4PropertySummary {
  propertyId: string;
  resourceName: string;
  displayName: string;
  accountName: string;
  measurementIds: string[];
  matchesTargetTag: boolean;
}

export interface Ga4RealtimeScreenRow {
  screenName: string;
  activeUsers: number;
  screenPageViews: number;
  eventCount: number;
}

export interface Ga4RealtimeEventRow {
  eventName: string;
  activeUsers: number;
  eventCount: number;
}

export interface Ga4SourceRow {
  source: string;
  medium: string;
  activeUsers: number;
  sessions: number;
  screenPageViews: number;
  eventCount: number;
}

export interface Ga4PageRow {
  pagePath: string;
  activeUsers: number;
  screenPageViews: number;
  eventCount: number;
}

export interface Ga4EventRow {
  eventName: string;
  activeUsers: number;
  eventCount: number;
}

export interface Ga4SyncPayload {
  propertyId: string;
  range: 'today' | '7days' | '30days';
  syncedAt: string;
  realtime: {
    activeUsers30m: number;
    screenPageViews30m: number;
    eventCount30m: number;
    topScreens: Ga4RealtimeScreenRow[];
    topEvents: Ga4RealtimeEventRow[];
  };
  historical: {
    activeUsers: number;
    sessions: number;
    screenPageViews: number;
    eventCount: number;
    averageSessionDurationSec: number;
    trafficSources: Ga4SourceRow[];
    topPages: Ga4PageRow[];
    topEvents: Ga4EventRow[];
  };
}

export class Ga4ApiError extends Error {
  status: number;
  code?: string;
  details?: string;

  constructor(message: string, status = 500, code?: string, details?: string) {
    super(message);
    this.name = 'Ga4ApiError';
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

function parseGoogleError(status: number, bodyText: string): Ga4ApiError {
  try {
    const parsed = JSON.parse(bodyText);
    const errObj = parsed?.error || parsed;
    const msg = errObj?.message || `Google Analytics API returned HTTP ${status}`;
    const errStatus = errObj?.status || String(status);
    return new Ga4ApiError(msg, status, errStatus, bodyText);
  } catch {
    return new Ga4ApiError(`Google Analytics API returned HTTP ${status}`, status, undefined, bodyText);
  }
}

function numVal(row: any, idx: number): number {
  const raw = row?.metricValues?.[idx]?.value;
  const n = Number(raw);
  return Number.isFinite(n) ? n : 0;
}

function dimVal(row: any, idx: number): string {
  return String(row?.dimensionValues?.[idx]?.value || '(not set)');
}

async function runGa4Endpoint(
  url: string,
  accessToken: string,
  method: 'GET' | 'POST',
  body?: Record<string, any>
): Promise<any> {
  const res = await fetch(url, {
    method,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });

  const text = await res.text();
  if (!res.ok) {
    throw parseGoogleError(res.status, text);
  }
  return text ? JSON.parse(text) : {};
}

export async function fetchGa4Properties(accessToken: string): Promise<Ga4PropertySummary[]> {
  const summaryData = await runGa4Endpoint(
    'https://analyticsadmin.googleapis.com/v1beta/accountSummaries?pageSize=50',
    accessToken,
    'GET'
  );

  const rawSummaries = Array.isArray(summaryData?.accountSummaries)
    ? summaryData.accountSummaries
    : [];

  const flattened: Array<{
    propertyId: string;
    resourceName: string;
    displayName: string;
    accountName: string;
  }> = [];

  for (const acc of rawSummaries) {
    const accountName = acc?.displayName || acc?.account || 'Google Analytics Account';
    const props = Array.isArray(acc?.propertySummaries) ? acc.propertySummaries : [];
    for (const p of props) {
      const resourceName = String(p?.property || '');
      const propertyId = resourceName.replace(/^properties\//, '').trim();
      if (!propertyId) continue;
      flattened.push({
        propertyId,
        resourceName,
        displayName: String(p?.displayName || `Property ${propertyId}`),
        accountName: String(accountName),
      });
    }
  }

  // Enrich with web data streams (to automatically spot G-D8TKJBBET7)
  const enriched = await Promise.all(
    flattened.slice(0, 20).map(async (prop) => {
      const measurementIds: string[] = [];
      try {
        const streams = await runGa4Endpoint(
          `https://analyticsadmin.googleapis.com/v1beta/properties/${prop.propertyId}/dataStreams?pageSize=10`,
          accessToken,
          'GET'
        );
        const list = Array.isArray(streams?.dataStreams) ? streams.dataStreams : [];
        for (const s of list) {
          const mid = s?.webStreamData?.measurementId;
          if (mid && typeof mid === 'string') {
            measurementIds.push(mid);
          }
        }
      } catch {
        // Non-fatal: stream listing might be restricted or unavailable
      }
      return {
        ...prop,
        measurementIds,
        matchesTargetTag: measurementIds.includes(EXPECTED_MEASUREMENT_ID),
      };
    })
  );

  // Sort matching property first
  enriched.sort((a, b) => Number(b.matchesTargetTag) - Number(a.matchesTargetTag));
  return enriched;
}

export async function fetchGa4SyncReport(
  accessToken: string,
  rawPropertyId: string,
  range: 'today' | '7days' | '30days' = 'today'
): Promise<Ga4SyncPayload> {
  const propertyId = String(rawPropertyId || '').replace(/^properties\//, '').trim();
  if (!/^\d+$/.test(propertyId)) {
    throw new Ga4ApiError('GA4 Property ID must be numeric (e.g. 412345678).', 400, 'INVALID_ARGUMENT');
  }

  const startDate =
    range === 'today' ? 'today' : range === '7days' ? '7daysAgo' : '30daysAgo';
  const baseUrl = `https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}`;

  const [
    realtimeTotalsRes,
    realtimeScreensRes,
    realtimeEventsRes,
    histTotalsRes,
    histSourcesRes,
    histPagesRes,
    histEventsRes,
  ] = await Promise.all([
    runGa4Endpoint(`${baseUrl}:runRealtimeReport`, accessToken, 'POST', {
      metrics: [
        { name: 'activeUsers' },
        { name: 'screenPageViews' },
        { name: 'eventCount' },
      ],
    }),
    runGa4Endpoint(`${baseUrl}:runRealtimeReport`, accessToken, 'POST', {
      dimensions: [{ name: 'unifiedScreenName' }],
      metrics: [
        { name: 'activeUsers' },
        { name: 'screenPageViews' },
        { name: 'eventCount' },
      ],
      orderBys: [{ metric: { metricName: 'activeUsers' }, desc: true }],
      limit: 10,
    }),
    runGa4Endpoint(`${baseUrl}:runRealtimeReport`, accessToken, 'POST', {
      dimensions: [{ name: 'eventName' }],
      metrics: [{ name: 'activeUsers' }, { name: 'eventCount' }],
      orderBys: [{ metric: { metricName: 'eventCount' }, desc: true }],
      limit: 12,
    }),
    runGa4Endpoint(`${baseUrl}:runReport`, accessToken, 'POST', {
      dateRanges: [{ startDate, endDate: 'today' }],
      metrics: [
        { name: 'activeUsers' },
        { name: 'sessions' },
        { name: 'screenPageViews' },
        { name: 'eventCount' },
        { name: 'averageSessionDuration' },
      ],
    }),
    runGa4Endpoint(`${baseUrl}:runReport`, accessToken, 'POST', {
      dateRanges: [{ startDate, endDate: 'today' }],
      dimensions: [{ name: 'sessionSource' }, { name: 'sessionMedium' }],
      metrics: [
        { name: 'activeUsers' },
        { name: 'sessions' },
        { name: 'screenPageViews' },
        { name: 'eventCount' },
      ],
      orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
      limit: 12,
    }),
    runGa4Endpoint(`${baseUrl}:runReport`, accessToken, 'POST', {
      dateRanges: [{ startDate, endDate: 'today' }],
      dimensions: [{ name: 'pagePath' }],
      metrics: [
        { name: 'activeUsers' },
        { name: 'screenPageViews' },
        { name: 'eventCount' },
      ],
      orderBys: [{ metric: { metricName: 'screenPageViews' }, desc: true }],
      limit: 12,
    }),
    runGa4Endpoint(`${baseUrl}:runReport`, accessToken, 'POST', {
      dateRanges: [{ startDate, endDate: 'today' }],
      dimensions: [{ name: 'eventName' }],
      metrics: [{ name: 'activeUsers' }, { name: 'eventCount' }],
      orderBys: [{ metric: { metricName: 'eventCount' }, desc: true }],
      limit: 15,
    }),
  ]);

  const rtTotalRow = realtimeTotalsRes?.rows?.[0];
  const histTotalRow = histTotalsRes?.rows?.[0];

  const topScreens: Ga4RealtimeScreenRow[] = (realtimeScreensRes?.rows || []).map((r: any) => ({
    screenName: dimVal(r, 0),
    activeUsers: numVal(r, 0),
    screenPageViews: numVal(r, 1),
    eventCount: numVal(r, 2),
  }));

  const realtimeTopEvents: Ga4RealtimeEventRow[] = (realtimeEventsRes?.rows || []).map((r: any) => ({
    eventName: dimVal(r, 0),
    activeUsers: numVal(r, 0),
    eventCount: numVal(r, 1),
  }));

  const trafficSources: Ga4SourceRow[] = (histSourcesRes?.rows || []).map((r: any) => ({
    source: dimVal(r, 0),
    medium: dimVal(r, 1),
    activeUsers: numVal(r, 0),
    sessions: numVal(r, 1),
    screenPageViews: numVal(r, 2),
    eventCount: numVal(r, 3),
  }));

  const topPages: Ga4PageRow[] = (histPagesRes?.rows || []).map((r: any) => ({
    pagePath: dimVal(r, 0),
    activeUsers: numVal(r, 0),
    screenPageViews: numVal(r, 1),
    eventCount: numVal(r, 2),
  }));

  const histTopEvents: Ga4EventRow[] = (histEventsRes?.rows || []).map((r: any) => ({
    eventName: dimVal(r, 0),
    activeUsers: numVal(r, 0),
    eventCount: numVal(r, 1),
  }));

  return {
    propertyId,
    range,
    syncedAt: new Date().toISOString(),
    realtime: {
      activeUsers30m: numVal(rtTotalRow, 0),
      screenPageViews30m: numVal(rtTotalRow, 1),
      eventCount30m: numVal(rtTotalRow, 2),
      topScreens,
      topEvents: realtimeTopEvents,
    },
    historical: {
      activeUsers: numVal(histTotalRow, 0),
      sessions: numVal(histTotalRow, 1),
      screenPageViews: numVal(histTotalRow, 2),
      eventCount: numVal(histTotalRow, 3),
      averageSessionDurationSec: Math.round(numVal(histTotalRow, 4)),
      trafficSources,
      topPages,
      topEvents: histTopEvents,
    },
  };
}
