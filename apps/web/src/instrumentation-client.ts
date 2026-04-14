// This file configures the initialization of Sentry on the client.
// The added config here will be used whenever a users loads a page in their browser.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from '@sentry/nextjs';

const sentryEnabled = process.env.NODE_ENV === 'production';

if (sentryEnabled) {
  Sentry.init({
    dsn: 'https://8c629f132d5440996d73a0916be9b459@o4511212450152448.ingest.us.sentry.io/4511212452184064',
    // Enable logs to be sent to Sentry
    enableLogs: true,

    // Enable sending user PII (Personally Identifiable Information)
    // https://docs.sentry.io/platforms/javascript/guides/nextjs/configuration/options/#sendDefaultPii
    sendDefaultPii: true,
  });
}

export const onRouterTransitionStart: typeof Sentry.captureRouterTransitionStart =
  (...args) => {
    if (!sentryEnabled) return;
    return Sentry.captureRouterTransitionStart(...args);
  };
