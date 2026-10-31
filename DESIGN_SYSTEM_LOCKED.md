# DESIGN SYSTEM & UI ARCHITECTURE LOCK CONTRACT
**Status: PERMANENTLY LOCKED & FROZEN**
*Directive: Never modify, restyle, rearrange, rename, or delete the established theme, design, icons, layout, font, colors, sections, and tabs.*

---

## 1. Core Typography Standard
- **Primary Font Family**: `'Inter', sans-serif` (Self-hosted `/fonts/inter-variable.woff2`)
- **Body & Default**: `line-height: 1.6; letter-spacing: -0.011em;`
- **Headings (h1 - h6)**: `line-height: 1.25 !important; letter-spacing: -0.025em !important;`
- **Badges, Uppercase & Meta**: `letter-spacing: 0.05em; font-weight: 700;`
- **Numeric & Monospace**: `font-mono`, `tabular-nums`, `letter-spacing: 0;`

---

## 2. Color Palette & Surfaces
- **Midnight Navy (Base Canvas)**: `#081321` (Tailwind token: `bg-midnight`, CSS: `--sanctuary-navy`)
- **Surface Elevation (Cards & Panels)**: `#0c1b2e` (Secondary surface)
- **Border & Framing**: `#172c47` / `border-slate-800/80`
- **Primary Brand Interactive Accent**: `#48E1D0` (**Aurora Teal**, Tailwind: `text-aurora-teal`, `bg-aurora-teal`)
- **Secondary Harmonic Accent**: `#A99AFB` (**Cosmic Lavender**, Tailwind: `text-cosmic-lavender`, `bg-cosmic-lavender`)
- **Auxiliary Intentions & Functional Accents**:
  - Emerald Healing / Breath: `#10b981` / `#34d399`
  - Amber Warmth / Shop / Intentions: `#f59e0b` / `#fbbf24`
  - Rose Heart / Community: `#f43f5e` / `#fb7185`
  - Sky Celestial: `#38bdf8` / `#0284c7`
- **Default Theme**: **Dark Mode (Midnight Navy #081321)** is the primary unconditional default.
- **Light Theme (Kyoto Dawn)**: Clean, high-contrast alabaster (`#f6f8f7`) with deep ink black readability (`#0f172a`), crisp contrast buttons, and soft tinted cards.

---

## 3. Sanctuary Navigation & Tab Architecture
The 8 public tabs and 1 conditional admin tab are strictly defined in this order:

| Index | Tab ID | Label | Locked Icon | Semantic Color |
|---|---|---|---|---|
| 1 | `player` | **Sanctuary** | `Sparkles` | Aurora Teal (`#48E1D0`) |
| 2 | `mixer` | **Soundscapes** (Mobile: Mixer) | `Wind` | Aurora Teal (`#48E1D0`) |
| 3 | `breath` | **Breathwork** (Mobile: Breath) | `Wind` | Emerald (`#34d399`) |
| 4 | `musical` | **Sound Harp** (Mobile: Harp) | `Music` | Cosmic Lavender (`#A99AFB`) |
| 5 | `gear` | **Aura Shop** [Badge: Soon] | `Flame` | Amber Gold (`#fbbf24`) |
| 6 | `community` | **Community** | `Heart` | Rose (`#f43f5e`) |
| 7 | `blog` | **Science & Blog** (Mobile: Science) | `BookOpen` | Cosmic Lavender (`#A99AFB`) |
| 8 | `contact` | **Contact** | `Mail` | Sky / Slate |
| 9 | `admin` | **Studio** (Admin only) | `ShieldCheck` | Royal Indigo (`#6366f1`) |

### Responsive Tab Grid Rules:
- **Mobile Phones (< 768px)**: 4 columns across 2 balanced rows (`grid-cols-4`).
- **Landscape / Tablets / Desktop (≥ 768px)**: Single unified row (`md:grid-cols-8` or `md:grid-cols-9` with Studio).
- **Auto-Hide Behavior**: Smoothly hides on mobile scroll-down to maximize viewport; instantly re-emerges on scroll-up or top/bottom boundary.

---

## 4. Header Bar Actions
Strictly locked to the current ergonomic icon buttons:
1. **Brand Logo**: `FlatLogo` with active breathing animation during playback.
2. **Sanctuary Search**: `Search` icon with `⌘K` keyboard shortcut pill.
3. **Zen Mode**: `Sparkles` with `Maximize2` (Distraction-free ambient canvas).
4. **Sleep Timer**: `Timer` with live countdown badge and smart fadeout.
5. **Theme Switcher**: `Moon` (Night) / `Sun` (Day) toggle button.
6. **Tools Dropdown**: `MoreHorizontal` menu (Offline WAV Export, Safe Hz Certificate, Share, EULA, Newsletter).
7. **User Authentication**: 1-Click Login button (`LogIn`) or User Profile Avatar pill with role indicator.

---

## 5. Main Section Hierarchy (Home / Sanctuary Player)
1. **Top Ambient Glow & Announcement Broadcast Bar** (Live CMS broadcast banner).
2. **Sticky Header** + **Sticky Sanctuary Tab Navigation Bar**.
3. **Visualizer Hero Section**:
   - Central Interactive `AudioVisualizer` with sacred geometry / frequency wave nodes.
   - Solfeggio Frequency Selector (174Hz, 285Hz, 396Hz, 417Hz, 432Hz, 528Hz, 639Hz, 741Hz, 852Hz, 963Hz).
   - Brainwave Entrainment Selector (Delta Sleep, Theta Meditation, Alpha Healing, Alpha Flow, Pure 432Hz).
   - Master Play/Pause Controller with instant zero-lag tactile feedback and 5-second gentle fade.
   - Master Volume Slider & Volume Normalization toggle.
4. **1-Tap Mindful Intentions**:
   - Deep Sleep (Delta + 432Hz)
   - Mindful Calm (Alpha + 432Hz)
   - Meditation (Theta + 528Hz)
   - Focus & Flow (Alpha + 741Hz)
   - Pure 432Hz (Pythagorean harmonic)
5. **Featured Soundscapes & Preset Cards**:
   - Quick 1-tap playback, heart favorites, duplicate as custom preset, and instant WAV export.
6. **Nature Mixer Section**:
   - Multi-track acoustic nature layers (Mountain Rain, Forest Birds, Ocean Surf, Night Crickets, Campfire, Tibetan Singing Bowls, Koshi Chimes, Waterfall, Deep Cello Drone, Brown Noise).
   - Volume sliders, active breathing pulse animations, and master reset.
7. **Persistent Floating Bottom Player Bar**:
   - Appears across all non-home tabs and on home tab once scrolled past visualizer.
   - Quick Play/Pause, frequency badge, mode selector, volume control, and active soundscape indicators.
8. **Sanctuary Footer**:
   - Brand manifesto, Sacred Social links, AdSense safe banner, Trust & Legal navigation, EULA, and Safe Hz Verified acoustic guarantee.

---

## 6. Strict Development Guardrail
Any future code updates, new features, or optimizations must **NOT** alter the above specifications. All additions must slot neatly into the locked layout, adhere to the locked palette, and use the established typography and iconography.
