import { IsPublic } from './../auth/decorators/is-public.decorator';
import { Controller, Get, Post, Body, Patch, Param, Delete, Query, HttpCode, HttpStatus } from '@nestjs/common';
import { UnidadesService } from './unidades.service';
import { CreateUnidadeDto } from './dto/create-unidade.dto';
import { UpdateUnidadeDto } from './dto/update-unidade.dto';
import { Permissoes } from 'src/auth/decorators/permissoes.decorator';
import { ApiBody, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Unidades')
@Controller('unidades')
export class UnidadesController {
  constructor(private readonly unidadesService: UnidadesService) {}

  @Permissoes('SUP', 'ADM')
  @Post('criar')
  @HttpCode(HttpStatus.CREATED)
  @ApiBody({ description: 'Corpo da requisição para criação de unidade.', type: CreateUnidadeDto })
  @ApiResponse({ status: 201, description: 'Retorna 201 se criar com sucesso.', type: CreateUnidadeDto })
  @ApiResponse({ status: 401, description: 'Retorna 401 se não autorizado.' })
  @ApiOperation({ description: "Crie uma unidade.", summary: 'Crie unidades.' })
  criar(@Body() createUnidadeDto: CreateUnidadeDto) {
    return this.unidadesService.criar(createUnidadeDto);
  }

  @Permissoes('SUP', 'ADM')
  @Get('buscar-tudo')
  @HttpCode(HttpStatus.OK)
  @ApiResponse({ status: 200, description: 'Retorna 200 se buscar com sucesso.', type: CreateUnidadeDto })
  @ApiResponse({ status: 401, description: 'Retorna 401 se não autorizado.' })
  @ApiOperation({ description: "Busque todas as unidades.", summary: 'Busque todas as unidades.' })
  @ApiQuery({ name: 'pagina', type: 'string', required: false })
  @ApiQuery({ name: 'limite', type: 'string', required: false })
  @ApiQuery({ name: 'filtro', type: 'string', required: false })
  @ApiQuery({ name: 'busca', type: 'string', required: false })
  buscarTudo(
    @Query('pagina') pagina?: string,
    @Query('limite') limite?: string,
    @Query('busca') busca?: string,
    @Query('filtro') filtro?: string
) {
    return this.unidadesService.buscarTudo(+pagina, +limite, busca, +filtro);
}

  @Permissoes('SUP', 'ADM')
  @Get('lista-completa')
  @HttpCode(HttpStatus.OK)
  @ApiResponse({ status: 200, description: 'Retorna 200 se listar tudo com sucesso.', type: CreateUnidadeDto })
  @ApiResponse({ status: 401, description: 'Retorna 401 se não autorizado.' })
  @ApiOperation({ description: "Listar todas as unidades.", summary: 'Liste todas as unidades.' })
  listaCompleta() {
    return this.unidadesService.listaCompleta();
  }

  @Permissoes('SUP', 'ADM')
  @Get('buscar-por-id/:id')
  @HttpCode(HttpStatus.OK)
  @ApiResponse({ status: 200, description: 'Retorna 200 se buscar por ID com sucesso.', type: CreateUnidadeDto })
  @ApiResponse({ status: 401, description: 'Retorna 401 se não autorizado.' })
  @ApiOperation({ description: "Buscar uma unidade.", summary: 'Busque uma unidade.' })
  buscarPorId(@Param('id') id: string) {
    return this.unidadesService.buscarPorId(id);
  }

  @Permissoes('SUP', 'ADM')
  @Patch('atualizar/:id')
  @HttpCode(HttpStatus.OK)
  @ApiBody({ description: 'Corpo da requisição para atualização de unidade.', type: CreateUnidadeDto })
  @ApiResponse({ status: 200, description: 'Retorna 200 se atualizar com sucesso.', type: CreateUnidadeDto })
  @ApiResponse({ status: 401, description: 'Retorna 401 se não autorizado.' })
  @ApiOperation({ description: "Atualizar uma unidade.", summary: 'Atualize uma unidade.' })
  atualizar(@Param('id') id: string, @Body() updateUnidadeDto: UpdateUnidadeDto) {
    return this.unidadesService.atualizar(id, updateUnidadeDto);
  }

  @Permissoes('SUP', 'ADM')
  @Patch('desativar/:id')
  @HttpCode(HttpStatus.OK)
  @ApiBody({ description: 'Corpo da requisição para desativação de unidade.', type: CreateUnidadeDto })
  @ApiResponse({ status: 200, description: 'Retorna 200 se desativar com sucesso.', type: CreateUnidadeDto })
  @ApiResponse({ status: 401, description: 'Retorna 401 se não autorizado.' })
  @ApiOperation({ description: "Desativar uma unidade.", summary: 'Desative uma unidade.' })
  desativar(@Param('id') id: string, @Body() updateUnidadeDto: UpdateUnidadeDto) {
    return this.unidadesService.desativar(id, updateUnidadeDto);
  }
}
