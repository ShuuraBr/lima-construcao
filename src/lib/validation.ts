import { z } from "zod";

export const SERVICO_VALORES = [
  "Drywall (Gesso)",
  "Steel Frame",
  "Elétrica",
  "Hidráulica",
  "Forro",
  "Acabamento / Revestimento",
  "Mais de uma frente",
] as const;

const SERVICO_MAP: Record<(typeof SERVICO_VALORES)[number], string> = {
  "Drywall (Gesso)": "DRYWALL",
  "Steel Frame": "STEEL_FRAME",
  "Elétrica": "ELETRICA",
  "Hidráulica": "HIDRAULICA",
  "Forro": "FORRO",
  "Acabamento / Revestimento": "ACABAMENTO",
  "Mais de uma frente": "MAIS_DE_UMA_FRENTE",
};

export function servicoParaEnum(valor: string): string {
  return SERVICO_MAP[valor as (typeof SERVICO_VALORES)[number]] ?? "MAIS_DE_UMA_FRENTE";
}

const textoObrigatorio = (campo: string, min = 2, max = 200) =>
  z
    .string({ error: `Informe ${campo}.` })
    .trim()
    .min(min, `Informe ${campo}.`)
    .max(max, `${campo[0].toUpperCase()}${campo.slice(1)} está longo demais.`);

export const pedidoOrcamentoSchema = z.object({
  nome: textoObrigatorio("seu nome", 2, 120),
  empresa: z.string().trim().max(160).optional().or(z.literal("")),
  email: z
    .string({ error: "Informe um e-mail." })
    .trim()
    .min(1, "Informe um e-mail.")
    .email("E-mail inválido."),
  telefone: textoObrigatorio("um telefone para contato", 8, 30),
  servico: z.enum(SERVICO_VALORES, { error: "Selecione o tipo de serviço." }),
  enderecoObra: textoObrigatorio("o endereço da obra", 4, 240),
  metragemM2: z
    .string()
    .trim()
    .optional()
    .transform((v) => (v ? v.replace(/\D/g, "") : ""))
    .refine((v) => v === "" || Number(v) > 0, "Metragem inválida.")
    .transform((v) => (v === "" ? undefined : Number(v))),
  prazoDesejado: z.string().trim().max(80).optional().or(z.literal("")),
  dataInicio: z
    .string()
    .trim()
    .optional()
    .refine((v) => !v || !Number.isNaN(Date.parse(v)), "Data inválida."),
  mensagem: z.string().trim().max(2000).optional().or(z.literal("")),
  anexoNome: z.string().trim().max(255).optional().or(z.literal("")),
  // honeypot anti-spam — deve chegar vazio
  website: z.string().max(0).optional(),
});

export type PedidoOrcamentoInput = z.input<typeof pedidoOrcamentoSchema>;
export type PedidoOrcamentoData = z.output<typeof pedidoOrcamentoSchema>;
