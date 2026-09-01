import Link from "next/link";
import type { Servico } from "@/lib/site";

export function ServiceCard({
  servico,
  indice,
}: {
  servico: Servico;
  indice: number;
}) {
  return (
    <Link
      href={`/servicos/${servico.slug}`}
      className="group relative block overflow-hidden border border-borda bg-superficie p-6 transition-[border-color,transform] duration-200 hover:-translate-y-0.5 hover:border-borda-forte"
    >
      {/* canto facetado que acende no hover */}
      <span
        aria-hidden
        className="absolute right-0 top-0 border-l-[34px] border-t-[34px] border-l-transparent border-t-roxo opacity-0 transition-opacity duration-200 group-hover:opacity-100"
      />
      <span className="font-mono text-xs tracking-[0.1em] text-texto-suave">
        {String(indice).padStart(2, "0")}
      </span>
      <h3 className="mt-3.5 text-lg font-bold text-texto-forte">
        {servico.nome}
      </h3>
      <p className="mt-2 text-sm text-texto-suave">{servico.resumo}</p>
      <span className="mt-4 block font-mono text-[0.68rem] uppercase tracking-[0.06em] text-roxo-realce">
        {servico.spec}
      </span>
    </Link>
  );
}
