// Cria (ou reativa) o primeiro usuário do painel e imprime o link de convite
// para ele definir a senha.
//
//   node scripts/criar-admin.mjs "erick@limaconstrucao.com.br" "Erick Lima" "Engenheiro Responsável"
//
// A URL base vem de NEXT_PUBLIC_SITE_URL (ou http://localhost:3000).

import { createHash, randomBytes } from "node:crypto";
import { PrismaClient } from "@prisma/client";

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

const prisma = new PrismaClient({ datasourceUrl: urlDoBanco() });

const [email, nome, cargo] = process.argv.slice(2);
if (!email || !nome) {
  console.error('Uso: node scripts/criar-admin.mjs "<email>" "<nome>" ["<cargo>"]');
  process.exit(1);
}

const base = (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");
const bruto = randomBytes(32).toString("hex");
const tokenHash = createHash("sha256").update(bruto).digest("hex");

const usuario = await prisma.usuario.upsert({
  where: { email: email.toLowerCase() },
  update: { nome, cargo: cargo || undefined, ativo: true },
  create: { email: email.toLowerCase(), nome, cargo: cargo || "Colaborador" },
});

await prisma.tokenAcesso.updateMany({
  where: { usuarioId: usuario.id, tipo: "CONVITE", usadoEm: null },
  data: { usadoEm: new Date() },
});

await prisma.tokenAcesso.create({
  data: {
    tokenHash,
    tipo: "CONVITE",
    usuarioId: usuario.id,
    expiraEm: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
  },
});

console.log(`\nUsuário: ${usuario.nome} <${usuario.email}>`);
console.log(`Link para definir a senha (válido por 3 dias):\n`);
console.log(`  ${base}/painel/definir-senha?token=${bruto}\n`);

await prisma.$disconnect();
