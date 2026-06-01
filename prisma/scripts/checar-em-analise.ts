import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const emAnalise = await prisma.inicial.count({ where: { status: 2 } });
  const comLimiteSmul = await prisma.inicial.count({
    where: { status: 2, data_limiteSmul: { not: null } },
  });
  const comLimiteMulti = await prisma.inicial.count({
    where: { status: 2, data_limiteMulti: { not: null } },
  });
  const comDistrib = await prisma.inicial.count({
    where: { status: 2, distribuicao: { isNot: null } },
  });
  const comDecisao = await prisma.decisao.count({
    where: { inicial: { status: 2 } },
  });
  const comControle = await prisma.controle_Prazo.count({
    where: { inicial: { status: 2 } },
  });
  const multiTotal = await prisma.inicial.count({
    where: { status: 2, tipo_processo: 2 },
  });
  const multiComInterface = await prisma.inicial.count({
    where: { status: 2, tipo_processo: 2, interfaces: { isNot: null } },
  });
  const admComDecisao = await prisma.admissibilidade.count({
    where: {
      inicial: { status: 2 },
      data_decisao_interlocutoria: { not: null },
    },
  });
  const admComUnidade = await prisma.admissibilidade.count({
    where: {
      inicial: { status: 2 },
      unidade_id: { not: null },
    },
  });
  const admStatus0 = await prisma.admissibilidade.count({
    where: { inicial: { status: 2 }, status: 0 },
  });

  console.log({
    emAnalise,
    comLimiteSmul,
    comLimiteMulti,
    comDistrib,
    comDecisao,
    comControle,
    multiTotal,
    multiComInterface,
    admComDecisao,
    admComUnidade,
    admStatus0,
    multiSemInterface: multiTotal - multiComInterface,
  });
}

main().finally(() => prisma.$disconnect());
