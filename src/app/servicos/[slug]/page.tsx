import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CtaBand } from "@/components/site/CtaBand";
import { Section } from "@/components/ui/Section";
import { Eyebrow } from "@/components/ui/Section";
import { ButtonLink } from "@/components/ui/Button";
import { servicos } from "@/lib/site";

type Params = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return servicos.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const servico = servicos.find((s) => s.slug === slug);
  if (!servico) return {};
  return {
    title: servico.nome,
    description: servico.descricao,
    alternates: { canonical: `/servicos/${servico.slug}` },
  };
}

export default async function ServicoPage({ params }: Params) {
  const { slug } = await params;
  const indice = servicos.findIndex((s) => s.slug === slug);
  if (indice === -1) notFound();
  const servico = servicos[indice];
  const outros = servicos.filter((s) => s.slug !== slug);

  return (
    <>
      <Section className="on-dark border-b border-borda bg-preto">
        <Eyebrow>Serviço {String(indice + 1).padStart(2, "0")}</Eyebrow>
        <h1 className="mt-4 max-w-[16ch] text-4xl font-black text-branco sm:text-5xl">
          {servico.nome}
        </h1>
        <p className="mt-5 max-w-[52ch] text-lg text-prata">
          {servico.descricao}
        </p>
        <p className="mt-6 inline-block border border-borda px-3 py-2 font-mono text-[0.68rem] uppercase tracking-[0.1em] text-acento-texto">
          {servico.spec}
        </p>
        <div className="mt-9">
          <ButtonLink href={`/orcamento?servico=${encodeURIComponent(servico.valorFormulario)}`}>
            Orçar {servico.nome.toLowerCase()}
          </ButtonLink>
        </div>
      </Section>

      <Section bordaTopo>
        <h2 className="font-mono text-[0.7rem] uppercase tracking-[0.16em] text-texto-suave">
          Outras frentes
        </h2>
        <ul className="mt-5 grid gap-px border border-borda bg-borda sm:grid-cols-2 lg:grid-cols-3">
          {outros.map((s) => (
            <li key={s.slug}>
              <Link
                href={`/servicos/${s.slug}`}
                className="block bg-superficie p-5 transition-colors hover:bg-superficie-2"
              >
                <span className="font-display text-base font-bold text-texto-forte">
                  {s.nome}
                </span>
                <span className="mt-1 block text-sm text-texto-suave">
                  {s.resumo}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </Section>

      <CtaBand titulo={`Precisa de ${servico.nome.toLowerCase()} na obra?`} />
    </>
  );
}
