"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";
import { LayoutDashboard, Receipt, Briefcase, ArrowLeft } from "lucide-react";

interface SidebarProps {
  projectId: string;
  projectName?: string;
}

export function Sidebar({ projectId, projectName }: SidebarProps) {
  const pathname = usePathname();
  const { user } = useAuth();

  const items = [
    { name: "Dashboard", href: `/projects/${projectId}/dashboard`, icon: LayoutDashboard },
    { name: "Üretim Fişleri", href: `/projects/${projectId}/production-records`, icon: Receipt },
  ];

  return (
    <aside className="w-64 bg-[#0f172a] text-slate-300 flex flex-col h-screen shrink-0">
      <div className="p-5 border-b border-slate-800">
        <Link href="/" className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm mb-3">
          <ArrowLeft className="h-4 w-4" />
          <span>Projeler</span>
        </Link>
        <div className="flex flex-col">
          <span className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">Aktif Proje</span>
          <span className="text-white font-semibold truncate mt-0.5">{projectName ?? "Yükleniyor..."}</span>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto py-4 space-y-1 px-3 custom-scrollbar">
        {items.map((item) => {
          const isActive = pathname?.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors",
                isActive ? "bg-blue-600/10 text-blue-400 font-semibold" : "hover:bg-slate-800 hover:text-white"
              )}
            >
              <item.icon className="h-5 w-5 shrink-0" />
              <span className="text-sm">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-800 text-xs text-slate-500">
        <div className="flex items-center gap-2">
          <Briefcase className="h-3.5 w-3.5" />
          <span>{user?.tenantName ?? "—"}</span>
        </div>
      </div>
    </aside>
  );
}
