import { SubprefeituraService } from '../subprefeitura.service';
import { SubprefeituraResponseDTO } from '../dto/subprefeitura-response.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { AppService } from 'src/app.service';
import { Test, TestingModule } from '@nestjs/testing';
import { Subprefeitura } from '@prisma/client';
import { CreateSubprefeituraDto } from '../dto/create-subprefeitura.dto';

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

  /*
  O prisma é uma camada de abstração do prisma client que facilita a utilização das operações do prisma
  no nosso app
  O mock é uma versão mockada (clone temporário) que será utilizado dentro do escopo de testes, ele
  ajuda a isolar o teste e evitar requisições no banco de dados, evitando efeitos colaterais no app
  cada operação prisma client esta sendo substituida por uma função mock do jest (jest.fn())*/

  const MockAppService = {
    verificaPagina: jest
      .fn()
      .mockImplementation((pagina, limite) => [pagina, limite]),
    verificaLimite: jest
      .fn()
      .mockImplementation((pagina, limite, total) => [pagina, limite]),
  };

  /*
  o mock do AppService repete o mesmo comportamento do mock do Prisma,
  ele é utilizado no subprefeitura.service para fazer paginações
  */

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

  /* 
  TestingModule é uma classe do NestJs que cria o módulo de testes do nossp app.
  Aqui, você usa as funcionalidades da aplicação real sem que ela seja startada de fato.
  Ele é criado através da função createTestingModule da class Test do Nest. 
  */

  it('should be defined / se os serviços estão definidos', () => {
    expect(service).toBeDefined();
    expect(prisma).toBeDefined();
    expect(app).toBeDefined();
  });

  //aqui verificamos se as instâncias mockadas conseguiram ser coompletamente instanciadas

  it('deve verificar se o metodo create cria uma subprefeitura', async () => {
    const mockCreateResult: SubprefeituraResponseDTO = {
      id: 'a1e2c4v6u8',
      nome: 'Subprefeitura da Sé',
      sigla: 'SBS',
      status: 1,
      criado_em: new Date('2025-01-29T19:08:50.340Z'),
      alterado_em: new Date('2025-01-29T19:08:50.340Z'),
    };

    //este é o objeto de comparação, o resultado do teste será comparado a ele para validação.

    (prisma.subprefeitura.findUnique as jest.Mock).mockResolvedValue(null);
    (prisma.subprefeitura.create as jest.Mock).mockResolvedValue(
      mockCreateResult,
    );

    /*
    em SubPrefeituraService, antes de uma subprefeitura ser criada, um metodo busca no banco
    se há uma subprefeitura com o mesmo nome.
    aqui forçamos o mesmo comportamento, fazendo um mock do metodo findUnique de subprefeitura
    e o forçamos a retornar um null
    o metodo create só consegue ser startado se um metodo findUnique retorna um null antes dele
    graçar ao mockResolvedValue, podemos forçar uma resposta de uma promise resolvida da forma que setamos
    */

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

    //o meu resolve força o retorno de uma lista ordenada

    const result: SubprefeituraResponseDTO[] = await service.listaCompleta();

    //indiretamente, o meu findMany esta retornando a lista mockada

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
    /*
    O spyon permite espionar métodos de um objeto existente qualquer (nesse caro, service)
    nesse caso, estamos o usando para alterar um comportamento de um metodo, o buscarPorNome
    em vez de startat o metodo, nós o forçamos a retornar um null, já que não há banco de dados pra consulta
    este método é uma ferramente da biblioteca do jest
    nós usamos o spyon aqui porque não fizemos um mock de service, então o spyon serviu como opção 2
     */
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
