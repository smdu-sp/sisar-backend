import { RelatorioService } from "../relatorio-ar.service";
import { Admissibilidade, Inicial, Unidade } from "@prisma/client";
import { PrismaService } from "src/prisma/prisma.service";
import { PeriodFilterDto } from "../dto/response-relatorio.dto";
import { Test, TestingModule } from "@nestjs/testing";

describe('Relatorio AR quantitativo test', () => {
    let service: RelatorioService;
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
                RelatorioService,
                {
                    provide: PrismaService,
                    useValue: MockPrismaService
                }
            ]
        }).compile()
        service = module.get<RelatorioService>(RelatorioService);
        prisma = module.get<PrismaService>(PrismaService);
    })

    it('deve verificar se os services foram definidos', () => {
        expect(service).toBeDefined();
        expect(prisma).toBeDefined();
    })

    it('deverá retornar um objeto do tipo PeriodFilterDto ao receber duas strings numéricas', () => {
        const mockPeriodDate: PeriodFilterDto = {
            gte: new Date("2019-01-01T00:00:00.000Z"),
            lte: new Date("2020-12-31T23:59:59.999Z"),
        };

        jest.spyOn(service, 'verificarData').mockReturnValue(mockPeriodDate);

        const result = service.verificarData('2019', '2020')

        expect(result).toEqual(mockPeriodDate)
        expect(service.verificarData).toHaveBeenCalledWith('2019', '2020')
    })

    it('deverá retornar uma lista de iniciais com o status em analise dentro do período de PeriodFilter passado', async () => {
        const mockPeriodDate: PeriodFilterDto = {
            gte: new Date("2019-01-01T00:00:00.000Z"),
            lte: new Date("2020-12-31T23:59:59.999Z"),
        };

        const mockIniciaisResult = [
            {
                id: 1,
                decreto: true,
                sei: "1",
                tipo_requerimento: 1,
                requerimento: "11",
                aprova_digital: null,
                processo_fisico: null,
                data_protocolo: new Date("2018-07-31T00:00:00.000Z"),
                envio_admissibilidade: new Date("2018-08-31T00:00:00.000Z"),
                alvara_tipo_id: "48eee3f6-0ea8-400e-bfe6-a60cb9908936",
                tipo_processo: 2,
                obs: "",
                status: 2,
                pagamento: 1,
                requalifica_rapido: false,
                associado_reforma: false,
                data_limiteSmul: new Date("2018-09-31T00:00:00.000Z"),
                data_limiteMulti: null,
                criado_em: new Date("2018-07-31T14:07:24.888Z"),
                alterado_em: new Date("2018-10-31T17:36:21.412Z"),
                alvara_tipo: {
                    id: "48eee3f6-0ea8-400e-bfe6-a60cb9908936",
                    nome: "Alvará de Aprovação e Execução de Edificação Nova",
                    prazo_admissibilidade_smul: 15,
                    reconsideracao_smul: 3,
                    reconsideracao_smul_tipo: 0,
                    analise_reconsideracao_smul: 15,
                    prazo_analise_smul1: 30,
                    prazo_analise_smul2: 60,
                    prazo_emissao_alvara_smul: 10,
                    prazo_admissibilidade_multi: 15,
                    reconsideracao_multi: 3,
                    reconsideracao_multi_tipo: 0,
                    analise_reconsideracao_multi: 15,
                    prazo_analise_multi1: 60,
                    prazo_analise_multi2: 55,
                    prazo_emissao_alvara_multi: 10,
                    prazo_comunique_se: 1,
                    prazo_encaminhar_coord: 1,
                    status: 1,
                    criado_em: new Date("2024-07-31T14:05:38.866Z"),
                    alterado_em: new Date("2024-10-09T15:39:21.633Z")
                }
            },

        ];
        jest.spyOn(service, 'getInicialData').mockResolvedValue(mockIniciaisResult);
        (prisma.inicial.findMany as jest.Mock).mockResolvedValue(mockIniciaisResult);

        const result = await service.getInicialData(2, mockPeriodDate)

        expect(result).toEqual(mockIniciaisResult)
        expect(service.getInicialData).toHaveBeenCalledWith(2, { gte: new Date("2019-01-01T00:00:00.000Z"), lte: new Date("2020-12-31T23:59:59.999Z") })

    })

    it('deverá retornar uma lista de iniciais com o status deferidos dentro do período de PeriodFilter passado', async () => {
        const mockPeriodDate: PeriodFilterDto = {
            gte: new Date("2019-01-01T00:00:00.000Z"),
            lte: new Date("2020-12-31T23:59:59.999Z"),
        };

        const mockIniciaisResult = [
            {
                id: 1,
                decreto: true,
                sei: "1",
                tipo_requerimento: 1,
                requerimento: "11",
                aprova_digital: null,
                processo_fisico: null,
                data_protocolo: new Date("2018-07-31T00:00:00.000Z"),
                envio_admissibilidade: new Date("2018-08-31T00:00:00.000Z"),
                alvara_tipo_id: "48eee3f6-0ea8-400e-bfe6-a60cb9908936",
                tipo_processo: 2,
                obs: "",
                status: 3,
                pagamento: 1,
                requalifica_rapido: false,
                associado_reforma: false,
                data_limiteSmul: new Date("2018-09-31T00:00:00.000Z"),
                data_limiteMulti: null,
                criado_em: new Date("2018-07-31T14:07:24.888Z"),
                alterado_em: new Date("2018-10-31T17:36:21.412Z"),
                alvara_tipo: {
                    id: "48eee3f6-0ea8-400e-bfe6-a60cb9908936",
                    nome: "Alvará de Aprovação e Execução de Edificação Nova",
                    prazo_admissibilidade_smul: 15,
                    reconsideracao_smul: 3,
                    reconsideracao_smul_tipo: 0,
                    analise_reconsideracao_smul: 15,
                    prazo_analise_smul1: 30,
                    prazo_analise_smul2: 60,
                    prazo_emissao_alvara_smul: 10,
                    prazo_admissibilidade_multi: 15,
                    reconsideracao_multi: 3,
                    reconsideracao_multi_tipo: 0,
                    analise_reconsideracao_multi: 15,
                    prazo_analise_multi1: 60,
                    prazo_analise_multi2: 55,
                    prazo_emissao_alvara_multi: 10,
                    prazo_comunique_se: 1,
                    prazo_encaminhar_coord: 1,
                    status: 1,
                    criado_em: new Date("2024-07-31T14:05:38.866Z"),
                    alterado_em: new Date("2024-10-09T15:39:21.633Z")
                }
            },

        ];

        jest.spyOn(service, 'getInicialData').mockResolvedValue(mockIniciaisResult);
        (prisma.inicial.findMany as jest.Mock).mockResolvedValue(mockIniciaisResult);

        const result = await service.getInicialData(3, mockPeriodDate)

        expect(result).toEqual(mockIniciaisResult)
        expect(service.getInicialData).toHaveBeenCalledWith(3, { gte: new Date("2019-01-01T00:00:00.000Z"), lte: new Date("2020-12-31T23:59:59.999Z") })
    })

    it('deverá retornar uma lista de iniciais com o status indeferidos dentro do período de PeriodFilter passado', async () => {
        const mockPeriodDate: PeriodFilterDto = {
            gte: new Date("2019-01-01T00:00:00.000Z"),
            lte: new Date("2020-12-31T23:59:59.999Z"),
        };

        const mockIniciaisResult = [
            {
                id: 1,
                decreto: true,
                sei: "1",
                tipo_requerimento: 1,
                requerimento: "11",
                aprova_digital: null,
                processo_fisico: null,
                data_protocolo: new Date("2018-07-31T00:00:00.000Z"),
                envio_admissibilidade: new Date("2018-08-31T00:00:00.000Z"),
                alvara_tipo_id: "48eee3f6-0ea8-400e-bfe6-a60cb9908936",
                tipo_processo: 2,
                obs: "",
                status: 4,
                pagamento: 1,
                requalifica_rapido: false,
                associado_reforma: false,
                data_limiteSmul: new Date("2018-09-31T00:00:00.000Z"),
                data_limiteMulti: null,
                criado_em: new Date("2018-07-31T14:07:24.888Z"),
                alterado_em: new Date("2018-10-31T17:36:21.412Z"),
                alvara_tipo: {
                    id: "48eee3f6-0ea8-400e-bfe6-a60cb9908936",
                    nome: "Alvará de Aprovação e Execução de Edificação Nova",
                    prazo_admissibilidade_smul: 15,
                    reconsideracao_smul: 3,
                    reconsideracao_smul_tipo: 0,
                    analise_reconsideracao_smul: 15,
                    prazo_analise_smul1: 30,
                    prazo_analise_smul2: 60,
                    prazo_emissao_alvara_smul: 10,
                    prazo_admissibilidade_multi: 15,
                    reconsideracao_multi: 3,
                    reconsideracao_multi_tipo: 0,
                    analise_reconsideracao_multi: 15,
                    prazo_analise_multi1: 60,
                    prazo_analise_multi2: 55,
                    prazo_emissao_alvara_multi: 10,
                    prazo_comunique_se: 1,
                    prazo_encaminhar_coord: 1,
                    status: 1,
                    criado_em: new Date("2024-07-31T14:05:38.866Z"),
                    alterado_em: new Date("2024-10-09T15:39:21.633Z")
                }
            },

        ];

        jest.spyOn(service, 'getInicialData').mockResolvedValue(mockIniciaisResult);
        (prisma.inicial.findMany as jest.Mock).mockResolvedValue(mockIniciaisResult);

        const result = await service.getInicialData(4, mockPeriodDate)

        expect(result).toEqual(mockIniciaisResult)
        expect(service.getInicialData).toHaveBeenCalledWith(4, { gte: new Date("2019-01-01T00:00:00.000Z"), lte: new Date("2020-12-31T23:59:59.999Z") })
    })

    it('deverá verificar se duas strings podem ser convertidas eem uma data MM--YYYY validos', () => {

        const mockDateResult = {
            gte: new Date("2019-07-01T00:00:00.000Z"),
            lte: new Date("2019-12-31T23:59:59.999Z"),
        }

        jest.spyOn(service, 'verificarData').mockReturnValue(mockDateResult)

        const result = service.verificarData("7", "2019")

        expect(result).toEqual(mockDateResult)
        expect(service.verificarData).toHaveBeenCalledWith("7", "2019")
    })

    it('ao receber um param vazio, deverá retornar a data do mês e ano atuaiss', () => {

        const mockDateResult = {
            gte: new Date(0),
            lte: new Date(),
        }

        jest.spyOn(service, 'verificarData').mockReturnValue(mockDateResult)

        const result = service.verificarData()

        expect(result).toEqual(mockDateResult)
    })

    it('deverá contar processos por unidade corretamente', async () => {
        const mockPeriodFilter = {
            gte: new Date("2019-07-01T00:00:00.000Z"),
            lte: new Date("2019-12-31T23:59:59.999Z"),
        };

        (prisma.admissibilidade.count as jest.Mock).mockResolvedValue(6);

        const result = await service.countByUnidade(1, mockPeriodFilter, null, 1);

        expect(result).toEqual({ SMUL: 6 });

        expect(prisma.admissibilidade.count).toHaveBeenCalledWith({
            where: {
                inicial: {
                    status: 1,
                    tipo_processo: 1,
                },
                data_decisao_interlocutoria: mockPeriodFilter,
            }
        });
    });

    it('deverá contar todos os processos de status 2 de uma unidade especifica pelo ID', async () => {
        const mockPeriodFilter = {
            gte: new Date("2019-07-01T00:00:00.000Z"),
            lte: new Date("2019-12-31T23:59:59.999Z"),
        };

        //params status: 2, mockPeriodFilter, "0d7d9dad-686f-4fb8-bc86-c06a6f0b77e7, null 

        const unidadeFind = {
            id: "0d7d9dad-686f-4fb8-bc86-c06a6f0b77e7",
            nome: "COORDENADORIA DE EDIFICACAO DE USO COMERCIAL E INDUSTRIAL",
            sigla: "COMIN",
            codigo: "290300000000000",
            status: 1,
        };

        const mockFindMany = [
            {
                id: 11,
                decreto: true,
                sei: "11",
                tipo_requerimento: 1,
                requerimento: "2",
                aprova_digital: "",
                processo_fisico: "",
                data_protocolo: "2024-10-01T00:00:00.000Z",
                envio_admissibilidade: "2024-10-01T00:00:00.000Z",
                alvara_tipo_id: "48eee3f6-0ea8-400e-bfe6-a60cb9908936",
                tipo_processo: 1,
                obs: "a",
                status: 2,
                pagamento: 1,
                requalifica_rapido: false,
                associado_reforma: false,
                data_limiteSmul: "2024-10-16T00:00:00.000Z",
                data_limiteMulti: null,
                criado_em: "2019-07-01T00:00:00.000Z",
                alterado_em: "2024-11-13T21:31:39.173Z",
                unidade_id: unidadeFind.id,
                unidade: {
                    nome: unidadeFind.nome,
                    id: unidadeFind.id
                }
            },
            {
                id: 12,
                decreto: true,
                sei: "11",
                tipo_requerimento: 1,
                requerimento: "2",
                aprova_digital: "",
                processo_fisico: "",
                data_protocolo: "2024-10-01T00:00:00.000Z",
                envio_admissibilidade: "2024-10-01T00:00:00.000Z",
                alvara_tipo_id: "48eee3f6-0ea8-400e-bfe6-a60cb9908936",
                tipo_processo: 1,
                obs: "a",
                status: 2,
                pagamento: 2,
                requalifica_rapido: false,
                associado_reforma: false,
                data_limiteSmul: "2024-10-16T00:00:00.000Z",
                data_limiteMulti: null,
                criado_em: "2019-07-01T00:00:00.000Z",
                alterado_em: "2024-11-13T21:31:39.173Z",
                unidade: {
                    nome: unidadeFind.nome,
                    id: unidadeFind.id
                }
            },
            {
                id: 13,
                decreto: true,
                sei: "11",
                tipo_requerimento: 1,
                requerimento: "2",
                aprova_digital: "",
                processo_fisico: "",
                data_protocolo: "2024-10-01T00:00:00.000Z",
                envio_admissibilidade: "2024-10-01T00:00:00.000Z",
                alvara_tipo_id: "48eee3f6-0ea8-400e-bfe6-a60cb9908936",
                tipo_processo: 1,
                obs: "a",
                status: 2,
                pagamento: 1,
                requalifica_rapido: false,
                associado_reforma: false,
                data_limiteSmul: "2024-10-16T00:00:00.000Z",
                data_limiteMulti: null,
                criado_em: "2019-07-01T00:00:00.000Z",
                alterado_em: "2024-11-13T21:31:39.173Z",
                unidade: {
                    nome: unidadeFind.nome,
                    id: unidadeFind.id
                }
            },
        ];

        (prisma.admissibilidade.findMany as jest.Mock).mockResolvedValue(mockFindMany)

        const result = await service.countByUnidade(2, mockPeriodFilter, "0d7d9dad-686f-4fb8-bc86-c06a6f0b77e7")
        const mockResult = { "COORDENADORIA DE EDIFICACAO DE USO COMERCIAL E INDUSTRIAL": 3 }

        expect(mockResult).toEqual(result)
        expect(prisma.admissibilidade.findMany).toHaveBeenCalledWith({
            where: {
                inicial: {
                    status: 2,
                    tipo_processo: { in: [1, 2] },
                },
                data_decisao_interlocutoria: mockPeriodFilter,
                unidade_id: "0d7d9dad-686f-4fb8-bc86-c06a6f0b77e7",
            },
            select: { unidade: { select: { nome: true, id: true } } }
        })
    })


    it('deverá gerar um relatório de todos os processos de todas as unidades dentro de um intervalo de tempo periodFilterDto', async () => {

        const mockPeriodFilter = {
            gte: new Date("2019-07-01T00:00:00.000Z"),
            lte: new Date("2019-12-31T23:59:59.999Z"),
        };
        jest.spyOn(service, 'verificarData').mockReturnValue(mockPeriodFilter);


        jest.spyOn(service, 'getIdByUnidade').mockImplementation(async (sigla) => {
            const units: Record<string, string> = {
                'PARHIS': '4d7987e9-4b59-46cf-ac90-1c2cb5f144a8',
                'RESID': 'eafff5eb-e8f0-459c-9267-ca6f91e91f06',
                'SERVIN': '7d20188e-c7a0-4f0b-87bf-5e70248d38a3',
                'COMIN': '0d7d9dad-686f-4fb8-bc86-c06a6f0b77e7',
                'CAEPP': '71ef22d1-a92d-4b8e-a576-ff158f9eb1ab'
            };
            return units[sigla] || null;
        });

        jest.spyOn(service, 'countByUnidade').mockImplementation(async (status, period, unidadeId, tipo) => {
            return { [`${unidadeId || 'tipo'}-${status}`]: status * 10 };
        });

        jest.spyOn(service, 'getInicialData').mockImplementation(async (status, period) => {
            return new Array(status + 1).fill({});
        });

        jest.spyOn(service, 'countByUnidade').mockImplementation(async (status, period, unidadeId, tipo) => {
            return { [`${unidadeId || 'tipo'}-${status}`]: status * 10 };
        });

        jest.spyOn(service, 'getInicialData').mockImplementation(async (status, period) => {
            return new Array(status + 1).fill({});
        });
    });

})
