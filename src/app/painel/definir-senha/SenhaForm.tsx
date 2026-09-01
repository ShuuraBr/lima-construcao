"use client";

import { useActionState } from "react";
import { definirSenhaAction, type EstadoSenha } from "./actions";

const inicial: EstadoSenha = {};
const campo =
  "border border-borda bg-superficie-2 px-3 py-2.5 text-[0.92rem] text-texto outline-none focus:outline-2 focus:outline-acento-texto";

export function SenhaForm({ token }: { token: string }) {
  const [estado, action, pendente] = useActionState(definirSenhaAction, inicial);

  return (
    <form action={action} className="mt-7 flex flex-col gap-4">
      <input type="hidden" name="token" value={token} />

      <label className="flex flex-col gap-1.5">
        <span className="font-mono text-[0.62rem] uppercase tracking-[0.12em] text-texto-suave">
          Nova senha
        </span>
        <input
          name="senha"
          type="password"
          autoComplete="new-password"
          minLength={8}
          required
          className={campo}
        />
      </label>

      <label className="flex flex-col gap-1.5">
        <span className="font-mono text-[0.62rem] uppercase tracking-[0.12em] text-texto-suave">
          Confirmar senha
        </span>
        <input
          name="confirmar"
          type="password"
          autoComplete="new-password"
          minLength={8}
          required
          className={campo}
        />
      </label>

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
        {pendente ? "Salvando…" : "Definir senha e entrar"}
      </button>
    </form>
  );
}
