"""Validador do contrato ``dados.json`` (schema + invariantes).

NÃO recalcula scoring — o motor é o cowork (skill ``growth-rpg-producer`` /
``produtividade-clickup-ultra``). Este módulo só garante que o ``dados.json`` recebido é
bem-formado e honra os invariantes inegociáveis antes do app consumir.
"""
from __future__ import annotations

import json
from pathlib import Path

from jsonschema import Draft202012Validator

ROOT = Path(__file__).resolve().parents[1]
SCHEMA_PATH = ROOT / "config" / "schema" / "dados.schema.json"

FRENTES = ("operacional", "projeto", "analise")
# Campos que combinariam frentes / criariam total por pessoa — proibidos.
CAMPOS_PROIBIDOS = (
    "xp_total_pessoa", "nivel_total", "pontos_totais", "xp_total_geral", "ranking_geral",
)


def _load(path: str | Path) -> dict:
    return json.loads(Path(path).read_text(encoding="utf-8"))


def validar(dados: dict, schema: dict | None = None) -> list[str]:
    """Retorna lista de erros (vazia = válido)."""
    erros: list[str] = []
    schema = schema if schema is not None else _load(SCHEMA_PATH)

    # 1. Schema
    for e in Draft202012Validator(schema).iter_errors(dados):
        erros.append(f"schema: {list(e.path)} — {e.message}")

    # 2. Invariantes por pessoa (nunca somar entre frentes; vazão coerente)
    for p in dados.get("pessoas", []):
        nome = p.get("nome", "?")
        for campo in CAMPOS_PROIBIDOS:
            if campo in p:
                erros.append(f"invariante: pessoa '{nome}' tem campo que soma frentes: {campo}")
        if set(p.get("frentes", {})) != set(FRENTES):
            erros.append(f"invariante: pessoa '{nome}' deve ter exatamente as frentes {FRENTES}")
        dias = p.get("dias_disponiveis", 0)
        for f, fd in p.get("frentes", {}).items():
            entregue = fd.get("entregue_quinzena", 0)
            esperado = round(entregue / dias, 2) if dias else 0
            if fd.get("vazao_quinzena") != esperado:
                erros.append(
                    f"invariante: vazão '{nome}/{f}' = {fd.get('vazao_quinzena')} != {esperado}"
                )

    # 3. de-dup do guild (total <= soma das contribuições)
    for f, g in dados.get("guild", {}).items():
        if not isinstance(g, dict) or "contribuicoes_quinzena" not in g:
            continue
        total = g.get("total_equipe_quinzena", 0)
        soma = sum(g.get("contribuicoes_quinzena", {}).values())
        if total > soma:
            erros.append(f"invariante: guild '{f}' total {total} > soma contrib {soma}")

    return erros


def validar_arquivo(path: str | Path) -> list[str]:
    return validar(_load(path))
