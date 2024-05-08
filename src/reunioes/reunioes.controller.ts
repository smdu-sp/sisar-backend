import { Controller, Get, Param } from '@nestjs/common';
import { ReunioesService } from './reunioes.service';
import { Permissoes } from 'src/auth/decorators/permissoes.decorator';

@Controller('reunioes')
export class ReunioesController {
  constructor(private readonly unidadesService: ReunioesService) {}

  @Permissoes('ADM')
  @Get('lista-completa')
  listaCompleta() {
    return this.unidadesService.listaCompleta();
  }

  // @Permissoes('ADM')
  // @Get('buscar-data')
  // buscarPorMesAno(@Param('mes') mes: number, @Param('ano') ano: number) {
  //   return this.unidadesService.buscarPorMesAno(mes, ano);
  // }

  @Permissoes('ADM')
  @Get('buscar/:mes/:ano') // Definindo os parâmetros na rota
  buscarPorMesAno(@Param('mes') mes: string, @Param('ano') ano: string) {
    return this.unidadesService.buscarPorMesAno(parseInt(mes), parseInt(ano)); // Passando os parâmetros corretos
  }


  @Get('buscar-data/:date')
  buscarPorData(@Param('date') data: Date) {
    return this.unidadesService.buscarPorData(data)
  }

  @Get('buscar-inicial/:id')
  buscarPorId(@Param('id') id: string) {
    return this.unidadesService.buscarPorId(id)
  }
}
