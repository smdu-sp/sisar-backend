import { Test, TestingModule } from '@nestjs/testing';
import { HttpException, HttpStatus } from '@nestjs/common';
import { RrPrazoAnaliseAdmissibilidadeService } from '../relatorio-rr-prazo-analise-admissibilidade';
import { PrismaService } from 'src/prisma/prisma.service';
import { ERROR_MESSAGES } from '../constants/error-messages';
import { PeriodFilterDto } from '../../relatorio-ar-quantitativo/dto/response-relatorio.dto';

// <CHANGE> Adicionando tipos auxiliares para resolver problemas de tipagem com lista
type MockInicial = {
  id: number;
  criado_em: Date;
  data_protocolo?: Date;
  requalifica_rapido?: boolean;
  data_requalificacao?: Date | null;
  suspensao_prazo?: number | null;
  suspensao_prazo_etapa_1?: number | null;
  suspensao_prazo_etapa_2?: number | null;
  motivos_suspensao?: string[];
  tempo_de_analise_admissibilidade?: number | null;
  tempo_de_analise_reconsideracao?: number | null;
};

describe('RrPrazoAnaliseAdmissibilidadeService', () => {
  let service: RrPrazoAnaliseAdmissibilidadeService;
  let prisma: PrismaService;

  const mockPrismaService = {
    inicial: {
      findMany: jest.fn(),
    },
    reconsideracao_Admissibilidade: {
      findUnique: jest.fn(),
    },
    suspensao_Prazo: {
      findMany: jest.fn(),
    },
    motivo_Inadmissao: {
      findUnique: jest.fn(),
    },
    admissibilidade: {
      findUnique: jest.fn(),
    },
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RrPrazoAnaliseAdmissibilidadeService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<RrPrazoAnaliseAdmissibilidadeService>(
      RrPrazoAnaliseAdmissibilidadeService,
    );
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('deve verificar se os services foram definidos', () => {
    expect(service).toBeDefined();
    expect(prisma).toBeDefined();
  });

  describe('getDataPorPeriodo', () => {
    const periodFilter: PeriodFilterDto = {
      gte: new Date('2024-01-01'),
      lte: new Date('2024-01-31'),
    };

    it('deve retornar iniciais por período', async () => {
      // <CHANGE> Usando tipo MockInicial para evitar erros de tipagem
      const mockIniciais: MockInicial[] = [
        {
          id: 1,
          data_protocolo: new Date('2024-01-15'),
          criado_em: new Date('2024-01-15'),
        },
        {
          id: 2,
          data_protocolo: new Date('2024-01-20'),
          criado_em: new Date('2024-01-20'),
        },
      ];

      mockPrismaService.inicial.findMany.mockResolvedValue(mockIniciais);

      const result = await service.getDataPorPeriodo(periodFilter);

      expect(result).toEqual(mockIniciais);
      expect(mockPrismaService.inicial.findMany).toHaveBeenCalledWith({
        where: {
          data_protocolo: {
            gte: periodFilter.gte,
            lte: periodFilter.lte,
          },
        },
      });
    });

    it('deve lançar HttpException ao falhar na busca de iniciais por período', async () => {
      const error = new Error('Database error');
      mockPrismaService.inicial.findMany.mockRejectedValue(error);

      await expect(service.getDataPorPeriodo(periodFilter)).rejects.toThrow(
        HttpException,
      );

      try {
        await service.getDataPorPeriodo(periodFilter);
      } catch (err) {
        expect(err).toBeInstanceOf(HttpException);
        if (err instanceof HttpException) {
          expect(err.getStatus()).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
          expect(err.getResponse()).toEqual({
            api_mensagem: ERROR_MESSAGES.FALHA_GET_INICIAIS_POR_PERIODO,
            tipo_erro: error.name,
            detalhe_tecnico: error.message,
          });
        }
      }
    });
  });

  describe('groupByDataYear', () => {
    const periodFilter: PeriodFilterDto = {
      gte: new Date('2023-01-01'),
      lte: new Date('2024-12-31'),
    };

    it('deve agrupar iniciais por ano corretamente', async () => {
      // <CHANGE> Usando tipo MockInicial para evitar erros de tipagem
      const lista: MockInicial[] = [
        { id: 1, criado_em: new Date('2023-06-15') },
        { id: 2, criado_em: new Date('2024-03-20') },
        { id: 3, criado_em: new Date('2024-09-10') },
      ];

      const result = await service.groupByDataYear(lista as any, periodFilter);

      expect(result).toEqual({
        2023: [lista[0]],
        2024: [lista[1], lista[2]],
      });
    });

    it('deve inicializar anos vazios quando não há dados', async () => {
      const result = await service.groupByDataYear([], periodFilter);

      expect(result).toEqual({
        2023: [],
        2024: [],
      });
    });

    it('deve lançar HttpException ao falhar no agrupamento por ano', async () => {
      // <CHANGE> Usando tipo MockInicial para evitar erros de tipagem
      const lista: MockInicial[] = [
        { id: 1, criado_em: new Date('2023-06-15') },
      ];

      await expect(
        service.groupByDataYear(lista as any, null as any),
      ).rejects.toThrow(HttpException);

      try {
        await service.groupByDataYear(lista as any, null as any);
      } catch (err) {
        expect(err).toBeInstanceOf(HttpException);
        if (err instanceof HttpException) {
          expect(err.getStatus()).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
          const response = err.getResponse() as Record<string, unknown>;
          expect(response).toHaveProperty('api_mensagem');
          expect(response.api_mensagem).toBe(
            ERROR_MESSAGES.FALHA_AGRUPAR_INICIAIS_POR_ANO,
          );
          expect(response).toHaveProperty('tipo_erro');
          expect(response).toHaveProperty('detalhe_tecnico');
        }
      }
    });
  });

  describe('groupByDataMonth', () => {
    const periodFilter: PeriodFilterDto = {
      gte: new Date('2024-01-01'),
      lte: new Date('2024-12-31'),
    };

    it('deve agrupar iniciais por mês corretamente', async () => {
      // <CHANGE> Usando tipo MockInicial para evitar erros de tipagem
      const relatorioAnual: Record<string, MockInicial[]> = {
        2024: [
          { id: 1, criado_em: new Date('2024-01-15') },
          { id: 2, criado_em: new Date('2024-03-20') },
        ],
      };

      const result = await service.groupByDataMonth(
        relatorioAnual as any,
        periodFilter,
      );

      expect(result).toHaveProperty('2024');
      expect(result['2024']).toHaveProperty('jan.');
      expect(result['2024']).toHaveProperty('mar.');
      expect(result['2024']['jan.']).toContainEqual(relatorioAnual['2024'][0]);
      expect(result['2024']['mar.']).toContainEqual(relatorioAnual['2024'][1]);
    });

    it('deve inicializar todos os meses vazios', async () => {
      const result = await service.groupByDataMonth(
        { 2024: [] },
        periodFilter,
      );

      expect(result['2024']).toHaveProperty('jan.');
      expect(result['2024']).toHaveProperty('fev.');
      expect(result['2024']).toHaveProperty('mar.');
      expect(result['2024']['jan.']).toEqual([]);
    });

    it('deve lançar HttpException ao falhar no agrupamento por mês', async () => {
      // <CHANGE> Usando tipo MockInicial para evitar erros de tipagem
      const relatorioAnual: Record<string, MockInicial[]> = {
        2024: [{ id: 1, criado_em: new Date('2024-01-15') }],
      };

      await expect(
        service.groupByDataMonth(relatorioAnual as any, null as any),
      ).rejects.toThrow(HttpException);

      try {
        await service.groupByDataMonth(relatorioAnual as any, null as any);
      } catch (err) {
        expect(err).toBeInstanceOf(HttpException);
        if (err instanceof HttpException) {
          expect(err.getStatus()).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
          const response = err.getResponse() as Record<string, unknown>;
          expect(response).toHaveProperty('api_mensagem');
          expect(response.api_mensagem).toBe(
            ERROR_MESSAGES.FALHA_AGRUPAR_INICIAIS_POR_MES,
          );
          expect(response).toHaveProperty('tipo_erro');
          expect(response).toHaveProperty('detalhe_tecnico');
        }
      }
    });
  });

  describe('includeReconsideracaoESuspensaoData', () => {
    beforeEach(() => {
      mockPrismaService.reconsideracao_Admissibilidade.findUnique.mockResolvedValue(
        null,
      );
      mockPrismaService.suspensao_Prazo.findMany.mockResolvedValue([]);
      mockPrismaService.motivo_Inadmissao.findUnique.mockResolvedValue(null);
    });

    it('deve incluir dados de reconsideração para processo de requalificação rápida', async () => {
      // <CHANGE> Usando tipo MockInicial para evitar erros de tipagem
      const lista: MockInicial[] = [
        { id: 1, requalifica_rapido: true, criado_em: new Date('2024-01-01') },
        {
          id: 2,
          requalifica_rapido: false,
          criado_em: new Date('2024-01-02'),
        },
      ];

      const reconsideracao = { publicacao: new Date('2024-01-15') };

      mockPrismaService.reconsideracao_Admissibilidade.findUnique
        .mockResolvedValueOnce(reconsideracao)
        .mockResolvedValueOnce(null);

      const result = await service.includeReconsideracaoESuspensaoData(
        lista as any,
      );

      expect(result[0].data_requalificacao).toEqual(reconsideracao.publicacao);
      expect(result[1].data_requalificacao).toBeNull();
    });

    it('deve calcular suspensão de prazo corretamente', async () => {
      // <CHANGE> Usando tipo MockInicial para evitar erros de tipagem
      const lista: MockInicial[] = [
        {
          id: 1,
          requalifica_rapido: false,
          criado_em: new Date('2024-01-01'),
        },
      ];

      const suspensoes = [
        {
          inicial_id: 1,
          inicio: new Date('2024-01-01'),
          final: new Date('2024-01-11'),
          etapa: 1,
          motivo: '1',
        },
        {
          inicial_id: 1,
          inicio: new Date('2024-01-15'),
          final: new Date('2024-01-20'),
          etapa: 2,
          motivo: '2',
        },
      ];

      const motivo = { descricao: 'Motivo teste' };

      mockPrismaService.suspensao_Prazo.findMany.mockResolvedValue(suspensoes);
      mockPrismaService.motivo_Inadmissao.findUnique.mockResolvedValue(motivo);

      const result = await service.includeReconsideracaoESuspensaoData(
        lista as any,
      );

      expect(result[0].suspensao_prazo).toBe(15);
      expect(result[0].suspensao_prazo_etapa_1).toBe(10);
      expect(result[0].suspensao_prazo_etapa_2).toBe(5);
      expect(result[0].motivos_suspensao).toEqual([
        'Motivo teste',
        'Motivo teste',
      ]);
    });

    it('deve definir suspensão como null quando não há suspensões', async () => {
      // <CHANGE> Usando tipo MockInicial para evitar erros de tipagem
      const lista: MockInicial[] = [
        {
          id: 1,
          requalifica_rapido: false,
          criado_em: new Date('2024-01-01'),
        },
      ];

      mockPrismaService.suspensao_Prazo.findMany.mockResolvedValue([]);

      const result = await service.includeReconsideracaoESuspensaoData(
        lista as any,
      );

      expect(result[0].suspensao_prazo).toBeNull();
      expect(result[0].suspensao_prazo_etapa_1).toBeNull();
      expect(result[0].suspensao_prazo_etapa_2).toBeNull();
    });

    it('deve lançar HttpException ao falhar na inclusão de dados de suspensão', async () => {
      // <CHANGE> Usando tipo MockInicial para evitar erros de tipagem
      const lista: MockInicial[] = [
        {
          id: 1,
          requalifica_rapido: false,
          criado_em: new Date('2024-01-01'),
        },
      ];

      const error = new Error('Suspensão error');
      mockPrismaService.reconsideracao_Admissibilidade.findUnique.mockRejectedValue(
        error,
      );

      await expect(
        service.includeReconsideracaoESuspensaoData(lista as any),
      ).rejects.toThrow(HttpException);

      try {
        await service.includeReconsideracaoESuspensaoData(lista as any);
      } catch (err) {
        expect(err).toBeInstanceOf(HttpException);
        if (err instanceof HttpException) {
          expect(err.getStatus()).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
          expect(err.getResponse()).toEqual({
            api_mensagem:
              ERROR_MESSAGES.FALHA_INCLUIR_SUSPENSAO_RECONSIDERACAO,
            tipo_erro: error.name,
            detalhe_tecnico: error.message,
          });
        }
      }
    });
  });

  describe('includePrazoDeAdmissibilidade', () => {
    beforeEach(() => {
      mockPrismaService.admissibilidade.findUnique.mockResolvedValue(null);
      mockPrismaService.reconsideracao_Admissibilidade.findUnique.mockResolvedValue(
        null,
      );
    });

    it('deve calcular tempo de análise para processo normal', async () => {
      // <CHANGE> Usando tipo MockInicial para evitar erros de tipagem
      const lista: MockInicial[] = [
        {
          id: 1,
          requalifica_rapido: false,
          criado_em: new Date('2024-01-01'),
        },
      ];

      const admissibilidade = {
        data_envio: new Date('2024-01-01'),
        data_decisao_interlocutoria: new Date('2024-01-11'),
      };

      mockPrismaService.admissibilidade.findUnique.mockResolvedValue(
        admissibilidade,
      );

      const result = await service.includePrazoDeAdmissibilidade(lista as any);

      expect(result[0].tempo_de_analise_admissibilidade).toBe(10);
      expect(result[0].tempo_de_analise_reconsideracao).toBeNull();
    });

    it('deve calcular tempo de análise para reconsideração', async () => {
      // <CHANGE> Usando tipo MockInicial para evitar erros de tipagem
      const lista: MockInicial[] = [
        { id: 2, requalifica_rapido: true, criado_em: new Date('2024-01-01') },
      ];

      const admissibilidade = {
        data_envio: new Date('2024-01-01'),
        data_decisao_interlocutoria: new Date('2024-01-05'),
      };

      const reconsideracao = {
        publicacao: new Date('2024-01-01'),
        pedido_reconsideracao: new Date('2024-01-06'),
        parecer: 'Aprovado',
      };

      mockPrismaService.admissibilidade.findUnique.mockResolvedValue(
        admissibilidade,
      );
      mockPrismaService.reconsideracao_Admissibilidade.findUnique.mockResolvedValue(
        reconsideracao,
      );

      const result = await service.includePrazoDeAdmissibilidade(lista as any);

      expect(result[0].tempo_de_analise_reconsideracao).toBe(5);
      expect(result[0].tempo_de_analise_admissibilidade).toBeNull();
    });

    it('deve retornar 1 dia quando tempo de análise é menor que 1', async () => {
      // <CHANGE> Usando tipo MockInicial para evitar erros de tipagem
      const lista: MockInicial[] = [
        {
          id: 1,
          requalifica_rapido: false,
          criado_em: new Date('2024-01-01'),
        },
      ];

      const admissibilidade = {
        data_envio: new Date('2024-01-01T10:00:00'),
        data_decisao_interlocutoria: new Date('2024-01-01T14:00:00'),
      };

      mockPrismaService.admissibilidade.findUnique.mockResolvedValue(
        admissibilidade,
      );

      const result = await service.includePrazoDeAdmissibilidade(lista as any);

      expect(result[0].tempo_de_analise_admissibilidade).toBe(1);
    });

    it('deve definir tempos como null quando não encontra admissibilidade', async () => {
      // <CHANGE> Usando tipo MockInicial para evitar erros de tipagem
      const lista: MockInicial[] = [
        {
          id: 1,
          requalifica_rapido: false,
          criado_em: new Date('2024-01-01'),
        },
      ];

      mockPrismaService.admissibilidade.findUnique.mockResolvedValue(null);

      const result = await service.includePrazoDeAdmissibilidade(lista as any);

      expect(result[0].tempo_de_analise_admissibilidade).toBeNull();
      expect(result[0].tempo_de_analise_reconsideracao).toBeNull();
    });

    it('deve lançar HttpException ao falhar na inclusão de prazo de admissibilidade', async () => {
      // <CHANGE> Usando tipo MockInicial para evitar erros de tipagem
      const lista: MockInicial[] = [
        {
          id: 1,
          requalifica_rapido: false,
          criado_em: new Date('2024-01-01'),
        },
      ];

      const error = new Error('Prazo error');
      mockPrismaService.admissibilidade.findUnique.mockRejectedValue(error);

      await expect(
        service.includePrazoDeAdmissibilidade(lista as any),
      ).rejects.toThrow(HttpException);

      try {
        await service.includePrazoDeAdmissibilidade(lista as any);
      } catch (err) {
        expect(err).toBeInstanceOf(HttpException);
        if (err instanceof HttpException) {
          expect(err.getStatus()).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
          expect(err.getResponse()).toEqual({
            api_mensagem: ERROR_MESSAGES.FALHA_INCLUIR_TEMPO_ANALISE,
            tipo_erro: error.name,
            detalhe_tecnico: error.message,
          });
        }
      }
    });
  });

  describe('getPrazoAnaliseAdmissibilidade', () => {
    beforeEach(() => {
      jest.spyOn(service, 'getDataPorPeriodo').mockResolvedValue([]);
      jest
        .spyOn(service, 'includeReconsideracaoESuspensaoData')
        .mockResolvedValue([]);
      jest
        .spyOn(service, 'includePrazoDeAdmissibilidade')
        .mockResolvedValue([]);
      jest.spyOn(service, 'groupByDataYear').mockResolvedValue({});
      jest.spyOn(service, 'groupByDataMonth').mockResolvedValue({});
    });

    it('deve executar todo o fluxo de geração do relatório corretamente', async () => {
      // <CHANGE> Usando tipo MockInicial para evitar erros de tipagem
      const data: MockInicial[] = [
        { id: 1, criado_em: new Date('2024-01-15') },
      ];
      const dataIncremented: MockInicial[] = [
        { id: 1, suspensao_prazo: 5, criado_em: new Date('2024-01-15') },
      ];
      const dataWithTimes: MockInicial[] = [
        {
          id: 1,
          tempo_de_analise_admissibilidade: 10,
          criado_em: new Date('2024-01-15'),
        },
      ];
      const yearlyData = { 2024: dataWithTimes };
      const monthlyData = { 2024: { 'jan.': dataWithTimes } };

      jest.spyOn(service, 'getDataPorPeriodo').mockResolvedValue(data as any);
      jest
        .spyOn(service, 'includeReconsideracaoESuspensaoData')
        .mockResolvedValue(dataIncremented as any);
      jest
        .spyOn(service, 'includePrazoDeAdmissibilidade')
        .mockResolvedValue(dataWithTimes as any);
      jest
        .spyOn(service, 'groupByDataYear')
        .mockResolvedValue(yearlyData as any);
      jest
        .spyOn(service, 'groupByDataMonth')
        .mockResolvedValue(monthlyData as any);

      const result = await service.getPrazoAnaliseAdmissibilidade(
        '2024-01-01',
        '2024-01-31',
      );

      expect(result).toEqual(monthlyData);
      expect(service.getDataPorPeriodo).toHaveBeenCalledWith({
        gte: new Date('2024-01-01'),
        lte: new Date('2024-01-31'),
      });
      expect(service.includeReconsideracaoESuspensaoData).toHaveBeenCalledWith(
        data,
      );
      expect(service.includePrazoDeAdmissibilidade).toHaveBeenCalledWith(
        dataIncremented,
      );
      expect(service.groupByDataYear).toHaveBeenCalledWith(dataWithTimes, {
        gte: new Date('2024-01-01'),
        lte: new Date('2024-01-31'),
      });
      expect(service.groupByDataMonth).toHaveBeenCalledWith(yearlyData, {
        gte: new Date('2024-01-01'),
        lte: new Date('2024-01-31'),
      });
    });

    it('deve chamar métodos na sequência correta', async () => {
      const callOrder: string[] = [];

      jest
        .spyOn(service, 'getDataPorPeriodo')
        .mockImplementation(async () => {
          callOrder.push('getDataPorPeriodo');
          return [] as any;
        });

      jest
        .spyOn(service, 'includeReconsideracaoESuspensaoData')
        .mockImplementation(async () => {
          callOrder.push('includeReconsideracaoESuspensaoData');
          return [] as any;
        });

      jest
        .spyOn(service, 'includePrazoDeAdmissibilidade')
        .mockImplementation(async () => {
          callOrder.push('includePrazoDeAdmissibilidade');
          return [] as any;
        });

      jest.spyOn(service, 'groupByDataYear').mockImplementation(async () => {
        callOrder.push('groupByDataYear');
        return {} as any;
      });

      jest.spyOn(service, 'groupByDataMonth').mockImplementation(async () => {
        callOrder.push('groupByDataMonth');
        return {} as any;
      });

      await service.getPrazoAnaliseAdmissibilidade(
        '2024-01-01',
        '2024-01-31',
      );

      expect(callOrder).toEqual([
        'getDataPorPeriodo',
        'includeReconsideracaoESuspensaoData',
        'includePrazoDeAdmissibilidade',
        'groupByDataYear',
        'groupByDataMonth',
      ]);
    });

    it('deve propagar erros dos métodos internos', async () => {
      const error = new Error('Internal method error');
      jest.spyOn(service, 'getDataPorPeriodo').mockRejectedValue(error);

      await expect(
        service.getPrazoAnaliseAdmissibilidade('2024-01-01', '2024-01-31'),
      ).rejects.toThrow(error);
    });
  });

  describe('Error Handling', () => {
    it('deve lançar HttpException com estrutura correta de erro', async () => {
      const periodFilter: PeriodFilterDto = {
        gte: new Date('2024-01-01'),
        lte: new Date('2024-01-31'),
      };

      mockPrismaService.inicial.findMany.mockRejectedValue(
        new Error('Database connection failed'),
      );

      try {
        await service.getDataPorPeriodo(periodFilter);
      } catch (error) {
        expect(error).toBeInstanceOf(HttpException);
        if (error instanceof HttpException) {
          expect(error.getStatus()).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
          const response = error.getResponse() as Record<string, unknown>;
          expect(response).toHaveProperty('api_mensagem');
          expect(response).toHaveProperty('tipo_erro');
          expect(response).toHaveProperty('detalhe_tecnico');
        }
      }
    });
  });
});