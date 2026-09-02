import Link from "next/link";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { exigirSessao } from "@/lib/painel";
import {
  VISITA_STATUS,
  fmtData,
  fmtDataHora,
  visitaStatusMeta,
  type VisitaStatusT,
} from "@/lib/painel";
import { StatusPill } from "@/components/painel/StatusPill";

type Props = { searchParams: Promise<{ status?: string }> };

export default async function VisitasPage({ searchParams }: Props) {
  await exigirSessao();
  const { status } = await searchParams;
  const filtro = VISITA_STATUS.includes(status as VisitaStatusT)
    ? (status as VisitaStatusT)
    : null;

  const where: Prisma.VisitaWhereInput = filtro ? { status: filtro } : {};
  const visitas = await prisma.visita.findMany({
    where,
    orderBy: [{ status: "asc" }, { criadoEm: "desc" }],
    take: 200,
  });

  return (
    <div className="w-full">
      <header className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="font-mono text-[0.62rem] uppercase tracking-[0.16em] text-texto-suave">
            Operação
          </p>
          <h1 className="mt-1 text-2xl font-extrabold text-texto-forte">
            Agenda de visitas
          </h1>
        </div>
        <Link
          href="/painel/visitas/novo"
          className="bg-roxo px-4 py-2.5 font-mono text-[0.66rem] uppercase tracking-[0.1em] text-branco transition-colors hover:bg-roxo-realce"
        >
          Nova visita
        </Link>
      </header>

      <div className="mb-4 flex flex-wrap gap-1.5">
        <FiltroLink label="Todas" href="/painel/visitas" ativo={!filtro} />
        {VISITA_STATUS.map((s) => (
          <FiltroLink
            key={s}
            label={visitaStatusMeta[s].label}
            href={`/painel/visitas?status=${s}`}
            ativo={filtro === s}
          />
        ))}
      </div>

      <div className="overflow-x-auto border border-borda bg-superficie">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-borda text-left font-mono text-[0.58rem] uppercase tracking-[0.1em] text-texto-suave">
              <th className="px-4 py-3">Solicitante</th>
              <th className="px-4 py-3">Endereço</th>
              <th className="px-4 py-3">Preferência</th>
              <th className="px-4 py-3">Agendada</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {visitas.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-texto-suave">
                  Nenhuma visita {filtro ? "com esse status" : "registrada ainda"}.
                </td>
              </tr>
            )}
            {visitas.map((v) => (
              <tr
                key={v.id}
                className="border-b border-borda last:border-0 hover:bg-superficie-2"
              >
                <td className="px-4 py-3">
                  <Link
                    href={`/painel/visitas/${v.id}`}
                    className="text-acento-texto hover:underline"
                  >
                    {v.nome}
                  </Link>
                  {v.empresa && (
                    <span className="block text-[0.72rem] text-texto-suave">
                      {v.empresa}
                    </span>
                  )}
                  <span className="block font-mono text-[0.62rem] text-texto-suave">
                    {v.telefone || v.email}
                  </span>
                </td>
                <td className="px-4 py-3 text-[0.82rem] text-texto">{v.endereco}</td>
                <td className="px-4 py-3 text-[0.78rem] text-texto-suave">
                  {v.preferencia || "—"}
                </td>
                <td className="px-4 py-3 font-mono text-[0.76rem] tabular-nums text-texto">
                  {v.agendadaEm ? fmtDataHora(v.agendadaEm) : "—"}
                  <span className="block text-[0.62rem] text-texto-suave">
                    recebida {fmtData(v.criadoEm)}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <StatusPill
                    label={visitaStatusMeta[v.status].label}
                    tom={visitaStatusMeta[v.status].tom}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function FiltroLink({
  label,
  href,
  ativo,
}: {
  label: string;
  href: string;
  ativo: boolean;
}) {
  return (
    <Link
      href={href}
      className={`border px-3 py-1.5 font-mono text-[0.6rem] uppercase tracking-[0.08em] transition-colors ${
        ativo
          ? "border-roxo bg-roxo text-branco"
          : "border-borda text-texto-suave hover:text-texto"
      }`}
    >
      {label}
    </Link>
  );
}
