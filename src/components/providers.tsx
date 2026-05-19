"use client";

import { ReactNode } from "react";
import { SWRConfig } from "swr";
import { AuthProvider } from "@/context/AuthContext";
import { Toaster } from "@/components/ui/toaster";
import { api } from "@/lib/api";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <SWRConfig
        value={{
          fetcher: (url: string) => api.get(url),
          revalidateOnFocus: false,
          shouldRetryOnError: false,
        }}
      >
        {children}
        <Toaster />
      </SWRConfig>
    </AuthProvider>
  );
}
