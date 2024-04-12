import { Module } from '@nestjs/common';
import { InicialService } from './inicial.service';
import { InicialController } from './inicial.controller';

@Module({
  controllers: [InicialController],
  providers: [InicialService],
})
export class InicialModule {}
