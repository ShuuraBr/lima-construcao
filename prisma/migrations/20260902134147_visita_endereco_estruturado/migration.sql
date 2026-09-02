-- AlterTable
ALTER TABLE `visitas` ADD COLUMN `bairro` VARCHAR(120) NULL,
    ADD COLUMN `cep` VARCHAR(9) NULL,
    ADD COLUMN `cidade` VARCHAR(120) NULL,
    ADD COLUMN `complemento` VARCHAR(120) NULL,
    ADD COLUMN `endereco_numero` VARCHAR(30) NULL,
    ADD COLUMN `latitude` DOUBLE NULL,
    ADD COLUMN `logradouro` VARCHAR(180) NULL,
    ADD COLUMN `longitude` DOUBLE NULL,
    ADD COLUMN `uf` VARCHAR(2) NULL;
