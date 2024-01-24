import { $Enums } from "@prisma/client";

export interface UsuarioPayload {
    sub: string;
    login: string;
    nome: string;
    cargo: $Enums.Cargo;
    permissao: $Enums.Permissao;
    iat?: number;
    exp?: number;
}