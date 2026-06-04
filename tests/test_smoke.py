"""Smoke do M0: config carrega, golden é coerente e os invariantes-base valem."""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def _load(rel: str):
    return json.loads((ROOT / rel).read_text(encoding="utf-8"))


def test_config_carrega() -> None:
    for f in (
        "config/classes.json",
        "config/emblemas.json",
        "config/disponibilidade.json",
        "config/backlog_quinzena.json",
    ):
        assert _load(f), f"{f} vazio/inválido"


def test_golden_estrutura_e_invariantes() -> None:
    d = _load("tests/golden/maio2026_expected.json")
    assert d["meta"]["schema_version"] == "1.3"
    assert len(d["pessoas"]) == 3
    for p in d["pessoas"]:
        # invariante: nada de total por pessoa combinando frentes
        assert "xp_total_pessoa" not in p
        assert "nivel_total" not in p
        assert set(p["frentes"]) == {"operacional", "projeto", "analise"}
    # totais de equipe de-dup (conferem com o painel de Maio)
    assert d["guild"]["operacional"]["total_equipe_quinzena"] == 117
    assert d["guild"]["projeto"]["total_equipe_quinzena"] == 211
    assert d["guild"]["analise"]["total_equipe_quinzena"] == 42
