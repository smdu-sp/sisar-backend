import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { AppService } from 'src/app.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateDiretoriaDto } from './dto/create-diretoria.dto';
import { UpdateDiretoriaDto } from './dto/update-diretoria.dto';

@Injectable()
export class DiretoriaService {
  constructor(
    private prisma: PrismaService,
    private app: AppService,
  ) {}

  async criar(dto: CreateDiretoriaDto) {
    const coordenadoria = await this.prisma.coordenadoria.findUnique({
      where: { id: dto.coordenadoria_id },
    });
    if (!coordenadoria) {
      throw new BadRequestException('Coordenadoria não encontrada.');
    }
    const existe = await this.prisma.diretoria.findUnique({
      where: { nome: dto.nome },
    });
    if (existe) {
      throw new ForbiddenException('Já existe uma diretoria com este nome.');
    }
    const criada = await this.prisma.diretoria.create({
      data: dto,
      include: { coordenadoria: { select: { id: true, nome: true, sigla: true } } },
    });
    if (!criada) {
      throw new InternalServerErrorException(
        'Não foi possível criar a diretoria.',
      );
    }
    return criada;
  }

  async buscarTudo(pagina = 1, limite = 10, busca?: string, coordenadoria_id?: string) {
    [pagina, limite] = this.app.verificaPagina(pagina, limite);
    const where = {
      ...(coordenadoria_id ? { coordenadoria_id } : {}),
      ...(busca
        ? {
            OR: [
              { nome: { contains: busca } },
              { coordenadoria: { nome: { contains: busca } } },
            ],
          }
        : {}),
    };
    const total = await this.prisma.diretoria.count({ where });
    if (total === 0) return { total: 0, pagina: 0, limite: 0, data: [] };
    [pagina, limite] = this.app.verificaLimite(pagina, limite, total);
    const data = await this.prisma.diretoria.findMany({
      where,
      orderBy: { nome: 'asc' },
      skip: (pagina - 1) * limite,
      take: limite,
      include: { coordenadoria: { select: { id: true, nome: true, sigla: true } } },
    });
    return { total: +total, pagina: +pagina, limite: +limite, data };
  }

  async listaCompleta(coordenadoria_id?: string) {
    return this.prisma.diretoria.findMany({
      where: coordenadoria_id ? { coordenadoria_id } : undefined,
      orderBy: { nome: 'asc' },
      include: { coordenadoria: { select: { id: true, nome: true, sigla: true } } },
    });
  }

  async buscarPorId(id: string) {
    if (!id) throw new BadRequestException('Id inválido.');
    const item = await this.prisma.diretoria.findUnique({
      where: { id },
      include: { coordenadoria: { select: { id: true, nome: true, sigla: true } } },
    });
    if (!item) throw new BadRequestException('Diretoria não encontrada.');
    return item;
  }

  async atualizar(id: string, dto: UpdateDiretoriaDto) {
    await this.buscarPorId(id);
    if (dto.coordenadoria_id) {
      const coordenadoria = await this.prisma.coordenadoria.findUnique({
        where: { id: dto.coordenadoria_id },
      });
      if (!coordenadoria) {
        throw new BadRequestException('Coordenadoria não encontrada.');
      }
    }
    if (dto.nome) {
      const duplicada = await this.prisma.diretoria.findFirst({
        where: { nome: dto.nome, NOT: { id } },
      });
      if (duplicada) {
        throw new ForbiddenException('Já existe uma diretoria com este nome.');
      }
    }
    return this.prisma.diretoria.update({
      where: { id },
      data: dto,
      include: { coordenadoria: { select: { id: true, nome: true, sigla: true } } },
    });
  }

  async remover(id: string) {
    await this.buscarPorId(id);
    return this.prisma.diretoria.delete({ where: { id } });
  }
}
