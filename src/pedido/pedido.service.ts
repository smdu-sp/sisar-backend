import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { Pedido } from '@prisma/client';
import { AppService } from 'src/app.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreatePedidoDto } from './dto/create-pedido.dto';
import { UpdatePedidoDto } from './dto/update-pedido.dto';

@Injectable()
export class PedidoService {
  constructor(
    private prisma: PrismaService,
    private app: AppService,
  ) {}

  async criar(dto: CreatePedidoDto): Promise<Pedido> {
    const existe = await this.prisma.pedido.findUnique({
      where: { descricao: dto.descricao },
    });
    if (existe) {
      throw new ForbiddenException('Já existe um pedido com esta descrição.');
    }
    const criado = await this.prisma.pedido.create({ data: dto });
    if (!criado) {
      throw new InternalServerErrorException(
        'Não foi possível criar o pedido.',
      );
    }
    return criado;
  }

  async buscarTudo(pagina = 1, limite = 10, busca?: string) {
    [pagina, limite] = this.app.verificaPagina(pagina, limite);
    const where = busca ? { descricao: { contains: busca } } : {};
    const total = await this.prisma.pedido.count({ where });
    if (total === 0) return { total: 0, pagina: 0, limite: 0, data: [] };
    [pagina, limite] = this.app.verificaLimite(pagina, limite, total);
    const data = await this.prisma.pedido.findMany({
      where,
      orderBy: { descricao: 'asc' },
      skip: (pagina - 1) * limite,
      take: limite,
    });
    return { total: +total, pagina: +pagina, limite: +limite, data };
  }

  async listaCompleta(): Promise<Pedido[]> {
    return this.prisma.pedido.findMany({ orderBy: { descricao: 'asc' } });
  }

  async buscarPorId(id: string): Promise<Pedido> {
    if (!id) throw new BadRequestException('Id inválido.');
    const item = await this.prisma.pedido.findUnique({ where: { id } });
    if (!item) throw new BadRequestException('Pedido não encontrado.');
    return item;
  }

  async atualizar(id: string, dto: UpdatePedidoDto): Promise<Pedido> {
    await this.buscarPorId(id);
    if (dto.descricao) {
      const duplicado = await this.prisma.pedido.findFirst({
        where: { descricao: dto.descricao, NOT: { id } },
      });
      if (duplicado) {
        throw new ForbiddenException(
          'Já existe um pedido com esta descrição.',
        );
      }
    }
    return this.prisma.pedido.update({ where: { id }, data: dto });
  }

  async remover(id: string): Promise<Pedido> {
    await this.buscarPorId(id);
    return this.prisma.pedido.delete({ where: { id } });
  }
}
