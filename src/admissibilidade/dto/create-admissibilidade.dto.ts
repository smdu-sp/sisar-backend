import { ApiProperty } from "@nestjs/swagger"

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
    parecer: number
    @ApiProperty()
    subprefeitura_id: string
    @ApiProperty()
    categoria_id: string
    @ApiProperty()
    status?: number
    interfaces?: IInterfaces
    @ApiProperty()
    tipo_processo?: number
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
