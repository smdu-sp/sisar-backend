import { $Enums } from '@prisma/client';
import {
  IsDate,
  IsEmail,
  IsEnum,
  IsNumber,
  IsString,
  MinLength,
} from 'class-validator';

export class CreateUsuarioDto {
  @MinLength(10, { message: 'Nome tem de ter ao menos 10 caracteres.' })
  @IsString({ message: 'Tem de ser texto.' })
  nome: string;

  @IsString({ message: 'Login inválido!' })
  @MinLength(7, { message: 'Login tem de ter ao menos 7 caracteres.' })
  login: string;

  @IsString({ message: 'Login inválido!' })
  @IsEmail({}, { message: 'Login tem de ter ao menos 7 caracteres.' })
  email: string;

  @IsString({ message: 'Unidade inválida!' })
  unidade_id?: string;

  @IsEnum($Enums.Permissao, { message: 'Escolha uma permissão válida.' })
  permissao?: $Enums.Permissao;

  @IsEnum($Enums.Cargo, { message: 'Escolha um cargo válido.' })
  cargo?: $Enums.Cargo;

  @IsNumber({}, { message: 'Status inválido!' })
  status?: number;
}

export class AddFeriasDto {
  @IsDate({ message: 'Tem de ser uma data válida.' })
  inicio: Date;

  @IsDate({ message: 'Tem de ser uma data válida.' })
  final: Date;
}
