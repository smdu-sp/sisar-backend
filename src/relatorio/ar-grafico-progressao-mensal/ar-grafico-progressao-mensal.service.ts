import { Injectable } from "@nestjs/common";
import { Admissibilidade } from "@prisma/client";
import { PrismaService } from "src/prisma/prisma.service";

@Injectable()
export class ArGraficoProgressaoMensalService {
  constructor(private prisma: PrismaService) {}

  async getAllByYear(year: number): Promise<Admissibilidade[]> {
    return (await this.prisma.admissibilidade.findMany()).filter(d => +d.criado_em.getFullYear() >= year);
  };
}
