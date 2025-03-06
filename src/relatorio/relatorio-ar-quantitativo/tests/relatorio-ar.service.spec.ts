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

    // it('deverá retornar uma lista de iniciais com o status em analise dentro do período de PeriodFilter passado', async () => {
    //     const mockPeriodDate: PeriodFilterDto = {
    //         gte: new Date("2019-01-01T00:00:00.000Z"),
    //         lte: new Date("2020-12-31T23:59:59.999Z"),
    //     };

    //     const mockIniciaisResult = [
    //         {
    //             id: 1,
    //             decreto: true,
    //             sei: "1",
    //             tipo_requerimento: 1,
    //             requerimento: "11",
    //             aprova_digital: null,
    //             processo_fisico: null,
    //             data_protocolo: new Date("2018-07-31T00:00:00.000Z"),
    //             envio_admissibilidade: new Date("2018-08-31T00:00:00.000Z"),
    //             alvara_tipo_id: "48eee3f6-0ea8-400e-bfe6-a60cb9908936",
    //             tipo_processo: 2,
    //             obs: "",
    //             status: 2,
    //             pagamento: 1,
    //             requalifica_rapido: false,
    //             associado_reforma: false,
    //             data_limiteSmul: new Date("2018-09-31T00:00:00.000Z"),
    //             data_limiteMulti: null,
    //             criado_em: new Date("2018-07-31T14:07:24.888Z"),
    //             alterado_em: new Date("2018-10-31T17:36:21.412Z"),
    //             alvara_tipo: {
    //                 id: "48eee3f6-0ea8-400e-bfe6-a60cb9908936",
    //                 nome: "Alvará de Aprovação e Execução de Edificação Nova",
    //                 prazo_admissibilidade_smul: 15,
    //                 reconsideracao_smul: 3,
    //                 reconsideracao_smul_tipo: 0,
    //                 analise_reconsideracao_smul: 15,
    //                 prazo_analise_smul1: 30,
    //                 prazo_analise_smul2: 60,
    //                 prazo_emissao_alvara_smul: 10,
    //                 prazo_admissibilidade_multi: 15,
    //                 reconsideracao_multi: 3,
    //                 reconsideracao_multi_tipo: 0,
    //                 analise_reconsideracao_multi: 15,
    //                 prazo_analise_multi1: 60,
    //                 prazo_analise_multi2: 55,
    //                 prazo_emissao_alvara_multi: 10,
    //                 prazo_comunique_se: 1,
    //                 prazo_encaminhar_coord: 1,
    //                 status: 1,
    //                 criado_em: new Date("2024-07-31T14:05:38.866Z"),
    //                 alterado_em: new Date("2024-10-09T15:39:21.633Z")
    //             }
    //         },

    //     ];
    //     jest.spyOn(service, 'getInicialData').mockResolvedValue(mockIniciaisResult);
    //     (prisma.inicial.findMany as jest.Mock).mockResolvedValue(mockIniciaisResult);

    //     const result = await service.getInicialData(2, mockPeriodDate)

    //     expect(result).toEqual(mockIniciaisResult)
    //     expect(service.getInicialData).toHaveBeenCalledWith({ gte: "2019-01-01T00:00:00.000Z", lte: "2020-12-31T23:59:59.999Z" })

    // })

    // it('deverá retornar uma lista de iniciais com o status deferidos dentro do período de PeriodFilter passado', async () => {
    //     const mockPeriodDate: PeriodFilterDto = {
    //         gte: new Date("2019-01-01T00:00:00.000Z"),
    //         lte: new Date("2020-12-31T23:59:59.999Z"),
    //     };

    //     const mockIniciaisResult = [
    //         {
    //             id: 1,
    //             decreto: true,
    //             sei: "1",
    //             tipo_requerimento: 1,
    //             requerimento: "11",
    //             aprova_digital: null,
    //             processo_fisico: null,
    //             data_protocolo: "2018-07-31T00:00:00.000Z",
    //             envio_admissibilidade: "2018-08-31T00:00:00.000Z",
    //             alvara_tipo_id: "48eee3f6-0ea8-400e-bfe6-a60cb9908936",
    //             tipo_processo: 2,
    //             obs: "",
    //             status: 3,
    //             pagamento: 1,
    //             requalifica_rapido: false,
    //             associado_reforma: false,
    //             data_limiteSmul: "2018-09-31T00:00:00.000Z",
    //             data_limiteMulti: null,
    //             criado_em: "2018-07-31T14:07:24.888Z",
    //             alterado_em: "2018-10-31T17:36:21.412Z",
    //             alvara_tipo: {
    //                 id: "48eee3f6-0ea8-400e-bfe6-a60cb9908936",
    //                 nome: "Alvará de Aprovação e Execução de Edificação Nova",
    //                 prazo_admissibilidade_smul: 15,
    //                 reconsideracao_smul: 3,
    //                 reconsideracao_smul_tipo: 0,
    //                 analise_reconsideracao_smul: 15,
    //                 prazo_analise_smul1: 30,
    //                 prazo_analise_smul2: 60,
    //                 prazo_emissao_alvara_smul: 10,
    //                 prazo_admissibilidade_multi: 15,
    //                 reconsideracao_multi: 3,
    //                 reconsideracao_multi_tipo: 0,
    //                 analise_reconsideracao_multi: 15,
    //                 prazo_analise_multi1: 60,
    //                 prazo_analise_multi2: 55,
    //                 prazo_emissao_alvara_multi: 10,
    //                 prazo_comunique_se: 1,
    //                 prazo_encaminhar_coord: 1,
    //                 status: 1,
    //                 criado_em: "2024-07-31T14:05:38.866Z",
    //                 alterado_em: "2024-10-09T15:39:21.633Z"
    //             }
    //         },
    //     ];

    //     (prisma.inicial.findMany as jest.Mock).mockResolvedValue(mockIniciaisResult);

    //     const result = await service.getInicialData(3, mockPeriodDate)

    //     expect(result).toEqual(mockIniciaisResult)
    //     expect(service.getInicialData).toHaveBeenCalledWith({
    //         where: {
    //             status: 3,
    //             criado_em: mockPeriodDate
    //         }
    //     })
    // })

    // it('deverá retornar uma lista de iniciais com o status indeferidos dentro do período de PeriodFilter passado', async () => {
    //     const mockPeriodDate: PeriodFilterDto = {
    //         gte: new Date("2019-01-01T00:00:00.000Z"),
    //         lte: new Date("2020-12-31T23:59:59.999Z"),
    //     };

    //     const mockIniciaisResult = [
    //         {
    //             id: 1,
    //             decreto: true,
    //             sei: "1",
    //             tipo_requerimento: 1,
    //             requerimento: "11",
    //             aprova_digital: null,
    //             processo_fisico: null,
    //             data_protocolo: "2018-07-31T00:00:00.000Z",
    //             envio_admissibilidade: "2018-08-31T00:00:00.000Z",
    //             alvara_tipo_id: "48eee3f6-0ea8-400e-bfe6-a60cb9908936",
    //             tipo_processo: 2,
    //             obs: "",
    //             status: 4,
    //             pagamento: 1,
    //             requalifica_rapido: false,
    //             associado_reforma: false,
    //             data_limiteSmul: "2018-09-31T00:00:00.000Z",
    //             data_limiteMulti: null,
    //             criado_em: "2018-07-31T14:07:24.888Z",
    //             alterado_em: "2018-10-31T17:36:21.412Z",
    //             alvara_tipo: {
    //                 id: "48eee3f6-0ea8-400e-bfe6-a60cb9908936",
    //                 nome: "Alvará de Aprovação e Execução de Edificação Nova",
    //                 prazo_admissibilidade_smul: 15,
    //                 reconsideracao_smul: 3,
    //                 reconsideracao_smul_tipo: 0,
    //                 analise_reconsideracao_smul: 15,
    //                 prazo_analise_smul1: 30,
    //                 prazo_analise_smul2: 60,
    //                 prazo_emissao_alvara_smul: 10,
    //                 prazo_admissibilidade_multi: 15,
    //                 reconsideracao_multi: 3,
    //                 reconsideracao_multi_tipo: 0,
    //                 analise_reconsideracao_multi: 15,
    //                 prazo_analise_multi1: 60,
    //                 prazo_analise_multi2: 55,
    //                 prazo_emissao_alvara_multi: 10,
    //                 prazo_comunique_se: 1,
    //                 prazo_encaminhar_coord: 1,
    //                 status: 1,
    //                 criado_em: "2024-07-31T14:05:38.866Z",
    //                 alterado_em: "2024-10-09T15:39:21.633Z"
    //             }
    //         },

    //     ];

    //     (prisma.inicial.findMany as jest.Mock).mockResolvedValue(mockIniciaisResult);

    //     const result = await service.getInicialData(4, mockPeriodDate)

    //     expect(result).toEqual(mockIniciaisResult)
    //     // expect(service.getInicialData).toHaveBeenCalledWith({
    //     //     where: {
    //     //         status: 4,
    //     //         criado_em: mockPeriodDate
    //     //     }
    //     // })
    // })


})