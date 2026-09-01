"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { exigirSessao } from "@/lib/painel";
import { CONTRATO_STATUS, SERVICOS_CONTRATO } from "@/lib/painel-shared";

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

const contratoSchema = z.object({
  clienteNome: z.string().trim().min(2, "Informe o cliente."),
  clienteEmpresa: z.string().trim().max(160).transform((v) => v || null),
  clienteEmail: z
    .string()
    .trim()
    .transform((v) => v || null)
    .refine((v) => !v || z.string().email().safeParse(v).success, "E-mail inválido."),
  clienteTelefone: z.string().trim().max(40).transform((v) => v || null),
  enderecoObra: z.string().trim().min(4, "Informe o endereço da obra."),
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
    enderecoObra: s("enderecoObra"),
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
      enderecoObra: d.enderecoObra,
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
      enderecoObra: d.enderecoObra,
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

function planificar(bruto: ReturnType<typeof lerForm>): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(bruto)) {
    if (typeof v === "string") out[k] = v;
    else if (Array.isArray(v)) out[k] = v.map(String).join(",");
  }
  return out;
}
