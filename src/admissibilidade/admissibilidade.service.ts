import { ForbiddenException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { CreateAdmissibilidadeDto } from './dto/create-admissibilidade.dto';
import { UpdateAdmissibilidadeDto } from './dto/update-admissibilidade.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { AppService } from 'src/app.service';
import { Admissibilidade } from '@prisma/client';
import { equal } from 'assert';
import { equals } from 'class-validator';

export class AdmissibilidadePaginado {
  data: Admissibilidade[];
  total: number;
  pagina: number;
  limite: number;
}

@Injectable()
export class AdmissibilidadeService {

  constructor(
    private prisma: PrismaService,
    private app: AppService
  ) { }

  async create(createAdmissibilidadeDto: CreateAdmissibilidadeDto) {
    const { interfaces, tipo_processo, inicial_id } = createAdmissibilidadeDto;
    const admissibilidade = await this.prisma.admissibilidade.create({
      data: createAdmissibilidadeDto,
      include: { inicial: true }
    });
    if (tipo_processo) {
      await this.prisma.inicial.update({
        where: { id: inicial_id },
        data: { tipo_processo }
      });
    };
    if (tipo_processo === 2 && interfaces) {
      const interface_nova = this.prisma.interface.upsert({
        where: { inicial_id },
        create: {
          inicial_id,
          ...interfaces
        },
        update: {
          ...interfaces
        }
      });
    }
    if (!admissibilidade) throw new InternalServerErrorException('Não foi possível criar a subprefeitura. Tente novamente.');
    return admissibilidade;
  }

  async listaCompleta() {
    const admissibilidade = await this.prisma.admissibilidade.findMany({
    });
    if (!admissibilidade || admissibilidade.length == 0) throw new InternalServerErrorException('Nenhuma subprefeitura encontrada');
    return admissibilidade;
  }

  async buscarTudo(pagina: number, limite: number, filtro: number, busca?: string): Promise<AdmissibilidadePaginado> {
    [pagina, limite] = this.app.verificaPagina(pagina, limite);
    const searchParams = {
      ...(busca ?
        {
          OR: [
            { sei: { contains: busca } },
          ]
        } :
        {}),
    };
    const total = await this.prisma.admissibilidade.count({
      where: {
        inicial: {
          ...searchParams
        }
      }
    });
    if (total == 0) return { total: 0, pagina: 0, limite: 0, data: [] };
    [pagina, limite] = this.app.verificaLimite(pagina, limite, total);
    const admissibilidades = await this.prisma.admissibilidade.findMany({

      include: {
        inicial: true
      },
      where: {
        status: filtro === -1 ? undefined : filtro,
        inicial: {
          ...searchParams
        }
      },
      skip: (pagina - 1) * limite,
      take: limite,
    });
    if (!admissibilidades) throw new ForbiddenException('Nenhum processo encontrado');
    return {
      data: admissibilidades,
      total,
      pagina,
      limite
    };
  }

  async findAll() {
    const admissibilidade = await this.prisma.admissibilidade.findMany({
    });
    if (!admissibilidade || admissibilidade.length == 0) throw new InternalServerErrorException('Nenhuma subprefeitura encontrada');
    return admissibilidade;
  }

  async buscarPorId(id: number) {
    const admissibilidade = await this.prisma.admissibilidade.findUnique({
      where: { inicial_id: id },
      include: {
        inicial: true
      }
    });
    if (!admissibilidade) throw new InternalServerErrorException('Nenhuma admissibilidade encontrada');
    return admissibilidade;
  }

  async ultimaAtualizacao(id: number) {
    const inicial = await this.prisma.inicial.update({
      where: { id },
      data: {
        alterado_em: new Date()
      }
    })
    if (!inicial) throw new InternalServerErrorException('Nenhum processo encontrado');
    return inicial;
  }

  async atualizarStatus(
    id: number,
    updateAdmissibilidadeDto: UpdateAdmissibilidadeDto
  ): Promise<Admissibilidade> {
    const { interfaces, tipo_processo, inicial_id } = updateAdmissibilidadeDto;
    const admissibilidade = await this.prisma.admissibilidade.update({
      where: { inicial_id: id },
      data: updateAdmissibilidadeDto
    });
    if (tipo_processo) {
      await this.prisma.inicial.update({
        where: { id: inicial_id },
        data: { tipo_processo }
      });
      console.log('teste1');
      this.ultimaAtualizacao(id)
    };
    if (tipo_processo === 2 && interfaces) {
    console.log('teste2');
      this.ultimaAtualizacao(id)
      const interface_nova = this.prisma.interface.upsert({
        where: { inicial_id },
        create: {
          inicial_id,
          ...interfaces
        },
        update: {
          ...interfaces
        }
      });
    }
    if (!admissibilidade) throw new InternalServerErrorException('Nenhuma admissibilidade encontrada');
    this.ultimaAtualizacao(id)
    console.log('teste3');
    return admissibilidade;
  }

  remove(id: number) {
    return `This action removes a #${id} admissibilidade`;
  }
}
