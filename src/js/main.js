(() => {
  'use strict';
  const root = document.documentElement;
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));
  const mqReduce = matchMedia('(prefers-reduced-motion: reduce)');
  const mqFine = matchMedia('(hover: hover) and (pointer: fine)');
  const mqDesk = matchMedia('(min-width: 1024px)');
  let reduced = mqReduce.matches;

  /* ---------- counters ---------- */
  const fmt = (v, d) => v.toLocaleString('pt-BR', { minimumFractionDigits: d, maximumFractionDigits: d });
  const counters = $$('[data-count]');
  counters.forEach(el => {
    const final = el.textContent.trim();
    el.dataset.final = final;
    el.innerHTML = '<span class="cv" aria-hidden="true">' + (reduced ? final : fmt(0, +el.dataset.dec || 0)) + '</span><span class="sr-only">' + final + '</span>';
  });
  function runCounter(el, delay) {
    if (el._ran) return; el._ran = true;
    const cv = $('.cv', el), to = parseFloat(el.dataset.count), dec = +el.dataset.dec || 0, dur = +el.dataset.dur || 1300;
    if (reduced) { cv.textContent = el.dataset.final; return; }
    setTimeout(() => {
      const t0 = performance.now();
      const step = t => {
        const p = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - p, 4);
        cv.textContent = fmt(to * e, dec);
        if (p < 1) requestAnimationFrame(step); else cv.textContent = el.dataset.final;
      };
      requestAnimationFrame(step);
    }, delay);
  }
  function startCounters(host, k) {
    const list = host.matches('[data-count]') ? [host] : $$('[data-count]', host);
    list.forEach(c => runCounter(c, (+c.dataset.delay || 0) + (host.classList.contains('kpi') ? 380 + k * 60 : 0)));
  }

  /* ---------- reveal ---------- */
  const revealEls = $$('.reveal,.reveal-title,.reveal-card,.reveal-left,.reveal-right,.reveal-scale,.reveal-blur,.reveal-number,.reveal-line,.group,[data-count]:not(.group [data-count])');
  const onHit = entries => {
    const hits = entries.filter(e => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top || a.boundingClientRect.left - b.boundingClientRect.left);
    hits.forEach((e, k) => {
      const el = e.target;
      el.style.setProperty('--i', Math.min(k, 6));
      el.classList.add('in');
      unobs(el);
      startCounters(el, k);
    });
  };
  const HAS_IO = 'IntersectionObserver' in window;
  /* titles are clipped by clip-path, which IO treats as hidden: they use threshold 0 on a 2% sliver */
  const rio = HAS_IO ? new IntersectionObserver(entries => onHit(entries), { threshold: 0.14, rootMargin: '0px 0px -6% 0px' }) : null;
  const tio = HAS_IO ? new IntersectionObserver(entries => onHit(entries), { threshold: 0, rootMargin: '0px 0px -12% 0px' }) : null;
  const unobs = el => { rio && rio.unobserve(el); tio && tio.unobserve(el); };
  revealEls.forEach(el => HAS_IO ? (el.classList.contains('reveal-title') ? tio : rio).observe(el) : el.classList.add('in'));
  if (!HAS_IO) counters.forEach(c => runCounter(c, 0));

  function revealAll() {
    revealEls.forEach(el => { el.classList.add('in'); });
    counters.forEach(c => { c._ran = false; runCounter(c, 0); });
    $$('.tl-item').forEach(i => { i.classList.add('in'); $('.node', i).classList.add('on'); });
    root.classList.add('hero-go');
    const tl = $('#tl'); if (tl) tl.style.setProperty('--tl', 1);
  }

  /* ---------- hero entrance ---------- */
  const heroGo = () => requestAnimationFrame(() => root.classList.add('hero-go'));
  Promise.race([document.fonts && document.fonts.ready, new Promise(r => setTimeout(r, 700))]).then(heroGo, heroGo);

  /* ---------- scroll: progress, header, parallax, timeline ---------- */
  const progress = $('#progress'), hdr = $('.hdr'), hero = $('.hero'), photo = $('#photoPar'), orb = $('.hero-orb');
  const tl = $('#tl'), tlItems = $$('.tl-item'), tlNodes = tlItems.map(i => $('.node', i));
  let docMax = 1, vh = innerHeight, tlTop = 0, tlH = 1, nodeY = [], ticking = false;

  function measure() {
    vh = innerHeight;
    docMax = Math.max(1, root.scrollHeight - vh);
    if (tl) {
      const sy = scrollY, r = tl.getBoundingClientRect();
      tlTop = r.top + sy; tlH = Math.max(1, r.height);
      nodeY = tlNodes.map(n => { const b = n.getBoundingClientRect(); return b.top + sy + b.height / 2; });
    }
  }
  function frame() {
    ticking = false;
    const sy = scrollY;
    progress.style.transform = 'scaleX(' + Math.min(1, sy / docMax).toFixed(4) + ')';
    hdr.classList.toggle('scrolled', sy > 8);
    if (!reduced && mqDesk.matches && sy < vh * 1.3) {
      photo.style.setProperty('--py', Math.min(24, sy * 0.045).toFixed(2) + 'px');
      orb.style.setProperty('--py2', (-Math.min(30, sy * 0.06)).toFixed(2) + 'px');
    }
    if (tl && !reduced) {
      const line = sy + vh * 0.68;
      tl.style.setProperty('--tl', Math.max(0, Math.min(1, (line - tlTop) / tlH)).toFixed(4));
      tlItems.forEach((it, i) => {
        const on = nodeY[i] <= line;
        if (on !== tlNodes[i]._on) { tlNodes[i]._on = on; tlNodes[i].classList.toggle('on', on); }
        if (on && !it._in) { it._in = true; it.classList.add('in'); }
      });
    }
  }
  const onScroll = () => { if (!ticking) { ticking = true; requestAnimationFrame(frame); } };
  addEventListener('scroll', onScroll, { passive: true });
  let rz = 0;
  const remeasure = () => { cancelAnimationFrame(rz); rz = requestAnimationFrame(() => { measure(); frame(); placeInd(); }); };
  addEventListener('resize', remeasure, { passive: true });
  addEventListener('load', remeasure);
  if ('ResizeObserver' in window) new ResizeObserver(remeasure).observe($('.site'));
  measure(); frame();

  /* ---------- section environments + nav spy ---------- */
  const navLinks = $$('#nav a'), mLinks = $$('#mnav a'), ind = $('#navInd');
  let activeKey = '';
  function placeInd() {
    const a = navLinks.find(l => l.dataset.k === activeKey);
    if (!a) { ind.style.opacity = 0; return; }
    ind.style.setProperty('--x', (a.offsetLeft + 14) + 'px');
    ind.style.setProperty('--w', (a.offsetWidth - 28) + 'px');
    ind.style.opacity = 1;
  }
  function setActive(k) {
    if (k === activeKey) return;
    activeKey = k;
    [...navLinks, ...mLinks].forEach(l => { const on = l.dataset.k === k; l.classList.toggle('active', on); on ? l.setAttribute('aria-current', 'true') : l.removeAttribute('aria-current'); });
    placeInd();
  }
  if ('IntersectionObserver' in window) {
    const spy = new IntersectionObserver(es => es.forEach(e => {
      if (!e.isIntersecting) return;
      setActive(e.target.dataset.nav);
      const s = e.target.style, d = e.target.dataset;
      root.style.setProperty('--grid', d.grid || '.55');
      root.style.setProperty('--gx', d.gx || '0%');
      root.style.setProperty('--gy', d.gy || '0%');
    }), { rootMargin: '-45% 0px -50% 0px' });
    $$('[data-nav]').forEach(s => spy.observe(s));
    const env = new IntersectionObserver(es => es.forEach(e => e.target.classList.toggle('section-visible', e.isIntersecting)), { rootMargin: '-25% 0px -25% 0px' });
    $$('.section').forEach(s => env.observe(s));
    const cLinks = $$('#caseIndex a');
    const cspy = new IntersectionObserver(es => es.forEach(e => {
      if (e.isIntersecting) cLinks.forEach(l => l.classList.toggle('active', l.dataset.c === e.target.id));
    }), { rootMargin: '-40% 0px -50% 0px' });
    $$('.case[id]').forEach(c => cspy.observe(c));
  } else { $$('.section').forEach(s => s.classList.add('section-visible')); }
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(remeasure);

  /* ---------- mobile menu ---------- */
  const btn = $('#menuBtn'), panel = $('#mnav');
  function setMenu(open) {
    root.classList.toggle('menu-open', open);
    btn.setAttribute('aria-expanded', String(open));
    btn.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
  }
  btn.addEventListener('click', () => setMenu(!root.classList.contains('menu-open')));
  panel.addEventListener('click', e => { if (e.target.closest('a')) setMenu(false); });
  addEventListener('keydown', e => { if (e.key === 'Escape' && root.classList.contains('menu-open')) { setMenu(false); btn.focus(); } });
  matchMedia('(min-width: 860px)').addEventListener('change', e => { if (e.matches) setMenu(false); });

  /* ---------- cursor glow + spotlight (desktop, fine pointer only) ---------- */
  function pointerFx() {
    const g = $('#cglow');
    let tx = -999, ty = -999, cx = tx, cy = ty, raf = 0, sp = null, sx = 0, sy2 = 0, spRaf = 0;
    const loop = () => {
      cx += (tx - cx) * 0.14; cy += (ty - cy) * 0.14;
      g.style.transform = 'translate3d(' + (cx - 240).toFixed(1) + 'px,' + (cy - 240).toFixed(1) + 'px,0)';
      raf = (Math.abs(tx - cx) > 0.5 || Math.abs(ty - cy) > 0.5) ? requestAnimationFrame(loop) : 0;
    };
    addEventListener('pointermove', e => {
      if (e.pointerType === 'touch' || reduced) return;
      if (cx === -999) { cx = e.clientX; cy = e.clientY; }
      tx = e.clientX; ty = e.clientY; g.classList.add('on');
      if (!raf) raf = requestAnimationFrame(loop);
      const c = e.target.closest && e.target.closest('.spot');
      if (c) {
        sp = c; sx = e.clientX; sy2 = e.clientY;
        if (!spRaf) spRaf = requestAnimationFrame(() => {
          spRaf = 0; if (!sp) return;
          const r = sp.getBoundingClientRect();
          sp.style.setProperty('--mx', (sx - r.left).toFixed(0) + 'px');
          sp.style.setProperty('--my', (sy2 - r.top).toFixed(0) + 'px');
        });
      }
    }, { passive: true });
    root.addEventListener('mouseleave', () => g.classList.remove('on'));
  }
  if (mqFine.matches) pointerFx();

  /* ---------- reduced motion ---------- */
  if (reduced) revealAll();
  mqReduce.addEventListener('change', e => { reduced = e.matches; if (reduced) revealAll(); });
})();
