/** Cálculo de datas de reunião GRAPROEM (espelha regra de inicial.geraReuniaoData). */

type AlvaraPrazosMulti = {
  prazo_analise_multi1: number;
  prazo_analise_multi2: number;
  prazo_admissibilidade_multi: number;
  prazo_emissao_alvara_multi: number;
};

export function pegaQuartaAnterior(data: Date): Date {
  const diaSemana = data.getDay();
  if (diaSemana === 3) return new Date(data);

  const quarta = new Date(data);
  switch (diaSemana) {
    case 0:
      quarta.setDate(data.getDate() - 4);
      break;
    case 1:
      quarta.setDate(data.getDate() - 5);
      break;
    case 2:
      quarta.setDate(data.getDate() - 6);
      break;
    case 4:
      quarta.setDate(data.getDate() - 1);
      break;
    case 5:
      quarta.setDate(data.getDate() - 2);
      break;
    case 6:
      quarta.setDate(data.getDate() - 3);
      break;
    default:
      quarta.setDate(data.getDate() - 7);
      break;
  }
  return quarta;
}

export function prazoAnaliseInstancia(
  instancia: number,
  alvara: AlvaraPrazosMulti,
): number {
  const prazos = [
    alvara.prazo_analise_multi1,
    alvara.prazo_analise_multi2,
    alvara.prazo_analise_multi2,
  ];
  return prazos[Math.min(Math.max(instancia, 1), 3) - 1] ?? prazos[0];
}

export function calcularDatasReuniaoGraproem(
  envioAdmissibilidade: Date,
  alvara: AlvaraPrazosMulti,
  instancia: number = 1,
): { data_reuniao: Date; data_processo: Date } {
  const marco = new Date(envioAdmissibilidade);
  marco.setDate(marco.getDate() + prazoAnaliseInstancia(instancia, alvara));

  const data_reuniao = pegaQuartaAnterior(marco);
  data_reuniao.setUTCHours(0, 0, 0, 0);

  const data_processo = new Date(envioAdmissibilidade);
  data_processo.setDate(
    data_processo.getDate() +
      alvara.prazo_admissibilidade_multi +
      alvara.prazo_analise_multi1 +
      alvara.prazo_analise_multi2 +
      alvara.prazo_emissao_alvara_multi,
  );
  data_processo.setUTCHours(0, 0, 0, 0);

  return { data_reuniao, data_processo };
}
