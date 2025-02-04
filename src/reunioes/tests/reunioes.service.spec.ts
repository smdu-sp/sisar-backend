import { UpdateReunioesDto } from '../dto/update-reunioes.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { Reuniao_Processo } from '@prisma/client';
import { ReunioesService } from '../reunioes.service';
import { Test, TestingModule } from '@nestjs/testing';

describe('Reunioes.service test', () => {
  let service: ReunioesService;
  let prisma: PrismaService;

  const MockPrismaService = {
    reunioes: {
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

});




