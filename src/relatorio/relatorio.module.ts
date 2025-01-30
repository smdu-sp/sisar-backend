import { Module } from '@nestjs/common';
import { RelatorioController } from './relatorio.controller';
import { RelatorioService } from './relatorio-ar-quantitativo/relatorio-ar.service';
import { RelatorioRRService } from './relatorio-rr-quantitativo/relatorio-rr.service';
import { ArGraficoProgressaoMensalService } from './ar-grafico-progressao-mensal/ar-grafico-progressao-mensal.service';

@Module({
  controllers: [RelatorioController],
  providers: [RelatorioService, RelatorioRRService, ArGraficoProgressaoMensalService],
})
export class RelatorioModule {}
