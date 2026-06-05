# Handoff — Planner

## Próxima Skill
Builder

## Bloco / Objetivo
BLK-A2 — App: fundação funcional. Front que carrega `dados.json` e renderiza TODAS as seções do contrato (correto antes de bonito).

## Plano técnico
1. **`app/index.html`** — HTML semântico: header (meta/quinzena), main com 7 sections (`#personagens`, `#guild`, `#eventos`, `#ranking`, `#missoes`, `#reconciliacao`, `#error`). Referencia `style.css`, `vendor/chart.min.js` (script global), `app.js` (type=module). Zero CDN.
2. **`app/style.css`** — Dark theme funcional (não finalizado; BLK-A3 refina). CSS custom properties mínimas para cores de frente (ciano/âmbar/violeta), cartões, barra de XP, chips de emblema. `prefers-reduced-motion` presente.
3. **`app/app.js`** — ES module. `fetch('dados.json')` → `renderApp(dados)`. Funções:
   - `renderMeta(meta)` → quinzena label/datas/ancora no header
   - `renderPersonagens(pessoas, emblemasCatalogo)` → cards com 3 frentes cada: classe, nível, titulo do tier, barra XP (`xp_no_nivel`/`xp_para_proximo`), vazão, emblemas_quinzena, emblemas_historico
   - `renderGuild(guild)` → 3 frentes: camadas (comprometida/alvo/stretch), entregue_quinzena, camada_atingida, Chart.js bar chart horizontal (4 barras: comprometida/alvo/stretch/entregue), contribuicoes_quinzena
   - `renderEventos(eventos, emblemasCatalogo)` → lista de hordas: nome, frente, hp, restante, concluido, tarefas com assignee/pontos/complexidade
   - `renderRanking(ranking_quinzena)` → tabela por frente (mesma unidade), pos/pessoa/valor/vazão — secundário/cosmético
   - `renderMissoes(missoes_organizacao)` → lista de missões com motivo
   - `renderReconciliacao(guild)` → contribuições por pessoa × frente vs total_equipe_quinzena
   - Estado de erro: `#app-error` visível se fetch falha
4. **`tests/test_app.py`** — Teste Python leve:
   - `test_sem_url_externa()`: nenhum `https?://` em `app/**/*.{html,css,js}`
   - `test_campos_do_contrato()`: `app.js` contém campos-chave do contrato (`xp_no_nivel`, `xp_para_proximo`, `vazao_quinzena`, `emblemas_quinzena`, `guild`, `ranking_quinzena`, `missoes_organizacao`, `eventos`)
   - `test_vendor_chart_usado()`: `index.html` referencia `vendor/chart.min.js`, sem `cdn`

## Arquivos a alterar/criar
- `app/index.html` (criar)
- `app/style.css` (criar)
- `app/app.js` (criar)
- `tests/test_app.py` (criar)
- `context/handoff.md` (este arquivo — atualizar após build)

## Critérios de aceite
- `ruff check .` verde
- `pytest -q` verde (inclui `test_app.py`, `test_smoke.py`, `test_contract.py`)
- `tests/test_app.py::test_sem_url_externa` passa (zero `http(s)://` em `app/`)
- `tests/test_app.py::test_campos_do_contrato` passa (campos do contrato referenciados)
- `tests/test_app.py::test_vendor_chart_usado` passa

## Validações obrigatórias
- `ruff check .`
- `pytest -q`

## Criticidade
Normal (não toca `contract/validate.py`, `config/schema/dados.schema.json` nem regra não-soma-entre-frentes no motor)

## Fora de escopo
- Design refinado (tokens, paleta final) → BLK-A3
- Layout responsivo completo → BLK-A4
- Animações/motion → BLK-A6
- Acessibilidade completa → BLK-A7
- Deploy → BLK-A8
- Recalcular scoring — o motor é o cowork; este repo só apresenta
- Suposições de produto novas (registrar no handoff se aparecerem)

## Resultado Builder
Implementado. `ruff check .` ✅ · `pytest -v` 6/6 ✅.
QA aprovado: zero URL externa, sem mistura de frentes, ranking só por frente, zero soma cruzada.
BLK-A2 movido para completed.md.
