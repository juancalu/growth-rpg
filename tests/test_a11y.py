"""BLK-A7: acessibilidade — aria, semantic HTML, favicon local, WCAG AA completo."""
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
APP = ROOT / "app"
STYLE = APP / "style.css"
HTML = APP / "index.html"
JS = APP / "app.js"


def _html() -> str:
    return HTML.read_text(encoding="utf-8")


def _js() -> str:
    return JS.read_text(encoding="utf-8")


def _css() -> str:
    return STYLE.read_text(encoding="utf-8")


def _parse_hex_tokens(css: str) -> dict[str, str]:
    root_m = re.search(r":root\s*\{([^}]+)\}", css)
    root = root_m.group(1) if root_m else ""
    return dict(re.findall(r"(--[\w-]+)\s*:\s*(#[0-9a-fA-F]{3,8})", root))


def _linearize(c: float) -> float:
    return c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4


def _luminance(h: str) -> float:
    h = h.lstrip("#")
    if len(h) == 3:
        h = "".join(c * 2 for c in h)
    r, g, b = int(h[0:2], 16) / 255, int(h[2:4], 16) / 255, int(h[4:6], 16) / 255
    return 0.2126 * _linearize(r) + 0.7152 * _linearize(g) + 0.0722 * _linearize(b)


def _contrast(h1: str, h2: str) -> float:
    l1, l2 = _luminance(h1), _luminance(h2)
    hi, lo = max(l1, l2), min(l1, l2)
    return (hi + 0.05) / (lo + 0.05)


# ── HTML semântico e meta ─────────────────────────────────────────────────────

def test_lang_atributo():
    """index.html deve ter lang='pt-BR'."""
    html = _html()
    assert 'lang="pt-BR"' in html or "lang='pt-BR'" in html, "lang=pt-BR ausente"


def test_titulo_html():
    """index.html deve ter <title> com 'Growth RPG'."""
    html = _html()
    assert "Growth RPG" in html, "<title> com Growth RPG ausente"
    assert "<title>" in html.lower(), "<title> tag ausente"


def test_meta_description():
    """index.html deve ter <meta name='description'>."""
    html = _html()
    assert 'name="description"' in html or "name='description'" in html, \
        "meta description ausente"


def test_favicon_local():
    """index.html referencia favicon.svg local; arquivo deve existir em app/."""
    html = _html()
    assert "favicon.svg" in html, "favicon.svg não referenciado em index.html"
    assert (APP / "favicon.svg").exists(), "arquivo favicon.svg não existe em app/"


def test_favicon_sem_cdn():
    """favicon não deve usar URL externa."""
    html = _html()
    assert "https://" not in html.split("favicon")[1].split(">")[0], \
        "favicon referencia URL externa"


def test_sections_aria_labelledby():
    """Sections principais devem ter aria-labelledby."""
    html = _html()
    sections = ["personagens", "guild", "eventos", "ranking", "missoes", "reconciliacao"]
    faltando = [s for s in sections if f'id="{s}"' in html
                and f'aria-labelledby="{s}-titulo"' not in html]
    assert not faltando, f"Sections sem aria-labelledby: {faltando}"


# ── app.js — aria em elementos dinâmicos ─────────────────────────────────────

def test_canvas_aria_labels():
    """app.js: todos os <canvas criados devem ter aria-label."""
    js = _js()
    canvas_blocks = re.findall(r'<canvas[^>]*>', js)
    sem_aria = [b for b in canvas_blocks if "aria-label" not in b]
    assert not sem_aria, f"canvas sem aria-label: {sem_aria}"


def test_xp_bar_role_progressbar():
    """app.js deve usar role='progressbar' na barra de XP com aria-valuenow."""
    js = _js()
    assert 'role="progressbar"' in js, "role=progressbar ausente na barra de XP"
    assert "aria-valuenow" in js, "aria-valuenow ausente na barra de XP"
    assert "aria-valuemax" in js, "aria-valuemax ausente na barra de XP"


# ── WCAG AA — text-faint e todos os pares de texto ───────────────────────────

def test_wcag_aa_text_faint():
    """--color-text-faint deve ter contraste >= 4.5:1 nos fundos principal e surface."""
    tokens = _parse_hex_tokens(_css())
    faint = tokens.get("--color-text-faint")
    bg = tokens.get("--color-bg")
    surface = tokens.get("--color-surface")
    assert faint and bg and surface, "Tokens ausentes para verificação"

    ratio_bg = _contrast(faint, bg)
    ratio_surf = _contrast(faint, surface)
    falhas = []
    if ratio_bg < 4.5:
        falhas.append(f"--color-text-faint on --color-bg: {ratio_bg:.2f}:1 < 4.5:1")
    if ratio_surf < 4.5:
        falhas.append(f"--color-text-faint on --color-surface: {ratio_surf:.2f}:1 < 4.5:1")
    assert not falhas, "WCAG AA falhou:\n" + "\n".join(falhas)
