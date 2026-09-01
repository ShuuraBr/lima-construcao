import { Container } from "@/components/ui/Container";
import { credenciais } from "@/lib/site";

export function StatStrip() {
  return (
    <div className="on-dark border-b border-borda bg-roxo-profundo">
      <Container className="grid grid-cols-2 gap-px bg-borda px-0 lg:grid-cols-4">
        {credenciais.map((c) => (
          <div key={c.rotulo} className="bg-roxo-profundo px-5 py-6 sm:px-6">
            <div className="font-mono text-2xl text-branco sm:text-[1.75rem]">
              {c.valor}
            </div>
            <div className="mt-1.5 font-mono text-[0.66rem] uppercase tracking-[0.14em] text-acento-texto">
              {c.rotulo}
            </div>
          </div>
        ))}
      </Container>
    </div>
  );
}
