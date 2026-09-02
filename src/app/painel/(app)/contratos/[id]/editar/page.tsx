import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { exigirSessao, servicosDoContrato, toDateInput } from "@/lib/painel";
import { ContratoForm } from "../../ContratoForm";

type Props = { params: Promise<{ id: string }> };

export default async function EditarContratoPage({ params }: Props) {
  await exigirSessao();
  const { id } = await params;

  const c = await prisma.contrato.findUnique({ where: { id } });
  if (!c) notFound();

  return (
    <div className="mx-auto w-full max-w-[1200px]">
      <Link
        href={`/painel/contratos/${c.id}`}
        className="font-mono text-[0.62rem] uppercase tracking-[0.1em] text-texto-suave hover:text-acento-texto"
      >
        ← {c.numero}
      </Link>
      <h1 className="m-0 mt-3 text-2xl font-extrabold text-texto-forte">
        Editar contrato
      </h1>

      <div className="mt-5">
        <ContratoForm
          modo="editar"
          id={c.id}
          valores={{
            clienteNome: c.clienteNome,
            clienteEmpresa: c.clienteEmpresa ?? "",
            clienteEmail: c.clienteEmail ?? "",
            clienteTelefone: c.clienteTelefone ?? "",
            enderecoObra: c.enderecoObra,
            latitude: c.latitude != null ? String(c.latitude) : "",
            longitude: c.longitude != null ? String(c.longitude) : "",
            servicos: servicosDoContrato(c.servicos),
            valor: String(Number(c.valor)).replace(".", ","),
            status: c.status,
            progresso: String(c.progresso),
            dataAssinatura: toDateInput(c.dataAssinatura),
            inicioPrevisto: toDateInput(c.inicioPrevisto),
            entregaPrevista: toDateInput(c.entregaPrevista),
            entregaReal: toDateInput(c.entregaReal),
            observacoes: c.observacoes ?? "",
          }}
        />
      </div>
    </div>
  );
}
