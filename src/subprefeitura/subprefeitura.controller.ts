import { IsPublic } from '../auth/decorators/is-public.decorator';
import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { SubprefeituraService } from './subprefeitura.service';
import { CreateSubprefeituraDto } from './dto/create-subprefeitura.dto';
import { UpdateSubprefeituraDto } from './dto/update-subprefeitura.dto';
import { Permissoes } from 'src/auth/decorators/permissoes.decorator';

@Controller('subprefeitura')
export class SubprefeituraController {
  constructor(private readonly unidadesService: SubprefeituraService) {}

  @Permissoes('ADM')
  @Post('criar')
  criar(@Body() CreateSubprefeituraDto: CreateSubprefeituraDto) {
    return this.unidadesService.criar(CreateSubprefeituraDto);
  }

  @Permissoes('ADM')
  @Get('buscar-tudo')
  buscarTudo(
    @Query('pagina') pagina?: string,
    @Query('limite') limite?: string,
    @Query('busca') busca?: string,
  ) {
    return this.unidadesService.buscarTudo(+pagina, +limite, busca);
  }

  @Permissoes('ADM')
  @Get('lista-completa')
  listaCompleta() {
    return this.unidadesService.listaCompleta();
  }

  @Permissoes('ADM')
  @Get('buscar-por-id/:id')
  buscarPorId(@Param('id') id: string) {
    return this.unidadesService.buscarPorId(id);
  }

  @Permissoes('ADM')
  @Patch('atualizar/:id')
  atualizar(@Param('id') id: string, @Body() updateUnidadeDto: UpdateSubprefeituraDto) {
    return this.unidadesService.atualizar(id, updateUnidadeDto);
  }

  // @Permissoes('ADM')
  // @Delete('desativar/:id')
  // desativar(@Param('id') id: string) {
  //   return this.unidadesService.desativar(id);
  // }
}
