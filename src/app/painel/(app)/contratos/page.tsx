import Link from "next/link";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { exigirSessao } from "@/lib/painel";
import {
  CONTRATO_STATUS,
  SERVICO_LABEL,
  contratoStatusMeta,
  fmtBRL,
  fmtData,
  servicosDoContrato,
  type ContratoStatusT,
} from "@/lib/painel";
import { StatusPill } from "@/components/painel/StatusPill";

type Props = { searchParams: Promise<{ status?: string }> };

export default async function ContratosPage({ searchParams }: Props) {
  await exigirSessao();
  const { status } = await searchParams;
  const filtro = CONTRATO_STATUS.includes(status as ContratoStatusT)
    ? (status as ContratoStatusT)
    : null;

  const where: Prisma.ContratoWhereInput = filtro ? { status: filtro } : {};
  const contratos = await prisma.contrato.findMany({
    where,
    orderBy: { criadoEm: "desc" },
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
            Contratos
          </h1>
        </div>
        <Link
          href="/painel/contratos/novo"
          className="bg-roxo px-4 py-2.5 font-mono text-[0.66rem] uppercase tracking-[0.1em] text-branco transition-colors hover:bg-roxo-realce"
        >
          Novo contrato
        </Link>
      </header>

      <div className="mb-4 flex flex-wrap gap-1.5">
        <FiltroLink label="Todos" href="/painel/contratos" ativo={!filtro} />
        {CONTRATO_STATUS.map((s) => (
          <FiltroLink
            key={s}
            label={contratoStatusMeta[s].label}
            href={`/painel/contratos?status=${s}`}
            ativo={filtro === s}
          />
        ))}
      </div>

      <div className="overflow-x-auto border border-borda bg-superficie">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-borda text-left font-mono text-[0.58rem] uppercase tracking-[0.1em] text-texto-suave">
              <th className="px-4 py-3">Número</th>
              <th className="px-4 py-3">Cliente</th>
              <th className="px-4 py-3">Frentes</th>
              <th className="px-4 py-3">Valor</th>
              <th className="px-4 py-3">Progresso</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {contratos.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-texto-suave">
                  Nenhum contrato {filtro ? "com esse status" : "cadastrado ainda"}.
                </td>
              </tr>
            )}
            {contratos.map((c) => {
              const frentes = servicosDoContrato(c.servicos);
              return (
                <tr
                  key={c.id}
                  className="border-b border-borda last:border-0 hover:bg-superficie-2"
                >
                  <td className="px-4 py-3">
                    <Link
                      href={`/painel/contratos/${c.id}`}
                      className="font-mono text-[0.78rem] text-acento-texto hover:underline"
                    >
                      {c.numero}
                    </Link>
                    <span className="block font-mono text-[0.62rem] text-texto-suave">
                      {fmtData(c.criadoEm)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-texto-forte">
                    {c.clienteNome}
                    {c.clienteEmpresa && (
                      <span className="block text-[0.72rem] text-texto-suave">
                        {c.clienteEmpresa}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-[0.78rem] text-texto">
                    {frentes.map((f) => SERVICO_LABEL[f] ?? f).join(", ") || "—"}
                  </td>
                  <td className="px-4 py-3 font-mono text-[0.82rem] tabular-nums text-texto">
                    {fmtBRL(Number(c.valor))}
                  </td>
                  <td className="px-4 py-3">
                    <Barra valor={c.progresso} />
                  </td>
                  <td className="px-4 py-3">
                    <StatusPill
                      label={contratoStatusMeta[c.status].label}
                      tom={contratoStatusMeta[c.status].tom}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Barra({ valor }: { valor: number }) {
  const v = Math.min(100, Math.max(0, valor));
  return (
    <span className="flex items-center gap-2">
      <span className="h-1.5 w-20 overflow-hidden bg-borda">
        <span
          className="block h-full bg-roxo"
          style={{ width: `${v}%` }}
        />
      </span>
      <span className="font-mono text-[0.66rem] tabular-nums text-texto-suave">
        {v}%
      </span>
    </span>
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
