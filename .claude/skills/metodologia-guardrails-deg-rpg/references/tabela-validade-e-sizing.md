# Tabela de validade, sizing e casos de borda — DEG-RPG

Referência completa das regras de **validação/scoring** aplicadas pelo **motor do cowork** (FLUXO 3) e checadas pelo validador de contrato do repo. Determinístico: classifica pelo que está no ClickUp, nunca por inferência.

---

## 1. Fonte de classificação: tags (etiquetas)

Confirmado pelo time: a classificação viva vem das **tags** da tarefa.

- **Frente:** `operacional` | `projeto` | `análise`
- **Complexidade:** `baixa` | `média` | `alta`

**Normalização obrigatória** antes de comparar (as tags são free-form e propensas a variação):
- caixa-insensível (`Projeto` == `projeto`);
- acento-insensível (`análise` == `analise`);
- trim de espaços.

As custom fields do space (`Frente`, `Complexidade da Tarefa`, e a formula `Pontos` que hoje retorna `null`) **existem mas não são preenchidas**. Não dependa delas. Fallback para custom field só se um humano decidir (ver §5, decisão pendente).

`status` concluído = tarefa "done". Os status observados no workspace: `concluído`, `pendente`, `em progresso`. Só `concluído` pontua.

---

## 2. Mapa de sizing (só Projeto e Análise)

| Complexidade (tag) | Pontos |
|---|---|
| `baixa` | 1 |
| `média` | 3 |
| `alta`  | 8 |

Operacional **não usa** sizing.

---

## 3. Regras de validade (determinísticas)

| Caso | Frente | Complexidade | Resultado |
|---|---|---|---|
| Concluída + `operacional` | Operacional | (ignorada, mesmo se presente) | **Válida** → 1 item |
| Concluída + `projeto`/`análise` + exatamente 1 complexidade | Projeto/Análise | 1 tag válida | **Válida** → pontos = 1/3/8 |
| Concluída, **sem** frente, **e sem ancestral tagueado** | — | — | **Inválida** → missão de organização ("falta frente") |
| Concluída, **sem** frente, mas **subtarefa de ancestral com frente** | (herda contexto do pai) | — | **Ignorada** — detalhamento simples; não pontua e **não** é missão |
| Concluída, **≥2** tags de frente | ambígua | — | **Inválida** → ("frente ambígua") |
| Concluída `projeto`/`análise`, **sem** complexidade | Projeto/Análise | ausente | **Inválida** → ("falta sizing") |
| Concluída `projeto`/`análise`, **≥2** complexidades | Projeto/Análise | ambígua | **Inválida** → ("sizing ambíguo") |
| Não concluída | qualquer | qualquer | **Não conta** (ainda não entregue) |

Tarefa **inválida não gera XP** e entra na lista de **"missões de organização"**. Quando um humano corrige a tag, ela passa a pontuar no próximo ciclo (retroativo, determinístico). A recompensa por higiene é **mínima e cosmética** (destravar o XP que já era seu, não XP extra por limpar — para não incentivar criar bagunça).

---

## 4. Casos de borda já observados no workspace real

1. **Tarefa em lote com contagem no título** (ex.: "Estudos de ponto p/ expansão — Maio/2026 (25 estudos)"). Foi **pontual/histórico**: a partir de agora os estudos entram **um a um** (1 tarefa = 1 item), regra simples e determinística. Atenção de paridade: o painel de **Maio/2026 contou o lote** (Juan 29, Vinícius 25), então o golden dataset de Maio é um **baseline pré-mudança** — uma prova de paridade contra Maio precisa tratar esse lote, ou usar um mês **pós-mudança** como baseline.
2. **Projeto sem complexidade** (ex.: "Buildar e Subir containers no servidor" só com tag `projeto`). É **inválida** ("falta sizing") → missão de organização. Não assumir um sizing default.
3. **Tarefa sem tag — depende da hierarquia.** Órfã/top-level (ex.: "Melhorar match de nome", `parent: null`) → missão ("falta frente"). **Subtarefa de ancestral tagueado** (ex.: "Ajuste" sob "Alimentar Pipeline..." [operacional]) → **ignorada**: detalhamento simples, não pontua e não é missão. Subtarefas sem tag ficam assim de propósito (são "simples", parte de uma tarefa maior).
4. **Operacional com tag de complexidade.** Válida; a complexidade é **ignorada** (vale 1 item).
5. **Guarda-chuva tagueado com filhos tagueados** (ex.: "Alimentar Pipeline..." [operacional], 95 subtarefas, várias tagueadas). Risco de **dupla contagem** (pai + filhos). Regra: contar a **unidade real** (as tarefas tagueadas-folha); um pai tagueado que tem filhos tagueados é container e **não** soma de novo. [DH] confirmar (hoje o pai está "em progresso", então ainda não duplica). A ingestão precisa resolver a hierarquia (`parent`/`top_level_parent`).

---

## 5. Decisões — tomadas e pendentes

**Tomadas:**
- Fonte canônica de classificação = **tags** (confirmado pelo time e pelo método do painel).
- Sizing 1/3/8, determinismo, "frentes não somam", vazão = entregue ÷ dias disponíveis — **confirmados pelo painel oficial** (§7).
- **FLUXO 3 localizado:** tarefa quinzenal no cowork → HTML em `C:\Users\Felipe Silva\Desktop\Relatórios - Estratégia e Growth`. A lógica vive no prompt do cowork e é **reusada** pela skill produtora (NÃO extraída para um scoring-core no repo).

**Resolvida (2026-06-03):**
- "Item" operacional = **1 por tarefa concluída**, a partir de agora — os estudos passam a ser registrados um a um. O lote de Maio foi pontual; só tratar ao reprocessar histórico.
- **Subtarefa sem tag de ancestral tagueado = ignorada** (detalhamento simples; não pontua nem vira missão). Só é missão a tarefa sem frente que NÃO é filha de uma tarefa tagueada. (Pendente: regra de **dupla contagem** pai/filhos tagueados — ver §4 caso 5.)
- **Backlog/camadas do objetivo coletivo = input curado na tarefa do cowork** (itens + pontos totais por frente), definido nos **dias de reunião com o diretor** — não auto-derivado. É a fonte anti-inflação do HP. Âncora confirmada na agenda: reunião "alinhamento e resultados", a cada 2 quintas de manhã — **18/06, 02/07, 16/07, 30/07…**
- **Sub-chefes / hordas (urgência não planejada):** trabalho urgente/bug do meio da quinzena = encontro separado do boss comprometido (`eventos` no JSON); farma XP real, não infla o boss; nunca recompensar criação de bug. **Marcador = palavra-chave no título** (lista fixa: fix/bug/corrigir/correção/hotfix/blk-fix), **só cosmético** — o score vem das tags. Sized 1/3/8.
- **Produtor do snapshot = a própria tarefa do cowork** (a que gera o FLUXO 3), rodando diária: lê ClickUp (read-only), roda o **motor (FLUXO 3 no cowork)**, e emite numa pasta dedicada o HTML (gerencial) + um `dados.json` (contrato de máquina). O app consome o `dados.json`, nunca faz scraping do HTML. Os números vêm de **código determinístico**, não da interpretação livre do agente.

- **Data de conclusão = `date_done`** (status "concluído" é tipo `closed`; carimba a data). NÃO usar `due_date` (é prazo/meta). Ressalva: em tarefas backfilladas `date_done ≈ date_created` (registro no fechamento), logo reflete o momento do *lançamento*, não da execução — para evolução diária real, o time deve concluir na hora.
- **Disponibilidade:** registrada via flag no output do cowork; expor `dias_disponiveis` + `afastamentos` por pessoa no `dados.json`. Dias disponíveis = dias úteis do mês − afastamentos.
- **Marcos Minchiotti = NÃO jogável** (diretor do departamento; acesso de visualização). Personagens = Felipe, Juan, Vinícius. O app não vira ranking/leitura de desempenho para o diretor — a leitura gerencial é o painel FLUXO 3, separada.

**Pendentes (precisam de humano — não decida sozinho no loop):**
- **Corte da quinzena** (dia/fuso fino) — ancorado na reunião com o diretor (quintas: 18/06, 02/07…; ver "Resolvida" acima). Níveis são vitalícios (SEM reset).
- **Curvas de XP por frente** — DECIDIDO (vitalício, custo fixo: **Op 6 / Prj 8 / Ana 6** por nível). Classes cosméticas por frente (Guerreiro/Engenheiro/Mago) com 12 tiers de título em faixas geométricas. SEM reset. Contrato e tiers em `contrato-dados-json.md`. Pendente só: regra determinística de cada emblema (ex.: "Mira Certeira") e revisão dos emblemas que coroam "quem fez mais" (risco de ranking — preferir recorde pessoal/coletivo).
- **Fallback para custom fields** quando a tag faltar: permitir ou não.

Qualquer decisão dessas tomada dentro do loop deve ser **explicitada no PR** para revisão humana, nunca embutida silenciosamente.

---

## 6. Identificadores úteis (somente-leitura)

- Workspace: `90171210512`
- Space `PROJETOS - DEG`: `90175557627`
- Membros: Marcos Minchiotti `101182872` (diretor, NÃO jogável) · Felipe Castaldi `296609800` · Vinícius Cruz `101182135` · Juan Lima `101182134` (estes 3 = personagens)
- Custom fields do space: `Frente` (dropdown), `Complexidade da Tarefa` (dropdown), `Pontos` (formula, stub/null).

Lembrete: estes IDs são para **leitura**. O cliente do ClickUp no build não deve ter métodos de escrita.

---

## 7. FLUXO 3 — semântica confirmada e golden dataset (paridade)

**O que é:** tarefa quinzenal no cowork que lê o ClickUp e gera um HTML de painel gerencial. Exemplo de verdade: `C:\Users\Felipe Silva\Desktop\Relatórios - Estratégia e Growth\painel-produtividade-maio-2026_1.html`. Para o RPG, rodará diário/horário. A lógica é **reusada** pela skill produtora no cowork (paridade por construção) — não há `scoring-core` no repo.

**Separação de camadas:** o painel é a leitura **gerencial** (capacidade, vazão, bus factor, foco de 1:1). O app é a camada **lúdica** e **não** reproduz a narrativa gerencial. Ambos usam os mesmos números.

**Semântica confirmada pelo HTML:**
- Janela = ciclo mensal; classificação pelas tags; sizing 1/3/8; nada estimado.
- **Vazão = entregue ÷ dias disponíveis**; dias disponíveis = dias úteis do mês − afastamentos.
- **Por pessoa:** credita cada responsável (colaborativas contam para os dois). **Totais de equipe:** cada entregável uma vez (de-dup) → por isso soma por pessoa > total.
- **Backlog "em aberto no pipeline"** = tarefas não concluídas por frente (itens/pontos) = HP do **objetivo coletivo** (construção/conquista; ver plano §3.7).
- Rastreia **contagem de entregáveis** E **soma de pontos** (Projeto/Análise).
- Tarefas sem etiqueta de frente ficam fora (missão de organização).

**Golden dataset — Maio/2026 (use como fixture de regressão do harness de paridade; diff alvo = 0):**

Por pessoa (frente: valor · entregáveis · vazão · backlog):
- **Felipe** (20 dias disp.): Projeto 173 pts · 71 · 8,65/d · bl 30 pts (7t) | Análise 5 pts · 3 · 0,25/d · bl 4 pts (2t) | Operacional 2 itens · 0,10/d · sem bl
- **Juan** (16 dias disp., −4 atestado): Análise 29 pts · 15 · 1,81/d · sem bl | Operacional 48 itens · 3,00/d · bl 20 itens | Projeto 1 pt · 1 · 0,06/d · sem bl
- **Vinícius** (20 dias disp.): Operacional 71 itens · 3,55/d · bl 19 itens | Projeto 37 pts · 10 · 1,85/d · sem bl | Análise 16 pts · 8 · 0,80/d · bl 6 pts

Totais de equipe (de-dup): Operacional **117** itens concl. (39 em aberto) | Projeto **211** pts / 82 entreg. (30 em aberto) | Análise **42** pts / 22 entreg. (10 em aberto).

Diagnóstico de de-dup (soma por pessoa vs. total): Operacional 121 vs 117 (4 colaborativos) · Análise 50 vs 42 (8 pts colaborativos) · Projeto 211 vs 211 (sem colaboração). Volume operacional em lote: Juan 29 · Vinícius 25.
