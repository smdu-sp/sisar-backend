import { Controller, Get, HttpCode, HttpStatus, Param } from '@nestjs/common';
import { IsPublic } from 'src/auth/decorators/is-public.decorator';
import { ApiOperation, ApiResponse, ApiTags, ApiOkResponse, ApiExtraModels } from '@nestjs/swagger';
import { RelatorioResopnseDto } from './relatorio-ar-quantitativo/dto/response-relatorio.dto';
import { RelatorioARService } from './relatorio-ar-quantitativo/relatorio-ar.service';
import { RelatorioRRService } from './relatorio-rr-quantitativo/relatorio-rr.service';
import { ArGraficoProgressaoMensalService } from './ar-grafico-progressao-mensal/ar-grafico-progressao-mensal.service';
import { ArGabineteDoPrefeito } from './ar-gabinete-prefeito/relatorio-ar-gabinete-prefeito.service';
import { MesData } from './ar-grafico-progressao-mensal/dto/response-relatorio';

@Controller('relatorio')
@ApiTags('Relatórios')
export class RelatorioController {
  constructor(
    private readonly relatorioARService: RelatorioARService,
    private readonly relatorioRRService: RelatorioRRService,
    private readonly arGraficoProgressaoMensal: ArGraficoProgressaoMensalService,
    private readonly ArGabineteDoPrefeito: ArGabineteDoPrefeito
  ) { }

  @IsPublic()
  @Get("ar/quantitativo/:mes?/:ano?")
  @HttpCode(HttpStatus.OK)
  @ApiResponse({ status: 200, description: 'Retorna 200 se buscar o relatório Aprova Rápido com sucesso.', type: RelatorioResopnseDto })
  @ApiResponse({ status: 401, description: 'Retorna 401 se não autorizado.' })
  @ApiOperation({ description: "Buscar o relatório Aprova Rápido.", summary: 'Busque relatório Aprova Rápido.' })
  async relatorioQuantitativo(@Param('mes') mes: string, @Param('ano') ano: string) {
    return await this.relatorioARService.getRelatorio(mes, ano);
  }

  @IsPublic()
  @Get("rr/quantitativo/:mes/:ano")
  @HttpCode(HttpStatus.OK)
  @ApiResponse({ status: 200, description: 'Retorna 200 se buscar o relatório Requalifica Rápido com sucesso.', type: RelatorioResopnseDto })
  @ApiResponse({ status: 401, description: 'Retorna 401 se não autorizado.' })
  @ApiOperation({ description: "Buscar o relatório Requalifica Rápido.", summary: 'Busque relatório Requalifica Rápido.' })
  async relatorioRequalificaRapido(@Param('mes') mes: string, @Param('ano') ano: string) {
    return await this.relatorioRRService.getRelatorio(mes, ano);
  }

  @IsPublic()
  @Get('ar/progressao-mensal/:ano_inicio?/:ano_fim?')
  @HttpCode(HttpStatus.OK)
  @ApiExtraModels(MesData)
  @ApiResponse({ status: 200, description: 'Retorna 200 se buscar o relatório de progressão mensal com sucesso.', type: MesData })
  @ApiResponse({ status: 401, description: 'Retorna 401 se não autorizado.' })
  @ApiOperation({ summary: 'Obtém a progressão mensal de processos por ano.' })
  @ApiOkResponse({
    description: 'Progressão mensal retornada com sucesso.',
    type: MesData,
    isArray: true,
  })
  async relatorioArGraficoProgressaoMensal(@Param('ano_inicio') ano_inicio: string, @Param('ano_fim') ano_fim: string) {
    console.log("Endpoint ar/progressao-mensal chamado com:", ano_inicio, ano_fim);
    return await this.arGraficoProgressaoMensal.getRelatorio(ano_inicio, ano_fim);
  }

  @IsPublic()
  @Get('ar/gabinete-do-prefeito')
  async RelatorioArGabineteDoPrefeito() {
    console.log('endpoint ar/ganinete-do-prefeito é chamado sem parâmetro')
    return await this.ArGabineteDoPrefeito.getRelatorioGabineteDoPrefeito()
  }
}
