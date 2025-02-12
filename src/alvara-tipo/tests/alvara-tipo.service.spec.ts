import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../../prisma/prisma.service';
import { AppService } from 'src/app.service';
import { AlvaraTipoService } from '../alvara-tipo.service';
import { AlvaraTipoPaginadoDTO, AlvaraTipoResponseDTO } from '../dto/alvara-tipo-responses.dto';
import { CreateAlvaraTipoDto } from '../dto/create-alvara-tipo.dto';
import { Alvara_Tipo } from '@prisma/client';

describe('AlvaraTipoService tests', () => {
  let service: AlvaraTipoService;
  let prisma: PrismaService;
  let app: AppService;

  // Configurando mock para o serviço do prisma.
  const mockPrismaService = {
    alvara_Tipo: {
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

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AlvaraTipoService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: AppService, useValue: mockAppService }
      ]
    }).compile();
    service = module.get<AlvaraTipoService>(AlvaraTipoService);
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
   * Testando chamada do serviço de "verificaSeExiste"
   * 
   */
  it(
    'Deve envocar prisma.alvara_Tipo.findFirst quando executar função verificaSeExiste.', 
    async () => {
      // Configura o retorno do método mockado
      (prisma.alvara_Tipo.findFirst as jest.Mock).mockResolvedValue(null);
      
      // Chama o método do serviço, fornecendo o nome e id.
      const result_one: void = await service.verificaSeExiste("", "");
      
      // Testa se o resultado não é nulo.
      expect(result_one).not.toBeNull();
      // Verifica se o método findFirst mockado foi chamado corretamente.
      expect(prisma.alvara_Tipo.findFirst).toHaveBeenCalledWith({ 
        where: { 
          nome: expect.any(String)
        }
      });
      // Verifica se o retorno está correto.
      expect(result_one).not.toThrow;
    }
  );

  /**
   * 
   * Testando chamada do serviço de "criar"
   * 
   */
  it(
    'Deve envocar prisma.alvara_Tipo.findFirst e prisma.alvara_Tipo.create quando executar função criar.', 
    async () => {
      // Criando o objeto mockado de retorno da chamada "criar".
      const mockFindResult: CreateAlvaraTipoDto = {
        nome: "",
        prazo_admissibilidade_smul: 7,
        reconsideracao_smul: 6,
        reconsideracao_smul_tipo: 5,
        analise_reconsideracao_smul: 4,
        prazo_analise_smul1: 4,
        prazo_analise_smul2: 3,
        prazo_emissao_alvara_smul: 2,
        prazo_admissibilidade_multi: 2,
        reconsideracao_multi: 2,
        reconsideracao_multi_tipo: 1,
        analise_reconsideracao_multi: 1,
        prazo_analise_multi1: 1,
        prazo_analise_multi2: 1,
        prazo_comunique_se: 1,
        prazo_encaminhar_coord: 1,
        status: 1
      };
      // Configura o retorno do método mockado
      (prisma.alvara_Tipo.findFirst as jest.Mock).mockResolvedValue(null);
      (prisma.alvara_Tipo.create as jest.Mock).mockResolvedValue(mockFindResult);

      // Chama o método do serviço, fornecendo o CreateAlvaraTipoDto.
      const result: Alvara_Tipo = await service.criar(mockFindResult);

      // Testa se o resultado não é nulo.
      expect(result).not.toBeNull();
      // Verifica se o método findFirst mockado foi chamado corretamente.
      expect(prisma.alvara_Tipo.findFirst).toHaveBeenCalledWith({ 
        where: { 
          nome: expect.any(String) 
        }
      });
      // Verifica se o método create mockado foi chamado corretamente.
      expect(prisma.alvara_Tipo.create).toHaveBeenCalledWith({ 
        data: { ...mockFindResult } 
      });
      // Verifica se o retorno está correto.
      expect(result).toEqual(mockFindResult);
    }
  );

  /**
   * 
   * Testando chamada do serviço de "buscarTudo"
   * 
   */
  it(
    'Deve envocar prisma.alvara_Tipo.findMany e prisma.alvara_Tipo.count quando buscarTudo é executada.', 
    async () => {
      // Configura o retorno dos métodos mockados
      (app.verificaPagina as jest.Mock).mockReturnValue([0, 10]);
      (prisma.alvara_Tipo.count as jest.Mock).mockResolvedValue(10);
      (app.verificaLimite as jest.Mock).mockReturnValue([0, 10]);
      (prisma.alvara_Tipo.findMany as jest.Mock).mockResolvedValue([]);

      // Chama o método do serviço, fornecendo pagina e limite.
      const result: AlvaraTipoPaginadoDTO = await service.buscarTudo(0, 10, 'search');

      // Testa se o resultado não é nulo.
      expect(result).not.toBeNull();
      // Verifica se o método count mockado de alvará tipo foi chamado corretamente.
      expect(prisma.alvara_Tipo.count).toHaveBeenCalled();
      // Verifica se o método findMany mockado de alvará tipo foi chamado corretamente.
      expect(prisma.alvara_Tipo.findMany).toHaveBeenCalledWith({ 
        where: {
          OR: [
            { 
              nome: { 
                contains: 'search'
              } 
            },
          ]
        },
        orderBy: { 
          criado_em: 'desc'
        },
        skip: expect.any(Number),
        take: expect.any(Number)
      });
      // Verifica se o retorno está correto.
      expect(result).toEqual({ data: [], total: 10, pagina: 0, limite: 10 });
      expect(result.limite).toEqual({ data: [], total: 10, pagina: 0, limite: 10 }.limite);
    }
  );

  /**
   * 
   * Testando chamada do serviço de "buscaId"
   * 
   */
  it('Deve envocar prisma.alvara_Tipo.findUnique quando função buscarUm é executada.', async () => {
    const mockFindUniqueResult: AlvaraTipoResponseDTO = { 
      id: "",
      nome: "",
      prazo_admissibilidade_smul: 1,
      reconsideracao_smul: 1,
      reconsideracao_smul_tipo: 1,
      analise_reconsideracao_smul: 2,
      prazo_analise_smul1: 3,
      prazo_analise_smul2: 4,
      prazo_emissao_alvara_smul: 5,
      prazo_admissibilidade_multi: 6,
      reconsideracao_multi: 7,
      reconsideracao_multi_tipo: 8,
      analise_reconsideracao_multi: 9,
      prazo_analise_multi1: 10,
      prazo_analise_multi2: 3,
      prazo_emissao_alvara_multi: 4,
      prazo_comunique_se: 5,
      prazo_encaminhar_coord: 6,
      status: 1
    };
    // Configura o retorno dos métodos mockados
    (prisma.alvara_Tipo.findFirst as jest.Mock).mockResolvedValue(mockFindUniqueResult);

    // Chama o método do serviço, fornecendo pagina e limite.
    const result: Alvara_Tipo = await service.buscarPorId('3');

    // Testa se o resultado não é nulo.
    expect(result).not.toBeNull();
    // Verifica se o método findFirst mockado de alvará-tipo foi chamado corretamente.
    expect(prisma.alvara_Tipo.findFirst).toHaveBeenCalledWith({ 
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
  it('Deve chamar prisma.alvara_Tipo.update e prisma.alvara_Tipo.findFirst quando função atualizar é executada.', async () => {
    const mockFindFirstResult: AlvaraTipoResponseDTO = { 
      id: "",
      nome: "",
      prazo_admissibilidade_smul: 1,
      reconsideracao_smul: 1,
      reconsideracao_smul_tipo: 1,
      analise_reconsideracao_smul: 2,
      prazo_analise_smul1: 3,
      prazo_analise_smul2: 4,
      prazo_emissao_alvara_smul: 5,
      prazo_admissibilidade_multi: 6,
      reconsideracao_multi: 7,
      reconsideracao_multi_tipo: 8,
      analise_reconsideracao_multi: 9,
      prazo_analise_multi1: 10,
      prazo_analise_multi2: 3,
      prazo_emissao_alvara_multi: 4,
      prazo_comunique_se: 5,
      prazo_encaminhar_coord: 6,
      status: 1
    };
    // Configura o retorno dos métodos mockados
    (prisma.alvara_Tipo.findFirst as jest.Mock).mockResolvedValue(mockFindFirstResult);
    (prisma.alvara_Tipo.update as jest.Mock).mockResolvedValue(mockFindFirstResult);

    // Chama o método do serviço, id e objeto.
    const result: AlvaraTipoResponseDTO = await service.atualizar('3', mockFindFirstResult);

    // Testa se o resultado não é nulo.
    expect(result).not.toBeNull();
    // Verifica se findFirst foi chamado corretamente.
    expect(prisma.alvara_Tipo.findFirst).toHaveBeenCalledWith({ 
      where: {
        id: expect.any(String)
      },
    });
    // Verifica se o método update mockado de alvará-tipo foi chamado corretamente.
    expect(prisma.alvara_Tipo.update).toHaveBeenCalledWith({ 
      where: {
        id: expect.any(String)
      },
      data: mockFindFirstResult
    });
    // Verifica se o retorno está correto.
    expect(result).toEqual(mockFindFirstResult);
    expect(result.status).toEqual(mockFindFirstResult.status);
  });

    /**
   * 
   * Testando chamada do serviço de "alterarStatus"
   * 
   */
  it('Deve chamar prisma.alvara_Tipo.update e prisma.alvara_Tipo.findFirst quando função alterarStatus é executada.', async () => {
    const mockFindFirstResult: AlvaraTipoResponseDTO = { 
      id: "",
      nome: "",
      prazo_admissibilidade_smul: 1,
      reconsideracao_smul: 1,
      reconsideracao_smul_tipo: 1,
      analise_reconsideracao_smul: 2,
      prazo_analise_smul1: 3,
      prazo_analise_smul2: 4,
      prazo_emissao_alvara_smul: 5,
      prazo_admissibilidade_multi: 6,
      reconsideracao_multi: 7,
      reconsideracao_multi_tipo: 8,
      analise_reconsideracao_multi: 9,
      prazo_analise_multi1: 10,
      prazo_analise_multi2: 3,
      prazo_emissao_alvara_multi: 4,
      prazo_comunique_se: 5,
      prazo_encaminhar_coord: 6,
      status: 1
    };
    // Configura o retorno dos métodos mockados
    (prisma.alvara_Tipo.findFirst as jest.Mock).mockResolvedValue(mockFindFirstResult);
    (prisma.alvara_Tipo.update as jest.Mock).mockResolvedValue(mockFindFirstResult);

    // Chama o método do serviço, id e status.
    const result: AlvaraTipoResponseDTO = await service.alterarStatus('3', 1);

    // Testa se o resultado não é nulo.
    expect(result).not.toBeNull();
    // Verifica se findFirst foi chamado corretamente.
    expect(prisma.alvara_Tipo.findFirst).toHaveBeenCalledWith({ 
      where: {
        id: expect.any(String)
      },
    });
    // Verifica se o método update mockado de alvará-tipo foi chamado corretamente.
    expect(prisma.alvara_Tipo.update).toHaveBeenCalledWith({ 
      where: {
        id: expect.any(String)
      },
      data: {
        status: 1
      }
    });
    // Verifica se o retorno está correto.
    expect(result).toEqual(mockFindFirstResult);
    expect(result.status).toEqual(mockFindFirstResult.status);
  });
});
