import { ArProcessosAprovadosService } from '../relatorio-ar-processos-aprovados';
import { PrismaService } from 'src/prisma/prisma.service';
import { Test, TestingModule } from '@nestjs/testing';
import { HttpException, HttpStatus } from '@nestjs/common';
import { ERROR_MESSAGES } from '../constants/error-messages';

// Mock da função calcularDiferencaEmDias
jest.mock('src/utils/date.utils', () => ({
    calcularDiferencaEmDias: jest.fn((dataFim, dataInicio) => {
        const diffTime = new Date(dataFim).getTime() - new Date(dataInicio).getTime();
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }),
}));

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

    const mockProcesso = {
        id: 1,
        data_protocolo: new Date('2024-01-15'),
        status: 3,
        criado_em: new Date('2024-01-15'),
    };

    // Mock do Prisma
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

            expect((result[0] as any).tempo_analise_inicial).toBe(9);
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

            expect((result[0] as any).tempo_analise_recurso_1).toBe(5);
            expect(
                mockPrisma.reconsideracao_Admissibilidade.findUnique,
            ).toHaveBeenCalledWith({ where: { inicial_id: 2 } });
        });

        it('deve retornar 0 para tempos quando admissibilidade não existe', async () => {
            mockPrisma.admissibilidade.findUnique.mockResolvedValue(null);

            const lista = [{ id: 3 }] as any;
            const result = await service.includeTemPoDeAnalise(lista);

            expect((result[0] as any).tempo_analise_inicial).toBe(0);
            expect((result[0] as any).tempo_analise_recurso_1).toBe(0);
        });

        it('deve retornar 0 para tempos quando datas são nulas', async () => {
            mockPrisma.admissibilidade.findUnique.mockResolvedValue({
                data_envio: null,
                data_decisao_interlocutoria: null,
                reconsiderado: false,
            });

            const lista = [{ id: 4 }] as any;
            const result = await service.includeTemPoDeAnalise(lista);

            expect((result[0] as any).tempo_analise_inicial).toBe(0);
            expect((result[0] as any).tempo_analise_recurso_1).toBe(0);
        });

        it('deve retornar 0 quando reconsiderado mas sem dados de reconsideração', async () => {
            mockPrisma.admissibilidade.findUnique.mockResolvedValue({
                ...mockAdmissibilidade,
                reconsiderado: true,
            });
            mockPrisma.reconsideracao_Admissibilidade.findUnique.mockResolvedValue(null);

            const lista = [{ id: 5 }] as any;
            const result = await service.includeTemPoDeAnalise(lista);

            expect((result[0] as any).tempo_analise_recurso_1).toBeUndefined();
        });

        it('deve lançar HttpException quando ocorre erro no processamento', async () => {
            const errorMessage = 'Database connection error';
            mockPrisma.admissibilidade.findUnique.mockRejectedValue(
                new Error(errorMessage),
            );

            const lista = [{ id: 1 }] as any;

            await expect(service.includeTemPoDeAnalise(lista)).rejects.toThrow(
                HttpException,
            );

            try {
                await service.includeTemPoDeAnalise(lista);
            } catch (error) {
                expect(error).toBeInstanceOf(HttpException);
                expect(error.getStatus()).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
                expect(error.getResponse()).toEqual({
                    api_mensagem: ERROR_MESSAGES.FALHA_AO_ATRIBUIR_TEMPO_ANALISE,
                    tipo_erro: 'Error',
                    detalhe_tecnico: errorMessage,
                });
            }
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

        it('deve lançar HttpException quando falha na busca do banco de dados', async () => {
            const errorMessage = 'Database error';
            mockPrisma.inicial.findMany.mockRejectedValue(new Error(errorMessage));

            await expect(service.getDataPorAno('2024')).rejects.toThrow(HttpException);

            try {
                await service.getDataPorAno('2024');
            } catch (error) {
                expect(error).toBeInstanceOf(HttpException);
                expect(error.getStatus()).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
                expect(error.getResponse()).toEqual({
                    api_mensagem: ERROR_MESSAGES.FALHA_AGRUPAR_POR_ANO,
                    tipo_erro: 'Error',
                    detalhe_tecnico: errorMessage,
                });
            }
        });

        it('deve lançar HttpException quando includeTemPoDeAnalise falha', async () => {
            const mockProcessos = [{ id: 1 }];
            mockPrisma.inicial.findMany.mockResolvedValue(mockProcessos);
            
            const errorMessage = 'Falha ao incluir tempo de análise';
            jest.spyOn(service, 'includeTemPoDeAnalise').mockRejectedValue(
                new HttpException({
                    api_mensagem: ERROR_MESSAGES.FALHA_AO_ATRIBUIR_TEMPO_ANALISE,
                    tipo_erro: 'Error',
                    detalhe_tecnico: errorMessage,
                }, HttpStatus.INTERNAL_SERVER_ERROR)
            );

            await expect(service.getDataPorAno('2024')).rejects.toThrow(HttpException);
        });
    });

    describe('getDataPorMes', () => {
        const mockProcessosComData = [
            { id: 1, data_protocolo: new Date('2024-01-15') },
            { id: 2, data_protocolo: new Date('2024-02-20') },
            { id: 3, data_protocolo: new Date('2024-12-10') },
        ];

        it('deve agrupar processos por mês corretamente', async () => {
            const result = await service.getDataPorMes(mockProcessosComData as any);

            // Verifica se todos os meses estão presentes
            expect(Object.keys(result)).toHaveLength(12);
            
            // Verifica se janeiro tem 1 processo
            expect(result['jan']).toHaveLength(1);
            expect(result['jan'][0].id).toBe(1);
            
            // Verifica se fevereiro tem 1 processo
            expect(result['fev']).toHaveLength(1);
            expect(result['fev'][0].id).toBe(2);
            
            // Verifica se dezembro tem 1 processo e está na última posição
            const meses = Object.keys(result);
            expect(meses[meses.length - 1]).toBe('dez');
            expect(result['dez']).toHaveLength(1);
            expect(result['dez'][0].id).toBe(3);
            
            // Verifica se março está vazio
            expect(result['mar']).toHaveLength(0);
        });

        it('deve retornar todos os meses vazios quando lista está vazia', async () => {
            const result = await service.getDataPorMes([]);

            expect(Object.keys(result)).toHaveLength(12);
            Object.values(result).forEach(mes => {
                expect(mes).toHaveLength(0);
            });
        });

        it('deve lançar HttpException quando lista é null ou undefined', async () => {
            await expect(service.getDataPorMes(null as any)).rejects.toThrow(HttpException);
            await expect(service.getDataPorMes(undefined as any)).rejects.toThrow(HttpException);

            try {
                await service.getDataPorMes(null as any);
            } catch (error) {
                expect(error).toBeInstanceOf(HttpException);
                expect(error.getStatus()).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
                expect(error.getResponse()).toEqual({
                    api_mensagem: ERROR_MESSAGES.FALHA_AGRUPAR_POR_ANO,
                    tipo_erro: 'Error',
                    detalhe_tecnico: ERROR_MESSAGES.FALHA_LISTA_INDEFINIDA,
                });
            }
        });

        it('deve lançar HttpException quando ocorre erro no processamento', async () => {
            // Mock de processo com data inválida que pode causar erro
            const processosComErro = [
                { id: 1, data_protocolo: 'invalid-date' }
            ];

            await expect(service.getDataPorMes(processosComErro as any)).rejects.toThrow(HttpException);
        });
    });

    describe('getRelatorioAnaliseAdmissibilidade', () => {
        it('deve retornar relatório completo por ano e mês', async () => {
            const mockProcessosPorAno = [
                { id: 1, data_protocolo: new Date('2024-01-15') },
                { id: 2, data_protocolo: new Date('2024-02-20') },
            ];

            const mockRelatorioMeses = {
                'jan': [{ id: 1, data_protocolo: new Date('2024-01-15') }],
                'fev': [{ id: 2, data_protocolo: new Date('2024-02-20') }],
                'mar': [],
                // ... outros meses
            };

            jest.spyOn(service, 'getDataPorAno').mockResolvedValue(mockProcessosPorAno as any);
            jest.spyOn(service, 'getDataPorMes').mockResolvedValue(mockRelatorioMeses as any);

            const result = await service.getRelatorioAnaliseAdmissibilidade('2024');

            expect(service.getDataPorAno).toHaveBeenCalledWith('2024');
            expect(service.getDataPorMes).toHaveBeenCalledWith(mockProcessosPorAno);
            expect(result).toEqual(mockRelatorioMeses);
        });

        it('deve propagar erro quando getDataPorAno falha', async () => {
            jest.spyOn(service, 'getDataPorAno').mockRejectedValue(
                new HttpException('Erro ao buscar dados por ano', HttpStatus.INTERNAL_SERVER_ERROR)
            );

            await expect(service.getRelatorioAnaliseAdmissibilidade('2024')).rejects.toThrow(HttpException);
        });

        it('deve propagar erro quando getDataPorMes falha', async () => {
            const mockProcessosPorAno = [{ id: 1, data_protocolo: new Date('2024-01-15') }];
            
            jest.spyOn(service, 'getDataPorAno').mockResolvedValue(mockProcessosPorAno as any);
            jest.spyOn(service, 'getDataPorMes').mockRejectedValue(
                new HttpException('Erro ao agrupar por mês', HttpStatus.INTERNAL_SERVER_ERROR)
            );

            await expect(service.getRelatorioAnaliseAdmissibilidade('2024')).rejects.toThrow(HttpException);
        });
    });
});