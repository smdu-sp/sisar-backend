import { SubprefeituraService } from '../subprefeitura.service';
import { SubprefeituraResponseDTO } from '../dto/subprefeitura-response.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { AppService } from 'src/app.service';
import { Test, TestingModule } from '@nestjs/testing';

describe('SubprefeituraService Test', () => {
  let service: SubprefeituraService;
  let prisma: PrismaService;
  let app: AppService;

  const MockPrismaService = {
    subprefeitura: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    unidade: {
      findUnique: jest.fn(),
      update: jest.fn(),
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
    app = module.get<AppService>(AppService);
  });

  it('should be defined / se os serviços estão definidos', () => {
    expect(service).toBeDefined();
    expect(prisma).toBeDefined();
    expect(app).toBeDefined();
  });

  it('deve verificar se o metodo create cria uma subprefeitura', async () => {
    const mockCreateResult: SubprefeituraResponseDTO = {
      id: 'a1e2c4v6u8',
      nome: 'Subprefeitura da Sé',
      sigla: 'SBS',
      status: 1,
      criado_em: new Date('2025-01-29T19:08:50.340Z'),
      alterado_em: new Date('2025-01-29T19:08:50.340Z'),
    };

    (prisma.subprefeitura.findUnique as jest.Mock).mockResolvedValue(null);
    (prisma.subprefeitura.create as jest.Mock).mockResolvedValue(
      mockCreateResult,
    );

    const result: SubprefeituraResponseDTO = await service.criar({
      nome: 'Subprefeitura da Sé',
      sigla: 'SBS',
      status: 1,
    });

    ///teste de criação

    expect(result).not.toBeNull();

    expect(prisma.subprefeitura.findUnique).toHaveBeenCalledWith({
      where: {
        nome: 'Subprefeitura da Sé',
      },
    });

    //verifica se existe uma subprefeitura com o mesmo nome

    expect(prisma.subprefeitura.create).toHaveBeenCalledWith({
      data: {
        nome: 'Subprefeitura da Sé',
        sigla: 'SBS',
        status: 1,
      },
    });

    expect(result).toEqual(mockCreateResult);
  });

  ///teste de listagem de lista vazia

  it('deve validar se listaCompleta retorna uma lista vazia de subprefeituras', async () => {
    (prisma.subprefeitura.findMany as jest.Mock).mockResolvedValue([]);

    const result: SubprefeituraResponseDTO[] = await service.listaCompleta();

    expect(result).toEqual([]);

    expect(prisma.subprefeitura.findMany).toHaveBeenCalledWith({
      orderBy: { nome: 'asc' },
    });
  });

  ///teste de listagem de subprefeituras ordenadas

  it('deve validar se listaCompleta retorna uma lista de subprefeituras', async () => {
    const mockSubprefeituras: SubprefeituraResponseDTO[] = [
      {
        id: 'u1ab7u89',
        nome: 'Subprefeitura da Sé',
        sigla: 'SBS',
        status: 1,
        criado_em: new Date('2023-01-01T00:00:00.000Z'),
        alterado_em: new Date('2023-01-01T00:00:00.000Z'),
      },
      {
        id: 'u2act91',
        nome: 'Subprefeitura Ermelino Matarazzo',
        sigla: 'SBEM',
        status: 1,
        criado_em: new Date('2023-01-02T00:00:00.000Z'),
        alterado_em: new Date('2023-01-02T00:00:00.000Z'),
      },
      {
        id: 'u3adv12',
        nome: 'Subprefeitura de Itaquera',
        sigla: 'SBI',
        status: 1,
        criado_em: new Date('2023-01-03T00:00:00.000Z'),
        alterado_em: new Date('2023-01-03T00:00:00.000Z'),
      },
    ];

    (prisma.subprefeitura.findMany as jest.Mock).mockResolvedValue(
      mockSubprefeituras,
    );

    const result: SubprefeituraResponseDTO[] = await service.listaCompleta();

    expect(result).toEqual(mockSubprefeituras);

    expect(prisma.subprefeitura.findMany).toHaveBeenCalledWith({
      orderBy: { nome: 'asc' },
    });
  });

  ///teste buscar por id

  it('deve validar se buscarPorId encontra uma subprefeitura com um ID correto sendo passado', async () => {
    const mockSubprefeitura: SubprefeituraResponseDTO = {
      id: 'u1ab7u89',
      nome: 'Subprefeitura da Sé',
      sigla: 'SMAAP',
      status: 1,
      criado_em: new Date('2023-01-01T00:00:00.000Z'),
      alterado_em: new Date('2023-01-01T00:00:00.000Z'),
    };

    (prisma.subprefeitura.findUnique as jest.Mock).mockResolvedValue(
      mockSubprefeitura,
    );

    const result: SubprefeituraResponseDTO =
      await service.buscarPorId('u1ab7u89');

    expect(result).toEqual(mockSubprefeitura);

    expect(prisma.subprefeitura.findUnique).toHaveBeenCalledWith({
      where: {
        id: expect.any(String),
      },
    });
  });

  ///testando desativar subprefeitura

  it('deve validar se delete modifica o status de uma subprefeitura para inativo', async () => {
    const mockSubprefeituraFind = {
      id: 'a1u7900b',
      nome: 'Subprefeitura de São Mateus',
      sigla: 'SBSM',
      status: 1,
      criado_em: new Date('2023-01-01T00:00:00.000Z'),
      alterado_em: new Date('2023-01-01T00:00:00.000Z'),
    };
  
    (prisma.unidade.findUnique as jest.Mock).mockResolvedValue(mockSubprefeituraFind);
    (prisma.unidade.update as jest.Mock).mockResolvedValue({
      message: 'Unidade desativada com sucesso.',
    });
  
    const result: { message: string } = await service.desativar('a1u7900b');
  
    expect(result).toEqual({
      message: 'Unidade desativada com sucesso.',
    });
  
    expect(prisma.unidade.findUnique).toHaveBeenCalledWith({
      where: { id: expect.any(String) },
    });
  
    expect(prisma.unidade.update).toHaveBeenCalledWith({
      where: { id: expect.any(String) },
      data: { status: 0 },
    });
  });

  ///testando atualizar subprefeitura

  it('deve ser capaz de atualizar uma subprefeitura', async () => {
    const mockSubprefeituraUpdate = {
      id: 'a1u7900b',
      nome: 'Subprefeitura da Vila Romana',
      sigla: 'SBVR',
      status: 1,
      criado_em: new Date('2023-01-01T00:00:00.000Z'),
      alterado_em: new Date('2023-01-01T00:00:00.000Z'),
    };
  
    (prisma.subprefeitura.findUnique as jest.Mock).mockResolvedValue(mockSubprefeituraUpdate);
    jest.spyOn(service, 'buscaPorNome').mockResolvedValue(null);

    (prisma.subprefeitura.update as jest.Mock).mockResolvedValue(mockSubprefeituraUpdate);
  
    const mockUpdateParam = {
      nome: 'Subprefeitura da Sé',
      sigla: 'SBVR',
    };
  
    const result: SubprefeituraResponseDTO = await service.atualizar('a1u7900b', mockUpdateParam);
  
    expect(result).not.toBeNull();
  
    expect(prisma.subprefeitura.findUnique).toHaveBeenCalledWith({
      where: {
        id: expect.any(String),
      },
    });
  
    expect(service.buscaPorNome).toHaveBeenCalledWith(mockUpdateParam.nome);
  
    expect(prisma.subprefeitura.update).toHaveBeenCalledWith({
      where: {
        id: expect.any(String), 
      },
      data: mockUpdateParam, 
    });
  
    expect(result).toEqual(mockSubprefeituraUpdate);
  });

  ///testando a funcionalidade buscarTudo

  it('deve retornar uma lista de subprefeituras com a paginação correta', async () => {
    const mockSubprefeituraList = [
      {
        id: 'u1ab7u89',
        nome: 'Subprefeitura da Sé',
        sigla: 'SBS',
        status: 1,
        criado_em: new Date('2023-01-01T00:00:00.000Z'),
        alterado_em: new Date('2023-01-01T00:00:00.000Z'),
      },
      {
        id: 'u2act91',
        nome: 'Subprefeitura Ermelino Matarazzo',
        sigla: 'SBEM',
        status: 1,
        criado_em: new Date('2023-01-02T00:00:00.000Z'),
        alterado_em: new Date('2023-01-02T00:00:00.000Z'),
      },
      {
        id: 'u3adv12',
        nome: 'Subprefeitura de Itaquera',
        sigla: 'SBI',
        status: 1,
        criado_em: new Date('2023-01-03T00:00:00.000Z'),
        alterado_em: new Date('2023-01-03T00:00:00.000Z'),
      },
    ];
  
    const mockExpected = {
      total: 3,
      pagina: 1,
      limite: 10,
      data: mockSubprefeituraList,
    };
  
    const mockParams = {
      pagina: 1,
      limite: 10,
      busca: 'Subprefeitura',
    };
  
    (prisma.subprefeitura.count as jest.Mock).mockResolvedValue(3);
  
    jest.spyOn(app, 'verificaPagina').mockReturnValue([1, 10]);
  
    (prisma.subprefeitura.findMany as jest.Mock).mockResolvedValue(mockSubprefeituraList);
  
    const result = await service.buscarTudo(mockParams.pagina, mockParams.limite, mockParams.busca);
  
    expect(result).not.toBeNull(); 
    expect(result).toEqual(mockExpected); 
  
    expect(app.verificaPagina).toHaveBeenCalledWith(mockParams.pagina, mockParams.limite); 
    expect(prisma.subprefeitura.count).toHaveBeenCalledWith({
      where: {
        OR: [
          { nome: { contains: mockParams.busca } },
          { sigla: { contains: mockParams.busca } },
        ],
      },
    }); 
    expect(prisma.subprefeitura.findMany).toHaveBeenCalledWith({
      where: {
        OR: [
          { nome: { contains: mockParams.busca } },
          { sigla: { contains: mockParams.busca } },
        ],
      },
      skip: (mockParams.pagina - 1) * mockParams.limite, 
      take: mockParams.limite,
    }); 
  });
});
