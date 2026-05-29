import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CreateCategoriaDto {
  @ApiProperty()
  @IsString()
  categoria: string;

  @ApiProperty({ required: false })
  @IsString()
  descricao?: string;

  @ApiProperty({ required: false })
  @IsString()
  divisao?: string;

  @ApiProperty({ required: false })
  @IsString()
  competencia?: string;
}
