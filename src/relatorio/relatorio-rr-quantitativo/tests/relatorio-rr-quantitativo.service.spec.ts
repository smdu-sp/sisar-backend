import { RelatorioRRService } from "../relatorio-rr.service";
import { PrismaService } from "src/prisma/prisma.service";
import { Test, TestingModule } from "@nestjs/testing";
import { Unidade } from "@prisma/client";
import { HttpException, HttpStatus } from "@nestjs/common";
import { ERROR_MESSAGES } from "../constants/error-messages";

describe('RelatorioRRService', () => {
  let service: RelatorioRRService;
  let prisma: PrismaService;

  const MockPrismaService = {
    unidade: {
      findMany: jest.fn(),
    },
    inicial: {
      findMany: jest.fn(),
      count: jest.fn(),
    },
    admissibilidade: {
      findMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RelatorioRRService,
        {
          provide: PrismaService,
          useValue: MockPrismaService,
        },
      ],
    }).compile();
    service = module.get<RelatorioRRService>(RelatorioRRService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('deve verificar se os services foram definidos', () => {
    expect(service).toBeDefined();
    expect(prisma).toBeDefined();
  });

  describe('getUnidades', () => {
    it('deve retornar unidades ativas', async () => {
      const mockUnidades = [
        { id: 1, nome: 'Unidade 1', sigla: 'U1' },
        { id: 2, nome: 'Unidade 2', sigla: 'U2' },
      ];
      (prisma.unidade.findMany as jest.Mock).mockResolvedValue(mockUnidades);
      
      const result = await service.getUnidades();
      
      expect(result).toEqual(mockUnidades);
      expect(prisma.unidade.findMany).toHaveBeenCalledWith({
        where: { status: 1 },
        select: { id: true, nome: true, sigla: true },
      });
    });

    it('deve lançar HttpException ao falhar na busca de unidades', async () => {
      const mockError = new Error('DB error');
      (prisma.unidade.findMany as jest.Mock).mockRejectedValue(mockError);
      
      await expect(service.getUnidades()).rejects.toThrow(HttpException);
      
      try {
        await service.getUnidades();
      } catch (error) {
        expect(error).toBeInstanceOf(HttpException);
        expect(error.getStatus()).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
        expect(error.getResponse()).toEqual({
          api_mensagem: ERROR_MESSAGES.FALHA_BUSCAR_UNIDADES,
          tipo_erro: mockError.name,
          detalhe_tecnico: mockError.message,
        });
      }
    });
  });

  describe('countByUnidade', () => {
    const mockUnidades = [
      { sigla: 'U1' },
      { sigla: 'U2' },
    ];
    const periodFilter = { gte: new Date('2024-01-01'), lte: new Date('2024-01-31') };

    it('deve contar processos por unidade corretamente', async () => {
      const resultados = [
        { admissibilidade: { unidade: { sigla: 'U1' } } },
        { admissibilidade: { unidade: { sigla: 'U1' } } },
        { admissibilidade: { unidade: { sigla: 'U2' } } },
      ];
      (prisma.inicial.findMany as jest.Mock).mockResolvedValue(resultados);
      
      const result = await service.countByUnidade(2, 1, mockUnidades, periodFilter);
      
      expect(result).toEqual({ U1: 2, U2: 1 });
      expect(prisma.inicial.findMany).toHaveBeenCalledWith({
        where: {
          status: 2,
          tipo_processo: 1,
          requalifica_rapido: true,
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
    });

    it('deve inicializar todas as unidades com valor 0', async () => {
      (prisma.inicial.findMany as jest.Mock).mockResolvedValue([]);
      
      const result = await service.countByUnidade(2, 1, mockUnidades, periodFilter);
      
      expect(result).toEqual({ U1: 0, U2: 0 });
    });

    it('deve lançar erro quando não há unidades', async () => {
      (prisma.inicial.findMany as jest.Mock).mockResolvedValue([]);
      
      await expect(service.countByUnidade(2, 1, [], periodFilter)).rejects.toThrow(HttpException);
    });

    it('deve lançar HttpException ao falhar na contagem por unidade', async () => {
      const mockError = new Error('DB error');
      (prisma.inicial.findMany as jest.Mock).mockRejectedValue(mockError);
      
      await expect(service.countByUnidade(2, 1, mockUnidades, periodFilter)).rejects.toThrow(HttpException);
      
      try {
        await service.countByUnidade(2, 1, mockUnidades, periodFilter);
      } catch (error) {
        expect(error).toBeInstanceOf(HttpException);
        expect(error.getStatus()).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
        expect(error.getResponse()).toEqual({
          api_mensagem: ERROR_MESSAGES.FALHA_CONTAR_UNIDADES_POR_UNIDADE,
          tipo_erro: mockError.name,
          detalhe_tecnico: mockError.message,
        });
      }
    });
  });

  describe('countTotal', () => {
    const periodFilter = { gte: new Date('2024-01-01'), lte: new Date('2024-01-31') };

    it('deve contar total de processos com decisaoNull false', async () => {
      (prisma.inicial.count as jest.Mock).mockResolvedValue(5);
      
      const result = await service.countTotal(2, false, periodFilter);
      
      expect(result).toBe(5);
      expect(prisma.inicial.count).toHaveBeenCalledWith({
        where: {
          status: 2,
          criado_em: periodFilter,
          admissibilidade: { data_decisao_interlocutoria: periodFilter },
        }
      });
    });

    it('deve contar total de processos com decisaoNull true', async () => {
      (prisma.inicial.count as jest.Mock).mockResolvedValue(3);
      
      const result = await service.countTotal(2, true, periodFilter);
      
      expect(result).toBe(3);
      expect(prisma.inicial.count).toHaveBeenCalledWith({
        where: {
          status: 2,
          criado_em: periodFilter,
          admissibilidade: { data_decisao_interlocutoria: null },
        }
      });
    });

    it('deve lançar HttpException ao falhar na contagem total', async () => {
      const mockError = new Error('Erro count');
      (prisma.inicial.count as jest.Mock).mockRejectedValue(mockError);
      
      await expect(service.countTotal(2, false, periodFilter)).rejects.toThrow(HttpException);
      
      try {
        await service.countTotal(2, false, periodFilter);
      } catch (error) {
        expect(error).toBeInstanceOf(HttpException);
        expect(error.getStatus()).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
        expect(error.getResponse()).toEqual({
          api_mensagem: ERROR_MESSAGES.FALHA_CONTAR_TOTAL_INICIAIS,
          tipo_erro: mockError.name,
          detalhe_tecnico: mockError.message,
        });
      }
    });
  });

  describe('getData', () => {
    const periodFilter = { gte: new Date('2024-01-01'), lte: new Date('2024-01-31') };

    it('deve retornar dados completos com decisaoNull false', async () => {
      const mockData = [{ id: 1, inicial: { id: 1 } }];
      (prisma.admissibilidade.findMany as jest.Mock).mockResolvedValue(mockData);
      
      const result = await service.getData(2, false, periodFilter);
      
      expect(result).toEqual(mockData);
      expect(prisma.admissibilidade.findMany).toHaveBeenCalledWith({
        where: {
          inicial: { status: 2 },
          criado_em: periodFilter,
          data_decisao_interlocutoria: periodFilter,
        },
        include: { inicial: true },
      });
    });

    it('deve retornar dados completos com decisaoNull true', async () => {
      const mockData = [{ id: 1, inicial: { id: 1 } }];
      (prisma.admissibilidade.findMany as jest.Mock).mockResolvedValue(mockData);
      
      const result = await service.getData(2, true, periodFilter);
      
      expect(result).toEqual(mockData);
      expect(prisma.admissibilidade.findMany).toHaveBeenCalledWith({
        where: {
          inicial: { status: 2 },
          criado_em: periodFilter,
          data_decisao_interlocutoria: null,
        },
        include: { inicial: true },
      });
    });

    it('deve lançar HttpException ao falhar na busca de dados', async () => {
      const mockError = new Error('Erro getData');
      (prisma.admissibilidade.findMany as jest.Mock).mockRejectedValue(mockError);
      
      await expect(service.getData(2, false, periodFilter)).rejects.toThrow(HttpException);
      
      try {
        await service.getData(2, false, periodFilter);
      } catch (error) {
        expect(error).toBeInstanceOf(HttpException);
        expect(error.getStatus()).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
        expect(error.getResponse()).toEqual({
          api_mensagem: ERROR_MESSAGES.FALHA_GET_ADMISSIBILIDADES,
          tipo_erro: mockError.name,
          detalhe_tecnico: mockError.message,
        });
      }
    });
  });

  describe('getRelatorio', () => {
    const mockUnidades = [{ sigla: 'U1' }, { sigla: 'U2' }];
    const mockCountData = { U1: 1, U2: 2 };

    beforeEach(() => {
      jest.spyOn(service, 'getUnidades').mockResolvedValue(mockUnidades);
      jest.spyOn(service, 'countTotal')
        .mockResolvedValueOnce(2) // analise
        .mockResolvedValueOnce(1) // inadmissiveis
        .mockResolvedValueOnce(3); // admissiveis
      jest.spyOn(service, 'countByUnidade').mockResolvedValue(mockCountData);
      jest.spyOn(service, 'getData').mockResolvedValue([]);
    });

    it('deve gerar relatório com estrutura correta', async () => {
      const result = await service.getRelatorio('1', '2024');
      
      expect(result).toHaveProperty('total', 6); // 2 + 1 + 3
      expect(result).toHaveProperty('analise', 2);
      expect(result).toHaveProperty('inadmissiveis', 1);
      expect(result).toHaveProperty('admissiveis', 3);
      expect(result).toHaveProperty('data_gerado');
      expect(result).toHaveProperty('em_analise');
      expect(result).toHaveProperty('deferidos');
      expect(result).toHaveProperty('indeferidos');
      expect(result).toHaveProperty('inadmissiveis_dados');
      expect(result).toHaveProperty('admissiveis_dados');
      expect(result).toHaveProperty('em_analise_dados');
    });

    it('deve ter estrutura correta para em_analise, deferidos e indeferidos', async () => {
      const result = await service.getRelatorio('1', '2024');
      
      // Verificar estrutura de em_analise
      expect(result.em_analise).toHaveProperty('smul');
      expect(result.em_analise).toHaveProperty('graproem');
      expect(result.em_analise.smul).toHaveProperty('quantidade', 3); // U1: 1 + U2: 2
      expect(result.em_analise.smul).toHaveProperty('data', mockCountData);
      expect(result.em_analise.graproem).toHaveProperty('quantidade', 3);
      expect(result.em_analise.graproem).toHaveProperty('data', mockCountData);
      
      // Verificar estrutura de deferidos
      expect(result.deferidos).toHaveProperty('smul');
      expect(result.deferidos).toHaveProperty('graproem');
      
      // Verificar estrutura de indeferidos
      expect(result.indeferidos).toHaveProperty('smul');
      expect(result.indeferidos).toHaveProperty('graproem');
    });

    it('deve chamar countByUnidade com parâmetros corretos para diferentes tipos', async () => {
      const spy = jest.spyOn(service, 'countByUnidade');
      
      await service.getRelatorio('1', '2024');
      
      // Verificar chamadas para em_analise (status 2)
      expect(spy).toHaveBeenCalledWith(2, 1, mockUnidades, expect.any(Object)); // SMUL
      expect(spy).toHaveBeenCalledWith(2, 2, mockUnidades, expect.any(Object)); // GRAPROEM
      
      // Verificar chamadas para deferidos (status 3)
      expect(spy).toHaveBeenCalledWith(3, 1, mockUnidades, expect.any(Object)); // SMUL
      expect(spy).toHaveBeenCalledWith(3, 2, mockUnidades, expect.any(Object)); // GRAPROEM
      
      // Verificar chamadas para indeferidos (status 4)
      expect(spy).toHaveBeenCalledWith(4, 1, mockUnidades, expect.any(Object)); // SMUL
      expect(spy).toHaveBeenCalledWith(4, 2, mockUnidades, expect.any(Object)); // GRAPROEM
    });

    it('deve calcular filtro de período corretamente', async () => {
      const spy = jest.spyOn(service, 'countTotal');
      
      await service.getRelatorio('3', '2024'); // Março de 2024
      
      const expectedPeriodFilter = {
        gte: new Date(2024, 2, 1), // 1º de março
        lte: new Date(2024, 3, 0)  // último dia de março
      };
      
      expect(spy).toHaveBeenCalledWith(2, false, expectedPeriodFilter);
    });

    it('deve formatar data_gerado corretamente', async () => {
      const result = await service.getRelatorio('1', '2024');
      
      expect(result.data_gerado).toMatch(/^\d{2}\/\d{2}\/\d{4}$/); // formato DD/MM/YYYY
    });

    it('deve lançar HttpException ao falhar na geração do relatório', async () => {
      const mockError = new Error('Erro unidades');
      jest.spyOn(service, 'getUnidades').mockRejectedValue(mockError);
      
      await expect(service.getRelatorio('1', '2024')).rejects.toThrow(HttpException);
      
      try {
        await service.getRelatorio('1', '2024');
      } catch (error) {
        expect(error).toBeInstanceOf(HttpException);
        expect(error.getStatus()).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
        expect(error.getResponse()).toEqual({
          api_mensagem: ERROR_MESSAGES.FALHA_GET_RELATORIO,
          tipo_erro: mockError.name,
          detalhe_tecnico: mockError.message,
        });
      }
    });

    it('deve chamar getData com parâmetros corretos', async () => {
      const spy = jest.spyOn(service, 'getData');
      
      await service.getRelatorio('1', '2024');
      
      const expectedPeriodFilter = {
        gte: new Date(2024, 0, 1),
        lte: new Date(2024, 1, 0)
      };
      
      expect(spy).toHaveBeenCalledWith(1, false, expectedPeriodFilter); // inadmissiveis_dados
      expect(spy).toHaveBeenCalledWith(0, false, expectedPeriodFilter); // admissiveis_dados
      expect(spy).toHaveBeenCalledWith(2, false, expectedPeriodFilter); // em_analise_dados
    });
  });
});