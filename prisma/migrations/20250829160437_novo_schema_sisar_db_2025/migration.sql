/*
  Warnings:

  - Made the column `tipo_processo` on table `iniciais` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `iniciais` ADD COLUMN `area` DECIMAL(10, 2) NULL,
    ADD COLUMN `autor_projeto_id` VARCHAR(191) NULL,
    ADD COLUMN `proprietario_id` VARCHAR(191) NULL,
    ADD COLUMN `responsavel_tecnico_id` VARCHAR(191) NULL,
    ADD COLUMN `resumo_projeto` TEXT NULL,
    MODIFY `tipo_processo` INTEGER NOT NULL DEFAULT 1;

-- CreateTable
CREATE TABLE `autor_responsavel_projeto` (
    `id` VARCHAR(191) NOT NULL,
    `nome` VARCHAR(191) NOT NULL,
    `tipo_autor` ENUM('ARQUITETO', 'ENGENHEIRO') NOT NULL,
    `cpf` VARCHAR(191) NULL,
    `crea` VARCHAR(191) NULL,
    `cau` VARCHAR(191) NULL,
    `criado_em` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `alterado_em` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `proprietarios` (
    `id` VARCHAR(191) NOT NULL,
    `nome` VARCHAR(191) NOT NULL,
    `cpf` VARCHAR(191) NULL,
    `cnpj` VARCHAR(191) NULL,
    `tipo_proprietario` ENUM('PESSOA_FISICA', 'PESSOA_JURIDICA') NOT NULL DEFAULT 'PESSOA_FISICA',
    `criado_em` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `alterado_em` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `licenciamento` (
    `id` VARCHAR(191) NOT NULL,
    `nome` VARCHAR(191) NOT NULL,
    `sigla` VARCHAR(191) NOT NULL,
    `status` BOOLEAN NOT NULL,

    UNIQUE INDEX `licenciamento_nome_key`(`nome`),
    UNIQUE INDEX `licenciamento_sigla_key`(`sigla`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `iniciais` ADD CONSTRAINT `iniciais_proprietario_id_fkey` FOREIGN KEY (`proprietario_id`) REFERENCES `proprietarios`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `iniciais` ADD CONSTRAINT `iniciais_autor_projeto_id_fkey` FOREIGN KEY (`autor_projeto_id`) REFERENCES `autor_responsavel_projeto`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `iniciais` ADD CONSTRAINT `iniciais_responsavel_tecnico_id_fkey` FOREIGN KEY (`responsavel_tecnico_id`) REFERENCES `autor_responsavel_projeto`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
