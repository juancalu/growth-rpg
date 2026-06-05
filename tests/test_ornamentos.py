"""BLK-A11: glyphs SVG, emblemas medalhão, XP bar gradiente."""
import re
from pathlib import Path

APP = Path(__file__).resolve().parents[1] / "app"
STYLE = APP / "style.css"
JS = APP / "app.js"


def _css() -> str:
    return STYLE.read_text(encoding="utf-8")


def _js() -> str:
    return JS.read_text(encoding="utf-8")


def test_class_glyphs_svgs_existem():
    """app.js deve conter SVG inline para os 3 glyphs de classe."""
    js = _js()
    assert js.count("<svg") >= 3, f"Menos de 3 <svg inline em app.js, encontrou {js.count('<svg')}"
    assert "CLASS_GLYPH" in js, "Constante CLASS_GLYPH ausente em app.js"


def test_glyphs_nas_tres_frentes():
    """CLASS_GLYPH deve referenciar as 3 frentes."""
    js = _js()
    for frente in ("operacional", "projeto", "analise"):
        assert frente in js, f"Frente '{frente}' ausente em app.js CLASS_GLYPH"


def test_glyph_injetado_no_template():
    """frente-card template deve incluir CLASS_GLYPH."""
    js = _js()
    assert "class-glyph-wrap" in js, "class-glyph-wrap ausente no template do frente-card"


def test_xp_bar_gradiente_operacional():
    """XP bar operacional deve usar linear-gradient."""
    css = _css()
    assert "xp-bar__fill" in css
    assert 'linear-gradient' in css, "linear-gradient ausente nas regras de xp-bar__fill"


def test_xp_bar_glow():
    """XP bar deve ter box-shadow glow."""
    css = _css()
    bloco = re.findall(r"xp-bar__fill[^{]*\{[^}]+\}", css, re.DOTALL)
    shadows = [b for b in bloco if "box-shadow" in b]
    assert shadows, "box-shadow ausente nos blocos de xp-bar__fill"


def test_emblema_medallion_gradiente():
    """.emblema-chip deve usar linear-gradient (medalhão metálico)."""
    css = _css()
    chip_m = re.search(r"\.emblema-chip\s*\{([^}]+)\}", css, re.DOTALL)
    assert chip_m, ".emblema-chip não encontrado"
    assert "linear-gradient" in chip_m.group(1), "linear-gradient ausente em .emblema-chip"


def test_frente_card_gradient_border():
    """frente-card[data-frente] deve usar ::before com linear-gradient."""
    css = _css()
    assert "frente-card[data-frente" in css
    assert "frente-card::before" in css, "::before ausente em .frente-card"
    before_m = re.search(r"\.frente-card::before\s*\{([^}]+)\}", css, re.DOTALL)
    assert before_m, ".frente-card::before bloco não encontrado"
