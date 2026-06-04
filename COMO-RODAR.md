# COMO RODAR — ativar o ralph loop autônomo

Passo a passo para deixar o build rodando 100% autônomo, em container isolado. O loop constrói
os marcos de `tasks/backlog.md` (M1→M6) sozinho, sem intervenção sua, e entrega um branch para
você revisar.

## Pré-requisitos
- Docker instalado na máquina onde o loop vai rodar (NÃO precisa ser a VPS; é build, não produção).
- **Seu plano Max já basta — não precisa de API key.** O container usa um **token da sua assinatura** (passo 1).
- **Nada** de chave da VPS nem token de escrita do ClickUp no container (o `run-ralph-loop.sh` aborta se detectar). E **não** sete `ANTHROPIC_API_KEY` — ela tem precedência e cobraria via API em vez do Max.

## 0. (uma vez) Tornar a pasta um repositório git isolado
O loop commita em branches `ciclo/*`. Para o branch isolar bem, use um repo próprio:
```bash
cd "Growth RPG"
git init && git add -A && git commit -m "M0: bootstrap do Growth RPG"
```
> Se esta pasta já estiver dentro de outro repo, considere movê-la para um diretório próprio antes do `git init`.

## 1. (uma vez) Token da assinatura Max + build da imagem
No host (onde você já está logado no Claude com o Max), gere um token de 1 ano:
```bash
claude setup-token        # imprime o token; copie (não fica salvo)
export CLAUDE_CODE_OAUTH_TOKEN=<token-colado>
```
Build da imagem:
```bash
docker build -t growth-rpg-loop .
```

## 2. Disparar o loop autônomo
Monta a pasta como volume (o agente escreve SÓ aqui) e passa o **token da assinatura** (não API key).
Egress idealmente restrito (só api.anthropic.com); ClickUp não é necessário no loop (M2 usa fixture local).
```bash
docker run --rm -it \
  -e CLAUDE_CODE_OAUTH_TOKEN="$CLAUDE_CODE_OAUTH_TOKEN" \
  -e MAX_ITERS=40 \
  -v "$(pwd)":/repo \
  growth-rpg-loop
```
Pronto — está rodando. O loop vai: pegar o próximo `BLK-*`, Planner→Builder→QA, rodar
`ruff`/`pytest` (com `test_contract`), fechar o bloco com commit por path, e seguir para o próximo. Para
quando todos passam (cria `LOOP_DONE`) ou trava 3x no mesmo erro (escreve `RELATORIO-BLOQUEIO.md`).

> **Cota:** o uso headless (`claude -p`) na assinatura puxa de uma cota mensal **separada de "Agent SDK"** (≠ uso interativo do Max). Um loop longo consome dela; se acabar, o `claude -p` falha e o loop para de progredir. O `MAX_ITERS` limita o gasto — acompanhe nas primeiras rodadas.

### Alternativa sem Docker (mais exposto — use só se confiar no ambiente)
No host você já está logado com o Max, então **nem precisa do token** — o `claude -p` usa sua assinatura direto:
```bash
MAX_ITERS=40 bash run-ralph-loop.sh
```

## 3. Acompanhar
- Os commits aparecem nas branches `ciclo/*`. `tasks/completed.md` cresce conforme os marcos fecham.
- `git log --oneline` e `git diff main...HEAD` para ver o que foi feito.
- Se aparecer `RELATORIO-BLOQUEIO.md`, o loop travou — leia, ajuste e rode de novo.

## 4. Revisar e fechar (passo HUMANO, fora do loop)
1. Revise o branch: `git diff` dos blocos, rode `pytest -q` e `ruff check .` você mesmo.
2. Faça o **merge** na main (o loop nunca faz merge).
3. **Deploy** (só agora, com credenciais reais, fora do container do loop):
   - Confirme Caddy/Authelia na VPS e ajuste `deploy/Caddyfile.snippet` (subdomínio).
   - `VPS_USER=... VPS_HOST=... bash deploy/deploy.sh`
4. Configure a **skill produtora** (`.claude/skills/growth-rpg-producer/SKILL.md`) no Cowork
   para rodar diária/quinzenalmente, gerando `dados.json` + `painel.html` e publicando na VPS.

## Estado atual do M0 (já verde nesta máquina)
- `ruff check .` → All checks passed
- `pytest -q` → 4 passed
- schema valida o golden de Maio
Ou seja: o loop parte de uma base verde (M0 + A1) e começa pelo **A2 (app)**. (O motor é o cowork; o repo não recalcula scoring.)
