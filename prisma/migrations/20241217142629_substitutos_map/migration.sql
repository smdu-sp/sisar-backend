/*
  Warnings:

  - You are about to drop the `Substituto` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `Substituto` DROP FOREIGN KEY `Substituto_substituto_id_fkey`;

-- DropForeignKey
ALTER TABLE `Substituto` DROP FOREIGN KEY `Substituto_usuario_id_fkey`;

-- DropTable
DROP TABLE `Substituto`;

-- CreateTable
CREATE TABLE `substitutos` (
    `id` VARCHAR(191) NOT NULL,
    `usuario_id` VARCHAR(191) NOT NULL,
    `substituto_id` VARCHAR(191) NOT NULL,
    `criado_em` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `alterado_em` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `substitutos` ADD CONSTRAINT `substitutos_usuario_id_fkey` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `substitutos` ADD CONSTRAINT `substitutos_substituto_id_fkey` FOREIGN KEY (`substituto_id`) REFERENCES `usuarios`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
