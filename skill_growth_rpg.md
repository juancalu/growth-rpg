---
name: growth-rpg-producer
description: >-
  Produtor de dados do "Growth RPG" (gamificação interna DEG). Use nas execuções RECORRENTES
  que geram o estado do jogo — lê o ClickUp (PROJETOS - DEG) somente-leitura via MCP,
  aplica as regras de scoring DENTRO do cowork (mesmo motor da skill produtividade-clickup-ultra),
  e emite o dados.json + painel.html. Acione quando a tarefa for "gerar/atualizar o RPG",
  "rodar o produtor", "atualizar dados.json", o refresh diário, ou o fechamento da quinzena
  (reunião com o diretor). NÃO recalcule números à mão — o cálculo é feito pelo código
  embutido nesta skill (mesmo da produtividade-clickup-ultra, estendido para RPG). Carregue
  SEMPRE junto à skill `produtividade-clickup-ultra` (fonte canônica das regras de scoring).
---

# Growth RPG — Skill Produtora (cowork)

Você é o **produtor** do Growth RPG. Seu trabalho é, de forma **determinística e somente-leitura**,
transformar o estado do ClickUp no `dados.json` (contrato que o app web consome) e no `painel.html`
(leitura gerencial). Você **calcula tudo aqui dentro**, usando o mesmo motor de scoring da skill
`produtividade-clickup-ultra` — **não há script Python externo**; o cowork é o motor.

> **Pré-requisito:** carregue a skill **`produtividade-clickup-ultra`** — ela contém as regras
> canônicas de frente/sizing/unidade/FLUXO 3 que este produtor estende para o formato RPG.
> Em conflito entre as duas skills, `produtividade-clickup-ultra` vence nos fundamentos de
> scoring; esta skill vence nas mecânicas RPG (tier/título/emblema/guild/eventos).

---

## Por que não há script Python externo

O plano original (`plano-build.md`) previa um `scoring-core` como lib Python separada. Essa
abordagem foi **substituída**: o cowork já calcula tudo via o código do FLUXO 3 da skill
`produtividade-clickup-ultra`, que é determinístico, testado e documentado. Manter um script
externo separado criaria dois motores que podem divergir — exatamente o risco que a arquitetura
de "motor único" quis evitar. Aqui, o cowork **é** o motor único: lê, calcula e emite.

Vantagem direta: atualizar as regras de negócio = atualizar a skill. Sem deploy de script,
sem risco de versão defasada, sem dependência de ambiente Python na máquina do produtor.

---

## Cadência de execução

- **Diário:** refresh do `dados.json` — lê o ClickUp e regenera o estado completo.
- **Quinzenal (fechamento):** ancorado na reunião **"alinhamento e resultados"** com o diretor
  (Marcos), a cada 2 quintas de manhã (10h BRT): **18/06, 02/07, 16/07, 30/07…**. Nesse dia,
  o backlog comprometido + camadas já devem estar definidos (travados no planejamento, ANTES
  da reunião). Nesta execução, o produtor também gera o `painel.html` completo.

---

## Passo a passo

### 1. Carregar contexto e regras

- Carregue a skill `produtividade-clickup-ultra` (regras de scoring, FLUXO 3, código canônico).
- Consulte o `contrato-dados-json.md` para o schema de saída (v1.3).
- Leia os inputs curados (mantidos como arquivos de configuração, não como código):
  - `config/classes.json` — classes/trilhas dos 12 tiers por frente.
  - `config/emblemas.json` — catálogo de emblemas e limiares.
  - `config/disponibilidade.json` — dias úteis e afastamentos por pessoa.
  - `config/backlog_quinzena.json` — backlog comprometido + camadas (travado no planejamento).
  - `config/marcadores_titulo.json` — palavras-chave para detecção de hordas/eventos.

### 2. Ler o ClickUp — SOMENTE LEITURA

Use apenas ferramentas de **leitura** do ClickUp MCP:
`clickup_get_workspace_hierarchy`, `clickup_filter_tasks`, `clickup_get_task`, `clickup_search`.
**NUNCA** crie, edite, mova, comente ou altere tags/status. Se precisar escrever, **PARE** e
reporte — é violação de guardrail.

Space: **PROJETOS - DEG** (`90175557627`). Colete:

- Tarefas **concluídas** com `date_done` na janela da quinzena (para entregue/vazão/emblemas/
  ranking/guild/eventos).
- **Histórico completo** de concluídas desde sempre (para `xp_total` vitalício — recompute da
  fonte a cada execução; nunca persista totais para evitar drift).
- Campo `parent`/`top_level_parent` de cada tarefa (para resolver hierarquia).
- Backlog em aberto (não concluídas com tag válida) por frente (para o campo `backlog` por pessoa
  e as camadas do guild).

**Classificação:** vem das **etiquetas (tags)**, normalizadas (caixa baixa, sem acento):
frente (`operacional`/`projeto`/`análise`) + complexidade (`baixa`/`média`/`alta`).

### 3. Calcular — usando o código do FLUXO 3 (determinístico)

**NÃO calcule de cabeça.** Execute o código do FLUXO 3 da skill `produtividade-clickup-ultra`
com as tarefas coletadas, depois **estenda** o resultado para o formato RPG conforme abaixo.

#### 3a. Scoring base (FLUXO 3 — idêntico ao painel gerencial)

```python
import re
from collections import defaultdict
PONTOS = {"baixa":1,"media":3,"média":3,"alta":8}
def n(s): return (s or "").strip().lower()

def qtd_operacional(t):
    txt = f"{t.get('nome','')} {t.get('descricao','')}"
    m = re.search(r"VOL_OPERACIONAL:\s*(\d+)", txt, re.I)
    if m: return int(m.group(1))
    m = re.search(r"\((\d+)\s+estudos?\)", txt, re.I)
    if m: return int(m.group(1))
    return 1

def _e_subtarefa_sem_tag_sob_pai_tagueado(t, todas):
    """True se a tarefa é subtarefa de um pai com tag de frente válida E ela própria
    NÃO tem tag de frente → ignorada silenciosamente (detalhe do pai, não é missão).
    Se ela tem tag própria → conta como folha (e o pai não é contado em dobro)."""
    if not t.get("parent"):
        return False
    if n(t.get("frente", "")):
        return False  # tem tag própria → conta como folha
    pai = next((x for x in todas if x.get("task_id") == t.get("parent")), None)
    return pai is not None and bool(n(pai.get("frente", "")))

def _contar_tarefas_backlog(nome, frente_key, todas):
    """Nº de tarefas em aberto (não concluídas, válidas) da pessoa naquela frente."""
    alvo = {"operacional": ("operacional",), "projeto": ("projeto",),
            "analise": ("analise", "análise")}[frente_key]
    return sum(1 for t in todas
               if t.get("pessoa") == nome and n(t.get("frente")) in alvo
               and not t.get("concluida")
               and not _e_subtarefa_sem_tag_sob_pai_tagueado(t, todas))

# tarefas: lista de {"pessoa","frente","complexidade","concluida","nome","descricao",
#                    "task_id","parent","top_level_parent","date_done","url"}
# disponibilidade: {"Felipe":20, "Vinícius":20, "Juan":16}
# janela_de / janela_ate: strings YYYY-MM-DD

P = defaultdict(lambda: {"op_c":0,"op_a":0,"prj_p":0,"prj_pa":0,"prj_c":0,
                          "ana_p":0,"ana_pa":0,"ana_c":0})
T = {"op_c":0,"prj_p":0,"prj_c":0,"ana_p":0,"ana_c":0}

for t in tarefas:
    # Hierarquia: subtarefa sem tag de frente sob pai tagueado → ignorada (não é missão)
    # Subtarefa com tag própria → conta como folha (pai não conta em dobro)
    if _e_subtarefa_sem_tag_sob_pai_tagueado(t, tarefas):
        continue

    p=t.get("pessoa","—"); f=n(t.get("frente")); c=bool(t.get("concluida"))
    pts=PONTOS.get(n(t.get("complexidade")),0); r=P[p]

    if f=="operacional":
        q=qtd_operacional(t)
        if c: r["op_c"]+=q; T["op_c"]+=q
        else: r["op_a"]+=q
    elif f=="projeto":
        if c: r["prj_p"]+=pts; r["prj_c"]+=1; T["prj_p"]+=pts; T["prj_c"]+=1
        else: r["prj_pa"]+=pts
    elif f in ("análise","analise"):
        if c: r["ana_p"]+=pts; r["ana_c"]+=1; T["ana_p"]+=pts; T["ana_c"]+=1
        else: r["ana_pa"]+=pts

def rate(x,d): return round(x/d,2) if d else 0
```

> **Regra de hierarquia:** subtarefa sem tag própria sob um pai que TEM tag válida → ignorada
> silenciosamente (é detalhe de implementação do pai). Subtarefa COM tag própria → conta como
> entregável independente (folha), e o pai com filhos tagueados **não** é contado novamente.
> Tarefa sem frente que NÃO é subtarefa de pai tagueado → missão de organização.

#### 3b. Extensões RPG (calculadas sobre o resultado do FLUXO 3)

Execute este código logo após o scoring base, usando os mesmos dados:

```python
CUSTOS = {"operacional": 6, "projeto": 8, "analise": 6}
FRENTES = ["operacional", "projeto", "analise"]

# --- Carregados dos configs ---
# classes_config: dict com trilha de 12 tiers por frente (de config/classes.json)
# emblemas_catalogo: lista de emblemas com limiares (de config/emblemas.json)
# backlog_quinzena: {"operacional":{"comprometida":X,"alvo":Y,"stretch":Z}, ...}
# historico_xp: {"Felipe":{"operacional":N,...}, ...}  ← acumulado ANTES desta quinzena
#               (recomputado do ClickUp histórico completo, não persistido)
# marcadores_titulo: lista de palavras-chave para hordas

def lookup_tier(xp_total, frente, classes_config):
    trilha = classes_config[frente]["trilha"]
    for tier in reversed(trilha):
        if xp_total >= tier["de"]:
            return tier["tier"], tier["titulo"]
    return 1, trilha[0]["titulo"]

def calcular_nivel_e_resto(xp_total, custo):
    nivel = xp_total // custo
    xp_no_nivel = xp_total % custo
    xp_para_proximo = custo - xp_no_nivel
    return nivel, xp_no_nivel, xp_para_proximo

pessoas_rpg = {}
for nome, r in P.items():
    disp = disponibilidade.get(nome, 0)
    frentes_rpg = {}

    mapa = {
        "operacional": (r["op_c"], r["op_a"], r["op_c"], "itens"),
        "projeto":     (r["prj_p"], r["prj_pa"], r["prj_c"], "pontos"),
        "analise":     (r["ana_p"], r["ana_pa"], r["ana_c"], "pontos"),
    }

    for frente, (entregue_q, aberto, tarefas_q, unidade) in mapa.items():
        xp_hist = historico_xp.get(nome, {}).get(frente, 0)
        xp_total = xp_hist + entregue_q  # histórico + quinzena atual
        custo = CUSTOS[frente]
        nivel, xp_no_nivel, xp_para_proximo = calcular_nivel_e_resto(xp_total, custo)
        tier, titulo = lookup_tier(xp_total, frente, classes_config)

        frentes_rpg[frente] = {
            "classe": classes_config[frente]["nome"],
            "unidade": unidade,
            "nivel": nivel,
            "custo_por_nivel": custo,
            "xp_total": xp_total,
            "xp_no_nivel": xp_no_nivel,
            "xp_para_proximo": xp_para_proximo,
            "entregaveis_total": xp_hist + entregue_q,  # vitalício
            "entregue_quinzena": entregue_q,
            "entregaveis_quinzena": tarefas_q,
            "vazao_quinzena": rate(entregue_q, disp),
            "tier": tier,
            "titulo": titulo,
            "backlog": {"valor": aberto, "tarefas": _contar_tarefas_backlog(nome, frente, tarefas)},
        }

    pessoas_rpg[nome] = frentes_rpg

# --- Emblemas (determinísticos por limiar) ---
def calcular_emblemas(nome, frentes_rpg, emblemas_catalogo):
    ganhos = []
    for emb in emblemas_catalogo:
        f = emb["frente"]
        metrica = emb["metrica"]  # "itens" ou "pontos"
        limiar = emb["limiar"]
        valor = frentes_rpg.get(f, {}).get("entregue_quinzena", 0)
        if valor >= limiar:
            ganhos.append(emb["id"])
    return ganhos

# --- Ranking por frente (secundário/cosmético) ---
# Nunca combinar frentes. Ordenar por "valor" (entregue_quinzena); vazão como critério justo.
def calcular_ranking(pessoas_rpg, frente):
    ordem = sorted(
        [{"pessoa": n, "valor": d[frente]["entregue_quinzena"],
          "vazao": d[frente]["vazao_quinzena"]}
         for n, d in pessoas_rpg.items()],
        key=lambda x: x["valor"], reverse=True
    )
    for i, item in enumerate(ordem):
        item["pos"] = i + 1
    return ordem

# --- Guild (objetivo coletivo por frente, anti-inflação) ---
# HP/camadas vêm do backlog_quinzena.json (comprometido no planejamento).
# total_equipe = de-dup (pode ser <= soma das contribuições).
def calcular_guild(pessoas_rpg, T, backlog_quinzena, disponibilidade):
    guild = {}
    for frente in FRENTES:
        contrib = {n: d[frente]["entregue_quinzena"] for n, d in pessoas_rpg.items()}
        # de-dup: total já computado no FLUXO 3 (T) é o de-dup real
        total_dedup = T.get({"operacional":"op_c","projeto":"prj_p","analise":"ana_p"}[frente], 0)
        camadas = backlog_quinzena.get(frente, {})
        camada_atingida = None
        proxima = None
        restante = None
        for cam in ["comprometida","alvo","stretch"]:
            if total_dedup >= camadas.get(cam, float("inf")):
                camada_atingida = cam
        # próxima camada acima
        ordem_camadas = ["comprometida","alvo","stretch"]
        if camada_atingida:
            idx = ordem_camadas.index(camada_atingida)
            if idx < len(ordem_camadas)-1:
                proxima = ordem_camadas[idx+1]
                restante = camadas.get(proxima, 0) - total_dedup
        guild[frente] = {
            "unidade": "itens" if frente=="operacional" else "pontos",
            "objetivo": {"operacional":"territorio","projeto":"construcao","analise":"mapa_insights"}[frente],
            "camadas": camadas,
            "entregue_quinzena": total_dedup,
            "camada_atingida": camada_atingida,
            "proxima_camada": proxima,
            "restante_para_proxima": restante,
            "contribuicoes_quinzena": contrib,
            "total_equipe_quinzena": total_dedup,
        }
    return guild

# --- Eventos/Hordas (cosmético — por palavra-chave no título) ---
# Score vem das tags (já computado acima). Hordas são apenas uma visão agrupada.
def calcular_eventos(tarefas, marcadores_titulo):
    tarefas_horda = [t for t in tarefas
                     if any(m in t.get("nome","").lower() for m in marcadores_titulo)]
    # Agrupa por "encontro" (quinzena atual = uma horda)
    # HP = soma do sizing das tarefas do encontro
    hp = sum(PONTOS.get(n(t.get("complexidade")),1) for t in tarefas_horda
             if n(t.get("frente")) != "operacional")
    hp += sum(qtd_operacional(t) for t in tarefas_horda
              if n(t.get("frente")) == "operacional")
    return tarefas_horda, hp

# --- Missões de organização ---
# Tarefas sem frente que NÃO são subtarefas de pai tagueado, ou com frente sem sizing.
def calcular_missoes(tarefas):
    missoes = []
    for t in tarefas:
        if _e_subtarefa_sem_tag_sob_pai_tagueado(t, tarefas):
            continue  # ignorada silenciosamente, não é missão
        f = n(t.get("frente",""))
        c = n(t.get("complexidade",""))
        if not f:
            missoes.append({**t, "motivo": "falta_frente"})
        elif f in ("projeto","analise") and not c:
            missoes.append({**t, "motivo": "falta_sizing"})
    return missoes
```

### 4. Montar o `dados.json`

Preencha o schema v1.3 (ver `contrato-dados-json.md`) com os resultados calculados acima.
Campos obrigatórios por seção:

- `meta`: `schema_version` "1.3", `motor_versao` "cowork/produtividade-clickup-ultra",
  `gerado_em` (ISO 8601 com offset BRT), `quinzena`, `fonte`, `xp_base`, `custos_por_nivel`.
- `classes`: carregado direto do `config/classes.json` (não recalcular).
- `emblemas_catalogo`: carregado do `config/emblemas.json`.
- `pessoas[]`: para cada pessoa, todos os campos de `frentes{}`, `emblemas_quinzena[]`,
  `emblemas_historico[]` (acumulado; adiciona a quinzena atual se houver emblemas novos),
  `dias_disponiveis`, `afastamentos[]`.
- `ranking_quinzena`: por frente (secundário, cosmético). Nunca combinar frentes.
- `guild`: por frente — camadas do `config/backlog_quinzena.json` + entregue de-dup.
- `eventos`: lista de hordas com tarefas agrupadas por marcador de título.
- `missoes_organizacao[]`: tarefas inválidas sem XP.

**Invariantes a conferir antes de salvar:**
- Nenhum campo de XP total por pessoa somando frentes.
- Nenhum ranking que combine frentes.
- `total_equipe_quinzena` (de-dup) ≤ soma de `contribuicoes_quinzena`.
- `vazao_quinzena = round(entregue_quinzena / dias_disponiveis, 2)`.
- Emblemas de horda **não** geram XP extra (as tarefas já pontuaram na frente delas).

Se qualquer invariante falhar: **PARE** e reporte — não "conserte" o número manualmente.

### 5. Gerar o `painel.html` (gerencial)

Use o FLUXO 4 da skill `produtividade-clickup-ultra`:

1. Copie o `template-painel.html` para `painel-produtividade-<mes>-<ano>.html`.
2. Edite **somente o objeto `DADOS`** no topo do `<script>` com os números já calculados.
3. O painel e o `dados.json` são **duas renderizações do mesmo dado** — paridade por construção.
   Dois públicos, dois formatos: o JSON é para o app lúdico; o HTML é para a leitura gerencial.
4. **Não misture narrativas:** o painel usa linguagem de negócio (vazão, capacidade, backlog);
   o app usa linguagem RPG (nível, tier, guild, emblema). Os números são os mesmos.

### 6. Entregar os outputs

- Salve `dados.json` na pasta configurada (ex.: `Desktop/RPG - DEG/dados.json`).
- Salve `painel-produtividade-<mes>-<ano>.html` em `Desktop/Relatórios - Estratégia e Growth/`.
- Se o deploy para a VPS estiver configurado (Caddy + Authelia), faça o `rsync` via SSH
  (key auth) para `/srv/growth-rpg/`. O Caddy serve; o Authelia protege (só os 4).
- **Nunca exponha o `dados.json` fora do Authelia.** Nunca suba tokens/chaves no JSON.

### 7. Reportar

Resumo de 3 linhas no final:
1. Quinzena + período + âncora da reunião.
2. O que mudou: níveis/tiers subidos, emblemas novos, camada do guild atingida, hordas resolvidas.
3. **Missões de organização abertas** (tarefas a taguear) — lista para o time resolver.

---

## Guardrails (hard constraints)

- **Read-only no ClickUp.** Sem exceção. Use apenas ferramentas de leitura do MCP.
- **Determinismo:** os números vêm do código acima (mesmo motor do FLUXO 3), não da sua
  interpretação. Mesmo input → mesmo `dados.json`.
- **Nunca somar entre frentes.** Nunca criar total por pessoa nem ranking cross-frente.
- **Anti-inflação do guild:** camadas vêm do `config/backlog_quinzena.json` (comprometido,
  travado no planejamento). Nunca inflar para ter "boss gordo".
- **Hordas são cosméticas:** palavra-chave no título agrupa visualmente; nunca afeta score
  (que vem das tags).
- **Nenhum segredo no output.** `dados.json` contém só nomes + scores. Tokens/keys ficam
  em variáveis de ambiente ou secret manager, fora do JSON e fora do git.
- **Sem gate de produção sem humano:** primeira publicação na VPS (e mudanças de schema)
  passam por aprovação humana.
- Em qualquer dúvida de regra: **PARE**, explicite a suposição e peça revisão.

---

## Localização

Coloque este arquivo em `.claude/skills/growth-rpg-producer/SKILL.md` no Cowork.
Depende da skill `produtividade-clickup-ultra` (deve estar instalada junto).
Os arquivos de config (`config/*.json`) ficam em pasta dedicada, curada manualmente
— não são código, são inputs do produtor.
