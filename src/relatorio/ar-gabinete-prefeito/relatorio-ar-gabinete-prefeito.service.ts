import { PrismaService } from "src/prisma/prisma.service";
import { PeriodFilterDto } from "../relatorio-ar-quantitativo/dto/response-relatorio.dto";
import { Injectable } from "@nestjs/common";
import { Inicial } from "@prisma/client";
import { Admissibilidade } from "@prisma/client";
import { HttpException, HttpStatus } from "@nestjs/common";

/**
  pseudocódigo


 relação de processos protocolados ano/mês
 uma lista de objetos
 cada objeto tem uma chave com o valor de um ano
 cada objeto referente ao ano possui 12 objetos, sendo cada um os meses do ano
 cada mÊs do ano terão os seguintes campos: 
    processos_protocolados_aprov_rapido,
    processos_aprovados
o primeiro campo será um number
o segundo campo será um objeto com os seguintes campos
    numero_de_processos,
    lista_de_processos
o primeiro campo será um number
o segundo campo será uma lista de objetos, onde eles terão os seguintes campos
    numero_do_processo,
    tempo_de_analise_pedido_inicial,
    tempo_de_analise_recurso,
    categoria_de_uso,
    responsavel_pelo_projeto,
    empresa,
    caracteristica_projeto,
    regiao_da_cidade
exemplo de objeto:


    {
        ano: 2019,
        meses: [
            {
                mes: "janeiro",
                ...
            },
            ...
            {
                mes: "dezembro",
                processos_protocolados_aprova_rapido: number,
                processos_aprovados: {
                    numero_de_processos: number(lista_de_processos.length),
                    lista_de_processos: [
                        {
                            numero_do_processo: 018-0.048.779-3,
                            tempo_de_analise_pedido_inicial: number,
                            tempo_de_analise_recurso: number,
                            categoria_de_uso: string (possível enum),
                            responsavel_pelo_projeto: string,
                            empresa: string,
                            caracteristica_projeto: string,
                            regiao_da_cidade: string,
                        },
                        {
                            numero_do_processo: 018-0.036.309-1,
                            tempo_de_analise_pedido_inicial: number,
                            tempo_de_analise_recurso: number,
                            categoria_de_uso: string (possível enum),
                            responsavel_pelo_projeto: string,
                            empresa: string,
                            caracteristica_projeto: string,
                            regiao_da_cidade: string,
                        },
                        {
                            numero_do_processo: 018-0.048.697-5 ,
                            tempo_de_analise_pedido_inicial: number,
                            tempo_de_analise_recurso: number,
                            categoria_de_uso: string (possível enum),
                            responsavel_pelo_projeto: string,
                            empresa: string,
                            caracteristica_projeto: string,
                            regiao_da_cidade: string,
                        },
                    ]
            }

            }
        ]
    }

 */

/**
 *REFERENTE AO CAMPO NUMERO DO PROCESSO (PODE SER 3 NUMEROS)
 Prioritariamente, é o campo SEI
 SE (if) não tivr SEI, será o APROVA RAPIDO
 SENÃO (else if) será o campo de processo_fisico
 */

/**
 * plano piloto: 
 *  filtrar todas as iniciais e dividilas por ANO 
 * 
 */


@Injectable()
export class ArGabineteDoPrefeito {
    constructor(private prisma: PrismaService) { }

    async segregarIniaisPorAno(): Promise<{ ano: number; dados: Inicial[] }[]> {

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
    }

    getNumeroDoProcesso(inicial: any) {
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
    }

    async segregarIniciaisPorMes(lista: { ano: number, dados: Inicial[] }[]) {
        lista.forEach((obj) => {
            for (let i = 1; i <= 12; i++) {
                const mes = String(i).padStart(2, '0');
                obj[new Date(`2020-${mes}`).toLocaleString('pt-BR', { month: 'short' })] = []
            }
        })

        lista.forEach((obj) => {
            obj.dados.forEach((inicial) => {
                const mes = inicial.data_protocolo.toLocaleString('pt-BR', { month: 'short' });
                inicial = this.getNumeroDoProcesso(inicial)
                obj[mes].push(inicial);
            });
        })

        for (const processo of lista) {
            for (let inicial of processo.dados) {
                inicial = await this.atribuirTempoDeAnalize(inicial)
            }
        }

        return lista
    }

    async atribuirTempoDeAnalize(inicial: any) {


        const admissibilidade = await this.prisma.admissibilidade.findUnique({
            where: {
                inicial_id: inicial.id
            }
        })

        if (!admissibilidade) {
            throw new HttpException(
                `a inicial de id ${inicial.id} não possui uma admissibilidade relacionada`,
                HttpStatus.BAD_REQUEST
            )
        }

        const data_enviado = new Date(admissibilidade.data_envio)
        const data_decidido = new Date(admissibilidade.data_decisao_interlocutoria)
        const diferenca = data_decidido.getTime() - data_enviado.getTime()
        const diferencaEmDias = diferenca / (1000 * 60 * 60 * 24)

        inicial.tempo_de_analise_pedido_inicial = diferencaEmDias
        return inicial

    }

    async atribuirCategoriaDeUso(inicial: any) {
    }

    async getNumerosDeProcesso(inicial: any) {

        let numeroDoProcesso: string;

        if (inicial.sei) {
            numeroDoProcesso = inicial.sei
        } else if (inicial.aprova_digital) {
            numeroDoProcesso = inicial.aprova_digital
        } else if (inicial.processo_fisico) {
            numeroDoProcesso = inicial.processo_fisico
        } else {
            throw new HttpException(
                `a inicial de id ${inicial.id} não possui um numero SEI, aprova digital ou processo físico`,
                HttpStatus.BAD_REQUEST
            )
        }
        return numeroDoProcesso
    }

    async incrementarListaDeProcessos(lista: { ano: number, dados: Inicial[], [key: string]: any }[]) {
        lista.forEach((obj) => {
            obj.numeros_de_processos = []
            obj.dados.forEach(async (inicial) => {
                const numeroDoProcesso = await this.getNumerosDeProcesso(inicial)
                obj.numeros_de_processos.push(numeroDoProcesso)
            });
        });

        return lista
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

    async getRelatorioGabineteDoPrefeito() {
        const agrupamentoAnual = await this.segregarIniaisPorAno();
        const agrupamentoMensal = await this.segregarIniciaisPorMes(agrupamentoAnual)
        const listaComNumerosDeProcesso = await this.incrementarListaDeProcessos(agrupamentoMensal)
        const listaComNumeroDeProtocoladosEAprovados = await this.atribuirProtocoladosEAprovados(listaComNumerosDeProcesso)

        return listaComNumeroDeProtocoladosEAprovados
    }
}