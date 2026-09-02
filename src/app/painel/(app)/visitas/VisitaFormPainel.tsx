"use client";

import Link from "next/link";
import { useActionState } from "react";
import { VISITA_STATUS, visitaStatusMeta } from "@/lib/painel-shared";
import {
  criarVisitaAction,
  atualizarVisitaAction,
  type EstadoVisitaPainel,
} from "./actions";
import { aplicarMascara, mascaraTelefone } from "@/lib/mascaras";
import { EnderecoFields } from "@/components/painel/EnderecoFields";

const inicial: EstadoVisitaPainel = {};
const campo =
  "w-full border border-borda bg-superficie-2 px-3 py-2.5 text-[0.9rem] text-texto outline-none focus:outline-2 focus:outline-acento-texto";
const rot = "font-mono text-[0.58rem] uppercase tracking-[0.12em] text-texto-suave";

export type ValoresVisita = Record<string, string>;

export function VisitaFormPainel({
  modo,
  id,
  valores,
}: {
  modo: "novo" | "editar";
  id?: string;
  valores?: ValoresVisita;
}) {
  const [estado, action, pendente] = useActionState(
    modo === "novo" ? criarVisitaAction : atualizarVisitaAction,
    inicial,
  );
  const e = estado.valores;
  const v = (k: string) => e?.[k] ?? valores?.[k] ?? "";

  return (
    <form
      action={action}
      key={JSON.stringify(e ?? null)}
      className="grid gap-3 border border-borda bg-superficie p-5"
    >
      {modo === "editar" && <input type="hidden" name="id" value={id} />}

      <div className="grid gap-3 sm:grid-cols-2">
        <Campo r="Solicitante *">
          <input name="nome" required defaultValue={v("nome")} className={campo} />
        </Campo>
        <Campo r="Empresa">
          <input name="empresa" defaultValue={v("empresa")} className={campo} />
        </Campo>
        <Campo r="E-mail">
          <input name="email" type="email" defaultValue={v("email")} className={campo} />
        </Campo>
        <Campo r="Telefone">
          <input
            name="telefone"
            inputMode="tel"
            placeholder="(61) 99999-9999"
            defaultValue={v("telefone")}
            onInput={aplicarMascara(mascaraTelefone)}
            className={campo}
          />
        </Campo>
      </div>

      <div className="border-t border-borda pt-3">
        <p className={`${rot} mb-2`}>Endereço da obra</p>
        <EnderecoFields
          valores={{
            cep: v("cep"),
            logradouro: v("logradouro"),
            enderecoNumero: v("enderecoNumero"),
            complemento: v("complemento"),
            bairro: v("bairro"),
            cidade: v("cidade"),
            uf: v("uf"),
            latitude: v("latitude"),
            longitude: v("longitude"),
          }}
        />
      </div>

      <Campo r="Preferência de data/horário">
        <input name="preferencia" defaultValue={v("preferencia")} className={campo} />
      </Campo>
      <Campo r="Mensagem do solicitante">
        <textarea name="mensagem" rows={3} defaultValue={v("mensagem")} className={campo} />
      </Campo>

      <div className="grid gap-3 sm:grid-cols-2">
        <Campo r="Status">
          <select
            name="status"
            defaultValue={v("status") || VISITA_STATUS[0]}
            className={campo}
          >
            {VISITA_STATUS.map((s) => (
              <option key={s} value={s}>
                {visitaStatusMeta[s].label}
              </option>
            ))}
          </select>
        </Campo>
        <Campo r="Agendada para">
          <input
            name="agendadaEm"
            type="datetime-local"
            defaultValue={v("agendadaEm")}
            className={campo}
          />
        </Campo>
      </div>

      <Campo r="Observações internas">
        <textarea
          name="observacoesInternas"
          rows={2}
          defaultValue={v("observacoesInternas")}
          className={campo}
        />
      </Campo>

      <div className="grid gap-3 sm:grid-cols-2">
        <Campo r="Contrato vinculado (ID)">
          <input name="contratoId" defaultValue={v("contratoId")} className={campo} />
        </Campo>
        <Campo r="Orçamento vinculado (ID)">
          <input
            name="pedidoOrcamentoId"
            defaultValue={v("pedidoOrcamentoId")}
            className={campo}
          />
        </Campo>
      </div>

      {estado.erro && (
        <p className="border border-acento-texto/60 bg-acento-texto/10 px-3 py-2 font-mono text-[0.66rem] text-acento-texto">
          {estado.erro}
        </p>
      )}

      <div className="flex items-center gap-3 pt-1">
        <button
          type="submit"
          disabled={pendente}
          className="bg-roxo px-5 py-2.5 font-mono text-[0.68rem] uppercase tracking-[0.1em] text-branco transition-colors hover:bg-roxo-realce disabled:opacity-50"
        >
          {pendente ? "Salvando…" : modo === "novo" ? "Registrar visita" : "Salvar"}
        </button>
        <Link
          href={modo === "editar" && id ? `/painel/visitas/${id}` : "/painel/visitas"}
          className="font-mono text-[0.64rem] uppercase tracking-[0.1em] text-texto-suave hover:text-acento-texto"
        >
          Cancelar
        </Link>
      </div>
    </form>
  );
}

function Campo({ r, children }: { r: string; children: React.ReactNode }) {
  return (
    <label className="grid gap-1.5">
      <span className={rot}>{r}</span>
      {children}
    </label>
  );
}
