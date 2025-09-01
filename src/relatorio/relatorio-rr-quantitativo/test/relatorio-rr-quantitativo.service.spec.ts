import { RelatorioRRService } from "../relatorio-rr.service";
import { PrismaService } from "src/prisma/prisma.service";
import { Test, TestingModule } from "@nestjs/testing";
import { Unidade } from "@prisma/client";

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
    it('deve tratar erro ao buscar unidades', async () => {
      (prisma.unidade.findMany as jest.Mock).mockRejectedValue(new Error('DB error'));
      await expect(service.getUnidades()).rejects.toThrow('DB error');
    });
  });

  describe('countByInicial', () => {
    it('deve contar processos por unidade corretamente', async () => {
      const unidades = [
        { sigla: 'U1' },
        { sigla: 'U2' },
      ];
      const resultados = [
        { admissibilidade: { unidade: { sigla: 'U1' } } },
        { admissibilidade: { unidade: { sigla: 'U1' } } },
        { admissibilidade: { unidade: { sigla: 'U2' } } },
      ];
      (prisma.inicial.findMany as jest.Mock).mockResolvedValue(resultados);
      const periodFilter = { gte: new Date(), lte: new Date() };
      const result = await service.countByInicial(2, 1, unidades, periodFilter);
      expect(result).toEqual({ U1: 2, U2: 1 });
    });
    it('deve tratar erro ao contar processos', async () => {
      (prisma.inicial.findMany as jest.Mock).mockRejectedValue(new Error('Erro ao buscar'));
      await expect(service.countByInicial(2, 1, [{ sigla: 'U1' }], { gte: new Date(), lte: new Date() })).rejects.toThrow('Erro ao buscar');
    });
  });

  describe('countTotal', () => {
    it('deve contar total de processos com decisaoNull false', async () => {
      (prisma.inicial.count as jest.Mock).mockResolvedValue(5);
      const periodFilter = { gte: new Date(), lte: new Date() };
      const result = await service.countTotal(2, false, periodFilter);
      expect(result).toBe(5);
      expect(prisma.inicial.count).toHaveBeenCalledWith({
        status: 2,
        criado_em: periodFilter,
        admissibilidade: { data_decisao_interlocutoria: periodFilter },
      });
    });
    it('deve contar total de processos com decisaoNull true', async () => {
      (prisma.inicial.count as jest.Mock).mockResolvedValue(3);
      const periodFilter = { gte: new Date(), lte: new Date() };
      const result = await service.countTotal(2, true, periodFilter);
      expect(result).toBe(3);
      expect(prisma.inicial.count).toHaveBeenCalledWith({
        status: 2,
        criado_em: periodFilter,
        admissibilidade: { data_decisao_interlocutoria: null },
      });
    });
    it('deve tratar erro ao contar total', async () => {
      (prisma.inicial.count as jest.Mock).mockRejectedValue(new Error('Erro count'));
      await expect(service.countTotal(2, false, { gte: new Date(), lte: new Date() })).rejects.toThrow('Erro count');
    });
  });

  describe('getData', () => {
    it('deve retornar dados completos', async () => {
      const mockData = [{ id: 1, inicial: { id: 1 } }];
      (prisma.admissibilidade.findMany as jest.Mock).mockResolvedValue(mockData);
      const periodFilter = { gte: new Date(), lte: new Date() };
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
    it('deve tratar erro ao buscar dados', async () => {
      (prisma.admissibilidade.findMany as jest.Mock).mockRejectedValue(new Error('Erro getData'));
      await expect(service.getData(2, false, { gte: new Date(), lte: new Date() })).rejects.toThrow('Erro getData');
    });
  });

  describe('getRelatorio', () => {
    it('deve gerar relatório corretamente', async () => {
      jest.spyOn(service, 'getUnidades').mockResolvedValue([{ sigla: 'U1' }, { sigla: 'U2' }]);
      jest.spyOn(service, 'countTotal').mockResolvedValueOnce(2).mockResolvedValueOnce(1).mockResolvedValueOnce(3);
      jest.spyOn(service, 'countByInicial').mockResolvedValue({ U1: 1, U2: 2 });
      jest.spyOn(service, 'getData').mockResolvedValue([]);
      const result = await service.getRelatorio('1', '2024');
      expect(result).toHaveProperty('total');
      expect(result).toHaveProperty('analise');
      expect(result).toHaveProperty('inadmissiveis');
      expect(result).toHaveProperty('admissiveis');
      expect(result).toHaveProperty('em_analise');
      expect(result).toHaveProperty('deferidos');
      expect(result).toHaveProperty('indeferidos');
      expect(result).toHaveProperty('inadmissiveis_dados');
      expect(result).toHaveProperty('admissiveis_dados');
      expect(result).toHaveProperty('em_analise_dados');
    });
    it('deve tratar erro ao gerar relatório', async () => {
      jest.spyOn(service, 'getUnidades').mockRejectedValue(new Error('Erro unidades'));
      await expect(service.getRelatorio('1', '2024')).rejects.toThrow('Erro unidades');
    });
  });
});
