import { ApiProperty } from "@nestjs/swagger";
import { Inicial } from "@prisma/client";

export class AvisosResponseDTO {
  @ApiProperty()
  id: string;
  @ApiProperty()
  titulo: string;
  @ApiProperty()
  descricao: string;
  @ApiProperty()
  data: Date;
  @ApiProperty()
  usuario_id: string | null;
  @ApiProperty()
  inicial_id: number;
  @ApiProperty()
  criado_em: Date;
  @ApiProperty()
  alterado_em: Date;
}

export class AvisosPorDataResponseDTO {
  inicial: Inicial;
}
