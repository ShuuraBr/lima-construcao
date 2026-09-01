import { PrismaClient } from "@prisma/client";

/**
 * Monta a string de conexão. Se DB_HOST estiver definido, usa as variáveis
 * separadas (DB_HOST / DB_PORT / DB_NAME / DB_USER / DB_PASS) — assim a senha
 * pode ter caracteres especiais (@, :, / …) sem quebrar a URL. Caso contrário,
 * usa DATABASE_URL diretamente.
 */
export function urlDoBanco(): string | undefined {
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

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasourceUrl: urlDoBanco(),
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
