"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/Button";

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

      // Redirect to WhatsApp group after short delay
      setTimeout(() => {
        window.location.href =
          process.env.NEXT_PUBLIC_WHATSAPP_GROUP_LINK ??
          "https://chat.whatsapp.com/placeholder";
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro inesperado");
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center space-y-4 max-w-md">
          <div className="text-6xl">✅</div>
          <h2 className="text-2xl font-bold text-white">Perfeito!</h2>
          <p className="text-[#a0a0a0]">
            Redirecionando para o grupo do WhatsApp...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md space-y-8">
        {/* Header */}
        <div className="text-center space-y-3">
          <span className="text-4xl">📲</span>
          <h1 className="text-3xl font-bold text-white">
            Entrar no Grupo Gratuito
          </h1>
          <p className="text-[#a0a0a0]">
            Receba alertas semanais de imóveis em leilão na Paraíba,
            direto no seu WhatsApp. Gratuito para sempre.
          </p>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="bg-[#16213e] border border-[#0f3460] rounded-2xl p-8 space-y-6"
        >
          <div className="space-y-2">
            <label className="block text-sm font-medium text-[#e0e0e0]">
              Seu nome
            </label>
            <input
              {...register("nome")}
              placeholder="Ex: João Silva"
              className="w-full bg-[#0f3460] border border-[#1a1a2e] rounded-lg px-4 py-3 text-white placeholder-[#a0a0a0] focus:outline-none focus:ring-2 focus:ring-[#e63946] transition"
            />
            {errors.nome && (
              <p className="text-[#e63946] text-sm">{errors.nome.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-[#e0e0e0]">
              WhatsApp (com DDD)
            </label>
            <input
              {...register("whatsapp")}
              placeholder="(83) 9 9999-9999"
              type="tel"
              className="w-full bg-[#0f3460] border border-[#1a1a2e] rounded-lg px-4 py-3 text-white placeholder-[#a0a0a0] focus:outline-none focus:ring-2 focus:ring-[#e63946] transition"
            />
            {errors.whatsapp && (
              <p className="text-[#e63946] text-sm">{errors.whatsapp.message}</p>
            )}
          </div>

          {error && (
            <p className="text-[#e63946] text-sm bg-[#e63946]/10 border border-[#e63946]/30 rounded-lg px-4 py-3">
              {error}
            </p>
          )}

          <Button
            type="submit"
            loading={isSubmitting}
            size="lg"
            className="w-full"
          >
            📲 Quero entrar no grupo gratuito
          </Button>

          <p className="text-center text-xs text-[#a0a0a0]">
            Sem spam. Saia quando quiser. 100% gratuito.
          </p>
        </form>

        {/* Benefits */}
        <div className="space-y-3">
          {[
            "✅ Alertas semanais de leilões na Paraíba",
            "✅ Conteúdo educativo sobre o processo",
            "✅ Cases reais de oportunidades",
            "✅ Comunidade de investidores locais",
          ].map((item) => (
            <p key={item} className="text-[#a0a0a0] text-sm">{item}</p>
          ))}
        </div>
      </div>
    </div>
  );
}
