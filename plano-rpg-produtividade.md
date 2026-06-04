# Plano — "RPG de Produtividade" (gamificação interna)

**Sessão:** planejamento e arquitetura (não implementação).
**Autor:** agente planejador.
**Fonte de verdade inspecionada:** ClickUp, workspace `PROJETOS - DEG` (space `90175557627`), em modo somente-leitura.
**Status deste documento:** proposta para revisão humana. Pontos marcados com **[DH]** exigem decisão humana antes de implementar.

> **NOTA DE ARQUITETURA (reconciliado 2026-06-03):** este documento é o **desenho do jogo** — as **regras valem** (esp. §3: frentes/unidades, níveis **vitalícios**, classes/tiers, emblemas, objetivo coletivo, hierarquia). As seções de arquitetura (§2), marcos (§4) e build (§9) já estão **alinhadas ao estado real**: o **motor de scoring é o cowork** (skill `growth-rpg-producer` + `produtividade-clickup-ultra`, reusando o FLUXO 3) — **não** há motor de cálculo no repo. **Este repo valida o contrato (`dados.json`), apresenta (app) e publica (deploy).** A paridade com o painel é **por construção** (mesmo motor); os níveis são **vitalícios sem reset** e o objetivo coletivo é de **construção/conquista**. Marcos vivos: **A1–A4** (M0 concluído) — ver `CLAUDE.md`, `plano-build.md` e `tasks/backlog.md`.

---

## 0. Achados de campo (inspeção real do ClickUp)

Antes de planejar no abstrato, inspecionei o workspace real. O que encontrei muda decisões concretas do plano:

1. **As custom fields da metodologia já existem no space** (nível `space`):
   - `Frente` (dropdown): **Operacional**, **Projeto**, **Análise** — bate 1:1 com a metodologia.
   - `Complexidade da Tarefa` (dropdown): **Baixa**, **Média**, **Alta**.
   - `Pontos` (formula) — atualmente retorna `null` (fórmula stub/não calculando). [DH] Precisa saber se já houve tentativa de embutir o cálculo no ClickUp.
2. **Mas o time não usa as custom fields — classifica por _tags_**: `operacional`/`projeto`/`análise` (frente) e `baixa`/`média`/`alta` (complexidade). Há, portanto, **duas fontes possíveis de classificação** e elas divergem. Isto é uma decisão de arquitetura, não um detalhe (ver §2.4).
3. A metodologia se confirma nos dados reais:
   - Tarefas `operacional` carregam **só** a tag de frente (sem complexidade) — correto.
   - Tarefas `projeto`/`análise` carregam frente **+** complexidade — correto.
4. **Já existe dado sujo em produção** (esperado, e vira gameplay de higiene):
   - Tarefas concluídas **sem nenhuma tag** (ex.: "Ajuste", "Melhorar match de nome — Engenharia do Corpo").
   - Tarefas `projeto` **sem tag de complexidade** (ex.: "Buildar e Subir containers no servidor", "Verificar saúde e acesso ao Caddy...").
   - Implicação: no dia 1, uma fração de tarefas concluídas **não pontua**. Sem tratamento explícito isso parece "app quebrado". Tratamos via "missões de organização" (§3.6).
5. **Vetor de gaming de volume já visível:** algumas tarefas Operacional embutem a contagem no título — "Estudos de ponto p/ expansão — Maio/2026 **(25 estudos)**", "**(29 estudos)**". Ou seja: 1 tarefa concluída pode representar 25 itens. A definição de "item" é uma decisão com impacto direto em inflação (§2.5, [DH]).
6. **Membros do workspace:** Marcos Minchiotti, Felipe Castaldi, Vinícius Mateus Costa Cruz, Juan Calu da Silva Lima. O time do briefing é de 3 (Felipe, Juan, Vinícius). [DH] Confirmar se **Marcos** é personagem jogável ou gestor/leitura.
7. **Status observados:** `concluído`, `pendente`, `em progresso`. "Concluído" = done — bate com o briefing.
8. **Estrutura:** space `PROJETOS - DEG` → folders `Projetos` (listas: Dashboard Operacional, LTV e Churn, Motor de Expansão, Gestão Operacional), `Estudos - Expansão` (Rotina de Estudos), `Plano de Desenvolvimento` (Trilhas de Formação). A frente de uma tarefa vem da **tag/field**, não da lista — bom, porque listas misturam frentes.

> **FLUXO 3 — LOCALIZADO (2026-06-03):** é uma **tarefa quinzenal no cowork** que gera HTMLs de painel gerencial em `Desktop\Relatórios - Estratégia e Growth` (ex.: `painel-produtividade-maio-2026_1.html`). A lógica vive no **prompt do agente**, não numa lib; a saída é HTML. Para o RPG, rodará **diário/a cada X horas**. Semântica e números-verdade extraídos para o golden dataset (§7) e para a skill de guardrails. Deixa de ser bloqueante de descoberta: a lógica do FLUXO 3 é **reusada pela skill produtora no cowork** (paridade por construção), não reimplementada no repo. O painel confirmou: tags como fonte, sizing 1/3/8, vazão = entregue ÷ dias disponíveis, frentes não somam — e revelou regras novas: dias disponíveis = úteis − afastamentos; backlog "em aberto" = HP do raid boss; colaborativas creditam cada pessoa mas o total de equipe de-dup; **o painel conta o volume das tarefas operacionais em lote** (ver §2.5).

---

## 1. Avaliação de viabilidade

### Fácil (alta confiança)
- **Ingestão somente-leitura do ClickUp.** Já validada nesta sessão (li hierarquia, fields, tarefas). API/MCP estáveis, volume pequeno (3 pessoas).
- **Taxonomia já existe e casa com a metodologia.** Frente e Complexidade são dropdowns prontos; tags em uso.
- **Cálculo determinístico por frente.** É aritmética simples: Operacional = contagem; Projeto/Análise = soma de sizing (1/3/8). Sem ML, sem estimativa.
- **Multiclasse por pessoa + barra de guild por frente.** Agregações triviais sobre o snapshot.
- **Atualização por refresh diário.** O cowork regenera o `dados.json` diariamente (sem polling de minuto em minuto); para 3 pessoas e progressão vitalícia, é mais que suficiente.
- **Página web somente-leitura.** Consome o `dados.json` pré-computado pelo cowork; sem lógica de cálculo no front.

### Arriscado (gerenciável com mitigação)
- **Paridade com o FLUXO 3.** Se app e painel calculassem por conta própria, divergiriam com o tempo. Mitigação: **motor único** — o painel e o `dados.json` saem do **mesmo motor no cowork** (a skill produtora reusa o FLUXO 3); o app só **apresenta** o JSON, sem recalcular — §2, §7.
- **Higiene de dados.** Já há tarefas sem tag / sem complexidade. Sem tratamento explícito, parece bug. Mitigação: regras de validade claras + "missões de organização".
- **Ambiguidade do "item" Operacional** (contagem no título). Mitigação: regra determinística "1 tarefa concluída = 1 item" + XP modesto + recompensa de consistência, não de pico (§2.5).
- **Inflação de sizing (Goodhart).** Mitigação: revisão de sizing por terceiro + recompensa **cosmética** (sem vantagem mensurável em chamar tudo de Alta).
- **Loop autônomo saindo dos trilhos.** Mitigação: marcos pequenos com critérios de aceite + gate humano (§4).

### Incerto à época (status atual entre colchetes)
- ~~**Onde/como é o FLUXO 3 hoje**~~ **[RESOLVIDO, §0]:** vive no cowork (tarefa quinzenal que gera o painel HTML) → paridade **por construção**.
- ~~**Fonte do calendário de disponibilidade**~~ **[RESOLVIDO, §6 #5]:** marcada via flag no output do cowork e exposta como `dias_disponiveis`/`afastamentos` no `dados.json`.
- **Tags vs custom fields** como fonte de verdade da classificação — **[ainda aberto, §2.4 / §6 #2]**.
- ~~**Semântica exata do "fechamento"**~~ **[RESOLVIDO, §6 #9]:** corte **quinzenal** ancorado na reunião com o diretor (a cada 2 quintas, 10h BRT) — não é mensal.

---

## 2. Arquitetura proposta (ponta a ponta) + alternativas

### 2.1 Princípio inegociável: **um único motor de pontuação**
A regra das frentes (validade, unidades, sizing 1/3/8, nunca-somar-entre-frentes) é implementada **uma única vez**, no **cowork** (skill `growth-rpg-producer` + `produtividade-clickup-ultra`, reusando o código do FLUXO 3). O **mesmo motor** emite o `painel.html` (leitura gerencial) e o `dados.json` (contrato de máquina) — duas renderizações do mesmo cálculo, então não há "duas contas" para divergir. A **web app não recalcula nada**: consome o `dados.json`. **Este repo não tem motor** — ele só **valida o contrato** (`contract/validate.py` + schema) e **apresenta**. No build autônomo, o loop nunca reescreve a conta porque a conta não vive aqui.

### 2.2 Fluxo de dados

```
ClickUp (PROJETOS - DEG)            ← FONTE DE VERDADE (somente-leitura)
        │  (leitura diária via MCP, pull-only)
        ▼
┌─ COWORK (motor único — skill growth-rpg-producer + produtividade-clickup-ultra) ─┐
│  normaliza tarefas concluídas (tags/date_done/hierarquia); valida (inválida →     │
│  missão de organização); aplica as regras das frentes (mesmo código do FLUXO 3):  │
│    - Operacional: itens   - Projeto/Análise: pontos de sizing (1/3/8)             │
│    - NUNCA soma entre frentes                                                      │
│  agrega por (pessoa, frente) vitalício + janela da quinzena + guild por frente    │
│  → emite dados.json + painel.html (mesma computação)                              │
└───────────────────────────────────────────────────────────────────────────────────┘
        │ (dados.json = contrato versionado)
        ▼
┌─ ESTE REPO ────────────────────────────────────────────────────────────────────────┐
│  contract/validate.py + schema  → VALIDA o contrato (não recalcula)                │
│  app/ (estático)                → APRESENTA (3 trilhas/pessoa, guild, emblemas…)   │
│  deploy/                        → PUBLICA (rsync atrás de Caddy+Authelia)          │
└───────────────────────────────────────────────────────────────────────────────────┘
        ▼                                          ▼
   [Web app] leitura do dados.json          [Painel oficial] mesma origem (cowork)
```

Características: **pull-only** (respeita o guardrail somente-leitura — nada é escrito no ClickUp; **o repo nem toca o ClickUp**), **idempotente** (recomputar do zero a cada ciclo → mesmo `dados.json`, sem drift), latência = cadência de refresh (diária; irrelevante para o caso).

**Instanciação concreta:** o produtor é a **própria tarefa do cowork** — a que hoje gera o painel FLUXO 3 — rodando diária. Ela lê o ClickUp (read-only) e **emite numa pasta dedicada** dois artefatos da mesma computação: o **`painel.html`** (gerencial, como hoje) e o **`dados.json`** (contrato de máquina detalhado em [contrato-dados-json.md](contrato-dados-json.md): por pessoa/frente com níveis vitalícios, vazão, backlog, emblemas da quinzena, objetivos coletivos e missões de organização). A **web app consome o `dados.json`** — nunca faz scraping do HTML. Dois guardrails para isso não morder depois:
> 1. **Os números vêm de código determinístico no cowork** (o motor do FLUXO 3), não da interpretação livre do agente. O cowork **calcula e renderiza**; não "conta no olho". Caso contrário, dois runs no mesmo dado poderiam divergir, violando a regra de determinismo do briefing.
> 2. **Contrato `dados.json` versionado** (um schema estável) é a fronteira entre produtor e app — assim o app não quebra quando o HTML mudar de layout, e o painel e o app continuam sendo duas renderizações do **mesmo** cálculo (paridade por construção). **Este repo guarda o schema e o validador dessa fronteira.**

### 2.3 Três alternativas de arquitetura (trade-offs) — DECISÃO TOMADA

A decisão (2026-06-03) foi a **Alt A**, instanciada como **motor no cowork + `dados.json` materializado** (não como lib Python no repo): o cowork é o motor único; o repo valida o contrato e apresenta. Alt B/Alt C ficam registradas só pelo trade-off.

| | **Alt A — Motor único (cowork) + `dados.json` materializado** (ADOTADA) | **Alt B — Serviço/API de pontuação** | **Alt C — Cálculo no app** (rejeitada) |
|---|---|---|---|
| Como | Cowork calcula (FLUXO 3) e emite `dados.json`+`painel.html`; o repo valida o contrato e o app/painel leem o JSON | Serviço standalone que lê ClickUp, calcula e expõe API; webhooks p/ near-real-time | App lê ClickUp e recalcula por conta própria |
| Tempo real | Refresh diário (cadência da tarefa do cowork) | Webhooks (segundos) | Polling |
| Paridade c/ painel | **Por construção** (mesmo motor → mesmo `dados.json`) | Boa, se o painel consumir a API | **Ruim** — reimplementação garante divergência |
| Complexidade operacional | Baixa (1 produtor no cowork + arquivos estáticos + 1 front) | Média (serviço sempre no ar, endpoint público p/ webhook, verificação de assinatura) | Baixa de infra, alta de risco |
| Aderência aos guardrails | Alta (pull-only; o repo não toca o ClickUp; deploy estático) | Média (endpoint de entrada quebra o "nada entra/sai") | Viola "motor único" |
| Manutenção por 3 pessoas | Simples (regra muda = atualizar a skill) | Mais peças | Enganosamente simples, caro depois |
| Recomendação | **Adotada** | Evolução futura se precisar de tempo real de verdade | **Não** — fere princípio do briefing |

**Adotada a Alt A.** Webhooks (Alt B) ficam como evolução pós-MVP se algum dia a latência de refresh incomodar. Alt C está aqui só para registrar **por que é rejeitada** (o app recalcular garantiria divergência com o painel — fere o motor único).

### 2.4 [DH] Decisão: tags vs custom fields como fonte de verdade
Hoje o time **classifica por tags**, mas o space **já tem os dropdowns** `Frente` e `Complexidade`. Trade-off:

- **Tags** (estado atual): flexível, mas free-form e propenso a erro (typo, sinônimo, duas frentes na mesma tarefa, esquecer a complexidade). Já vi tarefas sem tag e `projeto` sem complexidade.
- **Custom fields** (dropdowns): valores restritos — impossível "typar" frente/complexidade; mais robusto; já existem; e há um campo `Pontos` (formula) meio-construído que pode ter sido a intenção original de motor.

**Recomendação:** migrar a classificação para as **custom fields** (Frente + Complexidade) como fonte de verdade, mantendo tags como atalho de UI se quiserem. Reduz dramaticamente "dado inválido" e ambiguidade. Exige uma pequena mudança de hábito do time. Para o MVP, o **motor do cowork** pode aceitar **ambas** com precedência configurável (ex.: custom field vence; tag como fallback), normalizando caixa/acentos. **Decisão humana:** qual é a fonte canônica.

### 2.5 Decisão: como contar o volume Operacional — RESOLVIDA (2026-06-03)
Regra: **1 tarefa concluída = 1 item.** A partir de agora os estudos de ponto são registrados **um a um** (cada um é uma tarefa), então o volume é determinístico sem parsear nada. O lote do tipo "(29 estudos)" foi **pontual/histórico**; só precisa ser tratado se reprocessarmos ciclos antigos.

> Implicação de paridade: o painel de **Maio/2026 contou o lote** (Juan 29, Vinícius 25). Logo o golden dataset de Maio é um **baseline pré-mudança** — prefira um mês **pós-mudança** para o teste de paridade automatizado, ou trate o lote de Maio como exceção conhecida.

Mantemos XP por item **modesto** + bônus por **consistência/streak**, não por pico.

---

## 3. Modelo de XP / níveis por frente

> Princípio que rege tudo abaixo: **recompensa majoritariamente cosmética**, **cooperativo > competitivo**, **progressão neutra a afastamentos**, e **nunca um XP único nem ranking geral**. Os números abaixo são **ponto de partida calibrável** — os valores exatos são [DH] decisão humana.

### 3.1 Unidades e XP base (determinístico)
| Frente | Unidade | XP de uma tarefa válida concluída |
|---|---|---|
| Operacional | itens | `XP = XP_ITEM` por item (proposta inicial: 10) |
| Projeto | pontos de sizing | `XP = sizing` × `XP_PONTO` (Baixa 1, Média 3, Alta 8) × (proposta: 10) |
| Análise | pontos de sizing | igual a Projeto (mesma escala de pontos 1/3/8) |

> **Valores adotados (2026-06-03):** o time fechou a **Candidata ADOTADA** (§3.3) com **XP = 1 por item/ponto** (sem o multiplicador ×10 da proposta inicial) e custos **Op 6 / Prj 8 / Ana 6** por nível. As "propostas iniciais: 10" acima ficam só como registro histórico.

Regras duras embutidas no código:
- **Nunca** existe uma soma/struct que misture XP de frentes diferentes. Cada frente tem sua própria coluna, sua própria barra, seu próprio nível. (Testado por invariante — §7.)
- Operacional **ignora** complexidade mesmo se a tag existir.
- Só conta tarefa **concluída** e **válida** (§3.6). Nada estimado.

### 3.2 Multiclasse (personagem por pessoa)
Cada pessoa tem **3 trilhas independentes** (Operacional, Projeto, Análise), cada uma com seu nível e barra. **Não existe "nível total" nem soma das três.** É literalmente um personagem multiclasse com 3 classes que upam separadamente.

### 3.3 Curvas de nível por frente (temáticas e distintas)
Ritmos diferentes são **esperados**, não desigualdade. Curvas distintas refletem a natureza de cada frente:

- **Operacional — "limpar hordas":** muitos itens pequenos. Curva **rasa/quase-linear**, muitos níveis, level-ups frequentes (dopamina rápida). Ex.: custo do nível _n_ ≈ `A·n` (linear).
- **Projeto — "construir a fortaleza":** granularidade média. Curva **polinomial suave**. Ex.: custo ≈ `B·n^1.5`.
- **Análise — "boss fights raros e épicos":** poucas entregas, grandes. Curva **mais íngreme**, poucos níveis porém marcantes. Ex.: custo ≈ `C·n^2`.

Os coeficientes devem ser calibrados contra o **volume real** de cada frente para que ninguém fique "preso no nível 1" nem "estoure" em uma semana.

**ADOTADA — níveis VITALÍCIOS (sem reset), custo fixo por nível** (custos assinados pelo time em 2026-06-03):

| Frente | XP | Custo por nível | Tema |
|---|---|---|---|
| Operacional | 1 / item | **6 itens / nível** | hordas: sobe rápido (demanda menor/baixa complexidade, mas tempo de execução conta) |
| Projeto | 1 / ponto | **8 pts / nível** | construção contínua; 1 Alta = 1 nível (sobe rápido, casa com "evoluir todo dia") |
| Análise | 1 / ponto | **6 pts / nível** | demanda menor, complexidade tipicamente Média → balanceia |

Como o nível **acumula para sempre** (não zera), a curva é de **custo fixo** = evolução em ritmo constante e previsível (o que o time pediu). Efeito: os números crescem bastante ao longo de meses — é o "evoluir constantemente". Alternativa, se um dia quiserem números menores/mais prestígio: curva que desacelera (custo cresce com o nível) — só re-tunar.

Onde o ciclo de Maio/2026 teria levado cada personagem com os custos adotados (isto **acumula** dos ciclos seguintes em diante):
- **Felipe** — Projeto L21 · Operacional L0 · Análise L0 (Engenheiro "Mestre de Obras")
- **Juan** — Operacional L8 · Análise L4 · Projeto L0 (Guerreiro "Veterano" + Mago "Feiticeiro")
- **Vinícius** — Operacional L11 · Projeto L4 · Análise L2 (Guerreiro "Ceifador de Hordas")

Com Projeto a 8/nível, uma tarefa Alta = 1 nível inteiro → o main de Projeto (Felipe) sobe ~1 nível por dia útil, sustentando o "evoluir todo dia". Análise e Operacional a 6/nível mantêm Análise como a trilha mais rara/épica (combina com a classe Mago) sem travar de vez. **Sign-off dos custos: concluído (2026-06-03).**

### 3.4 Vazão e neutralidade a afastamentos
- **Nível acumulado nunca regride** (XP é monotônico). Isso já torna a progressão **neutra a afastamentos por construção**: quem tira férias simplesmente não ganha no período, mas **não perde** nada. Sem decay.
- **Vazão** = `entregue ÷ dias disponíveis` é um **indicador de ritmo** exibido à parte (não rebaixa nível). O denominador **exclui férias/folga**, então meio mês de férias não afunda a métrica de ritmo.
- **Fonte dos "dias disponíveis" (RESOLVIDO):** registrada via flag no output do cowork (o time marca afastamentos), e exposta como `dias_disponiveis` + `afastamentos` por pessoa no `dados.json` que o app consome. Dias disponíveis = dias úteis do mês − afastamentos.

### 3.5 Progressão acumulada (sem reset) + emblemas quinzenais
Decisão do time (2026-06-03): **não zerar nível nem XP.** O personagem evolui continuamente ao longo de todo o histórico; a "renovação" do jogo vem de **conquistas quinzenais**, não de reset.

- **Nível e XP são vitalícios** (acumulam para sempre, por frente). Curva de custo fixo (§3.3).
- **Emblemas por entrega (determinísticos), salvos no histórico:** "registrou ≥ limiar na frente X na quinzena" (ex.: Alquimista = 10 pts Análise; Engenheiro Mestre = 20 pts Projeto; Senhor das Hordas = 50 itens Operacional). Limiares por frente, ajustáveis; salvos a cada quinzena no personagem (`emblemas_historico`). Também valem Primeira Alta, Sequência (streak), Faxineiro (N missões resolvidas). Emblema por **esforço/precisão** ("Mira Certeira") fica **fora por enquanto** (esforço ainda não mensurável de forma determinística).
- **Prestígio contínuo (por frente):** títulos por faixa de nível, badges, tier cosmético de avatar — tudo permanente, sem zerar.
- **Trade-off registrado:** sem reset, quem acumulou mais cedo fica sempre à frente no nível vitalício. Mitigado por: time fixo, foco cooperativo (objetivo coletivo + recorde pessoal), e emblemas/objetivo que recomeçam "frescos" a cada quinzena. O **ranking por frente** existe, mas é secundário/cosmético (dentro da frente; nunca combina frentes nem soma total por pessoa).

### 3.6 Higiene de classificação como gameplay (regras de validade)
Determinístico, sem estimativa:

| Caso | Resultado |
|---|---|
| Concluída + frente=Operacional | **Válida.** 1 item. (complexidade ignorada) |
| Concluída + frente∈{Projeto,Análise} + **exatamente uma** complexidade | **Válida.** pontos = 1/3/8 |
| Concluída sem frente, **sem ancestral tagueado** | **Inválida** → missão de organização ("falta frente") |
| Concluída sem frente, mas **subtarefa de ancestral tagueado** | **Ignorada** — detalhamento simples (não pontua, **não** é missão) |
| Concluída com **≥2** frentes | **Inválida** → ("frente ambígua") |
| Concluída Projeto/Análise **sem** complexidade | **Inválida** → ("falta sizing") |
| Concluída Projeto/Análise com **≥2** complexidades | **Inválida** → ("sizing ambíguo") |

- Tarefa inválida **não gera XP** e aparece numa lista de **"missões de organização"**. Quando o humano corrige a tag, ela passa a pontuar (retroativo no próximo ciclo — determinístico).
- Recompensa de higiene **mínima e cosmética** (ex.: badge "Arquivista"), **sem** incentivar criar bagunça para limpar (o ganho é destravar o XP que já era seu, não XP extra por limpar).
- **Hierarquia (achado real):** subtarefas "simples" ficam sem tag de propósito porque pertencem a uma tarefa maior já classificada (ex.: "Ajuste" sob "Alimentar Pipeline..." [operacional, 95 subtarefas]). Logo: untagged + ancestral tagueado → **ignorada**; só vira missão a sem-frente **órfã**. E o motor deve evitar **dupla contagem** (pai tagueado + filhos tagueados → contar as folhas, não o guarda-chuva). A ingestão resolve `parent`/`top_level_parent`. [DH] confirmar a regra de container.

### 3.7 Objetivo coletivo (guild) por frente — cooperativo, não PvP
- **Um objetivo coletivo por frente** (3 objetivos), e **dentro de uma frente é permitido somar entre pessoas** (mesma unidade — não fere "nunca somar entre frentes", que proíbe somar **unidades diferentes**). Deixar isso explícito no código e na UI.
- **Mecânica de construção/conquista** (substitui o "raid boss" — decisão do time 2026-06-03), no tema da expansão, atrelada à **quinzena**:
  - **Operacional → Conquista de Território:** cada concorrente mapeado/estudo ilumina um **hexágono** (reaproveita os hexágonos H3 do Motor de Expansão); região conquistada = backlog zerado.
  - **Projeto → Construção da Base:** cada ponto = um módulo/tijolo; obra entregue = backlog zerado.
  - **Análise → Mapa de Insights:** cada análise dissipa a névoa de uma área; mapa revelado = backlog zerado.
  - **HP = backlog real comprometido e priorizado por valor** da quinzena (estilo sprint planning), **travado no planejamento antes da reunião com o diretor**. **Anti-inflação (Goodhart):** nunca inchar o backlog com item fácil/baixo valor só para ter "boss gordo". Dimensionar pela **vazão das últimas 1–2 quinzenas**, em **camadas**: `comprometida` (piso, alta confiança) → `alvo` → `stretch` (heroico). Maio (ilustrativo): Op 80/110/140 · Prj 120/180/240 · Ana 25/40/60. Os totais comprometidos (itens no Operacional, pontos em Projeto/Análise) são **input curado na própria tarefa do cowork**, definidos nos dias de reunião com o diretor — não auto-derivados do ClickUp.
- **Ranking por frente na quinzena:** permitido e cosmético (decisão do time), porém **secundário** — dentro da frente (mesma unidade); pode ordenar por **vazão** para ser justo com afastamentos. Foco primário continua sendo **progresso contra o próprio histórico** + objetivo coletivo.
- **Sub-chefes / hordas (urgência não planejada) — proposto:** bugs/correções/urgências que surgem **no meio da quinzena** viram um **encontro separado** do boss comprometido (uma "Horda de Bugs"/sub-chefe). Farmam **XP real** (as tarefas pontuam normal na sua frente) e ficam **fora do backlog comprometido** — não inflam a vitória planejada. Não é gate que segura XP; é encontro destacado (+ emblema "Sub-chefe derrotado"). Anti-gaming: representa defeito/urgência **real** — nunca recompensar a **criação** de bug; XP modesto. Vira um bloco `eventos` no `dados.json`, paralelo ao `guild`. Marcador = **palavra-chave no título** (lista fixa: fix/bug/corrigir/correção/hotfix/blk-fix), apenas **cosmético** (o score vem das tags; sized 1/3/8).
- **Proibições codificadas:** sem XP único por pessoa, sem "pontos totais", **sem ranking que combine frentes** nem total por pessoa. (Invariante testado.)

### 3.8 Classes e trilhas de evolução (cosméticas) — decididas 2026-06-03
Cada frente tem **uma classe fixa** e **12 etapas de título** por faixa de nível. Títulos são **puramente cosméticos** (não dão vantagem mensurável) e dependem **só do nível daquela frente** — nunca combinam frentes. A versão de máquina (faixas + títulos) vive no bloco `classes` do `dados.json` (ver `contrato-dados-json.md`), e o produtor resolve o `titulo` por lookup do nível.

- **Operacional → Guerreiro** (a horda / conquista de território)
- **Projeto → Engenheiro** (a construção / criação da base)
- **Análise → Mago** (a magia / mapa de insights)

A mesma régua de faixas de nível serve às três classes (cada classe progride no seu ritmo, pois nunca se compara nível entre frentes):

| Tier | Faixa de nível | Guerreiro (Op) | Engenheiro (Prj) | Mago (Ana) |
|---|---|---|---|---|
| 1 | 0 | Recruta | Aprendiz | Aprendiz de Feitiços |
| 2 | 1–2 | Soldado | Técnico | Conjurador |
| 3 | 3–5 | Combatente | Engenheiro Júnior | Feiticeiro |
| 4 | 6–9 | Veterano | Engenheiro | Bruxo |
| 5 | 10–14 | Ceifador de Hordas | Engenheiro Sênior | Arcanista |
| 6 | 15–21 | Bárbaro | Mestre de Obras | Necromante |
| 7 | 22–30 | Campeão | Mecanista | Mago |
| 8 | 31–45 | Comandante | Arquiteto de Sistemas | Mago Superior |
| 9 | 46–65 | Senhor da Guerra | Engenheiro-Chefe | Magus |
| 10 | 66–90 | Conquistador | Grande Engenheiro | Grande Mago |
| 11 | 91–129 | Marechal das Fronteiras | Engenheiro-Mor | Arquimago |
| 12 | 130+ | Lenda da Vanguarda | Demiurgo | Senhor do Arcano |

Títulos atuais (ciclo Maio/2026): Felipe = Engenheiro **Mestre de Obras** (Prj L21); Vinícius = Guerreiro **Ceifador de Hordas** (Op L11); Juan = Guerreiro **Veterano** (Op L8) + Mago **Feiticeiro** (Ana L4). O emblema quinzenal **"Matador de Boss"** (cada Alta de Análise = um boss) permanece como conquista, distinto dos títulos de nível.

---

## 4. Escopo do MVP + marcos verificáveis (para o loop autônomo)

### 4.1 Critério de sucesso do MVP (do briefing §10)
Um humano consegue: ver o **personagem multiclasse** de cada pessoa (1 trilha/frente), ver a **barra coletiva por frente**, e **conferir que os números batem com o painel oficial** — tudo a partir do ClickUp, **sem soma entre frentes** e **sem ranking geral**.

### 4.2 No MVP / Fora do MVP
**No MVP:** o **produtor no cowork** (ingestão read-only + motor FLUXO 3) emitindo o `dados.json` (validade + itens/pontos por frente; XP/nível **vitalício** por (pessoa, frente) + janela da quinzena; guild por frente; emblemas; missões de organização); o **repo validando o contrato** (`contract/validate.py` + schema); a **página web** com 3 trilhas/pessoa + 3 barras de guild + **painel de reconciliação** (número do app vs. painel); deploy atrás do Authelia.

**Fora do MVP (depois):** arte/avatares e evolução visual, badges/prestígio visual, webhooks, bônus de precisão de estimativa, streaks elaborados, histórico multi-temporada rico.

### 4.3 Marcos (incrementos pequenos, com critério de aceite e teste)

Cada marco tem **fronteira clara + critério de aceite + teste** — para o ralph loop não sair dos trilhos. **O repo não escreve no ClickUp** (o motor é o cowork). A fronteira de cada marco é o `dados.json`/golden; o loop valida e apresenta sobre ele. (Versão viva e detalhada destes marcos: `plano-build.md` §9 e `tasks/backlog.md`.)

**Lado produtor (cowork — fora deste repo):** a skill `growth-rpg-producer` (+ `produtividade-clickup-ultra`) lê o ClickUp read-only, calcula pelo motor do FLUXO 3 e emite o `dados.json` + `painel.html`. Não é marco do ralph loop — é a skill do cowork.

**Lado repo (o que o ralph loop constrói):**
- **M0 — Fundações & contrato (CONCLUÍDO, verde).** Repo, `pyproject.toml` (ruff+pytest), `CLAUDE.md`, `config/*` (classes/emblemas/disponibilidade/backlog/marcadores/schema), golden `maio2026_expected.json`, validador iniciado, **skill de guardrails** (§9.1), run-cycle autônomo.
  - *Aceite (atingido):* `ruff check .` limpo; `pytest -q` verde; o golden valida no schema e no validador de contrato.
- **A1 — Validador de contrato.** `contract/validate.py` (schema + invariantes). **NÃO recalcula scoring.**
  - *Aceite:* `tests/test_contract.py` valida o golden sem erros — schema; **invariante "não soma entre frentes"**; `vazao == round(entregue/dias, 2)`; de-dup (`total_equipe ≤ soma das contribuições`).
- **A2 — Web app estático (read-only).** 3 trilhas multiclasse/pessoa, 3 barras de guild, hordas/eventos, emblemas, ranking (secundário), missões de organização, painel de reconciliação — tudo a partir do `dados.json`.
  - *Aceite:* renderiza do golden; nenhuma frente é somada a outra na UI; **zero** request externa (assets vendorizados); reconciliação visível.
- **A3 — Deploy + auth + reconciliação.** Caddy serve app+`dados.json` atrás do Authelia; `deploy.sh` (rsync); reconciliação app×painel.
  - *Aceite (gate de produção é humano):* app acessível **só** autenticado (os 4) com TLS; refresh reflete no app; reconciliação visível.
- **A4 — Polimento (pós-MVP).** Avatares/arte por tier, badges, gráficos de histórico/tendência, animação de horda.
  - *Aceite:* cosmético; não recalcula números; `pytest` segue verde.

**Gate humano:** o loop roda em **container isolado** (sem credencial de produção, sem VPS) e não toca o ClickUp; a publicação na VPS é **passo humano**, fora do loop (revisão do branch + deploy manual).

---

## 5. Registro de riscos com mitigações

| Risco | Gatilho real observado? | Mitigação |
|---|---|---|
| **Divergência app × painel** | — | **Motor único** (o cowork emite o `dados.json` que o painel e o app renderizam); validador de contrato + reconciliação na UI (§7) |
| **Inflação de sizing (Goodhart)** | Possível | Recompensa **cosmética**; revisão de sizing por **terceiro** (não o executor); calibragem opcional por esforço real (pós-MVP) |
| **Gaming de volume (fatiar)** | **Sim** — contagem no título | "1 tarefa = 1 item"; XP/item modesto; premiar **consistência/streak**, não pico |
| **Dado inválido parece "app quebrado"** | **Sim** — tarefas sem tag / sem complexidade | Regras de validade explícitas + **missões de organização**; comunicar que inválida não pontua |
| **Injustiça por afastamento** | — | XP monotônico (sem decay) + vazão com denominador que exclui férias/folga |
| **PvP em time de 3** | — | Sem barras individuais lado a lado; progresso **contra o próprio histórico** + guild cooperativa |
| **Segurança psicológica / virar nota de RH** | — | Camada lúdica **separada** da leitura gerencial; sem ranking; "diversão, não vigilância" |
| **Loop autônomo fora dos trilhos** | — | Marcos pequenos + critérios de aceite + dataset sandbox + gate humano |
| **Escopo/burnout (fora do horário)** | — | MVP enxuto; cosmético adiado; fronteiras claras por marco |
| **Escrita acidental no ClickUp de produção** | — | **O repo não toca o ClickUp** (sem cliente/credencial); só o cowork lê, **sem** métodos de escrita; loop em container sem credencial de produção |
| **Fonte canônica do FLUXO 3 desconhecida** | ~~Sim~~ **Resolvido** | FLUXO 3 localizado (§0): vive no cowork → paridade **por construção** |

---

## 6. Perguntas abertas / decisões que exigem um humano

1. ~~**[DH] Onde/o que é o "FLUXO 3"?**~~ **RESOLVIDO (§0):** é a tarefa quinzenal do cowork que gera o painel HTML. A paridade é **por construção** — a skill produtora reusa o motor do FLUXO 3 e emite o `dados.json`; o repo só valida e apresenta. Não há extração para uma lib no repo.
2. **[DH] Tags vs custom fields** como fonte canônica de classificação (recomendo custom fields; §2.4).
3. ~~Como contar o volume Operacional~~ **RESOLVIDO (§2.5):** 1 tarefa = 1 item (estudos registrados um a um daqui pra frente; lote de Maio é histórico).
4. ~~Data de conclusão~~ **RESOLVIDO:** usar **`date_done`** (status "concluído" é tipo `closed`, carimba a data). Ressalva: nas tarefas backfilladas `date_done ≈ date_created` (registro no fechamento) — para evolução diária real, marcar concluído na hora, não em lote.
5. ~~Calendário de disponibilidade~~ **RESOLVIDO:** registrado via flag no output do cowork; expor `dias_disponiveis` e `afastamentos` por pessoa no **`dados.json`** (não só no HTML).
6. **[DH] Processo de revisão de sizing** por terceiro (quem revisa, quando) — processo, não código.
7. ~~Curvas/limiares exatos por frente~~ **RESOLVIDO (2026-06-03):** custo fixo Op 6 / Prj 8 / Ana 6 por nível; classes Guerreiro/Engenheiro/Mago com 12 tiers (§3.8); **sem reset** (níveis vitalícios, §3.5). Em aberto ainda: detalhe visual do **prestígio** (badges/avatar) e arte — pós-MVP.
8. ~~Marcos Minchiotti jogável?~~ **RESOLVIDO:** **não jogável** — diretor do departamento, tem acesso de **visualização**, não é personagem. O app permanece lúdico/cooperativo (não vira ranking para leitura de desempenho do diretor).
9. ~~Corte da quinzena~~ **RESOLVIDO (agenda confirmada):** ancorado na reunião **"Reunião de alinhamento e resultados — Estratégia e Growth"** (com o diretor), a cada **2 quintas de manhã** (10h BRT). Datas: **18/06, 02/07, 16/07, 30/07…**. Cada quinzena vai de uma reunião à próxima; backlog/camadas travados no planejamento dela. (Não confundir com a "Alinhamento Semanal - Felipe", terça — 1:1 semanal, não é o âncora.)
10. **[DH] Stack/store e hospedagem:** SQLite/Parquet (mais simples) vs. Postgres existente; rodar no mesmo VPS/Hostinger do Motor de Expansão?
11. **[DH] Campo `Pontos` (formula) do ClickUp** — era a intenção de motor? Ignorar ou aproveitar?

---

## 7. Estratégia de teste/validação (prova de paridade com o painel)

O objetivo crítico do briefing: **provar que a pontuação do app bate com o painel oficial.** Camadas:

1. **Motor único = paridade por construção.** O painel e o app **renderizam o mesmo `dados.json`**, emitido pelo cowork (motor do FLUXO 3). Não há "duas contas" para divergir — o app **não recalcula**. Esta é a alavanca principal.
2. **Casos-ouro (unit tests).** Fixtures com números calculados à mão por frente cobrindo todos os ramos de validade. Determinístico → diff exato (tolerância **zero**).
3. **Teste de invariantes (property tests):**
   - **Não-soma-entre-frentes:** nenhum caminho de código combina unidades de frentes diferentes; nenhum "XP total"/ranking no schema.
   - **Idempotência:** mesmo input → mesmo `dados.json` (bytes).
   - **Neutralidade a afastamento:** adicionar dias de férias **não reduz** XP/nível; só muda o denominador da vazão.
   - **Determinismo:** sem aleatoriedade, sem relógio influenciando o cálculo.
4. **Reconciliação de mês fechado (backfill).** Para um mês já fechado, recomputar do ClickUp e comparar com os números **arquivados do painel** por (pessoa, frente) e por guild. Diff alvo = 0. **Golden dataset já disponível:** o HTML de Maio/2026 (`painel-produtividade-maio-2026_1.html`) — números por pessoa/frente, entregáveis, vazão e backlog estão extraídos na skill de guardrails (`references/tabela-validade-e-sizing.md`, §7) como fixture de regressão.
5. **Painel de reconciliação na UI.** Para um período escolhido, mostrar lado a lado: valor do painel × valor do app × diff, por (pessoa, frente) e guild. É a prova visual que o humano confere no MVP (critério §10).
6. **Guardrail read-only.** O **repo não toca o ClickUp** (sem cliente, sem credencial); a leitura é só do **cowork**, somente-leitura (sem endpoints de escrita). O loop roda em container sem credencial de produção.

> A pergunta 1 (§6) está resolvida: o FLUXO 3 vive no cowork, então a paridade é **por construção** (o mesmo motor emite o `dados.json` do app e o `painel.html`). O repo reforça isso validando o **contrato** (camadas 2/3) e exibindo a **reconciliação** na UI (camada 5) — sem recalcular.

---

## 8. Próximos passos sugeridos (antes de qualquer código)
1. ~~Localizar o FLUXO 3~~ **FEITO** (§0): vive no cowork; paridade **por construção**. Seguem abertas só as decisões [DH] de §6 (fonte canônica, revisão de sizing, stack/hospedagem) — não bloqueiam A1–A4, que rodam sobre o golden.
2. Congelar **fonte canônica** (tags vs fields) e **definição de item**.
3. ~~Aprovar tabela de curvas/limiares~~ **RESOLVIDO** (§3.3): custo fixo Op 6 / Prj 8 / Ana 6, sem reset.
4. ~~Definir calendário de disponibilidade e fechamento~~ **RESOLVIDO** (§6 #5 e #9): disponibilidade via flag no `dados.json`; corte **quinzenal** ancorado na reunião com o diretor.
5. ~~Formalizar a skill "Metodologia & Guardrails" (§9.1)~~ **FEITO** (existe em `.claude/skills/metodologia-guardrails-deg-rpg/`).
6. Liberar o ralph loop sobre os marcos do repo (**M0 feito → A1→A4**) em container isolado; sem gate humano no loop (a rede é teste + no-bypass + limite do container) — a publicação na VPS é passo humano à parte.

---

## 9. Build autônomo com Skills do Claude Code

Contexto adicional: o time já usa **Skills do Claude Code** (ex.: `skill-creator`) como infraestrutura de trabalho autônomo. O briefing (§8) exige que o ralph loop tenha "trilhos" — fronteiras claras, critérios de aceite, e não sair do escopo "nem por conveniência". Skills são exatamente esse mecanismo: encapsulam instruções + scripts determinísticos com **carregamento progressivo** (metadado sempre em contexto → corpo quando dispara → scripts/recursos sob demanda), então o agente de build carrega a regra certa na hora certa e **não re-deriva nada a cada iteração**.

> **Distinção que importa (não confundir as camadas):**
> - **Camada de produto:** o app (apresentação) e o **motor no cowork** (cálculo) são **código real de produção**; o validador de contrato do repo também.
> - **Camada de build:** as skills orientam o **agente que constrói** (ralph loop), mantendo-o nos trilhos. Uma skill **não roda em produção** — ela disciplina o builder. Não transformar o app em "skills".

### 9.1 Skill nº 1 (a mais importante): "Metodologia & Guardrails DEG-RPG"
Encapsula as regras inegociáveis para que **toda iteração** do loop as honre — com o **porquê explicado** (não MUSTs secos; a doc de skills recomenda explicar a razão para o modelo internalizar, não decorar):
- Três frentes, três unidades; sizing 1/3/8; **nunca somar entre frentes** ("comparar manga com uva"); sem XP único, sem ranking geral.
- Acesso **somente-leitura** ao ClickUp de produção; nada sai do container sem **gate humano**.
- **Determinismo:** só tarefa concluída + tag válida pontua; o motor nunca estima.
- Cosmético > vantagem mensurável; cooperativo > PvP.
- Bundla como `reference` a tabela de validade (§3.6) e o mapa de sizing. A `description` deve disparar sempre que o agente tocar em pontuação/XP/agregação, para **nunca relaxar a regra "por conveniência"**.

### 9.2 Skill nº 2: "growth-rpg-producer" (o motor único, no cowork)
O cálculo é **determinístico e repetitivo** — e vive **uma única vez**, na skill produtora do cowork (`growth-rpg-producer`, que estende `produtividade-clickup-ultra`/FLUXO 3). Em vez de cada iteração re-derivar a matemática (e arriscar divergir do painel), a regra mora na skill: lê o ClickUp, calcula e emite o `dados.json` + `painel.html`. Isso é o **motor único** da §2.1 no nível da ferramenta — "uma implementação, uma fonte". **Não há `scoring-core` Python no repo:** um script externo separado criaria dois motores que poderiam divergir, o oposto do que se quer. Atualizar a regra de negócio = atualizar a skill (sem deploy de script, sem versão defasada). O **ralph loop deste repo não tem motor para reescrever** — ele valida o contrato e apresenta.

### 9.3 Validação de contrato (no repo, não como skill)
A prova da §7 vive no **próprio repo**, não numa skill: `contract/validate.py` (schema + invariantes: não-soma-entre-frentes, vazão coerente, de-dup) + `tests/` (golden de Maio como fixture de regressão). Roda igual a cada iteração e a cada PR do loop (`ruff check . && pytest -q`) — operacionaliza o gate "marco só fecha com tudo verde". A **reconciliação app × painel** aparece na UI (A3).

### 9.4 Ingestão ClickUp read-only — no cowork
A leitura do ClickUp (pull-only, sem métodos de escrita) é parte da **skill produtora no cowork** (`growth-rpg-producer` + `produtividade-clickup-ultra`), não uma skill de build. **O repo não toca o ClickUp** — o ralph loop roda em container sem credencial de produção, então não há como o builder introduzir uma escrita no workspace de produção.

### 9.5 Como isso molda os marcos (§4.3)
- **M0** teve, como **primeiro artefato**, a skill "Metodologia & Guardrails" — o loop ganhou trilhos antes da primeira linha de código.
- O **motor** não nasce no repo: vive na skill `growth-rpg-producer` do cowork (§9.2). O repo nasce com o **validador de contrato** (A1).
- A **validação/paridade** é o `contract/validate.py` + `tests/`, re-rodado a cada iteração (§9.3).
- **Critério de aceite extra por marco:** "o agente carregou e honrou a skill de guardrails" (verificável no transcript do loop).

### 9.6 O que não fazer
- Não transformar o app de produção em skills (skills são build-time, não runtime).
- Não usar skills para esconder/duplicar a lógica do painel — o motor é **único e auditável**.
- **[DH]** Decidir se vale formalizar essas skills **agora** (via skill-creator) ou só após congelar as decisões da §6. Recomendo formalizar **já apenas a skill de guardrails** — ela protege todas as iterações seguintes; as demais nascem junto com o código.
```
