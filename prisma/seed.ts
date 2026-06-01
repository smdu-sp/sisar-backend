import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const devUser = {
  login: 'd854440',
  nome: 'Bruno Luiz Vieira',
  email: 'blvieira@prefeitura.sp.gov.br',
  status: 1,
  permissao: 'DEV' as const,
};

const unidadeAtic = {
  nome: 'Assessoria de Tecnologia da Informação e Comunicação',
  sigla: 'ATIC',
  codigo: 'ATIC',
  status: 1,
};

const subprefeituraSe = {
  nome: 'Subprefeitura da Sé',
  sigla: 'SÉ',
  status: 1,
};

const unidadesSetoriais = [
  { sigla: 'PARHIS', nome: 'Patrimônio Histórico', codigo: 'PARHIS' },
  { sigla: 'RESID', nome: 'Residencial', codigo: 'RESID' },
  { sigla: 'SERVIN', nome: 'Serviços Institucionais', codigo: 'SERVIN' },
  { sigla: 'COMIN', nome: 'Comercial e Industrial', codigo: 'COMIN' },
  { sigla: 'CAEPP', nome: 'Centro de Apoio ao Empreendimento', codigo: 'CAEPP' },
  { sigla: 'SMUL', nome: 'Secretaria Municipal de Urbanismo e Licenciamento', codigo: 'SMUL' },
  { sigla: 'GRAPROEM', nome: 'GRAPROEM', codigo: 'GRAPROEM' },
];

async function main() {
  const unidade = await prisma.unidade.upsert({
    where: { sigla: unidadeAtic.sigla },
    create: unidadeAtic,
    update: unidadeAtic,
  });

  const subprefeitura = await prisma.subprefeitura.upsert({
    where: { sigla: subprefeituraSe.sigla },
    create: subprefeituraSe,
    update: subprefeituraSe,
  });

  const setores = [];
  for (const u of unidadesSetoriais) {
    setores.push(
      await prisma.unidade.upsert({
        where: { sigla: u.sigla },
        create: { ...u, status: 1 },
        update: { nome: u.nome, codigo: u.codigo, status: 1 },
      }),
    );
  }

  const existingByEmail = await prisma.usuario.findUnique({
    where: { email: devUser.email },
  });

  const root = existingByEmail
    ? await prisma.usuario.update({
        where: { email: devUser.email },
        data: { ...devUser, unidade_id: unidade.id },
      })
    : await prisma.usuario.upsert({
        where: { login: devUser.login },
        create: { ...devUser, unidade_id: unidade.id },
        update: { ...devUser, unidade_id: unidade.id },
      });

  console.log({ unidade, subprefeitura, setores: setores.length, usuario: root });
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
