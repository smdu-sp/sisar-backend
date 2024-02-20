import { ApiProperty } from '@nestjs/swagger';
import { $Enums } from '@prisma/client';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  Length,
  MinLength,
} from 'class-validator';

export class CreateUsuarioDto {
  @ApiProperty()
  @IsNotEmpty({ message: 'Nome deve ser informado' })
  @MinLength(10, { message: 'Nome deve ter pelo menos 10 caracteres' })
  nome: string;

  @ApiProperty()
  @IsNotEmpty({ message: 'Login deve ser informado' })
  @Length(7, 7, { message: 'Login deve ter 7 digitos' })
  login: string;

  @ApiProperty()
  @IsEmail({ message: 'Email inválido' })
  @IsNotEmpty({ message: 'Email deve ser informado' })
  email: string;

  @ApiProperty()
  @IsEnum($Enums.Cargo)
  cargo?: $Enums.Cargo = 'ADM';

  @ApiProperty()
  @IsEnum($Enums.Permissao)
  permissao?: $Enums.Permissao = 'USR';

  @ApiProperty()
  @IsNumber({ maxDecimalPlaces: 0 }, { message: 'Status deve ser numérico' })
  status?: number = 3;
}
