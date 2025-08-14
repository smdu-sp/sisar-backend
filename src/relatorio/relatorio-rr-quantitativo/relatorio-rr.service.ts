import { Injectable } from '@nestjs/common';
import { Inicial, Unidade } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class RelatorioRRService {
  constructor(private prisma: PrismaService) { }

  async getUnidades(): Promise<Partial<Unidade>[]> {
    return await this.prisma.unidade.findMany({
      where: { status: 1 },
      select: { id: true, nome: true, sigla: true }
    });
  }

  // Função auxiliar para contagem e agrupamento
  async countByInicial(
    status: number, tipo: number, unidades: Partial<Unidade>[], periodFilter: { gte: Date, lte: Date }
  ): Promise<Record<string, number>> {

    // Buscar iniciais com o status e tipo especificados
    const resultados = await this.prisma.inicial.findMany({
      where: {
        status,
        tipo_processo: tipo,
        admissibilidade: {
          data_decisao_interlocutoria: periodFilter,
          unidade_id: { not: null }
        }
      },
      select: {
        admissibilidade: {
          select: {
            unidade: {
              select: { sigla: true }
            }
          }
        }
      }
    });

    console.log("resultados aqui", resultados)

    // Inicializar o objeto com todas as unidades com valor 0
    const lista: Record<string, number> = {};
    unidades.forEach(unidade => {
      lista[unidade.sigla] = 0;
    });

    console.log("lista aqui", lista)
    // Contar as ocorrências por unidade
    resultados.forEach(item => {
      if (item.admissibilidade?.unidade?.sigla) {
        const sigla = item.admissibilidade.unidade.sigla;
        lista[sigla] = (lista[sigla] || 0) + 1;
      }
    });

    console.log("lista pós foreach aqui", lista)

    return lista;
  };

  // Função auxiliar para contagem total
  async countTotal(status: number, decisaoNull = false, periodFilter: { gte: Date, lte: Date }): Promise<number> {
    return await this.prisma.inicial.count({
      where: {
        status,
        criado_em: periodFilter,
        ...(decisaoNull
          ? { admissibilidade: { data_decisao_interlocutoria: null } }
          : { admissibilidade: { data_decisao_interlocutoria: periodFilter } }
        )
      }
    });
  }

  // Função para obter dados completos
  async getData(status: number, decisaoNull = false, periodFilter: { gte: Date, lte: Date }): Promise<any[]> {
    return await this.prisma.admissibilidade.findMany({
      where: {
        inicial: { status },
        criado_em: periodFilter,
        data_decisao_interlocutoria: decisaoNull ? null : periodFilter
      },
      include: { inicial: true }
    });
  }

  async getRelatorio(mes: string, ano: string) {
    const primeiroDia: Date = new Date(Number(ano), Number(mes) - 1, 1);
    const ultimoDia: Date = new Date(Number(ano), Number(mes), 0);
    const unidades: Partial<Unidade>[] = await this.getUnidades();
    const periodFilter: { gte: Date, lte: Date } = { gte: primeiroDia, lte: ultimoDia };

    // Contagens por status da inicial: 0 = em análise de admissibilidade, 1 = inadmitido, 2 = em análise, 3 = deferido, 4 = indeferido
    const analise: number = await this.countTotal(2, false, periodFilter); // Status 2 = Em análise
    const inadmissiveis: number = await this.countTotal(1, false, periodFilter); // Status 1 = Inadmitido
    const admissiveis: number = await this.countTotal(0, false, periodFilter); // Status 0 = Em análise de admissibilidade

    // Dados por tipo e status - Em análise (status 2)
    const analiseGeralSmul: Record<string, number> = await this.countByInicial(2, 1, unidades, periodFilter);
    const analiseGeralGrap: Record<string, number> = await this.countByInicial(2, 2, unidades, periodFilter);

    // Dados por tipo e status - Deferidos (status 3)
    const deferidoGeralSmul: Record<string, number> = await this.countByInicial(3, 1, unidades, periodFilter);
    const deferidoGeralGrap: Record<string, number> = await this.countByInicial(3, 2, unidades, periodFilter);

    // Dados por tipo e status - Indeferidos (status 4)
    const indeferidosGeralSmul: Record<string, number> = await this.countByInicial(4, 1, unidades, periodFilter);
    const indeferidosGeralGrap: Record<string, number> = await this.countByInicial(4, 2, unidades, periodFilter);

    const data_gerado: string = new Date().toLocaleDateString('pt-BR');

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
        }
      },
      "deferidos": {
        "smul": {
          "quantidade": Object.values(deferidoGeralSmul).reduce((a, b) => a + b, 0),
          "data": deferidoGeralSmul
        },
        "graproem": {
          "quantidade": Object.values(deferidoGeralGrap).reduce((a, b) => a + b, 0),
          "data": deferidoGeralGrap
        }
      },
      "indeferidos": {
        "smul": {
          "quantidade": Object.values(indeferidosGeralSmul).reduce((a, b) => a + b, 0),
          "data": indeferidosGeralSmul
        },
        "graproem": {
          "quantidade": Object.values(indeferidosGeralGrap).reduce((a, b) => a + b, 0),
          "data": indeferidosGeralGrap
        }
      },
      "inadmissiveis_dados": await this.getData(1, false, periodFilter),
      "admissiveis_dados": await this.getData(0, false, periodFilter),
      "em_analise_dados": await this.getData(2, false, periodFilter)
    };
  }
}
