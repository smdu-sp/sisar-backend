/**
 * Preenche/atualiza prazos dos tipos de alvará conforme a planilha institucional.
 * Uso: npx ts-node prisma/scripts/seed-prazos-planilha.ts
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const COMUM = {
	reconsideracao_smul: 3,
	reconsideracao_smul_tipo: 0,
	analise_reconsideracao_smul: 15,
	prazo_emissao_alvara_smul: 10,
	prazo_admissibilidade_multi: 15,
	reconsideracao_multi: 3,
	reconsideracao_multi_tipo: 0,
	analise_reconsideracao_multi: 15,
	prazo_emissao_alvara_multi: 10,
	prazo_comunique_se: 0,
	prazo_encaminhar_coord: 5,
	status: 1,
};

const TIPOS: Array<{
	nome: string;
	prazo_analise_smul1: number;
	prazo_analise_smul2: number;
	prazo_analise_multi1: number;
	prazo_analise_multi2: number;
	prazo_admissibilidade_smul: number;
}> = [
	{
		nome: 'Alvará de Aprovação de Edificação Nova',
		prazo_analise_smul1: 50,
		prazo_analise_smul2: 30,
		prazo_analise_multi1: 60,
		prazo_analise_multi2: 25,
		prazo_admissibilidade_smul: 15,
	},
	{
		nome: 'Alvará de Aprovação de Reforma',
		prazo_analise_smul1: 50,
		prazo_analise_smul2: 30,
		prazo_analise_multi1: 60,
		prazo_analise_multi2: 25,
		prazo_admissibilidade_smul: 15,
	},
	{
		nome: 'Alvará de Execução de Edificação Nova',
		prazo_analise_smul1: 50,
		prazo_analise_smul2: 30,
		prazo_analise_multi1: 60,
		prazo_analise_multi2: 55,
		prazo_admissibilidade_smul: 15,
	},
	{
		nome: 'Alvará de Execução de Reforma',
		prazo_analise_smul1: 50,
		prazo_analise_smul2: 30,
		prazo_analise_multi1: 60,
		prazo_analise_multi2: 55,
		prazo_admissibilidade_smul: 15,
	},
	{
		nome: 'Alvará de Aprovação e Execução de Edificação Nova',
		prazo_analise_smul1: 60,
		prazo_analise_smul2: 30,
		prazo_analise_multi1: 60,
		prazo_analise_multi2: 55,
		prazo_admissibilidade_smul: 15,
	},
	{
		nome: 'Alvará de Aprovação e Execução de Reforma',
		prazo_analise_smul1: 60,
		prazo_analise_smul2: 30,
		prazo_analise_multi1: 60,
		prazo_analise_multi2: 55,
		prazo_admissibilidade_smul: 15,
	},
	{
		nome: 'Projeto Modificativo (que não é Requalificação)',
		prazo_analise_smul1: 60,
		prazo_analise_smul2: 30,
		prazo_analise_multi1: 60,
		prazo_analise_multi2: 55,
		prazo_admissibilidade_smul: 15,
	},
	{
		nome: 'Alvará de Aprovação de Requalificação - Área envoltória',
		prazo_analise_smul1: 50,
		prazo_analise_smul2: 30,
		prazo_analise_multi1: 60,
		prazo_analise_multi2: 30,
		prazo_admissibilidade_smul: 25,
	},
	{
		nome: 'Alvará de Aprovação e Execução de Requalificação - área envoltória',
		prazo_analise_smul1: 50,
		prazo_analise_smul2: 30,
		prazo_analise_multi1: 60,
		prazo_analise_multi2: 60,
		prazo_admissibilidade_smul: 25,
	},
	{
		nome: 'Alvará de Execução de Requalificação - área envoltória',
		prazo_analise_smul1: 50,
		prazo_analise_smul2: 30,
		prazo_analise_multi1: 60,
		prazo_analise_multi2: 60,
		prazo_admissibilidade_smul: 25,
	},
	{
		nome: 'Projeto Modificativo de Requalificação - área envoltória',
		prazo_analise_smul1: 50,
		prazo_analise_smul2: 30,
		prazo_analise_multi1: 60,
		prazo_analise_multi2: 60,
		prazo_admissibilidade_smul: 25,
	},
	{
		nome: 'Alvará de Aprovação de Requalificação - bem tombado',
		prazo_analise_smul1: 50,
		prazo_analise_smul2: 30,
		prazo_analise_multi1: 60,
		prazo_analise_multi2: 60,
		prazo_admissibilidade_smul: 25,
	},
	{
		nome: 'Alvará de Aprovação e Execução de Requalificação - bem tombado',
		prazo_analise_smul1: 50,
		prazo_analise_smul2: 30,
		prazo_analise_multi1: 60,
		prazo_analise_multi2: 60,
		prazo_admissibilidade_smul: 25,
	},
	{
		nome: 'Alvará de Execução de Requalificação - bem tombado',
		prazo_analise_smul1: 50,
		prazo_analise_smul2: 30,
		prazo_analise_multi1: 60,
		prazo_analise_multi2: 60,
		prazo_admissibilidade_smul: 25,
	},
	{
		nome: 'Projeto Modificativo de Requalificação - bem tombado',
		prazo_analise_smul1: 50,
		prazo_analise_smul2: 30,
		prazo_analise_multi1: 60,
		prazo_analise_multi2: 60,
		prazo_admissibilidade_smul: 25,
	},
	{
		nome: 'Alvará de Aprovação de Requalificação',
		prazo_analise_smul1: 30,
		prazo_analise_smul2: 30,
		prazo_analise_multi1: 30,
		prazo_analise_multi2: 20,
		prazo_admissibilidade_smul: 15,
	},
	{
		nome: 'Alvará de Aprovação e Execução de Requalificação',
		prazo_analise_smul1: 30,
		prazo_analise_smul2: 30,
		prazo_analise_multi1: 60,
		prazo_analise_multi2: 60,
		prazo_admissibilidade_smul: 25,
	},
	{
		nome: 'Alvará de Execução de Requalificação',
		prazo_analise_smul1: 30,
		prazo_analise_smul2: 30,
		prazo_analise_multi1: 60,
		prazo_analise_multi2: 60,
		prazo_admissibilidade_smul: 25,
	},
	{
		nome: 'Projeto Modificativo de requalificação',
		prazo_analise_smul1: 30,
		prazo_analise_smul2: 30,
		prazo_analise_multi1: 60,
		prazo_analise_multi2: 60,
		prazo_admissibilidade_smul: 25,
	},
	{
		nome: 'Certificado de Regularização',
		prazo_analise_smul1: 30,
		prazo_analise_smul2: 30,
		prazo_analise_multi1: 60,
		prazo_analise_multi2: 60,
		prazo_admissibilidade_smul: 25,
	},
];

async function main() {
	for (const tipo of TIPOS) {
		await prisma.alvara_Tipo.upsert({
			where: { nome: tipo.nome },
			create: {
				nome: tipo.nome,
				...tipo,
				prazo_admissibilidade_multi: tipo.prazo_admissibilidade_smul,
				...COMUM,
			},
			update: {
				...tipo,
				prazo_admissibilidade_multi: tipo.prazo_admissibilidade_smul,
				...COMUM,
			},
		});
		console.log(`OK: ${tipo.nome}`);
	}
	console.log(`\n${TIPOS.length} tipos de alvará atualizados com prazos da planilha.`);
}

main()
	.catch((e) => {
		console.error(e);
		process.exit(1);
	})
	.finally(() => prisma.$disconnect());
