import { $Enums } from "@prisma/client";

export interface UsuarioJwt {
    id: string;
    nome: string;
    login: string;
    email: string;
    cargo: $Enums.Cargo;
    permissao: $Enums.Permissao;
}