import { Test, TestingModule } from '@nestjs/testing';
import { AppService } from './app.service';

describe('AppService tests', () => {
  let service: AppService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({ providers: [AppService] }).compile();
    service = module.get<AppService>(AppService);
  });

  it('should be defined', () => expect(service).toBeDefined());

  it('should return the correct result for getHello()', () => expect(service.getHello().message).toBe('Hello World!'));

  it('should return the correct result for getOla()', () => expect(service.getOla().message).toBe('Olá, Mundo!'));

  it('should return page and limit when verificaPagina is called', () => {
    expect(service.verificaPagina(0, 0)).toBeInstanceOf(Array);
    expect(service.verificaPagina(0, 0)).toEqual([1, 10]);
    expect(service.verificaPagina(null, null)).toEqual([1, 10]);
    expect(service.verificaPagina(5, 20)).toEqual([5, 20]);
  });

  it('should return page and limit when verificaLimite is called', () => {
    expect(service.verificaLimite(1, 10, 50)).toBeInstanceOf(Array);
    expect(service.verificaLimite(1, 10, 50)).toEqual([1, 10]); // Página e limite válidos
    expect(service.verificaLimite(6, 10, 50)).toEqual([5, 10]); // Página ajustada porque ultrapassa o total
    expect(service.verificaLimite(5, 0, 50)).toEqual([5, 0]);   // Limite 0, retornado como está
    expect(service.verificaLimite(2, 25, 50)).toEqual([2, 25]); // Página e limite válidos
    expect(service.verificaLimite(3, 25, 50)).toEqual([2, 25]); // Página ajustada porque ultrapassa o total
    expect(service.verificaLimite(-1, 10, 50)).toEqual([-1, 10]); // Página negativa, mantida como está
  });
});
