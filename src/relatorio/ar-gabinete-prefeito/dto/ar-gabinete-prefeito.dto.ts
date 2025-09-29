import { Decimal } from "@prisma/client/runtime/library";
import { $Enums } from "@prisma/client";

// Use Prisma's enum directly
type Zona = $Enums.Zona;

export class InicialGabinetePrefeitoDto {
    id: number;
    decreto: boolean;
    sei: string;
    tipo_requerimento: number;
    requerimento: string;
    aprova_digital: string;
    processo_fisico: string;
    data_protocolo: Date;
    envio_admissibilidade: Date;
    alvara_tipo_id: string;
    tipo_processo: number;
    obs: string;
    status: number;
    pagamento: number;
    requalifica_rapido: boolean;
    associado_reforma: boolean;
    data_limiteSmul: Date;
    data_limiteMulti: Date;
    criado_em: Date;
    alterado_em: Date;
    autor_projeto_id: string;
    responsavel_tecnico_id: string;
    proprietario_id: string;
    area: Decimal;
    resumo_projeto: string | null;
    zona: Zona;
    numero_do_processo?: string;
    tempo_de_analise_pedido_inicial?: number | null;
}

export class RelatorioGabinetePrefeitoDto {
    ano: number;
    dados: InicialGabinetePrefeitoDto[];
}
