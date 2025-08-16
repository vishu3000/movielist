import { useSession } from "next-auth/react";
import { useMemo } from "react";
import tmdbApi from "../services/tmdbApi";

export function useAuthenticatedTMDB() {
  const { data: session } = useSession();

  const authenticatedApi = useMemo(() => {
    if (session?.accessToken) {
      return new tmdbApi.constructor(session.accessToken);
    }
    return tmdbApi; // Fallback to unauthenticated API
  }, [session?.accessToken]);

  return {
    api: authenticatedApi,
    isAuthenticated: !!session?.accessToken,
    user: session?.user,
  };
}
