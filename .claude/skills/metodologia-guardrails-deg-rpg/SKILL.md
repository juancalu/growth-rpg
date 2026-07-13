---
name: metodologia-guardrails-deg-rpg
description: Regras inegociáveis e guardrails do projeto "RPG de Produtividade" (gamificação do time DEG; fonte de verdade = ClickUp, space PROJETOS - DEG). Use SEMPRE que for escrever ou revisar qualquer coisa ligada a pontuação, XP, níveis, frentes, sizing/complexidade, itens, vazão, agregação por pessoa, barra de guild, temporadas, prestígio, ingestão do ClickUp, motor de pontuação (scoring-core) ou paridade com o painel oficial ("FLUXO 3") — mesmo que a tarefa não cite explicitamente "metodologia", "regras" ou "guardrails". Carregue ANTES de escrever código de cálculo e ANTES de qualquer acesso ao ClickUp. O propósito é impedir que o loop autônomo viole as regras "por conveniência" ou "para simplificar".
---

# Metodologia & Guardrails — RPG de Produtividade (DEG)

Esta skill é o **trilho** do build autônomo. O projeto é uma gamificação estilo RPG da produtividade de um time de 3 pessoas (Felipe, Juan, Vinícius). É **motivação lúdica, não avaliação de desempenho nem ferramenta de RH**. A fonte de verdade é o ClickUp (space `PROJETOS - DEG`, id `90175557627`).

O **painel oficial ("FLUXO 3")** é a leitura **gerencial** (capacidade, vazão, bus factor, foco de 1:1) — hoje uma tarefa quinzenal no cowork que gera HTML. Este app é a camada **lúdica**. Os dois consomem o **mesmo motor** (mesmos números por pessoa/frente), mas o app **NÃO** reproduz a narrativa gerencial — isso protege a segurança psicológica. A paridade é garantida por **construção** (motor reusado no **cowork**) OU, por **decisão 2026-07-09**, por **teste**: um `scoring-core` no backend travado contra o golden (`tests/golden/maio2026_expected.json`). Ver `references/tabela-validade-e-sizing.md`, §7.

As regras abaixo não são burocracia: cada uma existe porque a sua violação **quebra a credibilidade do jogo** ou **fere a segurança psicológica do time**. Entenda o porquê e honre o espírito, não só a letra.

---

## 1. Três frentes, três unidades — NUNCA misturar

Cada tarefa pertence a **uma frente**, e cada frente mede valor numa **unidade diferente**:

| Frente | Unidade | Como pontua |
|---|---|---|
| **Operacional** | **itens** (volume) | **1 tarefa concluída = 1 item** (os estudos passam a entrar um a um). Exceção histórica: tarefas em lote antigas (ex.: "(29 estudos)") cujo volume o painel contou — só ao reprocessar ciclos passados. **Não usa complexidade.** |
| **Projeto** | **pontos de sizing** | soma do sizing da complexidade |
| **Análise** | **pontos de sizing** | soma do sizing da complexidade |

**Por que importa:** as unidades são incomensuráveis. 1 item operacional, 1 ponto de projeto e 1 ponto de análise **não são a mesma moeda**. Tratar como se fossem é o erro que destrói o jogo.

---

## 2. Escala de sizing (só Projeto e Análise)

| Complexidade | Pontos |
|---|---|
| Baixa | **1** |
| Média | **3** |
| Alta | **8** |

Operacional **não recebe** complexidade. Se uma tarefa operacional vier com tag de complexidade, **ignore a complexidade** (ela ainda vale 1 item).

---

## 3. A REGRA DE OURO: nunca somar entre frentes

- **Nunca** crie um "XP total", "pontos totais por pessoa", nível geral ou ranking que **combine frentes**. (Um ranking **por frente** na quinzena — mesma unidade — é permitido, secundário e cosmético; ver §7.)
- Cada pessoa **upa independentemente em cada frente** (personagem multiclasse: 3 trilhas separadas, sem nível total).
- Comparar pontos de frentes diferentes é **comparar manga com uva**. Não existe estrutura, coluna, soma ou gráfico que combine unidades de frentes diferentes.

**Permitido (mesma unidade):** somar, **dentro de uma frente**, a contribuição de várias pessoas para a **barra coletiva de guild** daquela frente. Operacional+Operacional+Operacional = ok (tudo em itens). Operacional+Projeto = proibido.

**Se em algum momento o código tiver uma variável que soma frentes diferentes, ou um ranking de pessoas, a iteração está errada — pare e corrija.**

---

## 4. Determinismo — o motor nunca inventa número

- Só conta tarefa com **status concluído** E **classificação válida** (§6).
- O motor **nunca estima, arredonda criativamente nem completa dados faltantes**. Sem heurística, sem ML, sem aleatoriedade, sem relógio influenciando o cálculo.
- Mesmo input → mesmo output (idempotente). Recomputar do zero a cada ciclo deve dar o mesmo snapshot.

---

## 5. Classificação vem de ETIQUETAS (tags) do ClickUp

A fonte canônica de classificação são as **tags** (etiquetas) da tarefa (confirmado pelo time):

- **Frente:** `operacional` | `projeto` | `análise`
- **Complexidade:** `baixa` | `média` | `alta`

Normalize de forma robusta antes de comparar: **caixa-insensível e acento-insensível** (`Análise`, `analise`, `ANÁLISE` → `análise`). As custom fields `Frente`/`Complexidade` existem no space mas **não são preenchidas** — não dependa delas (use só como fallback opcional se decidido por um humano).

Para o conjunto completo de regras de validade, casos de borda e decisões já tomadas/pendentes, **leia** `references/tabela-validade-e-sizing.md`.

Regra rápida:
- Operacional válido = concluído + tag `operacional` (complexidade irrelevante).
- Projeto/Análise válido = concluído + tag de frente + **exatamente uma** tag de complexidade.
- Qualquer outra coisa (sem frente, frente ambígua, projeto/análise sem ou com complexidade ambígua) → **não pontua** e vira **"missão de organização"** (higiene como gameplay).
- **Hierarquia importa:** subtarefa **sem tag** cujo **ancestral tem frente** = detalhamento simples → **ignorada** (não pontua, **não** é missão). Só é missão a tarefa sem frente que NÃO é filha de uma tarefa tagueada. E cuidado com **dupla contagem**: pai tagueado com filhos tagueados é container — conte as folhas, não o pai. A ingestão precisa resolver `parent`/`top_level_parent`.

---

## 6. Guardrails da execução autônoma (hard constraints)

Estes são limites duros do loop. **Não relaxe nenhum sem aprovação humana explícita.**

> **Decisão registrada 2026-07-09 (aprovada por Juan)** afrouxou 3 destes — ver o bloco no fim desta seção.
> O que mudou: (1) backend PODE **ler** o ClickUp; (2) motor PODE viver num backend com **paridade testada**;
> (3) deploy pode ser **automático** (incl. loop) com o **gate de testes verde**. **ESCRITA no ClickUp segue proibida.**

- **ClickUp de produção é SOMENTE-LEITURA.** **Ler** é permitido (backend com token no servidor — decisão 2026-07-09); **escrever é proibido**: o cliente **não deve possuir métodos de escrita**. Nunca criar, mover, editar, comentar, mudar status ou tags no workspace real. Para testar, use dataset sintético/sandbox ou snapshot read-only.
- **Deploy pode ser automático** (decisão 2026-07-09), **inclusive pelo loop**, **desde que o gate de testes (`ruff`+`pytest`, incl. paridade contra o golden) esteja verde**. O gate automático substitui o gate humano. (Antes: nada ia a produção sem aprovação humana.)
- **Motor com paridade testada.** O motor pode viver no **cowork** OU num **backend do projeto** (decisão 2026-07-09) — mas, se calculado aqui, um **teste trava a paridade** contra `tests/golden/maio2026_expected.json` e as regras (frentes/unidades/sizing/de-dup/hierarquia/determinismo). Divergiu = build vermelho. Painel e app exibem os **mesmos números**.
- **Nunca relaxar a regra de não-somar-entre-frentes** "para simplificar".
- **Toda suposição relevante deve ser explicitada** no output/PR para revisão humana — não decida silenciosamente questões de produto.

### Decisão registrada — 2026-07-09 (afrouxa 3 guardrails; aprovada por Juan)
Objetivo: atualização quase em tempo real via **API (leitura)** + **deploy contínuo**. Substitui as
redações antigas onde conflitar. **Continuam invioláveis:** não somar entre frentes · determinismo ·
classificação por tags · níveis vitalícios · **nunca ESCREVER no ClickUp** · anti-inflação do objetivo coletivo.
1. **ClickUp:** backend PODE **ler** produção (token só no servidor, nunca no cliente estático); escrever/mover/status/tag **proibido**.
2. **Motor:** scoring pode ser calculado por backend próprio **se** houver teste de paridade contra o golden; senão, cowork segue como motor.
3. **Deploy:** automático (CI no push à main), **inclusive pelo loop**, com o gate (`ruff`+`pytest`, incl. paridade) **verde**.

---

## 7. Princípios de design a honrar

- **Recompensa majoritariamente cosmética** (títulos, avatar, badges, prestígio). Quanto menos vantagem mensurável, menos incentivo a burlar.
- **Cooperativo > competitivo.** O foco é o progresso **contra o próprio histórico** + o objetivo coletivo da guild. Um **ranking por frente** na quinzena é permitido (decisão do time), mas **secundário** — dentro da frente (mesma unidade), nunca combinando frentes nem somando total por pessoa. Para ser justo com afastamentos, pode ordenar por **vazão**.
- **Neutralidade a afastamentos.** XP é monotônico (nunca regride) — férias/folga não fazem ninguém regredir. Vazão = entregue ÷ dias disponíveis, com o denominador **excluindo** dias indisponíveis.
- **Ritmos diferentes por frente são esperados**, não desigualdade: Análise = boss fights raros e épicos; Operacional = limpar hordas; Projeto = construir a fortaleza.
- **Premiar precisão de estimativa, não sizing alto.** Sizing idealmente revisado por outra pessoa que não o executor.
- **Progressão VITALÍCIA (sem reset), SELADA no fecho.** Nível e XP acumulam para sempre, por frente — NÃO zerar a cada ciclo (decisão do time 2026-06-03). **Decisão 2026-07-12 (atualização ao vivo):** o "vitalício" é **selado no fecho da quinzena**, não instantâneo — durante a quinzena o nível/XP acompanha o estado atual do ClickUp ao vivo (uma tarefa concluída errada removida/reaberta **pode fazer descer**), mas **nunca abaixo do piso selado** nos fechos anteriores; no fecho, o nível corrente vira o novo piso vitalício. Isso evita que um engano trave um nível para sempre. A renovação vem de **emblemas/conquistas quinzenais** (cosméticos, renováveis), não de reset. Custo fixo por nível: **Op 6 · Projeto 8 · Análise 6** (XP = 1 por item/ponto). Cada frente tem uma **classe cosmética** (Operacional=Guerreiro, Projeto=Engenheiro, Análise=Mago) com 12 tiers de título por faixa de nível — o título depende **só do nível daquela frente**, nunca combina frentes. Detalhe em [contrato-dados-json.md](../../../contrato-dados-json.md).
- **Objetivo coletivo = construção/conquista por frente** (Operacional = Conquista de Território/hexágonos · Projeto = Construção da Base · Análise = Mapa de Insights). Soma **dentro** da frente, nunca entre frentes.
- **GUARDRAIL anti-inflação (Goodhart) do objetivo coletivo:** o "HP" vem do **backlog real comprometido e priorizado por valor** da quinzena (estilo sprint planning), **travado no planejamento ANTES da reunião quinzenal com o diretor**. **NUNCA** inflar o backlog com item fácil/baixo valor só para ter um "boss gordo" e vitória garantida. Dimensionar pela **vazão das últimas 1–2 quinzenas**, em **faixa/camadas**: `comprometida` (piso, alta confiança) → `alvo` → `stretch` (heroico). Matar a base é o piso; o stretch é o épico.
- **Emblemas = conquista por entrega (determinística), salva no histórico.** Ex.: "registrou ≥10 pts de Análise na quinzena → Alquimista". Limiar por frente/quinzena; nada de "quem fez mais" como emblema (isso é o ranking secundário, não conquista). Emblema baseado em esforço/precisão fica **fora por enquanto** (esforço ainda não é mensurável de forma determinística).
- **Sub-chefes / hordas (urgência não planejada):** bugs/correções/urgentes que surgem no meio da quinzena formam um **encontro separado** do boss comprometido (não inflam o backlog planejado). Farmam XP **real** (pontuam normal na frente; sized 1/3/8 como qualquer Projeto). Detecção por **palavra-chave no título** (lista fixa: fix/bug/corrigir/correção/hotfix/blk-fix) é **só cosmética** — define o encontro, **nunca** o score (que vem sempre das tags). Guardrail: representam defeito/urgência **real** — nunca recompensar a CRIAÇÃO de bug; XP modesto. Não é gate que segura XP.
- **Âncora da quinzena:** reunião "alinhamento e resultados" com o diretor, a cada 2 quintas de manhã (18/06, 02/07, 16/07…). Backlog/camadas travados no planejamento dela.
- **Crédito de tarefas colaborativas:** no recorte **por pessoa**, credite cada responsável; nos **totais de equipe/guild**, conte cada entregável **uma vez** (de-dup). É assim que o painel fecha os números.
- **Volume operacional e anti-gaming:** regra **a partir de agora = 1 tarefa concluída = 1 item** (os estudos passam a ser registrados um a um). As tarefas em lote antigas (Maio: 29/25) foram **pontuais** — só importam ao reprocessar ciclos passados; não otimize o motor para elas. XP por item **modesto** e premiar **consistência/streak**, não picos.

---

## 8. Checklist antes de fechar qualquer iteração

Confirme, no que você tocou:
1. Nenhuma soma/struct/gráfico mistura unidades de **frentes diferentes**.
2. Não existe XP total por pessoa nem ranking geral entre pessoas.
3. Operacional = 1 item por tarefa concluída (lote antigo só ao reprocessar histórico) e ignora complexidade; Projeto/Análise usam 1/3/8.
4. Só tarefa **concluída + válida** pontua; inválidas viram missão de organização.
5. Classificação lida das **tags** (normalizadas), não inventada.
6. Nenhum caminho de código escreve no ClickUp de produção.
7. O cálculo é determinístico e idempotente.
8. Suposições de produto novas foram **explicitadas** para revisão humana.

Se algum item falhar, a iteração não está pronta.

---

## Referência

- `references/tabela-validade-e-sizing.md` — tabela completa de validade, mapa de sizing, casos de borda e decisões (tomadas e pendentes). Leia antes de implementar a validação ou a ingestão.
