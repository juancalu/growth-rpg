"""Motor de scoring determinístico (increment 1).

Regras (references/tabela-validade-e-sizing.md, §1–§4):
- Classificação vem das TAGS (frente + complexidade), normalizadas (caixa/acento/trim).
- Só tarefa `concluído` conta.
- Operacional = 1 item por tarefa (complexidade ignorada).
- Projeto/Análise = pontos de sizing (baixa 1 / média 3 / alta 8); exatamente 1 complexidade.
- Sem frente + ancestral tagueado → ignorada (não pontua, não é missão).
- Sem frente + sem ancestral tagueado → missão "falta_frente".
- ≥2 frentes → missão "frente_ambigua". Projeto/Análise sem sizing → "falta_sizing";
  com ≥2 → "sizing_ambiguo".
- Container: tarefa com descendente tagueado (frente) é guarda-chuva → não conta
  (conta-se as folhas, não o pai) e não vira missão.
- Crédito por pessoa: cada responsável recebe o valor cheio (colaborativa conta p/ os dois);
  no total de equipe cada entregável conta UMA vez (de-dup) → soma por pessoa pode exceder o total.

NÃO combina frentes: cada frente tem sua unidade (itens vs pontos), agregadas em silos.
Determinístico e idempotente: mesmo input → mesmo output.
"""

from __future__ import annotations

import unicodedata
from collections import defaultdict

FRENTES = ("operacional", "projeto", "analise")
SIZING = {"baixa": 1, "media": 3, "alta": 8}
VAL_KEY = {"operacional": "itens", "projeto": "pontos", "analise": "pontos"}


def _norm(texto: str) -> str:
    """Normaliza tag/status: minúsculo, sem acento, sem espaços nas pontas."""
    base = unicodedata.normalize("NFD", (texto or "").strip().lower())
    return "".join(c for c in base if unicodedata.category(c) != "Mn")


def _tags_norm(tarefa: dict) -> set[str]:
    return {_norm(t) for t in tarefa.get("tags", [])}


def _frentes(tarefa: dict) -> set[str]:
    return _tags_norm(tarefa) & set(FRENTES)


def _complexidades(tarefa: dict) -> set[str]:
    return _tags_norm(tarefa) & set(SIZING)


def _celula_pessoa() -> dict:
    return {
        "operacional": {"itens": 0, "entregaveis": 0},
        "projeto": {"pontos": 0, "entregaveis": 0},
        "analise": {"pontos": 0, "entregaveis": 0},
    }


def _missao(tarefa: dict, motivo: str) -> dict:
    return {
        "id": tarefa["id"],
        "nome": tarefa.get("name", ""),
        "assignee": ", ".join(tarefa.get("assignees", [])),
        "motivo": motivo,
    }


def score(tarefas: list[dict]) -> dict:
    """Recebe as tarefas cruas (read-only do ClickUp) e devolve o resultado agregado.

    Formato de cada tarefa: {id, name, status, tags[], assignees[], parent}.
    """
    index = {t["id"]: t for t in tarefas}
    filhos: dict[str, list[str]] = defaultdict(list)
    for t in tarefas:
        pai = t.get("parent")
        if pai is not None:
            filhos[pai].append(t["id"])

    def tem_descendente_tagueado(tid: str) -> bool:
        pilha = list(filhos.get(tid, []))
        while pilha:
            atual = pilha.pop()
            if _frentes(index[atual]):
                return True
            pilha.extend(filhos.get(atual, []))
        return False

    def tem_ancestral_tagueado(tarefa: dict) -> bool:
        pai_id = tarefa.get("parent")
        while pai_id is not None and pai_id in index:
            pai = index[pai_id]
            if _frentes(pai):
                return True
            pai_id = pai.get("parent")
        return False

    por_pessoa: dict[str, dict] = {}
    guild = {f: {"total": 0, "entregaveis": 0} for f in FRENTES}
    missoes: list[dict] = []

    def celula(nome: str) -> dict:
        return por_pessoa.setdefault(nome, _celula_pessoa())

    for t in tarefas:
        if _norm(t.get("status", "")) != "concluido":
            continue  # só concluído pontua
        if tem_descendente_tagueado(t["id"]):
            continue  # container: conta as folhas, não o pai

        frs = _frentes(t)
        if len(frs) == 0:
            if tem_ancestral_tagueado(t):
                continue  # subtarefa sem tag sob ancestral tagueado → ignorada
            missoes.append(_missao(t, "falta_frente"))
            continue
        if len(frs) >= 2:
            missoes.append(_missao(t, "frente_ambigua"))
            continue

        frente = next(iter(frs))
        if frente == "operacional":
            valor = 1  # complexidade ignorada
        else:
            cx = _complexidades(t)
            if len(cx) == 0:
                missoes.append(_missao(t, "falta_sizing"))
                continue
            if len(cx) >= 2:
                missoes.append(_missao(t, "sizing_ambiguo"))
                continue
            valor = SIZING[next(iter(cx))]

        guild[frente]["total"] += valor
        guild[frente]["entregaveis"] += 1
        for pessoa in t.get("assignees", []):
            cel = celula(pessoa)[frente]
            cel[VAL_KEY[frente]] += valor
            cel["entregaveis"] += 1

    missoes.sort(key=lambda m: m["id"])
    return {"por_pessoa": por_pessoa, "guild": guild, "missoes": missoes}
