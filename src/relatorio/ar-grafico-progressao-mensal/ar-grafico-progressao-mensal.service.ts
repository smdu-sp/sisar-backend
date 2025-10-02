import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { PeriodFilterDto } from "../relatorio-ar-quantitativo/dto/response-relatorio.dto";
import { ERROR_MESSAGES } from "./constants/error-messages";

@Injectable()
export class ArGraficoProgressaoMensalService {
  constructor(private prisma: PrismaService) { }

  async getDataPorAno(periodFilter: PeriodFilterDto) {

    try {
      const resultQuery = await this.prisma.$queryRaw`
  SELECT 
    ano,
    mes,
    COUNT(*) AS total_registros
  FROM (
    SELECT 
      YEAR(criado_em) AS ano,
      MONTH(criado_em) AS mes
    FROM 
      admissibilidades
  ) AS subquery
  GROUP BY 
    ano, mes
  ORDER BY 
    ano, mes;
    `;

      if (!resultQuery) {
        throw new HttpException(ERROR_MESSAGES.FALHA_QUERY_BRUTA_INICIAIS_POR_ANO, HttpStatus.INTERNAL_SERVER_ERROR)
      }

      const anoData: { [key: number]: { ano: number; mes: number[]; acc: number[] } } = {};

      const anoInicio = new Date(periodFilter.gte).getFullYear();
      const anoFim = new Date(periodFilter.lte).getFullYear();

      for (let ano = anoInicio; ano <= anoFim; ano++) {
        anoData[ano] = {
          ano: ano,
          mes: Array(12).fill(0),
          acc: Array(12).fill(0),
        };
      }

      if (Array.isArray(resultQuery)) {
        let acc = 0
        resultQuery.forEach((row) => {
          const ano = Number(row.ano);
          const mes = Number(row.mes);
          const total = Number(row.total_registros);

          anoData[ano].mes[mes - 1] = total;
          acc += total;
          anoData[ano].acc[mes - 1] = acc;
        });
      }

      let acumulado = 0;

      for (let ano = anoInicio; ano <= anoFim; ano++) {

        for (let mes = 0; mes < 12; mes++) {
          if (anoData[ano].mes[mes] === 0) {
            anoData[ano].acc[mes] = acumulado;
          } else {
            acumulado += anoData[ano].mes[mes];
            anoData[ano].acc[mes] = acumulado;
          }
        }
      }

      return Object.values(anoData);
    } catch (error) {
      const objectError = {
        api_mensagem: ERROR_MESSAGES.FALHA_SEGREGAR_INICIAIS_POR_ANO,
        tipo_erro: error.name,
        detalhe_tecnico: error.message,
      };
      throw new HttpException(
        objectError,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  verificarData(anoInit: string, anoFinal: string): PeriodFilterDto {
    try {
      if (!anoInit && !anoFinal) {
        return {
          gte: new Date("2018-01-01"),
          lte: new Date(),
        };
      }

      if (new Date(anoInit).getFullYear() < new Date("2018").getFullYear()) {
        throw new HttpException(
          "A pesquisa de processos está limitada a registros iniciados a partir de 2018. Não é possível consultar processos anteriores a esta data.",
          HttpStatus.NOT_FOUND
        )
      }

      if (new Date(anoFinal).getFullYear() > new Date().getFullYear()) {
        throw new HttpException(
          `A pesquisa de processos está limitada aos registros de processos iniciados até o ano de ${new Date().getFullYear()}. Por favor, consulte os processos até essa data. `,
          HttpStatus.NOT_FOUND
        )
      }

      const primeiroDia: Date = new Date(Number(anoInit), Number(0), Number(1));
      const ultimoDia: Date = new Date(Number(anoFinal), Number(11), Number(31));
      const periodFilter: PeriodFilterDto = { gte: primeiroDia, lte: ultimoDia };
      return periodFilter;
    } catch (error) {
      const objectError = {
        api_mensagem: ERROR_MESSAGES.FALHA_VERIFICAR_DATE,
        tipo_erro: error.name,
        detalhe_tecnico: error.message,
      };
      throw new HttpException(
        objectError,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async getRelatorio(anoInit: string, anoFinal: string) {
    const periodFilter: PeriodFilterDto = this.verificarData(anoInit, anoFinal)
    return await this.getDataPorAno(periodFilter)
  }
}
