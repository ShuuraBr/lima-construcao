import Link from "next/link";
import { prisma } from "@/lib/db";
import { exigirSessao } from "@/lib/painel";
import {
  SERVICO_LABEL,
  contratoStatusMeta,
  fmtData,
  servicosDoContrato,
} from "@/lib/painel";
import { StatusPill } from "@/components/painel/StatusPill";

export default async function PrestacaoServicosPage() {
  await exigirSessao();

  const contratos = await prisma.contrato.findMany({
    where: { status: { in: ["ORCAMENTO_APROVADO", "EM_EXECUCAO"] } },
    orderBy: [{ status: "asc" }, { criadoEm: "asc" }],
    include: {
      apontamentos: { orderBy: { data: "desc" }, take: 1 },
    },
  });

  return (
    <div className="mx-auto max-w-[1080px]">
      <header className="mb-6">
        <p className="font-mono text-[0.62rem] uppercase tracking-[0.16em] text-texto-suave">
          Operação
        </p>
        <h1 className="mt-1 text-2xl font-extrabold text-texto-forte">
          Prestação de serviços
        </h1>
        <p className="mt-1 text-sm text-texto-suave">
          Obras aprovadas e em execução. Registre o andamento na tela do contrato.
        </p>
      </header>

      {contratos.length === 0 ? (
        <p className="border border-borda bg-superficie px-4 py-10 text-center text-texto-suave">
          Nenhuma obra em andamento.
        </p>
      ) : (
        <ul className="grid gap-3">
          {contratos.map((c) => {
            const frentes = servicosDoContrato(c.servicos);
            const ultimo = c.apontamentos[0];
            const v = Math.min(100, Math.max(0, c.progresso));
            return (
              <li key={c.id}>
                <Link
                  href={`/painel/contratos/${c.id}`}
                  className="block border border-borda bg-superficie p-4 transition-colors hover:bg-superficie-2"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-mono text-[0.78rem] text-acento-texto">
                      {c.numero}
                    </span>
                    <StatusPill
                      label={contratoStatusMeta[c.status].label}
                      tom={contratoStatusMeta[c.status].tom}
                    />
                  </div>
                  <p className="mt-1 text-sm font-bold text-texto-forte">
                    {c.clienteNome}
                    {c.clienteEmpresa && (
                      <span className="font-normal text-texto-suave">
                        {" "}
                        · {c.clienteEmpresa}
                      </span>
                    )}
                  </p>
                  <p className="mt-0.5 text-[0.78rem] text-texto-suave">
                    {c.enderecoObra}
                  </p>
                  <p className="mt-1 font-mono text-[0.64rem] uppercase tracking-[0.04em] text-texto-suave">
                    {frentes.map((f) => SERVICO_LABEL[f] ?? f).join(" · ") || "—"}
                  </p>

                  <div className="mt-3 flex items-center gap-2">
                    <span className="h-1.5 flex-1 overflow-hidden bg-borda">
                      <span
                        className="block h-full bg-roxo"
                        style={{ width: `${v}%` }}
                      />
                    </span>
                    <span className="font-mono text-[0.66rem] tabular-nums text-texto-suave">
                      {v}%
                    </span>
                  </div>

                  <p className="mt-2 font-mono text-[0.62rem] text-texto-suave">
                    {ultimo
                      ? `Último andamento ${fmtData(ultimo.data)} — ${ultimo.autorNome}`
                      : "Sem andamentos registrados"}
                  </p>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
