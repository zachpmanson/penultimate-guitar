'use strict';
/**
 * Custom Next.js incremental cache handler that relocates the ISR prerender
 * cache out of the read-only Nix store to an env-configurable writable dir.
 *
 * Next bundles the prerender cache path from `serverDistDir` (i.e. `.next/server`)
 * at build time, which points into the immutable `/nix/store`. Reusing Next's
 * own on-disk FileSystemCache but overriding the base `serverDistDir` lets us
 * keep the exact cache format while writing to a persistent state directory.
 *
 * Set NEXT_ISR_CACHE_DIR to the writable root (e.g. /var/lib/penultimate-guitar).
 * Falls back to Next's default behaviour when the env var is unset.
 */
const path = require('path');

let FileSystemCache;
try {
  FileSystemCache = require(
    'next/dist/server/lib/incremental-cache/file-system-cache'
  ).default;
} catch (e) {
  FileSystemCache = require(
    'next/dist/server/lib/incremental-cache/file-system-cache.js'
  ).default;
}

class WritableFileSystemCache extends FileSystemCache {
  constructor(ctx) {
    const base = process.env.NEXT_ISR_CACHE_DIR;
    if (base) {
      ctx = { ...ctx, serverDistDir: path.join(base, 'server') };
    }
    super(ctx);
  }
}

module.exports = WritableFileSystemCache;
