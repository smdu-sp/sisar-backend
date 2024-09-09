import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";

export class CreateSubprefeituraDto {
    @IsString({ message: 'Nome inválido!' })
    @ApiProperty()
    nome: string;

    @ApiProperty()
    @IsString({ message: 'Sigla inválida!' })
    sigla: string;

    @ApiProperty()
    @IsString({ message: 'Sigla inválida!' })
    status: number;
}
