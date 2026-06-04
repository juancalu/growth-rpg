#!/usr/bin/env bash
# Deploy do Growth RPG para a VPS (passo HUMANO, fora do ralph loop).
# Publica o app estático + dados.json + histórico. SSH key auth. Não roda no container do loop.
set -euo pipefail

VPS_USER="${VPS_USER:?defina VPS_USER}"
VPS_HOST="${VPS_HOST:?defina VPS_HOST}"
DEST="${DEST:-/srv/growth-rpg}"

echo ">> Publicando app + dados em ${VPS_USER}@${VPS_HOST}:${DEST}"
rsync -az --delete \
  app/ \
  "${VPS_USER}@${VPS_HOST}:${DEST}/"

rsync -az dados.json painel.html "${VPS_USER}@${VPS_HOST}:${DEST}/" 2>/dev/null || true
rsync -az historico/ "${VPS_USER}@${VPS_HOST}:${DEST}/historico/" 2>/dev/null || true

echo ">> Pronto. Confira https://rpg.SEU-DOMINIO (atrás do Authelia)."
