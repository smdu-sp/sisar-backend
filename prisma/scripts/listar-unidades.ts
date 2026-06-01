import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
prisma.unidade.findMany({ select: { id: true, sigla: true, nome: true } }).then((r) => {
  console.log(r);
  prisma.$disconnect();
});
