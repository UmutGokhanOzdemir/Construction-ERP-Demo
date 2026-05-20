export const TOKEN_STORAGE_KEY = "authToken";
export const USER_STORAGE_KEY = "authUser";
export const TENANT_STORAGE_KEY = "tenantId";

export const SUPER_ADMIN_TENANT_ID = "a1b2c3d4-0000-0000-0000-000000000001";

export const DEMO_ACCOUNTS = [
  {
    label: "Test Yapım Admin",
    description: "Tam yetkili tenant yöneticisi",
    username: "admin@test.com",
    password: "Demo123!",
    color: "#2563eb",
  },
  {
    label: "ERK İnşaat Admin",
    description: "Tam yetkili tenant yöneticisi",
    username: "admin@erk.com",
    password: "Demo123!",
    color: "#dc2626",
  },
  {
    label: "Süper Admin",
    description: "Tüm tenant'ları görür ve değiştirir",
    username: "super@ozgoktech.com",
    password: "Demo123!",
    color: "#0f172a",
  },
] as const;
