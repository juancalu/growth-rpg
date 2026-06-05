# Handoff — Planner

## Próxima Skill
Builder

## Bloco / Objetivo
BLK-A8 (ÚLTIMO) — Deploy + auth + reconciliação. Escrever teste dos scripts de deploy; reforçar nota de paridade na seção de reconciliação.

## Plano técnico
1. **`app/index.html`** — Atualizar `<p class="section-note">` da seção `#reconciliacao` para incluir nota de paridade: "Paridade por construção — mesmo motor (cowork/FLUXO 3). Escreva/ler apenas; nunca recalcula."
2. **`deploy/Caddyfile.snippet`** e **`deploy/deploy.sh`** — Já existem e estão corretos. Sem alteração necessária.
3. **`tests/test_deploy.py`** — Novo teste:
   - `test_caddyfile_existe()`: `deploy/Caddyfile.snippet` existe.
   - `test_caddyfile_autenticacao()`: contém `forward_auth` (Authelia).
   - `test_caddyfile_file_server()`: contém `file_server` (serve estático).
   - `test_caddyfile_sem_credenciais_hardcoded()`: não contém IPs fixos ou passwords (só templates SEU-DOMINIO).
   - `test_deploy_sh_existe()`: `deploy/deploy.sh` existe.
   - `test_deploy_sh_rsync()`: contém `rsync`.
   - `test_deploy_sh_env_vars()`: usa `${VPS_USER}` e `${VPS_HOST}` (não hardcoded).
   - `test_deploy_sh_sem_git_push()`: não contém `git push` (deploy é só rsync, não reescreve o branch).
   - `test_reconciliacao_no_app()`: index.html tem `id="reconciliacao"`.
4. **`LOOP_DONE`** — Criar na raiz quando todos os blocos estiverem em completed.md e pytest verde.

## Arquivos a alterar/criar
- `app/index.html` (modificar — nota de paridade na seção reconciliação)
- `tests/test_deploy.py` (criar)
- `LOOP_DONE` (criar — sinaliza fim do loop)

## Critérios de aceite
- `ruff check .` verde
- `pytest -q` verde (inclui test_deploy.py)
- LOOP_DONE criado na raiz
- Todos os blocos em completed.md

## Validações obrigatórias
- `ruff check .`
- `pytest -q`

## Criticidade
Normal (scripts de deploy existentes; sem tocar validador/schema/regras de frente)

## Fora de escopo
- Publicar na VPS — gate humano
- Push para main — proibido pelo loop
- Escrever no ClickUp — proibido

## Resultado Builder
Implementado. `ruff check .` ✅ · `pytest -v` 45/45 ✅.
Todos os blocos BLK-A1 a BLK-A8 em completed.md. LOOP_DONE criado.
BLK-A8 movido para completed.md. Loop encerrado.
