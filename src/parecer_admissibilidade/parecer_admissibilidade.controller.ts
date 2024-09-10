import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { ParecerAdmissibilidadeService } from './parecer_admissibilidade.service';
import { CreateParecerAdmissibilidadeDto } from './dto/create-parecer_admissibilidade.dto';
import { UpdateParecerAdmissibilidadeDto } from './dto/update-parecer_admissibilidade.dto';

@Controller('parecer-admissibilidade')
export class ParecerAdmissibilidadeController {
  constructor(private readonly parecerAdmissibilidadeService: ParecerAdmissibilidadeService) {}

  @Post('criar')
  create(@Body() createParecerAdmissibilidadeDto: CreateParecerAdmissibilidadeDto) {
    return this.parecerAdmissibilidadeService.criar(createParecerAdmissibilidadeDto);
  }

  @Get('buscar-tudo')
  buscarTudo(
    @Query('pagina') pagina?: string,
    @Query('limite') limite?: string,
    @Query('busca') busca?: string,
  ) {
    return this.parecerAdmissibilidadeService.buscarTudo(+pagina, +limite, busca);
  }

  @Get('buscar-por-id/:id')
  buscarPorId(@Param('id') id: string) {
    return this.parecerAdmissibilidadeService.buscarPorId(id);
  }

  @Patch('atualizar/:id')
  atualizar(@Param('id') id: string, @Body() updateParecerAdmissibilidadeDto: UpdateParecerAdmissibilidadeDto) {
    return this.parecerAdmissibilidadeService.atualizar(id, updateParecerAdmissibilidadeDto);
  }

  @Delete('desativar/:id')
  desativar(@Param('id') id: string) {
    return this.parecerAdmissibilidadeService.desativar(id);
  }
}
