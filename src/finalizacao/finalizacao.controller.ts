import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { FinalizacaoService } from './finalizacao.service';
import { CreateFinalizacaoDto } from './dto/create-finalizacao.dto';
import { UpdateFinalizacaoDto } from './dto/update-finalizacao.dto';

@Controller('finalizacao')
export class FinalizacaoController {
  constructor(private readonly finalizacaoService: FinalizacaoService) {}

  @Post('criar')
  create(
    @Body() createFinalizacaoDto: CreateFinalizacaoDto,
    @Query('conclusao') conclusao: string
  ) {
    console.log(conclusao);
    const conclusaoBoolean = conclusao === 'true' ? true : false;
    return this.finalizacaoService.criar(createFinalizacaoDto, conclusaoBoolean);
  }

  @Get('buscar-tudo')
  findAll(
    @Query('pagina') pagina?: string,
    @Query('limite') limite?: string,
    @Query('busca') busca?: string
  ) {
    return this.finalizacaoService.buscarTudo(+pagina, +limite, busca);
  }

  @Get('buscar/:id')
  findOne(@Param('id') id: string) {
    return this.finalizacaoService.buscaId(+id);
  }

  @Patch('atualizar/:id')
  update(@Param('id') id: string, @Body() updateFinalizacaoDto: UpdateFinalizacaoDto) {
    return this.finalizacaoService.atualizar(+id, updateFinalizacaoDto);
  }
}
