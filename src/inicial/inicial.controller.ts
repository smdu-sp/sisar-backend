import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { InicialService } from './inicial.service';
import { CreateInicialDto } from './dto/create-inicial.dto';
import { UpdateInicialDto } from './dto/update-inicial.dto';
import { IsPublic } from 'src/auth/decorators/is-public.decorator';

@Controller('inicial')
export class InicialController {
  constructor(private readonly inicialService: InicialService) { }

  @Post('criar')
  criar(@Body() createInicialDto: CreateInicialDto) {
    return this.inicialService.criar(createInicialDto);
  }

  @Get('buscar-tudo')
  buscarTudo(
    @Query('pagina') pagina?: string,
    @Query('limite') limite?: string
  ) {
    return this.inicialService.buscarTudo(+pagina, +limite);
  }

  @Get('buscar/:mes/:ano') // Definindo os parâmetros na rota
  buscarPorMesAnoProcesso(@Param('mes') mes: string, @Param('ano') ano: string) {
    return this.inicialService.buscarPorMesAnoProcesso(parseInt(mes), parseInt(ano)); // Passando os parâmetros corretos
  }

  @Get('buscar-por-id/:id')
  buscarPorId(@Param('id') id: string) {
    return this.inicialService.buscarPorId(+id);
  }

  @Get('buscar-data-processo/:date')
  buscarPorDataProcesso(@Param('date') data: Date) {
    return this.inicialService.buscarPorDataProcesso(data)
  }

  @Patch('atualizar/:id')
  atualizar(@Param('id') id: string, @Body() updateInicialDto: UpdateInicialDto) {
    return this.inicialService.atualizar(+id, updateInicialDto);
  }

  @Patch('adiciona-sql/:inicial_id')
  adicionaSql(@Param('inicial_id') inicial_id: string, @Body() { sql }: { sql: string }) {
    return this.inicialService.adicionaSql(+inicial_id, sql);
  }

  @Delete('remove-sql/:inicial_id/:sql')
  removeSql(@Param('inicial_id') inicial_id: string, @Param('sql') sql: string) {
    return this.inicialService.removeSql(+inicial_id, sql);
  }

  @Get('valida-sql/:sql')
  validaSql(@Param('sql') sql: string) {
    return this.inicialService.validaSql(sql);
  }

  @Get('verifica-sei/:sei')
  verificaSei(@Param('sei') sei: string) {
    return this.inicialService.verificaSei(sei);
  }

  @Get('busca-processos')
  todosProcessos() {
    return this.inicialService.todosProcessos();
  }
}
