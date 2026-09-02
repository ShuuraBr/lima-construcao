// Define/redefine a senha de um usuário do painel diretamente (sem link de convite).
//
//   node scripts/definir-senha.mjs "teste@limaconstrucao.com.br" "nova-senha-forte"
//
// Em produção (Hostinger), as variáveis DB_HOST / DB_PORT / DB_NAME / DB_USER /
// DB_PASS já estão no ambiente. Localmente usa DATABASE_URL.

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

function urlDoBanco() {
  const host = process.env.DB_HOST?.trim();
  if (host) {
    const name = (process.env.DB_NAME ?? "").trim();
    const user = encodeURIComponent(
      (process.env.DB_USER ?? process.env.DB_NAME ?? "").trim(),
    );
    const pass = encodeURIComponent(process.env.DB_PASS ?? "");
    const port = (process.env.DB_PORT ?? "3306").trim();
    return `mysql://${user}:${pass}@${host}:${port}/${name}`;
  }
  return process.env.DATABASE_URL;
}

const [email, senha] = process.argv.slice(2);
if (!email || !senha) {
  console.error('Uso: node scripts/definir-senha.mjs "<email>" "<senha>"');
  process.exit(1);
}
if (senha.length < 8) {
  console.error("A senha precisa ter ao menos 8 caracteres.");
  process.exit(1);
}

const prisma = new PrismaClient({ datasourceUrl: urlDoBanco() });

const senhaHash = await bcrypt.hash(senha, 12);
const u = await prisma.usuario.update({
  where: { email: email.toLowerCase() },
  data: { senhaHash, ativo: true },
});

// invalida convites pendentes desse usuário
await prisma.tokenAcesso.updateMany({
  where: { usuarioId: u.id, usadoEm: null },
  data: { usadoEm: new Date() },
});

console.log(`\nSenha definida para ${u.nome} <${u.email}>.`);
console.log(`Entre em /painel/entrar com essa senha.\n`);

await prisma.$disconnect();
