# Completed — Growth RPG

Blocos concluídos (acrescentar; nunca sobrescrever).

---

## BLK-A1 — Validador de contrato ✅ (base M0/A1, pré-loop)
Concluído no bootstrap, antes do loop autônomo. `contract/validate.py` + `config/schema/dados.schema.json`
validam o `dados.json` do cowork: schema v1.3 + invariantes (não-soma-entre-frentes; `frentes` = as 3;
`vazao_quinzena == round(entregue_quinzena/dias_disponiveis, 2)`; de-dup `total_equipe ≤ soma das contribuicoes`).
**Aceite atingido:** `tests/test_contract.py` + `tests/test_smoke.py` passam; `ruff check .` limpo.

---

## BLK-A2 — App: fundação funcional ✅ (2026-06-05, BLK-A2)
Front que carrega `dados.json` e renderiza TODAS as seções do contrato (correto antes de bonito).
Arquivos criados: `app/index.html`, `app/style.css`, `app/app.js`, `tests/test_app.py`.
Seções renderizadas: personagens (3 frentes × classe/nível/título/barra-XP/vazão/emblemas),
guild (3 frentes × camadas comprometida/alvo/stretch + Chart.js bar chart horizontal + contribuições),
eventos/hordas, ranking por frente (secundário, mesma unidade, sem mistura de frentes),
missões de organização, painel de reconciliação.
**Aceite atingido:** `ruff check .` ✅ · `pytest -v` 6/6 ✅ ·
`test_sem_url_externa` (zero CDN) ✅ · `test_campos_do_contrato` ✅ · `test_vendor_chart_usado` ✅.

---

## BLK-A3 — Design system & tema ✅ (2026-06-05, BLK-A3)
Linguagem visual coesa via tokens CSS em `:root`. 19 tokens hex centralizados (cores, status).
Escalas de espaçamento (--space-1…12), tipografia (--text-xs…2xl), raios, sombras, pesos, line-heights.
Zero hex fora do `:root`; componentes usam `var()`. app.js atualizado: guildChart lê
--color-op/prj/ana e ticks/grid do Chart.js via `getComputedStyle`. `prefers-reduced-motion` mantido.
**Aceite atingido:** `ruff check .` ✅ · `pytest -v` 10/10 ✅ ·
`test_sem_hex_fora_root` ✅ · `test_wcag_aa_texto_principal` ✅ · `test_wcag_aa_status` ✅ · `test_fontes_sem_cdn` ✅.

---

## BLK-A4 — Layout, hierarquia & responsividade ✅ (2026-06-05, BLK-A4)
Grid/flex responsivo mobile-first: base 1-coluna (muito estreito), frentes-grid 3-col ≥ 360px,
grids auto-fill ≥ 768px, layout 3-col fixo ≥ 1280px. `overflow-x: hidden` em html/body.
Seções em ordem: personagens → guild → eventos → ranking → missões → reconciliação.
**Aceite atingido:** `ruff check .` ✅ · `pytest -v` 14/14 ✅ ·
breakpoints 360/768/1280 ✅ · overflow-x ✅ · ordem sections ✅ · viewport meta ✅.
