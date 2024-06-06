import { Module } from '@nestjs/common';
import { AdmissibilidadeService } from './admissibilidade.service';
import { AdmissibilidadeController } from './admissibilidade.controller';

@Module({
  controllers: [AdmissibilidadeController],
  providers: [AdmissibilidadeService],
})
export class AdmissibilidadeModule {}
