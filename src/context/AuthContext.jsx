import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const AuthContext = createContext(null);

const BACKEND_URL = ''; // Uses Vite proxy (or same-origin) to avoid hardcoding localhost

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  // Check current session from HttpOnly cookie
  const checkAuth = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/auth/me', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success && data.user) {
          setUser(data.user);
          setAuthError(null);
        } else {
          setUser(null);
        }
      } else {
        setUser(null);
      }
    } catch (err) {
      console.warn('[SpendWise Auth] Unable to contact auth service:', err.message);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Login action
  const login = async (email, password) => {
    setAuthError(null);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();

      if (!res.ok) {
        const message = data.message || 'Login failed. Please check your credentials.';
        setAuthError(message);
        throw new Error(message);
      }

      setUser(data.user);
      return data.user;
    } catch (err) {
      if (!authError) {
        setAuthError(err.message);
      }
      throw err;
    }
  };

  // Register action
  const register = async ({ fullName, email, password, confirmPassword }) => {
    setAuthError(null);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ fullName, email, password, confirmPassword })
      });

      const data = await res.json();

      if (!res.ok) {
        const message = data.message || 'Registration failed. Please check the provided information.';
        setAuthError(message);
        throw new Error(message);
      }

      setUser(data.user);
      return data.user;
    } catch (err) {
      if (!authError) {
        setAuthError(err.message);
      }
      throw err;
    }
  };

  // Logout action
  const logout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
      });
    } catch (err) {
      console.warn('[SpendWise Auth] Logout error:', err.message);
    } finally {
      setUser(null);
      setAuthError(null);
    }
  };

  const value = {
    user,
    isAuthenticated: Boolean(user),
    isLoading,
    authError,
    setAuthError,
    login,
    register,
    logout,
    checkAuth
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
