import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { Permissoes } from 'src/auth/decorators/permissoes.decorator';
import { CreatePedidoDto } from './dto/create-pedido.dto';
import { UpdatePedidoDto } from './dto/update-pedido.dto';
import { PedidoService } from './pedido.service';

@ApiTags('Pedidos')
@ApiBearerAuth()
@Controller('pedidos')
export class PedidoController {
  constructor(private readonly service: PedidoService) {}

  @Permissoes('SUP', 'ADM')
  @Post('criar')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Criar pedido' })
  criar(@Body() dto: CreatePedidoDto) {
    return this.service.criar(dto);
  }

  @Get('buscar-tudo')
  @HttpCode(HttpStatus.OK)
  @ApiQuery({ name: 'pagina', required: false })
  @ApiQuery({ name: 'limite', required: false })
  @ApiQuery({ name: 'busca', required: false })
  buscarTudo(
    @Query('pagina') pagina?: string,
    @Query('limite') limite?: string,
    @Query('busca') busca?: string,
  ) {
    return this.service.buscarTudo(+pagina, +limite, busca);
  }

  @Get('lista-completa')
  @HttpCode(HttpStatus.OK)
  listaCompleta() {
    return this.service.listaCompleta();
  }

  @Get('buscar-por-id/:id')
  @HttpCode(HttpStatus.OK)
  buscarPorId(@Param('id') id: string) {
    return this.service.buscarPorId(id);
  }

  @Permissoes('SUP', 'ADM')
  @Patch('atualizar/:id')
  @HttpCode(HttpStatus.OK)
  atualizar(@Param('id') id: string, @Body() dto: UpdatePedidoDto) {
    return this.service.atualizar(id, dto);
  }

  @Permissoes('SUP', 'ADM')
  @Delete('remover/:id')
  @HttpCode(HttpStatus.OK)
  remover(@Param('id') id: string) {
    return this.service.remover(id);
  }
}
