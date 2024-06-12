export class CreateDistribuicaoDto {
    inicial_id: number;
    tecnico_responsavel_id: string;
    administrativo_responsavel_id: string;
    processo_relacionado_incomum?: string;
    assunto_processo_relacionado_incomum?: string;
    baixa_pagamento?: number;
    obs?: string;
}
