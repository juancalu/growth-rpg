# Plano de Build — Growth RPG (gamificação interna DEG)

**Sessão:** planejamento de implementação. Ainda **não** é para codar — é o passo a passo para o ralph loop executar com critérios de aceite.
**Premissas de recurso (metas do Felipe):** ≤ 1 GB RAM · ≤ 10 GB disco · CPU mínima. VPS Ubuntu (Hostinger), 4 vCPU / 16 GB / 200 GB SSD, já com **Caddy + Authelia + Docker**. Uso por **4 pessoas** (3 jogadores + Marcos leitor).
**Princípio de recurso:** a arquitetura é **estática + arquivos** — o app não tem backend nem banco; o consumo incremental na VPS é ~0 RAM/CPU e < 100 MB de disco. Folgadíssimo dentro das metas.

> **Arquitetura (reconciliada 2026-06-03 — este documento já está alinhado):** o **motor de scoring é o cowork** (skill `growth-rpg-producer` + `produtividade-clickup-ultra`) — **não** há `scoring-core` Python no repo. Este repo = **validar o contrato + app + deploy**. Marcos reais em `tasks/backlog.md` (**A1–A4**). A paridade com o painel é **por construção** (mesmo motor); o repo só valida e apresenta.

> **Nota de verificação:** o deploy abaixo assume Caddy + Authelia já presentes (memória do Motor de Expansão). Não foi possível checar ao vivo nesta sessão (o MCP SSH precisa de host/user explícitos). Confirmar com 1 comando antes do M5 (ver §11).

---

## 1. Visão geral e por que essa arquitetura é a mais leve

Três camadas, com uma fronteira de dados clara (o `dados.json`):

```
┌─ PRODUTOR (cowork, agendado) ───────────────────────────────┐
│  lê ClickUp (READ-ONLY via MCP) → motor FLUXO 3 (no cowork)  │
│  → emite dados.json + painel.html → rsync p/ a VPS           │
└──────────────────────────────────────────────────────────────┘
                              │ (SSH, key auth)
                              ▼
┌─ VPS Ubuntu (já tem Caddy + Authelia) ──────────────────────┐
│  /srv/growth-rpg/  →  app estático + dados.json             │
│  Caddy (TLS) → Authelia (só os 4) → serve arquivos estáticos│
└──────────────────────────────────────────────────────────────┘
                              │ HTTPS (autenticado)
                              ▼
                  APP no navegador (3 trilhas, guild,
                  hordas, emblemas, ranking, missões)
```

Por que estático: para 4 pessoas, **não há motivo para um servidor dinâmico nem banco**. O motor roda no produtor (fora da VPS, no cowork), e a VPS só **serve arquivos**. Isso zera RAM/CPU steady e mantém o disco em MB. É também a opção **mais segura** (superfície de ataque mínima: sem backend, sem DB exposto).

---

## 2. Stack / tecnologias (mínima e sustentável)

| Camada | Tecnologia | Por quê |
|---|---|---|
| **Motor (scoring)** | **Cowork** (skill `growth-rpg-producer` + `produtividade-clickup-ultra`) | Motor único = o mesmo do painel (FLUXO 3). Sem lib Python no repo → sem dois motores divergindo. |
| **Validação de contrato** | **Python 3.12+** (`contract/validate.py`, `jsonschema`) | O repo valida o `dados.json` do cowork (schema + invariantes); não recalcula. |
| **Ingestão** | Python + ClickUp MCP (ou `requests` com token read-only) | Leitura da fonte de verdade. Cliente **sem métodos de escrita**. |
| **Validação/qualidade** | `pytest`, `ruff`, `jsonschema` | Testes + lint + validação do contrato. Leves. |
| **Frontend** | **HTML/CSS/JS vanilla (ES modules), sem build step** + **Chart.js vendorizado** (sem CDN) | Zero toolchain de runtime, zero chamada externa (não vaza dados). Simples de manter por 3 pessoas. |
| **Servidor/proxy** | **Caddy** (já na VPS) — TLS automático, serve estático | Reaproveita o que existe; ~0 recurso extra. |
| **Auth** | **Authelia** (já na VPS) | Só os 4 acessam; protege a conexão (requisito de segurança). |
| **Armazenamento** | **arquivos JSON** (`dados.json` + `historico/`) | Sem banco. KB por arquivo; MB no total. |
| **Deploy de dados** | `rsync` over SSH (key auth) | Empurra `dados.json`/`painel.html` para a VPS. |
| **Orquestração do build** | ralph loop + `/run-cycle` **adaptado leve** (§11) | Mantém o loop nos trilhos sem o peso do rigor máximo. |

Decisão consciente: **nada de Node/React/Vue/banco**. Vanilla + Chart.js cobre tudo que o app precisa, sem build, sem servidor, sem manutenção de dependências.

---

## 3. Estrutura do projeto

```
growth-rpg/
├── CLAUDE.md                      # canônico p/ o ralph loop (guardrails, comandos, mapa)
├── pyproject.toml                 # ruff + pytest; deps mínimas (jsonschema, requests opc.)
├── README.md
├── Dockerfile · run-ralph-loop.sh · COMO-RODAR.md   # container isolado do ralph loop
│
├── contract/                      # validador do contrato (NÃO recalcula scoring)
│   └── validate.py                # dados.json → schema + invariantes (não somar entre frentes, vazão, de-dup)
│
├── app/                           # FRONTEND estático (servido pelo Caddy)
│   ├── index.html
│   ├── style.css
│   ├── app.js                     # fetch('dados.json') → render
│   └── vendor/chart.min.js        # vendorizado (sem CDN)
│
├── config/                        # INPUTS curados (não código)
│   ├── classes.json               # classes/trilhas (12 tiers) — do dados.json
│   ├── emblemas.json              # catálogo de emblemas (limiares)
│   ├── disponibilidade.json       # dias úteis − afastamentos por pessoa (curado)
│   ├── backlog_quinzena.json      # backlog comprometido + camadas (curado na reunião)
│   ├── marcadores_titulo.json     # palavras-chave das hordas (cosmético)
│   └── schema/dados.schema.json   # JSON Schema do contrato (valida o output)
│
├── tests/
│   ├── golden/maio2026_expected.json   # golden de referência (fixture do validador/app)
│   ├── test_contract.py           # golden passa no validador (schema + invariantes)
│   └── test_smoke.py              # config carrega; invariantes-base do golden
│
├── deploy/
│   ├── Caddyfile.snippet          # bloco do subdomínio rpg.<dominio> + forward_auth Authelia
│   └── deploy.sh                  # rsync app/ + dados.json p/ a VPS
│
└── .claude/                       # orquestração do ralph loop (run-cycle leve, §11)
    ├── commands/run-cycle.md
    ├── skills/metodologia-guardrails-deg-rpg/   # já existe (guardrails do jogo)
    ├── prompts/{planner,builder,qa}.md
    └── ... (tasks/, context/handoff.md)
```

---

## 4. Motor de scoring — vive no COWORK (não no repo)

O cálculo (validade, hierarquia, pontos, nível, título, vazão, guild, emblemas, ranking, hordas e a montagem do `dados.json`) é feito pela **skill do cowork** (`growth-rpg-producer` + `produtividade-clickup-ultra`), reusando o código do **FLUXO 3** — o mesmo motor do painel. Código e passo a passo em **`skill_growth_rpg.md`**. O repo **não reimplementa** isso (evita dois motores divergentes); a paridade com o painel é **por construção**.

O que fica no repo: o **validador** (`contract/validate.py`) que confere o `dados.json` recebido contra o schema + invariantes. **Parâmetros canônicos** (custos **6/8/6**, sizing **baixa 1 / média 3 / alta 8**, classes/tiers, limiares de emblema, `marcadores_titulo`) vivem em `config/*.json` — lidos pelo cowork e validados pelo schema do repo.

---

## 5. Ingestão do ClickUp — no COWORK (read-only)

A leitura do ClickUp (space PROJETOS - DEG) é do **cowork**, via MCP, **somente-leitura** (sem create/update/delete/move/tag/comment). O cowork normaliza tags (caixa/acento), `date_done`, `parent`/`top_level_parent` (hierarquia) e coleta o histórico completo para o `xp_total` vitalício (recomputado da fonte, sem persistir totais → sem drift). **O repo não toca o ClickUp.** Detalhe em `skill_growth_rpg.md` §2.

---

## 6. App estático (frontend)

- `index.html` + `app.js` fazem `fetch('dados.json')` e renderizam. **Zero** chamada externa (Chart.js vendorizado).
- Telas: **3 trilhas multiclasse por pessoa** (nível, título da classe, barra de XP via `xp_no_nivel`/`xp_para_proximo`, vazão) · **3 objetivos coletivos** (camadas comprometida/alvo/stretch) · **hordas/sub-chefes** (`eventos`) · **emblemas da quinzena + histórico** · **ranking por frente** (secundário) · **missões de organização** · **painel de reconciliação** (números do app vs painel oficial).
- Reaproveita a identidade visual do painel FLUXO 3 (op=ciano, prj=âmbar, ana=violeta).
- Sem estado próprio: tudo vem do `dados.json`. Se o schema mudar, sobe `schema_version`.

---

## 7. Deploy na VPS + segurança

**Topologia:** subdomínio `rpg.<dominio>` → Caddy (TLS automático) → **Authelia forward_auth** (só os 4) → serve `/srv/growth-rpg/` (estático + `dados.json`).

`deploy/Caddyfile.snippet` (ideia):
```
rpg.SEU-DOMINIO {
    forward_auth authelia:9091 {
        uri /api/verify?rd=https://auth.SEU-DOMINIO
        copy_headers Remote-User Remote-Groups
    }
    root * /srv/growth-rpg
    file_server
    encode gzip
}
```

`deploy/deploy.sh` (ideia): `rsync -az app/ dados.json painel.html usuario@vps:/srv/growth-rpg/` (key auth).

### Segurança (proporcional — interno, sem dado sensível, mas sem vazar)
| Item | Medida |
|---|---|
| Acesso ao app | **Authelia** (só os 4) + **TLS** (Caddy). Nunca público. |
| ClickUp | Token **read-only**; cliente sem métodos de escrita (testado). Token em secret, nunca no git. |
| Sem vazamento por terceiros | Assets **vendorizados** (sem CDN) → o app não faz nenhuma request externa. |
| Deploy | SSH **key auth**; `/srv/growth-rpg` só serve estático, sem backend/DB exposto. |
| Conteúdo | `dados.json` tem só nomes + scores (sem PII sensível), ainda assim atrás do Authelia. |
| Repo | `.gitignore` para segredos; nenhuma credencial versionada. |
| Superfície | Estático = sem injeção de backend, sem porta de banco. |

Isso cobre "proteger qualquer conexão que possa vazar dados confidenciais" sem o peso de um projeto com dados sensíveis.

---

## 8. Orçamento de recursos (vs metas)

| Recurso | Meta | Estimativa real | Folga |
|---|---|---|---|
| RAM (steady, na VPS) | ≤ 1 GB | **~0 incremental** (Caddy já roda; serve estático) | enorme |
| RAM (produtor, ao rodar) | — | ~30–60 MB por alguns segundos (fora da VPS, no cowork) | — |
| Disco | ≤ 10 GB | app+vendor ~1–2 MB · `dados.json` ~30 KB · histórico 2 anos ~20 MB → **< 50 MB** | enorme |
| CPU | mínima | ~0 steady; pico só no rsync/serve | enorme |

Conclusão: a arquitetura estática fica **ordens de grandeza** abaixo das metas. Se um dia quiserem isolar em container, um `caddy:alpine` dedicado custa ~15–30 MB RAM — ainda trivial; mas reaproveitar o Caddy existente é o mais leve.

---

## 9. Marcos do build (para o ralph loop) — com critérios de aceite

Cada marco: **branch própria, commit por path, testes verdes**. Sem gate humano no loop (a rede é teste + no-bypass + container). **O repo não toca o ClickUp** (o motor é o cowork). Marcos vivos em `tasks/backlog.md`.

- **M0 — Fundações (CONCLUÍDO, verde).** Repo, `pyproject.toml` (ruff+pytest), `CLAUDE.md`, `config/*` (classes/emblemas/disponibilidade/backlog/marcadores/schema), golden `maio2026_expected.json`, validador iniciado, skill de guardrails, run-cycle autônomo instalado.
  - *Aceite (atingido):* `ruff check` limpo; `pytest -q` verde; o golden valida no schema e no validador de contrato.
- **A1 — Validador de contrato.** `contract/validate.py` (schema + invariantes). NÃO recalcula scoring.
  - *Aceite:* `tests/test_contract.py` valida o golden sem erros (schema; sem soma entre frentes; vazão coerente; de-dup ≤ soma).
- **A2 — App estático.** 3 trilhas multiclasse, objetivos coletivos (camadas), hordas, emblemas, ranking, missões, a partir do `dados.json`. Apresentação gamificada e bonita.
  - *Aceite:* carrega o golden e renderiza certo; **zero** request externa (assets vendorizados); responsivo.
- **A3 — Deploy + auth + reconciliação.** Caddy serve app+data atrás do Authelia; `deploy.sh`; reconciliação app×painel.
  - *Aceite (gate de produção é humano):* app acessível **só** autenticado (os 4) com TLS; refresh reflete no app; reconciliação visível.
- **A4 — Polimento (pós-MVP).** Arte de avatar por tier, badges, gráficos de histórico/tendência, animação de horda.
  - *Aceite:* cosmético; não recalcula números; `pytest` segue verde.

---

## 10. Estratégia de teste (validação de contrato — paridade por construção)

A paridade com o painel **não** é testada por re-cálculo no repo (não há re-cálculo aqui) — é **por construção**: o cowork é o mesmo motor do painel. O repo testa o **contrato**:

1. **Validador** (`tests/test_contract.py`) — o golden de Maio (e qualquer `dados.json` do cowork) passa em `contract/validate.py`: schema + invariantes.
2. **Invariantes** — (a) nenhum campo de total por pessoa / ranking que combine frentes; (b) `frentes` = exatamente as 3; (c) `vazao_quinzena == round(entregue_quinzena/dias, 2)`; (d) `total_equipe_quinzena` (de-dup) ≤ soma das `contribuicoes_quinzena`.
3. **Schema** — `dados.json` valida contra `config/schema/dados.schema.json` (no validador e em CI).
4. **Smoke** (`tests/test_smoke.py`) — config carrega; totais de equipe do golden conferem com o painel (117/211/42).
5. **Reconciliação na UI** (A3) — o app mostra app × painel × diff por (pessoa, frente) e guild; devem bater (mesmo motor).

---

## 11. Orquestração do build adaptada (`/run-cycle` leve)

Seu `/run-cycle` original é rigor máximo (Block Orchestrator → Planner → Builder → QA, handoffs versionados append-only, helper byte-idêntico, no-bypass, dry-run autônomo, gate humano). Para um **RPG interno sem dados sensíveis**, isso é exagero. Proponho rigor **"Essencial-leve"**.

### Mapa de adaptação (genérico → este projeto)
| Conceito | Neste projeto |
|---|---|
| `{{ARTEFATOS_CRITICOS}}` | `contract/validate.py` (validador) · `config/schema/dados.schema.json` (contrato) · `config/*.json` (inputs canônicos) · invariante "não somar entre frentes" |
| `{{PARAMETROS_CANONICOS}}` | custos 6/8/6 · sizing 1/3/8 · classes/tiers · limiares de emblema · `marcadores_titulo` |
| `{{GUARDRAILS_DOMINIO}}` | a skill **`metodologia-guardrails-deg-rpg`** (carregar e honrar sempre) |
| `{{COMANDO_VALIDACAO}}` | `ruff check .` + `pytest -q` (inclui `test_contract`: schema + invariantes) |
| `{{GATILHO_CRITICIDADE_CRITICA}}` | tocar em `contract/validate.py`, no schema, ou nos `config/*.json` → **bloco CRÍTICO (QA reforçado)** |
| `{{ARQUIVO_PRODUTO}}` | `contrato-dados-json.md` + `plano-rpg-produtividade.md` |

### Autonomia total + isolamento (o eixo do desenho)
O loop roda **sem nenhuma intervenção humana durante o desenvolvimento**, com `--dangerously-skip-permissions` ligado, **dentro de um container isolado**. Para isso ser seguro sem humano no meio, a segurança migra do "gate por tarefa" para o **limite do container**:
- **Container Docker** (ex.: `python:3.12-slim`) com **só o repo montado** como volume — escreve só ali ("não vaza para fora do repositório").
- **Sem credenciais de produção dentro:** nenhuma chave SSH da VPS, nenhum token de **escrita** do ClickUp. Só token **read-only** do ClickUp ou — melhor para o loop — **fixtures locais/snapshot** (zero rede).
- **Egress de rede restrito:** idealmente offline; se precisar do ClickUp, liberar só o host da API de leitura + índice de pacotes. **Sem** acesso à VPS/produção.
- **Git isolado:** o loop trabalha numa branch/worktree; **nunca** faz merge na main nem push/deploy. Entrega um branch para revisão.
- O container é de **BUILD** (efêmero, na máquina de dev) — **não muda o runtime** do app, que segue estático e leve na VPS.

Assim os guardrails do briefing continuam: **read-only no ClickUp** e **nada à produção sem você** — só que o "gate humano" sai do loop e vira **revisão do branch + deploy manual**, fora dele. Dentro, é 100% autônomo.

### O que **manter** e o que **cortar** (variante autônoma)
**Manter — e reforçar (sem humano, os automáticos são a única rede):**
- **Critérios de aceite = gate automático:** um marco só fecha se `ruff check .` + `pytest -q` (inclui `test_contract`: schema + invariantes) passam. Verde é a licença para avançar.
- **No-bypass / auto-verificação (PROMOVIDO a essencial):** o QA re-roda tudo e **rejeita verde obtido por atalho** (mockar caminho crítico, config vazia). Sem humano olhando, isso vale mais, não menos.
- **Loop até "done" com parada:** condição de parada = todos os marcos verdes. Anti-loop infinito: se o **mesmo erro** persistir após 3 tentativas, **parar e deixar relatório** em vez de insistir.
- Branch + **commit por path** (nunca `git add -A`) · skill de guardrails em **todo** passo · `git status` checado (nada não relacionado arrastado).

**Cortar (peso sem retorno aqui):** **gate humano por tarefa** (substituído pelo limite do container) · helper de housekeeping byte-idêntico + teste · snapshots de handoff versionados (basta o corrente) · **Block Orchestrator** separado (funde no Planner) · dry-run autônomo pós-merge (não há merge no loop).

### Pipeline (loop autônomo, sem pausa)
`Planner (plano) → Builder (implementa + roda testes) → QA (re-roda tudo, sem bypass; confere invariantes + paridade) → fecha marco (commit por path) → próximo marco`. Se o QA reprova: cria bloco de correção e o **próprio loop** reexecuta. Para quando todos os marcos passam ou quando trava (relatório). A skill `metodologia-guardrails-deg-rpg` é carregada em **todos** os passos.

### `.claude/commands/run-cycle.md` (versão autônoma — pronta para usar)
```markdown
# /run-cycle — Orquestrador autônomo (Growth RPG, ralph loop)

Roda 100% autônomo, dentro de container isolado, com permissões puladas. SEM intervenção humana
no loop. Carregue SEMPRE a skill `metodologia-guardrails-deg-rpg`. Tarefa: $ARGUMENTS

## 0. Pré-condições (container)
Você está num container isolado: escreve só no repo, sem credencial de produção, ClickUp read-only
(ou fixtures locais), sem acesso à VPS. NUNCA tente deploy, push para main, nem escrita no ClickUp.

## 1. Contexto
Leia CLAUDE.md, tasks/current_task.md, tasks/backlog.md e a skill de guardrails.

## 2. Esteira (sem gate humano)
Para o marco atual: Planner (plano: arquivo/função/mudança) → Builder (implementa só o escopo;
roda ruff check, pytest -q, test_contract) → QA (RE-roda tudo por conta própria,
rejeita verde por atalho; confere invariantes: sem soma entre frentes, schema válido,
schema válido, paridade com o golden).

## 3. Fechamento (automático)
Fecha o marco SÓ com tudo verde. Commit por path (nunca git add -A). Atualiza current_task/completed.
Se QA reprova: cria bloco de correção no backlog e CONTINUA o loop para corrigir (não pede humano).

## 4. Parada
Para quando todos os marcos do backlog estão verdes. Anti-loop: se o MESMO erro persistir após
3 tentativas, PARE e escreva um relatório do bloqueio (não insista nem invente bypass).

## Guardrails (a rede, já que não há humano no loop)
- Critérios de aceite = gate. Nada avança com teste vermelho.
- NO-BYPASS: nunca contornar validação para "ficar verde". Verde por atalho = não-executado.
- NUNCA escrever no ClickUp; NUNCA tocar VPS/produção; NUNCA merge na main / push / deploy.
- Nunca relaxar as regras da skill de guardrails. Commit por path; rollback não-destrutivo.
- Toda suposição relevante: registrar no handoff (o humano revisa depois, fora do loop).
```
Os `prompts/{planner,builder,qa}.md` seguem os do seu original; **mantenha** a re-execução **no-bypass** do QA (essencial no modo autônomo) e **corte** housekeeping byte-idêntico e dry-run. `{{GUARDRAILS_DOMINIO}}` = "carregue a skill metodologia-guardrails-deg-rpg".

---

## 12. Armazenamento / backup (DECIDIDO: JSON, sem banco)
Avaliação honesta: o `dados.json` é **derivado** — recalculado do ClickUp a cada execução (XP vitalício recomputado do histórico, que vive no ClickUp). Se perdê-lo, **regenera**. Logo:
- **Sem banco-servidor** (Postgres/MySQL): adicionaria processo, RAM, schema, migrações e o **próprio backup do banco** — tudo para guardar um dado regenerável de ~30 KB. Custo sem retorno e contra a meta de recurso.
- **JSON-only no MVP.** Histórico + backup = diretório **`historico/`** de snapshots diários do `dados.json` (KB cada; ~20 MB em 2 anos) — é o histórico **e** o backup, em **2 cópias** (VPS + cowork).
- **O que de fato precisa de backup** (não recomputável do ClickUp): os **inputs curados** (`backlog_quinzena`, `disponibilidade`) → **versionados no git**.
- **Evolução futura, só se precisar de _consulta_ de tendências:** **SQLite** (1 arquivo, sem servidor, ~0 RAM), nunca um banco-servidor. Provavelmente nem isso será necessário (dá para recomputar qualquer estado histórico do ClickUp + `date_done`).

## 13. Riscos e decisões abertas (pequenas, não bloqueiam o build)
- **[DH]** Regra de **guarda-chuva tagueado** (pai tagueado + filhos tagueados) — confirmar "conta as folhas".
- **[DH]** Sign-off dos **limiares de emblema**.
- **[DH]** Onde o **produtor roda** (cowork no PC do Felipe vs cron na VPS). Recomendo: cowork para gerar + opção de cron Python na VPS para o refresh diário barato (sem custo de LLM). Decidir.
- **VPS:** confirmar Caddy/Authelia/usuário/subdomínio (1 comando) antes do M5.
- **Paridade de Maio:** o lote de estudos foi contado pelo painel — usar um mês **pós-mudança** como baseline de paridade, ou tratar o lote como exceção conhecida.
- **Autonomia:** o loop roda em container isolado (sem credencial de produção); revisão do branch + deploy são os únicos toques humanos, fora do loop.

---

## 14. Como disparar o build
**M0 e A1 já estão verdes** (validador + golden; ver `COMO-RODAR.md`). O loop arranca no **A2 (app)**.
1. (uma vez) `git init` + commit do M0; gerar `claude setup-token` (Max) → `CLAUDE_CODE_OAUTH_TOKEN`.
2. `docker build -t growth-rpg-loop .` e `docker run` com o token (ver `COMO-RODAR.md`). O loop pega o próximo bloco do `tasks/backlog.md` (A2 → A3 → A4).
3. Ex. de ciclo: `/run-cycle "implementar o app estático (A2) que consome o dados.json conforme §6"`.
4. Antes do **A3 (deploy)**, confirmar a VPS e o subdomínio. Deploy atrás do Authelia (passo humano, fora do loop).

O **contrato** (`dados.json` + `contract/validate.py` + schema) é o artefato crítico do repo: é onde mora o cumprimento das regras inegociáveis. O **motor é o cowork** (paridade por construção).
```
