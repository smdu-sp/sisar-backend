import { PrismaService } from 'src/prisma/prisma.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class ArAnaliseDesempenhoSecretariasService {
  constructor(private prisma: PrismaService) {}

  async getTodasIniciais() {
    return this.prisma.inicial.findMany();
  }

  async ordernarIniciaisPorData(lista) {
    const iniciaisOrdenadas = lista.sort((a, b) => {
      // Converter as datas para timestamp numérico
      return (
        new Date(a.data_envio).getTime() - new Date(b.data_envio).getTime()
      );
    });
    return iniciaisOrdenadas;
  }

  async agruparIniciaisPorStatus(lista){
      const analise_1 = [];
      const analise_2 = [];

  for (const inicial of lista) {
    // Busca admissibilidade para o inicial atual
    const admissibilidade = await this.prisma.admissibilidade.findFirst({
      where: { inicial_id: inicial.id }
    });

    if (admissibilidade) {
      if (admissibilidade.reconsiderado === true) {
        analise_2.push(inicial);
      } else {
        analise_1.push(inicial);
      }
    }
  }
  return { analise_1, analise_2 };
}

  async getRelatorio() {
    return { message: 'Relatório de Análise de Desempenho das Secretarias' };
  }
}
