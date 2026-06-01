-- Fluxo completo Aprova Rápido: instâncias, substatus e pré-reunião GRAPROEM

ALTER TABLE `iniciais` ADD COLUMN `etapa_analise` INTEGER NULL DEFAULT 1;
ALTER TABLE `iniciais` ADD COLUMN `substatus_analise` INTEGER NULL DEFAULT 0;

ALTER TABLE `decisoes` ADD COLUMN `instancia` INTEGER NULL DEFAULT 1;
CREATE INDEX `decisoes_inicial_id_instancia_idx` ON `decisoes`(`inicial_id`, `instancia`);

ALTER TABLE `reuniao_processos` ADD COLUMN `instancia` INTEGER NOT NULL DEFAULT 1;
ALTER TABLE `reuniao_processos` ADD COLUMN `numero_reuniao` VARCHAR(191) NULL;
ALTER TABLE `reuniao_processos` ADD COLUMN `parecer_grupo` TEXT NULL;

ALTER TABLE `reuniao_processos` DROP FOREIGN KEY `reuniao_processos_inicial_id_fkey`;
DROP INDEX `reuniao_processos_inicial_id_key` ON `reuniao_processos`;
CREATE UNIQUE INDEX `reuniao_processos_inicial_id_instancia_key` ON `reuniao_processos`(`inicial_id`, `instancia`);
ALTER TABLE `reuniao_processos` ADD CONSTRAINT `reuniao_processos_inicial_id_fkey` FOREIGN KEY (`inicial_id`) REFERENCES `iniciais`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

UPDATE `iniciais` SET `etapa_analise` = 1, `substatus_analise` = 0 WHERE `etapa_analise` IS NULL;
UPDATE `reuniao_processos` SET `instancia` = 1 WHERE `instancia` IS NULL OR `instancia` = 0;
