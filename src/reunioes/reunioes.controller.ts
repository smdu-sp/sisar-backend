import { Body, Controller, Get, Param, Patch } from '@nestjs/common';
import { ReunioesService } from './reunioes.service';
import { Permissoes } from 'src/auth/decorators/permissoes.decorator';
import { UpdateReunioesDto } from './dto/update-reunioes.dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Reuniões')
@Controller('reunioes')
export class ReunioesController {
  constructor(private readonly unidadesService: ReunioesService) {}

  @Permissoes('SUP', 'ADM')
  @Get('lista-completa')
  listaCompleta() {
    return this.unidadesService.listaCompleta();
  }

  // @Permissoes('ADM')
  // @Get('buscar-data')
  // buscarPorMesAno(@Param('mes') mes: number, @Param('ano') ano: number) {
  //   return this.unidadesService.buscarPorMesAno(mes, ano);
  // }

  @Permissoes('SUP', 'ADM')
  @Get('buscar/:mes/:ano') // Definindo os parâmetros na rota
  buscarPorMesAno(@Param('mes') mes: string, @Param('ano') ano: string) {
    return this.unidadesService.buscarPorMesAno(parseInt(mes), parseInt(ano)); // Passando os parâmetros corretos
  }


  @Permissoes('SUP', 'ADM')
  @Get('buscar-data/:date')
  buscarPorData(@Param('date') data: Date) {
    return this.unidadesService.buscarPorData(data)
  }

  @Permissoes('SUP', 'ADM')
  @Get('buscar-inicial/:id')
  buscarPorId(@Param('id') id: string) {
    return this.unidadesService.buscarPorId(id)
  }

  @Permissoes('SUP', 'ADM')
  @Patch('atualizar-data/:id')
  atualizarData(@Param('id') id: string, @Body() updateReunioesDto: UpdateReunioesDto) {
    return this.unidadesService.atualizarData(id, updateReunioesDto)
  }
}
