"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/Button";

const schema = z.object({
  nome: z.string().min(2, "Nome obrigatório"),
  whatsapp: z.string().min(10, "WhatsApp inválido"),
  participou_leilao: z.enum(["sim", "nao"], { required_error: "Selecione uma opção" }),
  orcamento: z.string().min(1, "Selecione seu orçamento"),
  trava: z.string().min(10, "Descreva sua principal dificuldade (mínimo 10 caracteres)"),
});

type FormData = z.infer<typeof schema>;

export function MentoriaForm() {
  const [submitted, setSubmitted] = useState(false);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    const res = await fetch("/api/mentoria", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (res.ok) setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="text-center space-y-4 py-8">
        <div className="w-20 h-20 bg-gold/10 border border-gold/20 rounded-full flex items-center justify-center mx-auto">
          <span className="text-4xl">🏆</span>
        </div>
        <h3 className="text-2xl font-black text-white">Candidatura recebida!</h3>
        <p className="text-slate-400 leading-relaxed">
          Analisaremos seu perfil e entraremos em contato em até 48 horas via WhatsApp.
        </p>
      </div>
    );
  }

  const inputClass =
    "w-full bg-night-950/80 border border-white/[0.08] text-white rounded-xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-gold/30 focus:border-gold/30 transition placeholder-slate-600";
  const labelClass = "block text-sm font-medium text-slate-300 mb-2";
  const errorClass = "text-red-400 text-xs mt-1";

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div>
        <label className={labelClass}>Nome completo *</label>
        <input {...register("nome")} placeholder="Seu nome completo" className={inputClass} />
        {errors.nome && <p className={errorClass}>{errors.nome.message}</p>}
      </div>

      <div>
        <label className={labelClass}>WhatsApp (com DDD) *</label>
        <input {...register("whatsapp")} placeholder="(83) 99999-9999" className={inputClass} />
        {errors.whatsapp && <p className={errorClass}>{errors.whatsapp.message}</p>}
      </div>

      <div>
        <label className={labelClass}>Você já participou de algum leilão imobiliário? *</label>
        <select {...register("participou_leilao")} className={inputClass}>
          <option value="">Selecione...</option>
          <option value="nao">Não, é meu primeiro contato</option>
          <option value="sim">Sim, já participei</option>
        </select>
        {errors.participou_leilao && <p className={errorClass}>{errors.participou_leilao.message}</p>}
      </div>

      <div>
        <label className={labelClass}>Qual seu orçamento disponível para investimento? *</label>
        <select {...register("orcamento")} className={inputClass}>
          <option value="">Selecione...</option>
          <option value="ate-50k">Até R$50.000</option>
          <option value="50k-100k">R$50.000 a R$100.000</option>
          <option value="100k-200k">R$100.000 a R$200.000</option>
          <option value="acima-200k">Acima de R$200.000</option>
        </select>
        {errors.orcamento && <p className={errorClass}>{errors.orcamento.message}</p>}
      </div>

      <div>
        <label className={labelClass}>O que te trava hoje para arrematar em leilão? *</label>
        <textarea
          {...register("trava")}
          rows={4}
          placeholder="Ex: Tenho medo do processo jurídico, não sei como avaliar se o imóvel vale a pena..."
          className={`${inputClass} resize-none`}
        />
        {errors.trava && <p className={errorClass}>{errors.trava.message}</p>}
      </div>

      <Button type="submit" size="lg" loading={isSubmitting} className="w-full !bg-gold hover:!bg-gold-dark text-night-950 font-black">
        🏆 Enviar Candidatura
      </Button>

      <p className="text-xs text-center text-slate-600">
        Vagas limitadas. Responderemos em até 48 horas.
      </p>
    </form>
  );
}
