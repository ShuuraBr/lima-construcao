/**
 * Configuração central do site institucional da Lima.
 * Conteúdo textual segue o tom de voz do Manual de Identidade de Marca v2.0:
 * técnico, direto, sem superlativos, citando prazos e números reais.
 */

export const site = {
  nome: "Lima Construção e Instalação",
  nomeCurto: "Lima",
  tagline: "Estrutura que não improvisa.",
  descritor: "Qualidade que transforma",
  descricao:
    "Instalações e obras completas executadas por equipe própria e fixa, do início ao fim, com prazo e garantia em contrato. Distrito Federal e entorno.",
  dominio: "limaconstrucao.com.br",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://limaconstrucao.com.br",
  regiao: "Distrito Federal e entorno",
  contato: {
    responsavel: "Erick",
    cargo: "Engenheiro Chefe",
    email: "erick@limaconstrucao.com.br",
    telefone: "+55 61 9 9999-9999",
    telefoneHref: "tel:+5561999999999",
    whatsappHref: "https://wa.me/5561999999999",
    cidade: "Brasília — DF",
  },
} as const;

export const nav = [
  { label: "Sobre", href: "/sobre" },
  { label: "Serviços", href: "/servicos" },
  { label: "Contato", href: "/contato" },
] as const;

/** Provas de credibilidade confirmadas pelo cliente — dados reais. */
export const credenciais = [
  { valor: "5 anos", rotulo: "Garantia em contrato" },
  { valor: "45 dias", rotulo: "Prazo padrão de entrega" },
  { valor: "CREA-DF", rotulo: "Empresa registrada" },
  { valor: "8 obras", rotulo: "Em execução — Brasal e Luner" },
] as const;

export type Servico = {
  slug: string;
  nome: string;
  resumo: string;
  descricao: string;
  spec: string;
  valorFormulario: string;
};

/** Lista definitiva de serviços confirmada pelo cliente. */
export const servicos: Servico[] = [
  {
    slug: "drywall",
    nome: "Drywall (Gesso)",
    resumo: "Paredes, divisórias e sancas em gesso acartonado.",
    descricao:
      "Execução de paredes, divisórias, sancas e detalhes em chapa de gesso acartonado, com isolamento acústico e térmico conforme projeto. Frente de origem da empresa, que nasceu como Lima Gesso.",
    spec: "Origem da empresa",
    valorFormulario: "Drywall (Gesso)",
  },
  {
    slug: "steel-frame",
    nome: "Steel Frame",
    resumo: "Estrutura em aço galvanizado, montada a seco.",
    descricao:
      "Estrutura em perfis de aço galvanizado para vedação, ampliação e mezanino, montada a seco e com controle dimensional em cada etapa.",
    spec: "Montagem a seco",
    valorFormulario: "Steel Frame",
  },
  {
    slug: "eletrica",
    nome: "Elétrica",
    resumo: "Infraestrutura, circuitos, quadros e pontos.",
    descricao:
      "Infraestrutura e instalação de circuitos, quadros de distribuição e pontos, seguindo a NBR 5410 e o projeto elétrico aprovado.",
    spec: "Conforme NBR 5410",
    valorFormulario: "Elétrica",
  },
  {
    slug: "hidraulica",
    nome: "Hidráulica",
    resumo: "Redes de água fria, quente e esgoto.",
    descricao:
      "Redes de água fria, água quente e esgoto, com teste de estanqueidade e registro fotográfico antes do fechamento de cada trecho.",
    spec: "Teste de estanqueidade",
    valorFormulario: "Hidráulica",
  },
  {
    slug: "forro",
    nome: "Forro",
    resumo: "Forro em gesso, mineral e amadeirado.",
    descricao:
      "Forros em gesso, placa mineral e réguas amadeiradas, nivelados a laser, com previsão de acesso para manutenção de instalações.",
    spec: "Nivelamento a laser",
    valorFormulario: "Forro",
  },
  {
    slug: "acabamento",
    nome: "Acabamento / Revestimento",
    resumo: "Assentamento, pintura e detalhamento de junta.",
    descricao:
      "Assentamento de placas, pintura, retrofit de fachada e detalhamento de junta. O close de acabamento é tratado como prova de qualidade da entrega.",
    spec: "Retrofit de fachada",
    valorFormulario: "Acabamento / Revestimento",
  },
  {
    slug: "alvenaria",
    nome: "Alvenaria",
    resumo: "Elevação e regularização de vedação em bloco.",
    descricao:
      "Elevação e regularização de vedação em bloco, com amarração, verga e contraverga conforme especificação estrutural.",
    spec: "Verga e contraverga",
    valorFormulario: "Alvenaria",
  },
];

export const opcaoMaisDeUma = {
  valorFormulario: "Mais de uma frente",
} as const;

/** Obras reais em execução — prova social confirmada em contrato. */
export const obras = [
  {
    cliente: "Brasal Incorporações",
    local: "Setor Noroeste · Brasília — DF",
    descricao:
      "Sete obras contratadas em frentes de drywall, steel frame, forro e acabamento, executadas em cronograma escalonado por torre.",
    metrica: "7 obras · em execução · prazo padrão de 45 dias por frente",
  },
  {
    cliente: "Luner Empreendimentos",
    local: "Jardim Botânico · Brasília — DF",
    descricao:
      "Obra de instalação elétrica e hidráulica entregue dentro do prazo, com teste de estanqueidade e checklist final documentado.",
    metrica: "1 obra · concluída · garantia de 5 anos ativa",
  },
] as const;

export const valores = [
  {
    titulo: "Compromisso com o prazo",
    texto:
      "O cronograma combinado é tratado como cláusula contratual, não como estimativa.",
  },
  {
    titulo: "Equipe própria e fixa",
    texto:
      "Execução por time interno, não por mão de obra terceirizada e rotativa.",
  },
  {
    titulo: "Precisão técnica",
    texto: "Decisão de engenharia, nunca improviso de canteiro.",
  },
  {
    titulo: "Acabamento como prova",
    texto:
      "O resultado fala antes do discurso; a comunicação apenas documenta o que foi entregue.",
  },
] as const;

export const fundamentos = {
  proposito:
    "Executar cada etapa da obra com a mesma equipe, do início ao fim, sem deixar o cliente na mão quando a demanda aperta.",
  missao:
    "Entregar instalações e obras completas com equipe própria e fixa, cumprindo prazo e garantia para construtoras, incorporadoras e síndicos do DF e entorno.",
  visao:
    "Ser reconhecida no mercado de construção civil do DF pela solidez da entrega e pelo cumprimento do prazo combinado.",
} as const;
