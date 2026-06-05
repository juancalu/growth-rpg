# Handoff — Planner

## Próxima Skill
Builder

## Bloco / Objetivo
BLK-A4 — Layout, hierarquia & responsividade. Grid/flex responsivo com breakpoints 360/768/1280; hero/overview no topo, sem overflow horizontal.

## Plano técnico
1. **`app/style.css`** — Adicionar media queries mobile-first:
   - Base (≤360px): padding reduzido, cards full-width, `frentes-grid` 1 coluna, `personagens-grid` 1 coluna.
   - `@media (min-width: 360px)`: `frentes-grid` volta a 3 colunas (cards com espaço suficiente).
   - `@media (min-width: 768px)`: tablet — padding maior, grid 2 colunas onde aplicável.
   - `@media (min-width: 1280px)`: desktop — grid 3+ colunas, layout wide com sidebar implícita.
   - `body` / `html`: `overflow-x: hidden` para prevenir scroll horizontal.
   - Grids: trocar `minmax(320px, 1fr)` → `minmax(min(100%, 320px), 1fr)` para segurança em mobile.
2. **`app/index.html`** — Verificar/ajustar ordem semântica das sections: personagens (hero) → guild → eventos → ranking → missões → reconciliação. Adicionar `<meta name="viewport" content="width=device-width, initial-scale=1.0">` (já presente, confirmar).
3. **`tests/test_layout.py`** — Novo teste Python:
   - `test_breakpoints_media_queries()`: style.css contém `@media` com os três breakpoints (360px, 768px, 1280px).
   - `test_overflow_horizontal_prevenido()`: style.css menciona `overflow-x` (body/html).
   - `test_ordem_sections_html()`: index.html tem as sections na ordem correta (#personagens, #guild, #eventos, #ranking, #missoes, #reconciliacao).
   - `test_viewport_meta()`: index.html contém `<meta name="viewport"`.

## Arquivos a alterar
- `app/style.css` (modificar — adicionar media queries + overflow fix)
- `tests/test_layout.py` (criar)
- `app/index.html` (verificar — provavelmente sem mudança necessária)

## Critérios de aceite
- `ruff check .` verde
- `pytest -q` verde (inclui test_layout.py)
- `test_breakpoints_media_queries` passa (360, 768, 1280 presentes)
- `test_overflow_horizontal_prevenido` passa
- `test_ordem_sections_html` passa
- `test_viewport_meta` passa

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
Implementado. `ruff check .` ✅ · `pytest -v` 14/14 ✅.
BLK-A4 movido para completed.md.
