import { Injectable } from "@nestjs/common";
import { Admissibilidade } from "@prisma/client";
import { PrismaService } from "src/prisma/prisma.service";
import { PeriodFilterDto } from "../relatorio-ar-quantitativo/dto/response-relatorio.dto";

@Injectable()
export class ArGraficoProgressaoMensalService {
  constructor(private prisma: PrismaService) { }

  async getAllByYear(periodFilter: PeriodFilterDto) {
    // A consulta retorna total de processos por ano e mês
    const result = await this.prisma.$queryRaw`
    SELECT 
      YEAR(criado_em) AS year,
      MONTH(criado_em) - 1 AS month,  -- Ajusta para 0-11
      COUNT(*) AS total
    FROM admissibilidades
    WHERE criado_em >= ${periodFilter.gte}
      AND criado_em <= ${periodFilter.lte}
    GROUP BY YEAR(criado_em), MONTH(criado_em)
    ORDER BY YEAR(criado_em), MONTH(criado_em);
  `;

    // Inicializa um objeto para armazenar os dados por ano
    const yearlyData: { [key: number]: { year: number; month: number[]; total: number } } = {};

    // Processa os resultados da consulta
    if (Array.isArray(result)) {

      result.forEach(row => {
        const year = Number(row.year);
        const month = Number(row.month);
        const total = Number(row.total);

        // Se o ano ainda não foi adicionado, inicializa o array de meses e o total
        if (!yearlyData[year]) {
          yearlyData[year] = {
            year: year,
            month: Array(12).fill(0),  // Inicializa o array com 12 meses
            total: 0,
          };
        }

        // Preenche o número de processos para o mês correspondente
        yearlyData[year].month[month] = total;
        yearlyData[year].total += total;  // Atualiza o total para o ano
      });
    }

    // Retorna os dados no formato desejado
    return Object.values(yearlyData);
  }

  verificarData(anoInit: string, anoFinal: string): PeriodFilterDto {
    console.log("2:", anoInit, anoFinal)
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
