import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { Motivo_Inadmissao } from '@prisma/client';
import { AppService } from 'src/app.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateMotivoInadmissaoDto } from './dto/create-motivo-inadmissao.dto';
import { UpdateMotivoInadmissaoDto } from './dto/update-motivo-inadmissao.dto';

@Injectable()
export class MotivoInadmissaoService {
  constructor(
    private prisma: PrismaService,
    private app: AppService,
  ) {}

  async criar(dto: CreateMotivoInadmissaoDto): Promise<Motivo_Inadmissao> {
    const criado = await this.prisma.motivo_Inadmissao.create({
      data: { descricao: dto.descricao },
    });
    if (!criado) {
      throw new InternalServerErrorException(
        'Não foi possível criar o motivo.',
      );
    }
    return criado;
  }

  async buscarTudo(pagina = 1, limite = 10, busca?: string) {
    [pagina, limite] = this.app.verificaPagina(pagina, limite);
    const where = busca ? { descricao: { contains: busca } } : {};
    const total = await this.prisma.motivo_Inadmissao.count({ where });
    if (total === 0) return { total: 0, pagina: 0, limite: 0, data: [] };
    [pagina, limite] = this.app.verificaLimite(pagina, limite, total);
    const data = await this.prisma.motivo_Inadmissao.findMany({
      where,
      orderBy: { descricao: 'asc' },
      skip: (pagina - 1) * limite,
      take: limite,
    });
    return { total: +total, pagina: +pagina, limite: +limite, data };
  }

  async listaCompleta(): Promise<Motivo_Inadmissao[]> {
    return this.prisma.motivo_Inadmissao.findMany({
      orderBy: { descricao: 'asc' },
    });
  }

  async buscarPorId(id: string): Promise<Motivo_Inadmissao> {
    if (!id) throw new BadRequestException('Id inválido.');
    const item = await this.prisma.motivo_Inadmissao.findUnique({
      where: { id },
    });
    if (!item) throw new BadRequestException('Motivo não encontrado.');
    return item;
  }

  async atualizar(
    id: string,
    dto: UpdateMotivoInadmissaoDto,
  ): Promise<Motivo_Inadmissao> {
    await this.buscarPorId(id);
    return this.prisma.motivo_Inadmissao.update({
      where: { id },
      data: dto,
    });
  }

  async remover(id: string): Promise<Motivo_Inadmissao> {
    await this.buscarPorId(id);
    return this.prisma.motivo_Inadmissao.delete({ where: { id } });
  }
}
