"use client";

import { useParams } from "next/navigation";
import useSWR from "swr";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Briefcase, Receipt, Truck, Scale } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid } from "recharts";
import type { Project, ProductionRecordListResponse } from "@/types";

export default function DashboardPage() {
  const params = useParams();
  const projectId = params.projectId as string;

  const { data: project } = useSWR<Project>(`/projects/${projectId}`);
  const { data: recordsData } = useSWR<ProductionRecordListResponse>(`/productionrecords?contractProjectId=${projectId}&pageSize=200`);

  if (!project || !recordsData) {
    return <div className="p-8 text-slate-500">Yükleniyor...</div>;
  }

  const totalNet = recordsData.summary.totalNet;
  const totalRecords = recordsData.totalCount;

  const byMaterial = new Map<string, number>();
  recordsData.items.forEach((r) => {
    const key = r.material ?? "Diğer";
    byMaterial.set(key, (byMaterial.get(key) ?? 0) + r.netWeight);
  });
  const materialChart = Array.from(byMaterial.entries())
    .map(([name, value]) => ({ name, value: Math.round(value) }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 6);

  const byDate = new Map<string, number>();
  recordsData.items.forEach((r) => {
    const d = new Date(r.date);
    const key = `${d.getDate().toString().padStart(2, "0")}.${(d.getMonth() + 1).toString().padStart(2, "0")}`;
    byDate.set(key, (byDate.get(key) ?? 0) + r.netWeight);
  });
  const dateChart = Array.from(byDate.entries())
    .map(([date, value]) => ({ date, value: Math.round(value) }))
    .reverse()
    .slice(-14);

  const uniqueVehicles = new Set(recordsData.items.map((r) => r.plateNumber).filter(Boolean)).size;

  return (
    <div className="p-6 space-y-6">
      <div>
        <div className="flex items-center gap-3 mb-1">
          <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-200 text-slate-700">{project.code}</span>
          <span className="text-xs text-slate-500">{project.city}</span>
        </div>
        <h1 className="text-2xl font-bold text-slate-900">{project.name}</h1>
        <p className="text-sm text-slate-500 mt-1">{project.description}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard icon={Briefcase} label="Sözleşme Bedeli" value={formatCurrency(project.contractAmount, project.currency)} color="#2563eb" />
        <KpiCard icon={Receipt} label="Toplam Üretim Fişi" value={totalRecords.toString()} color="#16a34a" />
        <KpiCard icon={Scale} label="Toplam Net (ton)" value={(totalNet / 1000).toLocaleString("tr-TR", { maximumFractionDigits: 1 })} color="#f97316" />
        <KpiCard icon={Truck} label="Kullanılan Araç" value={uniqueVehicles.toString()} color="#0891b2" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader><CardTitle className="text-base">Günlük Üretim (kg)</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={dateChart}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Line type="monotone" dataKey="value" stroke="#2563eb" strokeWidth={2} dot={{ r: 3 }} name="Net (kg)" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Malzemeye Göre Üretim</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={materialChart}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} angle={-15} textAnchor="end" height={50} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="value" fill="#f97316" name="Net (kg)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Proje Bilgileri</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <InfoItem label="İşveren" value={project.employerName ?? "—"} />
          <InfoItem label="Yüklenici" value={project.contractorName ?? "—"} />
          <InfoItem label="Başlangıç" value={project.startDate ? formatDate(project.startDate) : "—"} />
          <InfoItem label="Planlanan Bitiş" value={project.plannedEndDate ? formatDate(project.plannedEndDate) : "—"} />
        </CardContent>
      </Card>
    </div>
  );
}

function KpiCard({ icon: Icon, label, value, color }: { icon: typeof Briefcase; label: string; value: string; color: string }) {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-start justify-between mb-2">
          <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">{label}</span>
          <div className="h-9 w-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${color}15` }}>
            <Icon className="h-5 w-5" style={{ color }} />
          </div>
        </div>
        <div className="text-2xl font-bold text-slate-900">{value}</div>
      </CardContent>
    </Card>
  );
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs text-slate-500 mb-1">{label}</div>
      <div className="font-medium text-slate-900">{value}</div>
    </div>
  );
}
