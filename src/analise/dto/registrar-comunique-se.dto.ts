import { ApiProperty } from '@nestjs/swagger';

export class RegistrarComuniqueSeDto {
  @ApiProperty()
  data: Date | string;

  @ApiProperty({ required: false, default: false })
  complementar?: boolean;
}
