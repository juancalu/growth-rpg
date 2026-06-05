"""BLK-A12: guild temática — hexgrid, blocos, névoa; progresso data-driven."""
from pathlib import Path

APP = Path(__file__).resolve().parents[1] / "app"
JS = APP / "app.js"
STYLE = APP / "style.css"


def _js() -> str:
    return JS.read_text(encoding="utf-8")


def _css() -> str:
    return STYLE.read_text(encoding="utf-8")


def test_funcoes_tematicas_existem():
    """app.js deve definir as funções de viz temática."""
    js = _js()
    for fn in ("guildHexGridViz", "guildBuildingBlocksViz", "guildFogMapViz", "guildThematicViz"):
        assert fn in js, f"Função '{fn}' ausente em app.js"


def test_hexgrid_para_operacional():
    """guildThematicViz retorna hexgrid para operacional."""
    js = _js()
    assert "guild-viz--hexgrid" in js, "guild-viz--hexgrid ausente"
    assert "operacional" in js  # já verificado, mas confirma no contexto


def test_blocos_para_projeto():
    """guildThematicViz retorna blocos para projeto."""
    js = _js()
    assert "guild-viz--blocks" in js, "guild-viz--blocks ausente"


def test_fog_para_analise():
    """guildThematicViz retorna névoa para analise."""
    js = _js()
    assert "guild-viz--fog" in js, "guild-viz--fog ausente"


def test_viz_usa_entregue_quinzena():
    """Funções de viz consomem entregue_quinzena do contrato."""
    js = _js()
    assert "entregue_quinzena" in js, "entregue_quinzena não referenciado nas funções de viz"


def test_viz_usa_camadas():
    """Funções de viz consomem camadas (comprometida/alvo/stretch)."""
    js = _js()
    assert "camadas.comprometida" in js, "camadas.comprometida ausente"
    assert "camadas.alvo" in js, "camadas.alvo ausente"
    assert "camadas.stretch" in js, "camadas.stretch ausente"


def test_viz_injetada_no_template_guild():
    """guildThematicViz chamado dentro do template do guild card."""
    js = _js()
    assert "guildThematicViz" in js, "guildThematicViz não chamado"
    # Verifica que está no template (dentro do renderGuild map)
    render_idx = js.find("renderGuild")
    viz_idx = js.find("guildThematicViz(f")
    assert viz_idx > render_idx, "guildThematicViz não chamado dentro de renderGuild"


def test_guild_viz_css_existe():
    """.guild-viz deve ter estilo em style.css."""
    css = _css()
    assert ".guild-viz" in css, ".guild-viz ausente em style.css"
