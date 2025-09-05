import { Injectable } from '@nestjs/common';
import { Inicial, Unidade } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class RelatorioARService {
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
  ): Promise<{ sigla: string, quantidade: number }[]> {
    try {
      // Buscar iniciais com o status e tipo especificados, incluindo filtro requalifica_rapido = false
      const resultados = await this.prisma.inicial.findMany({
        where: {
          status,
          tipo_processo: tipo,
          requalifica_rapido: false, // Filtro para requalifica_rapido = 0
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

      // Inicializar o objeto com todas as unidades com valor 0
      const unidadesObjeto: Record<string, number> = {};
      unidades.forEach(unidade => {
        if (unidade.sigla) {
          unidadesObjeto[unidade.sigla] = 0;
        }
      });

      // Contar as ocorrências por unidade
      resultados.forEach(item => {
        const sigla = item.admissibilidade?.unidade?.sigla;
        if (sigla) {
          unidadesObjeto[sigla] = (unidadesObjeto[sigla] || 0) + 1;
        }
      });

      // Converter para array de objetos
      const lista = Object.entries(unidadesObjeto).map(([sigla, quantidade]) => ({ sigla, quantidade }));
      return lista;
    } catch (error) {
      console.error('Erro ao contar por inicial:', error);
      // Retornar todas as unidades com quantidade 0 em caso de erro
      return unidades
        .filter(unidade => unidade.sigla)
        .map(unidade => ({ sigla: unidade.sigla as string, quantidade: 0 }));
    }
  }

  // Função auxiliar para contagem total
  async countTotal(status: number, decisaoNull = false, periodFilter: { gte: Date, lte: Date }): Promise<number> {
    try {
      return await this.prisma.inicial.count({
        where: {
          status,
          requalifica_rapido: false, // Filtro para requalifica_rapido = 0
          criado_em: periodFilter,
          ...(decisaoNull
            ? { admissibilidade: { data_decisao_interlocutoria: null } }
            : { admissibilidade: { data_decisao_interlocutoria: periodFilter } }
          )
        }
      });
    } catch (error) {
      console.error('Erro ao contar total:', error);
      return 0;
    }
  }

  // Função para obter dados completos
  async getData(status: number, decisaoNull = false, periodFilter: { gte: Date, lte: Date }): Promise<any[]> {
    try {
      return await this.prisma.admissibilidade.findMany({
        where: {
          inicial: {
            status,
            requalifica_rapido: false // Filtro para requalifica_rapido = 0
          },
          criado_em: periodFilter,
          data_decisao_interlocutoria: decisaoNull ? null : periodFilter
        },
        include: { inicial: true }
      });
    } catch (error) {
      console.error('Erro ao buscar dados:', error);
      return [];
    }
  }

  // Função para verificar e validar as datas
  verificarData(mes?: string, ano?: string): { gte: Date, lte: Date } {
    if (!mes && !ano) {
      return {
        gte: new Date(0),
        lte: new Date(),
      };
    }

    if (!mes || !ano || isNaN(Number(mes)) || isNaN(Number(ano))) {
      throw new Error('Parâmetros de data inválidos');
    }

    const primeiroDia: Date = new Date(Number(ano), Number(mes) - 1, 1);
    const ultimoDia: Date = new Date(Number(ano), Number(mes), 0);
    const periodFilter: { gte: Date, lte: Date } = { gte: primeiroDia, lte: ultimoDia };
    return periodFilter;
  }

  async getRelatorio(mes?: string, ano?: string) {
    try {
      const periodFilter = this.verificarData(mes, ano);
      const unidades: Partial<Unidade>[] = await this.getUnidades();

      // Contagens por status da inicial: 0 = em análise de admissibilidade, 1 = inadmitido, 2 = em análise, 3 = deferido, 4 = indeferido
      const analise: number = await this.countTotal(2, false, periodFilter); // Status 2 = Em análise
      const inadmissiveis: number = await this.countTotal(1, false, periodFilter); // Status 1 = Inadmitido
      const admissiveis: number = await this.countTotal(0, false, periodFilter); // Status 0 = Em análise de admissibilidade

      // Dados por tipo e status - Em análise (status 2)
      const analiseGeralSmul: { sigla: string, quantidade: number }[] = await this.countByInicial(2, 1, unidades, periodFilter);
      const analiseGeralGrap: { sigla: string, quantidade: number }[] = await this.countByInicial(2, 2, unidades, periodFilter);

      // Dados por tipo e status - Deferidos (status 3)
      const deferidoGeralSmul: { sigla: string, quantidade: number }[] = await this.countByInicial(3, 1, unidades, periodFilter);
      const deferidoGeralGrap: { sigla: string, quantidade: number }[] = await this.countByInicial(3, 2, unidades, periodFilter);

      // Dados por tipo e status - Indeferidos (status 4)
      const indeferidosGeralSmul: { sigla: string, quantidade: number }[] = await this.countByInicial(4, 1, unidades, periodFilter);
      const indeferidosGeralGrap: { sigla: string, quantidade: number }[] = await this.countByInicial(4, 2, unidades, periodFilter);

      const data_gerado: string = new Date().toLocaleDateString('pt-BR');

      return {
        "total": (analise + inadmissiveis + admissiveis),
        "analise": analise,
        "inadmissiveis": inadmissiveis,
        "admissiveis": admissiveis,
        "data_gerado": data_gerado,
        "em_analise": {
          "smul": {
            "quantidade": analiseGeralSmul.reduce((a, b) => a + b.quantidade, 0),
            "data": analiseGeralSmul
          },
          "graproem": {
            "quantidade": analiseGeralGrap.reduce((a, b) => a + b.quantidade, 0),
            "data": analiseGeralGrap
          }
        },
        "deferidos": {
          "smul": {
            "quantidade": deferidoGeralSmul.reduce((a, b) => a + b.quantidade, 0),
            "data": deferidoGeralSmul
          },
          "graproem": {
            "quantidade": deferidoGeralGrap.reduce((a, b) => a + b.quantidade, 0),
            "data": deferidoGeralGrap
          }
        },
        "indeferidos": {
          "smul": {
            "quantidade": indeferidosGeralSmul.reduce((a, b) => a + b.quantidade, 0),
            "data": indeferidosGeralSmul
          },
          "graproem": {
            "quantidade": indeferidosGeralGrap.reduce((a, b) => a + b.quantidade, 0),
            "data": indeferidosGeralGrap
          }
        },
        "inadmissiveis_dados": await this.getData(1, false, periodFilter),
        "admissiveis_dados": await this.getData(0, false, periodFilter),
        "em_analise_dados": await this.getData(2, false, periodFilter)
      };
    } catch (error) {
      console.error('Erro ao gerar relatório:', error);
      throw new Error(`Erro ao gerar relatório: ${error.message}`);
    }
  }
}