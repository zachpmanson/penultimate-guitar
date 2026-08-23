// Empty on the primary (non-staging) build; "/staging" on the sub-route
// staging instance. Uses the NEXT_PUBLIC_ prefix so it is inlined into client
// code at build time (the browser has no host env), matching how the same var
// is baked into next.config.js as basePath. See nix/package.nix.
export const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";