import Link from "next/link";
import { prisma } from "@/lib/db";
import { exigirSessao, toDateInput } from "@/lib/painel";
import { ContratoForm, type ValoresContrato } from "../ContratoForm";

type Props = { searchParams: Promise<{ de?: string }> };

export default async function NovoContratoPage({ searchParams }: Props) {
  await exigirSessao();
  const { de } = await searchParams;

  let valores: ValoresContrato | undefined;
  let pedidoOrcamentoId: string | undefined;
  let aviso: string | null = null;

  if (de) {
    const pedido = await prisma.pedidoOrcamento.findUnique({ where: { id: de } });
    if (pedido) {
      const jaExiste = await prisma.contrato.findUnique({
        where: { pedidoOrcamentoId: pedido.id },
        select: { id: true },
      });
      if (jaExiste) {
        aviso = "Este orçamento já foi convertido em contrato.";
      } else {
        pedidoOrcamentoId = pedido.id;
        valores = {
          clienteNome: pedido.nome,
          clienteEmpresa: pedido.empresa ?? "",
          clienteEmail: pedido.email,
          clienteTelefone: pedido.telefone,
          enderecoObra: pedido.enderecoObra,
          servicos:
            pedido.servico && pedido.servico !== "MAIS_DE_UMA_FRENTE"
              ? [pedido.servico]
              : [],
          inicioPrevisto: toDateInput(pedido.dataInicio),
          status: "ORCAMENTO_APROVADO",
        };
      }
    } else {
      aviso = "Orçamento não encontrado.";
    }
  }

  return (
    <div className="mx-auto w-full max-w-[1200px]">
      <Link
        href="/painel/contratos"
        className="font-mono text-[0.62rem] uppercase tracking-[0.1em] text-texto-suave hover:text-acento-texto"
      >
        ← Contratos
      </Link>
      <h1 className="m-0 mt-3 text-2xl font-extrabold text-texto-forte">
        Novo contrato
      </h1>
      {pedidoOrcamentoId && (
        <p className="mt-1 font-mono text-[0.64rem] text-acento-texto">
          Pré-preenchido a partir de um orçamento aprovado.
        </p>
      )}
      {aviso && (
        <p className="mt-3 border border-acento-texto/60 bg-acento-texto/10 px-3 py-2 font-mono text-[0.66rem] text-acento-texto">
          {aviso}
        </p>
      )}

      <div className="mt-5">
        <ContratoForm
          modo="novo"
          pedidoOrcamentoId={pedidoOrcamentoId}
          valores={valores}
        />
      </div>
    </div>
  );
}
