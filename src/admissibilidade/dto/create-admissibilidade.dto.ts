export class CreateAdmissibilidadeDto {
    inicial_id: number
    unidade_id: string
    data_envio: Date
    data_decisao_interlocutoria: Date
    parecer: number
    subprefeitura_id: string
    categoria_id: string
    status?: number
    interfaces?: IInterfaces
    tipo_processo?: number
}

export class IInterfaces {
    interface_sehab?: boolean = false
    interface_siurb?: boolean = false
    interface_smc?: boolean = false
    interface_smt?: boolean = false
    interface_svma?: boolean = false
    num_sehab?: string
    num_siurb?: string
    num_smc?: string
    num_smt?: string
    num_svma?: string
}
