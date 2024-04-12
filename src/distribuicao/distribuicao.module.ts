import { Module } from '@nestjs/common';
import { DistribuicaoService } from './distribuicao.service';
import { DistribuicaoController } from './distribuicao.controller';

@Module({
  controllers: [DistribuicaoController],
  providers: [DistribuicaoService],
})
export class DistribuicaoModule {}
