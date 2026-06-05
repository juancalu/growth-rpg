# Current Task

Status: TODOS OS BLOCOS (A9-A15) CONCLUÍDOS ✅ — LOOP_DONE criado

BLK-A15 — Avatares de classe (slot + fallback glyph)
- app.js: CLASSES const + avatarHtml() (vendor/img/classe-*.png + onerror glyph fallback)
- app.js: renderHeroAvatars() injetado em renderApp()
- app.js: personagem-avatares (3 slots) no topo de cada personagem-card
- style.css: .avatar-slot / .avatar-img / .avatar-glyph / .personagem-avatares / .hero-avatars
- tests/test_avatares.py: 8 testes (funções, slot, fallback, vendor, sem URL externa)
- ruff check . ✅ · pytest -v 93/93 ✅

BLK-A9 — Atmosfera dark-fantasy (fundo, profundidade, aura)
- `app/style.css`: tokens `--aura-op/prj/ana` + `--shadow-glow-*` + `--shadow-lg`
- `app/style.css`: body.background multicamadas (SVG grain b64 + vinheta + 2 auras + gradiente base)
- `app/style.css`: glow hover em `.guild-card[data-frente]` e `.frente-card[data-frente]`
- `tests/test_atmosfera.py`: 4 testes (aura tokens, shadow-glow tokens, multicamadas, sem URL externa)
- `ruff check .` ✅ · `pytest -v` 49/49 ✅
