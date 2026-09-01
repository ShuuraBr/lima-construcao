"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { conferirSenha, criarSessao, encerrarSessao } from "@/lib/auth";

export type EstadoLogin = { erro?: string };

const schema = z.object({
  email: z.string().trim().toLowerCase().email(),
  senha: z.string().min(1),
  de: z.string().nullish(),
});

export async function entrarAction(
  _prev: EstadoLogin,
  formData: FormData,
): Promise<EstadoLogin> {
  const parsed = schema.safeParse({
    email: formData.get("email"),
    senha: formData.get("senha"),
    de: formData.get("de") ?? undefined,
  });

  const generico = { erro: "E-mail ou senha incorretos." };
  if (!parsed.success) return generico;

  const { email, senha, de } = parsed.data;

  const usuario = await prisma.usuario.findUnique({ where: { email } });
  if (!usuario || !usuario.ativo || !usuario.senhaHash) return generico;

  const ok = await conferirSenha(senha, usuario.senhaHash);
  if (!ok) return generico;

  await prisma.usuario.update({
    where: { id: usuario.id },
    data: { ultimoAcesso: new Date() },
  });

  await criarSessao({
    id: usuario.id,
    nome: usuario.nome,
    cargo: usuario.cargo,
  });

  const destino = de && de.startsWith("/painel") ? de : "/painel";
  redirect(destino);
}

export async function encerrarSessaoAction() {
  await encerrarSessao();
  redirect("/painel/entrar");
}
