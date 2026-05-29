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
import { CreateMotivoInadmissaoDto } from './dto/create-motivo-inadmissao.dto';
import { UpdateMotivoInadmissaoDto } from './dto/update-motivo-inadmissao.dto';
import { MotivoInadmissaoService } from './motivo-inadmissao.service';

@ApiTags('Motivos de Inadmissão')
@ApiBearerAuth()
@Controller('motivos-inadmissao')
export class MotivoInadmissaoController {
  constructor(private readonly service: MotivoInadmissaoService) {}

  @Permissoes('SUP', 'ADM')
  @Post('criar')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Criar motivo de inadmissão' })
  criar(@Body() dto: CreateMotivoInadmissaoDto) {
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
  atualizar(@Param('id') id: string, @Body() dto: UpdateMotivoInadmissaoDto) {
    return this.service.atualizar(id, dto);
  }

  @Permissoes('SUP', 'ADM')
  @Delete('remover/:id')
  @HttpCode(HttpStatus.OK)
  remover(@Param('id') id: string) {
    return this.service.remover(id);
  }
}
