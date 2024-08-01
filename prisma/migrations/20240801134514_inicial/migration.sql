-- CreateTable
CREATE TABLE `admissibilidades` (
    `inicial_id` INTEGER NOT NULL,
    `unidade_id` VARCHAR(191) NULL,
    `data_envio` DATETIME(3) NULL,
    `data_decisao_interlocutoria` DATETIME(3) NULL,
    `parecer` INTEGER NOT NULL DEFAULT 0,
    `subprefeitura_id` VARCHAR(191) NULL,
    `categoria_id` VARCHAR(191) NULL,
    `status` INTEGER NOT NULL DEFAULT 1,
    `reconsiderado` BOOLEAN NULL,
    `motivo` INTEGER NULL,
    `criado_em` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `alterado_em` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `admissibilidades_inicial_id_key`(`inicial_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `alvara_tipos` (
    `id` VARCHAR(191) NOT NULL,
    `nome` VARCHAR(191) NOT NULL,
    `prazo_admissibilidade_smul` INTEGER NOT NULL DEFAULT 15,
    `reconsideracao_smul` INTEGER NOT NULL DEFAULT 3,
    `reconsideracao_smul_tipo` INTEGER NOT NULL DEFAULT 0,
    `analise_reconsideracao_smul` INTEGER NOT NULL DEFAULT 15,
    `prazo_analise_smul1` INTEGER NOT NULL DEFAULT 30,
    `prazo_analise_smul2` INTEGER NOT NULL DEFAULT 30,
    `prazo_emissao_alvara_smul` INTEGER NOT NULL DEFAULT 0,
    `prazo_admissibilidade_multi` INTEGER NOT NULL DEFAULT 15,
    `reconsideracao_multi` INTEGER NOT NULL DEFAULT 3,
    `reconsideracao_multi_tipo` INTEGER NOT NULL DEFAULT 0,
    `analise_reconsideracao_multi` INTEGER NOT NULL DEFAULT 15,
    `prazo_analise_multi1` INTEGER NOT NULL DEFAULT 45,
    `prazo_analise_multi2` INTEGER NOT NULL DEFAULT 40,
    `prazo_emissao_alvara_multi` INTEGER NOT NULL DEFAULT 0,
    `prazo_comunique_se` INTEGER NOT NULL DEFAULT 0,
    `prazo_encaminhar_coord` INTEGER NOT NULL DEFAULT 0,
    `status` INTEGER NOT NULL DEFAULT 1,
    `criado_em` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `alterado_em` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `alvara_tipos_nome_key`(`nome`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `categorias` (
    `id` VARCHAR(191) NOT NULL,
    `categoria` VARCHAR(191) NOT NULL,
    `descricao` VARCHAR(191) NOT NULL DEFAULT '',
    `divisao` VARCHAR(191) NOT NULL DEFAULT '',
    `competencia` VARCHAR(191) NOT NULL DEFAULT '',
    `criado_em` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `alterado_em` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `categorias_categoria_key`(`categoria`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `comunique_ses` (
    `id` VARCHAR(191) NOT NULL,
    `inicial_id` INTEGER NOT NULL,
    `data` DATETIME(3) NOT NULL,
    `complementar` BOOLEAN NOT NULL DEFAULT false,
    `etapa` INTEGER NOT NULL,
    `graproem` INTEGER NULL,
    `data_resposta` DATETIME(3) NULL,
    `criado_em` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `alterado_em` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `conclusoes` (
    `inicial_id` INTEGER NOT NULL,
    `data_apostilamento` DATETIME(3) NULL,
    `data_conclusao` DATETIME(3) NULL,
    `data_emissao` DATETIME(3) NULL,
    `data_outorga` DATETIME(3) NULL,
    `data_resposta` DATETIME(3) NULL,
    `data_termo` DATETIME(3) NULL,
    `num_alvara` VARCHAR(191) NOT NULL,
    `obs` VARCHAR(191) NOT NULL,
    `outorga` BOOLEAN NOT NULL DEFAULT false,
    `criado_em` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `alterado_em` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `conclusoes_inicial_id_key`(`inicial_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `controles_prazo` (
    `id` VARCHAR(191) NOT NULL,
    `inicial_id` INTEGER NOT NULL,
    `data_inicio` DATETIME(3) NULL,
    `final_planejado` DATETIME(3) NOT NULL,
    `final_executado` DATETIME(3) NULL,
    `duracao_planejada` INTEGER NOT NULL,
    `duracao_executada` INTEGER NULL,
    `etapa` INTEGER NOT NULL,
    `graproem` INTEGER NOT NULL,
    `status` INTEGER NOT NULL,
    `criado_em` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `alterado_em` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `coordenadorias` (
    `id` VARCHAR(191) NOT NULL,
    `nome` VARCHAR(191) NOT NULL,
    `sigla` VARCHAR(191) NOT NULL,
    `criado_em` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `alterado_em` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `coordenadorias_nome_key`(`nome`),
    UNIQUE INDEX `coordenadorias_sigla_key`(`sigla`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `decisoes` (
    `id` VARCHAR(191) NOT NULL,
    `inicial_id` INTEGER NOT NULL,
    `motivo` VARCHAR(191) NULL,
    `parecer` INTEGER NOT NULL DEFAULT 0,
    `publicacao_parecer` DATETIME(3) NULL,
    `analise_smul` DATETIME(3) NULL,
    `analise_smc` DATETIME(3) NULL,
    `analise_sehab` DATETIME(3) NULL,
    `analise_siurb` DATETIME(3) NULL,
    `analise_svma` DATETIME(3) NULL,
    `obs` VARCHAR(191) NULL,
    `etapa` INTEGER NULL,
    `graproem` INTEGER NULL,
    `criado_em` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `alterado_em` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `diretorias` (
    `id` VARCHAR(191) NOT NULL,
    `nome` VARCHAR(191) NOT NULL,
    `coordenadoria_id` VARCHAR(191) NOT NULL,
    `criado_em` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `alterado_em` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `diretorias_nome_key`(`nome`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `distribuicoes` (
    `inicial_id` INTEGER NOT NULL,
    `tecnico_responsavel_id` VARCHAR(191) NULL,
    `administrativo_responsavel_id` VARCHAR(191) NOT NULL,
    `processo_relacionado_incomum` VARCHAR(191) NULL,
    `assunto_processo_relacionado_incomum` VARCHAR(191) NULL,
    `baixa_pagamento` INTEGER NOT NULL DEFAULT 0,
    `obs` VARCHAR(191) NULL,
    `criado_em` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `alterado_em` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `distribuicoes_inicial_id_key`(`inicial_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `iniciais` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `decreto` BOOLEAN NOT NULL DEFAULT false,
    `sei` VARCHAR(191) NOT NULL,
    `tipo_requerimento` INTEGER NOT NULL DEFAULT 1,
    `requerimento` VARCHAR(191) NOT NULL,
    `aprova_digital` VARCHAR(191) NULL,
    `processo_fisico` VARCHAR(191) NULL,
    `data_protocolo` DATETIME(3) NOT NULL,
    `envio_admissibilidade` DATETIME(3) NULL,
    `alvara_tipo_id` VARCHAR(191) NOT NULL,
    `tipo_processo` INTEGER NULL DEFAULT 1,
    `obs` VARCHAR(191) NULL,
    `status` INTEGER NULL DEFAULT 1,
    `pagamento` INTEGER NULL DEFAULT 1,
    `requalifica_rapido` BOOLEAN NULL DEFAULT false,
    `associado_reforma` BOOLEAN NULL DEFAULT false,
    `data_limiteSmul` DATETIME(3) NULL,
    `data_limiteMulti` DATETIME(3) NULL,
    `criado_em` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `alterado_em` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `iniciais_sqls` (
    `id` VARCHAR(191) NOT NULL,
    `inicial_id` INTEGER NOT NULL,
    `sql` VARCHAR(191) NOT NULL,
    `criado_em` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `alterado_em` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `motivos_inadmissao` (
    `id` VARCHAR(191) NOT NULL,
    `descricao` VARCHAR(191) NOT NULL,
    `criado_em` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `alterado_em` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `motivos_inadmissao_inicial` (
    `inicial_id` INTEGER NOT NULL,
    `motivo_inadmissao_id` VARCHAR(191) NOT NULL,
    `descricao` VARCHAR(191) NULL,
    `criado_em` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `alterado_em` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `motivos_inadmissao_inicial_inicial_id_motivo_inadmissao_id_key`(`inicial_id`, `motivo_inadmissao_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `pedidos` (
    `id` VARCHAR(191) NOT NULL,
    `descricao` VARCHAR(191) NOT NULL,
    `criado_em` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `alterado_em` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `pedidos_descricao_key`(`descricao`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `pedidos_inicial` (
    `inicial_id` INTEGER NOT NULL,
    `pedido_id` VARCHAR(191) NOT NULL,
    `quantidade` INTEGER NOT NULL,
    `medida` VARCHAR(191) NOT NULL,
    `criado_em` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `alterado_em` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `pedidos_inicial_inicial_id_pedido_id_key`(`inicial_id`, `pedido_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `reconsideracoes_admissibilidade` (
    `inicial_id` INTEGER NOT NULL,
    `envio` DATETIME(3) NULL,
    `publicacao` DATETIME(3) NULL,
    `pedido_reconsideracao` DATETIME(3) NULL,
    `parecer` BOOLEAN NOT NULL DEFAULT false,
    `criado_em` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `alterado_em` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `reconsideracoes_admissibilidade_inicial_id_key`(`inicial_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `reuniao_processos` (
    `id` VARCHAR(191) NOT NULL,
    `inicial_id` INTEGER NOT NULL,
    `data_reuniao` DATETIME(3) NOT NULL,
    `data_processo` DATETIME(0) NOT NULL,
    `nova_data_reuniao` DATETIME(3) NULL,
    `justificativa_remarcacao` VARCHAR(191) NULL,
    `criado_em` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `alterado_em` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `reuniao_processos_inicial_id_key`(`inicial_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `interfaces` (
    `inicial_id` INTEGER NOT NULL,
    `interface_sehab` BOOLEAN NOT NULL DEFAULT false,
    `interface_siurb` BOOLEAN NOT NULL DEFAULT false,
    `interface_smc` BOOLEAN NOT NULL DEFAULT false,
    `interface_smt` BOOLEAN NOT NULL DEFAULT false,
    `interface_svma` BOOLEAN NOT NULL DEFAULT false,
    `num_sehab` VARCHAR(191) NULL,
    `num_siurb` VARCHAR(191) NULL,
    `num_smc` VARCHAR(191) NULL,
    `num_smt` VARCHAR(191) NULL,
    `num_svma` VARCHAR(191) NULL,
    `criado_em` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `alterado_em` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `interfaces_inicial_id_key`(`inicial_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `subprefeituras` (
    `id` VARCHAR(191) NOT NULL,
    `nome` VARCHAR(191) NOT NULL,
    `sigla` VARCHAR(191) NOT NULL,
    `status` INTEGER NOT NULL,
    `criado_em` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `alterado_em` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `subprefeituras_nome_key`(`nome`),
    UNIQUE INDEX `subprefeituras_sigla_key`(`sigla`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `suspensoes_prazo` (
    `id` VARCHAR(191) NOT NULL,
    `inicial_id` INTEGER NOT NULL,
    `inicio` DATETIME(3) NOT NULL,
    `final` DATETIME(3) NULL,
    `motivo` INTEGER NOT NULL,
    `etapa` INTEGER NOT NULL,
    `criado_em` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `alterado_em` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ferias` (
    `id` VARCHAR(191) NOT NULL,
    `usuario_id` VARCHAR(191) NOT NULL,
    `inicio` DATETIME(3) NOT NULL,
    `final` DATETIME(3) NOT NULL,
    `criado_em` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `alterado_em` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `usuarios` (
    `id` VARCHAR(191) NOT NULL,
    `nome` VARCHAR(191) NOT NULL,
    `login` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `cargo` ENUM('ADM', 'TEC') NOT NULL DEFAULT 'ADM',
    `permissao` ENUM('DEV', 'SUP', 'ADM', 'USR') NOT NULL DEFAULT 'USR',
    `status` INTEGER NOT NULL DEFAULT 3,
    `criado_em` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `alterado_em` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `unidade_id` VARCHAR(191) NULL,

    UNIQUE INDEX `usuarios_login_key`(`login`),
    UNIQUE INDEX `usuarios_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `unidades` (
    `id` VARCHAR(191) NOT NULL,
    `nome` VARCHAR(191) NOT NULL,
    `sigla` VARCHAR(191) NOT NULL,
    `codigo` VARCHAR(191) NOT NULL,
    `status` INTEGER NOT NULL,

    UNIQUE INDEX `unidades_nome_key`(`nome`),
    UNIQUE INDEX `unidades_sigla_key`(`sigla`),
    UNIQUE INDEX `unidades_codigo_key`(`codigo`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `avisos` (
    `id` VARCHAR(191) NOT NULL,
    `titulo` VARCHAR(191) NOT NULL,
    `descricao` VARCHAR(191) NOT NULL,
    `data` DATETIME(3) NOT NULL,
    `usuario_id` VARCHAR(191) NULL,
    `inicial_id` INTEGER NOT NULL,
    `criado_em` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `alterado_em` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Substituto` (
    `id` VARCHAR(191) NOT NULL,
    `usuario_id` VARCHAR(191) NOT NULL,
    `substituto_id` VARCHAR(191) NOT NULL,
    `criado_em` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `alterado_em` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `admissibilidades` ADD CONSTRAINT `admissibilidades_inicial_id_fkey` FOREIGN KEY (`inicial_id`) REFERENCES `iniciais`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `admissibilidades` ADD CONSTRAINT `admissibilidades_unidade_id_fkey` FOREIGN KEY (`unidade_id`) REFERENCES `unidades`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `admissibilidades` ADD CONSTRAINT `admissibilidades_subprefeitura_id_fkey` FOREIGN KEY (`subprefeitura_id`) REFERENCES `subprefeituras`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `admissibilidades` ADD CONSTRAINT `admissibilidades_categoria_id_fkey` FOREIGN KEY (`categoria_id`) REFERENCES `categorias`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `comunique_ses` ADD CONSTRAINT `comunique_ses_inicial_id_fkey` FOREIGN KEY (`inicial_id`) REFERENCES `iniciais`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `conclusoes` ADD CONSTRAINT `conclusoes_inicial_id_fkey` FOREIGN KEY (`inicial_id`) REFERENCES `iniciais`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `controles_prazo` ADD CONSTRAINT `controles_prazo_inicial_id_fkey` FOREIGN KEY (`inicial_id`) REFERENCES `iniciais`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `decisoes` ADD CONSTRAINT `decisoes_inicial_id_fkey` FOREIGN KEY (`inicial_id`) REFERENCES `iniciais`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `diretorias` ADD CONSTRAINT `diretorias_coordenadoria_id_fkey` FOREIGN KEY (`coordenadoria_id`) REFERENCES `coordenadorias`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `distribuicoes` ADD CONSTRAINT `distribuicoes_inicial_id_fkey` FOREIGN KEY (`inicial_id`) REFERENCES `iniciais`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `distribuicoes` ADD CONSTRAINT `distribuicoes_tecnico_responsavel_id_fkey` FOREIGN KEY (`tecnico_responsavel_id`) REFERENCES `usuarios`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `distribuicoes` ADD CONSTRAINT `distribuicoes_administrativo_responsavel_id_fkey` FOREIGN KEY (`administrativo_responsavel_id`) REFERENCES `usuarios`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `iniciais` ADD CONSTRAINT `iniciais_alvara_tipo_id_fkey` FOREIGN KEY (`alvara_tipo_id`) REFERENCES `alvara_tipos`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `iniciais_sqls` ADD CONSTRAINT `iniciais_sqls_inicial_id_fkey` FOREIGN KEY (`inicial_id`) REFERENCES `iniciais`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `motivos_inadmissao_inicial` ADD CONSTRAINT `motivos_inadmissao_inicial_inicial_id_fkey` FOREIGN KEY (`inicial_id`) REFERENCES `iniciais`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `motivos_inadmissao_inicial` ADD CONSTRAINT `motivos_inadmissao_inicial_motivo_inadmissao_id_fkey` FOREIGN KEY (`motivo_inadmissao_id`) REFERENCES `motivos_inadmissao`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pedidos_inicial` ADD CONSTRAINT `pedidos_inicial_inicial_id_fkey` FOREIGN KEY (`inicial_id`) REFERENCES `iniciais`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pedidos_inicial` ADD CONSTRAINT `pedidos_inicial_pedido_id_fkey` FOREIGN KEY (`pedido_id`) REFERENCES `pedidos`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `reconsideracoes_admissibilidade` ADD CONSTRAINT `reconsideracoes_admissibilidade_inicial_id_fkey` FOREIGN KEY (`inicial_id`) REFERENCES `iniciais`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `reuniao_processos` ADD CONSTRAINT `reuniao_processos_inicial_id_fkey` FOREIGN KEY (`inicial_id`) REFERENCES `iniciais`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `interfaces` ADD CONSTRAINT `interfaces_inicial_id_fkey` FOREIGN KEY (`inicial_id`) REFERENCES `iniciais`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `suspensoes_prazo` ADD CONSTRAINT `suspensoes_prazo_inicial_id_fkey` FOREIGN KEY (`inicial_id`) REFERENCES `iniciais`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ferias` ADD CONSTRAINT `ferias_usuario_id_fkey` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `usuarios` ADD CONSTRAINT `usuarios_unidade_id_fkey` FOREIGN KEY (`unidade_id`) REFERENCES `unidades`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `avisos` ADD CONSTRAINT `avisos_usuario_id_fkey` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `avisos` ADD CONSTRAINT `avisos_inicial_id_fkey` FOREIGN KEY (`inicial_id`) REFERENCES `iniciais`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Substituto` ADD CONSTRAINT `Substituto_usuario_id_fkey` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Substituto` ADD CONSTRAINT `Substituto_substituto_id_fkey` FOREIGN KEY (`substituto_id`) REFERENCES `usuarios`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
