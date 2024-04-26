import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { InicialService } from './inicial.service';
import { CreateInicialDto } from './dto/create-inicial.dto';
import { UpdateInicialDto } from './dto/update-inicial.dto';
import { IsPublic } from 'src/auth/decorators/is-public.decorator';

@Controller('inicial')
export class InicialController {
  constructor(private readonly inicialService: InicialService) {}

  @Post('criar')
  criar(@Body() createInicialDto: CreateInicialDto) {
    return this.inicialService.criar(createInicialDto);
  }

  @Get('buscar-tudo')
  buscarTudo(@Query('pagina') pagina: number = 1, @Query('limite') limite: number = 10) {
    return this.inicialService.buscarTudo(+pagina, +limite);
  }

  @Get('buscar-por-id/:id')
  buscarPorId(@Param('id') id: string) {
    return this.inicialService.buscarPorId(+id);
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
}
