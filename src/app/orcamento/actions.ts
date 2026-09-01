"use server";

import { createHash } from "node:crypto";
import { headers } from "next/headers";
import { prisma } from "@/lib/db";
import { enviarNotificacaoOrcamento } from "@/lib/mail";
import { pedidoOrcamentoSchema, servicoParaEnum } from "@/lib/validation";
import type { ServicoTipo } from "@prisma/client";

export type EstadoOrcamento = {
  status: "idle" | "sucesso" | "erro";
  protocolo?: string;
  mensagem?: string;
  erros?: Record<string, string>;
  valores?: Record<string, string>;
};

function gerarProtocolo() {
  const ano = new Date().getFullYear().toString().slice(2);
  const rnd = Math.floor(Math.random() * 9000) + 1000;
  return `OR-${ano}${rnd}`;
}

async function hashIp() {
  try {
    const h = await headers();
    const ip =
      h.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      h.get("x-real-ip") ||
      "";
    if (!ip) return null;
    return createHash("sha256")
      .update(ip + (process.env.DATABASE_URL ?? ""))
      .digest("hex")
      .slice(0, 32);
  } catch {
    return null;
  }
}

export async function enviarPedidoOrcamento(
  _prev: EstadoOrcamento,
  formData: FormData,
): Promise<EstadoOrcamento> {
  const ANEXO_MAX = 9 * 1024 * 1024; // ~9 MB (limite do server action é 10 MB)
  const anexoFile = formData.get("anexo");
  const temAnexo = anexoFile instanceof File && anexoFile.size > 0;
  const anexoNome = temAnexo ? anexoFile.name : "";
  const anexoGrande = temAnexo && anexoFile.size > ANEXO_MAX;

  const bruto = {
    nome: formData.get("nome"),
    empresa: formData.get("empresa"),
    email: formData.get("email"),
    telefone: formData.get("telefone"),
    servico: formData.get("servico"),
    enderecoObra: formData.get("enderecoObra"),
    metragemM2: formData.get("metragemM2"),
    prazoDesejado: formData.get("prazoDesejado"),
    dataInicio: formData.get("dataInicio"),
    mensagem: formData.get("mensagem"),
    anexoNome,
    website: formData.get("website"),
  };

  const valores: Record<string, string> = {};
  for (const [k, v] of Object.entries(bruto)) {
    if (typeof v === "string" && k !== "website") valores[k] = v;
  }

  const parsed = pedidoOrcamentoSchema.safeParse(bruto);
  if (!parsed.success) {
    const erros: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const campo = String(issue.path[0] ?? "form");
      if (!erros[campo]) erros[campo] = issue.message;
    }
    // honeypot preenchido: responde como sucesso, sem processar
    if (erros.website) {
      return { status: "sucesso", protocolo: gerarProtocolo() };
    }
    return {
      status: "erro",
      mensagem: "Revise os campos destacados.",
      erros,
      valores,
    };
  }

  const dados = parsed.data;
  const protocolo = gerarProtocolo();
  const dataInicio = dados.dataInicio ? new Date(dados.dataInicio) : null;

  let anexoEmail: { filename: string; content: Buffer } | null = null;
  if (temAnexo && !anexoGrande) {
    try {
      anexoEmail = {
        filename: anexoFile.name,
        content: Buffer.from(await anexoFile.arrayBuffer()),
      };
    } catch (err) {
      console.error("[orcamento] falha ao ler o anexo:", err);
    }
  }

  const resumo = {
    protocolo,
    nome: dados.nome,
    empresa: dados.empresa || null,
    email: dados.email,
    telefone: dados.telefone,
    servico: dados.servico,
    enderecoObra: dados.enderecoObra,
    metragemM2: dados.metragemM2 ?? null,
    prazoDesejado: dados.prazoDesejado || null,
    dataInicio,
    mensagem: anexoGrande
      ? `${dados.mensagem ? dados.mensagem + "\n\n" : ""}[Anexo "${anexoNome}" excede o limite de envio pelo site — solicitar por e-mail.]`
      : dados.mensagem || null,
    anexoNome: anexoNome || null,
    anexo: anexoEmail,
  };

  let gravado = false;
  try {
    await prisma.pedidoOrcamento.create({
      data: {
        protocolo,
        nome: dados.nome,
        empresa: dados.empresa || null,
        email: dados.email,
        telefone: dados.telefone,
        servico: servicoParaEnum(dados.servico) as ServicoTipo,
        enderecoObra: dados.enderecoObra,
        metragemM2: dados.metragemM2 ?? null,
        prazoDesejado: dados.prazoDesejado || null,
        dataInicio,
        mensagem: dados.mensagem || null,
        anexoNome: dados.anexoNome || null,
        ipHash: await hashIp(),
      },
    });
    gravado = true;
  } catch (err) {
    console.error("[orcamento] falha ao gravar no banco:", err);
  }

  let notificado = false;
  try {
    const r = await enviarNotificacaoOrcamento(resumo);
    notificado = r.enviado;
  } catch (err) {
    console.error("[orcamento] falha ao enviar notificação:", err);
  }

  if (!gravado && !notificado) {
    return {
      status: "erro",
      mensagem:
        "Não foi possível registrar o pedido agora. Tente novamente em instantes ou fale pelo WhatsApp.",
      valores,
    };
  }

  return { status: "sucesso", protocolo };
}
