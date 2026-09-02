"use client";

import { useId, useState } from "react";

/**
 * Campo de senha com botão de mostrar/ocultar (ícone de olho).
 */
export function CampoSenha({
  name,
  label,
  autoComplete = "current-password",
  minLength,
}: {
  name: string;
  label: string;
  autoComplete?: string;
  minLength?: number;
}) {
  const [visivel, setVisivel] = useState(false);
  const id = useId();

  return (
    <label htmlFor={id} className="flex flex-col gap-1.5">
      <span className="font-mono text-[0.62rem] uppercase tracking-[0.12em] text-texto-suave">
        {label}
      </span>
      <span className="relative flex items-center">
        <input
          id={id}
          name={name}
          type={visivel ? "text" : "password"}
          autoComplete={autoComplete}
          minLength={minLength}
          required
          className="w-full border border-borda bg-superficie-2 py-2.5 pl-3 pr-11 text-[0.92rem] text-texto outline-none focus:outline-2 focus:outline-acento-texto"
        />
        <button
          type="button"
          onClick={() => setVisivel((v) => !v)}
          aria-pressed={visivel}
          aria-label={visivel ? "Ocultar senha" : "Mostrar senha"}
          title={visivel ? "Ocultar senha" : "Mostrar senha"}
          className="absolute right-0 flex h-full w-11 items-center justify-center text-texto-suave transition-colors hover:text-acento-texto"
        >
          {visivel ? <OlhoFechado /> : <Olho />}
        </button>
      </span>
    </label>
  );
}

function Olho() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function OlhoFechado() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M2 12s3.5-7 10-7c2 0 3.8.6 5.3 1.5M22 12s-3.5 7-10 7c-2 0-3.8-.6-5.3-1.5" />
      <path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" />
      <path d="M3 3l18 18" />
    </svg>
  );
}
