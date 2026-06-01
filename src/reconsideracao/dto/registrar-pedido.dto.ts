import { ApiProperty } from '@nestjs/swagger';

export class RegistrarPedidoReconsideracaoDto {
  @ApiProperty()
  pedido_reconsideracao: Date | string;

  @ApiProperty({ required: false })
  envio?: Date | string;

  @ApiProperty({ required: false })
  publicacao?: Date | string;
}
