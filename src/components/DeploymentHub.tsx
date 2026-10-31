import React, { useState, useEffect } from 'react';
import {
  Globe,
  Server,
  GitBranch,
  ShieldCheck,
  CheckCircle2,
  Copy,
  Check,
  RefreshCw,
  ExternalLink,
  AlertTriangle,
  ArrowRight,
  Terminal,
  FileCode,
  Zap,
  Lock,
  Network
} from 'lucide-react';
import {
  AURA_CLOUDFLARE_CONFIG,
  RECOMMENDED_DNS_RECORDS,
  checkDeploymentStatus,
  DeploymentCheckResult,
} from '../services/cloudflareDeploymentService';

export const DeploymentHub: React.FC = () => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [checkLoading, setCheckLoading] = useState<boolean>(false);
  const [statusResult, setStatusResult] = useState<DeploymentCheckResult | null>(null);
  const [activeConfigTab, setActiveConfigTab] = useState<'wrangler' | 'github' | 'worker' | 'headers' | 'redirects'>('wrangler');

  useEffect(() => {
    runCheck();
  }, []);

  const runCheck = async () => {
    setCheckLoading(true);
    try {
      const res = await checkDeploymentStatus();
      setStatusResult(res);
    } catch (e) {
      console.error('Failed to check deployment status', e);
    } finally {
      setCheckLoading(false);
    }
  };

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const configFiles = {
    wrangler: `# Root wrangler.toml for Cloudflare Pages
name = "aura432hz"
account_id = "${AURA_CLOUDFLARE_CONFIG.accountId}"
compatibility_date = "2024-09-23"
compatibility_flags = ["nodejs_compat"]
pages_build_output_dir = "dist"

[vars]
ENVIRONMENT = "production"
PRIMARY_DOMAIN = "aura432hz.com"
ALT_DOMAIN = "www.aura432hz.com"
AI_STUDIO_ORIGIN = "${AURA_CLOUDFLARE_CONFIG.aiStudioSharedUrl}"`,

    github: `# .github/workflows/deploy.yml
name: Deploy Aura432Hz to Cloudflare Pages

on:
  push:
    branches: [main, master]
  workflow_dispatch:

jobs:
  deploy:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      deployments: write
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: 'npm'
      - run: npm ci || npm install
      - run: npm run build
      - name: Deploy to Cloudflare Pages
        run: npx wrangler pages deploy dist
        env:
          CLOUDFLARE_API_TOKEN: \${{ secrets.CLOUDFLARE_API_TOKEN }}
          CLOUDFLARE_ACCOUNT_ID: '${AURA_CLOUDFLARE_CONFIG.accountId}'`,

    worker: `/**
 * cloudflare/worker.js
 * Edge Reverse Proxy for Aura 432Hz
 * Account ID: ${AURA_CLOUDFLARE_CONFIG.accountId}
 */
const UPSTREAM_ORIGIN = '${AURA_CLOUDFLARE_CONFIG.aiStudioSharedUrl}';
const UPSTREAM_HOSTNAME = '${AURA_CLOUDFLARE_CONFIG.aiStudioOriginHost}';

export default {
  async fetch(request) {
    const url = new URL(request.url);
    if (url.hostname === 'www.aura432hz.com') {
      url.hostname = 'aura432hz.com';
      return Response.redirect(url.toString(), 301);
    }
    const targetUrl = new URL(url.pathname + url.search, UPSTREAM_ORIGIN);
    const newHeaders = new Headers(request.headers);
    newHeaders.set('Host', UPSTREAM_HOSTNAME);
    newHeaders.set('X-Forwarded-Host', url.hostname);
    newHeaders.set('X-Forwarded-Proto', 'https');
    return fetch(new Request(targetUrl.toString(), {
      method: request.method,
      headers: newHeaders,
      body: ['GET', 'HEAD'].includes(request.method) ? undefined : request.body
    }));
  }
};`,

    headers: `/*
  Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
  Access-Control-Allow-Origin: *
  Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS

/assets/*
  Cache-Control: public, max-age=31536000, immutable`,

    redirects: `/shop /gear 301
/store /gear 301
/soundscapes /mixer 301
/breathwork /breath 301
/harp /musical 301
/science /blog 301
/research /blog 301
/support /contact 301
/player /index.html 200
/mixer /index.html 200
/breath /index.html 200
/musical /index.html 200
/gear /index.html 200
/community /index.html 200
/blog /index.html 200
/contact /index.html 200
/admin /index.html 200
/a432hz_admin /index.html 200`,
  };

  return (
    <div className="space-y-6">
      {/* Migration Notice Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-amber-500/30 bg-gradient-to-r from-amber-950/40 via-slate-900/90 to-amber-950/40 p-5 shadow-xl backdrop-blur-md">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="p-2.5 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300">
              <Zap className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-semibold tracking-wide text-amber-300 uppercase">
                  Cloudflare Account Transfer Active
                </span>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Configured
                </span>
              </div>
              <p className="mt-1 text-xs text-slate-300 leading-relaxed max-w-2xl">
                The domain <span className="font-semibold text-amber-200">aura432hz.com</span> was migrated from{' '}
                <span className="font-mono text-slate-400">{AURA_CLOUDFLARE_CONFIG.previousAccountEmail}</span> to the dedicated{' '}
                <span className="font-semibold text-amber-200">{AURA_CLOUDFLARE_CONFIG.accountName}</span> account.
                All backend routes, CORS policies, GitHub Actions workflows, and Cloudflare configuration files have been synchronized.
              </p>
            </div>
          </div>
          <button
            onClick={runCheck}
            disabled={checkLoading}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-xs transition shadow-lg hover:shadow-amber-500/25 disabled:opacity-50 whitespace-nowrap self-stretch md:self-auto justify-center"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${checkLoading ? 'animate-spin' : ''}`} />
            {checkLoading ? 'Verifying Connections...' : 'Test Connections'}
          </button>
        </div>
      </div>

      {/* Tri-Bridge Architecture Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Bridge 1: Google AI Studio */}
        <div className="rounded-2xl border border-sky-500/30 bg-slate-900/70 p-5 shadow-lg backdrop-blur-md relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-sky-500/10 rounded-full blur-2xl pointer-events-none" />
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-sky-400 flex items-center gap-1.5">
              <Server className="w-4 h-4" /> Google AI Studio
            </span>
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-sky-500"></span>
            </span>
          </div>
          <p className="text-xs text-slate-400 mb-2">Primary Cloud Run Compute &amp; Server Backend</p>
          <div className="bg-slate-950/80 rounded-xl p-2.5 border border-slate-800 text-[11px] font-mono text-slate-300 break-all mb-3 select-all">
            {AURA_CLOUDFLARE_CONFIG.aiStudioSharedUrl}
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <span>Container Port: 3000</span>
            <span className="text-emerald-400 font-medium">Auto-Scales</span>
          </div>
        </div>

        {/* Bridge 2: GitHub CI/CD */}
        <div className="rounded-2xl border border-purple-500/30 bg-slate-900/70 p-5 shadow-lg backdrop-blur-md relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/10 rounded-full blur-2xl pointer-events-none" />
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-purple-400 flex items-center gap-1.5">
              <GitBranch className="w-4 h-4" /> GitHub Actions
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-purple-500/20 text-purple-300 border border-purple-500/30">
              CI / CD
            </span>
          </div>
          <p className="text-xs text-slate-400 mb-2">Automated Build &amp; Cloudflare Pages Deployment</p>
          <div className="bg-slate-950/80 rounded-xl p-2.5 border border-slate-800 text-[11px] font-mono text-slate-300 break-all mb-3 select-all">
            .github/workflows/deploy.yml
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <span>Target: aura432hz</span>
            <span className="text-purple-300 font-medium">Node 22 / Vite</span>
          </div>
        </div>

        {/* Bridge 3: Cloudflare Edge */}
        <div className="rounded-2xl border border-amber-500/30 bg-slate-900/70 p-5 shadow-lg backdrop-blur-md relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
              <Globe className="w-4 h-4" /> Cloudflare Edge
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-amber-500/20 text-amber-300 border border-amber-500/30">
              Aura432Hz
            </span>
          </div>
          <p className="text-xs text-slate-400 mb-2">DNS, CDN Caching, DDoS Protection &amp; SSL</p>
          <div className="bg-slate-950/80 rounded-xl p-2.5 border border-slate-800 text-[11px] font-mono text-amber-300 break-all mb-3 select-all flex items-center justify-between">
            <span>{AURA_CLOUDFLARE_CONFIG.accountId}</span>
            <button
              onClick={() => copyToClipboard(AURA_CLOUDFLARE_CONFIG.accountId, 'account_id_card')}
              className="text-slate-400 hover:text-white transition ml-1"
              title="Copy Account ID"
            >
              {copiedKey === 'account_id_card' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <span>Domain: aura432hz.com</span>
            <span className="text-emerald-400 font-medium">Full (strict) SSL</span>
          </div>
        </div>
      </div>

      {/* Account ID Callout & Direct Copy Bar */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 shadow-lg">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Aura432Hz Account ID &amp; Target Domain
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Use this Account ID for Cloudflare API tokens, GitHub repository secrets, and CLI configuration.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
            <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-amber-300">
              <span className="text-slate-500 text-[10px] uppercase">Account ID:</span>
              <span className="font-bold">{AURA_CLOUDFLARE_CONFIG.accountId}</span>
              <button
                onClick={() => copyToClipboard(AURA_CLOUDFLARE_CONFIG.accountId, 'account_id_btn')}
                className="p-1 hover:bg-slate-800 rounded transition text-slate-400 hover:text-white"
                title="Copy Account ID"
              >
                {copiedKey === 'account_id_btn' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>

            <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-sky-300">
              <span className="text-slate-500 text-[10px] uppercase">Domain:</span>
              <span className="font-bold">{AURA_CLOUDFLARE_CONFIG.domain}</span>
              <button
                onClick={() => copyToClipboard(AURA_CLOUDFLARE_CONFIG.domain, 'domain_btn')}
                className="p-1 hover:bg-slate-800 rounded transition text-slate-400 hover:text-white"
                title="Copy Domain"
              >
                {copiedKey === 'domain_btn' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Cloudflare DNS Records Table */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/90 overflow-hidden shadow-xl">
        <div className="p-5 border-b border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <Network className="w-4 h-4 text-amber-400" />
              Required Cloudflare DNS Records (Aura432Hz Account)
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Add these DNS records in your Cloudflare dashboard under <span className="font-semibold text-slate-200">DNS &gt; Records</span> for <span className="text-amber-300 font-mono">aura432hz.com</span>.
            </p>
          </div>
          <a
            href="https://dash.cloudflare.com"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs transition border border-slate-700 whitespace-nowrap"
          >
            Open Cloudflare Dash <ExternalLink className="w-3 h-3" />
          </a>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Name</th>
                <th className="py-3 px-4">Target / Content</th>
                <th className="py-3 px-4">Proxy Status</th>
                <th className="py-3 px-4">Purpose</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {RECOMMENDED_DNS_RECORDS.map((rec, idx) => (
                <tr key={idx} className="hover:bg-slate-800/30 transition">
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded font-bold text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      {rec.type}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-200 font-bold">{rec.name}</td>
                  <td className="py-3 px-4 text-sky-300 max-w-xs truncate" title={rec.content}>
                    {rec.content}
                  </td>
                  <td className="py-3 px-4">
                    {rec.proxyStatus ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                        Proxied (Orange Cloud)
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] bg-slate-800 text-slate-400">
                        DNS only (Grey Cloud)
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 font-sans text-slate-400 text-[11px]">{rec.purpose}</td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => copyToClipboard(rec.content, `dns_${idx}`)}
                      className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] transition inline-flex items-center gap-1"
                    >
                      {copiedKey === `dns_${idx}` ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-400" /> Copied
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" /> Copy
                        </>
                      )}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Account Migration Checklist: Critical Steps */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 shadow-lg">
        <h3 className="text-sm font-semibold text-white flex items-center gap-2 mb-4">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          5-Point Transfer Checklist (Fixing Pending Verification &amp; 521 Errors)
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
            <div className="flex items-center gap-2 font-semibold text-amber-300">
              <span className="w-5 h-5 rounded-full bg-amber-500/20 flex items-center justify-center text-[11px]">1</span>
              Update Domain Registrar Nameservers
            </div>
            <p className="text-slate-300 leading-relaxed text-[11px]">
              When moving from <span className="font-mono text-slate-400">moreed.raouf@gmail.com</span> to <span className="font-mono text-amber-300">Aura432Hz</span>, Cloudflare generates two NEW nameservers. Update your domain registrar (e.g., Namecheap or GoDaddy) to these nameservers so the domain becomes active in the new account.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
            <div className="flex items-center gap-2 font-semibold text-emerald-300">
              <span className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center text-[11px]">2</span>
              Set SSL/TLS to Full (strict)
            </div>
            <p className="text-slate-300 leading-relaxed text-[11px]">
              In Cloudflare, go to <span className="font-semibold text-slate-200">SSL/TLS &gt; Overview</span> and ensure the encryption mode is set to <span className="font-semibold text-emerald-300">Full (strict)</span>. Never use Flexible, which triggers HTTP redirect loops with Google Cloud Run.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
            <div className="flex items-center gap-2 font-semibold text-purple-300">
              <span className="w-5 h-5 rounded-full bg-purple-500/20 flex items-center justify-center text-[11px]">3</span>
              Update GitHub Secrets
            </div>
            <p className="text-slate-300 leading-relaxed text-[11px]">
              In your GitHub repo under <span className="font-semibold text-slate-200">Settings &gt; Secrets and variables &gt; Actions</span>, set:
              <br />
              • <code className="text-purple-300">CLOUDFLARE_ACCOUNT_ID</code> = <code className="text-amber-300">{AURA_CLOUDFLARE_CONFIG.accountId}</code>
              <br />
              • <code className="text-purple-300">CLOUDFLARE_API_TOKEN</code> = API token with Cloudflare Pages permissions.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
            <div className="flex items-center gap-2 font-semibold text-sky-300">
              <span className="w-5 h-5 rounded-full bg-sky-500/20 flex items-center justify-center text-[11px]">4</span>
              Origin Host Header Rewrite (for CNAME Proxy)
            </div>
            <p className="text-slate-300 leading-relaxed text-[11px]">
              If proxying directly to Google Cloud Run via CNAME, navigate to Cloudflare <span className="font-semibold text-slate-200">Rules &gt; Origin Rules</span> and add:
              <br />
              • When Hostname equals <code className="text-amber-300">aura432hz.com</code>, override Host Header to <code className="text-sky-300">{AURA_CLOUDFLARE_CONFIG.aiStudioOriginHost}</code>.
            </p>
          </div>
        </div>
      </div>

      {/* Synchronized Configuration Files Viewer */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/90 overflow-hidden shadow-xl">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <FileCode className="w-4 h-4 text-sky-400" />
            <span className="text-xs font-semibold text-white">Production Configuration Codebase</span>
          </div>

          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setActiveConfigTab('wrangler')}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition ${
                activeConfigTab === 'wrangler' ? 'bg-amber-500 text-slate-950 font-semibold' : 'text-slate-400 hover:text-white'
              }`}
            >
              wrangler.toml
            </button>
            <button
              onClick={() => setActiveConfigTab('github')}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition ${
                activeConfigTab === 'github' ? 'bg-amber-500 text-slate-950 font-semibold' : 'text-slate-400 hover:text-white'
              }`}
            >
              deploy.yml
            </button>
            <button
              onClick={() => setActiveConfigTab('worker')}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition ${
                activeConfigTab === 'worker' ? 'bg-amber-500 text-slate-950 font-semibold' : 'text-slate-400 hover:text-white'
              }`}
            >
              worker.js
            </button>
            <button
              onClick={() => setActiveConfigTab('headers')}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition ${
                activeConfigTab === 'headers' ? 'bg-amber-500 text-slate-950 font-semibold' : 'text-slate-400 hover:text-white'
              }`}
            >
              _headers
            </button>
            <button
              onClick={() => setActiveConfigTab('redirects')}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition ${
                activeConfigTab === 'redirects' ? 'bg-amber-500 text-slate-950 font-semibold' : 'text-slate-400 hover:text-white'
              }`}
            >
              _redirects
            </button>
          </div>
        </div>

        <div className="p-4 bg-slate-950/90 font-mono text-[11px] text-slate-300 overflow-x-auto relative">
          <button
            onClick={() => copyToClipboard(configFiles[activeConfigTab], `code_${activeConfigTab}`)}
            className="absolute top-4 right-4 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs transition flex items-center gap-1.5 border border-slate-700 shadow-md"
          >
            {copiedKey === `code_${activeConfigTab}` ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" /> Copied
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" /> Copy File
              </>
            )}
          </button>
          <pre className="pr-24">{configFiles[activeConfigTab]}</pre>
        </div>
      </div>
    </div>
  );
};
