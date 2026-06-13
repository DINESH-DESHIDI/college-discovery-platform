import { createContext, useContext, useEffect, useMemo, useState } from "react";
import api from "@/utils/api";

const AuthContext = createContext(null);
const STORAGE_KEY = "collverse_auth";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const stored = JSON.parse(raw);
        if (stored?.token && stored?.user) {
          setUser(stored.user);
          api.setAuthToken(stored.token);
        }
      }
    } catch (error) {
      localStorage.removeItem(STORAGE_KEY);
    } finally {
      setLoading(false);
    }
  }, []);

  const persistAuth = ({ user: nextUser, token }) => {
    setUser(nextUser);
    api.setAuthToken(token);
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ user: nextUser, token }));
  };

  const login = async ({ email, password }) => {
    const response = await api.post("/api/auth/login", { email, password });
    persistAuth(response.data.data);
    return response.data.data;
  };

  const signup = async ({ name, email, password }) => {
    const response = await api.post("/api/auth/signup", { name, email, password });
    persistAuth(response.data.data);
    return response.data.data;
  };

  const logout = () => {
    setUser(null);
    api.setAuthToken(null);
    localStorage.removeItem(STORAGE_KEY);
    try {
      // reset guest saved/compare lists so UI shows initial state after logout
      localStorage.setItem("cd:saved-colleges:guest", JSON.stringify([]));
      localStorage.setItem("cd:compare:guest", JSON.stringify([]));
      window.dispatchEvent(new Event("saved-colleges-change"));
      window.dispatchEvent(new Event("compare-change"));
    } catch (e) {
      // ignore
    }
  };

  const value = useMemo(
    () => ({ user, loading, login, signup, logout, isAuthenticated: Boolean(user) }),
    [user, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
