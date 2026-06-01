/** Mapeia o nome do tipo de alvará para a sigla da unidade setorial (relatório AR). */
export function inferirUnidadeSiglaPorAlvara(nomeAlvara: string): string {
  const nome = nomeAlvara
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();

  if (nome.includes('bem tombado')) return 'CAEPP';
  if (nome.includes('area envoltoria') || nome.includes('área envoltória'))
    return 'PARHIS';
  if (nome.includes('certificado') || nome.includes('regularizacao'))
    return 'COMIN';
  if (nome.includes('aprovacao e execucao')) return 'RESID';
  if (nome.includes('execucao de')) return 'SERVIN';

  return 'RESID';
}

export const UNIDADES_SETORIAIS = [
  { sigla: 'PARHIS', nome: 'Patrimônio Histórico', codigo: 'PARHIS' },
  { sigla: 'RESID', nome: 'Residencial', codigo: 'RESID' },
  { sigla: 'SERVIN', nome: 'Serviços Institucionais', codigo: 'SERVIN' },
  { sigla: 'COMIN', nome: 'Comercial e Industrial', codigo: 'COMIN' },
  { sigla: 'CAEPP', nome: 'Centro de Apoio ao Empreendimento', codigo: 'CAEPP' },
  { sigla: 'SMUL', nome: 'Secretaria Municipal de Urbanismo e Licenciamento', codigo: 'SMUL' },
  { sigla: 'GRAPROEM', nome: 'GRAPROEM', codigo: 'GRAPROEM' },
] as const;
