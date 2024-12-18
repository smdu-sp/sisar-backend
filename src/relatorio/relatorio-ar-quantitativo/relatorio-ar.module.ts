import { Module } from '@nestjs/common';
import { RelatorioService } from './relatorio-ar.service';
import { RelatorioController } from '../relatorio.controller';
import { RelatorioRRService } from '../relatorio-rr-quantitativo/relatorio-rr.service';

@Module({
  controllers: [RelatorioController],
  providers: [RelatorioService, RelatorioRRService],
})
export class RelatorioModule {}
