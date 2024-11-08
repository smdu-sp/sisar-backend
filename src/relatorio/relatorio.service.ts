import { Injectable } from '@nestjs/common';
import { CreateRelatorioDto } from './dto/create-relatorio.dto';
import { AppService } from 'src/app.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { RelatorioResopnseDto } from './dto/response-relatorio.dto';

@Injectable()
export class RelatorioService {
    constructor(
        private prisma: PrismaService,
        private app: AppService
    ) { }

    async relatorioQuantitativo(data: Date) {
        const primeiroDia = new Date(data.getFullYear(), data.getMonth(), 1);
        const ultimoDia = new Date(data.getFullYear(), data.getMonth() + 1, 0);
        const unidades = await this.prisma.unidade.findMany({
            where: { status: 1 },
            select: { id: true, nome: true }
        });
    
        const periodFilter = {
            gte: primeiroDia,
            lte: ultimoDia
        };
    
        const unidadeIds = unidades.map(u => u.id);
    
        // Função auxiliar para contagem e agrupamento
        const contarPorUnidade = async (status: number, tipo: number) => {
            const resultados = await this.prisma.admissibilidade.findMany({
                where: {
                    inicial: { status, tipo_processo: tipo },
                    data_decisao_interlocutoria: periodFilter,
                    unidade_id: { in: unidadeIds }
                },
                select: {
                    unidade: { select: { nome: true, id: true } }
                }
            });
            return resultados.reduce((acc, item) => {
                const nome = item.unidade.nome;
                acc[nome] = (acc[nome] || 0) + 1;
                return acc;
            }, {} as Record<string, number>);
        };
    
        // Função auxiliar para contagem total
        const contarTotal = async (status: number, decisaoNull = false) => {
            return await this.prisma.admissibilidade.count({
                where: {
                    status,
                    criado_em: periodFilter,
                    data_decisao_interlocutoria: decisaoNull ? null : periodFilter
                }
            });
        };
    
        // Função para obter dados completos
        const obterDados = async (status: number, decisaoNull = false) => {
            return await this.prisma.admissibilidade.findMany({
                where: {
                    status,
                    criado_em: periodFilter,
                    data_decisao_interlocutoria: decisaoNull ? null : periodFilter
                },
                include: { inicial: true }
            });
        };
    
        // Contagens
        const analise = await contarTotal(1, true);
        const inadmissiveis = await contarTotal(2, true);
        const admissiveis = await contarTotal(0);
    
        // Dados por tipo e status
        const analiseGeralSmul = await contarPorUnidade(2, 1);
        const deferidoGeralSmul = await contarPorUnidade(3, 1);
        const indeferidosGeralSmul = await contarPorUnidade(4, 1);
    
        const analiseGeralGrap = await contarPorUnidade(2, 2);
        const deferidoGeralGrap = await contarPorUnidade(3, 2);
        const indeferidosGeralGrap = await contarPorUnidade(4, 2);
    
        // Dados completos
        const inadmissiveisDados = await obterDados(2, true);
        const admissiveisDados = await obterDados(0);
        const analiseDados = await obterDados(1, true);
    
        const data_gerado = new Date().toISOString().split("T")[0].replaceAll("-", "/").split('/').reverse().join('/');
    
        return {
            "total": analise + inadmissiveis + admissiveis,
            "analise": analise,
            "inadmissiveis": inadmissiveis,
            "admissiveis": admissiveis,
            "data_gerado": data_gerado,
            "em_analise": {
                "smul": {
                    "quantidade": Object.values(analiseGeralSmul).reduce((a, b) => a + b, 0),
                    "data": analiseGeralSmul
                },
                "graproem": {
                    "quantidade": Object.values(analiseGeralGrap).reduce((a, b) => a + b, 0),
                    "data": analiseGeralGrap
                }
            },
            "deferidos": {
                "smul": {
                    "quantidade": Object.values(deferidoGeralSmul).reduce((a, b) => a + b, 0),
                    "data": deferidoGeralSmul
                },
                "graproem": {
                    "quantidade": Object.values(deferidoGeralGrap).reduce((a, b) => a + b, 0),
                    "data": deferidoGeralGrap
                }
            },
            "indeferidos": {
                "smul": {
                    "quantidade": Object.values(indeferidosGeralSmul).reduce((a, b) => a + b, 0),
                    "data": indeferidosGeralSmul
                },
                "graproem": {
                    "quantidade": Object.values(indeferidosGeralGrap).reduce((a, b) => a + b, 0),
                    "data": indeferidosGeralGrap
                }
            },
            "inadmissiveis_dados": inadmissiveisDados,
            "admissiveis_dados": admissiveisDados,
            "em_analise_dados": analiseDados
        };
    }
    
    
}
