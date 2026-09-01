import Link from "next/link";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { exigirSessao } from "@/lib/painel";
import {
  ORCAMENTO_STATUS,
  SERVICO_LABEL,
  fmtData,
  fmtM2,
  statusMeta,
  type OrcStatus,
} from "@/lib/painel";
import { StatusPill } from "@/components/painel/StatusPill";

type Props = { searchParams: Promise<{ status?: string }> };

export default async function OrcamentosPage({ searchParams }: Props) {
  await exigirSessao();
  const { status } = await searchParams;
  const filtro = ORCAMENTO_STATUS.includes(status as OrcStatus)
    ? (status as OrcStatus)
    : null;

  const where: Prisma.PedidoOrcamentoWhereInput = filtro
    ? { status: filtro }
    : {};
  const pedidos = await prisma.pedidoOrcamento.findMany({
    where,
    orderBy: { criadoEm: "desc" },
    take: 200,
  });

  return (
    <div className="mx-auto max-w-[1080px]">
      <header className="mb-6">
        <p className="font-mono text-[0.62rem] uppercase tracking-[0.16em] text-texto-suave">
          Operação
        </p>
        <h1 className="mt-1 text-2xl font-extrabold text-texto-forte">
          Orçamentos
        </h1>
      </header>

      <div className="mb-4 flex flex-wrap gap-1.5">
        <FiltroLink label="Todos" href="/painel/orcamentos" ativo={!filtro} />
        {ORCAMENTO_STATUS.map((s) => (
          <FiltroLink
            key={s}
            label={statusMeta[s].label}
            href={`/painel/orcamentos?status=${s}`}
            ativo={filtro === s}
          />
        ))}
      </div>

      <div className="overflow-x-auto border border-borda bg-superficie">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-borda text-left font-mono text-[0.58rem] uppercase tracking-[0.1em] text-texto-suave">
              <th className="px-4 py-3">Protocolo</th>
              <th className="px-4 py-3">Cliente</th>
              <th className="px-4 py-3">Serviço</th>
              <th className="px-4 py-3">Metragem</th>
              <th className="px-4 py-3">Recebido</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {pedidos.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-10 text-center text-texto-suave"
                >
                  Nenhum orçamento {filtro ? "com esse status" : "recebido ainda"}.
                </td>
              </tr>
            )}
            {pedidos.map((o) => (
              <tr
                key={o.id}
                className="border-b border-borda last:border-0 hover:bg-superficie-2"
              >
                <td className="px-4 py-3">
                  <Link
                    href={`/painel/orcamentos/${o.id}`}
                    className="font-mono text-[0.78rem] text-acento-texto hover:underline"
                  >
                    {o.protocolo}
                  </Link>
                </td>
                <td className="px-4 py-3 text-texto-forte">
                  {o.nome}
                  {o.empresa && (
                    <span className="block text-[0.72rem] text-texto-suave">
                      {o.empresa}
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 text-texto">
                  {SERVICO_LABEL[o.servico]}
                </td>
                <td className="px-4 py-3 font-mono text-[0.82rem] tabular-nums text-texto">
                  {fmtM2(o.metragemM2)}
                </td>
                <td className="px-4 py-3 font-mono text-[0.78rem] tabular-nums text-texto-suave">
                  {fmtData(o.criadoEm)}
                </td>
                <td className="px-4 py-3">
                  <StatusPill
                    label={statusMeta[o.status].label}
                    tom={statusMeta[o.status].tom}
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
