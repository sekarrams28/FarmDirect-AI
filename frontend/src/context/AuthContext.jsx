import React, { createContext, useContext, useEffect, useState } from 'react';
import { loginUser, registerUser } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('fd_user');
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch {
        localStorage.removeItem('fd_user');
      }
    }
    setLoading(false);
  }, []);

  async function login(phone, password) {
    const data = await loginUser({ phone, password });
    localStorage.setItem('fd_token', data.token);
    localStorage.setItem('fd_user', JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  }

  async function register(payload) {
    const data = await registerUser(payload);
    localStorage.setItem('fd_token', data.token);
    localStorage.setItem('fd_user', JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  }

  function logout() {
    localStorage.removeItem('fd_token');
    localStorage.removeItem('fd_user');
    setUser(null);
  }

  // Used after an in-place profile change (e.g. SMS notification
  // preference) that doesn't go through login/register.
  function updateUser(patch) {
    setUser((prev) => {
      const next = { ...prev, ...patch };
      localStorage.setItem('fd_user', JSON.stringify(next));
      return next;
    });
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, setUser: updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
