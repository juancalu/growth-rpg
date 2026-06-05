# Handoff — Planner

## Próxima Skill
Builder

## Bloco / Objetivo
BLK-A3 — Design system & tema. Tokens CSS coesos em `:root`; zero hex fora do bloco de tokens; WCAG AA verificável por teste Python.

## Plano técnico
1. **`app/style.css`** — Reescrever `:root {}` com sistema de tokens completo:
   - Paleta de cores (frentes + neutros + status); **TODOS os hexes aqui**
   - Escala de espaçamento (--space-1…--space-12, múltiplos de 4px/0.25rem)
   - Escala tipográfica (--text-xs…--text-2xl)
   - Pesos de fonte (--fw-normal…--fw-bold)
   - Raios (--radius-sm, --radius, --radius-lg, --radius-full)
   - Sombras (--shadow-sm, --shadow-md) — usa rgba(), não hex
   - Line-heights (--leading-tight, --leading-normal, --leading-relaxed)
   - Nos componentes: substituir **todos** os hex por `var()`. Mágicos de espaçamento → tokens onde possível.
2. **`app/app.js`** — Atualizar `guildChart()` para ler cores via `getComputedStyle` ao invés de hex hardcoded (--color-op/prj/ana). Ticks e grid do Chart.js lêem --color-text-muted / --color-border via CSS var.
3. **`tests/test_design.py`** — Novo teste Python:
   - `test_sem_hex_fora_root()`: parse style.css; remove bloco `:root {…}`; verifica que nenhum `#[0-9a-fA-F]{3,8}` aparece no restante.
   - `test_wcag_aa()`: parse tokens hex do `:root`; calcula luminância relativa; verifica contraste ≥ 4.5:1 para pares texto/fundo principais: --color-text × --color-bg, --color-text × --color-surface, --color-text-muted × --color-bg, --color-text-muted × --color-surface. Pares de status (≥ 3.0:1 large text mínimo): --color-success × --color-success-bg, --color-warning × --color-warning-bg, --color-error-text × --color-error-bg.
   - `test_fontes_sem_cdn()`: style.css não contém `fonts.googleapis` nem `fonts.gstatic` nem `@import url(http`.

## Arquivos a alterar
- `app/style.css` (modificar — reescrita total do :root + componentes)
- `app/app.js` (modificar — guildChart lê CSS vars)
- `tests/test_design.py` (criar)

## Critérios de aceite
- `ruff check .` verde
- `pytest -q` verde (inclui test_design.py)
- `test_sem_hex_fora_root` passa (zero hex fora do :root em style.css)
- `test_wcag_aa` passa (≥ 4.5:1 text+bg pares principais)
- `test_fontes_sem_cdn` passa

## Validações obrigatórias
- `ruff check .`
- `pytest -q`

## Criticidade
Normal

## Fora de escopo
- Layout/responsividade completa → BLK-A4
- Animações/motion → BLK-A6
- Acessibilidade completa (aria, teclado) → BLK-A7
- Deploy → BLK-A8
- Recalcular scoring

## Resultado Builder
Implementado. `ruff check .` ✅ · `pytest -v` 10/10 ✅.
QA: zero hex fora de :root (19 tokens), WCAG AA passando (texto ≥ 4.5:1, status ≥ 3.0:1), sem CDN de fontes.
BLK-A3 movido para completed.md.
