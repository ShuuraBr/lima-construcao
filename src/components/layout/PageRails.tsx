/**
 * Réguas verticais que emolduram a página em telas muito largas — dão função
 * à sobra lateral (referência à malha construtiva do manual de marca) em vez
 * de deixá-la vazia. Puramente decorativo, fixas na borda do viewport.
 */
export function PageRails() {
  const linha =
    "repeating-linear-gradient(to bottom, var(--color-prata) 0 4px, transparent 4px 40px)";
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-0 hidden 2xl:block"
    >
      <span
        className="absolute left-10 top-24 bottom-10 w-px opacity-[0.2]"
        style={{ backgroundImage: linha }}
      />
      <span
        className="absolute right-10 top-24 bottom-10 w-px opacity-[0.2]"
        style={{ backgroundImage: linha }}
      />
      <span className="absolute left-10 top-24 h-2 w-2 -translate-x-[3px] rotate-45 bg-acento-texto" />
      <span className="absolute right-10 top-24 h-2 w-2 translate-x-[3px] rotate-45 bg-acento-texto" />
    </div>
  );
}
