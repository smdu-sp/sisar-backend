import { ForbiddenException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { CreateAdmissibilidadeDto } from './dto/create-admissibilidade.dto';
import { UpdateAdmissibilidadeDto } from './dto/update-admissibilidade.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { AppService } from 'src/app.service';
import { Admissibilidade } from '@prisma/client';

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
  ) {}
  async create(createAdmissibilidadeDto: CreateAdmissibilidadeDto) {
    const criaradmissibilidade = await this.prisma.admissibilidade.create({
      data:  createAdmissibilidadeDto as any
    });
    if (!criaradmissibilidade) throw new InternalServerErrorException('Não foi possível criar a subprefeitura. Tente novamente.');
    return criaradmissibilidade;
  }

  async listaCompleta() {
    const admissibilidade = await this.prisma.admissibilidade.findMany({
    });
    if (!admissibilidade || admissibilidade.length == 0) throw new InternalServerErrorException('Nenhuma subprefeitura encontrada');
    return admissibilidade;
  }

  async buscarTudo(pagina: number, limite: number): Promise<AdmissibilidadePaginado> {
    [pagina, limite] = this.app.verificaPagina(pagina, limite);
    const total = await this.prisma.admissibilidade.count();
    if (total == 0) return { total: 0, pagina: 0, limite: 0, data: [] };
    [pagina, limite] = this.app.verificaLimite(pagina, limite, total);
    const admissibilidades = await this.prisma.admissibilidade.findMany({
      include: {
        inicial: true,
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

  async atulaizarStatus(id: number, updateAdmissibilidadeDto: UpdateAdmissibilidadeDto) {
    const admissibilidade = await this.prisma.admissibilidade.update({
      where: { inicial_id: id },
      data:  updateAdmissibilidadeDto as any
    });
    if (!admissibilidade) throw new InternalServerErrorException('Nenhuma admissibilidade encontrada');
    return admissibilidade;
  }

  remove(id: number) {
    return `This action removes a #${id} admissibilidade`;
  }
}
