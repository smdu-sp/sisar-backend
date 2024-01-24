import { $Enums } from "@prisma/client";

export interface UsuarioJwt {
    id: string;
    login: string;
    nome: string;
    cargo: $Enums.Cargo;
    permissao: $Enums.Permissao;
}