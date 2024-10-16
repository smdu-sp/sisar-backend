import { Global, Module } from '@nestjs/common';
import { AppService } from './app.service';
import { UsuariosModule } from './usuarios/usuarios.module';
import { AuthModule } from './auth/auth.module';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { RoleGuard } from './auth/guards/role.guard';
import { PrismaModule } from './prisma/prisma.module';
import { SGUModule } from './sgu/sgu.module';
import { AlvaraTipoModule } from './alvara-tipo/alvara-tipo.module';
import { InicialModule } from './inicial/inicial.module';
import { UnidadesModule } from './unidades/unidades.module';
import { SubprefeituraModule } from './subprefeitura/subprefeitura.module';
import { ReunioesModule } from './reunioes/reunioes.module';
import { AdmissibilidadeModule } from './admissibilidade/admissibilidade.module';
import { DistribuicaoModule } from './distribuicao/distribuicao.module';
import { AvisosModule } from './avisos/avisos.module';
import { ParecerAdmissibilidadeModule } from './parecer_admissibilidade/parecer_admissibilidade.module';
import { RelatorioModule } from './relatorio/relatorio.module';
import { XlsxService } from './xlsx/xlsx.service';
import { XlsxModule } from './xlsx/xlsx.module';

@Global()
@Module({
  imports: [UsuariosModule, AuthModule, PrismaModule, SGUModule, AlvaraTipoModule, InicialModule, UnidadesModule, SubprefeituraModule, ReunioesModule, AdmissibilidadeModule, DistribuicaoModule, AvisosModule, ParecerAdmissibilidadeModule, RelatorioModule, XlsxModule],
  controllers: [],
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
    XlsxService,
  ],
  exports: [AppService],
})
export class AppModule {}
