import { Controller, Post, Body, Get } from '@nestjs/common';
import { RelatorioService } from './relatorio.service';
import { CreateRelatorioDto } from './dto/create-relatorio.dto';
import { IsPublic } from 'src/auth/decorators/is-public.decorator';

@Controller('relatorio')
export class RelatorioController {
  constructor(private readonly relatorioService: RelatorioService) {}
  
  @IsPublic()
  @Get("ap/quantitativo")
  relatorioQuantitativo(){
    return this.relatorioService.relatorioQuantitativo();
  }

}
