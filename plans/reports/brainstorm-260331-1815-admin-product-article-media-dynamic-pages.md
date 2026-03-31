# Brainstorm Report: Admin-managed Product/Article Content + Media-driven Dynamic Pages
**Date:** 2026-03-31 | **Session:** 18:15

## Problem statement

Need admin to manage product + article information, upload media to storage, bind media URLs into product/article fields, and let user-facing product/article pages render data + images dynamically from backend config.

## Requirements (agreed)

- Admin scope focused on `products`, `articles`, `media` modules.
- Admin can upload image assets and copy URL/link.
- Admin can configure which image URLs map to product/article fields.
- Storefront product + article pages must display configured content/images dynamically.
- No separate landing CMS scope in this request.

## Current state snapshot

- API already supports product image fields (`featuredImageUrl`, `images[]`) and article content/image/SEO fields (`contentHtml`, `featuredImageUrl`, `metaTitle`, `metaDescription`).
- API already has media upload/list/delete endpoints (Cloudinary-backed).
- Storefront product/article pages already fetch from API and render dynamic data.
- Biggest gap is admin CRUD surfaces for products/articles/media workflow completion + E2E verification.

## Approaches evaluated

### Option A — Keep current schema, finish admin CRUD + media URL wiring (**recommended**)
Pros:
- Fastest ship, lowest migration risk, aligns with existing DTO/entities and storefront render path.
- Minimal backend changes; mostly admin implementation + QA.
- KISS/YAGNI fit.
Cons:
- Article freshness currently bounded by ISR window (1h) unless revalidate strategy added.
- No dedicated content version history.

### Option B — Add generic CMS block schema now
Pros:
- Future flexibility for landing/marketing pages.
Cons:
- Over-engineering for current ask, higher complexity, slower delivery, higher regression risk.

### Option C — Add immediate on-demand revalidation now (plus Option A)
Pros:
- Near-real-time storefront reflection after admin save.
Cons:
- Extra integration work (secure revalidate endpoint/webhook path + API/auth guards), must be tested carefully.

## Final recommendation

Ship Option A first as MVP completion, then optionally add Option C if business needs immediate visibility after edits.

Practical delivery sequence:
1) Complete admin product/article/media pages + forms.
2) Add media URL picker/copy flow in forms.
3) Validate end-to-end “admin edit -> storefront render” for product/article pages.
4) Decide freshness policy: keep ISR windows or implement secure on-demand revalidate.

## Implementation considerations and risks

- Risk: broken URL binding between media and product/article fields -> mitigate with explicit form validation + preview before save.
- Risk: stale article page after update due to ISR 3600 -> mitigate with product owner decision on freshness SLA.
- Risk: auth token/cookie handling in admin data mutations -> mitigate with consistent `adminFetch` usage and 401 redirect handling.
- Risk: false completion claim if only API exists but admin screens missing -> mitigate by E2E checklist gate.

## Success metrics

- Admin can create/edit/delete product, including `featuredImageUrl` + gallery `images[]`.
- Admin can create/edit/delete article, including `contentHtml`, `featuredImageUrl`, and SEO fields.
- Admin can upload image, copy URL, and bind it from forms without manual database edits.
- Product/article pages render updated content and images from backend-configured values.
- End-to-end CRUD smoke test passes for products, articles, and media.

## Next steps

1. Update Phase 5 checklist to explicitly include media URL binding + storefront reflection verification.
2. Implement remaining admin CRUD pages/components.
3. Run E2E verification for product/article dynamic rendering.
4. Optional: implement secure on-demand revalidate if immediate publish is required.

## Unresolved questions

1. Is article freshness SLA immediate (<1 min) or acceptable at current ISR window (up to 1h)?
2. Need content version history/rollback now, or later phase?
3. Need role granularity beyond single admin role for content operations?
