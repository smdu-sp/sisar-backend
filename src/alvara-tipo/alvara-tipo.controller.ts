import { Controller, Get, Post, Body, Patch, Param, Delete, Query, HttpCode, HttpStatus } from '@nestjs/common';
import { AlvaraTipoService } from './alvara-tipo.service';
import { CreateAlvaraTipoDto } from './dto/create-alvara-tipo.dto';
import { UpdateAlvaraTipoDto } from './dto/update-alvara-tipo.dto';
import { Permissoes } from 'src/auth/decorators/permissoes.decorator';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Alvará-Tipo')
@ApiBearerAuth()
@Controller('alvara-tipo')
export class AlvaraTipoController {
  constructor(private readonly alvaraTipoService: AlvaraTipoService) {}

  @Permissoes('SUP', 'ADM')
  @Post('criar')
  @HttpCode(HttpStatus.CREATED)
  @ApiBody({ type: CreateAlvaraTipoDto })
  @ApiOperation({ description: "Registrar um alvará-tipo.", summary: 'Registre um alvará-tipo.' })
  @ApiResponse({ status: 201, description: 'Retorna 201 se registrar o alvará-tipo com sucesso.' })
  @ApiResponse({ status: 401, description: 'Retorna 401 se não autorizado.' })
  criar(@Body() createAlvaraTipoDto: CreateAlvaraTipoDto) {
    return this.alvaraTipoService.criar(createAlvaraTipoDto);
  }

  @Get('lista-completa')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ description: "Listar os alvaras-tipo.", summary: 'Liste os alvarás-tipo.' })
  @ApiResponse({ status: 200, description: 'Retorna 200 se listar a lista completa dos alvaras-tipo com sucesso.' })
  @ApiResponse({ status: 401, description: 'Retorna 401 se não autorizado.' })
  listaCompleta() {
    return this.alvaraTipoService.listaCompleta();
  }

  @Permissoes('SUP', 'ADM')
  @Get('buscar-tudo')
  @HttpCode(HttpStatus.OK)
  @ApiQuery({ name: 'pagina', type: 'string', required: false })
  @ApiQuery({ name: 'limite', type: 'string', required: false })
  @ApiQuery({ name: 'busca', type: 'string', required: false })
  @ApiOperation({ description: "Buscar os alvarás-tipo.", summary: 'Busque os alvarás-tipo.' })
  @ApiResponse({ status: 200, description: 'Retorna 200 se buscar os alvaras-tipo com sucesso.' })
  @ApiResponse({ status: 401, description: 'Retorna 401 se não autorizado.' })
  buscarTudo(
    @Query('pagina') pagina: number,
    @Query('limite') limite: number,
    @Query('busca') busca?: string,
  ) {
    return this.alvaraTipoService.buscarTudo(+pagina, +limite, busca);
  }

  @Permissoes('SUP', 'ADM')
  @Get('buscar-por-id/:id')
  @HttpCode(HttpStatus.OK)
  @ApiParam({ name: 'id', type: 'string', required: true })
  @ApiOperation({ description: "Buscar um alvará-tipo.", summary: 'Busque um alvará-tipo.' })
  @ApiResponse({ status: 200, description: 'Retorna 200 se buscar um alvará-tipo com sucesso.' })
  @ApiResponse({ status: 401, description: 'Retorna 401 se não autorizado.' })
  buscarPorId(@Param('id') id: string) {
    return this.alvaraTipoService.buscarPorId(id);
  }

  @Permissoes('SUP', 'ADM')
  @Patch('atualizar/:id')
  @HttpCode(HttpStatus.OK)
  @ApiParam({ name: 'id', type: 'string', required: true })
  @ApiBody({ type: UpdateAlvaraTipoDto })
  @ApiOperation({ description: "Atualizar um alvará-tipo.", summary: 'Altualize um alvará-tipo.' })
  @ApiResponse({ status: 200, description: 'Retorna 200 se atualizar um alvará-tipo com sucesso.' })
  @ApiResponse({ status: 401, description: 'Retorna 401 se não autorizado.' })
  atualizar(
    @Param('id') id: string,
    @Body() updateAlvaraTipoDto: UpdateAlvaraTipoDto,
  ) {
    return this.alvaraTipoService.atualizar(id, updateAlvaraTipoDto);
  }

  @Permissoes('SUP', 'ADM')
  @Patch('auterar-status/:id')
  @HttpCode(HttpStatus.OK)
  @ApiParam({ name: 'id', type: 'string', required: true })
  @ApiBody({ type: UpdateAlvaraTipoDto })
  @ApiOperation({ description: "Atualizar status do alvará-tipo.", summary: 'Atualize status do alvará-tipo.' })
  @ApiResponse({ status: 200, description: 'Retorna 200 se atualizar o status do alvará-tipo com sucesso.' })
  @ApiResponse({ status: 401, description: 'Retorna 401 se não autorizado.' })
  auterarStatus(
    @Param('id') id: string,
    @Body() updateAlvaraTipoDto: UpdateAlvaraTipoDto,
  ) {
    return this.alvaraTipoService.atualizar(id, updateAlvaraTipoDto);
  }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.alvaraTipoService.remove(id);
  // }
}
