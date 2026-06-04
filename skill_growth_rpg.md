---
name: growth-rpg-producer
description: >-
  Produtor de dados do "Growth RPG" (gamificação interna DEG). Use nas execuções RECORRENTES
  que geram o estado do jogo — lê o ClickUp (PROJETOS - DEG) somente-leitura via MCP,
  aplica as regras de scoring DENTRO do cowork (mesmo motor da skill produtividade-clickup-ultra),
  e emite o dados.json (diário) e o painel.html (só no fechamento quinzenal). Acione quando
  a tarefa for "gerar/atualizar o RPG", "rodar o produtor", "atualizar dados.json", o refresh
  diário, ou o fechamento da quinzena (reunião com o diretor). NÃO recalcule números à mão —
  o cálculo é feito pelo código embutido nesta skill. Carregue SEMPRE junto à skill
  `produtividade-clickup-ultra` (fonte canônica das regras de scoring).
---

# Growth RPG — Skill Produtora (cowork)

> **Esta é a cópia de referência versionada no repo.** A skill viva roda no **cowork**
> (`.claude/skills/growth-rpg-producer/SKILL.md`). O repo só **valida o contrato e apresenta** —
> o motor de scoring não é código do repo; ele vive aqui como documentação executável do que o
> cowork faz, para auditoria e paridade.

Você é o **produtor** do Growth RPG. Seu trabalho é, de forma **determinística e somente-leitura**,
transformar o estado do ClickUp no `dados.json` que o app web consome, e — apenas no fechamento
quinzenal — no `painel.html` para leitura gerencial.

Você **calcula tudo aqui dentro**, usando o mesmo motor de scoring da skill
`produtividade-clickup-ultra`. **Não há script Python externo; o cowork é o motor.**

> **Pré-requisito obrigatório:** carregue a skill **`produtividade-clickup-ultra`** antes de
> qualquer passo. Em conflito entre as duas skills, `produtividade-clickup-ultra` vence nos
> fundamentos de scoring; esta skill vence nas mecânicas RPG (tier/título/emblema/guild/eventos).

O `dados.json` precisa **passar em `contract/validate.py`** do repo (schema + invariantes). Se não
passar, há um bug — **PARE e reporte**, não force o número.

---

## Cadência

| Execução | O que gera | Quando |
|---|---|---|
| **Diária** | `dados.json` atualizado | Todo dia (manualmente ou agendado) |
| **Quinzenal** | `dados.json` + `painel.html` + atualiza histórico | Na quinta de fechamento: 18/06, 02/07, 16/07, 30/07… |

No fechamento quinzenal, `config/backlog_quinzena.json` e `config/disponibilidade.json` já devem
estar atualizados com a quinzena que se encerra — travados no planejamento, **antes** da reunião.

---

## Caminhos de arquivo (padronizados — a pasta do projeto é a fonte do app)

```
PROJETO    = C:\Users\Felipe Silva\Desktop\Growth RPG\
CONFIG_DIR = C:\Users\Felipe Silva\Desktop\Growth RPG\config\
OUTPUT     = C:\Users\Felipe Silva\Desktop\Growth RPG\dados.json     (o app lê DAQUI; deploy.sh envia DAQUI)
HISTORICO  = C:\Users\Felipe Silva\Desktop\Growth RPG\historico\
PAINEL_DIR = C:\Users\Felipe Silva\Desktop\Relatórios - Estratégia e Growth\   (só o painel.html vai aqui)
```

Arquivos em `CONFIG_DIR` (curados manualmente, não são código):
- `classes.json` — `{frente: {nome, tema, trilha:[12 tiers com de/ate em NÍVEL, titulo]}}`.
- `emblemas.json` — `{"_nota", "lista":[{id, nome, frente, metrica, limiar}]}`.
- `disponibilidade.json` — **indexado por label da quinzena**: `{label: {pessoa: {dias_disponiveis, afastamentos:[]}}}`.
- `backlog_quinzena.json` — **indexado por label da quinzena**: `{label: {frente: {camadas: {comprometida, alvo, stretch}}}}`.
- `marcadores_titulo.json` — lista de strings (ex.: `["fix","bug","corrigir",...]`).
- `schema/dados.schema.json` — JSON Schema do contrato v1.3 (validação).

Histórico (lido; escrito só no fechamento):
- `historico/acumulado.json` — acumulado **antes** da quinzena atual, por pessoa/frente, com **dois**
  contadores: `{"Felipe": {"operacional": {"xp": 0, "entregaveis": 0}, "projeto": {"xp": 168, "entregaveis": 66}, ...}, ...}`.
  Se ausente, assuma zeros (primeira execução, baseline zero) e registre no relatório.

---

## Passo a passo

### 1. Carregar contexto

- Carregue a skill `produtividade-clickup-ultra`.
- Leia todos os arquivos de `CONFIG_DIR`.
- Leia `historico/acumulado.json` (se ausente → `{}`, zeros implícitos).
- Leia o `dados.json` anterior, se existir, **só** para recuperar `emblemas_historico` por pessoa
  (acumula entre quinzenas e nunca é apagado).
- **Selecione a quinzena corrente AUTOMATICAMENTE pela data de hoje** (não preencha à mão). A
  quinzena atual é a entrada de `backlog_quinzena.json` cuja `janela` `{de, ate}` contém hoje
  (ignore chaves iniciadas por `_`). Daí saem `QUINZENA_LABEL` e `janela.de/ate/ancora`:

```python
from datetime import date
hoje = date.today().isoformat()          # ex.: "2026-06-04" (BRT)

QUINZENA_LABEL = QUINZENA_DE = QUINZENA_ATE = QUINZENA_ANCORA = None
for label, bloco in backlog_quinzena_json.items():
    if label.startswith("_"):            # _nota e afins não são quinzenas
        continue
    j = bloco["janela"]
    if j["de"] <= hoje <= j["ate"]:
        QUINZENA_LABEL, QUINZENA_DE, QUINZENA_ATE, QUINZENA_ANCORA = label, j["de"], j["ate"], j["ancora"]
        break

if QUINZENA_LABEL is None:
    # Nenhuma janela contém hoje → quinzena não planejada. NÃO invente datas/camadas.
    PARE("Quinzena atual não planejada. Adicione o bloco em backlog_quinzena.json e "
         "disponibilidade.json (ver config/_TEMPLATE_quinzena.md) e rode de novo.")

# Modo: no dia do fechamento (hoje == janela.ate) gera painel + atualiza histórico
MODO = "quinzenal" if hoje == QUINZENA_ATE else "diario"
```

- O **mesmo label** tem que existir em `disponibilidade.json`. Abrir uma quinzena nova = adicionar
  um bloco nos dois configs (ver `config/_TEMPLATE_quinzena.md`) — **o prompt do scheduler nunca muda**.

### 2. Ler o ClickUp — SOMENTE LEITURA

Use apenas ferramentas de leitura do MCP ClickUp:
`clickup_get_workspace_hierarchy`, `clickup_filter_tasks`, `clickup_get_task`, `clickup_search`.

**NUNCA** crie, edite, mova, comente ou altere tags/status. Se qualquer escrita for necessária,
**PARE imediatamente** e reporte — é violação de guardrail.

**Space:** PROJETOS - DEG (`90175557627`).

Colete três conjuntos (cada tarefa com `tags`, `status`, `date_done`, **`assignees` (todos)**,
`parent`, `top_level_parent`, `description`, `name`, `id`, `url`):

- **(a) Concluídas na janela:** status `concluído` (closed) com `date_done ∈ [QUINZENA_DE, QUINZENA_ATE]`.
- **(b) Abertas com tag de frente:** status ≠ concluído, com ≥1 tag de frente (para backlog/guild).
- **(c) Concluídas fora da janela (opcional):** só para conferência com o histórico; **não entram no
  scoring da quinzena**. Pode pular no modo diário.

Monte a lista `tarefas` em que cada item tem este formato normalizado:

```python
{
  "task_id": ..., "nome": ..., "descricao": ..., "url": ...,
  "assignees": [...],            # nomes de JOGADORES (Marcos e outros são filtrados fora)
  "frentes_tags": [...],         # todas as tags de frente normalizadas: subset de operacional/projeto/analise
  "complexidades_tags": [...],   # todas as tags de sizing normalizadas: subset de baixa/media/alta
  "concluida": bool,             # status closed/concluído
  "date_done": "YYYY-MM-DD" | None,
  "na_janela": bool,             # date_done ∈ [QUINZENA_DE, QUINZENA_ATE]
  "parent": ... | None,
  "top_level_parent": ... | None,
}
```

Mapeamento de assignee → nome (jogadores): `296609800`→Felipe, `101182134`→Juan, `101182135`→Vinícius.
Normalize tags para caixa baixa sem acento (`análise`→`analise`, `média`→`media`). **Preserve as listas
completas de tags** (frente e sizing) — a ambiguidade (≥2) é tratada no §3, não jogada fora aqui.

---

### 3. Calcular — execute o código, não interprete

#### 3a. Constantes e auxiliares

```python
import re, json
from collections import defaultdict
from datetime import datetime

PONTOS  = {"baixa": 1, "media": 3, "alta": 8}
CUSTOS  = {"operacional": 6, "projeto": 8, "analise": 6}
FRENTES = ["operacional", "projeto", "analise"]
UNIDADE = {"operacional": "itens", "projeto": "pontos", "analise": "pontos"}
OBJETIVO = {"operacional": "territorio", "projeto": "construcao", "analise": "mapa_insights"}

JOGADORES   = {296609800: "Felipe", 101182134: "Juan", 101182135: "Vinicius"}
ID_POR_NOME = {v: k for k, v in JOGADORES.items()}
NOMES       = sorted(JOGADORES.values())   # ordem estável: Felipe, Juan, Vinicius

def qtd_operacional(t):
    """Itens de uma tarefa operacional. Prioridade: [VOL_OPERACIONAL: N] na descrição,
    depois (N estudos) no nome, senão 1."""
    txt = f"{t.get('nome','')} {t.get('descricao','')}"
    m = re.search(r"VOL_OPERACIONAL:\s*(\d+)", txt, re.I) or re.search(r"\((\d+)\s+estudos?\)", txt, re.I)
    return int(m.group(1)) if m else 1

def frente_unica(t):
    """Retorna a frente se houver EXATAMENTE uma; senão None."""
    fr = t["frentes_tags"]
    return fr[0] if len(fr) == 1 else None

def validade(t):
    """'valida' ou o motivo de invalidade (determinístico). Sizing só importa em projeto/analise."""
    fr, cx = t["frentes_tags"], t["complexidades_tags"]
    if len(fr) == 0:  return "falta_frente"
    if len(fr) >= 2:  return "frente_ambigua"
    if fr[0] in ("projeto", "analise"):
        if len(cx) == 0: return "falta_sizing"
        if len(cx) >= 2: return "sizing_ambiguo"
    return "valida"

def _subtarefa_sem_tag_sob_pai_tagueado(t, todas):
    """Subtarefa sem tag própria sob pai tagueado → ignorada (não pontua, NÃO é missão)."""
    if not t.get("parent") or t["frentes_tags"]:
        return False
    pai = next((x for x in todas if x["task_id"] == t["parent"]), None)
    return pai is not None and bool(pai["frentes_tags"])

def _guarda_chuva_com_filhos_tagueados(t, todas):
    """Pai tagueado cujos filhos também são tagueados → conta as FOLHAS, não o pai (sem dobra)."""
    if not t["frentes_tags"]:
        return False
    return any(c.get("parent") == t["task_id"] and c["frentes_tags"] for c in todas)

def pontua_na_quinzena(t, todas):
    """True se a tarefa concluída deve gerar entrega NA QUINZENA."""
    return (
        t["concluida"] and t["na_janela"] and validade(t) == "valida"
        and not _subtarefa_sem_tag_sob_pai_tagueado(t, todas)
        and not _guarda_chuva_com_filhos_tagueados(t, todas)
    )

def valor_da_tarefa(t, frente):
    """Valor na unidade da frente: itens (op) ou pontos de sizing (prj/ana)."""
    if frente == "operacional":
        return qtd_operacional(t)
    return PONTOS.get(t["complexidades_tags"][0], 0)

def rate(x, d):
    return round(x / d, 2) if d else 0

def lookup_tier(nivel, frente, classes_config):
    """Tier/título dependem SÓ do NÍVEL daquela frente (de/ate são faixas de nível)."""
    for tier in reversed(classes_config[frente]["trilha"]):
        if nivel >= tier["de"]:
            return tier["tier"], tier["titulo"]
    t0 = classes_config[frente]["trilha"][0]
    return t0["tier"], t0["titulo"]

def nivel_e_resto(xp_total, custo):
    nivel = xp_total // custo
    return nivel, xp_total % custo, custo - (xp_total % custo)
```

#### 3b. Scoring — por pessoa (crédito colaborativo) e total de equipe (de-dup)

```python
# Acumuladores por pessoa/frente: valor (itens/pontos) e qtd (nº de tarefas)
P = {nome: {f: {"valor": 0, "qtd": 0, "bk_valor": 0, "bk_tarefas": 0} for f in FRENTES} for nome in NOMES}
# Total de equipe por frente (DE-DUP: cada tarefa conta UMA vez)
T = {f: 0 for f in FRENTES}

for t in tarefas:
    fr = frente_unica(t)

    # --- Entrega da quinzena (concluída, válida, na janela) ---
    if pontua_na_quinzena(t, tarefas):
        v = valor_da_tarefa(t, fr)
        T[fr] += v                                   # total de equipe: UMA vez
        for nome in t["assignees"]:                  # crédito individual: CADA responsável
            if nome in P:
                P[nome][fr]["valor"] += v
                P[nome][fr]["qtd"]   += 1

    # --- Backlog (abertas, com frente; ignora subtarefa-sem-tag sob pai tagueado) ---
    elif (not t["concluida"]) and fr and not _subtarefa_sem_tag_sob_pai_tagueado(t, tarefas):
        v = valor_da_tarefa(t, fr)
        for nome in t["assignees"]:
            if nome in P:
                P[nome][fr]["bk_valor"]   += v
                P[nome][fr]["bk_tarefas"] += 1
```

> **Regras de hierarquia (resumo):**
> - Subtarefa sem tag própria, pai tagueado → ignorada (não missão).
> - Pai tagueado com filhos tagueados → conta as folhas, **não** o pai (sem dobra).
> - Tarefa concluída sem frente e sem pai tagueado → missão (`falta_frente`).

#### 3c. Extensões RPG (nível, tier, título, emblemas, ranking, guild, eventos, missões)

```python
# historico_acum: {nome: {frente: {"xp": int, "entregaveis": int}}}  (lido do §1; {} se ausente)
# disp_q   = disponibilidade_json.get(QUINZENA_LABEL, {})
# backlog_q = backlog_quinzena_json.get(QUINZENA_LABEL, {})
# classes_config, emblemas_json (objeto {_nota, lista}), marcadores_titulo (lista)
# historico_emblemas: {nome: [{quinzena, ids}]}  (do dados.json anterior; {} se ausente)

def hist(nome, frente, chave):
    return historico_acum.get(nome, {}).get(frente, {}).get(chave, 0)

# --- Pessoas ---
pessoas_rpg = {}
for nome in NOMES:
    pdata = disp_q.get(nome, {})
    dias  = pdata.get("dias_disponiveis", 0)
    frentes_rpg = {}
    for frente in FRENTES:
        acc = P[nome][frente]
        valor_q = acc["valor"]                                   # entregue na unidade da frente
        # entregáveis: itens (op) OU nº de tarefas (prj/ana)
        entregaveis_q = valor_q if frente == "operacional" else acc["qtd"]

        xp_total = hist(nome, frente, "xp") + valor_q
        entregaveis_total = hist(nome, frente, "entregaveis") + entregaveis_q
        custo = CUSTOS[frente]
        nivel, xp_no_nivel, xp_para_proximo = nivel_e_resto(xp_total, custo)
        tier, titulo = lookup_tier(nivel, frente, classes_config)

        frentes_rpg[frente] = {
            "classe":               classes_config[frente]["nome"],
            "unidade":              UNIDADE[frente],
            "nivel":                nivel,
            "custo_por_nivel":      custo,
            "xp_total":             xp_total,
            "xp_no_nivel":          xp_no_nivel,
            "xp_para_proximo":      xp_para_proximo,
            "entregaveis_total":    entregaveis_total,
            "entregue_quinzena":    valor_q,
            "entregaveis_quinzena": entregaveis_q,
            "vazao_quinzena":       rate(valor_q, dias),
            "tier":                 tier,
            "titulo":               titulo,
            "backlog": {"valor": acc["bk_valor"], "tarefas": acc["bk_tarefas"]},
        }
    pessoas_rpg[nome] = frentes_rpg

# --- Emblemas por pessoa (determinístico por limiar na quinzena) ---
emblemas_lista = emblemas_json["lista"]
def emblemas_de(nome):
    fr = pessoas_rpg[nome]
    return [e["id"] for e in emblemas_lista
            if fr.get(e["frente"], {}).get("entregue_quinzena", 0) >= e["limiar"]]
emblemas_por_pessoa = {nome: emblemas_de(nome) for nome in NOMES}

# --- Ranking por frente (secundário/cosmético; NUNCA combina frentes) ---
def ranking_de(frente):
    ordem = sorted(
        ({"pessoa": nome,
          "valor":  pessoas_rpg[nome][frente]["entregue_quinzena"],
          "vazao":  pessoas_rpg[nome][frente]["vazao_quinzena"]} for nome in NOMES),
        key=lambda x: x["valor"], reverse=True)
    for i, item in enumerate(ordem):
        item["pos"] = i + 1
    return {"unidade": UNIDADE[frente],
            "ordem": [{"pos": x["pos"], **{k: x[k] for k in ("pessoa", "valor", "vazao")}} for x in ordem]}
ranking_quinzena = {f: ranking_de(f) for f in FRENTES}

# --- Guild (objetivo coletivo por frente; de-dup; anti-inflação) ---
def camada_status(total, camadas):
    ordem = ["comprometida", "alvo", "stretch"]
    atingida = None
    for cam in ordem:
        if cam in camadas and total >= camadas[cam]:
            atingida = cam
    if atingida == "stretch":
        return atingida, None, None
    prox = "comprometida" if atingida is None else ordem[ordem.index(atingida) + 1]
    return atingida, prox, max(camadas.get(prox, 0) - total, 0)

guild = {}
for frente in FRENTES:
    camadas = backlog_q.get(frente, {}).get("camadas", {})
    total   = T[frente]
    contrib = {nome: pessoas_rpg[nome][frente]["entregue_quinzena"] for nome in NOMES}
    atingida, proxima, restante = camada_status(total, camadas)
    guild[frente] = {
        "unidade":                UNIDADE[frente],
        "objetivo":               OBJETIVO[frente],
        "camadas":                camadas,
        "entregue_quinzena":      total,
        "camada_atingida":        atingida,
        "proxima_camada":         proxima,
        "restante_para_proxima":  restante,
        "contribuicoes_quinzena": contrib,
        "total_equipe_quinzena":  total,     # de-dup: <= soma das contribuições
    }

# --- Eventos / Hordas (cosmético; score vem das tags) ---
def slug(s):
    return re.sub(r"[^a-z0-9]+", "_", s.lower()).strip("_")

tarefas_horda = [t for t in tarefas
                 if any(m in t.get("nome", "").lower() for m in marcadores_titulo)
                 and pontua_na_quinzena(t, tarefas)]
eventos_lista = []
if tarefas_horda:
    contrib_h = defaultdict(int)
    hp = 0
    itens_t = []
    for t in tarefas_horda:
        fr = frente_unica(t)
        v = valor_da_tarefa(t, fr)
        hp += v
        for nome in t["assignees"]:
            if nome in P:
                contrib_h[nome] += v
        itens_t.append({"task_id": t["task_id"], "nome": t["nome"],
                        "assignee": (t["assignees"][0] if t["assignees"] else None),
                        "complexidade": (t["complexidades_tags"][0] if t["complexidades_tags"] else None),
                        "pontos": v, "concluida": t["concluida"], "url": t["url"]})
    eventos_lista.append({
        "id": f"horda_bugs_{slug(QUINZENA_LABEL)}", "nome": "Horda de Bugs",
        "frente": "projeto", "unidade": "pontos", "hp": hp, "restante": 0,
        "concluido": True, "contribuicoes_quinzena": dict(contrib_h), "tarefas": itens_t,
    })

# --- Missões de organização (SÓ concluídas inválidas) ---
MOTIVOS = {"falta_frente", "frente_ambigua", "falta_sizing", "sizing_ambiguo"}
missoes = []
for t in tarefas:
    if not t["concluida"] or not t["na_janela"]:
        continue
    if _subtarefa_sem_tag_sob_pai_tagueado(t, tarefas):
        continue
    motivo = validade(t)
    if motivo in MOTIVOS:
        missoes.append({"task_id": t["task_id"], "nome": t["nome"],
                        "assignee": (t["assignees"][0] if t["assignees"] else None),
                        "motivo": motivo, "url": t["url"]})
```

---

### 4. Verificar invariantes antes de montar o JSON

Se **qualquer uma falhar: PARE** e reporte — não ajuste número.

```python
for nome in NOMES:
    dias = disp_q.get(nome, {}).get("dias_disponiveis", 0)
    for f, fd in pessoas_rpg[nome].items():
        assert fd["xp_para_proximo"] > 0, f"xp_para_proximo zerado: {nome}/{f}"
        esperado = rate(fd["entregue_quinzena"], dias)
        assert abs(fd["vazao_quinzena"] - esperado) <= 0.01, f"vazão {nome}/{f}: {fd['vazao_quinzena']} != {esperado}"

for f, g in guild.items():
    soma = sum(g["contribuicoes_quinzena"].values())
    assert g["total_equipe_quinzena"] <= soma, f"guild {f}: total {g['total_equipe_quinzena']} > soma {soma}"
    assert set(g["camadas"]) >= {"comprometida", "alvo", "stretch"}, f"guild {f}: camadas incompletas (config?)"

print("✓ Invariantes OK.")
```

---

### 5. Montar e salvar o `dados.json`

```python
def historico_emblemas_atualizado(nome):
    hist_list = list(historico_emblemas.get(nome, []))
    labels = {e["quinzena"] for e in hist_list}
    if emblemas_por_pessoa[nome] and QUINZENA_LABEL not in labels:
        hist_list.append({"quinzena": QUINZENA_LABEL, "ids": emblemas_por_pessoa[nome]})
    return hist_list

dados = {
    "meta": {
        "schema_version": "1.3",
        "motor_versao":   "cowork/produtividade-clickup-ultra",
        "gerado_em":      datetime.now().astimezone().isoformat(),
        "fonte":          "ClickUp PROJETOS-DEG (read-only) via cowork",
        "quinzena": {"label": QUINZENA_LABEL, "de": QUINZENA_DE, "ate": QUINZENA_ATE,
                     "ancora": QUINZENA_ANCORA,
                     "cadencia": "quinzenal — quintas: 18/06, 02/07, 16/07, 30/07..."},
        "xp_base": {"operacional_por_item": 1, "projeto_por_ponto": 1, "analise_por_ponto": 1},
        "custos_por_nivel": {"operacional": 6, "projeto": 8, "analise": 6},
    },
    "classes": classes_config,
    "emblemas_catalogo": emblemas_json,          # objeto {_nota, lista} — como no golden
    "pessoas": [
        {
            "id":                 ID_POR_NOME[nome],
            "nome":               nome,
            "jogavel":            True,
            "dias_disponiveis":   disp_q.get(nome, {}).get("dias_disponiveis", 0),
            "afastamentos":       disp_q.get(nome, {}).get("afastamentos", []),
            "frentes":            pessoas_rpg[nome],
            "emblemas_quinzena":  emblemas_por_pessoa[nome],
            "emblemas_historico": historico_emblemas_atualizado(nome),
            "prestigio":          {"badges": []},
        }
        for nome in NOMES
    ],
    "ranking_quinzena": ranking_quinzena,
    "guild": guild,
    "eventos": {"marcadores_titulo": marcadores_titulo, "lista": eventos_lista},
    "missoes_organizacao": missoes,
}

OUTPUT    = r"C:\Users\Felipe Silva\Desktop\Growth RPG\dados.json"
SNAPSHOT  = rf"C:\Users\Felipe Silva\Desktop\Growth RPG\historico\dados_{datetime.now().strftime('%Y%m%d')}.json"
for caminho in (OUTPUT, SNAPSHOT):
    with open(caminho, "w", encoding="utf-8") as f:
        json.dump(dados, f, ensure_ascii=False, indent=2)
print(f"✓ dados.json salvo em {OUTPUT}")
print(f"✓ snapshot salvo em {SNAPSHOT}")
```

> **Valide imediatamente** (mesmo motor do repo). Se houver erro, **PARE**:
> `python -c "from contract.validate import validar_arquivo; print(validar_arquivo(r'C:\Users\Felipe Silva\Desktop\Growth RPG\dados.json'))"`
> Saída esperada: `[]` (lista vazia = válido).

---

### 6. Gerar o `painel.html` — **só no fechamento quinzenal**

Se `MODO == "diario"`, pule. No fechamento, use o FLUXO 4 da `produtividade-clickup-ultra`:

1. Copie `template-painel.html` para
   `…\Relatórios - Estratégia e Growth\painel-produtividade-<mes>-<ano>.html`.
2. Edite **somente o objeto `DADOS`** no topo do `<script>` com os valores de `dados.json`.
3. **Não toque** em CSS, layout, render nem gráficos.
4. Mesmos números, dois públicos: JSON = app lúdico (nível/tier/guild/emblema); HTML = gerencial
   (vazão/capacidade/backlog). **Não misture as linguagens.**

---

### 7. Atualizar `historico/acumulado.json` — **só no fechamento quinzenal**

Ao fechar, o `xp_total` e o `entregaveis_total` de cada pessoa/frente viram o novo acumulado:

```python
novo_acumulado = {
    nome: {f: {"xp": pessoas_rpg[nome][f]["xp_total"],
               "entregaveis": pessoas_rpg[nome][f]["entregaveis_total"]}
           for f in FRENTES}
    for nome in NOMES
}
ACUM = r"C:\Users\Felipe Silva\Desktop\Growth RPG\historico\acumulado.json"
with open(ACUM, "w", encoding="utf-8") as f:
    json.dump(novo_acumulado, f, ensure_ascii=False, indent=2)
print(f"✓ acumulado.json atualizado em {ACUM}")
```

> Como o acumulado já inclui a quinzena fechada, a **próxima** execução parte dele e a janela
> seguinte conta só as novas entregas — sem dupla contagem.

---

### 8. Reportar

Sempre ao final, três seções:

**1. Quinzena** — `<label> | <de> → <ate> | próxima reunião: <ancora>` (+ "baseline zero" se 1ª execução).

**2. Destaques** — níveis/tiers subidos por pessoa; emblemas da quinzena; camada do guild por frente;
hordas concluídas.

**3. Missões de organização** — lista (`nome`, `assignee`, `motivo`). Se vazia:
"✓ Nenhuma missão aberta — todas as concluídas têm tags válidas."

---

## Guardrails (hard constraints — sem exceção)

- **Read-only no ClickUp.** Só ferramentas de leitura. Precisou escrever? **PARE** e reporte.
- **Determinismo.** Os números vêm do código; mesmo input → mesmo `dados.json` (exceto `gerado_em`).
- **NUNCA somar entre frentes.** Sem XP total por pessoa, sem ranking cross-frente.
- **Crédito colaborativo + de-dup:** indivíduos creditam cada assignee; o **total da guild** conta a
  tarefa uma vez (`total_equipe ≤ soma das contribuições`).
- **Janela da quinzena:** só `date_done ∈ [de, ate]` pontua. Histórico fica no `acumulado.json`.
- **Hierarquia:** subtarefa sem tag sob pai tagueado = ignorada; guarda-chuva tagueado com filhos
  tagueados = conta as folhas (sem dobra).
- **Ambiguidade = inválida:** ≥2 frentes (`frente_ambigua`) ou ≥2 sizings (`sizing_ambiguo`) não
  pontuam — viram missão.
- **Anti-inflação do guild.** Camadas vêm do `backlog_quinzena.json` travado. Nunca inflar.
- **Hordas são cosméticas.** Palavra-chave no título só agrupa; o score vem das tags.
- **Nenhum segredo no output.** `dados.json` só tem nomes + scores. Tokens em variáveis de ambiente.
- **Valide antes de publicar.** `contract/validate.py` tem que retornar `[]`. Falhou? **PARE.**
- **Sem deploy à VPS sem humano.** O `rsync` é passo manual do Felipe, fora desta skill.
- **Dúvida de regra? PARE.** Explicite a suposição e peça revisão — não decida sozinho.

---

## Localização

Instale em: `.claude/skills/growth-rpg-producer/SKILL.md` (no Cowork).
Depende de: skill `produtividade-clickup-ultra` (mesmo Cowork).
Configs e saída em: `C:\Users\Felipe Silva\Desktop\Growth RPG\` (o app/`deploy.sh` leem daqui).
