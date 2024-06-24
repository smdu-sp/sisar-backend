import { IsString } from "class-validator";

export class CreateSubprefeituraDto {
    @IsString({ message: 'Nome inválido!' })
    nome: string;

    @IsString({ message: 'Sigla inválida!' })
    sigla: string;
}
