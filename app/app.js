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

const OBJETIVO_LABEL = {
  territorio: 'Conquista de Território',
  construcao: 'Construção da Base',
  mapa_insights: 'Mapa de Insights',
};

async function main() {
  try {
    const resp = await fetch('dados.json');
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    const dados = await resp.json();
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
  if (lbl) lbl.textContent = q.label;
  if (dates) dates.textContent = `${q.de} → ${q.ate}`;
  if (ancora) ancora.textContent = q.ancora;
}

// ── Personagens ───────────────────────────────────────────────────────────────

function renderPersonagens(pessoas, emblemasCatalogo) {
  const grid = document.getElementById('personagens-grid');
  if (!grid) return;
  grid.innerHTML = pessoas.map(p => personagemCard(p, emblemasCatalogo)).join('');
}

function xpBarHtml(xp_no_nivel, xp_para_proximo) {
  const total = xp_no_nivel + xp_para_proximo;
  const pct = total > 0 ? Math.round(xp_no_nivel / total * 100) : 0;
  return `
    <div class="xp-bar" role="progressbar"
         aria-valuenow="${xp_no_nivel}" aria-valuemin="0" aria-valuemax="${total}"
         title="${xp_no_nivel}/${total} XP">
      <div class="xp-bar__fill" style="width:${pct}%"></div>
    </div>
    <span class="xp-text">${xp_no_nivel} / ${total} XP</span>`;
}

function personagemCard(p, emblemasCatalogo) {
  const afast = p.afastamentos.length
    ? `<span class="tag tag--afastamento">${p.afastamentos.map(a => `${a.dias}d ${a.tipo}`).join(', ')}</span>`
    : '';

  const frentesHtml = FRENTES.map(f => {
    const fr = p.frentes[f];
    return `
      <div class="frente-card" data-frente="${f}">
        <div class="frente-header">
          <span class="frente-label">${LABEL_FRENTE[f]}</span>
          <span class="frente-classe">${fr.classe}</span>
        </div>
        <div class="frente-nivel">
          <span class="nivel">Nível ${fr.nivel}</span>
          <span class="titulo-tier">${fr.titulo}</span>
        </div>
        ${xpBarHtml(fr.xp_no_nivel, fr.xp_para_proximo)}
        <ul class="frente-stats">
          <li>Quinzena: <strong>${fr.entregue_quinzena} ${fr.unidade}</strong></li>
          <li>Vazão: <strong>${fr.vazao_quinzena} ${fr.unidade}/dia</strong></li>
          <li>Total XP: <strong>${fr.xp_total}</strong></li>
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
    : '<em style="font-size:0.75rem;color:var(--color-text-muted)">Nenhum emblema esta quinzena</em>';

  const historicoHtml = p.emblemas_historico.map(h =>
    `<li>${h.quinzena}: ${h.ids.length ? h.ids.join(', ') : 'nenhum'}</li>`
  ).join('');

  return `
    <article class="personagem-card" id="personagem-${p.id}">
      <header class="personagem-header">
        <h3 class="personagem-nome">${p.nome}</h3>
        <span class="dias-disp">${p.dias_disponiveis} dias disponíveis ${afast}</span>
      </header>
      <div class="frentes-grid">${frentesHtml}</div>
      <section class="emblemas-section" aria-label="Emblemas da Quinzena">
        <h4>Emblemas da Quinzena</h4>
        <div class="emblemas-row">${emblemasHtml}</div>
      </section>
      <section class="historico-section" aria-label="Histórico de Emblemas">
        <h4>Histórico de Emblemas</h4>
        <ul>${historicoHtml}</ul>
      </section>
    </article>`;
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
