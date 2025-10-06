import { HttpStatus, HttpException, Injectable } from "@nestjs/common";
import { PeriodFilterDto } from "../relatorio-ar-quantitativo/dto/response-relatorio.dto";
import { PrismaService } from "src/prisma/prisma.service";
import { IPrazoAnaliseAdmissibilidadeDto, IRelatorioPrazoAnaliseAdmissibilidadePorAnoDto } from "./dto/prazo-analise-admissibilidade";
import { ERROR_MESSAGES } from "./constants/error-messages";

@Injectable()
export class ArPrazoAnaliseAdmissibilidadeService {
    constructor(private prisma: PrismaService) { }

    /**
     * Converte uma string de data no formato DD-MM-YYYY ou YYYY-MM-DD para um objeto Date válido
     * @param dateString String da data nos formatos DD-MM-YYYY, YYYY-MM-DD ou ISO
     * @returns Objeto Date válido
     */
    private parseDate(dateString: string): Date {
        if (!dateString) {
            throw new Error('Data não fornecida');
        }

        // Verifica se é uma data no formato DD-MM-YYYY
        const ddmmyyyyPattern = /^(\d{2})-(\d{2})-(\d{4})$/;
        const ddmmyyyyMatch = dateString.match(ddmmyyyyPattern);

        if (ddmmyyyyMatch) {
            const [, day, month, year] = ddmmyyyyMatch;
            // Converte para YYYY-MM-DD
            const isoString = `${year}-${month}-${day}`;
            const date = new Date(isoString);

            if (isNaN(date.getTime())) {
                throw new Error(`Data inválida: ${dateString}`);
            }

            return date;
        }

        // Tenta converter diretamente (para formatos ISO ou YYYY-MM-DD)
        const date = new Date(dateString);

        if (isNaN(date.getTime())) {
            throw new Error(`Formato de data não suportado: ${dateString}`);
        }

        return date;
    }

    async getDataPorPeriodo(periodFilterDto: PeriodFilterDto) {
        try {
            const iniciais = this.prisma.inicial.findMany({
                where: {
                    data_protocolo: {
                        gte: periodFilterDto.gte,
                        lte: periodFilterDto.lte
                    }
                }
            })

            if (iniciais === null || iniciais === undefined) {
                throw new Error(ERROR_MESSAGES.FALHA_LISTA_NULA);
            }

            return iniciais;
        } catch (error) {
            const objectError = {
                api_mensagem: ERROR_MESSAGES.FALHA_GET_DATA_POR_PERIODO,
                tipo_erro: error.name,
                detalhe_tecnico: error.message,
            };
            throw new HttpException(
                objectError,
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }

    async groupByDataYear(lista: IPrazoAnaliseAdmissibilidadeDto[], periodFilter: PeriodFilterDto) {
        try {
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
        } catch (error) {
            const objectError = {
                api_mensagem: ERROR_MESSAGES.FALHA_AGRUPAR_POR_ANO,
                tipo_erro: error.name,
                detalhe_tecnico: error.message,
            };
            throw new HttpException(
                objectError,
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }

    async groupByDataMonth(relatorioAnual: IRelatorioPrazoAnaliseAdmissibilidadePorAnoDto, periodFilter: PeriodFilterDto) {
        try {
            const listaDeMeses = new Array(12).fill(0).map((_, index) => index + 1);
            const relatorioEditado: Record<string, Record<string, IPrazoAnaliseAdmissibilidadeDto[]>> = {};

            for (let ano = periodFilter.gte.getFullYear(); ano <= periodFilter.lte.getFullYear(); ano++) {
                relatorioEditado[ano] = {};
                try {
                    for (let i = 0; i < listaDeMeses.length; i++) {
                        const mes = new Date(`${ano}-${String(listaDeMeses[i]).padStart(2, '0')}-01`).toLocaleDateString('pt-BR', { month: 'short' });
                        relatorioEditado[ano][mes] = [];
                    }
                } catch (error) {
                    throw new Error(ERROR_MESSAGES.FALHA_CONSTRUIR_CHAVES_COM_MESES);
                }
            }

            for (const [ano, listaPorAno] of Object.entries(relatorioAnual)) {
                for (const inicial of listaPorAno) {
                    try {
                        const data = new Date(inicial.criado_em);
                        const mes = data.toLocaleDateString('pt-BR', { month: 'short' });
                        if (relatorioEditado[ano] && relatorioEditado[ano][mes]) {
                            relatorioEditado[ano][mes].push(inicial);
                        }
                    } catch (error) {
                        throw new Error(ERROR_MESSAGES.FALHA_ORDENAR_INICIAIS_POR_MES);
                    }
                }
            }

            return relatorioEditado;
        } catch (error) {
            const objectError = {
                api_mensagem: ERROR_MESSAGES.FALHA_AGRUPAR_POR_MES,
                tipo_erro: error.name,
                detalhe_tecnico: error.message,
            };
            throw new HttpException(
                objectError,
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }

    async includeReconsideracaoESuspensaoData(lista: IPrazoAnaliseAdmissibilidadeDto[]): Promise<IPrazoAnaliseAdmissibilidadeDto[]> {
        try {
            const listaIncrementada = await Promise.all(lista.map(async (inicial) => {

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
                } else {
                    inicial.data_requalificacao = null;
                }

                if (inicialHasDataInSuspensao && inicialHasDataInSuspensao.length > 0) {
                    // Ordena as suspensões por data de início
                    const ordenadas = inicialHasDataInSuspensao
                        .filter(s => s.inicial_id === inicial.id && s.inicio && s.final)
                        .sort((a, b) => new Date(a.inicio).getTime() - new Date(b.inicio).getTime());

                    // Soma os dias de cada suspensão (todas as etapas)
                    const totalDiasSuspensao = ordenadas.reduce((acc, suspensao) => {
                        try {
                            const inicio = new Date(suspensao.inicio);
                            const final = new Date(suspensao.final);
                            const dias = (final.getTime() - inicio.getTime()) / (1000 * 60 * 60 * 24);
                            return acc + dias;
                        } catch (error) {
                            console.error(ERROR_MESSAGES.FALHA_CALCULO_DIAS_SUSPENSAO_TOTAL(suspensao.inicial_id), error);
                            return acc;
                        }
                    }, 0);

                    // Filtra suspensões por etapa 1 e etapa 2
                    const suspensoesEtapa1 = ordenadas.filter(s => s.etapa === 1);
                    const suspensoesEtapa2 = ordenadas.filter(s => s.etapa === 2);

                    // Calcula dias de suspensão para etapa 1
                    let totalDiasSuspensaoEtapa1 = 0;
                    if (suspensoesEtapa1.length === 1) {
                        const inicio = new Date(suspensoesEtapa1[0].inicio);
                        const final = new Date(suspensoesEtapa1[0].final);
                        totalDiasSuspensaoEtapa1 = (final.getTime() - inicio.getTime()) / (1000 * 60 * 60 * 24);
                    } else if (suspensoesEtapa1.length > 1) {
                        totalDiasSuspensaoEtapa1 = suspensoesEtapa1.reduce((acc, suspensao) => {
                            try {
                                const inicio = new Date(suspensao.inicio);
                                const final = new Date(suspensao.final);
                                const dias = (final.getTime() - inicio.getTime()) / (1000 * 60 * 60 * 24);
                                return acc + dias;
                            } catch (error) {
                                console.error(ERROR_MESSAGES.FALHA_CALCULO_DIAS_SUSPENSAO_1(suspensao.inicial_id), error);
                                return acc;
                            }
                        }, 0);
                    }

                    // Calcula dias de suspensão para etapa 2
                    let totalDiasSuspensaoEtapa2 = 0;
                    if (suspensoesEtapa2.length === 1) {
                        const inicio = new Date(suspensoesEtapa2[0].inicio);
                        const final = new Date(suspensoesEtapa2[0].final);
                        totalDiasSuspensaoEtapa2 = (final.getTime() - inicio.getTime()) / (1000 * 60 * 60 * 24);
                    } else if (suspensoesEtapa2.length > 1) {
                        totalDiasSuspensaoEtapa2 = suspensoesEtapa2.reduce((acc, suspensao) => {
                            try {
                                const inicio = new Date(suspensao.inicio);
                                const final = new Date(suspensao.final);
                                const dias = (final.getTime() - inicio.getTime()) / (1000 * 60 * 60 * 24);
                                return acc + dias;
                            } catch (error) {
                                console.error(ERROR_MESSAGES.FALHA_CALCULO_DIAS_SUSPENSAO_2(suspensao.inicial_id), error);
                                return acc;
                            }
                        }, 0);
                    }

                    inicial.suspensao_prazo = Math.round(totalDiasSuspensao);
                    inicial.suspensao_prazo_etapa_1 = Math.round(totalDiasSuspensaoEtapa1);
                    inicial.suspensao_prazo_etapa_2 = Math.round(totalDiasSuspensaoEtapa2);

                    const motivosParaSuspensao = []

                    for (const suspensao of ordenadas) {
                        const motivo = await this.prisma.motivo_Inadmissao.findUnique({
                            where: {
                                id: suspensao.motivo.toString()
                            }
                        })
                        if (motivo) motivosParaSuspensao.push(motivo.descricao)
                    }

                    inicial.motivos_suspensao = motivosParaSuspensao;
                } else {
                    inicial.suspensao_prazo = null;
                    inicial.suspensao_prazo_etapa_1 = null;
                    inicial.suspensao_prazo_etapa_2 = null;
                }

                return inicial;
            }));

            if (listaIncrementada === null || listaIncrementada === undefined) {
                throw new Error(ERROR_MESSAGES.FALHA_LISTA_NULA);
            }

            return listaIncrementada;
        } catch (error) {
            const objectError = {
                api_mensagem: ERROR_MESSAGES.FALHA_AO_INCLUIR_SUSPENSAO_E_RECONSIDERACAO,
                tipo_erro: error.name,
            };

            throw new HttpException(
                objectError,
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }

    async includePrazoDeAdmissibilidade(lista: IPrazoAnaliseAdmissibilidadeDto[]): Promise<IPrazoAnaliseAdmissibilidadeDto[]> {
        try {
            const listaComTempoDeAnalise = await Promise.all(lista.map(async (inicial) => {
                try {
                    const admissibilidade = await this.prisma.admissibilidade.findUnique({
                        where: {
                            inicial_id: inicial.id
                        }
                    });

                    if (!admissibilidade) {
                        console.error(ERROR_MESSAGES.FALHA_ENCONTRAR_ADMISSIBILIDADE(inicial.id));
                        return inicial; // Retorna a inicial sem modificar os prazos
                    }

                    if (!inicial.requalifica_rapido && admissibilidade) {
                        const envio = new Date(admissibilidade.data_envio);
                        const decisao = new Date(admissibilidade.data_decisao_interlocutoria);
                        const tempoDeAnalise = (decisao.getTime() - envio.getTime()) / (1000 * 60 * 60 * 24);

                        inicial.tempo_de_analise_admissibilidade = tempoDeAnalise < 1 ? 1 : tempoDeAnalise;
                        inicial.tempo_de_analise_reconsideracao = null;
                    }

                    if (inicial.requalifica_rapido) {
                        const reconsideracaoAdmissibilidade = await this.prisma.reconsideracao_Admissibilidade.findUnique({
                            where: {
                                inicial_id: inicial.id
                            }
                        });

                        if (!reconsideracaoAdmissibilidade) {
                            throw new Error(ERROR_MESSAGES.FALHA_ENCONTRAR_RECONSIDERACAO(inicial.id));
                        }

                        if (reconsideracaoAdmissibilidade) {
                            const envio = new Date(reconsideracaoAdmissibilidade.publicacao);
                            const decisao = new Date(reconsideracaoAdmissibilidade.pedido_reconsideracao);
                            const tempoDeAnalise = (decisao.getTime() - envio.getTime()) / (1000 * 60 * 60 * 24);

                            if (tempoDeAnalise < 1 && reconsideracaoAdmissibilidade.parecer) {
                                inicial.tempo_de_analise_reconsideracao = 1;
                            }

                            if (reconsideracaoAdmissibilidade.parecer) {
                                inicial.tempo_de_analise_reconsideracao = tempoDeAnalise;
                                inicial.tempo_de_analise_admissibilidade = null;
                            } else {
                                inicial.tempo_de_analise_reconsideracao = null;
                                inicial.tempo_de_analise_admissibilidade = null;
                            }
                        }
                    }

                    return inicial;
                } catch (error) {

                }
            }));

            return listaComTempoDeAnalise;
        } catch (error) {
            const objectError = {
                api_mensagem: ERROR_MESSAGES.FALHA_INCLUIR_PRAZO_ADMISSIBILIDADE,
                tipo_erro: error.name,
                detalhe_tecnico: error.message,
            };

            throw new HttpException(
                objectError,
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }

    async getPrazoAnaliseAdmissibilidade(data_inicio?: string, data_fim?: string) {
        // Converte as strings de data para objetos Date válidos
        const dataInicio = this.parseDate(data_inicio);
        const dataFim = this.parseDate(data_fim);

        const listaData = await this.getDataPorPeriodo({
            gte: dataInicio,
            lte: dataFim
        });

        const listaIncrementada = await this.includeReconsideracaoESuspensaoData(listaData);

        const listaComPrazosDeAdmissibilidades = await this.includePrazoDeAdmissibilidade(listaIncrementada);

        const listaDataPorAno = await this.groupByDataYear(listaComPrazosDeAdmissibilidades, {
            gte: dataInicio,
            lte: dataFim
        })

        const listaDataPorMes = await this.groupByDataMonth(listaDataPorAno, {
            gte: dataInicio,
            lte: dataFim
        });

        return listaDataPorMes;
    }
}