'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { createBrowserSupabaseClient } from '@/lib/supabase-client';
import { User as SupabaseUser } from '@supabase/supabase-js';

type User = {
  id: string;
  name: string;
  email: string;
  avatar?: string;
};

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  supabaseUser: SupabaseUser | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [supabaseUser, setSupabaseUser] = useState<SupabaseUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createBrowserSupabaseClient();

  // Initialize auth state on mount
  useEffect(() => {
    if (!supabase) {
      setIsLoading(false);
      return;
    }

    const initAuth = async () => {
      try {
        const { data: { user: authUser } } = await supabase.auth.getUser();
        
        if (authUser) {
          setSupabaseUser(authUser);
          // Fetch user profile from database
          const { data: profile } = await supabase
            .from('users')
            .select('*')
            .eq('id', authUser.id)
            .single();

          if (profile) {
            setUser({
              id: profile.id,
              name: profile.name,
              email: profile.email,
              avatar: profile.avatar,
            });
          } else {
            // Create default user profile
            setUser({
              id: authUser.id,
              name: authUser.user_metadata?.name || 'User',
              email: authUser.email || '',
            });
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          setSupabaseUser(session.user);
          try {
            const { data: profile, error } = await supabase
              .from('users')
              .select('*')
              .eq('id', session.user.id)
              .single();

            if (profile) {
              setUser({
                id: profile.id,
                name: profile.name,
                email: profile.email,
                avatar: profile.avatar,
              });
            } else {
              // Profile doesn't exist yet, create from session
              setUser({
                id: session.user.id,
                name: session.user.user_metadata?.name || 'User',
                email: session.user.email || '',
              });
            }
          } catch (err) {
            console.warn('Could not fetch user profile, using session data');
            setUser({
              id: session.user.id,
              name: session.user.user_metadata?.name || 'User',
              email: session.user.email || '',
            });
          }
        } else {
          setSupabaseUser(null);
          setUser(null);
        }
      }
    );

    return () => {
      subscription?.unsubscribe();
    };
  }, [supabase]);

  const login = async (email: string, password: string) => {
    if (!supabase) throw new Error('Supabase client not initialized');
    
    if (!email || !password) {
      throw new Error('Email and password are required');
    }

    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });
    
    if (error) {
      if (error.message.includes('Invalid login credentials')) {
        throw new Error('Invalid email or password. Please check and try again.');
      }
      if (error.message.includes('Email not confirmed')) {
        throw new Error('Please confirm your email before logging in.');
      }
      throw new Error(error.message || 'Login failed. Please try again.');
    }
  };

  const signup = async (email: string, password: string, name: string) => {
    if (!supabase) throw new Error('Supabase client not initialized');
    
    if (!email || !password || !name) {
      throw new Error('All fields are required');
    }

    const { data: { user: authUser }, error: signupError } = await supabase.auth.signUp({
      email: email.trim().toLowerCase(),
      password,
      options: {
        data: {
          name,
        },
        // Don't require email confirmation
        emailRedirectTo: undefined,
      },
    });

    if (signupError) {
      if (signupError.message.includes('already registered')) {
        throw new Error('This email is already registered. Please log in instead.');
      }
      throw new Error(signupError.message || 'Sign up failed. Please try again.');
    }

    if (authUser) {
      // Create user profile in database
      const { error: profileError } = await supabase.from('users').insert({
        id: authUser.id,
        email: email.trim().toLowerCase(),
        name,
        avatar: null,
        created_at: new Date().toISOString(),
      });

      if (profileError) {
        console.error('Profile creation error:', profileError);
        // Don't throw here - user is already created in auth, just missing profile
        // They can still log in
      }

      setSupabaseUser(authUser);
      setUser({
        id: authUser.id,
        name,
        email: email.trim().toLowerCase(),
      });
    }
  };

  const logout = async () => {
    if (!supabase) throw new Error('Supabase client not initialized');
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    setUser(null);
    setSupabaseUser(null);
  };

  const isAuthenticated = !!user;

  const value = {
    user,
    isAuthenticated,
    isLoading,
    login,
    signup,
    logout,
    supabaseUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}