import { Module } from '@nestjs/common';
import { IniciaisService } from './iniciais.service';
import { IniciaisController } from './iniciais.controller';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [IniciaisController],
  providers: [IniciaisService],
})
export class IniciaisModule {}
