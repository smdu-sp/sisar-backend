import { ApiProperty } from "@nestjs/swagger"

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
