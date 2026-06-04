# Contrato `dados.json` — produtor (cowork) → app web

**Versão do schema:** 1.3 (2026-06-03) — exemplo canônico e atualizado: **`dados.json`** (o bloco JSON embutido neste documento é uma referência antiga; em divergência, vale o `dados.json`).

**Papel:** fronteira entre a **skill produtora** (roda no cowork, lê o ClickUp read-only, computa no **cowork (motor FLUXO 3)**, gera este JSON **diariamente** numa pasta dedicada) e a **web app** (apenas consome este JSON). O mesmo JSON também alimenta o HTML do painel gerencial — duas renderizações do **mesmo** dado (paridade por construção).

**Status:** rascunho de planejamento (schema + exemplo). Não é código de produção.
**Decisões do time (2026-06-03):**
- **Custos por nível:** Operacional **6 / nível** · Projeto **8 / nível** · Análise **6 / nível** (XP = 1 por ponto/item).
- **Classes (cosméticas):** Operacional = **Guerreiro** · Projeto = **Engenheiro** · Análise = **Mago**, cada uma com 12 etapas de título (ver bloco `classes`).
- **Emblemas por entrega (determinísticos):** "registrou ≥ limiar na frente X na quinzena" (ex.: Alquimista = 10 pts Análise; Engenheiro Mestre = 20 pts Projeto). Salvos no histórico de cada personagem. Catálogo em `emblemas_catalogo`.
- **Ranking por frente na quinzena:** permitido, **secundário e cosmético** (dentro da frente; nunca combina frentes nem soma total por pessoa). `ranking_quinzena`.
- **Objetivo coletivo em camadas, anti-inflação:** HP = backlog real **comprometido e priorizado por valor** da quinzena (sprint planning), dimensionado pela **vazão das últimas 1–2 quinzenas**, em faixas `comprometida → alvo → stretch`. **Nunca inflar o backlog** para ter "boss gordo".
- **Quinzena atrelada à reunião com o diretor (Marcos):** backlog/camadas e emblemas precedem a reunião — o backlog comprometido = a "gameplay". [DH] dia/fuso exatos do corte.
- **Esforço/precisão (ex.: "Mira Certeira"):** fora por enquanto — esforço ainda não é mensurável de forma determinística.
- **Âncora da quinzena (agenda confirmada):** reunião "alinhamento e resultados — Estratégia e Growth" com o diretor, a cada 2 quintas de manhã (10h BRT): **18/06, 02/07, 16/07, 30/07…**. Cada quinzena vai de uma reunião à próxima.
- **Sub-chefes / hordas (v1.3):** bugs/urgências do meio da quinzena viram bloco `eventos` paralelo ao `guild` — encontro separado, farma XP real (não infla o boss comprometido). **Marcador = palavra-chave no título** (lista fixa: fix/bug/corrigir/correção/hotfix/blk-fix). Isso é **só cosmético** (define o encontro); o **score vem das tags** (frente+complexidade, 1/3/8), determinístico.

## Princípios codificados no contrato
- **Nada soma entre frentes.** Não existe campo de "XP total por pessoa" nem ranking. Cada frente é um objeto isolado, na sua unidade.
- **Vitalício + janela.** Cada frente carrega o acumulado de toda a história (`xp_total`, `nivel`) **e** o recorte da quinzena corrente (`*_quinzena`, vazão, emblemas, objetivo coletivo).
- **Determinístico.** Todo número vem do **motor do cowork** sobre tarefas concluídas (`date_done`) com tags válidas. Nada estimado.
- **Soma dentro da frente é permitida** só no bloco `guild` (mesma unidade).
- **Classes e títulos são puramente cosméticos.** Cada frente tem uma classe fixa e um `titulo` que depende **só do nível daquela frente** (tabela de tiers em `classes`). Não existe título nem "nível" que combine frentes diferentes.

## Schema (campos) — v1.2
- `meta`: `schema_version`, `motor_versao`, `gerado_em`, `quinzena` (com `ancora`/`cadencia` — atrelada à reunião com o diretor), `fonte`, `xp_base`, `custos_por_nivel`.
- `classes`: por frente → `nome` (Guerreiro/Engenheiro/Mago), `tema`, `trilha[]` (12 tiers: `tier`, `de`, `ate` — `null` é topo —, `titulo`).
- `emblemas_catalogo.lista[]` *(novo na 1.2)*: conquistas por entrega → `id`, `nome`, `frente`, `metrica` (itens|pontos), `limiar`. Membro ganha se `entregue_quinzena` na frente ≥ `limiar` (determinístico).
- `pessoas[]`: por pessoa → `dias_disponiveis`, `afastamentos[]`, `frentes{…}`, `emblemas_quinzena[]` (ids ganhos na quinzena), `emblemas_historico[]` (`{quinzena, ids[]}` — salvos para sempre), `prestigio`.
  - cada **frente** → `classe`, `unidade`, `nivel`, `custo_por_nivel`, `xp_total`, `xp_no_nivel`, `xp_para_proximo`, `entregaveis_total`, `entregue_quinzena`, `entregaveis_quinzena`, `vazao_quinzena`, **`tier`** *(novo)*, `titulo`, `backlog`.
- `ranking_quinzena{frente}` *(novo na 1.2)*: ranking **secundário/cosmético** por frente → `ordem[]` (`pos`, `pessoa`, `valor`, `vazao`). Sempre dentro da frente; nunca combina frentes nem soma total por pessoa.
- `guild{frente}`: objetivo coletivo → `objetivo` (territorio|construcao|mapa_insights), **`camadas`** (`comprometida`→`alvo`→`stretch`) *(novo na 1.2)*, `entregue_quinzena`, `camada_atingida`, `proxima_camada`, `restante_para_proxima`, `contribuicoes_quinzena{}`, `total_equipe_quinzena`. **HP = backlog real comprometido/priorizado por valor (anti-inflação); camadas dimensionadas pela vazão das últimas 1–2 quinzenas.**
  - de-dup: `soma(contribuicoes_quinzena) ≥ total_equipe_quinzena`.
- `eventos` *(novo na 1.3)*: sub-chefes/hordas → `marcadores_titulo[]` (lista fixa de palavras-chave) + `lista[]` (cada: `id`, `nome`, `frente`, `unidade`, `hp` = soma do sizing, `restante`, `concluido`, `contribuicoes_quinzena{}`, `tarefas[]`). **Cosmético:** agrupa tarefas já pontuadas na frente; não há XP separado. Detecção por título **nunca** afeta o score (que vem das tags).
- `missoes_organizacao[]`: tarefas concluídas inválidas (sem XP) → `motivo` ∈ {falta_frente, frente_ambigua, falta_sizing, sizing_ambiguo}.

## Exemplo preenchido (referência: ciclo Maio/2026)

```json
{
  "meta": {
    "schema_version": "1.1",
    "motor_versao": "cowork/produtividade-clickup-ultra",
    "gerado_em": "2026-06-03T08:00:00-03:00",
    "fonte": "ClickUp PROJETOS-DEG (read-only) via cowork",
    "quinzena": { "label": "Maio/2026 (ref.)", "de": "2026-05-01", "ate": "2026-05-31" },
    "xp_base": { "operacional_por_item": 1, "projeto_por_ponto": 1, "analise_por_ponto": 1 },
    "custos_por_nivel": { "operacional": 6, "projeto": 8, "analise": 6 }
  },
  "classes": {
    "operacional": {
      "nome": "Guerreiro",
      "tema": "a horda e a conquista de territorio",
      "trilha": [
        { "tier": 1,  "de": 0,   "ate": 0,    "titulo": "Recruta" },
        { "tier": 2,  "de": 1,   "ate": 2,    "titulo": "Soldado" },
        { "tier": 3,  "de": 3,   "ate": 5,    "titulo": "Combatente" },
        { "tier": 4,  "de": 6,   "ate": 9,    "titulo": "Veterano" },
        { "tier": 5,  "de": 10,  "ate": 14,   "titulo": "Ceifador de Hordas" },
        { "tier": 6,  "de": 15,  "ate": 21,   "titulo": "Barbaro" },
        { "tier": 7,  "de": 22,  "ate": 30,   "titulo": "Campeao" },
        { "tier": 8,  "de": 31,  "ate": 45,   "titulo": "Comandante" },
        { "tier": 9,  "de": 46,  "ate": 65,   "titulo": "Senhor da Guerra" },
        { "tier": 10, "de": 66,  "ate": 90,   "titulo": "Conquistador" },
        { "tier": 11, "de": 91,  "ate": 129,  "titulo": "Marechal das Fronteiras" },
        { "tier": 12, "de": 130, "ate": null, "titulo": "Lenda da Vanguarda" }
      ]
    },
    "projeto": {
      "nome": "Engenheiro",
      "tema": "a construcao e a criacao da base",
      "trilha": [
        { "tier": 1,  "de": 0,   "ate": 0,    "titulo": "Aprendiz" },
        { "tier": 2,  "de": 1,   "ate": 2,    "titulo": "Tecnico" },
        { "tier": 3,  "de": 3,   "ate": 5,    "titulo": "Engenheiro Junior" },
        { "tier": 4,  "de": 6,   "ate": 9,    "titulo": "Engenheiro" },
        { "tier": 5,  "de": 10,  "ate": 14,   "titulo": "Engenheiro Senior" },
        { "tier": 6,  "de": 15,  "ate": 21,   "titulo": "Mestre de Obras" },
        { "tier": 7,  "de": 22,  "ate": 30,   "titulo": "Mecanista" },
        { "tier": 8,  "de": 31,  "ate": 45,   "titulo": "Arquiteto de Sistemas" },
        { "tier": 9,  "de": 46,  "ate": 65,   "titulo": "Engenheiro-Chefe" },
        { "tier": 10, "de": 66,  "ate": 90,   "titulo": "Grande Engenheiro" },
        { "tier": 11, "de": 91,  "ate": 129,  "titulo": "Engenheiro-Mor" },
        { "tier": 12, "de": 130, "ate": null, "titulo": "Demiurgo" }
      ]
    },
    "analise": {
      "nome": "Mago",
      "tema": "a magia e o mapa de insights",
      "trilha": [
        { "tier": 1,  "de": 0,   "ate": 0,    "titulo": "Aprendiz de Feiticos" },
        { "tier": 2,  "de": 1,   "ate": 2,    "titulo": "Conjurador" },
        { "tier": 3,  "de": 3,   "ate": 5,    "titulo": "Feiticeiro" },
        { "tier": 4,  "de": 6,   "ate": 9,    "titulo": "Bruxo" },
        { "tier": 5,  "de": 10,  "ate": 14,   "titulo": "Arcanista" },
        { "tier": 6,  "de": 15,  "ate": 21,   "titulo": "Necromante" },
        { "tier": 7,  "de": 22,  "ate": 30,   "titulo": "Mago" },
        { "tier": 8,  "de": 31,  "ate": 45,   "titulo": "Mago Superior" },
        { "tier": 9,  "de": 46,  "ate": 65,   "titulo": "Magus" },
        { "tier": 10, "de": 66,  "ate": 90,   "titulo": "Grande Mago" },
        { "tier": 11, "de": 91,  "ate": 129,  "titulo": "Arquimago" },
        { "tier": 12, "de": 130, "ate": null, "titulo": "Senhor do Arcano" }
      ]
    }
  },
  "pessoas": [
    {
      "id": 296609800, "nome": "Felipe", "jogavel": true,
      "dias_disponiveis": 20, "afastamentos": [],
      "frentes": {
        "operacional": { "classe": "Guerreiro", "unidade": "itens", "nivel": 0, "custo_por_nivel": 6,
          "xp_total": 2, "xp_no_nivel": 2, "xp_para_proximo": 4,
          "entregaveis_total": 2, "entregue_quinzena": 2, "entregaveis_quinzena": 2,
          "vazao_quinzena": 0.10, "titulo": "Recruta", "backlog": { "valor": 0, "tarefas": 0 } },
        "projeto": { "classe": "Engenheiro", "unidade": "pontos", "nivel": 21, "custo_por_nivel": 8,
          "xp_total": 173, "xp_no_nivel": 5, "xp_para_proximo": 3,
          "entregaveis_total": 71, "entregue_quinzena": 173, "entregaveis_quinzena": 71,
          "vazao_quinzena": 8.65, "titulo": "Mestre de Obras", "backlog": { "valor": 30, "tarefas": 7 } },
        "analise": { "classe": "Mago", "unidade": "pontos", "nivel": 0, "custo_por_nivel": 6,
          "xp_total": 5, "xp_no_nivel": 5, "xp_para_proximo": 1,
          "entregaveis_total": 3, "entregue_quinzena": 5, "entregaveis_quinzena": 3,
          "vazao_quinzena": 0.25, "titulo": "Aprendiz de Feiticos", "backlog": { "valor": 4, "tarefas": 2 } }
      },
      "emblemas_quinzena": [
        { "id": "construtor_da_quinzena", "nome": "Construtor da Quinzena", "frente": "projeto", "conquistado": true }
      ],
      "prestigio": { "titulos": ["Mestre de Obras"], "badges": [] }
    },
    {
      "id": 101182134, "nome": "Juan", "jogavel": true,
      "dias_disponiveis": 16, "afastamentos": [{ "tipo": "atestado", "dias": 4 }],
      "frentes": {
        "operacional": { "classe": "Guerreiro", "unidade": "itens", "nivel": 8, "custo_por_nivel": 6,
          "xp_total": 48, "xp_no_nivel": 0, "xp_para_proximo": 6,
          "entregaveis_total": 48, "entregue_quinzena": 48, "entregaveis_quinzena": 48,
          "vazao_quinzena": 3.00, "titulo": "Veterano", "backlog": { "valor": 20, "tarefas": 20 } },
        "projeto": { "classe": "Engenheiro", "unidade": "pontos", "nivel": 0, "custo_por_nivel": 8,
          "xp_total": 1, "xp_no_nivel": 1, "xp_para_proximo": 7,
          "entregaveis_total": 1, "entregue_quinzena": 1, "entregaveis_quinzena": 1,
          "vazao_quinzena": 0.06, "titulo": "Aprendiz", "backlog": { "valor": 0, "tarefas": 0 } },
        "analise": { "classe": "Mago", "unidade": "pontos", "nivel": 4, "custo_por_nivel": 6,
          "xp_total": 29, "xp_no_nivel": 5, "xp_para_proximo": 1,
          "entregaveis_total": 15, "entregue_quinzena": 29, "entregaveis_quinzena": 15,
          "vazao_quinzena": 1.81, "titulo": "Feiticeiro", "backlog": { "valor": 0, "tarefas": 0 } }
      },
      "emblemas_quinzena": [
        { "id": "primeira_alta", "nome": "Primeira Alta", "frente": "analise", "conquistado": true },
        { "id": "sequencia", "nome": "Sequencia", "frente": "operacional", "conquistado": true }
      ],
      "prestigio": { "titulos": ["Veterano", "Feiticeiro"], "badges": [] }
    },
    {
      "id": 101182135, "nome": "Vinicius", "jogavel": true,
      "dias_disponiveis": 20, "afastamentos": [],
      "frentes": {
        "operacional": { "classe": "Guerreiro", "unidade": "itens", "nivel": 11, "custo_por_nivel": 6,
          "xp_total": 71, "xp_no_nivel": 5, "xp_para_proximo": 1,
          "entregaveis_total": 71, "entregue_quinzena": 71, "entregaveis_quinzena": 71,
          "vazao_quinzena": 3.55, "titulo": "Ceifador de Hordas", "backlog": { "valor": 19, "tarefas": 19 } },
        "projeto": { "classe": "Engenheiro", "unidade": "pontos", "nivel": 4, "custo_por_nivel": 8,
          "xp_total": 37, "xp_no_nivel": 5, "xp_para_proximo": 3,
          "entregaveis_total": 10, "entregue_quinzena": 37, "entregaveis_quinzena": 10,
          "vazao_quinzena": 1.85, "titulo": "Engenheiro Junior", "backlog": { "valor": 0, "tarefas": 0 } },
        "analise": { "classe": "Mago", "unidade": "pontos", "nivel": 2, "custo_por_nivel": 6,
          "xp_total": 16, "xp_no_nivel": 4, "xp_para_proximo": 2,
          "entregaveis_total": 8, "entregue_quinzena": 16, "entregaveis_quinzena": 8,
          "vazao_quinzena": 0.80, "titulo": "Conjurador", "backlog": { "valor": 6, "tarefas": 2 } }
      },
      "emblemas_quinzena": [
        { "id": "conquistador_da_quinzena", "nome": "Conquistador da Quinzena", "frente": "operacional", "conquistado": true }
      ],
      "prestigio": { "titulos": ["Ceifador de Hordas", "Engenheiro Junior", "Conjurador"], "badges": [] }
    }
  ],
  "guild": {
    "operacional": { "unidade": "itens", "objetivo": "territorio",
      "backlog_inicio": 39, "restante": 39, "concluido": false,
      "contribuicoes_quinzena": { "Felipe": 2, "Juan": 48, "Vinicius": 71 },
      "total_equipe_quinzena": 117 },
    "projeto": { "unidade": "pontos", "objetivo": "construcao",
      "backlog_inicio": 30, "restante": 30, "concluido": false,
      "contribuicoes_quinzena": { "Felipe": 173, "Juan": 1, "Vinicius": 37 },
      "total_equipe_quinzena": 211 },
    "analise": { "unidade": "pontos", "objetivo": "mapa_insights",
      "backlog_inicio": 10, "restante": 10, "concluido": false,
      "contribuicoes_quinzena": { "Felipe": 5, "Juan": 29, "Vinicius": 16 },
      "total_equipe_quinzena": 42 }
  },
  "missoes_organizacao": [
    { "task_id": "86e1mtv7r", "nome": "Melhorar match de nome - Engenharia do Corpo", "assignee": "Felipe", "motivo": "falta_frente", "url": "https://app.clickup.com/t/86e1mtv7r" },
    { "task_id": "86e1kf6fx", "nome": "Ajuste", "assignee": "Juan", "motivo": "falta_frente", "url": "https://app.clickup.com/t/86e1kf6fx" },
    { "task_id": "86e1pq9d4", "nome": "Buildar e subir containers no servidor", "assignee": "Vinicius", "motivo": "falta_sizing", "url": "https://app.clickup.com/t/86e1pq9d4" }
  ]
}
```

## Observações de implementação (para a skill produtora)
- **`titulo` por frente** = lookup do `nivel` na trilha da classe (`classes[frente].trilha`, faixa `de`–`ate`). O produtor resolve e grava o texto já pronto; o app só exibe. Determinístico, sem lógica de título no front.
- **Níveis recalculados com os custos decididos** (Op 6 / Prj 8 / Ana 6): ex. Felipe Projeto 173 ÷ 8 = nível 21; Juan Operacional 48 ÷ 6 = nível 8; Vinícius Operacional 71 ÷ 6 = nível 11.
- `entregue_quinzena` vs `xp_total`: neste exemplo são iguais porque Maio é o primeiro ciclo; a partir do 2º ciclo, `xp_total` acumula e `*_quinzena` é só a janela corrente.
- `vazao_quinzena = round(entregue_quinzena ÷ dias_disponiveis, 2)`. Confere com o painel (ex.: Felipe Projeto 173/20 = 8,65).
- `total_equipe_quinzena` é de-dup (Operacional 117, não 121; Análise 42, não 50). As `contribuicoes_quinzena` por pessoa creditam colaborativas para cada um.
- O app **lê este JSON**; nunca recalcula nem raspa o HTML. Se o schema mudar, subir `schema_version` (subiu para **1.1** ao adicionar `classes`, `classe`/`titulo` por frente, `xp_base` e `custos_por_nivel`).
- **Acentos:** os textos de título estão sem acento (ASCII) por segurança; como o JSON é UTF-8, podem ser acentuados no display (Bárbaro, Campeão, Júnior, Feitiços, Sequência) sem mudar o schema.
