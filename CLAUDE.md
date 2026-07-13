# CLAUDE.md — Growth RPG (gamificação interna DEG)

Canônico do projeto, lido pelo ralph loop e por todo sub-agente. Em conflito, a skill
`metodologia-guardrails-deg-rpg` vence.

## O que é
App web que **consome e apresenta** (gamificado) o `dados.json`. Hoje o **motor de dados é o cowork**
(skill `growth-rpg-producer` + `produtividade-clickup-ultra`), que lê o ClickUp e calcula. Por
**decisão de 2026-07-09** (ver bloco abaixo), um **backend próprio com paridade testada** também pode
ler o ClickUp e calcular (a construir). O app **valida o contrato**, **apresenta** e **publica**. Time: 3 jogadores
(Felipe, Juan, Vinícius); Marcos = diretor/leitor. Fonte de verdade: ClickUp, space **PROJETOS - DEG**
(`90175557627`), classificação por **tags** (frente + complexidade).

## Documentos canônicos (leia quando relevante)
- `plano-rpg-produtividade.md` — desenho do jogo (regras, frentes, níveis vitalícios, emblemas, objetivo coletivo).
- `contrato-dados-json.md` — schema do `dados.json` (contrato produtor→app). **Produto.**
- `plano-build.md` — arquitetura, marcos, deploy, orquestração.
- `.claude/skills/metodologia-guardrails-deg-rpg/` — **guardrails invioláveis** (carregue sempre).
- `dados.json` / `tests/golden/maio2026_expected.json` — exemplo/golden de referência (fixture do validador e do app).

## Comando de validação
```
ruff check .
pytest -q
```
Marco só fecha com os dois verdes. (A paridade com o painel é **por construção** — o cowork é o mesmo motor; o repo só valida o contrato.)

## Guardrails invioláveis (resumo — detalhe na skill)
- **Três frentes, três unidades:** Operacional = itens (1/tarefa) · Projeto/Análise = pontos de sizing (Baixa 1 / Média 3 / Alta 8). **NUNCA somar entre frentes.** Sem total por pessoa, sem ranking que combine frentes.
- **Determinismo:** só tarefa concluída (`date_done`) com tags válidas pontua; o motor nunca estima. Mesmo input → mesmo `dados.json`.
- **ClickUp de produção: LEITURA ok, ESCRITA proibida** (decisão 2026-07-09). Backend/produtor só **lê** (token no servidor); nunca escreve/move/muda status/tagueia — o cliente de leitura não possui métodos de escrita.
- **Motor pode ser backend com paridade testada** (decisão 2026-07-09): o scoring pode viver num backend do projeto **se** um teste travar a paridade contra o golden; senão, o cowork segue como motor.
- **Níveis vitalícios, selados no fecho** (custos **Op 6 / Prj 8 / Ana 6**; títulos por tier — Guerreiro/Engenheiro/Mago). Decisão 2026-07-12: durante a quinzena o nível acompanha a realidade **ao vivo** (pode descer se uma tarefa errada for removida), mas **nunca abaixo do piso selado** dos fechos anteriores; **no fecho da quinzena** o nível atingido vira o novo piso vitalício.
- **Hierarquia:** subtarefa sem tag de ancestral tagueado = ignorada (não pontua, não é missão); guarda-chuva tagueado com filhos tagueados → contar as folhas, não em dobro.
- **Objetivo coletivo anti-inflação:** HP = backlog comprometido (input curado), nunca inflar.
- **Hordas por palavra-chave no título = cosmético**; o score vem das tags.
- **Deploy contínuo permitido** (decisão 2026-07-09), inclusive pelo loop, **desde que o gate de testes (`ruff`+`pytest`, incl. paridade) esteja verde** — o gate automático substitui o gate humano.

## Decisão registrada — 2026-07-09 (afrouxa 3 guardrails; aprovada por Juan)
Autoriza evoluir o RPG para atualização quase em tempo real via API + deploy contínuo.
**Substitui as redações antigas onde conflitar:**
1. **ClickUp — leitura liberada, escrita PROIBIDA.** Um backend deste projeto PODE **ler** o ClickUp
   de produção (token **só no servidor**, nunca no cliente estático) para atualizar o painel. Continua
   **proibido escrever/mover/mudar status/taguear**; o cliente de leitura não deve ter métodos de escrita.
2. **Motor pode viver no backend, com paridade travada por teste.** O scoring pode ser calculado por um
   backend próprio DESDE QUE um teste trave a paridade contra `tests/golden/maio2026_expected.json` e as
   regras (frentes/unidades/sizing 1/3/8/de-dup/hierarquia/determinismo) sigam **idênticas** ao painel.
   Divergiu do golden = build vermelho.
3. **Deploy contínuo, inclusive pelo loop.** O deploy à produção pode ser **automático** (CI no push à
   main), **inclusive pelo loop autônomo**, contanto que o gate (`ruff`+`pytest`, incl. paridade) esteja
   **verde**. O gate de testes é a rede de segurança que substitui o gate humano.

**Continuam invioláveis:** não somar entre frentes · determinismo · classificação por tags · níveis
vitalícios · **nunca ESCREVER no ClickUp** · anti-inflação do objetivo coletivo.

## Decisão registrada — 2026-07-12 (guarda vitalícia ao vivo; aprovada por Juan)
Com atualização quase em tempo real, o "vitalício" passa a ser **selado no fecho da quinzena**, não
instantâneo. Durante a quinzena o nível/XP acompanha o estado atual do ClickUp **ao vivo** — se uma
tarefa concluída errada for removida/reaberta, o número e até o nível **podem descer** —, porém
**nunca abaixo do piso selado** nos fechos anteriores. No **fecho da quinzena** (reunião com o diretor),
o nível corrente é gravado como o novo **piso vitalício**. Motivo: evitar que um engano trave um nível
para sempre, sem quebrar o "nunca regride" das entregas reais já seladas.

## Parâmetros canônicos (imutáveis sem decisão registrada)
custos 6/8/6 · sizing 1/3/8 · classes/tiers (`config/classes.json`) · limiares de emblema
(`config/emblemas.json`) · `config/marcadores_titulo.json` · camadas (`config/backlog_quinzena.json`).

## Artefatos críticos (tocar = bloco CRÍTICO)
`contract/validate.py` (validador) + `config/schema/dados.schema.json` (contrato) · `config/*.json`
(inputs canônicos) · a regra "não somar entre frentes" · **o teste de paridade contra o golden**. O motor
de scoring vive no **cowork** (e, por decisão 2026-07-09, pode passar a viver num **backend do projeto com
paridade testada**). Mexer no scoring/paridade = bloco CRÍTICO.

## Como o ralph loop opera (autônomo)
Roda em **container isolado**, `--dangerously-skip-permissions`, **sem humano no loop**. A rede de
segurança são os **testes (gate automático, incl. paridade contra o golden)** + **no-bypass** (QA re-roda
tudo, sem atalho). Por **decisão 2026-07-09**, o loop **pode** deployar (CI no push à main) e um backend
**pode ler** o ClickUp (token no servidor) — mas **nunca escreve** no ClickUp. Trabalha um bloco do
`tasks/backlog.md` por vez (Planner→Builder→QA), commit por path. Para quando todos os marcos passam
(cria `LOOP_DONE`) ou trava (3 tentativas no mesmo erro → relatório).

## Estrutura
`contract/` (validador) · `app/` (estático — consome `dados.json`) · `config/` (inputs curados + schema) ·
`tests/` (+ `golden/`) · `deploy/` · `.claude/` (orquestração) · `prompts/` · `tasks/`. (O motor vive no
**cowork**; um backend próprio com paridade testada é permitido — decisão 2026-07-09.)
