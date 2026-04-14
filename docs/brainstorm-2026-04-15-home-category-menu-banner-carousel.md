---
title: Brainstorm — Home category menu + banner carousel block
date: 2026-04-15
scope: apps/web landing page
status: proposed
---

## Problem statement

Add a new homepage block **directly below** `LandingHero` (`apps/web/src/app/page.tsx`) with 2 parts:

- **Category menu** (left)
- **Banner carousel** (right)

Goal: increase discoverability + drive conversion with fast “shop by category” + visually rich promo banners (Vietnamese heritage vibe, modern execution).

## Current context (from codebase)

- **Home structure**: `LandingHero` → `LandingStory` → testimonials → FAQ → featured products → videos → CTA.
- **Design tokens** already present: `--brand-cream`, `--brand-forest`, `--brand-gold` usage in `LandingHero`.
- **Data**:
  - `LANDING_CATEGORIES` exists in `apps/web/src/data/landing-page-content.ts`.
  - `LANDING_HERO_SLIDES` exists but currently has `imageSrc: null` (can be repurposed for carousel slides).
- **Assets** (banners): `apps/web/public/banner-web2.png`, `bannerweb4.jpg`, `bannerweb5-2048x785.jpg`, `tinhhoaphohien.com_-2048x788.webp`.
- **Note**: `.webp` preview failed in this environment, but it’s still usable in Next.js.

## Evaluated approaches

### Approach A — Minimal, fast, “just works” (recommended)

- **Category menu** uses `LANDING_CATEGORIES` (nav links).
- **Carousel** uses a small `slides` array (hardcoded in landing content or derived from `LANDING_HERO_SLIDES`) mapped to existing banner images in `/public`.
- **Client component** only for carousel; category menu stays server-friendly.

**Pros**

- Fastest delivery, low risk, minimal moving parts.
- No new backend/CMS dependency.
- Easy to tweak copy and ordering.

**Cons**

- Not editorial-friendly without code change (until later migration to CMS).

### Approach B — “Filter mode” menu (stateful) + carousel promotions

- Category menu selects a category in-place (without navigation), and updates a product grid/teaser section below.

**Pros**

- Strong UX on desktop (discoverable browsing).

**Cons**

- More scope: URL-state sync, data fetching, empty states, performance.
- Harder to keep simple; higher regression risk.

### Approach C — CMS-managed promo slots (future)

- Slides + category ordering come from backend/admin UI.

**Pros**

- Non-dev teams can update promotions.

**Cons**

- Requires more infrastructure/QA; YAGNI for “first block”.

## Recommended solution (A) — Spec (high level)

### Placement

- Insert **after** `LandingHero` and **before** `LandingStory`.

### Layout (desktop)

- **12-col grid**, gap ~24px, max width aligned with hero (`max-w-6xl` is already used).
- **Left**: category card `col-span-3` (≈ 280–320px).
- **Right**: carousel `col-span-9` (≈ 880–960px).
- Both share same height (~320–360px) for a clean “module” feel.

### Responsive behavior

- **Mobile**: stack **carousel first**, categories below as **horizontal chips** or “Danh mục” button opening a sheet.
- **Tablet**: keep 4/8 split or stack based on density.

### Carousel interactions (UX + a11y)

- Autoplay 6–8s; pause on hover + pause when focus is within controls.
- Arrows + dots; swipe on touch; keyboard left/right when focused.
- `prefers-reduced-motion`: disable autoplay; fade/instant transitions.
- Provide a Pause/Play control (small but present).

### Visual direction (heritage-modern)

- Stay consistent with existing tokens: cream background + forest text + gold accents.
- Add subtle lotus/heritage pattern at very low opacity in the **category header** or carousel overlay.
- Ensure text overlays use gradient scrim for contrast.

## Web Interface Guidelines quick check (existing files)

## apps/web/src/app/page.tsx

✓ pass

## apps/web/src/components/landing/landing-hero.tsx

apps/web/src/components/landing/landing-hero.tsx:28 - check heading wrap: keep headings hierarchical when adding the new block (new block title should be `h2` or lower, not another `h1`)
apps/web/src/components/landing/landing-hero.tsx:74 - `next/image` already has `alt`, `width`, `height` (good); ensure new carousel images do the same to avoid CLS

## Implementation considerations / risks

- **Asset sizes**: the large 2048px banners should be served efficiently; favor `next/image` with correct dimensions and responsive sizes.
- **Copy on banners**: some banners are text-heavy; overlay text should not compete—either rely on image text _or_ add minimal overlay.
- **Carousel a11y**: autoplay without pause is a common UX/a11y footgun; include pause.
- **Consistency**: keep the new block’s outer container aligned with hero (`max-w-6xl`, similar padding rhythm).

## Success metrics / validation

- **UX**: clear hierarchy; category list readable; carousel controls discoverable.
- **Performance**: no CLS from banner images; no heavy JS on initial load besides carousel.
- **A11y**: keyboard operable, focus visible, reduced-motion honored, controls labeled.

## Next steps

- Decide **menu semantics**: navigation links (recommended) vs in-place filters.
- Decide **mobile categories**: chips vs sheet/drawer.
- Pick final banner set + order (3–5 slides).

## Unresolved questions

- Should category items **navigate** to `/products?...` (current `LANDING_CATEGORIES` suggests yes) or **filter in-place**?
- Should the carousel banners be **clickable** (single CTA per slide) or purely informational?
