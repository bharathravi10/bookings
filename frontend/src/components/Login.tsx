import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Toast from './Toast';

export default function Login(): JSX.Element {
  const { login, loading, error, isAuthenticated, clearError } = useAuth();
  const navigate = useNavigate();
  const isMounted = useRef(true);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Keep isMounted ref correct to avoid setState after unmount
  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  // Clear auth error when component mounts to avoid stale errors showing
  useEffect(() => {
    clearError();
  }, [clearError]); // run once on mount

  // If user is already authenticated, redirect to dashboard
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      e.stopPropagation();

      console.log('=== LOGIN FORM SUBMITTED ===');
      console.log('Email:', email);
      console.log('Password length:', password.length);

      // basic validation
      if (!email.trim() || !password) {
        console.warn('Validation failed: empty fields');
        setToast({ message: 'Please fill in all fields', type: 'error' });
        return;
      }

      try {
        console.log('=== CALLING LOGIN ===');
        await login(email.trim(), password);
        console.log('=== LOGIN SUCCESSFUL ===');

        // Navigate after successful login
        if (!isMounted.current) {
          console.warn('Component unmounted, skipping navigation');
          return;
        }
        console.log('=== NAVIGATING TO DASHBOARD ===');
        navigate('/dashboard', { replace: true });
      } catch (err: any) {
        console.error('=== LOGIN ERROR ===');
        console.error('Error:', err);
        console.error('Error message:', err?.message);
        
        if (!isMounted.current) {
          console.warn('Component unmounted, skipping error handling');
          return;
        }
        const msg = error || err?.message || 'Login failed. Please try again.';
        setToast({ message: msg, type: 'error' });
      }
    },
    [email, password, login, navigate, error]
  );

  const toggleShowPassword = useCallback(() => setShowPassword((s) => !s), []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to your account
          </h2>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit} noValidate>
          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <div className="text-sm text-red-800">{error}</div>
            </div>
          )}

          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email" className="sr-only">Email address</label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="Email address"
                value={email}
                onChange={(ev) => setEmail(ev.target.value)}
              />
            </div>

            <div className="relative">
              <label htmlFor="password" className="sr-only">Password</label>
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 pr-10 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="Password"
                value={password}
                onChange={(ev) => setPassword(ev.target.value)}
              />

              <button
                type="button"
                onClick={toggleShowPassword}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading || !email.trim() || !password}
              onClick={() => {
                console.log('=== BUTTON CLICKED ===');
                console.log('Button disabled?', loading || !email.trim() || !password);
                console.log('Loading:', loading);
                console.log('Email:', email);
                console.log('Password:', password ? '***' : '');
              }}
              className="group relative w-full flex justify-center py-2 px-4 text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </div>

          <div className="text-sm text-center text-gray-600">
            <p>Demo: admin@example.com / password123</p>
          </div>
        </form>
      </div>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
