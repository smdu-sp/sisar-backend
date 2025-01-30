import { SubprefeituraService } from '../subprefeitura.service';
import { SubprefeituraResponseDTO } from '../dto/subprefeitura-response.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { AppService } from 'src/app.service';
import { Test, TestingModule } from '@nestjs/testing';
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

  it('should call prisma.subprefeitura.create when create is called', async () => {
    const mockCreateResult: SubprefeituraResponseDTO = {
      id: 'a1e2c4v6u8',
      nome: 'Secretaria Municipal de Etnias e Povoados Indígenas Urbanos',
      sigla: 'SMEPIU',
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
      nome: 'Secretaria Municipal de Etnias e Povoados Indígenas Urbanos',
      sigla: 'SMEPIU',
      status: 1,
    });

    ///teste de criação

    expect(result).not.toBeNull();

    expect(prisma.subprefeitura.findUnique).toHaveBeenCalledWith({
      where: {
        nome: 'Secretaria Municipal de Etnias e Povoados Indígenas Urbanos',
      },
    });

    //verifica se existe uma subprefeitura com o mesmo nome

    expect(prisma.subprefeitura.create).toHaveBeenCalledWith({
      data: {
        nome: 'Secretaria Municipal de Etnias e Povoados Indígenas Urbanos',
        sigla: 'SMEPIU',
        status: 1,
      },
    });

    expect(result).toEqual(mockCreateResult);
  });

  ///teste de listagem de lista vazia

  it('should return an empty list of subprefectures', async () => {
    (prisma.subprefeitura.findMany as jest.Mock).mockResolvedValue([]);

    const result: SubprefeituraResponseDTO[] = await service.listaCompleta();

    expect(result).toEqual([]);

    expect(prisma.subprefeitura.findMany).toHaveBeenCalledWith({
      orderBy: { nome: 'asc' },
    });
  });

  ///teste de listagem de subprefeituras ordenadas

  it('should return subprefeituras ordered by name in ascending order', async () => {
    const mockSubprefeituras: SubprefeituraResponseDTO[] = [
      {
        id: 'u1ab7u89',
        nome: 'Secretaria Municipal de Artesanato e Artes Plásticas',
        sigla: 'SMAAP',
        status: 1,
        criado_em: new Date('2023-01-01T00:00:00.000Z'),
        alterado_em: new Date('2023-01-01T00:00:00.000Z'),
      },
      {
        id: 'u2act91',
        nome: 'Subprefeitura Municipal de Bancos Emergentes',
        sigla: 'SMBE',
        status: 1,
        criado_em: new Date('2023-01-02T00:00:00.000Z'),
        alterado_em: new Date('2023-01-02T00:00:00.000Z'),
      },
      {
        id: 'u3adv12',
        nome: 'Subprefeitura Municipal de Reciclagem',
        sigla: 'SPC',
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

  it('It should be possible to search for subprefeituras by ID', async () => {
    const mockSubprefeitura: SubprefeituraResponseDTO = {
      id: 'u1ab7u89',
      nome: 'Secretaria Municipal de Artesanato e Artes Plásticas',
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
        id: 'u1ab7u89',
      },
    });
  });
});
