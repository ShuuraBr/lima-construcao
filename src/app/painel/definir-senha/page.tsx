import Link from "next/link";
import { prisma } from "@/lib/db";
import { hashToken } from "@/lib/auth";
import { Simbolo } from "@/components/marca/Simbolo";
import { SenhaForm } from "./SenhaForm";

type Props = { searchParams: Promise<{ token?: string }> };

export default async function DefinirSenhaPage({ searchParams }: Props) {
  const { token } = await searchParams;

  let valido = false;
  let nome = "";
  if (token) {
    const registro = await prisma.tokenAcesso.findUnique({
      where: { tokenHash: hashToken(token) },
      include: { usuario: true },
    });
    if (
      registro &&
      !registro.usadoEm &&
      registro.expiraEm > new Date() &&
      registro.usuario.ativo
    ) {
      valido = true;
      nome = registro.usuario.nome;
    }
  }

  return (
    <div className="on-dark grid min-h-dvh place-items-center px-5 py-12">
      <div className="w-full max-w-[380px]">
        <div className="flex items-center gap-3">
          <Simbolo className="h-8 w-auto text-branco" />
          <span className="font-display text-base font-black tracking-[0.16em] text-branco">
            LIMA
          </span>
        </div>

        {valido ? (
          <>
            <h1 className="mt-8 text-2xl font-extrabold text-branco">
              Bem-vindo, {nome.split(" ")[0]}
            </h1>
            <p className="mt-2 text-sm text-texto-suave">
              Defina a senha que você vai usar para entrar no painel.
            </p>
            <SenhaForm token={token as string} />
          </>
        ) : (
          <>
            <h1 className="mt-8 text-2xl font-extrabold text-branco">
              Link inválido
            </h1>
            <p className="mt-2 text-sm text-texto-suave">
              Este convite não existe, já foi usado ou expirou. Peça um novo link
              ao Erick.
            </p>
            <Link
              href="/painel/entrar"
              className="mt-6 inline-block font-mono text-[0.62rem] uppercase tracking-[0.1em] text-texto-suave hover:text-acento-texto"
            >
              ← Ir para o login
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
