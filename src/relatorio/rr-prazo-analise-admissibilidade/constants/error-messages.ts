export const ERROR_MESSAGES = {
    FALHA_GET_INICIAIS_POR_PERIODO: 'Falha ao agrupar iniciais por período',
    FALHA_AGRUPAR_INICIAIS_POR_ANO: 'Falha ao agrupar iniciais por ano',
    FALHA_AGRUPAR_INICIAIS_POR_MES: 'Falha ao agrupar iniciais por mês',
    FALHA_INICIAL_INDEX: (id: number | string) => `Falha ao processar ou incluir inicial com ID ${id}`,
    FALHA_CALCULAR_DIAS_SUSPENSAO: (id: number | string) => `Falha ao calcular dias de suspensão para inicial com ID ${id}`,
    FALHA_INCLUIR_SUSPENSAO_RECONSIDERACAO: 'Falha ao incluir suspensão e reconsideração em todas iniciais',
    FALHA_INCLUIR_TEMPO_ANALISE: 'Falha ao incluir tempo de análise em todas iniciais',
    FALHA_ENCONTRAR_ADMISSIBILIDADE: (id: number | string) => `Falha ao encontrar admissão para inicial com ID ${id}`,
}