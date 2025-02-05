import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../../prisma/prisma.service';
import { AppService } from 'src/app.service';
import { ParecerAdmissibilidadeService } from '../parecer_admissibilidade.service';
import { CreateParecerAdmissibilidadeDto } from '../dto/create-parecer_admissibilidade.dto';
import { Parecer_Admissibilidade } from '@prisma/client';
import { ParecerAdmissibilidadePaginadoDTO, ParecerAdmissibilidadeResponseDTO } from '../dto/parecer_admissibilidade-resopnse.dto';
import { UpdateParecerAdmissibilidadeDto } from '../dto/update-parecer_admissibilidade.dto';

describe('ParecerAdmissibilidadeService tests', () => {
  let service: ParecerAdmissibilidadeService;
  let prisma: PrismaService;
  let app: AppService;

  // Configurando mock para o serviço do prisma.
  const mockPrismaService = {
    parecer_Admissibilidade: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn()
    }
  };
  // Configurando mock para o serviço do app.
  const mockAppService = {
    verificaPagina: jest.fn(),
    verificaLimite: jest.fn()
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ParecerAdmissibilidadeService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: AppService, useValue: mockAppService }
      ]
    }).compile();
    service = module.get<ParecerAdmissibilidadeService>(ParecerAdmissibilidadeService);
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
  it(
    'Deve envocar prisma.parecer_Admissibilidade.create e prisma.parecer_Admissibilidade.create quando executar função criar.', 
    async () => {
      // Criando o objeto mockado de retorno da chamada "criar".
      const mockCreateResult: CreateParecerAdmissibilidadeDto = { parecer: "", status: 1 };
      // Configura o retorno do método mockado
      (prisma.parecer_Admissibilidade.findFirst as jest.Mock).mockResolvedValue(null);
      (prisma.parecer_Admissibilidade.create as jest.Mock).mockResolvedValue(mockCreateResult);

      // Chama o método do serviço, fornecendo o CreateFinalizacaoDto.
      const result: Parecer_Admissibilidade = await service.criar(mockCreateResult);

      // Testa se o resultado não é nulo.
      expect(result).not.toBeNull();
      // Verifica se o método update mockado de inicial foi chamado corretamente.
      expect(prisma.parecer_Admissibilidade.findFirst).toHaveBeenCalledWith({ 
        where: { 
          parecer: expect.any(String) 
        }
      });
      // Verifica se o método create mockado de conclusão foi chamado corretamente.
      expect(prisma.parecer_Admissibilidade.create).toHaveBeenCalledWith({ 
        data: mockCreateResult 
      });
      // Verifica se o retorno está correto.
      expect(result).toEqual(mockCreateResult);
    }
  );

  /**
   * 
   * Testando chamada do serviço de "buscarTudo"
   * 
   */
  it('Deve envocar prisma.parecer_Admissibilidade.findMany quando buscarTudo é executada.', async () => {
    // Configura o retorno dos métodos mockados
    (app.verificaPagina as jest.Mock).mockReturnValue([0, 10]);
    (prisma.parecer_Admissibilidade.count as jest.Mock).mockResolvedValue(10);
    (app.verificaLimite as jest.Mock).mockReturnValue([0, 10]);
    (prisma.parecer_Admissibilidade.findMany as jest.Mock).mockResolvedValue([]);

    // Chama o método do serviço, fornecendo pagina e limite.
    const result: ParecerAdmissibilidadePaginadoDTO = await service.buscarTudo(0, 10, 'search');

    // Testa se o resultado não é nulo.
    expect(result).not.toBeNull();
    // Verifica se o método count mockado de parecer admissibilidade foi chamado corretamente.
    expect(prisma.parecer_Admissibilidade.count).toHaveBeenCalled();
    // Verifica se o método findMany mockado de parecer admissibilidade foi chamado corretamente.
    expect(prisma.parecer_Admissibilidade.findMany).toHaveBeenCalledWith({ 
      where: {
        OR: [
          { 
            parecer: { 
              contains: 'search'
            } 
          },
        ]
      },
      orderBy: { 
        parecer: 'asc'
      },
      skip: -10,
      take: 10
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
  it('Deve envocar prisma.parecer_Admissibilidade.findUnique quando função buscarUm é executada.', async () => {
    const mockFindUniqueResult: ParecerAdmissibilidadeResponseDTO = { id: '2', parecer: "", status: 1, criado_em: new Date(), alterado_em: new Date() };
    // Configura o retorno dos métodos mockados
    (prisma.parecer_Admissibilidade.findUnique as jest.Mock).mockResolvedValue(mockFindUniqueResult);

    // Chama o método do serviço, fornecendo pagina e limite.
    const result: Parecer_Admissibilidade = await service.buscarPorId('3');

    // Testa se o resultado não é nulo.
    expect(result).not.toBeNull();
    // Verifica se o método findUnique mockado de conclusão foi chamado corretamente.
    expect(prisma.parecer_Admissibilidade.findUnique).toHaveBeenCalledWith({ 
      where: {
        id: expect.any(String)
      }
    });
    // Verifica se o retorno está correto.
    expect(result).toEqual(mockFindUniqueResult);
    expect(result.id).toEqual(mockFindUniqueResult.id);
  });

  /**
   * 
   * Testando chamada do serviço de "atualizar"
   * 
   */
  it('Deve chamar prisma.parecer_Admissibilidade.update quando função atualizar é executada.', async () => {
    const mockFindUniqueResult: ParecerAdmissibilidadeResponseDTO = { id: '2', parecer: "", status: 1, criado_em: new Date(), alterado_em: new Date() };
    const mockUpdateRequest: UpdateParecerAdmissibilidadeDto = { parecer: "", status: 1 };
    // Configura o retorno dos métodos mockados
    (prisma.parecer_Admissibilidade.findUnique as jest.Mock).mockResolvedValue(mockFindUniqueResult);
    (prisma.parecer_Admissibilidade.update as jest.Mock).mockResolvedValue(mockFindUniqueResult);

    // Chama o método do serviço, id e UpdateFinalizacaoDto.
    const result: ParecerAdmissibilidadeResponseDTO = await service.atualizar('3', mockUpdateRequest);

    // Testa se o resultado não é nulo.
    expect(result).not.toBeNull();
    // Verifica se findUnique foi chamado corretamente.
    expect(prisma.parecer_Admissibilidade.findUnique).toHaveBeenCalledWith({ 
      where: {
        id: expect.any(String)
      },
    });
    // Verifica se o método update mockado de conclusão foi chamado corretamente.
    expect(prisma.parecer_Admissibilidade.update).toHaveBeenCalledWith({ 
      where: {
        id: expect.any(String)
      },
      data: mockUpdateRequest
    });
    // Verifica se o retorno está correto.
    expect(result).toEqual(mockFindUniqueResult);
    expect(result.status).toEqual(mockFindUniqueResult.status);
  });
});
