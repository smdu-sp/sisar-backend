import { ForbiddenException, Injectable } from '@nestjs/common';
import { CreateInicialDto, CreateInterfacesDto } from './dto/create-inicial.dto';
import { UpdateInicialDto } from './dto/update-inicial.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { Inicial, Inicial_Sqls, Reuniao_Processo } from '@prisma/client';
import { calcularDatasReuniaoGraproem } from 'src/common/calcular-datas-reuniao-graproem';
import { AppService } from 'src/app.service';
import { IniciaisPaginado, InicialResponseDTO } from './dto/inicial-response.dto';

@Injectable()
export class InicialService {
  constructor(
    private prisma: PrismaService,
    private app: AppService
  ) {}

  async validaSql(sql: string): Promise<boolean> {
    const dataBusca: Date = new Date();
    dataBusca.setDate(dataBusca.getDate() - 90);
    const sqlBusca: number = await this.prisma.inicial_Sqls.count({
      where: {
        sql, criado_em: { gte: dataBusca }
      }
    });
    if (!sqlBusca) throw new ForbiddenException('Erro ao buscar sql.');
    return sqlBusca > 0;
  }

  async validaSei(sei: string): Promise<boolean> {
    const processo: number = await this.prisma.inicial.count({ where: { sei } });
    if (!processo) throw new ForbiddenException('Erro ao buscar processos.');
    return processo > 0;
  }

  async adicionaSql(inicial_id: number, sql: string): Promise<Inicial_Sqls> {
    const existe: Inicial_Sqls = await this.prisma.inicial_Sqls.findFirst({
      where: {
        sql,
        inicial_id
      }
    });
    if (existe) throw new ForbiddenException('Sql já vinculado.');
    const novo_sql: Inicial_Sqls = await this.prisma.inicial_Sqls.create({
      data: { sql, inicial_id }
    });
    if (!novo_sql) throw new ForbiddenException('Erro ao vincular sql.');
    return novo_sql;
  }

  adicionaDiasData(dataInicial: Date, dias: number): Date {
    return new Date(dataInicial.valueOf() + (dias * 24 * 60 * 60 * 1000));
  }

  /** Calcula prazos de análise (SMUL / múltiplas interfaces) a partir da decisão de admissibilidade. */
  async calcularLimitesAnalise(
    inicialId: number,
  ): Promise<{ data_limiteSmul?: Date; data_limiteMulti?: Date }> {
    const inicial = await this.prisma.inicial.findUnique({
      where: { id: inicialId },
      include: {
        alvara_tipo: true,
        admissibilidade: { select: { data_decisao_interlocutoria: true } },
      },
    });
    if (!inicial?.alvara_tipo) return {};

    const decisao = inicial.admissibilidade?.data_decisao_interlocutoria;
    const baseSmul = decisao ?? inicial.envio_admissibilidade;
    const limites: { data_limiteSmul?: Date; data_limiteMulti?: Date } = {};

    if (baseSmul && inicial.alvara_tipo.prazo_analise_smul1 > 0) {
      limites.data_limiteSmul = this.adicionaDiasData(
        new Date(baseSmul),
        inicial.alvara_tipo.prazo_analise_smul1,
      );
    }

    if (inicial.tipo_processo === 2 && inicial.alvara_tipo.prazo_analise_multi1 > 0) {
      const baseMulti = decisao ?? inicial.envio_admissibilidade;
      if (baseMulti) {
        limites.data_limiteMulti = this.adicionaDiasData(
          new Date(baseMulti),
          inicial.alvara_tipo.prazo_analise_multi1,
        );
      }
    }

    return limites;
  }

  /** Cria registro de decisão e controles de prazo da etapa de análise (idempotente). */
  async provisionarRegistrosAnalise(inicialId: number): Promise<void> {
    const inicial = await this.prisma.inicial.findUnique({
      where: { id: inicialId },
      include: { alvara_tipo: true, admissibilidade: true },
    });
    if (!inicial?.alvara_tipo || inicial.status !== 2) return;

    const base =
      inicial.admissibilidade?.data_decisao_interlocutoria ??
      inicial.envio_admissibilidade;
    if (!base) return;

    const dataInicio = new Date(base);
    const graproem = inicial.tipo_processo === 2 ? 1 : 0;
    const alvara = inicial.alvara_tipo;

    const instancia = inicial.etapa_analise ?? 1;
    const decisaoExistente = await this.prisma.decisao.count({
      where: { inicial_id: inicialId, instancia },
    });
    if (decisaoExistente === 0) {
      await this.prisma.decisao.create({
        data: {
          inicial_id: inicialId,
          parecer: 0,
          etapa: 2,
          instancia,
          graproem,
        },
      });
    }

    const controlesExistentes = await this.prisma.controle_Prazo.count({
      where: { inicial_id: inicialId, etapa: 2 },
    });
    if (controlesExistentes > 0) return;

    const fases: number[] =
      inicial.tipo_processo === 2
        ? [alvara.prazo_analise_multi1, alvara.prazo_analise_multi2].filter(
            (d) => d > 0,
          )
        : [alvara.prazo_analise_smul1, alvara.prazo_analise_smul2].filter(
            (d) => d > 0,
          );

    let cursor = new Date(dataInicio);
    for (const duracao of fases) {
      const finalPlanejado = this.adicionaDiasData(cursor, duracao);
      await this.prisma.controle_Prazo.create({
        data: {
          inicial_id: inicialId,
          data_inicio: cursor,
          final_planejado: finalPlanejado,
          duracao_planejada: duracao,
          etapa: 2,
          graproem,
          status: 0,
        },
      });
      cursor = finalPlanejado;
    }
  }

  pegaQuarta(data: Date): Date {
    switch (data.getDay()) {
      case 1:
        return this.adicionaDiasData(data, -5);
      case 2: 
        return this.adicionaDiasData(data, -6);
      case 3:
        return data;
      case 4:
        return this.adicionaDiasData(data, -1);
      case 5:
        return this.adicionaDiasData(data, -2);
      case 6:
        return this.adicionaDiasData(data, -3);
      case 0:
        return this.adicionaDiasData(data, -4);
    }
  }

  async removeSql(inicial_id: number, sql: string): Promise<boolean> {
    const sqlBusca: Inicial_Sqls = await this.prisma.inicial_Sqls.findFirst({
      where: {
        sql,
        inicial_id
      }
    });
    if (!sqlBusca) throw new ForbiddenException('Erro ao buscar sql.');
    await this.prisma.inicial_Sqls.delete({
      where: { 
        id: sqlBusca.id 
      }
    });
    return true;
  }

  async criaInterfaces(interfaces: CreateInterfacesDto, inicial_id: number): Promise<void> {
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
    let tecnico_responsavel_id = '';
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
    let tecnicos = await this.prisma.usuario.findMany({
      where: {
        cargo: 'TEC'
      },
      orderBy: {
        criado_em: 'asc'
      },
      include
    });
    let tecnicos_id = tecnicos.filter(admin => admin.ferias.length === 0).map(admin => admin.id);
    let ultimo_tec = await this.prisma.distribuicao.findFirst({
      where: { NOT: { tecnico_responsavel_id: null } },
      orderBy: { criado_em: 'desc' }
    });
    if (!ultimo_tec) tecnico_responsavel_id = tecnicos_id[0];
    else {
      tecnico_responsavel_id = ultimo_tec.tecnico_responsavel_id;
      let ultimo_tec_index = tecnicos_id.findIndex(id => id === tecnico_responsavel_id);
      ultimo_tec_index = ultimo_tec_index === tecnicos_id.length - 1 ? 0 : (ultimo_tec_index + 1);
      tecnico_responsavel_id = tecnicos_id[ultimo_tec_index];
    }
    const distribuicao_tecnico = await this.prisma.distribuicao.update({
      where: { inicial_id },
      data: { tecnico_responsavel_id }
    });
    if (!distribuicao_tecnico) throw new ForbiddenException('Erro ao alocar técnico.');
  }

  async criaDistribuicao(inicial: Inicial) {
    const agora = new Date();
    let administrativo_responsavel_id = '';
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
    let administrativos = await this.prisma.usuario.findMany({
      where: {
        cargo: 'ADM'
      },
      orderBy: {
        criado_em: 'asc'
      },
      include
    });
    let administrativosId = administrativos.filter(admin => admin.ferias.length === 0).map(admin => admin.id);
    let ultimo_adm = await this.prisma.distribuicao.findFirst({ orderBy: { criado_em: 'desc' } });
    if (!ultimo_adm) administrativo_responsavel_id = administrativosId[0];
    else {
      administrativo_responsavel_id = ultimo_adm.administrativo_responsavel_id;
      let ultimo_adm_index = administrativosId.findIndex(id => id === administrativo_responsavel_id);
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
    if (inicial.envio_admissibilidade && distribuicao) await this.alocaResponsavelTecnico(inicial);
  }

  private parseDataCampo(valor: Date | string | undefined | null): Date | undefined {
    if (valor == null || valor === '') return undefined;
    if (valor instanceof Date) return valor;
    const texto = String(valor).trim();
    if (/^\d{4}-\d{2}-\d{2}$/.test(texto)) return new Date(`${texto}T12:00:00.000Z`);
    const data = new Date(texto);
    if (Number.isNaN(data.getTime())) throw new ForbiddenException('Data inválida.');
    return data;
  }

  async criar(createInicialDto: CreateInicialDto): Promise<Inicial> {
    const { nums_sql, interfaces } = createInicialDto;
    delete createInicialDto.nums_sql;
    delete createInicialDto.interfaces;
    createInicialDto.sei = createInicialDto.sei.replaceAll('-', '').replaceAll('.', '').replaceAll('/', '');
    if (createInicialDto.aprova_digital)
      createInicialDto.aprova_digital = createInicialDto.aprova_digital.replaceAll('-', '').replaceAll('.', '').replaceAll('/', '');
    if (createInicialDto.processo_fisico)
      createInicialDto.processo_fisico = createInicialDto.processo_fisico.replaceAll('-', '').replaceAll('.', '').replaceAll('/', '');
    createInicialDto.data_protocolo = this.parseDataCampo(createInicialDto.data_protocolo) as Date;
    createInicialDto.envio_admissibilidade = this.parseDataCampo(createInicialDto.envio_admissibilidade);
    if (createInicialDto.envio_admissibilidade) createInicialDto.status = 0;
    const tipo_alvara = await this.prisma.alvara_Tipo.findUnique({ where: { id: createInicialDto.alvara_tipo_id } });
    if (!tipo_alvara) throw new ForbiddenException('Alvara inválido.');
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
      data: {
        inicial_id: novo_inicial.id,
        ...(novo_inicial.envio_admissibilidade
          ? { data_envio: novo_inicial.envio_admissibilidade }
          : {}),
      },
    });
    return novo_inicial;
  }

  async buscarTudo(
    pagina: number = 1, 
    limite: number = 10,
    busca?: string,
    status: number = 0
  ): Promise<IniciaisPaginado> {
    [pagina, limite] = this.app.verificaPagina(pagina, limite);
    const searchParams = {
      ...(busca ? 
        { OR: [
            { sei: { contains: busca } },
            { requerimento: { contains: busca } },
            { aprova_digital: { contains: busca } },
            { processo_fisico: { contains: busca } }
        ] } : 
        {}),
        status: status === -1 ? undefined : status
    };
    const total = await this.prisma.inicial.count({where: searchParams });
    if (total == 0) return { total: 0, pagina: 0, limite: 0, data: [] };
    [pagina, limite] = this.app.verificaLimite(pagina, limite, total);
    const iniciais = await this.prisma.inicial.findMany({
      where: searchParams,
      include: {
        alvara_tipo: true,
        admissibilidade: {
          select: {
            data_envio: true,
            data_decisao_interlocutoria: true,
            status: true,
          },
        },
        distribuicao: {
          select: { tecnico_responsavel_id: true },
        },
        conclusao: {
          select: { data_conclusao: true },
        },
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

  async buscarTudoEmAnalise(pagina: number = 1, limite: number = 10): Promise<IniciaisPaginado> {
    [pagina, limite] = this.app.verificaPagina(pagina, limite);
    const where = { status: 2 };
    const total = await this.prisma.inicial.count({ where });
    if (total == 0) return { total: 0, pagina: 0, limite: 0, data: [] };
    [pagina, limite] = this.app.verificaLimite(pagina, limite, total);
    const iniciais = await this.prisma.inicial.findMany({
      where,
      include: {
        alvara_tipo: true,
        admissibilidade: {
          select: {
            data_envio: true,
            data_decisao_interlocutoria: true,
            status: true,
          },
        },
        distribuicao: {
          include: {
            tecnico_responsavel: { select: { id: true, nome: true } },
          },
        },
        conclusao: {
          select: { data_conclusao: true },
        },
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

  async buscarPorMesAnoProcesso(mes: number, ano: number): Promise<Reuniao_Processo[]> {
    const primeiroDiaMes: Date = new Date(ano, mes - 1, 1);
    const ultimoDiaMes: Date = new Date(ano, mes, 0);
    const processos: Reuniao_Processo[] = await this.prisma.reuniao_Processo.findMany({
      where: {
        AND: [
          { data_processo: { gte: primeiroDiaMes } },
          { data_processo: { lte: ultimoDiaMes } }
        ]
      }
    });
    if (!processos || processos.length === 0) 
      throw new ForbiddenException('Nenhum processo encontrado para esse dia.');
    return processos;
  }

  async verificaFeriado(data: string) {
    const response: Response = await fetch(`${process.env.API_FERIADOS_URL}/feriados/data/${data}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json"
      }
    })
    const feriado = await response.json();
    return feriado;
  }

  async geraReuniaoData(inicial: Inicial): Promise<void> {
    const tipoAlvara = await this.prisma.alvara_Tipo.findUnique({
      where: { id: inicial.alvara_tipo_id },
    });
    if (!tipoAlvara)
      throw new ForbiddenException('Erro ao buscar tipo de alvará.');
    if (!inicial.envio_admissibilidade) {
      throw new ForbiddenException(
        'Envio de admissibilidade é obrigatório para gerar data de reunião.',
      );
    }

    const { data_reuniao, data_processo } = calcularDatasReuniaoGraproem(
      inicial.envio_admissibilidade,
      tipoAlvara,
      1,
    );

    const reuniao = await this.prisma.reuniao_Processo.upsert({
      where: {
        inicial_id_instancia: { inicial_id: inicial.id, instancia: 1 },
      },
      create: {
        data_reuniao,
        inicial_id: inicial.id,
        instancia: 1,
        data_processo,
      },
      update: {
        data_reuniao,
        data_processo,
      },
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
    if (!processos) throw new ForbiddenException('Nenhum processo encontrado para esse dia.');
    return processos;
  }

  async buscarPorId(id: number): Promise<InicialResponseDTO> {
    if (!id || id < 1) throw new ForbiddenException('Id inválido');
    const inicial = await this.prisma.inicial.findUnique({
      where: { id },
      include: {
        alvara_tipo: true,
        iniciais_sqls: {
          orderBy: { sql: 'asc' }
        },
        interfaces: true,
        admissibilidade: true,
        conclusao: true,
        distribuicao: {
          include: {
            administrativo_responsavel: true,
            tecnico_responsavel: true
          }
        },
        comunique_ses: { orderBy: { criado_em: 'desc' } },
        decisoes: { orderBy: { instancia: 'asc' } },
        reunioes: { orderBy: { instancia: 'asc' } },
        reconsideracao_admissibilidade: true,
      }
    });
    if (!inicial) throw new ForbiddenException('Nenhum processo encontrado');
    if (!inicial.admissibilidade) return inicial;
    const dataEnvio =
      inicial.admissibilidade.data_envio ?? inicial.envio_admissibilidade ?? null;
    return {
      ...inicial,
      admissibilidade: {
        ...inicial.admissibilidade,
        data_envio: dataEnvio,
      },
    };
  }

  async atualizar(id: number, updateInicialDto: UpdateInicialDto): Promise<Inicial> {
    const inicial = await this.prisma.inicial.findUnique({ 
      where: { 
        id 
      } 
    });
    if (!inicial) throw new ForbiddenException('Nenhum processo encontrado');
    const { interfaces } = updateInicialDto;
    delete updateInicialDto.interfaces;
    const limitesAnalise =
      updateInicialDto.status === 2
        ? await this.calcularLimitesAnalise(id)
        : {};
    const inicial_atualizado = await this.prisma.inicial.update({
      where: { 
        id 
      },
      data: { 
        ...updateInicialDto,
        ...limitesAnalise,
      },
    });
    if (inicial_atualizado.tipo_processo === 2) {
      await this.geraReuniaoData(inicial_atualizado);
      await this.criaInterfaces(interfaces as CreateInterfacesDto, inicial_atualizado.id);
    }
    if (inicial_atualizado.status === 2) {
      const substatusInicial =
        inicial_atualizado.tipo_processo === 2 ? 3 : 0;
      if (
        inicial.substatus_analise == null ||
        updateInicialDto.status === 2
      ) {
        await this.prisma.inicial.update({
          where: { id },
          data: {
            etapa_analise: inicial_atualizado.etapa_analise ?? 1,
            substatus_analise:
              updateInicialDto.substatus_analise ?? substatusInicial,
          },
        });
      }
      await this.provisionarRegistrosAnalise(id);
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
