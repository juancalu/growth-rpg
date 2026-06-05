# Handoff — Planner

## Próxima Skill
Builder

## Bloco / Objetivo
BLK-A7 — Acessibilidade & polish final. HTML semântico completo, aria-*, favicon local, WCAG AA em todos os pares de texto, limpeza final.

## Plano técnico
1. **`app/style.css`** — Corrigir `--color-text-faint: #64748b → #8492a6` (atual falha AA: 3.97:1 no bg; novo: 5.97:1 no bg, 5.32:1 no surface). Atualizar só o token no :root.
2. **`app/index.html`** — Adicionar:
   - `<link rel="icon" href="favicon.svg" type="image/svg+xml">`
   - `<meta name="description" content="Growth RPG — painel gamificado de produtividade do time DEG">`
   - `role="main"` em `<main>` se não presente.
3. **`app/favicon.svg`** — Criar SVG simples: fundo dark (#1a1d27), letra "G" ou ícone em cyan (#06b6d4). Sem URLs externas.
4. **`tests/test_a11y.py`** — Novo teste:
   - `test_titulo_html()`: index.html tem `<title>` com "Growth RPG".
   - `test_meta_description()`: index.html tem `<meta name="description"`.
   - `test_favicon_local()`: index.html referencia `favicon.svg` local; o arquivo existe em app/.
   - `test_sections_aria_labelledby()`: sections principais têm `aria-labelledby`.
   - `test_canvas_aria_labels()`: app.js não tem `<canvas` sem `aria-label`.
   - `test_xp_bar_role_progressbar()`: app.js tem `role="progressbar"` com `aria-valuenow`.
   - `test_wcag_aa_text_faint()`: --color-text-faint ≥ 4.5:1 em --color-bg e --color-surface.
   - `test_lang_atributo()`: index.html tem `lang="pt-BR"`.

## Arquivos a alterar/criar
- `app/style.css` (modificar — --color-text-faint)
- `app/index.html` (modificar — favicon, meta description)
- `app/favicon.svg` (criar)
- `tests/test_a11y.py` (criar)

## Critérios de aceite
- `ruff check .` verde
- `pytest -q` verde (inclui test_a11y.py)
- --color-text-faint ≥ 4.5:1 em bg e surface
- favicon.svg existe e é referenciado

## Validações obrigatórias
- `ruff check .`
- `pytest -q`

## Criticidade
Normal

## Fora de escopo
- Deploy → BLK-A8
- Auditoria visual (review humano)

## Resultado Builder
Implementado. `ruff check .` ✅ · `pytest -v` 35/35 ✅.
--color-text-faint corrigido (5.97:1). favicon.svg criado. index.html: meta desc + favicon.
BLK-A7 movido para completed.md.
