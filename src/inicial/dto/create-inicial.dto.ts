import { ApiProperty } from "@nestjs/swagger";

export class CreateInicialDto {
    @ApiProperty()
    id?: number;
    @ApiProperty()
    decreto: boolean = false;
    @ApiProperty()
    sei: string;
    @ApiProperty()
    tipo_requerimento: string;
    @ApiProperty()
    requerimento: string;
    @ApiProperty()
    aprova_digital: string;
    @ApiProperty()
    processo_fisico: string;
    @ApiProperty()
    data_protocolo: string;
    @ApiProperty()
    envio_admissibilidade: string;
    @ApiProperty()
    alvara_tipo_id: string;
    @ApiProperty()
    tipo_processo: number;
    @ApiProperty()
    obs?: string;
    @ApiProperty()
    status?: number;
    @ApiProperty()
    nums_sql?: string[];
}
