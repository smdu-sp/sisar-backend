import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsuarioModule } from './usuario/usuario.module';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { IniciaisModule } from './iniciais/iniciais.module';

@Module({
  imports: [UsuarioModule, PrismaModule, AuthModule, IniciaisModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
