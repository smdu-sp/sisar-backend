import { PrismaClient } from '@prisma/client';
import { readFileSync } from 'fs';
import { join } from 'path';

const prisma = new PrismaClient();

interface PlanilhaPayload {
  meta: { arquivo: string; total_processos: number; gerado_em: string };
  alvara_tipos: string[];
  pareceres: string[];
  tecnicos: string[];
  processos: ProcessoImport[];
}

interface ProcessoImport {
  processo_fisico: string;
  sei: string;
  tecnico: string | null;
  data_protocolo: string | null;
  envio_admissibilidade: string | null;
  alvara_tipo: string;
  tipo_processo: number;
  status_inicial: number;
  associado_reforma: boolean;
  baixa_pagamento: number;
  obs: string | null;
  admissibilidade: {
    status: number;
    data_decisao_interlocutoria: string | null;
    data_envio: string | null;
    parecer: string | null;
    reconsiderado: boolean;
  };
  interfaces: Record<string, string | boolean | null> | null;
  reuniao: { data_reuniao: string; data_processo: string } | null;
  reconsideracao: {
    pedido_reconsideracao: string | null;
    publicacao: string | null;
    envio: string | null;
    parecer: boolean;
  } | null;
  suspensao: {
    inicio: string | null;
    final: string | null;
    motivo: number;
    etapa: number;
  } | null;
  conclusao: {
    deferido: boolean;
    num_alvara: string;
    obs: string;
    data_conclusao: string | null;
    data_emissao: string | null;
    data_resposta: string | null;
    outorga: boolean;
  } | null;
}

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

const DEFAULT_PRAZOS = {
  prazo_admissibilidade_smul: 15,
  reconsideracao_smul: 3,
  reconsideracao_smul_tipo: 0,
  analise_reconsideracao_smul: 15,
  prazo_analise_smul1: 30,
  prazo_analise_smul2: 30,
  prazo_emissao_alvara_smul: 0,
  prazo_admissibilidade_multi: 15,
  reconsideracao_multi: 3,
  reconsideracao_multi_tipo: 0,
  analise_reconsideracao_multi: 15,
  prazo_analise_multi1: 45,
  prazo_analise_multi2: 40,
  prazo_emissao_alvara_multi: 0,
  prazo_comunique_se: 0,
  prazo_encaminhar_coord: 0,
};

function parseDate(value: string | null | undefined): Date | undefined {
  if (!value) return undefined;
  const date = new Date(`${value}T12:00:00.000Z`);
  return Number.isNaN(date.getTime()) ? undefined : date;
}

function slugLogin(nome: string): string {
  return nome
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '.')
    .replace(/^\.+|\.+$/g, '');
}

async function ensureAdminDefault(): Promise<string> {
  const admin = await prisma.usuario.upsert({
    where: { login: 'd854440' },
    create: {
      login: 'd854440',
      nome: 'Bruno Luiz Vieira',
      email: 'blvieira@prefeitura.sp.gov.br',
      status: 1,
      permissao: 'DEV',
      cargo: 'ADM',
    },
    update: {},
  });
  return admin.id;
}

async function clearProcessData() {
  const tables = [
    'suspensoes_prazo',
    'reconsideracoes_admissibilidade',
    'reuniao_processos',
    'interfaces',
    'conclusoes',
    'distribuicoes',
    'admissibilidades',
    'motivos_inadmissao_inicial',
    'iniciais_sqls',
    'decisoes',
    'comunique_ses',
    'controles_prazo',
    'avisos',
    'pedidos_inicial',
    'iniciais',
  ];

  await prisma.$executeRawUnsafe('SET FOREIGN_KEY_CHECKS = 0');
  for (const table of tables) {
    await prisma.$executeRawUnsafe(`DELETE FROM \`${table}\``);
  }
  await prisma.$executeRawUnsafe('SET FOREIGN_KEY_CHECKS = 1');
}

async function seedReferencias(payload: PlanilhaPayload, adminId: string) {
  const alvaraMap = new Map<string, string>();
  for (const nome of payload.alvara_tipos) {
    const tipo = await prisma.alvara_Tipo.upsert({
      where: { nome },
      create: { nome, ...DEFAULT_PRAZOS },
      update: {},
    });
    alvaraMap.set(nome, tipo.id);
  }

  const parecerMap = new Map<string, string>();
  for (const parecer of payload.pareceres) {
    const registro = await prisma.parecer_Admissibilidade.upsert({
      where: { parecer },
      create: { parecer, status: 1 },
      update: {},
    });
    parecerMap.set(parecer, registro.id);
  }

  const tecnicoMap = new Map<string, string>();
  for (const nome of payload.tecnicos) {
    const login = slugLogin(nome);
    const email = `${login}@importacao.sisar.local`;
    const usuario = await prisma.usuario.upsert({
      where: { login },
      create: {
        login,
        nome,
        email,
        status: 1,
        permissao: 'USR',
        cargo: 'TEC',
      },
      update: { nome, cargo: 'TEC' },
    });
    tecnicoMap.set(nome, usuario.id);
  }

  const unidadeMap = new Map<string, string>();
  for (const u of UNIDADES_SETORIAIS) {
    const registro = await prisma.unidade.upsert({
      where: { sigla: u.sigla },
      create: { ...u, status: 1 },
      update: { nome: u.nome, codigo: u.codigo, status: 1 },
    });
    unidadeMap.set(u.sigla, registro.id);
  }

  return { alvaraMap, parecerMap, tecnicoMap, unidadeMap, adminId };
}

async function importProcessos(
  payload: PlanilhaPayload,
  refs: {
    alvaraMap: Map<string, string>;
    parecerMap: Map<string, string>;
    tecnicoMap: Map<string, string>;
    unidadeMap: Map<string, string>;
    adminId: string;
  },
) {
  const batchSize = 50;
  let imported = 0;

  for (let offset = 0; offset < payload.processos.length; offset += batchSize) {
    const batch = payload.processos.slice(offset, offset + batchSize);

    await prisma.$transaction(async (tx) => {
      for (const item of batch) {
        const alvaraTipoId =
          refs.alvaraMap.get(item.alvara_tipo) ??
          refs.alvaraMap.values().next().value;

        if (!alvaraTipoId) {
          throw new Error('Nenhum tipo de alvará disponível para importação.');
        }

        const inicial = await tx.inicial.create({
          data: {
            sei: item.sei,
            processo_fisico: item.processo_fisico.replace(/\D/g, ''),
            aprova_digital: '',
            requerimento: '001',
            tipo_requerimento: 1,
            data_protocolo: parseDate(item.data_protocolo) ?? new Date('2018-01-01'),
            envio_admissibilidade: parseDate(item.envio_admissibilidade),
            alvara_tipo_id: alvaraTipoId,
            tipo_processo: item.tipo_processo,
            status: item.status_inicial,
            pagamento: 1,
            associado_reforma: item.associado_reforma,
            requalifica_rapido: false,
            obs: item.obs ?? undefined,
            decreto: true,
          },
        });

        const parecerId = item.admissibilidade.parecer
          ? refs.parecerMap.get(item.admissibilidade.parecer)
          : undefined;

        const unidadeSigla = inferirUnidadeSiglaPorAlvara(item.alvara_tipo);
        const unidadeId = refs.unidadeMap.get(unidadeSigla);

        await tx.admissibilidade.create({
          data: {
            inicial_id: inicial.id,
            status: item.admissibilidade.status,
            data_envio: parseDate(item.admissibilidade.data_envio),
            data_decisao_interlocutoria: parseDate(
              item.admissibilidade.data_decisao_interlocutoria,
            ),
            parecer_admissibilidade_id: parecerId,
            reconsiderado: item.admissibilidade.reconsiderado,
            unidade_id: unidadeId,
          },
        });

        const tecnicoId = item.tecnico ? refs.tecnicoMap.get(item.tecnico) : undefined;

        await tx.distribuicao.create({
          data: {
            inicial_id: inicial.id,
            administrativo_responsavel_id: refs.adminId,
            tecnico_responsavel_id: tecnicoId,
            baixa_pagamento: item.baixa_pagamento,
            obs: item.obs ?? undefined,
          },
        });

        if (item.interfaces && item.tipo_processo === 2) {
          await tx.interface.create({
            data: {
              inicial_id: inicial.id,
              interface_sehab: Boolean(item.interfaces.interface_sehab),
              interface_siurb: Boolean(item.interfaces.interface_siurb),
              interface_smc: Boolean(item.interfaces.interface_smc),
              interface_smt: Boolean(item.interfaces.interface_smt),
              interface_svma: Boolean(item.interfaces.interface_svma),
              num_sehab: (item.interfaces.num_sehab as string) ?? undefined,
              num_siurb: (item.interfaces.num_siurb as string) ?? undefined,
              num_smc: (item.interfaces.num_smc as string) ?? undefined,
              num_smt: (item.interfaces.num_smt as string) ?? undefined,
              num_svma: (item.interfaces.num_svma as string) ?? undefined,
            },
          });
        }

        if (item.reuniao) {
          await tx.reuniao_Processo.create({
            data: {
              inicial_id: inicial.id,
              data_reuniao: parseDate(item.reuniao.data_reuniao) ?? new Date(),
              data_processo: parseDate(item.reuniao.data_processo) ?? new Date(),
            },
          });
        }

        if (item.reconsideracao) {
          await tx.reconsideracao_Admissibilidade.create({
            data: {
              inicial_id: inicial.id,
              envio: parseDate(item.reconsideracao.envio),
              publicacao: parseDate(item.reconsideracao.publicacao),
              pedido_reconsideracao: parseDate(item.reconsideracao.pedido_reconsideracao),
              parecer: item.reconsideracao.parecer,
            },
          });
        }

        if (item.suspensao?.inicio) {
          await tx.suspensao_Prazo.create({
            data: {
              inicial_id: inicial.id,
              inicio: parseDate(item.suspensao.inicio) ?? new Date(),
              final: parseDate(item.suspensao.final),
              motivo: item.suspensao.motivo,
              etapa: item.suspensao.etapa,
            },
          });
        }

        if (item.conclusao) {
          await tx.conclusao.create({
            data: {
              inicial_id: inicial.id,
              num_alvara: item.conclusao.num_alvara,
              obs: item.conclusao.obs,
              outorga: item.conclusao.outorga,
              data_conclusao: parseDate(item.conclusao.data_conclusao),
              data_emissao: parseDate(item.conclusao.data_emissao),
              data_resposta: parseDate(item.conclusao.data_resposta),
            },
          });
        }

        imported += 1;
      }
    });

    console.log(`Importados ${Math.min(offset + batchSize, payload.processos.length)}/${payload.processos.length}`);
  }

  return imported;
}

async function main() {
  const jsonPath = join(__dirname, 'data', 'planilha-import.json');
  const payload = JSON.parse(readFileSync(jsonPath, 'utf-8')) as PlanilhaPayload;

  console.log(`Arquivo: ${payload.meta.arquivo}`);
  console.log(`Processos no JSON: ${payload.meta.total_processos}`);

  const adminId = await ensureAdminDefault();
  console.log('Limpando dados de processos existentes...');
  await clearProcessData();

  console.log('Cadastrando referências (alvarás, pareceres, técnicos)...');
  const refs = await seedReferencias(payload, adminId);

  console.log('Importando processos...');
  const total = await importProcessos(payload, refs);

  const resumo = {
    iniciais: await prisma.inicial.count(),
    admissibilidades: await prisma.admissibilidade.count(),
    distribuicoes: await prisma.distribuicao.count(),
    interfaces: await prisma.interface.count(),
    reunioes: await prisma.reuniao_Processo.count(),
    conclusoes: await prisma.conclusao.count(),
    alvaraTipos: await prisma.alvara_Tipo.count(),
    usuarios: await prisma.usuario.count(),
  };

  console.log('Importação concluída.');
  console.log(resumo);
  console.log(`Total importado nesta execução: ${total}`);
}

main()
  .catch(async (error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
