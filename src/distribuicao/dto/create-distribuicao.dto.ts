import { ApiProperty } from "@nestjs/swagger";

export class CreateDistribuicaoDto {
    @ApiProperty()
    inicial_id: number;
    @ApiProperty()
    tecnico_responsavel_id: string;
    @ApiProperty()
    administrativo_responsavel_id: string;
    @ApiProperty()
    processo_relacionado_incomum?: string;
    @ApiProperty()
    assunto_processo_relacionado_incomum?: string;
    @ApiProperty()
    baixa_pagamento?: number;
    @ApiProperty()
    obs?: string;
}
