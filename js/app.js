/* ============================================================
   Manuel Correa — Caldas al Congreso 2026
   js/app.js — v3: video real + mapa SVG Caldas + carrusel
   ============================================================ */

'use strict';

// ── CONFIG ────────────────────────────────────────────────────
const FRAME_SPEED   = 1.0;   // reducido para 2000vh
const IMAGE_SCALE   = 1.0;   // 1.0 = full-cover sin barras laterales
const WINDOW        = 0.06;  // ventana de animación por sección
const FRAME_EXT     = 'jpg';

// Dark overlay: sección stats (62–72% en 2000vh)
const STATS_ENTER   = 0.62;
const STATS_LEAVE   = 0.72;

// Hero desaparece al 12% de scroll
const HERO_FADE_END = 0.12;

// ── MAP DATA (v1 real vote counts) ────────────────────────────
const MAP_VOTES = {
  17001:'Manizales',  17013:'Aguadas',    17042:'Anserma',
  17050:'Aranzazu',   17088:'Belalcázar', 17174:'Chinchiná',
  17272:'Filadelfia', 17380:'La Dorada',  17388:'La Merced',
  17433:'Manzanares', 17442:'Marmato',    17444:'Marquetalia',
  17446:'Marulanda',  17486:'Neira',      17495:'Norcasia',
  17513:'Pácora',     17524:'Palestina',  17541:'Pensilvania',
  17614:'Riosucio',   17616:'Risaralda',  17653:'Salamina',
  17662:'Samaná',     17665:'San José',   17777:'Supía',
  17867:'Victoria',   17873:'Villamaría', 17877:'Viterbo'
};
const MAP_VOTE_COUNT = {
  17001:13500, 17013:800,  17042:1500, 17050:480,  17088:680,
  17174:1900,  17272:400,  17380:2800, 17388:360,  17433:760,
  17442:400,   17444:640,  17446:280,  17486:1200, 17495:240,
  17513:560,   17524:680,  17541:880,  17614:1700, 17616:440,
  17653:680,   17662:840,  17665:280,  17777:840,  17867:400,
  17873:2100,  17877:560
};
const MAP_TOTAL  = 35946;
const MAP_MAX_V  = Math.max(...Object.values(MAP_VOTE_COUNT));
const MAP_MUN_INFO = {
  'Manizales':   { img:'images/4.jpeg',  text:'Gran cierre de campaña en la Plaza de Bolívar con más de 10,000 asistentes.' },
  'Aguadas':     { img:'images/2.jpeg',  text:'Apoyo a los artesanos del sombrero aguadeño y promoción del turismo cultural.' },
  'Anserma':     { img:'images/5.jpeg',  text:'Encuentro con caficultores y asociaciones campesinas para fortalecer el comercio agrícola.' },
  'Aranzazu':    { img:'images/6.jpeg',  text:'Diálogos comunitarios enfocados en vías terciarias y educación rural.' },
  'Belalcázar':  { img:'images/7.jpeg',  text:'Recorrido por el Cristo Rey y compromisos con el desarrollo turístico religioso.' },
  'Chinchiná':   { img:'images/9.jpeg',  text:'Visita a las cooperativas de caficultores y propuestas para el comercio.' },
  'Filadelfia':  { img:'images/10.jpeg', text:'Reunión con familias tradicionales y apoyo a programas deportivos juveniles.' },
  'La Dorada':   { img:'images/11.jpeg', text:'Recorrido por el Magdalena Centro, compromisos con la reactivación del puerto.' },
  'La Merced':   { img:'images/12.jpeg', text:'Impulso a los emprendimientos locales y protección del medio ambiente.' },
  'Manzanares':  { img:'images/13.jpeg', text:'Visita a la cuna del aguardiente amarillo y apoyo a la agroindustria local.' },
  'Marmato':     { img:'images/14.jpeg', text:'Diálogos sobre el Paisaje Cultural Minero y defensa de la minería ancestral.' },
  'Marquetalia': { img:'images/15.jpeg', text:'Abrazando a la comunidad y escuchando a los adultos mayores de la región.' },
  'Marulanda':   { img:'images/16.jpeg', text:'Promoción del Paisaje Cultural Ovejero y apoyo a la tradición de la lana.' },
  'Neira':       { img:'images/17.jpeg', text:'Lanzamiento del proyecto Parque Nacional de las Aves y recorrido por las calles.' },
  'Norcasia':    { img:'images/18.jpeg', text:'Compromiso con el turismo ecológico y la protección de los recursos hídricos.' },
  'Pácora':      { img:'images/19.jpeg', text:'Encuentro con las colonias y apoyo a la cultura de las matracas.' },
  'Palestina':   { img:'images/20.jpeg', text:'Foro sobre el Aeropuerto del Café y su impacto en la conectividad regional.' },
  'Pensilvania': { img:'images/23.jpeg', text:'Diálogos sobre la vocación forestal y oportunidades para los jóvenes.' },
  'Riosucio':    { img:'images/24.jpeg', text:'Encuentro con resguardos indígenas y apoyo al Carnaval del Diablo.' },
  'Risaralda':   { img:'images/25.jpeg', text:'Caminata por la Colina Iluminada y propuestas para el desarrollo agrícola.' },
  'Salamina':    { img:'images/3.jpeg',  text:'Recorrido por el patrimonio arquitectónico y fomento del Paisaje Cultural Cafetero.' },
  'Samaná':      { img:'images/1.jpeg',  text:'Encuentros por la reconciliación y el apoyo a las víctimas del conflicto.' },
  'San José':    { img:'images/8.jpeg',  text:'Reunión con líderes cívicos para mejorar la infraestructura de servicios.' },
  'Supía':       { img:'images/11.jpeg', text:'Visita a los mineros artesanales y promoción de la gastronomía local.' },
  'Victoria':    { img:'images/15.jpeg', text:'Recorrido por el oriente caldense y apoyo a proyectos ganaderos sustentables.' },
  'Villamaría':  { img:'images/17.jpeg', text:'Apoyo a la protección del Parque Nacional Natural Los Nevados.' },
  'Viterbo':     { img:'images/20.jpeg', text:'Encuentro en el paraíso turístico de Caldas y fomento del sector turístico.' }
};

function mapVoteColor(v) {
  const t = Math.pow(v / MAP_MAX_V, 0.44);
  return `rgb(${Math.round(18+(230-18)*t)},${Math.round(58+(95-58)*t)},${Math.round(52+(26-52)*t)})`;
}

// ── FRAME LOADING ─────────────────────────────────────────────
const frames     = [];
let loadedCount  = 0;
let totalFrames  = 0;
let currentFrame = 0;
let bgColor      = '#0A1A17';
let hasFrames    = false;

function buildFrameUrl(i) {
  return `frames/frame_${String(i + 1).padStart(4, '0')}.${FRAME_EXT}`;
}

function detectFrames() {
  return new Promise(resolve => {
    const img = new Image();
    img.onload  = () => { hasFrames = true;  resolve(true);  };
    img.onerror = () => { hasFrames = false; resolve(false); };
    img.src = buildFrameUrl(0);
  });
}

function preloadFrames(frameCount) {
  return new Promise(resolve => {
    totalFrames = frameCount;
    if (frameCount === 0) { resolve(); return; }

    const PHASE1 = Math.min(10, frameCount);
    let phase1Done = 0;

    for (let i = 0; i < PHASE1; i++) {
      const img = new Image();
      img.onload = () => {
        frames[img._idx] = img;
        loadedCount++;
        updateLoader(loadedCount, frameCount);
        phase1Done++;
        if (phase1Done === PHASE1) {
          drawFrame(0);
          resolve();
          loadRestInBackground(PHASE1, frameCount);
        }
      };
      img.onerror = () => {
        loadedCount++;
        phase1Done++;
        if (phase1Done === PHASE1) resolve();
      };
      img._idx = i;
      img.src = buildFrameUrl(i);
    }
  });
}

function loadRestInBackground(from, total) {
  for (let i = from; i < total; i++) {
    const img = new Image();
    img.onload = () => { frames[img._idx] = img; loadedCount++; updateLoader(loadedCount, total); };
    img.onerror = () => { loadedCount++; };
    img._idx = i;
    img.src = buildFrameUrl(i);
  }
}

function updateLoader(loaded, total) {
  const pct = total > 0 ? Math.round((loaded / total) * 100) : 100;
  const bar = document.getElementById('loader-bar');
  const txt = document.getElementById('loader-percent');
  if (bar) bar.style.width = pct + '%';
  if (txt) txt.textContent = pct + '%';
}

// ── CANVAS RENDERER ──────────────────────────────────────────
const canvas = document.getElementById('canvas');
const ctx    = canvas.getContext('2d');

function resizeCanvas() {
  const dpr = window.devicePixelRatio || 1;
  canvas.width  = window.innerWidth  * dpr;
  canvas.height = window.innerHeight * dpr;
  ctx.scale(dpr, dpr);
  if (hasFrames && frames[currentFrame]) {
    drawFrame(currentFrame);
  } else {
    drawGenerativeFrame(currentFrame, totalFrames || 200);
  }
}

function sampleBgColor(img) {
  try {
    const tmp = document.createElement('canvas');
    tmp.width = tmp.height = 4;
    const tc = tmp.getContext('2d');
    tc.drawImage(img, 0, 0, 4, 4);
    const d = tc.getImageData(0, 0, 1, 1).data;
    bgColor = `rgb(${d[0]},${d[1]},${d[2]})`;
  } catch (_) { bgColor = '#0A1A17'; }
}

function drawFrame(index) {
  const img = frames[index];
  if (!img) { drawGenerativeFrame(index, totalFrames); return; }

  if (index % 20 === 0) sampleBgColor(img);

  const cw = canvas.width  / (window.devicePixelRatio || 1);
  const ch = canvas.height / (window.devicePixelRatio || 1);
  const iw = img.naturalWidth;
  const ih = img.naturalHeight;

  const scale = Math.max(cw / iw, ch / ih) * IMAGE_SCALE;
  const dw = iw * scale;
  const dh = ih * scale;
  const dx = (cw - dw) / 2;
  const dy = (ch - dh) / 2;

  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, cw, ch);
  ctx.drawImage(img, dx, dy, dw, dh);
}

function drawGenerativeFrame(frameIndex, maxFrames) {
  const cw = canvas.width  / (window.devicePixelRatio || 1);
  const ch = canvas.height / (window.devicePixelRatio || 1);
  const p  = maxFrames > 0 ? frameIndex / maxFrames : 0;

  ctx.clearRect(0, 0, cw, ch);

  const grad = ctx.createRadialGradient(
    cw * (0.3 + p * 0.4), ch * (0.6 - p * 0.3), 0,
    cw * 0.5, ch * 0.5, Math.max(cw, ch) * 0.9
  );
  grad.addColorStop(0, `hsl(${160 + p * 30}, 40%, ${12 + p * 8}%)`);
  grad.addColorStop(0.5, `hsl(${155 + p * 20}, 30%, 7%)`);
  grad.addColorStop(1, '#0A1A17');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, cw, ch);

  const ag = ctx.createRadialGradient(
    cw * (0.85 - p * 0.2), ch * (0.15 + p * 0.1), 0,
    cw * 0.85, ch * 0.15, cw * 0.35
  );
  ag.addColorStop(0, `rgba(232,98,26,${0.07 + p * 0.05})`);
  ag.addColorStop(1, 'rgba(232,98,26,0)');
  ctx.fillStyle = ag;
  ctx.fillRect(0, 0, cw, ch);
}

// ── FRAME-TO-SCROLL BINDING ──────────────────────────────────
const GALLERY_ENTER = 0.32;
const GALLERY_LEAVE = 0.62;
const GALLERY_FADE  = 0.018; // crossfade range antes/después del fondo plano

function drawFlatBg(cw, ch) {
  ctx.fillStyle = '#0A1A17';
  ctx.fillRect(0, 0, cw, ch);
  const g = ctx.createRadialGradient(cw * .35, ch * .5, 0, cw * .35, ch * .5, cw * .65);
  g.addColorStop(0, 'rgba(27,77,71,0.22)');
  g.addColorStop(1, 'rgba(10,26,23,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, cw, ch);
}

function initFrameScroll() {
  const sc = document.getElementById('scroll-container');
  ScrollTrigger.create({
    trigger: sc,
    start: 'top top',
    end: 'bottom bottom',
    scrub: true,
    onUpdate: (self) => {
      const p    = self.progress;
      const acc  = Math.min(p * FRAME_SPEED, 1);
      const maxF = hasFrames ? totalFrames : 200;
      const idx  = Math.min(Math.floor(acc * maxF), maxF - 1);
      currentFrame = idx;

      requestAnimationFrame(() => {
        const cw = canvas.width  / (window.devicePixelRatio || 1);
        const ch = canvas.height / (window.devicePixelRatio || 1);

        if (p >= GALLERY_ENTER && p <= GALLERY_LEAVE) {
          // Fondo plano puro durante galería
          drawFlatBg(cw, ch);
        } else if (p >= GALLERY_ENTER - GALLERY_FADE && p < GALLERY_ENTER) {
          // Transición entrada: video → plano
          if (hasFrames && frames[currentFrame]) drawFrame(currentFrame);
          else drawGenerativeFrame(currentFrame, maxF);
          const t = (p - (GALLERY_ENTER - GALLERY_FADE)) / GALLERY_FADE;
          ctx.fillStyle = `rgba(10,26,23,${(t * 0.97).toFixed(3)})`;
          ctx.fillRect(0, 0, cw, ch);
        } else if (p > GALLERY_LEAVE && p < GALLERY_LEAVE + GALLERY_FADE) {
          // Transición salida: plano → video
          if (hasFrames && frames[currentFrame]) drawFrame(currentFrame);
          else drawGenerativeFrame(currentFrame, maxF);
          const t = (p - GALLERY_LEAVE) / GALLERY_FADE;
          ctx.fillStyle = `rgba(10,26,23,${((1 - t) * 0.97).toFixed(3)})`;
          ctx.fillRect(0, 0, cw, ch);
        } else {
          if (hasFrames && frames[currentFrame]) drawFrame(currentFrame);
          else drawGenerativeFrame(currentFrame, maxF);
        }
      });
    }
  });
}

// ── MAP v1 — REAL GeoJSON + RADAR SWEEP ───────────────────────
let mapLoaded = false;
let mapAllMuns = [];

function mapInitParticles(container) {
  const c = document.createElement('canvas');
  c.id = 'map-particles';
  container.insertBefore(c, container.firstChild);
  const cx = c.getContext('2d');
  const resize = () => { c.width = container.offsetWidth; c.height = container.offsetHeight; };
  resize();
  new ResizeObserver(resize).observe(container);
  const pts = Array.from({length:55}, () => ({
    x: Math.random(), y: Math.random(),
    vx: (Math.random()-.5)*.00025, vy: (Math.random()-.5)*.00018,
    r: Math.random()*1.4+0.3, pa: Math.random()*Math.PI*2, a: Math.random()*.2+.04
  }));
  (function draw() {
    cx.clearRect(0, 0, c.width, c.height);
    pts.forEach(p => {
      p.x += p.vx; p.y += p.vy; p.pa += .007;
      if(p.x<0)p.x=1; if(p.x>1)p.x=0; if(p.y<0)p.y=1; if(p.y>1)p.y=0;
      cx.beginPath();
      cx.arc(p.x*c.width, p.y*c.height, p.r, 0, Math.PI*2);
      cx.fillStyle = `rgba(232,98,26,${p.a*(0.45+0.55*Math.sin(p.pa))})`;
      cx.fill();
    });
    requestAnimationFrame(draw);
  })();
}

function mapInitMouseGlow(container) {
  const glow = document.createElement('div');
  glow.className = 'map-mouse-glow';
  glow.style.opacity = '0';
  container.appendChild(glow);
  container.addEventListener('mousemove', e => {
    const rc = container.getBoundingClientRect();
    glow.style.left = (e.clientX - rc.left) + 'px';
    glow.style.top  = (e.clientY - rc.top)  + 'px';
    glow.style.opacity = '1';
  });
  container.addEventListener('mouseleave', () => { glow.style.opacity = '0'; });
}

function mapDoRadarSweep(elements, container) {
  const scanLine = container.querySelector('.map-scan-line');
  gsap.set(elements, { opacity: 0 });
  gsap.set(scanLine, { opacity: 1, left: '-4px' });
  const sorted = [...elements].sort((a,b) => (a._cx||0) - (b._cx||0));
  gsap.to(scanLine, {
    left: '104%', duration: 2.0, ease: 'power1.inOut',
    onComplete: () => {
      gsap.to(scanLine, { opacity: 0, duration: 0.6 });
      mapAnimateCounter();
    }
  });
  sorted.forEach(el => {
    const pct = (el._cx || 430) / 860;
    gsap.to(el, { opacity: 1, duration: 0.5, ease: 'power2.out', delay: pct * 1.55 + 0.08 });
  });
}

function mapCreatePulse(px, py, container) {
  [0, 180].forEach(delay => {
    const ring = document.createElement('div');
    ring.className = 'pulse-ring' + (delay ? ' pulse-ring-2' : '');
    ring.style.cssText = `left:${px}px;top:${py}px;transform:translate(-50%,-50%);animation-delay:${delay}ms`;
    container.appendChild(ring);
    ring.addEventListener('animationend', () => ring.remove());
  });
}

function mapAttachEvents(el, name, votes, cx, cy, svgEl, container, tooltip, selPanel) {
  el._cx = cx; el._cy = cy;
  el.addEventListener('mouseenter', () => {
    document.querySelectorAll('#caldas-map path,#caldas-map polygon').forEach(p =>
      gsap.to(p, { opacity: p === el ? 1 : 0.38, duration: 0.25 })
    );
    el.setAttribute('stroke','#E8621A'); el.setAttribute('stroke-width','2');
    const svgRect = svgEl.getBoundingClientRect();
    const cRect   = container.getBoundingClientRect();
    const px = cx * (svgRect.width / 860) + (svgRect.left - cRect.left);
    const py = cy * (svgRect.height / 520) + (svgRect.top  - cRect.top);
    mapCreatePulse(px, py, container);
    const pct  = ((votes / MAP_TOTAL) * 100).toFixed(1);
    const info = MAP_MUN_INFO[name] || { img:'images/1.jpeg', text:'Presencia activa en este municipio.' };
    tooltip.innerHTML = `
      <img src="${info.img}" class="map-tooltip-img" alt="${name}">
      <div class="map-tooltip-body">
        <div class="map-tooltip-title">${name}</div>
        <div class="map-tooltip-stats">${votes.toLocaleString()} votos &nbsp;·&nbsp; ${pct}%</div>
        <div class="map-tooltip-bar"><div class="map-tooltip-bar-fill" style="width:${(votes/MAP_MAX_V*100).toFixed(1)}%"></div></div>
        <div class="map-tooltip-desc">${info.text}</div>
      </div>`;
    tooltip.classList.add('visible');
    mapShowSel({ name, votes }, selPanel);
  });
  el.addEventListener('mousemove', e => {
    const rc = container.getBoundingClientRect();
    let left = e.clientX - rc.left + 24;
    let top  = Math.max(e.clientY - rc.top - 145, 8);
    if (left + 252 > rc.width) left = e.clientX - rc.left - 265;
    tooltip.style.left = left + 'px';
    tooltip.style.top  = top  + 'px';
  });
  el.addEventListener('mouseleave', () => {
    document.querySelectorAll('#caldas-map path,#caldas-map polygon').forEach(p => {
      p.setAttribute('stroke','rgba(5,13,11,0.85)');
      p.setAttribute('stroke-width','1');
      gsap.to(p, { opacity: 1, duration: 0.3 });
    });
    tooltip.classList.remove('visible');
  });
}

function mapShowSel(m, selPanel) {
  if (!selPanel) return;
  const sorted = [...mapAllMuns].sort((a,b) => b.votes - a.votes);
  const rank   = sorted.findIndex(x => x.name === m.name) + 1;
  const pct    = ((m.votes / MAP_TOTAL) * 100).toFixed(1);
  selPanel.classList.add('has-data');
  selPanel.innerHTML = `
    <div class="mapa-selected-name">${m.name}</div>
    <div class="mapa-selected-votes">${m.votes.toLocaleString()}</div>
    <div class="mapa-selected-bar"><div class="mapa-selected-bar-fill" style="width:0%"></div></div>
    <div class="mapa-selected-pct">${pct}% del total de votos</div>
    <div class="mapa-selected-rank">#${rank} en Caldas</div>`;
  setTimeout(() => {
    const f = selPanel.querySelector('.mapa-selected-bar-fill');
    if (f) f.style.width = (m.votes / MAP_MAX_V * 100).toFixed(1) + '%';
  }, 50);
}

let mapCounterTimer;
function mapAnimateCounter() {
  const el = document.getElementById('total-counter');
  if (!el) return;
  let cur = 0; const step = MAP_TOTAL / 80;
  clearInterval(mapCounterTimer);
  mapCounterTimer = setInterval(() => {
    cur = Math.min(cur + step, MAP_TOTAL);
    el.textContent = Math.round(cur).toLocaleString();
    if (cur >= MAP_TOTAL) clearInterval(mapCounterTimer);
  }, 20);
}

function mapBuildRanking() {
  const rankList = document.getElementById('ranking-list');
  if (!rankList) return;
  const sorted = [...mapAllMuns].sort((a,b) => b.votes - a.votes);
  rankList.innerHTML = '';
  sorted.slice(0, 7).forEach((m, i) => {
    const d = document.createElement('div'); d.className = 'rank-item';
    d.innerHTML = `<span class="rank-n">${i+1}</span>
      <span class="rank-name">${m.name}</span>
      <div class="rank-bar-wrap"><div class="rank-bar" style="width:0%"></div></div>
      <span class="rank-votes">${m.votes.toLocaleString()}</span>`;
    rankList.appendChild(d);
    setTimeout(() => { d.querySelector('.rank-bar').style.width = (m.votes/MAP_MAX_V*100).toFixed(0)+'%'; }, 200 + i * 90);
  });
}

async function mapLoad(section) {
  const svgEl    = section.querySelector('#caldas-map');
  const tooltip  = section.querySelector('#map-tooltip');
  const selPanel = section.querySelector('#mapa-selected');
  const container = section.querySelector('.mapa-svg-container');
  if (!svgEl || !container) return;

  mapInitParticles(container);
  mapInitMouseGlow(container);

  // Animate header in
  const headerEls = [...section.querySelectorAll('.map-label,.map-title,.map-desc-top,.mapa-total')];
  gsap.fromTo(headerEls,
    { y: 30, opacity: 0 },
    { y: 0, opacity: 1, stagger: 0.15, duration: 0.85, ease: 'power3.out' });

  // Animate container border glow
  gsap.fromTo(container,
    { opacity: 0, y: 20 },
    { opacity: 1, y: 0, duration: 1.0, ease: 'power3.out', delay: 0.4 });

  const URLS = [
    'https://cdn.jsdelivr.net/gh/finiterank/mapa-colombia-js@master/colombia-municipios.json',
    'https://cdn.jsdelivr.net/gh/juanchiem/agro_data@master/geodata/colombia_municipios.json',
  ];
  let topo = null;
  for (const url of URLS) {
    try {
      const r = await fetch(url, { signal: AbortSignal.timeout(8000) });
      if (r.ok) { topo = await r.json(); if (topo && (topo.arcs || topo.features)) break; }
    } catch(e) { continue; }
  }
  if (!topo) { mapRenderFallback(svgEl, container, tooltip, selPanel, section); return; }

  let features;
  if (topo.type === 'Topology' && topo.objects) {
    const key = Object.keys(topo.objects)[0];
    features = topojson.feature(topo, topo.objects[key]).features;
  } else if (topo.features) { features = topo.features; }
  else { mapRenderFallback(svgEl, container, tooltip, selPanel, section); return; }

  const caldas = features.filter(f => {
    const id = String(f.id || f.properties?.MPIO_CDPMP || f.properties?.DPTO || '');
    return id.startsWith('17') && id.length >= 4;
  });
  if (caldas.length < 10) { mapRenderFallback(svgEl, container, tooltip, selPanel, section); return; }

  const W = 860, H = 520;
  svgEl.setAttribute('viewBox', `0 0 ${W} ${H}`);
  const proj    = d3.geoMercator().fitExtent([[14,14],[W-14,H-14]], { type:'FeatureCollection', features:caldas });
  const pathGen = d3.geoPath().projection(proj);
  const elements = [];

  caldas.forEach(feat => {
    const code  = parseInt(String(feat.id || feat.properties?.MPIO_CDPMP || 0));
    const name  = MAP_VOTES[code] || feat.properties?.MPIO_CNMBR || `Mun ${code}`;
    const votes = MAP_VOTE_COUNT[code] || 300;
    mapAllMuns.push({ name, votes });
    const el = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    el.setAttribute('d', pathGen(feat));
    el.setAttribute('fill', mapVoteColor(votes));
    el.setAttribute('stroke', 'rgba(5,13,11,0.85)');
    el.setAttribute('stroke-width', '1');
    const c = pathGen.centroid(feat);
    mapAttachEvents(el, name, votes, c[0]||W/2, c[1]||H/2, svgEl, container, tooltip, selPanel);
    svgEl.appendChild(el);
    elements.push(el);
  });

  mapBuildRanking();
  const loading = section.querySelector('#map-loading');
  if (loading) loading.style.display = 'none';
  mapLoaded = true;
  mapDoRadarSweep(elements, container);
}

function mapRenderFallback(svgEl, container, tooltip, selPanel, section) {
  svgEl.setAttribute('viewBox', '0 0 860 520');
  const MUNS = [
    {c:17614,p:'16,175 112,158 124,195 120,272 82,298 46,296 20,272 16,224',   cx:68, cy:228},
    {c:17777,p:'82,275 120,270 130,288 122,322 90,328 74,308 78,280',           cx:102,cy:299},
    {c:17442,p:'78,325 122,320 125,348 94,354 74,340',                          cx:100,cy:337},
    {c:17272,p:'116,160 168,150 182,184 164,224 128,230 112,202 120,182',       cx:148,cy:190},
    {c:17042,p:'158,124 240,116 256,152 250,230 214,242 178,232 164,184 154,150',cx:207,cy:178},
    {c:17088,p:'218,236 250,228 270,258 266,328 230,336 216,310 216,260',       cx:243,cy:283},
    {c:17616,p:'156,320 216,312 222,350 214,398 168,406 148,376 150,340',       cx:185,cy:363},
    {c:17877,p:'150,402 220,394 226,430 218,464 164,470 144,440 146,412',       cx:185,cy:433},
    {c:17524,p:'260,316 340,308 350,358 340,396 300,404 260,392 256,352',       cx:303,cy:358},
    {c:17174,p:'218,398 312,390 320,430 310,466 254,472 218,444',               cx:270,cy:433},
    {c:17001,p:'335,280 425,272 434,314 427,386 387,400 350,387 345,345 334,300',cx:385,cy:337},
    {c:17873,p:'390,393 428,386 441,420 432,494 390,500 373,469 376,415',       cx:407,cy:443},
    {c:17486,p:'332,242 420,234 428,270 420,294 382,303 334,288 332,260',       cx:380,cy:267},
    {c:17050,p:'366,192 446,184 456,220 448,244 410,254 368,244 365,211',       cx:410,cy:219},
    {c:17653,p:'336,152 416,144 426,180 418,207 380,217 338,210 336,170',       cx:381,cy:180},
    {c:17388,p:'414,141 488,133 496,168 489,197 454,204 416,198 416,167',       cx:453,cy:168},
    {c:17513,p:'330,103 410,95 420,132 410,152 370,160 332,150 330,120',        cx:371,cy:128},
    {c:17446,p:'488,101 566,94 576,140 568,189 530,199 492,190 489,130',        cx:530,cy:145},
    {c:17013,p:'167,58 396,50 416,90 408,108 344,120 278,127 205,120 168,90',   cx:282,cy:88},
    {c:17433,p:'460,196 534,189 541,226 534,269 497,276 462,262 460,217',       cx:500,cy:232},
    {c:17665,p:'458,271 533,264 540,302 530,346 494,353 458,340 457,291',       cx:497,cy:308},
    {c:17444,p:'530,264 606,257 614,297 607,349 568,359 533,344 530,280',       cx:570,cy:308},
    {c:17541,p:'537,182 617,175 624,216 614,260 577,267 540,250 538,200',       cx:577,cy:220},
    {c:17662,p:'614,114 750,106 754,233 747,310 703,319 645,312 616,269 614,114',cx:683,cy:213},
    {c:17867,p:'607,340 647,334 657,376 646,420 601,426 579,409 578,362 605,344',cx:618,cy:383},
    {c:17495,p:'644,377 714,370 720,416 711,459 664,466 643,436 643,395',       cx:679,cy:418},
    {c:17380,p:'716,360 850,350 854,510 716,512 698,480 703,438 716,376',       cx:779,cy:433},
  ];
  const elements = [];
  MUNS.forEach(m => {
    const name = MAP_VOTES[m.c] || '?', votes = MAP_VOTE_COUNT[m.c] || 300;
    mapAllMuns.push({ name, votes });
    const el = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
    el.setAttribute('points', m.p);
    el.setAttribute('fill', mapVoteColor(votes));
    el.setAttribute('stroke', 'rgba(5,13,11,0.85)');
    el.setAttribute('stroke-width', '1.5');
    mapAttachEvents(el, name, votes, m.cx, m.cy, svgEl, container, tooltip, selPanel);
    svgEl.appendChild(el);
    elements.push(el);
  });
  mapBuildRanking();
  const loading = section.querySelector('#map-loading');
  if (loading) loading.style.display = 'none';
  mapLoaded = true;
  mapDoRadarSweep(elements, container);
}

function setupMapAnimation(section, tl) {
  // The actual map loads once when the section first enters view
  // tl is kept empty; the map animation plays independently via ScrollTrigger onEnter
  const sc = document.getElementById('scroll-container');
  ScrollTrigger.create({
    trigger: sc,
    start: 'top top',
    end: 'bottom bottom',
    onUpdate: (self) => {
      const enter = parseFloat(section.dataset.enter) / 100;
      if (!mapLoaded && self.progress >= enter - 0.05) {
        mapLoaded = true; // prevent double-trigger
        mapLoad(section);
      }
    }
  });
  // Ensure section itself fades in via the standard section system
  tl.fromTo(section, { opacity: 0 }, { opacity: 1, duration: 0.6, ease: 'power2.out' });
}

// ── GALLERY ANIMATION ─────────────────────────────────────────
function setupGalleryAnimation(section, tl) {
  const header   = section.querySelector('.gallery-header');
  const outer    = section.querySelector('.gallery-track-outer');
  const controls = section.querySelector('.gallery-controls');

  if (!header) return;

  tl
    .fromTo(header,
      { y: 35, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.85, ease: 'power3.out' }, 0)
    .fromTo(outer,
      { y: 40, opacity: 0 },
      { y: 0, opacity: 1, duration: 1.0, ease: 'power3.out' }, 0.35)
    .fromTo(controls,
      { y: 20, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.65, ease: 'power2.out' }, 0.65);
}

// ── SECTION ANIMATION SYSTEM ─────────────────────────────────
function positionSection(section) {
  if (section.classList.contains('section-gallery')) return; // fixed, no absolute positioning
  const enter    = parseFloat(section.dataset.enter);
  const leave    = parseFloat(section.dataset.leave);
  const mid      = (enter + leave) / 2;
  const totalH   = document.getElementById('scroll-container').offsetHeight;
  const maxScroll = totalH - window.innerHeight;
  // Place section center at viewport center when scroll = mid% of maxScroll
  section.style.top = ((mid / 100) * maxScroll + window.innerHeight / 2) + 'px';
  section.style.transform = 'translateY(-50%)';
}

function setupSectionAnimation(section) {
  const type    = section.dataset.animation;
  const persist = section.dataset.persist === 'true';
  const enter   = parseFloat(section.dataset.enter) / 100;
  const leave   = parseFloat(section.dataset.leave) / 100;
  const sc      = document.getElementById('scroll-container');

  const tl = gsap.timeline({ paused: true });

  if (type === 'map-reveal') {
    setupMapAnimation(section, tl);
  } else if (type === 'gallery-reveal') {
    // Gallery is position:fixed and fully managed by initGallery()
    // No standard section animation or ScrollTrigger needed here
    return;
  } else {
    // Standard children animation
    const children = section.querySelectorAll(
      '.section-label, .section-heading, .section-body, .section-note, .section-link, ' +
      '.cta-button, .cta-input, .cta-social, .cta-form, .agenda-list, .stat, .section-photo'
    );
    gsap.set(children, { visibility: 'visible' });

    switch (type) {
      case 'fade-up':
        tl.fromTo(children,
          { y: 50, opacity: 0 },
          { y: 0, opacity: 1, stagger: 0.12, duration: 0.9, ease: 'power3.out' });
        break;
      case 'clip-reveal':
        tl.fromTo(children,
          { clipPath: 'inset(100% 0 0 0)', opacity: 0 },
          { clipPath: 'inset(0% 0 0 0)', opacity: 1, stagger: 0.15, duration: 1.2, ease: 'power4.inOut' });
        break;
      case 'stagger-up':
        tl.fromTo(children,
          { y: 60, opacity: 0 },
          { y: 0, opacity: 1, stagger: 0.15, duration: 0.8, ease: 'power3.out' });
        break;
      case 'scale-up':
        tl.fromTo(children,
          { y: 40, scale: 0.85, opacity: 0 },
          { y: 0, scale: 1, opacity: 1, stagger: 0.12, duration: 1.0, ease: 'power2.out' });
        break;
      case 'blur-up':
        tl.fromTo(children,
          { y: 50, opacity: 0, filter: 'blur(8px)' },
          { y: 0, opacity: 1, filter: 'blur(0px)', stagger: 0.12, duration: 1.0, ease: 'power3.out' });
        break;
      default:
        tl.fromTo(children,
          { y: 40, opacity: 0 },
          { y: 0, opacity: 1, stagger: 0.1, duration: 0.8, ease: 'power2.out' });
    }
  }

  ScrollTrigger.create({
    trigger: sc,
    start: 'top top',
    end: 'bottom bottom',
    scrub: false,
    onUpdate: (self) => {
      const p = self.progress;
      const inView   = p >= enter - WINDOW && p <= (persist ? 1 : leave + WINDOW);
      const entering = p >= enter && p <= enter + WINDOW;
      const leaving  = !persist && p >= leave && p <= leave + WINDOW;

      if (entering) {
        tl.progress(Math.min((p - enter) / WINDOW, 1));
      } else if (inView && !leaving) {
        tl.progress(1);
      } else if (leaving) {
        tl.progress(1 - Math.min((p - leave) / WINDOW, 1));
      } else if (p < enter - WINDOW) {
        tl.progress(0);
      } else if (!persist && p > leave + WINDOW) {
        tl.progress(0);
      }
    }
  });
}

// ── COUNTER ANIMATIONS ───────────────────────────────────────
function initCounters() {
  document.querySelectorAll('.stat-number').forEach(el => {
    const target   = parseFloat(el.dataset.value);
    const decimals = parseInt(el.dataset.decimals || '0');
    const proxy    = { val: 0 };

    gsap.fromTo(proxy,
      { val: 0 },
      {
        val: target,
        duration: 2.2,
        ease: 'power2.out',
        onUpdate() {
          el.textContent = decimals > 0 ? proxy.val.toFixed(decimals) : Math.round(proxy.val);
        },
        onComplete() {
          el.textContent = decimals > 0 ? target.toFixed(decimals) : target;
        },
        scrollTrigger: {
          trigger: el.closest('.scroll-section'),
          start: 'top 80%',
          toggleActions: 'play none none reset'
        }
      }
    );
  });
}

// ── DARK OVERLAY ─────────────────────────────────────────────
function initDarkOverlay() {
  const overlay   = document.getElementById('dark-overlay');
  const fadeRange = 0.03;

  ScrollTrigger.create({
    trigger: document.getElementById('scroll-container'),
    start: 'top top',
    end: 'bottom bottom',
    scrub: true,
    onUpdate: (self) => {
      const p = self.progress;
      let opacity = 0;
      if (p >= STATS_ENTER - fadeRange && p <= STATS_ENTER) {
        opacity = (p - (STATS_ENTER - fadeRange)) / fadeRange;
      } else if (p > STATS_ENTER && p < STATS_LEAVE) {
        opacity = 0.92;
      } else if (p >= STATS_LEAVE && p <= STATS_LEAVE + fadeRange) {
        opacity = 0.92 * (1 - (p - STATS_LEAVE) / fadeRange);
      }
      overlay.style.opacity = opacity;
    }
  });
}

// ── FONDO DIFUMINADO (post-galería) ───────────────────────────
function initBgPhotoOverlay() {
  const el = document.getElementById('bg-photo');
  if (!el) return;
  const ENTER = GALLERY_LEAVE + 0.01; // entra justo al salir de galería
  const LEAVE = 0.83;
  const FADE  = 0.018;
  ScrollTrigger.create({
    trigger: document.getElementById('scroll-container'),
    start: 'top top', end: 'bottom bottom',
    scrub: true,
    onUpdate: (self) => {
      const p = self.progress;
      let op  = 0;
      if (p >= ENTER && p <= LEAVE)                          op = 1;
      else if (p > ENTER - FADE && p < ENTER)               op = (p - (ENTER - FADE)) / FADE;
      else if (p > LEAVE && p < LEAVE + FADE)               op = 1 - (p - LEAVE) / FADE;
      el.style.opacity = op;
    }
  });
}

// ── HERO FADE ─────────────────────────────────────────────────
function initHeroFade() {
  const hero = document.getElementById('hero-overlay');
  ScrollTrigger.create({
    trigger: document.getElementById('scroll-container'),
    start: 'top top',
    end: 'bottom bottom',
    scrub: true,
    onUpdate: (self) => {
      const opacity = Math.max(0, 1 - self.progress / HERO_FADE_END);
      hero.style.opacity = opacity;
      hero.style.pointerEvents = opacity > 0 ? '' : 'none';
    }
  });
}

// ── MAP TOOLTIP ────────────────────────────────────────────────
function initMapTooltip() {
  const tooltip = document.getElementById('map-tooltip');
  if (!tooltip) return;

  document.querySelectorAll('.municipality[data-name]').forEach(dot => {
    dot.addEventListener('mouseenter', (e) => {
      tooltip.textContent = e.target.dataset.name;
      tooltip.style.opacity = '1';
    });
    dot.addEventListener('mousemove', (e) => {
      tooltip.style.left = (e.clientX + 14) + 'px';
      tooltip.style.top  = (e.clientY - 28) + 'px';
    });
    dot.addEventListener('mouseleave', () => {
      tooltip.style.opacity = '0';
    });
  });
}

// ── GALLERY CAROUSEL — Oryzo-style pinned, scroll-driven ──────
function initGallery() {
  const section = document.querySelector('.section-gallery');
  const track   = document.getElementById('gallery-track');
  const counter = document.querySelector('.gallery-counter');
  const dotsEl  = document.getElementById('gallery-dots');
  if (!track || !section) return;

  const items = [...track.querySelectorAll('.gallery-item')];
  let currentIndex = 0;
  let lastIdx      = -1;
  const FADE       = 0.018;

  // Build progress dots
  if (dotsEl) {
    items.forEach((_, i) => {
      const d = document.createElement('div');
      d.className = 'gallery-dot' + (i === 0 ? ' is-active' : '');
      dotsEl.appendChild(d);
    });
  }
  const dots = dotsEl ? [...dotsEl.querySelectorAll('.gallery-dot')] : [];

  // Oryzo-style sizing: active = big, near = medium, far = small
  function getSizes() {
    const vw = window.innerWidth, vh = window.innerHeight;
    return {
      active: { w: Math.min(vw * 0.36, 540), h: vh * 0.74, opacity: 1    },
      near:   { w: Math.min(vw * 0.18, 270), h: vh * 0.50, opacity: 0.55 },
      far:    { w: Math.min(vw * 0.12, 190), h: vh * 0.37, opacity: 0.28 },
      hidden: { w: Math.min(vw * 0.09, 140), h: vh * 0.28, opacity: 0.12 },
    };
  }

  function goTo(index, animate = true) {
    index = Math.max(0, Math.min(items.length - 1, index));
    currentIndex = index;
    const dur = animate ? 0.72 : 0;
    const s   = getSizes();
    const gap = 12;

    // Target widths for all items at new index
    const widths = items.map((_, i) => {
      const d = Math.abs(i - index);
      return d === 0 ? s.active.w : d === 1 ? s.near.w : d === 2 ? s.far.w : s.hidden.w;
    });

    // Translate track so active item is centered in viewport
    let leftEdge = 0;
    for (let i = 0; i < index; i++) leftEdge += widths[i] + gap;
    const trackX = window.innerWidth / 2 - (leftEdge + widths[index] / 2);
    gsap.to(track, { x: trackX, duration: dur, ease: 'power3.out' });

    items.forEach((item, i) => {
      const dist = Math.abs(i - currentIndex);
      const isActive = dist === 0;
      const cfg = dist === 0 ? s.active : dist === 1 ? s.near : dist === 2 ? s.far : s.hidden;
      item.classList.toggle('is-active', isActive);
      gsap.to(item, { width: cfg.w, height: cfg.h, opacity: cfg.opacity,
        duration: dur, ease: 'power3.out' });
    });

    dots.forEach((d, i) => d.classList.toggle('is-active', i === currentIndex));

    if (counter) {
      counter.textContent = `${String(currentIndex + 1).padStart(2, '0')} / ${String(items.length).padStart(2, '0')}`;
    }
  }

  // Click on non-active item navigates to it
  items.forEach((item, i) => {
    item.addEventListener('click', () => { if (i !== currentIndex) goTo(i); });
  });

  // Initialize after layout
  requestAnimationFrame(() => goTo(0, false));

  // Arrow buttons
  document.querySelector('.gallery-prev')?.addEventListener('click', () => goTo(currentIndex - 1));
  document.querySelector('.gallery-next')?.addEventListener('click', () => goTo(currentIndex + 1));

  // Keyboard (only when gallery is visible)
  document.addEventListener('keydown', (e) => {
    if (section.style.visibility !== 'visible') return;
    if (e.key === 'ArrowLeft')  goTo(currentIndex - 1);
    if (e.key === 'ArrowRight') goTo(currentIndex + 1);
  });

  // Touch swipe
  let touchStartX = 0;
  track.addEventListener('touchstart', (e) => {
    touchStartX = e.touches[0].clientX;
  }, { passive: true });
  track.addEventListener('touchend', (e) => {
    const dx = e.changedTouches[0].clientX - touchStartX;
    if (Math.abs(dx) > 50) goTo(currentIndex + (dx < 0 ? 1 : -1));
  }, { passive: true });

  // Resize — recalculate item sizes
  window.addEventListener('resize', () => {
    requestAnimationFrame(() => goTo(currentIndex, false));
  }, { passive: true });

  // Scroll-driven: section visibility + index advancement
  const sc = document.getElementById('scroll-container');
  ScrollTrigger.create({
    trigger: sc,
    start: 'top top',
    end: 'bottom bottom',
    scrub: true,
    onUpdate: (self) => {
      const p = self.progress;

      // Fade section in/out
      if (p >= GALLERY_ENTER && p <= GALLERY_LEAVE) {
        section.style.opacity    = '1';
        section.style.visibility = 'visible';
        section.style.pointerEvents = 'auto';
      } else if (p > GALLERY_ENTER - FADE && p < GALLERY_ENTER) {
        const t = (p - (GALLERY_ENTER - FADE)) / FADE;
        section.style.opacity    = t.toFixed(3);
        section.style.visibility = 'visible';
        section.style.pointerEvents = 'none';
      } else if (p > GALLERY_LEAVE && p < GALLERY_LEAVE + FADE) {
        const t = 1 - (p - GALLERY_LEAVE) / FADE;
        section.style.opacity    = t.toFixed(3);
        section.style.visibility = 'visible';
        section.style.pointerEvents = 'none';
      } else {
        section.style.opacity    = '0';
        section.style.visibility = 'hidden';
        section.style.pointerEvents = 'none';
      }

      // Advance carousel index based on scroll progress within gallery range
      if (p >= GALLERY_ENTER && p <= GALLERY_LEAVE) {
        const localP = (p - GALLERY_ENTER) / (GALLERY_LEAVE - GALLERY_ENTER);
        const idx = Math.min(Math.floor(localP * items.length), items.length - 1);
        if (idx !== lastIdx) { lastIdx = idx; goTo(idx, true); }
      }
    }
  });

  window.galleryGoTo      = goTo;
  window.galleryItemCount = items.length;
}

// ── HEADER ────────────────────────────────────────────────────
function initHeader() {
  const header   = document.querySelector('.site-header');
  const toggle   = document.querySelector('.nav-toggle');
  const navLinks = document.querySelector('.nav-links');

  window.addEventListener('scroll', () => {
    header.classList.toggle('scrolled', window.scrollY > 80);
  }, { passive: true });

  toggle?.addEventListener('click', () => navLinks.classList.toggle('open'));
}

// ── LOADER (v1-style fake progress + slide-out) ───────────────
function runFakeLoader() {
  return new Promise(resolve => {
    const bar = document.getElementById('loader-bar');
    const txt = document.getElementById('loader-percent');
    let pct = 0;
    const iv = setInterval(() => {
      const step = pct < 40 ? 3.5 : pct < 70 ? 2.2 : pct < 88 ? 1.0 : 0.3;
      pct = Math.min(pct + step, 100);
      if (bar) bar.style.width = pct + '%';
      if (txt) txt.textContent = Math.round(pct) + '%';
      if (pct >= 100) { clearInterval(iv); setTimeout(resolve, 250); }
    }, 35);
  });
}

function slideOutLoader() {
  return new Promise(resolve => {
    const loader = document.getElementById('loader');
    if (!loader) { resolve(); return; }
    gsap.to(loader, {
      yPercent: -100,
      duration: 0.9,
      ease: 'power3.inOut',
      onComplete: () => { loader.style.display = 'none'; resolve(); }
    });
  });
}

function initHeroEntrance() {
  document.querySelectorAll('.hero-word, .hero-label, .hero-tagline, .scroll-indicator').forEach(el => {
    el.style.animationPlayState = 'running';
  });
}

// ── LENIS ─────────────────────────────────────────────────────
function initLenis() {
  const lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true
  });

  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);

  // Fallback for programmatic scroll (Playwright testing)
  window.addEventListener('scroll', () => ScrollTrigger.update(), { passive: true });
  window.lenis = lenis;

  return lenis;
}

// ── INIT ──────────────────────────────────────────────────────
async function init() {
  gsap.registerPlugin(ScrollTrigger);

  resizeCanvas();
  window.addEventListener('resize', resizeCanvas, { passive: true });

  const sections = document.querySelectorAll('.scroll-section');
  sections.forEach(positionSection);

  // Fake loader runs for ~1.5s; real frames load in parallel
  const loaderDone = runFakeLoader().then(slideOutLoader);

  detectFrames().then(async (found) => {
    if (!found) { drawGenerativeFrame(0, 200); return; }
    const frameCounts = [300, 250, 240, 200, 180, 150, 120, 100, 80, 50];
    let detected = 1;
    for (const count of frameCounts) {
      const exists = await new Promise(resolve => {
        const img = new Image();
        img.onload  = () => resolve(true);
        img.onerror = () => resolve(false);
        img.src = buildFrameUrl(count - 1);
      });
      if (exists) { detected = count; break; }
    }
    totalFrames = detected;
    preloadFrames(totalFrames);
  });

  await loaderDone;
  initHeroEntrance();

  initLenis();
  initFrameScroll();
  initDarkOverlay();
  initBgPhotoOverlay();
  initHeroFade();
  sections.forEach(setupSectionAnimation);
  initCounters();
  initGallery();
  initHeader();

  requestAnimationFrame(() => {
    if (hasFrames && frames[0]) drawFrame(0);
    else drawGenerativeFrame(0, 200);
  });
}

// DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
