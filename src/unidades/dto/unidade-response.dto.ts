import { ApiProperty } from "@nestjs/swagger"

export class UnidadeResponseDTO {
    @ApiProperty()
    id: string
    @ApiProperty()
    nome: string
    @ApiProperty()
    sigla: string
    @ApiProperty()
    codigo: string
    @ApiProperty()
    status: number
}
