import { ApiProperty } from "@nestjs/swagger";

export class ParecerAdmissibilidadeResponseDTO {
    @ApiProperty()
    id: string;
    @ApiProperty()
    parecer: string;
    @ApiProperty()
    status: number;
    @ApiProperty()
    criado_em: Date;
    @ApiProperty()
    alterado_em: Date;
}

export class ParecerAdmissibilidadePaginadoDTO {
    @ApiProperty()
    total: number;
    @ApiProperty()
    pagina: number;
    @ApiProperty()
    limite: number;
    @ApiProperty()
    data?: ParecerAdmissibilidadeResponseDTO[]
}
