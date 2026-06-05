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
