import { Controller, Get, HttpCode, HttpStatus, Param } from '@nestjs/common';
import { IsPublic } from 'src/auth/decorators/is-public.decorator';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { RelatorioResopnseDto } from './relatorio-ar-quantitativo/dto/response-relatorio.dto';
import { RelatorioService } from './relatorio-ar-quantitativo/relatorio-ar.service';
import { RelatorioRRService } from './relatorio-rr-quantitativo/relatorio-rr.service';

@Controller('relatorio')
@ApiTags('Relatórios')
export class RelatorioController {
  constructor(private readonly relatorioService: RelatorioService, private readonly relatorioRRService: RelatorioRRService) {}
  
  @IsPublic()
  @Get("ar/quantitativo/:mes/:ano")
  @HttpCode(HttpStatus.OK)
  @ApiResponse({ status: 200, description: 'Retorna 200 se buscar os relatórios com sucesso.', type: RelatorioResopnseDto })
  @ApiResponse({ status: 401, description: 'Retorna 401 se não autorizado.' })
  @ApiOperation({ description: "Buscar todos os relatórios.", summary: 'Busque relatórios.' })
  async relatorioQuantitativo(@Param('mes') mes: string, @Param('ano') ano: string) {
    return await this.relatorioService.getRelatorio(mes, ano);
  }

  @IsPublic()
  @Get("rr/quantitativo/:mes/:ano")
  @HttpCode(HttpStatus.OK)
  @ApiResponse({ status: 200, description: 'Retorna 200 se buscar os relatórios com sucesso.', type: RelatorioResopnseDto })
  @ApiResponse({ status: 401, description: 'Retorna 401 se não autorizado.' })
  @ApiOperation({ description: "Buscar todos os relatórios.", summary: 'Busque relatórios.' })
  async relatorioRequalificaRapido(@Param('mes') mes: string, @Param('ano') ano: string) {
    return await this.relatorioRRService.getRelatorio(mes, ano);
  }
}
