"use client";

import Link from "next/link";
import useSWR from "swr";
import { useAuth } from "@/context/AuthContext";
import { usePermissions } from "@/hooks/usePermissions";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TenantSwitcher } from "@/components/layout/TenantSwitcher";
import { Plus, LogOut, MapPin, Calendar, Briefcase, Receipt } from "lucide-react";
import type { Project } from "@/types";

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  Planning: { label: "Planlama", color: "bg-slate-100 text-slate-700" },
  Active: { label: "Aktif", color: "bg-green-100 text-green-700" },
  Completed: { label: "Tamamlandı", color: "bg-blue-100 text-blue-700" },
  Cancelled: { label: "İptal", color: "bg-red-100 text-red-700" },
};

export default function ProjectsListPage() {
  const { user, logout, isLoading: authLoading } = useAuth();
  const { canCreateProjects } = usePermissions();
  const { data: projects, isLoading } = useSWR<Project[]>(user ? "/projects" : null);

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2">
              <svg width="32" height="32" viewBox="0 0 40 40" fill="none">
                <rect x="6" y="16" width="10" height="18" rx="2" fill="#2563EB" />
                <rect x="20" y="8" width="10" height="26" rx="2" fill="#2563EB" />
                <path d="M11 16L25 8" stroke="#F97316" strokeWidth="3" strokeLinecap="round" />
                <circle cx="25" cy="8" r="3" fill="#F97316" />
                <circle cx="11" cy="16" r="2" fill="#F97316" />
              </svg>
              <span className="font-bold text-xl text-slate-900">Construction ERP</span>
            </Link>
            {user.isSuperAdmin && <TenantSwitcher />}
          </div>
          <div className="flex items-center gap-3">
            <div className="text-sm text-right leading-tight">
              <div className="font-medium text-slate-900">{user.firstName ?? user.username}</div>
              <div className="text-xs text-slate-500">{user.tenantName ?? user.role}</div>
            </div>
            <Button variant="ghost" size="icon" onClick={logout} className="text-red-500 hover:bg-red-50">
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Projeler</h1>
            <p className="text-sm text-slate-500 mt-1">Sözleşmeli şantiye projelerinizi yönetin</p>
          </div>
          {canCreateProjects && (
            <Link href="/projects/new">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Yeni Proje
              </Button>
            </Link>
          )}
        </div>

        {isLoading ? (
          <div className="text-center py-12 text-slate-500">Yükleniyor...</div>
        ) : !projects || projects.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12 text-slate-500">
              <Briefcase className="h-12 w-12 mx-auto mb-3 text-slate-300" />
              <p>Henüz proje yok.</p>
              {canCreateProjects && (
                <Link href="/projects/new">
                  <Button variant="outline" className="mt-4">İlk Projeni Oluştur</Button>
                </Link>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map((project) => {
              const status = STATUS_LABELS[project.status] ?? STATUS_LABELS.Planning;
              return (
                <Link key={project.id} href={`/projects/${project.id}/dashboard`}>
                  <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <span className="text-xs font-mono text-slate-500">{project.code}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${status.color}`}>{status.label}</span>
                      </div>
                      <CardTitle className="text-base leading-snug">{project.name}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm text-slate-600">
                      {project.city && (
                        <div className="flex items-center gap-2">
                          <MapPin className="h-3.5 w-3.5 text-slate-400" />
                          <span>{project.city}</span>
                        </div>
                      )}
                      {project.startDate && (
                        <div className="flex items-center gap-2">
                          <Calendar className="h-3.5 w-3.5 text-slate-400" />
                          <span>{formatDate(project.startDate)}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <Receipt className="h-3.5 w-3.5 text-slate-400" />
                        <span>{project.productionRecordCount ?? 0} üretim kaydı</span>
                      </div>
                      <div className="pt-2 border-t border-slate-100 flex items-baseline justify-between">
                        <span className="text-xs text-slate-500">Sözleşme</span>
                        <span className="font-semibold text-slate-900">{formatCurrency(project.contractAmount, project.currency)}</span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
