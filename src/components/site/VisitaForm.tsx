"use client";

import { useActionState, useId } from "react";
import { solicitarVisita, type EstadoVisita } from "@/app/(site)/visita/actions";
import { aplicarMascara, mascaraTelefone } from "@/lib/mascaras";
import { EnderecoFields } from "@/components/painel/EnderecoFields";

const estadoInicial: EstadoVisita = { status: "idle" };

const inputCls =
  "w-full border border-borda bg-superficie-2 px-3 py-2.5 text-[0.92rem] text-texto outline-none focus:border-transparent focus:outline-2 focus:outline-acento-texto";

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

export function VisitaForm() {
  const [estado, formAction, pendente] = useActionState(
    solicitarVisita,
    estadoInicial,
  );
  const formId = useId();
  const v = estado.valores ?? {};
  const e = estado.erros ?? {};

  if (estado.status === "sucesso") {
    return (
      <div className="border border-acento-texto bg-superficie p-8">
        <p className="font-mono text-[0.66rem] uppercase tracking-[0.14em] text-acento-texto">
          Solicitação registrada
        </p>
        <p className="mt-3 max-w-[46ch] text-sm text-texto-suave">
          A equipe da Lima recebe o pedido e o Erick confirma a data e a hora da
          visita diretamente com você pelo telefone ou e-mail informado. Não há
          agendamento automático.
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
      <input
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden
        className="hidden"
      />

      <Campo label="Seu nome" name="nome" erro={e.nome}>
        <input id="nome" name="nome" required defaultValue={v.nome} className={inputCls} />
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
          placeholder="(61) 99999-9999"
          required
          defaultValue={v.telefone}
          onInput={aplicarMascara(mascaraTelefone)}
          className={inputCls}
        />
      </Campo>

      <div className="md:col-span-2">
        <span className="mb-1.5 block font-mono text-[0.64rem] uppercase tracking-[0.12em] text-texto-suave">
          Endereço da obra
        </span>
        <EnderecoFields
          semMapa
          valores={{
            cep: v.cep,
            logradouro: v.logradouro,
            enderecoNumero: v.enderecoNumero,
            complemento: v.complemento,
            bairro: v.bairro,
            cidade: v.cidade,
            uf: v.uf,
          }}
        />
        {e.logradouro && (
          <span className="mt-1.5 block font-mono text-[0.62rem] tracking-[0.02em] text-acento-texto">
            {e.logradouro}
          </span>
        )}
      </div>

      <div className="md:col-span-2">
        <Campo
          label="Preferência de data e horário"
          name="preferencia"
          erro={e.preferencia}
          hint="A confirmação final é feita pela equipe da Lima."
        >
          <input
            id="preferencia"
            name="preferencia"
            type="datetime-local"
            defaultValue={v.preferencia}
            className={inputCls}
          />
        </Campo>
      </div>

      <div className="md:col-span-2">
        <Campo label="Mensagem (opcional)" name="mensagem" erro={e.mensagem}>
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
          className="border border-acento-texto/60 bg-acento-texto/10 px-4 py-3 font-mono text-[0.7rem] tracking-[0.02em] text-acento-texto md:col-span-2"
        >
          {estado.mensagem}
        </p>
      )}

      <p className="text-[0.8rem] text-texto-suave md:col-span-2">
        A visita técnica é confirmada manualmente pelo Erick — a equipe entra em
        contato pelo canal informado para fechar data e hora.
      </p>

      <div className="md:col-span-2">
        <button
          type="submit"
          disabled={pendente}
          className="inline-flex items-center gap-2 bg-roxo px-6 py-3.5 font-mono text-[0.72rem] uppercase tracking-[0.1em] text-branco transition-colors hover:bg-roxo-realce disabled:opacity-50"
        >
          {pendente ? "Enviando…" : "Solicitar visita"}
        </button>
      </div>
    </form>
  );
}
