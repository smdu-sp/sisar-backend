import { ApiProperty } from '@nestjs/swagger';

export class CreateAlvaraTipoDto {
    @ApiProperty()
    nome: string;
    @ApiProperty()
    prazo_admissibilidade: number;
}
