import { Module } from '@nestjs/common';
import { CoordenadoriaController } from './coordenadoria.controller';
import { CoordenadoriaService } from './coordenadoria.service';

@Module({
  controllers: [CoordenadoriaController],
  providers: [CoordenadoriaService],
  exports: [CoordenadoriaService],
})
export class CoordenadoriaModule {}
