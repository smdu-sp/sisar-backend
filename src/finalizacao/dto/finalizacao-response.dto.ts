import { ApiProperty } from "@nestjs/swagger";
import { Admissibilidade, Alvara_Tipo, Avisos, Comunique_se, Conclusao, Controle_Prazo, Decisao, Distribuicao, Inicial, Inicial_Sqls, Interface, Motivo_Inadmissao_Inicial, Pedido_Inicial, Reconsideracao_Admissibilidade, Reuniao_Processo, Suspensao_Prazo } from "@prisma/client";

export class FinalizacaoPaginado {
    @ApiProperty()
    data: FinalizacaoResponseDTO[];
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

export class FinalizacaoResponseDTO {
    @ApiProperty()
    inicial: InicialResponseDTO
    @ApiProperty()
    data_apostilamento: Date
    @ApiProperty()
    data_conclusao: Date
    @ApiProperty()
    data_emissao: Date
    @ApiProperty()
    data_outorga: Date
    @ApiProperty()
    data_resposta: Date
    @ApiProperty()
    data_termo: Date
    @ApiProperty()
    num_alvara: string
    @ApiProperty()
    obs: string
    @ApiProperty()
    outorga: boolean
}
