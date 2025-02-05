import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../../prisma/prisma.service';
import { FinalizacaoService } from '../finalizacao.service';
import { AppService } from 'src/app.service';
import { CreateFinalizacaoDto } from '../dto/create-finalizacao.dto';
import { Conclusao } from '@prisma/client';
import { FinalizacaoPaginado } from '../dto/finalizacao-response.dto';
import { UpdateFinalizacaoDto } from '../dto/update-finalizacao.dto';

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
    verificaPagina: jest.fn(),
    verificaLimite: jest.fn()
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
  it('Testando a definição do service, prisma e app', () => {
    expect(service).toBeDefined();
    expect(prisma).toBeDefined();
    expect(app).toBeDefined();
  });

  /**
   * 
   * Testando chamada do serviço de "criar"
   * 
   */
  it('Deve envocar prisma.conclusao.create e prisma.inicial.update quando executar função criar.', async () => {
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

  /**
   * 
   * Testando chamada do serviço de "buscarTudo"
   * 
   */
  it('Deve envocar prisma.inicial.findMany quando buscarTudo é executada.', async () => {
    // Configura o retorno dos métodos mockados
    (app.verificaPagina as jest.Mock).mockReturnValue([0, 10]);
    (prisma.conclusao.count as jest.Mock).mockResolvedValue(10);
    (app.verificaLimite as jest.Mock).mockReturnValue([0, 10]);
    (prisma.conclusao.findMany as jest.Mock).mockResolvedValue([]);

    // Chama o método do serviço, fornecendo pagina e limite.
    const result: FinalizacaoPaginado = await service.buscarTudo(0, 10, 'search');

    // Testa se o resultado não é nulo.
    expect(result).not.toBeNull();
    // Verifica se o método count mockado de conclusão foi chamado corretamente.
    expect(prisma.conclusao.count).toHaveBeenCalled();
    // Verifica se o método findMany mockado de conclusão foi chamado corretamente.
    expect(prisma.conclusao.findMany).toHaveBeenCalledWith({ 
      where: {
        OR: [
          { 
            obs: { contains: expect.any(String) }
          },
        ]
      },
      include: { 
        inicial: expect.any(Boolean) 
      },
      skip: expect.any(Number),
      take: expect.any(Number)
    });
    // Verifica se o retorno está correto.
    expect(result).toEqual({ data: [], total: 10, pagina: 0, limite: 10 });
    expect(result.limite).toEqual({ data: [], total: 10, pagina: 0, limite: 10 }.limite);
  });

  /**
   * 
   * Testando chamada do serviço de "buscaId"
   * 
   */
  it('Deve envocar prisma.inicial.findUnique quando função buscarUm é executada.', async () => {
    const mockFindUniqueResult: Conclusao = { inicial_id: 123, data_apostilamento: new Date(), data_conclusao: new Date(), data_emissao: new Date(), data_outorga: new Date(), data_resposta: new Date(), data_termo: new Date(), num_alvara: "string", obs: 'string', outorga: false, criado_em: new Date(), alterado_em: new Date() };
    // Configura o retorno dos métodos mockados
    (prisma.conclusao.findUnique as jest.Mock).mockResolvedValue(mockFindUniqueResult);

    // Chama o método do serviço, fornecendo pagina e limite.
    const result: Conclusao = await service.buscaId(3);

    // Testa se o resultado não é nulo.
    expect(result).not.toBeNull();
    // Verifica se o método findUnique mockado de conclusão foi chamado corretamente.
    expect(prisma.conclusao.findUnique).toHaveBeenCalledWith({ 
      where: {
        inicial_id: expect.any(Number)
      }
    });
    // Verifica se o retorno está correto.
    expect(result).toEqual(mockFindUniqueResult);
    expect(result.outorga).toEqual(mockFindUniqueResult.outorga);
  });

  /**
   * 
   * Testando chamada do serviço de "atualizar"
   * 
   */
  it('Deve chamar prisma.conclusao.update quando função atualizar é executada.', async () => {
    const mockUpdateResult: Conclusao = { inicial_id: 123, data_apostilamento: new Date(), data_conclusao: new Date(), data_emissao: new Date(), data_outorga: new Date(), data_resposta: new Date(), data_termo: new Date(), num_alvara: "string", obs: 'string', outorga: false, criado_em: new Date(), alterado_em: new Date() };
    const mockUpdateDto: UpdateFinalizacaoDto = { inicial_id: 123, data_apostilamento: new Date(), data_conclusao: new Date(), data_emissao: new Date(), data_outorga: new Date(), data_resposta: new Date(), data_termo: new Date(), num_alvara: "string", obs: 'string', outorga: false };
    // Configura o retorno dos métodos mockados
    (prisma.conclusao.update as jest.Mock).mockResolvedValue(mockUpdateResult);

    // Chama o método do serviço, id e UpdateFinalizacaoDto.
    const result: Conclusao = await service.atualizar(3, mockUpdateDto);

    // Testa se o resultado não é nulo.
    expect(result).not.toBeNull();
    // Verifica se o método update mockado de conclusão foi chamado corretamente.
    expect(prisma.conclusao.update).toHaveBeenCalledWith({ 
      where: {
        inicial_id: expect.any(Number)
      },
      data: mockUpdateDto
    });
    // Verifica se o retorno está correto.
    expect(result).toEqual(mockUpdateResult);
    expect(result.num_alvara).toEqual(mockUpdateResult.num_alvara);
  });
});
