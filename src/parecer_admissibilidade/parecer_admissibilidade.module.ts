import { Module } from '@nestjs/common';
import { ParecerAdmissibilidadeService } from './parecer_admissibilidade.service';
import { ParecerAdmissibilidadeController } from './parecer_admissibilidade.controller';

@Module({
  controllers: [ParecerAdmissibilidadeController],
  providers: [ParecerAdmissibilidadeService],
})
export class ParecerAdmissibilidadeModule {}
