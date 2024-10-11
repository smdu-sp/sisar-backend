-- AlterTable
ALTER TABLE `iniciais` MODIFY `data_protocolo` DATE NOT NULL,
    MODIFY `envio_admissibilidade` DATE NULL,
    MODIFY `data_limiteSmul` DATE NULL,
    MODIFY `data_limiteMulti` DATE NULL;

-- AlterTable
ALTER TABLE `reconsideracoes_admissibilidade` MODIFY `envio` DATE NULL,
    MODIFY `publicacao` DATE NULL,
    MODIFY `pedido_reconsideracao` DATE NULL;

-- AlterTable
ALTER TABLE `reuniao_processos` MODIFY `data_reuniao` DATE NOT NULL,
    MODIFY `data_processo` DATE NOT NULL,
    MODIFY `nova_data_reuniao` DATE NULL;
