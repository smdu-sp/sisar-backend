import { SubprefeituraService } from '../subprefeitura.service';
import { SubprefeituraResponseDTO } from '../dto/subprefeitura-response.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { AppService } from 'src/app.service';
import { Test, TestingModule } from '@nestjs/testing';
import { CreateSubprefeituraDto } from '../dto/create-subprefeitura.dto';

describe('SubprefeituraService Test', () => {
  let service: SubprefeituraService;
  let prisma: PrismaService;

  const MockPrismaService = {
    subprefeitura: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  const MockAppService = {
    verificaPagina: jest
      .fn()
      .mockImplementation((pagina, limite) => [pagina, limite]),
    verificaLimite: jest
      .fn()
      .mockImplementation((pagina, limite, total) => [pagina, limite]),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SubprefeituraService,
        {
          provide: PrismaService,
          useValue: MockPrismaService,
        },
        {
          provide: AppService,
          useValue: MockAppService,
        },
      ],
    }).compile();
    service = module.get<SubprefeituraService>(SubprefeituraService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined / se os serviços estão definidos', () => {
    expect(service).toBeDefined();
    expect(prisma).toBeDefined();
  });

  it('should call prisma.subprefeitura.create when create is called', async () => {
    const mockCreateResult: SubprefeituraResponseDTO = {
      id: 'a1e2c4v6u8',
      nome: 'Secretaria Municipal de Etnias e Povoados Indígenas Urbanos',
      sigla: 'SMEPIU',
      status: 1,
      criado_em: new Date('2025-01-29T19:08:50.340Z'),
      alterado_em: new Date('2025-01-29T19:08:50.340Z'),
    };
  
    // Correção: Separe as chamadas do mock
    (prisma.subprefeitura.findUnique as jest.Mock).mockResolvedValue(null);
    (prisma.subprefeitura.create as jest.Mock).mockResolvedValue(mockCreateResult);
  
    const result: SubprefeituraResponseDTO = await service.criar({
      nome: 'Secretaria Municipal de Etnias e Povoados Indígenas Urbanos',
      sigla: 'SMEPIU',
      status: 1,
    });
  
    expect(result).not.toBeNull();
  
    expect(prisma.subprefeitura.findUnique).toHaveBeenCalledWith({
      where: {
        nome: 'Secretaria Municipal de Etnias e Povoados Indígenas Urbanos', // A busca deve ser pelo nome, não pelo id
      },
    });
  
    expect(prisma.subprefeitura.create).toHaveBeenCalledWith({
      data: {
        nome: 'Secretaria Municipal de Etnias e Povoados Indígenas Urbanos',
        sigla: 'SMEPIU',
        status: 1,
      },
    });
  
    expect(result).toEqual(mockCreateResult);
  });

  
});
