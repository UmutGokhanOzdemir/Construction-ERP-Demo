"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import { api } from "@/lib/api";
import { TENANT_STORAGE_KEY, TOKEN_STORAGE_KEY, USER_STORAGE_KEY } from "@/lib/constants";
import type { LoginResponse, User } from "@/types";

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  setActiveTenantId: (tenantId: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function applyAdminOverride(user: User): User {
  if (user.role === "Admin" || user.isSuperAdmin) {
    return { ...user, canDeleteData: true, canCreateProjects: true };
  }
  return user;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      const storedToken = localStorage.getItem(TOKEN_STORAGE_KEY);
      const storedUser = localStorage.getItem(USER_STORAGE_KEY);

      if (storedToken && storedUser) {
        const parsedUser = applyAdminOverride(JSON.parse(storedUser) as User);
        setToken(storedToken);
        setUser(parsedUser);
        document.cookie = `token=${storedToken}; path=/; max-age=604800; SameSite=Strict`;
      }
    } catch (error) {
      console.error("Failed to restore auth state:", error);
      localStorage.removeItem(TOKEN_STORAGE_KEY);
      localStorage.removeItem(USER_STORAGE_KEY);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = useCallback(async (username: string, password: string) => {
    const data = await api.post<LoginResponse>("/auth/login", { username, password });

    const newUser = applyAdminOverride({
      id: data.userId,
      username: data.username,
      email: data.email,
      firstName: data.firstName,
      lastName: data.lastName,
      role: data.role,
      tenantId: data.tenantId,
      isSuperAdmin: data.isSuperAdmin,
      tenantName: data.tenantName,
      tenantColor: data.tenantColor,
      canDeleteData: data.canDeleteData,
      canCreateProjects: data.canCreateProjects,
    });

    setToken(data.token);
    setUser(newUser);

    localStorage.setItem(TOKEN_STORAGE_KEY, data.token);
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(newUser));
    localStorage.setItem(TENANT_STORAGE_KEY, newUser.tenantId);

    document.cookie = `token=${data.token}; path=/; max-age=604800; SameSite=Strict`;
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    localStorage.removeItem(USER_STORAGE_KEY);
    localStorage.removeItem(TENANT_STORAGE_KEY);
    document.cookie = "token=; path=/; max-age=0";
    window.location.href = "/login";
  }, []);

  const setActiveTenantId = useCallback((tenantId: string) => {
    localStorage.setItem(TENANT_STORAGE_KEY, tenantId);
    window.location.reload();
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, logout, setActiveTenantId }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
