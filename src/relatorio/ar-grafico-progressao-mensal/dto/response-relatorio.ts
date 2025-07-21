import { ApiProperty } from "@nestjs/swagger";


export class MesDataItem {
    @ApiProperty({
        description: 'Valor de contagem ou total para o mês.',
        example: 0,
    })
    count: number;
}

export class MesData {
    @ApiProperty({
        description: 'O ano ao qual os dados se referem.',
        example: 2024,
    })
    ano: number;

    @ApiProperty({
        description: 'Array contendo o total de ocorrências para cada mês (0 = Janeiro, 11 = Dezembro).',
        type: [Number],
        example: [0, 0, 0, 0, 0, 0, 6, 2, 0, 2, 1, 3],
    })
    mes: number[];

    @ApiProperty({
        description: 'Array contendo o total acumulado para cada mês.',
        type: [Number],
        example: [0, 0, 0, 0, 0, 0, 6, 8, 8, 10, 11, 14],
    })
    acc: number[];
}


export class ProgressaoMensalResponseDto {
    @ApiProperty({
        description: 'Lista de objetos contendo os dados de progressão mensal para cada ano no período solicitado.',
        type: [MesData],
        example: [
            {
                "ano": 2024,
                "mes": [0, 0, 0, 0, 0, 0, 6, 2, 0, 2, 1, 3],
                "acc": [0, 0, 0, 0, 0, 0, 6, 8, 8, 10, 11, 14]
            },
            {
                "ano": 2025,
                "mes": [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                "acc": [14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14]
            }
        ]
    })

    count: MesDataItem;
    data: MesData;



}