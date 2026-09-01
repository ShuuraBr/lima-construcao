"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Logo } from "@/components/marca/Logo";
import { Container } from "@/components/ui/Container";
import { nav } from "@/lib/site";

export function Header() {
  const pathname = usePathname();
  const [aberto, setAberto] = useState(false);
  const fechar = () => setAberto(false);

  useEffect(() => {
    document.body.style.overflow = aberto ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [aberto]);

  return (
    <header className="sticky top-0 z-50 border-b border-borda bg-preto/85 backdrop-blur-md">
      <Container className="flex min-h-16 items-center gap-6">
        <Link
          href="/"
          onClick={fechar}
          aria-label="Lima Construção e Instalação — página inicial"
        >
          <Logo />
        </Link>

        <nav className="ml-auto hidden items-center gap-1 md:flex">
          {nav.map((item) => {
            const ativo = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={ativo ? "page" : undefined}
                className={`px-3 py-2 font-mono text-[0.7rem] uppercase tracking-[0.11em] transition-colors hover:text-roxo-realce ${
                  ativo ? "text-roxo-realce" : "text-texto-suave"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
          <Link
            href="/orcamento"
            className="ml-3 bg-roxo px-4 py-2.5 font-mono text-[0.68rem] uppercase tracking-[0.1em] text-branco transition-colors hover:bg-roxo-realce"
          >
            Solicitar orçamento
          </Link>
        </nav>

        <button
          type="button"
          onClick={() => setAberto((v) => !v)}
          aria-expanded={aberto}
          aria-controls="menu-mobile"
          className="ml-auto flex h-10 w-10 items-center justify-center border border-borda text-texto-forte md:hidden"
        >
          <span className="sr-only">{aberto ? "Fechar menu" : "Abrir menu"}</span>
          <svg
            width="18"
            height="18"
            viewBox="0 0 18 18"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            {aberto ? (
              <path d="M3 3l12 12M15 3L3 15" />
            ) : (
              <path d="M2 4h14M2 9h14M2 14h14" />
            )}
          </svg>
        </button>
      </Container>

      {aberto && (
        <div id="menu-mobile" className="border-t border-borda bg-preto md:hidden">
          <Container className="flex flex-col py-4">
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={fechar}
                className="border-b border-borda py-3 font-mono text-sm uppercase tracking-[0.1em] text-texto"
              >
                {item.label}
              </Link>
            ))}
            <Link
              href="/orcamento"
              onClick={fechar}
              className="mt-4 bg-roxo px-4 py-3.5 text-center font-mono text-[0.72rem] uppercase tracking-[0.1em] text-branco"
            >
              Solicitar orçamento
            </Link>
          </Container>
        </div>
      )}
    </header>
  );
}
