
export const calcularDiferencaEmDias = (dataInicio: Date, dataFim: Date): number => {
    const umDiaEmMilissegundos = 1000 * 60 * 60 * 24;
    return Math.floor((dataFim.getTime() - dataInicio.getTime()) / umDiaEmMilissegundos);
};