"""BLK-A15: slots de avatar — fallback para glyph, sem request externa."""
from pathlib import Path

APP = Path(__file__).resolve().parents[1] / "app"
JS = APP / "app.js"
STYLE = APP / "style.css"


def test_funcao_avatar_html_existe():
    """app.js deve definir avatarHtml."""
    js = JS.read_text(encoding="utf-8")
    assert "avatarHtml" in js, "avatarHtml ausente em app.js"


def test_avatar_slot_classe_presente():
    """avatarHtml deve gerar elemento com classe avatar-slot."""
    js = JS.read_text(encoding="utf-8")
    assert "avatar-slot" in js, "avatar-slot ausente em app.js"


def test_fallback_glyph_onerror():
    """avatarHtml deve usar onerror para fallback ao glyph."""
    js = JS.read_text(encoding="utf-8")
    assert "onerror" in js, "onerror ausente — fallback de glyph não implementado"
    assert "avatar-glyph" in js, "avatar-glyph ausente no fallback"


def test_imagem_aponta_para_vendor():
    """img src aponta para vendor/img/ (local, zero request externa)."""
    js = JS.read_text(encoding="utf-8")
    assert "vendor/img/classe-" in js, "vendor/img/classe- ausente em avatarHtml"


def test_avatar_no_personagem_card():
    """personagem-card: banner mostra o rosto único da classe dominante (sem redundância)."""
    js = JS.read_text(encoding="utf-8")
    assert "hero-portraits" in js, "hero-portraits ausente no template"
    assert "hero-face" in js, "hero-face (rosto da classe dominante) ausente"
    assert "avatarHtml(dom, domFr.classe)" in js, "avatar da classe dominante não usado no banner"


def test_avatar_slot_css():
    """.avatar-slot deve ter estilo em style.css."""
    css = STYLE.read_text(encoding="utf-8")
    assert ".avatar-slot" in css, ".avatar-slot ausente em style.css"


def test_avatar_sem_url_externa():
    """Nenhuma URL externa (https://) no código de avatar."""
    import re
    js = JS.read_text(encoding="utf-8")
    # avatarHtml region: from function definition to end
    start = js.find("function avatarHtml")
    end = js.find("\nfunction ", start + 1)
    avatar_region = js[start:end] if end > start else js[start:]
    assert not re.search(r"https?://", avatar_region), "URL externa em avatarHtml"
