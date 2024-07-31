import { ForbiddenException, Injectable } from '@nestjs/common';
import { CreateInicialDto, CreateInterfacesDto } from './dto/create-inicial.dto';
import { UpdateInicialDto } from './dto/update-inicial.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { Inicial } from '@prisma/client';
import { AppService } from 'src/app.service';
import { promises } from 'dns';
import { HttpService } from '@nestjs/axios';

export class IniciaisPaginado {
  data: Inicial[];
  total: number;
  pagina: number;
  limite: number;
}

interface Feriado {
  nome: string
}

@Injectable()
export class InicialService {
  constructor(
    private prisma: PrismaService,
    private app: AppService,
    private readonly httpService: HttpService
  ) { }

  async validaSql(sql: string) {
    const dataBusca = new Date();
    dataBusca.setDate(dataBusca.getDate() - 90);
    const sqlBusca = await this.prisma.inicial_Sqls.count({
      where: {
        sql, criado_em: { gte: dataBusca }
      }
    });
    if (!sqlBusca) throw new ForbiddenException('Erro ao buscar sql.');
    return sqlBusca > 0;
  }

  async validaSei(sei: string) {
    const processo = await this.prisma.inicial.count({ where: { sei } });
    if (!processo) throw new ForbiddenException('Erro ao buscar processos.');
    return processo > 0;
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
        where: {
          OR: [
            {
              inicio: {
                gte: agora,
                lte: this.adicionaDiasData(agora, 7)
              }
            }, {
              inicio: { lte: agora },
              final: { gte: agora }
            }
          ]
        }
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
      where: { NOT: { tecnico_responsavel_id: null } },
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
        where: {
          OR: [
            {
              inicio: {
                gte: agora,
                lte: this.adicionaDiasData(agora, 7)
              }
            }, {
              inicio: { lte: agora },
              final: { gte: agora }
            }
          ]
        }
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
    var ultimo_adm = await this.prisma.distribuicao.findFirst({ orderBy: { criado_em: 'desc' } });
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
    createInicialDto.sei = createInicialDto.sei.replaceAll('-', '').replaceAll('.', '').replaceAll('/', '');
    createInicialDto.aprova_digital = createInicialDto.sei.replaceAll('-', '').replaceAll('.', '').replaceAll('/', '');
    createInicialDto.processo_fisico = createInicialDto.sei.replaceAll('-', '').replaceAll('.', '').replaceAll('/', '');
    if (createInicialDto.envio_admissibilidade) createInicialDto.status = 2;
    const tipo_alvara = await this.prisma.alvara_Tipo.findUnique({ where: { id: createInicialDto.alvara_tipo_id } });
    if (!tipo_alvara) throw new ForbiddenException('Alvara inválido.');
    const prazoTotalSmul = tipo_alvara.prazo_admissibilidade_smul + tipo_alvara.prazo_analise_smul1 + tipo_alvara.prazo_analise_smul2;
    const prazoTotalMulti = tipo_alvara.prazo_admissibilidade_multi + tipo_alvara.prazo_analise_multi1 + tipo_alvara.prazo_analise_multi2;

    const novo_inicial = await this.prisma.inicial.create({
      data: { ...createInicialDto },
    });
    if (!novo_inicial) throw new ForbiddenException('Erro ao criar processo');
    if (novo_inicial.tipo_processo === 2) {
      await this.geraReuniaoData(novo_inicial);
      await this.criaInterfaces(interfaces as CreateInterfacesDto, novo_inicial.id);
    }
    if (novo_inicial) await this.criaDistribuicao(novo_inicial);
    if (nums_sql && nums_sql.length > 0) {
      await this.prisma.inicial_Sqls.createMany({
        data: nums_sql.map(sql => ({ sql, inicial_id: novo_inicial.id })),
      });
    }
    await this.prisma.admissibilidade.create({
      data: { inicial_id: novo_inicial.id }
    });
    return novo_inicial;
  }

  async buscarTudo(pagina: number = 1, limite: number = 10): Promise<IniciaisPaginado> {
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
      total: +total,
      pagina: +pagina,
      limite: +limite,
      data: iniciais,
    };
  }

  async todosProcessos() {
    const iniciais = await this.prisma.inicial.findMany({
      select: {
        sei: true,
        aprova_digital: true,
        id: true
      }
    });
    if (!iniciais) throw new ForbiddenException('Nenhum processo encontrado');
    return iniciais;
  }


  async buscarPorMesAnoProcesso(mes: any, ano: any) {
    const primeiroDiaMes = new Date(ano, mes - 1, 1);
    const ultimoDiaMes = new Date(ano, mes, 0);

    const processos = await this.prisma.reuniao_Processo.findMany({
      where: {
        AND: [
          { data_processo: { gte: primeiroDiaMes } },
          { data_processo: { lte: ultimoDiaMes } }
        ]
      }
    });

    if (!processos || processos.length === 0) {
      throw new ForbiddenException('Nenhum processo encontrado para esse dia.');
    }
    return processos;
  }

  async verificaFeriado(data: string){
    const feriado = await fetch(`${process.env.API_FERIADOS_URL}/feriados/data/${data}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json"
      }
    }).then((response) => {
      return response.json();
    })
    return feriado;
  }


  async geraReuniaoData(inicial: Inicial) {
    const tipoAlvara = await this.prisma.alvara_Tipo.findUnique({ where: { id: inicial.alvara_tipo_id } });
    if (!tipoAlvara) throw new ForbiddenException('Erro ao buscar tipo de alvará.');
    const { prazo_analise_multi1 } = tipoAlvara;
    const data = new Date(inicial.envio_admissibilidade);
    data.setDate(data.getDate() + prazo_analise_multi1);

    const pegaQuarta = (data: Date) => {
      const diaSemana = data.getDay();
      if (diaSemana !== 3) {
        const quarta = new Date(data);
        switch (diaSemana) {
          case 0:
            quarta.setDate(data.getDate() - 4);
            break;
          case 1:
            quarta.setDate(data.getDate() - 5);
            break;
          case 2:
            quarta.setDate(data.getDate() - 6);
            break;
          case 3:
            quarta.setDate(data.getDate() - 7);
            break;
          case 4:
            quarta.setDate(data.getDate() - 1);
            break;
          case 5:
            quarta.setDate(data.getDate() - 2);
            break;
          case 6:
            quarta.setDate(data.getDate() - 3);
            break;
        }
        return quarta;
      } else { return data }
    }

    let data_reuniao = pegaQuarta(new Date(data));

    const data_formatada = data_reuniao.toISOString().split('T')[0]

    const validaFeriado = await this.verificaFeriado(data_formatada);

    data_reuniao.setUTCHours(0, 0, 0, 0);

    if (validaFeriado) {
      data_reuniao.setDate(data_reuniao.getDate() - 7)
    }

    let dataProcesso = new Date(inicial.envio_admissibilidade);

    dataProcesso.setDate(
      dataProcesso.getDate() +
      tipoAlvara.prazo_admissibilidade_multi +
      tipoAlvara.prazo_analise_multi1 +
      tipoAlvara.prazo_analise_multi2 +
      tipoAlvara.prazo_emissao_alvara_multi
    );
    dataProcesso.setUTCHours(0, 0, 0, 0);

    const reuniao = await this.prisma.reuniao_Processo.upsert({
      where: { inicial_id: inicial.id },
      create: {
        data_reuniao,
        inicial_id: inicial.id,
        data_processo: dataProcesso
      },
      update: {
        data_reuniao
      }
    });

    if (!reuniao) throw new ForbiddenException('Erro ao gerar reunião.');
  }
  async buscarPorDataProcesso(data: Date) {
    const reuniao_data = new Date(data).toISOString();
    const processos = await this.prisma.reuniao_Processo.findMany({
      include: {
        inicial: true
      },
      where: {
        data_processo: { equals: reuniao_data }
      }
    });


    if (!processos) {
      throw new ForbiddenException('Nenhum processo encontrado para esse dia.');
    }
    return processos;
  }

  async buscarPorId(id: number): Promise<Inicial> {
    if (id < 1) throw new ForbiddenException('Id inválido');
    if (!id) throw new ForbiddenException('Id inválido');
    const inicial = await this.prisma.inicial.findUnique({
      where: { id },
      include: {
        iniciais_sqls: {
          orderBy: {
            sql: 'asc'
          }
        },
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
    if (inicial_atualizado.tipo_processo === 2) {
      await this.geraReuniaoData(inicial_atualizado);
      await this.criaInterfaces(interfaces as CreateInterfacesDto, inicial_atualizado.id);
    }
    if (!inicial_atualizado)
      throw new ForbiddenException('Erro ao atualizar processo');
    return inicial_atualizado;
  }

  async verificaSei(sei: string) {
    const inicial = await this.prisma.inicial.findFirst({
      where: {
        OR: [
          { sei },
          {
            interfaces: {
              OR: [
                { num_sehab: sei },
                { num_siurb: sei },
                { num_smc: sei },
                { num_smt: sei },
                { num_svma: sei },
              ]
            }
          }
        ]
      }
    });
    if (!inicial) throw new ForbiddenException("Erro ao buscar processos.");
    return inicial;
  }

  // async remove(id: number) {
  //   const inicial = await this.prisma.inicial.findUnique({ where: { id } });
  //   if (!inicial) throw new ForbiddenException('Nenhum processo encontrado');
  //   await this.prisma.inicial.delete({ where: { id } });
  //   return "Processo deletado com sucesso";
  // }
}
