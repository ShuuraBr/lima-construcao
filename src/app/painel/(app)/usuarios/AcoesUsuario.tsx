"use client";

import { useActionState } from "react";
import {
  reenviarConviteAction,
  alternarAtivoAction,
  type EstadoConvite,
} from "./actions";

const inicial: EstadoConvite = {};

export function AcoesUsuario({
  id,
  ativo,
  temSenha,
  ehVoce,
}: {
  id: string;
  ativo: boolean;
  temSenha: boolean;
  ehVoce: boolean;
}) {
  const [estado, reenviar, pendente] = useActionState(
    reenviarConviteAction,
    inicial,
  );

  return (
    <div className="flex flex-col items-end gap-1.5">
      <div className="flex gap-2">
        {!temSenha && (
          <form action={reenviar}>
            <input type="hidden" name="id" value={id} />
            <button
              type="submit"
              disabled={pendente}
              className="border border-borda px-2.5 py-1 font-mono text-[0.58rem] uppercase tracking-[0.08em] text-texto-suave hover:border-acento-texto hover:text-acento-texto disabled:opacity-50"
            >
              {pendente ? "…" : "Reenviar convite"}
            </button>
          </form>
        )}
        {!ehVoce && (
          <form action={alternarAtivoAction}>
            <input type="hidden" name="id" value={id} />
            <button
              type="submit"
              className="border border-borda px-2.5 py-1 font-mono text-[0.58rem] uppercase tracking-[0.08em] text-texto-suave hover:border-acento-texto hover:text-acento-texto"
            >
              {ativo ? "Desativar" : "Reativar"}
            </button>
          </form>
        )}
      </div>

      {estado.ok && !estado.enviado && estado.link && (
        <code className="max-w-[280px] overflow-x-auto whitespace-nowrap bg-fundo px-2 py-1 text-[0.66rem] text-acento-texto">
          {estado.link}
        </code>
      )}
      {estado.ok && estado.enviado && (
        <span className="font-mono text-[0.58rem] uppercase tracking-[0.08em] text-texto-suave">
          Enviado
        </span>
      )}
    </div>
  );
}
