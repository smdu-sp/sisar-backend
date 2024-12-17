/*
  Warnings:

  - You are about to drop the column `parecer` on the `admissibilidades` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `admissibilidades` DROP COLUMN `parecer`,
    ADD COLUMN `parecer_admissibilidade_id` VARCHAR(191) NULL;

-- AddForeignKey
ALTER TABLE `admissibilidades` ADD CONSTRAINT `admissibilidades_parecer_admissibilidade_id_fkey` FOREIGN KEY (`parecer_admissibilidade_id`) REFERENCES `pareceres_admissibilidade`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
