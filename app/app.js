// Growth RPG — BLK-A3: lê cores do design system via CSS custom properties

const FRENTES = ['operacional', 'projeto', 'analise'];

const LABEL_FRENTE = {
  operacional: 'Operacional',
  projeto: 'Projeto',
  analise: 'Análise',
};

function cssVar(name) {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

const TOKEN_FRENTE = {
  operacional: '--color-op',
  projeto:     '--color-prj',
  analise:     '--color-ana',
};

const CLASSES = {
  operacional: 'Guerreiro',
  projeto: 'Engenheiro',
  analise: 'Mago',
};

const OBJETIVO_LABEL = {
  territorio: 'Conquista de Território',
  construcao: 'Construção da Base',
  mapa_insights: 'Mapa de Insights',
};

/* BLK-A15: slot de avatar por classe (imagem vendor/img/ ou glyph como fallback) */
function avatarHtml(frente, classe) {
  const slug = classe.toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '');
  const glyph = CLASS_GLYPH[frente];
  return `<div class="avatar-slot" data-frente="${frente}" title="${classe}"><img class="avatar-img" src="vendor/img/classe-${slug}.png" alt="${classe}" loading="lazy" onerror="this.hidden=true;this.nextElementSibling.hidden=false"><div class="avatar-glyph" hidden>${glyph}</div></div>`;
}

function renderHeroAvatars() {
  const inner = document.querySelector('.header-inner');
  if (!inner || inner.querySelector('.hero-avatars')) return;
  const wrap = document.createElement('div');
  wrap.className = 'hero-avatars';
  wrap.setAttribute('aria-hidden', 'true');
  wrap.innerHTML = FRENTES.map(f => avatarHtml(f, CLASSES[f])).join('');
  inner.appendChild(wrap);
}

/* BLK-A11: glyphs de classe (SVG inline — zero request externa) */
const CLASS_GLYPH = {
  operacional: `<svg class="class-glyph" viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" focusable="false"><line x1="5" y1="19" x2="19" y2="5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><line x1="12" y1="12" x2="7" y2="17" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><line x1="7" y1="17" x2="5" y2="15" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/></svg>`,
  projeto: `<svg class="class-glyph" viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" focusable="false"><circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="1.5" fill="none"/><path stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round" d="M12 2v2.5M12 19.5V22M4.93 4.93l1.77 1.77M17.3 17.3l1.77 1.77M2 12h2.5M19.5 12H22M4.93 19.07l1.77-1.77M17.3 6.7l1.77-1.77"/></svg>`,
  analise: `<svg class="class-glyph" viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" focusable="false"><circle cx="12" cy="7" r="4" stroke="currentColor" stroke-width="1.5" fill="none"/><line x1="12" y1="11" x2="12" y2="22" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><line x1="9" y1="16" x2="15" y2="16" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>`,
};

async function main() {
  try {
    // cache-busting: dados.json muda todo dia; evita o navegador reusar uma
    // cópia velha/corrompida em cache (mesma origem, sem request externa).
    const resp = await fetch(`dados.json?t=${Date.now()}`, { cache: 'no-store' });
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    let dados;
    try {
      dados = await resp.json();
    } catch (parseErr) {
      // Rede de segurança: o produtor às vezes anexa lixo após o JSON (visto
      // em snapshots). Recupera o objeto JSON válido do prefixo do texto.
      const txt = await (await fetch(`dados.json?t=${Date.now()}`, { cache: 'no-store' })).text();
      const fim = txt.lastIndexOf('}');
      if (fim === -1) throw parseErr;
      dados = JSON.parse(txt.slice(0, fim + 1));
    }
    renderApp(dados);
  } catch (err) {
    const el = document.getElementById('app-error');
    const msg = document.getElementById('app-error-msg');
    if (el) el.hidden = false;
    if (msg) msg.textContent = ` ${err.message}`;
  }
}

function renderApp(dados) {
  renderMeta(dados.meta);
  renderHeroAvatars();
  renderMapaCampanha(dados);
  renderPersonagens(dados.pessoas, dados.emblemas_catalogo);
  renderGuild(dados.guild);
  renderEventos(dados.eventos, dados.emblemas_catalogo);
  renderRanking(dados.ranking_quinzena);
  renderMissoes(dados.missoes_organizacao);
  renderReconciliacao(dados.guild);
}

// ── Meta ──────────────────────────────────────────────────────────────────────

function renderMeta(meta) {
  const q = meta.quinzena;
  const lbl = document.getElementById('quinzena-label');
  const dates = document.getElementById('quinzena-dates');
  const ancora = document.getElementById('quinzena-ancora');
  if (lbl) lbl.textContent = `Capitulo: ${q.label}`;
  if (dates) dates.textContent = `${q.de} → ${q.ate}`;
  if (ancora) ancora.textContent = q.ancora;
}

// ── Personagens ───────────────────────────────────────────────────────────────

function renderPersonagens(pessoas, emblemasCatalogo) {
  const grid = document.getElementById('personagens-grid');
  if (!grid) return;
  grid.innerHTML = pessoas.map((p, i) => personagemCard(p, emblemasCatalogo, i)).join('');
}

function xpBarHtml(fr) {
  const xp_no_nivel = fr.xp_no_nivel;
  const xp_para_proximo = fr.xp_para_proximo;
  const total = xp_no_nivel + xp_para_proximo;
  const pct = total > 0 ? Math.round(xp_no_nivel / total * 100) : 0;
  const almost = xp_para_proximo > 0 && xp_para_proximo <= 2;
  const unid = xp_para_proximo === 1
    ? (fr.unidade === 'itens' ? 'item' : 'ponto')
    : fr.unidade;
  const hook = xp_para_proximo > 0
    ? `<span class="xp-hook${almost ? ' xp-hook--almost' : ''}">${almost ? '⚔ ' : ''}${xp_para_proximo} ${unid} até o Nível ${fr.nivel + 1}</span>`
    : `<span class="xp-hook">Nível recém-conquistado ✦</span>`;
  return `
    <div class="xp-bar${almost ? ' xp-bar--almost' : ''}" role="progressbar"
         aria-valuenow="${xp_no_nivel}" aria-valuemin="0" aria-valuemax="${total}"
         title="${xp_no_nivel}/${total} XP">
      <div class="xp-bar__fill" style="--xp-target:${pct}%"></div>
    </div>
    <span class="xp-text">${xp_no_nivel} / ${total} XP</span>
    ${hook}`;
}

function personagemCard(p, emblemasCatalogo, idx = 0) {
  const afast = p.afastamentos.length
    ? `<span class="tag tag--afastamento">${p.afastamentos.map(a => `${a.dias}d ${a.tipo}`).join(', ')}</span>`
    : '';

  // Banner de herói: retratos das 3 classes + epíteto multiclasse (3 títulos, sem ranking)
  const portraitsHtml = FRENTES.map(f => {
    const fr = p.frentes[f];
    return `
      <div class="hero-portrait" data-frente="${f}" title="${fr.classe} — ${fr.titulo} (Nível ${fr.nivel})">
        ${avatarHtml(f, fr.classe)}
        <span class="hero-portrait__classe">${fr.classe}</span>
      </div>`;
  }).join('');

  const epitetoHtml = FRENTES.map(f =>
    `<span class="epiteto-parte" data-frente="${f}">${p.frentes[f].titulo}</span>`
  ).join('<span class="epiteto-sep">·</span>');

  const frentesHtml = FRENTES.map(f => {
    const fr = p.frentes[f];
    return `
      <div class="frente-card" data-frente="${f}">
        <div class="frente-header">
          <span class="frente-label">${LABEL_FRENTE[f]}</span>
          <span class="frente-classe">${fr.classe}</span>
        </div>
        <div class="class-glyph-wrap">${CLASS_GLYPH[f]}</div>
        <div class="frente-nivel">
          <span class="nivel">Nível ${fr.nivel}</span>
          <span class="titulo-tier">${fr.titulo}</span>
        </div>
        ${xpBarHtml(fr)}
        <ul class="frente-stats">
          <li>Nesta quinzena: <strong>${fr.entregue_quinzena} ${fr.unidade}</strong></li>
          <li>Ritmo: <strong>${fr.vazao_quinzena} ${fr.unidade}/dia</strong></li>
          <li>XP acumulado: <strong>${fr.xp_total}</strong></li>
        </ul>
      </div>`;
  }).join('');

  const emblemasList = emblemasCatalogo ? emblemasCatalogo.lista : [];
  const emblemasHtml = p.emblemas_quinzena.length
    ? p.emblemas_quinzena.map(id => {
        const emb = emblemasList.find(e => e.id === id);
        const frente = emb ? emb.frente : '';
        const nome = emb ? emb.nome : id;
        return `<span class="emblema-chip" data-frente="${frente}">${nome}</span>`;
      }).join('')
    : '<em style="font-size:0.75rem;color:var(--color-text-muted)">Nenhuma conquista esta quinzena</em>';

  const historicoHtml = p.emblemas_historico.map(h =>
    `<li>${h.quinzena}: ${h.ids.length ? h.ids.join(', ') : 'nenhum'}</li>`
  ).join('');

  return `
    <article class="personagem-card hero-card" id="personagem-${p.id}" style="animation-delay:${idx * 0.07}s">
      <header class="hero-banner">
        <div class="hero-portraits" aria-hidden="true">${portraitsHtml}</div>
        <div class="hero-id">
          <h3 class="personagem-nome">${p.nome}</h3>
          <p class="hero-epiteto">${epitetoHtml}</p>
          <span class="dias-disp">⛺ ${p.dias_disponiveis} dias em campanha ${afast}</span>
        </div>
      </header>
      <div class="frentes-grid">${frentesHtml}</div>
      <section class="emblemas-section" aria-label="Conquistas da Quinzena">
        <h4>Conquistas da Quinzena</h4>
        <div class="emblemas-row">${emblemasHtml}</div>
      </section>
      <section class="historico-section" aria-label="Crônica de Conquistas">
        <h4>Crônica de Conquistas</h4>
        <ul>${historicoHtml}</ul>
      </section>
    </article>`;
}

// ── Mapa de Campanha (BLK-A14) ────────────────────────────────────────────────

function renderMapaCampanha(dados) {
  const container = document.getElementById('mapa-campanha-container');
  if (!container) return;
  const missoes = dados.missoes_organizacao || [];
  const opBacklog = dados.pessoas.reduce(
    (acc, p) => acc + (p.frentes.operacional.backlog.tarefas || 0), 0
  );
  const numProblemas = missoes.length + opBacklog;
  container.innerHTML = mapaCampanhaSVG(
    dados.guild, numProblemas,
    cssVar('--color-op'), cssVar('--color-prj'), cssVar('--color-ana')
  );
}

function mapaCampanhaSVG(guild, numProblemas, cOp, cPrj, cAna) {
  const gOp = guild.operacional;
  const gPrj = guild.projeto;
  const gAna = guild.analise;
  const pOp = Math.min(1, gOp.entregue_quinzena / gOp.camadas.stretch);
  const pPrj = Math.min(1, gPrj.entregue_quinzena / gPrj.camadas.stretch);
  const pAna = Math.min(1, gAna.entregue_quinzena / gAna.camadas.stretch);

  // Operacional: hex grid (7 hexes showing progress toward stretch)
  const hexLit = Math.round(pOp * 7);
  const hexSVG = [15, 33, 51, 69, 87, 105, 123].map((cx, i) => {
    const on = i < hexLit;
    return `<polygon points="9,0 4.5,8 -4.5,8 -9,0 -4.5,-8 4.5,-8" transform="translate(${cx},40)" fill="${on ? cOp : 'none'}" stroke="${cOp}" stroke-width="1" opacity="${on ? '0.82' : '0.12'}"/>`;
  }).join('');

  // Problema markers (one per open op task + per missao)
  const markerSVG = Array.from({ length: numProblemas }, (_, i) => {
    const col = i % 10;
    const row = Math.floor(i / 10);
    const mx = 6 + col * 17;
    const my = 60 + row * 12;
    return `<polygon class="mapa-problema" points="${mx + 4},${my} ${mx + 8},${my + 8} ${mx},${my + 8}" fill="${cOp}" opacity="0.65"/>`;
  }).join('');

  // Projeto: building blocks (5 cols × 2 rows, fills bottom-up)
  const blkLit = Math.round(pPrj * 10);
  const blockSVG = Array.from({ length: 10 }, (_, i) => {
    const col = i % 5;
    const row = Math.floor(i / 5);
    const bx = 12 + col * 34;
    const by = row === 0 ? 68 : 28;
    const on = i < blkLit;
    return `<rect x="${bx}" y="${by}" width="28" height="35" rx="3" fill="${on ? cPrj : 'none'}" stroke="${cPrj}" stroke-width="1" opacity="${on ? '0.75' : '0.12'}"/>`;
  }).join('');

  // Análise: fog recedes with progress
  const fogOp = Math.max(0.08, 0.82 - pAna * 0.74).toFixed(2);
  const dotSVG = [[20, 45], [45, 60], [70, 35], [95, 65], [120, 45], [150, 60], [165, 40]].map(([x, y]) =>
    `<circle cx="${x}" cy="${y}" r="5" fill="${cAna}" opacity="${Math.min(1, pAna * 1.8).toFixed(2)}"/>`
  ).join('');

  return `<svg class="mapa-campanha-svg" viewBox="0 0 570 120" role="img"
    aria-label="Mapa de Campanha — Op ${Math.round(pOp * 100)}%, Prj ${Math.round(pPrj * 100)}%, Ana ${Math.round(pAna * 100)}%">
    <rect x="1" y="1" width="179" height="118" rx="5" fill="${cOp}" opacity="0.04" stroke="${cOp}" stroke-width="1" stroke-opacity="0.3"/>
    <text x="89" y="13" text-anchor="middle" font-size="8" fill="${cOp}" opacity="0.85">TERRITORIO</text>
    ${hexSVG}${markerSVG}
    <g transform="translate(190,0)">
      <rect x="1" y="1" width="179" height="118" rx="5" fill="${cPrj}" opacity="0.04" stroke="${cPrj}" stroke-width="1" stroke-opacity="0.3"/>
      <text x="89" y="13" text-anchor="middle" font-size="8" fill="${cPrj}" opacity="0.85">CONSTRUCAO</text>
      ${blockSVG}
    </g>
    <g transform="translate(380,0)">
      <rect x="1" y="1" width="179" height="118" rx="5" fill="${cAna}" opacity="0.04" stroke="${cAna}" stroke-width="1" stroke-opacity="0.3"/>
      <text x="89" y="13" text-anchor="middle" font-size="8" fill="${cAna}" opacity="0.85">MAPA ENEVOADO</text>
      <rect x="3" y="18" width="174" height="98" rx="3" fill="${cAna}" opacity="0.05"/>
      ${dotSVG}
      <rect x="3" y="18" width="174" height="98" rx="3" fill="var(--color-bg)" opacity="${fogOp}"/>
    </g>
  </svg>`;
}

// ── Guild — visualizações temáticas (BLK-A12) ─────────────────────────────────

function guildHexGridViz(g, color) {
  const row1 = [10, 27, 44, 61, 78, 95, 112].map(x => [x, 12]);
  const row2 = [18, 35, 52, 70, 86, 103, 120].map(x => [x, 28]);
  const positions = [...row1, ...row2];
  const N = positions.length;
  const pct = Math.min(1, g.entregue_quinzena / g.camadas.stretch);
  const lit = Math.round(pct * N);
  const cmpN = Math.round(g.camadas.comprometida / g.camadas.stretch * N);
  const alvoN = Math.round(g.camadas.alvo / g.camadas.stretch * N);
  const hexes = positions.map(([cx, cy], i) => {
    const on = i < lit;
    const op = on ? (i < cmpN ? '0.85' : i < alvoN ? '0.65' : '0.45') : '0.12';
    return `<polygon points="10,0 5,9 -5,9 -10,0 -5,-9 5,-9" transform="translate(${cx},${cy})" fill="${on ? color : 'none'}" stroke="${color}" stroke-width="1" opacity="${op}"/>`;
  }).join('');
  return `<svg class="guild-viz guild-viz--hexgrid" viewBox="0 0 130 40" aria-hidden="true">${hexes}</svg>`;
}

function guildBuildingBlocksViz(g, color) {
  const N = 10;
  const pct = Math.min(1, g.entregue_quinzena / g.camadas.stretch);
  const lit = Math.round(pct * N);
  const cmpN = Math.round(g.camadas.comprometida / g.camadas.stretch * N);
  const alvoN = Math.round(g.camadas.alvo / g.camadas.stretch * N);
  const blocks = Array.from({ length: N }, (_, i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const x = col * 55 + 8;
    const y = (4 - row) * 16 + 4;
    const on = i < lit;
    const op = on ? (i < cmpN ? '0.8' : i < alvoN ? '0.6' : '0.4') : '0.12';
    return `<rect x="${x}" y="${y}" width="44" height="12" rx="2" fill="${on ? color : 'none'}" stroke="${color}" stroke-width="1" opacity="${op}"/>`;
  }).join('');
  return `<svg class="guild-viz guild-viz--blocks" viewBox="0 0 115 88" aria-hidden="true">${blocks}</svg>`;
}

function guildFogMapViz(g, color) {
  const pct = Math.min(1, g.entregue_quinzena / g.camadas.stretch);
  const fogOp = Math.max(0.08, 0.82 - pct * 0.74).toFixed(2);
  const nodes = [[20, 15, 5], [45, 28, 4], [70, 12, 6], [95, 32, 4], [120, 18, 5], [145, 28, 3]];
  const dots = nodes.map(([x, y, r], i) => {
    const op = Math.min(1, pct * 1.5 + i * 0.04).toFixed(2);
    return `<circle cx="${x}" cy="${y}" r="${r}" fill="${color}" opacity="${op}"/>`;
  }).join('');
  return `<svg class="guild-viz guild-viz--fog" viewBox="0 0 165 44" aria-hidden="true"><rect x="0" y="0" width="165" height="44" rx="4" fill="${color}" opacity="0.06"/>${dots}<rect x="0" y="0" width="165" height="44" rx="4" fill="var(--color-bg)" opacity="${fogOp}"/></svg>`;
}

function guildThematicViz(f, g, color) {
  if (f === 'operacional') return guildHexGridViz(g, color);
  if (f === 'projeto') return guildBuildingBlocksViz(g, color);
  return guildFogMapViz(g, color);
}

// ── Guild ─────────────────────────────────────────────────────────────────────

function renderGuild(guild) {
  const grid = document.getElementById('guild-grid');
  if (!grid) return;

  grid.innerHTML = FRENTES.map(f => {
    const g = guild[f];
    const objLabel = OBJETIVO_LABEL[g.objetivo] || g.objetivo;
    const proxima = g.proxima_camada
      ? `<li>Próxima: <strong>${g.proxima_camada}</strong> (faltam ${g.restante_para_proxima} ${g.unidade})</li>`
      : '';
    return `
      <div class="guild-card" data-frente="${f}">
        <h3>${LABEL_FRENTE[f]} — ${objLabel}</h3>
        ${guildThematicViz(f, g, cssVar(TOKEN_FRENTE[f]))}
        <ul class="guild-stats">
          <li>Entregue: <strong>${g.entregue_quinzena} ${g.unidade}</strong></li>
          <li>Camada atingida: <strong>${g.camada_atingida || '—'}</strong></li>
          ${proxima}
          <li>Comprometida: ${g.camadas.comprometida} · Alvo: ${g.camadas.alvo} · Stretch: ${g.camadas.stretch}</li>
        </ul>
        <canvas id="guild-chart-${f}" height="80"
                aria-label="Gráfico de camadas guild ${f}"></canvas>
        <div class="guild-contrib">
          <h4>Contribuições da quinzena</h4>
          <canvas id="guild-contrib-${f}" height="60"
                  aria-label="Contribuições por pessoa — ${f}"></canvas>
          <ul class="guild-contrib-lista" aria-hidden="true">
            ${Object.entries(g.contribuicoes_quinzena).map(([nome, val]) =>
              `<li>${nome}: <strong>${val} ${g.unidade}</strong></li>`
            ).join('')}
          </ul>
          <p>Total equipe: <strong>${g.total_equipe_quinzena} ${g.unidade}</strong></p>
        </div>
      </div>`;
  }).join('');

  FRENTES.forEach(f => {
    guildChart(f, guild[f]);
    guildContribChart(f, guild[f]);
  });
}

function guildChart(f, g) {
  const canvas = document.getElementById(`guild-chart-${f}`);
  if (!canvas || typeof Chart === 'undefined') return;
  const { comprometida, alvo, stretch } = g.camadas;
  const entregue = g.entregue_quinzena;
  const cor = cssVar(TOKEN_FRENTE[f]);
  const tickColor = cssVar('--color-text-muted');
  const gridColor = cssVar('--color-border');

  new Chart(canvas, {
    type: 'bar',
    data: {
      labels: ['Meta (camadas)', 'Entregue'],
      datasets: [
        {
          label: `Comprometida (${comprometida})`,
          data: [comprometida, null],
          backgroundColor: cor + '33',
          borderColor: cor + '77',
          borderWidth: 1,
          stack: 'meta',
        },
        {
          label: `Alvo (+${alvo - comprometida})`,
          data: [alvo - comprometida, null],
          backgroundColor: cor + '55',
          borderColor: cor,
          borderWidth: 1,
          stack: 'meta',
        },
        {
          label: `Stretch (+${stretch - alvo})`,
          data: [stretch - alvo, null],
          backgroundColor: cor + '22',
          borderColor: cor + '55',
          borderWidth: 1,
          borderDash: [4, 4],
          stack: 'meta',
        },
        {
          label: `Entregue (${entregue})`,
          data: [null, entregue],
          backgroundColor: cor,
          stack: 'real',
        },
      ],
    },
    options: {
      indexAxis: 'y',
      responsive: true,
      plugins: {
        legend: { position: 'bottom', labels: { boxWidth: 10, color: tickColor } },
        tooltip: {
          callbacks: {
            label: ctx => `${ctx.dataset.label}: ${ctx.parsed.x} ${g.unidade}`,
          },
        },
      },
      scales: {
        x: {
          stacked: true,
          beginAtZero: true,
          ticks: { color: tickColor },
          grid: { color: gridColor },
        },
        y: {
          stacked: true,
          ticks: { color: tickColor },
          grid: { display: false },
        },
      },
    },
  });
}

function guildContribChart(f, g) {
  const canvas = document.getElementById(`guild-contrib-${f}`);
  if (!canvas || typeof Chart === 'undefined') return;
  const entries = Object.entries(g.contribuicoes_quinzena);
  const cor = cssVar(TOKEN_FRENTE[f]);
  const tickColor = cssVar('--color-text-muted');
  const gridColor = cssVar('--color-border');

  new Chart(canvas, {
    type: 'bar',
    data: {
      labels: entries.map(([nome]) => nome),
      datasets: [{
        label: `${g.unidade} entregues`,
        data: entries.map(([, val]) => val),
        backgroundColor: cor + '88',
        borderColor: cor,
        borderWidth: 1,
      }],
    },
    options: {
      indexAxis: 'y',
      responsive: true,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: ctx => `${ctx.parsed.x} ${g.unidade}`,
          },
        },
      },
      scales: {
        x: {
          beginAtZero: true,
          ticks: { color: tickColor },
          grid: { color: gridColor },
        },
        y: {
          ticks: { color: tickColor },
          grid: { display: false },
        },
      },
    },
  });
}

// ── Eventos / Hordas ──────────────────────────────────────────────────────────

function renderEventos(eventos, emblemasCatalogo) {
  const container = document.getElementById('eventos-lista');
  if (!container) return;
  const lista = eventos ? eventos.lista || [] : [];
  if (!lista.length) {
    container.innerHTML = '<p class="section-note">Nenhum evento nesta quinzena.</p>';
    return;
  }
  container.innerHTML = lista.map(ev => eventoCard(ev)).join('');
}

function eventoCard(ev) {
  const status = ev.concluido
    ? '<span class="evento-status evento-status--done">Concluído</span>'
    : `<span class="evento-status evento-status--open">Aberto · restante: ${ev.restante}</span>`;

  const tarefasHtml = (ev.tarefas || []).map(t => `
    <li>${t.nome} (${t.assignee}) — ${t.complexidade} · ${t.pontos} pts · ${t.concluida ? '✓' : '○'}</li>
  `).join('');

  return `
    <div class="evento-card" data-frente="${ev.frente}">
      <div class="evento-header">
        <h3>${ev.nome}</h3>
        ${status}
      </div>
      <div class="evento-stats">
        Frente: <strong>${LABEL_FRENTE[ev.frente] || ev.frente}</strong> ·
        HP: <strong>${ev.hp} ${ev.unidade}</strong>
      </div>
      <div class="evento-tarefas">
        <h4>Tarefas</h4>
        <ul>${tarefasHtml}</ul>
      </div>
    </div>`;
}

// ── Ranking ───────────────────────────────────────────────────────────────────

function renderRanking(ranking_quinzena) {
  const grid = document.getElementById('ranking-grid');
  if (!grid) return;
  grid.innerHTML = FRENTES.map(f => {
    const r = ranking_quinzena[f];
    if (!r) return '';
    const linhas = r.ordem.map(item => `
      <tr>
        <td>${item.pos}º ${item.pessoa}</td>
        <td>${item.valor}</td>
        <td>${item.vazao}</td>
      </tr>`).join('');
    return `
      <div class="ranking-card" data-frente="${f}">
        <h3>${LABEL_FRENTE[f]}</h3>
        <table class="ranking-table" aria-label="Ranking ${f}">
          <thead>
            <tr><th>Jogador</th><th>Valor</th><th>Vazão/dia</th></tr>
          </thead>
          <tbody>${linhas}</tbody>
        </table>
        <p class="ranking-unidade">Unidade: ${r.unidade}</p>
      </div>`;
  }).join('');
}

// ── Missões de Organização ────────────────────────────────────────────────────

function renderMissoes(missoes_organizacao) {
  const lista = document.getElementById('missoes-lista');
  if (!lista) return;
  if (!missoes_organizacao || !missoes_organizacao.length) {
    lista.innerHTML = '<li class="section-note">Nenhuma missão de organização — tudo tagueado!</li>';
    return;
  }
  lista.innerHTML = missoes_organizacao.map(m => `
    <li class="missao-item">
      <span>${m.nome} <em style="font-size:0.75rem;color:var(--color-text-muted)">(${m.assignee})</em></span>
      <span class="missao-motivo">${m.motivo}</span>
    </li>`).join('');
}

// ── Reconciliação ─────────────────────────────────────────────────────────────

function renderReconciliacao(guild) {
  const grid = document.getElementById('reconciliacao-grid');
  if (!grid) return;
  grid.innerHTML = FRENTES.map(f => {
    const g = guild[f];
    const linhas = Object.entries(g.contribuicoes_quinzena).map(([nome, val]) => `
      <tr><td>${nome}</td><td>${val}</td></tr>`).join('');
    return `
      <div class="reconciliacao-card" data-frente="${f}">
        <h3>${LABEL_FRENTE[f]}</h3>
        <table class="reconciliacao-table" aria-label="Reconciliação ${f}">
          <thead>
            <tr><th>Pessoa</th><th>${g.unidade}</th></tr>
          </thead>
          <tbody>
            ${linhas}
            <tr class="reconciliacao-total">
              <td>Total equipe</td>
              <td>${g.total_equipe_quinzena}</td>
            </tr>
          </tbody>
        </table>
      </div>`;
  }).join('');
}

main();
