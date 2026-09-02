-- CreateTable
CREATE TABLE `apontamentos` (
    `id` VARCHAR(191) NOT NULL,
    `contrato_id` VARCHAR(191) NOT NULL,
    `data` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `frente` ENUM('DRYWALL', 'STEEL_FRAME', 'ELETRICA', 'HIDRAULICA', 'FORRO', 'ACABAMENTO', 'ALVENARIA', 'MAIS_DE_UMA_FRENTE') NULL,
    `progresso` INTEGER NOT NULL,
    `status` ENUM('ORCAMENTO_APROVADO', 'EM_EXECUCAO', 'CONCLUIDO', 'CANCELADO') NOT NULL,
    `nota` TEXT NULL,
    `autor_id` VARCHAR(191) NULL,
    `autor_nome` VARCHAR(191) NOT NULL,
    `criado_em` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `apontamentos_contrato_id_data_idx`(`contrato_id`, `data`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `apontamentos` ADD CONSTRAINT `apontamentos_contrato_id_fkey` FOREIGN KEY (`contrato_id`) REFERENCES `contratos`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
