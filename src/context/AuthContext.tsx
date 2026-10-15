import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, AuthState } from '../types/auth';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isPendingApproval: boolean;
  error: string | null;
  login: (phone: string, password: string) => Promise<{ success: boolean; requiresApproval?: boolean; error?: string }>;
  register: (name: string, phone: string, password: string, adminSecret?: string) => Promise<{ success: boolean; requiresApproval?: boolean; error?: string }>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_KEY = 'ay_bey_token_v2';
const USER_KEY = 'ay_bey_user_v2';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(TOKEN_KEY));
  const [user, setUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem(USER_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const checkAuth = async () => {
    if (!token) {
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/auth/me', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        const data = await res.json();
        if (data.user) {
          setUser(data.user);
          localStorage.setItem(USER_KEY, JSON.stringify(data.user));
        }
      } else if (res.status === 401 || res.status === 403) {
        // If token invalid, remove
        logout();
      }
    } catch (e) {
      console.warn('Network issue checking auth, using offline cached user session:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, [token]);

  const login = async (phone: string, password: string) => {
    setError(null);
    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.status === 'pending' || data.error === 'pending_approval') {
          setUser(data.user || { id: 'pending', name: 'User', phone, role: 'user', status: 'pending', createdAt: Date.now() });
          return { success: false, requiresApproval: true, error: data.message };
        }
        setError(data.message || 'Login failed');
        return { success: false, error: data.message };
      }

      setToken(data.token);
      setUser(data.user);
      localStorage.setItem(TOKEN_KEY, data.token);
      localStorage.setItem(USER_KEY, JSON.stringify(data.user));
      return { success: true };
    } catch (e: any) {
      const msg = 'সার্ভারের সাথে সংযোগ স্থাপন করা যায়নি। ইন্টারনেট সংযোগ চেক করুন।';
      setError(msg);
      return { success: false, error: msg };
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (name: string, phone: string, password: string, adminSecret?: string) => {
    setError(null);
    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, phone, password, adminSecret }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || 'Registration failed');
        return { success: false, error: data.message };
      }

      setToken(data.token);
      setUser(data.user);
      localStorage.setItem(TOKEN_KEY, data.token);
      localStorage.setItem(USER_KEY, JSON.stringify(data.user));

      return {
        success: true,
        requiresApproval: data.requiresApproval,
      };
    } catch (e: any) {
      const msg = 'সার্ভারে সংযোগ ব্যর্থ হয়েছে।';
      setError(msg);
      return { success: false, error: msg };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    if (token) {
      fetch('/api/auth/logout', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      }).catch(() => {});
    }
    setToken(null);
    setUser(null);
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    // Clear user-specific financial cache from session
    localStorage.removeItem('ay_bey_transactions_v1');
  };

  const refreshUser = async () => {
    await checkAuth();
  };

  const clearError = () => setError(null);

  const isPendingApproval = Boolean(user && user.status === 'pending' && user.role !== 'admin');

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isPendingApproval,
        error,
        login,
        register,
        logout,
        refreshUser,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
