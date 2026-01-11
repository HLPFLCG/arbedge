/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@arbedge/shared', '@arbedge/core', '@arbedge/database'],
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
  images: {
    domains: ['avatars.githubusercontent.com', 'lh3.googleusercontent.com'],
    // Use unoptimized images for Cloudflare Pages (or use Cloudflare Images)
    unoptimized: true,
  },
  // Required for Cloudflare Pages
  output: 'standalone',
};

export default nextConfig;
