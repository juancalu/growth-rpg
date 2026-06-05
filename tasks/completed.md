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

---

## BLK-A5 — Data-viz & gráficos ✅ (2026-06-05, BLK-A5)
Guild chart melhorado: stacked bar com 3 datasets (comprometida / delta-alvo / delta-stretch, stack='meta')
+ entregue (stack='real'). Novo `guildContribChart()`: horizontal bar por pessoa com `contribuicoes_quinzena`.
CSS colors lidas via `cssVar()` (getComputedStyle). 2 instâncias de Chart por frente = 6 total.
**Aceite atingido:** `ruff check .` ✅ · `pytest -v` 19/19 ✅ ·
camadas stacked ✅ · contrib chart ✅ · sem CDN ✅.

---

## BLK-A6 — Micro-interações, motion & estados ✅ (2026-06-05, BLK-A6)
CSS: `@keyframes emblema-in` (scale+opacity) e `fade-in` (slide+opacity) para chips e cards.
Hover: shadow-md em personagem/guild/ranking/reconciliação; fundo mais claro em frente-card.
Transitions 0.15s ease em cards; focus-visible com outline --color-op.
`prefers-reduced-motion` desliga todas as transições + animações.
Estados de borda validados via fixtures: baseline-zero, sem missões, guild abaixo da comprometida.
**Aceite atingido:** `ruff check .` ✅ · `pytest -v` 26/26 ✅ ·
@keyframes ✅ · :hover ✅ · reduced-motion ✅ · fixtures de borda ✅.

---

## BLK-A7 — Acessibilidade & polish final ✅ (2026-06-05, BLK-A7)
- `--color-text-faint` corrigido: #64748b → #8492a6 (3.97:1 → 5.97:1 no bg; 3.53:1 → 5.32:1 no surface).
- `favicon.svg` criado (SVG local, dark bg + "G" ciano). index.html: meta description + favicon + role="main".
- `tests/test_a11y.py`: lang, título, meta description, favicon local, sections aria-labelledby,
  canvas aria-label, role=progressbar, WCAG AA text-faint.
- Nenhum hex fora de :root; todos os testes antigos continuam verdes.
**Aceite atingido:** `ruff check .` ✅ · `pytest -v` 35/35 ✅ · WCAG AA text-faint ✅ · favicon local ✅.

---

## BLK-A8 — Deploy + auth + reconciliação ✅ (2026-06-05, BLK-A8)
`deploy/Caddyfile.snippet` e `deploy/deploy.sh` já existiam e estão corretos:
Caddyfile usa `forward_auth` (Authelia), `file_server`, `encode gzip`, `Cache-Control: no-store` para dados.json.
deploy.sh usa `rsync`, env vars `${VPS_USER}` / `${VPS_HOST}` (sem hosts hardcoded), sem `git push`.
Seção `#reconciliacao` com nota "Paridade por construção — mesmo motor (cowork/FLUXO 3)".
Nota: O loop **escreveu** os scripts mas **não publicou** — gate de produção é humano.
**Aceite atingido:** `ruff check .` ✅ · `pytest -v` 45/45 ✅ ·
Caddyfile forward_auth+file_server ✅ · deploy.sh rsync+env vars ✅ · reconciliação paridade ✅.

---

## BLK-A9 — Atmosfera dark-fantasy ✅ (2026-06-05, BLK-A9)
Fundo em camadas no `body`: SVG grain (base64, zero URL externa), vinheta radial, aura ciano 15%/10%,
aura violeta 85%/90%, gradiente base direcional 160°. Tokens adicionados ao `:root`:
`--aura-op/prj/ana` (rgba), `--shadow-glow-op/prj/ana`, `--shadow-lg`. Hover glow frente-específico
em `.guild-card[data-frente]` e `.frente-card[data-frente]`. Nenhuma URL `http(s)://` no CSS.
**Aceite atingido:** `ruff check .` ✅ · `pytest -v` 49/49 ✅ ·
aura tokens ✅ · multicamadas ✅ · sem URL externa ✅ · WCAG AA mantido ✅.
