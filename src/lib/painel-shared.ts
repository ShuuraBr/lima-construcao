// Constantes e formatadores do painel — seguros para client e server.

// ---------- status do pedido de orçamento ----------

export const ORCAMENTO_STATUS = [
  "NOVO",
  "EM_ANALISE",
  "COTACAO_ENVIADA",
  "APROVADO",
  "RECUSADO",
] as const;

export type OrcStatus = (typeof ORCAMENTO_STATUS)[number];

export const statusMeta: Record<
  OrcStatus,
  { label: string; tom: "novo" | "andamento" | "ok" | "recusado" }
> = {
  NOVO: { label: "Novo", tom: "novo" },
  EM_ANALISE: { label: "Em análise", tom: "andamento" },
  COTACAO_ENVIADA: { label: "Cotação enviada", tom: "andamento" },
  APROVADO: { label: "Aprovado", tom: "ok" },
  RECUSADO: { label: "Recusado", tom: "recusado" },
};

export const SERVICO_LABEL: Record<string, string> = {
  DRYWALL: "Drywall (Gesso)",
  STEEL_FRAME: "Steel Frame",
  ELETRICA: "Elétrica",
  HIDRAULICA: "Hidráulica",
  FORRO: "Forro",
  ACABAMENTO: "Acabamento / Revestimento",
  ALVENARIA: "Alvenaria",
  MAIS_DE_UMA_FRENTE: "Mais de uma frente",
};

/** Frentes que podem ser escolhidas ao montar um contrato (sem "mais de uma"). */
export const SERVICOS_CONTRATO = [
  "DRYWALL",
  "STEEL_FRAME",
  "ELETRICA",
  "HIDRAULICA",
  "FORRO",
  "ACABAMENTO",
  "ALVENARIA",
] as const;

// ---------- status do contrato ----------

export const CONTRATO_STATUS = [
  "ORCAMENTO_APROVADO",
  "EM_EXECUCAO",
  "CONCLUIDO",
  "CANCELADO",
] as const;

export type ContratoStatusT = (typeof CONTRATO_STATUS)[number];

export const contratoStatusMeta: Record<
  ContratoStatusT,
  { label: string; tom: "novo" | "andamento" | "ok" | "recusado" }
> = {
  ORCAMENTO_APROVADO: { label: "Orçamento aprovado", tom: "novo" },
  EM_EXECUCAO: { label: "Em execução", tom: "andamento" },
  CONCLUIDO: { label: "Concluído", tom: "ok" },
  CANCELADO: { label: "Cancelado", tom: "recusado" },
};

// ---------- formatadores ----------

const dtCurto = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "2-digit",
  year: "2-digit",
});
const dtLongo = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

const brl = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

export const fmtData = (d: Date) => dtCurto.format(d);
export const fmtDataHora = (d: Date) => dtLongo.format(d);
/** Date → "yyyy-MM-dd" para preencher <input type="date">. */
export const toDateInput = (d: Date | null | undefined) =>
  d ? new Date(d).toISOString().slice(0, 10) : "";
export const fmtM2 = (n: number | null | undefined) =>
  n ? `${n.toLocaleString("pt-BR")} m²` : "—";
export const fmtBRL = (n: number) => brl.format(n);

export function diasAtras(dias: number) {
  return new Date(Date.now() - dias * 24 * 60 * 60 * 1000);
}

/** `servicos` vem do banco como Json (unknown). Normaliza para lista de strings. */
export function servicosDoContrato(raw: unknown): string[] {
  if (Array.isArray(raw)) return raw.filter((s): s is string => typeof s === "string");
  return [];
}
