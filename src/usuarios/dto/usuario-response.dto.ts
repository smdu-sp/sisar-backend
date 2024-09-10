import { ApiProperty } from "@nestjs/swagger"
import { Cargo, Permissao, Unidade } from "@prisma/client"

export class UsuarioResponseDTO {
    @ApiProperty()
    id: string
    @ApiProperty()
    nome: string
    @ApiProperty()
    login: string
    @ApiProperty()
    email: string
    @ApiProperty()
    cargo: string
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
    unidade?: Unidade
}

export class UsuarioPaginadoResponseDTO {
    @ApiProperty()
    total: number
    @ApiProperty()
    pagina: number
    @ApiProperty()
    limite: number
    @ApiProperty()
    data?: UsuarioResponseDTO[]
}

export class UsuarioDesativadoResponseDTO {
    @ApiProperty()
    desativado: boolean
}

export class UsuarioAutorizadoResponseDTO {
    @ApiProperty()
    autorizado: boolean
}

export class BuscarNovoResponseDTO {
    @ApiProperty()
    login: string
    @ApiProperty()
    nome: string
    @ApiProperty()
    email: string
    @ApiProperty()
    unidade_id: string
}

export class BuscarFuncionariosResponseDTO {
    @ApiProperty()
    administrativos: UsuarioResponseDTO[]
    @ApiProperty()
    tecnicos: UsuarioResponseDTO[]
}

export class AddSubstitutoDTO {
    @ApiProperty()
    usuario_id: string;
    @ApiProperty()
    substituto_id: string;
}
