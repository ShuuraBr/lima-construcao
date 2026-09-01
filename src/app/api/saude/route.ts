import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/db";

// Diagnóstico da instância publicada: consegue falar com o banco?
// GET /api/saude            -> { db: "ok" | "erro", env: {...} }
// GET /api/saude?k=<16 primeiros chars do AUTH_SECRET>  -> inclui "detalhe" do erro
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const chaveOk =
    req.nextUrl.searchParams.get("k") ===
    (process.env.AUTH_SECRET ?? "indisponivel").slice(0, 16);

  let db: "ok" | "erro" = "erro";
  let detalhe: string | undefined;
  const inicio = Date.now();
  try {
    await prisma.$queryRaw`SELECT 1`;
    db = "ok";
  } catch (e) {
    detalhe = e instanceof Error ? `${e.name}: ${e.message}` : String(e);
  }

  return NextResponse.json(
    {
      db,
      ms: Date.now() - inicio,
      env: {
        DATABASE_URL: Boolean(process.env.DATABASE_URL),
        DB_HOST: process.env.DB_HOST ?? null,
        DB_PORT: process.env.DB_PORT ?? null,
        DB_NAME: process.env.DB_NAME ?? null,
        DB_USER: Boolean(process.env.DB_USER || process.env.DB_NAME),
        DB_PASS: Boolean(process.env.DB_PASS),
        AUTH_SECRET: Boolean(process.env.AUTH_SECRET),
        NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL ?? null,
      },
      ...(chaveOk && detalhe ? { detalhe } : {}),
    },
    { status: db === "ok" ? 200 : 503 },
  );
}
