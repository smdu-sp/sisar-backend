import { ApiProperty } from '@nestjs/swagger';

export class CreateAlvaraTipoDto {
    @ApiProperty()
    nome: string;
    @ApiProperty()
    prazo_admissibilidade: number;
    @ApiProperty()
    prazo_analise_smul1: number;
    @ApiProperty()
    prazo_analise_smul2: number;
    @ApiProperty()
    prazo_analise_multi1: number;
    @ApiProperty()
    prazo_analise_multi2: number;

}
