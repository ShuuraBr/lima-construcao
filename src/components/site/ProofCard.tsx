export function ProofCard({
  cliente,
  local,
  descricao,
  metrica,
}: {
  cliente: string;
  local: string;
  descricao: string;
  metrica: string;
}) {
  return (
    <article className="on-dark border border-borda p-8">
      <h3 className="font-display text-2xl font-black tracking-[0.01em] text-branco">
        {cliente}
      </h3>
      <p className="mt-1.5 font-mono text-[0.7rem] uppercase tracking-[0.14em] text-acento-texto">
        {local}
      </p>
      <p className="mt-4 text-sm text-prata">{descricao}</p>
      <p className="mt-5 border-t border-borda pt-3.5 font-mono text-[0.72rem] tracking-[0.04em] text-branco">
        {metrica}
      </p>
    </article>
  );
}
