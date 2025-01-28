import { Test, TestingModule } from '@nestjs/testing';
import { AvisosService } from '../avisos.service';
import { PrismaService } from '../../prisma/prisma.service';
import { Avisos } from '@prisma/client';
import { UpdateAvisoDto } from '../dto/update-aviso.dto';
import { AvisosResponseDTO } from '../dto/response.dto';

describe('AvisosService tests', () => {
  let service: AvisosService;
  let prisma: PrismaService;

  // configurando mock para o serviço do prisma
  const mockPrismaService = {
    avisos: {
      create: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AvisosService,
        { provide: PrismaService, useValue: mockPrismaService }
      ]
    }).compile();
    service = module.get<AvisosService>(AvisosService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  // Testando a definição do service e do prisma
  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(prisma).toBeDefined();
  });

  /**
   * Testando chamada do serviço de "create"
   * 
   */
  it('should call prisma.avisos.create when create is called', async () => {
    // Criando o objeto mockado de retorno da chamada "create".
    const mockCreateResult: Avisos = { id: '1', titulo: 'Teste', descricao: 'Descrição do teste', data: null, usuario_id: 'user-id', inicial_id: 2, criado_em: null, alterado_em: null };
    // Configura o retorno do método mockado
    (prisma.avisos.create as jest.Mock).mockResolvedValue(mockCreateResult);
    
    // Chama o método do serviço, fornecendo o CreateAvisoDto e o id de usuário.
    const result: Avisos = await service.create(
      { id: null, titulo: 'string', descricao: 'string', data: new Date(), usuario_id: 'string', inicial_id: 2, tipo: 2 },
      'usuario_id',
    );

    // Testa se o resultado não é nulo.
    expect(result).not.toBeNull();
    // Verifica se o método mockado do prisma foi chamado corretamente.
    expect(prisma.avisos.create).toHaveBeenCalledWith({
      data: { titulo: 'string', descricao: 'string', data: expect.any(Date), usuario_id: 'usuario_id', inicial_id: 2 }
    });
    // Verifica se o retorno está correto.
    expect(result).toEqual(mockCreateResult);
  });

  /**
   * Testando chamada do serviço de "buscarPorMesAno"
   * 
   */
  it('should call prisma.avisos.findMany', async () => {
    // Criando o objeto mockado de retorno da chamada "buscarPorMesAno".
    const mockCreateResult: Avisos[] = [
      { id: '1', titulo: 'Teste', descricao: 'Descrição do teste', data: null, usuario_id: 'user-id', inicial_id: 2, criado_em: null, alterado_em: null },
      { id: '2', titulo: 'Teste 2', descricao: 'Descrição do teste 2', data: null, usuario_id: 'user-id-2', inicial_id: 3, criado_em: null, alterado_em: null }
    ];
    // Configura o retorno do método mockado
    (prisma.avisos.findMany as jest.Mock).mockResolvedValue(mockCreateResult);

    // Chama o método do serviço, fornecendo o mês, ano e o id de usuário.
    const result: Avisos[] = await service.buscarPorMesAno(6, 2024, "usuario_id");

    // Testa se o resultado não é nulo.
    expect(result).not.toBeNull();
    // Verifica se o método do prisma mockado foi chamado corretamente.
    expect(prisma.avisos.findMany).toHaveBeenCalledWith({
      where: {
        AND: [
          {
            OR: [
              { usuario_id: { equals: expect.any(String) } },
              { usuario_id: { equals: null } }
            ]
          },
          { data: { gte: expect.any(Date) } },
          { data: { lte: expect.any(Date) } }
        ]
      }
    });
    // Verifica se o retorno está correto.
    expect(result).toEqual(mockCreateResult);
  });

  /**
   * Testando chamada do serviço de "update"
   * 
   */
  it('should call prisma.avisos.update', async () => {
    // Criando o objeto mockado de retorno da chamada "update".
    const mockUpdateResult: UpdateAvisoDto = { id: '1', titulo: 'Teste', descricao: 'Descrição do teste', data: null, usuario_id: 'user-id', inicial_id: 2 };
    // Configura o retorno do método mockado.
    (prisma.avisos.update as jest.Mock).mockResolvedValue(mockUpdateResult);

    // Chama o método do serviço, fornecendo o id do aviso e objeto UpdateAvisoDto.
    const result: AvisosResponseDTO = await service.update('123', mockUpdateResult);

    // Testa se o resultado não é nulo.
    expect(result).not.toBeNull();
    // Verifica se o método do prisma mockado foi chamado corretamente.
    expect(prisma.avisos.update).toHaveBeenCalledWith({
      where: { id: expect.any(String) },
      data: mockUpdateResult
    });
    // Verifica se o retorno está correto.
    expect(result).toEqual(mockUpdateResult);
  });

  /**
   * Testando chamada do serviço de "remove"
   * 
   */
  it('should call prisma.avisos.delete', async () => {
    // Criando o objeto mockado de retorno da chamada "remove".
    const mockDeleteResult: AvisosResponseDTO = { id: '1', titulo: 'Teste', descricao: 'Descrição do teste', data: null, usuario_id: 'user-id', inicial_id: 2, criado_em: null, alterado_em: null };
    // Configura o retorno do método mockado.
    (prisma.avisos.delete as jest.Mock).mockResolvedValue(mockDeleteResult);

    // Chama o método do serviço, fornecendo o id do aviso.
    const result: AvisosResponseDTO = await service.remove('123');

    // Testa se o resultado não é nulo.
    expect(result).not.toBeNull();
    // Verifica se o método do prisma mockado foi chamado corretamente.
    expect(prisma.avisos.delete).toHaveBeenCalledWith({
      where: { id: expect.any(String) }
    });
    // Verifica se o retorno está correto.
    expect(result).toEqual(mockDeleteResult);
  });
});
