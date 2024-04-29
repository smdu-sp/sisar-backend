import { Global, Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsuariosModule } from './usuarios/usuarios.module';
import { AuthModule } from './auth/auth.module';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { RoleGuard } from './auth/guards/role.guard';
import { PrismaModule } from './prisma/prisma.module';
import { Prisma2Module } from './prisma2/prisma2.module';
import { AlvaraTipoModule } from './alvara-tipo/alvara-tipo.module';
import { InicialModule } from './inicial/inicial.module';
import { UnidadesModule } from './unidades/unidades.module';
import { SubprefeituraModule } from './subprefeitura/subprefeitura.module';
import { ReunioesModule } from './reunioes/reunioes.module';

@Global()
@Module({
  imports: [UsuariosModule, AuthModule, PrismaModule, Prisma2Module, AlvaraTipoModule, InicialModule, UnidadesModule, SubprefeituraModule, ReunioesModule],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RoleGuard,
    },
  ],
  exports: [AppService],
})
export class AppModule {}
