import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { api } from "../api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedToken = localStorage.getItem("postliner_token");
    if (!savedToken) {
      setLoading(false);
      return;
    }
    setToken(savedToken);
    api.getMe(savedToken)
      .then((userData) => setUser(userData))
      .catch(() => {
        localStorage.removeItem("postliner_token");
        setToken(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(async (username, password) => {
    const data = await api.login(username, password);
    localStorage.setItem("postliner_token", data.token);
    setToken(data.token);
    setUser(data.user || null);
  }, []);

  const register = useCallback(async (payload) => {
    const data = await api.register(payload);
    localStorage.setItem("postliner_token", data.token);
    setToken(data.token);
    setUser(data.user || null);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("postliner_token");
    setToken(null);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: !!token,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
