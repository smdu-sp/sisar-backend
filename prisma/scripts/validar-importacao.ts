import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const statusIniciais = await prisma.$queryRaw<
    { status: number | null; qtd: bigint }[]
  >`SELECT status, COUNT(*) as qtd FROM iniciais GROUP BY status ORDER BY status`;

  const statusAdm = await prisma.$queryRaw<
    { status: number; qtd: bigint }[]
  >`SELECT status, COUNT(*) as qtd FROM admissibilidades GROUP BY status ORDER BY status`;

  const sample = await prisma.inicial.findFirst({
    where: { processo_fisico: { contains: '20180351891' } },
    include: {
      admissibilidade: true,
      distribuicao: { include: { tecnico_responsavel: true } },
      conclusao: true,
    },
  });

  console.log('Status iniciais:', statusIniciais);
  console.log('Status admissibilidade:', statusAdm);
  console.log('Amostra:', sample);
}

main()
  .finally(() => prisma.$disconnect());
