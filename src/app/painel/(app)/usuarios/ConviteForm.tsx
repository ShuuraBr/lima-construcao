"use client";

import { useActionState } from "react";
import { convidarAction, type EstadoConvite } from "./actions";

const inicial: EstadoConvite = {};
const campo =
  "border border-borda bg-superficie-2 px-3 py-2.5 text-[0.9rem] text-texto outline-none focus:outline-2 focus:outline-acento-texto";

export function ConviteForm() {
  const [estado, action, pendente] = useActionState(convidarAction, inicial);

  return (
    <div className="border border-borda bg-superficie p-5">
      <h2 className="font-display text-sm font-bold text-texto-forte">
        Convidar usuário
      </h2>
      <p className="mt-1 text-[0.82rem] text-texto-suave">
        O convidado recebe um link para criar a própria senha (válido por 3 dias).
      </p>

      <form action={action} className="mt-4 grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
        <input name="nome" placeholder="Nome" required className={campo} />
        <input
          name="email"
          type="email"
          placeholder="e-mail"
          required
          className={campo}
        />
        <input
          name="cargo"
          placeholder="Cargo (opcional)"
          className={`${campo} sm:col-span-2`}
        />
        <button
          type="submit"
          disabled={pendente}
          className="bg-roxo px-5 py-2.5 font-mono text-[0.68rem] uppercase tracking-[0.1em] text-branco transition-colors hover:bg-roxo-realce disabled:opacity-50 sm:col-start-3 sm:row-start-1"
        >
          {pendente ? "Enviando…" : "Enviar convite"}
        </button>
      </form>

      {estado.erro && (
        <p className="mt-3 border border-acento-texto/60 bg-acento-texto/10 px-3 py-2 font-mono text-[0.66rem] text-acento-texto">
          {estado.erro}
        </p>
      )}

      {estado.ok && (
        <div className="mt-3 border border-borda bg-superficie-2 p-3">
          <p className="font-mono text-[0.62rem] uppercase tracking-[0.1em] text-texto-suave">
            {estado.enviado
              ? "Convite enviado por e-mail"
              : "E-mail não configurado — copie o link e envie ao convidado:"}
          </p>
          {!estado.enviado && estado.link && (
            <code className="mt-1.5 block overflow-x-auto whitespace-nowrap bg-fundo px-2 py-1.5 text-[0.72rem] text-acento-texto">
              {estado.link}
            </code>
          )}
        </div>
      )}
    </div>
  );
}
