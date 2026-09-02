import Link from "next/link";
import { prisma } from "@/lib/db";
import { exigirSessao } from "@/lib/painel";
import {
  SERVICO_LABEL,
  diasAtras,
  fmtData,
  fmtM2,
  statusMeta,
  type OrcStatus,
} from "@/lib/painel";
import { StatusPill } from "@/components/painel/StatusPill";

export default async function PainelHome() {
  const sessao = await exigirSessao();
  const seteDias = diasAtras(7);

  const [
    porStatus,
    novos7,
    total,
    recentes,
    contratosPorStatus,
    visitasPorStatus,
  ] = await Promise.all([
    prisma.pedidoOrcamento.groupBy({ by: ["status"], _count: true }),
    prisma.pedidoOrcamento.count({ where: { criadoEm: { gte: seteDias } } }),
    prisma.pedidoOrcamento.count(),
    prisma.pedidoOrcamento.findMany({
      orderBy: { criadoEm: "desc" },
      take: 6,
    }),
    prisma.contrato.groupBy({ by: ["status"], _count: true }),
    prisma.visita.groupBy({ by: ["status"], _count: true }),
  ]);

  const contarVisita = (s: string) =>
    visitasPorStatus.find((r) => r.status === s)?._count ?? 0;

  const contarContrato = (s: string) =>
    contratosPorStatus.find((r) => r.status === s)?._count ?? 0;
  const contratosKpis = [
    { k: "Em execução", n: contarContrato("EM_EXECUCAO"), d: "obras ativas" },
    {
      k: "Orçamento aprovado",
      n: contarContrato("ORCAMENTO_APROVADO"),
      d: "aguardando início",
    },
    { k: "Concluídos", n: contarContrato("CONCLUIDO"), d: "entregues" },
    {
      k: "Total de contratos",
      n: contratosPorStatus.reduce((a, r) => a + r._count, 0),
      d: "na base",
    },
  ];

  const contar = (s: OrcStatus) =>
    porStatus.find((r) => r.status === s)?._count ?? 0;

  const kpis = [
    { k: "Orçamentos · 7 dias", n: novos7, d: `${total} no total` },
    { k: "Novos sem análise", n: contar("NOVO"), d: "aguardando triagem" },
    {
      k: "Em cotação",
      n: contar("EM_ANALISE") + contar("COTACAO_ENVIADA"),
      d: "análise ou proposta enviada",
    },
    { k: "Aprovados", n: contar("APROVADO"), d: "viram contrato" },
  ];

  return (
    <div className="mx-auto max-w-[1080px]">
      <header className="mb-7">
        <p className="font-mono text-[0.62rem] uppercase tracking-[0.16em] text-texto-suave">
          Painel · visão geral
        </p>
        <h1 className="mt-1 text-2xl font-extrabold text-texto-forte">
          Bom trabalho, {sessao.nome.split(" ")[0]}.
        </h1>
      </header>

      <div className="grid grid-cols-2 gap-px border border-borda bg-borda lg:grid-cols-4">
        {kpis.map((kpi) => (
          <div key={kpi.k} className="bg-superficie p-4">
            <div className="font-mono text-[0.6rem] uppercase tracking-[0.12em] text-texto-suave">
              {kpi.k}
            </div>
            <div className="mt-2 font-mono text-[1.8rem] tabular-nums text-texto-forte">
              {String(kpi.n).padStart(2, "0")}
            </div>
            <div className="mt-1 font-mono text-[0.6rem] tracking-[0.02em] text-acento-texto">
              {kpi.d}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6">
        <div className="mb-2 flex items-center justify-between">
          <p className="font-mono text-[0.6rem] uppercase tracking-[0.14em] text-texto-suave">
            Contratos
          </p>
          <Link
            href="/painel/contratos"
            className="font-mono text-[0.6rem] uppercase tracking-[0.08em] text-acento-texto hover:underline"
          >
            Ver todos
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-px border border-borda bg-borda lg:grid-cols-4">
          {contratosKpis.map((kpi) => (
            <div key={kpi.k} className="bg-superficie p-4">
              <div className="font-mono text-[0.6rem] uppercase tracking-[0.12em] text-texto-suave">
                {kpi.k}
              </div>
              <div className="mt-2 font-mono text-[1.8rem] tabular-nums text-texto-forte">
                {String(kpi.n).padStart(2, "0")}
              </div>
              <div className="mt-1 font-mono text-[0.6rem] tracking-[0.02em] text-acento-texto">
                {kpi.d}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6">
        <div className="mb-2 flex items-center justify-between">
          <p className="font-mono text-[0.6rem] uppercase tracking-[0.14em] text-texto-suave">
            Agenda de visitas
          </p>
          <Link
            href="/painel/visitas"
            className="font-mono text-[0.6rem] uppercase tracking-[0.08em] text-acento-texto hover:underline"
          >
            Ver todas
          </Link>
        </div>
        <div className="grid grid-cols-3 gap-px border border-borda bg-borda">
          {[
            { k: "A confirmar", n: contarVisita("SOLICITADA"), d: "aguardando o Erick" },
            { k: "Confirmadas", n: contarVisita("CONFIRMADA"), d: "data marcada" },
            { k: "Realizadas", n: contarVisita("REALIZADA"), d: "concluídas" },
          ].map((kpi) => (
            <div key={kpi.k} className="bg-superficie p-4">
              <div className="font-mono text-[0.6rem] uppercase tracking-[0.12em] text-texto-suave">
                {kpi.k}
              </div>
              <div className="mt-2 font-mono text-[1.8rem] tabular-nums text-texto-forte">
                {String(kpi.n).padStart(2, "0")}
              </div>
              <div className="mt-1 font-mono text-[0.6rem] tracking-[0.02em] text-acento-texto">
                {kpi.d}
              </div>
            </div>
          ))}
        </div>
      </div>

      <section className="mt-8 border border-borda bg-superficie">
        <div className="flex items-center justify-between border-b border-borda px-4 py-3">
          <h2 className="font-display text-sm font-bold text-texto-forte">
            Orçamentos recentes
          </h2>
          <Link
            href="/painel/orcamentos"
            className="font-mono text-[0.62rem] uppercase tracking-[0.08em] text-acento-texto hover:underline"
          >
            Ver todos
          </Link>
        </div>

        {recentes.length === 0 ? (
          <p className="px-4 py-8 text-center text-sm text-texto-suave">
            Nenhum orçamento recebido ainda.
          </p>
        ) : (
          <ul>
            {recentes.map((o) => (
              <li key={o.id} className="border-b border-borda last:border-0">
                <Link
                  href={`/painel/orcamentos/${o.id}`}
                  className="grid grid-cols-[auto_1fr_auto] items-center gap-3 px-4 py-3 transition-colors hover:bg-superficie-2"
                >
                  <span className="font-mono text-[0.72rem] text-acento-texto">
                    {o.protocolo}
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-sm text-texto-forte">
                      {o.nome}
                    </span>
                    <span className="block truncate font-mono text-[0.62rem] uppercase tracking-[0.04em] text-texto-suave">
                      {SERVICO_LABEL[o.servico]} · {fmtM2(o.metragemM2)} ·{" "}
                      {fmtData(o.criadoEm)}
                    </span>
                  </span>
                  <StatusPill
                    label={statusMeta[o.status].label}
                    tom={statusMeta[o.status].tom}
                  />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
