"""BLK-A10: tipografia épica — Cinzel vendorizada, sem CDN."""
import re
from pathlib import Path

APP = Path(__file__).resolve().parents[1] / "app"
STYLE = APP / "style.css"


def _css() -> str:
    return STYLE.read_text(encoding="utf-8")


def test_font_face_cinzel_400():
    """@font-face Cinzel 400 aponta para vendor/fonts/ local."""
    css = _css()
    assert "vendor/fonts/cinzel-400.woff2" in css, "@font-face Cinzel 400 ausente"


def test_font_face_cinzel_700():
    """@font-face Cinzel 700 aponta para vendor/fonts/ local."""
    css = _css()
    assert "vendor/fonts/cinzel-700.woff2" in css, "@font-face Cinzel 700 ausente"


def test_cinzel_sem_cdn():
    """Nenhuma referência a CDN de fontes (googleapis, gstatic)."""
    css = _css()
    for proibido in ("fonts.googleapis", "fonts.gstatic", "@import url(http"):
        assert proibido not in css, f"Referência CDN encontrada: {proibido}"


def test_font_display_token():
    """Token --font-display com Cinzel deve estar no :root."""
    css = _css()
    m = re.search(r":root\s*\{([^}]+)\}", css)
    root = m.group(1) if m else ""
    assert "--font-display" in root, "Token --font-display ausente em :root"
    assert "Cinzel" in root, "Cinzel ausente no token --font-display"


def test_cinzel_aplicada_site_title():
    """.site-title deve usar var(--font-display)."""
    css = _css()
    title_m = re.search(r"\.site-title\s*\{([^}]+)\}", css, re.DOTALL)
    assert title_m, ".site-title não encontrado"
    assert "font-display" in title_m.group(1), "site-title não usa --font-display"


def test_cinzel_aplicada_section_title():
    """.section-title deve usar var(--font-display)."""
    css = _css()
    m = re.search(r"\.section-title\s*\{([^}]+)\}", css, re.DOTALL)
    assert m, ".section-title não encontrado"
    assert "font-display" in m.group(1), "section-title não usa --font-display"


def test_letter_spacing_titulos():
    """Elementos display devem ter letter-spacing."""
    css = _css()
    assert "letter-spacing" in css, "Nenhum letter-spacing encontrado em style.css"
