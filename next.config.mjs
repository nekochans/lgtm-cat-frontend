/**
 * @type {import('next').NextConfig}
 */
const nextConfig = {
  images: {
    domains: ['lgtm-images.lgtmeow.com', 'stg-lgtm-images.lgtmeow.com'],
  },
  swcMinify: true,
};

export default nextConfig;
