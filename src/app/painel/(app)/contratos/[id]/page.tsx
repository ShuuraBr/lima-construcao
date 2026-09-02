import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { exigirSessao } from "@/lib/painel";
import {
  SERVICO_LABEL,
  contratoStatusMeta,
  fmtBRL,
  fmtData,
  fmtDataHora,
  servicosDoContrato,
} from "@/lib/painel";
import { StatusPill } from "@/components/painel/StatusPill";
import { StatusContratoForm } from "./StatusContratoForm";
import { ApontamentoForm } from "./ApontamentoForm";

type Props = { params: Promise<{ id: string }> };

const dt = (d: Date | null) => (d ? fmtData(d) : "—");

export default async function ContratoDetalhe({ params }: Props) {
  await exigirSessao();
  const { id } = await params;

  const c = await prisma.contrato.findUnique({ where: { id } });
  if (!c) notFound();

  const frentes = servicosDoContrato(c.servicos);
  const apontamentos = await prisma.apontamento.findMany({
    where: { contratoId: c.id },
    orderBy: { data: "desc" },
    take: 50,
  });
  const orcamento = c.pedidoOrcamentoId
    ? await prisma.pedidoOrcamento.findUnique({
        where: { id: c.pedidoOrcamentoId },
        select: { id: true, protocolo: true },
      })
    : null;

  const dados: [string, string][] = [
    ["Cliente", c.clienteNome],
    ["Empresa", c.clienteEmpresa || "—"],
    ["E-mail", c.clienteEmail || "—"],
    ["Telefone", c.clienteTelefone || "—"],
    ["Endereço da obra", c.enderecoObra],
    ["Frentes", frentes.map((f) => SERVICO_LABEL[f] ?? f).join(", ") || "—"],
    ["Valor", fmtBRL(Number(c.valor))],
    ["Assinatura", dt(c.dataAssinatura)],
    ["Início previsto", dt(c.inicioPrevisto)],
    ["Entrega prevista", dt(c.entregaPrevista)],
    ["Entrega real", dt(c.entregaReal)],
    ["Criado em", fmtDataHora(c.criadoEm)],
  ];

  return (
    <div className="mx-auto w-full max-w-[1200px]">
      <Link
        href="/painel/contratos"
        className="font-mono text-[0.62rem] uppercase tracking-[0.1em] text-texto-suave hover:text-acento-texto"
      >
        ← Contratos
      </Link>

      <header className="mt-3 flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-mono text-[0.8rem] text-acento-texto">{c.numero}</p>
          <h1 className="mt-1 text-2xl font-extrabold text-texto-forte">
            {c.clienteNome}
          </h1>
          {orcamento && (
            <Link
              href={`/painel/orcamentos/${orcamento.id}`}
              className="mt-1 inline-block font-mono text-[0.62rem] uppercase tracking-[0.08em] text-texto-suave hover:text-acento-texto"
            >
              origem: {orcamento.protocolo}
            </Link>
          )}
        </div>
        <div className="flex items-center gap-2">
          <StatusPill
            label={contratoStatusMeta[c.status].label}
            tom={contratoStatusMeta[c.status].tom}
          />
          <Link
            href={`/painel/contratos/${c.id}/editar`}
            className="border border-borda px-3 py-1.5 font-mono text-[0.6rem] uppercase tracking-[0.1em] text-texto-suave hover:text-acento-texto"
          >
            Editar
          </Link>
        </div>
      </header>

      <section className="mt-6 border border-borda bg-superficie">
        <div className="border-b border-borda px-4 py-3">
          <h2 className="font-mono text-[0.6rem] uppercase tracking-[0.14em] text-texto-suave">
            Andamento
          </h2>
          <div className="mt-2.5">
            <StatusContratoForm
              id={c.id}
              status={c.status}
              progresso={c.progresso}
            />
          </div>
          <div className="mt-3 h-2 overflow-hidden bg-borda">
            <span
              className="block h-full bg-roxo"
              style={{ width: `${Math.min(100, Math.max(0, c.progresso))}%` }}
            />
          </div>
        </div>

        <dl className="grid gap-px bg-borda sm:grid-cols-2">
          {dados.map(([k, v]) => (
            <div key={k} className="bg-superficie px-4 py-3">
              <dt className="font-mono text-[0.58rem] uppercase tracking-[0.12em] text-texto-suave">
                {k}
              </dt>
              <dd className="mt-1 text-sm text-texto-forte">{v}</dd>
            </div>
          ))}
        </dl>

        {c.observacoes && (
          <div className="border-t border-borda px-4 py-3">
            <dt className="font-mono text-[0.58rem] uppercase tracking-[0.12em] text-texto-suave">
              Observações
            </dt>
            <p className="mt-1.5 whitespace-pre-wrap text-sm text-texto">
              {c.observacoes}
            </p>
          </div>
        )}
      </section>

      <section className="mt-6 border border-borda bg-superficie">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-borda px-4 py-3">
          <h2 className="font-mono text-[0.6rem] uppercase tracking-[0.14em] text-texto-suave">
            Prestação de serviço — andamentos
          </h2>
          <ApontamentoForm
            contratoId={c.id}
            frentes={frentes}
            statusAtual={c.status}
            progressoAtual={c.progresso}
          />
        </div>

        {apontamentos.length === 0 ? (
          <p className="px-4 py-8 text-center text-sm text-texto-suave">
            Nenhum andamento registrado ainda.
          </p>
        ) : (
          <ul>
            {apontamentos.map((a) => (
              <li
                key={a.id}
                className="grid gap-1 border-b border-borda px-4 py-3 last:border-0"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-[0.72rem] tabular-nums text-texto-forte">
                    {fmtData(a.data)}
                  </span>
                  <StatusPill
                    label={contratoStatusMeta[a.status].label}
                    tom={contratoStatusMeta[a.status].tom}
                  />
                  <span className="font-mono text-[0.66rem] tabular-nums text-texto-suave">
                    {a.progresso}%
                  </span>
                  {a.frente && (
                    <span className="font-mono text-[0.6rem] uppercase tracking-[0.06em] text-acento-texto">
                      {SERVICO_LABEL[a.frente] ?? a.frente}
                    </span>
                  )}
                </div>
                {a.nota && (
                  <p className="whitespace-pre-wrap text-sm text-texto">{a.nota}</p>
                )}
                <span className="font-mono text-[0.58rem] uppercase tracking-[0.08em] text-texto-suave">
                  {a.autorNome}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
