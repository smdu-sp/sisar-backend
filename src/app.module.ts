import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsuarioModule } from './usuario/usuario.module';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { IniciaisModule } from './iniciais/iniciais.module';
import { AlvaraTipoModule } from './alvara_tipo/alvara_tipo.module';

@Module({
  imports: [UsuarioModule, PrismaModule, AuthModule, IniciaisModule, AlvaraTipoModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
