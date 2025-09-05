import { HttpStatus, HttpException, Injectable } from "@nestjs/common";
import { PeriodFilterDto } from "../relatorio-ar-quantitativo/dto/response-relatorio.dto";
import { PrismaService } from "src/prisma/prisma.service";


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


    async getPrazoAnaliseAdmissibilidade(data_inicio?: string, data_fim?: string) {
        console.log("em construção...")
        const resultado = await this.getDataPorPeriodo({
            gte: new Date(data_inicio),
            lte: new Date(data_fim)
        });

        return resultado
    }
}