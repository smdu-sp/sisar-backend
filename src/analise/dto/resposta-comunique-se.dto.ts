import { ApiProperty } from '@nestjs/swagger';

export class RespostaComuniqueSeDto {
  @ApiProperty()
  data_resposta: Date | string;
}
