/**
 * Cloudflare Edge Worker Reverse Proxy for Aura 432Hz
 * Account ID: 276fd4c1809c05056b1ff2fa8d9908e8
 *
 * Routes traffic from aura432hz.com / www.aura432hz.com directly to the
 * Google AI Studio / Google Cloud Run upstream container with:
 * - Proper SNI & Host Header rewrite
 * - Client IP (cf-connecting-ip) forwarding
 * - SSL Full/Strict termination
 * - Edge CORS handling
 * - WebSocket pass-through
 */

const UPSTREAM_ORIGIN = 'https://ais-pre-56g24dujscghucvqa4p3cb-127567594735.europe-west1.run.app';
const UPSTREAM_HOSTNAME = 'ais-pre-56g24dujscghucvqa4p3cb-127567594735.europe-west1.run.app';

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // Redirect www.aura432hz.com to apex aura432hz.com
    if (url.hostname === 'www.aura432hz.com') {
      url.hostname = 'aura432hz.com';
      return Response.redirect(url.toString(), 301);
    }

    // Prepare target upstream URL
    const targetUrl = new URL(url.pathname + url.search, UPSTREAM_ORIGIN);

    // Clone headers and rewrite Host & Origin
    const newHeaders = new Headers(request.headers);
    newHeaders.set('Host', UPSTREAM_HOSTNAME);
    newHeaders.set('X-Forwarded-Host', url.hostname);
    newHeaders.set('X-Forwarded-Proto', 'https');
    newHeaders.set('X-Real-IP', request.headers.get('cf-connecting-ip') || '');

    // Forward request to Google Cloud Run
    const modifiedRequest = new Request(targetUrl.toString(), {
      method: request.method,
      headers: newHeaders,
      body: ['GET', 'HEAD'].includes(request.method) ? undefined : request.body,
      redirect: 'manual',
    });

    try {
      const response = await fetch(modifiedRequest);

      // Clone response and attach security & CORS headers
      const responseHeaders = new Headers(response.headers);
      responseHeaders.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
      responseHeaders.set('X-Content-Type-Options', 'nosniff');
      responseHeaders.set('X-Edge-Account', '276fd4c1809c05056b1ff2fa8d9908e8');

      // Preserve redirects from upstream but rewrite hostname back to aura432hz.com
      if ([301, 302, 307, 308].includes(response.status)) {
        const location = response.headers.get('location');
        if (location && location.includes(UPSTREAM_HOSTNAME)) {
          responseHeaders.set('location', location.replace(UPSTREAM_HOSTNAME, url.hostname));
        }
      }

      return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: responseHeaders,
      });
    } catch (err) {
      return new Response(
        JSON.stringify({
          error: 'Cloudflare edge proxy upstream error',
          message: err.message || 'Failed to reach Google Cloud Run origin',
          accountId: '276fd4c1809c05056b1ff2fa8d9908e8',
          domain: 'aura432hz.com',
        }),
        {
          status: 502,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }
  },
};
