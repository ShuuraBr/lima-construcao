import type { Metadata } from "next";
import { Section, SectionHeader } from "@/components/ui/Section";
import { ButtonLink } from "@/components/ui/Button";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contato",
  description:
    "Fale com o engenheiro responsável da Lima Construção e Instalação. Atendimento técnico direto, Brasília — DF e entorno.",
  alternates: { canonical: "/contato" },
};

const canais = [
  {
    k: "Responsável",
    v: `${site.contato.responsavel} — ${site.contato.cargo}`,
    s: "Atendimento técnico direto com quem executa.",
    href: undefined,
  },
  {
    k: "E-mail",
    v: site.contato.email,
    s: "Retorno de cotação em até 2 dias úteis.",
    href: `mailto:${site.contato.email}`,
  },
  {
    k: "Telefone / WhatsApp",
    v: site.contato.telefone,
    s: `${site.contato.cidade} e entorno.`,
    href: site.contato.whatsappHref,
  },
];

export default function ContatoPage() {
  return (
    <>
      <Section className="on-dark border-b border-borda">
        <SectionHeader
          eyebrow="Contato"
          titulo="Falar com o engenheiro responsável."
          texto="Para pedidos de orçamento, use o formulário — o pedido entra organizado no painel da equipe. Para as demais conversas, os canais diretos estão abaixo."
        />
        <div className="mt-8">
          <ButtonLink href="/orcamento">Solicitar orçamento</ButtonLink>
        </div>
      </Section>

      <Section bordaTopo>
        <div className="grid gap-px border border-borda bg-borda md:grid-cols-3">
          {canais.map((c) => (
            <div key={c.k} className="bg-superficie p-6">
              <div className="font-mono text-[0.64rem] uppercase tracking-[0.16em] text-acento-texto">
                {c.k}
              </div>
              {c.href ? (
                <a
                  href={c.href}
                  className="mt-2.5 block font-mono text-[0.92rem] tracking-[0.02em] text-texto-forte hover:text-acento-texto"
                >
                  {c.v}
                </a>
              ) : (
                <div className="mt-2.5 font-mono text-[0.92rem] tracking-[0.02em] text-texto-forte">
                  {c.v}
                </div>
              )}
              <div className="mt-1 text-sm text-texto-suave">{c.s}</div>
            </div>
          ))}
        </div>

        <p className="mt-8 max-w-[60ch] text-sm text-texto-suave">
          O site não tem área de login para clientes. O acompanhamento de
          contratos e obras é feito pela equipe da Lima e comunicado diretamente
          ao contato de cada obra.
        </p>
      </Section>
    </>
  );
}
