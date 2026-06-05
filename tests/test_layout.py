"""BLK-A4: responsividade — breakpoints, overflow, ordem de sections, viewport meta."""
from pathlib import Path

APP = Path(__file__).resolve().parents[1] / "app"
STYLE = APP / "style.css"
HTML = APP / "index.html"

_BREAKPOINTS = ["360px", "768px", "1280px"]
_SECTION_ORDER = [
    "personagens",
    "guild",
    "eventos",
    "ranking",
    "missoes",
    "reconciliacao",
]


def test_breakpoints_media_queries():
    """style.css deve conter @media para os breakpoints 360px, 768px e 1280px."""
    css = STYLE.read_text(encoding="utf-8")
    faltando = [bp for bp in _BREAKPOINTS if bp not in css]
    assert not faltando, f"Breakpoints ausentes em style.css: {faltando}"


def test_overflow_horizontal_prevenido():
    """style.css deve declarar overflow-x para prevenir scroll horizontal."""
    css = STYLE.read_text(encoding="utf-8")
    assert "overflow-x" in css, "style.css não declara overflow-x"
    assert "overflow-x: hidden" in css, "overflow-x: hidden ausente em style.css"


def test_ordem_sections_html():
    """index.html deve ter as sections na ordem correta."""
    html = HTML.read_text(encoding="utf-8")
    posicoes = {s: html.find(f'id="{s}"') for s in _SECTION_ORDER}
    faltando = [s for s, p in posicoes.items() if p == -1]
    assert not faltando, f"Sections ausentes no HTML: {faltando}"
    ordem = sorted(posicoes, key=lambda s: posicoes[s])
    assert ordem == _SECTION_ORDER, f"Ordem incorreta: {ordem} (esperado: {_SECTION_ORDER})"


def test_viewport_meta():
    """index.html deve ter <meta name='viewport' ...> para escala mobile."""
    html = HTML.read_text(encoding="utf-8")
    assert 'name="viewport"' in html or "name='viewport'" in html, \
        "meta viewport ausente em index.html"
