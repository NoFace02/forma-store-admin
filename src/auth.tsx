import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { type Session } from '@supabase/supabase-js';
import { supabase } from './supabase';
export { configured, supabase } from './supabase';
const AuthContext = createContext<{session: Session | null; loading: boolean; error: string | null}>({ session: null, loading: true, error: null });
export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(Boolean(supabase));
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    if (!supabase) return;
    let active = true;
    let receivedAuthEvent = false;
    supabase.auth.getSession().then(({ data, error }) => { if (active && !receivedAuthEvent) { setSession(data.session); setError(error?.message ?? null); setLoading(false); } }).catch(() => { if (active && !receivedAuthEvent) { setError('Unable to restore your session. Reload to try again.'); setLoading(false); } });
    const { data } = supabase.auth.onAuthStateChange((_event, next) => {
      if (!active) return;
      receivedAuthEvent = true;
      setSession(next);
      setError(null);
      setLoading(false);
    });
    return () => { active = false; data.subscription.unsubscribe(); };
  }, []);
  return <AuthContext.Provider value={{session, loading, error}}>{children}</AuthContext.Provider>;
}
export const useAuth = () => useContext(AuthContext);
