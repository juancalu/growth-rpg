"""BLK-A5: data-viz — guild chart com camadas, contrib chart, Chart.js local."""
from pathlib import Path

APP = Path(__file__).resolve().parents[1] / "app"


def _js() -> str:
    return (APP / "app.js").read_text(encoding="utf-8")


def test_guild_chart_usa_camadas():
    """app.js deve referenciar os campos de camadas para o guild chart."""
    js = _js()
    for campo in ["comprometida", "alvo", "stretch", "entregue_quinzena"]:
        assert campo in js, f"'{campo}' ausente em app.js"


def test_guild_chart_usa_stack():
    """Guild chart deve usar stack para empilhar as camadas."""
    js = _js()
    assert "stack:" in js or "stack :" in js, "guild chart não usa stack de datasets"


def test_contrib_chart_existe():
    """Deve existir chart de contribuições por pessoa (guildContribChart)."""
    js = _js()
    assert "guildContribChart" in js, "função guildContribChart ausente em app.js"
    assert "guild-contrib-" in js, "canvas guild-contrib-{f} ausente"
    assert "contribuicoes_quinzena" in js, "'contribuicoes_quinzena' não referenciado"


def test_chart_instancias_multiplas():
    """app.js deve criar >= 2 instâncias de Chart (guild camadas + contrib)."""
    js = _js()
    count = js.count("new Chart(")
    assert count >= 2, f"Esperado >= 2 instâncias de Chart, encontrado {count}"


def test_chart_sem_cdn():
    """app.js não deve referenciar CDN de Chart.js."""
    js = _js()
    proibidos = ["cdn", "jsdelivr", "cdnjs", "unpkg"]
    falhas = [p for p in proibidos if p in js.lower()]
    assert not falhas, f"Referência a CDN em app.js: {falhas}"
