import { Injectable } from '@nestjs/common';
import { Inicial } from '@prisma/client';
import { Prisma } from '@prisma/client';

@Injectable()
export class AppService {
  getHello(): { message: string } {
    return { message: 'Hello World!' };
  }
  getOla(): { message: string } {
    return { message: 'Olá, Mundo!' };
  }

  verificaPagina(pagina: number, limite: number) {
    if (!pagina) pagina = 1;
    if (!limite) limite = 10;
    if (pagina < 1) pagina = 1;
    if (limite < 1) limite = 10;
    return [pagina, limite];
  }

  verificaLimite(pagina: number, limite: number, total: number) {
    if ((pagina - 1) * limite >= total) pagina = Math.ceil(total / limite);
    return [pagina, limite];
  }

  verificaControleDePrazos(inicial: Inicial) {
    return "oi gente"
  }
}

