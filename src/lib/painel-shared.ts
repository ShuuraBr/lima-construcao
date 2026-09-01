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

export const fmtData = (d: Date) => dtCurto.format(d);
export const fmtDataHora = (d: Date) => dtLongo.format(d);
export const fmtM2 = (n: number | null | undefined) =>
  n ? `${n.toLocaleString("pt-BR")} m²` : "—";

export function diasAtras(dias: number) {
  return new Date(Date.now() - dias * 24 * 60 * 60 * 1000);
}
