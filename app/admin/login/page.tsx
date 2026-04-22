"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (!res.ok) {
      setError("Credenciais inválidas.");
      setLoading(false);
      return;
    }

    router.push("/admin");
    router.refresh();
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-[#1a1a2e]">
      <div className="max-w-md w-full bg-[#16213e] border border-[#0f3460] rounded-2xl p-8 space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white">Painel Admin</h1>
          <p className="text-[#a0a0a0] text-sm mt-1">Alerta Leilões PB</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm text-[#e0e0e0] mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-[#0f3460] border border-[#16213e] text-white rounded-lg px-4 py-3 focus:outline-none focus:border-[#e63946]"
            />
          </div>
          <div>
            <label className="block text-sm text-[#e0e0e0] mb-2">Senha</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full bg-[#0f3460] border border-[#16213e] text-white rounded-lg px-4 py-3 focus:outline-none focus:border-[#e63946]"
            />
          </div>
          {error && <p className="text-[#e63946] text-sm">{error}</p>}
          <Button type="submit" size="lg" loading={loading} className="w-full">
            Entrar
          </Button>
        </form>
      </div>
    </div>
  );
}
