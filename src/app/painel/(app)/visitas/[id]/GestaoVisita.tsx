"use client";

import { useState } from "react";
import { gerirVisitaAction } from "../actions";
import { VISITA_STATUS, visitaStatusMeta } from "@/lib/painel-shared";

const campo =
  "border border-borda bg-superficie-2 px-3 py-2 text-[0.86rem] text-texto outline-none focus:outline-2 focus:outline-acento-texto";

export function GestaoVisita({
  id,
  status,
  agendadaEm,
  observacoesInternas,
}: {
  id: string;
  status: string;
  agendadaEm: string;
  observacoesInternas: string;
}) {
  const [s, setS] = useState(status);

  return (
    <form action={gerirVisitaAction} className="grid gap-3">
      <input type="hidden" name="id" value={id} />
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="grid gap-1">
          <span className="font-mono text-[0.54rem] uppercase tracking-[0.12em] text-texto-suave">
            Status
          </span>
          <select
            name="status"
            value={s}
            onChange={(e) => setS(e.target.value)}
            className={campo}
          >
            {VISITA_STATUS.map((v) => (
              <option key={v} value={v}>
                {visitaStatusMeta[v].label}
              </option>
            ))}
          </select>
        </label>
        <label className="grid gap-1">
          <span className="font-mono text-[0.54rem] uppercase tracking-[0.12em] text-texto-suave">
            Agendada para
          </span>
          <input
            name="agendadaEm"
            type="datetime-local"
            defaultValue={agendadaEm}
            className={campo}
          />
        </label>
      </div>
      <label className="grid gap-1">
        <span className="font-mono text-[0.54rem] uppercase tracking-[0.12em] text-texto-suave">
          Observações internas
        </span>
        <textarea
          name="observacoesInternas"
          rows={2}
          defaultValue={observacoesInternas}
          className={campo}
        />
      </label>
      <div>
        <button
          type="submit"
          className="bg-roxo px-4 py-2 font-mono text-[0.64rem] uppercase tracking-[0.1em] text-branco transition-colors hover:bg-roxo-realce"
        >
          Atualizar
        </button>
      </div>
    </form>
  );
}
