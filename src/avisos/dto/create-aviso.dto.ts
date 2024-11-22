import { ApiProperty } from "@nestjs/swagger"

export class CreateAvisoDto {
  @ApiProperty()
  id: string
  @ApiProperty()
  titulo?: string
  @ApiProperty()
  descricao?: string
  @ApiProperty()
  data?: Date
  @ApiProperty()
  usuario_id?: string
  @ApiProperty()
  inicial_id: number
  @ApiProperty()
  tipo?: number
}
