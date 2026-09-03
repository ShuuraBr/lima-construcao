"use client";

import { useState } from "react";
import { mudarStatusContratoAction } from "../actions";
import { CONTRATO_STATUS, contratoStatusMeta } from "@/lib/painel-shared";

const AVISAVEIS = ["EM_EXECUCAO", "CONCLUIDO", "CANCELADO"];

export function StatusContratoForm({
  id,
  status,
  progresso,
  temEmail,
}: {
  id: string;
  status: string;
  progresso: number;
  temEmail: boolean;
}) {
  const [s, setS] = useState(status);
  const [p, setP] = useState(String(progresso));
  const mudou = s !== status || p !== String(progresso);
  const avisaCliente = s !== status && AVISAVEIS.includes(s);

  return (
    <form
      action={mudarStatusContratoAction}
      className="flex flex-wrap items-end gap-2"
    >
      <input type="hidden" name="id" value={id} />
      <label className="grid gap-1">
        <span className="font-mono text-[0.54rem] uppercase tracking-[0.12em] text-texto-suave">
          Status
        </span>
        <select
          name="status"
          value={s}
          onChange={(e) => setS(e.target.value)}
          className="border border-borda bg-superficie-2 px-3 py-2 font-mono text-[0.72rem] uppercase tracking-[0.05em] text-texto outline-none focus:outline-2 focus:outline-acento-texto"
        >
          {CONTRATO_STATUS.map((v) => (
            <option key={v} value={v}>
              {contratoStatusMeta[v].label}
            </option>
          ))}
        </select>
      </label>
      <label className="grid gap-1">
        <span className="font-mono text-[0.54rem] uppercase tracking-[0.12em] text-texto-suave">
          Progresso %
        </span>
        <input
          name="progresso"
          type="number"
          min={0}
          max={100}
          value={p}
          onChange={(e) => setP(e.target.value)}
          className="w-20 border border-borda bg-superficie-2 px-3 py-2 font-mono text-[0.78rem] tabular-nums text-texto outline-none focus:outline-2 focus:outline-acento-texto"
        />
      </label>
      <button
        type="submit"
        disabled={!mudou}
        className="bg-roxo px-4 py-2 font-mono text-[0.64rem] uppercase tracking-[0.1em] text-branco transition-colors hover:bg-roxo-realce disabled:opacity-40"
      >
        Atualizar
      </button>
      {avisaCliente && (
        <label className="flex w-full items-center gap-2 text-[0.72rem] text-texto">
          <input
            type="checkbox"
            name="notificar"
            defaultChecked={temEmail}
            disabled={!temEmail}
            className="accent-roxo"
          />
          {temEmail
            ? "Avisar o cliente por e-mail"
            : "Cliente sem e-mail cadastrado"}
        </label>
      )}
    </form>
  );
}
