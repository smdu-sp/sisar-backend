import { Decimal } from "@prisma/client/runtime/library";

export interface IPrazoAnaliseAdmissibilidadeDto {
    id: number;
    decreto: boolean;
    sei: string;
    tipo_requerimento: number;
    requerimento: string;
    aprova_digital: string;
    processo_fisico: string;
    data_protocolo: string | Date; // ISO date string
    envio_admissibilidade: string | Date; // ISO date string
    alvara_tipo_id: string;
    obs: string;
    status: number;
    tipo_processo: number;
    proprietario_id?: string | null;
    autor_projeto_id?: string | null;
    responsavel_tecnico_id?: string | null;
    area?: number | Decimal | null;
    resumo_projeto?: string | null;
    zona?: string;
    reconsiderado?: boolean;
    pagamento: number;
    requalifica_rapido: boolean;
    associado_reforma: boolean;
    data_limiteSmul: string | Date; // ISO date string
    data_limiteMulti?: string | Date | null; // ISO date string or null
    criado_em: string | Date; // ISO datetime string
    alterado_em: string | Date; // ISO datetime string
    data_requalificacao?: string | Date | null; // ISO datetime string
    tempo_de_analise_admissibilidade?: number | null;
    tempo_de_analise_reconsideracao?: number | null;
    suspensao_prazo?: number | null;
    suspensao_prazo_etapa_1?: number | null;
    suspensao_prazo_etapa_2?: number | null;
    motivos_suspensao?: string[] | null;
    ano?: number;
    mes?: string;

}
export interface IRelatorioPrazoAnaliseAdmissibilidadeCabecalhoDto {
    dataInicio?: string;
    dataFim?: string;
    prazoFixoAnalise?: string;
    qtdAnaliseFinalizada?: string;
    qtdAnaliseNoPrazo?: string;
    qtdAnaliseExcedido?: string;
    mediaPeriodoAnalise?: string;
    mediaPeriodoReconsideracao?: string;
}

export type IRelatorioPrazoAnaliseAdmissibilidadePorAnoDto = Record<string, Record<string, IPrazoAnaliseAdmissibilidadeDto[]>>;

export interface IRelatorioPrazoAnaliseAdmissibilidadeCompletoDto {
    cabecalho: IRelatorioPrazoAnaliseAdmissibilidadeCabecalhoDto;
    dados: IRelatorioPrazoAnaliseAdmissibilidadePorAnoDto;
}




