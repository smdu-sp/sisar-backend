import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const devUser = {
  login: 'd854440',
  nome: 'Bruno Luiz Vieira',
  email: 'blvieira@prefeitura.sp.gov.br',
  status: 1,
  permissao: 'DEV' as const,
};

async function main() {
  const existingByEmail = await prisma.usuario.findUnique({
    where: { email: devUser.email },
  });

  const root = existingByEmail
    ? await prisma.usuario.update({
        where: { email: devUser.email },
        data: devUser,
      })
    : await prisma.usuario.upsert({
        where: { login: devUser.login },
        create: devUser,
        update: devUser,
      });

  console.log(root);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
