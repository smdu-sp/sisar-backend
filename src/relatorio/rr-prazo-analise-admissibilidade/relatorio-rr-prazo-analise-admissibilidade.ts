import { Injectable } from "@nestjs/common"
import type { PeriodFilterDto } from "../relatorio-ar-quantitativo/dto/response-relatorio.dto"
import type { PrismaService } from "src/prisma/prisma.service"
import type {
  IPrazoAnaliseAdmissibilidadeDto,
  IRelatorioPrazoAnaliseAdmissibilidadePorAnoDto,
} from "./dto/prazo-analise-admissibilidade"

@Injectable()
export class RrPrazoAnaliseAdmissibilidadeService {
  constructor(private prisma: PrismaService) {}

  async getDataPorPeriodo(periodFilterDto: PeriodFilterDto) {
    const iniciais = this.prisma.inicial.findMany({
      where: {
        data_protocolo: {
          gte: periodFilterDto.gte,
          lte: periodFilterDto.lte,
        },
      },
    })

    return iniciais
  }

  async groupByDataYear(lista: IPrazoAnaliseAdmissibilidadeDto[], periodFilter: PeriodFilterDto) {
    const objetoDeRetorno = {}

    for (let ano = periodFilter.gte.getFullYear(); ano <= periodFilter.lte.getFullYear(); ano++) {
      objetoDeRetorno[ano] = []
    }

    for (const ano of Object.keys(objetoDeRetorno)) {
      lista.map((inicial) => {
        const anoData = Number(new Date(inicial.criado_em).getFullYear())
        if (Number(ano) == anoData) {
          objetoDeRetorno[ano].push(inicial)
        }
      })
    }

    return objetoDeRetorno
  }

  async groupByDataMonth(
    relatorioAnual: IRelatorioPrazoAnaliseAdmissibilidadePorAnoDto,
    periodFilter: PeriodFilterDto,
  ) {
    const listaDeMeses = new Array(12).fill(0).map((_, index) => index + 1)
    const relatorioEditado: Record<string, Record<string, IPrazoAnaliseAdmissibilidadeDto[]>> = {}

    for (let ano = periodFilter.gte.getFullYear(); ano <= periodFilter.lte.getFullYear(); ano++) {
      relatorioEditado[ano] = {}
      for (let i = 0; i < listaDeMeses.length; i++) {
        const mes = new Date(`${ano}-${String(listaDeMeses[i]).padStart(2, "0")}-01`).toLocaleDateString("pt-BR", {
          month: "short",
        })
        relatorioEditado[ano][mes] = []
      }
    }

    for (const [ano, listaPorAno] of Object.entries(relatorioAnual)) {
      for (const inicial of listaPorAno) {
        const data = new Date(inicial.criado_em)
        const mes = data.toLocaleDateString("pt-BR", { month: "short" })
        if (relatorioEditado[ano] && relatorioEditado[ano][mes]) {
          relatorioEditado[ano][mes].push(inicial)
        }
      }
    }

    return relatorioEditado
  }

  async includeReconsideracaoESuspensaoData(
    lista: IPrazoAnaliseAdmissibilidadeDto[],
  ): Promise<IPrazoAnaliseAdmissibilidadeDto[]> {
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
            const inicio = new Date(suspensao.inicio)
            const final = new Date(suspensao.final)
            const dias = (final.getTime() - inicio.getTime()) / (1000 * 60 * 60 * 24)
            return acc + dias
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
              const inicio = new Date(suspensao.inicio)
              const final = new Date(suspensao.final)
              const dias = (final.getTime() - inicio.getTime()) / (1000 * 60 * 60 * 24)
              return acc + dias
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
              const inicio = new Date(suspensao.inicio)
              const final = new Date(suspensao.final)
              const dias = (final.getTime() - inicio.getTime()) / (1000 * 60 * 60 * 24)
              return acc + dias
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
  }

  async includePrazoDeAdmissibilidade(
    lista: IPrazoAnaliseAdmissibilidadeDto[],
  ): Promise<IPrazoAnaliseAdmissibilidadeDto[]> {
    const listaComTempoDeAnalise = await Promise.all(
      lista.map(async (inicial) => {
        const admissibilidade = await this.prisma.admissibilidade.findUnique({
          where: {
            inicial_id: inicial.id,
          },
        })

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
      }),
    )

    return listaComTempoDeAnalise
  }

  async getPrazoAnaliseAdmissibilidade(data_inicio?: string, data_fim?: string) {
    const listaData = await this.getDataPorPeriodo({
      gte: new Date(data_inicio),
      lte: new Date(data_fim),
    })

    const listaIncrementada = await this.includeReconsideracaoESuspensaoData(listaData)

    const listaComPrazosDeAdmissibilidades = await this.includePrazoDeAdmissibilidade(listaIncrementada)

    const listaDataPorAno = await this.groupByDataYear(listaComPrazosDeAdmissibilidades, {
      gte: new Date(data_inicio),
      lte: new Date(data_fim),
    })

    const listaDataPorMes = await this.groupByDataMonth(listaDataPorAno, {
      gte: new Date(data_inicio),
      lte: new Date(data_fim),
    })

    return listaDataPorMes
  }
}
