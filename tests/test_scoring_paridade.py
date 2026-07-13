"""Paridade do scoring-core (decisão 2026-07-09): o motor deve reproduzir EXATAMENTE
o gabarito. Increment 1: contra um fixture SINTÉTICO hand-verificado.

A paridade real com o painel (FLUXO 3) entra quando o input congelado de Maio +
golden regenerado forem capturados juntos pelo cowork (read-only). Enquanto isso,
este teste trava a lógica de classificação/agregação. Divergiu = build vermelho.
"""
import json
from pathlib import Path

from scoring import score

ROOT = Path(__file__).resolve().parents[1]
GOLDEN = ROOT / "tests" / "golden"


def _load(nome: str) -> dict:
    return json.loads((GOLDEN / nome).read_text(encoding="utf-8"))


def test_paridade_sintetico():
    entrada = _load("sintetico_input.json")["tarefas"]
    esperado = _load("sintetico_expected.json")
    esperado.pop("_nota", None)

    obtido = score(entrada)

    assert obtido == esperado, "scoring-core divergiu do gabarito sintético"


def test_nao_soma_entre_frentes():
    """Guardrail: cada frente tem sua unidade em silo; nada de total combinando frentes."""
    resultado = score(_load("sintetico_input.json")["tarefas"])
    assert set(resultado["guild"]) == {"operacional", "projeto", "analise"}
    # operacional mede itens; projeto/análise medem pontos — nunca um total geral
    for pessoa in resultado["por_pessoa"].values():
        assert "itens" in pessoa["operacional"]
        assert "pontos" in pessoa["projeto"] and "pontos" in pessoa["analise"]
        assert "total_geral" not in pessoa and "xp_total" not in pessoa


def test_determinismo_idempotente():
    """Mesmo input → mesmo output em execuções repetidas."""
    entrada = _load("sintetico_input.json")["tarefas"]
    assert score(entrada) == score(entrada)
