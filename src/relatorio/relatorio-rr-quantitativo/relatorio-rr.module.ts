import { Module } from '@nestjs/common';
import { RelatorioRRService } from './relatorio-rr.service';

@Module({
  providers: [RelatorioRRService],
})
export class RelatorioRRModule {}
