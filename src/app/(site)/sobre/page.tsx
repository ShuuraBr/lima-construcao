import type { Metadata } from "next";
import { CtaBand } from "@/components/site/CtaBand";
import { Section, SectionHeader } from "@/components/ui/Section";
import { Container } from "@/components/ui/Container";
import { fundamentos, valores } from "@/lib/site";

export const metadata: Metadata = {
  title: "Sobre",
  description:
    "Lima Construção e Instalação: equipe própria e fixa, execução do início ao fim, prazo e garantia em contrato. Atende construtoras, incorporadoras e síndicos do DF e entorno.",
  alternates: { canonical: "/sobre" },
};

export default function SobrePage() {
  return (
    <>
      <Section className="on-dark border-b border-borda">
        <SectionHeader
          eyebrow="A empresa"
          titulo="Premium sem ostentação, direta sem ser fria."
          texto="A Lima é uma empresa de construção civil do Distrito Federal. Nasceu Lima Gesso, especialista em drywall, e ampliou a atuação para elétrica, hidráulica, forro, revestimento e checklist de obra — passando a se apresentar como Lima Construção e Instalação."
        />
      </Section>

      <Section bordaTopo>
        <div className="grid gap-px border border-borda bg-borda md:grid-cols-3">
          {(
            [
              ["Propósito", fundamentos.proposito],
              ["Missão", fundamentos.missao],
              ["Visão", fundamentos.visao],
            ] as const
          ).map(([rotulo, texto]) => (
            <div key={rotulo} className="bg-superficie p-7">
              <span className="font-mono text-[0.64rem] uppercase tracking-[0.16em] text-acento-texto">
                {rotulo}
              </span>
              <p className="mt-3 text-sm text-texto-suave">{texto}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section bordaTopo>
        <SectionHeader eyebrow="Valores" titulo="O que sustenta cada entrega." />
        <div className="mt-10 grid gap-3.5 sm:grid-cols-2">
          {valores.map((v) => (
            <div
              key={v.titulo}
              className="flex gap-3.5 border border-borda bg-superficie-2 p-4"
            >
              <span
                aria-hidden
                className="mt-1.5 h-2.5 w-2.5 shrink-0 rotate-45 bg-roxo"
              />
              <div>
                <b className="font-display text-sm font-bold text-texto-forte">
                  {v.titulo}
                </b>
                <span className="mt-0.5 block text-sm text-texto-suave">
                  {v.texto}
                </span>
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section bordaTopo>
        <Container className="max-w-[62ch] px-0">
          <h2 className="text-2xl font-extrabold sm:text-3xl">
            Contexto de mercado
          </h2>
          <p className="mt-4 text-texto-suave">
            A carteira já inclui sete obras para a Brasal no Setor Noroeste e uma
            para a Luner no Jardim Botânico — contratos com incorporadoras e
            construtoras, não com o morador final. Isso define o interlocutor: um
            decisor técnico que já sabe avaliar prazo, garantia e execução.
          </p>
          <dl className="mt-8 grid gap-px border border-borda bg-borda sm:grid-cols-2">
            {(
              [
                [
                  "Interlocutor",
                  "Construtoras, incorporadoras e síndicos — decisão técnica.",
                ],
                [
                  "Concorre por",
                  "Garantia do produto, qualidade e cumprimento de prazo — nunca o menor preço.",
                ],
                [
                  "Registro",
                  "Empresa registrada no CREA-DF.",
                ],
                [
                  "Atuação",
                  "Distrito Federal e entorno.",
                ],
              ] as const
            ).map(([dt, dd]) => (
              <div key={dt} className="bg-superficie p-5">
                <dt className="font-mono text-[0.62rem] uppercase tracking-[0.16em] text-acento-texto">
                  {dt}
                </dt>
                <dd className="mt-2 text-sm text-texto">{dd}</dd>
              </div>
            ))}
          </dl>
        </Container>
      </Section>

      <CtaBand />
    </>
  );
}
