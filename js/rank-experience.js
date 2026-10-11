/* =========================================================
   EloPlus — Rank Experience
   scroll position → progress → frame → canvas
   ========================================================= */
(() => {
  'use strict';

  const section = document.getElementById('rankExperience');
  if (!section) return;

  /* ---------- configuração ---------- */
  const FRAMES = {
    desktop: { path: 'assets/rank-frames/', count: 155 },        // 1920×1080, 8 fps
    mobile: { path: 'assets/rank-frames/mobile/', count: 155 },  // recorte central 720×960
  };
  const FALLBACK_VIDEO = 'assets/rank-up-fallback.mp4';
  const MOBILE_BREAKPOINT = 768;
  const FIRST_FRAME = 2;     // frames 0–1 do vídeo são o fade-in do Ferro: tocam durante a entrada da seção

  // Parte da rolagem usada pela animação; o resto segura o Radiante + CTA e faz a saída.
  const ANIM_END = 0.86;
  const FINAL_AT = 0.80;   // "Do Ferro ao Radiante"
  const CTA_AT = 0.86;     // botão
  const EXIT_FROM = 0.94;  // canvas começa a perder opacidade

  // Primeiro frame (0-based) de cada rank, medido no vídeo (flash de transição).
  const RANKS = [
    { name: 'Ferro', frame: 0, color: '#A8AEB8', copy: 0 },
    { name: 'Bronze', frame: 14, color: '#D49A55', copy: 1 },
    { name: 'Prata', frame: 29, color: '#DCE3EC', copy: 1 },
    { name: 'Ouro', frame: 43, color: '#F2B632', copy: 2 },
    { name: 'Platina', frame: 58, color: '#4FD3E8', copy: 2 },
    { name: 'Diamante', frame: 72, color: '#C08BFF', copy: 3 },
    { name: 'Ascendente', frame: 86, color: '#3DDC84', copy: 4 },
    { name: 'Imortal', frame: 101, color: '#FF5A82', copy: 5 },
    { name: 'Radiante', frame: 115, color: '#FFE27A', copy: 6 },
  ];

  /* ---------- elementos ---------- */
  const canvas = document.getElementById('rankCanvas');
  const ctx = canvas.getContext && canvas.getContext('2d', { alpha: false });
  const poster = document.getElementById('rankPoster');
  const video = document.getElementById('rankFallback');
  const lines = [...section.querySelectorAll('.rx-line')];
  const finalBox = document.getElementById('rxFinal');
  const cta = document.getElementById('rxCta');
  const numEl = document.getElementById('rxNum');
  const nameEl = document.getElementById('rxName');
  const rrEl = document.getElementById('rxRR');
  const hint = document.getElementById('rxHint');
  const loader = document.getElementById('rxLoader');
  const loadFill = document.getElementById('rxLoadFill');
  const track = document.getElementById('rxTrack');

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const pad = (n) => String(n).padStart(2, '0');

  /* ---------- estado ---------- */
  let set = null;            // FRAMES.desktop | FRAMES.mobile
  let frames = [];           // HTMLImageElement por índice
  let loaded = [];           // boolean por índice
  let errors = 0;
  let loadStarted = false;
  let currentFrame = -1;
  let currentRank = -1;
  let currentCopy = -1;
  let targetP = 0;
  let smoothP = 0;
  let raf = 0;
  let running = false;
  let useVideo = false;
  let cw = 0, ch = 0;

  // ticks dos ranks na barra
  RANKS.forEach((r) => {
    const t = document.createElement('span');
    t.className = 'rx-tick';
    t.style.left = `${(r.frame / (FRAMES.desktop.count - 1)) * 100}%`;
    track.appendChild(t);
  });
  const ticks = [...track.querySelectorAll('.rx-tick')];

  const pickSet = () => (window.innerWidth < MOBILE_BREAKPOINT ? FRAMES.mobile : FRAMES.desktop);
  const frameSrc = (i) => `${set.path}frame-${String(i + 1).padStart(4, '0')}.webp`;

  /* ---------- carregamento ---------- */
  function loadOrder(count) {
    const order = [];
    const seen = new Set();
    const push = (i) => { if (i >= 0 && i < count && !seen.has(i)) { seen.add(i); order.push(i); } };
    push(FIRST_FRAME);                                   // frame de repouso
    for (let i = 0; i < 20; i++) push(i);                // início
    RANKS.forEach((r) => { push(r.frame); push(r.frame + 4); });
    push(count - 1);                                     // final
    [8, 4, 2, 1].forEach((step) => { for (let i = 0; i < count; i += step) push(i); });
    return order;
  }

  function loadRankFrames() {
    if (loadStarted || !ctx) return;
    loadStarted = true;
    set = pickSet();
    frames = new Array(set.count);
    loaded = new Array(set.count).fill(false);
    errors = 0;
    const order = loadOrder(set.count);
    const essential = new Set(order.slice(0, 20 + RANKS.length * 2 + 1));
    let essentialDone = 0;
    let cursor = 0;
    const thisSet = set;

    const next = () => {
      if (thisSet !== set || cursor >= order.length) return;
      const i = order[cursor++];
      const img = new Image();
      img.decoding = 'async';
      img.src = frameSrc(i);
      const done = (ok) => {
        if (thisSet !== set) return;
        if (ok) { frames[i] = img; loaded[i] = true; } else { errors++; }
        if (essential.has(i)) {
          essentialDone++;
          loadFill.style.transform = `scaleX(${essentialDone / essential.size})`;
          if (essentialDone >= essential.size) loader.classList.add('is-done');
        }
        if (errors > set.count * 0.2 && !useVideo) enableVideoFallback();
        if (ok && (i === currentFrame || currentFrame < 0 || !loaded[currentFrame])) { currentFrame = -1; requestRender(); }
        next();
      };
      (img.decode ? img.decode() : Promise.resolve()).then(() => done(true)).catch(() => {
        // decode() pode falhar em imagens válidas; confirma pelo onload
        if (img.complete && img.naturalWidth) done(true);
        else { img.onload = () => done(true); img.onerror = () => done(false); }
      });
    };
    for (let k = 0; k < 6; k++) next(); // 6 downloads em paralelo
  }

  /* ---------- canvas ---------- */
  function resizeRankCanvas() {
    const r = canvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    cw = Math.max(1, Math.round(r.width * dpr));
    ch = Math.max(1, Math.round(r.height * dpr));
    if (canvas.width !== cw || canvas.height !== ch) { canvas.width = cw; canvas.height = ch; }
    // troca desktop ↔ mobile ao cruzar o breakpoint
    if (loadStarted && pickSet() !== set) {
      loadStarted = false;
      section.classList.remove('is-drawn');
      loader.classList.remove('is-done');
      loadRankFrames();
    }
    currentFrame = -1;
    requestRender();
  }

  function nearestLoaded(i) {
    if (loaded[i]) return i;
    for (let d = 1; d < loaded.length; d++) {
      if (loaded[i - d]) return i - d;
      if (loaded[i + d]) return i + d;
    }
    return -1;
  }

  function drawRankFrame(index) {
    const i = nearestLoaded(index);
    if (i < 0) return false;
    const img = frames[i];
    const iw = img.naturalWidth, ih = img.naturalHeight;
    // object-fit: cover, centralizado (o rank fica sempre no centro do vídeo)
    const scale = Math.max(cw / iw, ch / ih);
    const dw = iw * scale, dh = ih * scale;
    ctx.drawImage(img, (cw - dw) / 2, (ch - dh) / 2, dw, dh);
    if (!section.classList.contains('is-drawn')) section.classList.add('is-drawn');
    return i === index;
  }

  /* ---------- progresso ---------- */
  function scrollProgress() {
    const rect = section.getBoundingClientRect();
    const dist = section.offsetHeight - window.innerHeight;
    return { p: Math.min(Math.max(-rect.top / dist, 0), 1), top: rect.top };
  }

  function getRankFromProgress(frame) {
    let idx = 0;
    for (let k = 0; k < RANKS.length; k++) if (frame >= RANKS[k].frame) idx = k;
    return idx;
  }

  function updateRankProgress(p, top) {
    const anim = Math.min(p / ANIM_END, 1);
    const count = set ? set.count : FRAMES.desktop.count;
    const vh = window.innerHeight;
    // entrada: enquanto a seção sobe na tela, o Ferro aparece (frames 0 → FIRST_FRAME)
    const frame = top > 0
      ? Math.round(Math.min(Math.max(1 - top / (vh * 0.6), 0), 1) * FIRST_FRAME)
      : FIRST_FRAME + Math.round(anim * (count - 1 - FIRST_FRAME));
    const enter = Math.min(Math.max(1 - top / 40, 0), 1);
    const exit = Math.min(Math.max((p - EXIT_FROM) / (1 - EXIT_FROM), 0), 1);

    section.style.setProperty('--rx-p', p.toFixed(4));
    section.style.setProperty('--rx-anim', anim.toFixed(4));
    section.style.setProperty('--rx-enter', enter.toFixed(3));
    section.style.setProperty('--rx-exit', exit.toFixed(3));

    // rank atual + contador
    const rank = getRankFromProgress(frame);
    if (rank !== currentRank) {
      currentRank = rank;
      numEl.textContent = pad(rank + 1);
      nameEl.textContent = RANKS[rank].name;
      section.style.setProperty('--rk', RANKS[rank].color);
      ticks.forEach((t, k) => t.classList.toggle('is-on', k <= rank));
    }
    // RR fictício subindo dentro de cada rank
    const start = RANKS[rank].frame;
    const end = rank < RANKS.length - 1 ? RANKS[rank + 1].frame : count - 1;
    rrEl.textContent = pad(Math.min(99, Math.round(((frame - start) / Math.max(1, end - start)) * 99)));

    // textos: um por fase; no fim, só o bloco final
    const copy = p >= FINAL_AT ? -1 : RANKS[rank].copy;
    if (copy !== currentCopy) {
      currentCopy = copy;
      lines.forEach((l, k) => l.classList.toggle('is-on', k === copy));
    }
    finalBox.classList.toggle('is-on', p >= FINAL_AT);
    const ctaOn = p >= CTA_AT;
    cta.classList.toggle('is-on', ctaOn);
    cta.tabIndex = ctaOn ? 0 : -1;
    hint.classList.toggle('is-off', p > 0.02);

    return frame;
  }

  /* ---------- loop ---------- */
  function render() {
    raf = 0;
    const { p, top } = scrollProgress();
    targetP = p;
    // interpolação curta: suaviza trackpad sem atraso perceptível
    smoothP += (targetP - smoothP) * 0.35;
    if (Math.abs(targetP - smoothP) < 0.0008) smoothP = targetP;

    const frame = updateRankProgress(smoothP, top);
    if (useVideo) {
      if (video.duration) video.currentTime = Math.min(smoothP / ANIM_END, 1) * (video.duration - 0.05);
    } else if (frame !== currentFrame) {
      if (drawRankFrame(frame)) currentFrame = frame;
    }
    if (running && smoothP !== targetP) requestRender();
  }
  function requestRender() { if (!raf) raf = requestAnimationFrame(render); }
  const onScroll = () => { if (running) requestRender(); };

  /* ---------- fallback em vídeo ---------- */
  function enableVideoFallback() {
    useVideo = true;
    video.src = FALLBACK_VIDEO;
    video.preload = 'auto';
    video.hidden = false;
    canvas.style.display = 'none';
    poster.style.display = 'none';
    loader.classList.add('is-done');
    video.addEventListener('loadedmetadata', requestRender, { once: true });
  }

  /* ---------- movimento reduzido: versão estática ---------- */
  if (reduceMotion) {
    section.classList.add('rx-static');
    poster.src = `${FRAMES.desktop.path}frame-${String(FRAMES.desktop.count).padStart(4, '0')}.webp`;
    numEl.textContent = '09';
    nameEl.textContent = 'Radiante';
    finalBox.classList.add('is-on');
    cta.classList.add('is-on');
    cta.tabIndex = 0;
    loader.classList.add('is-done');
    canvas.style.display = 'none';
    return;
  }

  if (!ctx) { enableVideoFallback(); }

  /* ---------- início preguiçoso + loop só perto da seção ---------- */
  if ('IntersectionObserver' in window) {
    // começa a baixar ~2 telas antes
    new IntersectionObserver((entries, obs) => {
      if (entries.some((e) => e.isIntersecting)) { loadRankFrames(); obs.disconnect(); }
    }, { rootMargin: '200% 0px 200% 0px' }).observe(section);

    new IntersectionObserver(([e]) => {
      running = e.isIntersecting;
      document.body.classList.toggle('rx-active', e.isIntersecting && e.intersectionRatio > 0);
      if (running) { resizeRankCanvas(); requestRender(); }
    }, { threshold: [0, 0.01] }).observe(section);
  } else {
    loadRankFrames();
    running = true;
  }

  let resizeRaf = 0;
  window.addEventListener('resize', () => {
    cancelAnimationFrame(resizeRaf);
    resizeRaf = requestAnimationFrame(resizeRankCanvas);
  });
  window.addEventListener('scroll', onScroll, { passive: true });
  resizeRankCanvas();
  updateRankProgress(0, 1);
})();
