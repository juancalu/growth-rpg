"""Teste leve BLK-A2: zero requests externas em app/; campos do contrato referenciados."""
import re
from pathlib import Path

APP = Path(__file__).resolve().parents[1] / "app"

EXTERNAL = re.compile(r"https?://")

_CAMPOS_CONTRATO = [
    "xp_no_nivel",
    "xp_para_proximo",
    "vazao_quinzena",
    "emblemas_quinzena",
    "guild",
    "ranking_quinzena",
    "missoes_organizacao",
    "eventos",
]

_SUFIXOS = {".html", ".css", ".js"}


def _app_files():
    return [f for f in APP.rglob("*") if f.suffix in _SUFIXOS]


def test_sem_url_externa():
    """Nenhum arquivo em app/ deve conter http(s):// (zero CDN, zero request externa)."""
    for f in _app_files():
        content = f.read_text(encoding="utf-8")
        matches = EXTERNAL.findall(content)
        assert not matches, f"{f.relative_to(APP)}: contém URL(s) externa(s): {matches[:3]}"


def test_campos_do_contrato():
    """app.js deve referenciar os campos-chave do contrato dados.json."""
    app_js = (APP / "app.js").read_text(encoding="utf-8")
    faltando = [c for c in _CAMPOS_CONTRATO if c not in app_js]
    assert not faltando, f"Campos do contrato não referenciados em app.js: {faltando}"


def test_vendor_chart_usado():
    """index.html deve referenciar vendor/chart.min.js local (sem CDN)."""
    html = (APP / "index.html").read_text(encoding="utf-8")
    assert "vendor/chart.min.js" in html, "index.html não referencia vendor/chart.min.js"
    assert "cdn" not in html.lower(), "index.html contém referência a CDN"
