import { ArGabineteDoPrefeito } from '../relatorio-ar-gabinete-prefeito.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { Test, TestingModule } from '@nestjs/testing';
import { HttpException, HttpStatus } from '@nestjs/common';
import { ERROR_MESSAGES } from '../constants/error-messages';

// Tipagens atualizadas conforme novos campos adicionados
type Inicial = {
  id: number;
  data_protocolo?: Date;
  status?: number;
  sei?: string | null;
  aprova_digital?: string | null;
  processo_fisico?: string | null;
  // Novos campos adicionados
  campo_extra1?: string;
  campo_extra2?: number;
  campo_extra3?: boolean;
};

type Admissibilidade = {
  data_envio?: Date;
  data_decisao_interlocutoria?: Date;
  // Novos campos adicionados
  campo_extra1?: string;
  campo_extra2?: number;
};

type ListaAno = {
  ano: number;
  dados: Inicial[];
  // Novos campos adicionados
  campo_extra1?: string;
  campo_extra2?: number;
};

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

  describe('segregarIniaisPorAno', () => {
    it('deve agrupar iniciais por ano com todos os anos entre 2018 e ano atual', async () => {
      const mockIniciais: Inicial[] = [
        { id: 1, data_protocolo: new Date('2019-05-01'), status: 3, campo_extra1: 'foo', campo_extra2: 10 },
        { id: 2, data_protocolo: new Date('2019-06-01'), status: 3, campo_extra1: 'bar', campo_extra2: 20 },
        { id: 3, data_protocolo: new Date('2020-01-01'), status: 3, campo_extra1: 'baz', campo_extra2: 30 },
      ];
      (prisma.inicial.findMany as jest.Mock).mockResolvedValue(mockIniciais);

      const result = await service.segregarIniaisPorAno();

      expect(result).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ ano: 2018, dados: [] }),
          expect.objectContaining({ ano: 2019, dados: expect.any(Array) }),
          expect.objectContaining({ ano: 2020, dados: expect.any(Array) }),
        ])
      );
      expect(result.find(r => r.ano === 2019)?.dados).toHaveLength(2);
      expect(result.find(r => r.ano === 2020)?.dados).toHaveLength(1);
    });

    it('deve lançar HttpException personalizada em caso de erro', async () => {
      const mockError = new Error('Database error');
      (prisma.inicial.findMany as jest.Mock).mockRejectedValue(mockError);

      await expect(service.segregarIniaisPorAno()).rejects.toThrow(HttpException);
      await expect(service.segregarIniaisPorAno()).rejects.toThrow(
        expect.objectContaining({
          status: HttpStatus.INTERNAL_SERVER_ERROR
        })
      );
    });
  });

  describe('getNumeroDoProcesso', () => {
    it('deve retornar o campo sei se existir', async () => {
      const inicial: Inicial = { id: 1, sei: '123', aprova_digital: null, processo_fisico: null, campo_extra1: 'foo' };
      const result = await service.getNumeroDoProcesso({ ...inicial });
      expect(result.numero_do_processo).toBe('123');
    });

    it('deve retornar o campo aprova_digital se não houver sei', async () => {
      const inicial: Inicial = { id: 2, sei: null, aprova_digital: '456', processo_fisico: null, campo_extra2: 42 };
      const result = await service.getNumeroDoProcesso({ ...inicial });
      expect(result.numero_do_processo).toBe('456');
    });

    it('deve retornar o campo processo_fisico se não houver sei nem aprova_digital', async () => {
      const inicial: Inicial = { id: 3, sei: null, aprova_digital: null, processo_fisico: '789', campo_extra3: true };
      const result = await service.getNumeroDoProcesso({ ...inicial });
      expect(result.numero_do_processo).toBe('789');
    });

    it('deve lançar HttpException personalizada se não houver nenhum número de processo', async () => {
      const inicial: Inicial = { id: 4, sei: null, aprova_digital: null, processo_fisico: null, campo_extra1: 'none' };

      await expect(service.getNumeroDoProcesso({ ...inicial })).rejects.toThrow(HttpException);
      await expect(service.getNumeroDoProcesso({ ...inicial })).rejects.toThrow(
        expect.objectContaining({
          status: HttpStatus.INTERNAL_SERVER_ERROR
        })
      );
    });
  });

  describe('segregarIniciaisPorMes', () => {
    it('deve segregar iniciais por mês e adicionar propriedades dos meses', async () => {
      const mockLista: ListaAno[] = [
        {
          ano: 2019,
          dados: [
            { id: 1, data_protocolo: new Date('2019-01-15'), sei: '123', campo_extra1: 'foo' },
            { id: 2, data_protocolo: new Date('2019-06-10'), sei: '456', campo_extra2: 99 }
          ],
          campo_extra1: 'ano2019'
        }
      ];

      const mockAdmissibilidade: Admissibilidade = {
        data_envio: new Date('2019-01-01'),
        data_decisao_interlocutoria: new Date('2019-01-11'),
        campo_extra1: 'adm2019'
      };
      (prisma.admissibilidade.findUnique as jest.Mock).mockResolvedValue(mockAdmissibilidade);

      const result = await service.segregarIniciaisPorMes(mockLista);

      expect(result[0]).toHaveProperty('jan');
      expect(result[0]).toHaveProperty('fev');
      expect(result[0]).toHaveProperty('jun');
    });

    it('deve lançar HttpException se lista for null/undefined', async () => {
      await expect(service.segregarIniciaisPorMes(null)).rejects.toThrow(HttpException);
      await expect(service.segregarIniciaisPorMes(null)).rejects.toThrow(
        expect.objectContaining({
          status: HttpStatus.INTERNAL_SERVER_ERROR
        })
      );
    });
  });

  describe('atribuirTempoDeAnalize', () => {
    it('deve calcular tempo de análise corretamente', async () => {
      const inicial: Inicial = { id: 1, campo_extra2: 100 };
      const admissibilidade: Admissibilidade = {
        data_envio: new Date('2024-01-01'),
        data_decisao_interlocutoria: new Date('2024-01-11'),
        campo_extra1: 'adm2024'
      };
      (prisma.admissibilidade.findUnique as jest.Mock).mockResolvedValue(admissibilidade);

      const result = await service.atribuirTempoDeAnalize({ ...inicial });

      expect(result.tempo_de_analise_pedido_inicial).toBeCloseTo(10, 0);
    });

    it('deve lançar HttpException se admissibilidade não for encontrada', async () => {
      const inicial: Inicial = { id: 1, campo_extra3: false };
      (prisma.admissibilidade.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(service.atribuirTempoDeAnalize(inicial)).rejects.toThrow(HttpException);
      await expect(service.atribuirTempoDeAnalize(inicial)).rejects.toThrow(
        expect.objectContaining({
          status: HttpStatus.INTERNAL_SERVER_ERROR
        })
      );
    });
  });

  describe('incrementarListaDeProcessos', () => {
    it('deve adicionar array numeros_de_processos para cada objeto da lista', async () => {
      const mockLista: ListaAno[] = [
        {
          ano: 2019,
          dados: [
            { id: 1, sei: '123', campo_extra1: 'foo' },
            { id: 2, aprova_digital: '456', campo_extra2: 88 }
          ],
          campo_extra2: 2019
        }
      ];

      const result = await service.incrementarListaDeProcessos(mockLista);

      expect(result[0]).toHaveProperty('numeros_de_processos');
      expect(result[0].numeros_de_processos).toHaveLength(2);
    });

    it('deve lançar HttpException se lista for null/undefined', async () => {
      await expect(service.incrementarListaDeProcessos(null)).rejects.toThrow(HttpException);
      await expect(service.incrementarListaDeProcessos(null)).rejects.toThrow(
        expect.objectContaining({
          status: HttpStatus.INTERNAL_SERVER_ERROR
        })
      );
    });
  });

  describe('atribuirProtocoladosEAprovados', () => {
    it('deve contar processos protocolados e aprovados corretamente', async () => {
      const mockLista: ListaAno[] = [
        {
          ano: 2019,
          dados: [
            { id: 1, status: 2, campo_extra1: 'proto' }, // protocolado
            { id: 2, status: 3, campo_extra2: 1 }, // aprovado
            { id: 3, status: 3, campo_extra3: true }, // aprovado
          ],
          campo_extra1: 'ano2019'
        }
      ];

      const result = await service.atribuirProtocoladosEAprovados(mockLista);

      expect(result[0].processos_protocolados).toBe(1);
      expect(result[0].processos_aprovados).toBe(2);
    });

    it('deve lançar HttpException se lista for null/undefined', async () => {
      await expect(service.atribuirProtocoladosEAprovados(null)).rejects.toThrow(HttpException);
      await expect(service.atribuirProtocoladosEAprovados(null)).rejects.toThrow(
        expect.objectContaining({
          status: HttpStatus.INTERNAL_SERVER_ERROR
        })
      );
    });
  });

  describe('getRelatorioGabineteDoPrefeito', () => {
    it('deve retornar relatório completo integrando todos os métodos', async () => {
      const mockIniciais: Inicial[] = [
        { id: 1, data_protocolo: new Date('2019-05-01'), status: 3, sei: '123', campo_extra1: 'foo' },
        { id: 2, data_protocolo: new Date('2019-06-01'), status: 2, aprova_digital: '456', campo_extra2: 77 },
      ];
      const mockAdmissibilidade: Admissibilidade = {
        data_envio: new Date('2019-01-01'),
        data_decisao_interlocutoria: new Date('2019-01-11'),
        campo_extra2: 2019
      };

      (prisma.inicial.findMany as jest.Mock).mockResolvedValue(mockIniciais);
      (prisma.admissibilidade.findUnique as jest.Mock).mockResolvedValue(mockAdmissibilidade);

      const result = await service.getRelatorioGabineteDoPrefeito();

      expect(result).toBeInstanceOf(Array);
      expect(result[0]).toHaveProperty('ano');
      expect(result[0]).toHaveProperty('dados');
      expect(result[0]).toHaveProperty('processos_protocolados');
      expect(result[0]).toHaveProperty('processos_aprovados');
    });
  });

  // Removendo métodos que não existem mais no service
  // describe('getControlesDePrazo', () => { ... });
  // describe('getNumerosDeProcesso', () => { ... });
});