import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ReconsideracaoService } from './reconsideracao.service';
import { RegistrarPedidoReconsideracaoDto } from './dto/registrar-pedido.dto';

@ApiTags('Reconsideração admissibilidade')
@ApiBearerAuth()
@Controller('reconsideracao-admissibilidade')
export class ReconsideracaoController {
  constructor(private readonly service: ReconsideracaoService) {}

  @Get(':inicialId')
  @HttpCode(HttpStatus.OK)
  buscar(@Param('inicialId') inicialId: string) {
    return this.service.buscar(+inicialId);
  }

  @Post('pedido/:inicialId')
  @HttpCode(HttpStatus.CREATED)
  @ApiBody({ type: RegistrarPedidoReconsideracaoDto })
  registrarPedido(
    @Param('inicialId') inicialId: string,
    @Body() dto: RegistrarPedidoReconsideracaoDto,
  ) {
    return this.service.registrarPedido(+inicialId, dto);
  }

  @Patch('aceitar/:inicialId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Aceita pedido e encaminha à análise técnica' })
  aceitar(@Param('inicialId') inicialId: string) {
    return this.service.aceitar(+inicialId);
  }

  @Patch('rejeitar/:inicialId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Rejeita pedido — via ordinária' })
  rejeitar(@Param('inicialId') inicialId: string) {
    return this.service.rejeitar(+inicialId);
  }
}
