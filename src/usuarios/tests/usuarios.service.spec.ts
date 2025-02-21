import { UsuariosService } from "../usuarios.service";
import { AddFeriasDto } from "../dto/create-usuario.dto";
import { CreateUsuarioDto } from "../dto/create-usuario.dto";
import { UpdateUsuarioDto } from "../dto/update-usuario.dto";
import { PrismaService } from "src/prisma/prisma.service";
import { AppService } from "src/app.service";
import { SGUService } from "src/sgu/sgu.service";
import { $Enums, Ferias, Permissao, Substituto, Unidade, Usuario } from "@prisma/client";
import { Test, TestingModule } from "@nestjs/testing";

describe('Usuarios.service tests', ()=>{
    let service: UsuariosService
    let prisma: PrismaService 
    let app: AppService
    let sgu: SGUService

    const MockPrismaService = {
        usuario: {
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
            findMany: jest.fn(),
            findUnique: jest.fn()
        },
    }

    const MockAppService = {
        verificaPagina: jest
          .fn()
          .mockImplementation((pagina, limite) => [pagina, limite]),
        verificaLimite: jest
          .fn()
          .mockImplementation((pagina, limite, total) => [pagina, limite]),
      };

    beforeEach(async ()=>{
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                UsuariosService,
                {
                    provide: PrismaService,
                    useValue: MockPrismaService
                },
                {
                    provide: AppService,
                    useValue: MockPrismaService
                },
                {
                    provide: SGUService,
                    useValue: MockPrismaService
                }
            ]
        }).compile();
        service = module.get<UsuariosService>(UsuariosService)
        prisma = module.get<PrismaService>(PrismaService)
        app = module.get<AppService>(AppService)
        sgu = module.get<SGUService>(SGUService)
    })

    it('os serviços deverão estar definidos', () =>{
        expect(service).toBeDefined()
        expect(prisma).toBeDefined()
        expect(app).toBeDefined()
        expect(sgu).toBeDefined()
    })
})
