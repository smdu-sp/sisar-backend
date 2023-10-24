import { Module } from '@nestjs/common';
import { AlvaraTipoService } from './alvara_tipo.service';
import { AlvaraTipoController } from './alvara_tipo.controller';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [AlvaraTipoController],
  providers: [AlvaraTipoService],
})
export class AlvaraTipoModule {}
