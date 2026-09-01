import { Simbolo } from "@/components/marca/Simbolo";

/**
 * Camada de atmosfera atrás do conteúdo: luz difusa (glows suaves) e o símbolo
 * da marca em marca d'água translúcida nas laterais. Preenche o espaço vazio de
 * telas largas sem competir com a leitura. Puramente decorativo.
 */
export function AtmosphereLayer() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
    >
      {/* luz difusa — derivam devagar */}
      <div
        className="absolute -left-[18%] -top-[22%] h-[78vh] w-[58vw] rounded-full will-change-transform motion-safe:animate-[atmo-a_44s_ease-in-out_infinite]"
        style={{
          background:
            "radial-gradient(circle, var(--atmo-1) 0%, transparent 70%)",
        }}
      />
      <div
        className="absolute -right-[16%] top-[18%] h-[72vh] w-[50vw] rounded-full will-change-transform motion-safe:animate-[atmo-b_52s_ease-in-out_infinite]"
        style={{
          background:
            "radial-gradient(circle, var(--atmo-2) 0%, transparent 72%)",
        }}
      />
      <div
        className="absolute left-[38%] -bottom-[28%] h-[64vh] w-[52vw] rounded-full will-change-transform motion-safe:animate-[atmo-a_60s_ease-in-out_infinite_reverse]"
        style={{
          background:
            "radial-gradient(circle, var(--atmo-1) 0%, transparent 74%)",
        }}
      />

      {/* símbolo em marca d'água — só onde há sobra lateral real */}
      <Simbolo
        className="absolute -left-[9vw] top-1/2 hidden h-[150vh] w-auto -translate-y-1/2 xl:block"
        style={{ color: "var(--atmo-wm)" }}
      />
      <Simbolo
        className="absolute -right-[13vw] top-[6%] hidden h-[95vh] w-auto rotate-180 2xl:block"
        style={{ color: "var(--atmo-wm)" }}
      />
    </div>
  );
}
