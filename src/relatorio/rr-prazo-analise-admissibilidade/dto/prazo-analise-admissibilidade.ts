import { Decimal } from "@prisma/client/runtime/library";

export interface IPrazoAnaliseAdmissibilidadeDto {
    id: number;
    decreto: boolean;
    sei: string;
    tipo_requerimento: number;
    requerimento: string;
    aprova_digital: string;
    processo_fisico: string;
    data_protocolo: string | Date;
    envio_admissibilidade: string | Date;
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
    pagamento: number;
    requalifica_rapido: boolean;
    associado_reforma: boolean;
    data_limiteSmul: string | Date;
    data_limiteMulti?: string | Date | null;
    criado_em: string | Date;
    alterado_em: string | Date;
    data_requalificacao?: string | Date | null;
    tempo_de_analise_admissibilidade?: number | null;
    tempo_de_analise_reconsideracao?: number | null;
    suspensao_prazo?: number | null;
    suspensao_prazo_etapa_1?: number | null;
    suspensao_prazo_etapa_2?: number | null;
    motivos_suspensao?: string[] | null;

}

export interface IRelatorioPrazoAnaliseAdmissibilidadePorAnoDto {
    [ano: string]: IPrazoAnaliseAdmissibilidadeDto[]
}