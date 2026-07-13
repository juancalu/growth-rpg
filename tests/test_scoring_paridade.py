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


def _t(tid, dt, **kw):
    base = {"id": tid, "name": tid, "status": "concluído", "tags": ["operacional"],
            "assignees": ["Juan"], "parent": None, "date_done": dt}
    base.update(kw)
    return base


def test_janela_quinzena_filtra_por_date_done():
    """Só conta tarefas concluídas DENTRO da janela; ISO e epoch-ms aceitos."""
    from datetime import datetime

    ms_dentro = str(int(datetime.fromisoformat("2026-07-10T12:00:00-03:00").timestamp() * 1000))
    tarefas = [
        _t("dentro_iso", "2026-07-05"),          # dentro
        _t("borda_de", "2026-07-02"),            # dentro (inclusivo)
        _t("borda_ate", "2026-07-16"),           # dentro (inclusivo)
        _t("fora_antes", "2026-06-20"),          # fora
        _t("fora_depois", "2026-07-20"),         # fora
        _t("dentro_ms", ms_dentro),              # dentro (epoch-ms)
        _t("sem_data", None),                    # sem date_done → não entra na janela
    ]
    r = score(tarefas, janela=("2026-07-02", "2026-07-16"))
    # 4 dentro: dentro_iso, borda_de, borda_ate, dentro_ms
    assert r["guild"]["operacional"]["total"] == 4
    assert r["por_pessoa"]["Juan"]["operacional"]["itens"] == 4
    # sem janela = all-time conta todas as concluídas (7)
    assert score(tarefas)["guild"]["operacional"]["total"] == 7
