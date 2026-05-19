"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import { TENANT_STORAGE_KEY } from "@/lib/constants";
import { Building2 } from "lucide-react";
import type { Tenant } from "@/types";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function TenantSwitcher() {
  const { user, setActiveTenantId } = useAuth();
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [activeTenantId, setActiveTenant] = useState<string>("");

  useEffect(() => {
    if (!user?.isSuperAdmin) return;

    api.get<Tenant[]>("/tenants")
      .then((data) => {
        setTenants(data);
        if (typeof window !== "undefined") {
          const stored = localStorage.getItem(TENANT_STORAGE_KEY);
          if (stored && data.some((t) => t.id === stored)) {
            setActiveTenant(stored);
          } else if (data.length > 0) {
            setActiveTenant(data[0].id);
            setActiveTenantId(data[0].id);
          }
        }
      })
      .catch(console.error);
  }, [user, setActiveTenantId]);

  if (!user?.isSuperAdmin) return null;

  const activeTenant = tenants.find((t) => t.id === activeTenantId);

  return (
    <div className="flex items-center gap-2">
      <Building2 className="h-4 w-4 text-slate-500" />
      <Select value={activeTenantId} onValueChange={setActiveTenantId}>
        <SelectTrigger className="w-[240px] h-9 bg-white">
          <SelectValue>
            {activeTenant ? (
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full" style={{ backgroundColor: activeTenant.primaryColor ?? "#64748b" }} />
                <span className="font-medium">{activeTenant.companyName}</span>
              </div>
            ) : (
              "Tenant seçiniz"
            )}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {tenants.map((tenant) => (
            <SelectItem key={tenant.id} value={tenant.id}>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full" style={{ backgroundColor: tenant.primaryColor ?? "#64748b" }} />
                <span>{tenant.companyName}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
