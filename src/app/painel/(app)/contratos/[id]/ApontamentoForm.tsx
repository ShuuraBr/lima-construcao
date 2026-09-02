"use client";

import { useActionState, useState } from "react";
import {
  CONTRATO_STATUS,
  SERVICO_LABEL,
  contratoStatusMeta,
  toDateInput,
} from "@/lib/painel-shared";
import {
  registrarApontamentoAction,
  type EstadoApontamento,
} from "../actions";

const inicial: EstadoApontamento = {};
const campo =
  "w-full border border-borda bg-superficie-2 px-3 py-2 text-[0.86rem] text-texto outline-none focus:outline-2 focus:outline-acento-texto";
const rot = "font-mono text-[0.54rem] uppercase tracking-[0.12em] text-texto-suave";

export function ApontamentoForm({
  contratoId,
  frentes,
  statusAtual,
  progressoAtual,
}: {
  contratoId: string;
  frentes: string[];
  statusAtual: string;
  progressoAtual: number;
}) {
  const [estado, action, pendente] = useActionState(
    registrarApontamentoAction,
    inicial,
  );
  const [aberto, setAberto] = useState(false);

  if (!aberto) {
    return (
      <button
        type="button"
        onClick={() => setAberto(true)}
        className="bg-roxo px-4 py-2 font-mono text-[0.64rem] uppercase tracking-[0.1em] text-branco transition-colors hover:bg-roxo-realce"
      >
        Registrar andamento
      </button>
    );
  }

  return (
    <form
      action={action}
      key={estado.ok ? "ok" : "edit"}
      className="grid gap-3 border border-borda bg-superficie-2 p-4"
    >
      <input type="hidden" name="contratoId" value={contratoId} />
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="grid gap-1">
          <span className={rot}>Data</span>
          <input
            name="data"
            type="date"
            defaultValue={toDateInput(new Date())}
            className={campo}
          />
        </label>
        <label className="grid gap-1">
          <span className={rot}>Frente</span>
          <select name="frente" defaultValue="" className={campo}>
            <option value="">Geral / todas</option>
            {frentes.map((f) => (
              <option key={f} value={f}>
                {SERVICO_LABEL[f] ?? f}
              </option>
            ))}
          </select>
        </label>
        <label className="grid gap-1">
          <span className={rot}>Status</span>
          <select name="status" defaultValue={statusAtual} className={campo}>
            {CONTRATO_STATUS.map((s) => (
              <option key={s} value={s}>
                {contratoStatusMeta[s].label}
              </option>
            ))}
          </select>
        </label>
        <label className="grid gap-1">
          <span className={rot}>Progresso %</span>
          <input
            name="progresso"
            type="number"
            min={0}
            max={100}
            defaultValue={String(progressoAtual)}
            className={campo}
          />
        </label>
      </div>
      <label className="grid gap-1">
        <span className={rot}>Nota</span>
        <textarea name="nota" rows={3} className={campo} />
      </label>

      {estado.erro && (
        <p className="border border-acento-texto/60 bg-acento-texto/10 px-3 py-2 font-mono text-[0.64rem] text-acento-texto">
          {estado.erro}
        </p>
      )}
      {estado.ok && (
        <p className="font-mono text-[0.64rem] text-acento-texto">
          Andamento registrado.
        </p>
      )}

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={pendente}
          className="bg-roxo px-4 py-2 font-mono text-[0.64rem] uppercase tracking-[0.1em] text-branco transition-colors hover:bg-roxo-realce disabled:opacity-50"
        >
          {pendente ? "Salvando…" : "Salvar andamento"}
        </button>
        <button
          type="button"
          onClick={() => setAberto(false)}
          className="font-mono text-[0.62rem] uppercase tracking-[0.1em] text-texto-suave hover:text-acento-texto"
        >
          Fechar
        </button>
      </div>
    </form>
  );
}
