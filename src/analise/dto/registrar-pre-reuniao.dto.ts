import { ApiProperty } from '@nestjs/swagger';

export class RegistrarPreReuniaoDto {
  @ApiProperty()
  data_reuniao: Date | string;

  @ApiProperty()
  data_processo: Date | string;

  @ApiProperty()
  numero_reuniao: string;

  @ApiProperty()
  parecer_grupo: string;

  @ApiProperty({ required: false })
  nova_data_reuniao?: Date | string;

  @ApiProperty({ required: false })
  justificativa_remarcacao?: string;
}
