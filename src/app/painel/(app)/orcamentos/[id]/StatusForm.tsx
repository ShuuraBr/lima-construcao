"use client";

import { useState } from "react";
import { mudarStatusAction } from "../actions";
import { ORCAMENTO_STATUS, statusMeta } from "@/lib/painel-shared";

export function StatusForm({
  id,
  atual,
}: {
  id: string;
  atual: string;
}) {
  const [valor, setValor] = useState(atual);
  const mudou = valor !== atual;

  return (
    <form action={mudarStatusAction} className="flex flex-wrap items-center gap-2">
      <input type="hidden" name="id" value={id} />
      <select
        name="status"
        value={valor}
        onChange={(e) => setValor(e.target.value)}
        className="border border-borda bg-superficie-2 px-3 py-2 font-mono text-[0.72rem] uppercase tracking-[0.05em] text-texto outline-none focus:outline-2 focus:outline-acento-texto"
      >
        {ORCAMENTO_STATUS.map((s) => (
          <option key={s} value={s}>
            {statusMeta[s].label}
          </option>
        ))}
      </select>
      <button
        type="submit"
        disabled={!mudou}
        className="bg-roxo px-4 py-2 font-mono text-[0.66rem] uppercase tracking-[0.1em] text-branco transition-colors hover:bg-roxo-realce disabled:opacity-40"
      >
        Atualizar
      </button>
    </form>
  );
}
