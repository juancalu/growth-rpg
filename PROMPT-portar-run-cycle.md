# PROMPT — Portar a orquestração `/run-cycle` para este projeto

> **Como usar:** cole TODO o conteúdo abaixo (a partir de "INÍCIO DO PROMPT") como a
> primeira mensagem para o Claude Code rodando **no outro projeto**. Ele foi escrito para
> ser autossuficiente: o agente alvo não precisa de acesso ao projeto de origem.
> Este arquivo cabeçalho (estas 6 linhas) **não** faz parte do prompt — copie a partir da linha "INÍCIO DO PROMPT".

---

## INÍCIO DO PROMPT

Você é um engenheiro sênior. Sua tarefa é **implantar neste projeto uma orquestração
autônoma de ciclo de desenvolvimento chamada `/run-cycle`**, portada de outro repositório
(que roda Claude Code, stack Python) e **adaptada ao contexto deste projeto**. Este projeto
tem uma arquitetura de agentes antiga que será substituída por esta esteira.

O `/run-cycle` é um slash command do Claude Code que age como **orquestrador**: ele classifica
a tarefa por criticidade e dispara **sub-agentes especializados com contexto isolado** (via a
ferramenta `Agent`) numa esteira — Block Orchestrator → Planner → Builder → QA — com **gate de
aprovação humana** para tarefas de alto risco, **handoffs versionados append-only**, **commit
isolado por branch/ciclo** e **fechamento controlado** (mover bloco concluído do backlog para
completed, rollback não-destrutivo).

Você vai recriar todos os arquivos dessa orquestração, **genéricos onde o original era específico
do domínio do outro projeto**, substituindo os pontos de domínio pelos **deste** projeto, que você
descobrirá lendo os canônicos locais.

---

### FASE 0 — Descoberta e inventário (NÃO escreva nada ainda)

1. Leia, na íntegra, os canônicos deste projeto e liste-os de volta para mim com 1 linha de resumo cada:
   - `CLAUDE.md` (se não existir, anote — você proporá criar um).
   - `PRD.md` (provavelmente **desatualizado** — anote a versão/data e o que está obsoleto).
   - `README.md`.
   - Qualquer doc de contexto em `docs/` (inclusive arquivos **Word `.docx`**: leia-os; se não
     conseguir extrair texto de `.docx`, peça-me para exportar para `.md`/`.txt` e PARE até receber).
   - `.claude/commands/` existente, `prompts/` existente, e qualquer arquitetura de agentes antiga
     já presente (para saber o que será aposentado/migrado).

2. Detecte a stack real: confirme Python, gerenciador (pip/poetry/uv), e **o comando de teste real**
   (ex.: `pytest -q`, `python -m pytest`, caminho de testes). Rode `--version`/`--collect-only` se
   preciso para confirmar que funciona. NÃO invente o comando — descubra-o.

3. **Monte o "Mapa de Adaptação"** — uma tabela curta que liga cada conceito genérico da orquestração
   ao equivalente DESTE projeto. Preencha lendo os canônicos:

   | Conceito genérico (placeholder) | Equivalente NESTE projeto (você preenche) |
   |---|---|
   | `{{ARTEFATOS_CRITICOS}}` = saídas/valores que NÃO podem mudar sem aprovação | ex.: fórmula X, schema Y, modelo Z, contrato de API… |
   | `{{PARAMETROS_CANONICOS}}` = constantes imutáveis sem decisão registrada | ex.: thresholds, versões, chaves de config |
   | `{{GUARDRAILS_DOMINIO}}` = regras invioláveis específicas do projeto | copie da seção de guardrails do CLAUDE.md local |
   | `{{COMANDO_VALIDACAO}}` = o que Builder/QA rodam para provar a entrega | ex.: `pytest -q`, lint, build, smoke import |
   | `{{GATILHO_CRITICIDADE_CRITICA}}` = o que torna uma tarefa "Crítica" | ex.: tocar nos artefatos críticos acima |
   | `{{ARQUIVO_PRODUTO}}` = onde ficam as regras de produto que o Planner consulta | ex.: `PRD.md`, `docs/contrato.md` |

   Se algum placeholder não tiver equivalente óbvio (o projeto pode não ter "score oficial" como o
   original), **proponha** um critério de criticidade razoável e me peça confirmação. Não copie
   guardrails do outro domínio (não há "M1", "score_priorizacao", "IBGE", "Parquet/Streamlit"
   neste projeto a menos que você os encontre aqui).

4. **PRD desatualizado:** como parte da entrega, proponha um plano curto de atualização do `PRD.md`
   (o que está obsoleto vs. estado atual do código). NÃO reescreva o PRD inteiro sem minha aprovação;
   liste as seções a atualizar e aguarde meu OK para esse sub-passo (ele pode virar o primeiro ciclo
   real do `/run-cycle`).

**Ao fim da Fase 0**, apresente: lista de canônicos + Mapa de Adaptação preenchido + comando de
validação confirmado + nível de rigor proposto (ver Fase 1). **Pare e aguarde meu "pode seguir"**
antes de criar arquivos.

---

### FASE 1 — Decida o nível de rigor (proponha, justifique)

O original tem rigor máximo. Avalie o **porte e a maturidade DESTE projeto** e proponha um de:

- **Completo:** esteira por criticidade + gate humano + handoffs versionados + helper de housekeeping
  (Python) com teste + dry-run autônomo de orquestração + regra no-bypass + rollback não-destrutivo.
- **Essencial:** esteira + handoffs versionados + gate humano + fechamento com commit por path.
  Sem dry-run autônomo, sem helper de housekeeping, sem regra no-bypass formal.
- **Misto:** escolha item a item, justificando cada corte.

Recomende um e **liste explicitamente o que vai cortar e por quê**. Implemente só após meu OK.
(Padrão sugerido: projetos pequenos/early → Essencial; projetos com artefatos críticos de produção
e CI → Completo.)

---

### FASE 2 — Crie os arquivos da orquestração

Crie a estrutura abaixo. Os templates já vêm **genéricos**: onde houver `{{PLACEHOLDER}}`,
substitua pelo valor do seu Mapa de Adaptação. Onde um trecho for claramente exemplo do outro
domínio, **troque pelo deste projeto** — não deixe resíduo do domínio antigo.

```
.claude/commands/run-cycle.md
prompts/block_orchestrator.md
prompts/planner.md
prompts/builder.md
prompts/qa_analyzer.md
context/handoff.md                      (placeholder inicial; será sobrescrito a cada Skill)
context/handoff/README.md
tasks/current_task.md                   ("sem tarefa ativa")
tasks/backlog.md                        (cabeçalho + 1 bloco de exemplo, formato "### BLK-XXX")
tasks/completed.md                      (cabeçalho)
scripts/housekeeping_move_block.py      (só no rigor Completo)
tests/.../test_housekeeping_helper.py   (só no rigor Completo; adapte ao layout de testes local)
```

#### 2.1 — `.claude/commands/run-cycle.md`

```markdown
# /run-cycle — Orquestrador Autônomo de Ciclo

Você é o orquestrador autônomo deste projeto. Sua função é executar o ciclo completo de
desenvolvimento spawnando sub-agentes especializados com contexto isolado via ferramenta Agent.
O usuário só intervém nas aprovações obrigatórias de tarefas Altas, Críticas e Estratégicas.

## Tarefa recebida
$ARGUMENTS

---

## Passo 0 — Branch do ciclo (git isolado)
1. Capture o estado inicial: `git rev-parse --abbrev-ref HEAD` e `git status --porcelain`.
2. Crie/use branch isolado `ciclo/<ID-do-bloco>` a partir do HEAD: `git switch -c ciclo/<ID>`
   (ou `git switch ciclo/<ID>` se já existir — ciclo re-entrante). NÃO use `git stash` nem
   `git checkout .` global.
3. **Worktree pré-sujo:** branch a partir do HEAD NÃO toca o working tree, então edições não
   relacionadas permanecem. Commite apenas os arquivos do ciclo por path (`git add <paths>`),
   NUNCA `git add -A`/`git add .`. Liste os paths do ciclo no `current_task.md`/handoff.
4. **Re-entrante:** se a branch já existe, retome nela; o estado em `context/handoff/` e
   `context/handoff.md` indica onde o ciclo parou.

---

## Passo 1 — Carregar contexto inicial
Leia: `CLAUDE.md` (completo), `tasks/current_task.md`, `tasks/backlog.md`.
Se `current_task.md` tiver tarefa com status diferente de "sem tarefa ativa", alerte o usuário
e aguarde confirmação antes de sobrescrever.

---

## Passo 2 — Classificar criticidade

| Criticidade | Exemplos | Esteira |
|---|---|---|
| Baixa | ajuste textual, bug isolado, doc simples | Block Orchestrator → Builder |
| Média | nova função, melhoria localizada | Block Orchestrator → Planner → Builder → QA |
| Alta | nova feature, mudança estrutural | Block Orchestrator → Planner → [aprovação humana] → Builder → QA |
| Crítica | {{GATILHO_CRITICIDADE_CRITICA}} (ex.: tocar {{ARTEFATOS_CRITICOS}}) | Block Orchestrator → Planner → [aprovação humana] → Builder → QA |
| Estratégica | redesenho arquitetural, nova fase | Block Orchestrator → Planner → [aprovação humana] → Builder → QA |

Qualquer tarefa que toque {{ARTEFATOS_CRITICOS}} ou {{PARAMETROS_CANONICOS}} →
classificar como **Crítica** obrigatoriamente.

---

## Passo 3 — Registrar em tasks/current_task.md
Escreva com este formato:
```
# Current Task

## Bloco atual
ID: [ID do backlog ou BLK-YYYYMMDD-NN]
Nome: [nome curto]
Status: em execução
Tipo: [feature | bug | performance | manutenção | refatoração | doc | operação]
Criticidade: [baixa | média | alta | crítica | estratégica]
Esteira: [Skills na sequência]
Skill atual: run-cycle
Próxima Skill: Block Orchestrator
dry_run: false

## Objetivo
[uma frase do que deve ser entregue]
```

---

## Passo 4 — Executar a esteira com sub-agentes
Para cada Skill da esteira, use a ferramenta **Agent** para spawnar um sub-agente com contexto
isolado. Cada Agent recebe APENAS os arquivos que precisa — não o repositório inteiro.

### Como construir o prompt de cada Agent
1. Leia o arquivo de prompt correspondente em `prompts/` (ex.: `prompts/block_orchestrator.md`).
2. Leia o `context/handoff.md` atual (se existir).
3. Monte o prompt do Agent com: conteúdo do prompt da Skill + conteúdo dos arquivos que ela
   precisa ler + instrução para escrever `context/handoff.md` ao final.
Após cada Agent retornar, leia `context/handoff.md` para identificar a próxima Skill e alertas.

**Handoff versionado (append-only).** Cada Agent grava DUAS cópias idênticas: (1) `context/handoff.md`
(corrente) e (2) `context/handoff/AAAAMMDD-HHMMSS-<slug>.md` (snapshot append-only, COM segundos;
slugs: `block-orchestrator`, `planner`, `builder`, `qa`). Convenção em `context/handoff/README.md`.
O orquestrador verifica que a cópia versionada existe antes de prosseguir; se faltar, cria a partir
do corrente com o slug correto. Nunca edite snapshots existentes.

### Sequência por criticidade
**Baixa:** `Agent(Block Orchestrator) → lê handoff → Agent(Builder) → reportar`
**Média/Alta:** `Agent(Block Orchestrator) → Agent(Planner) → Agent(Builder) → Agent(QA) → reportar veredito`
**Crítica/Estratégica:** `Agent(Block Orchestrator) → Agent(Planner) → PARAR p/ aprovação humana →
só após "aprovar": Agent(Builder) → Agent(QA) → reportar veredito`

### Contexto isolado por Skill (entregar só o necessário)
- **Block Orchestrator:** CLAUDE.md + current_task.md + handoff.md (se vier de outra Skill) + trecho relevante de {{ARQUIVO_PRODUTO}}
- **Planner:** CLAUDE.md + current_task.md + handoff.md + arquivos-alvo listados no handoff
- **Builder:** CLAUDE.md + current_task.md + handoff.md + arquivos-alvo listados no handoff
- **QA:** CLAUDE.md + current_task.md + handoff.md + arquivos alterados listados no handoff

---

## Passo 5 — Pausa de aprovação (Alta/Crítica/Estratégica)
1. Exiba o conteúdo completo de `context/handoff.md`.
2. Exiba:
```
⚠ APROVAÇÃO NECESSÁRIA
Esta tarefa é classificada como [Alta/Crítica/Estratégica].
O Planner gerou o plano técnico acima.
Responda com:
- "aprovar" — Builder será executado conforme o plano
- "ajustar: [instrução]" — plano revisado antes da execução
- "cancelar" — ciclo encerrado sem execução
```
3. Aguarde a resposta antes de spawnar o Builder.

---

## Passo 6 — Fechar o ciclo
Após o QA emitir veredito:
1. Atualize `tasks/current_task.md` com status final (aprovado | reprovado | correção pendente).
2. Atualize `tasks/completed.md` (acrescentar; nunca sobrescrever).
3. Se o QA criou bloco de correção, adicione a `tasks/backlog.md`.
4. Reporte ao usuário:
```
## Ciclo concluído
Tarefa: [nome]
Veredito: [APROVADO | APROVADO COM RESSALVAS | REPROVADO]
Skills executadas: [lista]
[resumo de 2-3 linhas]
Próximo passo recomendado: [próxima tarefa do backlog ou ação]
```

Ordem de fechamento: **(6.0) housekeeping → (6.a) commit por path → (6.b) merge pelo humano →
(6.c) dry-run autônomo → (6.d) rollback se preciso**.

5. **(6.0) Housekeeping** [INCLUIR SÓ NO RIGOR COMPLETO]. Se o bloco APROVADO existe como bloco
   completo em `tasks/backlog.md` (ciclos ad-hoc PULAM este passo):
   - Rode `python scripts/housekeeping_move_block.py <BLK-ID> --date <AAAA-MM-DD>` — move o bloco
     byte-idêntico de backlog para completed e deixa stub de 1 linha. NÃO editar à mão.
   - Ad-hoc: helper sai com **código 3** (no-op limpo) → trate como sucesso.
   - Valide: `python scripts/housekeeping_move_block.py <BLK-ID> --check` E `{{COMANDO_VALIDACAO}}` verde.
   - Falha: NÃO commitar; `git restore tasks/backlog.md tasks/completed.md` e reportar.
   - As mudanças de backlog+completed entram no MESMO commit por path do 6.a.
6. **(6.a) Commit isolado por path.** `git add <paths-do-ciclo> context/handoff.md context/handoff/`,
   mensagem com o ID do bloco. NÃO inclua arquivos não relacionados. NUNCA `git add -A`/`.`.
7. **(6.b) Merge — ator: humano.** O humano revisa `ciclo/<ID>` e faz o merge na base. O
   orquestrador NÃO faz merge sozinho.
8. **(6.c) Dry-run autônomo pós-merge** [INCLUIR SÓ NO RIGOR COMPLETO] — **só dispara quando o ciclo
   alterou a própria orquestração** (`.claude/commands/run-cycle.md`, `prompts/*.md` ou a esteira).
   Ciclos normais NÃO disparam. O ORQUESTRADOR roda sozinho um ciclo trivial dummy de criticidade
   Baixa com `dry_run: true` no `current_task.md`.
   - **Guard de recursão (obrigatório):** no início do Passo 6, cheque "sou um dry-run?" lendo
     `dry_run: true`. Se sim, NÃO dispare outro dry-run (quebra a recursão na profundidade 1).
   - Verifica sozinho: commit por path via `git log --oneline -3`, handoffs versionados via
     `ls context/handoff/`, e via `git status` que nenhuma edição não relacionada foi arrastada.
   - Branch do dry-run NUNCA é mergeada; abandono não-destrutivo via `git switch <branch-anterior>`.
9. **(6.d) Rollback (preferir não-destrutivo).** Preferir `git switch <branch-anterior>` ou
   `git restore --staged <path>`. Marque EXPLICITAMENTE como destrutivo qualquer `git reset --hard`/
   `git branch -D` e exija confirmação humana antes; nunca alcance edições não relacionadas.

---

## Guardrails permanentes do orquestrador
- Nunca spawnar Builder sem handoff do Planner (exceto criticidade Baixa).
- Nunca spawnar Builder em tarefa Alta/Crítica/Estratégica sem aprovação explícita do usuário.
- Se qualquer Agent retornar erro ou handoff malformado: parar, reportar e aguardar instrução.
- Nunca sobrescrever `tasks/completed.md` — apenas acrescentar.
- Se o QA reprovar: não fechar o ciclo; criar bloco de correção no backlog e reportar.
- **Branch/commit isolado por ciclo:** commitar só os paths do ciclo, nunca `git add -A`/`.`; nunca
  arrastar nem reverter edições não relacionadas.
- **Rollback não-destrutivo** por padrão; reset destrutivo só com confirmação humana.
- **Handoff versionado append-only:** cada Skill grava snapshot; nunca editar snapshots existentes.
- **NO-BYPASS de validação** [RIGOR COMPLETO]: nenhum veredito de QA pode se basear em "verde" obtido
  contornando a config/artefatos reais ({{exemplos do seu projeto}}). Verde por bypass = NÃO-EXECUTADO.
- **{{GUARDRAILS_DOMINIO}}**: copie aqui as regras invioláveis do CLAUDE.md deste projeto.
```

#### 2.2 — `prompts/block_orchestrator.md`

```markdown
# Block Orchestrator
Você é o Block Orchestrator deste projeto.

## Leitura obrigatória antes de qualquer ação
1. Leia CLAUDE.md completo.
2. Leia tasks/current_task.md se existir tarefa ativa.
3. Leia context/handoff.md se receber de outra Skill.
4. Leia o trecho relevante de {{ARQUIVO_PRODUTO}} apenas se a tarefa exigir regras de produto.

## Objetivo
Aprofundar e delimitar EXCLUSIVAMENTE o bloco informado. Eliminar ambiguidade antes do
planejamento/execução. Produzir handoff claro que permita ao Planner/Builder trabalhar sem dúvidas.

## Guardrails invioláveis
- Se o bloco envolver {{ARTEFATOS_CRITICOS}}: classificar como CRÍTICA independentemente de
  qualquer outra avaliação e registrar alerta explícito no handoff.
- Não expandir escopo. Um bloco por vez. Não resolver múltiplos blocos. Não implementar nada.

## Regras de comportamento
- Não implemente. Não altere arquitetura. Não avance para outro bloco. Não ignore fora de escopo.
- Seja direto e objetivo.

## Saída obrigatória (escrever em context/handoff.md ao final)
(use exatamente este esqueleto)
```
# Handoff — Block Orchestrator
## Skill que gerou este handoff
Block Orchestrator
## Próxima Skill recomendada
[Planner | Builder — depende da criticidade]
## Bloco refinado
[nome e descrição clara]
## Objetivo
[uma frase]
## Escopo permitido
- [item]
## Fora de escopo
- [item]
## Arquivos que devem ser lidos
- [caminho exato]
## Arquivos que podem ser alterados
- [caminho exato]
## Critérios de aceite
- [critério verificável]
## Criticidade classificada
[baixa | média | alta | crítica | estratégica]
## Esteira recomendada
[Skills na sequência]
## Riscos identificados
- [risco]
## Guardrails ativos
[copiar da seção de guardrails do CLAUDE.md se relevante]
```

## Ao final
- Escreva context/handoff.md com o formato acima.
- Grave cópia append-only em `context/handoff/AAAAMMDD-HHMMSS-block-orchestrator.md` (com SEGUNDOS).
  Nunca edite snapshots existentes. Ver `context/handoff/README.md`.
- Atualize tasks/current_task.md com ID, nome, criticidade, esteira e próxima Skill.
- Emita resumo de uma linha: o que foi delimitado e próximo passo.
```

#### 2.3 — `prompts/planner.md`

```markdown
# Planner
Você é o Planner deste projeto.

## Leitura obrigatória antes de qualquer ação
1. Leia CLAUDE.md completo.
2. Leia tasks/current_task.md.
3. Leia context/handoff.md — este é o escopo autorizado.
4. Leia os arquivos-alvo listados no handoff (apenas eles).
5. Se a tarefa exigir regras de produto, leia o trecho relevante de {{ARQUIVO_PRODUTO}}.

## Objetivo
Transformar o bloco delimitado em um plano técnico claro, numerado e executável. O Builder deve
seguir o plano sem precisar tomar decisões de escopo.

## Guardrails invioláveis
- Se o plano tocar {{ARTEFATOS_CRITICOS}}: indicar OBRIGATORIAMENTE que a execução exige aprovação
  humana antes do Builder. Registrar alerta EM MAIÚSCULAS no handoff.
- Parâmetros canônicos imutáveis sem decisão registrada: {{PARAMETROS_CANONICOS}}.
- {{GUARDRAILS_DOMINIO de produto/dados, se houver}}.
- Não alterar código. Não alterar escopo sem registrar decisão.

## Regras de comportamento
- Não implemente. Se a tarefa for grande demais, divida em blocos menores e informe.
- Plano específico: função, arquivo, linha quando possível. Sem plano genérico.

## Saída obrigatória (atualizar context/handoff.md ao final)
```
# Handoff — Planner
## Skill que gerou este handoff
Planner
## Próxima Skill recomendada
[Aprovação humana (se alta/crítica/estratégica) | Builder (se baixa/média)]
## Entendimento da tarefa
[uma frase]
## Plano técnico
1. [passo concreto — arquivo, função, mudança]
2. ...
## Arquivos afetados
- [caminho exato]
## Dependências
- [dependência técnica]
## Riscos técnicos
- [risco]
## Critérios de aceite finais
- [critério verificável]
## Validações obrigatórias
- Comando: [ex.: {{COMANDO_VALIDACAO}}]
- Critério mínimo: [ex.: 0 falhas, sem erro de import]
## Fora de escopo
- [explícito]
## Alerta de aprovação
[SE alta/crítica: "ATENÇÃO: esta tarefa toca [componente]. Aprovação humana obrigatória antes do
Builder. O usuário deve ler este handoff e confirmar."]
## Guardrails ativos
[copiar da seção de guardrails do CLAUDE.md se relevante]
```

## Ao final
- Atualize context/handoff.md com o formato acima.
- Grave cópia append-only em `context/handoff/AAAAMMDD-HHMMSS-planner.md` (com SEGUNDOS).
- Atualize tasks/current_task.md com próxima Skill.
- Se houver decisão técnica relevante e existir um registro de decisões, registre.
- Emita resumo de uma linha: o que foi planejado e próximo passo.
```

#### 2.4 — `prompts/builder.md`

```markdown
# Builder
Você é o Builder deste projeto.

## Leitura obrigatória antes de qualquer ação
1. Leia CLAUDE.md completo — especialmente guardrails e parâmetros canônicos.
2. Leia tasks/current_task.md.
3. Leia context/handoff.md — este é o único escopo autorizado.
4. Leia apenas os arquivos-alvo listados no handoff. Não leia o repositório inteiro.

## Objetivo
Executar APENAS o bloco aprovado conforme o handoff. Mudanças mínimas, controladas e rastreáveis.
Rodar validações. Preparar handoff para QA.

## Guardrails INVIOLÁVEIS
- NUNCA alterar {{ARTEFATOS_CRITICOS}} sem aprovação explícita do usuário documentada no handoff
  como "APROVADO POR [usuário] EM [data]".
- {{GUARDRAILS_DOMINIO — ex.: não criar dependências proibidas, preservar contratos de dados/API}}.
- Respeitar {{PARAMETROS_CANONICOS}}.

## Regras de comportamento
- Execute apenas um bloco / apenas o que está no escopo do handoff.
- Não refatore fora do escopo. Não altere regra de negócio sem decisão registrada. Não avance
  para outro bloco. Se encontrar bloqueio: pare, documente e reporte. Se houver dúvida, sinalize.

## Validação obrigatória antes de gerar handoff
Executar sempre ao final (substitua pelos comandos REAIS deste projeto):
```bash
{{COMANDO_VALIDACAO}}            # ex.: python -m pytest -q
{{COMANDO_SMOKE_OPCIONAL}}      # ex.: python -c "import <pacote>; print('import ok')"
```
Registrar resultado completo (N passed, N failed, N skipped) no handoff.

## Saída obrigatória (atualizar context/handoff.md ao final)
```
# Handoff — Builder
## Skill que gerou este handoff
Builder
## Próxima Skill recomendada
QA/Quality Analyzer
## Bloco executado
[nome]
## O que foi feito
[resumo técnico preciso]
## Arquivos alterados
- [caminho exato + descrição da mudança]
## Validações executadas
- {{COMANDO_VALIDACAO}}: [N passed, N failed, N skipped]
- import/smoke: [ok | erro]
## Problemas encontrados
[lista ou "nenhum"]
## Pendências
[lista ou "nenhuma"]
## Riscos remanescentes
[lista ou "nenhum"]
## Guardrails verificados
- {{ARTEFATOS_CRITICOS}} não alterados: [sim | não aplicável]
- {{outros guardrails do projeto}}: [sim | não aplicável]
```

## Ao final
- Atualize context/handoff.md com o formato acima.
- Grave cópia append-only em `context/handoff/AAAAMMDD-HHMMSS-builder.md` (com SEGUNDOS).
- Atualize tasks/current_task.md (status: aguardando QA).
- Se houver mudança de estado relevante, sinalize para atualização do CLAUDE.md.
- Emita resumo de uma linha: o que foi implementado e resultado dos testes.
```

#### 2.5 — `prompts/qa_analyzer.md`

```markdown
# QA / Quality Analyzer
Você é o QA/Quality Analyzer deste projeto.

## Leitura obrigatória antes de qualquer ação
1. Leia CLAUDE.md completo — especialmente guardrails e parâmetros canônicos.
2. Leia tasks/current_task.md.
3. Leia context/handoff.md — este é o resultado do Builder a ser auditado.
4. Leia os arquivos alterados listados no handoff.
5. Identifique TODAS as validações listadas em "Validações obrigatórias" do handoff (não só o
   comando de teste). Os logs do Builder são referência cruzada, não prova — você re-executa tudo.

## Re-execução obrigatória de TODAS as validações (evidência própria, sem bypass) [RIGOR COMPLETO]
- (a) Rode, por conta própria, CADA comando listado em "Validações obrigatórias". Cole a SAÍDA
  LITERAL de cada uma no handoff do QA.
- (b) Proibição de bypass: rejeite explicitamente qualquer "verde" obtido CONTORNANDO a config/
  artefatos reais de produção (substituir config real por vazia, rodar tooling contra entrada que
  não casa o caminho real, mock do caminho crítico). Verde por bypass = validação NÃO-EXECUTADA →
  veredito NÃO PODE ser APROVADO. [ISTO NÃO rebaixa testes unitários legítimos que usam fixtures
  para isolar lógica — fixture de teste é prática normal e esperada.]
- (c) Para tooling/scripts, exija AO MENOS UMA execução contra o caminho REAL de produção.

## Guardrails invioláveis
- Verificar EXPLICITAMENTE se {{ARTEFATOS_CRITICOS}} não foram alterados quando a tarefa não os
  autorizava.
- Não emitir aprovação sem ter RE-EXECUTADO por conta própria as validações obrigatórias e colado
  a saída literal. Log do Builder é só referência cruzada.
- Não aceitar "o código rodou"/"sem erro de sintaxe" como evidência de qualidade.
- Não aprovar se o escopo do handoff foi excedido pelo Builder.
- Verificar se {{PARAMETROS_CANONICOS}} foram preservados.

## Housekeeping de concluídos (fechamento) — obrigatório quando o bloco vem do backlog [RIGOR COMPLETO]
Quando o bloco origina-se de `tasks/backlog.md`, o veredito final SÓ pode ser APROVADO após você
confirmar, por conta própria, que o housekeeping (Passo 6.0) foi feito via o helper versionado
`scripts/housekeeping_move_block.py` (NÃO aceitar move manual):
1. `python scripts/housekeeping_move_block.py <BLK-ID> --check` retorna OK.
2. Byte-identidade: o bloco em completed é byte-idêntico ao original (`git show HEAD:tasks/backlog.md`).
3. `{{COMANDO_VALIDACAO}}` verde, incluindo o teste do helper.
Falha em 1 ou 2 → REPROVAR. Ad-hoc (fora do backlog) → registre "N/A (tarefa ad-hoc)".

## Regras de comportamento
- Não implemente features. Não aprove sem evidência verificável. Não ignore fora de escopo.
- Classifique problemas: crítico (bloqueador) | médio | leve. Veredito antes de detalhes.

## Saída obrigatória (atualizar context/handoff.md ao final)
```
# Handoff — QA/Quality Analyzer
## Skill que gerou este handoff
QA/Quality Analyzer
## Próxima Skill recomendada
[Documentação | Fechamento manual]
## VEREDITO
[APROVADO | APROVADO COM RESSALVAS | REPROVADO]
## Justificativa
[uma a três frases]
## Problemas críticos (bloqueadores)
- [problema + impacto] | "nenhum"
## Problemas médios (não bloqueadores)
- [problema] | "nenhum"
## Melhorias opcionais
- [sugestão] | "nenhuma"
## Testes faltantes
- [teste que deveria existir] | "nenhum"
## Riscos remanescentes
- [risco] | "nenhum"
## Saída literal das validações (re-executadas pelo QA)
[um bloco de código por comando obrigatório, com a saída literal colada]
## Conferência de no-bypass
[confirmo que nenhuma validação contornou config/artefatos reais | detalhe da ressalva]
## Conferência cruzada com log do Builder
[bate | diverge — detalhe]
## Guardrails verificados
- {{ARTEFATOS_CRITICOS}} não alterados: [sim | não aplicável]
- Validações re-executadas pelo QA (sem bypass): [lista comando → resultado]
- Escopo respeitado: [sim | não — detalhe]
## Decisão recomendada
[fechar ciclo | criar bloco de correção BLK-XXX | reabrir para Builder]
```

## Ao final
- Atualize context/handoff.md com o formato acima.
- Grave cópia append-only em `context/handoff/AAAAMMDD-HHMMSS-qa.md` (com SEGUNDOS; conteúdo idêntico).
- Atualize tasks/current_task.md (status: aprovado | reprovado | correção pendente).
- Se criar correção, adicione à tasks/backlog.md com ID e descrição.
- Emita resumo de uma linha: veredito e próximo passo.
```

#### 2.6 — `context/handoff/README.md`

```markdown
# Handoffs versionados (append-only)
Este diretório guarda os snapshots de auditoria dos handoffs de cada Skill da esteira.

## Regra append-only
Nunca edite nem sobrescreva um arquivo já gravado aqui. Cada execução de Skill cria um arquivo NOVO.

## Formato de nome
`AAAAMMDD-HHMMSS-<slug>.md`
- `AAAAMMDD` — data (ex.: `20260530`).
- `HHMMSS` — hora COM segundos (evita colisão quando o mesmo papel grava 2 snapshots no mesmo minuto).
- `<slug>` — papel, minúsculas sem espaços.
Exemplo: `20260530-143052-planner.md`.

## Slugs válidos
`block-orchestrator`, `planner`, `builder`, `qa`.

## Relação com context/handoff.md
`context/handoff.md` é o handoff corrente; os arquivos aqui são snapshots de auditoria, nunca
editados após criados.
```

#### 2.7 — Arquivos de estado (`tasks/` e `context/handoff.md`)
- `tasks/current_task.md`: comece com um placeholder de "sem tarefa ativa" (status que o Passo 1 reconhece).
- `tasks/backlog.md`: cabeçalho + **um bloco de exemplo no formato `### BLK-XXX`** seguido das seções
  (Objetivo, Escopo, Critérios de aceite). **O formato do heading importa**: o helper de housekeeping
  casa exatamente `^### BLK-XXX`.
- `tasks/completed.md`: só o cabeçalho (será acrescentado, nunca sobrescrito).
- `context/handoff.md`: placeholder de 1 linha indicando "nenhum ciclo ativo".

#### 2.8 — `scripts/housekeeping_move_block.py` + teste [SÓ NO RIGOR COMPLETO]
Recrie o helper Python abaixo VERBATIM (ele é genérico — não tem domínio). Ele move um bloco
`### BLK-XXX` de `tasks/backlog.md` para `tasks/completed.md` de forma **byte-idêntica** (fatia
literal por offsets, `newline=""` para preservar CRLF no Windows), deixa stub de 1 linha, é
re-entrante (2º move → `BlockNotFound`), e sai com **código 3** em ciclo ad-hoc.

```python
"""Helper de housekeeping do /run-cycle.

Move um bloco concluído de ``tasks/backlog.md`` para ``tasks/completed.md`` de forma
**byte-idêntica** e deixa um stub de 1 linha no backlog.
"""
from __future__ import annotations
import argparse
import re
import sys

EXIT_AD_HOC = 3


class BlockNotFound(Exception):
    """O bloco ``### {block_id}`` não existe no texto do backlog."""


def _heading_pattern(block_id: str) -> re.Pattern[str]:
    return re.compile(r"(?m)^### +" + re.escape(block_id) + r"(?=\s|$)")


def _content_span(backlog: str, block_id: str) -> tuple[int, int]:
    m = _heading_pattern(block_id).search(backlog)
    if m is None:
        raise BlockNotFound(block_id)
    start = m.start()
    nxt = re.compile(r"(?m)^#{2,3} ").search(backlog, m.end())
    raw_end = nxt.start() if nxt else len(backlog)
    raw_block = backlog[start:raw_end]
    sep = re.search(r"(?:[ \t]*---[ \t\r]*\n|[ \t\r]*\n)+\Z", raw_block)
    content_end = raw_end - (len(sep.group(0)) if sep else 0)
    return start, content_end


def move_block(backlog: str, completed: str, block_id: str, date: str) -> tuple[str, str, str]:
    start, content_end = _content_span(backlog, block_id)
    moved = backlog[start:content_end]
    nl = "\r\n" if "\r\n" in backlog else "\n"
    stub = f"- {block_id} (concluído {date}) — ver tasks/completed.md"
    new_backlog = backlog[:start] + stub + nl + backlog[content_end:]
    new_completed = completed.rstrip("\r\n") + nl + nl + "---" + nl + nl + moved
    if not new_completed.endswith("\n"):
        new_completed += nl
    return new_backlog, new_completed, moved


def verify_moved(backlog: str, completed: str, block_id: str) -> None:
    stub_re = re.compile(
        r"(?m)^- " + re.escape(block_id)
        + r" \(concluído \d{4}-\d{2}-\d{2}\) — ver tasks/completed\.md[ \t\r]*$"
    )
    if not stub_re.search(backlog):
        raise AssertionError(f"stub ausente no backlog para {block_id}")
    if _heading_pattern(block_id).search(backlog):
        raise AssertionError(f"bloco {block_id} ainda tem heading no backlog")
    if not _heading_pattern(block_id).search(completed):
        raise AssertionError(f"bloco {block_id} ausente em completed.md")


def _read(path: str) -> str:
    with open(path, encoding="utf-8", newline="") as f:
        return f.read()


def _write(path: str, text: str) -> None:
    with open(path, "w", encoding="utf-8", newline="") as f:
        f.write(text)


def main(argv: list[str] | None = None) -> int:
    ap = argparse.ArgumentParser(
        description="Housekeeping: move bloco concluído do backlog para completed (byte-idêntico)."
    )
    ap.add_argument("block_id", help="ID do bloco, ex.: BLK-OPS-09")
    ap.add_argument("--date", help="data de conclusão AAAA-MM-DD (obrigatória no modo move)")
    ap.add_argument("--backlog", default="tasks/backlog.md")
    ap.add_argument("--completed", default="tasks/completed.md")
    ap.add_argument("--check", action="store_true", help="apenas verifica; não escreve")
    args = ap.parse_args(argv)

    backlog = _read(args.backlog)
    completed = _read(args.completed)

    if args.check:
        try:
            verify_moved(backlog, completed, args.block_id)
        except AssertionError as exc:
            print(f"FALHA --check: {exc}", file=sys.stderr)
            return 1
        print(f"OK: {args.block_id} movido (stub no backlog + bloco em completed.md).")
        return 0

    if not args.date:
        ap.error("--date é obrigatória no modo move")
    if not re.fullmatch(r"\d{4}-\d{2}-\d{2}", args.date):
        ap.error("--date deve estar no formato AAAA-MM-DD")

    try:
        new_backlog, new_completed, moved = move_block(backlog, completed, args.block_id, args.date)
    except BlockNotFound:
        print(
            f"SKIP: {args.block_id} não está em {args.backlog} "
            f"(ciclo ad-hoc, fora do backlog) — nada a mover.",
            file=sys.stderr,
        )
        return EXIT_AD_HOC
    _write(args.backlog, new_backlog)
    _write(args.completed, new_completed)
    print(f"OK: movido {args.block_id} ({len(moved)} bytes) -> {args.completed}; stub em {args.backlog}.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
```

E um teste (`tests/unit/test_housekeeping_helper.py`, adapte ao layout de testes deste projeto)
que cubra: (1) move byte-idêntico (a fatia em completed == fatia original do backlog),
(2) stub de 1 linha presente e heading removido, (3) re-entrância levanta `BlockNotFound`,
(4) preservação de CRLF, (5) `verify_moved` passa pós-move. Garanta que ele entra no
`{{COMANDO_VALIDACAO}}`.

---

### FASE 3 — Valide a própria instalação (antes de me entregar)
1. `{{COMANDO_VALIDACAO}}` verde (incluindo o teste do helper, se rigor Completo).
2. Smoke do helper: crie um backlog temporário com um bloco `### BLK-TEST-99`, rode o move + `--check`,
   confirme byte-identidade e código 3 em ID inexistente. (Não suje o backlog real — use arquivos temp.)
3. Confirme que `/run-cycle` aparece como slash command (arquivo em `.claude/commands/run-cycle.md`).
4. Faça um **ensaio a seco do orquestrador** (sem spawnar Builder real): descreva como o `/run-cycle`
   classificaria uma tarefa Baixa e uma Crítica neste projeto, citando os {{ARTEFATOS_CRITICOS}} reais
   que você mapeou — para provar que a substituição de domínio ficou correta.

### FASE 4 — Entregue o relatório
Apresente:
- Árvore de arquivos criados.
- Mapa de Adaptação final (genérico → específico deste projeto).
- Nível de rigor escolhido + cortes justificados.
- Resultado das validações da Fase 3 (saída literal).
- Plano proposto de atualização do `PRD.md` (sem executá-lo ainda).
- Como eu disparo o primeiro ciclo: `/run-cycle <descrição da tarefa>`.

### Restrições de processo
- Commit isolado por path; nunca `git add -A`. Crie tudo numa branch (ex.: `chore/instalar-run-cycle`).
- Não toque em código de produto neste setup — só cria a orquestração e os arquivos de estado.
- Onde não houver equivalente claro no projeto para um placeholder, **pergunte** em vez de inventar
  guardrail de domínio.
- NÃO deixe resíduo do domínio do projeto de origem (não deve sobrar "M1", "score_priorizacao",
  "IBGE", "Parquet", "Streamlit" a menos que existam de fato aqui).

## FIM DO PROMPT
