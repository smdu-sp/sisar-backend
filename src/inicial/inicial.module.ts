import { Module } from '@nestjs/common';
import { InicialService } from './inicial.service';
import { InicialController } from './inicial.controller';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [HttpModule],
  controllers: [InicialController],
  providers: [InicialService],
})
export class InicialModule {}
