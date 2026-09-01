import { ButtonLink } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";

export function CtaBand({
  titulo = "Tem uma obra para orçar?",
  texto = "Descreva o escopo. A cotação é feita por um engenheiro, sem calculadora automática, com retorno em até 2 dias úteis.",
}: {
  titulo?: string;
  texto?: string;
}) {
  return (
    <section className="border-y border-borda bg-roxo-profundo">
      <Container className="flex flex-col gap-6 py-14 sm:flex-row sm:items-center sm:justify-between">
        <div className="max-w-[46ch]">
          <h2 className="text-2xl font-extrabold text-branco sm:text-3xl">
            {titulo}
          </h2>
          <p className="mt-3 text-sm text-prata">{texto}</p>
        </div>
        <ButtonLink href="/orcamento" className="shrink-0">
          Solicitar orçamento
        </ButtonLink>
      </Container>
    </section>
  );
}
