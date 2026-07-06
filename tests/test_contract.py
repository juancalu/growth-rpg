"""O golden de Maio (e qualquer dados.json) deve passar no validador de contrato."""
from pathlib import Path

from contract.validate import validar_arquivo, validar_progressao

ROOT = Path(__file__).resolve().parents[1]


def test_golden_passa_no_contrato() -> None:
    erros = validar_arquivo(ROOT / "tests" / "golden" / "maio2026_expected.json")
    assert erros == [], "erros de contrato:\n" + "\n".join(erros)


def _pessoa(nome: str, xp: int, nivel: int) -> dict:
    return {"nome": nome, "frentes": {"operacional": {"xp_total": xp, "nivel": nivel}}}


def test_progressao_monotonica_passa() -> None:
    anterior = {"pessoas": [_pessoa("Juan", 100, 16)]}
    atual = {"pessoas": [_pessoa("Juan", 108, 18)]}  # subiu — ok
    assert validar_progressao(atual, anterior) == []


def test_progressao_flagra_regressao_de_nivel() -> None:
    # Reproduz o bug real: Juan/operacional caiu de L21/xp129 para L13/xp77
    anterior = {"pessoas": [_pessoa("Juan", 129, 21)]}
    atual = {"pessoas": [_pessoa("Juan", 77, 13)]}
    erros = validar_progressao(atual, anterior)
    assert any("xp_total regrediu 129 -> 77" in e for e in erros)
    assert any("nivel regrediu 21 -> 13" in e for e in erros)
