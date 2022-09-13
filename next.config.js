const { withSentryConfig } = require('@sentry/nextjs');

/** @type {import('next').NextConfig} */
const moduleExports = {
  reactStrictMode: true,
  images: {
    domains: ['lgtm-images.lgtmeow.com', 'stg-lgtm-images.lgtmeow.com'],
  },
  compiler: {
    styledComponents: true,
  },
  i18n: {
    locales: ['ja', 'en'],
    defaultLocale: 'ja',
    localeDetection: false,
  },
};

const sentryWebpackPluginOptions = {
  silent: true,
  authToken: process.env.SENTRY_AUTH_TOKEN,
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
};

module.exports = withSentryConfig(moduleExports, sentryWebpackPluginOptions);
