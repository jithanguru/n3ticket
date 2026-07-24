import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../supabase';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('ticketx_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState(() => localStorage.getItem('ticketx_token') || null);

  // Listen to Supabase Auth State Changes if Supabase is configured
  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) return;

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (session && session.user) {
        const sbUser = {
          id: session.user.id,
          name: session.user.user_metadata?.name || session.user.email.split('@')[0],
          email: session.user.email,
          phone: session.user.user_metadata?.phone || '',
          bio: session.user.user_metadata?.bio || '',
          trustScore: 100,
          verified: true,
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(session.user.email)}`
        };
        setUser(sbUser);
        setToken(session.access_token);
      }
    });

    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (user) {
      localStorage.setItem('ticketx_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('ticketx_user');
    }
  }, [user]);

  useEffect(() => {
    if (token) {
      localStorage.setItem('ticketx_token', token);
    } else {
      localStorage.removeItem('ticketx_token');
    }
  }, [token]);

  const loginWithBcrypt = async (email, password) => {
    // If Supabase is configured, attempt native Supabase Auth
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password
        });

        if (!error && data?.user) {
          const sbUser = {
            id: data.user.id,
            name: data.user.user_metadata?.name || email.split('@')[0],
            email: data.user.email,
            phone: data.user.user_metadata?.phone || '',
            trustScore: 100,
            verified: true,
            avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(email)}`
          };
          setUser(sbUser);
          setToken(data.session?.access_token || `sb_token_${Date.now()}`);
          return { success: true };
        }
      } catch (err) {
        console.warn("Supabase Auth sign-in notice, attempting Express REST fallback:", err.message);
      }
    }

    // Backend REST Auth fallback
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      
      if (!res.ok) {
        return { success: false, error: data.error || 'Invalid email or password' };
      }

      setUser(data.user);
      setToken(data.token);
      return { success: true, message: data.message };
    } catch (err) {
      return { success: false, error: 'Cannot connect to authentication server.' };
    }
  };

  const registerWithBcrypt = async (name, email, password, phone = '') => {
    // If Supabase is configured, attempt native Supabase Auth SignUp
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            data: { name: name.trim(), phone: phone.trim() }
          }
        });

        if (!error && data?.user) {
          const newUser = {
            id: data.user.id,
            name: name.trim(),
            email: email.trim().toLowerCase(),
            phone: phone.trim(),
            trustScore: 100,
            verified: true,
            avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name.trim())}`
          };

          // Also insert profile row into Supabase Postgres 'users' table
          try {
            await supabase.from('users').insert([
              { id: newUser.id, name: newUser.name, email: newUser.email, phone: newUser.phone, trust_score: 100 }
            ]);
          } catch {}

          setUser(newUser);
          setToken(data.session?.access_token || `sb_token_${Date.now()}`);
          return { success: true };
        } else if (error && error.message.includes('rate limit')) {
          console.warn("Supabase email rate limit reached, switching to instant DB registration fallback.");
        }
      } catch (err) {
        console.warn("Supabase SignUp notice:", err.message);
      }
    }

    // Instant Express & Postgres Sync Registration Fallback (Bypasses email rate limits)
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, phone })
      });
      const data = await res.json();

      if (!res.ok) {
        return { success: false, error: data.error || 'Registration failed' };
      }

      setUser(data.user);
      setToken(data.token);
      return { success: true, message: data.message };
    } catch (err) {
      // Local Instant User Fallback
      const newUser = {
        id: `u-${Date.now().toString().slice(-5)}`,
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        trustScore: 100,
        verified: true,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name.trim())}`
      };
      setUser(newUser);
      setToken(`mock_token_${Date.now()}`);
      return { success: true };
    }
  };

  const updateUserProfile = (updatedFields) => {
    setUser(prev => {
      const nextUser = { ...prev, ...updatedFields };
      localStorage.setItem('ticketx_user', JSON.stringify(nextUser));
      return nextUser;
    });
  };

  const logout = async () => {
    if (isSupabaseConfigured && supabase) {
      try { await supabase.auth.signOut(); } catch {}
    }
    setUser(null);
    setToken(null);
    localStorage.removeItem('ticketx_user');
    localStorage.removeItem('ticketx_token');
  };

  return (
    <AuthContext.Provider value={{
      user,
      token,
      loginWithBcrypt,
      registerWithBcrypt,
      updateUserProfile,
      logout
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
