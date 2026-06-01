import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

function adicionaDias(data: Date, dias: number): Date {
  const resultado = new Date(data);
  resultado.setDate(resultado.getDate() + dias);
  return resultado;
}

async function main() {
  const emAnalise = await prisma.inicial.findMany({
    where: { status: 2 },
    include: {
      alvara_tipo: true,
      admissibilidade: { select: { data_decisao_interlocutoria: true } },
    },
  });

  let atualizados = 0;

  for (const inicial of emAnalise) {
    if (!inicial.alvara_tipo) continue;

    const decisao = inicial.admissibilidade?.data_decisao_interlocutoria;
    const baseSmul = decisao ?? inicial.envio_admissibilidade;
    const data: { data_limiteSmul?: Date; data_limiteMulti?: Date } = {};

    if (baseSmul && inicial.alvara_tipo.prazo_analise_smul1 > 0) {
      data.data_limiteSmul = adicionaDias(
        new Date(baseSmul),
        inicial.alvara_tipo.prazo_analise_smul1,
      );
    }

    if (inicial.tipo_processo === 2 && inicial.alvara_tipo.prazo_analise_multi1 > 0) {
      const baseMulti = decisao ?? inicial.envio_admissibilidade;
      if (baseMulti) {
        data.data_limiteMulti = adicionaDias(
          new Date(baseMulti),
          inicial.alvara_tipo.prazo_analise_multi1,
        );
      }
    }

    if (!data.data_limiteSmul && !data.data_limiteMulti) continue;

    await prisma.inicial.update({
      where: { id: inicial.id },
      data,
    });
    atualizados += 1;
  }

  const comLimiteSmul = await prisma.inicial.count({
    where: { status: 2, data_limiteSmul: { not: null } },
  });
  const comLimiteMulti = await prisma.inicial.count({
    where: { status: 2, data_limiteMulti: { not: null } },
  });

  console.log({
    processosEmAnalise: emAnalise.length,
    atualizados,
    comLimiteSmul,
    comLimiteMulti,
  });
}

main().finally(() => prisma.$disconnect());
