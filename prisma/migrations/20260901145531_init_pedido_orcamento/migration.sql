-- CreateTable
CREATE TABLE `pedidos_orcamento` (
    `id` VARCHAR(191) NOT NULL,
    `protocolo` VARCHAR(191) NOT NULL,
    `status` ENUM('NOVO', 'EM_ANALISE', 'COTACAO_ENVIADA', 'APROVADO', 'RECUSADO') NOT NULL DEFAULT 'NOVO',
    `nome` VARCHAR(191) NOT NULL,
    `empresa` VARCHAR(191) NULL,
    `email` VARCHAR(191) NOT NULL,
    `telefone` VARCHAR(191) NOT NULL,
    `servico` ENUM('DRYWALL', 'STEEL_FRAME', 'ELETRICA', 'HIDRAULICA', 'FORRO', 'ACABAMENTO', 'ALVENARIA', 'MAIS_DE_UMA_FRENTE') NOT NULL,
    `endereco_obra` VARCHAR(255) NOT NULL,
    `metragem_m2` INTEGER NULL,
    `prazo_desejado` VARCHAR(191) NULL,
    `data_inicio` DATETIME(3) NULL,
    `mensagem` TEXT NULL,
    `anexo_nome` VARCHAR(255) NULL,
    `origem` VARCHAR(191) NOT NULL DEFAULT 'site',
    `ip_hash` VARCHAR(191) NULL,
    `criado_em` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `atualizado_em` DATETIME(3) NOT NULL,

    UNIQUE INDEX `pedidos_orcamento_protocolo_key`(`protocolo`),
    INDEX `pedidos_orcamento_status_criado_em_idx`(`status`, `criado_em`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
