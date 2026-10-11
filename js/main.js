/* =========================================================
   EloPlus — protótipo (HTML + CSS + JS puro)
   ========================================================= */
(() => {
  'use strict';

  /* ---------- configuração ---------- */
  const CONFIG = {
    ticketChannel: '#criar-ticket',
    discordUrl: 'https://discord.gg/eloplus',
    heroInterval: 6000,
  };

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const brl = (v) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  /* ---------- dados ---------- */
  const TIERS = [
    { key: 'ferro', name: 'Ferro', color: '#8A8F99', ink: '#5F6672' },
    { key: 'bronze', name: 'Bronze', color: '#C08A4A', ink: '#A0632A' },
    { key: 'prata', name: 'Prata', color: '#C9D1DB', ink: '#6E7C8C' },
    { key: 'ouro', name: 'Ouro', color: '#F2B632', ink: '#B57F00' },
    { key: 'platina', name: 'Platina', color: '#3FC3D9', ink: '#118FA6' },
    { key: 'diamante', name: 'Diamante', color: '#B26BFF', ink: '#8A45DB' },
    { key: 'ascendente', name: 'Ascendente', color: '#3DDC84', ink: '#17A05A' },
    { key: 'imortal', name: 'Imortal', color: '#F0436C', ink: '#D42A55' },
    { key: 'radiante', name: 'Radiante', color: '#FFE27A', ink: '#B08A00' },
  ];
  const rankImg = (key) => `assets/ranks/${key}.webp`;

  // 25 divisões: Ferro 1 … Imortal 3, Radiante
  const DIVS = [];
  TIERS.slice(0, 8).forEach((t, ti) => [1, 2, 3].forEach((n) => DIVS.push({ label: `${t.name} ${n}`, tier: ti })));
  DIVS.push({ label: 'Radiante', tier: 8 });

  // preço da divisão i -> i+1
  const STEPS = [
    3.90, 3.90, 4.90,
    5.90, 6.90, 7.90,
    8.90, 10.90, 12.90,
    12.90, 14.90, 16.90,
    16.90, 18.90, 23.90,
    29.90, 34.90, 42.90,
    52.90, 59.90, 79.90,
    129.90, 149.90, 179.90,
  ];
  const cost = (a, b) => STEPS.slice(a, b).reduce((s, v) => s + v, 0);
  const divIndex = (label) => DIVS.findIndex((d) => d.label === label);

  const PACKAGES = [
    { from: 'Imortal 1', to: 'Radiante', old: 459.70, price: 399.90, off: 13, hot: true, feature: true },
    { from: 'Diamante 1', to: 'Imortal 1', old: 300.40, price: 254.90, off: 15, hot: true },
    { from: 'Ascendente 1', to: 'Imortal 1', old: 192.70, price: 164.90, off: 14 },
    { from: 'Imortal 1', to: 'Imortal 3', old: 279.80, price: 244.90, off: 12 },
    { from: 'Imortal 2', to: 'Radiante', old: 329.80, price: 289.90, off: 12 },
  ];

  const ADDONS = [
    { id: 'classe', name: 'Somente uma classe de bonecos', pct: 20, icon: 'target', desc: 'O booster joga só com agentes da classe que você escolher.' },
    { id: 'prioridade', name: 'Prioridade', pct: 15, icon: 'bolt', desc: 'Seu pedido entra na frente da fila.' },
    { id: 'live', name: 'Live Stream', pct: 15, icon: 'live', desc: 'Assista às partidas ao vivo enquanto o boost acontece.' },
    { id: 'vitoria', name: '+1 Vitória Extra', pct: 20, icon: 'trophy', desc: 'Uma vitória a mais depois de atingir o elo desejado.' },
    { id: 'solo', name: 'Solo Only', pct: 20, icon: 'solo', desc: 'Partidas sempre em fila solo, sem duo.' },
    { id: 'boneco', name: 'Um boneco apenas', pct: 30, icon: 'agent', desc: 'Todas as partidas com um único agente da sua escolha.' },
    { id: 'performance', name: 'Performance Equilibrada', pct: 40, icon: 'scale', desc: 'Estatísticas parecidas com as suas, para o histórico continuar natural.', wide: true },
  ];

  const AGENTS = [
    { key: 'jett', name: 'Jett', role: 'Duelista', color: '#6CB7FF', h: '122%', x: '10px' },
    { key: 'clove', name: 'Clove', role: 'Controladora', color: '#C77DFF', h: '118%', x: '90px' },
    { key: 'reyna', name: 'Reyna', role: 'Duelista', color: '#D04BFF', h: '120%', x: '10px' },
    { key: 'chamber', name: 'Chamber', role: 'Sentinela', color: '#E8B54A', h: '118%', x: '60px' },
    { key: 'phoenix', name: 'Phoenix', role: 'Duelista', color: '#FF8A3D', h: '110%', x: '90px' },
    { key: 'omen', name: 'Omen', role: 'Controlador', color: '#7B6CFF', h: '120%', x: '60px' },
    { key: 'sage', name: 'Sage', role: 'Sentinela', color: '#3FE0C5', h: '120%', x: '70px' },
    { key: 'viper', name: 'Viper', role: 'Controladora', color: '#3DDC6A', h: '120%', x: '60px' },
    { key: 'raze', name: 'Raze', role: 'Duelista', color: '#FF7A3D', h: '116%', x: '50px' },
    { key: 'vyse', name: 'Vyse', role: 'Sentinela', color: '#A86BFF', h: '120%', x: '60px' },
    { key: 'killjoy', name: 'Killjoy', role: 'Sentinela', color: '#F5D03B', h: '116%', x: '50px' },
    { key: 'neon', name: 'Neon', role: 'Duelista', color: '#3FA9FF', h: '120%', x: '50px' },
    { key: 'sova', name: 'Sova', role: 'Iniciador', color: '#4F7BFF', h: '120%', x: '60px' },
    { key: 'cypher', name: 'Cypher', role: 'Sentinela', color: '#E6E1D3', h: '120%', x: '60px' },
    { key: 'yoru', name: 'Yoru', role: 'Duelista', color: '#3D6BFF', h: '120%', x: '60px' },
  ];

  const FAQ = [
    ['Como faço para contratar?', 'Escolha as divisões na tabela ou monte o pedido na calculadora, copie o resumo e abra um ticket no Discord. A equipe confirma o valor e o booster começa.'],
    ['Onde abro o ticket?', `No canal ${CONFIG.ticketChannel} do nosso Discord. Basta clicar em “Abrir ticket” e seguir as instruções do canal.`],
    ['Posso escolher agentes?', 'Sim. Com o adicional “Somente uma classe de bonecos” (+20%) você escolhe a classe; com “Um boneco apenas” (+30%) você define um único agente.'],
    ['O serviço tem prioridade?', 'Tem como opção. O adicional Prioridade (+15%) coloca seu pedido na frente da fila.'],
    ['Como funciona o adicional de live stream?', 'Com o Live Stream (+15%) você recebe o link de uma transmissão privada e acompanha as partidas do booster ao vivo.'],
    ['O valor muda com RR atual?', 'O RR atual é informado no ticket. Ele ajuda a equipe a calcular quanto falta para a primeira divisão e pode ajustar o valor final.'],
  ];

  /* ---------- toast / copiar ---------- */
  const toast = $('#toast');
  let toastTimer;
  function showToast(msg) {
    $('#toastMsg').textContent = msg;
    toast.classList.add('is-show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('is-show'), 2600);
  }
  async function copyText(text) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (e) {
      const ta = document.createElement('textarea');
      ta.value = text; ta.setAttribute('readonly', ''); ta.style.cssText = 'position:fixed;opacity:0';
      document.body.appendChild(ta); ta.select();
      let ok = false;
      try { ok = document.execCommand('copy'); } catch (_) { ok = false; }
      ta.remove();
      return ok;
    }
  }

  $$('.js-channel-name').forEach((el) => (el.textContent = CONFIG.ticketChannel.replace('#', '')));
  // "Copiar" copia o convite do Discord
  $$('.js-copy-channel').forEach((b) => b.addEventListener('click', async () => {
    const ok = await copyText(CONFIG.discordUrl);
    showToast(ok ? 'Link do Discord copiado' : `Discord: ${CONFIG.discordUrl}`);
  }));
  // botões "Abrir ticket" viram links reais para o Discord
  $$('.js-ticket').forEach((b) => {
    const a = document.createElement('a');
    a.className = b.className;
    a.innerHTML = b.innerHTML;
    a.href = CONFIG.discordUrl;
    a.target = '_blank';
    a.rel = 'noopener';
    b.replaceWith(a);
  });

  // links das redes (placeholder enquanto não houver URL)
  $$('.js-social').forEach((a) => { a.href = CONFIG.discordUrl; a.target = '_blank'; a.rel = 'noopener'; });

  /* ---------- tema ---------- */
  const root = document.documentElement;
  const mqLight = window.matchMedia('(prefers-color-scheme: light)');
  try { const saved = localStorage.getItem('eloplus-theme'); if (saved) root.dataset.theme = saved; } catch (_) {}
  const currentTheme = () => root.dataset.theme || (mqLight.matches ? 'light' : 'dark');

  function sizeToggles() {
    $$('.theme-toggle .tt-track').forEach((t) => t.style.setProperty('--tt-w', `${t.offsetWidth}px`));
  }
  sizeToggles();
  window.addEventListener('resize', sizeToggles);

  $$('.js-theme').forEach((btn) => btn.addEventListener('click', () => {
    const next = currentTheme() === 'dark' ? 'light' : 'dark';
    const r = btn.getBoundingClientRect();
    root.style.setProperty('--vt-x', `${r.left + r.width / 2}px`);
    root.style.setProperty('--vt-y', `${r.top + r.height / 2}px`);
    btn.classList.remove('is-firing'); void btn.offsetWidth; btn.classList.add('is-firing');
    const apply = () => {
      root.dataset.theme = next;
      try { localStorage.setItem('eloplus-theme', next); } catch (_) {}
    };
    if (document.startViewTransition && !reduceMotion) {
      document.startViewTransition(apply);
    } else {
      root.classList.add('theme-anim');
      apply();
      setTimeout(() => root.classList.remove('theme-anim'), 500);
    }
  }));

  /* ---------- hero: agentes ---------- */
  const heroCard = $('#heroCard');
  const heroArt = $('#heroArt');
  const heroSwitch = $('#heroSwitch');
  const thumbs = $('#agentThumbs');
  let heroIdx = 0;
  let heroTimer = null;
  let paused = reduceMotion;

  AGENTS.forEach((a, i) => {
    const img = document.createElement('img');
    img.src = `assets/agents/${a.key}.webp`;
    img.alt = `${a.name}, agente de Valorant`;
    img.className = 'hero-agent' + (i === 0 ? ' is-active' : '');
    img.style.setProperty('--h', a.h);
    img.style.setProperty('--x', a.x);
    if (i > 0) img.loading = 'lazy';
    heroArt.prepend(img);

    const b = document.createElement('button');
    b.type = 'button'; b.className = 'hs-btn'; b.setAttribute('role', 'tab');
    b.setAttribute('aria-label', `Destacar ${a.name}`);
    b.innerHTML = '<span class="hs-bar"><i></i></span>';
    b.addEventListener('click', () => { setAgent(i); restartTimer(); });
    heroSwitch.appendChild(b);

    const t = document.createElement('button');
    t.type = 'button'; t.className = 'agent-thumb'; t.dataset.agent = a.key;
    t.style.setProperty('--c', a.color);
    t.setAttribute('aria-label', `Destacar ${a.name}`);
    t.innerHTML = `<img src="assets/agents/${a.key}.webp" alt="" loading="lazy">`;
    t.addEventListener('click', () => {
      setAgent(i); restartTimer();
      document.getElementById('home').scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth' });
    });
    thumbs.appendChild(t);
  });

  const heroImgs = $$('.hero-agent', heroArt).reverse(); // prepend inverteu a ordem
  const switchBtns = $$('.hs-btn', heroSwitch);
  const thumbBtns = $$('.agent-thumb', thumbs);

  function setAgent(i) {
    const prev = heroIdx;
    heroIdx = (i + AGENTS.length) % AGENTS.length;
    const a = AGENTS[heroIdx];
    heroImgs.forEach((img, k) => {
      img.classList.toggle('is-active', k === heroIdx);
      img.classList.toggle('is-leaving', k === prev && prev !== heroIdx);
    });
    setTimeout(() => heroImgs[prev] && heroImgs[prev].classList.remove('is-leaving'), 900);
    switchBtns.forEach((b, k) => {
      b.classList.remove('is-active');
      b.classList.toggle('is-done', k < heroIdx);
      b.setAttribute('aria-selected', String(k === heroIdx));
    });
    void switchBtns[heroIdx].offsetWidth;
    switchBtns[heroIdx].classList.add('is-active');
    thumbBtns.forEach((b, k) => b.classList.toggle('is-active', k === heroIdx));
    heroCard.style.setProperty('--agent', a.color);
  }
  function restartTimer() {
    clearInterval(heroTimer);
    if (paused) return;
    heroTimer = setInterval(() => setAgent(heroIdx + 1), CONFIG.heroInterval);
  }
  heroSwitch.style.setProperty('--dur', `${CONFIG.heroInterval}ms`);
  const pauseBtn = $('#heroPause');
  function setPaused(p) {
    paused = p;
    heroCard.classList.toggle('is-paused', p);
    pauseBtn.innerHTML = `<svg class="ic"><use href="#i-${p ? 'play' : 'pause'}"/></svg>`;
    pauseBtn.setAttribute('aria-label', p ? 'Retomar rotação de agentes' : 'Pausar rotação de agentes');
    restartTimer();
  }
  pauseBtn.addEventListener('click', () => setPaused(!paused));
  setAgent(0);
  setPaused(paused);

  /* ---------- partículas do hero ---------- */
  (function particles() {
    const cv = $('#heroParticles');
    const ctx = cv.getContext('2d');
    let w, h, dpr, parts = [], raf, visible = true;
    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = cv.clientWidth; h = cv.clientHeight;
      cv.width = w * dpr; cv.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const n = Math.round((w * h) / 16000);
      parts = Array.from({ length: n }, () => ({
        x: Math.random() * w, y: Math.random() * h,
        s: Math.random() * 2.4 + .8, v: Math.random() * .35 + .1,
        a: Math.random() * .5 + .15, r: Math.random() * Math.PI, d: Math.random() > .7,
      }));
    }
    function draw() {
      ctx.clearRect(0, 0, w, h);
      const col = getComputedStyle(heroCard).getPropertyValue('--hero-ink').trim() || '#fff';
      ctx.fillStyle = col;
      for (const p of parts) {
        p.y -= p.v; p.r += .01;
        if (p.y < -10) { p.y = h + 10; p.x = Math.random() * w; }
        ctx.globalAlpha = p.a * (0.6 + 0.4 * Math.sin(p.r * 3));
        ctx.save(); ctx.translate(p.x, p.y);
        if (p.d) { ctx.rotate(Math.PI / 4); ctx.fillRect(-p.s, -p.s, p.s * 2, p.s * 2); }
        else { ctx.beginPath(); ctx.arc(0, 0, p.s * .7, 0, Math.PI * 2); ctx.fill(); }
        ctx.restore();
      }
      ctx.globalAlpha = 1;
      if (visible) raf = requestAnimationFrame(draw);
    }
    resize();
    window.addEventListener('resize', resize);
    if (reduceMotion) { draw(); cancelAnimationFrame(raf); return; }
    new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      cancelAnimationFrame(raf);
      if (visible) raf = requestAnimationFrame(draw);
    }).observe(cv);
  })();

  /* ---------- rota até o topo ---------- */
  const routeRanks = $('#routeRanks');
  TIERS.forEach((t, i) => {
    const b = document.createElement('button');
    b.type = 'button'; b.className = 'route-rank';
    b.style.setProperty('--tc', t.color);
    b.setAttribute('aria-label', `${t.name}${i < 8 ? ' 1' : ''}`);
    b.title = t.name;
    b.innerHTML = `<img src="${rankImg(t.key)}" alt="">`;
    b.addEventListener('click', () => setRoute(i));
    routeRanks.appendChild(b);
  });
  const routeBtns = $$('.route-rank', routeRanks);
  let routePriceAnim;
  function animateNumber(el, to, dur = 900) {
    cancelAnimationFrame(routePriceAnim);
    const from = parseFloat(el.dataset.v || '0');
    const t0 = performance.now();
    const step = (now) => {
      const k = reduceMotion ? 1 : Math.min(1, (now - t0) / dur);
      const e = 1 - Math.pow(1 - k, 3);
      el.textContent = brl(from + (to - from) * e);
      if (k < 1) routePriceAnim = requestAnimationFrame(step);
      else el.dataset.v = String(to);
    };
    routePriceAnim = requestAnimationFrame(step);
  }
  function setRoute(ti) {
    const target = ti === 8 ? 24 : ti * 3;
    routeBtns.forEach((b, k) => { b.classList.toggle('is-on', k <= ti); b.classList.toggle('is-target', k === ti); });
    const frac = (ti + 0.5) / 9; // termina no centro do emblema escolhido
    const fill = $('#routeFill');
    fill.style.transform = `scaleX(${Math.max(frac, .04)})`;
    fill.style.setProperty('--full', `${100 / Math.max(frac, .04)}%`);
    $('#routeLabel').textContent = ti === 0 ? 'Você já está no Ferro 1' : `Ferro 1 → ${DIVS[target].label}`;
    $('#routeSteps').textContent = `${target} ${target === 1 ? 'divisão' : 'divisões'}`;
    animateNumber($('#routePrice'), cost(0, target));
  }
  setRoute(4);

  /* ---------- tabela de preços ---------- */
  const tierGrid = $('#tierGrid');
  TIERS.slice(0, 8).forEach((t, ti) => {
    const card = document.createElement('article');
    card.className = 'card tier reveal';
    card.style.setProperty('--tc', t.color);
    const rows = [0, 1, 2].map((k) => {
      const i = ti * 3 + k;
      const to = DIVS[i + 1];
      const crosses = to.tier !== ti;
      const nt = TIERS[to.tier];
      return `<button type="button" class="tier-row" data-from="${i}" aria-label="${DIVS[i].label} para ${to.label}: ${brl(STEPS[i])}. Levar para o orçamento">
        <span class="tr-path">${DIVS[i].label}<svg class="ic"><use href="#i-arrow"/></svg><span class="${crosses ? 'to-next' : ''}"${crosses ? ` style="--to:${nt.color};--to-ink:${nt.ink}"` : ''}>${to.label}</span></span>
        <span class="tr-price"><small>R$</small>${STEPS[i].toFixed(2).replace('.', ',')}</span>
      </button>`;
    }).join('');
    card.innerHTML = `
      <div class="tier-head">
        <img src="${rankImg(t.key)}" alt="Emblema ${t.name}" loading="lazy">
        <div><h3>${t.name}</h3><small>${brl(cost(ti * 3, ti * 3 + 3))} o elo todo</small></div>
        <span class="tier-idx">0${ti + 1}</span>
      </div>
      <div class="tier-rows">${rows}</div>`;
    tierGrid.appendChild(card);
  });
  tierGrid.addEventListener('click', (e) => {
    const row = e.target.closest('.tier-row');
    if (!row) return;
    const i = +row.dataset.from;
    setCalc(i, i + 1);
    document.getElementById('contratar').scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth' });
    showToast(`${DIVS[i].label} → ${DIVS[i + 1].label} no orçamento`);
  });

  /* ---------- calculadora ---------- */
  const fromSel = $('#calcFrom');
  const toSel = $('#calcTo');
  const rr = $('#calcRR');
  const addonState = new Set();
  DIVS.forEach((d, i) => {
    if (i < 24) fromSel.add(new Option(d.label, i));
    if (i > 0) toSel.add(new Option(d.label, i));
  });
  const addonRow = $('#calcAddons');
  ADDONS.forEach((a) => {
    const c = document.createElement('button');
    c.type = 'button'; c.className = 'chip'; c.dataset.addon = a.id;
    c.setAttribute('aria-pressed', 'false');
    c.innerHTML = `<svg class="ic"><use href="#i-${a.icon}"/></svg>${a.name}<em>+${a.pct}%</em>`;
    c.addEventListener('click', () => toggleAddon(a.id));
    addonRow.appendChild(c);
  });

  function pop(img, src) {
    if (img.getAttribute('src') === src) return;
    img.src = src; img.classList.remove('is-pop'); void img.offsetWidth; img.classList.add('is-pop');
  }
  function setCalc(a, b) { fromSel.value = a; toSel.value = b; updateCalc(); }
  function toggleAddon(id) {
    if (addonState.has(id)) addonState.delete(id); else addonState.add(id);
    updateCalc();
  }
  function calcState() {
    let a = +fromSel.value, b = +toSel.value;
    if (b <= a) { b = a + 1; toSel.value = b; }
    const base = cost(a, b);
    const pkg = PACKAGES.find((p) => divIndex(p.from) === a && divIndex(p.to) === b);
    const subtotal = pkg ? pkg.price : base;
    const pct = ADDONS.filter((x) => addonState.has(x.id)).reduce((s, x) => s + x.pct, 0);
    return { a, b, base, pkg, pct, total: subtotal * (1 + pct / 100) };
  }
  function updateCalc() {
    const s = calcState();
    pop($('#calcFromImg'), rankImg(TIERS[DIVS[s.a].tier].key));
    pop($('#calcToImg'), rankImg(TIERS[DIVS[s.b].tier].key));
    refreshPickers();
    $('#sumBase').innerHTML = s.pkg ? `<s>${brl(s.base)}</s>` : brl(s.base);
    $('#sumPkgLine').hidden = !s.pkg;
    if (s.pkg) $('#sumPkg').textContent = `${brl(s.pkg.price)} (−${s.pkg.off}%)`;
    $('#sumAdd').textContent = `+${s.pct}%`;
    $('#sumTotal').textContent = brl(s.total);
    $$('.chip', addonRow).forEach((c) => c.setAttribute('aria-pressed', String(addonState.has(c.dataset.addon))));
    $$('.addon').forEach((card) => {
      const on = addonState.has(card.dataset.addon);
      card.classList.toggle('is-on', on);
      const btn = $('.addon-btn', card);
      btn.setAttribute('aria-pressed', String(on));
      $('span', btn).textContent = on ? 'Adicionado' : 'Adicionar';
      $('use', btn).setAttribute('href', on ? '#i-check' : '#i-plus');
    });
  }
  function updateRR() {
    $('#calcRRout').textContent = `${rr.value} RR`;
    rr.style.setProperty('--p', `${(rr.value / 99) * 100}%`);
  }
  fromSel.addEventListener('change', updateCalc);
  toSel.addEventListener('change', () => {
    if (+toSel.value <= +fromSel.value) fromSel.value = +toSel.value - 1;
    updateCalc();
  });
  rr.addEventListener('input', updateRR);

  /* ---------- seletor de elo (substitui o <select> nativo) ---------- */
  const pickers = [];
  function buildRankPicker(sel, img, kind) {
    const wrap = sel.closest('.select-wrap');
    wrap.classList.add('rank-pick', `rank-pick--${kind}`);
    sel.classList.add('rp-native');
    sel.tabIndex = -1;
    sel.setAttribute('aria-hidden', 'true');

    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'rp-trigger';
    btn.id = `${sel.id}Btn`;
    btn.setAttribute('aria-haspopup', 'listbox');
    btn.setAttribute('aria-expanded', 'false');
    btn.innerHTML = `<span class="rp-val"><b></b><small></small></span><svg class="ic rp-chev" viewBox="0 0 24 24"><path d="m6 9 6 6 6-6"/></svg>`;
    btn.prepend(img);
    const label = document.querySelector(`label[for="${sel.id}"]`);
    if (label) label.htmlFor = btn.id;

    const panel = document.createElement('div');
    panel.className = 'rp-panel';
    panel.setAttribute('role', 'listbox');
    panel.setAttribute('aria-label', kind === 'from' ? 'Elo atual' : 'Elo desejado');
    panel.hidden = true;
    panel.innerHTML = `<div class="rp-head"><span>${kind === 'from' ? 'Seu elo atual' : 'Até onde subir'}</span><small>${kind === 'from' ? 'Escolha a divisão em que você está' : 'Escolha a divisão de destino'}</small></div>` +
      TIERS.map((t, ti) => {
        const divs = ti === 8 ? [24] : [ti * 3, ti * 3 + 1, ti * 3 + 2];
        return `<div class="rp-row${ti === 8 ? ' rp-row--top' : ''}" style="--tc:${t.color};--tc-ink:${t.ink}">
          <img src="${rankImg(t.key)}" alt="" loading="lazy">
          <span class="rp-name">${t.name}</span>
          <div class="rp-divs">${divs.map((v, k) => `<button type="button" role="option" class="rp-opt" data-v="${v}" aria-label="${DIVS[v].label}">${ti === 8 ? 'Topo' : k + 1}</button>`).join('')}</div>
        </div>`;
      }).join('');
    wrap.appendChild(btn);
    wrap.appendChild(panel);
    const opts = [...panel.querySelectorAll('.rp-opt')];

    const isDisabled = (v) => (kind === 'from' ? v >= 24 : v <= +fromSel.value);
    function refresh() {
      const v = +sel.value;
      const d = DIVS[v];
      const t = TIERS[d.tier];
      btn.style.setProperty('--tc', t.color);
      $('b', btn).textContent = d.label;
      $('small', btn).textContent = d.tier === 8 ? 'Topo do ranking' : `Divisão ${(v % 3) + 1} de 3`;
      opts.forEach((o) => {
        const ov = +o.dataset.v;
        o.setAttribute('aria-selected', String(ov === v));
        o.disabled = isDisabled(ov);
      });
    }
    function open() {
      pickers.forEach((p) => p !== api && p.close());
      refresh();
      panel.hidden = false;
      btn.setAttribute('aria-expanded', 'true');
      wrap.classList.add('is-open');
      const cur = opts.find((o) => o.getAttribute('aria-selected') === 'true' && !o.disabled) || opts.find((o) => !o.disabled);
      if (cur) cur.focus({ preventScroll: true });
    }
    function close(focusBtn) {
      if (panel.hidden) return;
      panel.hidden = true;
      btn.setAttribute('aria-expanded', 'false');
      wrap.classList.remove('is-open');
      if (focusBtn) btn.focus();
    }
    btn.addEventListener('click', () => (panel.hidden ? open() : close()));
    panel.addEventListener('click', (e) => {
      const o = e.target.closest('.rp-opt');
      if (!o || o.disabled) return;
      sel.value = o.dataset.v;
      sel.dispatchEvent(new Event('change'));
      close(true);
    });
    panel.addEventListener('keydown', (e) => {
      const live = opts.filter((o) => !o.disabled);
      const i = live.indexOf(document.activeElement);
      if (e.key === 'Escape') { e.preventDefault(); close(true); }
      else if (['ArrowRight', 'ArrowDown'].includes(e.key)) { e.preventDefault(); live[Math.min(i + (e.key === 'ArrowDown' ? 3 : 1), live.length - 1)].focus(); }
      else if (['ArrowLeft', 'ArrowUp'].includes(e.key)) { e.preventDefault(); live[Math.max(i - (e.key === 'ArrowUp' ? 3 : 1), 0)].focus(); }
      else if (e.key === 'Tab') close();
    });
    const api = { refresh, close };
    pickers.push(api);
    return api;
  }
  function refreshPickers() { pickers.forEach((p) => p.refresh()); }
  buildRankPicker(fromSel, $('#calcFromImg'), 'from');
  buildRankPicker(toSel, $('#calcToImg'), 'to');
  document.addEventListener('click', (e) => { if (!e.target.closest('.rank-pick')) pickers.forEach((p) => p.close()); });
  $('#calc').addEventListener('submit', (e) => e.preventDefault());

  $('#calcCopy').addEventListener('click', async () => {
    const s = calcState();
    const extras = ADDONS.filter((x) => addonState.has(x.id)).map((x) => `${x.name} (+${x.pct}%)`);
    const text = [
      `🎯 Elo atual: ${DIVS[s.a].label}`,
      `🏆 Elo desejado: ${DIVS[s.b].label}`,
      `📊 RR atual: ${rr.value}`,
      `➕ Adicionais: ${extras.length ? extras.join(', ') : 'nenhum'}`,
      s.pkg ? `👑 Pacote: ${s.pkg.from} → ${s.pkg.to}` : null,
      `💰 Estimativa EloPlus: ${brl(s.total)}`,
    ].filter(Boolean).join('\n');
    const ok = await copyText(text);
    showToast(ok ? 'Resumo copiado. Cole no seu ticket' : 'Não deu para copiar. Selecione o texto manualmente');
  });

  /* ---------- pacotes ---------- */
  const pkgGrid = $('#pkgGrid');
  PACKAGES.forEach((p) => {
    const fT = TIERS[DIVS[divIndex(p.from)].tier];
    const tT = TIERS[DIVS[divIndex(p.to)].tier];
    const el = document.createElement('article');
    el.className = `card pkg reveal${p.hot ? ' is-hot' : ''}${p.feature ? ' pkg--feature' : ''}`;
    el.style.setProperty('--tc', tT.color);
    el.style.setProperty('--off', p.off);
    const save = p.old - p.price;
    const body = `
      <div class="pkg-top">
        <div class="pkg-ranks">
          <img src="${rankImg(fT.key)}" alt="${p.from}" loading="lazy"><svg class="ic"><use href="#i-arrow"/></svg><img src="${rankImg(tT.key)}" alt="${p.to}" loading="lazy">
        </div>
        ${p.hot ? '<span class="hot-badge">🔥 Melhor oferta</span>' : ''}
      </div>
      <h3>${p.from} <span>→</span> ${p.to}</h3>
      <div class="pkg-price">
        <span class="pkg-new"><small>R$</small>${p.price.toFixed(2).replace('.', ',')}</span>
        <span class="pkg-old">${brl(p.old)}</span>
      </div>
      <div class="pkg-save"><span>💸 Economia de ${brl(save)}</span><b>${p.off}% OFF</b></div>
      <div class="pkg-meter" aria-hidden="true"><i></i></div>
      <button type="button" class="btn btn-primary js-pkg" data-from="${divIndex(p.from)}" data-to="${divIndex(p.to)}"><span>Quero este pacote</span><svg class="ic"><use href="#i-arrow"/></svg></button>`;
    el.innerHTML = p.feature
      ? `<span class="pkg-radiant-glow" aria-hidden="true"></span><img class="pkg-art" src="assets/agents/chamber.webp" alt="" loading="lazy"><div class="pkg-body">${body}</div>`
      : body;
    pkgGrid.appendChild(el);
  });
  pkgGrid.addEventListener('click', (e) => {
    const b = e.target.closest('.js-pkg');
    if (!b) return;
    setCalc(+b.dataset.from, +b.dataset.to);
    document.getElementById('contratar').scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth' });
    showToast('Pacote aplicado no orçamento');
  });

  /* ---------- adicionais ---------- */
  const addonGrid = $('#addonGrid');
  ADDONS.forEach((a) => {
    const el = document.createElement('article');
    el.className = `card addon reveal${a.wide ? ' addon--wide' : ''}`;
    el.dataset.addon = a.id;
    const btn = `<button type="button" class="addon-btn" aria-pressed="false"><svg class="ic"><use href="#i-plus"/></svg><span>Adicionar</span></button>`;
    el.innerHTML = a.wide
      ? `<div class="addon-top"><span class="addon-ic"><svg class="ic"><use href="#i-${a.icon}"/></svg></span></div>
         <div class="addon-mid"><h3>${a.name}</h3><p>${a.desc}</p>${btn}</div>
         <span class="addon-pct">+${a.pct}%</span>`
      : `<div class="addon-top"><span class="addon-ic"><svg class="ic"><use href="#i-${a.icon}"/></svg></span><span class="addon-pct">+${a.pct}%</span></div>
         <h3>${a.name}</h3><p>${a.desc}</p>${btn}`;
    $('.addon-btn', el).addEventListener('click', () => {
      toggleAddon(a.id);
      showToast(addonState.has(a.id) ? `${a.name} adicionado ao orçamento` : `${a.name} removido`);
    });
    addonGrid.appendChild(el);
  });

  /* ---------- FAQ ---------- */
  const faqList = $('#faqList');
  FAQ.forEach(([q, a], i) => {
    const item = document.createElement('div');
    item.className = 'faq-item' + (i === 0 ? ' is-open' : '');
    const id = `faq-a-${i}`;
    item.innerHTML = `
      <button type="button" class="faq-q" aria-expanded="${i === 0}" aria-controls="${id}">
        <span class="q-num">0${i + 1}</span><span class="q-text">${q}</span><span class="faq-toggle" aria-hidden="true"></span>
      </button>
      <div class="faq-a" id="${id}" role="region"><div><p>${a.replace(/Discord/g, '<span class="dc-inline"><img src="assets/social/discord.webp" alt="">Discord</span>')}</p></div></div>`;
    $('.faq-q', item).addEventListener('click', () => {
      const open = !item.classList.contains('is-open');
      $$('.faq-item', faqList).forEach((x) => { x.classList.remove('is-open'); $('.faq-q', x).setAttribute('aria-expanded', 'false'); });
      item.classList.toggle('is-open', open);
      $('.faq-q', item).setAttribute('aria-expanded', String(open));
    });
    faqList.appendChild(item);
  });

  // estado inicial de exemplo do orçamento
  setCalc(9, 12);          // Ouro 1 → Platina 1
  addonState.add('prioridade');
  updateCalc();
  updateRR();

  /* ---------- importante: conta animada ---------- */
  const impTotal = $('#impTotal');
  if ('IntersectionObserver' in window && !reduceMotion) {
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      io.disconnect();
      impTotal.dataset.v = '100';
      animateNumberSimple(impTotal, 100, 120);
    }, { threshold: .6 });
    io.observe(impTotal);
  }
  function animateNumberSimple(el, from, to) {
    const t0 = performance.now();
    const step = (now) => {
      const k = Math.min(1, (now - t0) / 1100);
      el.textContent = brl(from + (to - from) * (1 - Math.pow(1 - k, 3)));
      if (k < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }

  /* ---------- scroll spy ---------- */
  const navLinks = $$('[data-section]');
  const spy = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      const id = e.target.id;
      navLinks.forEach((l) => l.classList.toggle('is-active', l.dataset.section === id));
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  $$('[data-spy]').forEach((s) => spy.observe(s));

  /* ---------- reveal ao rolar ---------- */
  if ('IntersectionObserver' in window && !reduceMotion) {
    const vh = window.innerHeight;
    const rev = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        e.target.classList.remove('is-pre');
        rev.unobserve(e.target);
      });
    }, { threshold: .12 });
    $$('.reveal').forEach((el, i) => {
      if (el.getBoundingClientRect().top < vh) return; // já visível: não esconde
      el.classList.add('is-pre');
      el.style.transitionDelay = `${(i % 4) * 70}ms`;
      rev.observe(el);
    });
  }
})();
