import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { PeriodFilterDto } from "../relatorio-ar-quantitativo/dto/response-relatorio.dto";

@Injectable()
export class ArGraficoProgressaoMensalService {
  constructor(private prisma: PrismaService) { }

  async getAllByYear(periodFilter: PeriodFilterDto) {
    const result = await this.prisma.$queryRaw`
    SELECT 
      YEAR(criado_em) AS ano,
      MONTH(criado_em) - 1 AS mes,
      COUNT(*) AS total
    FROM admissibilidades
    WHERE criado_em >= ${periodFilter.gte}
      AND criado_em <= ${periodFilter.lte}
    GROUP BY YEAR(criado_em), MONTH(criado_em)
    ORDER BY YEAR(criado_em), MONTH(criado_em);
  `;

    const anoData: { [key: number]: { ano: number; mes: number[]; total: number } } = {};

    if (Array.isArray(result)) {

      result.forEach(row => {
        const ano = Number(row.ano);
        const mes = Number(row.mes);
        const total = Number(row.total);

        if (!anoData[ano]) {
          anoData[ano] = {
            ano: ano,
            mes: Array(12).fill(0),
            total: 0,
          };
        }

        anoData[ano].mes[mes] = total;
        anoData[ano].total += total;
      });
    }

    return Object.values(anoData);
  }

  verificarData(anoInit: string, anoFinal: string): PeriodFilterDto {
    if (!anoInit && !anoFinal) {
      return {
        gte: new Date(0),
        lte: new Date(),
      };
    }
    const primeiroDia: Date = new Date(Number(anoInit), Number(0), Number(1));
    const ultimoDia: Date = new Date(Number(anoFinal), Number(11), Number(31));
    const periodFilter: PeriodFilterDto = { gte: primeiroDia, lte: ultimoDia };
    return periodFilter
  }

  async getReatorio(anoInit: string, anoFinal: string) {
    const periodFilter: PeriodFilterDto = this.verificarData(anoInit, anoFinal)
    return await this.getAllByYear(periodFilter)
  }
}
