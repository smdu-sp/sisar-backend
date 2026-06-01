/** Substatus durante análise técnica (status inicial = 2) */
export const SubstatusAnalise = {
  NORMAL: 0,
  COMUNIQUE_SE: 1,
  AGUARDANDO_RECURSO: 2,
  PRE_REUNIAO_GRAPROEM: 3,
} as const;

/** Parecer da decisão técnica na instância atual */
export const ParecerDecisao = {
  PENDENTE: 0,
  DEFERIDO: 1,
  INDEFERIDO: 2,
  COMUNIQUE_SE: 3,
} as const;

export const MAX_INSTANCIA_ANALISE = 3;

export const MotivoSuspensao = {
  COMUNIQUE_SE: 1,
} as const;
