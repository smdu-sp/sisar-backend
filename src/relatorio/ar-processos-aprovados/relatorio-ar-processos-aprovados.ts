import { PrismaService } from "src/prisma/prisma.service";
import { PeriodFilterDto } from "../relatorio-ar-quantitativo/dto/response-relatorio.dto";
import { HttpStatus, HttpException, Injectable } from "@nestjs/common";
import { InicialProcessosAprovadosDto } from "./dto/inicial-processos-aprovados.dto";
import { calcularDiferencaEmDias } from "src/utils/date.utils";
import { ERROR_MESSAGES } from "./constants/error-messages";

@Injectable()
export class ArProcessosAprovadosService {
    constructor(private prisma: PrismaService) { }

    async includeTemPoDeAnalise(lista: InicialProcessosAprovadosDto[]): Promise<InicialProcessosAprovadosDto[]> {
        try {
            const listaComPrazos = await Promise.all(lista.map(async (item) => {
                const admissibilidade = await this.prisma.admissibilidade.findUnique({
                    where: {
                        inicial_id: item.id
                    }
                })

                // Primeiro verificar se admissibilidade existe, depois verificar se as datas são null
                if (!admissibilidade || admissibilidade.data_envio === null || admissibilidade.data_decisao_interlocutoria === null) {
                    item.tempo_analise_inicial = 0;
                    item.tempo_analise_recurso_1 = 0;
                    return item
                }

                if (!admissibilidade.reconsiderado) {
                    const prazo_pedido_inicial = calcularDiferencaEmDias(new Date(admissibilidade.data_decisao_interlocutoria), new Date(admissibilidade.data_envio));
                    item.tempo_analise_inicial = prazo_pedido_inicial;
                } else {
                    const reconsideracao_Admissibilidade = await this.prisma.reconsideracao_Admissibilidade.findUnique({
                        where: {
                            inicial_id: item.id,
                        }
                    })
                    if (reconsideracao_Admissibilidade) {
                        item.tempo_analise_recurso_1 = calcularDiferencaEmDias(new Date(admissibilidade.data_decisao_interlocutoria), new Date(reconsideracao_Admissibilidade.pedido_reconsideracao));
                    }
                }
                return item
            }));
            return listaComPrazos;
        } catch (error) {
            const objectError = {
                api_mensagem: ERROR_MESSAGES.FALHA_AO_ATRIBUIR_TEMPO_ANALISE,
                tipo_erro: error.name,
                detalhe_tecnico: error.message,
            }
            throw new HttpException(
                objectError,
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }

    async getDataPorAno(ano: string) {

        try {
            const processosAprovados = await this.prisma.inicial.findMany({
                where: {
                    status: 3,
                    criado_em: {
                        gte: new Date(`${ano}-01-01`),
                        lt: new Date(`${ano}-12-31`)
                    }
                }
            });

            if (processosAprovados.length === null || processosAprovados.length === undefined) {
                throw new Error(ERROR_MESSAGES.FALHA_LISTA_INDEFINIDA);
            }

            const processosComPrazosAprovados = await this.includeTemPoDeAnalise(processosAprovados);

            return processosComPrazosAprovados;
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

    async getDataPorMes(lista: InicialProcessosAprovadosDto[]) {
        try {

            if (lista.length === null || lista.length === undefined) {
                throw new Error(ERROR_MESSAGES.FALHA_LISTA_INDEFINIDA);
            }

            let relatorioPorMeses = {}

            for (let i = 1; i <= 12; i++) {
                const mes = String(i).padStart(2, '0');
                relatorioPorMeses[new Date(`2020-${mes}`).toLocaleString('pt-BR', { month: 'short' })] = []
            }

            lista.forEach((inicial) => {
                if (Object.keys(relatorioPorMeses).includes(inicial.data_protocolo.toLocaleString('pt-BR', { month: 'short' }))) {
                    relatorioPorMeses[inicial.data_protocolo.toLocaleString('pt-BR', { month: 'short' })].push(inicial)
                }
            })

            const listaConvertida = Object.entries(relatorioPorMeses)
            const dezembro = listaConvertida.shift()
            listaConvertida.push(dezembro)
            relatorioPorMeses = Object.fromEntries(listaConvertida)

            return relatorioPorMeses

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

    async getRelatorioAnaliseAdmissibilidade(ano: string) {
        const listaPorAno = await this.getDataPorAno(ano);
        const listaPorMes = await this.getDataPorMes(listaPorAno);
        return listaPorMes;
    }


}
