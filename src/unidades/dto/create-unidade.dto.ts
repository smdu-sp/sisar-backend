import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean, IsString } from "class-validator";

export class CreateUnidadeDto {
    @ApiProperty()
    @IsString({ message: 'Nome inválido!' })
    nome: string;

    @ApiProperty()
    @IsString({ message: 'Sigla inválida!' })
    sigla: string;

    @ApiProperty()
    @IsString({ message: 'Código inválido!' })
    codigo: string;

    @ApiProperty()
    @IsBoolean({ message: 'Status inválida!' })
    status: number;
}
