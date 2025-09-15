import { Module } from '@nestjs/common';
import { RelatorioController } from './relatorio.controller';
import { RelatorioARService } from './relatorio-ar-quantitativo/relatorio-ar.service';
import { RelatorioRRService } from './relatorio-rr-quantitativo/relatorio-rr.service';
import { ArGraficoProgressaoMensalService } from './ar-grafico-progressao-mensal/ar-grafico-progressao-mensal.service';
import { ArGabineteDoPrefeito } from './ar-gabinete-prefeito/relatorio-ar-gabinete-prefeito.service';
import { ArPrazoAnaliseAdmissibilidadeService } from './ar-prazo-analise-admissibilidade/relatorio-ar-prazo-analise-admissibilidade';
import { ArProcessosAprovadosService } from './ar-processos-aprovados/relatorio-ar-processos-aprovados';

@Module({
  controllers: [RelatorioController],
  providers: [RelatorioARService, RelatorioRRService, ArGraficoProgressaoMensalService, ArGabineteDoPrefeito, ArPrazoAnaliseAdmissibilidadeService, ArProcessosAprovadosService],
})
export class RelatorioModule { }
