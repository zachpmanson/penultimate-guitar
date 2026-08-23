// Empty on the primary (non-staging) build; "/staging" on the sub-route
// staging instance. Baked in at build time (see nix/package.nix), so no
// runtime divergence between the two deployments.
export const basePath = process.env.NEXT_BASE_PATH ?? "";