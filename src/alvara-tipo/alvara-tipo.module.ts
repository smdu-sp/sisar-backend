import { Module } from '@nestjs/common';
import { AlvaraTipoService } from './alvara-tipo.service';
import { AlvaraTipoController } from './alvara-tipo.controller';

@Module({
  controllers: [AlvaraTipoController],
  providers: [AlvaraTipoService],
})
export class AlvaraTipoModule {}
