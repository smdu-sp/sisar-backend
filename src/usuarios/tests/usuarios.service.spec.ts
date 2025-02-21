import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../../prisma/prisma.service';
import { AppService } from 'src/app.service';
import { UsuariosService } from '../usuarios.service';
import { SGUService } from 'src/sgu/sgu.service';
import { Ferias, Permissao, Usuario } from '@prisma/client';

describe('UsuarioService tests', () => {
  let service: UsuariosService;
  let prisma: PrismaService;
  let app: AppService;
  let sgu: SGUService;

  // Configurando mock para o serviço do prisma.
  const mockPrismaService = {
    usuario: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn()
    },
    unidade: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn()
    },
    ferias: {
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
  // Configurando mock para o serviço do sgu.
  const mockSguService = {
    tblUsuarios: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn()
    }
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsuariosService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: AppService, useValue: mockAppService },
        { provide: SGUService, useValue: mockSguService }
      ]
    }).compile();
    service = module.get<UsuariosService>(UsuariosService);
    prisma = module.get<PrismaService>(PrismaService);
    app = module.get<AppService>(AppService);
    sgu = module.get<SGUService>(SGUService);
  });

  // Testando a definição do service, prisma e app
  it('Testando a definição do service, prisma e app', () => {
    expect(service).toBeDefined();
    expect(prisma).toBeDefined();
    expect(app).toBeDefined();
    expect(sgu).toBeDefined();
  });

  /**
   * 
   * Testando chamada do serviço de "retornaPermissao"
   * 
   */
  it(
    'Deve envocar prisma.usuario.findUnique quando executar função retornaPermissao.', 
    async () => {
      // Criando o objeto mockado de retorno da chamada.
      const mockReturn = { permissao: 'DEV' };
      // Configura o retorno do método mockado
      (prisma.usuario.findUnique as jest.Mock).mockResolvedValue(mockReturn);

      // Chama o método do serviço.
      const result: Permissao = await service.retornaPermissao('9238892');

      // Testa se o resultado não é nulo.
      expect(result).not.toBeNull();
      // Verifica se o método mockado foi chamado corretamente.
      expect(prisma.usuario.findUnique).toHaveBeenCalledWith({ 
        where: { 
          id: '9238892'
        }
      });
      // Verifica se o retorno está correto.
      expect(result).toEqual('DEV');
    }
  );

  /**
   * 
   * Testando chamada do serviço de "listaCompleta"
   * 
   */
  it(
    'Deve envocar prisma.usuario.findMany quando executar função listaCompleta.', 
    async () => {
      // Criando o objeto mockado de retorno da chamada.
      const mockReturn = [{ id: 1, nome: 'Test' }];
      // Configura o retorno do método mockado
      (prisma.usuario.findMany as jest.Mock).mockResolvedValue(mockReturn);

      // Chama o método do serviço.
      const result: Usuario[] = await service.listaCompleta();

      // Testa se o resultado não é nulo.
      expect(result).not.toBeNull();
      // Verifica se o método mockado foi chamado corretamente.
      expect(prisma.usuario.findMany).toHaveBeenCalledWith({ 
        orderBy: {
          nome: 'asc'
        }
      });
      // Verifica se o retorno está correto.
      expect(result).toEqual([{ id: 1, nome: 'Test' }]);
    }
  );

  /**
   * 
   * Testando chamada do serviço de "validaPermissaoCriador"
   * 
   */
  it('Deve verificar permissão quando executar função validaPermissaoCriador.', async () => {
    // Chama o método do serviço.
    const result: Permissao = service.validaPermissaoCriador('DEV', 'SUP');
    const result2: Permissao = service.validaPermissaoCriador('SUP', 'ADM');

    // Testa se o resultado 1 não é nulo.
    expect(result).not.toBeNull();
    // Verifica se o retorno 1 está correto.
    expect(result).toEqual('SUP');

    // Testa se o resultado 2 não é nulo.
    expect(result2).not.toBeNull();
    // Verifica se o retorno 2 está correto.
    expect(result2).toEqual('ADM');
  });

  /**
   * 
   * Testando chamada do serviço de "buscarPorEmail"
   * 
   */
  it('Deve envocar prisma.usuario.findUnique quando executar função buscarPorEmail.', async () => {
    const mockReturn = [{ id: 1, nome: 'Test' }];

    (prisma.usuario.findUnique as jest.Mock).mockResolvedValue(mockReturn);

    // Chama o método do serviço.
    const result: Usuario = await service.buscarPorEmail('email@mail.com');

    expect(result).not.toBeNull();
    // Verifica se o método mockado foi chamado corretamente.
    expect(prisma.usuario.findUnique).toHaveBeenCalledWith({ 
      where: {
        email: 'email@mail.com'
      }
    });
    // Verifica se o retorno está correto.
    expect(result).toEqual([{ id: 1, nome: 'Test' }]);
  });

  /**
   * 
   * Testando chamada do serviço de "buscarPorLogin"
   * 
   */
  it('Deve envocar prisma.usuario.findUnique quando executar função buscarPorLogin.', async () => {
    const mockReturn = [{ id: 1, nome: 'Test' }];

    (prisma.usuario.findUnique as jest.Mock).mockResolvedValue(mockReturn);

    // Chama o método do serviço.
    const result: Usuario = await service.buscarPorLogin('email@mail.com');

    expect(result).not.toBeNull();
    // Verifica se o método mockado foi chamado corretamente.
    expect(prisma.usuario.findUnique).toHaveBeenCalledWith({ 
      where: {
        login: 'email@mail.com'
      }
    });
    // Verifica se o retorno está correto.
    expect(result).toEqual([{ id: 1, nome: 'Test' }]);
  });

  /**
   * 
   * Testando chamada do serviço de "excluir"
   * 
   */
  it('Deve envocar prisma.usuario.update quando executar função excluir.', async () => {
    // Criando o objeto mockado de retorno da chamada.
    const mockReturn = { desativado: true };
    // Configura o retorno do método mockado
    (prisma.usuario.update as jest.Mock).mockResolvedValue(mockReturn);

    // Chama o método do serviço.
    const result: { desativado: boolean } = await service.excluir('nd92n29d3n');

    expect(result).not.toBeNull();
    // Verifica se o método mockado foi chamado corretamente.
    expect(prisma.usuario.update).toHaveBeenCalledWith({ 
      data: { 
        status: 2 
      },
      where: { 
        id: 'nd92n29d3n'
      }
    });
    // Verifica se o retorno está correto.
    expect(result).toEqual({ desativado: true });
  });

  /**
   * 
   * Testando chamada do serviço de "autorizaUsuario"
   * 
   */
  it('Deve envocar prisma.usuario.update quando executar função autorizaUsuario.', async () => {
    // Configura o retorno do método mockado
    (prisma.usuario.update as jest.Mock).mockResolvedValue({ status: 1 });

    // Chama o método do serviço.
    const result: { autorizado: boolean } = await service.autorizaUsuario('nd92n29d3n');

    expect(result).not.toBeNull();
    // Verifica se o método mockado foi chamado corretamente.
    expect(prisma.usuario.update).toHaveBeenCalledWith({ 
      data: { 
        status: 1
      },
      where: { 
        id: 'nd92n29d3n'
      }
    });
    // Verifica se o retorno está correto.
    expect(result).toEqual({ autorizado: true });
  });

  /**
   * 
   * Testando chamada do serviço de "validaUsuario"
   * 
   */
  it('Deve envocar prisma.usuario.findUnique quando executar função validaUsuario.', async () => {
    // Configura o retorno do método mockado
    const mockReturn = { id: 1, nome: 'Test', status: 1 };
    (prisma.usuario.findUnique as jest.Mock).mockResolvedValue(mockReturn);

    // Chama o método do serviço.
    const result: Usuario = await service.validaUsuario('nd92n29d3n');

    expect(result).not.toBeNull();
    // Verifica se o método mockado foi chamado corretamente.
    expect(prisma.usuario.findUnique).toHaveBeenCalledWith({ 
      where: { 
        id: 'nd92n29d3n'
      }
    });
    // Verifica se o retorno está correto.
    expect(result).toEqual({ id: 1, nome: 'Test', status: 1 });
  });

  /**
   * 
   * Testando chamada do serviço de "adicionaFerias"
   * 
   */
  it('Deve envocar prisma.usuario.update e prisma.ferias.create quando executar função adicionaFerias.', async () => {
    // Configura o retorno do método mockado
    const mockReturn = { id: 1, nome: 'Test', status: 1 };
    (prisma.usuario.findUnique as jest.Mock).mockResolvedValue(mockReturn);
    (prisma.ferias.create as jest.Mock).mockResolvedValue({});

    // Chama o método do serviço.
    const result: Ferias = await service.adicionaFerias(
      'nd92n29d3n', 
      { inicio: new Date(), final: new Date() }
    );

    expect(result).not.toBeNull();
    // Verifica se o método mockado foi chamado corretamente.
    expect(prisma.usuario.findUnique).toHaveBeenCalledWith({ 
      where: { 
        id: 'nd92n29d3n'
      }
    });
    expect(prisma.ferias.create).toHaveBeenCalledWith({ 
      data: { 
        inicio: expect.any(Date), 
        final: expect.any(Date), 
        usuario_id: 'nd92n29d3n' 
      },
    });
    // Verifica se o retorno está correto.
    expect(result).toEqual({});
  });

   /**
   * 
   * Testando chamada do serviço de "buscaUnidade"
   * 
   */
   it('Deve envocar prisma.usuario.update e sgu.tblUsuarios.findFirst quando executar função buscaUnidade.', 
    async () => {
      // Configura o retorno do método mockado
      const mockReturn = {
        cpID: 12312312,
        cpRF: '235343423',
        cpNome: 'string',
        cpVinculo: 'string',
        cpnomecargo2: 'string',
        cpRef: 'string',
        cpUnid: 'string',
        cpnomesetor2: 'string',
        cpPermissao: 'string',
        cpImprimir: 'string',
        cpUltimaCarga: 'string',
        cpOBS: 'string'
      };
      (sgu.tblUsuarios.findFirst as jest.Mock).mockResolvedValue(mockReturn);
      (prisma.unidade.findUnique as jest.Mock).mockResolvedValue({ id: '4134213' });

      // Chama o método do serviço.
      const result: string = await service.buscaUnidade('nd92n29d3n');

      expect(result).not.toBeNull();
      // Verifica se o método mockado foi chamado corretamente.
      expect(sgu.tblUsuarios.findFirst).toHaveBeenCalledWith({ 
        where: {
          cpRF: { 
            startsWith: expect.any(String) 
          },
        },
      });
      expect(prisma.unidade.findUnique).toHaveBeenCalledWith({ 
        where: { 
          codigo: 'string'
        }
      });
      // Verifica se o retorno está correto.
      expect(result).toEqual('4134213');
    }
  );
});
