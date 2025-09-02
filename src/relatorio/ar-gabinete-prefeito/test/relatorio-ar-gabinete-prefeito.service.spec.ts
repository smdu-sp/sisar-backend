import { ArGabineteDoPrefeito } from '../relatorio-ar-gabinete-prefeito.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { Test, TestingModule } from '@nestjs/testing';
import { HttpException } from '@nestjs/common';

describe('ArGabineteDoPrefeito', () => {
  let service: ArGabineteDoPrefeito;
  let prisma: PrismaService;

  const MockPrismaService = {
    inicial: {
      findMany: jest.fn(),
    },
    admissibilidade: {
      findUnique: jest.fn(),
    },
    controle_Prazo: {
      findMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ArGabineteDoPrefeito,
        {
          provide: PrismaService,
          useValue: MockPrismaService,
        },
      ],
    }).compile();
    service = module.get<ArGabineteDoPrefeito>(ArGabineteDoPrefeito);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('deve verificar se os services foram definidos', () => {
    expect(service).toBeDefined();
    expect(prisma).toBeDefined();
  });

  describe('segregrarIniaisPorAno', () => {
    it('deve agrupar iniciais por ano', async () => {
      const mockIniciais = [
        { id: 1, data_protocolo: new Date('2019-05-01'), status: 3 },
        { id: 2, data_protocolo: new Date('2019-06-01'), status: 3 },
        { id: 3, data_protocolo: new Date('2020-01-01'), status: 3 },
      ];
      (prisma.inicial.findMany as jest.Mock).mockResolvedValue(mockIniciais);
      const result = await service.segregarIniaisPorAno();
      expect(result).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ ano: 2019, dados: expect.any(Array) }),
          expect.objectContaining({ ano: 2020, dados: expect.any(Array) }),
        ])
      );
    });
  });

  describe('getNumeroDoProcesso', () => {
    it('deve retornar o campo sei se existir', () => {
      const inicial = { id: 1, sei: '123', aprova_digital: null, processo_fisico: null };
      const result = service.getNumeroDoProcesso({ ...inicial });
      expect(result.numero_do_processo).toBe('123');
    });
    it('deve retornar o campo aprova_digital se não houver sei', () => {
      const inicial = { id: 2, sei: null, aprova_digital: '456', processo_fisico: null };
      const result = service.getNumeroDoProcesso({ ...inicial });
      expect(result.numero_do_processo).toBe('456');
    });
    it('deve retornar o campo processo_fisico se não houver sei nem aprova_digital', () => {
      const inicial = { id: 3, sei: null, aprova_digital: null, processo_fisico: '789' };
      const result = service.getNumeroDoProcesso({ ...inicial });
      expect(result.numero_do_processo).toBe('789');
    });
    it('deve lançar exceção se não houver nenhum número de processo', () => {
      const inicial = { id: 4, sei: null, aprova_digital: null, processo_fisico: null };
      expect(() => service.getNumeroDoProcesso({ ...inicial })).toThrow(HttpException);
    });
  });

  describe('getControlesDePrazo', () => {
    it('deve retornar controles de prazo', async () => {
      const mockControles = [{ id: 1 }, { id: 2 }];
      (prisma.controle_Prazo.findMany as jest.Mock).mockResolvedValue(mockControles);
      const result = await service.getControlesDePrazo();
      expect(result).toEqual(mockControles);
    });
  });

  describe('atribuirTempoDeAnalize', () => {
    it('deve calcular tempo de análise corretamente', async () => {
      const inicial = { id: 1 };
      const admissibilidade = {
        data_envio: new Date('2024-01-01'),
        data_decisao_interlocutoria: new Date('2024-01-11'),
      };
      (prisma.admissibilidade.findUnique as jest.Mock).mockResolvedValue(admissibilidade);
      const result = await service.atribuirTempoDeAnalize({ ...inicial });
      expect(result.tempo_de_analise_pedido_inicial).toBeCloseTo(10, 0);
    });
  });

  describe('getNumerosDeProcesso', () => {
    it('deve retornar o número do processo correto', async () => {
      const inicial = { id: 1, sei: '123', aprova_digital: null, processo_fisico: null };
      const numero = await service.getNumerosDeProcesso(inicial);
      expect(numero).toBe('123');
    });
    it('deve lançar exceção se não houver número de processo', async () => {
      const inicial = { id: 2, sei: null, aprova_digital: null, processo_fisico: null };
      await expect(service.getNumerosDeProcesso(inicial)).rejects.toThrow(HttpException);
    });
  });
});
