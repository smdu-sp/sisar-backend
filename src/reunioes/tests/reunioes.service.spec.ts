import { UpdateReunioesDto } from '../dto/update-reunioes.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { Reuniao_Processo } from '@prisma/client';
import { ReunioesService } from '../reunioes.service';
import { Test, TestingModule } from '@nestjs/testing';

describe('Reunioes.service test', () => {
  let service: ReunioesService;
  let prisma: PrismaService;
  // let reuniao: Reuniao_Processo;

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
        id: "M4Hy3w",
        inicial_id: 111,
        data_reuniao: new Date("2025-02-05T14:34:21.651Z"),
        data_processo: new Date("2025-02-05T14:34:21.651Z"),
        nova_data_reuniao: new Date("2025-02-05T14:34:21.651Z"),
        justificativa_remarcacao: "queda de energia na data e horário marcado",
        criado_em: new Date("2025-02-05T14:34:21.651Z"),
        alterado_em: new Date("2025-02-05T14:34:21.651Z")
      },
      {
        id: "M7Hi3w",
        inicial_id: 112,
        data_reuniao: new Date("2025-02-05T14:34:21.651Z"),
        data_processo: new Date("2025-02-05T14:34:21.651Z"),
        nova_data_reuniao: new Date("2025-02-05T14:34:21.651Z"),
        justificativa_remarcacao: "queda de energia na data e horário marcado",
        criado_em: new Date("2025-02-05T14:34:21.651Z"),
        alterado_em: new Date("2025-02-05T14:34:21.651Z")
      }
    ];

    (prisma.reuniao_Processo.findMany as jest.Mock).mockResolvedValue(mockListReunioes)

    const result = await service.listaCompleta()

    expect(result).not.toBeNull()
    expect(result).toEqual(mockListReunioes)
    expect(prisma.reuniao_Processo.findMany).toHaveBeenCalledWith({
      orderBy:{
        data_reuniao: 'asc'
      }
    })

  })
});
