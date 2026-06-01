import { Injectable } from '@nestjs/common';
import { Admissibilidade, Inicial, Unidade } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { PeriodFilterDto } from './dto/response-relatorio.dto';

@Injectable()
export class RelatorioService {
  constructor(private prisma: PrismaService) { }

  async getUnidades(): Promise<Partial<Unidade>[]> {
    return await this.prisma.unidade.findMany({
      where: { status: 1 },
      select: { id: true, nome: true },
    });
  }

  // Função auxiliar para contagem e agrupamento
  async countByUnidade(
    status: number,
    periodFilter: PeriodFilterDto,
    unidadeId: string | null,
    tipo_processo?: number,
  ): Promise<Record<string, number>> {
    let resultados: { unidade: { nome: string; id: string } }[];

    if (!periodFilter) {

      periodFilter = {
        gte: new Date("1970-01-01T00:00:00.000Z"),
        lte: new Date(),
      };
    }

    if (tipo_processo === 1 || tipo_processo === 2) {
      const unidadeNome = tipo_processo === 1 ? "SMUL" : "GRAPROEM";

      const processos = await this.prisma.admissibilidade.count({
        where: {
          inicial: {
            status,
            tipo_processo,
          },
          data_decisao_interlocutoria: periodFilter,
        },
      });

      return { [unidadeNome]: processos };
    } else {
      if (!unidadeId) return {};
      resultados = await this.prisma.admissibilidade.findMany({
        where: {
          inicial: {
            status,
            tipo_processo: { in: [1, 2] },
          },
          data_decisao_interlocutoria: periodFilter,
          unidade_id: unidadeId,
        },
        select: { unidade: { select: { nome: true, id: true } } },
      });

      return resultados.reduce(
        (acc, item): Record<string, number> => {
          const nome: string = item.unidade.nome;
          acc[nome] = (acc[nome] || 0) + 1;
          return acc;
        },
        {} as Record<string, number>,
      );
    }
  }


  //buscar ID específico de uma unidade
  async getIdByUnidade(sigla: string): Promise<string | null> {
    const unidade = await this.prisma.unidade.findUnique({
      where: {
        sigla
      }
    })
    return unidade?.id ?? null
  }

  // Função auxiliar para contagem total
  async countTotal(
    status: number,
    decisaoNull = false,
    periodFilter: PeriodFilterDto,
  ): Promise<number> {
    return await this.prisma.admissibilidade.count({
      where: {
        status,
        criado_em: periodFilter,
        data_decisao_interlocutoria: decisaoNull ? null : periodFilter,
      },
    });
  }

  // Função para obter dados completos
  async getData(
    status: number,
    decisaoNull = false,
    periodFilter: { gte: Date; lte: Date },
  ): Promise<Admissibilidade[]> {
    return await this.prisma.admissibilidade.findMany({
      where: {
        status,
        criado_em: periodFilter,
        data_decisao_interlocutoria: decisaoNull ? null : periodFilter,
      },
      include: { inicial: true },
    });
  }

  // Função para obter dados completos de iniciais
  async getInicialData(
    status: number,
    periodFilter: { gte: Date; lte: Date },
  ): Promise<Inicial[]> {
    return await this.prisma.inicial.findMany({
      where: {
        status,
        criado_em: periodFilter,
      },
    });
  }

  verificarData(mes: string, ano: string): PeriodFilterDto {
    if (!mes && !ano) {
      return {
        gte: new Date(0),
        lte: new Date(),
      };
    }
    const primeiroDia: Date = new Date(Number(ano), Number(mes) - 1, 1);
    const ultimoDia: Date = new Date(Number(ano), Number(mes), 0);
    const periodFilter: PeriodFilterDto = { gte: primeiroDia, lte: ultimoDia };
    return periodFilter

  }

  async getRelatorio(mes: string, ano: string) {
    const periodFilter: PeriodFilterDto = this.verificarData(mes, ano)

    // Contagens
    const analise: number = (await this.getInicialData(0, periodFilter)).length;
    const inadmissiveis: number = (await this.getInicialData(1, periodFilter))
      .length;
    const admissiveis: number = (await this.getInicialData(2, periodFilter))
      .length;

    // Dados por tipo e status
    const analiseGeralSmul: Record<string, number> =
      await this.countByUnidade(
        2,
        periodFilter,
        null,
        1,
      );
    const deferidoGeralSmul: Record<string, number> =
      await this.countByUnidade(
        3,
        periodFilter,
        null,
        1,
      );
    const indeferidosGeralSmul: Record<string, number> =
      await this.countByUnidade(
        4,
        periodFilter,
        null,
        1,
      );
    const analiseGeralGrap: Record<string, number> =
      await this.countByUnidade(
        2,
        periodFilter,
        null,
        2,
      );
    const deferidoGeralGrap: Record<string, number> =
      await this.countByUnidade(
        3,
        periodFilter,
        null,
        2,
      );
    const indeferidosGeralGrap: Record<string, number> =
      await this.countByUnidade(
        4,
        periodFilter,
        null,
        2,
      );
    const analiseGeralParhis: Record<string, number> =
      await this.countByUnidade(
        2,
        periodFilter,
        await this.getIdByUnidade("PARHIS"),
      );

    const deferidoGeralParhis: Record<string, number> =
      await this.countByUnidade(
        3,
        periodFilter,
        await this.getIdByUnidade("PARHIS"),
      );
    const indeferidosGeralParhis: Record<string, number> =
      await this.countByUnidade(
        4,
        periodFilter,
        await this.getIdByUnidade("PARHIS"),
      );

    const analiseGeralResid: Record<string, number> =
      await this.countByUnidade(
        2,
        periodFilter,
        await this.getIdByUnidade("RESID"),
      );
    const deferidoGeralResid: Record<string, number> =
      await this.countByUnidade(
        3,
        periodFilter,
        await this.getIdByUnidade("RESID"),
      );
    const indeferidosGeralResid: Record<string, number> =
      await this.countByUnidade(
        4,
        periodFilter,
        await this.getIdByUnidade("RESID"),
      );

    const analiseGeralServin: Record<string, number> =
      await this.countByUnidade(
        2,
        periodFilter,
        await this.getIdByUnidade("SERVIN"),
      );
    const deferidoGeralServin: Record<string, number> =
      await this.countByUnidade(
        3,
        periodFilter,
        await this.getIdByUnidade("SERVIN"),
      );
    const indeferidosGeralServin: Record<string, number> =
      await this.countByUnidade(
        4,
        periodFilter,
        await this.getIdByUnidade("SERVIN"),
      );

    const analiseGeralComin: Record<string, number> =
      await this.countByUnidade(
        2,
        periodFilter,
        await this.getIdByUnidade("COMIN"),
      );
    const deferidoGeralComin: Record<string, number> =
      await this.countByUnidade(
        3,
        periodFilter,
        await this.getIdByUnidade("COMIN"),
      );
    const indeferidosGeralComin: Record<string, number> =
      await this.countByUnidade(
        4,
        periodFilter,
        await this.getIdByUnidade("COMIN"),
      );

    const analiseGeralCaepp: Record<string, number> =
      await this.countByUnidade(
        2,
        periodFilter,
        await this.getIdByUnidade("CAEPP"),
      );
    const deferidoGeralCaepp: Record<string, number> =
      await this.countByUnidade(
        3,
        periodFilter,
        await this.getIdByUnidade("CAEPP"),
      );
    const indeferidosGeralCaepp: Record<string, number> =
      await this.countByUnidade(
        4,
        periodFilter,
        await this.getIdByUnidade("CAEPP"),
      );

    const data_gerado: string = new Date()
      .toISOString()
      .split('T')[0]
      .replaceAll('-', '/')
      .split('/')
      .reverse()
      .join('/');

    return {
      total: analise + inadmissiveis + admissiveis,
      analise: analise,
      inadmissiveis: inadmissiveis,
      admissiveis: admissiveis,
      data_gerado: data_gerado,
      em_analise: {
        smul: {
          quantidade: Object.values(analiseGeralSmul).reduce(
            (a, b) => a + b,
            0,
          ),
          data: analiseGeralSmul,
        },
        graproem: {
          quantidade: Object.values(analiseGeralGrap).reduce(
            (a, b) => a + b,
            0,
          ),
          data: analiseGeralGrap,
        },
        parhis: {
          quantidade: Object.values(analiseGeralParhis).reduce(
            (a, b) => a + b,
            0,
          ),
          data: analiseGeralParhis,
        },
        servin: {
          quantidade: Object.values(analiseGeralServin).reduce(
            (a, b) => a + b,
            0,
          ),
          data: analiseGeralServin,
        },
        comin: {
          quantidade: Object.values(analiseGeralComin).reduce(
            (a, b) => a + b,
            0,
          ),
          data: analiseGeralComin,
        },
        caepp: {
          quantidade: Object.values(analiseGeralCaepp).reduce(
            (a, b) => a + b,
            0,
          ),
          data: analiseGeralCaepp,
        },
        resid: {
          quantidade: Object.values(analiseGeralResid).reduce(
            (a, b) => a + b,
            0,
          ),
          data: analiseGeralResid,
        },
        total_parcial:
          Object.values(analiseGeralSmul).reduce((a, b) => a + b, 0) +
          Object.values(analiseGeralGrap).reduce((a, b) => a + b, 0) +
          Object.values(analiseGeralResid).reduce((a, b) => a + b, 0),
      },
      deferidos: {
        smul: {
          quantidade: Object.values(deferidoGeralSmul).reduce(
            (a, b) => a + b,
            0,
          ),
          data: deferidoGeralSmul,
        },
        graproem: {
          quantidade: Object.values(deferidoGeralGrap).reduce(
            (a, b) => a + b,
            0,
          ),
          data: deferidoGeralGrap,
        },
        parhis: {
          quantidade: Object.values(deferidoGeralParhis).reduce(
            (a, b) => a + b,
            0,
          ),
          data: deferidoGeralParhis,
        },
        servin: {
          quantidade: Object.values(deferidoGeralServin).reduce(
            (a, b) => a + b,
            0,
          ),
          data: deferidoGeralServin,
        },
        comin: {
          quantidade: Object.values(deferidoGeralComin).reduce(
            (a, b) => a + b,
            0,
          ),
          data: deferidoGeralComin,
        },
        caepp: {
          quantidade: Object.values(deferidoGeralCaepp).reduce(
            (a, b) => a + b,
            0,
          ),
          data: deferidoGeralCaepp,
        },
        resid: {
          quantidade: Object.values(deferidoGeralResid).reduce(
            (a, b) => a + b,
            0,
          ),
          data: deferidoGeralResid,
        },
        total_parcial:
          Object.values(deferidoGeralSmul).reduce((a, b) => a + b, 0) +
          Object.values(deferidoGeralGrap).reduce((a, b) => a + b, 0) +
          Object.values(deferidoGeralResid).reduce((a, b) => a + b, 0),
      },
      indeferidos: {
        smul: {
          quantidade: Object.values(indeferidosGeralSmul).reduce(
            (a, b) => a + b,
            0,
          ),
          data: indeferidosGeralSmul,
        },
        graproem: {
          quantidade: Object.values(indeferidosGeralGrap).reduce(
            (a, b) => a + b,
            0,
          ),
          data: indeferidosGeralGrap,
        },
        parhis: {
          quantidade: Object.values(indeferidosGeralParhis).reduce(
            (a, b) => a + b,
            0,
          ),
          data: indeferidosGeralParhis,
        },
        servin: {
          quantidade: Object.values(indeferidosGeralServin).reduce(
            (a, b) => a + b,
            0,
          ),
          data: indeferidosGeralServin,
        },
        comin: {
          quantidade: Object.values(indeferidosGeralComin).reduce(
            (a, b) => a + b,
            0,
          ),
          data: indeferidosGeralComin,
        },
        caepp: {
          quantidade: Object.values(indeferidosGeralCaepp).reduce(
            (a, b) => a + b,
            0,
          ),
          data: indeferidosGeralCaepp,
        },
        resid: {
          quantidade: Object.values(indeferidosGeralResid).reduce(
            (a, b) => a + b,
            0,
          ),
          data: indeferidosGeralResid,
        },
        total_parcial:
          Object.values(indeferidosGeralSmul).reduce((a, b) => a + b, 0) +
          Object.values(indeferidosGeralGrap).reduce((a, b) => a + b, 0) +
          Object.values(indeferidosGeralResid).reduce((a, b) => a + b, 0),
      },
      analise_admissiveis_dados: await this.getInicialData(0, periodFilter),
      inadmissiveis_dados: await this.getInicialData(1, periodFilter),
      em_analise_dados: await this.getInicialData(2, periodFilter),
      deferidos_dados: await this.getInicialData(3, periodFilter),
      indeferidos_dados: await this.getInicialData(4, periodFilter),
      via_ordinaria_dados: await this.getInicialData(5, periodFilter),
    };
  }
}