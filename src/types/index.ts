import type { DEMO_ACCOUNTS } from "@/lib/constants";

export type DemoAccount = (typeof DEMO_ACCOUNTS)[number];

export interface User {
  id: string;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: string;
  tenantId: string;
  isSuperAdmin: boolean;
  tenantName?: string;
  tenantColor?: string;
  canDeleteData: boolean;
  canCreateProjects: boolean;
}

export interface LoginResponse {
  token: string;
  userId: string;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: string;
  tenantId: string;
  isSuperAdmin: boolean;
  tenantName?: string;
  tenantColor?: string;
  canDeleteData: boolean;
  canCreateProjects: boolean;
}

export interface Tenant {
  id: string;
  companyName: string;
  city?: string;
  subdomain?: string;
  primaryColor?: string;
}

export enum ProjectStatus {
  Planning = "Planning",
  Active = "Active",
  Completed = "Completed",
  Cancelled = "Cancelled",
}

export interface Project {
  id: string;
  code: string;
  name: string;
  description?: string;
  address?: string;
  city?: string;
  employerName?: string;
  contractorName?: string;
  status: ProjectStatus;
  startDate?: string;
  plannedEndDate?: string;
  contractAmount: number;
  currency: string;
  productionRecordCount?: number;
}

export interface ProductionRecord {
  id: string;
  receiptNumber: string;
  date: string;
  vehicleId?: string;
  plateNumber?: string;
  tareWeight: number;
  grossWeight: number;
  netWeight: number;
  distance: number;
  material?: string;
  deliveryAddress?: string;
  vehiclePlate?: string;
}

export interface ProductionRecordListResponse {
  items: ProductionRecord[];
  totalCount: number;
  currentPage: number;
  pageSize: number;
  totalPages: number;
  summary: {
    totalGross: number;
    totalTare: number;
    totalNet: number;
  };
}
