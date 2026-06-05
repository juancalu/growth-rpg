# Backlog — Growth RPG (repo = app + contrato + deploy)

**O motor é o cowork** (skill `growth-rpg-producer` + `produtividade-clickup-ultra`): ele lê o
ClickUp e gera o `dados.json`. Este repo **não** recalcula scoring — ele **valida** o `dados.json`,
**apresenta** de forma gamificada e **publica**. O ralph loop trabalha um bloco por vez, em ordem;
cada bloco só fecha com `ruff` + `pytest` verdes. Não somar entre frentes. Não tocar o ClickUp.

> **Rodada 1 — CONCLUÍDA:** BLK-A1…A8 (validador, app funcional, design system, layout, data-viz,
> micro-interações, a11y, scripts de deploy). Ver `tasks/completed.md`. O app já renderiza tudo,
> mas ficou com **cara de dashboard/relatório**.
>
> **Rodada 2 — REFINO VISUAL (BLK-A9…A15):** elevar para **dark-fantasy épico** (estilo RPG),
> incluindo o **Mapa de Campanha** (A14, ideia do time) e **avatares de classe** (A15).
> O **deploy de produção é passo HUMANO**, DEPOIS do refino — não é bloco do loop.

---

## Design brief (norte do app — todo bloco visual obedece isto)

Estética-alvo: **dark-fantasy épico de RPG** (referências tipo Cabal/MU Online) — fundos dramáticos,
molduras ornamentadas, brilhos/aura, medalhões, tipografia de pôster. Esta é a camada **lúdica** (o
diretor vê isto como diversão; a leitura gerencial é o painel FLUXO 3). Deve ser **imersivo e
gamificado — mas legível**: nível, XP, vazão e totais continuam claros, sem poluição.

- **Cor por frente (mantém):** Operacional = ciano · Projeto = âmbar · Análise = violeta — agora com
  **aura/glow** dessas cores. Fundo neutro escuro com profundidade.
- **Atmosfera:** fundo em **camadas** (gradientes radiais/lineares, vinheta, leve textura via SVG
  inline data-URI) — nunca chapado.
- **Tipografia:** **Cinzel** (já vendorizada em `app/vendor/fonts/cinzel-{400,700}.woff2`) para
  título/headers/números de destaque; body em fonte legível (system stack). **NUNCA CDN de fonte.**
- **Componentes como itens de RPG:** cards = painéis ornamentados; classes com **glyph SVG**
  (Guerreiro=espada / Engenheiro=engrenagem / Mago=cajado-orbe); emblemas = **medalhões** com glow;
  barras de XP brilhantes; guild com tema (território / construção / mapa de insights).
- **Motion:** conquistas com flourish (level-up, emblema cunhado, horda derrotada); hover com
  profundidade. **Respeita `prefers-reduced-motion`.**
- **Invioláveis:** **zero request externa** (tudo vendorizado/inline — sem CDN de fonte/img/lib);
  números vêm do `dados.json` (o app **nunca recalcula**); **nunca somar entre frentes**; a11y/contraste
  WCAG AA mantidos (os testes de contraste das rodadas anteriores continuam verdes).

> **Limite do loop:** roda *headless* e **não vê a tela** — constrói para esta spec + critérios
> checáveis por código; o "ficou épico?" é **julgamento humano** (rode, veja, peça o próximo refino).
> **Arte raster (splash/avatar estilo Cabal/MU) está FORA do que o loop desenha** — exige imagens que
> você forneça (vendorizadas em `app/vendor/img/`); aí um bloco futuro só as encaixa.

---

### BLK-A9 — Atmosfera dark-fantasy (fundo, profundidade, aura)
**Objetivo:** matar a cara de "fundo chapado" e criar atmosfera épica de RPG.
**Escopo:** fundo em camadas (gradientes radiais/lineares escuros + **vinheta** + leve textura/ruído
via **SVG inline data-URI**, sem request externa); auras/glows ambientes nas cores das frentes;
profundidade entre seções (z-layers, sombras longas suaves). Tokens novos `--aura-op/prj/ana`.
**Aceite:** fundo com múltiplas camadas no CSS (não cor sólida única); nenhum `url(http...)` externo
(data-URI inline é ok — teste: zero URL externa em `app/`); contraste do texto **mantém WCAG AA**
(testes existentes seguem verdes); `ruff`/`pytest` verdes.

### BLK-A10 — Tipografia épica (Cinzel vendorizada)
**Objetivo:** títulos e números com peso de pôster de RPG.
**Escopo:** `@font-face` self-hosted apontando para `vendor/fonts/cinzel-{400,700}.woff2`; aplicar
**Cinzel** (display, caixa-alta) no título do app, nos headers de seção e nos **números de destaque**
(nível, XP, totais), com `letter-spacing` e `text-shadow`/glow sutil; body permanece legível.
**Aceite:** `@font-face` aponta para `vendor/fonts/` (teste: nenhum `fonts.googleapis`/`gstatic`/CDN);
Cinzel aplicada a títulos/headers; body legível; `ruff`/`pytest` verdes.

### BLK-A11 — Molduras & componentes ornamentados (itens de RPG)
**Objetivo:** cards viram painéis de RPG; chips viram medalhões; barras brilham.
**Escopo:** molduras de card com borda dupla/cantos ornamentados (borda em gradiente + pseudo-elementos);
faixa de cabeçalho temática por frente; **glyphs de classe em SVG inline** (Guerreiro/Engenheiro/Mago);
**emblemas como medalhões** (SVG + gradiente metálico + glow quando conquistado); barra de XP com
gradiente, brilho e segmentos. Tudo nas cores da frente, via tokens.
**Aceite:** SVG inline presente para os 3 glyphs de classe; emblemas estilizados (não chips de texto
puro); barra de XP com glow/gradiente; nenhum asset externo; `ruff`/`pytest` verdes.

### BLK-A12 — Objetivos de guild temáticos
**Objetivo:** a guild deixa de ser "barra de relatório" e ganha o tema de cada frente.
**Escopo:** tratamento visual próprio por frente para o objetivo coletivo — Operacional = **conquista
de território** (grade de hexágonos que acendem com o progresso); Projeto = **construção da base**
(módulos/tijolos empilhando); Análise = **mapa de insights** (névoa dissipando). Camadas
comprometida/alvo/stretch como **checkpoints** marcados. Números exatos do `dados.json` (sem recalcular).
**Aceite:** cada frente com tratamento visual distinto (não a mesma barra genérica); progresso reflete
`entregue`/`total_equipe_quinzena` e `camada_atingida` do contrato; SVG/CSS inline; `ruff`/`pytest` verdes.

### BLK-A13 — Hero épico + motion de conquista + coesão final
**Objetivo:** abertura impactante, feedback de conquista e passada final de coesão.
**Escopo:** **hero/cabeçalho** com o título "Growth RPG" em tratamento épico (Cinzel + glow; a quinzena
como "capítulo"); animações de conquista (`@keyframes`): level-up flourish, emblema "cunhado", horda
"derrotada" com selo; hover com profundidade; passada final de coesão (espaçamentos, alinhamentos,
brilhos consistentes). Tudo sob `prefers-reduced-motion`.
**Aceite:** hero presente; animações de conquista via `@keyframes`; `prefers-reduced-motion` desliga o
motion; contraste/a11y mantidos; `ruff`/`pytest` verdes.

### BLK-A14 — Mapa de Campanha (overview no topo) — ideia do time
**Objetivo:** uma visão de "mapa de campanha" no **topo** do app (acima das seções atuais, sem
remover nada), realizando a metáfora do time — **dirigida só pelos dados do contrato**.
**Escopo:** bloco em destaque, mapa **estilizado em SVG inline** com 3 regiões temáticas:
- **Operacional → Base & Território:** hexágonos que **acendem** na proporção
  `guild.operacional.entregue_quinzena ÷ camada` (alvo/stretch). Cada **tarefa operacional aberta**
  (somar `pessoas[].frentes.operacional.backlog.tarefas`) e cada item de `missoes_organizacao` viram
  um marcador de **"problema na base"** (ícone/selo SVG — ex.: janela quebrada / monstro na entrada).
- **Projeto → Construção:** módulos/tijolos preenchidos proporcional ao progresso da guild de projeto;
  tarefas de projeto abertas = andaimes/obstáculos.
- **Análise → Mapa Enevoado:** overlay de **névoa que recua** conforme o progresso da guild de análise;
  o restante fica escuro.
- Camadas comprometida/alvo/stretch = **checkpoints** marcados; legenda/tooltip com os números exatos.
> **Fidelidade (inviolável):** tarefa é **binária** (não há % parcial no contrato). O "progresso" do
> mapa vem do **nível de frente** (`entregue ÷ camada` da guild) e os "obstáculos" do **nº de tarefas
> abertas** + `missoes_organizacao`. **Nada de % inventado por tarefa.**
> **Honesto:** é um mapa **estilizado (SVG/CSS)**, bonito e "de jogo" — **não** um mapa pintado à mão
> (isso seria arte raster, fora do loop). É o bloco mais experimental; espere iterar visualmente.
**Aceite:** mapa SVG/CSS **inline** (zero asset externo); estados (aceso/escuro/problemas) derivam SÓ
de `guild` + `backlog.tarefas` + `missoes_organizacao`; fica no topo, seções atuais intactas; a11y/contraste
mantidos; `ruff`/`pytest` verdes. Teste: nº de marcadores de "problema" == (missões + tarefas op abertas).

### BLK-A15 — Avatares de classe (slot + fallback)
**Objetivo:** dar rosto às classes, com mecanismo pronto pra arte **sem bloquear** (arte é passo humano).
**Escopo:** cada card de personagem (e o hero) ganha um **slot de avatar** por classe, com moldura/glow
da cor da frente. Comportamento: se existir `app/vendor/img/classe-{guerreiro,engenheiro,mago}.{png,webp,svg}`,
exibe a imagem; **senão, mostra o glyph SVG da classe (A11)** como fallback estilizado.
**Aceite:** slot presente nos cards e no hero; **fallback para glyph funciona HOJE** (sem nenhuma imagem);
se a imagem existir em `vendor/img/`, é usada; **zero request externa**; `ruff`/`pytest` verdes.

---

### (Depois do refino — passo HUMANO, fora do loop) Deploy de produção
BLK-A8 já gerou `deploy/Caddyfile.snippet` + `deploy/deploy.sh` + painel de reconciliação. O deploy
real (rsync para a VPS atrás de Caddy+Authelia) é manual, com credenciais reais, **fora do container**.

### (Opcional, futuro) BLK-ART — Arte raster fornecida
Se você fornecer imagens (splash/avatar por classe/tier, texturas) em `app/vendor/img/`, um bloco
futuro as encaixa nos cards/hero. **Não** é desenhado pelo loop.
