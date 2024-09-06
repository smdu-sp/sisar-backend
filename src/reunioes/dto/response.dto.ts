import { ApiProperty } from "@nestjs/swagger";

export class ReunioesResponseDTO {
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
