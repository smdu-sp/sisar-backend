import { PrismaService } from "src/prisma/prisma.service";
import { PeriodFilterDto } from "../relatorio-ar-quantitativo/dto/response-relatorio.dto";
import { Injectable } from "@nestjs/common";
import { Inicial } from "@prisma/client";
import { HttpException, HttpStatus } from "@nestjs/common";
import { RelatorioGabinetePrefeitoDto, InicialGabinetePrefeitoDto } from "./dto/ar-gabinete-prefeito.dto";
import { ERROR_MESSAGES } from "./constants/error-messages";

@Injectable()
export class ArGabineteDoPrefeito {
    constructor(private prisma: PrismaService) { }

    async segregarIniaisPorAno(): Promise<{ ano: number; dados: Inicial[] }[]> {
        try {

            const periodoFiltro: PeriodFilterDto = {
                gte: new Date('2018-01-01'),
                lte: new Date()
            }

            const relatorio = {}

            for (let i = 2018; i <= Number(periodoFiltro.lte.getFullYear()); i++) {
                relatorio[i] = []
            }

            const todasIniciais: Inicial[] = await this.prisma.inicial.findMany({
                where: {
                    data_protocolo: periodoFiltro,
                    status: 3
                },
                orderBy: { data_protocolo: 'desc' },

            });

            const agrupamento: { [ano: number]: Inicial[] } = todasIniciais.reduce(
                (acc, inicial) => {
                    const ano = inicial.data_protocolo.getFullYear();
                    if (!acc[ano]) {
                        acc[ano] = [];
                    }
                    acc[ano].push(inicial);
                    return acc;
                },
                relatorio,
            );

            const resultado = Object.entries(agrupamento).map(([ano, dados]) => ({
                ano: Number(ano),
                dados: dados,
            }));

            return resultado;
        } catch (error) {
            const objectError = {
                api_mensagem: ERROR_MESSAGES.FALHA_DE_AGRUPAMENTO,
                detalhe_tecnico: error.message,
                tipo_erro: error.name,
            };
            throw new HttpException(
                objectError,
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }

    async getNumeroDoProcesso(inicial: InicialGabinetePrefeitoDto) {
        try {

            if (!inicial.sei && !inicial.aprova_digital && !inicial.processo_fisico) {
                throw new HttpException(
                    ERROR_MESSAGES.FALHA_ENCONTRAR_NUMERO_PROCESSO(inicial.id),
                    HttpStatus.BAD_REQUEST
                )
            }

            if (inicial.sei) {
                inicial.numero_do_processo = inicial.sei
            } else if (inicial.aprova_digital) {
                inicial.numero_do_processo = inicial.aprova_digital
            } else if (inicial.processo_fisico) {
                inicial.numero_do_processo = inicial.processo_fisico
            } else {
                throw new HttpException(
                    `a inicial de id ${inicial.id} não possui um numero SEI, aprova digital ou processo físico`,
                    HttpStatus.BAD_REQUEST
                )
            }
            return inicial
        } catch (error) {
            const objectError = {
                api_mensagem: ERROR_MESSAGES.FALHA_ENCONTRAR_NUMERO_PROCESSO(inicial.id),
                detalhe_tecnico: error.message,
                tipo_erro: error.name,
            };
            throw new HttpException(
                objectError,
                HttpStatus.INTERNAL_SERVER_ERROR
            )
        }
    }

    async segregarIniciaisPorMes(lista: { ano: number, dados: Inicial[] }[]) {
        try {

            if (!lista) {
                throw new HttpException(
                    ERROR_MESSAGES.FALHA_LISTA_VAZIA,
                    HttpStatus.BAD_REQUEST
                )
            }

            lista.forEach((obj) => {
                for (let i = 1; i <= 12; i++) {
                    const mes = String(i).padStart(2, '0');
                    obj[new Date(`2020-${mes}`).toLocaleString('pt-BR', { month: 'short' })] = []
                }
            })

            lista.forEach((obj) => {
                obj.dados.forEach(async (inicial) => {
                    const mes = inicial.data_protocolo.toLocaleString('pt-BR', { month: 'short' });
                    inicial = await this.getNumeroDoProcesso(inicial)
                    obj[mes].push(inicial);
                });
            })

            for (const processo of lista) {
                for (let inicial of processo.dados) {
                    inicial = await this.atribuirTempoDeAnalize(inicial)
                }
            }

            return lista
        } catch (error) {
            const objectError = {
                api_mensagem: ERROR_MESSAGES.FALHA_SEGREGAR_POR_MES,
                detalhe_tecnico: error.message,
                tipo_erro: error.name,
            };
            throw new HttpException(
                objectError,
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }

    async atribuirTempoDeAnalize(inicial: InicialGabinetePrefeitoDto) {

        try {
            const admissibilidade = await this.prisma.admissibilidade.findUnique({
                where: {
                    inicial_id: inicial.id
                }
            })

            if (!admissibilidade) {
                throw new HttpException(
                    ERROR_MESSAGES.FALHA_ENCONTRAR_ADMISSIBILIDADE(inicial.id),
                    HttpStatus.BAD_REQUEST
                )
            }

            const data_enviado = new Date(admissibilidade.data_envio)
            const data_decidido = new Date(admissibilidade.data_decisao_interlocutoria)
            const diferenca = data_decidido.getTime() - data_enviado.getTime()
            const diferencaEmDias = diferenca / (1000 * 60 * 60 * 24)

            inicial.tempo_de_analise_pedido_inicial = diferencaEmDias
            return inicial
        } catch (error) {
            const objectError = {
                api_mensagem: ERROR_MESSAGES.FALHA_ENCONTRAR_ADMISSIBILIDADE(inicial.id),
                detalhe_tecnico: error.message,
                tipo_erro: error.name,
            };
            throw new HttpException(
                objectError,
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }

    }

    async incrementarListaDeProcessos(lista: { ano: number, dados: InicialGabinetePrefeitoDto[], [key: string]: any }[]) {

        try {
            if (!lista) {
                throw new HttpException(
                    ERROR_MESSAGES.FALHA_LISTA_VAZIA,
                    HttpStatus.BAD_REQUEST
                )
            }

            await Promise.all(lista.map(async (obj) => {
                obj.numeros_de_processos = []
                await Promise.all(obj.dados.map(async (inicial) => {
                    const numeroDoProcesso = await this.getNumeroDoProcesso(inicial)
                    obj.numeros_de_processos.push(numeroDoProcesso)
                }));
            }));

            return lista
        } catch (error) {
            const objectError = {
                api_mensagem: ERROR_MESSAGES.FALHA_ATRIBUIR_NUMERO_DO_PROCESSO_VARIOS,
                detalhe_tecnico: error.message,
                tipo_erro: error.name,
            };
            throw new HttpException(
                objectError,
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }

    async atribuirProtocoladosEAprovados(lista: { ano: number, dados: Inicial[], [key: string]: any }[]) {

        lista.forEach((obj) => {
            const ARprotocolados = []
            const ARaprovados = []
            obj.dados.forEach(async (inicial) => {
                if (inicial.status === 2) {
                    ARprotocolados.push(inicial)
                } else if (inicial.status === 3) {
                    ARaprovados.push(inicial)
                }
            })
            obj.processos_protocolados = ARprotocolados.length
            obj.processos_aprovados = ARaprovados.length
        })

        return lista
    }

    async getRelatorioGabineteDoPrefeito(): Promise<RelatorioGabinetePrefeitoDto[]> {
        const agrupamentoAnual = await this.segregarIniaisPorAno();
        const agrupamentoMensal = await this.segregarIniciaisPorMes(agrupamentoAnual)
        const listaComNumerosDeProcesso = await this.incrementarListaDeProcessos(agrupamentoMensal)
        const listaComNumeroDeProtocoladosEAprovados = await this.atribuirProtocoladosEAprovados(listaComNumerosDeProcesso)

        return listaComNumeroDeProtocoladosEAprovados
    }
}