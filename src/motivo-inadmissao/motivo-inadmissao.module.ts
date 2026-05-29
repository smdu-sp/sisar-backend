import { Module } from '@nestjs/common';
import { MotivoInadmissaoController } from './motivo-inadmissao.controller';
import { MotivoInadmissaoService } from './motivo-inadmissao.service';

@Module({
  controllers: [MotivoInadmissaoController],
  providers: [MotivoInadmissaoService],
  exports: [MotivoInadmissaoService],
})
export class MotivoInadmissaoModule {}
