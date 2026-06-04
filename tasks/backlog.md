# Backlog — Growth RPG (repo = app + contrato + deploy)

**O motor é o cowork** (skill `growth-rpg-producer` + `produtividade-clickup-ultra`): ele lê o
ClickUp e gera o `dados.json`. Este repo **não** recalcula scoring — ele **valida** o `dados.json`,
**apresenta** de forma gamificada e **publica**. O ralph loop trabalha um bloco por vez, em ordem;
cada bloco só fecha com `ruff` + `pytest` verdes. Não somar entre frentes. Não tocar o ClickUp.

---

> **BLK-A1 (Validador de contrato) — CONCLUÍDO** na base M0/A1 (ver `tasks/completed.md`).
> O loop começa pelo **BLK-A2**.

### BLK-A2 — App estático (consumir + apresentar, gamificado e bonito)
**Objetivo:** front que renderiza o estado do jogo a partir do `dados.json`.
**Escopo:** `app/{index.html,style.css,app.js}` + `app/vendor/chart.min.js` (vendorizado, sem CDN).
- **3 trilhas multiclasse por pessoa:** classe (Guerreiro/Engenheiro/Mago), nível, título do tier, barra de XP (`xp_no_nivel`/`xp_para_proximo`), vazão.
- **3 objetivos coletivos (guild):** camadas comprometida→alvo→stretch, camada atingida, tema (território/construção/mapa de insights).
- **Hordas/sub-chefes** (`eventos`), **emblemas** (quinzena + histórico), **ranking por frente** (secundário), **missões de organização**.
- Identidade visual: op=ciano, prj=âmbar, ana=violeta. Foco em apresentação bonita/gamificada.
**Critérios de aceite:** carrega o golden e renderiza tudo certo; **zero** request externa (sem CDN); responsivo. Teste leve: ausência de URLs externas no HTML/JS + o app lê os campos do contrato.

### BLK-A3 — Deploy + auth + reconciliação
**Objetivo:** servir o app atrás do Authelia; conferência app×painel.
**Escopo:** `deploy/Caddyfile.snippet`, `deploy/deploy.sh` (rsync), painel de reconciliação no app (números do app vs. painel gerencial do cowork — devem bater por construção).
**Critérios de aceite (gate de produção é humano):** app só autenticado (os 4) + TLS; refresh do `dados.json` reflete no app; reconciliação visível.

### BLK-A4 — Polimento (pós-MVP)
**Objetivo:** arte de avatar por tier, badges visuais, gráficos de histórico/tendência (do `historico/`), animação de horda, micro-interações.
**Critérios de aceite:** cosmético; não altera/recalcula números; `pytest` segue verde.
