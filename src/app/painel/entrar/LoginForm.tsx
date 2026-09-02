"use client";

import { useActionState } from "react";
import { entrarAction, type EstadoLogin } from "./actions";
import { CampoSenha } from "@/components/painel/CampoSenha";

const inicial: EstadoLogin = {};

export function LoginForm({ de }: { de?: string }) {
  const [estado, action, pendente] = useActionState(entrarAction, inicial);

  return (
    <form action={action} className="mt-7 flex flex-col gap-4">
      {de && <input type="hidden" name="de" value={de} />}

      <label className="flex flex-col gap-1.5">
        <span className="font-mono text-[0.62rem] uppercase tracking-[0.12em] text-texto-suave">
          E-mail
        </span>
        <input
          name="email"
          type="email"
          autoComplete="username"
          required
          className="border border-borda bg-superficie-2 px-3 py-2.5 text-[0.92rem] text-texto outline-none focus:outline-2 focus:outline-acento-texto"
        />
      </label>

      <CampoSenha name="senha" label="Senha" autoComplete="current-password" />

      {estado.erro && (
        <p
          role="alert"
          className="border border-acento-texto/60 bg-acento-texto/10 px-3 py-2 font-mono text-[0.66rem] tracking-[0.02em] text-acento-texto"
        >
          {estado.erro}
        </p>
      )}

      <button
        type="submit"
        disabled={pendente}
        className="mt-1 bg-roxo px-5 py-3 font-mono text-[0.72rem] uppercase tracking-[0.1em] text-branco transition-colors hover:bg-roxo-realce disabled:opacity-50"
      >
        {pendente ? "Entrando…" : "Entrar"}
      </button>
    </form>
  );
}
