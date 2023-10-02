import { ApiProperty } from '@nestjs/swagger';
import { Usuario } from '@prisma/client';

export class UsuarioEntity implements Usuario {
    @ApiProperty()
    id: string;
    @ApiProperty()
    nome: string;
    @ApiProperty()
    login: string;
    @ApiProperty()
    cargo: string;
    @ApiProperty()
    permissao: string;
    @ApiProperty()
    status: number;
}
