"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import type { ServicoTipo } from "@prisma/client";
import { prisma } from "@/lib/db";
import { exigirSessao } from "@/lib/painel";
import {
  comporEndereco,
  dadosEndereco,
  type PartesEndereco,
} from "@/lib/endereco";
import {
  CONTRATO_STATUS,
  SERVICOS_CONTRATO,
} from "@/lib/painel-shared";

export type EstadoContrato = {
  erro?: string;
  valores?: Record<string, string>;
};

const dataOpc = z
  .string()
  .trim()
  .transform((v) => (v ? v : null))
  .refine((v) => v === null || !Number.isNaN(Date.parse(v)), "Data inválida.")
  .transform((v) => (v ? new Date(v) : null));

const coordOpc = (min: number, max: number, msg: string) =>
  z
    .string()
    .trim()
    .transform((v) => v.replace(",", ".").replace(/[^\d.\-]/g, ""))
    .transform((v) => (v === "" || v === "-" ? null : Number(v)))
    .refine(
      (v) => v === null || (!Number.isNaN(v) && v >= min && v <= max),
      msg,
    );

const contratoSchema = z.object({
  clienteNome: z.string().trim().min(2, "Informe o cliente."),
  clienteEmpresa: z.string().trim().max(160).transform((v) => v || null),
  clienteEmail: z
    .string()
    .trim()
    .transform((v) => v || null)
    .refine((v) => !v || z.string().email().safeParse(v).success, "E-mail inválido."),
  clienteTelefone: z.string().trim().max(40).transform((v) => v || null),
  cep: z.string().trim().max(9).transform((v) => v || null),
  logradouro: z.string().trim().min(2, "Informe o logradouro da obra.").max(180),
  enderecoNumero: z.string().trim().max(30).transform((v) => v || null),
  complemento: z.string().trim().max(120).transform((v) => v || null),
  bairro: z.string().trim().max(120).transform((v) => v || null),
  cidade: z.string().trim().max(120).transform((v) => v || null),
  uf: z.string().trim().toUpperCase().max(2).transform((v) => v || null),
  latitude: coordOpc(-90, 90, "Latitude inválida."),
  longitude: coordOpc(-180, 180, "Longitude inválida."),
  servicos: z
    .array(z.enum(SERVICOS_CONTRATO))
    .min(1, "Selecione ao menos uma frente."),
  valor: z
    .string()
    .trim()
    .transform((v) => v.replace(/\./g, "").replace(",", ".").replace(/[^\d.]/g, ""))
    .refine((v) => v !== "" && Number(v) >= 0, "Valor inválido.")
    .transform((v) => Number(v)),
  status: z.enum(CONTRATO_STATUS),
  progresso: z
    .string()
    .trim()
    .transform((v) => Math.min(100, Math.max(0, Number(v || 0) || 0))),
  dataAssinatura: dataOpc,
  inicioPrevisto: dataOpc,
  entregaPrevista: dataOpc,
  entregaReal: dataOpc,
  observacoes: z.string().trim().max(4000).transform((v) => v || null),
  pedidoOrcamentoId: z.string().transform((v) => v || null),
});

function lerForm(formData: FormData) {
  const s = (k: string) => String(formData.get(k) ?? "");
  return {
    clienteNome: s("clienteNome"),
    clienteEmpresa: s("clienteEmpresa"),
    clienteEmail: s("clienteEmail"),
    clienteTelefone: s("clienteTelefone"),
    cep: s("cep"),
    logradouro: s("logradouro"),
    enderecoNumero: s("enderecoNumero"),
    complemento: s("complemento"),
    bairro: s("bairro"),
    cidade: s("cidade"),
    uf: s("uf"),
    latitude: s("latitude"),
    longitude: s("longitude"),
    servicos: formData.getAll("servicos").map(String),
    valor: s("valor"),
    status: s("status"),
    progresso: s("progresso"),
    dataAssinatura: s("dataAssinatura"),
    inicioPrevisto: s("inicioPrevisto"),
    entregaPrevista: s("entregaPrevista"),
    entregaReal: s("entregaReal"),
    observacoes: s("observacoes"),
    pedidoOrcamentoId: s("pedidoOrcamentoId"),
  };
}

function gravarEndereco(d: PartesEndereco) {
  return { enderecoObra: comporEndereco(d), ...dadosEndereco(d) };
}

async function gerarNumero() {
  const ano = new Date().getFullYear();
  const prefixo = `CT-${ano}-`;
  const ultimo = await prisma.contrato.findFirst({
    where: { numero: { startsWith: prefixo } },
    orderBy: { numero: "desc" },
    select: { numero: true },
  });
  const seq = ultimo ? Number(ultimo.numero.slice(prefixo.length)) + 1 : 1;
  return `${prefixo}${String(seq).padStart(3, "0")}`;
}

export async function criarContratoAction(
  _prev: EstadoContrato,
  formData: FormData,
): Promise<EstadoContrato> {
  await exigirSessao();
  const bruto = lerForm(formData);
  const parsed = contratoSchema.safeParse(bruto);
  if (!parsed.success) {
    return {
      erro: parsed.error.issues[0]?.message ?? "Revise os campos.",
      valores: planificar(bruto),
    };
  }
  const d = parsed.data;

  const contrato = await prisma.contrato.create({
    data: {
      numero: await gerarNumero(),
      status: d.status,
      clienteNome: d.clienteNome,
      clienteEmpresa: d.clienteEmpresa,
      clienteEmail: d.clienteEmail,
      clienteTelefone: d.clienteTelefone,
      ...gravarEndereco(d),
      latitude: d.latitude,
      longitude: d.longitude,
      servicos: d.servicos as string[],
      valor: d.valor,
      progresso: d.progresso,
      dataAssinatura: d.dataAssinatura,
      inicioPrevisto: d.inicioPrevisto,
      entregaPrevista: d.entregaPrevista,
      entregaReal: d.entregaReal,
      observacoes: d.observacoes,
      pedidoOrcamentoId: d.pedidoOrcamentoId,
    },
  });

  revalidatePath("/painel/contratos");
  revalidatePath("/painel");
  redirect(`/painel/contratos/${contrato.id}`);
}

export async function atualizarContratoAction(
  _prev: EstadoContrato,
  formData: FormData,
): Promise<EstadoContrato> {
  await exigirSessao();
  const id = String(formData.get("id") ?? "");
  const bruto = lerForm(formData);
  const parsed = contratoSchema.safeParse(bruto);
  if (!parsed.success) {
    return {
      erro: parsed.error.issues[0]?.message ?? "Revise os campos.",
      valores: planificar(bruto),
    };
  }
  const d = parsed.data;

  await prisma.contrato.update({
    where: { id },
    data: {
      status: d.status,
      clienteNome: d.clienteNome,
      clienteEmpresa: d.clienteEmpresa,
      clienteEmail: d.clienteEmail,
      clienteTelefone: d.clienteTelefone,
      ...gravarEndereco(d),
      latitude: d.latitude,
      longitude: d.longitude,
      servicos: d.servicos as string[],
      valor: d.valor,
      progresso: d.progresso,
      dataAssinatura: d.dataAssinatura,
      inicioPrevisto: d.inicioPrevisto,
      entregaPrevista: d.entregaPrevista,
      entregaReal: d.entregaReal,
      observacoes: d.observacoes,
    },
  });

  revalidatePath(`/painel/contratos/${id}`);
  revalidatePath("/painel/contratos");
  revalidatePath("/painel");
  redirect(`/painel/contratos/${id}`);
}

const statusSchema = z.object({
  id: z.string().min(1),
  status: z.enum(CONTRATO_STATUS),
  progresso: z
    .string()
    .optional()
    .transform((v) => Math.min(100, Math.max(0, Number(v || 0) || 0))),
});

export async function mudarStatusContratoAction(formData: FormData) {
  await exigirSessao();
  const parsed = statusSchema.safeParse({
    id: formData.get("id"),
    status: formData.get("status"),
    progresso: formData.get("progresso"),
  });
  if (!parsed.success) return;

  const { id, status, progresso } = parsed.data;
  const concluido = status === "CONCLUIDO";
  const atual = concluido
    ? await prisma.contrato.findUnique({
        where: { id },
        select: { entregaReal: true },
      })
    : null;

  await prisma.contrato.update({
    where: { id },
    data: {
      status,
      progresso: concluido ? 100 : progresso,
      entregaReal: concluido ? (atual?.entregaReal ?? new Date()) : undefined,
    },
  });

  revalidatePath(`/painel/contratos/${id}`);
  revalidatePath("/painel/contratos");
  revalidatePath("/painel");
}

// ---------- apontamentos (prestação de serviço) ----------

const apontamentoSchema = z.object({
  contratoId: z.string().min(1),
  data: z
    .string()
    .trim()
    .transform((v) => (v && !Number.isNaN(Date.parse(v)) ? new Date(v) : new Date())),
  frente: z
    .string()
    .trim()
    .transform((v) => (v ? v : null))
    .refine(
      (v) => v === null || (SERVICOS_CONTRATO as readonly string[]).includes(v),
      "Frente inválida.",
    ),
  progresso: z
    .string()
    .trim()
    .transform((v) => Math.min(100, Math.max(0, Number(v || 0) || 0))),
  status: z.enum(CONTRATO_STATUS),
  nota: z.string().trim().max(2000).transform((v) => v || null),
});

export type EstadoApontamento = { erro?: string; ok?: boolean };

export async function registrarApontamentoAction(
  _prev: EstadoApontamento,
  formData: FormData,
): Promise<EstadoApontamento> {
  const sessao = await exigirSessao();
  const parsed = apontamentoSchema.safeParse({
    contratoId: formData.get("contratoId"),
    data: String(formData.get("data") ?? ""),
    frente: String(formData.get("frente") ?? ""),
    progresso: String(formData.get("progresso") ?? ""),
    status: formData.get("status"),
    nota: String(formData.get("nota") ?? ""),
  });
  if (!parsed.success) {
    return { erro: parsed.error.issues[0]?.message ?? "Revise os campos." };
  }
  const d = parsed.data;

  const contrato = await prisma.contrato.findUnique({
    where: { id: d.contratoId },
    select: { entregaReal: true },
  });
  if (!contrato) return { erro: "Contrato não encontrado." };

  const concluido = d.status === "CONCLUIDO";
  const progresso = concluido ? 100 : d.progresso;

  await prisma.$transaction([
    prisma.apontamento.create({
      data: {
        contratoId: d.contratoId,
        data: d.data,
        frente: d.frente as ServicoTipo | null,
        progresso,
        status: d.status,
        nota: d.nota,
        autorId: sessao.id,
        autorNome: sessao.nome,
      },
    }),
    prisma.contrato.update({
      where: { id: d.contratoId },
      data: {
        status: d.status,
        progresso,
        entregaReal: concluido
          ? (contrato.entregaReal ?? d.data)
          : undefined,
      },
    }),
  ]);

  revalidatePath(`/painel/contratos/${d.contratoId}`);
  revalidatePath("/painel/contratos");
  revalidatePath("/painel/prestacao-servicos");
  revalidatePath("/painel");
  return { ok: true };
}

function planificar(bruto: ReturnType<typeof lerForm>): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(bruto)) {
    if (typeof v === "string") out[k] = v;
    else if (Array.isArray(v)) out[k] = v.map(String).join(",");
  }
  return out;
}
