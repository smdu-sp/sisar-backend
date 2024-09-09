import { ApiProperty } from "@nestjs/swagger"

export class SubprefeituraResponseDTO {
    @ApiProperty()
    id: string
    @ApiProperty()
    nome: string
    @ApiProperty()
    sigla: string
    @ApiProperty()
    status: number
    @ApiProperty()
    criado_em: Date
    @ApiProperty()
    alterado_em: Date
}

export class CreateResponseSubprefeituraDTO {
    @ApiProperty()
    id: string
    @ApiProperty()
    nome: string
    @ApiProperty()
    sigla: string
    @ApiProperty()
    status: number
    @ApiProperty()
    criado_em: Date
    @ApiProperty()
    alterado_em: Date
}

export class SubprefeituraPaginatedResponseDTO {
    @ApiProperty()
    total: number
    @ApiProperty()
    pagina: number
    @ApiProperty()
    limite: number
    @ApiProperty()
    data?: Array<SubprefeituraResponseDTO>
}
