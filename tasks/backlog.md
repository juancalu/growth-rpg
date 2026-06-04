# Backlog — Growth RPG (repo = app + contrato + deploy)

**O motor é o cowork** (skill `growth-rpg-producer` + `produtividade-clickup-ultra`): ele lê o
ClickUp e gera o `dados.json`. Este repo **não** recalcula scoring — ele **valida** o `dados.json`,
**apresenta** de forma gamificada e **publica**. O ralph loop trabalha um bloco por vez, em ordem;
cada bloco só fecha com `ruff` + `pytest` verdes. Não somar entre frentes. Não tocar o ClickUp.

> **BLK-A1 (Validador de contrato) — CONCLUÍDO** na base M0/A1 (ver `tasks/completed.md`).
> O loop começa pelo **BLK-A2**. **Deploy é o ÚLTIMO bloco (BLK-A8).**

---

## Design brief (norte do app — todo bloco visual obedece isto)

Estética: **escura, moderna, clean e profissional** — RPG no vocabulário, mas é uma ferramenta de
trabalho que o diretor também vê. Nada de "gamer cafona". Princípio "diversão, não vigilância":
cooperativo, ranking é secundário/cosmético, linguagem de RPG (nível/classe/guild/emblema) — nunca
a narrativa gerencial do painel.

- **Cor por frente:** Operacional = ciano · Projeto = âmbar · Análise = violeta. Acento só nas
  frentes; fundo/texto em neutros (tema escuro por padrão). Reaproveita a identidade do painel FLUXO 3.
- **Tipografia:** *system font stack* ou fonte self-hosted (woff2 em `app/vendor/`). **NUNCA CDN de
  fontes** (Google Fonts etc.) — zero request externa.
- **Espaçamento:** escala consistente (múltiplos de 4px), respiro generoso, grid responsivo.
- **Superfícies:** cards em camadas, cantos arredondados suaves, sombras/realces sutis, hierarquia clara.
- **Motion:** sutil e com propósito (150–250ms); conquistas (level-up, emblema, horda) com animação
  discreta. **Respeita `prefers-reduced-motion`.**
- **Sem CDN, sem build step:** HTML/CSS/JS vanilla (ES modules) + `app/vendor/chart.min.js` (já presente).

> **Limite do loop (importante):** o agente roda *headless* e **não enxerga a tela** — ele constrói
> para esta spec e para critérios **verificáveis por código** (contraste WCAG calculado dos tokens,
> ausência de URL externa, media queries, semântica, `prefers-reduced-motion`). O **julgamento visual
> ("ficou bonito?") é humano** (ou um review com visão): rode o app, veja, e peça o próximo refino.

---

### BLK-A2 — App: fundação funcional (consumir + renderizar tudo)
**Objetivo:** front que carrega o `dados.json` e renderiza **todas** as seções do contrato — correto antes de bonito.
**Escopo:** `app/{index.html,style.css,app.js}` (ES modules); `fetch('dados.json')` → render.
- 3 trilhas multiclasse/pessoa (classe, nível, título do tier, barra de XP via `xp_no_nivel`/`xp_para_proximo`, vazão).
- 3 objetivos de guild (camadas comprometida→alvo→stretch, camada atingida, tema), hordas (`eventos`),
  emblemas (quinzena + histórico), ranking por frente (secundário), missões de organização, painel de reconciliação.
**Aceite:** carrega o golden e mostra todos os campos certos; **zero request externa** (sem CDN);
usa `vendor/chart.min.js`. Teste leve (Python): nenhum `http(s)://` externo em `app/`; o app referencia os campos do contrato.

### BLK-A3 — Design system & tema (tokens, dark, tipografia, componentes)
**Objetivo:** linguagem visual coesa via tokens — base para tudo ficar bonito e consistente.
**Escopo:** `app/style.css` com **CSS custom properties**: paleta (frentes + neutros), tema escuro,
escala tipográfica, escala de espaçamento, raios, sombras. Componentes base: card, barra, chip de
tier/classe, medalha de emblema. Sem valores "mágicos" fora dos tokens.
**Aceite:** cores/spacings vêm de tokens (sem hex solto fora do bloco de tokens — checável por grep);
**contraste texto/fundo ≥ WCAG AA** (calculável dos tokens — teste Python); fontes sem CDN.

### BLK-A4 — Layout, hierarquia & responsividade
**Objetivo:** arquitetura de informação clara e responsiva (mobile → desktop), clean e moderna.
**Escopo:** grid/flex, breakpoints (≈360 / 768 / 1280), hero/overview no topo, cards de personagem,
seção de guild, depois ranking/eventos/missões/reconciliação. Respiro, alinhamento, sem poluição.
**Aceite:** media queries presentes p/ os breakpoints; sem overflow horizontal; ordem/peso visual
seguem o design brief. (Aparência final = review humano.)

### BLK-A5 — Data-viz & gráficos (barras, camadas, Chart.js)
**Objetivo:** as visualizações que contam a história dos números.
**Escopo:** barra de XP segmentada (progresso no nível), barra de guild em **3 camadas**
(comprometida/alvo/stretch + marcador da atingida), gráficos com **Chart.js vendorizado** (ex.:
tendência por frente a partir de `historico/`, distribuição da quinzena). Cores por frente.
**Aceite:** gráficos renderizam a partir dos dados (não hardcoded); **zero request externa**; números
batem com o `dados.json` (sem recalcular). Teste leve: usa só `vendor/chart.min.js`.

### BLK-A6 — Micro-interações, motion & estados
**Objetivo:** vida e polimento sem exagero; cobrir todos os estados.
**Escopo:** hover/focus states, transições suaves, animação discreta de level-up / emblema novo /
horda derrotada. Estados: **baseline zero** (1ª quinzena), **sem missões** ("tudo tagueado"), guild
**abaixo da comprometida**, e erro de fetch / dados ausentes. `prefers-reduced-motion` desliga o motion.
**Aceite:** todos os estados acima renderizam sem quebrar (teste com fixtures mínimas); media query
`prefers-reduced-motion` presente e efetiva.

### BLK-A7 — Acessibilidade & polish final
**Objetivo:** acessível, robusto e visualmente fechado.
**Escopo:** HTML semântico, `aria-*` onde necessário, navegação por teclado, foco visível, `alt`/labels,
contraste revisado em todos os componentes (não só texto base), `<title>`/meta, favicon local. Limpeza
final de CSS/JS.
**Aceite:** contraste AA em todos os pares texto/fundo (teste Python dos tokens usados); âncoras de
teclado/foco presentes; `ruff`/`pytest` verdes. (Auditoria visual final = humano.)

### BLK-A8 — Deploy + auth + reconciliação (ÚLTIMO — gate de produção é humano)
**Objetivo:** servir o app atrás do Authelia; conferência app×painel.
**Escopo:** `deploy/Caddyfile.snippet`, `deploy/deploy.sh` (rsync), painel de reconciliação (números do
app vs. painel do cowork — batem por construção).
**Aceite (deploy real é humano):** app só autenticado (os 4) + TLS; refresh do `dados.json` reflete no
app; reconciliação visível. O loop **escreve os scripts**, mas **não publica** — VPS/creds ficam fora do container.
