"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { exigirSessao } from "@/lib/painel";
import { VISITA_STATUS } from "@/lib/painel-shared";
import { comporEndereco } from "@/lib/endereco";
import { enviarAtualizacaoVisita } from "@/lib/mail";

const coordOpc = (min: number, max: number, msg: string) =>
  z
    .string()
    .trim()
    .transform((v) => v.replace(",", ".").replace(/[^\d.\-]/g, ""))
    .transform((v) => (v === "" || v === "-" ? null : Number(v)))
    .refine((v) => v === null || (!Number.isNaN(v) && v >= min && v <= max), msg);

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
  cep: z.string().trim().max(9).transform((v) => v || null),
  logradouro: z.string().trim().min(2, "Informe o endereço da obra.").max(180),
  enderecoNumero: z.string().trim().max(30).transform((v) => v || null),
  complemento: z.string().trim().max(120).transform((v) => v || null),
  bairro: z.string().trim().max(120).transform((v) => v || null),
  cidade: z.string().trim().max(120).transform((v) => v || null),
  uf: z.string().trim().toUpperCase().max(2).transform((v) => v || null),
  latitude: coordOpc(-90, 90, "Latitude inválida."),
  longitude: coordOpc(-180, 180, "Longitude inválida."),
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
    cep: s("cep"),
    logradouro: s("logradouro"),
    enderecoNumero: s("enderecoNumero"),
    complemento: s("complemento"),
    bairro: s("bairro"),
    cidade: s("cidade"),
    uf: s("uf"),
    latitude: s("latitude"),
    longitude: s("longitude"),
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
    data: { ...d, endereco: comporEndereco(d), origem: "painel" },
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

  await prisma.visita.update({
    where: { id },
    data: { ...d, endereco: comporEndereco(d) },
  });

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
  const avisar = formData.get("notificar") !== null;

  const antes = await prisma.visita.findUnique({
    where: { id },
    select: { status: true, email: true, nome: true, endereco: true },
  });

  const atual = await prisma.visita.update({
    where: { id },
    data: { status, agendadaEm, observacoesInternas },
  });

  if (
    avisar &&
    antes &&
    antes.status !== status &&
    (status === "CONFIRMADA" || status === "CANCELADA")
  ) {
    try {
      await enviarAtualizacaoVisita({
        email: atual.email,
        nome: atual.nome,
        status,
        agendadaEm: atual.agendadaEm,
        endereco: atual.endereco,
      });
    } catch (err) {
      console.error("[visita] falha ao notificar o cliente:", err);
    }
  }

  revalidatePath(`/painel/visitas/${id}`);
  revalidatePath("/painel/visitas");
  revalidatePath("/painel");
}
