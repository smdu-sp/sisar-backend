import { Module } from '@nestjs/common';
import { FinalizacaoService } from './finalizacao.service';
import { FinalizacaoController } from './finalizacao.controller';

@Module({
  controllers: [FinalizacaoController],
  providers: [FinalizacaoService],
})
export class FinalizacaoModule {}
