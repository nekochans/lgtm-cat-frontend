import { withSentryConfig } from '@sentry/nextjs';

/** @type {import('next').NextConfig} */
const baseConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lgtm-images.lgtmeow.com',
      },
      {
        protocol: 'https',
        hostname: 'stg-lgtm-images.lgtmeow.com',
      },
    ],
  },
  swcMinify: true,
};

const sentryWebpackPluginOptions = {
  silent: true,
  authToken: process.env.SENTRY_AUTH_TOKEN,
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
};

const nextConfig = withSentryConfig(baseConfig, sentryWebpackPluginOptions);

export default nextConfig;
