import { ApiProperty } from "@nestjs/swagger";

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

export class IInterfaces {
  @ApiProperty()
  interface_sehab?: boolean = false
  @ApiProperty()
  interface_siurb?: boolean = false
  @ApiProperty()
  interface_smc?: boolean = false
  @ApiProperty()
  interface_smt?: boolean = false
  @ApiProperty()
  interface_svma?: boolean = false
  @ApiProperty()
  num_sehab?: string
  @ApiProperty()
  num_siurb?: string
  @ApiProperty()
  num_smc?: string
  @ApiProperty()
  num_smt?: string
  @ApiProperty()
  num_svma?: string
}

export class CreateAdmissibilidadeDto {
  @ApiProperty()
  inicial_id: number
  @ApiProperty()
  unidade_id: string
  @ApiProperty()
  data_envio: Date
  @ApiProperty()
  data_decisao_interlocutoria: Date
  @ApiProperty()
  parecer_admissibilidade_id?: string
  @ApiProperty()
  subprefeitura_id: string
  @ApiProperty()
  categoria_id: string
  @ApiProperty()
  status?: number
  interfaces?: IInterfaces
}

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
  data_limiteSmul?: Date;
  @ApiProperty()
  admissibilidade?: CreateAdmissibilidadeDto
}
