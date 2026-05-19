"use client";

import { useAuth } from "@/context/AuthContext";
import { TenantSwitcher } from "@/components/layout/TenantSwitcher";
import { Button } from "@/components/ui/button";
import { LogOut, User as UserIcon } from "lucide-react";

export function Topbar() {
  const { user, logout } = useAuth();

  if (!user) return null;

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0">
      <div className="flex items-center gap-4">
        <TenantSwitcher />
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 text-sm">
          <div className="h-8 w-8 rounded-full bg-slate-200 flex items-center justify-center">
            <UserIcon className="h-4 w-4 text-slate-600" />
          </div>
          <div className="leading-tight">
            <div className="font-medium text-slate-900">{user.firstName ?? user.username}</div>
            <div className="text-xs text-slate-500">{user.role}{user.isSuperAdmin ? " · Süper Admin" : ""}</div>
          </div>
        </div>
        <Button variant="ghost" size="icon" onClick={logout} title="Çıkış Yap" className="text-red-500 hover:text-red-600 hover:bg-red-50">
          <LogOut className="h-5 w-5" />
        </Button>
      </div>
    </header>
  );
}
