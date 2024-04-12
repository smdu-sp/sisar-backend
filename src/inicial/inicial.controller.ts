import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { InicialService } from './inicial.service';
import { CreateInicialDto } from './dto/create-inicial.dto';
import { UpdateInicialDto } from './dto/update-inicial.dto';

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

  @Get(':id')
  buscarPorId(@Param('id') id: string) {
    return this.inicialService.buscarPorId(+id);
  }

  @Patch(':id')
  atualizar(@Param('id') id: string, @Body() updateInicialDto: UpdateInicialDto) {
    return this.inicialService.atualizar(+id, updateInicialDto);
  }

  @Get('valida-sql/:sql')
  validaSql(@Param('sql') sql: string) {
    return this.inicialService.validaSql(sql);
  }
}
