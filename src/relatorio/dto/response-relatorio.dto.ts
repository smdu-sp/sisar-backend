import { ApiProperty } from "@nestjs/swagger";

export class Data {
  @ApiProperty()
  nome: string;
  @ApiProperty()
  count: number;
}

export class Smul_Graproem {
  @ApiProperty()
  quantidade: number;
  @ApiProperty()
  data: Data[];
}

export class RelatorioData {
  @ApiProperty()
  smul: Smul_Graproem;
  @ApiProperty()
  graproem: Smul_Graproem;
  @ApiProperty()
  total_parcial: number;
}

export class RelatorioResopnseDto {
  @ApiProperty()
  total: number;
  @ApiProperty()
  analise: number;
  @ApiProperty()
  inadimissiveis: number;
  @ApiProperty()
  admissiveis: number;
  @ApiProperty()
  data_gerado: string;
  @ApiProperty()
  em_analise?: RelatorioData;
  @ApiProperty()
  deferidos?: RelatorioData;
  @ApiProperty()
  indeferidos?: RelatorioData;
}
