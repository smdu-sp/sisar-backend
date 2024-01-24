import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsuarioModule } from './usuario/usuario.module';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { IniciaisModule } from './iniciais/iniciais.module';
import { AlvaraTipoModule } from './alvara_tipo/alvara_tipo.module';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { RoleGuard } from './auth/guards/role.guard';

@Module({
  imports: [UsuarioModule, PrismaModule, AuthModule, IniciaisModule, AlvaraTipoModule],
  controllers: [AppController],
  providers: [AppService, {
    provide: APP_GUARD,
    useClass: JwtAuthGuard
  }, {
    provide: APP_GUARD,
    useClass: RoleGuard
  }]
})
export class AppModule {}
