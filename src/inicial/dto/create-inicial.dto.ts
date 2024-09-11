import { ApiProperty } from "@nestjs/swagger";

export class CreateInicialDto {
    @ApiProperty()
    id?: number;
    @ApiProperty()
    decreto: boolean = false;
    @ApiProperty()
    sei: string;
    @ApiProperty()
    tipo_requerimento: number;
    @ApiProperty()
    requerimento: string;
    @ApiProperty()
    aprova_digital: string;
    @ApiProperty()
    processo_fisico: string;
    @ApiProperty()
    data_protocolo: Date;
    @ApiProperty()
    envio_admissibilidade: Date;
    @ApiProperty()
    alvara_tipo_id: string;
    @ApiProperty()
    tipo_processo: number;
    @ApiProperty()
    obs?: string;
    @ApiProperty()
    status?: number;
    @ApiProperty()
    requalifica_rapido: boolean = false;
    @ApiProperty()
    associado_reforma: boolean = false;
    @ApiProperty()
    nums_sql?: string[];
    @ApiProperty()
    interfaces?: any;
    @ApiProperty()
    data_limteSmul?: Date;
}

export class CreateInterfacesDto {
  @ApiProperty()
  inicial_id?: number;
  @ApiProperty()
  interface_sehab?: boolean = false;
  @ApiProperty()
  interface_siurb?: boolean = false;
  @ApiProperty()
  interface_smc?: boolean = false;
  @ApiProperty()
  interface_smt?: boolean = false;
  @ApiProperty()
  interface_svma?: boolean = false;
  @ApiProperty()
  num_sehab?: string;
  @ApiProperty()
  num_siurb?: string;
  @ApiProperty()
  num_smc?: string;
  @ApiProperty()
  num_smt?: string;
  @ApiProperty()
  num_svma?: string;
}
