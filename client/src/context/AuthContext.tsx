import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User } from '../types';
import { authService } from '../services/api.service';
import { setAccessToken } from '../services/api';
import api from '../services/api';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string, role?: string) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const restoreSession = async () => {
      try {
        const stored = localStorage.getItem('user');
        if (!stored) {
          setIsLoading(false);
          return;
        }

        const parsed = JSON.parse(stored);

        // Try to refresh the access token using the HttpOnly cookie
        try {
          const { data } = await api.post('/auth/refresh');
          if (!cancelled && data.success) {
            setAccessToken(data.data.accessToken);
            setUser(parsed);
          } else if (!cancelled) {
            localStorage.removeItem('user');
          }
        } catch {
          if (!cancelled) {
            // No valid refresh cookie — clear stored user
            setAccessToken(null);
            setUser(null);
            localStorage.removeItem('user');
          }
        }
      } catch {
        localStorage.removeItem('user');
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    restoreSession();
    return () => { cancelled = true; };
  }, []);

  const login = async (email: string, password: string) => {
    const result = await authService.login(email, password);
    setAccessToken(result.accessToken);
    setUser(result.user);
    localStorage.setItem('user', JSON.stringify(result.user));
  };

  const register = async (email: string, password: string, name: string, role?: string) => {
    await authService.register(email, password, name, role);
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch {
      // Ignore errors on logout
    } finally {
      setAccessToken(null);
      setUser(null);
      localStorage.removeItem('user');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        register,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
