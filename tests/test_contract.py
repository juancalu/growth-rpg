"""O golden de Maio (e qualquer dados.json) deve passar no validador de contrato."""
from pathlib import Path

from contract.validate import validar_arquivo

ROOT = Path(__file__).resolve().parents[1]


def test_golden_passa_no_contrato() -> None:
    erros = validar_arquivo(ROOT / "tests" / "golden" / "maio2026_expected.json")
    assert erros == [], "erros de contrato:\n" + "\n".join(erros)
