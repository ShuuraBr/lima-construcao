import Link from "next/link";
import { Hero } from "@/components/site/Hero";
import { StatStrip } from "@/components/site/StatStrip";
import { ServiceCard } from "@/components/site/ServiceCard";
import { ProofCard } from "@/components/site/ProofCard";
import { CtaBand } from "@/components/site/CtaBand";
import { Section, SectionHeader } from "@/components/ui/Section";
import { ButtonLink } from "@/components/ui/Button";
import { fundamentos, obras, servicos, valores } from "@/lib/site";

export default function HomePage() {
  return (
    <>
      <Hero />
      <StatStrip />

      <Section id="empresa" bordaTopo>
        <SectionHeader
          eyebrow="A empresa"
          titulo="Uma executora que a incorporadora não precisa fiscalizar de perto."
          texto="A Lima nasceu Lima Gesso, especialista em drywall, e ampliou a atuação para elétrica, hidráulica, forro, revestimentos e checklist de obra. O interlocutor é técnico — construtora, incorporadora ou síndico — e a comunicação é direta, sem linguagem de venda."
        />

        <div className="mt-11 grid gap-px border border-borda bg-borda md:grid-cols-3">
          {(
            [
              ["Propósito", fundamentos.proposito],
              ["Missão", fundamentos.missao],
              ["Visão", fundamentos.visao],
            ] as const
          ).map(([rotulo, texto]) => (
            <div key={rotulo} className="bg-superficie p-6">
              <span className="font-mono text-[0.64rem] uppercase tracking-[0.16em] text-acento-texto">
                {rotulo}
              </span>
              <p className="mt-3 text-sm text-texto-suave">{texto}</p>
            </div>
          ))}
        </div>

        <div className="mt-8">
          <ButtonLink href="/sobre" variante="ghost">
            Sobre a Lima
          </ButtonLink>
        </div>
      </Section>

      <Section id="servicos" bordaTopo>
        <SectionHeader
          eyebrow="Serviços"
          titulo="Seis frentes, uma equipe."
          texto="Todas as frentes são executadas internamente e podem ser contratadas em conjunto ou isoladamente. A cotação é feita pela equipe da Lima após a análise do pedido — sem cálculo automático de preço."
        />
        <div className="mt-11 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {servicos.map((servico, i) => (
            <ServiceCard key={servico.slug} servico={servico} indice={i + 1} />
          ))}
          <div className="on-dark border border-borda p-6">
            <span className="font-mono text-xs tracking-[0.1em] text-acento-texto">
              —
            </span>
            <h3 className="mt-3.5 text-lg font-bold text-branco">
              Checklist de entrega
            </h3>
            <p className="mt-2 text-sm text-prata">
              Vistoria final item a item, com documentação fotográfica de cada
              frente antes da transferência da obra ao cliente.
            </p>
          </div>
        </div>
      </Section>

      <Section id="obras" bordaTopo>
        <SectionHeader
          eyebrow="Prova de entrega"
          titulo="Contratos com incorporadoras, não com o morador final."
          texto="A carteira atual reúne oito obras para dois clientes do Distrito Federal. Os dados abaixo são reais e podem ser verificados em contrato."
        />
        <div className="mt-11 grid gap-4 md:grid-cols-2">
          {obras.map((obra) => (
            <ProofCard key={obra.cliente} {...obra} />
          ))}
        </div>

        <ul className="mt-8 flex flex-wrap gap-x-8 gap-y-2 font-mono text-[0.68rem] uppercase tracking-[0.08em] text-texto-suave">
          {valores.map((v) => (
            <li key={v.titulo} className="flex items-center gap-2">
              <span aria-hidden className="h-1.5 w-1.5 rotate-45 bg-roxo" />
              {v.titulo}
            </li>
          ))}
        </ul>
      </Section>

      <CtaBand />

      <Section bordaTopo>
        <p className="font-mono text-[0.7rem] uppercase tracking-[0.16em] text-texto-suave">
          Dúvida antes de orçar?
        </p>
        <p className="mt-3 max-w-[52ch] text-lg text-texto">
          Falar direto com o engenheiro responsável é o caminho mais curto.{" "}
          <Link href="/contato" className="text-acento-texto underline-offset-4 hover:underline">
            Ver contato
          </Link>
          .
        </p>
      </Section>
    </>
  );
}
