import { UpdateReunioesDto } from '../dto/update-reunioes.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { Reuniao_Processo } from '@prisma/client';
import { ReunioesService } from '../reunioes.service';
import { Test, TestingModule } from '@nestjs/testing';
import { ForbiddenException } from '@nestjs/common';
import { Inicial } from '@prisma/client';

describe('Reunioes.service test', () => {
  let service: ReunioesService;
  let prisma: PrismaService;

  const MockPrismaService = {
    reuniao_Processo: {
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    jest.clearAllMocks(); 
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReunioesService,
        {
          provide: PrismaService,
          useValue: MockPrismaService,
        },
      ],
    }).compile();
    service = module.get<ReunioesService>(ReunioesService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('os serviços deverão estar definidos', () => {
    expect(service).toBeDefined();
    expect(prisma).toBeDefined();
  });

  it('deverá listar todas as reuniões', async () => {
    const mockListReunioes: Reuniao_Processo[] = [
      {
        id: 'M4Hy3w',
        inicial_id: 111,
        data_reuniao: new Date('2025-02-05T14:34:21.651Z'),
        data_processo: new Date('2025-02-05T14:34:21.651Z'),
        nova_data_reuniao: new Date('2025-02-05T14:34:21.651Z'),
        justificativa_remarcacao: 'queda de energia na data e horário marcado',
        criado_em: new Date('2025-02-05T14:34:21.651Z'),
        alterado_em: new Date('2025-02-05T14:34:21.651Z'),
      },
      {
        id: 'M7Hi3w',
        inicial_id: 112,
        data_reuniao: new Date('2025-02-05T14:34:21.651Z'),
        data_processo: new Date('2025-02-05T14:34:21.651Z'),
        nova_data_reuniao: new Date('2025-02-05T14:34:21.651Z'),
        justificativa_remarcacao: 'queda de energia na data e horário marcado',
        criado_em: new Date('2025-02-05T14:34:21.651Z'),
        alterado_em: new Date('2025-02-05T14:34:21.651Z'),
      },
    ];

    (prisma.reuniao_Processo.findMany as jest.Mock).mockResolvedValue(
      mockListReunioes,
    );

    const result: Reuniao_Processo[] = await service.listaCompleta();

    expect(result).not.toBeNull();
    expect(result).toEqual(mockListReunioes);
    expect(prisma.reuniao_Processo.findMany).toHaveBeenCalledWith({
      orderBy: {
        data_reuniao: 'asc',
      },
    });
  });

  it('deve lançar uma exceção ForbiddenException quando não houver reuniões', async () => {
    (prisma.reuniao_Processo.findMany as jest.Mock).mockResolvedValue([]);

    await expect(service.listaCompleta()).rejects.toThrow(ForbiddenException);

    expect(prisma.reuniao_Processo.findMany).toHaveBeenCalledWith({
      orderBy: { data_reuniao: 'asc' },
    });
  });

  it('deverá buscar por mês e ano as reuniões', async () => {
    const mockListReunioes: Reuniao_Processo[] = [
      {
        id: 'M4Hy3w',
        inicial_id: 111,
        data_reuniao: new Date('2025-02-05T14:34:21.651Z'),
        data_processo: new Date('2025-02-05T14:34:21.651Z'),
        nova_data_reuniao: new Date('2025-02-05T14:34:21.651Z'),
        justificativa_remarcacao: 'queda de energia na data e horário marcado',
        criado_em: new Date('2025-02-05T14:34:21.651Z'),
        alterado_em: new Date('2025-02-05T14:34:21.651Z'),
      },
      {
        id: 'M7Hi3w',
        inicial_id: 112,
        data_reuniao: new Date('2025-02-05T14:34:21.651Z'),
        data_processo: new Date('2025-02-05T14:34:21.651Z'),
        nova_data_reuniao: new Date('2025-02-05T14:34:21.651Z'),
        justificativa_remarcacao: 'queda de energia na data e horário marcado',
        criado_em: new Date('2025-02-05T14:34:21.651Z'),
        alterado_em: new Date('2025-02-05T14:34:21.651Z'),
      },
      {
        id: 'M7Hi3w',
        inicial_id: 112,
        data_reuniao: new Date('2025-01-05T14:34:21.651Z'),
        data_processo: new Date('2025-01-05T14:34:21.651Z'),
        nova_data_reuniao: new Date('2025-01-05T14:34:21.651Z'),
        justificativa_remarcacao: 'queda de energia na data e horário marcado',
        criado_em: new Date('2025-01-05T14:34:21.651Z'),
        alterado_em: new Date('2025-01-05T14:34:21.651Z'),
      },
    ];

    const mockFindReuniao: Reuniao_Processo[] = [
      {
        id: 'M7Hi3w',
        inicial_id: 112,
        data_reuniao: new Date('2025-01-05T14:34:21.651Z'),
        data_processo: new Date('2025-01-05T14:34:21.651Z'),
        nova_data_reuniao: new Date('2025-01-05T14:34:21.651Z'),
        justificativa_remarcacao: 'queda de energia na data e horário marcado',
        criado_em: new Date('2025-01-05T14:34:21.651Z'),
        alterado_em: new Date('2025-01-05T14:34:21.651Z'),
      },
    ];

    (prisma.reuniao_Processo.findMany as jest.Mock).mockResolvedValue(
      mockFindReuniao,
    );

    const result: Reuniao_Processo[] = await service.buscarPorMesAno(1, 2025);

    expect(result).not.toBeNull();
    expect(result).toEqual(mockFindReuniao);
    expect(prisma.reuniao_Processo.findMany).toHaveBeenCalledWith({
      where: {
        OR: [
          {
            AND: [
              { nova_data_reuniao: { gte: expect.any(Date) } },
              { nova_data_reuniao: { lte: expect.any(Date) } },
            ],
          },
          {
            AND: [
              { nova_data_reuniao: null },
              { data_reuniao: { gte: expect.any(Date) } },
              { nova_data_reuniao: null },
              { data_reuniao: { lte: expect.any(Date) } },
            ],
          },
        ],
      },
    });
  });

  it('deverá buscar uma reunião pelo seu id', async () => {
    const mockFindReuniao: Reuniao_Processo = {
      id: 'M7Hi3w',
      inicial_id: 112,
      data_reuniao: new Date('2025-01-05T14:34:21.651Z'),
      data_processo: new Date('2025-01-05T14:34:21.651Z'),
      nova_data_reuniao: new Date('2025-01-05T14:34:21.651Z'),
      justificativa_remarcacao: 'queda de energia na data e horário marcado',
      criado_em: new Date('2025-01-05T14:34:21.651Z'),
      alterado_em: new Date('2025-01-05T14:34:21.651Z'),
    };

    (prisma.reuniao_Processo.findUnique as jest.Mock).mockResolvedValue(
      mockFindReuniao,
    );

    const result = await service.buscarPorId('M7Hi3w');

    expect(result).not.toBeNull();
    expect(result).toEqual(mockFindReuniao);
    expect(prisma.reuniao_Processo.findUnique).toHaveBeenCalledWith({
      where: { id: expect.any(String) },
    });
  });

  it('deverá atualizar uma reuniao', async () => {
    const mockReuniaoUpdate: Reuniao_Processo = {
      id: 'M7Hi3w',
      inicial_id: 112,
      data_reuniao: new Date('2025-01-05T14:34:21.651Z'),
      data_processo: new Date('2025-01-05T14:34:21.651Z'),
      nova_data_reuniao: new Date('2025-01-05T14:34:21.651Z'),
      justificativa_remarcacao: 'queda de energia na data e horário marcado',
      criado_em: new Date('2025-01-05T14:34:21.651Z'),
      alterado_em: new Date('2025-01-05T14:34:21.651Z'),
    };

    const mockParams: UpdateReunioesDto = {
      nova_data_reuniao: new Date('2025-03-05T14:34:21.651Z'),
      justificativa_remarcacao: 'atestado médico',
    };

    (prisma.reuniao_Processo.update as jest.Mock).mockResolvedValue(
      mockReuniaoUpdate,
    );

    const result: UpdateReunioesDto = await service.atualizarData('M7Hi3w', mockParams);

    expect(result).not.toBeNull();
    expect(result).toEqual(mockReuniaoUpdate);
    expect(prisma.reuniao_Processo.update).toHaveBeenCalledWith({
      where: { id: expect.any(String) },
      data: mockParams,
    });
  });

  it('deverá buscar reuniões por uma data especifica', async () => {
    const dataFixa = new Date('2025-01-05T14:34:21.651Z');
    const mockFindReuniao: Reuniao_Processo[] = [
      {
        id: 'M7Hi3w',
        inicial_id: 112,
        data_reuniao: dataFixa,
        data_processo: dataFixa,
        nova_data_reuniao: dataFixa,
        justificativa_remarcacao: 'queda de energia na data e horário marcado',
        criado_em: dataFixa,
        alterado_em: dataFixa,
      },
    ];

    (prisma.reuniao_Processo.findMany as jest.Mock).mockResolvedValue(
      mockFindReuniao,
    );

    const result: Reuniao_Processo[] = await service.buscarPorData(dataFixa);

    expect(result).not.toBeNull();
    expect(result).toEqual(mockFindReuniao);
    expect(prisma.reuniao_Processo.findMany).toHaveBeenCalledTimes(1)
    expect(prisma.reuniao_Processo.findMany).toHaveBeenCalledWith({
      where: {
        OR: [
          { nova_data_reuniao: { equals: dataFixa.toISOString() } },
          {
            nova_data_reuniao: null,
            data_reuniao: { equals: dataFixa.toISOString() },
          },
        ],
      },
      include: {
        inicial: true,
      },
    });
  });
});
