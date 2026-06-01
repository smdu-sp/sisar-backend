import { Module } from '@nestjs/common';
import { ReconsideracaoService } from './reconsideracao.service';
import { ReconsideracaoController } from './reconsideracao.controller';
import { InicialModule } from 'src/inicial/inicial.module';

@Module({
  imports: [InicialModule],
  controllers: [ReconsideracaoController],
  providers: [ReconsideracaoService],
})
export class ReconsideracaoModule {}
