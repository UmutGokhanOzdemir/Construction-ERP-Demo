"use client";

import { useState, FormEvent } from "react";
import { useParams } from "next/navigation";
import useSWR, { mutate } from "swr";
import { api } from "@/lib/api";
import { usePermissions } from "@/hooks/usePermissions";
import { useToast } from "@/components/ui/use-toast";
import { formatDateTime } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Plus, Download, Trash2, Search } from "lucide-react";
import type { ProductionRecordListResponse } from "@/types";

export default function ProductionRecordsPage() {
  const params = useParams();
  const projectId = params.projectId as string;
  const { toast } = useToast();
  const { canDeleteData } = usePermissions();
  const [search, setSearch] = useState("");
  const [openCreate, setOpenCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [exporting, setExporting] = useState(false);

  const key = `/productionrecords?contractProjectId=${projectId}&pageSize=100${search ? `&search=${encodeURIComponent(search)}` : ""}`;
  const { data, isLoading } = useSWR<ProductionRecordListResponse>(key);

  const handleCreate = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setCreating(true);
    try {
      await api.post("/productionrecords", {
        contractProjectId: projectId,
        receiptNumber: form.get("receiptNumber"),
        date: new Date(form.get("date") as string).toISOString(),
        plateNumber: form.get("plateNumber"),
        tareWeight: Number(form.get("tareWeight")),
        grossWeight: Number(form.get("grossWeight")),
        distance: Number(form.get("distance") || 0),
        material: form.get("material"),
        deliveryAddress: form.get("deliveryAddress"),
      });
      toast({ title: "Başarılı", description: "Fiş oluşturuldu." });
      setOpenCreate(false);
      mutate((k) => typeof k === "string" && k.startsWith("/productionrecords"));
      mutate(`/projects/${projectId}`);
    } catch (error) {
      toast({
        title: "Hata",
        description: error instanceof Error ? error.message : "Fiş oluşturulamadı",
        variant: "destructive",
      });
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bu fişi silmek istediğinize emin misiniz?")) return;
    try {
      await api.delete(`/productionrecords/${id}`);
      toast({ title: "Silindi", description: "Fiş silindi." });
      mutate((k) => typeof k === "string" && k.startsWith("/productionrecords"));
      mutate(`/projects/${projectId}`);
    } catch (error) {
      toast({
        title: "Hata",
        description: error instanceof Error ? error.message : "Silinemedi",
        variant: "destructive",
      });
    }
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      await api.downloadFile(`/productionrecords/export?contractProjectId=${projectId}`, "Uretim_Fisleri.xlsx");
      toast({ title: "Başarılı", description: "Excel indirildi." });
    } catch (error) {
      toast({
        title: "Hata",
        description: error instanceof Error ? error.message : "Excel oluşturulamadı",
        variant: "destructive",
      });
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Üretim Fişleri</h1>
          <p className="text-sm text-slate-500 mt-1">Günlük asfalt/malzeme üretim kayıtları</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleExport} disabled={exporting || !data?.items.length}>
            <Download className="h-4 w-4 mr-2" />
            {exporting ? "İndiriliyor..." : "Excel İndir"}
          </Button>
          <Button onClick={() => setOpenCreate(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Yeni Fiş
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-4 flex items-center gap-3">
          <Search className="h-4 w-4 text-slate-400" />
          <Input
            placeholder="Fiş no, plaka, malzeme veya adreste ara..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border-0 shadow-none focus-visible:ring-0 px-0"
          />
        </CardContent>
      </Card>

      {data && (
        <div className="grid grid-cols-3 gap-4">
          <SummaryCard label="Toplam Fiş" value={data.totalCount.toString()} />
          <SummaryCard label="Toplam Net (kg)" value={data.summary.totalNet.toLocaleString("tr-TR")} />
          <SummaryCard label="Toplam Brüt (kg)" value={data.summary.totalGross.toLocaleString("tr-TR")} />
        </div>
      )}

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="text-center py-12 text-slate-500">Yükleniyor...</div>
          ) : !data || data.items.length === 0 ? (
            <div className="text-center py-12 text-slate-500">Kayıt bulunamadı.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="text-left px-4 py-3 font-medium text-slate-700">Fiş No</th>
                    <th className="text-left px-4 py-3 font-medium text-slate-700">Tarih</th>
                    <th className="text-left px-4 py-3 font-medium text-slate-700">Plaka</th>
                    <th className="text-left px-4 py-3 font-medium text-slate-700">Malzeme</th>
                    <th className="text-right px-4 py-3 font-medium text-slate-700">Dara</th>
                    <th className="text-right px-4 py-3 font-medium text-slate-700">Brüt</th>
                    <th className="text-right px-4 py-3 font-medium text-slate-700">Net</th>
                    <th className="text-right px-4 py-3 font-medium text-slate-700">Mesafe</th>
                    <th className="text-left px-4 py-3 font-medium text-slate-700">Adres</th>
                    {canDeleteData && <th className="text-right px-4 py-3"></th>}
                  </tr>
                </thead>
                <tbody>
                  {data.items.map((r) => (
                    <tr key={r.id} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="px-4 py-2.5 font-mono text-xs">{r.receiptNumber}</td>
                      <td className="px-4 py-2.5 text-slate-600">{formatDateTime(r.date)}</td>
                      <td className="px-4 py-2.5">{r.plateNumber ?? "—"}</td>
                      <td className="px-4 py-2.5">{r.material ?? "—"}</td>
                      <td className="px-4 py-2.5 text-right text-slate-600">{r.tareWeight.toLocaleString("tr-TR")}</td>
                      <td className="px-4 py-2.5 text-right text-slate-600">{r.grossWeight.toLocaleString("tr-TR")}</td>
                      <td className="px-4 py-2.5 text-right font-semibold text-slate-900">{r.netWeight.toLocaleString("tr-TR")}</td>
                      <td className="px-4 py-2.5 text-right text-slate-600">{r.distance} km</td>
                      <td className="px-4 py-2.5 text-slate-600 max-w-[200px] truncate">{r.deliveryAddress ?? "—"}</td>
                      {canDeleteData && (
                        <td className="px-4 py-2.5 text-right">
                          <button onClick={() => handleDelete(r.id)} className="text-red-500 hover:text-red-700 p-1">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={openCreate} onOpenChange={setOpenCreate}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Yeni Üretim Fişi</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="receiptNumber">Fiş No *</Label>
                <Input id="receiptNumber" name="receiptNumber" required defaultValue={`F-${Date.now().toString().slice(-6)}`} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="date">Tarih *</Label>
                <Input id="date" name="date" type="datetime-local" required defaultValue={new Date().toISOString().slice(0, 16)} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="plateNumber">Plaka</Label>
                <Input id="plateNumber" name="plateNumber" placeholder="06 ABC 123" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="material">Malzeme</Label>
                <Input id="material" name="material" placeholder="BSK Aşınma" />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="tareWeight">Dara (kg)</Label>
                <Input id="tareWeight" name="tareWeight" type="number" step="0.01" defaultValue="15000" required />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="grossWeight">Brüt (kg)</Label>
                <Input id="grossWeight" name="grossWeight" type="number" step="0.01" defaultValue="40000" required />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="distance">Mesafe (km)</Label>
                <Input id="distance" name="distance" type="number" step="0.01" defaultValue="15" />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="deliveryAddress">Teslim Adresi</Label>
              <Input id="deliveryAddress" name="deliveryAddress" placeholder="Şantiye Km 3+250" />
            </div>

            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => setOpenCreate(false)}>İptal</Button>
              <Button type="submit" disabled={creating}>{creating ? "Kaydediliyor..." : "Kaydet"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="text-xs text-slate-500 uppercase tracking-wider mb-1">{label}</div>
        <div className="text-xl font-bold text-slate-900">{value}</div>
      </CardContent>
    </Card>
  );
}
