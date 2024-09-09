import { ApiProperty } from "@nestjs/swagger";

export class DistribuicaoResponseDTO {
    @ApiProperty()
    inicial_id: number;
    @ApiProperty()
    tecnico_responsavel_id: string | null;
    @ApiProperty()
    administrativo_responsavel_id: string;
    @ApiProperty()
    processo_relacionado_incomum: string | null;
    @ApiProperty()
    assunto_processo_relacionado_incomum: string | null;
    @ApiProperty()
    baixa_pagamento: number;
    @ApiProperty()
    obs: string | null;
    @ApiProperty()
    criado_em: Date;
    @ApiProperty()
    alterado_em: Date;
}
