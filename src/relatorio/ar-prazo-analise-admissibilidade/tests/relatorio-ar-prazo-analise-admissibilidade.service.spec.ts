import { Test, TestingModule } from '@nestjs/testing';
import { ArPrazoAnaliseAdmissibilidadeService } from '../relatorio-ar-prazo-analise-admissibilidade';
import { PrismaService } from 'src/prisma/prisma.service';

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
    });

    describe('includeReconsideracaoESuspensaoData', () => {
        it('deve adicionar data de reconsideração e calcular suspensão de prazo', async () => {
            type ListaItem = {
                id: number;
                requalifica_rapido: boolean;
                data_requalificacao?: Date;
                suspensao_prazo?: number;
            };
            const lista: ListaItem[] = [
                { id: 1, requalifica_rapido: true, data_requalificacao: undefined, suspensao_prazo: undefined },
                { id: 2, requalifica_rapido: false, data_requalificacao: undefined, suspensao_prazo: undefined },
            ];
            (prisma.reconsideracao_Admissibilidade.findUnique as jest.Mock).mockImplementation(({ where }) => {
                if (where.inicial_id === 1) return { publicacao: new Date('2023-03-01') };
                return null;
            });
            (prisma.suspensao_Prazo.findMany as jest.Mock).mockImplementation(({ where }) => {
                if (where.inicial_id === 1)
                    return [
                        { inicial_id: 1, inicio: '2023-04-01', final: '2023-04-11' },
                        { inicial_id: 1, inicio: '2023-05-01', final: '2023-05-06' },
                    ];
                return [];
            });

            const resultPromises = await service.includeReconsideracaoESuspensaoData(lista as any);
            const result = await Promise.all(resultPromises);

            expect(prisma.reconsideracao_Admissibilidade.findUnique).toHaveBeenCalledWith({ where: { inicial_id: 1 } });
            expect(prisma.suspensao_Prazo.findMany).toHaveBeenCalledWith({ where: { inicial_id: 1 } });
            expect(lista[0].data_requalificacao).toEqual(new Date('2023-03-01'));
            expect(lista[0].suspensao_prazo).toBeCloseTo(15, 0); // 10 + 5 dias
            expect(lista[1].data_requalificacao).toBeUndefined();
            expect(lista[1].suspensao_prazo).toBeUndefined();
        });
    });

    describe('getPrazoAnaliseAdmissibilidade', () => {
        it('deve executar o fluxo principal e retornar agrupamento por mês', async () => {
            const mockIniciais = [
                { id: 1, criado_em: new Date('2023-01-01') },
                { id: 2, criado_em: new Date('2023-02-01') },
            ];
            (prisma.inicial.findMany as jest.Mock).mockResolvedValue(mockIniciais);

            const result = await service.getPrazoAnaliseAdmissibilidade('2023-01-01', '2023-12-31');
            expect(result['2023']['jan']).toEqual([mockIniciais[0]]);
            expect(result['2023']['fev']).toEqual([mockIniciais[1]]);
        });
    });
});