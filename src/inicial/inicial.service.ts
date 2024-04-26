import { ForbiddenException, Injectable } from '@nestjs/common';
import { CreateInicialDto, CreateInterfacesDto } from './dto/create-inicial.dto';
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
      criado_em: { gte: dataBusca },
    }});
    if (!sqlBusca) return new ForbiddenException('Erro ao buscar sql.');
    if (sqlBusca.length > 0) return true;
    return false;
  }

  async adicionaSql(inicial_id: number, sql: string) {
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

  adicionaDiasData(dataInicial: Date, dias: number) {
    return new Date(dataInicial.valueOf() + (dias * 24 * 60 * 60 * 1000));
  }

  pegaQuarta(data: Date) {
    switch (data.getDay()) {
      case 2: return data;
      case 3: 
        return this.adicionaDiasData(data, -1);
      case 4:
        return this.adicionaDiasData(data, -2);
      case 5:
        return this.adicionaDiasData(data, -3);
      case 6:
        return this.adicionaDiasData(data, -4);
      case 0:
        return this.adicionaDiasData(data, -5);
      case 1:
        return this.adicionaDiasData(data, -6);
    }
  }

  async geraReuniaoData(inicial: Inicial) {
    const tipoAlvara = await this.prisma.alvara_Tipo.findUnique({ where: { id: inicial.alvara_tipo_id }})
    if (!tipoAlvara) throw new ForbiddenException('Erro ao buscar tipo de alvara.');
    const { prazo_admissibilidade, prazo_analise_multi1 } = tipoAlvara;
    const prazo = prazo_admissibilidade + prazo_analise_multi1;
    const data_original = this.adicionaDiasData(inicial.data_protocolo, prazo);
    var data_reuniao = this.pegaQuarta(data_original);
    const reuniao = await this.prisma.reuniao_Processo.upsert({
      where: { inicial_id: inicial.id },
      create: {
        data_reuniao,
        inicial_id: inicial.id
      },
      update: {
        data_reuniao
      }
    });
    if (!reuniao) throw new ForbiddenException('Erro ao gerar reunião.');
  }

  async removeSql(inicial_id: number, sql: string) {
    const sqlBusca = await this.prisma.inicial_Sqls.findFirst({
      where: {
        sql,
        inicial_id
      }
    });
    if (!sqlBusca) throw new ForbiddenException('Erro ao buscar sql.');
    await this.prisma.inicial_Sqls.delete({
      where: { id: sqlBusca.id }
    });
    return true;
  }

  async criaInterfaces(interfaces: CreateInterfacesDto, inicial_id: number) {
    const interfaceUpsert = await this.prisma.interface.upsert({
      where: { inicial_id },
      create: {
        inicial_id,
        ...interfaces
      },
      update: {
        ...interfaces
      }
    });
    if (!interfaceUpsert) throw new ForbiddenException('Erro ao criar interface.');
  }

  async alocaResponsavelTecnico(inicial: Inicial) {
    const inicial_id = inicial.id;
    const distribuicao = await this.prisma.distribuicao.findFirst({ where: { inicial_id } });
    if (!distribuicao) throw new ForbiddenException('Erro ao buscar distribuição.');
    const agora = new Date();
    var tecnico_responsavel_id = '';
    const include = {
      ferias: {
        where: { OR: [
            {
              inicio: {
                gte: agora,
                lte: this.adicionaDiasData(agora, 7)
              }
            }, {
              inicio: { lte: agora },
              final: { gte: agora }
            }
        ]}
      }
    };
    var tecnicos = await this.prisma.usuario.findMany({
      where: { 
        cargo: 'TEC'
      },
      orderBy: {
        criado_em: 'asc'
      },
      include
    });
    var tecnicos_id = tecnicos.filter(admin => admin.ferias.length === 0).map(admin => admin.id);
    var ultimo_tec = await this.prisma.distribuicao.findFirst({
      where: { NOT: { tecnico_responsavel_id: null }},
      orderBy: { criado_em: 'desc' }
    });
    if (!ultimo_tec) tecnico_responsavel_id = tecnicos_id[0];
    else {
      tecnico_responsavel_id = ultimo_tec.tecnico_responsavel_id;
      var ultimo_tec_index = tecnicos_id.findIndex(id => id === tecnico_responsavel_id);
      ultimo_tec_index = ultimo_tec_index === tecnicos_id.length - 1 ? 0 : (ultimo_tec_index + 1);
      tecnico_responsavel_id = tecnicos_id[ultimo_tec_index];
    }
    const distribuicao_tecnico = await this.prisma.distribuicao.update({
      where: { inicial_id },
      data: {
        tecnico_responsavel_id
      }
    });
    if (!distribuicao_tecnico) throw new ForbiddenException('Erro ao alocar técnico.');
  }

  async criaDistribuicao(inicial: Inicial) {
    const agora = new Date();
    var administrativo_responsavel_id = '';
    const include = {
      ferias: {
        where: { OR: [
            {
              inicio: {
                gte: agora,
                lte: this.adicionaDiasData(agora, 7)
              }
            }, {
              inicio: { lte: agora },
              final: { gte: agora }
            }
        ]}
      }
    };
    var administrativos = await this.prisma.usuario.findMany({
      where: { 
        cargo: 'ADM'
      },
      orderBy: {
        criado_em: 'asc'
      },
      include
    });
    var administrativosId = administrativos.filter(admin => admin.ferias.length === 0).map(admin => admin.id);
    var ultimo_adm = await this.prisma.distribuicao.findFirst({ orderBy: { criado_em: 'desc' }});
    if (!ultimo_adm) administrativo_responsavel_id = administrativosId[0];
    else {
      administrativo_responsavel_id = ultimo_adm.administrativo_responsavel_id;
      var ultimo_adm_index = administrativosId.findIndex(id => id === administrativo_responsavel_id);
      ultimo_adm_index = ultimo_adm_index === administrativosId.length - 1 ? 0 : (ultimo_adm_index + 1);
      administrativo_responsavel_id = administrativosId[ultimo_adm_index];
    }
    const distribuicao = await this.prisma.distribuicao.create({
      data: {
        inicial_id: inicial.id,
        administrativo_responsavel_id
      }
    });
    if (!distribuicao) throw new ForbiddenException('Erro ao criar distribuição.');
    if (inicial.envio_admissibilidade && distribuicao) {
      await this.alocaResponsavelTecnico(inicial);
    }
  }

  async criar(createInicialDto: CreateInicialDto): Promise<Inicial> {
    const { nums_sql, interfaces } = createInicialDto;
    delete createInicialDto.nums_sql;
    delete createInicialDto.interfaces;
    if (createInicialDto.envio_admissibilidade) createInicialDto.status = 2;
    const novo_inicial = await this.prisma.inicial.create({
      data: { ...createInicialDto },
    });
    if (!novo_inicial) throw new ForbiddenException('Erro ao criar processo');
    if (novo_inicial.tipo_processo === 2){
      await this.geraReuniaoData(novo_inicial);
      await this.criaInterfaces(interfaces as CreateInterfacesDto, novo_inicial.id);
    }
    if (novo_inicial) await this.criaDistribuicao(novo_inicial);
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
        interfaces: true,
        admissibilidade: true,
        distribuicao: {
          include: {
            administrativo_responsavel: true,
            tecnico_responsavel: true
          }
        }
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
    const { interfaces } = updateInicialDto;
    delete updateInicialDto.interfaces;
    const inicial_atualizado = await this.prisma.inicial.update({
      where: { id },
      data: { ...updateInicialDto },
    });
    if (inicial_atualizado.tipo_processo === 2){
      await this.geraReuniaoData(inicial_atualizado);
      await this.criaInterfaces(interfaces as CreateInterfacesDto, inicial_atualizado.id);
    }
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
