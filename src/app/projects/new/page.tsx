"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft } from "lucide-react";
import { ProjectStatus } from "@/types";

export default function NewProjectPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    code: "",
    name: "",
    description: "",
    address: "",
    city: "",
    employerName: "",
    contractorName: "",
    status: ProjectStatus.Planning as ProjectStatus,
    startDate: "",
    plannedEndDate: "",
    contractAmount: 0,
    currency: "TRY",
  });

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!form.code || !form.name) {
      toast({ title: "Hata", description: "Kod ve ad zorunludur.", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      const payload = {
        ...form,
        startDate: form.startDate ? new Date(form.startDate).toISOString() : null,
        plannedEndDate: form.plannedEndDate ? new Date(form.plannedEndDate).toISOString() : null,
      };
      const result = await api.post<{ id: string }>("/projects", payload);
      toast({ title: "Başarılı", description: "Proje oluşturuldu." });
      router.replace(`/projects/${result.id}/dashboard`);
    } catch (error) {
      toast({
        title: "Hata",
        description: error instanceof Error ? error.message : "Proje oluşturulamadı",
        variant: "destructive",
      });
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 mb-4">
          <ArrowLeft className="h-4 w-4" />
          <span>Projelere Dön</span>
        </Link>

        <Card>
          <CardHeader>
            <CardTitle>Yeni Proje</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="code">Proje Kodu *</Label>
                  <Input id="code" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} placeholder="ÖRN-2025-001" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Durum</Label>
                  <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v as ProjectStatus })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value={ProjectStatus.Planning}>Planlama</SelectItem>
                      <SelectItem value={ProjectStatus.Active}>Aktif</SelectItem>
                      <SelectItem value={ProjectStatus.Completed}>Tamamlandı</SelectItem>
                      <SelectItem value={ProjectStatus.Cancelled}>İptal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">Proje Adı *</Label>
                <Input id="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Açıklama</Label>
                <Input id="description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">Şehir</Label>
                  <Input id="city" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Adres</Label>
                  <Input id="address" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="employerName">İşveren</Label>
                  <Input id="employerName" value={form.employerName} onChange={(e) => setForm({ ...form, employerName: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contractorName">Yüklenici</Label>
                  <Input id="contractorName" value={form.contractorName} onChange={(e) => setForm({ ...form, contractorName: e.target.value })} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startDate">Başlangıç</Label>
                  <Input id="startDate" type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="plannedEndDate">Planlanan Bitiş</Label>
                  <Input id="plannedEndDate" type="date" value={form.plannedEndDate} onChange={(e) => setForm({ ...form, plannedEndDate: e.target.value })} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="contractAmount">Sözleşme Bedeli</Label>
                  <Input id="contractAmount" type="number" value={form.contractAmount} onChange={(e) => setForm({ ...form, contractAmount: Number(e.target.value) })} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="currency">Para Birimi</Label>
                  <Input id="currency" value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value })} />
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button type="submit" disabled={loading}>{loading ? "Kaydediliyor..." : "Projeyi Oluştur"}</Button>
                <Link href="/"><Button type="button" variant="outline">İptal</Button></Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
