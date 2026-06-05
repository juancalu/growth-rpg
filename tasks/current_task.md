# Current Task

Status: BLK-A10 ✅ — próximo: BLK-A11

BLK-A9 — Atmosfera dark-fantasy (fundo, profundidade, aura)
- `app/style.css`: tokens `--aura-op/prj/ana` + `--shadow-glow-*` + `--shadow-lg`
- `app/style.css`: body.background multicamadas (SVG grain b64 + vinheta + 2 auras + gradiente base)
- `app/style.css`: glow hover em `.guild-card[data-frente]` e `.frente-card[data-frente]`
- `tests/test_atmosfera.py`: 4 testes (aura tokens, shadow-glow tokens, multicamadas, sem URL externa)
- `ruff check .` ✅ · `pytest -v` 49/49 ✅
