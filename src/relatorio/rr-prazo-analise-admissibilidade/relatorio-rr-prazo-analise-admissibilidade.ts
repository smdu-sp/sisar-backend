import { Injectable } from "@nestjs/common"
import { PeriodFilterDto } from "../relatorio-ar-quantitativo/dto/response-relatorio.dto"
import { PrismaService } from "src/prisma/prisma.service"
import {
  IPrazoAnaliseAdmissibilidadeDto,
  IRelatorioPrazoAnaliseAdmissibilidadePorAnoDto,
  IRelatorioPrazoAnaliseAdmissibilidadeCabecalhoDto,
  IRelatorioPrazoAnaliseAdmissibilidadeCompletoDto
} from "./dto/prazo-analise-admissibilidade"
import { ERROR_MESSAGES } from "./constants/error-messages"
import { HttpException, HttpStatus } from "@nestjs/common"
import { formatadorDeDatas } from "src/utils/date.utils"

@Injectable()
export class RrPrazoAnaliseAdmissibilidadeService {
  constructor(private prisma: PrismaService) { }

  async getDataPorPeriodo(periodFilterDto: PeriodFilterDto) {
    try {
      const iniciais = this.prisma.inicial.findMany({
        where: {
          data_protocolo: {
            gte: periodFilterDto.gte,
            lte: periodFilterDto.lte,
          },
        },
      })
      const orderIniciais = (await iniciais).sort((a, b) => new Date(b.criado_em).getTime() - new Date(a.criado_em).getTime())
      return orderIniciais
    } catch (error) {
      throw new HttpException({
        api_mensagem: ERROR_MESSAGES.FALHA_GET_INICIAIS_POR_PERIODO,
        tipo_erro: error.name,
        detalhe_tecnico: error.message,
      }, HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }

  async includeReconsideracaoESuspensaoData(
    lista: IPrazoAnaliseAdmissibilidadeDto[],
  ): Promise<IPrazoAnaliseAdmissibilidadeDto[]> {
    try {
      const listaIncrementada = await Promise.all(
        lista.map(async (inicial) => {
          const inicialHasDataInReconsideracao = await this.prisma.reconsideracao_Admissibilidade.findUnique({
            where: {
              inicial_id: inicial.id,
            },
          })

          const inicialHasDataInSuspensao = await this.prisma.suspensao_Prazo.findMany({
            where: {
              inicial_id: inicial.id,
            },
          })

          if (inicial.requalifica_rapido && inicialHasDataInReconsideracao) {
            inicial.data_requalificacao = inicialHasDataInReconsideracao.publicacao
          } else {
            inicial.data_requalificacao = null
          }

          if (inicialHasDataInSuspensao && inicialHasDataInSuspensao.length > 0) {
            // Ordena as suspensões por data de início
            const ordenadas = inicialHasDataInSuspensao
              .filter((s) => s.inicial_id === inicial.id && s.inicio && s.final)
              .sort((a, b) => new Date(a.inicio).getTime() - new Date(b.inicio).getTime())

            // Soma os dias de cada suspensão (todas as etapas)
            const totalDiasSuspensao = ordenadas.reduce((acc, suspensao) => {
              try {
                const inicio = new Date(suspensao.inicio)
                const final = new Date(suspensao.final)
                const dias = (final.getTime() - inicio.getTime()) / (1000 * 60 * 60 * 24)
                return acc + dias
              } catch (error) {
                console.error(ERROR_MESSAGES.FALHA_CALCULAR_DIAS_SUSPENSAO(inicial.id), error);
                return acc
              }
            }, 0)

            // Filtra suspensões por etapa 1 e etapa 2
            const suspensoesEtapa1 = ordenadas.filter((s) => s.etapa === 1)
            const suspensoesEtapa2 = ordenadas.filter((s) => s.etapa === 2)

            // Calcula dias de suspensão para etapa 1
            let totalDiasSuspensaoEtapa1 = 0
            if (suspensoesEtapa1.length === 1) {
              const inicio = new Date(suspensoesEtapa1[0].inicio)
              const final = new Date(suspensoesEtapa1[0].final)
              totalDiasSuspensaoEtapa1 = (final.getTime() - inicio.getTime()) / (1000 * 60 * 60 * 24)
            } else if (suspensoesEtapa1.length > 1) {
              totalDiasSuspensaoEtapa1 = suspensoesEtapa1.reduce((acc, suspensao) => {
                try {
                  const inicio = new Date(suspensao.inicio)
                  const final = new Date(suspensao.final)
                  const dias = (final.getTime() - inicio.getTime()) / (1000 * 60 * 60 * 24)
                  return acc + dias
                } catch (error) {
                  console.error(ERROR_MESSAGES.FALHA_CALCULAR_DIAS_SUSPENSAO(inicial.id), error);
                  return acc
                }
              }, 0)
            }

            // Calcula dias de suspensão para etapa 2
            let totalDiasSuspensaoEtapa2 = 0
            if (suspensoesEtapa2.length === 1) {
              const inicio = new Date(suspensoesEtapa2[0].inicio)
              const final = new Date(suspensoesEtapa2[0].final)
              totalDiasSuspensaoEtapa2 = (final.getTime() - inicio.getTime()) / (1000 * 60 * 60 * 24)
            } else if (suspensoesEtapa2.length > 1) {
              totalDiasSuspensaoEtapa2 = suspensoesEtapa2.reduce((acc, suspensao) => {
                try {
                  const inicio = new Date(suspensao.inicio)
                  const final = new Date(suspensao.final)
                  const dias = (final.getTime() - inicio.getTime()) / (1000 * 60 * 60 * 24)
                  return acc + dias
                } catch (error) {
                  console.error(ERROR_MESSAGES.FALHA_CALCULAR_DIAS_SUSPENSAO(inicial.id), error);
                  return acc
                }
              }, 0)
            }

            inicial.suspensao_prazo = Math.round(totalDiasSuspensao)
            inicial.suspensao_prazo_etapa_1 = Math.round(totalDiasSuspensaoEtapa1)
            inicial.suspensao_prazo_etapa_2 = Math.round(totalDiasSuspensaoEtapa2)

            const motivosParaSuspensao = []

            for (const suspensao of ordenadas) {
              const motivo = await this.prisma.motivo_Inadmissao.findUnique({
                where: {
                  id: suspensao.motivo.toString(),
                },
              })
              if (motivo) motivosParaSuspensao.push(motivo.descricao)
            }

            inicial.motivos_suspensao = motivosParaSuspensao
          } else {
            inicial.suspensao_prazo = null
            inicial.suspensao_prazo_etapa_1 = null
            inicial.suspensao_prazo_etapa_2 = null
          }

          return inicial
        }),
      )

      return listaIncrementada
    } catch (error) {
      const objectError = {
        api_mensagem: ERROR_MESSAGES.FALHA_INCLUIR_SUSPENSAO_RECONSIDERACAO,
        tipo_erro: error.name,
        detalhe_tecnico: error.message,
      }
      throw new HttpException(objectError, HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }

  async includePrazoDeAdmissibilidade(
    lista: IPrazoAnaliseAdmissibilidadeDto[],
  ): Promise<IPrazoAnaliseAdmissibilidadeDto[]> {
    try {
      const listaComTempoDeAnalise = await Promise.all(
        lista.map(async (inicial) => {
          try {
            const admissibilidade = await this.prisma.admissibilidade.findUnique({
              where: {
                inicial_id: inicial.id,
              },
            })

            if (!admissibilidade) {
              console.error(ERROR_MESSAGES.FALHA_ENCONTRAR_ADMISSIBILIDADE(inicial.id));
              inicial.tempo_de_analise_admissibilidade = null
              inicial.tempo_de_analise_reconsideracao = null
              return inicial
            }

            if (!inicial.requalifica_rapido && admissibilidade) {
              const envio = new Date(admissibilidade.data_envio)
              const decisao = new Date(admissibilidade.data_decisao_interlocutoria)
              const tempoDeAnalise = (decisao.getTime() - envio.getTime()) / (1000 * 60 * 60 * 24)

              inicial.tempo_de_analise_admissibilidade = tempoDeAnalise < 1 ? 1 : tempoDeAnalise
              inicial.tempo_de_analise_reconsideracao = null
            }

            if (inicial.requalifica_rapido) {
              const reconsideracaoAdmissibilidade = await this.prisma.reconsideracao_Admissibilidade.findUnique({
                where: {
                  inicial_id: inicial.id,
                },
              })

              if (reconsideracaoAdmissibilidade) {
                const envio = new Date(reconsideracaoAdmissibilidade.publicacao)
                const decisao = new Date(reconsideracaoAdmissibilidade.pedido_reconsideracao)
                const tempoDeAnalise = (decisao.getTime() - envio.getTime()) / (1000 * 60 * 60 * 24)

                if (tempoDeAnalise < 1 && reconsideracaoAdmissibilidade.parecer) {
                  inicial.tempo_de_analise_reconsideracao = 1
                }

                if (reconsideracaoAdmissibilidade.parecer) {
                  inicial.tempo_de_analise_reconsideracao = tempoDeAnalise
                  inicial.tempo_de_analise_admissibilidade = null
                } else {
                  inicial.tempo_de_analise_reconsideracao = null
                  inicial.tempo_de_analise_admissibilidade = null
                }
              }
            }

            return inicial
          } catch (error) {
            console.error(ERROR_MESSAGES.FALHA_INICIAL_INDEX(inicial.id), error);
            return inicial
          }
        }),
      )

      return listaComTempoDeAnalise
    } catch (error) {
      const objectError = {
        api_mensagem: ERROR_MESSAGES.FALHA_INCLUIR_TEMPO_ANALISE,
        tipo_erro: error.name,
        detalhe_tecnico: error.message,
      }
      throw new HttpException(objectError, HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }

  async formatadorDeCamposDate(lista: IPrazoAnaliseAdmissibilidadeDto[]): Promise<IPrazoAnaliseAdmissibilidadeDto[]> {
    try {
      const listaFormatada = lista.map((inicial) => {
        const formatarDataBrasileira = (data: any): string | null => {
          if (!data) return null;

          try {
            const dataObj = new Date(data);
            if (isNaN(dataObj.getTime())) return null;

            const dia = dataObj.getDate().toString().padStart(2, '0');
            const mes = (dataObj.getMonth() + 1).toString().padStart(2, '0');
            const ano = dataObj.getFullYear().toString();

            return `${dia}/${mes}/${ano}`;
          } catch (error) {
            console.error(`Erro ao formatar data para inicial ${inicial.id}:`, error);
            return null;
          }
        };

        const obterNomeMes = (data: any): string | null => {
          if (!data) return null;

          try {
            const dataObj = new Date(data);
            if (isNaN(dataObj.getTime())) return null;

            return dataObj.toLocaleDateString("pt-BR", { month: "long" });
          } catch (error) {
            console.error(`Erro ao obter nome do mês para inicial ${inicial.id}:`, error);
            return null;
          }
        };

        const obterAno = (data: any): string | null => {
          if (!data) return null;

          try {
            const dataObj = new Date(data);
            if (isNaN(dataObj.getTime())) return null;

            return dataObj.getFullYear().toString();
          } catch (error) {
            console.error(`Erro ao obter ano para inicial ${inicial.id}:`, error);
            return null;
          }
        };

        return {
          ...inicial,
          data_protocolo: formatarDataBrasileira(inicial.data_protocolo),
          criado_em: formatarDataBrasileira(inicial.criado_em),
          envio_admissibilidade: formatarDataBrasileira(inicial.envio_admissibilidade),
          data_limiteSmul: formatarDataBrasileira(inicial.data_limiteSmul),
          data_limiteMulti: formatarDataBrasileira(inicial.data_limiteMulti),
          alterado_em: formatarDataBrasileira(inicial.alterado_em),
          data_requalificacao: formatarDataBrasileira(inicial.data_requalificacao),
          ano: obterAno(inicial.criado_em),
          mes: obterNomeMes(inicial.criado_em)
        };
      });

      return listaFormatada;
    } catch (error) {
      throw new HttpException({
        api_mensagem: 'Falha ao formatar campos de data',
        tipo_erro: error.name,
        detalhe_tecnico: error.message,
      }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async includeQtdProcessosAdmissibilidadeStatus(cabecalho: IRelatorioPrazoAnaliseAdmissibilidadeCabecalhoDto, lista: IPrazoAnaliseAdmissibilidadeDto[]) {
    try {

      const listaForaDoPrazo = []
      const listaNoPrazo = lista.filter(async inicial => {
        if (inicial.tempo_de_analise_admissibilidade | inicial.tempo_de_analise_reconsideracao) {

          const listaPrazoAnaliseInicial = await this.prisma.controle_Prazo.findMany({
            where: {
              inicial_id: Number(inicial.id)
            }
          })

          const prazoAnaliseInicial = listaPrazoAnaliseInicial.reduce((acc, controle) => {
            return acc + controle.duracao_planejada
          }, 0)

          let prazoAnalise = listaPrazoAnaliseInicial.length > 0 ? prazoAnaliseInicial : 0
          let prazoReconsideracao = 0

          inicial.tempo_de_analise_admissibilidade ? prazoAnalise = inicial.tempo_de_analise_admissibilidade : prazoAnalise = 0
          inicial.tempo_de_analise_reconsideracao ? prazoReconsideracao = inicial.tempo_de_analise_reconsideracao : prazoReconsideracao = 0

          const prazoTotal = prazoAnalise + prazoReconsideracao

          if (prazoTotal <= 15) {
            return true
          } else {
            listaForaDoPrazo.push(inicial)
            return false
          }
        }
      })

      cabecalho.qtdAnaliseNoPrazo = listaNoPrazo.length.toString();
      cabecalho.qtdAnaliseExcedido = listaForaDoPrazo.length.toString();
      return cabecalho;
    } catch (error) {
      throw new HttpException({
        api_mensagem: 'Falha ao incluir quantidade de processos no cabeçalho',
        tipo_erro: error.name,
        detalhe_tecnico: error.message,
      }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async includeMedianaPrazoAdmissibilidade(cabecalho: IRelatorioPrazoAnaliseAdmissibilidadeCabecalhoDto, lista: IPrazoAnaliseAdmissibilidadeDto[]) {
    try {
      const totalDiasAnalise = lista.reduce((acc, inicial) => {
        return acc + (inicial.tempo_de_analise_admissibilidade || 0);
      }, 0)
      const mediana = totalDiasAnalise / lista.length;
      cabecalho.mediaPeriodoAnalise = mediana.toFixed(2);
      return cabecalho;
    } catch (error) {
      throw new HttpException({
        api_mensagem: 'Falha ao incluir mediana de prazo de admissibilidade no cabeçalho',
        tipo_erro: error.name,
        detalhe_tecnico: error.message,
      }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async includeAdmissibilidadesFinalizadas(cabecalho: IRelatorioPrazoAnaliseAdmissibilidadeCabecalhoDto, lista: IPrazoAnaliseAdmissibilidadeDto[]) {
    try {
      const listaFinalizadas = lista.filter(item => item.status === 1);
      cabecalho.qtdAnaliseFinalizada = listaFinalizadas.length.toString();
      return cabecalho
    } catch (error) {
      throw new HttpException({
        api_mensagem: 'Falha ao incluir quantidade de admissibilidades finalizadas no cabeçalho',
        tipo_erro: error.name,
        detalhe_tecnico: error.message,
      }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async getPrazoAnaliseAdmissibilidade(data_inicio?: string, data_fim?: string): Promise<IRelatorioPrazoAnaliseAdmissibilidadeCompletoDto> {
    const listaData = await this.getDataPorPeriodo({
      gte: new Date(data_inicio),
      lte: new Date(data_fim),
    })

    const listaIncrementada = await this.includeReconsideracaoESuspensaoData(listaData)

    const listaComPrazosDeAdmissibilidades = await this.includePrazoDeAdmissibilidade(listaIncrementada)
    const listaComDatasFormatadas = await this.formatadorDeCamposDate(listaComPrazosDeAdmissibilidades)

    const cabecalho: IRelatorioPrazoAnaliseAdmissibilidadeCabecalhoDto = {
      dataInicio: data_inicio,
      dataFim: data_fim,
      prazoFixoAnalise: '15 dias',
    }

    const cabecalhoComQtdProcessos = await this.includeQtdProcessosAdmissibilidadeStatus(cabecalho, listaComDatasFormatadas)
    const cabecalhoComMediaDeDias = await this.includeMedianaPrazoAdmissibilidade(cabecalhoComQtdProcessos, listaComDatasFormatadas)
    const cabecalhoComAdmissibilidadesFinalizadas = await this.includeAdmissibilidadesFinalizadas(cabecalhoComMediaDeDias, listaComDatasFormatadas)

    const relatorioCompleto: IRelatorioPrazoAnaliseAdmissibilidadeCompletoDto = {
      cabecalho: cabecalhoComAdmissibilidadesFinalizadas,
      dados: listaComDatasFormatadas,
    }

    return relatorioCompleto
  }
}
