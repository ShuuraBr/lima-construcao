"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { exigirSessao } from "@/lib/painel";
import { gerarToken } from "@/lib/auth";
import { enviarConviteAcesso } from "@/lib/mail";

export type EstadoConvite = {
  ok?: boolean;
  erro?: string;
  link?: string;
  enviado?: boolean;
};

async function origem() {
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host");
  const proto = h.get("x-forwarded-proto") ?? "http";
  if (host) return `${proto}://${host}`;
  return (process.env.NEXT_PUBLIC_SITE_URL ?? "").replace(/\/$/, "");
}

const DIAS_CONVITE = 3;

async function novoConvite(usuarioId: string, email: string, nome: string) {
  await prisma.tokenAcesso.updateMany({
    where: { usuarioId, tipo: "CONVITE", usadoEm: null },
    data: { usadoEm: new Date() },
  });

  const { bruto, hash } = gerarToken();
  await prisma.tokenAcesso.create({
    data: {
      tokenHash: hash,
      tipo: "CONVITE",
      usuarioId,
      expiraEm: new Date(Date.now() + DIAS_CONVITE * 24 * 60 * 60 * 1000),
    },
  });

  const link = `${await origem()}/painel/definir-senha?token=${bruto}`;
  const r = await enviarConviteAcesso({ email, nome, link });
  return { link, enviado: r.enviado };
}

const convidarSchema = z.object({
  nome: z.string().trim().min(2, "Informe o nome."),
  email: z.string().trim().toLowerCase().email("E-mail inválido."),
  cargo: z.string().trim().max(60).optional(),
});

export async function convidarAction(
  _prev: EstadoConvite,
  formData: FormData,
): Promise<EstadoConvite> {
  await exigirSessao();

  const parsed = convidarSchema.safeParse({
    nome: formData.get("nome"),
    email: formData.get("email"),
    cargo: formData.get("cargo") || undefined,
  });
  if (!parsed.success) {
    return { erro: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }
  const { nome, email, cargo } = parsed.data;

  const existente = await prisma.usuario.findUnique({ where: { email } });
  if (existente?.senhaHash) {
    return { erro: "Já existe um usuário ativo com esse e-mail." };
  }

  const usuario =
    existente ??
    (await prisma.usuario.create({
      data: { nome, email, cargo: cargo || "Colaborador" },
    }));

  if (existente) {
    await prisma.usuario.update({
      where: { id: usuario.id },
      data: { nome, cargo: cargo || existente.cargo, ativo: true },
    });
  }

  const { link, enviado } = await novoConvite(usuario.id, email, nome);
  revalidatePath("/painel/usuarios");
  return { ok: true, link, enviado };
}

export async function reenviarConviteAction(
  _prev: EstadoConvite,
  formData: FormData,
): Promise<EstadoConvite> {
  await exigirSessao();
  const id = String(formData.get("id") ?? "");
  const usuario = await prisma.usuario.findUnique({ where: { id } });
  if (!usuario) return { erro: "Usuário não encontrado." };

  const { link, enviado } = await novoConvite(
    usuario.id,
    usuario.email,
    usuario.nome,
  );
  revalidatePath("/painel/usuarios");
  return { ok: true, link, enviado };
}

export async function alternarAtivoAction(formData: FormData) {
  const sessao = await exigirSessao();
  const id = String(formData.get("id") ?? "");
  if (id === sessao.id) return; // não desativa a si mesmo

  const usuario = await prisma.usuario.findUnique({ where: { id } });
  if (!usuario) return;

  await prisma.usuario.update({
    where: { id },
    data: { ativo: !usuario.ativo },
  });
  revalidatePath("/painel/usuarios");
}
