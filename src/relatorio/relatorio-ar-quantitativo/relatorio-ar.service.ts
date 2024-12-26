import { Injectable } from '@nestjs/common';
import { Admissibilidade, Unidade } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class RelatorioService {
  constructor(private prisma: PrismaService) {}

  async getUnidades(): Promise<Partial<Unidade>[]> {
    return await this.prisma.unidade.findMany({
      where: { status: 1 },
      select: { id: true, nome: true }
    });
  }

  // Função auxiliar para contagem e agrupamento
  async countByUnidade(
    status: number, tipo: number, unidadeIds: string[], periodFilter: { gte: Date, lte: Date }
  ): Promise<Record<string, number>> {
    const resultados: { unidade: { nome: string, id: string } }[] = await this.prisma.admissibilidade.findMany({
      where: {
        inicial: { status, tipo_processo: tipo },
        data_decisao_interlocutoria: periodFilter,
        unidade_id: { in: unidadeIds }
      },
      select: { unidade: { select: { nome: true, id: true } } }
    });
    return resultados.reduce((acc, item): Record<string, number> => {
      const nome: string = item.unidade.nome;
      acc[nome] = (acc[nome] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  };

  // Função auxiliar para contagem total
  async countTotal(status: number, decisaoNull = false, periodFilter: { gte: Date, lte: Date }): Promise<number> {
    return await this.prisma.admissibilidade.count({
      where: {
        status,
        criado_em: periodFilter,
        data_decisao_interlocutoria: decisaoNull ? null : periodFilter
      }
    });
  };

  // Função para obter dados completos
  async getData(status: number, decisaoNull = false, periodFilter: { gte: Date, lte: Date }): Promise<Admissibilidade[]> {
    return await this.prisma.admissibilidade.findMany({
      where: {
        status,
        criado_em: periodFilter,
        data_decisao_interlocutoria: decisaoNull ? null : periodFilter
      },
      include: { inicial: true }
    });
  };

  async getRelatorio(mes: string, ano: string) {
    const primeiroDia: Date = new Date(Number(ano), Number(mes) - 1, 1);
    const ultimoDia: Date = new Date(Number(ano), Number(mes), 0);
    const unidades: Partial<Unidade>[] = await this.getUnidades();
    const periodFilter: { gte: Date, lte: Date } = { gte: primeiroDia, lte: ultimoDia };
    const unidadeIds: string[] = unidades.map(u => u.id);

    // Contagens
    const analise: number = await this.countTotal(1, true, periodFilter);
    const inadmissiveis: number = await this.countTotal(2, true, periodFilter);
    const admissiveis: number = await this.countTotal(0, null, periodFilter);

    // Dados por tipo e status
    const analiseGeralSmul: Record<string, number> = await this.countByUnidade(2, 1, unidadeIds, periodFilter);
    const deferidoGeralSmul: Record<string, number> = await this.countByUnidade(3, 1, unidadeIds, periodFilter);
    const indeferidosGeralSmul: Record<string, number> = await this.countByUnidade(4, 1, unidadeIds, periodFilter);
    const analiseGeralGrap: Record<string, number> = await this.countByUnidade(2, 2, unidadeIds, periodFilter);
    const deferidoGeralGrap: Record<string, number> = await this.countByUnidade(3, 2, unidadeIds, periodFilter);
    const indeferidosGeralGrap: Record<string, number> = await this.countByUnidade(4, 2, unidadeIds, periodFilter);

    const data_gerado: string = new Date().toISOString().split("T")[0].replaceAll("-", "/").split('/').reverse().join('/');

    return {
      "total": (analise + inadmissiveis + admissiveis),
      "analise": analise,
      "inadmissiveis": inadmissiveis,
      "admissiveis": admissiveis,
      "data_gerado": data_gerado,
      "em_analise": {
        "smul": {
          "quantidade": Object.values(analiseGeralSmul).reduce((a, b) => a + b, 0),
          "data": analiseGeralSmul
        },
        "graproem": {
          "quantidade": Object.values(analiseGeralGrap).reduce((a, b) => a + b, 0),
          "data": analiseGeralGrap
        },
        "total_parcial": (Object.values(analiseGeralSmul).reduce((a, b) => a + b, 0) + Object.values(analiseGeralGrap).reduce((a, b) => a + b, 0)) 
      },
      "deferidos": {
        "smul": {
          "quantidade": Object.values(deferidoGeralSmul).reduce((a, b) => a + b, 0),
          "data": deferidoGeralSmul
        },
        "graproem": {
          "quantidade": Object.values(deferidoGeralGrap).reduce((a, b) => a + b, 0),
          "data": deferidoGeralGrap
        },
        "total_parcial": (Object.values(deferidoGeralSmul).reduce((a, b) => a + b, 0) + Object.values(deferidoGeralGrap).reduce((a, b) => a + b, 0)) 
      },
      "indeferidos": {
        "smul": {
          "quantidade": Object.values(indeferidosGeralSmul).reduce((a, b) => a + b, 0),
          "data": indeferidosGeralSmul
        },
        "graproem": {
          "quantidade": Object.values(indeferidosGeralGrap).reduce((a, b) => a + b, 0),
          "data": indeferidosGeralGrap
        },
        "total_parcial": (Object.values(indeferidosGeralSmul).reduce((a, b) => a + b, 0) + Object.values(indeferidosGeralGrap).reduce((a, b) => a + b, 0)) 
      },
      "inadmissiveis_dados": await this.getData(2, true, periodFilter),
      "admissiveis_dados": await this.getData(0, null, periodFilter),
      "em_analise_dados": await this.getData(1, true, periodFilter),
      "deferidos_dados": await this.getData(3, false, periodFilter),
      "indeferidos_dados": await this.getData(4, false, periodFilter),
      "via_ordinaria_dados": await this.getData(5, false, periodFilter)
    };
  }
}
