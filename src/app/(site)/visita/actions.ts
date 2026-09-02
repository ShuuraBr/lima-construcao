"use server";

import { createHash } from "node:crypto";
import { headers } from "next/headers";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { enviarNotificacaoVisita } from "@/lib/mail";
import { comporEndereco } from "@/lib/endereco";

export type EstadoVisita = {
  status: "idle" | "sucesso" | "erro";
  mensagem?: string;
  erros?: Record<string, string>;
  valores?: Record<string, string>;
};

const opc = (max: number) =>
  z.string().trim().max(max).optional().transform((v) => v || null);

const schema = z.object({
  nome: z.string().trim().min(2, "Informe seu nome."),
  empresa: z.string().trim().max(160).optional(),
  email: z.string().trim().toLowerCase().email("E-mail inválido."),
  telefone: z.string().trim().min(8, "Informe um telefone."),
  cep: opc(9),
  logradouro: z.string().trim().min(2, "Informe o endereço da obra.").max(180),
  enderecoNumero: opc(30),
  complemento: opc(120),
  bairro: opc(120),
  cidade: opc(120),
  uf: z.string().trim().toUpperCase().max(2).optional().transform((v) => v || null),
  latitude: opc(24),
  longitude: opc(24),
  preferencia: z.string().trim().max(400).optional(),
  mensagem: z.string().trim().max(2000).optional(),
  website: z.string().max(0).optional(), // honeypot
});

async function hashIp() {
  try {
    const h = await headers();
    const ip =
      h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || "";
    if (!ip) return null;
    return createHash("sha256")
      .update(ip + (process.env.AUTH_SECRET ?? ""))
      .digest("hex")
      .slice(0, 32);
  } catch {
    return null;
  }
}

export async function solicitarVisita(
  _prev: EstadoVisita,
  formData: FormData,
): Promise<EstadoVisita> {
  const g = (k: string) => formData.get(k);
  const bruto = {
    nome: g("nome"),
    empresa: g("empresa"),
    email: g("email"),
    telefone: g("telefone"),
    cep: g("cep"),
    logradouro: g("logradouro"),
    enderecoNumero: g("enderecoNumero"),
    complemento: g("complemento"),
    bairro: g("bairro"),
    cidade: g("cidade"),
    uf: g("uf"),
    latitude: g("latitude"),
    longitude: g("longitude"),
    preferencia: g("preferencia"),
    mensagem: g("mensagem"),
    website: g("website"),
  };

  const valores: Record<string, string> = {};
  for (const [k, val] of Object.entries(bruto)) {
    if (typeof val === "string" && k !== "website") valores[k] = val;
  }

  const parsed = schema.safeParse(bruto);
  if (!parsed.success) {
    const erros: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const campo = String(issue.path[0] ?? "form");
      if (!erros[campo]) erros[campo] = issue.message;
    }
    if (erros.website) return { status: "sucesso" };
    return { status: "erro", mensagem: "Revise os campos destacados.", erros, valores };
  }

  const d = parsed.data;
  const endereco = comporEndereco({
    logradouro: d.logradouro,
    enderecoNumero: d.enderecoNumero,
    complemento: d.complemento,
    bairro: d.bairro,
    cidade: d.cidade,
    uf: d.uf,
    cep: d.cep,
  });
  const num = (s: string | null) =>
    s && !Number.isNaN(Number(s)) ? Number(s) : null;

  let gravado = false;
  try {
    await prisma.visita.create({
      data: {
        nome: d.nome,
        empresa: d.empresa || null,
        email: d.email,
        telefone: d.telefone,
        endereco,
        cep: d.cep,
        logradouro: d.logradouro,
        enderecoNumero: d.enderecoNumero,
        complemento: d.complemento,
        bairro: d.bairro,
        cidade: d.cidade,
        uf: d.uf,
        latitude: num(d.latitude),
        longitude: num(d.longitude),
        preferencia: d.preferencia || null,
        mensagem: d.mensagem || null,
        ipHash: await hashIp(),
      },
    });
    gravado = true;
  } catch (err) {
    console.error("[visita] falha ao gravar no banco:", err);
  }

  let notificado = false;
  try {
    const r = await enviarNotificacaoVisita({ ...d, endereco });
    notificado = r.enviado;
  } catch (err) {
    console.error("[visita] falha ao notificar:", err);
  }

  if (!gravado && !notificado) {
    return {
      status: "erro",
      mensagem:
        "Não foi possível registrar a solicitação agora. Tente novamente ou fale pelo WhatsApp.",
      valores,
    };
  }

  return { status: "sucesso" };
}
