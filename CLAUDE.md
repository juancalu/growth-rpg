# CLAUDE.md — Growth RPG (gamificação interna DEG)

Canônico do projeto, lido pelo ralph loop e por todo sub-agente. Em conflito, a skill
`metodologia-guardrails-deg-rpg` vence.

## O que é
App web que **consome e apresenta** (gamificado) o `dados.json`. O **motor único de dados é o cowork**
(skill `growth-rpg-producer` + `produtividade-clickup-ultra`): ele lê o ClickUp e calcula. **Este repo
NÃO recalcula scoring** — ele **valida o contrato**, **apresenta** e **publica**. Time: 3 jogadores
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
- **Read-only no ClickUp de produção.** O **produtor (cowork)** só lê; nunca escreve/move/tagueia. **Este repo não toca o ClickUp.**
- **Níveis vitalícios** (sem reset): custos **Op 6 / Prj 8 / Ana 6**; títulos por tier (classes Guerreiro/Engenheiro/Mago).
- **Hierarquia:** subtarefa sem tag de ancestral tagueado = ignorada (não pontua, não é missão); guarda-chuva tagueado com filhos tagueados → contar as folhas, não em dobro.
- **Objetivo coletivo anti-inflação:** HP = backlog comprometido (input curado), nunca inflar.
- **Hordas por palavra-chave no título = cosmético**; o score vem das tags.
- **Nada à produção/VPS sem humano.** O loop roda em sandbox/container; deploy é passo humano.

## Parâmetros canônicos (imutáveis sem decisão registrada)
custos 6/8/6 · sizing 1/3/8 · classes/tiers (`config/classes.json`) · limiares de emblema
(`config/emblemas.json`) · `config/marcadores_titulo.json` · camadas (`config/backlog_quinzena.json`).

## Artefatos críticos (tocar = bloco CRÍTICO)
`contract/validate.py` (validador) + `config/schema/dados.schema.json` (contrato) · `config/*.json`
(inputs canônicos) · a regra "não somar entre frentes". **O motor de scoring NÃO está aqui** — vive
no cowork; o repo só valida e apresenta.

## Como o ralph loop opera (autônomo)
Roda em **container isolado**, `--dangerously-skip-permissions`, **sem humano no loop**. A rede de
segurança são os **testes (gate automático)** + **no-bypass** (QA re-roda tudo, sem atalho) + o
**limite do container** (sem credencial de produção, sem VPS; o repo **não toca o ClickUp** — o motor é o
cowork). Trabalha um bloco do `tasks/backlog.md` por vez (Planner→Builder→QA), commit por path, nunca
merge/push/deploy. Para quando todos os marcos passam (cria `LOOP_DONE`) ou trava (3 tentativas no mesmo erro → relatório).

## Estrutura
`contract/` (validador) · `app/` (estático — consome `dados.json`) · `config/` (inputs curados + schema) ·
`tests/` (+ `golden/`) · `deploy/` · `.claude/` (orquestração) · `prompts/` · `tasks/`. (O motor de scoring
vive no **cowork**, não aqui.)
