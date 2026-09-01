import { ButtonLink } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";

export default function NotFound() {
  return (
    <Container className="flex min-h-[60vh] flex-col justify-center py-20">
      <p className="font-mono text-[0.7rem] uppercase tracking-[0.16em] text-acento-texto">
        Erro 404
      </p>
      <h1 className="mt-4 text-4xl font-black text-texto-forte">
        Página não encontrada.
      </h1>
      <p className="mt-4 max-w-[46ch] text-texto-suave">
        O endereço acessado não existe ou foi movido. Volte para a página
        inicial ou fale com a equipe.
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        <ButtonLink href="/">Página inicial</ButtonLink>
        <ButtonLink href="/contato" variante="ghost">
          Contato
        </ButtonLink>
      </div>
    </Container>
  );
}
