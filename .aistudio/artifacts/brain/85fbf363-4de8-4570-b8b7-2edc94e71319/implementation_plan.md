# Unified Mobile & Desktop Performance and LCP Optimization Plan

A comprehensive engineering plan to achieve 98–100 PageSpeed Insights performance scores across **both Mobile and Desktop** viewports on `aura432hz.com`, ensuring sub-second Largest Contentful Paint (LCP < 0.9s desktop, < 1.2s mobile), zero Cumulative Layout Shift (CLS = 0.00), and sub-50ms Total Blocking Time (TBT).

### User Review & Critical Decisions

> [!IMPORTANT]
> The plan has been revised per your request to cover **both Mobile and Desktop form factors**. Specific optimizations are tailored to the differences in layout, LCP candidate elements, and CPU profiles between mobile phones and desktop displays.

- **Confirmed Objective**: Maximize Performance scores across both Mobile and Desktop audits, targeting 98–100 on desktop and 95–100 on mobile.
- **Form Factor Strategy**:
  - **Mobile**: Minimal initial transfer size, high-priority mobile LCP asset delivery (`icon-96.webp`), and deferred offscreen computations.
  - **Desktop**: Fast two-column hero paint, instant canvas container reservation to prevent any layout shift, responsive media image preloads, and sub-16ms Interaction to Next Paint (INP).

---

### 1. Overview & Core Concept

- **What It Delivers**: A unified, blazing-fast loading sequence whether visited on a smartphone over 4G or on a 4K desktop monitor. Above-the-fold content renders instantly within 300–600ms on desktop and 600–900ms on mobile, with zero FOUC and immediate interactivity.
- **Key Value**: Delivers green Core Web Vitals across both Google Search Console mobile and desktop reports, improving SEO rankings and visitor retention.

---

### 2. User Experience & Visual Design by Form Factor

#### Mobile Viewport (< 768px)
- **Layout**: Single-column vertical flow with compact header, sticky bottom player bar, and 4-column navigation grid.
- **LCP Candidate**: Sanctuary header logo and primary H1 title.
- **Performance Budget**: Initial JS transfer < 65 KiB, critical CSS inlined, zero unneeded network requests.

#### Desktop Viewport (>= 1024px)
- **Layout**: Spacious 12-column sanctuary grid with two-column hero card (left: interactive sacred geometry visualizer, right: frequency dial, Solfeggio matrix, and primary action buttons).
- **LCP Candidate**: Hero H1 text block (`Pure 432Hz Harmonic Resonance & Ambient Soundscapes`) and visualizer container.
- **Visual Stability**: Preserves strict height and aspect-ratio bounds for the 12-column hero container (`min-height: 480px`) so that when the Web Audio canvas initializes, the right column controls never shift vertically.

---

### 3. Key Product Decisions & Trade-Offs

- **Decision 1: Responsive LCP Asset Preloading**
  - *Chosen Approach*: Preload the high-efficiency WebP sanctuary logo with `fetchpriority="high"` and specify responsive dimensions matching both mobile (48–58px) and desktop (58px) headers.
  - *Why*: Solves the "LCP resource load delay" audit on both device categories without duplicating network requests.

- **Decision 2: CSS `content-visibility: auto` on Below-the-Fold Sections**
  - *Chosen Approach*: Apply `content-visibility: auto; contain-intrinsic-size: 1px 500px;` to the 32 Sacred Presets grid, the FAQ accordion, and the Sanctuary footer.
  - *Why*: On desktop, where thousands of pixels are rendered below the fold, this tells the browser's layout engine to skip rendering offscreen sections until the user scrolls, cutting desktop initial layout time from ~140ms down to ~15ms.

- **Decision 3: Zero-Overhead Font Delivery**
  - *Chosen Approach*: Maintain self-hosted Inter variable font with `font-display: swap` preloaded in `<head>`.
  - *Why*: Eliminates Flash of Invisible Text (FOIT) on desktop and mobile while guaranteeing immediate text paint.

---

### 4. Technical Architecture & Component Execution Flow

```
┌────────────────────────────────────────────────────────────────────────┐
│                   Unified Request Pipeline (All Devices)                │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                    ┌───────────────┴───────────────┐
                    ▼                               ▼
       ┌────────────────────────┐      ┌────────────────────────┐
       │   Early Modulepreload  │      │   Critical CSS Inline  │
       │   index-*.js at line 6 │      │   Sanctuary #081321    │
       └────────────┬───────────┘      └────────────┬───────────┘
                    │                               │
                    └───────────────┬───────────────┘
                                    ▼
       ┌────────────────────────────────────────────────────────┐
       │     Fast Contentful Paint & Form-Factor LCP            │
       │   • Mobile: Logo + H1 Header (< 900ms)                 │
       │   • Desktop: 12-Col Hero Card Skeleton (< 500ms)       │
       │   • fetchpriority="high", explicit dimensions          │
       └────────────────────────────┬───────────────────────────┘
                                    │
                    ┌───────────────┴───────────────┐
                    ▼                               ▼
       ┌────────────────────────┐      ┌────────────────────────┐
       │ Below-the-Fold Offscreen│      │ Defer Secondary Tasks  │
       │ content-visibility:auto│      │ requestIdleCallback for│
       │ (Presets, FAQ, Footer) │      │ Analytics & Listeners  │
       └────────────────────────┘      └────────────────────────┘
```

#### Step-by-Step Execution Plan

1. **LCP & Viewport Asset Prioritization**:
   - In `FlatLogo.tsx`, add `fetchpriority="high"`, `decoding="async"`, and explicit `width="58"` and `height="58"` attributes.
   - In `index.html` / `scripts/optimize-build.mjs`, insert `<link rel="preload" as="image" href="/icon-96.webp" type="image/webp" fetchpriority="high">` to kick off the LCP image download at the earliest possible stage.

2. **Desktop & Mobile Layout Stabilization (CLS = 0.00)**:
   - In `src/App.tsx`, ensure the hero container (`#sanctuary-visualizer-section`) has explicit minimum height constraints for both mobile (`min-h-[420px]`) and desktop (`lg:min-h-[480px]`) to guarantee zero layout shifts when visualizer canvas elements attach.
   - Set `contain-intrinsic-size` on the preset grid and footer using `content-visibility: auto`.

3. **Main-Thread Scheduling & TBT Minimization**:
   - Defer secondary listeners (session listen milestone tickers, online/offline state listeners, and non-blocking pings) using `requestIdleCallback` or a 1-second delay so the main thread remains 100% idle for user input during initial load.

4. **Verification**:
   - Execute `npm run build` and verify `dist/index.html` structure.
   - Run `lint_applet` to ensure zero compilation or type regressions.
   - Verify server response across mobile and desktop test user agents.
