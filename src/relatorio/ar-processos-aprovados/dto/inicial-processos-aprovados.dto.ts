import { Decimal } from "@prisma/client/runtime/library";


export class InicialProcessosAprovadosDto {
    id: number;
    decreto: boolean;
    sei: string;
    tipo_requerimento: number;
    requerimento: string;
    aprova_digital: string | Date;
    processo_fisico: string | Date;
    data_protocolo: string | Date; // ISO date string
    envio_admissibilidade: string | Date; // ISO date string
    alvara_tipo_id: string;
    obs: string;
    status: number;
    tipo_processo: number;
    proprietario_id: string;
    autor_projeto_id: string;
    responsavel_tecnico_id: string;
    area: number | Decimal | null;
    resumo_projeto: string;
    zona: string;
    pagamento: number;
    requalifica_rapido: boolean;
    associado_reforma: boolean;
    data_limiteSmul: string | Date | null; // ISO date string or null
    data_limiteMulti: string | Date | null; // ISO date string or null
    criado_em: string | Date; // ISO datetime string
    alterado_em: string | Date; // ISO datetime string
    tempo_analise_inicial?: number | null;
    tempo_analise_recurso_1?: number | null;
    tempo_analise_recurso_2?: number | null;
}
