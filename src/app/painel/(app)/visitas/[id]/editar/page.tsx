import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { exigirSessao, toDateTimeInput } from "@/lib/painel";
import { VisitaFormPainel } from "../../VisitaFormPainel";

type Props = { params: Promise<{ id: string }> };

export default async function EditarVisitaPage({ params }: Props) {
  await exigirSessao();
  const { id } = await params;

  const v = await prisma.visita.findUnique({ where: { id } });
  if (!v) notFound();

  return (
    <div className="mx-auto w-full max-w-[1200px]">
      <Link
        href={`/painel/visitas/${v.id}`}
        className="font-mono text-[0.62rem] uppercase tracking-[0.1em] text-texto-suave hover:text-acento-texto"
      >
        ← Voltar
      </Link>
      <h1 className="m-0 mt-3 text-2xl font-extrabold text-texto-forte">
        Editar visita
      </h1>

      <div className="mt-5">
        <VisitaFormPainel
          modo="editar"
          id={v.id}
          valores={{
            nome: v.nome,
            empresa: v.empresa ?? "",
            email: v.email ?? "",
            telefone: v.telefone ?? "",
            endereco: v.endereco,
            preferencia: v.preferencia ?? "",
            mensagem: v.mensagem ?? "",
            status: v.status,
            agendadaEm: toDateTimeInput(v.agendadaEm),
            observacoesInternas: v.observacoesInternas ?? "",
            contratoId: v.contratoId ?? "",
            pedidoOrcamentoId: v.pedidoOrcamentoId ?? "",
          }}
        />
      </div>
    </div>
  );
}
