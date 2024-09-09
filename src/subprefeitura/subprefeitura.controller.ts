import { IsPublic } from '../auth/decorators/is-public.decorator';
import { Controller, Get, Post, Body, Patch, Param, Delete, Query, HttpCode, HttpStatus } from '@nestjs/common';
import { SubprefeituraService } from './subprefeitura.service';
import { CreateSubprefeituraDto } from './dto/create-subprefeitura.dto';
import { UpdateSubprefeituraDto } from './dto/update-subprefeitura.dto';
import { Permissoes } from 'src/auth/decorators/permissoes.decorator';
import { ApiBody, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Subprefeitura')
@Controller('subprefeitura')
export class SubprefeituraController {
  constructor(private readonly subprefeiturasServiceimport: SubprefeituraService) {}

  @Permissoes('SUP', 'ADM')
  @Post('criar')
  @HttpCode(HttpStatus.CREATED)
  @ApiBody({ type: CreateSubprefeituraDto })
  @ApiResponse({ status: 201, description: 'Retorna 201 se registrar a subprefeitura com sucesso.' })
  @ApiResponse({ status: 401, description: 'Retorna 401 se não autorizado.' })
  @ApiOperation({ description: "Registrar uma subprefeitura.", summary: 'Registre uma subprefeitura.' })
  criar(@Body() CreateSubprefeituraDto: CreateSubprefeituraDto) {
    return this.subprefeiturasServiceimport.criar(CreateSubprefeituraDto);
  }

  @Permissoes('SUP', 'ADM')
  @Get('buscar-tudo')
  @HttpCode(HttpStatus.OK)
  @ApiQuery({ name: 'pagina', type: 'string', required: false })
  @ApiQuery({ name: 'limite', type: 'string', required: false })
  @ApiQuery({ name: 'busca', type: 'string', required: false })
  @ApiResponse({ status: 200, description: 'Retorna 200 se buscar as subprefeituras com sucesso.' })
  @ApiResponse({ status: 401, description: 'Retorna 401 se não autorizado.' })
  @ApiOperation({ description: "Buscar todas as subprefeituras.", summary: 'Busque as subprefeituras.' })
  buscarTudo(
    @Query('pagina') pagina?: string,
    @Query('limite') limite?: string,
    @Query('busca') busca?: string,
  ) {
    return this.subprefeiturasServiceimport.buscarTudo(+pagina, +limite, busca);
  }

  @Permissoes('SUP', 'ADM')
  @Get('lista-completa')
  @ApiResponse({ status: 200, description: 'Retorna 200 se buscar a lista completa com sucesso.' })
  @ApiResponse({ status: 401, description: 'Retorna 401 se não autorizado.' })
  @ApiOperation({ description: "Lista completa de todas as subprefeituras.", summary: 'Liste as subprefeituras.' })
  listaCompleta() {
    return this.subprefeiturasServiceimport.listaCompleta();
  }

  @Permissoes('SUP', 'ADM')
  @Get('buscar-por-id/:id')
  @ApiParam({ name: 'id', type: 'string', required: true })
  @ApiResponse({ status: 200, description: 'Retorna 200 se buscar a subprefeitura por ID com sucesso.' })
  @ApiResponse({ status: 401, description: 'Retorna 401 se não autorizado.' })
  @ApiOperation({ description: "Buscar uma subprefeitura.", summary: 'Busque uma subprefeitura.' })
  buscarPorId(@Param('id') id: string) {
    return this.subprefeiturasServiceimport.buscarPorId(id);
  }

  @Permissoes('SUP', 'ADM')
  @Patch('atualizar/:id')
  @ApiParam({ name: 'id', type: 'string', required: true })
  @ApiBody({ type: UpdateSubprefeituraDto })
  @ApiResponse({ status: 200, description: 'Retorna 200 se atualizar a subprefeitura com sucesso.' })
  @ApiResponse({ status: 401, description: 'Retorna 401 se não autorizado.' })
  @ApiOperation({ description: "Atualizar subprefeitura.", summary: 'Atualize a subprefeitura.' })
  atualizar(@Param('id') id: string, @Body() updateUnidadeDto: UpdateSubprefeituraDto) {
    return this.subprefeiturasServiceimport.atualizar(id, updateUnidadeDto);
  }

  // @Permissoes('ADM')
  // @Patch('desativar/:id')
  // desativar(@Param('id') id: string) {
  //   return this.subprefeiturasServiceimport.desativar(id);
  // }

  // @Permissoes('ADM')
  // @Delete('desativar/:id')
  // desativar(@Param('id') id: string) {
  //   return this.subprefeiturasServiceimport.desativar(id);
  // }
}
