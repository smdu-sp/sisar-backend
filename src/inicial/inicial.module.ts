import { Module } from '@nestjs/common';
import { InicialService } from './inicial.service';
import { InicialController } from './inicial.controller';

@Module({
  imports: [],
  controllers: [InicialController],
  providers: [InicialService],
  exports: [InicialService],
})
export class InicialModule {}
