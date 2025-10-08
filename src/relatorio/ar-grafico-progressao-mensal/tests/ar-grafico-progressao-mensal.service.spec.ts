import { PrismaService } from "src/prisma/prisma.service";
import { PeriodFilterDto } from "src/relatorio/relatorio-ar-quantitativo/dto/response-relatorio.dto";
import { ArGraficoProgressaoMensalService } from "../ar-grafico-progressao-mensal.service";
import { Test, TestingModule } from "@nestjs/testing";
import { HttpException, HttpStatus } from "@nestjs/common";
import { ERROR_MESSAGES } from "../constants/error-messages";

describe('Testes referente ao service do grafico AR progressão mensal', () => {
  let service: ArGraficoProgressaoMensalService;
  let prisma: PrismaService;

  const mockPrisma = {
    $queryRaw: jest.fn()
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ArGraficoProgressaoMensalService,
        { provide: PrismaService, useValue: mockPrisma }
      ],
    }).compile();

    service = module.get<ArGraficoProgressaoMensalService>(ArGraficoProgressaoMensalService);
    prisma = module.get<PrismaService>(PrismaService);

    jest.clearAllMocks();
  });

  describe('getDataPorAno', () => {
    it('deve processar dados corretamente quando há registros no banco', async () => {
      const mockQueryResult = [
        { ano: 2024, mes: 7, total_registros: 6 },
        { ano: 2024, mes: 8, total_registros: 2 },
        { ano: 2024, mes: 10, total_registros: 2 },
        { ano: 2024, mes: 11, total_registros: 1 },
        { ano: 2024, mes: 12, total_registros: 3 }
      ];

      mockPrisma.$queryRaw.mockResolvedValue(mockQueryResult);

      const periodFilter: PeriodFilterDto = {
        gte: new Date('2024-01-01'),
        lte: new Date('2024-12-31')
      };

      const result = await service.getDataPorAno(periodFilter);

      expect(result).toHaveLength(1);
      expect(result[0]).toHaveProperty('ano', 2024);
      expect(result[0]).toHaveProperty('mes');
      expect(result[0]).toHaveProperty('acc');
      expect(result[0].mes[6]).toBe(6); // julho (índice 6)
      expect(result[0].mes[7]).toBe(2); // agosto (índice 7)
      expect(result[0].acc[11]).toBe(14); // dezembro com acumulado total
    });

    it('deve processar dados para múltiplos anos corretamente', async () => {
      const mockQueryResult = [
        { ano: 2023, mes: 12, total_registros: 5 },
        { ano: 2024, mes: 1, total_registros: 3 },
        { ano: 2024, mes: 6, total_registros: 2 }
      ];

      mockPrisma.$queryRaw.mockResolvedValue(mockQueryResult);

      const periodFilter: PeriodFilterDto = {
        gte: new Date('2023-01-01'),
        lte: new Date('2024-12-31')
      };

      const result = await service.getDataPorAno(periodFilter);

      expect(result).toHaveLength(2);
      expect(result[0].ano).toBe(2023);
      expect(result[1].ano).toBe(2024);
      expect(result[1].acc[0]).toBe(8); // janeiro 2024 com acumulado de 2023
    });

    it('deve retornar arrays zerados quando não há registros', async () => {
      mockPrisma.$queryRaw.mockResolvedValue([]);

      const periodFilter: PeriodFilterDto = {
        gte: new Date('2023-01-01'),
        lte: new Date('2023-12-31')
      };

      const result = await service.getDataPorAno(periodFilter);

      expect(result).toHaveLength(1);
      expect(result[0].ano).toBe(2023);
      expect(result[0].mes).toEqual(Array(12).fill(0));
      expect(result[0].acc).toEqual(Array(12).fill(0));
    });

    it('deve lançar HttpException quando query retorna null', async () => {
      mockPrisma.$queryRaw.mockResolvedValue(null);

      const periodFilter: PeriodFilterDto = {
        gte: new Date('2024-01-01'),
        lte: new Date('2024-12-31')
      };

      await expect(service.getDataPorAno(periodFilter))
        .rejects
        .toThrow(new HttpException(ERROR_MESSAGES.FALHA_QUERY_BRUTA_INICIAIS_POR_ANO, HttpStatus.INTERNAL_SERVER_ERROR));
    });

    it('deve lançar HttpException quando ocorre erro no prisma', async () => {
      const prismaError = new Error('Database connection failed');
      mockPrisma.$queryRaw.mockRejectedValue(prismaError);

      const periodFilter: PeriodFilterDto = {
        gte: new Date('2024-01-01'),
        lte: new Date('2024-12-31')
      };

      await expect(service.getDataPorAno(periodFilter))
        .rejects
        .toThrow(HttpException);
    });
  });

  describe('verificarData', () => {
    it('deve retornar período padrão quando parâmetros são undefined/null', () => {
      const result = service.verificarData(undefined, undefined);

      expect(result.gte).toEqual(new Date("2018-01-01"));
      expect(result.lte).toBeInstanceOf(Date);
    });

    it('deve retornar período padrão quando parâmetros são strings vazias', () => {
      const result = service.verificarData('', '');

      expect(result.gte).toEqual(new Date("2018-01-01"));
      expect(result.lte).toBeInstanceOf(Date);
    });

    it('deve retornar período correto para anos válidos', () => {
      const result = service.verificarData('2020', '2023');

      expect(result.gte).toEqual(new Date(2020, 0, 1));
      expect(result.lte).toEqual(new Date(2023, 11, 31));
    });

    it('deve lançar HttpException para ano inicial anterior a 2018', () => {
      expect(() => service.verificarData('2017', '2024'))
        .toThrow(new HttpException(
          "A pesquisa de processos está limitada a registros iniciados a partir de 2018. Não é possível consultar processos anteriores a esta data.",
          HttpStatus.NOT_FOUND
        ));
    });

    it('deve lançar HttpException para ano final posterior ao atual', () => {
      const anoAtual = new Date().getFullYear();
      const anoFuturo = (anoAtual + 2).toString();

      expect(() => service.verificarData('2020', anoFuturo))
        .toThrow(new HttpException(
          `A pesquisa de processos está limitada aos registros de processos iniciados até o ano de ${anoAtual}. Por favor, consulte os processos até essa data. `,
          HttpStatus.NOT_FOUND
        ));
    });

    it('deve aceitar ano atual como ano final', () => {
      const anoAtual = new Date().getFullYear().toString();
      
      expect(() => service.verificarData('2020', anoAtual)).not.toThrow();
    });

    it('deve aceitar exatamente 2018 como ano inicial', () => {
      expect(() => service.verificarData('2018', '2024')).not.toThrow();
    });
  });

  describe('getRelatorio', () => {
    it('deve retornar dados do relatório corretamente', async () => {
      const mockRelatorioResult = [
        {
          ano: 2024,
          mes: [0, 0, 0, 0, 0, 0, 6, 2, 0, 2, 1, 3],
          acc: [0, 0, 0, 0, 0, 0, 6, 8, 8, 10, 11, 14],
        },
      ];

      jest.spyOn(service, 'verificarData').mockReturnValue({
        gte: new Date('2024-01-01'),
        lte: new Date('2024-12-31')
      });

      jest.spyOn(service, 'getDataPorAno').mockResolvedValue(mockRelatorioResult);

      const result = await service.getRelatorio('2024', '2024');

      expect(result).toEqual(mockRelatorioResult);
      expect(service.verificarData).toHaveBeenCalledWith('2024', '2024');
      expect(service.getDataPorAno).toHaveBeenCalledWith({
        gte: new Date('2024-01-01'),
        lte: new Date('2024-12-31')
      });
    });

    it('deve propagar erro de verificarData', async () => {
      jest.spyOn(service, 'verificarData').mockImplementation(() => {
        throw new HttpException(
          "A pesquisa de processos está limitada a registros iniciados a partir de 2018. Não é possível consultar processos anteriores a esta data.",
          HttpStatus.NOT_FOUND
        );
      });

      await expect(service.getRelatorio('2017', '2024'))
        .rejects
        .toThrow(HttpException);
    });

    it('deve propagar erro de getDataPorAno', async () => {
      jest.spyOn(service, 'verificarData').mockReturnValue({
        gte: new Date('2024-01-01'),
        lte: new Date('2024-12-31')
      });

      jest.spyOn(service, 'getDataPorAno').mockRejectedValue(
        new HttpException('Database error', HttpStatus.INTERNAL_SERVER_ERROR)
      );

      await expect(service.getRelatorio('2024', '2024'))
        .rejects
        .toThrow(HttpException);
    });
  });
});