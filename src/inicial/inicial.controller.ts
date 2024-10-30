import { Controller, Get, Post, Body, Patch, Param, Delete, Query, HttpCode, HttpStatus, ForbiddenException } from '@nestjs/common';
import { InicialService } from './inicial.service';
import { CreateInicialDto } from './dto/create-inicial.dto';
import { UpdateInicialDto } from './dto/update-inicial.dto';
import { IsPublic } from 'src/auth/decorators/is-public.decorator';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { IniciaisPaginado, InicialProcessosMesAnoResponseDTO, InicialProcessosResponseDTO, InicialResponseDTO, SqlResponseDTO } from './dto/inicial-response.dto';

@ApiTags('Inicial')
@ApiBearerAuth()
@Controller('inicial')
export class InicialController {
  constructor(private readonly inicialService: InicialService) { }

  @Post('criar')
  @HttpCode(HttpStatus.CREATED)
  @ApiBody({ type: CreateInicialDto })
  @ApiOperation({ description: "Registrar uma inicial.", summary: 'Registre uma inicial.' })
  @ApiResponse({ status: 201, description: 'Retorna 201 se registrar a inicial com sucesso.', type: InicialResponseDTO })
  @ApiResponse({ status: 401, description: 'Retorna 401 se não autorizado.' })
  criar(@Body() createInicialDto: CreateInicialDto): Promise<InicialResponseDTO> {
    return this.inicialService.criar(createInicialDto);
  }

  @Get('buscar-tudo')
  @HttpCode(HttpStatus.OK)
  @ApiQuery({ name: 'pagina', type: 'string', required: true })
  @ApiQuery({ name: 'limite', type: 'string', required: true })
  @ApiQuery({ name: 'busca', type: 'string', required: false })
  @ApiOperation({ description: "Buscar todas as iniciais.", summary: 'Busque todas as iniciais.' })
  @ApiResponse({ status: 200, description: 'Retorna 200 se buscar as iniciais com sucesso.', type: IniciaisPaginado })
  @ApiResponse({ status: 401, description: 'Retorna 401 se não autorizado.' })
  buscarTudo(
    @Query('pagina') pagina?: string,
    @Query('limite') limite?: string,
    @Query('busca') busca?: string,
    @Query('status') status?: string,
  ): Promise<IniciaisPaginado> {
    return this.inicialService.buscarTudo(+pagina, +limite, busca, +status);
  }

  @Get('buscar-tudo-analise')
  @HttpCode(HttpStatus.OK)
  @ApiQuery({ name: 'pagina', type: 'string', required: true })
  @ApiQuery({ name: 'limite', type: 'string', required: true })
  @ApiQuery({ name: 'status', type: 'string', required: true })
  @ApiOperation({ description: "Buscar todas as iniciais.", summary: 'Busque todas as iniciais.' })
  @ApiResponse({ status: 200, description: 'Retorna 200 se buscar as iniciais com sucesso.', type: IniciaisPaginado })
  @ApiResponse({ status: 401, description: 'Retorna 401 se não autorizado.' })
  buscarTudoEmAnalise(
    @Query('pagina') pagina?: string,
    @Query('limite') limite?: string
  ): Promise<IniciaisPaginado> {
    return this.inicialService.buscarTudoEmAnalise(+pagina, +limite);
  }

  @Get('buscar/:mes/:ano') // Definindo os parâmetros na rota
  @HttpCode(HttpStatus.OK)
  @ApiParam({ name: 'mes', type: 'string', required: true })
  @ApiParam({ name: 'ano', type: 'string', required: true })
  @ApiOperation({ description: "Buscar todas por mês e ano.", summary: 'Busque todas por mês e ano.' })
  @ApiResponse({ status: 200, description: 'Retorna 200 se buscar as iniciais com sucesso.', type: [InicialProcessosMesAnoResponseDTO] })
  @ApiResponse({ status: 401, description: 'Retorna 401 se não autorizado.' })
  buscarPorMesAnoProcesso(
    @Param('mes') mes: string, 
    @Param('ano') ano: string
  ): Promise<InicialProcessosMesAnoResponseDTO[]> {
    return this.inicialService.buscarPorMesAnoProcesso(parseInt(mes), parseInt(ano)); // Passando os parâmetros corretos
  }

  @Get('buscar-por-id/:id')
  @HttpCode(HttpStatus.OK)
  @ApiParam({ name: 'id', type: 'string', required: true })
  @ApiOperation({ description: "Buscar por ID.", summary: 'Busque por ID.' })
  @ApiResponse({ status: 200, description: 'Retorna 200 se buscar a inicial por ID com sucesso.', type: InicialResponseDTO })
  @ApiResponse({ status: 401, description: 'Retorna 401 se não autorizado.' })
  buscarPorId(@Param('id') id: string): Promise<InicialResponseDTO> {
    return this.inicialService.buscarPorId(+id);
  }

  @Get('buscar-data-processo/:date')
  @HttpCode(HttpStatus.OK)
  @ApiParam({ name: 'date', type: 'Date', required: true })
  @ApiOperation({ description: "Buscar por data.", summary: 'Busque por data.' })
  @ApiResponse({ status: 200, description: 'Retorna 200 se buscar a inicial por ID com sucesso.' })
  @ApiResponse({ status: 401, description: 'Retorna 401 se não autorizado.' })
  buscarPorDataProcesso(@Param('date') data: Date) {
    return this.inicialService.buscarPorDataProcesso(data)
  }

  @Patch('atualizar/:id')
  @HttpCode(HttpStatus.OK)
  @ApiParam({ name: 'id', type: 'string', required: true })
  @ApiBody({ type: UpdateInicialDto })
  @ApiOperation({ description: "Atualizar por ID.", summary: 'Atualize por ID.' })
  @ApiResponse({ status: 200, description: 'Retorna 200 se atualizar a inicial por ID com sucesso.', type: InicialResponseDTO })
  @ApiResponse({ status: 401, description: 'Retorna 401 se não autorizado.' })
  atualizar(
    @Param('id') id: string, 
    @Body() updateInicialDto: UpdateInicialDto
  ): Promise<InicialResponseDTO> {
    return this.inicialService.atualizar(+id, updateInicialDto);
  }

  @Patch('adiciona-sql/:inicial_id')
  @HttpCode(HttpStatus.OK)
  @ApiParam({ name: 'inicial_id', type: 'string', required: true })
  // @ApiBody({ type: })
  @ApiOperation({ description: "Adicionar sql por ID.", summary: 'Adicione sql por ID.' })
  @ApiResponse({ status: 200, description: 'Retorna 200 se adicionar sql à inicial por ID com sucesso.', type: SqlResponseDTO })
  @ApiResponse({ status: 401, description: 'Retorna 401 se não autorizado.' })
  adicionaSql(
    @Param('inicial_id') inicial_id: string, 
    @Body() { sql }: { sql: string }
  ): Promise<SqlResponseDTO | ForbiddenException> {
    return this.inicialService.adicionaSql(+inicial_id, sql);
  }

  @Delete('remove-sql/:inicial_id/:sql')
  @HttpCode(HttpStatus.OK)
  @ApiParam({ name: 'inicial_id', type: 'string', required: true })
  @ApiParam({ name: 'sql', type: 'string', required: true })
  @ApiOperation({ description: "Deletar sql por ID da inicial.", summary: 'Delete sql por ID da inicial.' })
  @ApiResponse({ status: 200, description: 'Retorna 200 se deletar sql por ID da inicial com sucesso.', type: Boolean })
  @ApiResponse({ status: 401, description: 'Retorna 401 se não autorizado.' })
  removeSql(
    @Param('inicial_id') inicial_id: string, 
    @Param('sql') sql: string
  ): Promise<boolean> {
    return this.inicialService.removeSql(+inicial_id, sql);
  }

  @Get('valida-sql/:sql')
  @HttpCode(HttpStatus.OK)
  @ApiParam({ name: 'sql', type: 'string', required: true })
  @ApiOperation({ description: "Validar sql.", summary: 'Valide sql.' })
  @ApiResponse({ status: 200, description: 'Retorna 200 se validar sql com sucesso.', type: Boolean })
  @ApiResponse({ status: 401, description: 'Retorna 401 se não autorizado.' })
  validaSql(@Param('sql') sql: string) {
    return this.inicialService.validaSql(sql);
  }

  @Get('verifica-sei/:sei')
  @HttpCode(HttpStatus.OK)
  @ApiParam({ name: 'sei', type: 'string', required: true })
  @ApiOperation({ description: "Verificar sei.", summary: 'Verifique o sei.' })
  @ApiResponse({ status: 200, description: 'Retorna 200 se verificar o sei com sucesso.', type: InicialResponseDTO })
  @ApiResponse({ status: 401, description: 'Retorna 401 se não autorizado.' })
  verificaSei(@Param('sei') sei: string): Promise<InicialResponseDTO> {
    return this.inicialService.verificaSei(sei);
  }

  @Get('busca-processos')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ description: "Buscar processos.", summary: 'Busque processos.' })
  @ApiResponse({ status: 200, description: 'Retorna 200 ao buscar processos com sucesso.', type: [InicialProcessosResponseDTO] })
  @ApiResponse({ status: 401, description: 'Retorna 401 se não autorizado.' })
  todosProcessos(): Promise<InicialProcessosResponseDTO[]> {
    return this.inicialService.todosProcessos();
  }
}
