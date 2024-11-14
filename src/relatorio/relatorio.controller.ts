import { Controller, Get, HttpCode, HttpStatus, Param, Query } from '@nestjs/common';
import { RelatorioService } from './relatorio.service';
import { IsPublic } from 'src/auth/decorators/is-public.decorator';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { RelatorioResopnseDto } from './dto/response-relatorio.dto';

@Controller('relatorio')
@ApiTags('Relatórios')
export class RelatorioController {
  constructor(private readonly relatorioService: RelatorioService) {}
  
  @IsPublic()
  @Get("ap/quantitativo/:mes/:ano")
  @HttpCode(HttpStatus.OK)
  @ApiResponse({ status: 200, description: 'Retorna 200 se buscar os relatórios com sucesso.', type: RelatorioResopnseDto })
  @ApiResponse({ status: 401, description: 'Retorna 401 se não autorizado.' })
  @ApiOperation({ description: "Buscar todos os relatórios.", summary: 'Busque relatórios.' })
  relatorioQuantitativo(@Param('mes') mes: string, @Param('ano') ano: string) {
    
    return this.relatorioService.relatorioQuantitativo(new Date(`${ano}-${mes}-01`));
  }
}
