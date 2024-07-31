import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { AdmissibilidadeService } from './admissibilidade.service';
import { CreateAdmissibilidadeDto } from './dto/create-admissibilidade.dto';
import { UpdateAdmissibilidadeDto } from './dto/update-admissibilidade.dto';
import { Permissoes } from 'src/auth/decorators/permissoes.decorator';

@Controller('admissibilidade')
export class AdmissibilidadeController {
  constructor(private readonly admissibilidadeService: AdmissibilidadeService) {}

  @Post('criar')
  create(@Body() createAdmissibilidadeDto: CreateAdmissibilidadeDto) {
    return this.admissibilidadeService.create(createAdmissibilidadeDto);
  }

  // @Get()
  // findAll() {
  //   return this.admissibilidadeService.findAll();
  // }

  @Get('consulta')
  findAll() {
    return this.admissibilidadeService.findAll();
  }

  @Get('buscar-tudo')
  buscarTudo(@Query('pagina') pagina: number = 1, @Query('limite') limite: number = 10, @Query('filtro') filtro: number, @Query('busca') busca: string) {
    return this.admissibilidadeService.buscarTudo(+pagina, +limite, +filtro, busca);
  }

  @Get('buscar-id/:id')
  buscarPorId(@Param('id') id: string) {
    return this.admissibilidadeService.buscarPorId(+id);
  }

  @Permissoes('ADM')
  @Get('lista')
  listaCompleta() {
    return this.admissibilidadeService.listaCompleta();
  }

  @Patch('atualizar-id/:id')
  atulaizarStatus(@Param('id') id: string, @Body() updateAdmissibilidadeDto: UpdateAdmissibilidadeDto) {
    return this.admissibilidadeService.atualizarStatus(+id, updateAdmissibilidadeDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.admissibilidadeService.remove(+id);
  }
}
