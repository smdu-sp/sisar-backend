import { $Enums } from "@prisma/client";

export interface UsuarioPayload {
    sub: string;
    nome: string;
    login: string;
    email: string;
    cargo: $Enums.Cargo;
    permissao: $Enums.Permissao;
    iat?: number;
    exp?: number;
}