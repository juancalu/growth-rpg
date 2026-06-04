# Completed — Growth RPG

Blocos concluídos (acrescentar; nunca sobrescrever).

---

## BLK-A1 — Validador de contrato ✅ (base M0/A1, pré-loop)
Concluído no bootstrap, antes do loop autônomo. `contract/validate.py` + `config/schema/dados.schema.json`
validam o `dados.json` do cowork: schema v1.3 + invariantes (não-soma-entre-frentes; `frentes` = as 3;
`vazao_quinzena == round(entregue_quinzena/dias_disponiveis, 2)`; de-dup `total_equipe ≤ soma das contribuicoes`).
**Aceite atingido:** `tests/test_contract.py` + `tests/test_smoke.py` passam; `ruff check .` limpo.
