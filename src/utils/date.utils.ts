
export const calcularDiferencaEmDias = (dataInicio: Date, dataFim: Date): number => {
    const umDiaEmMilissegundos = 1000 * 60 * 60 * 24;
    return Math.floor((dataFim.getTime() - dataInicio.getTime()) / umDiaEmMilissegundos);
};

export const formatadorDeDatas = (data: Date) => {
    const dia = String(data.getDate()).padStart(2, '0');
    const mes = String(data.getMonth() + 1).padStart(2, '0');
    const ano = data.getFullYear();
    return `${dia}/${mes}/${ano}`;
}