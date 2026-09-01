import type { Metadata } from "next";
import { ServiceCard } from "@/components/site/ServiceCard";
import { CtaBand } from "@/components/site/CtaBand";
import { Section, SectionHeader } from "@/components/ui/Section";
import { servicos } from "@/lib/site";

export const metadata: Metadata = {
  title: "Serviços",
  description:
    "Drywall, steel frame, elétrica, hidráulica, forro e acabamento/revestimento — executados por equipe própria e fixa da Lima Construção e Instalação.",
  alternates: { canonical: "/servicos" },
};

export default function ServicosPage() {
  return (
    <>
      <Section className="border-b border-borda bg-preto">
        <SectionHeader
          eyebrow="Serviços"
          titulo="Seis frentes, executadas pela mesma equipe."
          texto="Cada frente pode ser contratada isoladamente ou em conjunto. A cotação é feita por um engenheiro da Lima após análise de escopo, prazo e visita técnica — não há calculadora automática de preço."
        />
      </Section>

      <Section bordaTopo>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {servicos.map((servico, i) => (
            <ServiceCard key={servico.slug} servico={servico} indice={i + 1} />
          ))}
        </div>
      </Section>

      <Section bordaTopo>
        <SectionHeader
          eyebrow="Fora da cotação de obra"
          titulo="Checklist de entrega."
          texto="Toda obra encerra com uma vistoria final item a item e documentação fotográfica de cada frente, antes da transferência ao cliente. O acabamento é a prova; a documentação registra o que foi entregue."
        />
      </Section>

      <CtaBand />
    </>
  );
}
