import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CreateMotivoInadmissaoDto {
  @ApiProperty()
  @IsString()
  descricao: string;
}
