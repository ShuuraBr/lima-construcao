"use client";

import Link from "next/link";
import { useActionState } from "react";
import {
  CONTRATO_STATUS,
  SERVICOS_CONTRATO,
  SERVICO_LABEL,
  contratoStatusMeta,
} from "@/lib/painel-shared";
import {
  criarContratoAction,
  atualizarContratoAction,
  type EstadoContrato,
} from "./actions";
import { EnderecoFields } from "@/components/painel/EnderecoFields";
import {
  aplicarMascara,
  mascaraMoeda,
  mascaraTelefone,
} from "@/lib/mascaras";

const inicial: EstadoContrato = {};

const campo =
  "w-full border border-borda bg-superficie-2 px-3 py-2.5 text-[0.9rem] text-texto outline-none focus:outline-2 focus:outline-acento-texto";
const rotulo =
  "font-mono text-[0.58rem] uppercase tracking-[0.12em] text-texto-suave";

export type ValoresContrato = {
  clienteNome?: string;
  clienteEmpresa?: string;
  clienteEmail?: string;
  clienteTelefone?: string;
  cep?: string;
  logradouro?: string;
  enderecoNumero?: string;
  complemento?: string;
  bairro?: string;
  cidade?: string;
  uf?: string;
  latitude?: string;
  longitude?: string;
  servicos?: string[];
  valor?: string;
  status?: string;
  progresso?: string;
  dataAssinatura?: string;
  inicioPrevisto?: string;
  entregaPrevista?: string;
  entregaReal?: string;
  observacoes?: string;
};

export function ContratoForm({
  modo,
  id,
  pedidoOrcamentoId,
  valores,
}: {
  modo: "novo" | "editar";
  id?: string;
  pedidoOrcamentoId?: string;
  valores?: ValoresContrato;
}) {
  const [estado, action, pendente] = useActionState(
    modo === "novo" ? criarContratoAction : atualizarContratoAction,
    inicial,
  );

  // Após erro de validação a action devolve os valores digitados (servicos como
  // string separada por vírgula). Eles têm prioridade sobre o prefill.
  const e = estado.valores;
  const v = (k: keyof ValoresContrato): string =>
    (e?.[k] as string | undefined) ?? (valores?.[k] as string | undefined) ?? "";
  const servicosMarcados = new Set(
    e?.servicos
      ? e.servicos.split(",").filter(Boolean)
      : (valores?.servicos ?? []),
  );

  return (
    <form
      action={action}
      key={JSON.stringify(e ?? null)}
      className="border border-borda bg-superficie"
    >
      {modo === "editar" && <input type="hidden" name="id" value={id} />}
      {pedidoOrcamentoId && (
        <input
          type="hidden"
          name="pedidoOrcamentoId"
          value={pedidoOrcamentoId}
        />
      )}

      <Secao titulo="Cliente">
        <Linha>
          <Campo rotulo="Nome / responsável *">
            <input
              name="clienteNome"
              required
              defaultValue={v("clienteNome")}
              className={campo}
            />
          </Campo>
          <Campo rotulo="Empresa">
            <input
              name="clienteEmpresa"
              defaultValue={v("clienteEmpresa")}
              className={campo}
            />
          </Campo>
        </Linha>
        <Linha>
          <Campo rotulo="E-mail">
            <input
              name="clienteEmail"
              type="email"
              defaultValue={v("clienteEmail")}
              className={campo}
            />
          </Campo>
          <Campo rotulo="Telefone">
            <input
              name="clienteTelefone"
              inputMode="tel"
              placeholder="(61) 99999-9999"
              defaultValue={v("clienteTelefone")}
              onInput={aplicarMascara(mascaraTelefone)}
              className={campo}
            />
          </Campo>
        </Linha>
      </Secao>

      <Secao titulo="Endereço da obra">
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
      </Secao>

      <Secao titulo="Obra">
        <div>
          <span className={rotulo}>Frentes de serviço *</span>
          <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
            {SERVICOS_CONTRATO.map((s) => (
              <label
                key={s}
                className="flex items-center gap-2 border border-borda bg-superficie-2 px-3 py-2 text-[0.8rem] text-texto"
              >
                <input
                  type="checkbox"
                  name="servicos"
                  value={s}
                  defaultChecked={servicosMarcados.has(s)}
                  className="accent-roxo"
                />
                {SERVICO_LABEL[s]}
              </label>
            ))}
          </div>
        </div>
        <Linha>
          <Campo rotulo="Valor do contrato (R$) *">
            <input
              name="valor"
              inputMode="numeric"
              placeholder="0,00"
              required
              defaultValue={v("valor")}
              onInput={aplicarMascara(mascaraMoeda)}
              className={campo}
            />
          </Campo>
          <Campo rotulo="Progresso da obra (%)">
            <input
              name="progresso"
              type="number"
              min={0}
              max={100}
              defaultValue={v("progresso") || "0"}
              className={campo}
            />
          </Campo>
        </Linha>
      </Secao>

      <Secao titulo="Situação e prazos">
        <Linha>
          <Campo rotulo="Status">
            <select
              name="status"
              defaultValue={v("status") || CONTRATO_STATUS[0]}
              className={campo}
            >
              {CONTRATO_STATUS.map((s) => (
                <option key={s} value={s}>
                  {contratoStatusMeta[s].label}
                </option>
              ))}
            </select>
          </Campo>
          <Campo rotulo="Assinatura">
            <input
              name="dataAssinatura"
              type="date"
              defaultValue={v("dataAssinatura")}
              className={campo}
            />
          </Campo>
        </Linha>
        <Linha>
          <Campo rotulo="Início previsto">
            <input
              name="inicioPrevisto"
              type="date"
              defaultValue={v("inicioPrevisto")}
              className={campo}
            />
          </Campo>
          <Campo rotulo="Entrega prevista">
            <input
              name="entregaPrevista"
              type="date"
              defaultValue={v("entregaPrevista")}
              className={campo}
            />
          </Campo>
        </Linha>
        <Campo rotulo="Entrega real">
          <input
            name="entregaReal"
            type="date"
            defaultValue={v("entregaReal")}
            className={campo}
          />
        </Campo>
      </Secao>

      <Secao titulo="Observações">
        <textarea
          name="observacoes"
          rows={4}
          defaultValue={v("observacoes")}
          className={campo}
        />
      </Secao>

      {estado.erro && (
        <p className="mx-5 mb-4 border border-acento-texto/60 bg-acento-texto/10 px-3 py-2 font-mono text-[0.66rem] text-acento-texto">
          {estado.erro}
        </p>
      )}

      <div className="flex items-center gap-3 border-t border-borda px-5 py-4">
        <button
          type="submit"
          disabled={pendente}
          className="bg-roxo px-5 py-2.5 font-mono text-[0.68rem] uppercase tracking-[0.1em] text-branco transition-colors hover:bg-roxo-realce disabled:opacity-50"
        >
          {pendente
            ? "Salvando…"
            : modo === "novo"
              ? "Criar contrato"
              : "Salvar alterações"}
        </button>
        <Link
          href={modo === "editar" && id ? `/painel/contratos/${id}` : "/painel/contratos"}
          className="font-mono text-[0.64rem] uppercase tracking-[0.1em] text-texto-suave hover:text-acento-texto"
        >
          Cancelar
        </Link>
      </div>
    </form>
  );
}

function Secao({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <section className="border-b border-borda px-5 py-4">
      <h2 className="mb-3 font-mono text-[0.6rem] uppercase tracking-[0.14em] text-texto-suave">
        {titulo}
      </h2>
      <div className="grid gap-3">{children}</div>
    </section>
  );
}

function Linha({ children }: { children: React.ReactNode }) {
  return <div className="grid gap-3 sm:grid-cols-2">{children}</div>;
}

function Campo({ rotulo: r, children }: { rotulo: string; children: React.ReactNode }) {
  return (
    <label className="grid gap-1.5">
      <span className={rotulo}>{r}</span>
      {children}
    </label>
  );
}
