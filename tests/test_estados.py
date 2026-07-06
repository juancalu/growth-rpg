"""BLK-A6: estados de borda renderizam sem quebrar; motion/hover/animações presentes."""
import json
from pathlib import Path

from contract.validate import validar

ROOT = Path(__file__).resolve().parents[1]
APP = ROOT / "app"
STYLE = APP / "style.css"
GOLDEN = ROOT / "tests" / "golden" / "maio2026_expected.json"


def _golden() -> dict:
    return json.loads(GOLDEN.read_text(encoding="utf-8"))


def _validar(dados: dict) -> list[str]:
    # valida o dict em memória (evita lock de NamedTemporaryFile no Windows)
    return validar(dados)


# ── CSS — motion / hover / animações ─────────────────────────────────────────

def test_prefers_reduced_motion():
    """style.css deve ter @media prefers-reduced-motion com animation: none."""
    css = STYLE.read_text(encoding="utf-8")
    assert "prefers-reduced-motion" in css, "media query prefers-reduced-motion ausente"
    assert "animation: none" in css, "animation: none ausente no bloco reduced-motion"


def test_hover_states():
    """style.css deve ter seletores :hover para cards de personagem, guild e frente."""
    css = STYLE.read_text(encoding="utf-8")
    assert ".personagem-card:hover" in css, ":hover ausente para personagem-card"
    assert ".guild-card:hover" in css, ":hover ausente para guild-card"
    assert ".frente-card:hover" in css, ":hover ausente para frente-card"


def test_animacoes_keyframes():
    """style.css deve definir @keyframes emblema-in e fade-in."""
    css = STYLE.read_text(encoding="utf-8")
    assert "@keyframes emblema-in" in css, "@keyframes emblema-in ausente"
    assert "@keyframes fade-in" in css, "@keyframes fade-in ausente"


# ── JS — tratamento de estados ────────────────────────────────────────────────

def test_error_state_js():
    """app.js deve ter tratamento de erro de fetch com #app-error."""
    js = (APP / "app.js").read_text(encoding="utf-8")
    assert "app-error" in js, "#app-error ausente no tratamento de fetch"
    assert "hidden" in js, "propriedade hidden ausente no error state"


# ── Fixtures de estados de borda — validam contra o schema ───────────────────

def test_estado_baseline_zero():
    """Fixture baseline zero (nível 0, XP 0 em todas as frentes) passa no validador."""
    d = _golden()
    for p in d["pessoas"]:
        for f in p["frentes"].values():
            f["nivel"] = 0
            f["xp_total"] = 0
            f["xp_no_nivel"] = 0
            f["xp_para_proximo"] = f["custo_por_nivel"]
            f["entregaveis_total"] = 0
            f["entregue_quinzena"] = 0
            f["entregaveis_quinzena"] = 0
            f["vazao_quinzena"] = 0.0
            f["tier"] = 1
        p["emblemas_quinzena"] = []
        p["emblemas_historico"] = []
    erros = _validar(d)
    assert not erros, f"Baseline zero falhou no validador: {erros}"


def test_estado_sem_missoes():
    """Fixture sem missões (tudo tagueado) passa no validador."""
    d = _golden()
    d["missoes_organizacao"] = []
    erros = _validar(d)
    assert not erros, f"Sem missões falhou no validador: {erros}"


def test_estado_guild_abaixo_comprometida():
    """Fixture guild abaixo da comprometida (entregue < comprometida) passa no validador."""
    d = _golden()
    for f_key in ["operacional", "projeto", "analise"]:
        g = d["guild"][f_key]
        g["entregue_quinzena"] = g["camadas"]["comprometida"] - 1
        g["camada_atingida"] = None
        g["proxima_camada"] = "comprometida"
        g["restante_para_proxima"] = 1
        g["total_equipe_quinzena"] = g["camadas"]["comprometida"] - 1
        # Ajustar contribuições para bater com o total
        pessoas = list(g["contribuicoes_quinzena"].keys())
        for nome in pessoas:
            g["contribuicoes_quinzena"][nome] = 0
        if pessoas:
            g["contribuicoes_quinzena"][pessoas[0]] = g["entregue_quinzena"]
    erros = _validar(d)
    assert not erros, f"Guild abaixo da comprometida falhou no validador: {erros}"
