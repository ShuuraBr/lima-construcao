"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { exigirSessao } from "@/lib/painel";
import { VISITA_STATUS } from "@/lib/painel-shared";

export type EstadoVisitaPainel = {
  erro?: string;
  valores?: Record<string, string>;
};

const dataHoraOpc = z
  .string()
  .trim()
  .transform((v) => (v ? v : null))
  .refine((v) => v === null || !Number.isNaN(Date.parse(v)), "Data/hora inválida.")
  .transform((v) => (v ? new Date(v) : null));

const visitaSchema = z.object({
  nome: z.string().trim().min(2, "Informe o solicitante."),
  empresa: z.string().trim().max(160).transform((v) => v || null),
  email: z
    .string()
    .trim()
    .transform((v) => v || null)
    .refine((v) => !v || z.string().email().safeParse(v).success, "E-mail inválido."),
  telefone: z.string().trim().max(40).transform((v) => v || null),
  endereco: z.string().trim().min(4, "Informe o endereço da obra."),
  preferencia: z.string().trim().max(400).transform((v) => v || null),
  mensagem: z.string().trim().max(2000).transform((v) => v || null),
  status: z.enum(VISITA_STATUS),
  agendadaEm: dataHoraOpc,
  observacoesInternas: z.string().trim().max(2000).transform((v) => v || null),
  contratoId: z.string().trim().transform((v) => v || null),
  pedidoOrcamentoId: z.string().trim().transform((v) => v || null),
});

function lerForm(formData: FormData) {
  const s = (k: string) => String(formData.get(k) ?? "");
  return {
    nome: s("nome"),
    empresa: s("empresa"),
    email: s("email"),
    telefone: s("telefone"),
    endereco: s("endereco"),
    preferencia: s("preferencia"),
    mensagem: s("mensagem"),
    status: s("status"),
    agendadaEm: s("agendadaEm"),
    observacoesInternas: s("observacoesInternas"),
    contratoId: s("contratoId"),
    pedidoOrcamentoId: s("pedidoOrcamentoId"),
  };
}

function planificar(bruto: ReturnType<typeof lerForm>): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(bruto)) if (typeof v === "string") out[k] = v;
  return out;
}

const telOuEmail = (d: { email: string | null; telefone: string | null }) =>
  Boolean(d.email || d.telefone);

export async function criarVisitaAction(
  _prev: EstadoVisitaPainel,
  formData: FormData,
): Promise<EstadoVisitaPainel> {
  await exigirSessao();
  const bruto = lerForm(formData);
  const parsed = visitaSchema.safeParse(bruto);
  if (!parsed.success) {
    return { erro: parsed.error.issues[0]?.message ?? "Revise os campos.", valores: planificar(bruto) };
  }
  const d = parsed.data;
  if (!telOuEmail(d)) {
    return { erro: "Informe telefone ou e-mail do solicitante.", valores: planificar(bruto) };
  }

  const visita = await prisma.visita.create({
    data: { ...d, origem: "painel" },
  });

  revalidatePath("/painel/visitas");
  revalidatePath("/painel");
  redirect(`/painel/visitas/${visita.id}`);
}

export async function atualizarVisitaAction(
  _prev: EstadoVisitaPainel,
  formData: FormData,
): Promise<EstadoVisitaPainel> {
  await exigirSessao();
  const id = String(formData.get("id") ?? "");
  const bruto = lerForm(formData);
  const parsed = visitaSchema.safeParse(bruto);
  if (!parsed.success) {
    return { erro: parsed.error.issues[0]?.message ?? "Revise os campos.", valores: planificar(bruto) };
  }
  const d = parsed.data;
  if (!telOuEmail(d)) {
    return { erro: "Informe telefone ou e-mail do solicitante.", valores: planificar(bruto) };
  }

  await prisma.visita.update({ where: { id }, data: d });

  revalidatePath(`/painel/visitas/${id}`);
  revalidatePath("/painel/visitas");
  revalidatePath("/painel");
  redirect(`/painel/visitas/${id}`);
}

const gestaoSchema = z.object({
  id: z.string().min(1),
  status: z.enum(VISITA_STATUS),
  agendadaEm: dataHoraOpc,
  observacoesInternas: z.string().trim().max(2000).transform((v) => v || null),
});

export async function gerirVisitaAction(formData: FormData) {
  await exigirSessao();
  const parsed = gestaoSchema.safeParse({
    id: formData.get("id"),
    status: formData.get("status"),
    agendadaEm: String(formData.get("agendadaEm") ?? ""),
    observacoesInternas: String(formData.get("observacoesInternas") ?? ""),
  });
  if (!parsed.success) return;
  const { id, status, agendadaEm, observacoesInternas } = parsed.data;

  await prisma.visita.update({
    where: { id },
    data: { status, agendadaEm, observacoesInternas },
  });

  revalidatePath(`/painel/visitas/${id}`);
  revalidatePath("/painel/visitas");
  revalidatePath("/painel");
}
