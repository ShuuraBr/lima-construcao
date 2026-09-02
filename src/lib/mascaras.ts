// Máscaras de campos — puras, usáveis em client e server.
import type { FormEvent } from "react";

/** Telefone BR: (61) 99999-9999 ou (61) 9999-9999. */
export function mascaraTelefone(v: string): string {
  const d = v.replace(/\D/g, "").slice(0, 11);
  if (!d) return "";
  if (d.length <= 2) return `(${d}`;
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10)
    return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

/** CEP: 70000-000. */
export function mascaraCep(v: string): string {
  const d = v.replace(/\D/g, "").slice(0, 8);
  return d.length > 5 ? `${d.slice(0, 5)}-${d.slice(5)}` : d;
}

/** Moeda: dígitos entram como centavos → 1.234,56 (sem "R$"). */
export function mascaraMoeda(v: string): string {
  const d = v.replace(/\D/g, "");
  if (!d) return "";
  return (Number(d) / 100).toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

/** Número com separador de milhar: 1.234. */
export function mascaraInteiro(v: string): string {
  const d = v.replace(/\D/g, "");
  return d ? Number(d).toLocaleString("pt-BR") : "";
}

/** Valor numérico → string para pré-preencher um campo com máscara de moeda. */
export function moedaParaInput(n: number): string {
  return n.toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

/** Handler `onInput` que reformata o campo em tempo real (inputs não controlados). */
export const aplicarMascara =
  (fn: (v: string) => string) => (e: FormEvent<HTMLInputElement>) => {
    e.currentTarget.value = fn(e.currentTarget.value);
  };
