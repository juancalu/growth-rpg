# Container de BUILD isolado para o ralph loop (efêmero; NÃO é o runtime de produção).
# Objetivo: rodar o Claude Code autônomo escrevendo só no repo montado, sem credencial de produção.
FROM python:3.12-slim

RUN apt-get update && apt-get install -y --no-install-recommends \
        git curl ca-certificates && \
    curl -fsSL https://deb.nodesource.com/setup_22.x | bash - && \
    apt-get install -y --no-install-recommends nodejs && \
    rm -rf /var/lib/apt/lists/*

# Claude Code CLI + ferramentas de validação
RUN npm install -g @anthropic-ai/claude-code && \
    pip install --no-cache-dir pytest ruff jsonschema

# Usuário não-root: o Claude Code RECUSA --dangerously-skip-permissions rodando como root.
RUN useradd --create-home --uid 1000 loop
USER loop
ENV HOME=/home/loop
# Identidade p/ os commits do loop + libera o git no volume montado (UID do host != container).
RUN git config --global user.name  "ralph-loop" && \
    git config --global user.email "ralph-loop@growth-rpg.local" && \
    git config --global --add safe.directory /repo

WORKDIR /repo
# O repositório é montado como volume em runtime — o agente escreve SÓ aqui.
ENTRYPOINT ["bash", "run-ralph-loop.sh"]
