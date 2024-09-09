import { ApiProperty } from "@nestjs/swagger"
import { Cargo, Ferias, Permissao, Substituto, Usuario } from "@prisma/client"

export class EuResponseDTO {
    @ApiProperty()
    id: string
    @ApiProperty()
    nome: string
    @ApiProperty()
    login: string
    @ApiProperty()
    email: string
    @ApiProperty()
    cargo: Cargo
    @ApiProperty()
    permissao: Permissao
    @ApiProperty()
    status: number
    @ApiProperty()
    criado_em: Date
    @ApiProperty()
    alterado_em: Date
    @ApiProperty()
    unidade_id: string
    @ApiProperty()
    ferias: Ferias[]
    @ApiProperty()
    substitutos: Substituto[]
    @ApiProperty()
    usuarios: Usuario[]
}
