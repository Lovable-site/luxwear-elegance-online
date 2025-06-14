import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

type UserRole = Database['public']['Enums']['user_role'];

interface AuthContextType {
  user: User | null;
  session: Session | null;
  userRole: UserRole | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  refreshUserRole: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);

  /**
   * Fetches the user's role from the 'profiles' table by user ID.
   * Sets the role (or 'customer' fallback) and outputs detailed logs.
   */
  const fetchUserRole = async (userId: string) => {
    try {
      console.info('[Auth] Fetching user role for:', userId);
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('role, email')
        .eq('id', userId)
        .maybeSingle();

      if (error || !profile?.role) {
        console.error('[Auth] Error or empty role in user profile:', error, profile);
        setUserRole('customer');
        return;
      }

      console.log('[Auth] User profile fetched, role:', profile.role);
      setUserRole(profile.role);
    } catch (error) {
      console.error('[Auth] Exception in fetchUserRole:', error);
      setUserRole('customer');
    }
  };

  /**
   * Triggers refetching of the user's role, if the user is available.
   */
  const refreshUserRole = async () => {
    if (user?.id) await fetchUserRole(user.id);
  };

  useEffect(() => {
    console.info('[AuthProvider] Setting up auth state listener');

    // Set up onAuthStateChange FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.info('[AuthProvider] Auth state changed:', event, session?.user?.email || '-');
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user) {
          // Avoid deadlock, defer call to fetchUserRole
          setTimeout(() => fetchUserRole(session.user.id), 0);
        } else {
          setUserRole(null);
          setLoading(false);
        }
      }
    );

    // THEN check initial session
    const getInitialSession = async () => {
      try {
        console.info('[AuthProvider] Getting initial session');
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          console.error('[AuthProvider] Error getting session:', error);
          setLoading(false);
          return;
        }
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user) await fetchUserRole(session.user.id);
        setLoading(false);
      } catch (error) {
        console.error('[AuthProvider] Error initializing session:', error);
        setLoading(false);
      }
    };
    getInitialSession();

    return () => {
      console.info('[AuthProvider] Cleaning up auth subscription');
      subscription.unsubscribe();
    };
  }, []);

  /**
   * Signs user in, then refreshes their role.
   */
  const signIn = async (email: string, password: string) => {
    console.info('[AuthProvider] Signing in user:', email);
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (!error && data.user) {
      setTimeout(() => fetchUserRole(data.user.id), 250); // Immediate refresh post-login
    }
    return { error };
  };

  /**
   * Signs up new user, passing their full name to Supabase, with redirect.
   */
  const signUp = async (email: string, password: string, fullName: string) => {
    const redirectUrl = `${window.location.origin}/`;
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: { full_name: fullName },
      }
    });
    return { error };
  };

  /**
   * Signs out user and clears their role.
   */
  const signOut = async () => {
    console.info('[AuthProvider] Signing out user');
    await supabase.auth.signOut();
    setUserRole(null);
    setUser(null);
    setSession(null);
  };

  const value = {
    user,
    session,
    userRole,
    loading,
    signIn,
    signUp,
    signOut,
    refreshUserRole,
  };

  console.log('[AuthProvider] Auth context state:', { user: user?.email, userRole, loading });

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
