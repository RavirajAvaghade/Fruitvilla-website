import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { KEYS, readJSON, removeKey, writeJSON } from '../services/storage';
import { ADMIN_DEMO_CREDENTIALS } from '../data/config';

// DEMO ONLY: both the customer "account" and the admin login live in the browser's localStorage.
// This is NOT secure. Real authentication needs a backend (hashed passwords, tokens, HTTPS).

const AuthContext = createContext(null);

function loadAdmin() {
  const s = readJSON(KEYS.adminSession, null);
  return s && s.user === ADMIN_DEMO_CREDENTIALS.username ? s : null;
}

function loadCustomer() {
  const c = readJSON(KEYS.customer, null);
  return c && c.mobile ? c : null;
}

export function AuthProvider({ children }) {
  const [admin, setAdmin] = useState(loadAdmin);
  const [customer, setCustomer] = useState(loadCustomer);

  useEffect(() => {
    function onStorage(e) {
      if (e.key === KEYS.adminSession) setAdmin(loadAdmin());
      if (e.key === KEYS.customer) setCustomer(loadCustomer());
    }
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const adminLogin = useCallback((username, password) => {
    if (
      String(username).trim() === ADMIN_DEMO_CREDENTIALS.username &&
      password === ADMIN_DEMO_CREDENTIALS.password
    ) {
      const session = { user: ADMIN_DEMO_CREDENTIALS.username, at: new Date().toISOString() };
      writeJSON(KEYS.adminSession, session);
      setAdmin(session);
      return { ok: true };
    }
    return { ok: false, error: 'Invalid username or password.' };
  }, []);

  const adminLogout = useCallback(() => {
    removeKey(KEYS.adminSession);
    setAdmin(null);
  }, []);

  const saveCustomer = useCallback((data) => {
    const next = { ...(readJSON(KEYS.customer, {}) || {}), ...data };
    writeJSON(KEYS.customer, next);
    setCustomer(next);
  }, []);

  const customerLogout = useCallback(() => {
    removeKey(KEYS.customer);
    setCustomer(null);
  }, []);

  const value = useMemo(
    () => ({ admin, customer, adminLogin, adminLogout, saveCustomer, customerLogout }),
    [admin, customer, adminLogin, adminLogout, saveCustomer, customerLogout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
