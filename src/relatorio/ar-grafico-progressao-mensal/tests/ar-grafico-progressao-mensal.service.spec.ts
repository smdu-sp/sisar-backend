import { PrismaService } from "src/prisma/prisma.service";
import { PeriodFilterDto } from "src/relatorio/relatorio-ar-quantitativo/dto/response-relatorio.dto";
import { ArGraficoProgressaoMensalService } from "../ar-grafico-progressao-mensal.service";
import { Test, TestingModule } from "@nestjs/testing";

describe('teste de relatórios AR de progressão mensal', () => {
    let service: ArGraficoProgressaoMensalService;
    let prisma: PrismaService;

    const MockPrismaService = {
        $queryRaw: jest.fn()
    }

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ArGraficoProgressaoMensalService,
                {
                    provide: PrismaService,
                    useValue: MockPrismaService,
                }
            ],
        }).compile();
        service = module.get<ArGraficoProgressaoMensalService>(ArGraficoProgressaoMensalService)
        prisma = module.get<PrismaService>(PrismaService)
    })

    it('verifica se o serviço foi definido', () => {
        expect(service).toBeDefined();
        expect(prisma).toBeDefined();
    })

    it('deve filtrar progressão 2018-2024', async () => {
        // Configuração do mock do Prisma
        MockPrismaService.$queryRaw.mockResolvedValue([
            { ano: 2024, mes: 6, total: 6 }, // Julho
            { ano: 2024, mes: 7, total: 2 }, // Agosto
        ]);

        // Execução real do serviço
        const result = await service.getRelatorio('2018', '2024');

        // Verificações
        expect(MockPrismaService.$queryRaw).toHaveBeenCalled();
        expect(result).toEqual(expect.arrayContaining([
            expect.objectContaining({ ano: 2024 })
        ]));
    });

    describe('getRelatorio', () => {
        it('deve processar dados do Prisma corretamente', async () => {
            // Configure dados reais que o banco retornaria
            const dbData = [
                { ano: 2024, mes: 6, total: 6 },
                { ano: 2024, mes: 7, total: 2 },
                { ano: 2024, mes: 9, total: 2 },
                { ano: 2024, mes: 10, total: 1 },
                { ano: 2024, mes: 11, total: 3 },

            ];

            const mockRelatorioResult = [
                {
                    ano: 2018,
                    mes: Array(12).fill(0),
                    acc: Array(12).fill(0),
                },
                {
                    ano: 2019,
                    mes: Array(12).fill(0),
                    acc: Array(12).fill(0),
                },
                {
                    ano: 2020,
                    mes: Array(12).fill(0),
                    acc: Array(12).fill(0),
                },
                {
                    ano: 2021,
                    mes: Array(12).fill(0),
                    acc: Array(12).fill(0),
                },
                {
                    ano: 2022,
                    mes: Array(12).fill(0),
                    acc: Array(12).fill(0),
                },
                {
                    ano: 2023,
                    mes: Array(12).fill(0),
                    acc: Array(12).fill(0),
                },
                {
                    ano: 2024,
                    mes: [0, 0, 0, 0, 0, 0, 6, 2, 0, 2, 1, 3],
                    acc: [0, 0, 0, 0, 0, 0, 6, 8, 8, 10, 11, 14],
                },
            ];

            (prisma.$queryRaw as jest.Mock).mockResolvedValue(mockRelatorioResult)
            MockPrismaService.$queryRaw.mockResolvedValue(dbData);
            const result = await service.getRelatorio('2018', '2024');
            console.log("1", result)
            expect(result).toEqual(mockRelatorioResult);
        });
    });

})