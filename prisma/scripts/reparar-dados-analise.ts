/**
 * Repara dados de processos em análise: unidades setoriais, unidade_id,
 * limites de prazo, decisões e controles de prazo.
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const UNIDADES_SETORIAIS = [
  { sigla: 'PARHIS', nome: 'Patrimônio Histórico', codigo: 'PARHIS' },
  { sigla: 'RESID', nome: 'Residencial', codigo: 'RESID' },
  { sigla: 'SERVIN', nome: 'Serviços Institucionais', codigo: 'SERVIN' },
  { sigla: 'COMIN', nome: 'Comercial e Industrial', codigo: 'COMIN' },
  { sigla: 'CAEPP', nome: 'Centro de Apoio ao Empreendimento', codigo: 'CAEPP' },
  { sigla: 'SMUL', nome: 'Secretaria Municipal de Urbanismo e Licenciamento', codigo: 'SMUL' },
  { sigla: 'GRAPROEM', nome: 'GRAPROEM', codigo: 'GRAPROEM' },
];

function inferirUnidadeSiglaPorAlvara(nomeAlvara: string): string {
  const nome = nomeAlvara
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
  if (nome.includes('bem tombado')) return 'CAEPP';
  if (nome.includes('area envoltoria')) return 'PARHIS';
  if (nome.includes('certificado') || nome.includes('regularizacao')) return 'COMIN';
  if (nome.includes('aprovacao e execucao')) return 'RESID';
  if (nome.includes('execucao de')) return 'SERVIN';
  return 'RESID';
}

function adicionaDias(data: Date, dias: number): Date {
  const r = new Date(data);
  r.setDate(r.getDate() + dias);
  return r;
}

async function seedUnidades() {
  const map = new Map<string, string>();
  for (const u of UNIDADES_SETORIAIS) {
    const reg = await prisma.unidade.upsert({
      where: { sigla: u.sigla },
      create: { ...u, status: 1 },
      update: { nome: u.nome, codigo: u.codigo, status: 1 },
    });
    map.set(u.sigla, reg.id);
  }
  return map;
}

async function main() {
  const unidadeMap = await seedUnidades();

  const emAnalise = await prisma.inicial.findMany({
    where: { status: 2 },
    include: {
      alvara_tipo: true,
      admissibilidade: true,
    },
  });

  let unidadesAtualizadas = 0;
  let limitesAtualizados = 0;
  let decisoesCriadas = 0;
  let controlesCriados = 0;

  for (const inicial of emAnalise) {
    if (!inicial.alvara_tipo) continue;

    const sigla = inferirUnidadeSiglaPorAlvara(inicial.alvara_tipo.nome);
    const unidadeId = unidadeMap.get(sigla);
    if (unidadeId && !inicial.admissibilidade?.unidade_id) {
      await prisma.admissibilidade.update({
        where: { inicial_id: inicial.id },
        data: { unidade_id: unidadeId },
      });
      unidadesAtualizadas += 1;
    }

    const decisao =
      inicial.admissibilidade?.data_decisao_interlocutoria ??
      inicial.envio_admissibilidade;
    if (!decisao) continue;

    const dataInicio = new Date(decisao);
    const alvara = inicial.alvara_tipo;
    const limites: { data_limiteSmul?: Date; data_limiteMulti?: Date } = {};

    if (alvara.prazo_analise_smul1 > 0) {
      limites.data_limiteSmul = adicionaDias(dataInicio, alvara.prazo_analise_smul1);
    }
    if (inicial.tipo_processo === 2 && alvara.prazo_analise_multi1 > 0) {
      limites.data_limiteMulti = adicionaDias(dataInicio, alvara.prazo_analise_multi1);
    }

    if (limites.data_limiteSmul || limites.data_limiteMulti) {
      await prisma.inicial.update({
        where: { id: inicial.id },
        data: limites,
      });
      limitesAtualizados += 1;
    }

    const graproem = inicial.tipo_processo === 2 ? 1 : 0;
    const temDecisao = await prisma.decisao.count({
      where: { inicial_id: inicial.id, etapa: 2 },
    });
    if (temDecisao === 0) {
      await prisma.decisao.create({
        data: { inicial_id: inicial.id, parecer: 0, etapa: 2, graproem },
      });
      decisoesCriadas += 1;
    }

    const temControle = await prisma.controle_Prazo.count({
      where: { inicial_id: inicial.id, etapa: 2 },
    });
    if (temControle === 0) {
      const fases =
        inicial.tipo_processo === 2
          ? [alvara.prazo_analise_multi1, alvara.prazo_analise_multi2].filter(
              (d) => d > 0,
            )
          : [alvara.prazo_analise_smul1, alvara.prazo_analise_smul2].filter(
              (d) => d > 0,
            );
      let cursor = new Date(dataInicio);
      for (const duracao of fases) {
        const finalPlanejado = adicionaDias(cursor, duracao);
        await prisma.controle_Prazo.create({
          data: {
            inicial_id: inicial.id,
            data_inicio: cursor,
            final_planejado: finalPlanejado,
            duracao_planejada: duracao,
            etapa: 2,
            graproem,
            status: 0,
          },
        });
        controlesCriados += 1;
        cursor = finalPlanejado;
      }
    }
  }

  const admComUnidade = await prisma.admissibilidade.count({
    where: { inicial: { status: 2 }, unidade_id: { not: null } },
  });

  console.log({
    processosEmAnalise: emAnalise.length,
    unidadesAtualizadas,
    limitesAtualizados,
    decisoesCriadas,
    controlesCriados,
    admComUnidade,
    unidadesNoBanco: await prisma.unidade.count(),
  });
}

main().finally(() => prisma.$disconnect());
