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
import { DiretoriaService } from './diretoria.service';
import { CreateDiretoriaDto } from './dto/create-diretoria.dto';
import { UpdateDiretoriaDto } from './dto/update-diretoria.dto';

@ApiTags('Diretorias')
@ApiBearerAuth()
@Controller('diretorias')
export class DiretoriaController {
  constructor(private readonly service: DiretoriaService) {}

  @Permissoes('SUP', 'ADM')
  @Post('criar')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Criar diretoria' })
  criar(@Body() dto: CreateDiretoriaDto) {
    return this.service.criar(dto);
  }

  @Get('buscar-tudo')
  @HttpCode(HttpStatus.OK)
  @ApiQuery({ name: 'pagina', required: false })
  @ApiQuery({ name: 'limite', required: false })
  @ApiQuery({ name: 'busca', required: false })
  @ApiQuery({ name: 'coordenadoria_id', required: false })
  buscarTudo(
    @Query('pagina') pagina?: string,
    @Query('limite') limite?: string,
    @Query('busca') busca?: string,
    @Query('coordenadoria_id') coordenadoria_id?: string,
  ) {
    return this.service.buscarTudo(+pagina, +limite, busca, coordenadoria_id);
  }

  @Get('lista-completa')
  @HttpCode(HttpStatus.OK)
  @ApiQuery({ name: 'coordenadoria_id', required: false })
  listaCompleta(@Query('coordenadoria_id') coordenadoria_id?: string) {
    return this.service.listaCompleta(coordenadoria_id);
  }

  @Get('buscar-por-id/:id')
  @HttpCode(HttpStatus.OK)
  buscarPorId(@Param('id') id: string) {
    return this.service.buscarPorId(id);
  }

  @Permissoes('SUP', 'ADM')
  @Patch('atualizar/:id')
  @HttpCode(HttpStatus.OK)
  atualizar(@Param('id') id: string, @Body() dto: UpdateDiretoriaDto) {
    return this.service.atualizar(id, dto);
  }

  @Permissoes('SUP', 'ADM')
  @Delete('remover/:id')
  @HttpCode(HttpStatus.OK)
  remover(@Param('id') id: string) {
    return this.service.remover(id);
  }
}
