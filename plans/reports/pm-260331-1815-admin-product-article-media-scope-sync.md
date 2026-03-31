# PM report — admin product/article/media scope sync (2026-03-31 18:15)

## Scope

Synced plan artifacts to clarified business intent: admin manages product/article content + media links; storefront product/article pages render configured data dynamically.

## Changes applied

| File | Change |
|------|--------|
| `plans/260329-2131-longnhan-ecommerce/phase-05-admin-panel.md` | Status set `in-progress`; added scope alignment; refined functional/non-functional requirements and todos for media URL binding + storefront reflection checks |
| `plans/260329-2131-longnhan-ecommerce/plan.md` | Updated continuity text + references; linked new brainstorm report; clarified ISR decision note for product/article freshness |
| `plans/reports/brainstorm-260331-1815-admin-product-article-media-dynamic-pages.md` | Added detailed solution options, recommendation, risks, success metrics |

## Delivery interpretation

- This request is **not** a landing CMS request.
- This request is **admin content operations** for product/article/media with dynamic user-page rendering.
- Existing API/storefront foundations are already in place; priority is completing admin surfaces + verification.

## Execution priority (next)

1. Products CRUD pages + media URL workflow in form.
2. Articles CRUD pages + rich text + featured image + SEO fields.
3. Media gallery/upload UX + copy URL action.
4. E2E checks: admin edit -> storefront product/article pages reflect data.
5. Decide if on-demand revalidation is required now.

## Risks

- If freshness requirement is immediate and ISR remains long for articles, team may treat stale updates as defects.
- If media URL binding UX is poor, editors will bypass workflow and data quality drops.

## Unresolved questions

1. Article freshness SLA: immediate vs ISR-window acceptable?
2. Need on-demand revalidation in this phase or next phase?
3. Need audit trail/version history for content edits now?
