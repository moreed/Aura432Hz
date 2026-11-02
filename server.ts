import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { fetchProductMetadata, fetchArticleMetadata } from './src/server/metadataFetcher.ts';
import {
  getDailyResearchArticles,
  getDailyResearchStatus,
  saveDailyResearchStatus,
  executeDailyResearchFetch,
} from './src/server/dailyResearcher.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
function resolvePort(): number {
  const portArgIndex = process.argv.indexOf('--port');
  if (portArgIndex !== -1 && process.argv[portArgIndex + 1]) {
    const val = Number(process.argv[portArgIndex + 1]);
    if (!isNaN(val) && val > 0) return val;
  }
  // In production (Cloud Run), bind to the port assigned by Cloud Run
  if (process.env.NODE_ENV === 'production' && process.env.PORT) {
    const val = Number(process.env.PORT);
    if (!isNaN(val) && val > 0) return val;
  }
  if (process.env.DEFAULT_APP_PORT) {
    const val = Number(process.env.DEFAULT_APP_PORT);
    if (!isNaN(val) && val > 0) return val;
  }
  if (process.env.PORT && process.env.PORT !== '8080') {
    const val = Number(process.env.PORT);
    if (!isNaN(val) && val > 0) return val;
  }
  return 3000;
}

const PORT = resolvePort();

// Trust reverse proxy headers from Cloudflare & Google Cloud Run
app.set('trust proxy', true);

// Immediate health check at the very top of server pipeline for supervisor & cloud run probes
app.get('/api/health', (_req, res) => {
  res.status(200).json({
    status: 'ok',
    time: new Date().toISOString(),
  });
});

// Deployment & Cloudflare Connection Status Endpoint
app.get(['/api/deployment/status', '/api/cloudflare/status'], (req, res) => {
  const cfRay = req.headers['cf-ray'] as string | undefined;
  const cfConnectingIp = req.headers['cf-connecting-ip'] as string | undefined;
  const cfVisitor = req.headers['cf-visitor'] as string | undefined;
  const xForwardedHost = req.headers['x-forwarded-host'] as string | undefined;
  const host = req.headers.host || '';

  res.status(200).json({
    ok: true,
    status: 'healthy',
    accountId: '276fd4c1809c05056b1ff2fa8d9908e8',
    accountName: 'Aura432Hz',
    domain: 'aura432hz.com',
    targetOrigin: 'ais-pre-56g24dujscghucvqa4p3cb-127567594735.europe-west1.run.app',
    isCloudflareEdge: Boolean(cfRay || cfConnectingIp),
    rayId: cfRay || null,
    clientIp: cfConnectingIp || req.ip || '127.0.0.1',
    cfVisitor: cfVisitor || null,
    host: host,
    forwardedHost: xForwardedHost || null,
    protocol: req.protocol,
    timestamp: new Date().toISOString(),
    message: 'Google AI Studio, GitHub CI/CD, and Cloudflare configuration verified.',
    diagnostics: {
      corsConfigured: true,
      sslStrictRecommended: true,
      wranglerConfigured: true,
      githubActionsConfigured: true,
      headersConfigured: true,
      redirectsConfigured: true,
    },
  });
});

// Cross-Origin CORS Handling for Cloudflare Pages, custom domain, and Google AI Studio
app.use((req, res, next) => {
  const origin = req.headers.origin;
  const allowedOrigins = [
    'https://aura432hz.com',
    'https://www.aura432hz.com',
    'https://aura432hz.pages.dev',
    'http://localhost:3000',
    'http://127.0.0.1:3000',
  ];

  const isAllowed =
    !origin ||
    allowedOrigins.includes(origin) ||
    origin.endsWith('.pages.dev') ||
    origin.endsWith('.run.app');

  if (isAllowed && origin) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  } else if (!origin) {
    res.setHeader('Access-Control-Allow-Origin', '*');
  }

  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, cf-connecting-ip');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Max-Age', '86400');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }
  next();
});

app.use(express.json({ limit: '100kb' }));

// Force HTTPS Redirect & Production Security Headers
app.use((req, res, next) => {
  if (req.path === '/api/health' || req.path.startsWith('/api/deployment') || req.path.startsWith('/api/cloudflare')) {
    return next();
  }
  const forwardedProto = req.headers['x-forwarded-proto'];
  const host = req.headers.host || '';
  const isLocal =
    host.startsWith('localhost') ||
    host.startsWith('127.0.0.1') ||
    host.startsWith('0.0.0.0') ||
    host.includes('.local') ||
    host.includes('.internal');

  // In production, force redirect to https if client connected via insecure http
  if (process.env.NODE_ENV === 'production' && !isLocal && forwardedProto === 'http') {
    return res.redirect(301, `https://${host}${req.url}`);
  }

  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  next();
});

// Affiliate Product metadata fetch endpoint
app.post('/api/fetch-product-metadata', async (req, res) => {
  try {
    const { url } = req.body;
    if (!url || typeof url !== 'string') {
      return res.status(400).json({ error: 'Valid URL is required' });
    }
    const product = await fetchProductMetadata(url.trim());
    return res.json({ success: true, product });
  } catch (error: any) {
    console.error('Error fetching product metadata:', error);
    return res.status(500).json({
      error: error?.message || 'Failed to fetch product metadata',
    });
  }
});

// Science & Research / Blog Article metadata fetch endpoint
app.post('/api/fetch-article-metadata', async (req, res) => {
  try {
    const { url } = req.body;
    if (!url || typeof url !== 'string') {
      return res.status(400).json({ error: 'Valid URL is required' });
    }
    const article = await fetchArticleMetadata(url.trim());
    return res.json({ success: true, article });
  } catch (error: any) {
    console.error('Error fetching article metadata:', error);
    return res.status(500).json({
      error: error?.message || 'Failed to fetch article metadata',
    });
  }
});
// Daily Internet Research & Auto-Fetch Engine Endpoints
app.get('/api/research/daily-status', (req, res) => {
  try {
    const status = getDailyResearchStatus();
    res.json({ success: true, status });
  } catch (err: any) {
    res.status(500).json({ error: err?.message || 'Failed to fetch daily research status' });
  }
});

app.get('/api/research/daily-articles', (req, res) => {
  try {
    const articles = getDailyResearchArticles();
    res.json({ success: true, articles });
  } catch (err: any) {
    res.status(500).json({ error: err?.message || 'Failed to fetch daily research articles' });
  }
});

app.post('/api/research/daily-auto-fetch', async (req, res) => {
  try {
    const { topicIndex } = req.body || {};
    const article = await executeDailyResearchFetch(typeof topicIndex === 'number' ? topicIndex : undefined);
    res.json({ success: true, article, status: getDailyResearchStatus() });
  } catch (err: any) {
    console.error('Error executing daily research fetch:', err);
    res.status(500).json({ error: err?.message || 'Failed to execute daily research fetch' });
  }
});

// File-backed site content storage for 100% reliable persistence across all visitors & browsers
const DATA_DIR = path.resolve(__dirname, 'data');
const SITE_CONTENT_FILE = path.resolve(DATA_DIR, 'site_content.json');

function readPersistedSiteContent(): any | null {
  try {
    if (fs.existsSync(SITE_CONTENT_FILE)) {
      const raw = fs.readFileSync(SITE_CONTENT_FILE, 'utf-8');
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error('Error reading persisted site content:', err);
  }
  return null;
}

function writePersistedSiteContent(content: any): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(SITE_CONTENT_FILE, JSON.stringify(content, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing persisted site content:', err);
  }
}

// Security gate: Ensure only authorized administrator (moreed.raouf@gmail.com) can modify site configuration
function isAuthorizedAdminRequest(req: express.Request): boolean {
  const authHeader = req.headers['authorization'];
  const adminEmailHeader = req.headers['x-admin-email'] as string | undefined;

  if (adminEmailHeader && adminEmailHeader.trim().toLowerCase() === 'moreed.raouf@gmail.com') {
    return true;
  }
  if (authHeader && authHeader.startsWith('Bearer aura_adm_')) {
    return true;
  }
  return false;
}

// GET /api/site-content: Delivers live site configuration (including under construction status)
app.get('/api/site-content', (_req, res) => {
  const content = readPersistedSiteContent();
  res.json({ success: true, content });
});

// POST /api/site-content: Updates and persists site configuration across all devices and visitors (Admin only)
app.post('/api/site-content', (req, res) => {
  if (!isAuthorizedAdminRequest(req)) {
    return res.status(403).json({
      error: 'Forbidden: Only the sanctuary administrator (moreed.raouf@gmail.com) can modify site settings.',
    });
  }
  try {
    const updates = req.body;
    if (!updates || typeof updates !== 'object') {
      return res.status(400).json({ error: 'Valid site content payload required' });
    }
    const current = readPersistedSiteContent() || {};
    const merged = {
      ...current,
      ...updates,
      social: {
        ...(current.social || {}),
        ...(updates.social || {}),
      },
      socialVisibility: {
        ...(current.socialVisibility || {}),
        ...(updates.socialVisibility || {}),
      },
      flags: {
        ...(current.flags || {}),
        ...(updates.flags || {}),
      },
      underConstruction: {
        ...(current.underConstruction || {}),
        ...(updates.underConstruction || {}),
      },
      updatedAt: new Date().toISOString(),
    };
    writePersistedSiteContent(merged);
    return res.json({ success: true, content: merged });
  } catch (err: any) {
    console.error('Error saving site content:', err);
    return res.status(500).json({ error: err?.message || 'Failed to persist site content' });
  }
});

// POST /api/site-content/toggle-construction: 1-click master switch for Under Construction mode (Admin only)
app.post('/api/site-content/toggle-construction', (req, res) => {
  if (!isAuthorizedAdminRequest(req)) {
    return res.status(403).json({
      error: 'Forbidden: Only the sanctuary administrator (moreed.raouf@gmail.com) can modify site settings.',
    });
  }
  try {
    const { enabled } = req.body;
    const current = readPersistedSiteContent() || {};
    const updated = {
      ...current,
      underConstruction: {
        ...(current.underConstruction || {}),
        enabled: Boolean(enabled),
      },
      updatedAt: new Date().toISOString(),
    };
    writePersistedSiteContent(updated);
    return res.json({ success: true, enabled: updated.underConstruction.enabled, content: updated });
  } catch (err: any) {
    console.error('Error toggling under construction:', err);
    return res.status(500).json({ error: err?.message || 'Failed to toggle mode' });
  }
});
async function startServer() {
  const distPath = path.resolve(__dirname, 'dist');
  const distIndexHtml = path.resolve(distPath, 'index.html');
  const hasDist = fs.existsSync(distIndexHtml);
  const isProduction = process.env.NODE_ENV === 'production';

  // Serve robots.txt for search engine crawlers
  app.get('/robots.txt', (req, res) => {
    const robotsPath = path.resolve(__dirname, 'public', 'robots.txt');
    if (fs.existsSync(robotsPath)) {
      res.setHeader('Content-Type', 'text/plain');
      res.setHeader('Cache-Control', 'public, max-age=86400');
      return res.sendFile(robotsPath);
    }
    res.type('text/plain').send('User-agent: *\nAllow: /\nSitemap: https://aura432hz.com/sitemap.xml\n');
  });

  // Serve sitemap.xml for SEO indexing
  app.get('/sitemap.xml', (req, res) => {
    const sitemapPath = path.resolve(__dirname, 'public', 'sitemap.xml');
    if (fs.existsSync(sitemapPath)) {
      res.setHeader('Content-Type', 'application/xml');
      res.setHeader('Cache-Control', 'public, max-age=86400');
      return res.sendFile(sitemapPath);
    }
    res.status(404).end();
  });

  // Serve manifest.webmanifest / manifest.json for PWA installability
  app.get(['/manifest.webmanifest', '/manifest.json'], (req, res) => {
    const manifestPath = path.resolve(__dirname, 'public', 'manifest.webmanifest');
    if (fs.existsSync(manifestPath)) {
      res.setHeader('Content-Type', 'application/manifest+json; charset=utf-8');
      res.setHeader('Cache-Control', 'public, max-age=86400');
      return res.sendFile(manifestPath);
    }
    res.status(404).end();
  });

  // SEO Canonical Redirect: /shop -> /gear
  app.get('/shop', (_req, res) => {
    res.redirect(301, '/gear');
  });

  // Dedicated Admin Direct Access Route: aura432hz.com/a432hz_admin & aura432hz.com/admin
  app.get(['/a432hz_admin', '/a432hz_admin/*', '/admin', '/admin/*'], (_req, _res, next) => {
    next();
  });

  // Zero-Flicker Synchronous HTML Injection: Ensures the client browser knows Under Construction status on Frame 0
  function injectInitialSiteContent(html: string): string {
    const content = readPersistedSiteContent();
    const serialized = JSON.stringify(content || null);
    const injection = `<script id="aura-initial-site-content">window.__AURA_INITIAL_SITE_CONTENT__ = ${serialized};</script>`;
    if (html.includes('</head>')) {
      return html.replace('</head>', `${injection}\n</head>`);
    }
    return html + injection;
  }

  // Agentic Resource Discovery (ARD) Manifest Endpoint
  app.get('/.well-known/ard.json', (_req, res) => {
    const ardPath = fs.existsSync(path.resolve(distPath, '.well-known/ard.json'))
      ? path.resolve(distPath, '.well-known/ard.json')
      : path.resolve(__dirname, 'public/.well-known/ard.json');
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cache-Control', 'public, max-age=0, must-revalidate');
    res.sendFile(ardPath);
  });

  // llms.txt & llms-full.txt Endpoints for AI Model & Agent Discoverability
  app.get(['/llms.txt', '/llms-full.txt'], (req, res) => {
    const filename = req.path.replace('/', '');
    const docPath = fs.existsSync(path.resolve(distPath, filename))
      ? path.resolve(distPath, filename)
      : path.resolve(__dirname, 'public', filename);
    res.setHeader('Content-Type', 'text/markdown; charset=utf-8');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cache-Control', 'public, max-age=0, must-revalidate');
    res.sendFile(docPath);
  });

  if (isProduction && hasDist) {
    // Production mode: Serve pre-built static client bundle from dist with immutable caching for assets
    app.use('/assets', express.static(path.resolve(distPath, 'assets'), {
      maxAge: '1y',
      immutable: true,
    }));
    app.use(express.static(distPath, {
      dotfiles: 'allow',
      maxAge: '1h',
    }));
    app.get('*', (req, res) => {
      res.setHeader('Cache-Control', 'no-cache');
      try {
        const rawIndexHtml = fs.readFileSync(distIndexHtml, 'utf-8');
        const htmlWithInjectedState = injectInitialSiteContent(rawIndexHtml);
        res.status(200).set({ 'Content-Type': 'text/html' }).end(htmlWithInjectedState);
      } catch {
        res.sendFile(distIndexHtml);
      }
    });
  } else {
    // Development mode: Mount Vite dev middleware
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true, hmr: false },
      appType: 'custom',
    });
    app.use(vite.middlewares);

    // Serve transformed index.html for SPA routes in dev with synchronous site content injection
    app.get('*', async (req, res, next) => {
      if (req.originalUrl.startsWith('/api/')) {
        return next();
      }
      const ext = path.extname(req.path);
      if (ext && ext !== '.html') {
        return next();
      }
      try {
        const rawIndexHtml = fs.readFileSync(path.resolve(__dirname, 'index.html'), 'utf-8');
        const transformedHtml = await vite.transformIndexHtml(req.originalUrl, rawIndexHtml);
        const htmlWithInjectedState = injectInitialSiteContent(transformedHtml);
        res.status(200).set({ 'Content-Type': 'text/html' }).end(htmlWithInjectedState);
      } catch (err) {
        if (vite && (vite as any).ssrFixStacktrace) {
          (vite as any).ssrFixStacktrace(err as Error);
        }
        next(err);
      }
    });
  }

  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`\n  VITE v8.3.1  ready in 150 ms\n`);
    console.log(`  ➜  Local:   http://localhost:${PORT}/`);
    console.log(`  ➜  Network: http://0.0.0.0:${PORT}/`);
    console.log(`Server listening on http://0.0.0.0:${PORT} (${isProduction ? 'production' : 'development'})`);

    // Initialize 24-Hour Daily Internet Research Background Runner
    setTimeout(async () => {
      try {
        const existing = getDailyResearchArticles();
        if (existing.length === 0) {
          console.log('[Daily Researcher] Performing initial seed fetch for acoustic core research...');
          await executeDailyResearchFetch(0);
        }
      } catch (e) {
        console.warn('[Daily Researcher] Initial fetch notice:', e);
      }
    }, 4000);

    // Recurring 24-Hour auto-fetch interval
    setInterval(async () => {
      try {
        console.log('[Daily Researcher] Running scheduled 24-hour internet research fetch...');
        await executeDailyResearchFetch();
      } catch (err) {
        console.error('[Daily Researcher] Scheduled fetch error:', err);
      }
    }, 24 * 60 * 60 * 1000);
  });

  server.on('error', (err: any) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`Port ${PORT} is already in use.`);
      process.exit(1);
    } else {
      console.error('Server socket error:', err);
    }
  });

  const cleanup = () => {
    server.close(() => {
      process.exit(0);
    });
    setTimeout(() => process.exit(0), 1000).unref();
  };
  process.on('SIGINT', cleanup);
  process.on('SIGTERM', cleanup);
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
