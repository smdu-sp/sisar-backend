import { Body, Controller, Get, HttpCode, HttpStatus, Param, Patch } from '@nestjs/common';
import { ReunioesService } from './reunioes.service';
import { Permissoes } from 'src/auth/decorators/permissoes.decorator';
import { UpdateReunioesDto } from './dto/update-reunioes.dto';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ReunioesResponseDTO } from './dto/response.dto';

@ApiTags('Reuniões')
@Controller('reunioes')
export class ReunioesController {
  constructor(private readonly unidadesService: ReunioesService) {}

  @Permissoes('SUP', 'ADM')
  @Get('lista-completa')
  @HttpCode(HttpStatus.OK)
  @ApiResponse({ status: 200, description: 'Retorna 200 se buscar toda a lista com sucesso.', type: [ReunioesResponseDTO] })
  @ApiResponse({ status: 401, description: 'Retorna 401 se não autorizado.' })
  @ApiOperation({ description: "Buscar todas as reuniões.", summary: 'Busque reuniões.' })
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
  @HttpCode(HttpStatus.OK)
  @ApiResponse({ status: 200, description: 'Retorna 200 se filtrando por mês e ano com sucesso.', type: [ReunioesResponseDTO] })
  @ApiResponse({ status: 401, description: 'Retorna 401 se não autorizado.' })
  @ApiOperation({ description: "Buscar as reuniões filtradas por mês e ano.", summary: 'Busque reuniões por mês e ano.' })
  buscarPorMesAno(@Param('mes') mes: string, @Param('ano') ano: string) {
    return this.unidadesService.buscarPorMesAno(parseInt(mes), parseInt(ano)); // Passando os parâmetros corretos
  }

  @Permissoes('SUP', 'ADM')
  @Get('buscar-data/:date')
  @HttpCode(HttpStatus.OK)
  @ApiResponse({ status: 200, description: 'Retorna 200 se filtrando por data com sucesso.',  type: [ReunioesResponseDTO] })
  @ApiResponse({ status: 401, description: 'Retorna 401 se não autorizado.' })
  @ApiOperation({ description: "Buscar as reuniões filtradas por data.", summary: 'Busque reuniões por data.' })
  buscarPorData(@Param('date') data: Date) {
    return this.unidadesService.buscarPorData(data)
  }

  @Permissoes('SUP', 'ADM')
  @Get('buscar-inicial/:id')
  @HttpCode(HttpStatus.OK)
  @ApiResponse({ status: 200, description: 'Retorna 200 se buscar por inicial com sucesso.',  type: [ReunioesResponseDTO] })
  @ApiResponse({ status: 401, description: 'Retorna 401 se não autorizado.' })
  @ApiOperation({ description: "Buscar as reuniões por inicial.", summary: 'Buscar as reuniões por inicial.' })
  buscarPorId(@Param('id') id: string) {
    return this.unidadesService.buscarPorId(id)
  }

  @Permissoes('SUP', 'ADM')
  @Patch('atualizar-data/:id')
  @HttpCode(HttpStatus.OK)
  @ApiBody({ description: 'Corpo da requisição para atualização de reunião.', type: ReunioesResponseDTO })
  @ApiResponse({ status: 200, description: 'Retorna 200 se atualizar por data com sucesso.',  type: ReunioesResponseDTO })
  @ApiResponse({ status: 401, description: 'Retorna 401 se não autorizado.' })
  @ApiOperation({ description: "Buscar as reuniões filtradas por data.", summary: 'Busque reuniões por data.' })
  atualizarData(@Param('id') id: string, @Body() updateReunioesDto: UpdateReunioesDto) {
    return this.unidadesService.atualizarData(id, updateReunioesDto)
  }
}
