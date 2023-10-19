import { ForbiddenException, Injectable } from '@nestjs/common';
import { CreateInicialDto } from './dto/create-inicial.dto';
import { UpdateInicialDto } from './dto/update-inicial.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { Inicial } from '@prisma/client';

export class IniciaisPaginado {
  data: Inicial[];
  totalCount: number;
}

@Injectable()
export class IniciaisService {
  constructor (private prisma: PrismaService) {}
  
  async create(createInicialDto: CreateInicialDto): Promise<Inicial> {
    const novo_inicial = await this.prisma.inicial.create({ data: { ... createInicialDto }});
    if (!novo_inicial) throw new ForbiddenException('Erro ao criar processo');
    return novo_inicial;
  }

  async findAll(page: number, limit: number): Promise<IniciaisPaginado> {
    if (page < 1) page = 1;
    if (limit < 1) limit = 10;
    const totalCount = await this.prisma.inicial.count();
    const iniciais = await this.prisma.inicial.findMany({
      skip: (page - 1) * limit,
      take: limit,
    });
    if (!iniciais) throw new ForbiddenException('Nenhum processo encontrado');
    return {
      data: iniciais,
      totalCount,
    }
  }

  async findOne(id: number): Promise<Inicial> {
    if (id < 1) throw new ForbiddenException('Id inválido');
    const inicial = await this.prisma.inicial.findUnique({ where: { id } });
    if (!inicial) throw new ForbiddenException('Nenhum processo encontrado');
    return inicial;
  }

  async update(id: number, updateInicialDto: UpdateInicialDto): Promise<Inicial> {
      const inicial = await this.prisma.inicial.findUnique({ where: { id } });
      if (!inicial) throw new ForbiddenException('Nenhum processo encontrado');
      const inicial_atualizado = await this.prisma.inicial.update({ where: { id }, data: { ... updateInicialDto } });
      if (!inicial_atualizado) throw new ForbiddenException('Erro ao atualizar processo');
      return inicial_atualizado;
  }

  // async remove(id: number) {
  //   const inicial = await this.prisma.inicial.findUnique({ where: { id } });
  //   if (!inicial) throw new ForbiddenException('Nenhum processo encontrado');
  //   await this.prisma.inicial.delete({ where: { id } });
  //   return "Processo deletado com sucesso";
  // }
}
