"use client";

import { useActionState } from "react";
import { definirSenhaAction, type EstadoSenha } from "./actions";
import { CampoSenha } from "@/components/painel/CampoSenha";

const inicial: EstadoSenha = {};

export function SenhaForm({ token }: { token: string }) {
  const [estado, action, pendente] = useActionState(definirSenhaAction, inicial);

  return (
    <form action={action} className="mt-7 flex flex-col gap-4">
      <input type="hidden" name="token" value={token} />

      <CampoSenha
        name="senha"
        label="Nova senha"
        autoComplete="new-password"
        minLength={8}
      />

      <CampoSenha
        name="confirmar"
        label="Confirmar senha"
        autoComplete="new-password"
        minLength={8}
      />

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
