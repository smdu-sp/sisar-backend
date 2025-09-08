import { HttpStatus, HttpException, Injectable } from "@nestjs/common";
import { PeriodFilterDto } from "../relatorio-ar-quantitativo/dto/response-relatorio.dto";
import { PrismaService } from "src/prisma/prisma.service";
import { IPrazoAnaliseAdmissibilidadeDto, IRelatorioPrazoAnaliseAdmissibilidadePorAnoDto } from "./dto/prazo-analise-admissibilidade";


@Injectable()
export class ArPrazoAnaliseAdmissibilidadeService {
    constructor(private prisma: PrismaService) { }

    /** --- query raw
     * 1 numero do processo  - inicial
     * 2 data do protocolo ? - inicial
     * data publicacação? - inicial
     * ----- prisma service
     * pedido de reconsideração - reconsideracoes_admissibilidade
     * data de publcacação da reconsideração - reconsideracoes_admissibilidade
     * ---lógica code
     * tempo de analise da admissibilidade - admissibilidade
     * ---prisma service
     * suspensão de prazo? - suspensoes_prazo
     * motivo de suspensão de prazo - suspensoes_prazo
     * ---lógica em code
     * quantidade de processos com analise de admissibilidade finalizada - admissibilidade
     * quantidade de processos com analise de admissibilidade no prazo - admissibilidade
     * quantidade de processos com tempo de analise de admissibilidade excedido - admissibilidade
     * quantidade de processos com analise de admissibilidade em andamento - admissibilidade
     */

    async getDataPorPeriodo(periodFilterDto: PeriodFilterDto) {
        const iniciais = this.prisma.inicial.findMany({
            where: {
                data_protocolo: {
                    gte: periodFilterDto.gte,
                    lte: periodFilterDto.lte
                }
            }
        })

        return iniciais;
    }

    async groupByDataYear(lista: IPrazoAnaliseAdmissibilidadeDto[], periodFilter: PeriodFilterDto) {
        const objetoDeRetorno = {}

        for (let ano = periodFilter.gte.getFullYear(); ano <= periodFilter.lte.getFullYear(); ano++) {
            objetoDeRetorno[ano] = []
        }

        for (const ano of Object.keys(objetoDeRetorno)) {
            lista.map((inicial) => {
                const anoData = Number(new Date(inicial.criado_em).getFullYear());
                if (Number(ano) == anoData) {
                    objetoDeRetorno[ano].push(inicial);
                }
            })
        }

        return objetoDeRetorno;
    }

    async groupByDataMonth(relatorioAnual: IRelatorioPrazoAnaliseAdmissibilidadePorAnoDto, periodFilter: PeriodFilterDto) {
        const listaDeMeses = new Array(12).fill(0).map((_, index) => index + 1);
        const relatorioEditado: Record<string, Record<string, IPrazoAnaliseAdmissibilidadeDto[]>> = {};

        for (let ano = periodFilter.gte.getFullYear(); ano <= periodFilter.lte.getFullYear(); ano++) {
            relatorioEditado[ano] = {};
            for (let i = 0; i < listaDeMeses.length; i++) {
                const mes = new Date(`${ano}-${String(listaDeMeses[i]).padStart(2, '0')}-01`).toLocaleDateString('pt-BR', { month: 'short' });
                relatorioEditado[ano][mes] = [];
            }
        }

        for (const [ano, listaPorAno] of Object.entries(relatorioAnual)) {
            for (const inicial of listaPorAno) {
                const data = new Date(inicial.criado_em);
                const mes = data.toLocaleDateString('pt-BR', { month: 'short' });
                if (relatorioEditado[ano] && relatorioEditado[ano][mes]) {
                    relatorioEditado[ano][mes].push(inicial);
                }
            }
        }

        return relatorioEditado;
    }

    async includeReconsideracaoESuspensaoData(lista: IPrazoAnaliseAdmissibilidadeDto[]) {
        const listaIcrementada = lista.map(async (inicial) => {

            const inicialHasDataInReconsideracao = await this.prisma.reconsideracao_Admissibilidade.findUnique({
                where: {
                    inicial_id: inicial.id
                }
            })

            const inicialHasDataInSuspensao = await this.prisma.suspensao_Prazo.findMany({
                where: {
                    inicial_id: inicial.id
                }
            })

            if (inicial.requalifica_rapido && inicialHasDataInReconsideracao) {
                inicial.data_requalificacao = inicialHasDataInReconsideracao.publicacao;
            }
            if (inicialHasDataInSuspensao && inicialHasDataInSuspensao.length > 0) {
                // Ordena as suspensões por data de início
                const ordenadas = inicialHasDataInSuspensao
                    .filter(s => s.inicial_id === inicial.id && s.inicio && s.final)
                    .sort((a, b) => new Date(a.inicio).getTime() - new Date(b.inicio).getTime());

                // Soma os dias de cada suspensão
                const totalDiasSuspensao = ordenadas.reduce((acc, suspensao) => {
                    const inicio = new Date(suspensao.inicio);
                    const final = new Date(suspensao.final);
                    const dias = (final.getTime() - inicio.getTime()) / (1000 * 60 * 60 * 24);
                    return acc + dias;
                }, 0);

                inicial.suspensao_prazo = totalDiasSuspensao;
            }


        })


    }


    async getPrazoAnaliseAdmissibilidade(data_inicio?: string, data_fim?: string) {
        console.log("em construção...")
        const listData = await this.getDataPorPeriodo({
            gte: new Date(data_inicio),
            lte: new Date(data_fim)
        });

        const listDataPorAno = await this.groupByDataYear(listData, {
            gte: new Date(data_inicio),
            lte: new Date(data_fim)
        })

        const listaDataPorMes = await this.groupByDataMonth(listDataPorAno, {
            gte: new Date(data_inicio),
            lte: new Date(data_fim)
        });

        return listaDataPorMes;
    }
}