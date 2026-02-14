/**
 * Authentication context — stores current user and token.
 */

import React, { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import type { AuthUser } from '../types';
import * as api from './api';

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthState | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => {
    const stored = localStorage.getItem('npc_user');
    return stored ? JSON.parse(stored) : null;
  });
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('npc_token'));

  const handleLogin = useCallback(async (email: string, password: string) => {
    const result = await api.login(email, password);
    if (result.success && result.data) {
      setUser(result.data.user);
      setToken(result.data.token);
      localStorage.setItem('npc_user', JSON.stringify(result.data.user));
      localStorage.setItem('npc_token', result.data.token);
    } else {
      throw new Error(result.error || 'Login failed');
    }
  }, []);

  const handleRegister = useCallback(async (email: string, password: string, name: string) => {
    const result = await api.register(email, password, name);
    if (result.success && result.data) {
      setUser(result.data.user);
      setToken(result.data.token);
      localStorage.setItem('npc_user', JSON.stringify(result.data.user));
      localStorage.setItem('npc_token', result.data.token);
    } else {
      throw new Error(result.error || 'Registration failed');
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('npc_user');
    localStorage.removeItem('npc_token');
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, login: handleLogin, register: handleRegister, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
