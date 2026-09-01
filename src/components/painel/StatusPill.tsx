const tons: Record<string, string> = {
  novo: "text-acento-texto border-acento-texto bg-acento-texto/10",
  andamento: "text-texto-suave border-borda-forte",
  ok: "text-branco bg-roxo border-roxo",
  recusado: "text-texto-suave border-borda-forte line-through decoration-1",
};

export function StatusPill({
  label,
  tom = "andamento",
}: {
  label: string;
  tom?: "novo" | "andamento" | "ok" | "recusado";
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 border px-2 py-1 font-mono text-[0.58rem] uppercase tracking-[0.1em] ${tons[tom]}`}
    >
      {label}
    </span>
  );
}
