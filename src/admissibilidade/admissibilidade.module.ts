import { Module } from '@nestjs/common';
import { AdmissibilidadeService } from './admissibilidade.service';
import { AdmissibilidadeController } from './admissibilidade.controller';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  controllers: [AdmissibilidadeController],
  providers: [AdmissibilidadeService],
  imports: [
    ScheduleModule.forRoot()
  ],
})
export class AdmissibilidadeModule {}
