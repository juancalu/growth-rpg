"""Ingestão SOMENTE-LEITURA do ClickUp (space PROJETOS - DEG).

Decisão 2026-07-09: o backend PODE ler o ClickUp; NUNCA escrever. Este cliente só
faz GET — não há um único método de escrita. O token vem de fora do código (env
CLICKUP_TOKEN ou arquivo secrets/clickup.token, gitignored) e nunca é impresso.

Uso:
    python -m scoring.ingest_clickup           # dump p/ secrets/clickup_tasks.json
    from scoring.ingest_clickup import fetch_tasks
    tarefas = fetch_tasks()                     # -> list[dict] normalizada p/ o scoring-core
"""

from __future__ import annotations

import json
import os
import time
import urllib.request
from pathlib import Path

SPACE_ID = "90175557627"  # PROJETOS - DEG (somente-leitura)
BASE = "https://api.clickup.com/api/v2"

# ids -> nome canônico. Marcos = diretor, NÃO jogável (não pontua).
NOMES = {
    "296609800": "Felipe",
    "101182135": "Vinícius",
    "101182134": "Juan",
    "101182872": "Marcos",
}
_NAO_JOGAVEL = {"Marcos"}

_ROOT = Path(__file__).resolve().parents[1]


def load_token() -> str:
    """Lê o token de env CLICKUP_TOKEN ou de secrets/clickup.token. Nunca o imprime."""
    tok = os.environ.get("CLICKUP_TOKEN")
    if tok:
        return tok.strip()
    arq = _ROOT / "secrets" / "clickup.token"
    if arq.exists():
        return arq.read_text(encoding="utf-8").strip()
    raise RuntimeError(
        "Token ausente: defina CLICKUP_TOKEN ou crie secrets/clickup.token"
    )


def _get(path: str, token: str) -> dict:
    req = urllib.request.Request(BASE + path, headers={"Authorization": token})
    with urllib.request.urlopen(req, timeout=30) as resp:  # noqa: S310 (host fixo, https)
        return json.load(resp)


def _lists(token: str, space_id: str) -> list[str]:
    ids: list[str] = []
    folders = _get(f"/space/{space_id}/folder?archived=false", token).get("folders", [])
    for folder in folders:
        ids += [lst["id"] for lst in folder.get("lists", [])]
    folderless = _get(f"/space/{space_id}/list?archived=false", token).get("lists", [])
    ids += [lst["id"] for lst in folderless]
    return ids


def _iter_list_tasks(list_id: str, token: str):
    page = 0
    while True:
        data = _get(
            f"/list/{list_id}/task?page={page}&include_closed=true&subtasks=true", token
        )
        tasks = data.get("tasks", [])
        yield from tasks
        if data.get("last_page") or not tasks:
            return
        page += 1
        time.sleep(0.15)  # respeita o rate limit (100/min)


def _normalize(task: dict) -> dict:
    assignees = []
    for a in task.get("assignees", []):
        nome = NOMES.get(str(a.get("id")), a.get("username") or f"user_{a.get('id')}")
        if nome not in _NAO_JOGAVEL:
            assignees.append(nome)
    st = task.get("status") or {}
    return {
        "id": task["id"],
        "name": task.get("name", ""),
        "status": st.get("status", ""),
        "status_type": st.get("type", ""),
        "tags": [tg.get("name", "") for tg in task.get("tags", [])],
        "assignees": assignees,
        "parent": task.get("parent"),
        "date_done": task.get("date_done"),
    }


def fetch_tasks(space_id: str = SPACE_ID, token: str | None = None) -> list[dict]:
    """Puxa todas as tarefas (read-only) e devolve normalizadas p/ o scoring-core."""
    token = token or load_token()
    seen: dict[str, dict] = {}
    for list_id in _lists(token, space_id):
        for task in _iter_list_tasks(list_id, token):
            seen[task["id"]] = _normalize(task)  # de-dup por id
    return list(seen.values())


def main() -> None:
    tarefas = fetch_tasks()
    destino = _ROOT / "secrets" / "clickup_tasks.json"  # gitignored
    destino.write_text(
        json.dumps({"tarefas": tarefas}, ensure_ascii=False, indent=1), encoding="utf-8"
    )
    concl = sum(1 for t in tarefas if (t["status_type"] == "closed"))
    print(f"{len(tarefas)} tarefas ({concl} concluídas) -> {destino.relative_to(_ROOT)}")


if __name__ == "__main__":
    main()
