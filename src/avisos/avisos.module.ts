import { Module } from '@nestjs/common';
import { AvisosService } from './avisos.service';
import { AvisosController } from './avisos.controller';

@Module({
  controllers: [AvisosController],
  providers: [AvisosService],
})
export class AvisosModule {}
