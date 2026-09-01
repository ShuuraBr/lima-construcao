import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PUBLICAS = ["/painel/entrar", "/painel/definir-senha"];

/**
 * Redireciona para o login antes de renderizar quando não há cookie de sessão.
 * A verificação real da assinatura do JWT é feita no layout do painel
 * (`getSessao`) — aqui é só UX para não piscar conteúdo protegido.
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (PUBLICAS.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  const temSessao = request.cookies.has("lima_sessao");
  if (!temSessao) {
    const url = request.nextUrl.clone();
    url.pathname = "/painel/entrar";
    url.searchParams.set("de", pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/painel/:path*"],
};
