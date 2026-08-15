/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  reactStrictMode: false,
  // Writes the ISR prerender cache via a custom handler to a writable state
  // dir (NEXT_ISR_CACHE_DIR) instead of the read-only Nix store. See
  // cache-handlers/writable.js — keeps the cache across restarts & rebuilds.
  cacheHandler: './cache-handlers/writable.js',
  experimental: {
    scrollRestoration: true,
    isrFlushToDisk: true,
  },
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "mosaic.scdn.co",
        port: "",
        pathname: "/**",
      },
    ],
  },
};

module.exports = nextConfig;
