-- CreateTable
CREATE TABLE `visitas` (
    `id` VARCHAR(191) NOT NULL,
    `status` ENUM('SOLICITADA', 'CONFIRMADA', 'REALIZADA', 'CANCELADA') NOT NULL DEFAULT 'SOLICITADA',
    `nome` VARCHAR(191) NOT NULL,
    `empresa` VARCHAR(191) NULL,
    `email` VARCHAR(191) NULL,
    `telefone` VARCHAR(191) NULL,
    `endereco` VARCHAR(255) NOT NULL,
    `preferencia` TEXT NULL,
    `mensagem` TEXT NULL,
    `agendada_em` DATETIME(3) NULL,
    `observacoes_internas` TEXT NULL,
    `contrato_id` VARCHAR(191) NULL,
    `pedido_orcamento_id` VARCHAR(191) NULL,
    `origem` VARCHAR(191) NOT NULL DEFAULT 'site',
    `ip_hash` VARCHAR(191) NULL,
    `criado_em` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `atualizado_em` DATETIME(3) NOT NULL,

    INDEX `visitas_status_criado_em_idx`(`status`, `criado_em`),
    INDEX `visitas_agendada_em_idx`(`agendada_em`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
