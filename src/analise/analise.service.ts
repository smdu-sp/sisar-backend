import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  MAX_INSTANCIA_ANALISE,
  MotivoSuspensao,
  ParecerDecisao,
  SubstatusAnalise,
} from './analise.constants';
import { RegistrarPreReuniaoDto } from './dto/registrar-pre-reuniao.dto';
import { RegistrarComuniqueSeDto } from './dto/registrar-comunique-se.dto';
import { RegistrarDecisaoDto } from './dto/registrar-decisao.dto';
import { calcularDatasReuniaoGraproem } from 'src/common/calcular-datas-reuniao-graproem';

@Injectable()
export class AnaliseService {
  constructor(private prisma: PrismaService) {}

  private parseData(valor: Date | string): Date {
    if (valor instanceof Date) return valor;
    const texto = String(valor).trim();
    if (/^\d{4}-\d{2}-\d{2}$/.test(texto)) {
      return new Date(`${texto}T12:00:00.000Z`);
    }
    const data = new Date(texto);
    if (Number.isNaN(data.getTime())) {
      throw new BadRequestException('Data inválida.');
    }
    return data;
  }

  private async carregarProcessoAnalise(inicialId: number) {
    const inicial = await this.prisma.inicial.findUnique({
      where: { id: inicialId },
      include: {
        alvara_tipo: true,
        decisoes: { orderBy: { instancia: 'asc' } },
        comunique_ses: { orderBy: { criado_em: 'desc' } },
        reunioes: { orderBy: { instancia: 'asc' } },
        suspensoes_prazo: {
          where: { final: null },
          orderBy: { criado_em: 'desc' },
          take: 1,
        },
      },
    });
    if (!inicial) throw new ForbiddenException('Processo não encontrado.');
    if (inicial.status !== 2) {
      throw new BadRequestException(
        'O processo não está em análise técnica.',
      );
    }
    return inicial;
  }

  private prazoInstancia(
    tipoProcesso: number,
    instancia: number,
    alvara: {
      prazo_analise_smul1: number;
      prazo_analise_smul2: number;
      prazo_analise_multi1: number;
      prazo_analise_multi2: number;
    },
  ): number {
    const prazosSmul = [
      alvara.prazo_analise_smul1,
      alvara.prazo_analise_smul2,
      alvara.prazo_analise_smul2,
    ];
    const prazosMulti = [
      alvara.prazo_analise_multi1,
      alvara.prazo_analise_multi2,
      alvara.prazo_analise_multi2,
    ];
    const lista = tipoProcesso === 2 ? prazosMulti : prazosSmul;
    return lista[Math.min(instancia - 1, 2)] ?? lista[0];
  }

  private async provisionarReuniaoGraproem(
    inicialId: number,
    instancia: number,
  ) {
    const inicial = await this.prisma.inicial.findUnique({
      where: { id: inicialId },
      include: { alvara_tipo: true },
    });
    if (
      !inicial ||
      inicial.tipo_processo !== 2 ||
      !inicial.envio_admissibilidade
    ) {
      return;
    }

    const { data_reuniao, data_processo } = calcularDatasReuniaoGraproem(
      inicial.envio_admissibilidade,
      inicial.alvara_tipo,
      instancia,
    );

    await this.prisma.reuniao_Processo.upsert({
      where: {
        inicial_id_instancia: { inicial_id: inicialId, instancia },
      },
      create: {
        inicial_id: inicialId,
        instancia,
        data_reuniao,
        data_processo,
      },
      update: {
        data_reuniao,
        data_processo,
      },
    });
  }

  private reuniaoCompleta(
    reuniao: {
      numero_reuniao: string | null;
      parecer_grupo: string | null;
      data_reuniao: Date;
    } | null,
  ): boolean {
    if (!reuniao) return false;
    return Boolean(
      reuniao.numero_reuniao?.trim() && reuniao.parecer_grupo?.trim(),
    );
  }

  async obterContexto(inicialId: number) {
    const inicial = await this.prisma.inicial.findUnique({
      where: { id: inicialId },
      include: {
        alvara_tipo: true,
        distribuicao: {
          include: {
            tecnico_responsavel: { select: { id: true, nome: true } },
            administrativo_responsavel: { select: { id: true, nome: true } },
          },
        },
        decisoes: { orderBy: { instancia: 'asc' } },
        comunique_ses: { orderBy: { criado_em: 'desc' } },
        reunioes: { orderBy: { instancia: 'asc' } },
        suspensoes_prazo: {
          where: { final: null },
          orderBy: { criado_em: 'desc' },
          take: 1,
        },
      },
    });
    if (!inicial) throw new ForbiddenException('Processo não encontrado.');

    const instancia = inicial.etapa_analise ?? 1;
    const substatus = inicial.substatus_analise ?? 0;
    const graproem = inicial.tipo_processo === 2;
    const reuniaoAtual =
      inicial.reunioes.find((r) => r.instancia === instancia) ?? null;
    const comuniqueAberto =
      inicial.comunique_ses.find((c) => !c.data_resposta && c.etapa === instancia) ??
      null;

    const preReuniaoOk = !graproem || this.reuniaoCompleta(reuniaoAtual);
    const podeDecidir =
      inicial.status === 2 &&
      substatus !== SubstatusAnalise.COMUNIQUE_SE &&
      substatus !== SubstatusAnalise.AGUARDANDO_RECURSO &&
      (substatus !== SubstatusAnalise.PRE_REUNIAO_GRAPROEM || preReuniaoOk) &&
      preReuniaoOk;

    return {
      inicial_id: inicial.id,
      status: inicial.status,
      tipo_processo: inicial.tipo_processo,
      etapa_analise: instancia,
      substatus_analise: substatus,
      graproem,
      data_limiteSmul: inicial.data_limiteSmul,
      data_limiteMulti: inicial.data_limiteMulti,
      distribuicao: inicial.distribuicao,
      reuniao_atual: reuniaoAtual,
      pre_reuniao_completa: preReuniaoOk,
      comunique_aberto: comuniqueAberto,
      decisoes: inicial.decisoes,
      comunique_ses: inicial.comunique_ses,
      reunioes: inicial.reunioes,
      pode_registrar_pre_reuniao:
        graproem &&
        inicial.status === 2 &&
        substatus !== SubstatusAnalise.COMUNIQUE_SE,
      pode_decidir: podeDecidir,
      pode_comunique_se: podeDecidir,
      pode_registrar_resposta_comunique:
        Boolean(comuniqueAberto) &&
        substatus === SubstatusAnalise.COMUNIQUE_SE,
      pode_registrar_recurso:
        substatus === SubstatusAnalise.AGUARDANDO_RECURSO &&
        instancia < MAX_INSTANCIA_ANALISE,
      indeferimento_definitivo:
        substatus === SubstatusAnalise.AGUARDANDO_RECURSO &&
        instancia >= MAX_INSTANCIA_ANALISE,
      max_instancia: MAX_INSTANCIA_ANALISE,
    };
  }

  async registrarPreReuniao(
    inicialId: number,
    dto: RegistrarPreReuniaoDto,
  ) {
    const inicial = await this.carregarProcessoAnalise(inicialId);
    if (inicial.tipo_processo !== 2) {
      throw new BadRequestException(
        'Pré-reunião GRAPROEM só se aplica a processos de múltiplas interfaces.',
      );
    }

    const instancia = inicial.etapa_analise ?? 1;
    const dataReuniao = this.parseData(dto.data_reuniao);
    const dataProcesso = this.parseData(dto.data_processo);

    const novaDataReuniao =
      dto.nova_data_reuniao != null &&
      String(dto.nova_data_reuniao).trim() !== ''
        ? this.parseData(dto.nova_data_reuniao)
        : null;
    const justificativa = dto.justificativa_remarcacao?.trim() || null;
    if (novaDataReuniao && !justificativa) {
      throw new BadRequestException(
        'Informe a justificativa ao remarcar a data da reunião.',
      );
    }

    const reuniao = await this.prisma.reuniao_Processo.upsert({
      where: {
        inicial_id_instancia: { inicial_id: inicialId, instancia },
      },
      create: {
        inicial_id: inicialId,
        instancia,
        data_reuniao: dataReuniao,
        data_processo: dataProcesso,
        numero_reuniao: dto.numero_reuniao.trim(),
        parecer_grupo: dto.parecer_grupo.trim(),
        nova_data_reuniao: novaDataReuniao,
        justificativa_remarcacao: justificativa,
      },
      update: {
        data_reuniao: dataReuniao,
        data_processo: dataProcesso,
        numero_reuniao: dto.numero_reuniao.trim(),
        parecer_grupo: dto.parecer_grupo.trim(),
        nova_data_reuniao: novaDataReuniao,
        justificativa_remarcacao: justificativa,
      },
    });

    if (
      (inicial.substatus_analise ?? 0) ===
      SubstatusAnalise.PRE_REUNIAO_GRAPROEM
    ) {
      await this.prisma.inicial.update({
        where: { id: inicialId },
        data: { substatus_analise: SubstatusAnalise.NORMAL },
      });
    }

    return reuniao;
  }

  async registrarComuniqueSe(
    inicialId: number,
    dto: RegistrarComuniqueSeDto,
  ) {
    const inicial = await this.carregarProcessoAnalise(inicialId);
    const instancia = inicial.etapa_analise ?? 1;
    const graproem = inicial.tipo_processo === 2 ? 1 : 0;

    if ((inicial.substatus_analise ?? 0) === SubstatusAnalise.COMUNIQUE_SE) {
      throw new BadRequestException('Já existe comunique-se em aberto.');
    }

    if (inicial.tipo_processo === 2) {
      const reuniao =
        inicial.reunioes.find((r) => r.instancia === instancia) ?? null;
      if (!this.reuniaoCompleta(reuniao)) {
        throw new BadRequestException(
          'Preencha os dados da pré-reunião GRAPROEM antes do comunique-se.',
        );
      }
    }

    const data = this.parseData(dto.data);
    const comunique = await this.prisma.comunique_se.create({
      data: {
        inicial_id: inicialId,
        data,
        complementar: dto.complementar ?? false,
        etapa: instancia,
        graproem,
      },
    });

    await this.prisma.suspensao_Prazo.create({
      data: {
        inicial_id: inicialId,
        inicio: data,
        motivo: MotivoSuspensao.COMUNIQUE_SE,
        etapa: instancia,
      },
    });

    await this.prisma.inicial.update({
      where: { id: inicialId },
      data: { substatus_analise: SubstatusAnalise.COMUNIQUE_SE },
    });

    const decisaoId = await this.idDecisaoInstancia(inicialId, instancia);
    await this.prisma.decisao.update({
      where: { id: decisaoId },
      data: {
        parecer: ParecerDecisao.COMUNIQUE_SE,
        publicacao_parecer: data,
        graproem,
      },
    });

    return comunique;
  }

  private async idDecisaoInstancia(
    inicialId: number,
    instancia: number,
  ): Promise<string> {
    const existente = await this.prisma.decisao.findFirst({
      where: { inicial_id: inicialId, instancia },
    });
    if (existente) return existente.id;
    const criada = await this.prisma.decisao.create({
      data: {
        inicial_id: inicialId,
        instancia,
        etapa: 2,
        graproem: 0,
        parecer: ParecerDecisao.PENDENTE,
      },
    });
    return criada.id;
  }

  async registrarRespostaComuniqueSe(
    comuniqueId: string,
    dataResposta: Date | string,
  ) {
    const comunique = await this.prisma.comunique_se.findUnique({
      where: { id: comuniqueId },
      include: { inicial: true },
    });
    if (!comunique) throw new ForbiddenException('Comunique-se não encontrado.');
    if (comunique.data_resposta) {
      throw new BadRequestException('Comunique-se já possui resposta registrada.');
    }

    const resposta = this.parseData(dataResposta);
    const atualizado = await this.prisma.comunique_se.update({
      where: { id: comuniqueId },
      data: { data_resposta: resposta },
    });

    const suspensao = await this.prisma.suspensao_Prazo.findFirst({
      where: {
        inicial_id: comunique.inicial_id,
        etapa: comunique.etapa,
        final: null,
      },
      orderBy: { criado_em: 'desc' },
    });
    if (suspensao) {
      await this.prisma.suspensao_Prazo.update({
        where: { id: suspensao.id },
        data: { final: resposta },
      });
    }

    const graproem = comunique.inicial.tipo_processo === 2;
    await this.prisma.inicial.update({
      where: { id: comunique.inicial_id },
      data: {
        substatus_analise: graproem
          ? SubstatusAnalise.PRE_REUNIAO_GRAPROEM
          : SubstatusAnalise.NORMAL,
      },
    });

    return atualizado;
  }

  async registrarDecisao(inicialId: number, dto: RegistrarDecisaoDto) {
    const inicial = await this.carregarProcessoAnalise(inicialId);
    const instancia = inicial.etapa_analise ?? 1;
    const graproem = inicial.tipo_processo === 2 ? 1 : 0;

    if (dto.parecer === ParecerDecisao.COMUNIQUE_SE) {
      return this.registrarComuniqueSe(inicialId, {
        data: new Date(),
        complementar: false,
      });
    }

    if (
      (inicial.substatus_analise ?? 0) === SubstatusAnalise.AGUARDANDO_RECURSO
    ) {
      throw new BadRequestException(
        'Registre o recurso do munícipe antes de nova decisão.',
      );
    }

    if (inicial.tipo_processo === 2) {
      const reuniao =
        inicial.reunioes.find((r) => r.instancia === instancia) ?? null;
      if (!this.reuniaoCompleta(reuniao)) {
        throw new BadRequestException(
          'Preencha data, número e parecer da pré-reunião GRAPROEM.',
        );
      }
    }

    const decisaoId = await this.idDecisaoInstancia(inicialId, instancia);
    await this.prisma.decisao.update({
      where: { id: decisaoId },
      data: {
        parecer: dto.parecer,
        obs: dto.obs,
        publicacao_parecer: new Date(),
        graproem,
      },
    });

    if (dto.parecer === ParecerDecisao.DEFERIDO) {
      await this.prisma.inicial.update({
        where: { id: inicialId },
        data: {
          status: 3,
          substatus_analise: SubstatusAnalise.NORMAL,
        },
      });
      return {
        resultado: 'DEFERIDO',
        mensagem:
          'Processo deferido na instância. Prossiga para a fase de finalização.',
        proxima_acao: 'FINALIZACAO',
      };
    }

    if (dto.parecer === ParecerDecisao.INDEFERIDO) {
      if (instancia >= MAX_INSTANCIA_ANALISE) {
        await this.prisma.inicial.update({
          where: { id: inicialId },
          data: {
            status: 4,
            substatus_analise: SubstatusAnalise.NORMAL,
          },
        });
        return {
          resultado: 'INDEFERIDO_DEFINITIVO',
          mensagem: 'Indeferimento na 3ª instância. Processo encerrado.',
        };
      }

      await this.prisma.inicial.update({
        where: { id: inicialId },
        data: { substatus_analise: SubstatusAnalise.AGUARDANDO_RECURSO },
      });
      return {
        resultado: 'INDEFERIDO',
        mensagem:
          'Processo indeferido nesta instância. Aguardando recurso do munícipe.',
        proxima_acao: 'RECURSO',
        instancia,
      };
    }

    throw new BadRequestException('Parecer inválido.');
  }

  async registrarRecurso(inicialId: number) {
    const inicial = await this.carregarProcessoAnalise(inicialId);
    const instanciaAtual = inicial.etapa_analise ?? 1;

    if (
      (inicial.substatus_analise ?? 0) !==
      SubstatusAnalise.AGUARDANDO_RECURSO
    ) {
      throw new BadRequestException(
        'O processo não está aguardando recurso.',
      );
    }
    if (instanciaAtual >= MAX_INSTANCIA_ANALISE) {
      throw new BadRequestException(
        'Não há mais instâncias disponíveis para recurso.',
      );
    }

    const novaInstancia = instanciaAtual + 1;
    const graproem = inicial.tipo_processo === 2 ? 1 : 0;
    const substatus =
      graproem === 1
        ? SubstatusAnalise.PRE_REUNIAO_GRAPROEM
        : SubstatusAnalise.NORMAL;

    await this.prisma.inicial.update({
      where: { id: inicialId },
      data: {
        etapa_analise: novaInstancia,
        substatus_analise: substatus,
      },
    });

    await this.prisma.decisao.create({
      data: {
        inicial_id: inicialId,
        instancia: novaInstancia,
        etapa: 2,
        graproem,
        parecer: ParecerDecisao.PENDENTE,
      },
    });

    if (graproem === 1 && inicial.envio_admissibilidade) {
      const alvara = inicial.alvara_tipo;
      const base = new Date(inicial.envio_admissibilidade);
      const duracao = this.prazoInstancia(2, novaInstancia, alvara);
      const finalPlanejado = new Date(base);
      finalPlanejado.setDate(finalPlanejado.getDate() + duracao);
      await this.prisma.controle_Prazo.create({
        data: {
          inicial_id: inicialId,
          data_inicio: new Date(),
          final_planejado: finalPlanejado,
          duracao_planejada: duracao,
          etapa: 2,
          graproem: 1,
          status: 0,
        },
      });
      await this.provisionarReuniaoGraproem(inicialId, novaInstancia);
    }

    return {
      etapa_analise: novaInstancia,
      substatus_analise: substatus,
      mensagem: graproem
        ? 'Recurso registrado. Atualize os dados da pré-reunião GRAPROEM.'
        : 'Recurso registrado. O processo retornou à análise técnica.',
    };
  }

  async encerrarSemRecurso(inicialId: number) {
    const inicial = await this.carregarProcessoAnalise(inicialId);
    if (
      (inicial.substatus_analise ?? 0) !==
      SubstatusAnalise.AGUARDANDO_RECURSO
    ) {
      throw new BadRequestException(
        'O processo não está aguardando recurso.',
      );
    }

    await this.prisma.inicial.update({
      where: { id: inicialId },
      data: { status: 4, substatus_analise: SubstatusAnalise.NORMAL },
    });

    return {
      mensagem:
        'Prazo de recurso encerrado sem manifestação. Processo indeferido.',
    };
  }
}
