import * as Sentry from '@sentry/nextjs';

const SENTRY_DSN = process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN;

const SENTRY_ENVIRONMENT =
  process.env.VERCEL_ENV || process.env.NEXT_PUBLIC_VERCEL_ENV || 'development';

Sentry.init({
  dsn: SENTRY_DSN,
  environment: SENTRY_ENVIRONMENT,
  tracesSampleRate: 1.0,
});
