import { ApiProperty } from '@nestjs/swagger';

export class CreateUsuarioDto {
    @ApiProperty()
    nome: string;
    @ApiProperty()
    login: string;
    @ApiProperty()
    cargo: string;
    @ApiProperty()
    permissao?: string = "USR";
    @ApiProperty()
    status?: number = 1;
}
