import { Test, TestingModule } from '@nestjs/testing';
import { ArPrazoAnaliseAdmissibilidadeService } from '../relatorio-ar-prazo-analise-admissibilidade';
import { PrismaService } from 'src/prisma/prisma.service';
import { HttpException, HttpStatus } from '@nestjs/common';
import { ERROR_MESSAGES } from '../constants/error-messages';

describe('ArPrazoAnaliseAdmissibilidadeService', () => {
    let service: ArPrazoAnaliseAdmissibilidadeService;
    let prisma: PrismaService;

    const MockPrismaService = {
        inicial: {
            findMany: jest.fn(),
        },
        reconsideracao_Admissibilidade: {
            findUnique: jest.fn(),
        },
        suspensao_Prazo: {
            findMany: jest.fn(),
        },
        motivo_Inadmissao: {
            findUnique: jest.fn(),
        },
        admissibilidade: {
            findUnique: jest.fn(),
        },
    };

    beforeEach(async () => {
        jest.clearAllMocks();
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ArPrazoAnaliseAdmissibilidadeService,
                {
                    provide: PrismaService,
                    useValue: MockPrismaService,
                },
            ],
        }).compile();

        service = module.get<ArPrazoAnaliseAdmissibilidadeService>(ArPrazoAnaliseAdmissibilidadeService);
        prisma = module.get<PrismaService>(PrismaService);
    });

    it('deve verificar se os services foram definidos', () => {
        expect(service).toBeDefined();
        expect(prisma).toBeDefined();
    });

    describe('parseDate (método privado testado indiretamente)', () => {
        it('deve aceitar data no formato DD-MM-YYYY através do método público', async () => {
            const mockIniciais = [{ id: 1, criado_em: new Date('2023-01-01') }];
            (prisma.inicial.findMany as jest.Mock).mockResolvedValue(mockIniciais);

            await expect(service.getPrazoAnaliseAdmissibilidade('01-01-2023', '31-12-2023')).resolves.toBeDefined();
        });

        it('deve aceitar data no formato YYYY-MM-DD através do método público', async () => {
            const mockIniciais = [{ id: 1, criado_em: new Date('2023-01-01') }];
            (prisma.inicial.findMany as jest.Mock).mockResolvedValue(mockIniciais);

            await expect(service.getPrazoAnaliseAdmissibilidade('2023-01-01', '2023-12-31')).resolves.toBeDefined();
        });

        it('deve lançar erro para data inválida', async () => {
            await expect(service.getPrazoAnaliseAdmissibilidade('data-invalida', '2023-12-31')).rejects.toThrow();
        });
    });

    describe('getDataPorPeriodo', () => {
        it('deve retornar iniciais filtradas por período', async () => {
            const mockIniciais = [{ id: 1, data_protocolo: new Date('2023-01-01') }];
            (prisma.inicial.findMany as jest.Mock).mockResolvedValue(mockIniciais);

            const period = { gte: new Date('2023-01-01'), lte: new Date('2023-12-31') };
            const result = await service.getDataPorPeriodo(period as any);
            
            expect(prisma.inicial.findMany).toHaveBeenCalledWith({
                where: {
                    data_protocolo: {
                        gte: period.gte,
                        lte: period.lte,
                    },
                },
            });
            expect(result).toEqual(mockIniciais);
        });

        it('deve lançar HttpException quando ocorrer erro no banco', async () => {
            (prisma.inicial.findMany as jest.Mock).mockRejectedValue(new Error('Erro no banco'));

            const period = { gte: new Date('2023-01-01'), lte: new Date('2023-12-31') };
            
            await expect(service.getDataPorPeriodo(period as any)).rejects.toThrow(HttpException);
        });
    });

    describe('groupByDataYear', () => {
        it('deve agrupar iniciais por ano', async () => {
            const lista = [
                { id: 1, criado_em: new Date('2022-05-01') },
                { id: 2, criado_em: new Date('2023-06-01') },
                { id: 3, criado_em: new Date('2023-07-01') },
            ];
            const period = { gte: new Date('2022-01-01'), lte: new Date('2023-12-31') };
            const result = await service.groupByDataYear(lista as any, period as any);
            
            expect(result['2022']).toEqual([lista[0]]);
            expect(result['2023']).toEqual([lista[1], lista[2]]);
        });

        it('deve lançar HttpException quando ocorrer erro no agrupamento', async () => {
            const lista = [{ id: 1, criado_em: 'data-invalida' }];
            const period = { gte: new Date('2022-01-01'), lte: new Date('2023-12-31') };
            
            await expect(service.groupByDataYear(lista as any, period as any)).rejects.toThrow(HttpException);
        });
    });

    describe('groupByDataMonth', () => {
        it('deve agrupar iniciais por mês dentro de cada ano', async () => {
            const relatorioAnual = {
                2023: [
                    { id: 1, criado_em: new Date('2023-01-15') },
                    { id: 2, criado_em: new Date('2023-02-10') },
                ],
            };
            const period = { gte: new Date('2023-01-01'), lte: new Date('2023-12-31') };
            const result = await service.groupByDataMonth(relatorioAnual as any, period as any);
            
            expect(result['2023']['jan']).toEqual([relatorioAnual[2023][0]]);
            expect(result['2023']['fev']).toEqual([relatorioAnual[2023][1]]);
        });

        it('deve lançar HttpException quando ocorrer erro no agrupamento por mês', async () => {
            const relatorioAnual = {
                2023: [{ id: 1, criado_em: 'data-invalida' }],
            };
            const period = { gte: new Date('2023-01-01'), lte: new Date('2023-12-31') };
            
            await expect(service.groupByDataMonth(relatorioAnual as any, period as any)).rejects.toThrow(HttpException);
        });
    });

    describe('includeReconsideracaoESuspensaoData', () => {
        it('deve adicionar data de reconsideração e calcular suspensão de prazo com etapas', async () => {
            const lista = [
                { 
                    id: 1, 
                    requalifica_rapido: true, 
                    data_requalificacao: undefined, 
                    suspensao_prazo: undefined,
                    suspensao_prazo_etapa_1: undefined,
                    suspensao_prazo_etapa_2: undefined,
                    motivos_suspensao: undefined
                },
                { 
                    id: 2, 
                    requalifica_rapido: false, 
                    data_requalificacao: undefined, 
                    suspensao_prazo: undefined,
                    suspensao_prazo_etapa_1: undefined,
                    suspensao_prazo_etapa_2: undefined,
                    motivos_suspensao: undefined
                },
            ];

            (prisma.reconsideracao_Admissibilidade.findUnique as jest.Mock).mockImplementation(({ where }) => {
                if (where.inicial_id === 1) return { publicacao: new Date('2023-03-01') };
                return null;
            });

            (prisma.suspensao_Prazo.findMany as jest.Mock).mockImplementation(({ where }) => {
                if (where.inicial_id === 1)
                    return [
                        { inicial_id: 1, inicio: '2023-04-01', final: '2023-04-11', etapa: 1, motivo: '1' },
                        { inicial_id: 1, inicio: '2023-05-01', final: '2023-05-06', etapa: 2, motivo: '2' },
                    ];
                return [];
            });

            (prisma.motivo_Inadmissao.findUnique as jest.Mock).mockImplementation(({ where }) => {
                if (where.id === '1') return { descricao: 'Motivo 1' };
                if (where.id === '2') return { descricao: 'Motivo 2' };
                return null;
            });

            const result = await service.includeReconsideracaoESuspensaoData(lista as any);

            expect(result[0].data_requalificacao).toEqual(new Date('2023-03-01'));
            expect(result[0].suspensao_prazo).toBe(15); // 10 + 5 dias
            expect(result[0].suspensao_prazo_etapa_1).toBe(10);
            expect(result[0].suspensao_prazo_etapa_2).toBe(5);
            expect(result[0].motivos_suspensao).toEqual(['Motivo 1', 'Motivo 2']);
            expect(result[1].data_requalificacao).toBeNull();
            expect(result[1].suspensao_prazo).toBeNull();
        });

        it('deve tratar casos sem reconsideração para requalificação rápida', async () => {
            const lista = [{ id: 1, requalifica_rapido: true }];

            (prisma.reconsideracao_Admissibilidade.findUnique as jest.Mock).mockResolvedValue(null);
            (prisma.suspensao_Prazo.findMany as jest.Mock).mockResolvedValue([]);

            const result = await service.includeReconsideracaoESuspensaoData(lista as any);

            expect(result[0].data_requalificacao).toBeNull();
        });

        it('deve lançar HttpException quando ocorrer erro no processamento', async () => {
            const lista = [{ id: 1, requalifica_rapido: true }];

            (prisma.reconsideracao_Admissibilidade.findUnique as jest.Mock).mockRejectedValue(new Error('Erro no banco'));

            await expect(service.includeReconsideracaoESuspensaoData(lista as any)).rejects.toThrow(HttpException);
        });
    });

    describe('includePrazoDeAdmissibilidade', () => {
        it('deve calcular tempo de análise para admissibilidade normal', async () => {
            const lista = [
                { 
                    id: 1, 
                    requalifica_rapido: false,
                    tempo_de_analise_admissibilidade: undefined,
                    tempo_de_analise_reconsideracao: undefined
                }
            ];

            (prisma.admissibilidade.findUnique as jest.Mock).mockResolvedValue({
                data_envio: new Date('2023-01-01'),
                data_decisao_interlocutoria: new Date('2023-01-11') // 10 dias
            });

            const result = await service.includePrazoDeAdmissibilidade(lista as any);

            expect(result[0].tempo_de_analise_admissibilidade).toBe(10);
            expect(result[0].tempo_de_analise_reconsideracao).toBeNull();
        });

        it('deve calcular tempo de análise para reconsideração', async () => {
            const lista = [
                { 
                    id: 1, 
                    requalifica_rapido: true,
                    tempo_de_analise_admissibilidade: undefined,
                    tempo_de_analise_reconsideracao: undefined
                }
            ];

            (prisma.admissibilidade.findUnique as jest.Mock).mockResolvedValue({
                data_envio: new Date('2023-01-01'),
                data_decisao_interlocutoria: new Date('2023-01-11')
            });

            (prisma.reconsideracao_Admissibilidade.findUnique as jest.Mock).mockResolvedValue({
                publicacao: new Date('2023-01-01'),
                pedido_reconsideracao: new Date('2023-01-16'), // 15 dias
                parecer: 'Parecer positivo'
            });

            const result = await service.includePrazoDeAdmissibilidade(lista as any);

            expect(result[0].tempo_de_analise_reconsideracao).toBe(15);
            expect(result[0].tempo_de_analise_admissibilidade).toBeNull();
        });

        it('deve garantir tempo mínimo de 1 dia para análise', async () => {
            const lista = [
                { 
                    id: 1, 
                    requalifica_rapido: false,
                    tempo_de_analise_admissibilidade: undefined,
                    tempo_de_analise_reconsideracao: undefined
                }
            ];

            (prisma.admissibilidade.findUnique as jest.Mock).mockResolvedValue({
                data_envio: new Date('2023-01-01T10:00:00'),
                data_decisao_interlocutoria: new Date('2023-01-01T14:00:00') // mesmo dia
            });

            const result = await service.includePrazoDeAdmissibilidade(lista as any);

            expect(result[0].tempo_de_analise_admissibilidade).toBe(1);
        });

        it('deve tratar caso sem admissibilidade encontrada', async () => {
            const lista = [{ id: 1, requalifica_rapido: false }];

            (prisma.admissibilidade.findUnique as jest.Mock).mockResolvedValue(null);

            const result = await service.includePrazoDeAdmissibilidade(lista as any);

            expect(result[0]).toEqual(lista[0]); // Deve retornar sem modificar
        });

        it('deve lançar HttpException quando ocorrer erro no processamento', async () => {
            const lista = [{ id: 1, requalifica_rapido: false }];

            (prisma.admissibilidade.findUnique as jest.Mock).mockRejectedValue(new Error('Erro no banco'));

            await expect(service.includePrazoDeAdmissibilidade(lista as any)).rejects.toThrow(HttpException);
        });
    });

    describe('getPrazoAnaliseAdmissibilidade', () => {
        beforeEach(() => {
            const mockIniciais = [
                { id: 1, criado_em: new Date('2023-01-01'), requalifica_rapido: false },
                { id: 2, criado_em: new Date('2023-02-01'), requalifica_rapido: true },
            ];

            (prisma.inicial.findMany as jest.Mock).mockResolvedValue(mockIniciais);
            (prisma.reconsideracao_Admissibilidade.findUnique as jest.Mock).mockResolvedValue(null);
            (prisma.suspensao_Prazo.findMany as jest.Mock).mockResolvedValue([]);
            (prisma.admissibilidade.findUnique as jest.Mock).mockResolvedValue({
                data_envio: new Date('2023-01-01'),
                data_decisao_interlocutoria: new Date('2023-01-11')
            });
        });

        it('deve executar o fluxo principal e retornar agrupamento por mês com formato DD-MM-YYYY', async () => {
            const result = await service.getPrazoAnaliseAdmissibilidade('01-01-2023', '31-12-2023');
            
            expect(result['2023']).toBeDefined();
            expect(result['2023']['jan']).toBeDefined();
            expect(result['2023']['fev']).toBeDefined();
            expect(Array.isArray(result['2023']['jan'])).toBe(true);
            expect(Array.isArray(result['2023']['fev'])).toBe(true);
        });

        it('deve executar o fluxo principal e retornar agrupamento por mês com formato YYYY-MM-DD', async () => {
            const result = await service.getPrazoAnaliseAdmissibilidade('2023-01-01', '2023-12-31');
            
            expect(result['2023']).toBeDefined();
            expect(result['2023']['jan']).toBeDefined();
            expect(result['2023']['fev']).toBeDefined();
        });

        it('deve lançar erro para datas inválidas', async () => {
            await expect(service.getPrazoAnaliseAdmissibilidade('data-invalida', '2023-12-31')).rejects.toThrow();
        });

        it('deve propagar erros dos métodos internos', async () => {
            (prisma.inicial.findMany as jest.Mock).mockRejectedValue(new Error('Erro no banco'));

            await expect(service.getPrazoAnaliseAdmissibilidade('2023-01-01', '2023-12-31')).rejects.toThrow(HttpException);
        });
    });
});