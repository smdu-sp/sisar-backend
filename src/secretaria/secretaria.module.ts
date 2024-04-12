import { Module } from '@nestjs/common';
import { SecretariaService } from './secretaria.service';
import { SecretariaController } from './secretaria.controller';

@Module({
  controllers: [SecretariaController],
  providers: [SecretariaService],
})
export class SecretariaModule {}
