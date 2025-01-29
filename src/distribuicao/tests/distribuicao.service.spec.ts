import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../../prisma/prisma.service';
import { DistribuicaoService } from '../distribuicao.service';
import { CreateDistribuicaoDto } from '../dto/create-distribuicao.dto';
import { DistribuicaoResponseDTO } from '../dto/distribuicao-response.dto';
import { UpdateDistribuicaoDto } from '../dto/update-distribuicao.dto';

describe('DistribuicaoService tests', () => {
  let service: DistribuicaoService;
  let prisma: PrismaService;

  // configurando mock para o serviço do prisma
  const mockPrismaService = {
    distribuicao: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DistribuicaoService,
        { provide: PrismaService, useValue: mockPrismaService }
      ]
    }).compile();
    service = module.get<DistribuicaoService>(DistribuicaoService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  // Testando a definição do service e do prisma
  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(prisma).toBeDefined();
  });

  /**
   * 
   * Testando chamada do serviço de "criar"
   * 
   */
  it('should call prisma.distribuicao.create when create is called', async () => {
    // Criando o objeto mockado de retorno da chamada "criar".
    const mockCreateResult: CreateDistribuicaoDto = { inicial_id: 123, tecnico_responsavel_id: 'tecnico_responsavel_id', administrativo_responsavel_id: 'administrativo_responsavel_id', processo_relacionado_incomum: "processo_relacionado_incomum", assunto_processo_relacionado_incomum: 'assunto_processo_relacionado_incomum', baixa_pagamento: 1, obs: null };
    // Configura o retorno do método mockado
    (prisma.distribuicao.findUnique as jest.Mock).mockResolvedValue(null);
    (prisma.distribuicao.create as jest.Mock).mockResolvedValue(mockCreateResult);

    // Chama o método do serviço, fornecendo o CreateDistribuicaoDto.
    const result: DistribuicaoResponseDTO = await service.criar(mockCreateResult);

    // Testa se o resultado não é nulo.
    expect(result).not.toBeNull();
    // Verifica se o método mockado do prisma foi chamado corretamente.
    expect(prisma.distribuicao.findUnique).toHaveBeenCalledWith({
      where: { 
        inicial_id: expect.any(Number) 
      }
    });
    expect(prisma.distribuicao.create).toHaveBeenCalledWith({ 
      data: mockCreateResult 
    });
    // Verifica se o retorno está correto.
    expect(result).toEqual(mockCreateResult);
  });

  /**
   * 
   * Testando chamada do serviço de "atualizar"
   * 
   */
  it('should call prisma.distribuicao.update', async () => {
    // Criando o objeto mockado de retorno da chamada "atualizar".
    const mockUpdateResult: UpdateDistribuicaoDto = { inicial_id: 123, tecnico_responsavel_id: 'tecnico_responsavel_id', administrativo_responsavel_id: 'administrativo_responsavel_id', processo_relacionado_incomum: "processo_relacionado_incomum", assunto_processo_relacionado_incomum: 'assunto_processo_relacionado_incomum', baixa_pagamento: 1, obs: null };
    // Configura o retorno do método mockado.
    (prisma.distribuicao.findUnique as jest.Mock).mockResolvedValue(null);
    (prisma.distribuicao.update as jest.Mock).mockResolvedValue(mockUpdateResult);

    // Chama o método do serviço, fornecendo o id do aviso e objeto UpdateAvisoDto.
    const result: DistribuicaoResponseDTO = await service.atualizar(123, mockUpdateResult);

    // Testa se o resultado não é nulo.
    expect(result).not.toBeNull();
    // Verifica se o método de busca mockado foi chamado corretamente.
    expect(prisma.distribuicao.findUnique).toHaveBeenCalledWith({
      where: { inicial_id: expect.any(Number) },
      include: {
        tecnico_responsavel: expect.any(Boolean),
        administrativo_responsavel: expect.any(Boolean)
      }
    });
    // Verifica se o método do prisma mockado foi chamado corretamente.
    expect(prisma.distribuicao.update).toHaveBeenCalledWith({
      where: { inicial_id: expect.any(Number) },
      data: {
        administrativo_responsavel_id: expect.any(String),
        tecnico_responsavel_id: expect.any(String)
      }
    });
    // Verifica se o retorno está correto.
    expect(result).toEqual(mockUpdateResult);
  });

  /**
   * Testando chamada do serviço de "mudarAdministrativoResponsavel"
   * 
   */
  it('should call prisma.distribuicao.update', async () => {
    // Criando o objeto mockado de retorno da chamada "mudarAdministrativoResponsavel".
    const mockUpdateResult: UpdateDistribuicaoDto = { inicial_id: 123, tecnico_responsavel_id: 'tecnico_responsavel_id', administrativo_responsavel_id: 'administrativo_responsavel_id', processo_relacionado_incomum: "processo_relacionado_incomum", assunto_processo_relacionado_incomum: 'assunto_processo_relacionado_incomum', baixa_pagamento: 1, obs: null };
    // Configura o retorno do método mockado.
    (prisma.distribuicao.findUnique as jest.Mock).mockResolvedValue(mockUpdateResult);
    (prisma.distribuicao.update as jest.Mock).mockResolvedValue(mockUpdateResult);

    // Chama o método do serviço, fornecendo o id da distribuição e id do administrativo responsável.
    const result: DistribuicaoResponseDTO = await service.mudarAdministrativoResponsavel(123, "administrativo_responsavel_id");

    // Testa se o resultado não é nulo.
    expect(result).not.toBeNull();
    // Verifica se o método de busca mockado foi chamado corretamente.
    expect(prisma.distribuicao.findUnique).toHaveBeenCalledWith({
      where: { inicial_id: expect.any(Number) }
    });
    // Verifica se o método do prisma mockado foi chamado corretamente.
    expect(prisma.distribuicao.update).toHaveBeenCalledWith({
      where: { inicial_id: expect.any(Number) },
      data: {
        administrativo_responsavel_id: expect.any(String)
      }
    });
    // Verifica se o retorno está correto.
    expect(result).toEqual(mockUpdateResult);
  });

  /**
   * Testando chamada do serviço de "mudarTecnicoResponsavel"
   * 
   */
  it('should call prisma.distribuicao.update', async () => {
    // Criando o objeto mockado de retorno da chamada "mudarTecnicoResponsavel".
    const mockUpdateResult: UpdateDistribuicaoDto = { inicial_id: 123, tecnico_responsavel_id: 'tecnico_responsavel_id', administrativo_responsavel_id: 'administrativo_responsavel_id', processo_relacionado_incomum: "processo_relacionado_incomum", assunto_processo_relacionado_incomum: 'assunto_processo_relacionado_incomum', baixa_pagamento: 1, obs: null };
    // Configura o retorno do método mockado.
    (prisma.distribuicao.findUnique as jest.Mock).mockResolvedValue(mockUpdateResult);
    (prisma.distribuicao.update as jest.Mock).mockResolvedValue(mockUpdateResult);

    // Chama o método do serviço, fornecendo o id da distribuição e id do técnico responsável.
    const result: DistribuicaoResponseDTO = await service.mudarTecnicoResponsavel(123, "tecnico_responsavel_id");

    // Testa se o resultado não é nulo.
    expect(result).not.toBeNull();
    // Verifica se o método de busca mockado foi chamado corretamente.
    expect(prisma.distribuicao.findUnique).toHaveBeenCalledWith({
      where: { inicial_id: expect.any(Number) }
    });
    // Verifica se o método do prisma mockado foi chamado corretamente.
    expect(prisma.distribuicao.update).toHaveBeenCalledWith({
      where: { inicial_id: expect.any(Number) },
      data: {
        tecnico_responsavel_id: expect.any(String)
      }
    });
    // Verifica se o retorno está correto.
    expect(result).toEqual(mockUpdateResult);
  });
});
