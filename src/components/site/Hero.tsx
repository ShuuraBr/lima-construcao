import { Simbolo } from "@/components/marca/Simbolo";
import { ButtonLink } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/Section";
import { site } from "@/lib/site";

export function Hero() {
  return (
    <section className="on-dark relative overflow-hidden border-b border-borda">
      {/* Luz difusa — brilho roxo vindo do canto inferior direito */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(60% 80% at 88% 78%, rgba(181,84,140,0.28), transparent 60%), radial-gradient(45% 55% at 8% 0%, rgba(127,32,90,0.35), transparent 65%)",
        }}
      />
      {/* Símbolo em marca d'água, baixa opacidade, atrás do texto */}
      <Simbolo
        aria-hidden
        className="pointer-events-none absolute top-1/2 right-[4%] hidden h-[78%] w-auto -translate-y-1/2 text-logo/[0.1] sm:block"
      />
      {/* Corte diagonal — mesmo ângulo da base do símbolo */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "linear-gradient(-9deg, transparent 0 61%, rgba(197,107,160,0.3) 61% 61.35%, transparent 61.35%)",
        }}
      />
      <Container className="relative py-20 sm:py-28 lg:py-36">
        <Eyebrow>Construção civil · {site.regiao}</Eyebrow>
        <h1 className="mt-5 max-w-[15ch] text-[2.5rem] font-black leading-[1.02] tracking-[-0.02em] text-branco sm:text-6xl lg:text-[4.4rem]">
          Estrutura que <span className="text-acento-texto">não improvisa.</span>
        </h1>
        <p className="mt-6 max-w-[46ch] text-base text-prata sm:text-lg">
          Instalações e obras completas — drywall, steel frame, elétrica,
          hidráulica, forro e revestimento — executadas por equipe própria e
          fixa, do início ao fim, com prazo e garantia em contrato.
        </p>
        <div className="mt-9 flex flex-wrap gap-3">
          <ButtonLink href="/orcamento">Solicitar orçamento</ButtonLink>
          <ButtonLink href="/servicos" variante="ghost-claro">
            Ver serviços
          </ButtonLink>
        </div>
      </Container>
    </section>
  );
}
