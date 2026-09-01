-- CreateEnum
CREATE TYPE "public"."ServicoTipo" AS ENUM ('DRYWALL', 'STEEL_FRAME', 'ELETRICA', 'HIDRAULICA', 'FORRO', 'ACABAMENTO', 'ALVENARIA', 'MAIS_DE_UMA_FRENTE');

-- CreateEnum
CREATE TYPE "public"."OrcamentoStatus" AS ENUM ('NOVO', 'EM_ANALISE', 'COTACAO_ENVIADA', 'APROVADO', 'RECUSADO');

-- CreateTable
CREATE TABLE "public"."pedidos_orcamento" (
    "id" TEXT NOT NULL,
    "protocolo" TEXT NOT NULL,
    "status" "public"."OrcamentoStatus" NOT NULL DEFAULT 'NOVO',
    "nome" TEXT NOT NULL,
    "empresa" TEXT,
    "email" TEXT NOT NULL,
    "telefone" TEXT NOT NULL,
    "servico" "public"."ServicoTipo" NOT NULL,
    "endereco_obra" TEXT NOT NULL,
    "metragem_m2" INTEGER,
    "prazo_desejado" TEXT,
    "data_inicio" TIMESTAMP(3),
    "mensagem" TEXT,
    "anexo_nome" TEXT,
    "origem" TEXT NOT NULL DEFAULT 'site',
    "ip_hash" TEXT,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pedidos_orcamento_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "pedidos_orcamento_protocolo_key" ON "public"."pedidos_orcamento"("protocolo");

-- CreateIndex
CREATE INDEX "pedidos_orcamento_status_criado_em_idx" ON "public"."pedidos_orcamento"("status", "criado_em");
