# Growth RPG

Gamificação interna da produtividade do time DEG (3 jogadores; Marcos = diretor/leitor).
**Motor de scoring = o cowork** (skill `growth-rpg-producer`); **este repo = app web estático + validador de contrato + deploy**. Alimentado pelo ClickUp (read-only, no cowork). Sem soma entre frentes, sem ranking geral. Ver `CLAUDE.md` e `plano-rpg-produtividade.md` (§3 = desenho do jogo).

## Arquitetura (resumo)
`Cowork (motor: lê ClickUp read-only → FLUXO 3) → dados.json + painel.html → VPS (Caddy+Authelia) → app estático`.
Sem backend, sem banco: o app só **consome e apresenta** o `dados.json`; o repo não recalcula scoring. Detalhe em `plano-build.md`.

## Dev local
```
python -m venv .venv && . .venv/bin/activate    # (Windows: .venv\Scripts\activate)
pip install -e ".[dev]"
ruff check .
pytest -q
```

## Build autônomo (ralph loop)
O projeto é construído por um loop autônomo do Claude Code, em **container isolado**
(`--dangerously-skip-permissions`), sem intervenção humana. Ver `plano-build.md` §11 e
`COMO-RODAR.md`. O loop trabalha os marcos de `tasks/backlog.md` até todos passarem.

## Documentos
- `CLAUDE.md` — canônico (guardrails, comando de validação, mapa de criticidade).
- `plano-rpg-produtividade.md` — desenho do jogo.
- `contrato-dados-json.md` — schema do `dados.json`.
- `plano-build.md` — arquitetura/marcos/deploy/orquestração.
- `.claude/skills/metodologia-guardrails-deg-rpg/` — guardrails invioláveis.
