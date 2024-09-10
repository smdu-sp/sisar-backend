/*
  Warnings:

  - You are about to drop the `Parecer_Admissibilidade` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE `Parecer_Admissibilidade`;

-- CreateTable
CREATE TABLE `pareceres_admissibilidade` (
    `id` VARCHAR(191) NOT NULL,
    `parecer` VARCHAR(191) NOT NULL,
    `status` INTEGER NOT NULL DEFAULT 1,
    `criado_em` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `alterado_em` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `pareceres_admissibilidade_parecer_key`(`parecer`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
