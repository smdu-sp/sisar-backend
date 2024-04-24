import { Module } from '@nestjs/common';
import { SubprefeituraService } from './subprefeitura.service';
import { SubprefeituraController } from './subprefeitura.controller';

@Module({
  controllers: [SubprefeituraController],
  providers: [SubprefeituraService],
})
export class SubprefeituraModule {}
