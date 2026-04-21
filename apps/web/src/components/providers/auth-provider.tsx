"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { api } from "@/lib/api";

interface User {
  id: string;
  firstName: string;
  lastName: string;
  displayName: string | null;
  email: string;
  avatarUrl: string | null;
  role: string;
  isVerified: boolean;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (accessToken: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUser = useCallback(async () => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      setUser(null);
      setIsLoading(false);
      return;
    }

    try {
      const data = await api.get<User>("/users/me");
      setUser(data);
    } catch {
      // Token invalid/expired — try refresh
      try {
        const res = await api.post<{ accessToken: string }>("/auth/refresh");
        if (res.accessToken) {
          localStorage.setItem("accessToken", res.accessToken);
          const data = await api.get<User>("/users/me");
          setUser(data);
        } else {
          localStorage.removeItem("accessToken");
          setUser(null);
        }
      } catch {
        localStorage.removeItem("accessToken");
        setUser(null);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const login = useCallback(
    async (accessToken: string) => {
      localStorage.setItem("accessToken", accessToken);
      await fetchUser();
    },
    [fetchUser],
  );

  const logout = useCallback(async () => {
    try {
      await api.post("/auth/logout");
    } catch {
      // Ignore — server may be unreachable
    }
    localStorage.removeItem("accessToken");
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      isLoading,
      isAuthenticated: !!user,
      login,
      logout,
      refreshUser: fetchUser,
    }),
    [user, isLoading, login, logout, fetchUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
