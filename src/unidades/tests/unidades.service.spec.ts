import { CreateUnidadeDto } from "../dto/create-unidade.dto";
import { PrismaService } from "src/prisma/prisma.service";
import { AppService } from "src/app.service";
import { UnidadesService } from "../unidades.service";
import { UnidadeResponseDTO } from "../dto/unidade-response.dto";
import { Prisma } from "@prisma/client";
import { Test, TestingModule } from "@nestjs/testing";
import exp from "constants";
import { count } from "console";

describe('UnidadesService Test', () => {
    let service: UnidadesService; 
    let prisma: PrismaService;    
    let app: AppService; 

    const mockPrismaService = {
        unidade: {
            findMany: jest.fn(),
            findUnique: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
            count: jest.fn()
        }
    };

    const mockAppService = {
        verificaPagina: jest.fn().mockImplementation((pagina, limite) => [pagina, limite]),
        verificaLimite: jest.fn().mockImplementation((pagina, limite, total) => [pagina, limite])
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                UnidadesService,
                {
                    provide: PrismaService,
                    useValue: mockPrismaService
                },
                {
                    provide: AppService,
                    useValue: mockAppService
                }
            ]
        }).compile();

        service = module.get<UnidadesService>(UnidadesService);
        prisma = module.get<PrismaService>(PrismaService);
        app = module.get<AppService>(AppService);
    });

    it('verificando se os mocks estão definidos', () =>{
        expect(service).toBeDefined()
        expect(prisma).toBeDefined()
        expect(app).toBeDefined()
    })

    it('testando a criação de uma unidade', async () =>{
        const mockUnidadeResult = {
            id: 'abr4kd8R4',
            nome: 'Unidade de Saneamento',
            sigla: 'UDS',
            codigo: '4Brv',
            status: 0
        };

        jest.spyOn(service, 'buscaPorCodigo').mockResolvedValue(null);
        jest.spyOn(service, 'buscaPorSigla').mockResolvedValue(null);
        jest.spyOn(service, 'buscaPorNome').mockResolvedValue(null);
        (prisma.unidade.create as jest.Mock).mockResolvedValue(mockUnidadeResult)

        const result: CreateUnidadeDto = await service.criar({
            nome: 'Unidade de Saneamento',
            sigla: 'UDS',
            codigo: '4Brv',
            status: 0
        })

        expect(result).not.toBeNull()

        expect(service.buscaPorNome).toHaveBeenCalledWith(mockUnidadeResult.nome)

        expect(service.buscaPorSigla).toHaveBeenCalledWith(mockUnidadeResult.sigla)

        expect(service.buscaPorCodigo).toHaveBeenCalledWith(mockUnidadeResult.codigo)

        expect(prisma.unidade.create).toHaveBeenCalledWith({
            data: {
                nome: 'Unidade de Saneamento',
                sigla: 'UDS',
                codigo: '4Brv',
                status: 0
            }
        })

        expect(result).toEqual(mockUnidadeResult)
    })

    it('testando o buscar tudo de unidades.service', async ()=>{
        const mockUnidadesListResult = [
            {
                nome: 'Unidade de Saneamento',
                sigla: 'UDS',
                codigo: '4Brv',
                status: 0
            },
            {
                nome: 'Unidade de Tecnologia',
                sigla: 'UDT',
                codigo: '4crU',
                status: 0
            },
            {
                nome: 'Unidade de Amparo Social',
                sigla: 'UDAS',
                codigo: '4BT1',
                status: 0
            }
        ]

        const mockPaginacao = {
            total: 3,
            pagina: 1,
            limite: 10,
            data: mockUnidadesListResult
            }


        const mockParams = {
            pagina: 1,
            limite: 10,
            busca: 'Unidade',
            };
    
        (prisma.unidade.count as jest.Mock).mockResolvedValue(3);
        jest.spyOn(app, 'verificaLimite').mockReturnValue([1, 10]);
        (prisma.unidade.findMany as jest.Mock).mockResolvedValue(mockUnidadesListResult)

        const result = await service.buscarTudo(mockParams.pagina, mockParams.limite, mockParams.busca)

        expect(result).not.toBeNull();
        expect(result).toEqual(mockPaginacao)
            
        expect(prisma.unidade.count).toHaveBeenCalledWith({
            where:{
                OR: [
                    { nome: { contains: expect.any(String) } },
                    { sigla: { contains: expect.any(String) } },
                    { codigo: { contains: expect.any(String)} }
                ]
            }
        })

        expect(prisma.unidade.findMany).toHaveBeenCalledWith({
            where: {
                AND: [
                    {
                        OR: [
                            { nome: { contains: mockParams.busca } },
                            { sigla: { contains: mockParams.busca } },
                            { codigo: { contains: mockParams.busca } }
                        ]
                    },
                    { status: undefined } 
                ]
            },
            skip: (mockParams.pagina - 1) * mockParams.limite,
            take: mockParams.limite
        });
        
    })

});