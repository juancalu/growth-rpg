"""BLK-A9: atmosfera dark-fantasy — aura tokens + fundo multicamadas."""
import re
from pathlib import Path

STYLE = Path(__file__).resolve().parents[1] / "app" / "style.css"


def _css() -> str:
    return STYLE.read_text(encoding="utf-8")


def _root_block(css: str) -> str:
    m = re.search(r":root\s*\{([^}]+)\}", css)
    return m.group(1) if m else ""


def test_aura_tokens_existem():
    """Tokens --aura-op/prj/ana devem estar no :root."""
    root = _root_block(_css())
    for tok in ("--aura-op", "--aura-prj", "--aura-ana"):
        assert tok in root, f"Token ausente em :root: {tok}"


def test_shadow_glow_tokens_existem():
    """Tokens --shadow-glow-op/prj/ana devem estar no :root."""
    root = _root_block(_css())
    for tok in ("--shadow-glow-op", "--shadow-glow-prj", "--shadow-glow-ana"):
        assert tok in root, f"Token ausente em :root: {tok}"


def test_fundo_multicamadas():
    """body.background deve ter pelo menos 3 camadas de gradiente."""
    css = _css()
    body_m = re.search(r"\bbody\s*\{([^}]+)\}", css, re.DOTALL)
    assert body_m, "Bloco body não encontrado em style.css"
    body_css = body_m.group(1)
    count = len(re.findall(r"gradient\s*\(", body_css))
    assert count >= 3, f"body.background: esperado >= 3 gradientes, encontrou {count}"


def test_fundo_sem_url_externa():
    """style.css não deve conter http(s):// (data-URIs base64 são ok)."""
    css = _css()
    assert not re.search(r"https?://", css), "style.css contém URL externa (https?://)"
