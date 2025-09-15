import { PrismaService } from "src/prisma/prisma.service";
import { PeriodFilterDto } from "src/relatorio/relatorio-ar-quantitativo/dto/response-relatorio.dto";
import { ArGraficoProgressaoMensalService } from "../ar-grafico-progressao-mensal.service";
import { Test, TestingModule } from "@nestjs/testing";
import { HttpException, HttpStatus, Injectable } from "@nestjs/common";

describe('Testes referente ao service do grafico AR progressão mensal', () => {
  let service: ArGraficoProgressaoMensalService;
  let prisma: PrismaService;

  const mockPrisma = {
    $queryRaw: jest.fn().mockResolvedValue([])
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
  });

  it('deve retornar dados processados corretamente', async () => {
    const mockRelatorioResult = [
      {
        ano: 2018,
        mes: Array(12).fill(0),
        acc: Array(12).fill(0),
      },
      {
        ano: 2019,
        mes: Array(12).fill(0),
        acc: Array(12).fill(0),
      },
      {
        ano: 2020,
        mes: Array(12).fill(0),
        acc: Array(12).fill(0),
      },
      {
        ano: 2021,
        mes: Array(12).fill(0),
        acc: Array(12).fill(0),
      },
      {
        ano: 2022,
        mes: Array(12).fill(0),
        acc: Array(12).fill(0),
      },
      {
        ano: 2023,
        mes: Array(12).fill(0),
        acc: Array(12).fill(0),
      },
      {
        ano: 2024,
        mes: [0, 0, 0, 0, 0, 0, 6, 2, 0, 2, 1, 3],
        acc: [0, 0, 0, 0, 0, 0, 6, 8, 8, 10, 11, 14],
      },
    ];

    jest.spyOn(service, 'verificarData').mockReturnValue({
      gte: new Date('2018-01-01'),
      lte: new Date('2024-12-31')
    });

    jest.spyOn(service, 'getDataPorAno').mockResolvedValue(mockRelatorioResult);

    const result = await service.getRelatorio('2018', '2024');

    expect(result).toEqual(mockRelatorioResult);

    expect(service.verificarData).toHaveBeenCalledWith('2018', '2024');
    expect(service.getDataPorAno).toHaveBeenCalledWith({
      gte: new Date('2018-01-01'),
      lte: new Date('2024-12-31')
    });
  });

  it('deve retornar uma http exception ao tentar filtrar dados anteriores a 2018', async () => {
    jest.spyOn(service, 'verificarData').mockImplementation(() => {
      throw new HttpException(
        "A pesquisa de processos está limitada a registros iniciados a partir de 2018. Não é possível consultar processos anteriores a esta data.",
        HttpStatus.NOT_FOUND);
    });

    try {
      service.verificarData('2016', '2024');
    } catch (error) {
      expect(error).toBeInstanceOf(HttpException);
      expect(error.message).toBe("A pesquisa de processos está limitada a registros iniciados a partir de 2018. Não é possível consultar processos anteriores a esta data.",);
      expect(error.getStatus()).toBe(HttpStatus.NOT_FOUND);
    }

  })

  it('deve retornar uma http exception ao tentar filtrar dados de um ano maior que o atual', async () => {
    const anoAtual = new Date().getFullYear()

    jest.spyOn(service, 'verificarData').mockImplementation(() => {
      throw new HttpException(
        `A pesquisa de processos está limitada aos registros de processos iniciados até o ano de ${anoAtual}. Por favor, consulte os processos até essa data. `,
        HttpStatus.NOT_FOUND);
    });

    try {
      service.verificarData('2019', '2028');
    } catch (error) {
      expect(error).toBeInstanceOf(HttpException);
      expect(error.message).toBe(`A pesquisa de processos está limitada aos registros de processos iniciados até o ano de ${anoAtual}. Por favor, consulte os processos até essa data. `,);
      expect(error.getStatus()).toBe(HttpStatus.NOT_FOUND);
    }

  })
});

