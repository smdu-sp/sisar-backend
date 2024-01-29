import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { AlvaraTipoService } from './alvara_tipo.service';
import { CreateAlvaraTipoDto } from './dto/create-alvara_tipo.dto';
import { UpdateAlvaraTipoDto } from './dto/update-alvara_tipo.dto';
import { Permissoes } from 'src/auth/decorators/permissoes.decorator';

@Controller('alvara-tipo')
export class AlvaraTipoController {
  constructor(private readonly alvaraTipoService: AlvaraTipoService) {}

  @Permissoes('SUP', 'ADM')
  @Post('criar')
  criar(@Body() createAlvaraTipoDto: CreateAlvaraTipoDto) {
    return this.alvaraTipoService.criar(createAlvaraTipoDto);
  }

  @Permissoes('SUP', 'ADM')
  @Get('buscar-tudo')
  buscarTudo(
    @Query('pagina') pagina: number,
    @Query('limite') limite: number,
    @Query('busca') busca?: string
  ) {
    return this.alvaraTipoService.buscarTudo(pagina, limite, busca);
  }

  @Permissoes('SUP', 'ADM')
  @Get('buscar-por-id/:id')
  buscarPorId(@Param('id') id: string) {
    return this.alvaraTipoService.buscarPorId(id);
  }

  @Permissoes('SUP', 'ADM')
  @Patch('atualizar/:id')
  atualizar(@Param('id') id: string, @Body() updateAlvaraTipoDto: UpdateAlvaraTipoDto) {
    return this.alvaraTipoService.atualizar(id, updateAlvaraTipoDto);
  }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.alvaraTipoService.remove(id);
  // }
}
