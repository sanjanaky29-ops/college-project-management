import { createContext, useCallback, useContext, useState } from 'react';
import * as db from '../services/storage.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [userId, setUserId] = useState(() => db.getSession());
  const [, setTick] = useState(0);

  // Call after any data change so every component re-reads from storage.
  const refresh = useCallback(() => setTick((t) => t + 1), []);

  const stored = userId ? db.getUser(userId) : null;
  const user = stored && stored.active ? stored : null;

  const login = async (identifier, password) => {
    const u = await db.loginUser(identifier, password);
    db.setSession(u.id);
    setUserId(u.id);
  };

  const register = (data) => db.registerUser(data);

  const logout = () => {
    db.clearSession();
    setUserId(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, refresh }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
