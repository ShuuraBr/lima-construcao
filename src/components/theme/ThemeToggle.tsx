"use client";

import { useTheme } from "next-themes";
import { useSyncExternalStore } from "react";

type Modo = "system" | "light" | "dark";

const ordem: Modo[] = ["system", "light", "dark"];
const rotulo: Record<Modo, string> = {
  system: "Tema: automático",
  light: "Tema: claro",
  dark: "Tema: escuro",
};

const noop = () => () => {};
function useMontado() {
  return useSyncExternalStore(
    noop,
    () => true,
    () => false,
  );
}

function Icone({ modo }: { modo: Modo }) {
  const p = {
    width: 16,
    height: 16,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.6,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };
  if (modo === "light")
    return (
      <svg {...p} aria-hidden>
        <circle cx="12" cy="12" r="4.5" />
        <path d="M12 2.5v2M12 19.5v2M21.5 12h-2M4.5 12h-2M18 6l-1.5 1.5M7.5 16.5 6 18M18 18l-1.5-1.5M7.5 7.5 6 6" />
      </svg>
    );
  if (modo === "dark")
    return (
      <svg {...p} aria-hidden>
        <path d="M20 14.5A8.5 8.5 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5Z" />
      </svg>
    );
  return (
    <svg {...p} aria-hidden>
      <rect x="3" y="4" width="18" height="13" rx="1" />
      <path d="M8 21h8M12 17v4" />
    </svg>
  );
}

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, setTheme } = useTheme();
  const montado = useMontado();

  const atual = (montado ? (theme as Modo) : "system") ?? "system";
  const proximo = ordem[(ordem.indexOf(atual) + 1) % ordem.length];

  return (
    <button
      type="button"
      onClick={() => setTheme(proximo)}
      title={rotulo[atual]}
      aria-label={`${rotulo[atual]}. Trocar para ${rotulo[proximo].toLowerCase()}`}
      className={`flex h-9 w-9 shrink-0 items-center justify-center border border-borda text-texto-suave transition-colors hover:border-acento-texto hover:text-acento-texto ${className ?? ""}`}
    >
      {montado ? <Icone modo={atual} /> : <span className="h-4 w-4" />}
    </button>
  );
}
