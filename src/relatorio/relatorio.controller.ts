import { Controller, Get, HttpCode, HttpStatus } from '@nestjs/common';
import { RelatorioService } from './relatorio.service';
import { IsPublic } from 'src/auth/decorators/is-public.decorator';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@Controller('relatorio')
@ApiTags('Relatórios')
export class RelatorioController {
  constructor(private readonly relatorioService: RelatorioService) {}
  
  @IsPublic()
  @Get("ap/quantitativo")
  @HttpCode(HttpStatus.OK)
  @ApiResponse({ status: 200, description: 'Retorna 200 se buscar os relatórios com sucesso.' })
  @ApiResponse({ status: 401, description: 'Retorna 401 se não autorizado.' })
  @ApiOperation({ description: "Buscar todos os relatórios.", summary: 'Busque relatórios.' })
  relatorioQuantitativo(){
    return this.relatorioService.relatorioQuantitativo();
  }
}
