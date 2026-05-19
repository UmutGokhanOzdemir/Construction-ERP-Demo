import { useAuth } from "@/context/AuthContext";

export function usePermissions() {
  const { user } = useAuth();

  const isAdmin = user?.role === "Admin" || user?.isSuperAdmin === true;
  const isSuperAdmin = user?.isSuperAdmin === true;

  return {
    isAdmin,
    isSuperAdmin,
    canDeleteData: isAdmin || user?.canDeleteData === true,
    canCreateProjects: isAdmin || user?.canCreateProjects === true,
  };
}
