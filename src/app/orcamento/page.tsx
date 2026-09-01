import type { Metadata } from "next";
import { QuoteForm } from "@/components/site/QuoteForm";
import { Container } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/Section";

export const metadata: Metadata = {
  title: "Solicitar orçamento",
  description:
    "Descreva a obra. A cotação é feita por um engenheiro da Lima após análise de escopo, prazo e visita técnica — sem calculadora automática.",
  alternates: { canonical: "/orcamento" },
};

type Props = {
  searchParams: Promise<{ servico?: string }>;
};

export default async function OrcamentoPage({ searchParams }: Props) {
  const { servico } = await searchParams;

  return (
    <section className="border-b border-borda bg-fundo py-16 sm:py-20">
      <Container className="grid gap-0 border border-borda md:grid-cols-[0.85fr_1.15fr]">
        <aside className="on-dark bg-roxo-profundo p-8">
          <Eyebrow>Solicitação de orçamento</Eyebrow>
          <h1 className="mt-4 text-3xl font-extrabold text-branco">
            Descreva a obra. A cotação é feita pela equipe.
          </h1>
          <p className="mt-4 text-sm text-prata">
            Não há calculadora de preço. Após o envio, o pedido entra na fila da
            Lima e um engenheiro analisa escopo, prazo e visita técnica antes de
            responder.
          </p>
          <ul className="mt-6 grid gap-3 font-mono text-[0.72rem] uppercase tracking-[0.05em] text-branco">
            {[
              "Retorno em até 2 dias úteis",
              "Cotação por frente de serviço",
              "Visita técnica sob agendamento",
            ].map((item) => (
              <li key={item} className="flex gap-2.5">
                <span className="text-acento-texto">—</span>
                {item}
              </li>
            ))}
          </ul>
        </aside>

        <div className="bg-fundo">
          <QuoteForm servicoInicial={servico} />
        </div>
      </Container>
    </section>
  );
}
