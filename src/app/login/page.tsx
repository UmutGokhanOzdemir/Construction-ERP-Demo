"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DEMO_ACCOUNTS } from "@/lib/constants";
import type { DemoAccount } from "@/types";

export default function LoginPage() {
  const router = useRouter();
  const { login, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      toast({ title: "Hata", description: "Kullanıcı adı ve şifre gereklidir", variant: "destructive" });
      return;
    }

    setIsLoading(true);
    try {
      await login(username, password);
      router.replace("/");
    } catch (error) {
      toast({
        title: "Giriş Başarısız",
        description: error instanceof Error ? error.message : "Kullanıcı adı veya şifre hatalı",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const quickLogin = async (account: DemoAccount) => {
    setUsername(account.username);
    setPassword(account.password);
    setIsLoading(true);
    try {
      await login(account.username, account.password);
      router.replace("/");
    } catch (error) {
      toast({
        title: "Giriş Başarısız",
        description: error instanceof Error ? error.message : "Demo hesabı giriş yapılamadı",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 px-4 py-8">
      <div className="w-full max-w-md space-y-6">
        <Card className="shadow-xl">
          <CardHeader className="space-y-1 text-center">
            <div className="flex justify-center mb-2">
              <svg width="48" height="48" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="6" y="16" width="10" height="18" rx="2" fill="#2563EB" />
                <rect x="20" y="8" width="10" height="26" rx="2" fill="#2563EB" />
                <path d="M11 16L25 8" stroke="#F97316" strokeWidth="3" strokeLinecap="round" />
                <circle cx="25" cy="8" r="3" fill="#F97316" />
                <circle cx="11" cy="16" r="2" fill="#F97316" />
              </svg>
            </div>
            <CardTitle className="text-3xl font-extrabold tracking-tight text-blue-700">Construction ERP</CardTitle>
            <CardDescription>Şantiye ve İnşaat Yönetim Sistemi</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Kullanıcı Adı</Label>
                <Input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={isLoading}
                  autoComplete="username"
                  autoFocus
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Şifre</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  autoComplete="current-password"
                />
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Giriş yapılıyor..." : "Giriş Yap"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-700">Demo Hesapları</CardTitle>
            <CardDescription className="text-xs">Tek tıkla giriş için seçin</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {DEMO_ACCOUNTS.map((account) => (
              <button
                key={account.username}
                onClick={() => quickLogin(account)}
                disabled={isLoading}
                className="w-full text-left p-3 rounded-md border border-slate-200 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-3"
              >
                <div className="h-10 w-10 rounded-md flex items-center justify-center shrink-0" style={{ backgroundColor: account.color }}>
                  <span className="text-white font-bold text-sm">{account.label.substring(0, 1)}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-slate-900 truncate">{account.label}</div>
                  <div className="text-xs text-slate-500 truncate">{account.description}</div>
                </div>
              </button>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
