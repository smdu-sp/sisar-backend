-- AlterTable
ALTER TABLE `iniciais` ADD COLUMN `associado_reforma` BOOLEAN NULL DEFAULT false,
    ADD COLUMN `requalifica_rapido` BOOLEAN NULL DEFAULT false;
