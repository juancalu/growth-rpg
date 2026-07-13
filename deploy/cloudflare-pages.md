# Deploy no Cloudflare Pages (host estático grátis)

Guia do **passo humano** para publicar o Growth RPG no Cloudflare Pages. O ralph
loop **não** roda isto — deploy a produção é sempre gate humano (guardrail).

O app é 100% estático (pasta `app/`): HTML/CSS/JS + `dados.json`, Chart.js e fontes
vendorizados, **zero request externa** (garantido pelos testes). Não há build, não há
backend, não há segredo. **Nada aqui lê o ClickUp** — o motor continua sendo o cowork,
que republica o `dados.json`.

---

## ⚠️ ANTES DE TUDO: não deixe público

Hoje, na VPS, o `dados.json` fica **atrás do Authelia** — os dados de contribuição do
time (Felipe/Juan/Vinícius) **nunca são públicos**. No Cloudflare, o equivalente é o
**Cloudflare Access** (Zero Trust, grátis até 50 usuários). **Habilite-o** (passo 3);
sem ele, qualquer pessoa com o link vê o painel e o `dados.json`. Isso fere a
segurança psicológica do time e não é aceitável.

---

## 1. Pré-requisitos

- Conta Cloudflare (plano grátis serve).
- O repositório no GitHub/GitLab (para a opção A) **ou** Node instalado (opção B).

## 2. Publicar

### Opção A — Integração com o repositório (recomendada)

1. Cloudflare Dashboard → **Workers & Pages** → **Create** → **Pages** →
   **Connect to Git** e selecione este repositório.
2. Configuração de build:
   - **Framework preset:** `None`
   - **Build command:** *(vazio)*
   - **Build output directory:** `app`
3. **Save and Deploy.** Cada push na branch de produção republica o site.

> O `dados.json` publicado é o que está em `app/dados.json` no commit. Para atualizar
> os dados você republica (ou, no futuro, liga o auto-refresh + cadência do produtor —
> ver "Próximos passos").

### Opção B — Upload direto (sem Git), via Wrangler

```bash
# uma vez: cria o projeto
npx wrangler pages project create growth-rpg --production-branch main

# a cada publicação (roda na RAIZ do repo; publica só a pasta app/):
npx wrangler pages deploy app --project-name growth-rpg
```

Faça login com `npx wrangler login` na primeira vez.

## 3. Restringir acesso ao time (Cloudflare Access) — OBRIGATÓRIO

1. Dashboard → **Zero Trust** → **Access** → **Applications** → **Add an application**
   → **Self-hosted**.
2. Aponte para o domínio do Pages (ex.: `growth-rpg.pages.dev` ou o domínio custom).
3. **Policy:** *Allow* apenas os e-mails do time (Felipe, Juan, Vinícius, Marcos/diretor)
   — por e-mail ou por domínio `@ultraacademia.com.br`, conforme o time decidir.
4. Salve. Agora o painel exige login antes de servir qualquer arquivo — incluindo o
   `dados.json`.

## 4. Conferir

- Abra a URL do Pages → deve pedir login (Access) → depois carrega o painel.
- DevTools → Network: só requests **same-origin** (`dados.json`, `style.css`, `app.js`,
  `vendor/*`). Nenhuma chamada externa.
- `dados.json` responde com `Cache-Control: no-store` (ver `app/_headers`).

---

## Notas de arquitetura (guardrails)

- **Motor único:** este deploy só **apresenta** o `dados.json` gerado pelo cowork.
  Não recalcula scoring, não toca o ClickUp, não guarda token.
- **Sem segredos no cliente:** um host estático não pode guardar token de API com
  segurança. Qualquer integração direta com o ClickUp exige backend + decisão humana
  registrada — fora do escopo deste deploy.
- **Deploy é humano:** o loop autônomo nunca publica.

## Próximos passos (quando quiser mais frescor de dado)

1. **App auto-refresh:** fazer o painel dar poll no `dados.json` a cada X segundos,
   para atualizar sozinho quando um novo snapshot é publicado. (Pura apresentação.)
2. **Cadência do produtor:** o cowork rodar mais vezes ao dia e republicar o
   `dados.json`. A frescura "quase em tempo real" é limitada por essa cadência.
