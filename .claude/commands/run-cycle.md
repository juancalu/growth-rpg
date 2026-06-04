# /run-cycle — Orquestrador autônomo (Growth RPG, ralph loop)

Roda 100% autônomo, dentro de container isolado, com permissões puladas. SEM intervenção humana
no loop. Carregue SEMPRE a skill `metodologia-guardrails-deg-rpg`. Tarefa: $ARGUMENTS

## 0. Pré-condições (container)
Você está num container isolado: escreve só no repo, sem credencial de produção, ClickUp read-only
(ou fixtures locais), sem acesso à VPS. NUNCA tente deploy, push para main, nem escrita no ClickUp.

## 1. Contexto
Leia `CLAUDE.md`, `tasks/current_task.md`, `tasks/backlog.md` e a skill de guardrails. Pegue o
**próximo bloco** `### BLK-*` ainda não concluído (ordem do backlog). Um bloco por vez.

## 2. Criticidade
- **Normal:** doc/scaffolding/ajuste localizado → Planner → Builder → QA.
- **CRÍTICA** (toca `contract/validate.py`, `config/schema/dados.schema.json`, `config/*.json`,
  ou a regra "não somar entre frentes"): mesma esteira, **com QA reforçado** (no-bypass + invariantes).
  Não há gate humano no loop — a rede é o teste + no-bypass + o limite do container.
  (Lembrete: o repo **não recalcula scoring** — o motor é o cowork. O loop constrói app/validador/deploy.)

## 3. Esteira (sem gate humano)
- **Planner** (`prompts/planner.md`): delimita o bloco e faz o plano (arquivo/função/mudança). Escreve `context/handoff.md`.
- **Builder** (`prompts/builder.md`): implementa SÓ o escopo do handoff. Roda `ruff check .`, `pytest -q`
  (inclui `test_contract` quando tocar o contrato). Registra resultado no handoff.
- **QA** (`prompts/qa.md`): RE-roda tudo por conta própria (sem aceitar log alheio). Rejeita verde por
  atalho (mock do caminho crítico, config vazia). Confere invariantes: sem soma entre frentes;
  schema válido; **o golden passa no validador de contrato** (`tests/test_contract.py`). Emite veredito.

## 4. Fechamento (automático)
Fecha o bloco SÓ com tudo verde:
- `tasks/current_task.md` → status final; mover o bloco para `tasks/completed.md` (acrescentar, nunca sobrescrever).
- **Commit por path** (`git add <paths-do-bloco> context/handoff.md`), mensagem com o ID. NUNCA `git add -A`.
- Se o QA reprova: cria bloco de correção no `tasks/backlog.md` e o loop **continua** para corrigir (não pede humano).

## 5. Parada
Quando todos os blocos estão em `completed.md` e a suite verde → crie `LOOP_DONE` na raiz.
Anti-loop: se o MESMO erro persistir após 3 tentativas, PARE e escreva `RELATORIO-BLOQUEIO.md`
(o que tentou, por que falhou) — não insista nem invente bypass.

## Guardrails (a rede, já que não há humano no loop)
- Critérios de aceite = gate. Nada avança com teste vermelho.
- **NO-BYPASS:** nunca contornar validação para "ficar verde". Verde por atalho = não-executado.
- NUNCA escrever no ClickUp; NUNCA tocar VPS/produção; NUNCA merge na main / push / deploy.
- Nunca relaxar as regras da skill de guardrails "para simplificar". Commit por path; rollback não-destrutivo.
- Toda suposição relevante: registrar no handoff (o humano revisa o branch depois, fora do loop).