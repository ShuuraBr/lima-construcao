"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Simbolo } from "@/components/marca/Simbolo";
import { encerrarSessaoAction } from "@/app/painel/entrar/actions";

const ativos = [
  { href: "/painel", label: "Painel geral", exact: true },
  { href: "/painel/orcamentos", label: "Orçamentos" },
  { href: "/painel/contratos", label: "Contratos" },
  { href: "/painel/usuarios", label: "Usuários" },
];

const emBreve = ["Prestação de serviços", "Agenda de visitas", "Mapa de obras"];

export function Sidebar({ nome, cargo }: { nome: string; cargo: string }) {
  const pathname = usePathname();
  const [aberto, setAberto] = useState(false);

  const nav = (
    <nav className="flex h-full flex-col gap-1">
      <div className="flex items-center gap-3 px-5 pb-5">
        <Simbolo className="h-7 w-auto text-branco" />
        <span className="flex flex-col leading-none">
          <span className="font-display text-sm font-black tracking-[0.16em] text-branco">
            LIMA
          </span>
          <span className="mt-1 font-mono text-[0.5rem] uppercase tracking-[0.22em] text-texto-suave">
            Painel administrativo
          </span>
        </span>
      </div>

      <span className="px-5 pb-1.5 pt-2 font-mono text-[0.58rem] uppercase tracking-[0.18em] text-texto-suave">
        Operação
      </span>
      {ativos.map((item) => {
        const on = item.exact
          ? pathname === item.href
          : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setAberto(false)}
            aria-current={on ? "page" : undefined}
            className={`border-l-2 px-5 py-2.5 font-mono text-[0.72rem] uppercase tracking-[0.06em] transition-colors ${
              on
                ? "border-acento-texto bg-roxo/25 text-branco"
                : "border-transparent text-texto-suave hover:text-texto"
            }`}
          >
            {item.label}
          </Link>
        );
      })}

      <span className="px-5 pb-1.5 pt-5 font-mono text-[0.58rem] uppercase tracking-[0.18em] text-texto-suave">
        Em breve
      </span>
      {emBreve.map((label) => (
        <span
          key={label}
          className="px-5 py-2 font-mono text-[0.7rem] uppercase tracking-[0.06em] text-texto-suave/55"
        >
          {label}
        </span>
      ))}

      <div className="mt-auto border-t border-borda px-5 pb-4 pt-4">
        <p className="font-display text-sm font-bold text-branco">{nome}</p>
        <p className="font-mono text-[0.58rem] uppercase tracking-[0.1em] text-texto-suave">
          {cargo} · perfil único
        </p>
        <form action={encerrarSessaoAction}>
          <button
            type="submit"
            className="mt-3 font-mono text-[0.62rem] uppercase tracking-[0.1em] text-texto-suave hover:text-acento-texto"
          >
            Sair do painel
          </button>
        </form>
      </div>
    </nav>
  );

  return (
    <>
      {/* topo mobile */}
      <div className="on-dark sticky top-0 z-40 flex items-center justify-between border-b border-borda px-4 py-3 md:hidden">
        <span className="font-display text-sm font-black tracking-[0.16em] text-branco">
          LIMA · PAINEL
        </span>
        <button
          type="button"
          onClick={() => setAberto((v) => !v)}
          aria-expanded={aberto}
          className="flex h-9 w-9 items-center justify-center border border-borda text-branco"
        >
          <span className="sr-only">Menu</span>
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5">
            {aberto ? <path d="M3 3l12 12M15 3L3 15" /> : <path d="M2 4h14M2 9h14M2 14h14" />}
          </svg>
        </button>
      </div>

      {aberto && (
        <div className="on-dark fixed inset-0 top-[57px] z-30 overflow-y-auto py-4 md:hidden">
          {nav}
        </div>
      )}

      {/* sidebar desktop */}
      <aside className="on-dark hidden w-[248px] shrink-0 border-r border-borda py-5 md:block">
        <div className="sticky top-5 flex h-[calc(100dvh-2.5rem)] flex-col">
          {nav}
        </div>
      </aside>
    </>
  );
}
