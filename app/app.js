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

/* Medalhão de conquista: estrela facetada (fallback genérico, tingida pela frente) */
const MEDAL_GLYPH = `<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" focusable="false"><path d="M12 3l2.5 5.4 5.9.5-4.5 3.9 1.4 5.8L12 21l-5.7 3.1 1.4-5.8L3.2 8.9l5.9-.5z" fill="currentColor" fill-opacity="0.85" stroke="currentColor" stroke-width="0.8" stroke-linejoin="round"/></svg>`;

/* Ícone próprio por emblema — cada conquista tem seu símbolo (nunca repete). */
const EMBLEMA_ICON = {
  // Operacional (Guerreiro)
  op_batedor: `<svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true" focusable="false"><g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 19 L18 6"/><path d="M12 6 H18 V12"/></g></svg>`,
  op_ceifador: `<svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true" focusable="false"><g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 21 L15 7"/><path d="M15 7 C11.5 6 7.5 7.5 6 11.5"/></g></svg>`,
  op_senhor_hordas: `<svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true" focusable="false"><g stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"><path d="M6 11a6 6 0 0 1 12 0v3a2 2 0 0 1-2 2v2h-2v-1.5h-2V19H8v-2a2 2 0 0 1-2-2z" fill="currentColor" fill-opacity="0.14"/><circle cx="9.5" cy="11.5" r="1.6" fill="currentColor" stroke="none"/><circle cx="14.5" cy="11.5" r="1.6" fill="currentColor" stroke="none"/></g></svg>`,
  // Projeto (Engenheiro)
  prj_construtor: `<svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true" focusable="false"><g stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" fill="none"><path d="M6 6.5h9l-1.2 3.2H7.2z" fill="currentColor" fill-opacity="0.2"/><line x1="10.6" y1="9.7" x2="12.6" y2="20"/></g></svg>`,
  prj_engenheiro_mestre: `<svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true" focusable="false"><path d="M15.6 6.4a3.6 3.6 0 0 0-4.5 4.5l-5.7 5.7a1.6 1.6 0 0 0 2.3 2.3l5.7-5.7a3.6 3.6 0 0 0 4.5-4.5l-2.3 2.3-2-.5-.5-2z" fill="currentColor" fill-opacity="0.2" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/></svg>`,
  prj_arquiteto_chefe: `<svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true" focusable="false"><g fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="5" r="1.5" fill="currentColor"/><path d="M12 6.5 L7.5 19"/><path d="M12 6.5 L16.5 19"/><path d="M9.7 13.2a5 3 0 0 0 4.6 0"/></g></svg>`,
  // Análise (Mago)
  ana_alquimista: `<svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true" focusable="false"><g fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M10 3h4M11 3.5v5.5l-4.4 7.7A1.5 1.5 0 0 0 7.9 19h8.2a1.5 1.5 0 0 0 1.3-2.3L13 9V3.5"/><path d="M8.7 14.5h6.6" stroke-width="1.4"/></g></svg>`,
  ana_vidente: `<svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true" focusable="false"><g fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"><path d="M3 12s3.5-6 9-6 9 6 9 6-3.5 6-9 6-9-6-9-6z"/><circle cx="12" cy="12" r="2.5" fill="currentColor" stroke="none"/></g></svg>`,
  ana_oraculo: `<svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true" focusable="false"><g stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"><circle cx="12" cy="10" r="6" fill="currentColor" fill-opacity="0.16"/><path d="M7 19h10l-1.4-3H8.4z" fill="currentColor" fill-opacity="0.16"/><path d="M9.5 9.2a3.2 3.2 0 0 1 3-2.2" fill="none" stroke-width="1.3"/></g></svg>`,
};

function emblemaGlyph(id) {
  return EMBLEMA_ICON[id] || MEDAL_GLYPH;
}

/* Glyphs de classe (SVG inline, zero request externa) — espada / engrenagem / cajado.
   engrenagemPath e faiscaMagica são function declarations (hoisted), definidas abaixo. */
const CLASS_GLYPH = {
  operacional: `<svg class="class-glyph" viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" focusable="false"><g transform="rotate(45 12 12)"><path fill="currentColor" fill-rule="evenodd" d="M12 1.5 L14.2 5.8 V12.3 H9.8 V5.8 Z M11.85 4 H12.15 V11.4 H11.85 Z"/><path fill="currentColor" d="M5.8 12.3 C6.5 15 8.3 14.9 9.5 13.6 L14.5 13.6 C15.7 14.9 17.5 15 18.2 12.3 L16.8 11.9 L7.2 11.9 Z"/><rect x="10.9" y="13.6" width="2.2" height="4" fill="currentColor"/><circle cx="12" cy="19.3" r="1.95" fill="currentColor"/></g></svg>`,
  projeto: `<svg class="class-glyph" viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" focusable="false"><path d="${engrenagemPath(12, 12, 8, 11, 7, 3.6)}" fill="currentColor" fill-rule="evenodd"/></svg>`,
  analise: `<svg class="class-glyph" viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" focusable="false"><path d="M8.5 21.5 L12.9 9.6" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"/><path d="M12.9 9.6 C13.5 7.4 16.1 6.5 17.5 8.1 C18.7 9.5 17.8 11.7 15.8 11.6 C14.5 11.5 13.9 10.3 14.5 9.2" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/><path d="${faiscaMagica(5.8, 7.6, 2.3)}" fill="currentColor"/><path d="${faiscaMagica(18.6, 14.2, 1.7)}" fill="currentColor"/><path d="${faiscaMagica(9.6, 3.4, 1.6)}" fill="currentColor"/><path d="${faiscaMagica(16.6, 4.6, 1.3)}" fill="currentColor"/></svg>`,
};

// Auto-refresh: enquanto o app está aberto, ele re-busca o dados.json a cada
// REFRESH_MS. Quando o produtor (hoje o cowork; amanhã o backend) publicar um
// snapshot novo, o painel se atualiza sozinho — sem F5. Pura apresentação.
const REFRESH_MS = 60000;

// Instâncias Chart.js vivas — destruídas antes de cada re-render p/ não vazar
// nem colidir ("Canvas is already in use") a cada atualização.
const CHARTS = [];
function destroyCharts() {
  while (CHARTS.length) {
    try { CHARTS.pop().destroy(); } catch { /* já removido do DOM */ }
  }
}

async function fetchDados() {
  // cache-busting + no-store: dados.json muda com frequência; evita o navegador
  // reusar uma cópia velha/corrompida (mesma origem, sem request externa).
  const resp = await fetch(`dados.json?t=${Date.now()}`, { cache: 'no-store' });
  if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
  try {
    return await resp.json();
  } catch (parseErr) {
    // Rede de segurança: o produtor às vezes anexa lixo após o JSON (visto em
    // snapshots). Recupera o objeto JSON válido do prefixo do texto.
    const txt = await (await fetch(`dados.json?t=${Date.now()}`, { cache: 'no-store' })).text();
    const fim = txt.lastIndexOf('}');
    if (fim === -1) throw parseErr;
    return JSON.parse(txt.slice(0, fim + 1));
  }
}

async function carregar(primeira = false) {
  try {
    const dados = await fetchDados();
    renderApp(dados);
    const el = document.getElementById('app-error');
    if (el) el.hidden = true;
  } catch (err) {
    // Na 1ª carga mostra o erro; num refresh que falhou, mantém o último render
    // bom na tela (não pisca/apaga o painel por uma falha transitória de rede).
    if (primeira) {
      const el = document.getElementById('app-error');
      const msg = document.getElementById('app-error-msg');
      if (el) el.hidden = false;
      if (msg) msg.textContent = ` ${err.message}`;
    }
  }
}

async function main() {
  await carregar(true);
  setInterval(() => carregar(false), REFRESH_MS);
}

function renderApp(dados) {
  destroyCharts();
  renderMeta(dados.meta);
  renderMapaCampanha(dados);
  renderPersonagens(dados.pessoas, dados.emblemas_catalogo, diasEmCampanha(dados.meta));
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

function renderPersonagens(pessoas, emblemasCatalogo, diasCamp = 0) {
  const grid = document.getElementById('personagens-grid');
  if (!grid) return;
  grid.innerHTML = pessoas.map((p, i) => personagemCard(p, emblemasCatalogo, i, diasCamp)).join('');
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

/* Classe dominante = frente de maior nível (desempate: maior xp_total, depois ordem op>prj>ana).
   Puramente cosmético (cor da moldura) — não é score, não soma frentes, não rankeia pessoas. */
function classeDominante(p) {
  let best = FRENTES[0];
  for (const f of FRENTES) {
    const a = p.frentes[f], b = p.frentes[best];
    if (a.nivel > b.nivel || (a.nivel === b.nivel && a.xp_total > b.xp_total)) best = f;
  }
  return best;
}

const UNIDADE_ABBR = { itens: 'itens', pontos: 'pts' };

/* Banda da moldura evolutiva (1→4) a partir do tier da classe (Rocket-League-like). */
function frameBand(tier) {
  return tier >= 7 ? 4 : tier >= 5 ? 3 : tier >= 3 ? 2 : 1;
}

/* Medalhão pequeno de uma conquista (para a crônica) — nome no title/hover. */
function emblemaMiniHTML(id, catalogo) {
  const lista = catalogo ? catalogo.lista : [];
  const emb = lista.find(e => e.id === id);
  const frente = emb ? emb.frente : '';
  const nome = emb ? emb.nome : id;
  return `<span class="emblema-mini" data-frente="${frente}" title="${nome}">${emblemaGlyph(id)}</span>`;
}

/* Corpo de engrenagem (Engenheiro): anel dentado c/ dentes trapezoidais e furo central
   (evenodd) p/ o número. g < π/(2N) garante flancos positivos (dentes de verdade). */
function engrenagemPath(cx, cy, N, Ro, Ri, furo) {
  const meio = Math.PI / N;
  const g = meio * 0.4; // meia-largura do topo/vale do dente (dentes grossos)
  const P = (ang, r) => `${(cx + r * Math.cos(ang)).toFixed(2)} ${(cy + r * Math.sin(ang)).toFixed(2)}`;
  let d = '';
  for (let i = 0; i < N; i++) {
    const a = (i / N) * Math.PI * 2 - Math.PI / 2;
    d += (i === 0 ? 'M' : 'L') + P(a - g, Ro);       // topo do dente (início)
    d += 'L' + P(a + g, Ro);                          // topo do dente (fim)
    d += 'L' + P(a + meio - g, Ri);                   // desce pro vale
    d += 'L' + P(a + meio + g, Ri);                   // vale
  }
  d += 'Z';
  // furo central (círculo em arcos) — com fill-rule="evenodd" vira o vazado do centro
  d += ` M${(cx + furo).toFixed(2)} ${cy} A${furo} ${furo} 0 1 0 ${(cx - furo).toFixed(2)} ${cy}`;
  d += ` A${furo} ${furo} 0 1 0 ${(cx + furo).toFixed(2)} ${cy} Z`;
  return d;
}

/* Faísca de 4 pontas (magia) centrada em (x,y), raio s. */
function faiscaMagica(x, y, s) {
  const c = s * 0.3;
  const p = (dx, dy) => `${(x + dx).toFixed(1)} ${(y + dy).toFixed(1)}`;
  return `M${p(0, -s)} L${p(c, -c)} L${p(s, 0)} L${p(c, c)} L${p(0, s)} L${p(-c, c)} L${p(-s, 0)} L${p(-c, -c)} Z`;
}

/* Língua de chama: da base (x,base) sobe h, com balanço em S. */
function chamaPath(x, base, w, h) {
  const n = (v) => v.toFixed(1);
  return `M${x} ${base} C${n(x - w)} ${n(base - h * 0.4)} ${n(x + w * 0.6)} ${n(base - h * 0.6)} ${x} ${n(base - h)} C${n(x - w * 0.6)} ${n(base - h * 0.6)} ${n(x + w)} ${n(base - h * 0.4)} ${x} ${base} Z`;
}

/* Moldura do nível por classe:
   Guerreiro = escudo · Engenheiro = engrenagem · Mago = livro aberto soltando magia.
   Cosmético, colorido por frente via currentColor. O número fica sobreposto. */
function molduraNivelSVG(frente) {
  if (frente === 'projeto') {
    // corpo grosso (30→46) + dentes curtos (46→58) = engrenagem de verdade, não "sol"
    const d = engrenagemPath(60, 66, 10, 58, 46, 30);
    const parafusos = Array.from({ length: 6 }, (_, i) => {
      const a = (i / 6) * Math.PI * 2 - Math.PI / 2;
      const x = (60 + 38 * Math.cos(a)).toFixed(1);
      const y = (66 + 38 * Math.sin(a)).toFixed(1);
      return `<circle class="engrenagem-parafuso" cx="${x}" cy="${y}" r="1.9"/>`;
    }).join('');
    return `<svg class="escudo-svg" viewBox="0 0 120 132" aria-hidden="true">
      <path class="escudo-corpo" fill="url(#esc-fill-${frente})" fill-rule="evenodd" d="${d}"/>
      <circle class="escudo-borda" cx="60" cy="66" r="34" fill="none"/>
      ${parafusos}
      <g class="escudo-glints">
        <circle cx="60" cy="14" r="1.7"/>
        <circle cx="104" cy="82" r="1.4"/>
        <circle cx="18" cy="80" r="1.5"/>
      </g>
    </svg>`;
  }
  if (frente === 'analise') {
    // fogo roxo lambendo em volta do grimório (bases na borda superior, sobem)
    const fogo = [
      chamaPath(60, 30, 9, 30),
      chamaPath(44, 28, 7, 25),
      chamaPath(78, 29, 7.5, 26),
      chamaPath(30, 34, 6, 20),
      chamaPath(92, 33, 6, 21),
    ].map(d => `<path d="${d}"/>`).join('');
    return `<svg class="escudo-svg" viewBox="0 0 120 132" aria-hidden="true">
      <g class="grimorio-fogo" aria-hidden="true">${fogo}</g>
      <!-- bloco de páginas atrás (dá espessura de tomo: aparece à direita e embaixo) -->
      <rect class="grimorio-paginas" x="31" y="25" width="70" height="96" rx="6"/>
      <path class="grimorio-fio" d="M96 38 H101 M96 48 H101 M96 58 H101 M96 68 H101 M96 78 H101 M96 88 H101 M96 98 H101 M96 108 H101"/>
      <!-- capa do grimório (frente) — centrada em y≈66 p/ o nível ficar no meio do selo -->
      <rect class="escudo-corpo" x="24" y="18" width="72" height="96" rx="6" fill="url(#esc-fill-${frente})"/>
      <!-- lombada (esquerda) -->
      <path class="grimorio-lombada" d="M30 24 V108 M33 24 V108"/>
      <!-- moldura ornamentada + cantos + selo central (onde entra o nível, x≈60) -->
      <rect class="escudo-borda" x="38" y="25" width="44" height="82" rx="4" fill="none"/>
      <path class="grimorio-canto" d="M42 30 h6 M42 30 v6 M78 30 h-6 M78 30 v6 M42 102 h6 M42 102 v-6 M78 102 h-6 M78 102 v-6"/>
      <circle class="grimorio-selo" cx="60" cy="66" r="20" fill="none"/>
      <g class="escudo-glints">
        <circle cx="44" cy="104" r="1.4"/>
        <circle cx="82" cy="34" r="1.4"/>
      </g>
    </svg>`;
  }
  return `<svg class="escudo-svg" viewBox="0 0 120 132" aria-hidden="true">
      <path class="escudo-corpo" fill="url(#esc-fill-${frente})" d="M60 8 L112 24 V62 C112 98 90 120 60 130 C30 120 8 98 8 62 V24 Z"/>
      <path class="escudo-borda" d="M60 18 L103 31 V62 C103 92 84 110 60 119 C36 110 17 92 17 62 V31 Z"/>
      <path class="escudo-crista" d="M22 41 L60 31 L98 41"/>
      <circle class="escudo-rebite" cx="24" cy="31" r="3.2"/>
      <circle class="escudo-rebite" cx="96" cy="31" r="3.2"/>
      <g class="escudo-glints">
        <circle cx="34" cy="40" r="1.7"/>
        <circle cx="90" cy="52" r="1.3"/>
        <circle cx="46" cy="106" r="1.5"/>
      </g>
    </svg>`;
}

function escudoNivelHtml(frente, nivel) {
  // Engenheiro solta faíscas no hover (só o Projeto carrega as partículas).
  const faiscas = frente === 'projeto'
    ? `<span class="faiscas" aria-hidden="true">${
        Array.from({ length: 5 }, () => '<i class="faisca"></i>').join('')
      }</span>`
    : '';
  return `<div class="nivel-escudo" data-frente="${frente}">
    ${faiscas}
    ${molduraNivelSVG(frente)}
    <span class="nivel-num">${nivel}</span>
  </div>`;
}

/* Dias em campanha = dias ÚTEIS (seg–sex) do início da quinzena até hoje (limitado ao
   fim da janela). Cálculo de calendário no app — não é scoring. */
function diasUteisEntre(inicio, fim) {
  let n = 0;
  const d = new Date(inicio);
  while (d <= fim) {
    const dow = d.getDay();
    if (dow !== 0 && dow !== 6) n++;
    d.setDate(d.getDate() + 1);
  }
  return n;
}

function diasEmCampanha(meta) {
  const q = meta.quinzena;
  const de = new Date(q.de + 'T00:00:00');
  const ate = new Date(q.ate + 'T00:00:00');
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  if (hoje < de) return 0;
  const fim = hoje < ate ? hoje : ate;
  return diasUteisEntre(de, fim);
}

function personagemCard(p, emblemasCatalogo, idx = 0, diasCamp = 0) {
  const dom = classeDominante(p);
  const afast = p.afastamentos.length
    ? `<span class="tag tag--afastamento">${p.afastamentos.map(a => `${a.dias}d ${a.tipo}`).join(', ')}</span>`
    : '';

  // Banner de herói: um único rosto — o da classe dominante (as outras classes
  // já aparecem detalhadas nos frente-cards abaixo, então evitamos redundância).
  const domFr = p.frentes[dom];
  const portraitsHtml = `
    <div class="hero-face" data-frente="${dom}" title="${domFr.classe} — ${domFr.titulo} (Nível ${domFr.nivel})">
      ${avatarHtml(dom, domFr.classe)}
    </div>`;

  const epitetoHtml = FRENTES.map(f =>
    `<span class="epiteto-parte" data-frente="${f}">${p.frentes[f].titulo}</span>`
  ).join('<span class="epiteto-sep">·</span>');

  const frentesHtml = FRENTES.map(f => {
    const fr = p.frentes[f];
    const unid = UNIDADE_ABBR[fr.unidade] || fr.unidade;
    const ehDom = f === dom;
    const backlogTf = fr.backlog ? fr.backlog.tarefas : 0;
    const band = frameBand(fr.tier);
    return `
      <div class="frente-card" data-frente="${f}" data-frame="${band}"${ehDom ? ' data-dominante="true"' : ''}>
        <div class="frente-header">
          <span class="frente-classe-nome">${fr.classe}${ehDom ? '<span class="dom-star" title="Classe dominante">★</span>' : ''}</span>
          <span class="class-glyph-wrap">${CLASS_GLYPH[f]}</span>
        </div>
        <div class="nivel-hero">
          ${escudoNivelHtml(f, fr.nivel)}
          <span class="nivel-titulo">${fr.titulo}</span>
          <span class="nivel-sub">Tier ${fr.tier} · ${LABEL_FRENTE[f]}</span>
        </div>
        ${xpBarHtml(fr)}
        <div class="frente-mini-stats">
          <span class="mini-stat"><b>${fr.entregue_quinzena}</b> ${unid} na quinzena</span>
          <span class="mini-stat"><b>${fr.vazao_quinzena}</b> ${unid}/dia</span>
          <span class="mini-stat"><b>${backlogTf}</b> no backlog</span>
        </div>
      </div>`;
  }).join('');

  const emblemasList = emblemasCatalogo ? emblemasCatalogo.lista : [];
  const emblemasHtml = p.emblemas_quinzena.length
    ? p.emblemas_quinzena.map(id => {
        const emb = emblemasList.find(e => e.id === id);
        const frente = emb ? emb.frente : '';
        const nome = emb ? emb.nome : id;
        return `<span class="emblema-chip" data-frente="${frente}" title="${nome}">
          <span class="emblema-disco">${emblemaGlyph(id)}</span>
          <span class="emblema-nome">${nome}</span>
        </span>`;
      }).join('')
    : '<em style="font-size:0.75rem;color:var(--color-text-muted)">Nenhuma conquista esta quinzena</em>';

  const historicoHtml = p.emblemas_historico.map(h =>
    `<li class="cronica-linha">
      <span class="cronica-quinzena">${h.quinzena}</span>
      <span class="cronica-medalhas">${
        h.ids.length
          ? h.ids.map(id => emblemaMiniHTML(id, emblemasCatalogo)).join('')
          : '<em class="cronica-vazio">sem conquistas</em>'
      }</span>
    </li>`
  ).join('');

  return `
    <article class="personagem-card hero-card" id="personagem-${p.id}"
             data-classe-dominante="${dom}" style="animation-delay:${idx * 0.07}s">
      <header class="hero-banner">
        <div class="hero-portraits" aria-hidden="true">${portraitsHtml}</div>
        <div class="hero-id">
          <h3 class="personagem-nome">${p.nome}</h3>
          <p class="hero-epiteto">${epitetoHtml}</p>
          <div class="hero-meta-row">
            <span class="dias-disp" title="Dias úteis desde o início da quinzena até hoje">⛺ ${diasCamp} dias em campanha ${afast}</span>
          </div>
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

// ── Mapa de Campanha — territórios de projeto (data-driven do ClickUp via dados.projetos) ──
// Cada projeto (lista do ClickUp) é um território. Progresso = tarefas concluídas ÷ total
// (binário/determinístico — só `concluído` conta). Tarefas abertas/bloqueadas = obstáculos.
// O app NUNCA lê o ClickUp: consome o snapshot que o produtor grava em dados.projetos.

function renderMapaCampanha(dados) {
  const container = document.getElementById('mapa-campanha-container');
  if (!container) return;
  const proj = dados.projetos;
  if (!proj || !Array.isArray(proj.lista) || !proj.lista.length) {
    container.innerHTML = '<p class="section-note">Sem dados de projetos nesta atualização.</p>';
    return;
  }
  // Trilha/jornada: cada projeto é uma PARADA; a estrada entre paradas acende
  // quando a parada anterior está pacificada (metáfora de avanço na campanha).
  let trilha = '';
  proj.lista.forEach((p, i) => {
    if (i > 0) {
      const ant = proj.lista[i - 1];
      const feita = !(ant.abertas || 0) && !(ant.bloqueadas || 0);
      trilha += `<div class="trilha-estrada${feita ? ' trilha-estrada--feita' : ''}" aria-hidden="true"></div>`;
    }
    trilha += projetoTerritorioHTML(p, i);
  });
  const fonte = proj.fonte ? ` · ${proj.fonte}` : '';
  const data = proj.atualizado_em ? `Atualizado em ${proj.atualizado_em}` : '';
  container.innerHTML = `
    <div class="mapa-trilha">${trilha}</div>
    <p class="mapa-fonte">${data}${fonte}</p>`;
}

// Mantém referência ao contrato antigo para o produtor (guild.entregue_quinzena /
// camadas.stretch alimentam a Campanha da Guilda; o mapa agora usa projetos).
function projetoTerritorioHTML(p, idx = 0) {
  const total = p.total || 0;
  const prog = total > 0 ? (p.progresso != null ? p.progresso : p.concluidas / total) : 0;
  const pct = Math.round(prog * 100);
  const cLand = cssVar('--color-success');

  // Parada da trilha: marco circular com ANEL de progresso (conquista da tarefa).
  const R = 34;
  const C = 2 * Math.PI * R;
  const off = C * (1 - prog);

  const aberta = p.abertas || 0;
  const bloq = p.bloqueadas || 0;
  const pacificado = !aberta && !bloq;
  const obstaculos = (aberta || bloq)
    ? `${aberta ? `<span class="obst obst--aberta">⚔ ${aberta} aberta${aberta > 1 ? 's' : ''}</span>` : ''}${bloq ? `<span class="obst obst--bloq">⛔ ${bloq} bloqueada${bloq > 1 ? 's' : ''}</span>` : ''}`
    : '<span class="obst obst--limpo">✦ território pacificado</span>';

  // Pino/bandeira da parada — resume o estado (pacificado / bloqueada / aberta)
  const pino = pacificado
    ? '<span class="parada-pino parada-pino--feito" title="Território pacificado">✦</span>'
    : bloq
      ? `<span class="parada-pino parada-pino--bloq" title="${bloq} bloqueada${bloq > 1 ? 's' : ''}">⛔</span>`
      : `<span class="parada-pino parada-pino--aberta" title="${aberta} aberta${aberta > 1 ? 's' : ''}">⚔</span>`;

  return `
    <article class="mapa-projeto mapa-parada" style="animation-delay:${idx * 0.06}s"
             data-pacificado="${pacificado}"
             title="${p.nome}: ${p.concluidas}/${total} tarefas concluídas">
      <div class="parada-marco">
        <svg class="mapa-territorio" viewBox="0 0 80 80" role="img"
             aria-label="${p.nome}: ${pct}% do território conquistado">
          <circle class="marco-track" cx="40" cy="40" r="${R}" fill="none" stroke="${cLand}" stroke-width="6" opacity="0.14"/>
          <circle class="marco-prog" cx="40" cy="40" r="${R}" fill="none" stroke="${cLand}" stroke-width="6"
                  stroke-linecap="round" stroke-dasharray="${C.toFixed(1)}" stroke-dashoffset="${off.toFixed(1)}"
                  transform="rotate(-90 40 40)"/>
        </svg>
        <span class="parada-pct">${pct}%</span>
        ${pino}
      </div>
      <div class="parada-info">
        <h3 class="mapa-projeto__nome">${p.nome}</h3>
        <span class="mapa-conquista">▰ ${p.concluidas}/${total} conquistadas</span>
        <span class="mapa-obstaculos">${obstaculos}</span>
      </div>
    </article>`;
}

// ── Guild — visualizações temáticas (BLK-A12) ─────────────────────────────────
// Arte viva por frente: acende/assenta/dissipa conforme o "entregue" avança na
// camada Stretch. Apresentação pura — usa entregue/camadas, não recalcula nada.
// As animações de entrada rodam ao inserir o innerHTML; o reset global de
// prefers-reduced-motion desliga tudo para quem pede menos movimento.

/* Fatia de camadas: quantos das N células caem em cada tier (comprometida/alvo). */
function guildTiers(g, N) {
  const st = g.camadas.stretch || 1;
  const pct = Math.min(1, g.entregue_quinzena / st);
  return {
    lit: Math.round(pct * N),
    cmpN: Math.round(g.camadas.comprometida / st * N),
    alvoN: Math.round(g.camadas.alvo / st * N),
  };
}

/* Hexágono pointy-top centrado em (cx,cy), "raio" s. */
function hexPoints(cx, cy, s) {
  const p = [];
  for (let i = 0; i < 6; i++) {
    const a = Math.PI / 180 * (60 * i - 30);
    p.push(`${(cx + s * Math.cos(a)).toFixed(1)},${(cy + s * Math.sin(a)).toFixed(1)}`);
  }
  return p.join(' ');
}

/* Operacional — favos conquistados varrendo da esquerda p/ a direita (território). */
function guildHexGridViz(g, color) {
  const s = 9, dx = Math.sqrt(3) * s, dy = 1.5 * s;
  const rows = 3, cols = 7, x0 = s + 2, y0 = s + 2;
  const cells = [];
  for (let r = 0; r < rows; r++)
    for (let c = 0; c < cols; c++)
      cells.push({ x: x0 + c * dx + (r % 2) * (dx / 2), y: y0 + r * dy });
  cells.sort((a, b) => a.x - b.x || a.y - b.y);
  const N = cells.length;
  const { lit, cmpN, alvoN } = guildTiers(g, N);
  const w = (x0 + (cols - 1) * dx + dx / 2 + s + 2).toFixed(0);
  const h = (y0 + (rows - 1) * dy + s + 2).toFixed(0);
  const hexes = cells.map((c, i) => {
    const on = i < lit;
    const op = on ? (i < cmpN ? 0.9 : i < alvoN ? 0.68 : 0.46) : 0.1;
    const cls = `hex-cell${on ? ' is-lit' : ''}${on && i === lit - 1 ? ' is-frontier' : ''}`;
    return `<polygon class="${cls}" points="${hexPoints(c.x, c.y, s - 0.8)}"
             fill="${on ? color : 'none'}" stroke="${color}"
             style="--op:${op};--d:${(i * 0.03).toFixed(2)}s;opacity:var(--op)"/>`;
  }).join('');
  return `<svg class="guild-viz guild-viz--hexgrid" viewBox="0 0 ${w} ${h}" aria-hidden="true">${hexes}</svg>`;
}

/* Projeto — muro erguido de baixo p/ cima; cada bloco assenta no lugar (base). */
function guildBuildingBlocksViz(g, color) {
  const bw = 22, bh = 13, gap = 3, rows = 4;
  const cells = [];
  for (let r = 0; r < rows; r++) {
    const odd = r % 2;
    const n = odd ? 4 : 5;
    const bx = odd ? bw / 2 + 2 : 2;
    const y = (rows - 1 - r) * (bh + gap) + 2; // r=0 é a base (embaixo)
    for (let c = 0; c < n; c++) cells.push({ x: bx + c * (bw + gap), y, r });
  }
  cells.sort((a, b) => a.r - b.r || a.x - b.x); // ergue base→topo, esq→dir
  const N = cells.length;
  const { lit, cmpN, alvoN } = guildTiers(g, N);
  const w = (2 + 5 * (bw + gap)).toFixed(0);
  const h = (2 + rows * (bh + gap)).toFixed(0);
  const blocks = cells.map((c, i) => {
    const on = i < lit;
    const op = on ? (i < cmpN ? 0.85 : i < alvoN ? 0.62 : 0.42) : 0.1;
    const cls = `bloco-cell${on ? ' is-built' : ''}${on && i === lit - 1 ? ' is-frontier' : ''}`;
    return `<rect class="${cls}" x="${c.x}" y="${c.y}" width="${bw}" height="${bh}" rx="2"
             fill="${on ? color : 'none'}" stroke="${color}"
             style="--op:${op};--d:${(i * 0.045).toFixed(2)}s;opacity:var(--op)"/>`;
  }).join('');
  return `<svg class="guild-viz guild-viz--blocks" viewBox="0 0 ${w} ${h}" aria-hidden="true">${blocks}</svg>`;
}

/* Análise — constelação de insights sob névoa; a névoa dissipa e os nós brotam. */
function guildFogMapViz(g, color) {
  const nodes = [[18, 22], [40, 12], [58, 33], [80, 18], [100, 34], [120, 16], [140, 30], [160, 20]];
  const N = nodes.length;
  const { lit, cmpN, alvoN } = guildTiers(g, N);
  const st = g.camadas.stretch || 1;
  const pct = Math.min(1, g.entregue_quinzena / st);
  const fogOp = Math.max(0.05, 0.85 - pct * 0.82).toFixed(2);

  const nodeSVG = (i, descoberto) => {
    const [x, y] = nodes[i];
    const r = descoberto ? (i < cmpN ? 3.6 : i < alvoN ? 3.1 : 2.7) : 2;
    const op = descoberto ? (i < cmpN ? 1 : i < alvoN ? 0.8 : 0.6) : 0.16;
    return `<circle class="nevoa-node${descoberto ? ' is-disc' : ''}" cx="${x}" cy="${y}" r="${r}"
             fill="${color}" style="--op:${op};--d:${(i * 0.06).toFixed(2)}s;opacity:var(--op)"/>`;
  };

  const ocultos = nodes.map((_, i) => i >= lit ? nodeSVG(i, false) : '').join('');
  const descobertos = nodes.map((_, i) => i < lit ? nodeSVG(i, true) : '').join('');
  let links = '';
  for (let i = 1; i < lit; i++) {
    const [x1, y1] = nodes[i - 1], [x2, y2] = nodes[i];
    links += `<line class="nevoa-link" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"
               stroke="${color}" style="--d:${(i * 0.06).toFixed(2)}s"/>`;
  }

  return `<svg class="guild-viz guild-viz--fog" viewBox="0 0 178 46" aria-hidden="true">
    <rect x="0" y="0" width="178" height="46" rx="4" fill="${color}" opacity="0.05"/>
    ${ocultos}
    <rect class="nevoa-fog" x="0" y="0" width="178" height="46" rx="4" fill="var(--color-bg)" style="--fog:${fogOp}"/>
    <g class="nevoa-links">${links}</g>
    ${descobertos}
  </svg>`;
}

function guildThematicViz(f, g, color) {
  if (f === 'operacional') return guildHexGridViz(g, color);
  if (f === 'projeto') return guildBuildingBlocksViz(g, color);
  return guildFogMapViz(g, color);
}

// ── Guild ─────────────────────────────────────────────────────────────────────

/* Barra de jornada épica: 0 → Stretch, com marcos (bandeiras) em Comprometida,
   Alvo e Stretch; o "entregue" avança como conquista e acende os marcos atingidos.
   Apresentação pura — usa os números do contrato, não recalcula camada nem meta. */
function guildJornadaHTML(g, f) {
  const { comprometida, alvo, stretch } = g.camadas;
  const max = stretch || 1;
  const pct = v => Math.min(100, (v / max) * 100);
  const entregue = g.entregue_quinzena;
  const fill = pct(entregue);
  const alem = entregue > stretch;

  const CAMADAS = [
    ['Comprometida', comprometida],
    ['Alvo', alvo],
    ['Stretch', stretch],
  ];

  const flags = CAMADAS.map(([nome, val]) => {
    const ok = entregue >= val;
    return `<span class="jornada-flag${ok ? ' is-ok' : ''}" style="--at:${pct(val).toFixed(2)}%"
                  title="${nome}: ${val} ${g.unidade}${ok ? ' — conquistada ✦' : ''}"></span>`;
  }).join('');

  const legenda = CAMADAS.map(([nome, val]) =>
    `<span class="jornada-leg${entregue >= val ? ' is-ok' : ''}">${nome} <b>${val}</b></span>`
  ).join('');

  const estado = g.camada_atingida
    ? `Camada <strong>${g.camada_atingida}</strong> conquistada`
    : '';
  const prox = g.proxima_camada
    ? `faltam <strong>${g.restante_para_proxima} ${g.unidade}</strong> p/ ${g.proxima_camada}`
    : '';
  const caption = [estado, prox].filter(Boolean).join(' · ') || '—';

  return `
    <div class="guild-jornada" data-frente="${f}">
      <div class="jornada-topo">
        <span class="jornada-entregue">${entregue}</span>
        <span class="jornada-unid">${g.unidade} entregues</span>
        <span class="jornada-estado">${caption}</span>
      </div>
      <div class="jornada-trilho" role="img"
           aria-label="Progresso ${LABEL_FRENTE[f]}: entregue ${entregue} de ${stretch} ${g.unidade}. Comprometida ${comprometida}, Alvo ${alvo}, Stretch ${stretch}.">
        <span class="jornada-canal"><span class="jornada-fill${alem ? ' is-alem' : ''}" style="--pct:${fill.toFixed(2)}%"></span></span>
        ${flags}
        <span class="jornada-tip" style="--at:${fill.toFixed(2)}%"></span>
      </div>
      <div class="jornada-legenda">${legenda}</div>
    </div>`;
}

function renderGuild(guild) {
  const grid = document.getElementById('guild-grid');
  if (!grid) return;

  grid.innerHTML = FRENTES.map(f => {
    const g = guild[f];
    const objLabel = OBJETIVO_LABEL[g.objetivo] || g.objetivo;
    return `
      <div class="guild-card" data-frente="${f}">
        <h3>${LABEL_FRENTE[f]} — ${objLabel}</h3>
        ${guildThematicViz(f, g, cssVar(TOKEN_FRENTE[f]))}
        ${guildJornadaHTML(g, f)}
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
    guildContribChart(f, guild[f]);
  });
}

function guildContribChart(f, g) {
  const canvas = document.getElementById(`guild-contrib-${f}`);
  if (!canvas || typeof Chart === 'undefined') return;
  const entries = Object.entries(g.contribuicoes_quinzena);
  const cor = cssVar(TOKEN_FRENTE[f]);
  const tickColor = cssVar('--color-text-muted');
  const gridColor = cssVar('--color-border');

  CHARTS.push(new Chart(canvas, {
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
  }));
}

// ── Eventos / Hordas ──────────────────────────────────────────────────────────

function renderEventos(eventos, emblemasCatalogo) {
  const container = document.getElementById('eventos-lista');
  if (!container) return;
  const lista = eventos ? eventos.lista || [] : [];
  if (!lista.length) {
    container.innerHTML = '<div class="estado-vazio"><span class="estado-vazio__icone" aria-hidden="true">🐉</span><span>Nenhum evento nesta quinzena. A guilda segue em paz.</span></div>';
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

// ── Ranking — Salão dos Recordes (pódio de gemas) ─────────────────────────────
// Cosmético/secundário (não é scoring). A lapidação da gema é a posição no ranking:
// 1º = diamante lapidado · 2º = quase lapidado · 3º (ou zero) = pedra bruta.
// SEMPRE dentro da mesma frente/unidade — nunca combina frentes nem soma por herói.

/* Gema por estágio de lapidação (SVG inline, tingida pela frente via currentColor). */
function gemaLapidacaoSVG(estagio) {
  if (estagio === 'lapidado') {
    return `<svg viewBox="0 0 40 40" aria-hidden="true" focusable="false">
      <path class="gema-corpo" d="M12 11 L28 11 L34 18 L20 34 L6 18 Z"/>
      <g class="gema-facetas">
        <path d="M6 18 H34"/>
        <path d="M12 11 L14 18 M20 11 L20 18 M28 11 L26 18"/>
        <path d="M6 18 L20 34 M14 18 L20 34 M20 18 L20 34 M26 18 L20 34 M34 18 L20 34"/>
      </g>
      <path class="gema-brilho" d="M14 12.4 L11.6 17" />
      <path class="gema-faisca" d="${faiscaMagica(31, 9, 3)}" />
    </svg>`;
  }
  if (estagio === 'quase') {
    return `<svg viewBox="0 0 40 40" aria-hidden="true" focusable="false">
      <path class="gema-corpo" d="M12 11 L9 13 L11 15.5 L6 18 L20 34 L34 18 L28 11 Z"/>
      <g class="gema-facetas">
        <path d="M6 18 H34"/>
        <path d="M28 11 L26 18 M26 18 L20 34 M34 18 L20 34"/>
      </g>
    </svg>`;
  }
  return `<svg viewBox="0 0 40 40" aria-hidden="true" focusable="false">
    <path class="gema-corpo" d="M11 17 L15 8 L23 7 L31 13 L32 23 L25 32 L14 31 L8 23 Z"/>
    <g class="gema-facetas">
      <path d="M17 11 L19 21 M23 13 L25 25 M15 24 L22 26"/>
    </g>
  </svg>`;
}

function renderRanking(ranking_quinzena) {
  const grid = document.getElementById('ranking-grid');
  if (!grid) return;
  grid.innerHTML = FRENTES.map(f => {
    const r = ranking_quinzena[f];
    if (!r) return '';
    const placas = r.ordem.map(item => {
      const estagio = item.valor === 0
        ? 'bruto'
        : item.pos <= 1 ? 'lapidado' : item.pos === 2 ? 'quase' : 'bruto';
      return `
        <li class="podio-item" data-pos="${item.pos}" data-estagio="${estagio}"
            title="${item.pos}º ${item.pessoa} — ${item.valor} ${r.unidade} · ${item.vazao}/dia">
          <span class="podio-rank">${item.pos}º</span>
          <span class="podio-gema" aria-hidden="true">${gemaLapidacaoSVG(estagio)}</span>
          <span class="podio-nome">${item.pessoa}</span>
          <span class="podio-valor">${item.valor}</span>
        </li>`;
    }).join('');
    return `
      <div class="ranking-card" data-frente="${f}">
        <h3>${LABEL_FRENTE[f]}</h3>
        <ol class="ranking-podio" aria-label="Ranking ${LABEL_FRENTE[f]} (unidade: ${r.unidade})">
          ${placas}
        </ol>
        <p class="ranking-unidade">Unidade: ${r.unidade} · valor na placa · vazão/dia no detalhe</p>
      </div>`;
  }).join('');
}

// ── Missões de Organização ────────────────────────────────────────────────────

function renderMissoes(missoes_organizacao) {
  const lista = document.getElementById('missoes-lista');
  if (!lista) return;
  if (!missoes_organizacao || !missoes_organizacao.length) {
    lista.innerHTML = '<li class="estado-vazio"><span class="estado-vazio__icone" aria-hidden="true">✨</span><span>Nenhuma missão de organização — tudo tagueado!</span></li>';
    return;
  }
  lista.innerHTML = missoes_organizacao.map(m => `
    <li class="missao-item">
      <span>${m.nome} <em style="font-size:0.75rem;color:var(--color-text-muted)">(${m.assignee})</em></span>
      <span class="missao-motivo">${m.motivo}</span>
    </li>`).join('');
}

// ── Reconciliação — Pergaminho do Mestre (barra empilhada) ────────────────────
// Cada herói é um trecho de UMA barra; juntos formam o total de-dup da equipe.
// O app NÃO recalcula: usa total_equipe_quinzena (canônico, de-dup) como verdade e
// só sinaliza paridade quando as partes batem. Sempre DENTRO da frente (mesma unidade).

// Tons do trecho (opacidade da cor da frente) para distinguir heróis — cosmético,
// não implica ranking. Índice cicla se houver mais heróis que tons.
const RECON_TONS = [0.9, 0.62, 0.4, 0.28];

function renderReconciliacao(guild) {
  const grid = document.getElementById('reconciliacao-grid');
  if (!grid) return;
  grid.innerHTML = FRENTES.map(f => {
    const g = guild[f];
    const entradas = Object.entries(g.contribuicoes_quinzena);
    const total = g.total_equipe_quinzena;
    const soma = entradas.reduce((acc, [, v]) => acc + v, 0);
    // Denominador da barra: a soma dos indivíduos pode exceder o total (de-dup remove
    // trabalho compartilhado). Escala pelo maior p/ os trechos sempre caberem.
    const denom = Math.max(soma, total, 1);
    const paridade = soma === total;
    const delta = soma - total; // >0 = sobreposição removida pelo de-dup

    const trechos = entradas
      .filter(([, val]) => val > 0)
      .map(([nome, val], i) => {
        const w = (val / denom) * 100;
        const tom = RECON_TONS[i % RECON_TONS.length];
        // Número só aparece em trechos largos o bastante (>= 10% da barra).
        const rotulo = w >= 10 ? `<span class="recon-seg__val">${val}</span>` : '';
        return `<span class="recon-seg" style="--w:${w.toFixed(2)}%;--tom:${tom}"
                      title="${nome} — ${val} ${g.unidade}">${rotulo}</span>`;
      }).join('');

    // Marcador do total de-dup quando as partes NÃO batem (sobreposição): mostra
    // onde fica a verdade canônica dentro da barra da soma.
    const marcador = paridade ? '' :
      `<span class="recon-marca" style="--at:${((total / denom) * 100).toFixed(2)}%"
             title="Total de-dup da equipe: ${total} ${g.unidade}"></span>`;

    const legenda = entradas.map(([nome, val], i) => {
      const zero = val === 0;
      const tom = zero ? 0 : RECON_TONS[i % RECON_TONS.length];
      return `<li class="recon-legenda__item${zero ? ' is-zero' : ''}">
        <span class="recon-swatch" style="--tom:${tom}"></span>
        <span class="recon-legenda__nome">${nome}</span>
        <span class="recon-legenda__val">${val}</span>
      </li>`;
    }).join('');

    const selo = paridade
      ? '<span class="recon-paridade" data-ok="true" title="As contribuições somam exatamente o total de-dup">✓ paridade</span>'
      : `<span class="recon-paridade" data-ok="false" title="A soma individual excede o total; o de-dup removeu ${delta} ${g.unidade} de trabalho compartilhado">⇄ de-dup −${delta}</span>`;

    return `
      <div class="reconciliacao-card" data-frente="${f}">
        <h3>${LABEL_FRENTE[f]}</h3>
        <div class="recon-total-row">
          <span class="recon-total-num">${total}</span>
          <span class="recon-total-unid">${g.unidade} · total equipe</span>
          ${selo}
        </div>
        <div class="recon-barra" role="img"
             aria-label="Contribuições ${LABEL_FRENTE[f]}: ${entradas.map(([n, v]) => `${n} ${v}`).join(', ')} — total equipe ${total} ${g.unidade}">
          ${trechos || '<span class="recon-seg recon-seg--vazio"></span>'}
          ${marcador}
        </div>
        <ul class="recon-legenda">${legenda}</ul>
      </div>`;
  }).join('');
}

// ── Painel de abas (Encontros/Recordes/Missões/Pergaminho) ────────────────────
// Apresentação pura: alterna qual painel está visível. Não toca dados nem scoring.

function initPainelAbas() {
  const abas = Array.from(document.querySelectorAll('.painel-aba'));
  if (!abas.length) return;

  function ativar(alvo, { foco = false } = {}) {
    abas.forEach(aba => {
      const ativo = aba.dataset.abaAlvo === alvo;
      aba.classList.toggle('is-ativa', ativo);
      aba.setAttribute('aria-selected', ativo ? 'true' : 'false');
      aba.tabIndex = ativo ? 0 : -1;
      const painel = document.getElementById(aba.dataset.abaAlvo);
      if (painel) painel.hidden = !ativo;
      if (ativo && foco) aba.focus();
    });
  }

  abas.forEach((aba, i) => {
    aba.addEventListener('click', () => ativar(aba.dataset.abaAlvo));
    // Setas ←/→ navegam entre abas (padrão ARIA de tablist).
    aba.addEventListener('keydown', (e) => {
      if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
      e.preventDefault();
      const dir = e.key === 'ArrowRight' ? 1 : -1;
      const prox = abas[(i + dir + abas.length) % abas.length];
      ativar(prox.dataset.abaAlvo, { foco: true });
    });
  });

  // Links da nav do topo que apontam para um painel em aba: abre a aba certa.
  const alvos = new Set(abas.map(a => a.dataset.abaAlvo));
  document.querySelectorAll('.site-nav a[href^="#"]').forEach(link => {
    const alvo = link.getAttribute('href').slice(1);
    if (alvos.has(alvo)) link.addEventListener('click', () => ativar(alvo));
  });
}

initPainelAbas();
main();
