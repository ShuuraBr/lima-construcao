import "server-only";
import { redirect } from "next/navigation";
import { getSessao, type Sessao } from "@/lib/auth";

export * from "@/lib/painel-shared";

/** Server Components / Actions do painel: devolve a sessão ou manda pro login. */
export async function exigirSessao(): Promise<Sessao> {
  const s = await getSessao();
  if (!s) redirect("/painel/entrar");
  return s;
}
