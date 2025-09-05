export interface IPrazoAnaliseAdmissibilidade {
    id: number;
    decreto: boolean;
    sei: string;
    tipo_requerimento: number;
    requerimento: string;
    aprova_digital: string;
    processo_fisico: string;
    data_protocolo: string; // ISO date string
    envio_admissibilidade: string; // ISO date string
    alvara_tipo_id: string;
    obs: string;
    status: number;
    tipo_processo: number;
    proprietario_id?: string | null;
    autor_projeto_id?: string | null;
    responsavel_tecnico_id?: string | null;
    area?: string | null;
    resumo_projeto?: string | null;
    zona: string;
    pagamento: number;
    requalifica_rapido: boolean;
    associado_reforma: boolean;
    data_limiteSmul: string; // ISO date string
    data_limiteMulti?: string | null; // ISO date string or null
    criado_em: string; // ISO datetime string
    alterado_em: string; // ISO datetime string
}