import * as Sentry from '@sentry/nextjs';

export type HomeContentSection = 'products' | 'categories' | 'articles';

export type ApiFetchSentryContext = {
  /** Logical page or feature, e.g. `/`, `/products`, `sitemap` */
  route: string;
  /** Sub-area, e.g. `listing`, `product_detail` */
  section: string;
  extra?: Record<string, unknown>;
};

/** Reports failed API fetches when `@sentry/nextjs` is initialized (see `sentry.server.config.ts` / client init). */
export function captureApiFetchError(
  error: unknown,
  context: ApiFetchSentryContext,
): void {
  if (!Sentry.getClient()) return;

  Sentry.withScope((scope) => {
    scope.setTag('fetch_route', context.route);
    scope.setTag('fetch_section', context.section);
    scope.setContext('api_fetch', {
      route: context.route,
      section: context.section,
      source: 'api_client',
      ...context.extra,
    });
    Sentry.captureException(error);
  });
}

export function captureHomeContentFetchError(
  section: HomeContentSection,
  error: unknown,
): void {
  captureApiFetchError(error, {
    route: '/',
    section: `home_${section}`,
  });
}
