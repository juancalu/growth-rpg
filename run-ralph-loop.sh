#!/usr/bin/env bash
# Ralph loop — invoca o /run-cycle autônomo até todos os marcos passarem.
# Roda DENTRO do container isolado. NÃO deve haver credencial de produção aqui.
set -uo pipefail

MAX_ITERS="${MAX_ITERS:-40}"

# Rede de segurança: aborta se detectar credencial de produção no ambiente do container.
if env | grep -Eiq 'VPS_|SSH_PRIVATE_KEY|CLICKUP_WRITE|DEPLOY_KEY'; then
  echo "ABORT: credencial de produção detectada no container. Remova-a antes de rodar o loop."
  exit 1
fi

# Auth: usar a assinatura Max via CLAUDE_CODE_OAUTH_TOKEN (gerado no host com 'claude setup-token').
if [ -n "${ANTHROPIC_API_KEY:-}" ]; then
  echo "AVISO: ANTHROPIC_API_KEY está setada e TEM PRECEDÊNCIA — isso cobraria via API, não pelo Max."
  echo "       Para usar o plano Max: 'unset ANTHROPIC_API_KEY' e use CLAUDE_CODE_OAUTH_TOKEN."
fi
if [ -z "${CLAUDE_CODE_OAUTH_TOKEN:-}" ] && [ -z "${ANTHROPIC_API_KEY:-}" ]; then
  echo "ABORT: sem autenticação. Gere um token no host com 'claude setup-token' e passe como CLAUDE_CODE_OAUTH_TOKEN."
  exit 1
fi

# Instala o pacote em modo dev (deps do projeto).
pip install -e ".[dev]" >/dev/null 2>&1 || true

for i in $(seq 1 "$MAX_ITERS"); do
  if [ -f LOOP_DONE ]; then echo "LOOP_DONE presente — build concluído. Encerrando."; break; fi
  echo "================ Ralph loop — iteração $i/$MAX_ITERS ================"

  claude --dangerously-skip-permissions -p \
"/run-cycle Continue o build pelos marcos de tasks/backlog.md. Trabalhe UM bloco BLK-* por vez \
(Planner -> Builder -> QA), seguindo CLAUDE.md e a skill metodologia-guardrails-deg-rpg. \
Rode 'ruff check .' e 'pytest -q' (e o test_parity quando existir); NÃO avance com teste vermelho; \
NÃO use bypass. Commit por path; nunca merge/push/deploy; nunca escreva no ClickUp. \
Quando TODOS os blocos estiverem em tasks/completed.md e a suite estiver verde, crie o arquivo \
LOOP_DONE na raiz e pare. Se o MESMO erro persistir 3 tentativas, pare e escreva RELATORIO-BLOQUEIO.md." \
    || echo "(iteração $i retornou código de erro; o loop segue)"
done

echo "Ralph loop finalizado após $i iteração(ões). Revise o branch ANTES de qualquer merge/deploy."
