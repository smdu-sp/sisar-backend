import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { Coordenadoria } from '@prisma/client';
import { AppService } from 'src/app.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateCoordenadoriaDto } from './dto/create-coordenadoria.dto';
import { UpdateCoordenadoriaDto } from './dto/update-coordenadoria.dto';

@Injectable()
export class CoordenadoriaService {
  constructor(
    private prisma: PrismaService,
    private app: AppService,
  ) {}

  async criar(dto: CreateCoordenadoriaDto): Promise<Coordenadoria> {
    const porNome = await this.prisma.coordenadoria.findUnique({
      where: { nome: dto.nome },
    });
    if (porNome) {
      throw new ForbiddenException('Já existe uma coordenadoria com este nome.');
    }
    const porSigla = await this.prisma.coordenadoria.findUnique({
      where: { sigla: dto.sigla },
    });
    if (porSigla) {
      throw new ForbiddenException('Já existe uma coordenadoria com esta sigla.');
    }
    const criada = await this.prisma.coordenadoria.create({ data: dto });
    if (!criada) {
      throw new InternalServerErrorException(
        'Não foi possível criar a coordenadoria.',
      );
    }
    return criada;
  }

  async buscarTudo(pagina = 1, limite = 10, busca?: string) {
    [pagina, limite] = this.app.verificaPagina(pagina, limite);
    const where = busca
      ? {
          OR: [
            { nome: { contains: busca } },
            { sigla: { contains: busca } },
          ],
        }
      : {};
    const total = await this.prisma.coordenadoria.count({ where });
    if (total === 0) return { total: 0, pagina: 0, limite: 0, data: [] };
    [pagina, limite] = this.app.verificaLimite(pagina, limite, total);
    const data = await this.prisma.coordenadoria.findMany({
      where,
      orderBy: { nome: 'asc' },
      skip: (pagina - 1) * limite,
      take: limite,
      include: { diretorias: true },
    });
    return { total: +total, pagina: +pagina, limite: +limite, data };
  }

  async listaCompleta() {
    return this.prisma.coordenadoria.findMany({
      orderBy: { nome: 'asc' },
      select: { id: true, nome: true, sigla: true },
    });
  }

  async buscarPorId(id: string) {
    if (!id) throw new BadRequestException('Id inválido.');
    const item = await this.prisma.coordenadoria.findUnique({
      where: { id },
      include: { diretorias: true },
    });
    if (!item) throw new BadRequestException('Coordenadoria não encontrada.');
    return item;
  }

  async atualizar(
    id: string,
    dto: UpdateCoordenadoriaDto,
  ): Promise<Coordenadoria> {
    await this.buscarPorId(id);
    if (dto.nome) {
      const duplicada = await this.prisma.coordenadoria.findFirst({
        where: { nome: dto.nome, NOT: { id } },
      });
      if (duplicada) {
        throw new ForbiddenException(
          'Já existe uma coordenadoria com este nome.',
        );
      }
    }
    if (dto.sigla) {
      const duplicada = await this.prisma.coordenadoria.findFirst({
        where: { sigla: dto.sigla, NOT: { id } },
      });
      if (duplicada) {
        throw new ForbiddenException(
          'Já existe uma coordenadoria com esta sigla.',
        );
      }
    }
    return this.prisma.coordenadoria.update({ where: { id }, data: dto });
  }

  async remover(id: string): Promise<Coordenadoria> {
    await this.buscarPorId(id);
    return this.prisma.coordenadoria.delete({ where: { id } });
  }
}
