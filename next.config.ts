// 絶対厳守：編集前に必ずAI実装ルールを読む
import { withSentryConfig } from "@sentry/nextjs";
import type { NextConfig } from "next";

const baseConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lgtm-images.lgtmeow.com",
      },
      {
        protocol: "https",
        hostname: "stg-lgtm-images.lgtmeow.com",
      },
    ],
  },
  reactCompiler: true,
};

const sentryWebpackPluginOptions = {
  silent: !process.env.CI,
  authToken: process.env.SENTRY_AUTH_TOKEN,
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  widenClientFileUpload: true,
  hideSourceMaps: true,
  disableLogger: true,
  automaticVercelMonitors: true,
};

const nextConfig = withSentryConfig(baseConfig, sentryWebpackPluginOptions);

export default nextConfig;
