import Link from "next/link";
import { redirect } from "next/navigation";
import { Simbolo } from "@/components/marca/Simbolo";
import { getSessao } from "@/lib/auth";
import { LoginForm } from "./LoginForm";

type Props = {
  searchParams: Promise<{ de?: string; motivo?: string }>;
};

export default async function EntrarPage({ searchParams }: Props) {
  if (await getSessao()) redirect("/painel");
  const { de, motivo } = await searchParams;

  return (
    <div className="on-dark grid min-h-dvh place-items-center px-5 py-12">
      <div className="w-full max-w-[380px]">
        <div className="flex items-center gap-3">
          <Simbolo className="h-8 w-auto text-branco" />
          <span className="flex flex-col leading-none">
            <span className="font-display text-base font-black tracking-[0.16em] text-branco">
              LIMA
            </span>
            <span className="mt-1 font-mono text-[0.52rem] uppercase tracking-[0.22em] text-texto-suave">
              Painel administrativo
            </span>
          </span>
        </div>

        <h1 className="mt-8 text-2xl font-extrabold text-branco">
          Acesso restrito
        </h1>
        <p className="mt-2 text-sm text-texto-suave">
          Uso interno da Lima. O acesso é liberado pelo Erick por convite.
        </p>

        {motivo === "senha-definida" && (
          <p className="mt-4 border border-borda bg-roxo/15 px-3 py-2 font-mono text-[0.66rem] tracking-[0.02em] text-branco">
            Senha definida. Faça login para entrar.
          </p>
        )}

        <LoginForm de={de} />

        <p className="mt-6 font-mono text-[0.6rem] leading-relaxed tracking-[0.03em] text-texto-suave">
          Novo usuário recebe um link de convite por e-mail para criar a própria
          senha. Nenhuma senha trafega em texto.
        </p>
        <Link
          href="/"
          className="mt-4 inline-block font-mono text-[0.62rem] uppercase tracking-[0.1em] text-texto-suave hover:text-acento-texto"
        >
          ← Voltar ao site
        </Link>
      </div>
    </div>
  );
}
