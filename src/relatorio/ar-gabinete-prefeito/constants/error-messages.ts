export const ERROR_MESSAGES = {
    FALHA_DE_AGRUPAMENTO: 'Falha ao agrupar os dados por ano.',
    FALHA_ENCONTRAR_NUMERO_PROCESSO: (inicial_id: number | string) => `Falha ao encontrar o número do processo na inicial de id ${inicial_id}.`,
    FALHA_LISTA_VAZIA: 'A lista de iniciais não possui processos.',
    FALHA_SEGREGAR_POR_MES: 'Falha ao segregar as iniciais por mês.',
    FALHA_ENCONTRAR_ADMISSIBILIDADE: (inicial_id: number | string) => `Falha ao encontrar a admissibilidade para a inicial de id ${inicial_id}.`,
    FALHA_ATRIBUIR_TEMPO_ANALISE: (inicial_id: number | string) => `Falha ao atribuir o tempo de análise para a inicial de id ${inicial_id}.`,
    FALHA_ATRIBUIR_NUMERO_DO_PROCESSO_VARIOS: 'Falha ao incrementar a lista com numero do processo para todas iniciais',
}