# Handoff — Planner

## Próxima Skill
Builder

## Bloco / Objetivo
BLK-A6 — Micro-interações, motion & estados. Hover/focus, transições, animações CSS discretas, e todos os estados de borda renderizando sem quebrar.

## Plano técnico
1. **`app/style.css`** — Adicionar:
   - **Hover states**: `personagem-card:hover` → `box-shadow: var(--shadow-md)`, `frente-card:hover` → fundo levemente mais claro.
   - **Transições**: `personagem-card`, `frente-card`, `guild-card`, `emblema-chip` recebem `transition: box-shadow/background 0.15s ease`.
   - **Focus-visible**: `a:focus-visible`, elementos clicáveis → `outline` com `--color-op`, `outline-offset: 2px`.
   - **`@keyframes emblema-in`**: scale(0.8)+opacity(0) → scale(1)+opacity(1). Aplicado em `.emblema-chip`.
   - **`@keyframes fade-in`**: opacity 0→1. Aplicado em `.personagem-card`, `.guild-card`, `.evento-card`.
   - `prefers-reduced-motion` já desliga `transition` e `animation` — verificar que cobre as novas animações.
2. **`app/app.js`** — Verificar/reforçar edge cases:
   - `nivel = 0, xp_no_nivel = 0`: `xpBarHtml(0, N)` → pct=0, mostra "0/N XP" (já tratado).
   - `missoes_organizacao = []` → "tudo tagueado" (já tratado).
   - `camada_atingida = null/undefined` → `||'—'` (já tratado).
   - `eventos.lista = []` → "nenhum evento" (já tratado).
   - `emblemas_quinzena = []` → "nenhum emblema" (já tratado).
   - Não há mudança necessária no JS — os estados já estão tratados; registrar no handoff.
3. **`tests/test_estados.py`** — Novo teste Python:
   - `test_prefers_reduced_motion()`: style.css tem `@media (prefers-reduced-motion: reduce)` com `animation: none`.
   - `test_hover_states()`: style.css tem seletores `:hover` para cards.
   - `test_animacoes_keyframes()`: style.css tem `@keyframes emblema-in` e `@keyframes fade-in`.
   - `test_estado_baseline_zero()`: cria fixture com nivel=0, xp_total=0 baseado no golden; passa no `validar_arquivo`.
   - `test_estado_sem_missoes()`: fixture com `missoes_organizacao=[]`; passa no validador.
   - `test_estado_guild_abaixo()`: fixture com `entregue_quinzena < camadas.comprometida` e `camada_atingida=null`; passa no validador.
   - `test_error_state_js()`: app.js tem `app-error` e `hidden` (tratamento de erro de fetch).

## Arquivos a alterar
- `app/style.css` (modificar — hover/focus/transitions/keyframes)
- `tests/test_estados.py` (criar)
- `app/app.js` (sem mudança necessária — estados já tratados)

## Critérios de aceite
- `ruff check .` verde
- `pytest -q` verde (inclui test_estados.py)
- `@keyframes emblema-in` e `fade-in` em style.css
- `:hover` em cards de personagem, guild, frente
- `prefers-reduced-motion` anula animações

## Validações obrigatórias
- `ruff check .`
- `pytest -q`

## Criticidade
Normal

## Fora de escopo
- Acessibilidade completa (aria, teclado) → BLK-A7
- Deploy → BLK-A8

## Resultado Builder
Implementado. `ruff check .` ✅ · `pytest -v` 26/26 ✅.
CSS: @keyframes emblema-in, fade-in; :hover para cards; focus-visible; transitions 0.15s.
Estados: baseline-zero, sem missões, guild abaixo da comprometida — todos passam no validador.
BLK-A6 movido para completed.md.
