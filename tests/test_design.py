"""BLK-A3: token compliance (sem hex fora de :root) e contraste WCAG AA."""
import re
from pathlib import Path

APP = Path(__file__).resolve().parents[1] / "app"
STYLE = APP / "style.css"

HEX_RE = re.compile(r"#[0-9a-fA-F]{3,8}(?!\w)")


def _read_css() -> str:
    return STYLE.read_text(encoding="utf-8")


def _extract_root_block(css: str) -> str:
    """Devolve o conteúdo interno do bloco :root {}."""
    m = re.search(r":root\s*\{([^}]+)\}", css)
    return m.group(1) if m else ""


def _remove_root_block(css: str) -> str:
    """Remove o bloco :root {} do CSS para checar o restante."""
    # Remove também comentários antes de checar
    no_comments = re.sub(r"/\*.*?\*/", "", css, flags=re.DOTALL)
    return re.sub(r":root\s*\{[^}]+\}", "", no_comments)


def _parse_hex_tokens(root_block: str) -> dict[str, str]:
    """Extrai {--nome: #hex} do bloco :root."""
    tokens: dict[str, str] = {}
    for m in re.finditer(r"(--[\w-]+)\s*:\s*(#[0-9a-fA-F]{3,8})", root_block):
        tokens[m.group(1)] = m.group(2)
    return tokens


def _linearize(c: float) -> float:
    return c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4


def _luminance(hex_color: str) -> float:
    h = hex_color.lstrip("#")
    if len(h) == 3:
        h = "".join(c * 2 for c in h)
    r, g, b = int(h[0:2], 16) / 255, int(h[2:4], 16) / 255, int(h[4:6], 16) / 255
    return 0.2126 * _linearize(r) + 0.7152 * _linearize(g) + 0.0722 * _linearize(b)


def _contrast(h1: str, h2: str) -> float:
    l1, l2 = _luminance(h1), _luminance(h2)
    hi, lo = max(l1, l2), min(l1, l2)
    return (hi + 0.05) / (lo + 0.05)


# ── Testes ────────────────────────────────────────────────────────────────────

def test_sem_hex_fora_root():
    """style.css: nenhum #hex fora do bloco :root {}."""
    css = _read_css()
    outside = _remove_root_block(css)
    hexes = HEX_RE.findall(outside)
    assert not hexes, f"Hex solto fora de :root: {hexes[:10]}"


def test_wcag_aa_texto_principal():
    """Pares texto/fundo principais devem ter contraste >= 4.5:1 (WCAG AA)."""
    css = _read_css()
    root = _extract_root_block(css)
    tokens = _parse_hex_tokens(root)

    pares = [
        ("--color-text", "--color-bg"),
        ("--color-text", "--color-surface"),
        ("--color-text-muted", "--color-bg"),
        ("--color-text-muted", "--color-surface"),
    ]
    falhas = []
    for fg_tok, bg_tok in pares:
        fg = tokens.get(fg_tok)
        bg = tokens.get(bg_tok)
        if not fg or not bg:
            falhas.append(f"Token ausente: {fg_tok}={fg}, {bg_tok}={bg}")
            continue
        ratio = _contrast(fg, bg)
        if ratio < 4.5:
            falhas.append(f"{fg_tok} on {bg_tok}: {ratio:.2f}:1 < 4.5:1")

    assert not falhas, "WCAG AA falhou:\n" + "\n".join(falhas)


def test_wcag_aa_status():
    """Cores de status (success/warning/error) devem ter contraste >= 3.0:1 no fundo de status."""
    css = _read_css()
    root = _extract_root_block(css)
    tokens = _parse_hex_tokens(root)

    pares_status = [
        ("--color-success", "--color-success-bg"),
        ("--color-warning", "--color-warning-bg"),
        ("--color-error-text", "--color-error-bg"),
    ]
    falhas = []
    for fg_tok, bg_tok in pares_status:
        fg = tokens.get(fg_tok)
        bg = tokens.get(bg_tok)
        if not fg or not bg:
            falhas.append(f"Token ausente: {fg_tok}={fg}, {bg_tok}={bg}")
            continue
        ratio = _contrast(fg, bg)
        if ratio < 3.0:
            falhas.append(f"{fg_tok} on {bg_tok}: {ratio:.2f}:1 < 3.0:1")

    assert not falhas, "Contraste de status insuficiente:\n" + "\n".join(falhas)


def test_fontes_sem_cdn():
    """style.css não deve importar fontes via CDN externo."""
    css = _read_css()
    proibidos = ["fonts.googleapis", "fonts.gstatic", "@import url(http"]
    falhas = [p for p in proibidos if p in css]
    assert not falhas, f"Referência a CDN de fontes encontrada: {falhas}"
