/* ========= CONFIG : ajoute tes images ici (chemin ou URL) ========= */
const IMG_DIR = ''; // ex. 'images/' si tes fichiers sont dans un dossier
const IMG = f => (f ? IMG_DIR + f : '');
const CONFIG = {
  photo: IMG('moi.JPG'),    // portrait du hero
  about: IMG('lieu2.png'),    // image « A propos »
  contact: IMG('moi.JPG'),  // image du bloc contact
  video: '',                // fichier vidéo (mp4)
  cv: '#',                  // lien vers ton CV
  linkedin: '#',            // ex. 'https://www.linkedin.com/in/ton-profil'
  github: '#',              // ex. 'https://github.com/ton-pseudo'
  projects: [
    { title: 'FREIZ', text: 'Création d’une entreprise de compote énergisante', img: IMG('freiz.png'), url: 'freiz.html' },
    { title: 'Petit Prince', text: 'Création d’une affiche inspirée du Petit Prince', img: IMG('prince.png'), url: '#file:///F:/perso/portfoliommi/portfolio2/prince.html' },
    { title: 'Squeezie', text: 'Projet autour de Squeezie', img: IMG('squeezie.png'), url: '#file:///F:/perso/portfoliommi/portfolio2/squeezie.html' },
    { title: 'calistenics', text: 'Projet de calistenics', img: IMG('cali.png'), url: '#file:///F:/perso/portfoliommi/portfolio2/cali.html' }
  ]
};
/* ================================================================== */
gsap.registerPlugin(ScrollTrigger);
const $ = s => document.querySelector(s);
const setBg = (sel, src) => { if (src) $(sel).style.backgroundImage = 'url("' + src + '")'; };
setBg('#imgHero', CONFIG.photo); setBg('#imgAbout', CONFIG.about); setBg('#imgContact', CONFIG.contact || CONFIG.photo);
$('#cv').href = CONFIG.cv;
[['#linkedin', CONFIG.linkedin], ['#github', CONFIG.github]].forEach(([sel, url]) => { const a = $(sel); a.href = url || '#'; if (url && url !== '#') { a.target = '_blank'; a.rel = 'noopener noreferrer'; } else a.addEventListener('click', e => e.preventDefault()); });
if (CONFIG.video) { const v = $('#vid'); v.src = CONFIG.video; v.play().catch(() => {}); $('#vlabel').remove(); }

/* ---- Lenis ---- */
const lenis = new Lenis({ lerp: 0.1 });
lenis.on('scroll', ScrollTrigger.update);
gsap.ticker.add(t => lenis.raf(t * 1000));
gsap.ticker.lagSmoothing(0);
document.querySelectorAll('[data-to]').forEach(a => a.addEventListener('click', e => { e.preventDefault(); lenis.scrollTo(a.dataset.to, { offset: 0 }); }));

/* ---- Burger menu ---- */
(() => {
  const burger = document.getElementById('burger');
  const links = document.getElementById('navLinks');
  if (!burger || !links) return;
  const set = open => {
    links.classList.toggle('open', open);
    burger.setAttribute('aria-expanded', open);
    burger.setAttribute('aria-label', open ? 'Fermer le menu' : 'Ouvrir le menu');
  };
  burger.addEventListener('click', () => set(!links.classList.contains('open')));
  links.querySelectorAll('a').forEach(a => a.addEventListener('click', () => set(false)));
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && links.classList.contains('open')) { set(false); burger.focus(); } });
  document.addEventListener('click', e => { if (!e.target.closest('.nav')) set(false); });
  matchMedia('(min-width:701px)').addEventListener('change', e => { if (e.matches) set(false); });
})();

/* ---- Boutons GSAP : survol élastique, effet magnétique, appui, couleur ---- */
const canHover = matchMedia('(hover: hover)').matches;
document.querySelectorAll('.btn,.round').forEach(b => {
  const bg = getComputedStyle(b).backgroundColor, fg = getComputedStyle(b).color;
  b.addEventListener('mouseenter', () => canHover && gsap.to(b, { scale: 1.08, backgroundColor: '#3aa72e', color: '#fff', duration: .5, ease: 'elastic.out(1,.5)' }));
  b.addEventListener('mousemove', e => { if (!canHover) return; const r = b.getBoundingClientRect(); gsap.to(b, { x: (e.clientX - r.left - r.width / 2) * .25, y: (e.clientY - r.top - r.height / 2) * .35, duration: .3 }); });
  b.addEventListener('mouseleave', () => gsap.to(b, { scale: 1, x: 0, y: 0, backgroundColor: bg, color: fg, duration: .6, ease: 'elastic.out(1,.6)' }));
  b.addEventListener('pointerdown', () => gsap.to(b, { scale: .92, duration: .12 }));
  b.addEventListener('pointerup', () => gsap.to(b, { scale: canHover ? 1.08 : 1, duration: .4, ease: 'back.out(3)' }));
  b.addEventListener('pointercancel', () => gsap.to(b, { scale: 1, duration: .3 }));
});
const toast = $('#toast');
$('#copy').addEventListener('click', () => {
  try { navigator.clipboard.writeText('ei.matthieub@gmail.com'); } catch (e) {}
  toast.textContent = 'Adresse copiée';
  gsap.timeline().fromTo(toast, { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: .4, ease: 'back.out(2)' }).to(toast, { opacity: 0, y: 10, duration: .3, delay: 1.4 });
});

/* ---- Hero : clic sur la photo = la carte se retourne (LinkedIn / GitHub) ---- */
(function () {
  const flip = $('#flip'), inner = $('#flipIn'), front = $('#imgHero'), back = $('#flipBack');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let flipped = false;
  const turn = (deg, d, ease) => gsap.to(inner, { rotationY: deg, duration: reduce ? 0 : d, ease, overwrite: true });
  function toggle() {
    flipped = !flipped;
    turn(flipped ? 180 : 0, 1, 'back.inOut(1.3)');
    front.inert = flipped; back.inert = !flipped;                 // seule la face visible est atteignable au clavier
    front.setAttribute('aria-pressed', flipped);
    (flipped ? $('#linkedin') : front).focus({ preventScroll: true });
  }
  flip.addEventListener('click', e => { if (!e.target.closest('a')) toggle(); });
  front.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); } });
  back.addEventListener('keydown', e => { if (e.key === 'Escape') toggle(); });
  /* petit indice au survol : la carte s'incline légèrement */
  flip.addEventListener('pointerenter', e => { if (e.pointerType === 'mouse' && !flipped) turn(14, .5, 'power2.out'); });
  flip.addEventListener('pointerleave', () => { if (!flipped) turn(0, .6, 'elastic.out(1,.6)'); });
})();

/* ---- Vidéo : grandit en plein écran, tient 1 scroll, puis rétrécit ----
   IMPORTANT : créée AVANT les autres ScrollTrigger, car elle ajoute un espace
   de pin. Sinon les titres situés plus bas se déclenchent trop tôt. */
const small = 'inset(19vh 9vw 19vh 9vw round 44px)', full = 'inset(0vh 0vw 0vh 0vw round 0px)';
gsap.timeline({ scrollTrigger: { trigger: '#video', start: 'top top', end: '+=300%', pin: true, scrub: .6 } })
  .fromTo('#vbox', { clipPath: small }, { clipPath: full, duration: 1, ease: 'power2.inOut' })
  .to({}, { duration: 1 })
  .to('#vbox', { clipPath: small, duration: 1, ease: 'power2.inOut' });

/* ---- Texte : découpe en mots ---- */
document.querySelectorAll('.title .t, .split').forEach(el => {
  el.innerHTML = el.textContent.trim().split(/\s+/).map(w => '<span class="w"><span>' + w + '</span></span>').join(' ');
});
gsap.from('.nav', { y: -80, opacity: 0, duration: 1, ease: 'power3.out' });
gsap.from('.hero .card > *', { y: 40, opacity: 0, duration: 1.1, stagger: .15, ease: 'power3.out', delay: .2 });

/* ---- Titres : les mots montent, puis le soulignement se dessine (GSAP + SVG) ----
   Le tracé est recalculé aux dimensions réelles du SVG (pas de déformation du trait)
   et l'animation pilote une valeur 0 -> 1 : elle reste juste après un redimensionnement.
   Rejoué en sens inverse quand on remonte au-dessus du titre. */
document.querySelectorAll('.title').forEach(t => {
  const svg = t.querySelector('.ul'), path = svg.querySelector('path');
  const prog = { p: 0 };
  let len = 0;
  const draw = () => { path.style.strokeDashoffset = len * (1 - prog.p); };
  const build = () => {
    const w = Math.max(40, Math.round(svg.getBoundingClientRect().width)), h = 14;
    svg.setAttribute('viewBox', '0 0 ' + w + ' ' + h);
    svg.removeAttribute('preserveAspectRatio');
    path.setAttribute('d', 'M3 8 C ' + (w * .25) + ' 3, ' + (w * .6) + ' 12, ' + (w - 3) + ' 6');
    len = path.getTotalLength();
    path.style.strokeDasharray = len + ' ' + len;
    draw();
  };
  build();
  new ResizeObserver(build).observe(svg);               // largeur changée (police chargée, resize…)
  path.style.visibility = 'hidden';                     // évite le point du bout arrondi au repos
  gsap.timeline({ scrollTrigger: { trigger: t, start: 'top 85%', toggleActions: 'play none none reverse' } })
    .from(t.querySelectorAll('.w>span'), { yPercent: 115, duration: .8, stagger: .06, ease: 'power4.out' })
    .set(path, { visibility: 'visible' }, '-=.25')
    .to(prog, { p: 1, duration: 1, ease: 'power2.inOut', onUpdate: draw }, '<')
    .set(path, { visibility: 'visible' }, '>');
});
document.querySelectorAll('.split').forEach(p => gsap.from(p.querySelectorAll('.w>span'), { yPercent: 115, duration: .7, stagger: .025, ease: 'power3.out', scrollTrigger: { trigger: p, start: 'top 88%' } }));
gsap.from('.about .ph', { scale: .85, opacity: 0, duration: 1, ease: 'power3.out', scrollTrigger: { trigger: '.about', start: 'top 75%' } });
gsap.from('.contact', { y: 60, opacity: 0, duration: 1, ease: 'power3.out', scrollTrigger: { trigger: '.contact', start: 'top 85%' } });
addEventListener('load', () => ScrollTrigger.refresh());

/* ---- Décor montagne / forêt : silhouettes générées (reproductibles), parallaxe ---- */
(function () {
  const NS = 'http://www.w3.org/2000/svg'; let W = 1600;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let seed = 11; const rnd = () => (seed = seed * 16807 % 2147483647) / 2147483647;
  const svg = (H, layers, cls, fit) => {
    const s = document.createElementNS(NS, 'svg');
    s.setAttribute('viewBox', '0 0 ' + W + ' ' + H); s.setAttribute('preserveAspectRatio', fit || 'xMidYMax slice');
    if (cls) s.setAttribute('class', cls);
    layers.forEach(([d, fill]) => { const p = document.createElementNS(NS, 'path'); p.setAttribute('d', d); p.setAttribute('fill', fill); s.appendChild(p); });
    return s;
  };
  /* crêtes : pics et vallées en alternance */
  const mountains = (H, base, amp, step) => {
    let d = 'M0 ' + H + ' L0 ' + base, x = 0, up = true;
    while (x < W) { x = Math.min(W, x + step * (.6 + rnd() * .8)); d += ' L' + x.toFixed(0) + ' ' + (base - (up ? amp * (.45 + rnd() * .55) : amp * rnd() * .3)).toFixed(0); up = !up; }
    return d + ' L' + W + ' ' + H + ' Z';
  };
  /* sapins sur un sol qui ondule */
  const ground = (y0, x) => y0 + Math.sin(x / 140) * 14 + Math.sin(x / 47) * 4;
  const pines = (H, y0, hMin, hMax, gap) => {
    let d = 'M0 ' + H + ' L0 ' + ground(y0, 0).toFixed(0);
    for (let x = 0; x <= W; x += 20) d += ' L' + x + ' ' + ground(y0, x).toFixed(0);
    d += ' L' + W + ' ' + H + ' Z';
    for (let x = -10; x < W + 20; x += gap * (.65 + rnd() * .7)) {
      const h = hMin + rnd() * (hMax - hMin), w = h * .3, y = ground(y0, x) + 4;
      [[0, .55, 1], [.24, .8, .74], [.48, 1, .5]].forEach(([b, t, k]) => { d += ' M' + (x - w * k).toFixed(0) + ' ' + (y - h * b).toFixed(0) + ' L' + x.toFixed(0) + ' ' + (y - h * t).toFixed(0) + ' L' + (x + w * k).toFixed(0) + ' ' + (y - h * b).toFixed(0) + ' Z'; });
    }
    return d;
  };

  /* hero */
  const scene = $('#scene');
  if (scene) {
    const glow = document.createElement('div'); glow.className = 'glow'; scene.appendChild(glow);
    const L = [
      svg(500, [[mountains(500, 300, 250, 170), '#27401e']], 'lay'),
      svg(500, [[mountains(500, 360, 190, 120), '#2f4d24']], 'lay'),
      svg(500, [[pines(500, 430, 80, 160, 34), '#15270f']], 'lay'),
      svg(500, [[pines(500, 472, 120, 260, 66), '#101e0a']], 'lay')
    ];
    L.forEach(s => scene.appendChild(s));
    if (!reduce) {
      [70, 45, 22, 0].forEach((y, i) => gsap.to(L[i], { y, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } }));
    }
  }
  /* footer : lisière de sapins, calculée à la taille réelle (jamais recadrée) */
  const tl = $('#treeline');
  if (tl) {
    const build = () => {
      const w = tl.clientWidth, H = tl.clientHeight; if (!w || !H) return;
      const keep = W; W = w; seed = 11;
      tl.replaceChildren(svg(H, [[pines(H, H * .7, 55, 105, 46), '#101b0b'], [pines(H, H * .9, 80, 150, 78), '#0a1206']], '', 'none'));
      W = keep;
    };
    build();
    let lastW = tl.clientWidth;
    new ResizeObserver(() => { if (tl.clientWidth !== lastW) { lastW = tl.clientWidth; build(); } }).observe(tl);
  }
})();

/* ---- Signature : tracé à la main, trait par trait. Clic = on la réécrit ---- */
(function () {
  const btn = $('#sign');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  /* ordre d'écriture : nom, barre des « t », point du « i », paraphe */
  const strokes = ['.s-main', '.s-bar', '.s-dot', '.s-swash'].map(s => {
    const p = btn.querySelector(s), len = p.getTotalLength();
    p.style.strokeDasharray = len + ' ' + len;
    return { p, len };
  });
  const total = strokes.reduce((n, s) => n + s.len, 0);
  const set = v => strokes.forEach(s => s.p.style.strokeDashoffset = s.len * v);
  set(1);
  const tl = gsap.timeline({ paused: true, onComplete: () => set(0) });
  strokes.forEach((s, i) => {
    const dur = Math.max(.12, s.len / total * 3.2);                  // vitesse constante d'une trace à l'autre
    tl.fromTo(s.p, { strokeDashoffset: s.len }, { strokeDashoffset: 0, duration: reduce ? 0 : dur, ease: i === 0 ? 'power1.inOut' : 'power2.out' }, i === 0 ? 0 : '+=.12');
  });
  const play = () => { set(1); tl.restart(); };
  btn.addEventListener('click', play);
  ScrollTrigger.create({ trigger: 'footer', start: 'top 98%', once: true, onEnter: play });
  if (reduce) set(0);
})();

/* ---- Simulateur : gain estimé grâce à un meilleur site ---- */
(function () {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const nf = (n, d = 0) => n.toLocaleString('fr-FR', { maximumFractionDigits: d });
  const money = n => nf(Math.round(n)) + '\u00a0€';
  const clients = n => nf(n, n < 10 ? 1 : 0);
  const rate = n => nf(n, 2) + '\u00a0%';
  const I = { visits: $('#sVisits'), rate: $('#sRate'), value: $('#sValue'), design: $('#sDesign'), flow: $('#sFlow') };
  const O = { visits: v => nf(+v), rate: v => nf(+v, 1) + '\u00a0%', value: v => money(+v), design: v => '+' + v + '\u00a0%', flow: v => '+' + v + '\u00a0%' };
  const shown = { gain: 0, before: 0, after: 0, cB: 0, cA: 0 };
  let rates = '';

  function paint() {
    $('#rGain').textContent = '+\u00a0' + money(shown.gain);
    $('#rBefore').textContent = money(shown.before) + ' / mois';
    $('#rAfter').textContent = money(shown.after) + ' / mois';
    $('#rClients').textContent = clients(shown.cB) + ' → ' + clients(shown.cA);
    $('#rRates').textContent = rates;
  }
  function update() {
    Object.entries(I).forEach(([k, el]) => {
      $('#o' + k[0].toUpperCase() + k.slice(1)).textContent = O[k](el.value);
      el.style.setProperty('--p', (el.value - el.min) / (el.max - el.min) * 100 + '%');
    });
    const v = +I.visits.value, r = +I.rate.value / 100, val = +I.value.value;
    const lift = (1 + I.design.value / 100) * (1 + I.flow.value / 100), r2 = r * lift;
    const cB = v * r, cA = v * r2, before = cB * val, after = cA * val;
    rates = rate(r * 100) + ' → ' + rate(r2 * 100);
    $('#bBefore').style.width = (before / after * 100) + '%';
    $('#bAfter').style.width = '100%';
    gsap.to(shown, { gain: (after - before) * 12, before, after, cB, cA, duration: reduce ? 0 : .5, ease: 'power2.out', overwrite: true, onUpdate: paint, onComplete: paint });
  }
  Object.values(I).forEach(el => el.addEventListener('input', update));
  update();
  gsap.from('.sim', { y: 60, opacity: 0, duration: 1, ease: 'power3.out', scrollTrigger: { trigger: '.sim', start: 'top 85%' } });
})();

/* ---- Carrousel circulaire 3D (Three.js) : glisser, flèches, clavier, clic ---- */
(async function () {
  const stage = $('#stage'), canvas = $('#gl');
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  const scene = new THREE.Scene(), camera = new THREE.PerspectiveCamera(35, 1, .1, 100);
  const group = new THREE.Group(); scene.add(group);
  try { await document.fonts.load('800 64px "Bricolage Grotesque"'); await document.fonts.load('500 34px Inter'); } catch (e) {}

  const CW = 800, CH = 820;
  const BTN = { x: CW - 190, y: CH - 100, w: 150, h: 64 };   // zone du bouton « Voir » sur la carte
  function paint(p, ctx, img, hover) {
    ctx.clearRect(0, 0, CW, CH);
    ctx.save(); ctx.beginPath(); ctx.roundRect(0, 0, CW, CH, 60); ctx.clip();
    const g = ctx.createLinearGradient(0, 0, 0, 450); g.addColorStop(0, '#1f3a18'); g.addColorStop(1, '#172011');
    ctx.fillStyle = g; ctx.fillRect(0, 0, CW, 450);
    if (img) { const s = Math.max(CW / img.width, 450 / img.height); ctx.drawImage(img, (CW - img.width * s) / 2, (450 - img.height * s) / 2, img.width * s, img.height * s); }
    else { ctx.fillStyle = 'rgba(255,255,255,.9)'; ctx.font = '800 120px "Bricolage Grotesque",sans-serif'; ctx.textAlign = 'center'; ctx.fillText(p.title, CW / 2, 250); }
    ctx.fillStyle = '#0a1206'; ctx.fillRect(0, 450, CW, CH - 450);
    ctx.textAlign = 'left'; ctx.fillStyle = '#fff';
    ctx.font = '800 68px "Bricolage Grotesque",sans-serif'; ctx.fillText(p.title, 44, 540);
    ctx.font = '500 36px Inter,sans-serif';
    let line = '', y = 600;
    p.text.split(' ').forEach(w => { const t = line ? line + ' ' + w : w; if (ctx.measureText(t).width > CW - 100 && line) { ctx.fillText(line, 44, y); y += 46; line = w; } else line = t; });
    ctx.fillText(line, 44, y);
    ctx.fillStyle = hover ? '#3aa72e' : '#fff'; ctx.beginPath(); ctx.roundRect(BTN.x, BTN.y, BTN.w, BTN.h, 32); ctx.fill();
    ctx.fillStyle = hover ? '#fff' : '#000'; ctx.font = '800 32px "Bricolage Grotesque",sans-serif'; ctx.textAlign = 'center'; ctx.fillText('Voir', CW - 115, CH - 57);
    ctx.restore();
  }
  const layers = CONFIG.projects.map(p => {
    const c = document.createElement('canvas'); c.width = CW; c.height = CH;
    const ctx = c.getContext('2d'), t = new THREE.CanvasTexture(c);
    t.anisotropy = renderer.capabilities.getMaxAnisotropy();
    const L = { p, ctx, t, img: null, hover: false };
    L.draw = () => { paint(p, ctx, L.img, L.hover); t.needsUpdate = true; };
    L.draw();
    if (p.img) {
      const im = new Image();
      im.onload = () => { L.img = im; L.draw(); };
      im.onerror = () => console.warn('Image introuvable : ' + p.img);
      im.src = p.img;
    }
    return L;
  });
  const tex = layers.map(L => L.t);

  /* anneau : chaque projet est répété pour obtenir au moins 8 cartes */
  const N = CONFIG.projects.length * Math.ceil(8 / CONFIG.projects.length), step = Math.PI * 2 / N;
  const cw = 2, ch = cw * CH / CW, R = cw * 1.15 / (2 * Math.sin(Math.PI / N));
  const geo = new THREE.PlaneGeometry(cw, ch), cards = [];
  for (let i = 0; i < N; i++) {
    const k = i % CONFIG.projects.length, a = i * step;
    const holder = new THREE.Group(); holder.position.set(Math.sin(a) * R, 0, Math.cos(a) * R); holder.rotation.y = a;
    const f = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ map: tex[k], transparent: true }));
    const b = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ map: tex[k], transparent: true }));
    b.rotation.y = Math.PI; b.position.z = -.01; f.userData.i = b.userData.i = i;
    holder.add(f, b); group.add(holder); cards.push({ f, b, a, k });
  }

  function resize() {
    const w = stage.clientWidth, h = stage.clientHeight;
    renderer.setSize(w, h, false); camera.aspect = w / h;
    const d = Math.max(5.9, (cw * 1.35) / (2 * Math.tan(17.5 * Math.PI / 180) * camera.aspect));
    camera.position.set(0, .5, R + d); camera.lookAt(0, 0, 0); camera.updateProjectionMatrix();
  }
  resize(); addEventListener('resize', resize);

  const S = { rot: 0 }; let dragging = false, lastX = 0, vel = 0, moved = 0;
  const snap = g => gsap.to(S, { rot: g, duration: 1.1, ease: 'power3.out', overwrite: true });
  const nearest = () => Math.round(S.rot / step) * step;

  stage.addEventListener('pointerdown', e => { dragging = true; moved = 0; lastX = e.clientX; vel = 0; gsap.killTweensOf(S); stage.classList.add('drag'); stage.setPointerCapture(e.pointerId); });
  const ray = new THREE.Raycaster(), m = new THREE.Vector2();
  const wrap = x => { const T = Math.PI * 2; return ((x + Math.PI) % T + T) % T - Math.PI; };   // modulo toujours positif
  /* renvoie { i, onBtn } : carte touchée et si le point touché est dans le bouton « Voir » */
  function pick(e) {
    const r = canvas.getBoundingClientRect();
    m.set((e.clientX - r.left) / r.width * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
    ray.setFromCamera(m, camera);
    const hit = ray.intersectObjects(cards.flatMap(c => [c.f, c.b]))[0]; if (!hit) return null;
    const x = hit.uv.x * CW, y = (1 - hit.uv.y) * CH, pad = 14;
    return { i: hit.object.userData.i, onBtn: x >= BTN.x - pad && x <= BTN.x + BTN.w + pad && y >= BTN.y - pad && y <= BTN.y + BTN.h + pad };
  }
  const setHover = k => { layers.forEach((L, j) => { const h = j === k; if (L.hover !== h) { L.hover = h; L.draw(); } }); stage.classList.toggle('link', k >= 0); };

  stage.addEventListener('pointermove', e => {
    if (dragging) { const dx = e.clientX - lastX; lastX = e.clientX; moved += Math.abs(dx); vel = dx; S.rot -= dx * .006; return; }
    if (e.pointerType === 'touch') return;
    const h = pick(e); setHover(h && h.onBtn ? h.i % CONFIG.projects.length : -1);
  });
  stage.addEventListener('pointerleave', () => { if (!dragging) setHover(-1); });
  const end = () => { if (!dragging) return; dragging = false; stage.classList.remove('drag'); snap(Math.round((S.rot - vel * .03) / step) * step); };
  stage.addEventListener('pointerup', end); stage.addEventListener('pointercancel', end);
  $('#next').addEventListener('click', () => snap(nearest() + step));
  $('#prev').addEventListener('click', () => snap(nearest() - step));
  stage.tabIndex = 0;
  stage.addEventListener('keydown', e => { if (e.key === 'ArrowRight') snap(nearest() + step); if (e.key === 'ArrowLeft') snap(nearest() - step); });

  stage.addEventListener('click', e => {
    if (moved > 6) return;
    const h = pick(e); if (!h) return;
    const delta = wrap(h.i * step - nearest());
    if (Math.abs(delta) > .01) { snap(nearest() + delta); return; }          // carte de côté : on l'amène devant
    if (!h.onBtn) return;                                                    // devant : seul le bouton « Voir » ouvre
    const u = CONFIG.projects[h.i % CONFIG.projects.length].url;
    if (u && u !== '#') window.open(u, '_blank', 'noopener');
    else { toast.textContent = 'Lien du projet à venir'; gsap.timeline().fromTo(toast, { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: .4, ease: 'back.out(2)' }).to(toast, { opacity: 0, y: 10, duration: .3, delay: 1.4 }); }
  });

  let visible = true; new IntersectionObserver(en => visible = en[0].isIntersecting).observe(stage);
  gsap.ticker.add(() => {
    if (!visible) return;
    group.rotation.y = -S.rot;
    cards.forEach(c => { const v = .3 + .7 * Math.pow((Math.cos(c.a - S.rot) + 1) / 2, 1.5); c.f.material.color.setScalar(v); c.b.material.color.setScalar(v); });
    renderer.render(scene, camera);
  });
  gsap.from(S, { rot: Math.PI * 1.2, duration: 1.8, ease: 'power3.out', scrollTrigger: { trigger: stage, start: 'top 80%', once: true } });
  gsap.from(camera.position, { y: 3, duration: 1.8, ease: 'power3.out', onUpdate: () => camera.lookAt(0, 0, 0), scrollTrigger: { trigger: stage, start: 'top 80%', once: true } });
})();