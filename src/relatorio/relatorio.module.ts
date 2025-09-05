import { Module } from '@nestjs/common';
import { RelatorioController } from './relatorio.controller';
import { RelatorioARService } from './relatorio-ar-quantitativo/relatorio-ar.service';
import { RelatorioRRService } from './relatorio-rr-quantitativo/relatorio-rr.service';
import { ArGraficoProgressaoMensalService } from './ar-grafico-progressao-mensal/ar-grafico-progressao-mensal.service';
import { ArGabineteDoPrefeito } from './ar-gabinete-prefeito/relatorio-ar-gabinete-prefeito.service';

@Module({
  controllers: [RelatorioController],
  providers: [RelatorioARService, RelatorioRRService, ArGraficoProgressaoMensalService, ArGabineteDoPrefeito],
})
export class RelatorioModule { }
