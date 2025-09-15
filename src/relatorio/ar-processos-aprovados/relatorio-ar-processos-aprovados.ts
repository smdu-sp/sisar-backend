import { PrismaService } from "src/prisma/prisma.service";
import { PeriodFilterDto } from "../relatorio-ar-quantitativo/dto/response-relatorio.dto";
import { HttpStatus, HttpException, Injectable } from "@nestjs/common";
import { InicialProcessosAprovadosDto } from "./dto/inicial-processos-aprovados.dto";
import { calcularDiferencaEmDias } from "src/utils/date.utils";

@Injectable()
export class ArProcessosAprovadosService {
    constructor(private prisma: PrismaService) { }

    async includeTemPoDeAnalise(lista: InicialProcessosAprovadosDto[]): Promise<InicialProcessosAprovadosDto[]> {
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
    }

    async getDataPorAno(ano: string) {
        console.log(ano)

        const processosAprovados = await this.prisma.inicial.findMany({
            where: {
                status: 3,
                criado_em: {
                    gte: new Date(`${ano}-01-01`),
                    lt: new Date(`${ano}-12-31`)
                }
            }
        });

        const processosComPrazosAprovados = await this.includeTemPoDeAnalise(processosAprovados);

        return processosComPrazosAprovados;
    }

}
