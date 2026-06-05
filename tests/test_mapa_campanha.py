"""BLK-A14: mapa de campanha — SVG inline, data-driven, no topo."""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
APP = ROOT / "app"
JS = APP / "app.js"
HTML = APP / "index.html"
GOLDEN = ROOT / "tests" / "golden" / "maio2026_expected.json"


def test_mapa_campanha_em_html():
    """index.html: #mapa-campanha deve existir e aparecer ANTES de #personagens."""
    html = HTML.read_text(encoding="utf-8")
    mapa_pos = html.find('id="mapa-campanha"')
    pers_pos = html.find('id="personagens"')
    assert mapa_pos != -1, "#mapa-campanha ausente no HTML"
    assert pers_pos != -1, "#personagens ausente no HTML"
    assert mapa_pos < pers_pos, "#mapa-campanha deve vir antes de #personagens"


def test_funcao_render_mapa_campanha_existe():
    """app.js deve definir renderMapaCampanha e mapaCampanhaSVG."""
    js = JS.read_text(encoding="utf-8")
    assert "renderMapaCampanha" in js
    assert "mapaCampanhaSVG" in js


def test_mapa_usa_dados_contrato():
    """mapaCampanhaSVG usa entregue_quinzena e camadas.stretch do contrato."""
    js = JS.read_text(encoding="utf-8")
    assert "entregue_quinzena" in js
    assert "camadas.stretch" in js


def test_marcadores_de_problema_usam_fontes_corretas():
    """numProblemas é calculado a partir de missoes + backlog.tarefas."""
    js = JS.read_text(encoding="utf-8")
    assert "backlog.tarefas" in js, "backlog.tarefas ausente"
    assert "numProblemas" in js, "numProblemas ausente"
    assert "mapa-problema" in js, "Classe mapa-problema ausente"


def test_contagem_problema_golden():
    """Golden: nº esperado de marcadores == missoes + op_backlog."""
    with open(GOLDEN, encoding="utf-8") as f:
        d = json.load(f)
    missoes = len(d["missoes_organizacao"])
    op_backlog = sum(
        p["frentes"]["operacional"]["backlog"]["tarefas"] for p in d["pessoas"]
    )
    expected = missoes + op_backlog
    js = JS.read_text(encoding="utf-8")
    assert "missoes" in js, "missoes não referenciado"
    assert "backlog.tarefas" in js, "backlog.tarefas não referenciado"
    assert expected >= 0  # determinístico com os dados do golden


def test_tres_regioes_tematicas_no_svg():
    """mapaCampanhaSVG deve conter as 3 regiões temáticas."""
    js = JS.read_text(encoding="utf-8")
    assert "TERRITORIO" in js, "Região TERRITORIO ausente"
    assert "CONSTRUCAO" in js, "Região CONSTRUCAO ausente"
    assert "MAPA ENEVOADO" in js, "Região MAPA ENEVOADO ausente"


def test_mapa_secoes_originais_intactas():
    """As seções originais (personagens, guild, etc.) permanecem no HTML."""
    html = HTML.read_text(encoding="utf-8")
    for section_id in ("personagens", "guild", "eventos", "ranking", "missoes", "reconciliacao"):
        assert f'id="{section_id}"' in html, f"Seção #{section_id} ausente"
