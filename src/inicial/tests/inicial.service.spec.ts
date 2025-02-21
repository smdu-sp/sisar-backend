import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../../prisma/prisma.service';
import { AppService } from 'src/app.service';
import { InicialService } from '../inicial.service';
import { Inicial, Inicial_Sqls } from '@prisma/client';
import { ForbiddenException } from '@nestjs/common';
import { IniciaisPaginado } from '../dto/inicial-response.dto';
import { UpdateInicialDto } from '../dto/update-inicial.dto';

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
    },
    interface: {
      upsert: jest.fn()
    },
    reuniao_Processo: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
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

  /**
   * 
   * Testando chamada do serviço de "removeSql"
   * 
   */
  it('Deve envocar prisma.inicial_Sqls.findFirst e prisma.inicial_Sqls.delete quando executar função removeSql.', 
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
      (prisma.inicial_Sqls.findFirst as jest.Mock).mockResolvedValue(mockReturnValue);
      (prisma.inicial_Sqls.create as jest.Mock).mockResolvedValue(mockReturnValue);

      // Chama o método do serviço, fornecendo id.
      const result_one: boolean = await service.removeSql(123, "7897293");
      
      // Testa se o resultado não é nulo.
      expect(result_one).not.toBeNull();
      // Verifica se o método findFirst mockado foi chamado corretamente.
      expect(prisma.inicial_Sqls.findFirst).toHaveBeenCalledWith({ 
        where: {
          sql: "7897293",
          inicial_id: 123
        }
      });
      // Verifica se o método delete mockado foi chamado corretamente.
      expect(prisma.inicial_Sqls.delete).toHaveBeenCalledWith({ 
        where: {
          id: expect.any(String)
        }
      });
      // Verifica se o retorno está correto.
      expect(result_one).not.toThrow;
      expect(result_one).toEqual(true);
    }
  );

  /**
   * 
   * Testando chamada do serviço de "criaInterfaces"
   * 
   */
  it('Deve envocar prisma.interface.upsert quando executar função criaInterfaces.', async () => {
    // Configura o retorno do método mockado
    (prisma.interface.upsert as jest.Mock).mockResolvedValue({});

    // Chama o método do serviço, fornecendo id.
    const result_one = await service.criaInterfaces({}, 2);
    
    // Testa se o resultado não é nulo.
    expect(result_one).not.toBeNull();
    // Verifica se o método upsert mockado foi chamado corretamente.
    expect(prisma.interface.upsert).toHaveBeenCalledWith({ 
      where: { 
        inicial_id: expect.any(Number) 
      },
      create: {
        inicial_id: expect.any(Number)
      },
      update: {}
    });
    // Verifica se o retorno está correto.
    expect(result_one).not.toThrow;
  });

  /**
   * 
   * Testando chamada do serviço de "buscarTudo"
   * 
   */
  it(
    'Deve envocar prisma.inicial.findMany e prisma.inicial.count quando buscarTudo é executada.', 
    async () => {
      // Configura o retorno dos métodos mockados
      (app.verificaPagina as jest.Mock).mockReturnValue([0, 10]);
      (prisma.inicial.count as jest.Mock).mockResolvedValue(10);
      (app.verificaLimite as jest.Mock).mockReturnValue([0, 10]);
      (prisma.inicial.findMany as jest.Mock).mockResolvedValue([]);

      // Chama o método do serviço, fornecendo pagina e limite.
      const result: IniciaisPaginado = await service.buscarTudo(0, 10, 'search');

      // Testa se o resultado não é nulo.
      expect(result).not.toBeNull();
      // Verifica se o método count mockado de alvará tipo foi chamado corretamente.
      expect(prisma.inicial.count).toHaveBeenCalled();
      // Verifica se o método findMany mockado de alvará tipo foi chamado corretamente.
      expect(prisma.inicial.findMany).toHaveBeenCalledWith({ 
        where: {
          OR: [
            { sei: { contains: 'search' } },
            { requerimento: { contains: 'search' } },
            { aprova_digital: { contains: 'search' } },
            { processo_fisico: { contains: 'search' } }
          ],
          status: expect.any(Number)
        },
        include: {
          alvara_tipo: true,
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
   * Testando chamada do serviço de "buscarTudoEmAnalise"
   * 
   */
  it(
    'Deve envocar prisma.inicial.findMany e prisma.inicial.count quando buscarTudoEmAnalise é executada.', 
    async () => {
      // Configura o retorno dos métodos mockados
      (app.verificaPagina as jest.Mock).mockReturnValue([0, 10]);
      (prisma.inicial.count as jest.Mock).mockResolvedValue(10);
      (app.verificaLimite as jest.Mock).mockReturnValue([0, 10]);
      (prisma.inicial.findMany as jest.Mock).mockResolvedValue([]);

      // Chama o método do serviço, fornecendo pagina e limite.
      const result: IniciaisPaginado = await service.buscarTudoEmAnalise(0, 10);

      // Testa se o resultado não é nulo.
      expect(result).not.toBeNull();
      // Verifica se o método count mockado de alvará tipo foi chamado corretamente.
      expect(prisma.inicial.count).toHaveBeenCalled();
      // Verifica se o método findMany mockado de alvará tipo foi chamado corretamente.
      expect(prisma.inicial.findMany).toHaveBeenCalledWith({ 
        where: {
          status: 2
        },
        include: {
          alvara_tipo: true,
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
   * Testando chamada do serviço de "todosProcessos"
   * 
   */
  it('Deve envocar prisma.inicial.findMany quando executar função todosProcessos.', async () => {
    // Configurando objetos de mock.
    const mockReturnValue: { id: number; sei: string; aprova_digital: string; }[] = [
      { 
        id: 2, 
        sei: 'string', 
        aprova_digital: 'string' 
      }
    ];
    // Configura o retorno do método mockado
    (prisma.inicial.findMany as jest.Mock).mockResolvedValue(mockReturnValue);

    // Chama o método do serviço, fornecendo id.
    const result_one: {
      id: number;
      sei: string;
      aprova_digital: string;
    }[] = await service.todosProcessos();
    
    // Testa se o resultado não é nulo.
    expect(result_one).not.toBeNull();
    // Verifica se o método findMany mockado foi chamado corretamente.
    expect(prisma.inicial.findMany).toHaveBeenCalledWith({ 
      select: {
        sei: true,
        aprova_digital: true,
        id: true
      }
    });
    // Verifica se o retorno está correto.
    expect(result_one).not.toThrow;
    expect(result_one).toEqual(mockReturnValue);
  });

  /**
   * 
   * Testando chamada do serviço de "buscarPorId"
   * 
   */
  it('Deve envocar prisma.inicial.findUnique quando executar função buscarPorId.', async () => {
    // Configura o retorno do método mockado
    (prisma.inicial.findUnique as jest.Mock).mockResolvedValue({});

    // Chama o método do serviço, fornecendo id.
    const result_one: Inicial = await service.buscarPorId(1);
    
    // Testa se o resultado não é nulo.
    expect(result_one).not.toBeNull();
    // Verifica se o método findMany mockado foi chamado corretamente.
    expect(prisma.inicial.findUnique).toHaveBeenCalledWith({ 
      where: { 
        id: 1 
      },
      include: {
        iniciais_sqls: {
          orderBy: { 
            sql: 'asc' 
          }
        },
        interfaces: true,
        admissibilidade: true,
        distribuicao: {
          include: {
            administrativo_responsavel: true,
            tecnico_responsavel: true
          }
        }
      }
    });
    // Verifica se o retorno está correto.
    expect(result_one).not.toThrow;
    expect(result_one).toEqual({});
  });

  /**
   * 
   * Testando chamada do serviço de "buscarPorId"
   * 
   */
  it('Deve envocar prisma.inicial.findUnique quando executar função buscarPorId.', async () => {
    // Configura o retorno do método mockado
    (prisma.inicial.findUnique as jest.Mock).mockResolvedValue({});

    // Chama o método do serviço, fornecendo id.
    const result_one: Inicial = await service.buscarPorId(1);
    
    // Testa se o resultado não é nulo.
    expect(result_one).not.toBeNull();
    // Verifica se o método findMany mockado foi chamado corretamente.
    expect(prisma.inicial.findUnique).toHaveBeenCalledWith({ 
      where: { 
        id: 1 
      },
      include: {
        iniciais_sqls: {
          orderBy: { 
            sql: 'asc' 
          }
        },
        interfaces: true,
        admissibilidade: true,
        distribuicao: {
          include: {
            administrativo_responsavel: true,
            tecnico_responsavel: true
          }
        }
      }
    });
    // Verifica se o retorno está correto.
    expect(result_one).not.toThrow;
    expect(result_one).toEqual({});
  });

  /**
   * 
   * Testando chamada do serviço de "atualizar"
   * 
   */
  it('Deve envocar prisma.inicial.findUnique e prisma.inicial.update quando executar função atualizar.', async () => {
    // Configura o retorno do método mockado
    const mockReturnValue: UpdateInicialDto = {
      id: 2,
      decreto: false,
      sei: '312312313',
      tipo_requerimento: 321,
      requerimento: 'string',
      aprova_digital: 'string',
      processo_fisico: 'string',
      data_protocolo: new Date(),
      envio_admissibilidade: new Date(),
      alvara_tipo_id: 'string',
      tipo_processo: 454,
      requalifica_rapido: false,
      associado_reforma: false
    };
    (prisma.inicial.findUnique as jest.Mock).mockResolvedValue(mockReturnValue);
    (prisma.inicial.update as jest.Mock).mockResolvedValue(mockReturnValue);

    // Chama o método do serviço, fornecendo id.
    const result_one: Inicial = await service.atualizar(1, mockReturnValue);
    
    // Testa se o resultado não é nulo.
    expect(result_one).not.toBeNull();
    // Verifica se o método findMany mockado foi chamado corretamente.
    expect(prisma.inicial.findUnique).toHaveBeenCalledWith({ 
      where: { 
        id: 1 
      }
    });
    expect(prisma.inicial.update).toHaveBeenCalledWith({ 
      where: { 
        id: 1 
      },
      data: {
        ...mockReturnValue
      }
    });
    // Verifica se o retorno está correto.
    expect(result_one).not.toThrow;
    expect(result_one).toEqual(mockReturnValue);
    expect(result_one.id).toEqual(mockReturnValue.id);
  });

  /**
   * 
   * Testando chamada do serviço de "buscarPorDataProcesso"
   * 
   */
  it('Deve envocar prisma.reuniao_Processo.findMany quando executar função buscarPorDataProcesso.', async () => {
    // Configura o retorno do método mockado
    (prisma.reuniao_Processo.findMany as jest.Mock).mockResolvedValue([1]);
    const mockDate = new Date();
    mockDate.setDate(123);

    // Chama o método do serviço, fornecendo data.
    const result_one = await service.buscarPorDataProcesso(mockDate);
    
    // Testa se o resultado não é nulo.
    expect(result_one).not.toBeNull();
    // Verifica se o método findMany mockado foi chamado corretamente.
    expect(prisma.reuniao_Processo.findMany).toHaveBeenCalledWith({ 
      include: {
        inicial: true
      },
      where: {
        data_processo: { 
          equals: expect.anything()
        }
      }
    });
    // Verifica se o retorno está correto.
    expect(result_one).not.toThrow;
    expect(result_one).toEqual([1]);
  });


  /**
   * 
   * Testando chamada do serviço de "buscarPorMesAnoProcesso"
   * 
   */
  it('Deve envocar prisma.reuniao_Processo.findMany quando executar função buscarPorMesAnoProcesso.', async () => {
    // Configura o retorno do método mockado
    (prisma.reuniao_Processo.findMany as jest.Mock).mockResolvedValue([1]);

    // Chama o método do serviço, fornecendo data.
    const result_one = await service.buscarPorMesAnoProcesso(10, 2025);
    
    // Testa se o resultado não é nulo.
    expect(result_one).not.toBeNull();
    // Verifica se o método findMany mockado foi chamado corretamente.
    expect(prisma.reuniao_Processo.findMany).toHaveBeenCalledWith({ 
      where: {
        AND: [
          { data_processo: { 
            gte: expect.any(Date)
          } },
          { data_processo: { 
            lte: expect.any(Date)
          } }
        ]
      }
    });
    // Verifica se o retorno está correto.
    expect(result_one).not.toThrow;
    expect(result_one).toEqual([1]);
  });
});
