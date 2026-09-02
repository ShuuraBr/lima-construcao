import type { Metadata } from "next";
import { VisitaForm } from "@/components/site/VisitaForm";
import { Container } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/Section";

export const metadata: Metadata = {
  title: "Agendar visita técnica",
  description:
    "Solicite uma visita técnica da equipe da Lima Construção e Instalação. A data e a hora são confirmadas manualmente pelo engenheiro responsável.",
  alternates: { canonical: "/visita" },
};

export default function VisitaPage() {
  return (
    <section className="border-b border-borda bg-fundo py-16 sm:py-20">
      <Container className="grid gap-0 border border-borda md:grid-cols-[0.85fr_1.15fr]">
        <aside className="on-dark p-8">
          <Eyebrow>Visita técnica</Eyebrow>
          <h1 className="mt-4 text-3xl font-extrabold text-branco">
            Agende uma visita à obra.
          </h1>
          <p className="mt-4 text-sm text-prata">
            A visita técnica antecede a cotação em obras de maior escopo. Envie a
            solicitação e o Erick confirma data e hora pelo seu contato — sem
            agendamento automático.
          </p>
          <ul className="mt-6 grid gap-3 font-mono text-[0.72rem] uppercase tracking-[0.05em] text-branco">
            {[
              "Confirmação manual de data e hora",
              "Retorno pelo telefone ou e-mail informado",
              "Distrito Federal e entorno",
            ].map((item) => (
              <li key={item} className="flex gap-2.5">
                <span className="text-acento-texto">—</span>
                {item}
              </li>
            ))}
          </ul>
        </aside>

        <div className="bg-fundo">
          <VisitaForm />
        </div>
      </Container>
    </section>
  );
}
