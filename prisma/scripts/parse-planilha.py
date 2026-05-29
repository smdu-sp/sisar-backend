#!/usr/bin/env python3
"""Converte a planilha XLSB do SISAR em JSON para importação no banco."""

import json
import re
import sys
from collections import defaultdict
from datetime import datetime, timedelta
from pathlib import Path

import pyxlsb

DEFAULT_XLSB = Path(r"c:\Users\d854440\Downloads\Controle de Processos_ ASSEC_3753.xlsb")
OUTPUT = Path(__file__).resolve().parent.parent / "data" / "planilha-import.json"

COL = {
    "processo": 3,
    "sei": 4,
    "tecnico": 5,
    "data_protocolo": 6,
    "data_recebimento": 7,
    "secretaria": 8,
    "tipo_alvara": 9,
    "associado_reforma": 10,
    "baixa_pagamento": 11,
    "data_publicacao_adm": 12,
    "reconsideracao_pedido": 14,
    "reconsideracao_recebimento": 15,
    "reconsideracao_publicacao": 16,
    "status_adm": 17,
    "razao_inadmissibilidade": 18,
    "check_multiplas": 22,
    "data_reuniao_1": 24,
    "nova_data_reuniao_1": 25,
    "parecer_pos_analise": 29,
    "parecer_graproem_1": 30,
    "data_resposta_comunique": 31,
    "data_reuniao_2": 35,
    "nova_data_reuniao_2": 36,
    "parecer_pos_comunique": 39,
    "decisao_final": 40,
    "data_1r": 41,
    "data_2r": 42,
    "suspensao_houve": 43,
    "suspensao_inicio": 44,
    "suspensao_fim": 45,
    "suspensao_dias": 46,
    "suspensao_motivo": 47,
    "obs": 48,
}

SECRETARIAS_INTERFACE = {
    "SEHAB": ("interface_sehab", "num_sehab"),
    "SIURB": ("interface_siurb", "num_siurb"),
    "SMC": ("interface_smc", "num_smc"),
    "SMT": ("interface_smt", "num_smt"),
    "SVMA": ("interface_svma", "num_svma"),
}

DEFAULT_PRAZOS = {
    "prazo_admissibilidade_smul": 15,
    "reconsideracao_smul": 3,
    "reconsideracao_smul_tipo": 0,
    "analise_reconsideracao_smul": 15,
    "prazo_analise_smul1": 30,
    "prazo_analise_smul2": 30,
    "prazo_emissao_alvara_smul": 0,
    "prazo_admissibilidade_multi": 15,
    "reconsideracao_multi": 3,
    "reconsideracao_multi_tipo": 0,
    "analise_reconsideracao_multi": 15,
    "prazo_analise_multi1": 45,
    "prazo_analise_multi2": 40,
    "prazo_emissao_alvara_multi": 0,
    "prazo_comunique_se": 0,
    "prazo_encaminhar_coord": 0,
}


def excel_date(value):
    if value is None or value == "":
        return None
    if isinstance(value, (int, float)):
        dt = datetime(1899, 12, 30) + timedelta(days=float(value))
        return dt.strftime("%Y-%m-%d")
    if isinstance(value, datetime):
        return value.strftime("%Y-%m-%d")
    text = str(value).strip()
    if not text:
        return None
    return text


def normalize_sei(value):
    if value is None:
        return None
    digits = re.sub(r"\D", "", str(value))
    if len(digits) < 8:
        return None
    return digits


def synthetic_sei(processo_fisico):
    digits = re.sub(r"\D", "", processo_fisico)
    return digits.zfill(18)[-18:]


def normalize_text(value):
    if value is None:
        return None
    text = str(value).strip()
    return text or None


def is_sim(value):
    if value is None:
        return False
    return str(value).strip().upper() in {"SIM", "S", "YES", "TRUE", "1"}


def map_tipo_processo(check_multiplas):
    if not check_multiplas:
        return 1
    return 2 if str(check_multiplas).strip().lower().startswith("multi") else 1


def map_status_admissibilidade(status_text, reconsideracao):
    text = (status_text or "").strip().lower()
    if reconsideracao:
        return 3
    if "inadmiss" in text:
        return 2
    if "admiss" in text:
        return 0
    if "análise" in text or "analise" in text:
        return 1
    return 1


def map_status_inicial(status_adm_text, decisao_final, reconsideracao_ativa):
    decisao = (decisao_final or "").strip().lower()
    adm = (status_adm_text or "").strip().lower()

    if "via ordin" in decisao:
        return 1
    if "indefer" in decisao:
        return 4
    if "defer" in decisao:
        return 3
    if "inadmiss" in adm and not reconsideracao_ativa:
        return 1
    if "admiss" in adm:
        return 2
    if reconsideracao_ativa:
        return 0
    return 0


def build_interfaces(rows):
    interfaces = {
        "interface_sehab": False,
        "interface_siurb": False,
        "interface_smc": False,
        "interface_smt": False,
        "interface_svma": False,
        "num_sehab": None,
        "num_siurb": None,
        "num_smc": None,
        "num_smt": None,
        "num_svma": None,
    }
    for row in rows:
        secretaria = normalize_text(row[COL["secretaria"]])
        if secretaria not in SECRETARIAS_INTERFACE:
            continue
        flag_key, num_key = SECRETARIAS_INTERFACE[secretaria]
        sei = normalize_sei(row[COL["sei"]])
        if sei:
            interfaces[flag_key] = True
            interfaces[num_key] = sei
    return interfaces


def parse_workbook(path: Path):
    grouped = defaultdict(list)
    with pyxlsb.open_workbook(str(path)) as workbook:
        with workbook.get_sheet("Painel_Controle") as sheet:
            for index, row in enumerate(sheet.rows()):
                if index < 10:
                    continue
                values = [cell.v for cell in row]
                processo = normalize_text(values[COL["processo"]])
                if processo:
                    grouped[processo].append(values)

    alvara_tipos = set()
    pareceres = set()
    tecnicos = set()
    processos = []

    for processo_fisico, rows in grouped.items():
        smul_row = next((row for row in rows if row[COL["secretaria"]] == "SMUL"), rows[0])

        tipo_alvara = normalize_text(smul_row[COL["tipo_alvara"]]) or "Outro"
        alvara_tipos.add(tipo_alvara)

        tecnico = normalize_text(smul_row[COL["tecnico"]])
        if tecnico:
            tecnicos.add(tecnico)

        razao = normalize_text(smul_row[COL["razao_inadmissibilidade"]])
        if razao and razao.upper() != "N/A":
            pareceres.add(razao)

        sei = normalize_sei(smul_row[COL["sei"]]) or synthetic_sei(processo_fisico)
        reconsideracao = is_sim(smul_row[COL["reconsideracao_pedido"]])
        status_adm_text = normalize_text(smul_row[COL["status_adm"]])
        decisao_final = normalize_text(smul_row[COL["decisao_final"]])
        check_multi = normalize_text(smul_row[COL["check_multiplas"]])
        tipo_processo = map_tipo_processo(check_multi)

        data_reuniao = excel_date(smul_row[COL["nova_data_reuniao_1"]] or smul_row[COL["data_reuniao_1"]])
        data_processo = excel_date(smul_row[COL["data_2r"]] or smul_row[COL["data_1r"]] or smul_row[COL["data_reuniao_1"]])

        reuniao = None
        if data_reuniao and tipo_processo == 2:
            reuniao = {
                "data_reuniao": data_reuniao,
                "data_processo": data_processo or data_reuniao,
            }

        reconsideracao_data = None
        if reconsideracao:
            reconsideracao_data = {
                "pedido_reconsideracao": excel_date(smul_row[COL["reconsideracao_recebimento"]]),
                "publicacao": excel_date(smul_row[COL["reconsideracao_publicacao"]]),
                "envio": excel_date(smul_row[COL["data_publicacao_adm"]]),
                "parecer": False,
            }

        suspensao = None
        if is_sim(smul_row[COL["suspensao_houve"]]):
            suspensao = {
                "inicio": excel_date(smul_row[COL["suspensao_inicio"]]),
                "final": excel_date(smul_row[COL["suspensao_fim"]]),
                "motivo": 0,
                "etapa": 2,
            }

        conclusao = None
        decisao_lower = (decisao_final or "").lower()
        if "defer" in decisao_lower or "indefer" in decisao_lower:
            conclusao = {
                "deferido": "indefer" not in decisao_lower,
                "num_alvara": processo_fisico,
                "obs": normalize_text(smul_row[COL["obs"]]) or "",
                "data_conclusao": excel_date(smul_row[COL["data_2r"]] or smul_row[COL["data_1r"]]),
                "data_emissao": excel_date(smul_row[COL["data_2r"]] or smul_row[COL["data_1r"]]),
                "data_resposta": excel_date(smul_row[COL["data_resposta_comunique"]]),
                "outorga": False,
            }

        processos.append(
            {
                "processo_fisico": processo_fisico,
                "sei": sei,
                "tecnico": tecnico,
                "data_protocolo": excel_date(smul_row[COL["data_protocolo"]]),
                "envio_admissibilidade": excel_date(smul_row[COL["data_recebimento"]]),
                "alvara_tipo": tipo_alvara,
                "tipo_processo": tipo_processo,
                "status_inicial": map_status_inicial(status_adm_text, decisao_final, reconsideracao),
                "associado_reforma": is_sim(smul_row[COL["associado_reforma"]]),
                "baixa_pagamento": 1 if is_sim(smul_row[COL["baixa_pagamento"]]) else 0,
                "obs": normalize_text(smul_row[COL["obs"]]),
                "admissibilidade": {
                    "status": map_status_admissibilidade(status_adm_text, reconsideracao),
                    "data_decisao_interlocutoria": excel_date(smul_row[COL["data_publicacao_adm"]]),
                    "data_envio": excel_date(smul_row[COL["data_recebimento"]]),
                    "parecer": razao if razao and razao.upper() != "N/A" else None,
                    "reconsiderado": reconsideracao,
                },
                "interfaces": build_interfaces(rows) if tipo_processo == 2 else None,
                "reuniao": reuniao,
                "reconsideracao": reconsideracao_data,
                "suspensao": suspensao,
                "conclusao": conclusao,
            }
        )

    return {
        "meta": {
            "arquivo": path.name,
            "total_processos": len(processos),
            "gerado_em": datetime.now().isoformat(),
        },
        "alvara_tipos": sorted(alvara_tipos),
        "pareceres": sorted(pareceres),
        "tecnicos": sorted(tecnicos),
        "processos": processos,
    }


def main():
    source = Path(sys.argv[1]) if len(sys.argv) > 1 else DEFAULT_XLSB
    if not source.exists():
        print(f"Arquivo não encontrado: {source}", file=sys.stderr)
        sys.exit(1)

    payload = parse_workbook(source)
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"JSON gerado: {OUTPUT}")
    print(f"Processos: {payload['meta']['total_processos']}")
    print(f"Tipos de alvará: {len(payload['alvara_tipos'])}")
    print(f"Técnicos: {len(payload['tecnicos'])}")


if __name__ == "__main__":
    main()
