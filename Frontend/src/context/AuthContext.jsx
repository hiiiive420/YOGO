/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useMemo, useState } from 'react';
import { loginAdmin } from '../api/adminAuth';

const AuthContext = createContext(null);

function readStoredAdmin() {
  const rawAdmin = window.localStorage.getItem('yogo.admin.user');

  if (!rawAdmin) return null;

  try {
    return JSON.parse(rawAdmin);
  } catch (error) {
    window.localStorage.removeItem('yogo.admin.user');
    return null;
  }
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() =>
    window.localStorage.getItem('yogo.admin.token'),
  );
  const [admin, setAdmin] = useState(readStoredAdmin);

  async function login(credentials) {
    const payload = await loginAdmin(credentials);

    window.localStorage.setItem('yogo.admin.token', payload.token);
    window.localStorage.setItem('yogo.admin.user', JSON.stringify(payload.data));
    setToken(payload.token);
    setAdmin(payload.data);

    return payload;
  }

  function logout() {
    window.localStorage.removeItem('yogo.admin.token');
    window.localStorage.removeItem('yogo.admin.user');
    setToken(null);
    setAdmin(null);
  }

  const value = useMemo(
    () => ({
      admin,
      isAuthenticated: Boolean(token),
      login,
      logout,
      token,
    }),
    [admin, token],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }

  return context;
}
