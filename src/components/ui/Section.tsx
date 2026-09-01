import type { ReactNode } from "react";
import { Container } from "./Container";

export function Section({
  id,
  className,
  containerClassName,
  bordaTopo = false,
  children,
}: {
  id?: string;
  className?: string;
  containerClassName?: string;
  bordaTopo?: boolean;
  children: ReactNode;
}) {
  return (
    <section
      id={id}
      className={`py-16 sm:py-20 lg:py-28 ${
        bordaTopo ? "border-t border-borda" : ""
      } ${className ?? ""}`}
    >
      <Container className={containerClassName}>{children}</Container>
    </section>
  );
}

export function SectionHeader({
  eyebrow,
  titulo,
  texto,
  className,
}: {
  eyebrow?: string;
  titulo: string;
  texto?: string;
  className?: string;
}) {
  return (
    <div className={`max-w-[62ch] ${className ?? ""}`}>
      {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
      <h2 className="mt-3 text-3xl font-extrabold sm:text-4xl lg:text-[2.6rem]">
        {titulo}
      </h2>
      {texto && <p className="mt-4 text-texto-suave">{texto}</p>}
    </div>
  );
}

export function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <span className="flex items-center gap-2.5 font-mono text-[0.72rem] uppercase tracking-[0.22em] text-acento-texto">
      <span aria-hidden className="h-px w-6 bg-acento-texto" />
      {children}
    </span>
  );
}
