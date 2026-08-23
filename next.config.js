/** @type {import('next').NextConfig} */
let nextConfig = {
  output: 'standalone',
  reactStrictMode: false,
  // Empty on the primary build; '/staging' on the sub-route staging instance
  // (see nix/package.nix — NEXT_BASE_PATH is baked in at build time). Next
  // then mounts every route and asset under that prefix.
  ...(process.env.NEXT_BASE_PATH ? { basePath: process.env.NEXT_BASE_PATH } : {}),
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
