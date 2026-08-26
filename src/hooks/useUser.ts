import { trpc } from "@/utils/trpc";

// Edge identity on the client: asks the server who Caddy authenticated for the
// current request (returns the basicauth username), or null for anonymous.
// Because HTTP Basic auth re-sends the credential on every request there is no
// session to invalidate — this reflects the live edge identity on each load.
export function useUser() {
  const q = trpc.auth.whoami.useQuery();
  return { user: q.data?.user ?? null, isLoading: q.isLoading };
}

export default useUser;