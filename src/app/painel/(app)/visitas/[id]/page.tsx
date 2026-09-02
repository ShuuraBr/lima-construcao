import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { exigirSessao } from "@/lib/painel";
import {
  fmtData,
  fmtDataHora,
  toDateTimeInput,
  visitaStatusMeta,
} from "@/lib/painel";
import { StatusPill } from "@/components/painel/StatusPill";
import { GestaoVisita } from "./GestaoVisita";

type Props = { params: Promise<{ id: string }> };

export default async function VisitaDetalhe({ params }: Props) {
  await exigirSessao();
  const { id } = await params;

  const v = await prisma.visita.findUnique({ where: { id } });
  if (!v) notFound();

  const [contrato, orcamento] = await Promise.all([
    v.contratoId
      ? prisma.contrato.findUnique({
          where: { id: v.contratoId },
          select: { id: true, numero: true },
        })
      : null,
    v.pedidoOrcamentoId
      ? prisma.pedidoOrcamento.findUnique({
          where: { id: v.pedidoOrcamentoId },
          select: { id: true, protocolo: true },
        })
      : null,
  ]);

  const dados: [string, string][] = [
    ["Solicitante", v.nome],
    ["Empresa", v.empresa || "—"],
    ["E-mail", v.email || "—"],
    ["Telefone", v.telefone || "—"],
    ["Endereço da obra", v.endereco],
    ["Preferência de data/horário", v.preferencia || "—"],
    ["Agendada para", v.agendadaEm ? fmtDataHora(v.agendadaEm) : "—"],
    ["Origem", v.origem],
    ["Recebida em", fmtData(v.criadoEm)],
  ];

  return (
    <div className="mx-auto w-full max-w-[1200px]">
      <Link
        href="/painel/visitas"
        className="font-mono text-[0.62rem] uppercase tracking-[0.1em] text-texto-suave hover:text-acento-texto"
      >
        ← Agenda de visitas
      </Link>

      <header className="mt-3 flex flex-wrap items-start justify-between gap-3">
        <h1 className="text-2xl font-extrabold text-texto-forte">{v.nome}</h1>
        <div className="flex items-center gap-2">
          <StatusPill
            label={visitaStatusMeta[v.status].label}
            tom={visitaStatusMeta[v.status].tom}
          />
          <Link
            href={`/painel/visitas/${v.id}/editar`}
            className="border border-borda px-3 py-1.5 font-mono text-[0.6rem] uppercase tracking-[0.1em] text-texto-suave hover:text-acento-texto"
          >
            Editar
          </Link>
        </div>
      </header>

      {(contrato || orcamento) && (
        <div className="mt-3 flex flex-wrap gap-2">
          {contrato && (
            <Link
              href={`/painel/contratos/${contrato.id}`}
              className="border border-borda px-3 py-1.5 font-mono text-[0.6rem] uppercase tracking-[0.08em] text-texto-suave hover:text-acento-texto"
            >
              Contrato {contrato.numero}
            </Link>
          )}
          {orcamento && (
            <Link
              href={`/painel/orcamentos/${orcamento.id}`}
              className="border border-borda px-3 py-1.5 font-mono text-[0.6rem] uppercase tracking-[0.08em] text-texto-suave hover:text-acento-texto"
            >
              Orçamento {orcamento.protocolo}
            </Link>
          )}
        </div>
      )}

      <section className="mt-6 border border-borda bg-superficie">
        <div className="border-b border-borda px-4 py-3">
          <h2 className="font-mono text-[0.6rem] uppercase tracking-[0.14em] text-texto-suave">
            Confirmação
          </h2>
          <div className="mt-3">
            <GestaoVisita
              id={v.id}
              status={v.status}
              agendadaEm={toDateTimeInput(v.agendadaEm)}
              observacoesInternas={v.observacoesInternas ?? ""}
            />
          </div>
        </div>

        <dl className="grid gap-px bg-borda sm:grid-cols-2">
          {dados.map(([k, val]) => (
            <div key={k} className="bg-superficie px-4 py-3">
              <dt className="font-mono text-[0.58rem] uppercase tracking-[0.12em] text-texto-suave">
                {k}
              </dt>
              <dd className="mt-1 text-sm text-texto-forte">{val}</dd>
            </div>
          ))}
        </dl>

        {v.mensagem && (
          <div className="border-t border-borda px-4 py-3">
            <dt className="font-mono text-[0.58rem] uppercase tracking-[0.12em] text-texto-suave">
              Mensagem do solicitante
            </dt>
            <p className="mt-1.5 whitespace-pre-wrap text-sm text-texto">
              {v.mensagem}
            </p>
          </div>
        )}
        {v.observacoesInternas && (
          <div className="border-t border-borda px-4 py-3">
            <dt className="font-mono text-[0.58rem] uppercase tracking-[0.12em] text-texto-suave">
              Observações internas
            </dt>
            <p className="mt-1.5 whitespace-pre-wrap text-sm text-texto">
              {v.observacoesInternas}
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
