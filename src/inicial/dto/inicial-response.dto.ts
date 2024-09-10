import { ApiProperty } from "@nestjs/swagger";
import { Admissibilidade, Alvara_Tipo, Avisos, Comunique_se, Conclusao, Controle_Prazo, Decisao, Distribuicao, Inicial, Inicial_Sqls, Interface, Motivo_Inadmissao_Inicial, Pedido_Inicial, Reconsideracao_Admissibilidade, Reuniao_Processo, Suspensao_Prazo } from "@prisma/client";

export class IniciaisPaginado {
    @ApiProperty()
    data: Inicial[];
    @ApiProperty()
    total: number;
    @ApiProperty()
    pagina: number;
    @ApiProperty()
    limite: number;
}

export class InicialResponseDTO {
    @ApiProperty()
    id: number
    @ApiProperty()
    decreto: boolean
    @ApiProperty()
    sei: string
    @ApiProperty()
    tipo_requerimento: number
    @ApiProperty()
    requerimento: string
    @ApiProperty()
    aprova_digital?: string
    @ApiProperty()
    processo_fisico?: string
    @ApiProperty()
    data_protocolo: Date
    @ApiProperty()
    envio_admissibilidade?: Date
    @ApiProperty()
    alvara_tipo?: Alvara_Tipo
    @ApiProperty()
    alvara_tipo_id: string
    @ApiProperty()
    tipo_processo?: number
    @ApiProperty()
    obs?: string
    @ApiProperty()
    status?: number
    @ApiProperty()
    pagamento?: number
    @ApiProperty()
    requalifica_rapido?: boolean
    @ApiProperty()
    associado_reforma?: boolean
    @ApiProperty()
    data_limiteSmul?: Date
    @ApiProperty()
    data_limiteMulti?: Date
    @ApiProperty()
    comunique_ses?: Comunique_se[]
    @ApiProperty()
    controles_prazo?: Controle_Prazo[]
    @ApiProperty()
    decisoes?: Decisao[]
    @ApiProperty()
    motivos_inadmissao?: Motivo_Inadmissao_Inicial[]
    @ApiProperty()
    pedidos?: Pedido_Inicial[]
    @ApiProperty()
    reunioes?: Reuniao_Processo[]
    @ApiProperty()
    suspensoes_prazo?: Suspensao_Prazo[]
    @ApiProperty()
    iniciais_sqls?: Inicial_Sqls[]
    @ApiProperty()
    avisos?: Avisos[]
    @ApiProperty()
    admissibilidade?: Admissibilidade
    @ApiProperty()
    conclusao?: Conclusao
    @ApiProperty()
    distribuicao?: Distribuicao
    @ApiProperty()
    reconsideracao_admissibilidade?: Reconsideracao_Admissibilidade
    @ApiProperty()
    interfaces?: Interface
    @ApiProperty()
    criado_em?: Date
    @ApiProperty()
    alterado_em?: Date
}

export class SqlResponseDTO {
    @ApiProperty()
    id: string;
    @ApiProperty()
    inicial_id: number;
    @ApiProperty()
    sql: string;
    @ApiProperty()
    criado_em: Date;
    @ApiProperty()
    alterado_em: Date;
}

export class InicialProcessosResponseDTO {
    @ApiProperty()
    id: number;
    @ApiProperty()
    sei: string;
    @ApiProperty()
    aprova_digital: string;
}

export class InicialProcessosMesAnoResponseDTO {
    @ApiProperty()
    id: string;
    @ApiProperty()
    inicial_id: number;
    @ApiProperty()
    data_reuniao: Date;
    @ApiProperty()
    data_processo: Date;
    @ApiProperty()
    nova_data_reuniao: Date | null;
    @ApiProperty()
    justificativa_remarcacao: string | null;
    @ApiProperty()
    criado_em: Date;
    @ApiProperty()
    alterado_em: Date;
}
