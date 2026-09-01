import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { exigirSessao } from "@/lib/painel";
import {
  SERVICO_LABEL,
  fmtDataHora,
  fmtM2,
  statusMeta,
} from "@/lib/painel";
import { StatusPill } from "@/components/painel/StatusPill";
import { StatusForm } from "./StatusForm";

type Props = { params: Promise<{ id: string }> };

export default async function OrcamentoDetalhe({ params }: Props) {
  await exigirSessao();
  const { id } = await params;

  const o = await prisma.pedidoOrcamento.findUnique({ where: { id } });
  if (!o) notFound();

  const contrato = await prisma.contrato.findUnique({
    where: { pedidoOrcamentoId: o.id },
    select: { id: true, numero: true },
  });

  const dados: [string, string][] = [
    ["Cliente", o.nome],
    ["Empresa", o.empresa || "—"],
    ["E-mail", o.email],
    ["Telefone", o.telefone],
    ["Serviço", SERVICO_LABEL[o.servico]],
    ["Endereço da obra", o.enderecoObra],
    ["Metragem", fmtM2(o.metragemM2)],
    ["Prazo desejado", o.prazoDesejado || "—"],
    [
      "Início previsto",
      o.dataInicio ? o.dataInicio.toLocaleDateString("pt-BR") : "—",
    ],
    ["Anexo", o.anexoNome || "— (nenhum)"],
    ["Recebido em", fmtDataHora(o.criadoEm)],
    ["Origem", o.origem],
  ];

  return (
    <div className="mx-auto max-w-[760px]">
      <Link
        href="/painel/orcamentos"
        className="font-mono text-[0.62rem] uppercase tracking-[0.1em] text-texto-suave hover:text-acento-texto"
      >
        ← Orçamentos
      </Link>

      <header className="mt-3 flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-mono text-[0.8rem] text-acento-texto">
            {o.protocolo}
          </p>
          <h1 className="mt-1 text-2xl font-extrabold text-texto-forte">
            {o.nome}
          </h1>
        </div>
        <div className="flex flex-col items-end gap-2">
          <StatusPill
            label={statusMeta[o.status].label}
            tom={statusMeta[o.status].tom}
          />
          {contrato ? (
            <Link
              href={`/painel/contratos/${contrato.id}`}
              className="border border-borda px-3 py-1.5 font-mono text-[0.6rem] uppercase tracking-[0.1em] text-texto-suave hover:text-acento-texto"
            >
              Contrato {contrato.numero}
            </Link>
          ) : (
            o.status === "APROVADO" && (
              <Link
                href={`/painel/contratos/novo?de=${o.id}`}
                className="bg-roxo px-3 py-1.5 font-mono text-[0.6rem] uppercase tracking-[0.1em] text-branco transition-colors hover:bg-roxo-realce"
              >
                Gerar contrato
              </Link>
            )
          )}
        </div>
      </header>

      <section className="mt-6 border border-borda bg-superficie">
        <div className="border-b border-borda px-4 py-3">
          <h2 className="font-mono text-[0.6rem] uppercase tracking-[0.14em] text-texto-suave">
            Situação
          </h2>
          <div className="mt-2.5">
            <StatusForm id={o.id} atual={o.status} />
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
        {o.mensagem && (
          <div className="border-t border-borda px-4 py-3">
            <dt className="font-mono text-[0.58rem] uppercase tracking-[0.12em] text-texto-suave">
              Mensagem
            </dt>
            <p className="mt-1.5 whitespace-pre-wrap text-sm text-texto">
              {o.mensagem}
            </p>
          </div>
        )}
      </section>

      <p className="mt-4 font-mono text-[0.6rem] leading-relaxed tracking-[0.02em] text-texto-suave">
        O arquivo anexado, quando enviado, chega por e-mail. O armazenamento do
        anexo dentro do painel entra com o módulo de Contratos.
      </p>
    </div>
  );
}
