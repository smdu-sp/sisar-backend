import { ArProcessosAprovadosService } from '../relatorio-ar-processos-aprovados';
import { PrismaService } from 'src/prisma/prisma.service';
import { Test, TestingModule } from '@nestjs/testing';

describe('ArProcessosAprovadosService', () => {
    let service: ArProcessosAprovadosService;
    let prisma: PrismaService;

    const mockAdmissibilidade = {
        data_envio: '2024-01-01',
        data_decisao_interlocutoria: '2024-01-10',
        reconsiderado: false,
    };

    const mockReconsideracaoAdmissibilidade = {
        pedido_reconsideracao: '2024-01-05',
    };

    // Força os types para any
    const mockPrisma: any = {
        admissibilidade: {
            findUnique: jest.fn(),
        },
        reconsideracao_Admissibilidade: {
            findUnique: jest.fn(),
        },
        inicial: {
            findMany: jest.fn(),
        },
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ArProcessosAprovadosService,
                { provide: PrismaService, useValue: mockPrisma as any },
            ],
        }).compile();

        service = module.get<ArProcessosAprovadosService>(
            ArProcessosAprovadosService,
        );
        prisma = module.get<PrismaService>(PrismaService);

        jest.clearAllMocks();
    });

    describe('includeTemPoDeAnalise', () => {
        it('deve retornar tempo de análise inicial quando não reconsiderado', async () => {
            mockPrisma.admissibilidade.findUnique.mockResolvedValue(
                mockAdmissibilidade,
            );

            const lista = [{ id: 1 }] as any;
            const result = await service.includeTemPoDeAnalise(lista);

            expect((result[0] as any).tempo_analise_inicial).toBe(9); // diferença de dias
            expect((result[0] as any).tempo_analise_recurso_1).toBeUndefined();
            expect(mockPrisma.admissibilidade.findUnique).toHaveBeenCalledWith({
                where: { inicial_id: 1 },
            });
        });

        it('deve retornar tempo de análise recurso 1 quando reconsiderado', async () => {
            mockPrisma.admissibilidade.findUnique.mockResolvedValue({
                ...mockAdmissibilidade,
                reconsiderado: true,
            });
            mockPrisma.reconsideracao_Admissibilidade.findUnique.mockResolvedValue(
                mockReconsideracaoAdmissibilidade,
            );

            const lista = [{ id: 2 }] as any;
            const result = await service.includeTemPoDeAnalise(lista);

            expect((result[0] as any).tempo_analise_recurso_1).toBe(5); // diferença de dias
            expect(
                mockPrisma.reconsideracao_Admissibilidade.findUnique,
            ).toHaveBeenCalledWith({ where: { inicial_id: 2 } });
        });

        it('deve retornar 0 para tempos se admissibilidade não existe ou datas são nulas', async () => {
            mockPrisma.admissibilidade.findUnique.mockResolvedValue(null);

            const lista = [{ id: 3 }] as any;
            const result = await service.includeTemPoDeAnalise(lista);

            expect((result[0] as any).tempo_analise_inicial).toBe(0);
            expect((result[0] as any).tempo_analise_recurso_1).toBe(0);

            mockPrisma.admissibilidade.findUnique.mockResolvedValue({
                data_envio: null,
                data_decisao_interlocutoria: null,
            });

            const lista2 = [{ id: 4 }] as any;
            const result2 = await service.includeTemPoDeAnalise(lista2);

            expect((result2[0] as any).tempo_analise_inicial).toBe(0);
            expect((result2[0] as any).tempo_analise_recurso_1).toBe(0);
        });
    });

    describe('getDataPorAno', () => {
        it('deve buscar processos aprovados e incluir tempos de análise', async () => {
            const mockProcessos = [{ id: 1 }, { id: 2 }];
            mockPrisma.inicial.findMany.mockResolvedValue(mockProcessos);
            jest.spyOn(service, 'includeTemPoDeAnalise').mockResolvedValue([
                { id: 1, tempo_analise_inicial: 9 },
                { id: 2, tempo_analise_inicial: 5 },
            ] as any);

            const result = await service.getDataPorAno('2024');

            expect(mockPrisma.inicial.findMany).toHaveBeenCalledWith({
                where: {
                    status: 3,
                    criado_em: {
                        gte: new Date('2024-01-01'),
                        lt: new Date('2024-12-31'),
                    },
                },
            });
            expect(service.includeTemPoDeAnalise).toHaveBeenCalledWith(mockProcessos);
            expect(result).toEqual([
                { id: 1, tempo_analise_inicial: 9 },
                { id: 2, tempo_analise_inicial: 5 },
            ]);
        });
    });
});
