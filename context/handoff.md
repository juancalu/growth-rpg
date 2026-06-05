# Handoff — Planner

## Próxima Skill
Builder

## Bloco / Objetivo
BLK-A5 — Data-viz & gráficos. Melhorar visualizações: guild com 3 camadas empilhadas + entregue; chart de contribuições por pessoa; Chart.js com dados do contrato (sem hardcode).

## Plano técnico
1. **`app/app.js`**:
   - `guildChart(f, g)`: trocar 4 barras individuais por layout stacked:
     - Dataset 1: comprometida (stack 'meta') → barra empilhada camada 1
     - Dataset 2: `alvo - comprometida` (stack 'meta') → delta camada 2
     - Dataset 3: `stretch - alvo` (stack 'meta') → delta camada 3
     - Dataset 4: entregue (stack 'real') → barra sólida separada
     - Labels: `['Meta (camadas)', 'Entregue']`
   - Adicionar `guildContribChart(f, g)`: chart horizontal per-pessoa de contribuições quinzena.
     - Labels: nomes das pessoas (keys de `contribuicoes_quinzena`)
     - Dataset: valores (itens ou pontos)
   - Em `renderGuild()`: adicionar segundo canvas `guild-contrib-{f}` ao HTML do guild card; chamar `guildContribChart()` após `guildChart()`.
2. **`tests/test_dataviz.py`** — Novo teste:
   - `test_guild_chart_usa_camadas()`: app.js referencia `comprometida`, `alvo`, `stretch`, `entregue_quinzena`.
   - `test_chart_instancias_multiplas()`: `new Chart(` aparece ≥ 2 vezes (guild + contrib).
   - `test_chart_dados_nao_hardcoded()`: app.js não tem literais numéricos do golden fixos (ex.: 117, 211, 80, 140) nas calls de Chart.
   - `test_chart_sem_cdn()`: app.js não referencia CDN de Chart.

## Arquivos a alterar
- `app/app.js` (modificar — guildChart stacked + guildContribChart)
- `tests/test_dataviz.py` (criar)

## Critérios de aceite
- `ruff check .` verde
- `pytest -q` verde (inclui test_dataviz.py)
- Guild chart usa stack de camadas
- Chart de contribuições por pessoa existe

## Validações obrigatórias
- `ruff check .`
- `pytest -q`

## Criticidade
Normal

## Fora de escopo
- Animações/motion → BLK-A6
- Acessibilidade completa → BLK-A7
- Deploy → BLK-A8

## Resultado Builder
Implementado. `ruff check .` ✅ · `pytest -v` 19/19 ✅.
Guild chart stacked (comprometida/delta-alvo/delta-stretch + entregue). guildContribChart por pessoa.
BLK-A5 movido para completed.md.
