import { ForbiddenException, Injectable } from '@nestjs/common';
import { CreateInicialDto } from './dto/create-inicial.dto';
import { UpdateInicialDto } from './dto/update-inicial.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { Inicial } from '@prisma/client';
import { AppService } from 'src/app.service';

export class IniciaisPaginado {
  data: Inicial[];
  total: number;
  pagina: number;
  limite: number;
}

@Injectable()
export class InicialService {
  constructor(
    private prisma: PrismaService,
    private app: AppService
  ) {}

  async validaSql(sql: string) {
    const dataBusca = new Date();
    dataBusca.setDate(dataBusca.getDate() - 90);
    const sqlBusca = await this.prisma.inicial_Sqls.findMany({ where: { 
      sql,
      data_cadastro: { gte: new Date() },
    }});
    if (!sqlBusca) return new ForbiddenException('Erro ao buscar sql.');
    if (sqlBusca.length > 0) return true;
    return false;
  }

  async adicionaSql(sql: string, inicial_id: number) {
    const existe = await this.prisma.inicial_Sqls.findFirst({
      where: {
        sql,
        inicial_id
      }
    });
    if (existe) return new ForbiddenException('Sql já vinculado.');
    const novo_sql = await this.prisma.inicial_Sqls.create({
      data: { sql, inicial_id }
    });
    if (!novo_sql) throw new ForbiddenException('Erro ao vincular sql.');
    return novo_sql;
  }

  async criar(createInicialDto: CreateInicialDto): Promise<Inicial> {
    const { nums_sql } = createInicialDto;
    delete createInicialDto.nums_sql;
    const novo_inicial = await this.prisma.inicial.create({
      data: { ...createInicialDto },
    });
    if (!novo_inicial) throw new ForbiddenException('Erro ao criar processo');
    if (nums_sql && nums_sql.length > 0) {
      await this.prisma.inicial_Sqls.createMany({
        data: nums_sql.map(sql => ({ sql, inicial_id: novo_inicial.id })),
      });
    }
    return novo_inicial;
  }

  async buscarTudo(pagina: number, limite: number): Promise<IniciaisPaginado> {
    [pagina, limite] = this.app.verificaPagina(pagina, limite);
    const total = await this.prisma.inicial.count();
    if (total == 0) return { total: 0, pagina: 0, limite: 0, data: [] };
    [pagina, limite] = this.app.verificaLimite(pagina, limite, total);
    const iniciais = await this.prisma.inicial.findMany({
      include: {
        alvara_tipo: true,
      },
      skip: (pagina - 1) * limite,
      take: limite,
    });
    if (!iniciais) throw new ForbiddenException('Nenhum processo encontrado');
    return {
      data: iniciais,
      total,
      pagina,
      limite
    };
  }

  async buscarPorId(id: number): Promise<Inicial> {
    if (id < 1) throw new ForbiddenException('Id inválido');
    const inicial = await this.prisma.inicial.findUnique({ 
      where: { id },
      include: {
        iniciais_sqls: true,
      }
    });
    if (!inicial) throw new ForbiddenException('Nenhum processo encontrado');
    return inicial;
  }

  async atualizar(
    id: number,
    updateInicialDto: UpdateInicialDto,
  ): Promise<Inicial> {
    const inicial = await this.prisma.inicial.findUnique({ where: { id } });
    if (!inicial) throw new ForbiddenException('Nenhum processo encontrado');
    const inicial_atualizado = await this.prisma.inicial.update({
      where: { id },
      data: { ...updateInicialDto },
    });
    if (!inicial_atualizado)
      throw new ForbiddenException('Erro ao atualizar processo');
    return inicial_atualizado;
  }

  // async remove(id: number) {
  //   const inicial = await this.prisma.inicial.findUnique({ where: { id } });
  //   if (!inicial) throw new ForbiddenException('Nenhum processo encontrado');
  //   await this.prisma.inicial.delete({ where: { id } });
  //   return "Processo deletado com sucesso";
  // }
}
