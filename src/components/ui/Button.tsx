import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";

type Variante = "primary" | "ghost" | "ghost-claro";

const base =
  "inline-flex items-center justify-center gap-2 font-mono text-[0.72rem] uppercase tracking-[0.1em] px-5 py-3.5 transition-colors duration-150 disabled:opacity-50 disabled:pointer-events-none";

const variantes: Record<Variante, string> = {
  primary: "bg-roxo text-branco hover:bg-roxo-realce",
  ghost:
    "border border-borda-forte text-texto-forte hover:border-acento-texto hover:text-acento-texto",
  // usada apenas sobre faixas escuras (.on-dark) — tokens já resolvem p/ claro sobre escuro
  "ghost-claro":
    "border border-borda-forte text-texto hover:border-texto-forte hover:text-texto-forte",
};

export function ButtonLink({
  href,
  variante = "primary",
  className,
  children,
  ...rest
}: {
  href: string;
  variante?: Variante;
  className?: string;
  children: ReactNode;
} & Omit<ComponentProps<typeof Link>, "href" | "className" | "children">) {
  return (
    <Link
      href={href}
      className={`${base} ${variantes[variante]} ${className ?? ""}`}
      {...rest}
    >
      {children}
    </Link>
  );
}

export function Button({
  variante = "primary",
  className,
  children,
  ...rest
}: {
  variante?: Variante;
  className?: string;
  children: ReactNode;
} & ComponentProps<"button">) {
  return (
    <button
      className={`${base} ${variantes[variante]} ${className ?? ""}`}
      {...rest}
    >
      {children}
    </button>
  );
}
