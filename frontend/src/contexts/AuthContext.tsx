import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { User, LoginResponse } from '../types';
import { apiClient } from '../api/client';
import Cookies from 'js-cookie';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name?: string) => Promise<void>;
  logout: () => void;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_COOKIE_NAME = 'auth_token';
const USER_COOKIE_NAME = 'auth_user';
const COOKIE_OPTIONS = {
  expires: 7, // 7 days
  secure: process.env.NODE_ENV === 'production', // HTTPS only in production
  sameSite: 'strict' as const,
};

// Load auth from cookies on init
const loadAuthFromCookies = (): { token: string | null; user: User | null } => {
  const token = Cookies.get(TOKEN_COOKIE_NAME) || null;
  const userStr = Cookies.get(USER_COOKIE_NAME);
  let user: User | null = null;

  if (userStr) {
    try {
      user = JSON.parse(userStr);
    } catch {
      // Invalid JSON, clear cookies
      Cookies.remove(TOKEN_COOKIE_NAME);
      Cookies.remove(USER_COOKIE_NAME);
    }
  }

  return { token, user };
};

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load auth from cookies on mount
  useEffect(() => {
    const { token: storedToken, user: storedUser } = loadAuthFromCookies();
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(storedUser);
    }
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      console.log('=== AuthContext: Calling API login ===');
      const response: LoginResponse = await apiClient.login(email, password);
      console.log('=== AuthContext: Login response received ===');
      console.log('Token received:', response.token ? 'Yes (length: ' + response.token.length + ')' : 'No');
      console.log('User received:', response.user);
      
      // Store JWT token in cookie
      Cookies.set(TOKEN_COOKIE_NAME, response.token, COOKIE_OPTIONS);
      Cookies.set(USER_COOKIE_NAME, JSON.stringify(response.user), COOKIE_OPTIONS);
      
      // Verify cookies were set
      const tokenCookie = Cookies.get(TOKEN_COOKIE_NAME);
      const userCookie = Cookies.get(USER_COOKIE_NAME);
      console.log('=== AuthContext: Cookies set ===');
      console.log('Token cookie set:', tokenCookie ? 'Yes' : 'No');
      console.log('User cookie set:', userCookie ? 'Yes' : 'No');
      
      // Update state
      setToken(response.token);
      setUser(response.user);
      console.log('=== AuthContext: State updated ===');
      console.log('isAuthenticated:', !!response.token && !!response.user);
    } catch (err: any) {
      console.error('=== AuthContext: Login error ===');
      console.error('Error:', err);
      console.error('Error response:', err?.response);
      const errorMessage = err?.response?.data?.error || err?.message || 'Login failed';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const register = useCallback(async (email: string, password: string, name?: string) => {
    setLoading(true);
    setError(null);
    try {
      const response: LoginResponse = await apiClient.register(email, password, name);
      
      // Store in cookies
      Cookies.set(TOKEN_COOKIE_NAME, response.token, COOKIE_OPTIONS);
      Cookies.set(USER_COOKIE_NAME, JSON.stringify(response.user), COOKIE_OPTIONS);
      
      // Update state
      setToken(response.token);
      setUser(response.user);
    } catch (err: any) {
      const errorMessage = err?.response?.data?.error || err?.message || 'Registration failed';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    // Clear cookies
    Cookies.remove(TOKEN_COOKIE_NAME);
    Cookies.remove(USER_COOKIE_NAME);
    
    // Clear state
    setToken(null);
    setUser(null);
    setError(null);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const value: AuthContextType = {
    user,
    token,
    isAuthenticated: !!token && !!user,
    loading,
    error,
    login,
    register,
    logout,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

