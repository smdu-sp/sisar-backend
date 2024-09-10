import { ApiProperty } from "@nestjs/swagger";
import { Admissibilidade } from "@prisma/client";

export class CreateResponseAdmissibilidadeDTO {
    @ApiProperty()
    inicial_id: number;
    @ApiProperty()
    unidade_id: string;
    @ApiProperty()
    data_envio: Date;
    @ApiProperty()
    data_decisao_interlocutoria: Date;
    @ApiProperty()
    parecer: number;
    @ApiProperty()
    subprefeitura_id: string;
    @ApiProperty()
    categoria_id: string;
    @ApiProperty()
    status: number;
    @ApiProperty()
    reconsiderado: boolean;
    @ApiProperty()
    motivo: number;
    @ApiProperty()
    criado_em: Date;
    @ApiProperty()
    alterado_em: Date;
}

export class AdmissibilidadeResponseDTO {
    @ApiProperty()
    inicial_id: number;
    @ApiProperty()
    unidade_id: string;
    @ApiProperty()
    data_envio: Date;
    @ApiProperty()
    data_decisao_interlocutoria: Date;
    @ApiProperty()
    parecer: number;
    @ApiProperty()
    subprefeitura_id: string;
    @ApiProperty()
    categoria_id: string;
    @ApiProperty()
    status: number;
    @ApiProperty()
    reconsiderado: boolean;
    @ApiProperty()
    motivo: number;
    @ApiProperty()
    criado_em: Date;
    @ApiProperty()
    alterado_em: Date;
}

export class AdmissibilidadePaginado {
    @ApiProperty()
    data: Admissibilidade[];
    @ApiProperty()
    total: number;
    @ApiProperty()
    pagina: number;
    @ApiProperty()
    limite: number;
}
