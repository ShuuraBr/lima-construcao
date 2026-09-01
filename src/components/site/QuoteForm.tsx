"use client";

import { useActionState, useId } from "react";
import {
  enviarPedidoOrcamento,
  type EstadoOrcamento,
} from "@/app/(site)/orcamento/actions";
import { SERVICO_VALORES } from "@/lib/validation";

const estadoInicial: EstadoOrcamento = { status: "idle" };

function Campo({
  label,
  name,
  erro,
  children,
  hint,
}: {
  label: string;
  name: string;
  erro?: string;
  children: React.ReactNode;
  hint?: string;
}) {
  return (
    <div className="flex flex-col">
      <label
        htmlFor={name}
        className="mb-1.5 font-mono text-[0.64rem] uppercase tracking-[0.12em] text-texto-suave"
      >
        {label}
      </label>
      {children}
      {hint && !erro && (
        <span className="mt-1.5 font-mono text-[0.6rem] tracking-[0.03em] text-texto-suave">
          {hint}
        </span>
      )}
      {erro && (
        <span className="mt-1.5 font-mono text-[0.62rem] tracking-[0.02em] text-acento-texto">
          {erro}
        </span>
      )}
    </div>
  );
}

const inputCls =
  "w-full border border-borda bg-superficie-2 px-3 py-2.5 text-[0.92rem] text-texto outline-none focus:border-transparent focus:outline-2 focus:outline-acento-texto";

export function QuoteForm({ servicoInicial }: { servicoInicial?: string }) {
  const [estado, formAction, pendente] = useActionState(
    enviarPedidoOrcamento,
    estadoInicial,
  );
  const formId = useId();
  const v = estado.valores ?? {};
  const e = estado.erros ?? {};
  const servicoDefault =
    servicoInicial && SERVICO_VALORES.includes(servicoInicial as never)
      ? servicoInicial
      : (v.servico ?? SERVICO_VALORES[0]);

  if (estado.status === "sucesso") {
    return (
      <div className="border border-acento-texto bg-superficie p-8">
        <p className="font-mono text-[0.66rem] uppercase tracking-[0.14em] text-acento-texto">
          Solicitação registrada
        </p>
        <p className="mt-3 text-lg text-texto-forte">
          Protocolo{" "}
          <span className="font-mono text-acento-texto">{estado.protocolo}</span>.
        </p>
        <p className="mt-2 max-w-[46ch] text-sm text-texto-suave">
          O pedido entrou na fila da equipe da Lima. Um engenheiro analisa
          escopo, prazo e visita técnica antes de responder — retorno de cotação
          em até 2 dias úteis.
        </p>
      </div>
    );
  }

  return (
    <form
      action={formAction}
      id={formId}
      noValidate
      className="grid gap-5 border border-borda bg-superficie p-6 sm:p-8 md:grid-cols-2"
    >
      {/* honeypot anti-spam — invisível para pessoas */}
      <input
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden
        className="hidden"
      />

      <Campo label="Seu nome" name="nome" erro={e.nome}>
        <input
          id="nome"
          name="nome"
          required
          defaultValue={v.nome}
          className={inputCls}
        />
      </Campo>

      <Campo label="Empresa (opcional)" name="empresa" erro={e.empresa}>
        <input
          id="empresa"
          name="empresa"
          defaultValue={v.empresa}
          className={inputCls}
        />
      </Campo>

      <Campo label="E-mail" name="email" erro={e.email}>
        <input
          id="email"
          name="email"
          type="email"
          inputMode="email"
          required
          defaultValue={v.email}
          className={inputCls}
        />
      </Campo>

      <Campo label="Telefone / WhatsApp" name="telefone" erro={e.telefone}>
        <input
          id="telefone"
          name="telefone"
          inputMode="tel"
          required
          defaultValue={v.telefone}
          className={inputCls}
        />
      </Campo>

      <div className="md:col-span-2">
        <Campo label="Tipo de serviço" name="servico" erro={e.servico}>
          <select
            id="servico"
            name="servico"
            defaultValue={servicoDefault}
            className={inputCls}
          >
            {SERVICO_VALORES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </Campo>
      </div>

      <div className="md:col-span-2">
        <Campo
          label="Endereço da obra"
          name="enderecoObra"
          erro={e.enderecoObra}
        >
          <input
            id="enderecoObra"
            name="enderecoObra"
            required
            placeholder="Quadra, lote, setor — cidade"
            defaultValue={v.enderecoObra}
            className={inputCls}
          />
        </Campo>
      </div>

      <Campo label="Metragem (m²)" name="metragemM2" erro={e.metragemM2}>
        <input
          id="metragemM2"
          name="metragemM2"
          inputMode="numeric"
          placeholder="620"
          defaultValue={v.metragemM2}
          className={inputCls}
        />
      </Campo>

      <Campo label="Prazo desejado" name="prazoDesejado" erro={e.prazoDesejado}>
        <input
          id="prazoDesejado"
          name="prazoDesejado"
          placeholder="Ex.: 60 dias"
          defaultValue={v.prazoDesejado}
          className={inputCls}
        />
      </Campo>

      <Campo
        label="Data de início prevista"
        name="dataInicio"
        erro={e.dataInicio}
      >
        <input
          id="dataInicio"
          name="dataInicio"
          type="date"
          defaultValue={v.dataInicio}
          className={inputCls}
        />
      </Campo>

      <Campo
        label="Anexo — projeto / planta"
        name="anexo"
        hint="PDF, DWG ou imagem · até 9 MB"
      >
        <input
          id="anexo"
          name="anexo"
          type="file"
          accept=".pdf,.dwg,.png,.jpg,.jpeg"
          className="w-full border border-borda bg-superficie-2 px-3 py-2 text-[0.82rem] text-texto-suave file:mr-3 file:border-0 file:bg-roxo file:px-3 file:py-1.5 file:font-mono file:text-[0.62rem] file:uppercase file:tracking-[0.08em] file:text-branco"
        />
      </Campo>

      <div className="md:col-span-2">
        <Campo
          label="Mensagem (opcional)"
          name="mensagem"
          erro={e.mensagem}
        >
          <textarea
            id="mensagem"
            name="mensagem"
            rows={4}
            defaultValue={v.mensagem}
            className={inputCls}
          />
        </Campo>
      </div>

      {estado.status === "erro" && estado.mensagem && (
        <p
          role="alert"
          className="md:col-span-2 border border-acento-texto/60 bg-acento-texto/10 px-4 py-3 font-mono text-[0.7rem] tracking-[0.02em] text-acento-texto"
        >
          {estado.mensagem}
        </p>
      )}

      <p className="md:col-span-2 text-[0.8rem] text-texto-suave">
        Ao enviar, os dados seguem para a equipe da Lima e uma notificação é
        disparada por e-mail. A cotação é elaborada manualmente — não há cálculo
        automático de preço.
      </p>

      <div className="md:col-span-2">
        <button
          type="submit"
          disabled={pendente}
          className="inline-flex items-center gap-2 bg-roxo px-6 py-3.5 font-mono text-[0.72rem] uppercase tracking-[0.1em] text-branco transition-colors hover:bg-roxo-realce disabled:opacity-50"
        >
          {pendente ? "Enviando…" : "Enviar solicitação"}
        </button>
      </div>
    </form>
  );
}
