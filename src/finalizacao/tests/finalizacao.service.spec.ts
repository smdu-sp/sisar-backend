import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../../prisma/prisma.service';
import { FinalizacaoService } from '../finalizacao.service';
import { AppService } from 'src/app.service';
import { CreateFinalizacaoDto } from '../dto/create-finalizacao.dto';
import { Conclusao } from '@prisma/client';

describe('FinalizacaoService tests', () => {
  let service: FinalizacaoService;
  let prisma: PrismaService;
  let app: AppService;

  // Configurando mock para o serviço do prisma.
  const mockPrismaService = {
    inicial: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn()
    },
    conclusao: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn()
    },
  };
  // Configurando mock para o serviço do app.
  const mockAppService = {
    app: {
      verificaPagina: jest.fn()
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FinalizacaoService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: AppService, useValue: mockAppService }
      ]
    }).compile();
    service = module.get<FinalizacaoService>(FinalizacaoService);
    prisma = module.get<PrismaService>(PrismaService);
    app = module.get<AppService>(AppService);
  });

  // Testando a definição do service, prisma e app
  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(prisma).toBeDefined();
    expect(app).toBeDefined();
  });

  /**
   * 
   * Testando chamada do serviço de "criar"
   * 
   */
  it('should call prisma.conclusao.create and prisma.inicial.update when create is called', async () => {
    // Criando o objeto mockado de retorno da chamada "criar".
    const mockCreateResult: CreateFinalizacaoDto = { inicial_id: 123, data_apostilamento: new Date(), data_conclusao: new Date(), data_emissao: new Date(), data_outorga: new Date(), data_resposta: new Date(), data_termo: new Date(), num_alvara: "string", obs: 'string', outorga: false };
    // Configura o retorno do método mockado
    (prisma.conclusao.create as jest.Mock).mockResolvedValue(mockCreateResult);
    (prisma.inicial.update as jest.Mock).mockResolvedValue(null);

    // Chama o método do serviço, fornecendo o CreateFinalizacaoDto.
    const result: Conclusao = await service.criar(mockCreateResult, true);

    // Testa se o resultado não é nulo.
    expect(result).not.toBeNull();
    // Verifica se o método create mockado de conclusão foi chamado corretamente.
    expect(prisma.conclusao.create).toHaveBeenCalledWith({ 
      data: mockCreateResult 
    });
    // Verifica se o método update mockado de inicial foi chamado corretamente.
    expect(prisma.inicial.update).toHaveBeenCalledWith({ 
      where: { 
        id: expect.any(Number) 
      },
      data: { 
        status: expect.any(Number) 
      } 
    });
    // Verifica se o retorno está correto.
    expect(result).toEqual(mockCreateResult);
  });

});
