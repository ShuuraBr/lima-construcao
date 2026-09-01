-- CreateTable
CREATE TABLE `contratos` (
    `id` VARCHAR(191) NOT NULL,
    `numero` VARCHAR(191) NOT NULL,
    `status` ENUM('ORCAMENTO_APROVADO', 'EM_EXECUCAO', 'CONCLUIDO', 'CANCELADO') NOT NULL DEFAULT 'ORCAMENTO_APROVADO',
    `cliente_nome` VARCHAR(191) NOT NULL,
    `cliente_empresa` VARCHAR(191) NULL,
    `cliente_email` VARCHAR(191) NULL,
    `cliente_telefone` VARCHAR(191) NULL,
    `endereco_obra` VARCHAR(255) NOT NULL,
    `servicos` JSON NOT NULL,
    `valor` DECIMAL(12, 2) NOT NULL,
    `progresso` INTEGER NOT NULL DEFAULT 0,
    `data_assinatura` DATETIME(3) NULL,
    `inicio_previsto` DATETIME(3) NULL,
    `entrega_prevista` DATETIME(3) NULL,
    `entrega_real` DATETIME(3) NULL,
    `observacoes` TEXT NULL,
    `pedido_orcamento_id` VARCHAR(191) NULL,
    `criado_em` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `atualizado_em` DATETIME(3) NOT NULL,

    UNIQUE INDEX `contratos_numero_key`(`numero`),
    UNIQUE INDEX `contratos_pedido_orcamento_id_key`(`pedido_orcamento_id`),
    INDEX `contratos_status_criado_em_idx`(`status`, `criado_em`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
