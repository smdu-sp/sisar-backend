import { RelatorioARService } from "../relatorio-ar.service";
import { Admissibilidade, Inicial, Unidade } from "@prisma/client";
import { PrismaService } from "src/prisma/prisma.service";
import { Test, TestingModule } from "@nestjs/testing";
import { HttpException, HttpStatus } from "@nestjs/common";
import { ERROR_MESSAGES } from "../constants/error-messages";

describe('Relatorio AR quantitativo test', () => {
    let service: RelatorioARService;
    let prisma: PrismaService;

    const MockPrismaService = {
        admissibilidade: {
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
            findUnique: jest.fn(),
            findMany: jest.fn(),
            count: jest.fn(),
        },
        inicial: {
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
            findUnique: jest.fn(),
            findMany: jest.fn(),
            count: jest.fn(),
        },
        unidade: {
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
            findUnique: jest.fn(),
            findMany: jest.fn(),
            count: jest.fn(),
        },
    }

    beforeEach(async () => {
        jest.clearAllMocks();
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                RelatorioARService,
                {
                    provide: PrismaService,
                    useValue: MockPrismaService
                }
            ]
        }).compile()
        service = module.get<RelatorioARService>(RelatorioARService);
        prisma = module.get<PrismaService>(PrismaService);
    })

    it('deve verificar se os services foram definidos', () => {
        expect(service).toBeDefined();
        expect(prisma).toBeDefined();
    })

    describe('verificarData', () => {
        it('deverá retornar um objeto com datas válidas ao receber mês e ano como strings', () => {
            const result = service.verificarData('7', '2019');
            
            expect(result).toEqual({
                gte: new Date(2019, 6, 1), // julho é mês 6 (0-indexed)
                lte: new Date(2019, 6, 31)
            });
        });

        it('ao receber parâmetros vazios, deverá retornar data do início dos tempos até agora', () => {
            const result = service.verificarData();
            
            expect(result.gte).toEqual(new Date(0));
            expect(result.lte).toBeInstanceOf(Date);
        });

        it('deverá lançar HttpException ao receber parâmetros inválidos', () => {
            expect(() => service.verificarData('abc', '2019')).toThrow(HttpException);
            expect(() => service.verificarData('13', '2019')).toThrow(HttpException);
            expect(() => service.verificarData('7', 'abc')).toThrow(HttpException);
        });
    });

    describe('getUnidades', () => {
        it('deverá retornar lista de unidades ativas', async () => {
            const mockUnidades = [
                { id: '1', nome: 'SMUL', sigla: 'SMUL' },
                { id: '2', nome: 'GRAPROEM', sigla: 'GRAP' }
            ];

            (prisma.unidade.findMany as jest.Mock).mockResolvedValue(mockUnidades);

            const result = await service.getUnidades();

            expect(result).toEqual(mockUnidades);
            expect(prisma.unidade.findMany).toHaveBeenCalledWith({
                where: { status: 1 },
                select: { id: true, nome: true, sigla: true }
            });
        });

        it('deverá lançar HttpException em caso de erro do banco', async () => {
            (prisma.unidade.findMany as jest.Mock).mockRejectedValue(new Error('Database error'));

            await expect(service.getUnidades()).rejects.toThrow(HttpException);
        });
    });

    describe('countByInicial', () => {
        const mockPeriodFilter = {
            gte: new Date("2019-07-01T00:00:00.000Z"),
            lte: new Date("2019-07-31T23:59:59.999Z"),
        };

        const mockUnidades = [
            { id: '1', nome: 'SMUL', sigla: 'SMUL' },
            { id: '2', nome: 'GRAPROEM', sigla: 'GRAP' }
        ];

        it('deverá contar iniciais por unidade corretamente', async () => {
            const mockResultados = [
                {
                    admissibilidade: {
                        unidade: { sigla: 'SMUL' }
                    }
                },
                {
                    admissibilidade: {
                        unidade: { sigla: 'SMUL' }
                    }
                },
                {
                    admissibilidade: {
                        unidade: { sigla: 'GRAP' }
                    }
                }
            ];

            (prisma.inicial.findMany as jest.Mock).mockResolvedValue(mockResultados);

            const result = await service.countByInicial(2, 1, mockUnidades, mockPeriodFilter);

            expect(result).toEqual([
                { sigla: 'SMUL', quantidade: 2 },
                { sigla: 'GRAP', quantidade: 1 }
            ]);

            expect(prisma.inicial.findMany).toHaveBeenCalledWith({
                where: {
                    status: 2,
                    tipo_processo: 1,
                    requalifica_rapido: false,
                    admissibilidade: {
                        data_decisao_interlocutoria: mockPeriodFilter,
                        unidade_id: { not: null }
                    }
                },
                select: {
                    admissibilidade: {
                        select: {
                            unidade: {
                                select: { sigla: true }
                            }
                        }
                    }
                }
            });
        });

        it('deverá retornar unidades com quantidade 0 em caso de erro', async () => {
            (prisma.inicial.findMany as jest.Mock).mockRejectedValue(new Error('Database error'));

            const result = await service.countByInicial(2, 1, mockUnidades, mockPeriodFilter);

            expect(result).toEqual([
                { sigla: 'SMUL', quantidade: 0 },
                { sigla: 'GRAP', quantidade: 0 }
            ]);
        });
    });

    describe('countTotal', () => {
        const mockPeriodFilter = {
            gte: new Date("2019-07-01T00:00:00.000Z"),
            lte: new Date("2019-07-31T23:59:59.999Z"),
        };

        it('deverá contar total de iniciais com decisao_interlocutoria preenchida', async () => {
            (prisma.inicial.count as jest.Mock).mockResolvedValue(5);

            const result = await service.countTotal(2, false, mockPeriodFilter);

            expect(result).toBe(5);
            expect(prisma.inicial.count).toHaveBeenCalledWith({
                where: {
                    status: 2,
                    requalifica_rapido: false,
                    criado_em: mockPeriodFilter,
                    admissibilidade: { data_decisao_interlocutoria: mockPeriodFilter }
                }
            });
        });

        it('deverá contar total de iniciais com decisao_interlocutoria null', async () => {
            (prisma.inicial.count as jest.Mock).mockResolvedValue(3);

            const result = await service.countTotal(2, true, mockPeriodFilter);

            expect(result).toBe(3);
            expect(prisma.inicial.count).toHaveBeenCalledWith({
                where: {
                    status: 2,
                    requalifica_rapido: false,
                    criado_em: mockPeriodFilter,
                    admissibilidade: { data_decisao_interlocutoria: null }
                }
            });
        });

        it('deverá lançar HttpException em caso de erro', async () => {
            (prisma.inicial.count as jest.Mock).mockRejectedValue(new Error('Database error'));

            await expect(service.countTotal(2, false, mockPeriodFilter)).rejects.toThrow(HttpException);
        });
    });

    describe('getData', () => {
        const mockPeriodFilter = {
            gte: new Date("2019-07-01T00:00:00.000Z"),
            lte: new Date("2019-07-31T23:59:59.999Z"),
        };

        it('deverá retornar dados de admissibilidade com inicial incluída', async () => {
            const mockData = [
                {
                    id: 1,
                    inicial: { id: 1, status: 2 }
                }
            ];

            (prisma.admissibilidade.findMany as jest.Mock).mockResolvedValue(mockData);

            const result = await service.getData(2, false, mockPeriodFilter);

            expect(result).toEqual(mockData);
            expect(prisma.admissibilidade.findMany).toHaveBeenCalledWith({
                where: {
                    inicial: {
                        status: 2,
                        requalifica_rapido: false
                    },
                    criado_em: mockPeriodFilter,
                    data_decisao_interlocutoria: mockPeriodFilter
                },
                include: { inicial: true }
            });
        });

        it('deverá lançar HttpException em caso de erro', async () => {
            (prisma.admissibilidade.findMany as jest.Mock).mockRejectedValue(new Error('Database error'));

            await expect(service.getData(2, false, mockPeriodFilter)).rejects.toThrow(HttpException);
        });
    });

    describe('getRelatorio', () => {
        const mockUnidades = [
            { id: '1', nome: 'SMUL', sigla: 'SMUL' },
            { id: '2', nome: 'GRAPROEM', sigla: 'GRAP' }
        ];

        beforeEach(() => {
            jest.spyOn(service, 'getUnidades').mockResolvedValue(mockUnidades);
            jest.spyOn(service, 'countTotal').mockResolvedValue(10);
            jest.spyOn(service, 'countByInicial').mockResolvedValue([
                { sigla: 'SMUL', quantidade: 5 },
                { sigla: 'GRAP', quantidade: 3 }
            ]);
            jest.spyOn(service, 'getData').mockResolvedValue([]);
        });

        it('deverá gerar relatório completo com estrutura correta', async () => {
            const result = await service.getRelatorio('7', '2019');

            expect(result).toHaveProperty('total');
            expect(result).toHaveProperty('analise');
            expect(result).toHaveProperty('inadmissiveis');
            expect(result).toHaveProperty('admissiveis');
            expect(result).toHaveProperty('data_gerado');
            expect(result).toHaveProperty('em_analise');
            expect(result).toHaveProperty('deferidos');
            expect(result).toHaveProperty('indeferidos');
            expect(result).toHaveProperty('inadmissiveis_dados');
            expect(result).toHaveProperty('admissiveis_dados');
            expect(result).toHaveProperty('em_analise_dados');

            expect(result.em_analise).toHaveProperty('smul');
            expect(result.em_analise).toHaveProperty('graproem');
            expect(result.deferidos).toHaveProperty('smul');
            expect(result.deferidos).toHaveProperty('graproem');
            expect(result.indeferidos).toHaveProperty('smul');
            expect(result.indeferidos).toHaveProperty('graproem');
        });

        it('deverá calcular total corretamente', async () => {
            jest.spyOn(service, 'countTotal')
                .mockResolvedValueOnce(5) // analise
                .mockResolvedValueOnce(3) // inadmissiveis
                .mockResolvedValueOnce(2); // admissiveis

            const result = await service.getRelatorio('7', '2019');

            expect(result.total).toBe(10); // 5 + 3 + 2
            expect(result.analise).toBe(5);
            expect(result.inadmissiveis).toBe(3);
            expect(result.admissiveis).toBe(2);
        });

        it('deverá calcular quantidades por categoria corretamente', async () => {
            jest.spyOn(service, 'countByInicial').mockResolvedValue([
                { sigla: 'SMUL', quantidade: 5 },
                { sigla: 'GRAP', quantidade: 3 }
            ]);

            const result = await service.getRelatorio('7', '2019');

            expect(result.em_analise.smul.quantidade).toBe(8); // 5 + 3
            expect(result.em_analise.graproem.quantidade).toBe(8); // 5 + 3
        });

        it('deverá incluir data de geração do relatório', async () => {
            const result = await service.getRelatorio('7', '2019');

            expect(result.data_gerado).toBe(new Date().toLocaleDateString('pt-BR'));
        });

        it('deverá lançar HttpException em caso de erro', async () => {
            jest.spyOn(service, 'getUnidades').mockRejectedValue(new Error('Database error'));

            await expect(service.getRelatorio('7', '2019')).rejects.toThrow(HttpException);
        });

        it('deverá funcionar sem parâmetros de mês e ano', async () => {
            const result = await service.getRelatorio();

            expect(result).toHaveProperty('total');
            expect(service.getUnidades).toHaveBeenCalled();
        });
    });

    describe('Error Handling', () => {
        it('deverá lançar HttpException com estrutura correta de erro', async () => {
            (prisma.unidade.findMany as jest.Mock).mockRejectedValue(new Error('Database connection failed'));

            try {
                await service.getUnidades();
            } catch (error) {
                expect(error).toBeInstanceOf(HttpException);
                expect(error.getStatus()).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
                
                const response = error.getResponse();
                expect(response).toHaveProperty('api_mensagem');
                expect(response).toHaveProperty('tipo_error');
                expect(response).toHaveProperty('detalhe_tecnico');
            }
        });
    });
});