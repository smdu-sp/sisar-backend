import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../../prisma/prisma.service';
import { AppService } from 'src/app.service';
import { InicialService } from '../inicial.service';
import { Inicial_Sqls } from '@prisma/client';
import { ForbiddenException } from '@nestjs/common';

describe('InicialService tests', () => {
  let service: InicialService;
  let prisma: PrismaService;
  let app: AppService;

  // Configurando mock para o serviço do prisma.
  const mockPrismaService = {
    inicial: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn()
    },
    inicial_Sqls: {
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
        InicialService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: AppService, useValue: mockAppService }
      ]
    }).compile();
    service = module.get<InicialService>(InicialService);
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
   * Testando chamada do serviço de "validaSql"
   * 
   */
  it(
    'Deve envocar prisma.inicial_Sqls.count quando executar função validaSql.', 
    async () => {
      // Configura o retorno do método mockado
      (prisma.inicial_Sqls.count as jest.Mock).mockResolvedValue(10);
      
      // Chama o método do serviço, fornecendo id.
      const result_one: boolean = await service.validaSql("7897293");
      
      // Testa se o resultado não é nulo.
      expect(result_one).not.toBeNull();
      // Verifica se o método count mockado foi chamado corretamente.
      expect(prisma.inicial_Sqls.count).toHaveBeenCalledWith({ 
        where: {
          sql: "7897293",
          criado_em: {
            gte: expect.any(Date)
          }
        }
      });
      // Verifica se o retorno está correto.
      expect(result_one).not.toThrow;
      expect(result_one).toBe(true);
    }
  );

  /**
   * 
   * Testando chamada do serviço de "validaSei"
   * 
   */
  it(
    'Deve envocar prisma.inicial.count quando executar função validaSei.', 
    async () => {
      // Configura o retorno do método mockado
      (prisma.inicial.count as jest.Mock).mockResolvedValue(10);
      
      // Chama o método do serviço, fornecendo id.
      const result_one: boolean = await service.validaSei("7897293");
      
      // Testa se o resultado não é nulo.
      expect(result_one).not.toBeNull();
      // Verifica se o método count mockado foi chamado corretamente.
      expect(prisma.inicial.count).toHaveBeenCalledWith({ 
        where: {
          sei: "7897293"
        }
      });
      // Verifica se o retorno está correto.
      expect(result_one).not.toThrow;
      expect(result_one).toBe(true);
    }
  );

  /**
   * 
   * Testando chamada do serviço de "adicionaSql"
   * 
   */
  it('Deve envocar prisma.inicial_Sqls.findFirst e prisma.inicial_Sqls.create quando executar função adicionaSql.', 
    async () => {
      // Configurando objetos de mock.
      const mockReturnValue: Inicial_Sqls = {
        id: "",
        inicial_id: 123,
        sql: "7897293",
        criado_em: new Date(),
        alterado_em: new Date()
      };
      // Configura o retorno do método mockado
      (prisma.inicial_Sqls.findFirst as jest.Mock).mockResolvedValue(null);
      (prisma.inicial_Sqls.create as jest.Mock).mockResolvedValue(mockReturnValue);

      // Chama o método do serviço, fornecendo id.
      const result_one: Inicial_Sqls | ForbiddenException = await service.adicionaSql(123, "7897293");
      
      // Testa se o resultado não é nulo.
      expect(result_one).not.toBeNull();
      // Verifica se o método findFirst mockado foi chamado corretamente.
      expect(prisma.inicial_Sqls.findFirst).toHaveBeenCalledWith({ 
        where: {
          sql: "7897293",
          inicial_id: 123
        }
      });
      // Verifica se o método create mockado foi chamado corretamente.
      expect(prisma.inicial_Sqls.create).toHaveBeenCalledWith({ 
        data: {
          sql: "7897293",
          inicial_id: 123
        }
      });
      // Verifica se o retorno está correto.
      expect(result_one).not.toThrow;
      expect(result_one).toEqual(mockReturnValue);
    }
  );

  /**
   * 
   * Testando chamada do serviço de "adicionaDiasData"
   * 
   */
  it('Deve adicionar dias na data inicial quando executar função adicionaDiasData.', async () => {
      // Chama o método do serviço.
      const result_one: Date = service.adicionaDiasData(new Date(2025, 0, 1), 2);
      const result_two: Date = service.adicionaDiasData(new Date(2025, 1, 27), 2);
      // Testa se o resultado não é nulo.
      expect(result_one).not.toBeNull();
      expect(result_two).not.toBeNull();
      // Verifica se o retorno está correto, se a soma de dias foi correta, e se não lançou exceção.
      expect(result_one).not.toThrow;
      expect(result_one).toEqual(new Date(2025, 0, 3));
      expect(result_one.getDate()).toBe(3);
      // Verifica result_two.
      expect(result_two).toEqual(new Date(2025, 2, 1));
      expect(result_two.getDate()).toBe(1);
    }
  );

  /**
   * 
   * Testando chamada do serviço de "pegaQuarta"
   * 
   */
  it('Deve encontrar a quarta-feira quando executar função pegaQuarta.', async () => {
    // Chama o método do serviço.
    const result_one: Date = service.pegaQuarta(new Date(2025, 0, 1)); // Deve retornar o mesmo dia 1, visto que cai na quarta.
    const result_two: Date = service.pegaQuarta(new Date(2025, 1, 28)); // Deve retornar dia 26.

    // Testa se o resultado não é nulo.
    expect(result_one).not.toBeNull();
    expect(result_two).not.toBeNull();
    
    // Verifica se o retorno está correto, se a soma de dias foi correta, e se não lançou exceção.
    expect(result_one).not.toThrow;
    expect(result_one.getDate()).toBe(1);
    expect(result_one.getDay()).toBe(3);
    
    // Verifica result_two.
    expect(result_two).not.toThrow;
    expect(result_two.getDate()).toEqual(26);
    expect(result_two.getDay()).toBe(3);
  });

  
  // /**
  //  * 
  //  * Testando chamada do serviço de "criar"
  //  * 
  //  */
  // it(
  //   'Deve envocar prisma.alvara_Tipo.findFirst e prisma.alvara_Tipo.create quando executar função criar.', 
  //   async () => {
  //     // Criando o objeto mockado de retorno da chamada "criar".
  //     const mockFindResult: CreateAlvaraTipoDto = {
  //       nome: "",
  //       prazo_admissibilidade_smul: 7,
  //       reconsideracao_smul: 6,
  //       reconsideracao_smul_tipo: 5,
  //       analise_reconsideracao_smul: 4,
  //       prazo_analise_smul1: 4,
  //       prazo_analise_smul2: 3,
  //       prazo_emissao_alvara_smul: 2,
  //       prazo_admissibilidade_multi: 2,
  //       reconsideracao_multi: 2,
  //       reconsideracao_multi_tipo: 1,
  //       analise_reconsideracao_multi: 1,
  //       prazo_analise_multi1: 1,
  //       prazo_analise_multi2: 1,
  //       prazo_comunique_se: 1,
  //       prazo_encaminhar_coord: 1,
  //       status: 1
  //     };
  //     // Configura o retorno do método mockado
  //     (prisma.alvara_Tipo.findFirst as jest.Mock).mockResolvedValue(null);
  //     (prisma.alvara_Tipo.create as jest.Mock).mockResolvedValue(mockFindResult);

  //     // Chama o método do serviço, fornecendo o CreateAlvaraTipoDto.
  //     const result: Alvara_Tipo = await service.criar(mockFindResult);

  //     // Testa se o resultado não é nulo.
  //     expect(result).not.toBeNull();
  //     // Verifica se o método findFirst mockado foi chamado corretamente.
  //     expect(prisma.alvara_Tipo.findFirst).toHaveBeenCalledWith({ 
  //       where: { 
  //         nome: expect.any(String) 
  //       }
  //     });
  //     // Verifica se o método create mockado foi chamado corretamente.
  //     expect(prisma.alvara_Tipo.create).toHaveBeenCalledWith({ 
  //       data: { ...mockFindResult } 
  //     });
  //     // Verifica se o retorno está correto.
  //     expect(result).toEqual(mockFindResult);
  //   }
  // );

  // /**
  //  * 
  //  * Testando chamada do serviço de "buscarTudo"
  //  * 
  //  */
  // it(
  //   'Deve envocar prisma.alvara_Tipo.findMany e prisma.alvara_Tipo.count quando buscarTudo é executada.', 
  //   async () => {
  //     // Configura o retorno dos métodos mockados
  //     (app.verificaPagina as jest.Mock).mockReturnValue([0, 10]);
  //     (prisma.alvara_Tipo.count as jest.Mock).mockResolvedValue(10);
  //     (app.verificaLimite as jest.Mock).mockReturnValue([0, 10]);
  //     (prisma.alvara_Tipo.findMany as jest.Mock).mockResolvedValue([]);

  //     // Chama o método do serviço, fornecendo pagina e limite.
  //     const result: AlvaraTipoPaginadoDTO = await service.buscarTudo(0, 10, 'search');

  //     // Testa se o resultado não é nulo.
  //     expect(result).not.toBeNull();
  //     // Verifica se o método count mockado de alvará tipo foi chamado corretamente.
  //     expect(prisma.alvara_Tipo.count).toHaveBeenCalled();
  //     // Verifica se o método findMany mockado de alvará tipo foi chamado corretamente.
  //     expect(prisma.alvara_Tipo.findMany).toHaveBeenCalledWith({ 
  //       where: {
  //         OR: [
  //           { 
  //             nome: { 
  //               contains: 'search'
  //             } 
  //           },
  //         ]
  //       },
  //       orderBy: { 
  //         criado_em: 'desc'
  //       },
  //       skip: expect.any(Number),
  //       take: expect.any(Number)
  //     });
  //     // Verifica se o retorno está correto.
  //     expect(result).toEqual({ data: [], total: 10, pagina: 0, limite: 10 });
  //     expect(result.limite).toEqual({ data: [], total: 10, pagina: 0, limite: 10 }.limite);
  //   }
  // );

  // /**
  //  * 
  //  * Testando chamada do serviço de "buscaId"
  //  * 
  //  */
  // it('Deve envocar prisma.alvara_Tipo.findUnique quando função buscarUm é executada.', async () => {
  //   const mockFindUniqueResult: AlvaraTipoResponseDTO = { 
  //     id: "",
  //     nome: "",
  //     prazo_admissibilidade_smul: 1,
  //     reconsideracao_smul: 1,
  //     reconsideracao_smul_tipo: 1,
  //     analise_reconsideracao_smul: 2,
  //     prazo_analise_smul1: 3,
  //     prazo_analise_smul2: 4,
  //     prazo_emissao_alvara_smul: 5,
  //     prazo_admissibilidade_multi: 6,
  //     reconsideracao_multi: 7,
  //     reconsideracao_multi_tipo: 8,
  //     analise_reconsideracao_multi: 9,
  //     prazo_analise_multi1: 10,
  //     prazo_analise_multi2: 3,
  //     prazo_emissao_alvara_multi: 4,
  //     prazo_comunique_se: 5,
  //     prazo_encaminhar_coord: 6,
  //     status: 1
  //   };
  //   // Configura o retorno dos métodos mockados
  //   (prisma.alvara_Tipo.findFirst as jest.Mock).mockResolvedValue(mockFindUniqueResult);

  //   // Chama o método do serviço, fornecendo pagina e limite.
  //   const result: Alvara_Tipo = await service.buscarPorId('3');

  //   // Testa se o resultado não é nulo.
  //   expect(result).not.toBeNull();
  //   // Verifica se o método findFirst mockado de alvará-tipo foi chamado corretamente.
  //   expect(prisma.alvara_Tipo.findFirst).toHaveBeenCalledWith({ 
  //     where: {
  //       id: expect.any(String)
  //     }
  //   });
  //   // Verifica se o retorno está correto.
  //   expect(result).toEqual(mockFindUniqueResult);
  //   expect(result.id).toEqual(mockFindUniqueResult.id);
  // });

  // /**
  //  * 
  //  * Testando chamada do serviço de "atualizar"
  //  * 
  //  */
  // it('Deve chamar prisma.alvara_Tipo.update e prisma.alvara_Tipo.findFirst quando função atualizar é executada.', async () => {
  //   const mockFindFirstResult: AlvaraTipoResponseDTO = { 
  //     id: "",
  //     nome: "",
  //     prazo_admissibilidade_smul: 1,
  //     reconsideracao_smul: 1,
  //     reconsideracao_smul_tipo: 1,
  //     analise_reconsideracao_smul: 2,
  //     prazo_analise_smul1: 3,
  //     prazo_analise_smul2: 4,
  //     prazo_emissao_alvara_smul: 5,
  //     prazo_admissibilidade_multi: 6,
  //     reconsideracao_multi: 7,
  //     reconsideracao_multi_tipo: 8,
  //     analise_reconsideracao_multi: 9,
  //     prazo_analise_multi1: 10,
  //     prazo_analise_multi2: 3,
  //     prazo_emissao_alvara_multi: 4,
  //     prazo_comunique_se: 5,
  //     prazo_encaminhar_coord: 6,
  //     status: 1
  //   };
  //   // Configura o retorno dos métodos mockados
  //   (prisma.alvara_Tipo.findFirst as jest.Mock).mockResolvedValue(mockFindFirstResult);
  //   (prisma.alvara_Tipo.update as jest.Mock).mockResolvedValue(mockFindFirstResult);

  //   // Chama o método do serviço, id e objeto.
  //   const result: AlvaraTipoResponseDTO = await service.atualizar('3', mockFindFirstResult);

  //   // Testa se o resultado não é nulo.
  //   expect(result).not.toBeNull();
  //   // Verifica se findFirst foi chamado corretamente.
  //   expect(prisma.alvara_Tipo.findFirst).toHaveBeenCalledWith({ 
  //     where: {
  //       id: expect.any(String)
  //     },
  //   });
  //   // Verifica se o método update mockado de alvará-tipo foi chamado corretamente.
  //   expect(prisma.alvara_Tipo.update).toHaveBeenCalledWith({ 
  //     where: {
  //       id: expect.any(String)
  //     },
  //     data: mockFindFirstResult
  //   });
  //   // Verifica se o retorno está correto.
  //   expect(result).toEqual(mockFindFirstResult);
  //   expect(result.status).toEqual(mockFindFirstResult.status);
  // });

  //   /**
  //  * 
  //  * Testando chamada do serviço de "alterarStatus"
  //  * 
  //  */
  // it('Deve chamar prisma.alvara_Tipo.update e prisma.alvara_Tipo.findFirst quando função alterarStatus é executada.', async () => {
  //   const mockFindFirstResult: AlvaraTipoResponseDTO = { 
  //     id: "",
  //     nome: "",
  //     prazo_admissibilidade_smul: 1,
  //     reconsideracao_smul: 1,
  //     reconsideracao_smul_tipo: 1,
  //     analise_reconsideracao_smul: 2,
  //     prazo_analise_smul1: 3,
  //     prazo_analise_smul2: 4,
  //     prazo_emissao_alvara_smul: 5,
  //     prazo_admissibilidade_multi: 6,
  //     reconsideracao_multi: 7,
  //     reconsideracao_multi_tipo: 8,
  //     analise_reconsideracao_multi: 9,
  //     prazo_analise_multi1: 10,
  //     prazo_analise_multi2: 3,
  //     prazo_emissao_alvara_multi: 4,
  //     prazo_comunique_se: 5,
  //     prazo_encaminhar_coord: 6,
  //     status: 1
  //   };
  //   // Configura o retorno dos métodos mockados
  //   (prisma.alvara_Tipo.findFirst as jest.Mock).mockResolvedValue(mockFindFirstResult);
  //   (prisma.alvara_Tipo.update as jest.Mock).mockResolvedValue(mockFindFirstResult);

  //   // Chama o método do serviço, id e status.
  //   const result: AlvaraTipoResponseDTO = await service.alterarStatus('3', 1);

  //   // Testa se o resultado não é nulo.
  //   expect(result).not.toBeNull();
  //   // Verifica se findFirst foi chamado corretamente.
  //   expect(prisma.alvara_Tipo.findFirst).toHaveBeenCalledWith({ 
  //     where: {
  //       id: expect.any(String)
  //     },
  //   });
  //   // Verifica se o método update mockado de alvará-tipo foi chamado corretamente.
  //   expect(prisma.alvara_Tipo.update).toHaveBeenCalledWith({ 
  //     where: {
  //       id: expect.any(String)
  //     },
  //     data: {
  //       status: 1
  //     }
  //   });
  //   // Verifica se o retorno está correto.
  //   expect(result).toEqual(mockFindFirstResult);
  //   expect(result.status).toEqual(mockFindFirstResult.status);
  // });
});
