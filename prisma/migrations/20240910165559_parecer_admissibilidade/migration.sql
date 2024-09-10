/*
  Warnings:

  - Made the column `reconsiderado` on table `admissibilidades` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `admissibilidades` MODIFY `data_envio` DATE NULL,
    MODIFY `data_decisao_interlocutoria` DATE NULL,
    MODIFY `reconsiderado` BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE `avisos` MODIFY `data` DATE NOT NULL;

-- CreateTable
CREATE TABLE `Parecer_Admissibilidade` (
    `id` VARCHAR(191) NOT NULL,
    `parecer` VARCHAR(191) NOT NULL,
    `status` INTEGER NOT NULL DEFAULT 1,
    `criado_em` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `alterado_em` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `Parecer_Admissibilidade_parecer_key`(`parecer`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
