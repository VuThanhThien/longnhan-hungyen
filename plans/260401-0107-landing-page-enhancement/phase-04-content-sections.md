# Phase 04 — Content Sections

**Status:** Completed | **Priority:** P2 | **Effort:** 2h

> ✅ Already done: structured-data.ts fully built, JSON-LD on product/article pages wired.

## Context Links
- Plan: [plan.md](./plan.md)
- Landing page: `apps/web/src/app/page.tsx`
- Landing components: `apps/web/src/components/landing/`
- Content data: `apps/web/src/data/landing-page-content.ts`
- Articles API: same pattern as `getHomeProducts` in `page.tsx`

## Overview

Add articles preview section and origin geographic badge to landing page. Both are content-only additions with no layout changes to existing sections.

## Requirements

### Functional
- [ ] Articles preview on landing — latest 3 articles, server-fetched, graceful empty fallback
- [ ] Product origin badge — geographic identity element ("Hưng Yên · Phố Hiến") in hero or story section

### Non-Functional
- Articles fetch fails silently (returns `[]`) — no error shown to user
- Origin badge is pure CSS/inline SVG — no image dependency
- Both components under 60 LOC each

## Architecture

```
apps/web/src/
  components/
    landing/
      landing-articles-preview.tsx   ← NEW
      landing-origin-badge.tsx       ← NEW
  app/
    page.tsx                         ← MODIFY (fetch + insert both components)
```

## Related Code Files

- **CREATE** `apps/web/src/components/landing/landing-articles-preview.tsx`
- **CREATE** `apps/web/src/components/landing/landing-origin-badge.tsx`
- **MODIFY** `apps/web/src/app/page.tsx`

## Implementation Steps

1. **Create `landing-articles-preview.tsx`** (server component, receives articles as prop)
   - Props: `articles: Article[]`
   - Cards: thumbnail + title + date + "Đọc thêm →" link
   - Layout: `grid grid-cols-1 sm:grid-cols-3 gap-6`
   - Fallback: `if (articles.length === 0) return null`

2. **Add fetch in `page.tsx`**
   ```ts
   async function getLatestArticles(): Promise<Article[]> {
     try {
       const res = await fetchPaginated<Article>('/articles', { limit: 3 })
       return res.data
     } catch { return [] }
   }
   ```
   - Call in `Home()` alongside `getHomeProducts()`
   - Insert `<LandingArticlesPreview articles={articles} />` after `<LandingFaq />`

3. **Create `landing-origin-badge.tsx`**
   - Map pin SVG icon + "Hưng Yên · Phố Hiến" text
   - Style: pill badge, `bg-(--brand-gold)/15 text-(--brand-forest) border border-(--brand-gold)/40`
   - Place inside `LandingHero` or `LandingStory` — pass as prop or import directly

4. **Wire origin badge** — add to `LandingHero` below tagline or inside `LandingStory` section intro

## Todo List

- [ ] Create `landing-articles-preview.tsx`
- [ ] Add `getLatestArticles()` to `page.tsx`
- [ ] Insert `<LandingArticlesPreview>` in `page.tsx`
- [ ] Create `landing-origin-badge.tsx`
- [ ] Place origin badge in hero or story section

## Success Criteria

- Up to 3 article cards visible on landing (zero-state: section not rendered)
- Origin badge visible in hero or story section

## Risk Assessment

- **Articles API empty** — component returns null; no layout impact
- **Article type** — import `Article` from `@longnhan/types`; check field names match API response

## Next Steps

→ Phase 05 (Product Page Enhancement) and Phase 06 (Home Page Enhancement) run in parallel
