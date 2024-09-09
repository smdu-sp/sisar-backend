import { Controller, Get, Post, Body, Patch, Param, Delete, Query, HttpCode, HttpStatus } from '@nestjs/common';
import { AdmissibilidadePaginado, AdmissibilidadeService } from './admissibilidade.service';
import { CreateAdmissibilidadeDto } from './dto/create-admissibilidade.dto';
import { UpdateAdmissibilidadeDto } from './dto/update-admissibilidade.dto';
import { Permissoes } from 'src/auth/decorators/permissoes.decorator';
import { ApiBody, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Admissibilidade')
@Controller('admissibilidade')
export class AdmissibilidadeController {
  constructor(private readonly admissibilidadeService: AdmissibilidadeService) {}

  @Post('criar')
  @HttpCode(HttpStatus.CREATED)
  @ApiBody({ type: CreateAdmissibilidadeDto })
  @ApiResponse({ status: 201, description: 'Retorna 201 se registrar a admissibilidade com sucesso.' })
  @ApiResponse({ status: 401, description: 'Retorna 401 se não autorizado.' })
  @ApiOperation({ description: "Registrar uma admissibilidade.", summary: 'Registre uma admissibilidade.' })
  create(@Body() createAdmissibilidadeDto: CreateAdmissibilidadeDto) {
    return this.admissibilidadeService.create(createAdmissibilidadeDto);
  }

  @Get('consulta')
  @HttpCode(HttpStatus.OK)
  @ApiResponse({ status: 200, description: 'Retorna 200 se consultar a admissibilidade com sucesso.' })
  @ApiResponse({ status: 401, description: 'Retorna 401 se não autorizado.' })
  @ApiOperation({ description: "Consultar uma admissibilidade.", summary: 'Consulte uma admissibilidade.' })
  findAll() {
    return this.admissibilidadeService.findAll();
  }

  @Get('buscar-tudo')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ description: "Buscar todas as admissibilidades.", summary: 'Busque tudo admissibilidade.' })
  @ApiQuery({ name: 'pagina', type: 'string', required: false })
  @ApiQuery({ name: 'limite', type: 'string', required: false })
  @ApiQuery({ name: 'filtro', type: 'string', required: false })
  @ApiQuery({ name: 'busca', type: 'string', required: false })
  @ApiResponse({ status: 200, description: 'Retorna 200 se buscar todas as admissibilidades com sucesso.', type: AdmissibilidadePaginado })
  @ApiResponse({ status: 401, description: 'Retorna 401 se não autorizado.' })
  buscarTudo(
    @Query('pagina') pagina: number = 1, 
    @Query('limite') limite: number = 10, 
    @Query('filtro') filtro: number, 
    @Query('busca') busca: string
  ) {
    return this.admissibilidadeService.buscarTudo(+pagina, +limite, +filtro, busca);
  }

  @Get('buscar-id/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ description: "Buscar admissibilidade por ID.", summary: 'Busque a admissibilidade por ID.' })
  @ApiParam({ name: 'id', type: 'string', required: false })
  @ApiResponse({ status: 200, description: 'Retorna 200 se buscar a admissibilidade por ID com sucesso.' })
  @ApiResponse({ status: 401, description: 'Retorna 401 se não autorizado.' })
  buscarPorId(@Param('id') id: string) {
    return this.admissibilidadeService.buscarPorId(+id);
  }

  @Permissoes('ADM')
  @Get('lista')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ description: "Listar todas as admissibilidades.", summary: 'Liste tudo admissibilidade.' })
  @ApiResponse({ status: 200, description: 'Retorna 200 se listar todas as admissibilidades com sucesso.', type: AdmissibilidadePaginado })
  @ApiResponse({ status: 401, description: 'Retorna 401 se não autorizado.' })
  listaCompleta() {
    return this.admissibilidadeService.listaCompleta();
  }

  @Patch('atualizar-id/:id')
  @HttpCode(HttpStatus.OK)
  @ApiParam({ name: 'id', type: 'string', required: true })
  @ApiBody({ type: UpdateAdmissibilidadeDto })
  @ApiOperation({ description: "Atualizar admissibilidade.", summary: 'Atualize admissibilidade.' })
  @ApiResponse({ status: 200, description: 'Retorna 200 se atualizar a admissibilidade com sucesso.' })
  @ApiResponse({ status: 401, description: 'Retorna 401 se não autorizado.' })
  atulaizarStatus(@Param('id') id: string, @Body() updateAdmissibilidadeDto: UpdateAdmissibilidadeDto) {
    return this.admissibilidadeService.atualizarStatus(+id, updateAdmissibilidadeDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiParam({ name: 'id', type: 'string', required: true })
  @ApiOperation({ description: "Deletar a admissibilidade.", summary: 'Delete admissibilidade.' })
  @ApiResponse({ status: 200, description: 'Retorna 200 se deletar a admissibilidade com sucesso.', type: String })
  @ApiResponse({ status: 401, description: 'Retorna 401 se não autorizado.' })
  remove(@Param('id') id: string): string {
    return this.admissibilidadeService.remove(+id);
  }
}
