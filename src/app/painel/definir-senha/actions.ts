"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { hashSenha, hashToken } from "@/lib/auth";

export type EstadoSenha = { erro?: string };

const schema = z
  .object({
    token: z.string().min(10),
    senha: z.string().min(8, "A senha precisa de pelo menos 8 caracteres."),
    confirmar: z.string(),
  })
  .refine((d) => d.senha === d.confirmar, {
    message: "As senhas não conferem.",
    path: ["confirmar"],
  });

export async function definirSenhaAction(
  _prev: EstadoSenha,
  formData: FormData,
): Promise<EstadoSenha> {
  const parsed = schema.safeParse({
    token: formData.get("token"),
    senha: formData.get("senha"),
    confirmar: formData.get("confirmar"),
  });
  if (!parsed.success) {
    return { erro: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }

  const { token, senha } = parsed.data;
  const registro = await prisma.tokenAcesso.findUnique({
    where: { tokenHash: hashToken(token) },
    include: { usuario: true },
  });

  if (
    !registro ||
    registro.usadoEm ||
    registro.expiraEm < new Date() ||
    !registro.usuario.ativo
  ) {
    return { erro: "Este link de convite é inválido ou já expirou. Peça um novo ao Erick." };
  }

  const senhaHash = await hashSenha(senha);
  await prisma.$transaction([
    prisma.usuario.update({
      where: { id: registro.usuarioId },
      data: { senhaHash },
    }),
    prisma.tokenAcesso.update({
      where: { id: registro.id },
      data: { usadoEm: new Date() },
    }),
  ]);

  redirect("/painel/entrar?motivo=senha-definida");
}
