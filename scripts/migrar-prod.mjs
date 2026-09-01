// Aplica as migrações pendentes no banco de produção.
//
// A Hostinger mexe no `%40` de senhas com `@` dentro de DATABASE_URL, então a
// conexão de produção usa as variáveis separadas DB_HOST / DB_PORT / DB_NAME /
// DB_USER / DB_PASS. Este script monta a URL a partir delas (com a codificação
// feita aqui, no código) e roda `prisma migrate deploy`.
//
// Usado no build da Hostinger (npm run build) e disponível como `npm run db:prod`.

import { spawnSync } from "node:child_process";

const host = process.env.DB_HOST?.trim();
if (!host) {
  // Ambiente local usa `npm run db:migrate`. Aqui só agimos quando as
  // variáveis de produção (DB_*) estão presentes — caso da Hostinger.
  console.log("[migrar-prod] DB_HOST não definido — pulando (ambiente local).");
  process.exit(0);
}

const name = (process.env.DB_NAME ?? "").trim();
const user = encodeURIComponent(
  (process.env.DB_USER ?? process.env.DB_NAME ?? "").trim(),
);
const pass = encodeURIComponent(process.env.DB_PASS ?? "");
const port = (process.env.DB_PORT ?? "3306").trim();
const url = `mysql://${user}:${pass}@${host}:${port}/${name}`;

const r = spawnSync(
  "npx",
  ["prisma", "migrate", "deploy"],
  { stdio: "inherit", env: { ...process.env, DATABASE_URL: url }, shell: true },
);

process.exit(r.status ?? 0);
