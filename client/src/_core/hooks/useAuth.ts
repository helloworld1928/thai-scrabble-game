import { supabase } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";
import { useCallback, useEffect, useState } from "react";

type UseAuthOptions = {
  redirectOnUnauthenticated?: boolean;
  redirectPath?: string;
};

export function useAuth(options?: UseAuthOptions) {
  const { redirectOnUnauthenticated = false, redirectPath = "/login" } = options ?? {};
  
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Initialize auth state
  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        setError(error);
      }
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Logout function
  const logout = useCallback(async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setUser(null);
    } catch (err) {
      setError(err as Error);
      console.error('Logout error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Refresh function
  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) throw error;
      setUser(session?.user ?? null);
    } catch (err) {
      setError(err as Error);
      console.error('Refresh error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Redirect if unauthenticated
  useEffect(() => {
    if (!redirectOnUnauthenticated) return;
    if (loading) return;
    if (user) return;
    if (typeof window === "undefined") return;
    if (window.location.pathname === redirectPath) return;

    window.location.href = redirectPath;
  }, [redirectOnUnauthenticated, redirectPath, loading, user]);

  return {
    user: user ? {
      id: user.id,
      openId: user.id,
      name: user.user_metadata?.name || user.email?.split('@')[0] || 'Anonymous',
      email: user.email || null,
      role: 'user' as const,
    } : null,
    loading,
    error,
    isAuthenticated: !!user,
    refresh,
    logout,
  };
}
