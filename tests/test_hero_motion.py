"""BLK-A13: hero épico, motion de conquista, coesão."""
import re
from pathlib import Path

APP = Path(__file__).resolve().parents[1] / "app"
STYLE = APP / "style.css"
JS = APP / "app.js"


def _css() -> str:
    return STYLE.read_text(encoding="utf-8")


def _js() -> str:
    return JS.read_text(encoding="utf-8")


def test_hero_site_title_glow():
    """site-title deve ter text-shadow (glow épico)."""
    css = _css()
    m = re.search(r"\.site-title\s*\{([^}]+)\}", css, re.DOTALL)
    assert m, ".site-title não encontrado"
    assert "text-shadow" in m.group(1), "text-shadow ausente em .site-title"


def test_hero_header_glow_line():
    """.site-header::after deve criar linha de glow inferior."""
    css = _css()
    assert ".site-header::after" in css, ".site-header::after ausente"


def test_keyframe_level_up():
    """@keyframes level-up deve estar definido."""
    css = _css()
    assert "@keyframes level-up" in css, "@keyframes level-up ausente"


def test_keyframe_emblema_cunhado():
    """@keyframes emblema-cunhado deve estar definido."""
    css = _css()
    assert "@keyframes emblema-cunhado" in css, "@keyframes emblema-cunhado ausente"


def test_keyframe_horda_derrota():
    """@keyframes horda-derrota deve estar definido."""
    css = _css()
    assert "@keyframes horda-derrota" in css, "@keyframes horda-derrota ausente"


def test_prefers_reduced_motion_cobre_animacoes():
    """prefers-reduced-motion deve desligar animation e transition."""
    css = _css()
    rm_m = re.search(r"prefers-reduced-motion:\s*reduce\s*\)\s*\{([^}]+)\}", css, re.DOTALL)
    assert rm_m, "Bloco prefers-reduced-motion não encontrado"
    bloco = rm_m.group(1)
    assert "animation: none" in bloco, "animation: none ausente no bloco reduced-motion"
    assert "transition: none" in bloco, "transition: none ausente no bloco reduced-motion"


def test_quinzena_capitulo_em_appjs():
    """renderMeta deve formatar quinzena como 'Capitulo: ...'."""
    js = _js()
    assert "Capitulo:" in js, "'Capitulo:' ausente em renderMeta"
