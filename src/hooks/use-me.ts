import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getMe } from "@/lib/neet/account.functions";
import { useSession } from "./use-session";

export const ME_KEY = ["me"] as const;

export function useMe() {
  const { user, ready } = useSession();
  const fetchMe = useServerFn(getMe);
  const q = useQuery({
    queryKey: [...ME_KEY, user?.id],
    queryFn: () => fetchMe(),
    enabled: ready && !!user,
    staleTime: 30_000,
    retry: 1,
  });
  return {
    user,
    ready,
    me: q.data?.data ?? null,
    error: q.data?.error ?? (q.error ? "Couldn't reach the server." : null),
    loading: q.isLoading,
    refetch: q.refetch,
  };
}
