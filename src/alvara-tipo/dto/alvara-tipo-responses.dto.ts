import { ApiProperty } from "@nestjs/swagger"

export class AlvaraTipoResponseDTO {
    @ApiProperty()
    id: string
    @ApiProperty()
    nome: string
    @ApiProperty()
    prazo_admissibilidade_smul: number
    @ApiProperty()
    reconsideracao_smul: number
    @ApiProperty()
    reconsideracao_smul_tipo: number
    @ApiProperty()
    analise_reconsideracao_smul: number
    @ApiProperty()
    prazo_analise_smul1: number
    @ApiProperty()
    prazo_analise_smul2: number
    @ApiProperty()
    prazo_emissao_alvara_smul: number
    @ApiProperty()
    prazo_admissibilidade_multi: number
    @ApiProperty()
    reconsideracao_multi: number
    @ApiProperty()
    reconsideracao_multi_tipo: number
    @ApiProperty()
    analise_reconsideracao_multi: number
    @ApiProperty()
    prazo_analise_multi1: number
    @ApiProperty()
    prazo_analise_multi2: number
    @ApiProperty()
    prazo_emissao_alvara_multi: number
    @ApiProperty()
    prazo_comunique_se: number
    @ApiProperty()
    prazo_encaminhar_coord: number
    @ApiProperty()
    status: number
    @ApiProperty()
    criado_em?: Date
    @ApiProperty()
    alterado_em?: Date
}

export class AlvaraTipoPaginadoDTO {
    @ApiProperty()
    total: number
    @ApiProperty()
    pagina: number
    @ApiProperty()
    limite: number
    @ApiProperty()
    data?: AlvaraTipoResponseDTO[]
}
