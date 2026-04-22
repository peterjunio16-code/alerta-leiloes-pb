"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { GRUPO_LINK } from "@/lib/constants";
import { Button } from "@/components/ui/Button";
import { Header } from "@/components/landing/Header";
import { Footer } from "@/components/landing/Footer";

const schema = z.object({
  nome: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  whatsapp: z
    .string()
    .min(10, "WhatsApp inválido")
    .regex(/[\d\s\(\)\-\+]+/, "Formato inválido"),
});

type FormData = z.infer<typeof schema>;

export default function GrupoPage() {
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    setError("");
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, origem: "grupo" }),
      });

      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error ?? "Erro ao salvar");
      }

      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro inesperado");
    }
  };

  if (submitted) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-[#060B18] relative overflow-hidden">
          <div className="absolute inset-0 bg-hero-gradient pointer-events-none" />
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/20 to-transparent" />

          <div className="relative z-10 flex items-center justify-center px-4 min-h-screen">
            <div className="text-center space-y-8 max-w-md w-full">
              <div className="w-24 h-24 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center justify-center mx-auto">
                <span className="text-5xl">✅</span>
              </div>
              <div>
                <h2 className="text-3xl font-black text-white">Cadastro realizado!</h2>
                <p className="text-slate-400 mt-3 text-sm leading-relaxed">
                  Em breve você receberá uma mensagem de boas-vindas no seu WhatsApp.<br />
                  Enquanto isso, entre no grupo gratuito abaixo.
                </p>
              </div>

              <a
                href={GRUPO_LINK}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-3 w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 px-6 rounded-xl transition-colors cta-glow"
              >
                <span className="text-xl">👥</span>
                Entrar no Grupo Gratuito
              </a>
            </div>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-[#060B18] relative overflow-hidden">
        {/* Background gradients */}
        <div className="absolute inset-0 bg-hero-gradient pointer-events-none" />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/20 to-transparent" />

        <div className="relative z-10 flex items-center justify-center px-4 pt-28 pb-20 min-h-screen">
          <div className="w-full max-w-lg space-y-8">

            {/* Header */}
            <div className="text-center space-y-4">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-medium mb-2">
                <span>👥</span>
                <span>100% gratuito</span>
              </div>
              <div className="w-16 h-16 bg-gold/10 border border-gold/20 rounded-2xl flex items-center justify-center mx-auto">
                <span className="text-3xl">📲</span>
              </div>
              <h1 className="text-3xl md:text-4xl font-black text-white leading-tight">
                Entrar no{" "}
                <span className="text-gradient-gold">Grupo Gratuito</span>
              </h1>
              <p className="text-slate-400 leading-relaxed">
                Receba alertas semanais de imóveis em leilão na Paraíba,
                direto no seu WhatsApp.
              </p>
            </div>

            {/* Benefits */}
            <div className="grid grid-cols-2 gap-2">
              {[
                { icone: "🏠", label: "Alertas semanais" },
                { icone: "📚", label: "Conteúdo educativo" },
                { icone: "📊", label: "Cases reais" },
                { icone: "👥", label: "Comunidade local" },
              ].map((item) => (
                <div
                  key={item.label}
                  className="glass-card rounded-xl px-4 py-3 flex items-center gap-3 text-sm text-slate-300"
                >
                  <span>{item.icone}</span>
                  <span>{item.label}</span>
                </div>
              ))}
            </div>

            {/* Form */}
            <div className="glass-card rounded-2xl p-8 space-y-6 gold-glow">
              <div className="text-center">
                <p className="text-white font-semibold">Cadastre-se para entrar</p>
                <p className="text-slate-500 text-xs mt-1">+500 investidores já estão no grupo</p>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-300">
                    Seu nome completo
                  </label>
                  <input
                    {...register("nome")}
                    placeholder="Ex: João Silva"
                    className="w-full bg-night-900/80 border border-white/[0.08] rounded-xl px-4 py-3.5 text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-gold/30 focus:border-gold/30 transition"
                  />
                  {errors.nome && (
                    <p className="text-red-400 text-xs">{errors.nome.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-300">
                    WhatsApp (com DDD)
                  </label>
                  <input
                    {...register("whatsapp")}
                    placeholder="(83) 9 9999-9999"
                    type="tel"
                    className="w-full bg-night-900/80 border border-white/[0.08] rounded-xl px-4 py-3.5 text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-gold/30 focus:border-gold/30 transition"
                  />
                  {errors.whatsapp && (
                    <p className="text-red-400 text-xs">{errors.whatsapp.message}</p>
                  )}
                </div>

                {error && (
                  <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
                    ⚠️ {error}
                  </p>
                )}

                <Button
                  type="submit"
                  loading={isSubmitting}
                  size="lg"
                  className="w-full text-base cta-glow !bg-emerald-600 hover:!bg-emerald-700"
                >
                  📲 Quero entrar no grupo gratuito
                </Button>
              </form>

              <p className="text-center text-xs text-slate-600">
                🔒 Sem spam. Seus dados são protegidos. Saia quando quiser.
              </p>
            </div>

          </div>
        </div>

        <Footer />
      </main>
    </>
  );
}
