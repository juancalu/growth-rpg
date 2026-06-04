# Briefing de Contexto — Projeto "RPG de Produtividade" (gamificação interna)
**Para:** agente planejador
**Objetivo desta sessão:** avaliar viabilidade e ESTRUTURAR o projeto (planejamento e arquitetura). Ainda **não** é para implementar.

---

## 1. Seu papel e o que eu espero como saída
Você é um agente de planejamento. Não escreva código de produção nesta etapa. Entregue:
1. Avaliação de viabilidade (o que é fácil, o que é arriscado, o que é incerto).
2. Arquitetura proposta (fluxo de dados de ponta a ponta) com 2–3 alternativas e trade-offs.
3. Proposta de modelo de XP/níveis por frente (curvas, limiares, temporadas), marcando claramente onde precisa de decisão humana.
4. Escopo de um MVP enxuto + quebra em marcos pequenos e verificáveis.
5. Registro de riscos com mitigações.
6. Perguntas abertas / decisões que exigem um humano antes de prosseguir.
7. Estratégia de teste/validação — em especial, como provar que a pontuação do app bate com o painel oficial.

## 2. Visão do projeto
Gamificação interna, estilo RPG, da produtividade do time. As atividades de trabalho, já pontuadas por "frente", fazem um pseudo-personagem "upar" — mas **por frente, separadamente** (multiclasse), nunca num XP único. O alvo é uma página/app web para acompanhar progresso em (quase) tempo real. É um projeto-paralelo de motivação para um time jovem que curte esse universo; **não** é ferramenta de avaliação de desempenho.

## 3. Time e fonte de dados
- Time de **3 pessoas**: Felipe, Juan, Vinícius. Papéis distintos (especialização natural por frente).
- **Fonte de verdade = ClickUp**, workspace "PROJETOS - DEG". A classificação das tarefas vem de **etiquetas (tags)**: a frente e a complexidade. Tarefa concluída = status concluído.

## 4. Metodologia INEGOCIÁVEL (não violar, nem "por conveniência")
- **Três frentes, três unidades diferentes:**
  - `Operacional` = volume → unidade = **itens** (não usa complexidade).
  - `Projeto` = dev/eng/feature → unidade = **pontos de sizing**.
  - `Análise` = estudo/relatório aprofundado → unidade = **pontos de sizing**.
- **Escala de sizing (só Projeto e Análise):** Baixa = 1, Média = 3, Alta = 8. Operacional não recebe complexidade.
- **NUNCA somar pontos entre frentes.** NUNCA criar um XP único, "pontos totais" por pessoa, ou ranking geral entre pessoas. Comparar pontos de frentes diferentes é comparar manga com uva.
- Cada pessoa **upa independentemente em cada frente** (personagem multiclasse, com trilhas separadas e sem nível total).
- Métrica de ritmo = entregue ÷ dias disponíveis (**vazão**). A progressão deve ser **neutra a afastamentos** (férias/folga não fazem ninguém regredir).
- Pontuação **determinística**: só conta tarefa concluída com tags válidas; o motor nunca "estima" ou inventa número.

## 5. Motor de pontuação único (requisito de arquitetura)
Já existe um painel de produtividade que calcula esses números com uma lógica fixa (chamada internamente de "FLUXO 3"). **O app e o painel precisam usar exatamente o mesmo motor de cálculo.** Se a conta for reimplementada no app, mais cedo ou mais tarde o personagem e o relatório vão divergir e o jogo perde credibilidade. Planeje um **serviço de pontuação único** que: lê o ClickUp (tags = frente/complexidade, status concluído) como fonte de verdade, aplica a regra das frentes uma vez só, e serve tanto o painel quanto a web app.

## 6. Princípios de design a honrar
- **Recompensa majoritariamente cosmética** (títulos, evolução de avatar, badges, prestígio). Quanto menos vantagem mensurável o personagem dá, menos incentivo a burlar.
- **Cooperativo > competitivo.** Com 3 pessoas, barras lado a lado viram leaderboard social tóxico. Priorize: progresso individual **contra o próprio histórico** + uma **barra coletiva de "guild" por frente** (ex.: zerar o backlog de uma frente = derrotar um raid boss).
- **Temporadas** atreladas ao fechamento mensal (cada mês = um "capítulo"): nível de temporada zera, prestígio permanece. Mantém o jogo fresco e evita que quem começou primeiro "ganhe pra sempre".
- **Ritmos diferentes por frente são esperados**, não desigualdade de desempenho: Análise = boss fights raros e épicos; Operacional = limpar hordas; Projeto = construir a fortaleza. Curvas de XP e arte distintas por classe.
- **Precisão de estimativa é virtude:** premiar quem sizou certo, não quem sizou alto. Sizing idealmente definido/revisado por outra pessoa que não o executor.
- **Higiene de classificação como gameplay:** tarefa sem tag válida não gera XP e vira uma "missão de organização".

## 7. Riscos a planejar (com mitigação)
- **Lei de Goodhart / inflação de sizing:** se XP = pontos, há incentivo a chamar tudo de Alta. Mitigar com revisão de sizing por terceiro e/ou calibragem pelo esforço real.
- **Gaming de volume operacional:** fatiar tarefas para inflar itens. XP por item modesto; premiar consistência/streak, não picos.
- **Justiça de disponibilidade:** progressão por vazão e pausa em afastamentos.
- **Dinâmica de time pequeno (3 pessoas):** evitar PvP; favorecer cooperação e progresso pessoal.
- **Segurança psicológica:** é diversão e motivação, não vigilância nem nota de RH. A leitura gerencial (capacidade/1:1) deve ficar separada da camada lúdica.
- **Escopo/burnout:** está sendo construído fora do horário de trabalho; mantenha o MVP enxuto e o escopo honestamente dimensionado.

## 8. Contexto técnico e de execução (importante para o seu plano)
- A construção será **autônoma**, via **ralph loop dentro de um container isolado** na máquina local. Como o agente vai iterar sozinho, o plano PRECISA ter: escopo com fronteiras claras, **critérios de aceite por marco**, incrementos pequenos e revisáveis, e estratégia de teste — para o loop não sair dos trilhos.
- **Guardrails da execução autônoma (trate como hard constraints):**
  - **Acesso somente-leitura aos dados reais do ClickUp.** O loop **nunca** deve escrever/alterar o workspace de produção. Para testar, use dataset sintético/sandbox ou um snapshot somente-leitura.
  - **Nada sai do container** nem vai para produção sem aprovação humana (gate de decisão).
  - Manter o **motor de pontuação único**; não duplicar a lógica de cálculo.
  - Nunca relaxar a regra de não-somar-entre-frentes para "simplificar".
  - Toda suposição relevante deve ser explicitada para revisão humana.
- **Tempo real:** avalie webhooks do ClickUp vs. polling periódico (para um time de 3, polling pode bastar).
- **Stack:** aberto à sua proposta, com a restrição de rodar local/containerizado e ser simples o bastante para 3 pessoas manterem.

## 9. Espaço de decisão (aberto para você propor, com trade-offs)
- Stack e arquitetura concreta.
- Curvas de XP e limiares de nível por frente.
- Estrutura de temporadas e do que persiste como prestígio.
- Modelo de dados e estratégia de tempo real.
Apresente opções e recomende uma, mas **sinalize explicitamente onde a decisão precisa ser humana** antes de implementar.

## 10. Critério de sucesso do MVP
Um humano consegue: ver o personagem multiclasse de cada pessoa (uma trilha por frente), ver a barra coletiva por frente, e conferir que os números batem com o painel oficial — tudo a partir do ClickUp, sem nenhuma soma entre frentes e sem ranking geral.
