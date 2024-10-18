import { ApiProperty } from "@nestjs/swagger"

export class CreateFinalizacaoDto {
    @ApiProperty()
    inicial_id: number
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
