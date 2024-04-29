import { IsDate, IsString, IsNumber } from "class-validator";

export class CreateReunioesDto {
    @IsDate({ message: 'Data invalida!' })
    data_reuniao: Date;
    @IsDate({ message: 'Nova data invalida!' })
    nova_data: Date;
    @IsString({ message: 'justificativa invalida!' })
    justificativa_remarcacao: string;
    @IsNumber()
    id_inicial: number;
}
