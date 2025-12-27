import { useCallback, useMemo, useState } from "react";

type User = {
  id: number;
  openId: string;
  name: string | null;
  email: string | null;
  loginMethod: string | null;
  role: "user" | "admin";
  createdAt: Date;
  updatedAt: Date;
  lastSignedIn: Date;
} | null;

type UseAuthOptions = {
  redirectOnUnauthenticated?: boolean;
  redirectPath?: string;
};

// Static version of useAuth - no backend required
// For Vercel static deployment, authentication is handled client-side only
export function useAuth(_options?: UseAuthOptions) {
  const [isLoading] = useState(false);

  const logout = useCallback(async () => {
    // Clear any local storage
    localStorage.removeItem("manus-runtime-user-info");
    // Reload the page
    window.location.reload();
  }, []);

  const state = useMemo(() => {
    return {
      user: null as User,
      loading: isLoading,
      error: null as Error | null,
      isAuthenticated: false,
    };
  }, [isLoading]);

  return {
    ...state,
    refresh: () => {},
    logout,
  };
}
