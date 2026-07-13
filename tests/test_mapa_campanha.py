"""Mapa de Campanha — territórios de projeto (data-driven de dados.projetos, SVG inline, no topo).

Cada projeto (lista do ClickUp) é um território; o progresso vem de tarefas concluídas ÷ total
(binário/determinístico). O app NUNCA lê o ClickUp — consome o snapshot em dados.projetos que o
produtor grava. Estes testes checam estrutura (não estética; "ficou épico?" é julgamento humano).
"""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
APP = ROOT / "app"
JS = APP / "app.js"
HTML = APP / "index.html"
DADOS = ROOT / "dados.json"


def test_mapa_campanha_em_html():
    """index.html: #mapa-campanha deve existir e aparecer ANTES de #personagens."""
    html = HTML.read_text(encoding="utf-8")
    mapa_pos = html.find('id="mapa-campanha"')
    pers_pos = html.find('id="personagens"')
    assert mapa_pos != -1, "#mapa-campanha ausente no HTML"
    assert pers_pos != -1, "#personagens ausente no HTML"
    assert mapa_pos < pers_pos, "#mapa-campanha deve vir antes de #personagens"


def test_funcoes_render_mapa_existem():
    """app.js deve definir renderMapaCampanha e o helper de território."""
    js = JS.read_text(encoding="utf-8")
    assert "renderMapaCampanha" in js, "renderMapaCampanha ausente"
    assert "projetoTerritorioHTML" in js, "projetoTerritorioHTML ausente"


def test_mapa_usa_dados_projetos():
    """O mapa é dirigido por dados.projetos e seus campos do contrato."""
    js = JS.read_text(encoding="utf-8")
    assert "dados.projetos" in js, "mapa não lê dados.projetos"
    for campo in ("concluidas", "total", "abertas", "bloqueadas"):
        assert campo in js, f"campo '{campo}' de projeto não referenciado em app.js"


def test_mapa_territorio_svg_inline():
    """Território é SVG inline (zero asset externo) com a classe .mapa-territorio."""
    js = JS.read_text(encoding="utf-8")
    assert "mapa-territorio" in js, "classe mapa-territorio ausente"
    assert "<svg" in js, "SVG inline ausente em app.js"
    assert "mapa-projeto" in js, "tile mapa-projeto ausente"


def test_mapa_tem_fallback():
    """Sem dados.projetos, o mapa degrada com uma nota (não quebra)."""
    js = JS.read_text(encoding="utf-8")
    assert "Sem dados de projetos" in js, "fallback do mapa ausente"


def test_progresso_determinista_no_dados():
    """dados.projetos (se presente): concluidas+abertas+bloqueadas == total e progresso em [0,1].

    Garante a honestidade do contrato: nada de % inventado; só o que soma bate com o total.
    """
    if not DADOS.exists():
        return
    d = json.loads(DADOS.read_text(encoding="utf-8"))
    proj = d.get("projetos")
    if not proj:
        return
    for p in proj["lista"]:
        soma = p["concluidas"] + p["abertas"] + p["bloqueadas"]
        assert soma == p["total"], f"{p['nome']}: {soma} != total {p['total']}"
        assert 0 <= p["concluidas"] <= p["total"], f"{p['nome']}: concluidas fora de faixa"
        if "progresso" in p:
            assert 0 <= p["progresso"] <= 1, f"{p['nome']}: progresso fora de [0,1]"


def test_mapa_secoes_originais_intactas():
    """As seções originais (personagens, guild, etc.) permanecem no HTML."""
    html = HTML.read_text(encoding="utf-8")
    for section_id in ("personagens", "guild", "eventos", "ranking", "missoes", "reconciliacao"):
        assert f'id="{section_id}"' in html, f"Seção #{section_id} ausente"
