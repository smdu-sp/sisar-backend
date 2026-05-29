import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CreatePedidoDto {
  @ApiProperty()
  @IsString()
  descricao: string;
}
